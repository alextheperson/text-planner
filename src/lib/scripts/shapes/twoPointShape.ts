/* eslint-disable @typescript-eslint/no-unused-vars */
import { wp } from '$lib/components/stores';
import Buffer from '../buffer';
import type { Command } from '../commands';
import {
	BindableInt,
	STATIC_TYPES,
	Value,
	type BindableValue,
	type SerializedBindable,
	Binding,
	type BindingList
} from '../dataType';
import type { Bindings, SerializedShape, Shape } from './shape';

export class TwoPointShape implements Shape {
	// TODO: Make these getters
	positionX: BindableInt = new BindableInt(0);
	positionY: BindableInt = new BindableInt(0);
	width: BindableInt = new BindableInt(0);
	height: BindableInt = new BindableInt(0);
	shouldRemove = false;
	readonly id: string;

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
		)
	];

	startX: BindableInt;
	startY: BindableInt;
	endX: BindableInt;
	endY: BindableInt;

	constructor(
		startX: BindableInt,
		startY: BindableInt,
		endX: BindableInt,
		endY: BindableInt,
		id: string
	) {
		this.startX = startX;
		this.startY = startY;
		this.endX = endX;
		this.endY = endY;

		this.id = id;

		this.updateDimensions();
	}

	updateDimensions() {
		this.positionX.value = Math.min(this.startX.value, this.endX.value);
		this.positionY.value = Math.min(this.startY.value, this.endY.value);

		this.width.value = Math.abs(this.endX.value - this.startX.value) + 1;
		this.height.value = Math.abs(this.endY.value - this.startY.value) + 1;
	}

	move(cursorX: number, cursorY: number, deltaX: number, deltaY: number) {
		const moveEnd = cursorX !== this.startX.value || cursorY !== this.startY.value;
		const moveStart = cursorX !== this.endX.value || cursorY !== this.endY.value;
		if (moveEnd) {
			this.endX.value += deltaX;
			this.endY.value += deltaY;
		}
		if (moveStart) {
			this.startX.value += deltaX;
			this.startY.value += deltaY;
		}
		wp.moveCursor(deltaX, deltaY);
		this.updateDimensions();
	}

	render(className: string) {
		this.updateDimensions();
		const buffer = new Buffer(this.width.value, this.height.value, '');
		buffer.setChar(0, 0, '*', className);
		buffer.setChar(this.width.value - 1, 0, '*', className);
		buffer.setChar(0, this.height.value - 1, '*', className);
		buffer.setChar(this.width.value - 1, this.height.value - 1, '*', className);
		return buffer;
	}

	isOn(x: number, y: number) {
		this.updateDimensions();

		const localX = x - this.positionX.value;
		const localY = y - this.positionY.value;

		return localX >= 0 && localX < this.width.value && localY >= 0 && localY < this.height.value;
	}

	input(cursorX: number, cursorY: number, event: KeyboardEvent) {
		return false;
	}

	interact(cursorX: number, cursorY: number, event: KeyboardEvent): boolean {
		return false;
	}

	static serialize(input: TwoPointShape): SerializedShape {
		return {
			_type: 'TwoPointShape',
			id: input.id,
			startX: input.startX.serialize(),
			startY: input.startY.serialize(),
			endX: input.endX.serialize(),
			endY: input.endY.serialize()
		};
	}

	static deserialize(input: SerializedShape): TwoPointShape | null {
		if (input['_type'] === 'TwoPointShape') {
			return new TwoPointShape(
				BindableInt.deserialize(input['startX'] as SerializedBindable<number>),
				BindableInt.deserialize(input['startY'] as SerializedBindable<number>),
				BindableInt.deserialize(input['endX'] as SerializedBindable<number>),
				BindableInt.deserialize(input['endY'] as SerializedBindable<number>),
				input['id'] as string
			);
		}
		return null;
	}
}
