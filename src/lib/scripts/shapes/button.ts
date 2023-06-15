import { parseCommand } from '../commands';
import { keymap } from '../keymap';
import Vector2 from '../vector';
import { PrefixedLine } from './prefixedLine';
import type { Shape } from './shape';

export class Button extends PrefixedLine implements Shape {
	action: string;

	constructor(position: Vector2, action: string, content: string) {
		super(position, '\u25ba ', content);
		this.action = action;
	}

	interact(cursor: Vector2, event: KeyboardEvent): boolean {
		if (keymap.confirm.includes(event.key)) {
			parseCommand(this.action);
			return true;
		}
		return false;
	}

	static serialize(input: Button): string {
		return JSON.stringify({
			_type: 'Button',
			position: input.position,
			action: input.action,
			content: input.content
		});
	}

	static deserialize(input: string): Button | null {
		const json = JSON.parse(input);
		if (json['_type'] === 'Button') {
			return new Button(
				new Vector2(json['position']['x'], json['position']['y']),
				json['action'],
				json['content']
			);
		}
		return null;
	}
}
