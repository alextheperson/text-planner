/* eslint-disable @typescript-eslint/no-unused-vars */
import { wp } from '$lib/components/stores';
import Buffer from '../buffer';
import type { Command } from '../commands';
import { BindableInt, BindableString, STATIC_TYPES, Value } from '../dataType';
import { keymap } from '../keymap';
import { workspace as ws } from '../workspace';
import type { Bindings, SerializedShape, Shape } from './shape';

export class TextBox implements Shape {
	positionX: BindableInt;
	positionY: BindableInt;
	width: BindableInt = new BindableInt(0);
	height: BindableInt = new BindableInt(0);
	shouldRemove = false;
	readonly id: string;

	readonly bindings: Bindings = {
		'position/x': {
			propertyName: 'positionX',
			gettable: true,
			settable: true,
			type: STATIC_TYPES.INT
		},
		'position/y': {
			propertyName: 'positionY',
			gettable: true,
			settable: true,
			type: STATIC_TYPES.INT
		},
		'size/width': {
			propertyName: 'width',
			gettable: true,
			settable: false,
			type: STATIC_TYPES.INT
		},
		'size/height': {
			propertyName: 'height',
			gettable: true,
			settable: false,
			type: STATIC_TYPES.INT
		},
		content: {
			propertyName: 'content',
			gettable: true,
			settable: true,
			type: STATIC_TYPES.STRING
		}
	};

	content: BindableString;
	hasBorder = false;

	constructor(positionX: number, positionY: number, content: string, id: string) {
		this.positionX = new BindableInt(positionX);
		this.positionY = new BindableInt(positionY);
		this.content = new BindableString(content);

		this.id = id;

		this.updateDimensions();
	}

	addCharAt(char: string, at: number) {
		this.content.value = this.content.value.slice(0, at) + char + this.content.value.slice(at);
		this.updateCursorPosition(1);
	}

	deleteAt(at: number) {
		this.content.value =
			this.content.value.slice(0, Math.max(at - 1, 0)) + this.content.value.slice(at);
		this.updateCursorPosition(-1);
	}

	updateDimensions() {
		const lines = this.content.value.split('\n');
		this.width.value = 0;
		this.height.value = lines.length;
		lines.forEach((line) => {
			this.width.value = Math.max(this.width.value, line.length);
		});
	}

	isOn(x: number, y: number) {
		const localX = x - this.positionX.value;
		const localY = y - this.positionY.value;

		const lines = this.content.value.split('\n');
		for (let i = 0; i < lines.length; i++) {
			if (localY == i && localX >= 0 && localX <= lines[i].length) {
				return true;
			}
		}
		return false;
	}

	// isOnText(x: number, y: number) {
	// 	const localX = x - this.positionX.value;
	// 	const localY = y - this.positionY.value;

	// 	const lines = this.content.split('\n');
	// 	for (let i = 0; i < lines.length; i++) {
	// 		if (localY == i && localX >= 0 && localX <= lines[i].length) {
	// 			return true;
	// 		}
	// 	}
	// 	return false;
	// }

	getIndex(x: number, y: number) {
		const localX = x - this.positionX.value;
		const localY = y - this.positionY.value;

		// if (localX == 0 && localY == this.content.replaceAll(/[^\n]/g, '').length) {
		// 	return this.content.length + 1;
		// }

		const lines = this.content.value.split('\n');
		return lines.slice(0, localY).concat(['']).join('\n').length + localX;
	}

	render(className: string) {
		this.updateDimensions();
		let row = 0;
		let col = 0;
		const buffer = new Buffer(
			this.width.value /* + (ws.showInvisibleChars ? 1 : 0)*/,
			this.height.value,
			''
		);
		for (let i = 0; i < this.content.value.length; i++) {
			if (this.content.value[i] == '\n') {
				// if (ws.showInvisibleChars) {
				// buffer.setChar(col, row, '\u23ce', className);
				// }
				row += 1;
				col = 0;
			} else {
				buffer.setChar(col, row, this.content.value[i], className);
				col += 1;
			}
		}
		return buffer;
	}

