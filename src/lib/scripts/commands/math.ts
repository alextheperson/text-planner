import { CommandDefinition } from '../commands';
import { STATIC_TYPES, Value } from '../dataType';

new CommandDefinition('add')
	.addOverride(
		(params) => {
			return new Value(
				(params[0].value as number) + (params[1].value as number),
				STATIC_TYPES.FLOAT
			);
		},
		STATIC_TYPES.FLOAT,
		STATIC_TYPES.FLOAT
	)
	.register();

new CommandDefinition('sub')
	.addOverride(
		(params) => {
			return new Value(
				(params[0].value as number) - (params[1].value as number),
				STATIC_TYPES.FLOAT
			);
		},
		STATIC_TYPES.FLOAT,
		STATIC_TYPES.FLOAT
	)
	.register();

new CommandDefinition('mult')
	.addOverride(
		(params) => {
			return new Value(
				(params[0].value as number) * (params[1].value as number),
				STATIC_TYPES.FLOAT
			);
		},
		STATIC_TYPES.FLOAT,
		STATIC_TYPES.FLOAT
	)
	.register();

new CommandDefinition('div')
	.addOverride(
		(params) => {
			return new Value(
				(params[0].value as number) / (params[1].value as number),
				STATIC_TYPES.FLOAT
			);
		},
		STATIC_TYPES.FLOAT,
		STATIC_TYPES.FLOAT
	)
	.register();

new CommandDefinition('exp')
	.addOverride(
		(params) => {
			return new Value(
				(params[0].value as number) ** (params[1].value as number),
				STATIC_TYPES.FLOAT
			);
		},
		STATIC_TYPES.FLOAT,
		STATIC_TYPES.FLOAT
	)
	.register();

new CommandDefinition('mod')
	.addOverride(
		(params) => {
			return new Value(
				(params[0].value as number) % (params[1].value as number),
				STATIC_TYPES.FLOAT
			);
		},
		STATIC_TYPES.FLOAT,
		STATIC_TYPES.FLOAT
	)
	.register();

new CommandDefinition('floor')
	.addOverride((params) => {
		return new Value(Math.floor(params[0].value as number), STATIC_TYPES.INT);
	}, STATIC_TYPES.FLOAT)
	.register();

new CommandDefinition('ceil')
	.addOverride((params) => {
		return new Value(Math.ceil(params[0].value as number), STATIC_TYPES.INT);
	}, STATIC_TYPES.FLOAT)
	.register();

new CommandDefinition('round')
	.addOverride((params) => {
		return new Value(Math.round(params[0].value as number), STATIC_TYPES.INT);
	}, STATIC_TYPES.FLOAT)
	.register();
