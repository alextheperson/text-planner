/* eslint-disable @typescript-eslint/no-unused-vars */
import { wp } from '$lib/components/stores';
import Buffer from '../buffer';
import type { Command } from '../commands';
import { BindableInt, STATIC_TYPES, Value } from '../dataType';
import { keymap } from '../keymap';
import { Shape, Side, type SerializedShape, type Bindings } from './shape';

export enum BracketType {
	CURLY,
	INTEGRAL,
	SQUARE
}

export default class Bracket implements Shape {
	positionX: BindableInt;
	positionY: BindableInt;
	width: BindableInt;
	height: BindableInt;
	shouldRemove = false;
	readonly id: string;

	bindings: Bindings = {
		'midpoint/x': {
			propertyName: 'midpointX',
			gettable: true,
			settable: false,
			type: STATIC_TYPES.INT
		},
		'midpoint/y': {
			propertyName: 'midpointY',
			gettable: true,
			settable: false,
			type: STATIC_TYPES.INT
		},
		'top/x': {
			propertyName: 'topX',
			gettable: false,
			settable: true,
			type: STATIC_TYPES.INT
		},
		'top/y': {
			propertyName: 'topY',
			gettable: false,
			settable: true,
			type: STATIC_TYPES.INT
		},
		'bottom/x': {
			propertyName: 'bottomX',
			gettable: false,
			settable: true,
			type: STATIC_TYPES.INT
		},
		'bottom/y': {
			propertyName: 'bottomY',
			gettable: false,
			settable: true,
			type: STATIC_TYPES.INT
		}
	};

	style: BracketType = BracketType.CURLY;
	side: Side = Side.LEFT;

	constructor(positionX: number, positionY: number, height: number, id: string) {
		this.positionX = new BindableInt(positionX);
		this.positionY = new BindableInt(positionY);
		this.width = new BindableInt(1);
		this.height = new BindableInt(height);

		this.id = id;
	}

	render(className: string): Buffer {
		const buffer = new Buffer(this.width.value, this.height.value, '');

		if (this.style === BracketType.CURLY) {
			// sourcery skip: merge-else-if
			if (this.side === Side.LEFT) {
				if (this.height.value == 2) {
					buffer.setChar(0, 0, '\u23a7', className);
					buffer.setChar(0, 1, '\u23a9', className);
				} else {
					buffer.setChar(0, 0, '\u23a7', className);
					for (let i = 1; i < Math.floor(this.height.value / 2); i++) {
						buffer.setChar(0, i, '\u23aa', className);
					}
					buffer.setChar(0, Math.floor(this.height.value / 2), '\u23a8', className);
					for (let i = Math.floor(this.height.value / 2) + 1; i < this.height.value - 1; i++) {
						buffer.setChar(0, i, '\u23aa', className);
					}
					buffer.setChar(0, this.height.value - 1, '\u23a9', className);
				}
			} else {
				if (this.height.value == 2) {
					buffer.setChar(0, 0, '\u23ab', className);
					buffer.setChar(0, 1, '\u23ad', className);
				} else {
					buffer.setChar(0, 0, '\u23ab', className);
					for (let i = 1; i < Math.floor(this.height.value / 2); i++) {
						buffer.setChar(0, i, '\u23aa', className);
					}
					buffer.setChar(0, Math.floor(this.height.value / 2), '\u23ac', className);
					for (let i = Math.floor(this.height.value / 2) + 1; i < this.height.value - 1; i++) {
						buffer.setChar(0, i, '\u23aa', className);
					}
					buffer.setChar(0, this.height.value - 1, '\u23ad', className);
				}
			}
		} else if (this.style === BracketType.INTEGRAL) {
			buffer.setChar(0, 0, '\u2320', className);
			for (let i = 1; i < this.height.value - 1; i++) {
				buffer.setChar(0, i, '\u23ae', className);
			}
			buffer.setChar(0, this.height.value - 1, '\u2321', className);
		} else if (this.style === BracketType.SQUARE) {
			if (this.side === Side.LEFT) {
				buffer.setChar(0, 0, '\u23a1', className);
				for (let i = 1; i < this.height.value - 1; i++) {
					buffer.setChar(0, i, '\u23a2', className);
				}
				buffer.setChar(0, this.height.value - 1, '\u23a3', className);
			} else {
				buffer.setChar(0, 0, '\u23a4', className);
				for (let i = 1; i < this.height.value - 1; i++) {
					buffer.setChar(0, i, '\u23a5', className);
				}
				buffer.setChar(0, this.height.value - 1, '\u23a6', className);
			}
		}

		return buffer;
	}

