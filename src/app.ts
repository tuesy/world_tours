import * as MRE from '@microsoft/mixed-reality-extension-sdk';

const fetch = require('node-fetch');
const url = require('url')
const WELCOME_TEXT = "Daisy Shaw's World Tours";
const INFO_TEXT_HEIGHT = 1.2;
const BUTTON_HEIGHT = 0.6;
const TELEPORTER_BASE = -0.5;

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
export default class WorldTours {
	private assets: MRE.AssetContainer;

  private libraryActors: MRE.Actor[] = [];

  // Load the database.
  // tslint:disable-next-line:no-var-requires variable-name
  private worldDatabase: { [key: string]: WorldDescriptor } = {};

  private teleporterSpacing = 0.8;
  private teleporterScale = {x: 0.5, y: 0.5, z: 0.5};
  private maxResults = 25;
  private previewImageWidth = 1.4;
  private previewImageHeight = 1;
  private previewImageDepth = 0.02;
  private previewImagePosition = {y: 2};
  private moreInfoHeight = 0.2;
  private moreInfoPosition = {y: 2.8};

	constructor(private context: MRE.Context, private params: MRE.ParameterSet) {
		this.context.onStarted(() => this.started());
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private async started() {
		// set up somewhere to store loaded assets (meshes, textures, animations, gltfs, etc.)
		this.assets = new MRE.AssetContainer(this.context);

    this.createInterface();
	}

  private createInterface(){
    const infoText = MRE.Actor.Create(this.context, {
      actor: {
        name: 'Info Text',
        transform: { local: { position: { x: 0, y: INFO_TEXT_HEIGHT, z: -1 } } },
        collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } },
        text: {
          contents: WELCOME_TEXT,
          height: 0.1,
          anchor: MRE.TextAnchorLocation.MiddleCenter,
          justify: MRE.TextJustify.Center
        }
      }
    });

    const helpButton = MRE.Actor.CreateFromLibrary(this.context, {
      resourceId: 'artifact:1579238405710021245',
      actor: {
        name: 'Help Button',
        transform: { local: { position: { x: 0, y: BUTTON_HEIGHT, z: -1 } } },
        collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } }
      }
     });
    helpButton.setBehavior(MRE.ButtonBehavior).onClick(user => {
      user.prompt(`
This the official app for Daisy Shaw's World Tours.
`).then(res => {
          if(res.submitted){
            // infoText.text.contents = this.resultMessageFor(SAMPLE_QUERY);
          }
          else
            infoText.text.contents = WELCOME_TEXT;
      })
      .catch(err => {
        console.error(err);
      });
    });
  }

  private spawn(name: string, worldId: string, position: any, rotation: any, scale: any){
    let world = this.worldDatabase[worldId];

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
						position: this.moreInfoPosition,
						rotation: MRE.Quaternion.FromEulerAngles(
		          rotation.x * MRE.DegreesToRadians,
		          rotation.y * MRE.DegreesToRadians,
		          rotation.z * MRE.DegreesToRadians)
					}
				},
				collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.5, y: 0.2, z: 0.01 } } },
				text: {
					contents: "More Info",
					height: this.moreInfoHeight,
					anchor: MRE.TextAnchorLocation.MiddleCenter,
					justify: MRE.TextJustify.Center
				}
			}
		});
		noTextButton.setBehavior(MRE.ButtonBehavior).onClick(user => {
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

    // spawn preview image
    const tex = this.assets.createTexture('previewTexture', {uri: world.image});
    const mat = this.assets.createMaterial('previewMaterial', {
      color: MRE.Color3.Black(),
      emissiveColor: MRE.Color3.White(),
      emissiveTextureId: tex.id
    });
    const mesh = this.assets.createBoxMesh('window', this.previewImageWidth, this.previewImageHeight, this.previewImageDepth);
    MRE.Actor.Create(this.context, {
      actor: {
        name: 'window',
        parentId: tp.id,
        appearance: {
          meshId: mesh.id,
          materialId: mat.id
        },
        transform: {
          local: {
            position: this.previewImagePosition
          }
        }
      }
    });
  }
}
