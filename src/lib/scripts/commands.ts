import { wp } from '$lib/components/stores';
import { STATIC_TYPES, Value, type DataType } from './dataType';
import { workspace as ws } from './workspace';

export class Command {
	name: string;
	parameters: (Value | Command)[];
	pattern: CommandOverride;
	string: string;

	constructor(name: string, parameters: (Value | Command)[], string: string) {
		this.name = name;
		this.parameters = parameters;
		this.pattern = CommandRegistry.findCommand(
			this.name,
			...this.parameters.map((val) => {
				if (val instanceof Command) {
					return val.execute();
				} else {
					return val;
				}
			})
		);
		this.string = string;
	}

	execute(): Value {
		console.log('name:', this.name);
		console.log('params: ', this.parameters);
		return this.pattern.implementation(
			this.parameters.map((val) => {
				if (val instanceof Command) {
					return val.execute();
				} else {
					return val;
				}
			})
		);
	}

	serialize() {
		return this.string;
	}

	static deserialize(input: string) {
		return (parseExpression(input) as Value).value as Command;
	}
}
export function parseExpression(expression: string): Value | Command {
	function parseCommand(exp: string) {
		const tokens = [];
		let currentToken = '';
		let inQuotes = false;
		let parenthesisLayers = 0;
		for (let i = 0; i < exp.length; i++) {
			currentToken += exp[i];
			if (exp[i] === '"' && exp[i - 1] !== '\\') {
				inQuotes = !inQuotes;
			}
			if (exp[i] === '(' && exp[i - 1] !== '\\') {
				parenthesisLayers += 1;
			}
			if (exp[i] === ')' && exp[i - 1] !== '\\') {
				parenthesisLayers -= 1;
			}
			if (exp[i] === '"' && exp[i - 1] === '\\') {
				currentToken = currentToken.slice(0, -2) + '"';
			}
			if ((exp[i] === ' ' && !inQuotes && parenthesisLayers === 0) || i === exp.length - 1) {
				tokens.push(currentToken.trimEnd());
				currentToken = '';
				parenthesisLayers = 0;
			}
		}

		console.log(tokens);

		return new Command(
			tokens[0],
			tokens.slice(1).map((val) => parseExpression(val)),
			expression
		);
	}

	let exp = expression;
	if (exp.startsWith('(') && exp.endsWith(')')) {
		exp = exp.slice(1, -1);
		if (exp.match(/^:([a-z]+)( \S+)*$/)) {
			return parseCommand(exp.slice(1));
		} else {
			return new Value(parseCommand(exp), STATIC_TYPES.COMMAND);
		}
	} else if (exp.match(/^:([a-z]+)( \S+)*$/)) {
		// Match a command call
		return parseCommand(exp.slice(1)).execute();
	} else if (exp === 'true') {
		// Match a float
		return new Value(true, STATIC_TYPES.BOOLEAN);
	} else if (exp === 'false') {
		// Match a float
		return new Value(false, STATIC_TYPES.BOOLEAN);
	} else if (exp.match(/^".*"/)) {
		// Match a string in quotes
		return new Value(exp.slice(1, -1), STATIC_TYPES.STRING);
	} else if (exp.match(/^[a-zA-Z]+$/)) {
		// Match an implicit string
		return new Value(exp, STATIC_TYPES.STRING);
	} else if (exp.match(/^-?[0-9]+$/)) {
		// Match an integer
		return new Value(parseInt(exp), STATIC_TYPES.INT);
	} else if (exp.match(/^-?[0-9]+\.[0-9]*$/)) {
		// Match a float
		return new Value(parseFloat(exp), STATIC_TYPES.FLOAT);
	} else if (exp === '@c') {
		// Match the shape under the cursor
		const shape = ws.elements.filter((val) => val.isOn(wp.cursorX, wp.cursorY)).at(0);
		if (shape === undefined) {
			throw new Error('There is no shape under the cursor');
		}
		return new Value(shape, STATIC_TYPES.SHAPE);
	} else if (exp.match(/^@[0-9]+,[0-9]+$/)) {
		// Match the shape that exists at that point
		const coordinates = exp
			.slice(1)
			.split(',')
			.map((val) => parseInt(val));
		const shape = ws.elements.filter((val) => val.isOn(coordinates[0], coordinates[1])).at(0);
		if (shape === undefined) {
			throw new Error(`No shape exists at ${exp.slice(1).split(',')}`);
		}
		return new Value(shape, STATIC_TYPES.SHAPE);
	} else if (exp.match(/^@i[0-9]+$/)) {
		// Match the shape with that index
		if (parseInt(exp.slice(2)) >= ws.elements.length) {
			throw new Error(
				`There is no shape at index ${parseInt(exp.slice(2))}. There are only ${
					ws.elements.length
				} shapes(s)`
			);
		}
		return new Value(ws.elements[parseInt(exp.slice(2))], STATIC_TYPES.SHAPE);
	} else if (exp.match(/^@[a-zA-Z0-9-]+$/)) {
		// Match the shape wth that id
		const shape = ws.elements.filter((val) => val.id === exp.slice(1)).at(0);
		if (shape === undefined) {
			throw new Error(`There is no shape with the id '${exp.slice(1)}'`);
		}
		return new Value(shape, STATIC_TYPES.SHAPE);
	}
	throw SyntaxError(`'${expression}' is not valid`);
}

export type CommandOverride = {
	implementation: (params: Value[]) => Value;
	pattern: DataType[];
};
export class CommandDefinition {
	name: string;
	overrides: CommandOverride[];

	constructor(name: string) {
		this.name = name;
		this.overrides = [];
	}

	addOverride(implementation: (params: Value[]) => Value, ...params: DataType[]) {
		this.overrides.push({
			implementation: implementation,
			pattern: params
		});

		return this;
	}

	register() {
		CommandRegistry.registerCommand(this);
	}
}

export class CommandRegistry {
	static commands: CommandDefinition[] = [];

	static registerCommand(command: CommandDefinition) {
		this.commands.push(command);
	}

	static findCommand(name: string, ...params: Value[]) {
		const patterns = this.getPatterns(name);

		for (let i = 0; i < patterns.length; i++) {
			if (this.checkPattern(patterns[i].pattern, ...params)) {
				return patterns[i];
			}
		}

		throw new Error(
			`Command '${name}' does not have an override that matches <${params
				.map((val) => STATIC_TYPES[val.type])
				.join(',')}>`
		);
	}

	static checkPattern(pattern: DataType[], ...params: Value[]): boolean {
		if (pattern.length !== params.length) {
			return false;
		}

		for (let i = 0; i < pattern.length; i++) {
			if (pattern[i] instanceof Array) {
				if (!(pattern[i] as Array<string>).includes(params[i].value as string)) {
					return false;
				}
			} else if (
				pattern[i] !== params[i].type &&
				!(pattern[i] === STATIC_TYPES.FLOAT && params[i].type === STATIC_TYPES.INT) &&
				pattern[i] !== STATIC_TYPES.ANY
			) {
				return false;
			}
		}

		return true;
	}

	static getPatterns(name: string) {
		for (let i = 0; i < this.commands.length; i++) {
			if (this.commands[i].name === name) {
				return this.commands[i].overrides;
			}
		}
		throw new Error(`Command '${name}' is not defined`);
	}
}

export enum OUTPUT_TYPE {
	ERROR,
	WARNING,
	NORMAL
}

export class CommandOutput {
	message: string;
	type: OUTPUT_TYPE;
	constructor(message: string, type: OUTPUT_TYPE) {
		this.message = message;
		this.type = type;
	}
}