	private nextStyle() {
		switch (this.style) {
			case BracketType.CURLY:
				this.style = BracketType.SQUARE;
				break;
			case BracketType.SQUARE:
				this.style = BracketType.INTEGRAL;
				break;
			case BracketType.INTEGRAL:
				this.style = BracketType.CURLY;
				break;
			default:
				this.style = BracketType.CURLY;
				break;
		}
	}

	private prevStyle() {
		switch (this.style) {
			case BracketType.CURLY:
				this.style = BracketType.INTEGRAL;
				break;
			case BracketType.SQUARE:
				this.style = BracketType.CURLY;
				break;
			case BracketType.INTEGRAL:
				this.style = BracketType.SQUARE;
				break;
			default:
				this.style = BracketType.CURLY;
				break;
		}
	}

	input(cursorX: number, cursorY: number, event: KeyboardEvent): boolean {
		if (keymap.moveCursorLeft.includes(event.key)) {
			this.nextStyle();
			return true;
		} else if (keymap.moveCursorRight.includes(event.key)) {
			this.prevStyle();
			return true;
		} else if (
			keymap.moveCursorDown.includes(event.key) ||
			keymap.moveCursorUp.includes(event.key)
		) {
			if (this.side === Side.LEFT) {
				this.side = Side.RIGHT;
			} else {
				this.side = Side.LEFT;
			}
			return true;
		}
		return false;
	} // Returns true if the key did something, false otherwise.

	move(cursorX: number, cursorY: number, deltaX: number, deltaY: number): void {
		this.positionX.value += deltaX;
		if (this.height.value - deltaY > 1) {
			if (cursorX === this.positionX.value && cursorY === this.positionY.value) {
				this.positionY.value += deltaY;
				this.height.value -= deltaY;
				wp.moveCursor(deltaX, deltaY);
			} else if (
				cursorX === this.positionX.value &&
				cursorY === this.positionY.value + this.height.value - 1
			) {
				this.height.value += deltaY;
				wp.moveCursor(deltaX, deltaY);
			} else {
				this.positionY.value += deltaY;
				wp.moveCursor(deltaX, deltaY);
			}
		}
	}

	interact(cursorX: number, cursorY: number, event: KeyboardEvent): boolean {
		return false;
	}

	isOn(x: number, y: number): boolean {
		return (
			x == this.positionX.value &&
			y >= this.positionY.value &&
			y < this.positionY.value + this.height.value
		);
	}

	getBinding(name: string): Value {
		const propertyName = this.bindings[name]['propertyName'] as keyof Bracket;
		if (propertyName === undefined) {
			throw new Error(`This item does not have a binding called '${name}'`);
		}
		return new Value((this[propertyName] as BindableInt).value, this.bindings[name]['type']);
	}

	setBinding(name: string, command: Command): void {
		const propertyName = this.bindings[name]['propertyName'] as keyof Bracket;
		if (propertyName === undefined) {
			throw new Error(`This item does not have a binding called '${name}'`);
		}
		(this[propertyName] as BindableInt).bind(command);
	}

	static serialize(input: Bracket): string {
		return JSON.stringify({
			_type: 'Bracket',
			positionX: input.positionX,
			positionY: input.positionY,
			height: input.height.value,
			style: input.style,
			side: input.side
		});
	}
	static deserialize(input: SerializedShape): Bracket | null {
		if (input['_type'] === 'Bracket') {
			const bracket = new Bracket(
				input['positionX'] as number,
				input['positionY'] as number,
				input['height'] as number,
				input['id'] as string
			);
			bracket.style = input['style'] as BracketType;
			bracket.side = input['side'] as Side;
			return bracket;
		}
		return null;
	}
}
