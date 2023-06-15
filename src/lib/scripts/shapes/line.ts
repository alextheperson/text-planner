/* eslint-disable @typescript-eslint/no-unused-vars */
import Buffer from '../buffer';
import { keymap } from '../keymap';
import Vector2 from '../vector';
import type { Shape } from './shape';
import { FRAME_CHARS, LineDirection } from './shape';
import { TwoPointShape } from './twoPointShape';

export class Line extends TwoPointShape implements Shape {
	startArrow = false;
	endArrow = false;

	direction = LineDirection.X_FIRST;
	shouldRemove = false;

	constructor(startX: number, startY: number, endX: number, endY: number) {
		super(startX, startY, endX, endY);
	}

	toggleDirection() {
		if (this.direction === LineDirection.X_FIRST) {
			this.direction = LineDirection.Y_FIRST;
		} else {
			this.direction = LineDirection.X_FIRST;
		}
	}
	toggleStartArrow() {
		this.startArrow = !this.startArrow;
	}
	toggleEndArrow() {
		this.endArrow = !this.endArrow;
	}

	override render(className: string) {
		this.updateDimensions();
		const buffer = new Buffer(this.size.x, this.size.y, '');

		const midPoint = new Vector2(
			this.direction === LineDirection.X_FIRST
				? this.endPosition.x - this.position.x
				: this.startPosition.x - this.position.x,
			this.direction === LineDirection.Y_FIRST
				? this.endPosition.y - this.position.y
				: this.startPosition.y - this.position.y
		);

		for (let i = 0; i < this.size.x; i++) {
			buffer.setChar(
				i,
				this.direction === LineDirection.Y_FIRST
					? this.endPosition.y - this.position.y
					: this.startPosition.y - this.position.y,
				FRAME_CHARS[0][0][1][1],
				className
			);
		}

		for (let i = 0; i < this.size.y; i++) {
			buffer.setChar(
				this.direction === LineDirection.X_FIRST
					? this.endPosition.x - this.position.x
					: this.startPosition.x - this.position.x,
				i,
				FRAME_CHARS[1][1][0][0],
				className
			);
		}

		buffer.setChar(
			midPoint.x,
			midPoint.y,
			FRAME_CHARS[
				this.startPosition.y >= this.endPosition.y === (this.direction === LineDirection.X_FIRST)
					? 1
					: 0
			][
				this.startPosition.y <= this.endPosition.y === (this.direction === LineDirection.X_FIRST)
					? 1
					: 0
			][
				this.startPosition.x <= this.endPosition.x === (this.direction === LineDirection.X_FIRST)
					? 1
					: 0
			][
				this.startPosition.x >= this.endPosition.x === (this.direction === LineDirection.X_FIRST)
					? 1
					: 0
			],
			className
		);

		if (this.startArrow) {
			const startCharacter =
				(this.startPosition.x !== this.endPosition.x && this.direction === LineDirection.X_FIRST) ||
				(this.startPosition.y === this.endPosition.y && this.direction === LineDirection.Y_FIRST)
					? this.startPosition.x < this.endPosition.x
						? '\u2190'
						: '\u2192'
					: this.startPosition.y < this.endPosition.y
					? '\u2227' //'\u2191'
					: '\u2228';
			buffer.setChar(
				this.startPosition.x - this.position.x,
				this.startPosition.y - this.position.y,
				startCharacter,
				className
			);
		}
		if (this.endArrow) {
			const endCharacter =
				(this.startPosition.x !== this.endPosition.x && this.direction === LineDirection.Y_FIRST) ||
				(this.startPosition.y === this.endPosition.y && this.direction === LineDirection.X_FIRST)
					? this.startPosition.x >= this.endPosition.x
						? '\u2190'
						: '\u2192'
					: this.startPosition.y >= this.endPosition.y
					? '\u2227' //'\u2191'
					: '\u2228';
			buffer.setChar(
				this.endPosition.x - this.position.x,
				this.endPosition.y - this.position.y,
				endCharacter,
				className
			);
		}

		return buffer;
	}

	override isOn(x: number, y: number) {
		this.updateDimensions();

		const localX = x - this.position.x;
		const localY = y - this.position.y;

		if (
			(localX < 0 ||
				localX >= this.size.x ||
				localY !=
					(this.direction == LineDirection.Y_FIRST
						? this.endPosition.y - this.position.y
						: this.startPosition.y - this.position.y)) &&
			(localY < 0 ||
				localY >= this.size.y ||
				localX !=
					(this.direction == LineDirection.X_FIRST
						? this.endPosition.x - this.position.x
						: this.startPosition.x - this.position.x))
		) {
			return false;
		}

		return true;
	}

	override input(cursor: Vector2, event: KeyboardEvent) {
		if (keymap.moveCursorUp.includes(event.key)) {
			return true;
		} else if (keymap.moveCursorDown.includes(event.key)) {
			this.toggleDirection();
			return true;
		} else if (keymap.moveCursorLeft.includes(event.key)) {
			this.toggleStartArrow();
			return true;
		} else if (keymap.moveCursorRight.includes(event.key)) {
			this.toggleEndArrow();
			return true;
		} else {
			return false;
		}
	}

	interact(cursor: Vector2, event: KeyboardEvent): boolean {
		return false;
	}

	static serialize(input: Line): string {
		return JSON.stringify({
			_type: 'Line',
			startPosition: input.startPosition,
			endPosition: input.endPosition,
			startArrow: input.startArrow,
			endArrow: input.endArrow,
			direction: input.direction
		});
	}

	static deserialize(input: string): Line | null {
		const json = JSON.parse(input);
		if (json['_type'] === 'Line') {
			const line = new Line(
				json['startPosition']['x'],
				json['startPosition']['y'],
				json['endPosition']['x'],
				json['endPosition']['y']
			);
			line.startArrow = json['startArrow'];
			line.endArrow = json['endArrow'];
			line.direction = json['direction'];
			return line;
		}
		return null;
	}
}
