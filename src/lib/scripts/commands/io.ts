import { workspace as ws } from '../workspace';
import { Modes } from '../modes';
import { Button } from '../shapes/button';
import { Bookmark } from '../shapes/bookmark';
import { wp } from '$lib/components/stores';
import { Command, CommandDefinition, CommandOutput, OUTPUT_TYPE } from '../commands';
import { BindableInt, BindableString, STATIC_TYPES, Value } from '../dataType';

console.log('registered');

new CommandDefinition('log')
	.addOverride((params) => {
		ws.currentOutput = new CommandOutput(params[0].value as string, OUTPUT_TYPE.NORMAL);
		return new Value(null, STATIC_TYPES.NULL);
	}, STATIC_TYPES.STRING)
	.addOverride((params) => {
		ws.currentOutput = new CommandOutput(
			(params[0].value as number).toString(),
			OUTPUT_TYPE.NORMAL
		);
		return new Value((params[0].value as number).toString(), STATIC_TYPES.STRING);
	}, STATIC_TYPES.FLOAT)
	.register();

new CommandDefinition('save')
	.addOverride((params) => {
		if ((params[0].value as string).match(/^\$[a-zA-Z]/)) {
			// `The path '${params[0].parsed as string}' is invalid. Paths must not start with '$'`
		}
		ws.saveElements(params[0].value as string);
		return new Value(null, STATIC_TYPES.NULL);
	}, STATIC_TYPES.STRING)
	.addOverride(() => {
		if (ws.fileName !== '') {
			ws.saveElements(ws.fileName);
		} else {
			// `This workspace has not been saved yet. Save it with the command 'command <path>' to give a default save path`
		}
		return new Value(null, STATIC_TYPES.NULL);
	})
	.register();

new CommandDefinition('load')
	.addOverride((params) => {
		ws.loadElements(params[0].value as string);
		return new Value(null, STATIC_TYPES.NULL);
	}, STATIC_TYPES.STRING)
	.register();

new CommandDefinition('clear')
	.addOverride(() => {
		ws.elements = [];
		// `Deleted all elements from the workspace`
		return new Value(null, STATIC_TYPES.NULL);
	}, ['confirm'])
	.addOverride(() => {
		// `To clear the workspace, enter the command 'clear confirm'`,
		return new Value(null, STATIC_TYPES.NULL);
	})
	.register();

new CommandDefinition('ls')
	.addOverride(() => {
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
			let maxLength = 0;
			keys.forEach((val) => {
				if (val.length > maxLength) {
					maxLength = val.length;
				}
			});
			for (let k = 0; k < keys.length; k++) {
				if (typeof tree[keys[k]] == 'string') {
					ws.elements.push(
						new Button(
							new BindableInt(indentation),
							new BindableInt(height),
							new Command(
								'load',
								[new Value(tree[keys[k]] as string, STATIC_TYPES.STRING)],
								`load ${tree[keys[k]]}`
							),
							new BindableString(keys[k]),
							`f-${tree[keys[k]]}-load`
						),
						new Button(
							new BindableInt(indentation + maxLength + 3),
							new BindableInt(height),
							new Command(
								'del',
								[
									new Value('file', STATIC_TYPES.STRING),
									new Value(tree[keys[k]] as string, STATIC_TYPES.STRING)
								],
								`:del file ${tree[keys[k]]}`
							),
							new BindableString('delete'),
							`f-${tree[keys[k]]}-delete`
						)
					);
					height += 1;
				} else {
					ws.elements.push(
						new Bookmark(
							new BindableInt(indentation),
							new BindableInt(height),
							new BindableString(`/${keys[k]}/`),
							`b-${keys[k]}`
						)
					);
					height += 1;
					drawFiles(tree[keys[k]] as _FolderTree, indentation + 2);
				}
			}
		};
		drawFiles(folderStructure, 0);
		ws.allowedModes = [Modes.VIEW_MODE, Modes.COMMAND];
		wp.setCanvasCoords(0, 0);
		wp.setCursorCoords(0, 0);

		// ws.elements.push(new Button(new Vector2(0, i), `load ${files[i]}`, files[i]));
		// `Opened file browser. To exit, press the back button, enter ':back' or enter ':load "$tmp"'`

		return new Value(null, STATIC_TYPES.NULL);
	})
	.register();

new CommandDefinition('back')
	.addOverride(() => {
		ws.loadElements('$tmp');
		return new Value(null, STATIC_TYPES.NULL);
	})
	.register();
