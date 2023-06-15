/* eslint-disable @typescript-eslint/no-unused-vars */
import { wp } from '$lib/components/stores';
import Buffer from '../buffer';
import Vector2 from '../vector';
import type { Shape } from './shape';

export class TwoPointShape implements Shape {
	position!: Vector2;
	startPosition: Vector2;
	endPosition: Vector2;
	size!: Vector2;
	shouldRemove = false;
	readonly id: number;

	constructor(startX: number, startY: number, endX: number, endY: number) {
		this.startPosition = new Vector2(startX, startY);
		this.endPosition = new Vector2(endX, endY);

		this.id = 1;

		this.updateDimensions();
	}

	updateDimensions() {
		this.position = new Vector2(
			Math.min(this.startPosition.x, this.endPosition.x),
			Math.min(this.startPosition.y, this.endPosition.y)
		);
		this.size = new Vector2(
			Math.abs(this.endPosition.x - this.startPosition.x) + 1,
			Math.abs(this.endPosition.y - this.startPosition.y) + 1
		);
	}

	move(cursor: Vector2, movement: Vector2) {
		if (Vector2.compare(cursor, this.startPosition)) {
			this.startPosition.add(movement);
			wp.moveCursor(movement);
		} else if (Vector2.compare(cursor, this.endPosition)) {
			this.endPosition.add(movement);
			wp.moveCursor(movement);
		} else {
			this.startPosition.add(movement);
			this.endPosition.add(movement);
			wp.moveCursor(movement);
		}

		this.updateDimensions();
	}

	render(className: string) {
		this.updateDimensions();
		const buffer = new Buffer(this.size.x, this.size.y, '');
		buffer.setChar(0, 0, '*', className);
		buffer.setChar(this.size.x - 1, 0, '*', className);
		buffer.setChar(0, this.size.y - 1, '*', className);
		buffer.setChar(this.size.x - 1, this.size.y - 1, '*', className);
		return buffer;
	}

	isOn(x: number, y: number) {
		this.updateDimensions();

		const localX = x - this.position.x;
		const localY = y - this.position.y;

		return localX >= 0 && localX < this.size.x && localY >= 0 && localY < this.size.y;
	}

	input(cursor: Vector2, event: KeyboardEvent) {
		return false;
	}

	interact(cursor: Vector2, event: KeyboardEvent): boolean {
		return false;
	}

	static serialize(input: TwoPointShape): string {
		return JSON.stringify({
			_type: 'TwoPointShape',
			startPosition: input.startPosition,
			endPosition: input.endPosition
		});
	}

	static deserialize(input: string): TwoPointShape | null {
		const json = JSON.parse(input);
		if (json['_type'] === 'TwoPointShape') {
			return new TwoPointShape(
				json['startPosition']['x'],
				json['startPosition']['y'],
				json['endPosition']['x'],
				json['endPosition']['y']
			);
		}
		return null;
	}
}