	input(cursor: Vector2, event: KeyboardEvent) {
		const positionInText = this.getIndex(wp.cursor.x, wp.cursor.y);
		if (this.content !== '') {
			this.shouldRemove = false;
			// ModeManager.setMode(Modes.VIEW_MODE);
		}
		if (event.key == 'Backspace') {
			this.deleteAt(positionInText);
			if (this.content.value === '') {
				this.shouldRemove = true;
				// ModeManager.setMode(Modes.VIEW_MODE);
			}
			return true;
		} else if (event.key == 'Enter' || event.key == 'Return') {
			this.addCharAt('\n', positionInText);
			return true;
		} else if (event.key.length <= 1) {
			if (this.isOn(cursorX, cursorY)) {
				this.addCharAt(event.key, positionInText);
			} else {
				console.log('new textbox');
				const newText = new TextBox(cursorX, cursorY, event.key, ws.getId());
				ws.elements.push(newText);
				ws.selected = newText;
				wp.moveCursor(1, 0);
			}
			return true;
		} else if (keymap.moveCursorUp.includes(event.key)) {
			if (this.isOn(cursorX, cursorY - 1)) {
				wp.moveCursor(0, -1);
			}
			return true;
		} else if (keymap.moveCursorDown.includes(event.key)) {
			if (this.isOn(cursorX, cursorY + 1)) {
				wp.moveCursor(0, 1);
			}
			return true;
		} else if (keymap.moveCursorLeft.includes(event.key)) {
			if (this.isOn(cursorX - 1, cursorY)) {
				wp.moveCursor(-1, 0);
			}
			return true;
		} else if (keymap.moveCursorRight.includes(event.key)) {
			if (this.isOn(cursorX + 1, cursorY)) {
				wp.moveCursor(1, 0);
			}
			return true;
		}
		return false;
	}

	interact(cursorX: number, cursorY: number, event: KeyboardEvent): boolean {
		return false;
	}

	updateCursorPosition(offset: number) {
		const positionInText = this.getIndex(wp.cursorX, wp.cursorY) + offset;
		wp.setCursorCoords(
			this.positionX.value +
				(this.content.value.slice(0, positionInText).split('\n').at(-1) ?? []).length,
			this.positionY.value +
				this.content.value.slice(0, positionInText).replaceAll(/[^\n]/g, '').length
		);
	}

	move(cursorX: number, cursorY: number, deltaX: number, deltaY: number) {
		this.positionX.value += deltaX;
		this.positionY.value += deltaY;
		wp.moveCursor(deltaX, deltaY);
	}

	getBinding(name: string): Value {
		const propertyName = this.bindings[name]['propertyName'] as keyof TextBox;
		if (propertyName === undefined) {
			throw new Error(`This item does not have a binding called '${name}'`);
		}
		return new Value((this[propertyName] as BindableInt).value, this.bindings[name]['type']);
	}

	setBinding(name: string, command: Command): void {
		const propertyName = this.bindings[name]['propertyName'] as keyof TextBox;
		if (propertyName === undefined) {
			throw new Error(`This item does not have a binding called '${name}'`);
		}
		(this[propertyName] as BindableInt).bind(command);
	}

	static serialize(input: TextBox): SerializedShape {
		return {
			_type: 'TextBox',
			positionX: input.positionX.value,
			positionY: input.positionY.value,
			content: input.content.value,
			id: input.id
		};
	}

	static deserialize(input: SerializedShape): TextBox | null {
		if (input['_type'] === 'TextBox') {
			return new TextBox(
				input['positionX'] as number,
				input['positionY'] as number,
				input['content'] as string,
				input['id'] as string
			);
		}
		return null;
	}
}
