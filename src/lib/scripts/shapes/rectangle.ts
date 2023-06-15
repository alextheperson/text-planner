/* eslint-disable @typescript-eslint/no-unused-vars */
import { wp } from '$lib/components/stores';
import Buffer from '../buffer';
import Vector2 from '../vector';
import type { Shape } from './shape';
import { FRAME_CHARS } from './shape';
import { TwoPointShape } from './twoPointShape';

export class Rectangle extends TwoPointShape implements Shape {
	shouldRemove = false;

	constructor(startX: number, startY: number, endX: number, endY: number) {
		super(startX, startY, endX, endY);
	}

	override move(cursor: Vector2, movement: Vector2): void {
		if (Vector2.compare(cursor, this.startPosition)) {
			this.startPosition.add(movement);
			wp.moveCursor(movement);
		} else if (Vector2.compare(cursor, this.endPosition)) {
			this.endPosition.add(movement);
			wp.moveCursor(movement);
		} else if (Vector2.compare(cursor, new Vector2(this.startPosition.x, this.endPosition.y))) {
			this.startPosition.x += movement.x;
			this.endPosition.y += movement.y;
			wp.moveCursor(movement);
		} else if (Vector2.compare(cursor, new Vector2(this.endPosition.x, this.startPosition.y))) {
			this.endPosition.x += movement.x;
			this.startPosition.y += movement.y;
			wp.moveCursor(movement);
		} else {
			this.startPosition.add(movement);
			this.endPosition.add(movement);
			wp.moveCursor(movement);
		}

		this.updateDimensions();
	}

	override render(className: string) {
		this.updateDimensions();
		const buffer = new Buffer(this.size.x, this.size.y, '');

		if (this.size.x == 1) {
			if (this.size.y == 1) {
				buffer.setChar(0, 0, FRAME_CHARS[0][0][0][0], className);
			} else {
				for (let i = 1; i < this.size.y - 1; i++) {
					buffer.setChar(0, i, FRAME_CHARS[1][1][0][0], className);
				}
				buffer.setChar(0, 0, FRAME_CHARS[0][1][0][0], className);
				buffer.setChar(0, this.size.y - 1, FRAME_CHARS[1][0][0][0], className);
			}
		} else if (this.size.y == 1) {
			for (let i = 1; i < this.size.x - 1; i++) {
				buffer.setChar(i, 0, FRAME_CHARS[0][0][1][1], className);
			}
			buffer.setChar(0, 0, FRAME_CHARS[0][0][0][1], className);
			buffer.setChar(this.size.x - 1, 0, FRAME_CHARS[0][0][1][0], className);
		} else {
			for (let i = 1; i < this.size.x - 1; i++) {
				buffer.setChar(i, 0, FRAME_CHARS[0][0][1][1], className);
				buffer.setChar(i, this.size.y - 1, FRAME_CHARS[0][0][1][1], className);
			}

			for (let i = 1; i < this.size.y - 1; i++) {
				buffer.setChar(0, i, FRAME_CHARS[1][1][0][0], className);
				buffer.setChar(this.size.x - 1, i, FRAME_CHARS[1][1][0][0], className);
			}

			buffer.setChar(0, 0, FRAME_CHARS[0][1][0][1], className);
			buffer.setChar(this.size.x - 1, 0, FRAME_CHARS[0][1][1][0], className);
			buffer.setChar(0, this.size.y - 1, FRAME_CHARS[1][0][0][1], className);
			buffer.setChar(this.size.x - 1, this.size.y - 1, FRAME_CHARS[1][0][1][0], className);
		}
		return buffer;
	}

	interact(cursor: Vector2, event: KeyboardEvent): boolean {
		return false;
	}
	override isOn(x: number, y: number) {
		this.updateDimensions();

		const localX = x - this.position.x;
		const localY = y - this.position.y;

		return (
			(localX === 0 || localX === this.size.x - 1 || localY === 0 || localY === this.size.y - 1) &&
			super.isOn(x, y)
		);
	}

	static serialize(input: Rectangle): string {
		return JSON.stringify({
			_type: 'Rectangle',
			startPosition: input.startPosition,
			endPosition: input.endPosition
		});
	}

	static deserialize(input: string): Rectangle | null {
		const json = JSON.parse(input);
		if (json['_type'] === 'Rectangle') {
			return new Rectangle(
				json['startPosition']['x'],
				json['startPosition']['y'],
				json['endPosition']['x'],
				json['endPosition']['y']
			);
		}
		return null;
	}
}
