/* eslint-disable @typescript-eslint/no-unused-vars */
import { wp } from '$lib/components/stores';
import Buffer from '../buffer';
import type { Command } from '../commands';
import {
	BindableInt,
	BindableString,
	STATIC_TYPES,
	Value,
	type SerializedBindable,
	type DataType,
	type BindingList,
	Binding
} from '../dataType';
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

	readonly bindings: BindingList = [
		new Binding(
			'position/x',
			STATIC_TYPES.INT,
			() => {
				return new Value(this.positionX.value, STATIC_TYPES.INT);
			} //,
			// (val) => {
			// 	this.positionX.bind(val);
			// }
		),
		new Binding(
			'position/y',
			STATIC_TYPES.INT,

			() => {
				return new Value(this.positionY.value, STATIC_TYPES.INT);
			} //,
			// (val) => {
			// 	this.positionY.bind(val);
			// }
		),
		new Binding('size/width', STATIC_TYPES.INT, () => {
			return new Value(this.width.value, STATIC_TYPES.INT);
		}),
		new Binding('size/height', STATIC_TYPES.INT, () => {
			return new Value(this.height.value, STATIC_TYPES.INT);
		}),
		new Binding(
			'content',
			STATIC_TYPES.STRING,
			() => {
				return new Value(this.content.value, STATIC_TYPES.STRING);
			},
			(val) => {
				this.content.bind(val);
			}
		)
	];

	content: BindableString;
	hasBorder = false;

	constructor(positionX: BindableInt, positionY: BindableInt, content: BindableString, id: string) {
		this.positionX = positionX;
		this.positionY = positionY;
		this.content = content;

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

	input(cursorX: number, cursorY: number, event: KeyboardEvent) {
		const positionInText = this.getIndex(wp.cursorX, wp.cursorY);
		if (this.content.value !== '') {
			this.shouldRemove = false;
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
				const newText = new TextBox(
					new BindableInt(cursorX),
					new BindableInt(cursorY),
					new BindableString(event.key),
					ws.getId()
				);
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

	static serialize(input: TextBox): SerializedShape {
		return {
			_type: 'TextBox',
			positionX: input.positionX.serialize(),
			positionY: input.positionY.serialize(),
			content: input.content.serialize(),
			id: input.id
		};
	}

	static deserialize(input: SerializedShape): TextBox | null {
		if (input['_type'] === 'TextBox') {
			return new TextBox(
				BindableInt.deserialize(input['positionX'] as SerializedBindable<number>),
				BindableInt.deserialize(input['positionY'] as SerializedBindable<number>),
				BindableString.deserialize(input['content'] as SerializedBindable<string>),
				input['id'] as string
			);
		}
		return null;
	}
}
