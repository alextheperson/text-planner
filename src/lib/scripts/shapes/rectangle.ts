/* eslint-disable @typescript-eslint/no-unused-vars */
import { wp } from '$lib/components/stores';
import Buffer from '../buffer';
import { STATIC_TYPES } from '../dataType';
import type { Bindings, SerializedShape, Shape } from './shape';
import { FRAME_CHARS } from './shape';
import { TwoPointShape } from './twoPointShape';

export class Rectangle extends TwoPointShape implements Shape {
	readonly bindings: Bindings = {
		'corners/topLeft/x': {
			propertyName: 'topLeftCornerX',
			gettable: true,
			settable: true,
			type: STATIC_TYPES.INT
		},
		'corners/topLeft/y': {
			propertyName: 'topLeftCornerY',
			gettable: true,
			settable: true,
			type: STATIC_TYPES.INT
		},
		'corners/topRight/x': {
			propertyName: 'topLeftCornerX',
			gettable: true,
			settable: false,
			type: STATIC_TYPES.INT
		},
		'corners/topRight/y': {
			propertyName: 'topLeftCornerY',
			gettable: true,
			settable: false,
			type: STATIC_TYPES.INT
		},
		'corners/bottomLeft/x': {
			propertyName: 'topLeftCornerX',
			gettable: true,
			settable: false,
			type: STATIC_TYPES.INT
		},
		'corners/bottomLeft/y': {
			propertyName: 'topLeftCornerY',
			gettable: true,
			settable: false,
			type: STATIC_TYPES.INT
		},
		'corners/bottomRight/x': {
			propertyName: 'topLeftCornerX',
			gettable: true,
			settable: true,
			type: STATIC_TYPES.INT
		},
		'corners/bottomRight/y': {
			propertyName: 'topLeftCornerY',
			gettable: true,
			settable: true,
			type: STATIC_TYPES.INT
		},
		'midpoint/top/x': {
			propertyName: 'topMidpointX',
			gettable: true,
			settable: false,
			type: STATIC_TYPES.INT
		},
		'midpoint/top/y': {
			propertyName: 'topMidpointY',
			gettable: true,
			settable: false,
			type: STATIC_TYPES.INT
		},
		'midpoint/bottom/x': {
			propertyName: 'bottomMidpointX',
			gettable: true,
			settable: false,
			type: STATIC_TYPES.INT
		},
		'midpoint/bottom/y': {
			propertyName: 'bottomMidpointY',
			gettable: true,
			settable: false,
			type: STATIC_TYPES.INT
		},
		'midpoint/left/x': {
			propertyName: 'leftMidpointX',
			gettable: true,
			settable: false,
			type: STATIC_TYPES.INT
		},
		'midpoint/left/y': {
			propertyName: 'leftMidpointY',
			gettable: true,
			settable: false,
			type: STATIC_TYPES.INT
		},
		'midpoint/right/x': {
			propertyName: 'rightMidpointX',
			gettable: true,
			settable: false,
			type: STATIC_TYPES.INT
		},
		'midpoint/right/y': {
			propertyName: 'rightMidpointY',
			gettable: true,
			settable: false,
			type: STATIC_TYPES.INT
		}
	};

	constructor(startX: number, startY: number, endX: number, endY: number, id: string) {
		super(startX, startY, endX, endY, id);
	}

	override move(cursorX: number, cursorY: number, deltaX: number, deltaY: number): void {
		if (cursorX === this.startX.value && cursorY === this.startY.value) {
			this.startX.value += deltaX;
			this.startY.value += deltaY;
			wp.moveCursor(deltaX, deltaY);
		} else if (cursorX === this.endX.value && cursorY === this.endY.value) {
			this.endX.value += deltaX;
			this.endY.value += deltaY;
			wp.moveCursor(deltaX, deltaY);
		} else if (cursorX === this.startX.value && cursorY === this.endY.value) {
			this.startX.value += deltaX;
			this.endY.value += deltaY;
			wp.moveCursor(deltaX, deltaY);
		} else if (cursorX === this.endX.value && cursorY === this.startY.value) {
			this.endX.value += deltaX;
			this.startY.value += deltaY;
			wp.moveCursor(deltaX, deltaY);
		} else {
			this.startX.value += deltaX;
			this.startY.value += deltaY;
			this.endX.value += deltaX;
			this.endY.value += deltaY;
			wp.moveCursor(deltaX, deltaY);
		}

		this.updateDimensions();
	}

