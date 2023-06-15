import { IncompatibleTypesError } from '../errors';
import type { Shape } from '../shapes/shape';
import Vector2 from '../vector';
import { workspace as ws } from '../workspace';

enum OutputType {
	NORMAL,
	ERROR,
	WARNING
}

class CommandOutput {
	content: string;
	type: OutputType;

	constructor(content: string, type: OutputType) {
		this.content = content;
		this.type = type;
	}
}

class Value {
	private content: string;

	constructor(content: string) {
		this.content = content;
	}

	isInt(): boolean {
		return new IntParameter().matches(this.content);
	}

	getInt(): number {
		return new IntParameter().parse(this.content);
	}

	// getNumber(): number {
	// 	return new I
	// }

	isString(): boolean {
		return new StringParameter().matches(this.content);
	}

	getString(): string {
		return new StringParameter().parse(this.content);
	}

	isVector(): boolean {
		return new Vector2Parameter().matches(this.content);
	}

	getVector(): Vector2 {
		return new Vector2Parameter().parse(this.content);
	}

	isElement(): boolean {
		return new ElementParameter().matches(this.content);
	}

	getElement(): Shape {
		return new ElementParameter().parse(this.content);
	}

	isCommand(): boolean {
		return new CommandParameter().matches(this.content);
	}

	getCommand(): string {
		return new CommandParameter().parse(this.content);
	}
}

// class Command {
// 	aliases: Array<string>;
// 	patterns: Array<Pattern>;

// 	constructor(
// 		names: Array<string>,
// 		pattern: Array<Parameter>,
// 		action: (params: Array<Value>) => Value | void
// 	) {
// 		this.aliases = names;
// 		this.patterns = [new Pattern(pattern, action)];
// 	}

// 	addPattern(pattern: Array<Parameter>, action: (params: Array<Value>) => Value | void) {
// 		this.patterns.push(new Pattern(pattern, action));
// 		return this;
// 	}
// }

class Pattern {
	pattern: Array<Parameter>;
	action: (params: Array<Value>) => Value | void;

	constructor(pattern: Array<Parameter>, action: (params: Array<Value>) => Value | void) {
		this.pattern = pattern;
		this.action = action;
	}

	matches(params: Array<Value>) {
		if (params.length !== this.pattern.length) {
			return false;
		}
		for (let i = 0; i < this.pattern.length; i++) {
			if (!this.pattern[i].matches(params[i].getString())) {
				return false;
			}
		}
		return true;
	}
}

// enum ParameterType {
// 	ENUM,
// 	STRING,
// 	INT,
// 	STATIC
// }

interface Parameter {
	matches(test: string): boolean;
	parse(instance: string): number | Shape | Vector2 | string;
	stringify(instance: number | Shape | Vector2 | string | Array<string>): string;
	get typeName(): string;
}

class StaticParameter implements Parameter {
	options: Array<string>;

	constructor(options: Array<string>) {
		this.options = options;
	}

	matches(test: string): boolean {
		return this.options.includes(test);
	}

	parse(instance: string) {
		if (this.matches(instance)) {
			return instance;
		} else {
			throw new IncompatibleTypesError(instance, this.typeName);
		}
	}

	stringify(instance: Array<string>): string {
		return instance[0];
	}

	get typeName(): string {
		return `[${this.options.join('|')}]`;
	}
}

class StringParameter implements Parameter {
	matches(test: string): boolean {
		return (
			test.match(/("[^"]+")/) !== null ||
			test.match(/('[^']+')/) !== null ||
			test.match(/[^\w]*/) !== null
		);
	}

	parse(instance: string) {
		return instance.replace(/^['"]/, '').replace(/['"]$/, '');
	}

	stringify(instance: string): string {
		return instance;
	}

	get typeName(): string {
		return 'String';
	}
}

class IntParameter implements Parameter {
	matches(test: string): boolean {
		return test.match(/^[0-9]+$/) !== null;
	}

	parse(instance: string) {
		if (this.matches(instance)) {
			return parseInt(instance);
		} else {
			throw new IncompatibleTypesError(instance, this.typeName);
		}
	}

	stringify(instance: number): string {
		return Math.floor(instance).toString();
	}

	get typeName(): string {
		return 'Integer';
	}
}

class ElementParameter implements Parameter {
	matches(test: string): boolean {
		return (
			test.match(/#[0-9]+/) !== null ||
			test === '#s' ||
			test.match(/@[0-9]+,[0-9]+/) !== null ||
			test.match(/!([0-9]+|s)/) !== null
		);
	}

	parse(instance: string): Shape {
		if (this.matches(instance)) {
			if (instance.startsWith('#')) {
				for (let i = 0; i < ws.elements.length; i++) {
					if (ws.elements[i].id === parseInt(instance.slice(1))) {
						return ws.elements[i];
					}
				}
			} else if (instance.startsWith('@')) {
				for (let i = 0; i < ws.elements.length; i++) {
					if (
						ws.elements[i].isOn(
							parseFloat(instance.slice(1).split(',')[0]),
							parseFloat(instance.slice(1).split(',')[1])
						)
					) {
						return ws.elements[i];
					}
				}
			} else if (instance.startsWith('!')) {
				if (instance.slice(1) == 's') {
					if (ws.selected !== null) {
						return ws.selected;
					}
				} else {
					return ws.elements[parseFloat(instance.slice(1))];
				}
			}
		}
		throw new IncompatibleTypesError(instance, this.typeName);
	}

	stringify(instance: Shape): string {
		return `#${instance.id}`;
	}

	get typeName(): string {
		return 'Element';
	}
}

class Vector2Parameter implements Parameter {
	matches(test: string): boolean {
		return test.match(/[0-9]+,[0-9]+/) !== null;
	}

	parse(instance: string) {
		if (this.matches(instance)) {
			return new Vector2(parseFloat(instance.split(',')[0]), parseFloat(instance.split(',')[1]));
		} else {
			throw new IncompatibleTypesError(instance, this.typeName);
		}
	}

	stringify(instance: Vector2): string {
		return `(${instance.x},${instance.y})`;
	}

	get typeName(): string {
		return 'Vector2';
	}
}

class CommandParameter implements Parameter {
	matches(test: string): boolean {
		return test.at(0) === '(' && test.at(-1) === ')';
	}

	parse(instance: string): string {
		if (this.matches(instance)) {
			return instance.slice(1, -1);
		} else {
			throw new IncompatibleTypesError(instance, this.typeName);
		}
	}

	stringify(instance: string): string {
		return instance;
	}

	get typeName(): string {
		return 'Command';
	}
}

// class Parameter {
// 	value: string;
// 	type: ParameterType;
// 	constructor(value: string, type: ParameterType) {
// 		this.value = value;
// 		this.type = type;
// 	}
// 	get parsed() {
// 		return this.type.parse(this.value);
// 	}
// }
export {
	Pattern,
	Value,
	CommandOutput,
	OutputType,
	StaticParameter,
	StringParameter,
	IntParameter,
	ElementParameter,
	Vector2Parameter
};
export type { Parameter };
