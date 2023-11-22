/* eslint-disable @typescript-eslint/no-unused-vars */
import { wp } from '$lib/components/stores';
import Buffer from '../buffer';
import type { Command } from '../commands';
import { BindableInt, BindableString, STATIC_TYPES, Value } from '../dataType';
import { keymap } from '../keymap';
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

	bindings: Bindings = {
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
		width: {
			propertyName: 'width',
			gettable: true,
			settable: false,
			type: STATIC_TYPES.INT
		},
		height: {
			propertyName: 'height',
			gettable: true,
			settable: false,
			type: STATIC_TYPES.INT
		},
		'content/prefix': {
			propertyName: 'prefix',
			gettable: true,
			settable: true,
			type: STATIC_TYPES.STRING
		},
		'content/body': {
			propertyName: 'content',
			gettable: true,
			settable: true,
			type: STATIC_TYPES.STRING
		}
	};

	shouldRemove = false;

	constructor(positionX: number, positionY: number, prefix: string, content: string, id: string) {
		this.positionX = new BindableInt(positionX);
		this.positionY = new BindableInt(positionY);
		this.prefix = new BindableString(prefix);
		this.content = new BindableString(content);

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
		const positionInText = this.getIndex(wp.cursorX, wp.cursorY);
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
				wp.moveCursor(0, -1);
			}
			return true;
		} else if (keymap.moveCursorDown.includes(event.key)) {
			if (this.isOnText(cursorX, cursorY + 1)) {
				wp.moveCursor(0, 1);
			}
			return true;
		} else if (keymap.moveCursorLeft.includes(event.key)) {
			if (this.isOnText(cursorX - 1, cursorY)) {
				wp.moveCursor(-1, 0);
			}
			return true;
		} else if (keymap.moveCursorRight.includes(event.key)) {
			if (this.isOnText(cursorX + 1, cursorY)) {
				wp.moveCursor(1, 0);
			}
			return true;
		}
		return false;
	}

	updateCursorPosition(offset: number): void {
		const positionInText = this.getIndex(wp.cursorX, wp.cursorY) + offset;
		wp.setCursorCoords(
			this.positionX.value + positionInText + offset + this.prefix.value.length - 1,
			this.positionY.value
		);
	}

	move(cursorX: number, cursorY: number, deltaX: number, deltaY: number) {
		this.positionX.value += deltaX;
		this.positionY.value + deltaY;
		wp.moveCursor(deltaX, deltaY);
	}

	interact(cursorX: number, cursorY: number, event: KeyboardEvent): boolean {
		return false;
	}

	getBinding(name: string): Value {
		const propertyName = this.bindings[name]['propertyName'] as keyof PrefixedLine;
		if (propertyName === undefined) {
			throw new Error(`This item does not have a binding called '${name}'`);
		}
		return new Value((this[propertyName] as BindableInt).value, this.bindings[name]['type']);
	}

	setBinding(name: string, command: Command): void {
		const propertyName = this.bindings[name]['propertyName'] as keyof PrefixedLine;
		if (propertyName === undefined) {
			throw new Error(`This item does not have a binding called '${name}'`);
		}
		(this[propertyName] as BindableInt).bind(command);
	}

	static serialize(input: PrefixedLine): SerializedShape {
		return {
			_type: 'PrefixedLine',
			id: input.id,
			positionX: input.positionX.value,
			positionY: input.positionY.value,
			prefix: input.prefix.value,
			content: input.content.value
		};
	}

	static deserialize(input: SerializedShape): PrefixedLine | null {
		if (input['_type'] === 'PrefixedLine') {
			return new PrefixedLine(
				input['positionX'] as number,
				input['positionY'] as number,
				input['prefix'] as string,
				input['content'] as string,
				input['id'] as string
			);
		}
		return null;
	}
}
