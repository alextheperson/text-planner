import type { Parameter } from './commands/command-definition';

class ParameterMismatchError extends Error {
	constructor(parameter: Parameter, value: string) {
		super(
			`A parameter of type '${parameter.typeName}' was given the value '${value}', which is not in the right format. If this error happens, it means there is an error with the command's pattern-matching algorithm.`
		);

		// Set the prototype explicitly.
		Object.setPrototypeOf(this, ParameterMismatchError.prototype);
	}
}

class CommandNotFoundError extends Error {
	constructor(command: string) {
		super(`Could not find a command that fit ${command}.`);

		// Set the prototype explicitly.
		Object.setPrototypeOf(this, CommandNotFoundError.prototype);
	}
}

class IncompatibleTypesError extends Error {
	constructor(from: string, to: string) {
		super(
			`The value '${from}' could not be converted to type '${to}'. It is probably not in the right format.`
		);

		// Set the prototype explicitly.
		Object.setPrototypeOf(this, IncompatibleTypesError.prototype);
	}
}

export { ParameterMismatchError, CommandNotFoundError, IncompatibleTypesError };
