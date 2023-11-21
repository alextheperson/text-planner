/* eslint-disable @typescript-eslint/no-unused-vars */
import Buffer from '../buffer';
import Vector2 from '../vector';
import { Line } from './line';
import type { Shape } from './shape';

export class Connector extends Line implements Shape {
	constructor(startX: number, startY: number, endX: number, endY: number) {
		super(startX, startY, endX, endY);

		console.log(startX, startY, endX, endY);
	}

	override render(className: string) {
		this.updateDimensions();
		const buffer = new Buffer(this.size.x, this.size.y, '');

		if (this.startPosition.x == this.endPosition.x || this.startPosition.y == this.endPosition.y) {
			const line = new Line(
				this.startPosition.x - this.position.x,
				this.startPosition.y - this.position.y,
				this.endPosition.x - this.position.x,
				this.endPosition.y - this.position.y
			);
			line.startArrow = this.startArrow;
			line.endArrow = this.endArrow;
			line.direction = this.direction;
			buffer.composite(0, 0, line.render(className));
		} else {
			const midPoint = new Vector2(Math.floor(this.size.x / 2), Math.floor(this.size.y / 2));

			const startLine = new Line(
				this.startPosition.x - this.position.x,
				this.startPosition.y - this.position.y,
				midPoint.x,
				midPoint.y
			);
			startLine.startArrow = this.startArrow;
			startLine.direction = this.direction;
			buffer.composite(
				this.startPosition.x < this.endPosition.x ? 0 : midPoint.x,
				this.startPosition.y < this.endPosition.y ? 0 : midPoint.y,
				startLine.render(className)
			);

			const endLine = new Line(
				midPoint.x,
				midPoint.y,
				this.endPosition.x - this.position.x,
				this.endPosition.y - this.position.y
			);
			endLine.endArrow = this.endArrow;
			endLine.direction = this.direction;
			endLine.toggleDirection();
			buffer.composite(
				this.startPosition.x > this.endPosition.x ? 0 : midPoint.x,
				this.startPosition.y > this.endPosition.y ? 0 : midPoint.y,
				endLine.render(className)
			);
		}

		return buffer;
	}

	override isOn(x: number, y: number) {
		this.updateDimensions();

		const localX = x - this.position.x;
		const localY = y - this.position.y;

		if (this.startPosition.x == this.endPosition.x || this.startPosition.y == this.endPosition.y) {
			const line = new Line(
				this.startPosition.x - this.position.x,
				this.startPosition.y - this.position.y,
				this.endPosition.x - this.position.x,
				this.endPosition.y - this.position.y
			);
			line.startArrow = this.startArrow;
			line.endArrow = this.endArrow;
			line.direction = this.direction;
			return line.isOn(localX, localY);
		} else {
			const midPoint = new Vector2(Math.floor(this.size.x / 2), Math.floor(this.size.y / 2));

			const startLine = new Line(
				this.startPosition.x - this.position.x,
				this.startPosition.y - this.position.y,
				midPoint.x,
				midPoint.y
			);
			startLine.startArrow = this.startArrow;
			startLine.direction = this.direction;

			const endLine = new Line(
				midPoint.x,
				midPoint.y,
				this.endPosition.x - this.position.x,
				this.endPosition.y - this.position.y
			);
			endLine.endArrow = this.endArrow;
			endLine.direction = this.direction;
			endLine.toggleDirection();
			return startLine.isOn(localX, localY) || endLine.isOn(localX, localY);
		}
	}

	interact(cursor: Vector2, event: KeyboardEvent): boolean {
		return false;
	}

	static serialize(input: Connector): string {
		return JSON.stringify({
			_type: 'Connector',
			startPosition: input.startPosition,
			endPosition: input.endPosition,
			startArrow: input.startArrow,
			endArrow: input.endArrow,
			direction: input.direction
		});
	}

	static deserialize(input: string): Connector | null {
		const json = JSON.parse(input);
		if (json['_type'] === 'Connector') {
			const connector = new Connector(
				json['startPosition']['x'],
				json['startPosition']['y'],
				json['endPosition']['x'],
				json['endPosition']['y']
			);
			connector.startArrow = json['startArrow'];
			connector.endArrow = json['endArrow'];
			connector.direction = json['direction'];
			return connector;
		}
		return null;
	}
}
