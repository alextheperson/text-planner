import { CommandDefinition } from '../commands';
import { STATIC_TYPES, Value } from '../dataType';

new CommandDefinition('if')
	.addOverride(
		(params) => {
			if (params[0].value as boolean) {
				return params[1];
			} else {
				return params[2];
			}
		},
		STATIC_TYPES.BOOLEAN,
		STATIC_TYPES.ANY,
		STATIC_TYPES.ANY
	)
	.register();

new CommandDefinition('eq')
	.addOverride(
		(params) => {
			return new Value(params[0].value == params[1].value, STATIC_TYPES.BOOLEAN);
		},
		STATIC_TYPES.ANY,
		STATIC_TYPES.ANY
	)
	.register();

new CommandDefinition('and')
	.addOverride(
		(params) => {
			return new Value(
				(params[0].value as boolean) && (params[1].value as boolean),
				STATIC_TYPES.BOOLEAN
			);
		},
		STATIC_TYPES.BOOLEAN,
		STATIC_TYPES.BOOLEAN
	)
	.register();

new CommandDefinition('or')
	.addOverride(
		(params) => {
			return new Value(
				(params[0].value as boolean) || (params[1].value as boolean),
				STATIC_TYPES.BOOLEAN
			);
		},
		STATIC_TYPES.BOOLEAN,
		STATIC_TYPES.BOOLEAN
	)
	.register();

new CommandDefinition('not')
	.addOverride((params) => {
		return new Value(params[0].value as boolean, STATIC_TYPES.BOOLEAN);
	}, STATIC_TYPES.BOOLEAN)
	.register();
