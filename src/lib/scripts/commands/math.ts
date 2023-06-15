import { IntParameter, Pattern, StaticParameter, Value } from './command-definition';

export default [
	new Pattern([new StaticParameter(['add']), new IntParameter(), new IntParameter()], (params) => {
		return new Value((params[0].getInt() + params[1].getInt()).toString());
	})
];
