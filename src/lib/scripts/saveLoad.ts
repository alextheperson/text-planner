// import { CommandOutput, OutputType } from './commands/command-definition';
// import ModeManager, { Modes } from './modes';
// import { SHAPES } from './shapes/';
// import type { Shape } from './shapes/shape';
// import Vector2 from './vector';
// import { workspace as ws } from './workspace';

// function saveElements(path: string): CommandOutput {
// 	const normalizedPath = path.replace(/^\//, '').replace(/\/$/, '');
// 	let string = '';
// 	let output = new CommandOutput(
// 		`Saved the workspace to file ${normalizedPath}`,
// 		OutputType.NORMAL
// 	);
// 	string = JSON.stringify({
// 		cursorPosition: ws.cursor,
// 		viewPosition: new Vector2(ws.windowX, ws.windowY),
// 		allowedModes: ws.allowedModes
// 	});
// 	ws.elements.forEach((el) => {
// 		const stringified = (el.constructor as typeof Shape).serialize(el);
// 		if (stringified.match(/.*\[,\].*/) !== null) {
// 			output = new CommandOutput(
// 				`Saved the workspace to file ${normalizedPath}, but it contained '[,]' which had to be escaped.`,
// 				OutputType.WARNING
// 			);
// 		}
// 		string += '[,]' + stringified.replace('[,]', '[]');
// 	});
// 	localStorage.setItem(normalizedPath, string);

// 	// const fileList = JSON.parse(localStorage.getItem('$files') ?? '[]');
// 	// if (!fileList.includes(normalizedPath) && !path.startsWith('$')) {
// 	// 	localStorage.setItem('$files', JSON.stringify(fileList.concat(normalizedPath)));
// 	// }

// 	return output;
// }

// function loadElements(path: string): CommandOutput {
// 	const normalizedPath = path.replace(/^\//, '').replace(/\/$/, '');
// 	const parts = localStorage.getItem(normalizedPath)?.split('[,]') ?? [];
// 	if (parts.length < 1) {
// 		return new CommandOutput(`The files ${normalizedPath} does not exist`, OutputType.ERROR);
// 	}
// 	const list = parts.slice(1);
// 	const state = JSON.parse(parts[0]);
// 	ws.elements = [];
// 	list?.map((el) => {
// 		if (el === '') {
// 			return;
// 		}
// 		for (let i = 0; i < SHAPES.length; i++) {
// 			const decoded = SHAPES[i].deserialize(el);
// 			if (decoded !== null) {
// 				ws.elements.push(decoded);
// 			}
// 		}
// 	});
// 	ws.fileName = normalizedPath;
// 	ws.setCursorCoords(state['cursorPosition']['x'] ?? 0, state['cursorPosition']['y'] ?? 0);
// 	ws.windowX = state['viewPosition']['x'];
// 	ws.windowY = state['viewPosition']['y'];
// 	ws.allowedModes = state['allowedModes'];
// 	ModeManager.setMode(Modes.VIEW_MODE);
// 	return new CommandOutput(`Loaded the workspace ${path}`, OutputType.NORMAL);
// }

// export { saveElements, loadElements };
