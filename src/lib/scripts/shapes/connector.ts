/* eslint-disable @typescript-eslint/no-unused-vars */
import Buffer from '../buffer';
import { BindableBool, STATIC_TYPES } from '../dataType';
import { Line } from './line';
import type { Bindings, LineDirection, SerializedShape, Shape } from './shape';

export class Connector extends Line implements Shape {
	bindings: Bindings = {
		'start/x': {
			propertyName: 'startX',
			gettable: true,
			settable: true,
			type: STATIC_TYPES.INT
		},
		'start/y': {
			propertyName: 'startY',
			gettable: true,
			settable: true,
			type: STATIC_TYPES.INT
		},
		'end/x': {
			propertyName: 'endX',
			gettable: true,
			settable: true,
			type: STATIC_TYPES.INT
		},
		'end/y': {
			propertyName: 'endY',
			gettable: true,
			settable: true,
			type: STATIC_TYPES.INT
		},
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
		}
	};
	constructor(startX: number, startY: number, endX: number, endY: number, id: string) {
		super(startX, startY, endX, endY, id);

		console.log(startX, startY, endX, endY);
	}

	override render(className: string) {
		this.updateDimensions();
		const buffer = new Buffer(this.width.value, this.height.value, '');

		if (this.startX.value == this.endX.value || this.startY.value == this.endY.value) {
			const line = new Line(
				this.startX.value - this.positionX.value,
				this.startY.value - this.positionY.value,
				this.endX.value - this.positionX.value,
				this.endY.value - this.positionY.value,
				''
			);
			line.startArrow = this.startArrow;
			line.endArrow = this.endArrow;
			line.direction = this.direction;
			buffer.composite(0, 0, line.render(className));
		} else {
			const midPointX = Math.floor(this.width.value / 2);
			const midPointY = Math.floor(this.height.value / 2);

			const startLine = new Line(
				this.startX.value - this.positionX.value,
				this.startY.value - this.positionY.value,
				midPointX,
				midPointY,
				''
			);
			startLine.startArrow = this.startArrow;
			startLine.direction = this.direction;
			buffer.composite(
				this.startX.value < this.endX.value ? 0 : midPointX,
				this.startY.value < this.endY.value ? 0 : midPointY,
				startLine.render(className)
			);

			const endLine = new Line(
				midPointX,
				midPointY,
				this.endX.value - this.positionX.value,
				this.endY.value - this.positionY.value,
				''
			);
			endLine.endArrow = this.endArrow;
			endLine.direction = this.direction;
			endLine.toggleDirection();
			buffer.composite(
				this.startX.value > this.endX.value ? 0 : midPointX,
				this.startY.value > this.endY.value ? 0 : midPointY,
				endLine.render(className)
			);
		}

		return buffer;
	}

	override isOn(x: number, y: number) {
		this.updateDimensions();

		const localX = x - this.positionX.value;
		const localY = y - this.positionY.value;

		if (this.startX.value == this.endX.value || this.startY.value == this.endY.value) {
			const line = new Line(
				this.startX.value - this.positionX.value,
				this.startY.value - this.positionY.value,
				this.endX.value - this.positionX.value,
				this.endY.value - this.positionY.value,
				''
			);
			line.startArrow = this.startArrow;
			line.endArrow = this.endArrow;
			line.direction = this.direction;
			return line.isOn(localX, localY);
		} else {
			const midPointX = Math.floor(this.width.value / 2);
			const midPointY = Math.floor(this.height.value / 2);

			const startLine = new Line(
				this.startX.value - this.positionX.value,
				this.startY.value - this.positionY.value,
				midPointX,
				midPointY,
				''
			);
			startLine.startArrow = this.startArrow;
			startLine.direction = this.direction;

			const endLine = new Line(
				midPointX,
				midPointY,
				this.endX.value - this.positionX.value,
				this.endY.value - this.positionY.value,
				''
			);
			endLine.endArrow = this.endArrow;
			endLine.direction = this.direction;
			endLine.toggleDirection();
			return startLine.isOn(localX, localY) || endLine.isOn(localX, localY);
		}
	}

	interact(cursorX: number, cursorY: number, event: KeyboardEvent): boolean {
		return false;
	}

	get midpointX(): number {
		return Math.floor(this.width.value / 2);
	}

	get midpointY(): number {
		return Math.floor(this.height.value / 2);
	}

	static serialize(input: Connector): SerializedShape {
		return {
			_type: 'Connector',
			id: input.id,
			startX: input.startX.value,
			startY: input.startY.value,
			endX: input.endX.value,
			endY: input.endY.value,
			startArrow: input.startArrow.value,
			endArrow: input.endArrow.value,
			direction: input.direction
		};
	}

	static deserialize(input: SerializedShape): Connector | null {
		if (input['_type'] === 'Connector') {
			const connector = new Connector(
				input['startX'] as number,
				input['startY'] as number,
				input['endX'] as number,
				input['endY'] as number,
				input['id'] as string
			);
			connector.startArrow = new BindableBool(input['startArrow'] as boolean);
			connector.endArrow = new BindableBool(input['endArrow'] as boolean);
			connector.direction = input['direction'] as LineDirection;
			return connector;
		}
		return null;
	}
}
