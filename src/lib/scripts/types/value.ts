import { parseCommand } from '../commands';
import { Value } from '../commands/command-definition';
import Vector2 from '../vector';

interface DynamicValue<T> {
	value: T | null;
	command: string | null;

	get v(): T;
}

class DynamicVector2 implements DynamicValue<Vector2> {
	value: Vector2 | null;
	command: string | null;

	constructor(input: Vector2 | string) {
		if (typeof input === 'string') {
			this.command = input;
			this.value = null;
		} else {
			this.value = input;
			this.command = null;
		}
	}

	get v(): Vector2 {
		if (this.value !== null) {
			return this.value;
		} else if (this.command !== null) {
			const output = parseCommand(this.command);
			if (output instanceof Value) {
				try {
					return output.getVector();
				} catch {
					return new Vector2(0, 0);
				}
			}
		}
		return new Vector2(0, 0);
	}
}

export { DynamicVector2 };

/*
parseCommand(str) -> Command

Command.vector2() {

}



*/
