/* eslint-disable @typescript-eslint/no-unused-vars */
import Buffer from '../buffer';
import type { Command } from '../commands';
import {
	BindableInt,
	BindableString,
	STATIC_TYPES,
	Value,
	type SerializedBindable,
	type BindingList,
	Binding
} from '../dataType';
import { keymap } from '../keymap';
import { workspace as ws } from '../workspace';
import type { Bindings, SerializedShape, Shape } from './shape';

export class PrefixedLine implements Shape {
	// This is a single line of text with preset text preceding it
	positionX: BindableInt;
	positionY: BindableInt;
	width: BindableInt = new BindableInt(0);
	height: BindableInt = new BindableInt(0);
	prefix: BindableString;
	content: BindableString;
	readonly id: string;

	bindings: BindingList = [
		new Binding(
			'position/x',
			STATIC_TYPES.INT,
			() => {
				return new Value(this.positionX.value, STATIC_TYPES.INT);
			},
			(val) => {
				this.positionX.bind(val);
			}
		),
		new Binding(
			'position/y',
			STATIC_TYPES.INT,
			() => {
				return new Value(this.positionY.value, STATIC_TYPES.INT);
			},
			(val) => {
				this.positionY.bind(val);
			}
		),
		new Binding(
			'size/width',
			STATIC_TYPES.INT,
			() => {
				return new Value(this.width.value, STATIC_TYPES.INT);
			},
			(val) => {
				this.width.bind(val);
			}
		),
		new Binding(
			'size/height',
			STATIC_TYPES.INT,
			() => {
				return new Value(this.height.value, STATIC_TYPES.INT);
			},
			(val) => {
				this.height.bind(val);
			}
		),
		new Binding(
			'content/prefix',
			STATIC_TYPES.STRING,
			() => {
				return new Value(this.prefix.value, STATIC_TYPES.STRING);
			},
			(val) => {
				this.prefix.bind(val);
			}
		),
		new Binding(
			'content/body',
			STATIC_TYPES.STRING,
			() => {
				return new Value(this.content.value, STATIC_TYPES.STRING);
			},
			(val) => {
				this.content.bind(val);
			}
		)
	];

	shouldRemove = false;

	constructor(
		positionX: BindableInt,
		positionY: BindableInt,
		prefix: BindableString,
		content: BindableString,
		id: string
	) {
		this.positionX = positionX;
		this.positionY = positionY;
		this.prefix = prefix;
		this.content = content;

		this.id = id;

		this.updateDimensions();
	}

	addCharAt(char: string, at: number): void {
		this.content.value = this.content.value.slice(0, at) + char + this.content.value.slice(at);
		this.updateCursorPosition(1);
	}

	deleteAt(at: number): void {
		this.content.value =
			this.content.value.slice(0, Math.max(at - 1, 0)) + this.content.value.slice(at);
		this.updateCursorPosition(0);
	}

	updateDimensions(): void {
		this.width.value = this.content.value.length + this.prefix.value.length;
		this.height.value = 1;
	}

	isOn(x: number, y: number): boolean {
		const localX = x - this.positionX.value;
		const localY = y - this.positionY.value;

		return localX >= 0 && localX < this.width.value && localY === 0;
	}

	isOnText(x: number, y: number): boolean {
		const localX = x - this.positionX.value;
		const localY = y - this.positionY.value;

		return localX >= this.prefix.value.length && localX <= this.width.value && localY === 0;
	}

	getIndex(x: number, y: number): number {
		const localX = x - this.positionX.value;

		return y == this.positionY.value
			? localX - this.prefix.value.length > 0
				? localX - this.prefix.value.length
				: 0
			: -1;
	}

	render(className: string): Buffer {
		this.updateDimensions();
		const buffer = new Buffer(
			this.width.value /* + (ws.showInvisibleChars ? 1 : 0)*/,
			this.height.value,
			''
		);
		for (let i = 0; i < this.prefix.value.length; i++) {
			buffer.setChar(i, 0, this.prefix.value[i], className);
		}
		for (let i = 0; i < this.content.value.length; i++) {
			buffer.setChar(i + this.prefix.value.length, 0, this.content.value[i], className);
		}

		return buffer;
	}

	input(cursorX: number, cursorY: number, event: KeyboardEvent): boolean {
		const positionInText = this.getIndex(ws.currentDocument.cursorX, ws.currentDocument.cursorY);
		if (event.key == 'Backspace') {
			this.deleteAt(positionInText);
			if (this.content.value === '') {
				this.shouldRemove = true;
			}
			return true;
		} else if (event.key.length <= 1) {
			this.addCharAt(event.key, positionInText);
			return true;
		} else if (keymap.moveCursorUp.includes(event.key)) {
			if (this.isOnText(cursorX, cursorY - 1)) {
				ws.currentDocument.moveCursor(0, -1);
			}
			return true;
		} else if (keymap.moveCursorDown.includes(event.key)) {
			if (this.isOnText(cursorX, cursorY + 1)) {
				ws.currentDocument.moveCursor(0, 1);
			}
			return true;
		} else if (keymap.moveCursorLeft.includes(event.key)) {
			if (this.isOnText(cursorX - 1, cursorY)) {
				ws.currentDocument.moveCursor(-1, 0);
			}
			return true;
		} else if (keymap.moveCursorRight.includes(event.key)) {
			if (this.isOnText(cursorX + 1, cursorY)) {
				ws.currentDocument.moveCursor(1, 0);
			}
			return true;
		}
		return false;
	}

	updateCursorPosition(offset: number): void {
		const positionInText =
			this.getIndex(ws.currentDocument.cursorX, ws.currentDocument.cursorY) + offset;
		ws.currentDocument.setCursorCoords(
			this.positionX.value + positionInText + offset + this.prefix.value.length - 1,
			this.positionY.value
		);
	}

	move(cursorX: number, cursorY: number, deltaX: number, deltaY: number) {
		this.positionX.value += deltaX;
		this.positionY.value += deltaY;
		ws.currentDocument.moveCursor(deltaX, deltaY);
	}

	interact(cursorX: number, cursorY: number, event: KeyboardEvent): boolean {
		return false;
	}

	static serialize(input: PrefixedLine): SerializedShape {
		return {
			_type: 'PrefixedLine',
			id: input.id,
			positionX: input.positionX.serialize(),
			positionY: input.positionY.serialize(),
			prefix: input.prefix.serialize(),
			content: input.content.serialize()
		};
	}

	static deserialize(input: SerializedShape): PrefixedLine | null {
		if (input['_type'] === 'PrefixedLine') {
			return new PrefixedLine(
				BindableInt.deserialize(input['positionX'] as SerializedBindable<number>),
				BindableInt.deserialize(input['positionY'] as SerializedBindable<number>),
				BindableString.deserialize(input['prefix'] as SerializedBindable<string>),
				BindableString.deserialize(input['content'] as SerializedBindable<string>),
				input['id'] as string
			);
		}
		return null;
	}
}
