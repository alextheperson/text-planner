import { CommandDefinition } from '../commands';
import { STATIC_TYPES, Value } from '../dataType';

/*
concat <STRING> <STRING> : <STRING>
startswith <STRING> <STRING> : <BOOLEAN>
endswith <STRING> <STRING> : <BOOLEAN>
slice <STRING> <INT> <INT> : <STRING>
slice <STRING> <INT> : <STRING>
section <STRING> <INT> <INT> : <STRING>
splice <STRING> <INT> <INT> : <STRING>
*/

new CommandDefinition('concat')
	.addOverride(
		(params) => {
			return new Value(
				(params[0].value as string) + (params[1].value as string),
				STATIC_TYPES.STRING
			);
		},
		STATIC_TYPES.STRING,
		STATIC_TYPES.STRING
	)
	.register();

new CommandDefinition('startswith')
	.addOverride(
		(params) => {
			return new Value(
				(params[0].value as string).startsWith(params[1].value as string),
				STATIC_TYPES.BOOLEAN
			);
		},
		STATIC_TYPES.STRING,
		STATIC_TYPES.STRING
	)
	.register();

new CommandDefinition('endswith')
	.addOverride(
		(params) => {
			return new Value(
				(params[0].value as string).endsWith(params[1].value as string),
				STATIC_TYPES.BOOLEAN
			);
		},
		STATIC_TYPES.STRING,
		STATIC_TYPES.STRING
	)
	.register();

new CommandDefinition('slice')
	.addOverride(
		(params) => {
			return new Value(
				(params[0].value as string).slice(params[1].value as number, params[2].value as number),
				STATIC_TYPES.STRING
			);
		},
		STATIC_TYPES.STRING,
		STATIC_TYPES.INT,
		STATIC_TYPES.INT
	)
	.addOverride(
		(params) => {
			return new Value(
				(params[0].value as string).slice(params[1].value as number),
				STATIC_TYPES.STRING
			);
		},
		STATIC_TYPES.STRING,
		STATIC_TYPES.INT
	)
	.register();

new CommandDefinition('section')
	.addOverride(
		(params) => {
			const string = params[0].value as string;
			return new Value(
				string.slice(
					params[1].value as number,
					(params[1].value as number) + (params[2].value as number)
				),
				STATIC_TYPES.STRING
			);
		},
		STATIC_TYPES.STRING,
		STATIC_TYPES.INT,
		STATIC_TYPES.INT
	)
	.register();

new CommandDefinition('splice')
	.addOverride(
		(params) => {
			const string = params[0].value as string;
			return new Value(
				string.slice(0, params[1].value as number) +
					string.slice((params[1].value as number) + (params[2].value as number)),
				STATIC_TYPES.STRING
			);
		},
		STATIC_TYPES.STRING,
		STATIC_TYPES.INT,
		STATIC_TYPES.INT
	)
	.register();
