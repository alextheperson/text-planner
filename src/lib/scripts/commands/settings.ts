import { setKeymap } from '../keymap';
import { Pattern, StaticParameter } from './command-definition';

export default [
	new Pattern(
		[new StaticParameter(['keymap']), new StaticParameter(['dvorak', 'querty'])],
		(params) => {
			setKeymap(params[0].getString() as 'dvorak' | 'querty');
			const keymap = JSON.parse(localStorage.getItem('$settings') ?? '{}');
			keymap['keymap'] = params[0].getString() as 'dvorak' | 'querty';
			localStorage.setItem('$settings', JSON.stringify(keymap));
		}
	)
];
