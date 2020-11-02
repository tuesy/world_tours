/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';

const fetch = require('node-fetch');

/**
 * The main class of this app. All the logic goes here.
 */
export default class HelloWorld {
	private text: MRE.Actor = null;
	private cube: MRE.Actor = null;
	private assets: MRE.AssetContainer;

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
				transform: { local: { position: { x: 1, y: 1, z: -1 } } },
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
				textButton.text.contents =
					`Search\nLast: ${res.submitted ? res.text : "<cancelled>"}`;

					this.search(res.text);
			})
			.catch(err => {
				console.error(err);
			});
		});

		// manual testing
		this.search('mankindforward');
	}


	// search for worlds and spawn teleporters
	private search(query: string) {
		// TODO: remove existing teleporters

		// query public worlds search api
    fetch('https://account.altvr.com/api/public/spaces/search?q=' + query)
	    .then((res: any) => res.json())
	    .then((json: any) => {
	    	console.log(json);
	    });
	}

}
