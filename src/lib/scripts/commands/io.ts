import {
	CommandOutput,
	OutputType,
	Pattern,
	StaticParameter,
	StringParameter
} from './command-definition';
import { workspace as ws } from '../workspace';
import { Modes } from '../modes';
import Vector2 from '../vector';
import { Button } from '../shapes/button';
import { Bookmark } from '../shapes/bookmark';
import { wp } from '$lib/components/stores';

export default [
	new Pattern([new StaticParameter(['log']), new StringParameter()], (params) => {
		ws.currentOutput = new CommandOutput(params[0].getString(), OutputType.NORMAL);
	}),
	new Pattern([new StaticParameter(['save']), new StringParameter()], (params) => {
		if (params[0].getString().match(/^\$[a-zA-Z]/)) {
			// `The path '${params[0].parsed as string}' is invalid. Paths must not start with '$'`
		}
		ws.saveElements(params[0].getString());
	}),
	new Pattern([new StaticParameter(['save'])], () => {
		if (ws.fileName !== '') {
			ws.saveElements(ws.fileName);
		} else {
			// `This workspace has not been saved yet. Save it with the command 'command <path>' to give a default save path`
		}
	}),
	new Pattern([new StaticParameter(['load']), new StringParameter()], (params) => {
		ws.loadElements(params[0].getString());
	}),
	new Pattern([new StaticParameter(['clear']), new StaticParameter(['confirm'])], () => {
		ws.elements = [];
		// `Deleted all elements from the workspace`
	}),
	new Pattern([new StaticParameter(['clear'])], () => {
		// `To clear the workspace, enter the command 'clear confirm'`,
	}),
	new Pattern([new StaticParameter(['ls'])], () => {
		const files = Object.keys(localStorage).filter((val) => !val.startsWith('$')); // JSON.parse(localStorage.getItem('$files') ?? '[]');
		ws.saveElements('$tmp');
		ws.elements = [];
		type _FolderTree = { [k: string]: _FolderTree | string };
		const folderStructure: _FolderTree = {};
		for (let i = 0; i < files.length; i++) {
			const pathSegments: Array<string> = files[i].split('/');
			let lastContext = folderStructure;
			for (let j = 0; j < pathSegments.length - 1; j++) {
				if (lastContext[pathSegments[j]] == undefined) {
					lastContext[pathSegments[j]] = {};
				}
				lastContext = lastContext[pathSegments[j]] as _FolderTree;
			}
			lastContext[pathSegments.at(-1) ?? 0] = files[i];
		}

		let height = 0;
		const drawFiles = function (tree: _FolderTree, indentation: number) {
			const keys = Object.keys(tree);
			for (let k = 0; k < keys.length; k++) {
				if (typeof tree[keys[k]] == 'string') {
					ws.elements.push(
						new Button(new Vector2(indentation, height), `load ${tree[keys[k]]}`, keys[k])
					);
					height += 1;
				} else {
					ws.elements.push(new Bookmark(new Vector2(indentation, height), `/${keys[k]}/`));
					height += 1;
					drawFiles(tree[keys[k]] as _FolderTree, indentation + 2);
				}
			}
		};
		drawFiles(folderStructure, 0);
		ws.allowedModes = [Modes.VIEW_MODE, Modes.COMMAND];
		wp.setCanvasCoords(new Vector2(0, 0));
		wp.setCursorCoords(new Vector2(0, 0));

		// ws.elements.push(new Button(new Vector2(0, i), `load ${files[i]}`, files[i]));
		// `Opened file browser. To exit, press the back button, enter ':back' or enter ':load "$tmp"'`
	}),
	new Pattern([new StaticParameter(['back'])], () => {
		ws.loadElements('$tmp');
	})
];
