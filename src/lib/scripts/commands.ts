import { STATIC_TYPES, Value, type DataType } from './dataType';

export class Command {
	name: string;
	parameters: Value[];
	pattern: CommandOverride;
	constructor(name: string, parameters: Value[]) {
		this.name = name;
		this.parameters = parameters;
		this.pattern = CommandRegistry.findCommand(this.name, ...this.parameters);
	}

	execute() {
		return this.pattern.implementation(this.parameters);
	}
}
export function parseExpression(expression: string): Value {
	function parseCommand(exp: string) {
		const tokens = [];
		let currentToken = '';
		let inQuotes = false;
		let parenthesisLayers = 0;
		for (let i = 1; i < exp.length; i++) {
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
			}
		}

		console.log(tokens);

		const command = new Command(
			tokens[0],
			tokens.slice(1).map((val) => parseExpression(val))
		);

		return command;
	}

	let exp = expression;
	if (exp.startsWith('(') && exp.endsWith(')')) {
		exp = exp.slice(1, -1);
		if (exp.match(/^:([a-z]+)( \S+)*$/)) {
			return parseCommand(exp).execute();
		} else {
			return new Value(parseCommand(exp), STATIC_TYPES.COMMAND);
		}
	} else if (exp.match(/^:([a-z]+)( \S+)*$/)) {
		// Match a command call
		return parseCommand(exp).execute();
	} else if (exp.match(/^".*"/)) {
		// Match a string in quotes
		return new Value(exp.slice(1, -1), STATIC_TYPES.STRING);
	} else if (exp.match(/^[a-zA-Z]+$/)) {
		// Match an implicit string
		return new Value(exp, STATIC_TYPES.STRING);
	} else if (exp.match(/^[0-9]+$/)) {
		// Match an integer
		return new Value(parseInt(exp), STATIC_TYPES.INT);
	} else if (exp.match(/^[0-9]+\.[0-9]*$/)) {
		// Match a float
		return new Value(parseFloat(exp), STATIC_TYPES.FLOAT);
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
			} else {
				if (
					pattern[i] !== params[i].type &&
					!(pattern[i] === STATIC_TYPES.FLOAT && params[i].type === STATIC_TYPES.INT)
				) {
					return false;
				}
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

export function getNextParameters(start: string): string[] {
	let possibilities: string[] = [];
	const tokens: string[] = [];
	let currentToken = '';
	let inQuotes = false;

	for (let i = 0; i < start.length; i++) {
		currentToken += start[i];
		if (start[i] === "'" && start[i - 1] !== '\\') {
			inQuotes = !inQuotes;
		}
		if ((start[i] === ' ' && !inQuotes) || i === start.length - 1) {
			tokens.push(currentToken.trimEnd());
			currentToken = '';
		}
		if (start[i] === ' ' && i === start.length - 1) {
			tokens.push(currentToken);
		}
	}

	if (tokens.length <= 1) {
		CommandRegistry.commands.forEach((val) => {
			if (val.name.startsWith(tokens[0] ?? '')) {
				possibilities.push(val.name);
			}
		});
	} else {
		const lastToken = tokens.at(-1);
		const patterns = CommandRegistry.getPatterns(tokens[0]);

		for (let i = 0; i < (patterns?.length ?? 0); i++) {
			if (patterns !== undefined && patterns[i].pattern[tokens.length - 2] instanceof Array) {
				possibilities = possibilities.concat(
					(patterns[i].pattern[tokens.length - 2] as Array<string>).filter((val) => {
						return val.startsWith(lastToken ?? '') && !possibilities.includes(val);
					})
				);
			}
		}
	}

	return possibilities;
}
