/* eslint-disable @typescript-eslint/no-unused-vars */
import Buffer from '../buffer';
import type { Command } from '../commands';
import {
	BindableInt,
	STATIC_TYPES,
	Value,
	type SerializedBindable,
	type BindingList,
	Binding
} from '../dataType';
import { keymap } from '../keymap';
import { workspace as ws } from '../workspace';
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
			'midpoint/x',
			STATIC_TYPES.INT,
			() => {
				return new Value(this.positionX.value, STATIC_TYPES.INT);
			},
			(val) => {
				this.positionX.bind(val);
			}
		),
		new Binding('midpoint/y', STATIC_TYPES.INT, () => {
			return new Value(
				Math.floor((this.positionY.value + this.height.value) / 2),
				STATIC_TYPES.INT
			);
		}),
		new Binding(
			'size/height',
			STATIC_TYPES.INT,
			() => {
				return new Value(this.height.value, STATIC_TYPES.INT);
			},
			(val) => {
				this.height.bind(val);
			}
		)
	];

	style: BracketType = BracketType.CURLY;
	side: Side = Side.LEFT;

	constructor(positionX: BindableInt, positionY: BindableInt, height: BindableInt, id: string) {
		this.positionX = positionX;
		this.positionY = positionY;
		this.width = new BindableInt(1);
		this.height = height;

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
		if (cursorX === this.positionX.value && cursorY === this.positionY.value) {
			if (this.height.value - deltaY >= 2) {
				this.positionY.value += deltaY;
				this.height.value -= deltaY;
				ws.currentDocument.moveCursor(deltaX, deltaY);
			} else {
				return;
			}
		} else if (
			cursorX === this.positionX.value &&
			cursorY === this.positionY.value + this.height.value - 1
		) {
			if (this.height.value + deltaY >= 2) {
				this.height.value += deltaY;
				ws.currentDocument.moveCursor(deltaX, deltaY);
			} else {
				return;
			}
		} else {
			this.positionY.value += deltaY;
			ws.currentDocument.moveCursor(deltaX, deltaY);
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

	static serialize(input: Bracket): SerializedShape {
		return {
			_type: 'Bracket',
			id: input.id,
			positionX: input.positionX.serialize(),
			positionY: input.positionY.serialize(),
			height: input.height.serialize(),
			style: input.style,
			side: input.side
		};
	}
	static deserialize(input: SerializedShape): Bracket | null {
		if (input['_type'] === 'Bracket') {
			const bracket = new Bracket(
				BindableInt.deserialize(input['positionX'] as SerializedBindable<number>),
				BindableInt.deserialize(input['positionY'] as SerializedBindable<number>),
				BindableInt.deserialize(input['height'] as SerializedBindable<number>),
				input['id'] as string
			);
			bracket.style = input['style'] as BracketType;
			bracket.side = input['side'] as Side;
			return bracket;
		}
		return null;
	}
}
