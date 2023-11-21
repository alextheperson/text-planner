import type { Command } from './commands';
import type { Shape } from './shapes/shape';
import type Vector2 from './vector';

export type DataType = STATIC_TYPES | string[];

export enum STATIC_TYPES {
	STRING,
	INT,
	FLOAT,
	ARRAY,
	VECTOR,
	SHAPE,
	COMMAND,
	NULL
}

export class Value {
	value: string | number | Value[] | Vector2 | Shape | Command | null;
	type: STATIC_TYPES;
	constructor(
		value: string | number | Value[] | Vector2 | Shape | Command | null,
		type: STATIC_TYPES
	) {
		this.value = value;
		this.type = type;
	}
}

export class Int {
	val: number;
	constructor(val: number) {
		this.val = Math.floor(val);
	}
}
