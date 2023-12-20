import { CommandDefinition } from '../commands';
import { STATIC_TYPES } from '../dataType';

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
