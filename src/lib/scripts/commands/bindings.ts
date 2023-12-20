import { Command, CommandDefinition } from '../commands';
import { STATIC_TYPES, Value } from '../dataType';
import type { Shape } from '../shapes/shape';

new CommandDefinition('get')
	.addOverride(
		(params) => {
			const shape = params[0].value as Shape;
			const name = params[1].value as string;
			const binding = shape.bindings.filter((val) => val.name === name).at(0);
			if (binding === undefined) {
				throw new Error(`The shape does not have a binding with name '${name}'`);
			}
			return binding.getValue();
		},
		STATIC_TYPES.SHAPE,
		STATIC_TYPES.STRING
	)
	.register();

new CommandDefinition('bindables')
	.addOverride((params) => {
		const bindings = Object.keys((params[0].value as Shape).bindings);
		return new Value(bindings.join(', '), STATIC_TYPES.STRING);
	}, STATIC_TYPES.SHAPE)
	.register();

new CommandDefinition('bind')
	.addOverride(
		(params) => {
			const shape = params[0].value as Shape;
			const name = params[1].value as string;
			const command = params[2].value as Command;
			const binding = shape.bindings.filter((val) => val.name === name).at(0);
			if (binding === undefined) {
				throw new Error(`The shape does not have a binding with name '${name}'`);
			}
			binding.setValue(command);
			return new Value(null, STATIC_TYPES.NULL);
		},
		STATIC_TYPES.SHAPE,
		STATIC_TYPES.STRING,
		STATIC_TYPES.COMMAND
	)
	.register();

new CommandDefinition('unbind')
	.addOverride(
		(params) => {
			const shape = params[0].value as Shape;
			const name = params[1].value as string;
			const binding = shape.bindings.filter((val) => val.name === name).at(0);
			if (binding === undefined) {
				throw new Error(`The shape does not have a binding with name '${name}'`);
			}
			binding.setValue(null);
			return new Value(null, STATIC_TYPES.NULL);
		},
		STATIC_TYPES.SHAPE,
		STATIC_TYPES.STRING
	)
	.register();
