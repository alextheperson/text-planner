/* eslint-disable @typescript-eslint/no-unused-vars */
import Buffer from '../buffer';
import {
	BindableInt,
	STATIC_TYPES,
	type BindingList,
	type SerializedBindable,
	Binding,
	Value
} from '../dataType';
import { workspace as ws } from '../workspace';
import type { SerializedShape, Shape } from './shape';
import { FRAME_CHARS } from './shape';
import { TwoPointShape } from './twoPointShape';

export class Rectangle extends TwoPointShape implements Shape {
	readonly bindings: BindingList = [
		new Binding(
			'corners/topLeft/x',
			STATIC_TYPES.INT,
			() => {
				return new Value(this.startX.value, STATIC_TYPES.INT);
			},
			(val) => {
				this.startX.bind(val);
			}
		),
		new Binding(
			'corners/topLeft/y',
			STATIC_TYPES.INT,
			() => {
				return new Value(this.startY.value, STATIC_TYPES.INT);
			},
			(val) => {
				this.startY.bind(val);
			}
		),
		new Binding('corners/topRight/x', STATIC_TYPES.INT, () => {
			return new Value(this.endX.value, STATIC_TYPES.INT);
		}),
		new Binding('corners/topRight/y', STATIC_TYPES.INT, () => {
			return new Value(this.startY.value, STATIC_TYPES.INT);
		}),
		new Binding('corners/bottomLeft/x', STATIC_TYPES.INT, () => {
			return new Value(this.startX.value, STATIC_TYPES.INT);
		}),
		new Binding('corners/bottomLeft/y', STATIC_TYPES.INT, () => {
			return new Value(this.endY.value, STATIC_TYPES.INT);
		}),
		new Binding(
			'corners/bottomRight/x',
			STATIC_TYPES.INT,
			() => {
				return new Value(this.endX.value, STATIC_TYPES.INT);
			},
			(val) => {
				this.endX.bind(val);
			}
		),
		new Binding(
			'corners/bottomRight/y',
			STATIC_TYPES.INT,
			() => {
				return new Value(this.endY.value, STATIC_TYPES.INT);
			},
			(val) => {
				this.endY.bind(val);
			}
		),
		new Binding('midpoint/top/x', STATIC_TYPES.INT, () => {
			return new Value(Math.floor((this.startX.value + this.endX.value) / 2), STATIC_TYPES.INT);
		}),
		new Binding('midpoint/top/y', STATIC_TYPES.INT, () => {
			return new Value(this.startY.value - 1, STATIC_TYPES.INT);
		}),
		new Binding('midpoint/bottom/x', STATIC_TYPES.INT, () => {
			return new Value(Math.floor((this.startX.value + this.endX.value) / 2), STATIC_TYPES.INT);
		}),
		new Binding('midpoint/bottom/y', STATIC_TYPES.INT, () => {
			return new Value(this.endY.value + 1, STATIC_TYPES.INT);
		}),
		new Binding('midpoint/left/x', STATIC_TYPES.INT, () => {
			return new Value(this.startX.value - 1, STATIC_TYPES.INT);
		}),
		new Binding('midpoint/left/y', STATIC_TYPES.INT, () => {
			return new Value(Math.floor((this.startY.value + this.endY.value) / 2), STATIC_TYPES.INT);
		}),
		new Binding('midpoint/right/x', STATIC_TYPES.INT, () => {
			return new Value(this.endX.value + 1, STATIC_TYPES.INT);
		}),
		new Binding('midpoint/right/y', STATIC_TYPES.INT, () => {
			return new Value(Math.floor((this.startY.value + this.endY.value) / 2), STATIC_TYPES.INT);
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
	}

	override move(cursorX: number, cursorY: number, deltaX: number, deltaY: number): void {
		if (cursorX === this.startX.value && cursorY === this.startY.value) {
			this.startX.value += deltaX;
			this.startY.value += deltaY;
			ws.currentDocument.moveCursor(deltaX, deltaY);
		} else if (cursorX === this.endX.value && cursorY === this.endY.value) {
			this.endX.value += deltaX;
			this.endY.value += deltaY;
			ws.currentDocument.moveCursor(deltaX, deltaY);
		} else if (cursorX === this.startX.value && cursorY === this.endY.value) {
			this.startX.value += deltaX;
			this.endY.value += deltaY;
			ws.currentDocument.moveCursor(deltaX, deltaY);
		} else if (cursorX === this.endX.value && cursorY === this.startY.value) {
			this.endX.value += deltaX;
			this.startY.value += deltaY;
			ws.currentDocument.moveCursor(deltaX, deltaY);
		} else {
			this.startX.value += deltaX;
			this.startY.value += deltaY;
			this.endX.value += deltaX;
			this.endY.value += deltaY;
			ws.currentDocument.moveCursor(deltaX, deltaY);
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

	get topLeftCornerX(): BindableInt {
		return this.startX;
	}
	set topLeftCornerX(val: number) {
		this.startX.value = val + 1;
	}
	get topLeftCornerY(): BindableInt {
		return this.startY;
	}
	set topLeftCornerY(val: number) {
		this.startY.value = val + 1;
	}
	get topRightCornerX(): BindableInt {
		return new BindableInt(this.positionX.value + this.width.value);
	}
	// set topRightCornerX(val: number) {
	// 	return this.positionX.value + this.width.value;
	// }
	get topRightCornerY(): BindableInt {
		return new BindableInt(this.positionY.value + this.height.value);
	}
	// set topRightCornerY(val: number) {
	// 	return this.positionY.value + this.height.value;
	// }
	get bottomLeftCornerX(): BindableInt {
		return new BindableInt(this.positionX.value);
	}
	// set bottomLeftCornerX(val: number) {
	// 	return this.positionX.value;
	// }
	get bottomLeftCornerY(): BindableInt {
		return new BindableInt(this.positionY.value + this.height.value);
	}
	// set bottomLeftCornerY(val: number) {
	// 	return this.positionY.value + this.height.value;
	// }
	get bottomRightCornerX(): BindableInt {
		return this.endX;
	}
	set bottomRightCornerX(val: number) {
		this.endY.value = val;
	}
	get bottomRightCornerY(): BindableInt {
		return this.endY;
	}
	set bottomRightCornerY(val: number) {
		this.endY.value = val;
	}

	get topMidpointX(): BindableInt {
		return new BindableInt(this.positionX.value + Math.floor(this.width.value / 2));
	}
	get topMidpointY(): BindableInt {
		return new BindableInt(this.positionY.value - 1);
	}
	get bottomMidpointX(): BindableInt {
		return new BindableInt(this.positionX.value + Math.floor(this.width.value / 2));
	}
	get bottomMidpointY(): BindableInt {
		return new BindableInt(this.positionY.value + this.height.value);
	}
	get leftMidpointX(): BindableInt {
		return new BindableInt(this.positionX.value - 1);
	}
	get leftMidpointY(): BindableInt {
		return new BindableInt(this.positionY.value + Math.floor(this.height.value / 2));
	}
	get rightMidpointX(): BindableInt {
		return new BindableInt(this.positionX.value + this.width.value);
	}
	get rightMidpointY(): BindableInt {
		return new BindableInt(this.positionY.value + Math.floor(this.height.value / 2));
	}

	static serialize(input: Rectangle): SerializedShape {
		return {
			_type: 'Rectangle',
			id: input.id,
			startX: input.startX.serialize(),
			startY: input.startY.serialize(),
			endX: input.endX.serialize(),
			endY: input.endY.serialize()
		};
	}

	static deserialize(input: SerializedShape): Rectangle | null {
		if (input['_type'] === 'Rectangle') {
			return new Rectangle(
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
