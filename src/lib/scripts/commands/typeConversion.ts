import { Command, CommandDefinition, parseExpression } from '../commands';
import { STATIC_TYPES, Value } from '../dataType';

new CommandDefinition('string')
	.addOverride((params) => {
		return new Value((params[0].value as number).toString(), STATIC_TYPES.STRING);
	}, STATIC_TYPES.INT)
	.addOverride((params) => {
		return new Value((params[0].value as number).toString(), STATIC_TYPES.STRING);
	}, STATIC_TYPES.FLOAT)
	.addOverride((params) => {
		return new Value((params[0].value as boolean) ? 'true' : 'false', STATIC_TYPES.STRING);
	}, STATIC_TYPES.BOOLEAN)
	.addOverride((params) => {
		return new Value('null', STATIC_TYPES.STRING);
	}, STATIC_TYPES.NULL)
	.addOverride((params) => {
		return params[0];
	}, STATIC_TYPES.STRING)
	.addOverride((params) => {
		return new Value((params[0].value as Command).string, STATIC_TYPES.STRING);
	}, STATIC_TYPES.COMMAND)
	.register();

new CommandDefinition('int')
	.addOverride((params) => {
		const string = params[0].value as string;
		if (string.match(/^-?[0-9]+$/)) {
			return new Value(parseInt(string), STATIC_TYPES.INT);
		} else {
			throw new Error(`The STRING '${string}' cannot be parsed ino an INT.`);
		}
	}, STATIC_TYPES.STRING)
	.addOverride((params) => {
		return new Value(params[0].value ? 1 : 0, STATIC_TYPES.INT);
	}, STATIC_TYPES.BOOLEAN)
	.register();

new CommandDefinition('float')
	.addOverride((params) => {
		const string = params[0].value as string;
		if (string.match(/^-?[0-9]+(.[0-9]+)?$/)) {
			return new Value(parseFloat(string), STATIC_TYPES.FLOAT);
		} else {
			throw new Error(`The STRING '${string}' cannot be parsed ino an FLOAT.`);
		}
	}, STATIC_TYPES.STRING)
	.addOverride((params) => {
		return new Value(params[0].value as number, STATIC_TYPES.FLOAT);
	}, STATIC_TYPES.INT)
	.register();

new CommandDefinition('boolean')
	.addOverride((params) => {
		return new Value(!!((params[0].value as string) === 'true'), STATIC_TYPES.BOOLEAN);
	}, STATIC_TYPES.STRING)
	.addOverride((params) => {
		return new Value(!((params[0].value as number) === 0), STATIC_TYPES.BOOLEAN);
	}, STATIC_TYPES.INT)
	.register();

new CommandDefinition('command')
	.addOverride((params) => {
		const output = parseExpression(params[0].value as string);
		if (output instanceof Command) {
			return new Value(output, STATIC_TYPES.COMMAND);
		} else {
			return output;
		}
	}, STATIC_TYPES.STRING)
	.register();
/*
STRING
  INT
  FLOAT
  BOOL
  NULL
  STRING
  COMMAND
INT
  STRING
  BOOLEAN
FLOAT
  INT
  STRING
BOOLEAN
  STRING
  INT
SHAPE
  -
COMMAND
  STRING
NULL
*/
