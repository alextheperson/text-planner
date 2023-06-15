/* eslint-disable @typescript-eslint/no-unused-vars */
import type Buffer from '../buffer';
import type { Value } from '../commands/command-definition';
import type Vector2 from '../vector';

const FRAME_CHARS = [
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

enum LineDirection {
	Y_FIRST,
	X_FIRST
}

enum Side {
	LEFT,
	RIGHT
}

export abstract class Shape {
	abstract position: Vector2;
	abstract size: Vector2;
	abstract shouldRemove: boolean;
	abstract readonly id: number;

	abstract render(className: string): Buffer;
	abstract input(cursor: Vector2, event: KeyboardEvent): boolean; // Returns true if the key did something, false otherwise.
	abstract move(cursor: Vector2, movement: Vector2): void;
	abstract interact(cursor: Vector2, event: KeyboardEvent): boolean; // Returns true if the key did something, false otherwise. Run during the view mode.
	abstract isOn(x: number, y: number): boolean;
	// abstract getAttribute(name: string): CommandOutput;
	static serialize(input: Shape): string {
		return '{_type: "Shape"}';
	}
	static deserialize(input: string): Shape | null {
		return null;
	}
}

export { FRAME_CHARS, LineDirection, Side };
