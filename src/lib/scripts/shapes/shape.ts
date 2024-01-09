/* eslint-disable @typescript-eslint/no-unused-vars */
import type Buffer from '../buffer';
import type { Command } from '../commands';
import type {
	BindableInt,
	STATIC_TYPES,
	Value,
	SerializedBindable,
	BindingList
} from '../dataType';

export const FRAME_CHARS = [
	[
		//no top
		[
			//no bottom
			['*', '\u2576'], //no left
			['\u2574', '\u2500'] //thin left
		],

		[
			//thin bottom
			['\u2577', '\u256d'], //no left
			['\u256e', '\u252c'] //thin left
		]
	],

	[
		//thin top
		[
			//no bottom
			['\u2575', '\u2570'], //no left
			['\u256f', '\u2534'] //thin left
		],

		[
			//thin bottom
			['\u2502', '\u251c'], //no left
			['\u2524', '\u253c'] //thin left
		]
	]
];

export enum LineDirection {
	Y_FIRST,
	X_FIRST
}

export enum Side {
	LEFT,
	RIGHT
}

export type Bindings = {
	[index: string]: {
		propertyName: string;
		gettable: boolean;
		settable: boolean;
		type: STATIC_TYPES;
	};
};

export abstract class Shape {
	abstract positionX: BindableInt;
	abstract positionY: BindableInt;
	abstract width: BindableInt;
	abstract height: BindableInt;
	/**
	 * The binding that the shape has. They can (and should) be namespaced with slashes ("position/x")
	 */
	abstract readonly bindings: BindingList;
	abstract shouldRemove: boolean;
	abstract readonly id: string;

	abstract render(className: string): Buffer;
	abstract input(cursorX: number, cursorY: number, event: KeyboardEvent): boolean; // Returns true if the key did something, false otherwise.
	abstract move(cursorX: number, cursorY: number, deltaX: number, deltaY: number): void;
	/**
	 * Runs when a user emits a keyboard event while in edit mode with the shape selected
	 * @param cursor The cursor position
	 * @param event The keyboard event
	 * @returns `true` if the keyboard event had any effect on the shape
	 */
	abstract interact(cursorX: number, cursorY: number, event: KeyboardEvent): boolean;
	abstract isOn(x: number, y: number): boolean;
	// abstract getAttribute(name: string): CommandOutput;
	static serialize(input: Shape): SerializedShape {
		return { _type: 'Shape', id: '$' };
	}
	static deserialize(input: SerializedShape): Shape | null {
		return null;
	}
}

export type SerializedShape = {
	_type: string;
	id: string;
	[index: string]:
		| string
		| number
		| boolean
		| Command
		| SerializedBindable<string>
		| SerializedBindable<number>
		| SerializedBindable<boolean>;
};
