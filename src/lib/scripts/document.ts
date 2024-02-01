import { CommandOutput, OUTPUT_TYPE } from './commands';
import ModeManager, { Modes } from './modes';
import { ShapeList as SHAPES } from './shapes/index';
import type { SerializedShape, Shape } from './shapes/shape';
import {} from './shapes/textbox';

import './commands/bindings';
import './commands/create';
import './commands/edit';
import './commands/io';
import './commands/math';
import './commands/movement';
import './commands/settings';
import './commands/logic';
import './commands/strings';
import './commands/typeConversion';

export class Document {
	selected: Shape | null = null;

	elements: Array<Shape> = [];

	writable = true;
	allowedModes = [Modes.VIEW_MODE, Modes.EDIT_MODE, Modes.MOVE_MODE, Modes.COMMAND];
	fileName = '';

	cursorX = 0;
	cursorY = 0;

	modeManager = new ModeManager();

	constructor(data?: string) {
		if (data == undefined) {
			return;
		}
		const parts = data.split('[,]') ?? [];
		const list = parts.slice(1);
		const state = JSON.parse(parts[0]);
		this.elements = [];
		list?.map((el) => {
			if (el === '') {
				return;
			}
			for (let i = 0; i < SHAPES.length; i++) {
				const decoded = SHAPES[i].deserialize(JSON.parse(el) as SerializedShape);
				if (decoded !== null) {
					this.elements.push(decoded);
				}
			}
		});
		this.cursorX = state['cursorPositionX'] ?? 0;
		this.cursorY = state['cursorPositionY'] ?? 0;
		this.allowedModes = state['allowedModes'];
		this.modeManager.setMode(Modes.VIEW_MODE);
	}

	underCursor(): Shape | null {
		for (let i = 0; i < this.elements.length; i++) {
			if (this.elements[i] && this.elements[i].isOn(this.cursorX, this.cursorY)) {
				return this.elements[i];
			}
		}
		return null;
	}

	// click(e: MouseEvent) {
	// 	ModeManager.currentMode.click(e)
	// }

	cullElements() {
		for (let i = 0; i < this.elements.length; i++) {
			if (this.elements[i].shouldRemove) {
				this.elements.splice(i, 1);
				i -= 1; //since we just deleted an element
			}
		}
	}

	saveElements(path: string): CommandOutput {
		const normalizedPath = path.replace(/^\//, '').replace(/\/$/, '');
		let string = '';
		let output = new CommandOutput(
			`Saved the workspace to file ${normalizedPath}`,
			OUTPUT_TYPE.NORMAL
		);
		string = JSON.stringify({
			cursorPositionX: this.cursorX,
			cursorPositionY: this.cursorY,
			allowedModes: this.allowedModes
		});
		this.elements.forEach((el) => {
			const stringified = JSON.stringify((el.constructor as typeof Shape).serialize(el));
			if (stringified.match(/.*\[,\].*/) !== null) {
				output = new CommandOutput(
					`Saved the workspace to file ${normalizedPath}, but it contained '[,]' which had to be escaped.`,
					OUTPUT_TYPE.WARNING
				);
			}
			string += '[,]' + stringified.replace('[,]', '[]');
		});
		localStorage.setItem(normalizedPath, string);

		// const fileList = JSON.parse(localStorage.getItem('$files') ?? '[]');
		// if (!fileList.includes(normalizedPath) && !path.startsWith('$')) {
		// 	localStorage.setItem('$files', JSON.stringify(fileList.concat(normalizedPath)));
		// }

		return output;
	}

	getId(): string {
		return 'a' + Math.floor(Math.random() * 1000);
	}

	moveCursor(x: number, y: number) {
		this.cursorX += x;
		this.cursorY += y;
	}

	setCursorCoords(x: number, y: number) {
		this.cursorX = x;
		this.cursorY = y;
	}
}
