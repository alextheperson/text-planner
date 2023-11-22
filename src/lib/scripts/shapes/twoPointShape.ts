/* eslint-disable @typescript-eslint/no-unused-vars */
import { wp } from '$lib/components/stores';
import Buffer from '../buffer';
import type { Command } from '../commands';
import { BindableInt, STATIC_TYPES, Value, type BindableValue } from '../dataType';
import type { Bindings, SerializedShape, Shape } from './shape';

export class TwoPointShape implements Shape {
	// TODO: Make these getters
	positionX: BindableInt = new BindableInt(0);
	positionY: BindableInt = new BindableInt(0);
	width: BindableInt = new BindableInt(0);
	height: BindableInt = new BindableInt(0);
	shouldRemove = false;
	readonly id: string;

	readonly bindings: Bindings = {
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
		}
	};

	startX: BindableInt;
	startY: BindableInt;
	endX: BindableInt;
	endY: BindableInt;

	constructor(startX: number, startY: number, endX: number, endY: number, id: string) {
		this.startX = new BindableInt(startX);
		this.startY = new BindableInt(startY);
		this.endX = new BindableInt(endX);
		this.endY = new BindableInt(endY);

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
		if (cursorX !== this.startX.value || cursorY !== this.startY.value) {
			this.startX.value += deltaX;
			this.startY.value += deltaY;
			wp.moveCursor(deltaX, deltaY);
		}
		if (cursorX !== this.endX.value || cursorY !== this.endY.value) {
			this.endX.value += deltaX;
			this.endY.value += deltaY;
			wp.moveCursor(deltaX, deltaY);
		}

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

	getBinding(name: string): Value {
		const propertyName = this.bindings[name]['propertyName'] as keyof TwoPointShape;
		if (propertyName === undefined) {
			throw new Error(`This item does not have a binding called '${name}'`);
		}
		return new Value((this[propertyName] as BindableInt).value, this.bindings[name]['type']);
	}

	setBinding(name: string, command: Command): void {
		const propertyName = this.bindings[name]['propertyName'] as keyof TwoPointShape;
		if (propertyName === undefined) {
			throw new Error(`This item does not have a binding called '${name}'`);
		}
		(this[propertyName] as BindableInt).bind(command);
	}

	static serialize(input: TwoPointShape): SerializedShape {
		return {
			_type: 'TwoPointShape',
			id: input.id,
			startX: input.startX.value,
			startY: input.startY.value,
			endX: input.endX.value,
			endY: input.endY.value
		};
	}

	static deserialize(input: SerializedShape): TwoPointShape | null {
		if (input['_type'] === 'TwoPointShape') {
			return new TwoPointShape(
				input['startX'] as number,
				input['startY'] as number,
				input['endX'] as number,
				input['endY'] as number,
				input['id'] as string
			);
		}
		return null;
	}
}
