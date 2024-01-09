/* eslint-disable @typescript-eslint/no-unused-vars */
import Buffer from '../buffer';
import { BindableBool, BindableInt, STATIC_TYPES, type SerializedBindable } from '../dataType';
import { keymap } from '../keymap';
import type { Bindings, SerializedShape, Shape } from './shape';
import { FRAME_CHARS, LineDirection } from './shape';
import { TwoPointShape } from './twoPointShape';

export class Line extends TwoPointShape implements Shape {
	// bindings: Bindings = {
	// 	'start/x': {
	// 		propertyName: 'startX',
	// 		gettable: true,
	// 		settable: true,
	// 		type: STATIC_TYPES.INT
	// 	},
	// 	'start/y': {
	// 		propertyName: 'startY',
	// 		gettable: true,
	// 		settable: true,
	// 		type: STATIC_TYPES.INT
	// 	},
	// 	'end/x': {
	// 		propertyName: 'endX',
	// 		gettable: true,
	// 		settable: true,
	// 		type: STATIC_TYPES.INT
	// 	},
	// 	'end/y': {
	// 		propertyName: 'endY',
	// 		gettable: true,
	// 		settable: true,
	// 		type: STATIC_TYPES.INT
	// 	}
	// };

	startArrow = new BindableBool(false);
	endArrow = new BindableBool(false);

	direction = LineDirection.X_FIRST;
	shouldRemove = false;

	constructor(
		startX: BindableInt,
		startY: BindableInt,
		endX: BindableInt,
		endY: BindableInt,
		id: string
	) {
		super(startX, startY, endX, endY, id);
	}

	toggleDirection() {
		if (this.direction === LineDirection.X_FIRST) {
			this.direction = LineDirection.Y_FIRST;
		} else {
			this.direction = LineDirection.X_FIRST;
		}
	}
	toggleStartArrow() {
		this.startArrow.value = !this.startArrow.value;
	}
	toggleEndArrow() {
		this.endArrow.value = !this.endArrow.value;
	}

	override render(className: string) {
		this.updateDimensions();
		const buffer = new Buffer(this.width.value, this.height.value, '');

		const midPointX =
			this.direction === LineDirection.X_FIRST
				? this.endX.value - this.positionX.value
				: this.startX.value - this.positionX.value;
		const midPointY =
			this.direction === LineDirection.Y_FIRST
				? this.endY.value - this.positionY.value
				: this.startY.value - this.positionY.value;

		for (let i = 0; i < this.width.value; i++) {
			buffer.setChar(
				i,
				this.direction === LineDirection.Y_FIRST
					? this.endY.value - this.positionY.value
					: this.startY.value - this.positionY.value,
				FRAME_CHARS[0][0][1][1],
				className
			);
		}

		for (let i = 0; i < this.height.value; i++) {
			buffer.setChar(
				this.direction === LineDirection.X_FIRST
					? this.endX.value - this.positionX.value
					: this.startX.value - this.positionX.value,
				i,
				FRAME_CHARS[1][1][0][0],
				className
			);
		}

		buffer.setChar(
			midPointX,
			midPointY,
			FRAME_CHARS[
				this.startY.value >= this.endY.value === (this.direction === LineDirection.X_FIRST) ? 1 : 0
			][
				this.startY.value <= this.endY.value === (this.direction === LineDirection.X_FIRST) ? 1 : 0
			][
				this.startX.value <= this.endX.value === (this.direction === LineDirection.X_FIRST) ? 1 : 0
			][
				this.startX.value >= this.endX.value === (this.direction === LineDirection.X_FIRST) ? 1 : 0
			],
			className
		);

		if (this.startArrow.value === true) {
			const startCharacter =
				(this.startX.value !== this.endX.value && this.direction === LineDirection.X_FIRST) ||
				(this.startY.value === this.endY.value && this.direction === LineDirection.Y_FIRST)
					? this.startX.value < this.endX.value
						? '\u2190'
						: '\u2192'
					: this.startY.value < this.endY.value
					? '\u2227' //'\u2191'
					: '\u2228';
			buffer.setChar(
				this.startX.value - this.positionX.value,
				this.startY.value - this.positionY.value,
				startCharacter,
				className
			);
		}
		if (this.endArrow.value === true) {
			const endCharacter =
				(this.startX.value !== this.endX.value && this.direction === LineDirection.Y_FIRST) ||
				(this.startY.value === this.endY.value && this.direction === LineDirection.X_FIRST)
					? this.startX.value >= this.endX.value
						? '\u2190'
						: '\u2192'
					: this.startY.value >= this.endY.value
					? '\u2227' //'\u2191'
					: '\u2228';
			buffer.setChar(
				this.endX.value - this.positionX.value,
				this.endY.value - this.positionY.value,
				endCharacter,
				className
			);
		}

		return buffer;
	}

	override isOn(x: number, y: number) {
		this.updateDimensions();

		const localX = x - this.positionX.value;
		const localY = y - this.positionY.value;

		if (
			(localX < 0 ||
				localX >= this.width.value ||
				localY !=
					(this.direction == LineDirection.Y_FIRST
						? this.endY.value - this.positionY.value
						: this.startY.value - this.positionY.value)) &&
			(localY < 0 ||
				localY >= this.height.value ||
				localX !=
					(this.direction == LineDirection.X_FIRST
						? this.endX.value - this.positionX.value
						: this.startX.value - this.positionX.value))
		) {
			return false;
		}

		return true;
	}

	override input(cursorX: number, cursorY: number, event: KeyboardEvent) {
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

	interact(cursorX: number, cursorY: number, event: KeyboardEvent): boolean {
		return false;
	}

	static serialize(input: Line): SerializedShape {
		return {
			_type: 'Line',
			id: input.id,
			startX: input.startX.serialize(),
			startY: input.startY.serialize(),
			endX: input.endX.serialize(),
			endY: input.endY.serialize(),
			endArrow: input.endArrow.serialize(),
			direction: input.direction
		};
	}

	static deserialize(input: SerializedShape): Line | null {
		if (input['_type'] === 'Line') {
			const line = new Line(
				BindableInt.deserialize(input['startX'] as SerializedBindable<number>),
				BindableInt.deserialize(input['startY'] as SerializedBindable<number>),
				BindableInt.deserialize(input['endX'] as SerializedBindable<number>),
				BindableInt.deserialize(input['endY'] as SerializedBindable<number>),
				input['id'] as string
			);
			line.startArrow = BindableBool.deserialize(
				input['startArrow'] as SerializedBindable<boolean>
			);
			line.endArrow = BindableBool.deserialize(input['endArrow'] as SerializedBindable<boolean>);
			line.direction = input['direction'] as LineDirection;
			return line;
		}
		return null;
	}
}
