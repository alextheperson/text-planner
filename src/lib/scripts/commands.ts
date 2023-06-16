import { CommandOutput, OutputType, StaticParameter, Value } from './commands/command-definition';
import create from './commands/create';
import edit from './commands/edit';
import io from './commands/io';
import math from './commands/math';
import movement from './commands/movement';
import settings from './commands/settings';
import { CommandNotFoundError } from './errors';

const COMMANDS = io.concat(create, movement, edit, math, settings);

const BRACKETS = [
	{
		open: '"',
		close: '"'
	},
	{
		open: "'",
		close: "'"
	},
	{
		open: '(',
		close: ')'
	}
];

function parseCommand(command: string) {
	try {
		let parts: Array<Value> = [];
		let currentChar = '';
		let previousChar = '';
		let currentToken = '';

		let quotes: number | null = null;
		for (let i = 0; i < command.length; i++) {
			currentChar = command[i];

			if (currentChar == ' ' && quotes === null) {
				parts.push(new Value(currentToken));
				currentToken = '';
			} else {
				for (let j = 0; j < BRACKETS.length; j++) {
					if (currentChar === BRACKETS[j]['open'] && previousChar != '\\') {
						quotes = j;
					} else if (quotes && currentChar === BRACKETS[quotes]['close'] && previousChar !== '\\') {
						quotes = null;
					}
				}
				currentToken += currentChar;
			}

			previousChar = currentChar;
		}
		parts.push(new Value(currentToken));
		parts = parts.map((e, i) => {
			if (i > 0 && e.getString().at(0) === '(' && e.getString().at(-1) === ')') {
				const output = parseCommand(e.getCommand());
				if (output instanceof Value) {
					return output;
				} else {
					return e;
				}
			} else {
				return e;
			}
		});
		for (let i = 0; i < COMMANDS.length; i++) {
			if (COMMANDS[i].matches(parts)) {
				const output = COMMANDS[i].action(parts.slice(1));
				if (output instanceof Value) {
					return output;
				} else {
					return;
				}
			}
		}
		throw new CommandNotFoundError(command);
	} catch (error) {
		if (error instanceof Error) {
			return new CommandOutput(error.message, OutputType.ERROR);
		} else {
			return new CommandOutput(`Something really bad happened. Plz report this.`, OutputType.ERROR);
		}
	}
}

function getNextParameters(start: string): Array<string> {
	let possibilities: Array<string> = [];

	const parts: Array<string> = [];
	let currentChar = '';
	let previousChar = '';
	let currentToken = '';

	let quotes: number | null = null;
	for (let i = 0; i < start.length; i++) {
		currentChar = start[i];

		if (currentChar == ' ' && quotes === null) {
			parts.push(currentToken);
			currentToken = '';
		} else {
			for (let j = 0; j < BRACKETS.length; j++) {
				if (currentChar === BRACKETS[j]['open'] && previousChar != '\\' && quotes === null) {
					quotes = j;
				} else if (quotes && currentChar === BRACKETS[quotes]['close'] && previousChar !== '\\') {
					quotes = null;
				}
			}
			currentToken += currentChar;
		}

		previousChar = currentChar;
	}
	parts.push(currentToken);

	for (let i = 0; i < COMMANDS.length; i++) {
		const pattern = COMMANDS[i];

		let matchesStart = true;

		if (pattern.pattern.length < parts.length) {
			continue;
		}
		for (let j = 0; j < parts.length - 1; j++) {
			if (!pattern.pattern[j].matches(parts[j])) {
				matchesStart = false;
			}
		}

		const nextParameter = pattern.pattern[parts.length - 1];
		if (matchesStart && nextParameter instanceof StaticParameter) {
			for (let j = 0; j < nextParameter.options.length; j++) {
				if (
					!possibilities.includes(nextParameter.options[j]) &&
					nextParameter.options[j].startsWith(parts.at(-1) ?? '')
				) {
					possibilities = possibilities.concat(nextParameter.options[j]);
				}
			}
		}
	}

	return possibilities;
}

// class StringValue {
// 	content: string;
// 	isCommand: boolean;

// 	constructor(content: string, isCommand: boolean) {
// 		this.content = content;
// 		this.isCommand = isCommand;
// 	}

// 	getValue() {
// 		if (this.isCommand) {
// 			return parseCommand(this.content).message;
// 		} else {
// 			return this.content;
// 		}
// 	}
// }

export { parseCommand, getNextParameters };
