import { Command } from './commands';
import type { Shape } from './shapes/shape';
import { workspace as ws } from './workspace';

export type DataType = STATIC_TYPES | string[];

export enum STATIC_TYPES {
	STRING,
	INT,
	FLOAT,
	BOOLEAN,
	SHAPE,
	COMMAND,
	NULL,
	ANY
}

export class Value {
	value: string | number | boolean | Shape | Command | null;
	type: STATIC_TYPES;
	constructor(value: string | number | boolean | Shape | Command | null, type: STATIC_TYPES) {
		this.value = value;
		this.type = type;
	}
}

export class Binding {
	name: string;
	type: STATIC_TYPES;
	setter: ((val: Value | Command | null) => void) | undefined;
	getter: (() => Value) | undefined;

	constructor(
		name: string,
		type: STATIC_TYPES,
		getter?: () => Value,
		setter?: (val: Value | Command | null) => void
	) {
		this.name = name;
		this.type = type;
		this.setter = setter;
		this.getter = getter;
	}

	getValue() {
		if (!this.getter) {
			throw new Error(`Cannot get binding '${this.name}'. It is not gettable`);
		}
		return this.getter();
	}

	setValue(val: Value | Command | null) {
		if (val !== null && !(val instanceof Command) && val.type !== this.type) {
			return new TypeError(
				`Cannot set binding '${this.name}' (type '${STATIC_TYPES[this.type]}') to type '${
					STATIC_TYPES[val.type]
				}'`
			);
		}
		if (!this.setter) {
			throw new Error(`Cannot set binding '${this.name}'. It is not settable`);
		}
		return this.setter(val);
	}

	get gettable() {
		return this.getter !== undefined;
	}

	get settable() {
		return this.setter !== undefined;
	}
}

export type BindingList = Binding[];

export interface BindableValue {
	setValue(value: number | boolean | string): void;
	bind(command: Command): void;
	get value(): number | boolean | string;
	set value(t);
}

export class BindableInt implements BindableValue {
	staticValue: number;
	command: Command | null;
	commandString: string | null;

	constructor(value: number, command?: string) {
		this.staticValue = value;
		if (command !== undefined) {
			this.commandString = command;
			this.command = null;
		} else {
			this.command = null;
			this.commandString = null;
		}
	}

	setValue(value: number): void {
		this.staticValue = value;
	}

	bind(command: Command | Value | null): void {
		if (command instanceof Command) {
			this.command = command;
		} else if (command === null) {
			this.command = null;
		} else if (command.type === STATIC_TYPES.INT) {
			this.setValue(command.value as number);
		} else {
			throw new TypeError(`Cannot set BindableInt to type '${STATIC_TYPES[command.type]}'`);
		}
	}

	get value() {
		if (this.commandString !== null && !ws.isFirstFrame) {
			this.command = Command.deserialize(this.commandString);
			this.commandString = null;
		}
		if (this.command !== null && !ws.isFirstFrame) {
			try {
				const result = this.command.execute();
				if (typeof result.value === 'number' && result.type === STATIC_TYPES.INT) {
					console.log('Evaluated command. Got', result.value);
					return result.value;
				}
			} catch {
				/* empty */
			}
			// throw new Error(
			// 	`Bound Command did not return type <INT>, returned <${STATIC_TYPES[result.type]}> instead.`
			// );
		}
		return this.staticValue;
	}

	set value(value: number) {
		this.setValue(value);
	}

	serialize(): SerializedBindable<number> {
		return {
			staticValue: this.staticValue,
			command: this.command?.serialize() ?? null
		};
	}

	static deserialize(json: SerializedBindable<number>) {
		return new BindableInt(json.staticValue, json.command ?? undefined);
	}
}

export class BindableString implements BindableValue {
	staticValue: string;
	command: Command | null;
	commandString: string | null;

	constructor(value: string, command?: string) {
		this.staticValue = value;
		if (command !== undefined) {
			this.commandString = command;
			this.command = null;
		} else {
			this.command = null;
			this.commandString = null;
		}
	}

	setValue(value: string): void {
		this.staticValue = value;
		// this.command = null;
	}

	bind(command: Command | Value | null): void {
		if (command instanceof Command) {
			this.command = command;
		} else if (command === null) {
			this.command = null;
		} else if (command.type === STATIC_TYPES.STRING) {
			this.setValue(command.value as string);
		} else {
			throw new TypeError(`Cannot set BindableInt to type '${STATIC_TYPES[command.type]}'`);
		}
	}

	get value() {
		if (this.commandString !== null && !ws.isFirstFrame) {
			this.command = Command.deserialize(this.commandString);
			this.commandString = null;
		}
		if (this.command !== null) {
			try {
				const result = this.command.execute();
				if (typeof result.value === 'string' && result.type === STATIC_TYPES.STRING) {
					return result.value;
				}
			} catch {
				/* empty */
			}
			// throw new Error(
			// 	`Bound Command did not return type <STRING>, returned <${
			// 		STATIC_TYPES[result.type]
			// 	}> instead.`
			// );
		}
		return this.staticValue;
	}

	set value(value: string) {
		this.setValue(value);
	}

	serialize(): SerializedBindable<string> {
		return {
			staticValue: this.staticValue,
			command: this.command?.serialize() ?? null
		};
	}

	static deserialize(json: SerializedBindable<string>) {
		return new BindableString(json.staticValue, json.command ?? undefined);
	}
}

export class BindableBool implements BindableValue {
	staticValue: boolean;
	command: Command | null;
	commandString: string | null;

	constructor(value: boolean, command?: string) {
		this.staticValue = value;
		if (command !== undefined) {
			this.commandString = command;
			this.command = null;
		} else {
			this.command = null;
			this.commandString = null;
		}
	}

	setValue(value: boolean): void {
		this.staticValue = value;
	}

	bind(command: Command | Value | null): void {
		if (command instanceof Command) {
			this.command = command;
		} else if (command === null) {
			this.command = null;
		} else if (command.type === STATIC_TYPES.BOOLEAN) {
			this.setValue(command.value as boolean);
		} else {
			throw new TypeError(`Cannot set BindableInt to type '${STATIC_TYPES[command.type]}'`);
		}
	}

	get value() {
		if (this.commandString !== null && !ws.isFirstFrame) {
			this.command = Command.deserialize(this.commandString);
			this.commandString = null;
		}
		if (this.command !== null && !ws.isFirstFrame) {
			try {
				const result = this.command.execute();
				if (typeof result.value === 'boolean' && result.type === STATIC_TYPES.BOOLEAN) {
					return result.value;
				}
			} catch {
				/* empty */
			}
			// throw new Error(
			// 	`Bound Command did not return type <BOOLEAN>, returned <${
			// 		STATIC_TYPES[result.type]
			// 	}> instead.`
			// );
		}
		return this.staticValue;
	}

	set value(value: boolean) {
		this.setValue(value);
	}

	serialize(): SerializedBindable<boolean> {
		return {
			staticValue: this.staticValue,
			command: this.command?.serialize() ?? null
		};
	}

	static deserialize(json: SerializedBindable<boolean>) {
		return new BindableBool(json.staticValue, json.command ?? undefined);
	}
}

export type SerializedBindable<t> = {
	staticValue: t;
	command: string | null;
};
