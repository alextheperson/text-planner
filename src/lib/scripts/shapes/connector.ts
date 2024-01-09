/* eslint-disable @typescript-eslint/no-unused-vars */
import Buffer from '../buffer';
import {
	BindableBool,
	BindableInt,
	STATIC_TYPES,
	type BindingList,
	type SerializedBindable,
	Binding,
	Value,
	BindableString
} from '../dataType';
import { workspace as ws } from '../workspace';
import { Line } from './line';
import type { Bindings, LineDirection, SerializedShape, Shape } from './shape';
import { TextBox } from './textbox';

export class Connector extends Line implements Shape {
	readonly bindings: BindingList = [
		new Binding(
			'start/x',
			STATIC_TYPES.INT,
			() => {
				return new Value(this.startX.value, STATIC_TYPES.INT);
			},
			(val) => {
				this.startX.bind(val);
			}
		),
		new Binding(
			'start/y',
			STATIC_TYPES.INT,
			() => {
				return new Value(this.startY.value, STATIC_TYPES.INT);
			},
			(val) => {
				this.startY.bind(val);
			}
		),
		new Binding(
			'end/x',
			STATIC_TYPES.INT,
			() => {
				return new Value(this.endX.value, STATIC_TYPES.INT);
			},
			(val) => {
				this.endX.bind(val);
			}
		),
		new Binding(
			'end/y',
			STATIC_TYPES.INT,
			() => {
				return new Value(this.endY.value, STATIC_TYPES.INT);
			},
			(val) => {
				this.endY.bind(val);
			}
		),
		new Binding('midpoint/x', STATIC_TYPES.INT, () => {
			return new Value(Math.floor((this.positionX.value + this.width.value) / 2), STATIC_TYPES.INT);
		}),
		new Binding('midpoint/y', STATIC_TYPES.INT, () => {
			return new Value(
				Math.floor((this.positionY.value + this.height.value) / 2),
				STATIC_TYPES.INT
			);
		})
	];
	constructor(
		startX: BindableInt,
		startY: BindableInt,
		endX: BindableInt,
		endY: BindableInt,
		id: string
	) {
		super(startX, startY, endX, endY, id);

		console.log(startX, startY, endX, endY);
	}

	override render(className: string) {
		this.updateDimensions();
		const buffer = new Buffer(this.width.value, this.height.value, '');

		if (this.startX.value == this.endX.value || this.startY.value == this.endY.value) {
			const line = new Line(
				new BindableInt(this.startX.value - this.positionX.value),
				new BindableInt(this.startY.value - this.positionY.value),
				new BindableInt(this.endX.value - this.positionX.value),
				new BindableInt(this.endY.value - this.positionY.value),
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
				new BindableInt(this.startX.value - this.positionX.value),
				new BindableInt(this.startY.value - this.positionY.value),
				new BindableInt(midPointX),
				new BindableInt(midPointY),
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
				new BindableInt(midPointX),
				new BindableInt(midPointY),
				new BindableInt(this.endX.value - this.positionX.value),
				new BindableInt(this.endY.value - this.positionY.value),
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

			buffer.composite(
				midPointX,
				midPointY,
				new TextBox(
					new BindableInt(0),
					new BindableInt(0),
					new BindableString('•'),
					ws.getId()
				).render('')
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
				new BindableInt(this.startX.value - this.positionX.value),
				new BindableInt(this.startY.value - this.positionY.value),
				new BindableInt(this.endX.value - this.positionX.value),
				new BindableInt(this.endY.value - this.positionY.value),
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
				new BindableInt(this.startX.value - this.positionX.value),
				new BindableInt(this.startY.value - this.positionY.value),
				new BindableInt(midPointX),
				new BindableInt(midPointY),
				''
			);
			startLine.startArrow = this.startArrow;
			startLine.direction = this.direction;

			const endLine = new Line(
				new BindableInt(midPointX),
				new BindableInt(midPointY),
				new BindableInt(this.endX.value - this.positionX.value),
				new BindableInt(this.endY.value - this.positionY.value),
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
			startX: input.startX.serialize(),
			startY: input.startY.serialize(),
			endX: input.endX.serialize(),
			endY: input.endY.serialize(),
			startArrow: input.startArrow.serialize(),
			endArrow: input.endArrow.serialize(),
			direction: input.direction
		};
	}

	static deserialize(input: SerializedShape): Connector | null {
		if (input['_type'] === 'Connector') {
			const connector = new Connector(
				BindableInt.deserialize(input['startX'] as SerializedBindable<number>),
				BindableInt.deserialize(input['startY'] as SerializedBindable<number>),
				BindableInt.deserialize(input['endX'] as SerializedBindable<number>),
				BindableInt.deserialize(input['endY'] as SerializedBindable<number>),
				input['id'] as string
			);
			connector.startArrow = BindableBool.deserialize(
				input['startArrow'] as SerializedBindable<boolean>
			);
			connector.endArrow = BindableBool.deserialize(
				input['endArrow'] as SerializedBindable<boolean>
			);
			connector.direction = input['direction'] as LineDirection;
			return connector;
		}
		return null;
	}
}
