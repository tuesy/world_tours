/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';

const fetch = require('node-fetch');
const url = require('url')
const SEARCH_URL = 'https://account.altvr.com/api/public/spaces/search?'

/**
 * The structure of a world entry in the world database.
 */
type WorldDescriptor = {
    description: string;
    favorited: number;
    image: string;
    name: string;
    userDisplayName: string;
    userUsername: string;
    visited: number;
    worldId: string;
};

/**
 * The main class of this app. All the logic goes here.
 */
export default class WorldSearch {
	private assets: MRE.AssetContainer;

  private libraryActors: MRE.Actor[] = [];

  // Load the database.
  // tslint:disable-next-line:no-var-requires variable-name
  private worldDatabase: { [key: string]: WorldDescriptor } = {};

  private teleporterSpacing = 0.8;
  private teleporterScale = {x: 0.5, y: 0.5, z: 0.5};
  private maxResults = 25;

	constructor(private context: MRE.Context) {
		this.context.onStarted(() => this.started());
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private async started() {
		// set up somewhere to store loaded assets (meshes, textures, animations, gltfs, etc.)
		this.assets = new MRE.AssetContainer(this.context);

		const textButton = MRE.Actor.Create(this.context, {
			actor: {
				name: 'searchButton',
				transform: { local: { position: { x: 0, y: 1, z: -1 } } },
				collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } },
				text: {
					contents: "Search",
					height: 0.1,
					anchor: MRE.TextAnchorLocation.MiddleCenter,
					justify: MRE.TextJustify.Center
				}
			}
		});
		textButton.setBehavior(MRE.ButtonBehavior).onClick(user => {
			user.prompt("Search public Worlds by name, description, or tag...", true)
			.then(res => {

          if(res.submitted){
            textButton.text.contents =
              `Search\n\nResults for \"${res.text}\"`;
            this.search(res.text);
          }
          else{
            // user clicked 'Cancel'
          }

			})
			.catch(err => {
				console.error(err);
			});
		});

		// manual testing
		// this.search('mankindforward');
		this.search('whimwhams');
	}


	// search for worlds and spawn teleporters
	private search(query: string) {
		// TODO: remove existing teleporters
    // testings

    // clear existing teleporters
		for (const actor of this.libraryActors) {
			actor.destroy();
		}

		// clear world data
		this.worldDatabase = {};

		// query public worlds search api
		let uri = SEARCH_URL + new url.URLSearchParams({ q: query, per: this.maxResults });
    fetch(uri)
	    .then((res: any) => res.json())
	    .then((json: any) => {
	    	// console.log(json);
        if(json.spaces){
          for(const world of json['spaces']){
              this.worldDatabase[world.space_id] = {
                  'description': String(world.description),
                  'favorited': Number(world.favorited),
                  'image': String(world.image_large),
                  'name': String(world.name),
                  'userDisplayName': String(world.first_name),
                  'userUsername': String(world.username),
                  'visited': Number(world.visited),
                  'worldId': String(world.space_id)
              }
          }

          // where all the magic happens
          // Loop over the world database, creating a teleporter for each entry.
          let x = this.teleporterSpacing;
          for (const worldId of Object.keys(this.worldDatabase)) {
              const worldRecord = this.worldDatabase[worldId];

              this.spawn('Teleporter to ' + worldRecord.name, worldId,
                  { x: x, y: 0.0, z: 0.0}, { x: 0.0, y: 180, z: 0.0}, this.teleporterScale)
              x += this.teleporterSpacing;
          }
        }
        else if (json.status == '404'){
          // 404 is a normal HTTP response so you can't 'catch' it
          console.log("ERROR: received a 404 for " + uri)
        }
	    });
	}

  private spawn(name: string, worldId: string, position: any, rotation: any, scale: any){
  	// spawn teleporter
  	let tp = MRE.Actor.CreateFromLibrary(this.context, {
        resourceId: 'teleporter:space/' + worldId + '?label=true',
        actor: {
            name: name,
            transform: {
                local: {
                    position: position,
                    rotation: MRE.Quaternion.FromEulerAngles(
                        rotation.x * MRE.DegreesToRadians,
                        rotation.y * MRE.DegreesToRadians,
                        rotation.z * MRE.DegreesToRadians),
                    scale: scale
                }
            }
        }
    });
    this.libraryActors.push(tp);

    // spawn info button
		const noTextButton = MRE.Actor.Create(this.context, {
			actor: {
				name: 'noTextButton',
				parentId: tp.id,
				transform: {
					local: {
						position: { x: 0, y: 2, z: 0 },
						rotation: MRE.Quaternion.FromEulerAngles(
		          rotation.x * MRE.DegreesToRadians,
		          rotation.y * MRE.DegreesToRadians,
		          rotation.z * MRE.DegreesToRadians)
					}
				},
				collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } },
				text: {
					contents: "More Info",
					height: 0.1,
					anchor: MRE.TextAnchorLocation.MiddleCenter,
					justify: MRE.TextJustify.Center
				}
			}
		});
		noTextButton.setBehavior(MRE.ButtonBehavior).onClick(user => {
			let world = this.worldDatabase[worldId];

			let info = `${world.name}\n\nBy ${world.userDisplayName} (${world.userUsername})`;

			if(typeof world.description !='undefined' && world.description){
   			info += `\n\n${world.description}`;
			}

			info += `\n\nFavorited ${world.favorited} | Visited ${world.visited}`;

			user.prompt(info)
			.then(res => {
				// noTextButton.text.contents =
				// 	`Click for message\nLast response: ${res.submitted ? "<ok>" : "<cancelled>"}`;
			})
			.catch(err => {
				console.error(err);
			});
		});
  }
}
