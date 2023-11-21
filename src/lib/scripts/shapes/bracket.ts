/* eslint-disable @typescript-eslint/no-unused-vars */
import { wp } from '$lib/components/stores';
import Buffer from '../buffer';
import { keymap } from '../keymap';
import Vector2 from '../vector';
import { workspace as ws } from '../workspace';
import { Shape, Side } from './shape';

export enum BracketType {
	CURLY,
	INTEGRAL,
	SQUARE
}

export default class Bracket implements Shape {
	position: Vector2;
	size: Vector2;
	style: BracketType;
	side: Side;

	shouldRemove = false;
	readonly id: number;

	constructor(position: Vector2, height: number, style: BracketType, side: Side) {
		this.position = position;
		this.size = new Vector2(1, height);
		this.style = style;
		this.side = side;

		this.id = ws.getId();
	}

	render(className: string): Buffer {
		const buffer = new Buffer(this.size.x, this.size.y, '');

		if (this.style === BracketType.CURLY) {
			// sourcery skip: merge-else-if
			if (this.side === Side.LEFT) {
				if (this.size.y == 2) {
					buffer.setChar(0, 0, '\u23a7', className);
					buffer.setChar(0, 1, '\u23a9', className);
				} else {
					buffer.setChar(0, 0, '\u23a7', className);
					for (let i = 1; i < Math.floor(this.size.y / 2); i++) {
						buffer.setChar(0, i, '\u23aa', className);
					}
					buffer.setChar(0, Math.floor(this.size.y / 2), '\u23a8', className);
					for (let i = Math.floor(this.size.y / 2) + 1; i < this.size.y - 1; i++) {
						buffer.setChar(0, i, '\u23aa', className);
					}
					buffer.setChar(0, this.size.y - 1, '\u23a9', className);
				}
			} else {
				if (this.size.y == 2) {
					buffer.setChar(0, 0, '\u23ab', className);
					buffer.setChar(0, 1, '\u23ad', className);
				} else {
					buffer.setChar(0, 0, '\u23ab', className);
					for (let i = 1; i < Math.floor(this.size.y / 2); i++) {
						buffer.setChar(0, i, '\u23aa', className);
					}
					buffer.setChar(0, Math.floor(this.size.y / 2), '\u23ac', className);
					for (let i = Math.floor(this.size.y / 2) + 1; i < this.size.y - 1; i++) {
						buffer.setChar(0, i, '\u23aa', className);
					}
					buffer.setChar(0, this.size.y - 1, '\u23ad', className);
				}
			}
		} else if (this.style === BracketType.INTEGRAL) {
			buffer.setChar(0, 0, '\u2320', className);
			for (let i = 1; i < this.size.y - 1; i++) {
				buffer.setChar(0, i, '\u23ae', className);
			}
			buffer.setChar(0, this.size.y - 1, '\u2321', className);
		} else if (this.style === BracketType.SQUARE) {
			if (this.side === Side.LEFT) {
				buffer.setChar(0, 0, '\u23a1', className);
				for (let i = 1; i < this.size.y - 1; i++) {
					buffer.setChar(0, i, '\u23a2', className);
				}
				buffer.setChar(0, this.size.y - 1, '\u23a3', className);
			} else {
				buffer.setChar(0, 0, '\u23a4', className);
				for (let i = 1; i < this.size.y - 1; i++) {
					buffer.setChar(0, i, '\u23a5', className);
				}
				buffer.setChar(0, this.size.y - 1, '\u23a6', className);
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

	input(cursor: Vector2, event: KeyboardEvent): boolean {
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
	move(cursor: Vector2, movement: Vector2): void {
		this.position.x += movement.x;
		if (this.size.y - movement.y > 1) {
			if (Vector2.compare(cursor, this.position)) {
				this.position.y += movement.y;
				this.size.y -= movement.y;
				wp.moveCursor(movement);
			} else if (
				Vector2.compare(cursor, new Vector2(this.position.x, this.position.y + this.size.y - 1))
			) {
				this.size.y += movement.y;
				wp.moveCursor(movement);
			} else {
				this.position.y += movement.y;
				wp.moveCursor(movement);
			}
		}
	}
	interact(cursor: Vector2, event: KeyboardEvent): boolean {
		return false;
	}
	isOn(x: number, y: number): boolean {
		return x == this.position.x && y >= this.position.y && y < this.position.y + this.size.y;
	}
	static serialize(input: Bracket): string {
		return JSON.stringify({
			_type: 'Bracket',
			position: input.position,
			height: input.size.y,
			style: input.style,
			side: input.side
		});
	}
	static deserialize(input: string): Bracket | null {
		const json = JSON.parse(input);
		if (json['_type'] === 'Bracket') {
			return new Bracket(
				new Vector2(json['position']['x'], json['position']['y']),
				json['height'],
				json['style'],
				json['side']
			);
		}
		return null;
	}
}
