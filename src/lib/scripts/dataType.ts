import type { Command } from './commands';
import type { Shape } from './shapes/shape';

export type DataType = STATIC_TYPES | string[];

export enum STATIC_TYPES {
	STRING,
	INT,
	FLOAT,
	BOOLEAN,
	SHAPE,
	COMMAND,
	NULL
}

export class Value {
	value: string | number | boolean | Shape | Command | null;
	type: STATIC_TYPES;
	constructor(value: string | number | boolean | Shape | Command | null, type: STATIC_TYPES) {
		this.value = value;
		this.type = type;
	}
}

export interface BindableValue<t> {
	setValue(value: t): void;
	bind(command: Command): void;
	get value(): t;
	set value(t);
}

export class BindableInt implements BindableValue<number> {
	staticValue: number;
	command: Command | null;

	constructor(value: number, command?: Command | undefined) {
		this.staticValue = value;
		if (command !== undefined) {
			this.command = command;
		} else {
			this.command = null;
		}
	}

	setValue(value: number): void {
		this.staticValue = value;
		this.command = null;
	}

	bind(command: Command): void {
		this.command = command;
	}

	get value() {
		if (this.command !== null) {
			const result = this.command.execute();
			if (typeof result.value === 'number' && result.type === STATIC_TYPES.INT) {
				return result.value;
			}
			throw new Error(`Bound Command did not return type ${STATIC_TYPES.INT}`);
		}
		return this.staticValue;
	}

	set value(value: number) {
		this.setValue(value);
	}
}

export class BindableString implements BindableValue<string> {
	staticValue: string;
	command: Command | null;

	constructor(value: string, command?: Command | undefined) {
		this.staticValue = value;
		if (command !== undefined) {
			this.command = command;
		} else {
			this.command = null;
		}
	}

	setValue(value: string): void {
		this.staticValue = value;
		this.command = null;
	}

	bind(command: Command): void {
		this.command = command;
	}

	get value() {
		if (this.command !== null) {
			const result = this.command.execute();
			if (typeof result.value === 'string' && result.type === STATIC_TYPES.INT) {
				return result.value;
			}
			throw new Error(`Bound Command did not return type ${STATIC_TYPES.INT}`);
		}
		return this.staticValue;
	}

	set value(value: string) {
		this.setValue(value);
	}
}

export class BindableBool implements BindableValue<boolean> {
	staticValue: boolean;
	command: Command | null;

	constructor(value: boolean, command?: Command | undefined) {
		this.staticValue = value;
		if (command !== undefined) {
			this.command = command;
		} else {
			this.command = null;
		}
	}

	setValue(value: boolean): void {
		this.staticValue = value;
		this.command = null;
	}

	bind(command: Command): void {
		this.command = command;
	}

	get value() {
		if (this.command !== null) {
			const result = this.command.execute();
			if (typeof result.value === 'boolean' && result.type === STATIC_TYPES.BOOLEAN) {
				return result.value;
			}
			throw new Error(`Bound Command did not return type ${STATIC_TYPES.BOOLEAN}`);
		}
		return this.staticValue;
	}

	set value(value: boolean) {
		this.setValue(value);
	}
}