	override render(className: string) {
		this.updateDimensions();
		const buffer = new Buffer(this.width.value, this.height.value, '');

		if (this.width.value == 1) {
			if (this.height.value == 1) {
				buffer.setChar(0, 0, FRAME_CHARS[0][0][0][0], className);
			} else {
				for (let i = 1; i < this.height.value - 1; i++) {
					buffer.setChar(0, i, FRAME_CHARS[1][1][0][0], className);
				}
				buffer.setChar(0, 0, FRAME_CHARS[0][1][0][0], className);
				buffer.setChar(0, this.height.value - 1, FRAME_CHARS[1][0][0][0], className);
			}
		} else if (this.height.value == 1) {
			for (let i = 1; i < this.width.value - 1; i++) {
				buffer.setChar(i, 0, FRAME_CHARS[0][0][1][1], className);
			}
			buffer.setChar(0, 0, FRAME_CHARS[0][0][0][1], className);
			buffer.setChar(this.width.value - 1, 0, FRAME_CHARS[0][0][1][0], className);
		} else {
			for (let i = 1; i < this.width.value - 1; i++) {
				buffer.setChar(i, 0, FRAME_CHARS[0][0][1][1], className);
				buffer.setChar(i, this.height.value - 1, FRAME_CHARS[0][0][1][1], className);
			}

			for (let i = 1; i < this.height.value - 1; i++) {
				buffer.setChar(0, i, FRAME_CHARS[1][1][0][0], className);
				buffer.setChar(this.width.value - 1, i, FRAME_CHARS[1][1][0][0], className);
			}

			buffer.setChar(0, 0, FRAME_CHARS[0][1][0][1], className);
			buffer.setChar(this.width.value - 1, 0, FRAME_CHARS[0][1][1][0], className);
			buffer.setChar(0, this.height.value - 1, FRAME_CHARS[1][0][0][1], className);
			buffer.setChar(
				this.width.value - 1,
				this.height.value - 1,
				FRAME_CHARS[1][0][1][0],
				className
			);
		}
		return buffer;
	}

	interact(cursorX: number, cursorY: number, event: KeyboardEvent): boolean {
		return false;
	}
	override isOn(x: number, y: number) {
		this.updateDimensions();

		const localX = x - this.positionX.value;
		const localY = y - this.positionY.value;

		return (
			(localX === 0 ||
				localX === this.width.value - 1 ||
				localY === 0 ||
				localY === this.height.value - 1) &&
			super.isOn(x, y)
		);
	}

	get topLeftCornerX(): number {
		return this.positionX.value;
	}
	get topLeftCornerY(): number {
		return this.positionY.value;
	}
	get topRightCornerX(): number {
		return this.positionX.value + this.width.value;
	}
	get topRightCornerY(): number {
		return this.positionY.value + this.height.value;
	}
	get bottomLeftCornerX(): number {
		return this.positionX.value;
	}
	get bottomLeftCornerY(): number {
		return this.positionY.value + this.height.value;
	}
	get bottomRightCornerX(): number {
		return this.positionX.value + this.width.value;
	}
	get bottomRightCornerY(): number {
		return this.positionY.value + this.height.value;
	}

	get topMidpointX(): number {
		return this.positionX.value + Math.floor(this.width.value / 2);
	}
	get topMidpointY(): number {
		return this.positionY.value;
	}
	get bottomMidpointX(): number {
		return this.positionX.value + Math.floor(this.width.value / 2);
	}
	get bottomMidpointY(): number {
		return this.positionY.value + this.height.value;
	}
	get leftMidpointX(): number {
		return this.positionX.value;
	}
	get leftMidpointY(): number {
		return this.positionY.value + Math.floor(this.height.value / 2);
	}
	get rightMidpointX(): number {
		return this.positionX.value + this.width.value;
	}
	get rightMidpointY(): number {
		return this.positionY.value + Math.floor(this.height.value / 2);
	}

	static serialize(input: Rectangle): SerializedShape {
		return {
			_type: 'Rectangle',
			id: input.id,
			startX: input.startX.value,
			startY: input.startY.value,
			endX: input.endX.value,
			endY: input.endY.value
		};
	}

	static deserialize(input: SerializedShape): Rectangle | null {
		if (input['_type'] === 'Rectangle') {
			return new Rectangle(
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
