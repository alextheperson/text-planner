import { CommandDefinition } from '../commands';
import { STATIC_TYPES, Value } from '../dataType';
import { setKeymap } from '../keymap';

new CommandDefinition('keymap')
	.addOverride(
		(params) => {
			setKeymap(params[0].value as 'dvorak' | 'querty');
			const keymap = JSON.parse(localStorage.getItem('$settings') ?? '{}');
			keymap['keymap'] = params[0].value as 'dvorak' | 'querty';
			localStorage.setItem('$settings', JSON.stringify(keymap));
			return new Value(null, STATIC_TYPES.NULL);
		},
		['dvorak', 'querty']
	)
	.register();
