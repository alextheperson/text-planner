import { Command } from '../commands';
import { keymap } from '../keymap';
import { PrefixedLine } from './prefixedLine';
import type { SerializedShape, Shape } from './shape';

export class Button extends PrefixedLine implements Shape {
	action: Command;

	constructor(positionX: number, positionY: number, action: Command, content: string, id: string) {
		super(positionX, positionY, '\u25ba ', content, id);
		this.action = action;
	}

	interact(cursorX: number, cursorY: number, event: KeyboardEvent): boolean {
		if (keymap.confirm.includes(event.key)) {
			this.action.execute();
			return true;
		}
		return false;
	}

	static serialize(input: Button): SerializedShape {
		return {
			_type: 'Button',
			id: input.id,
			positionY: input.positionX.value,
			positionX: input.positionY.value,
			action: input.action,
			content: input.content.value
		};
	}

	static deserialize(input: SerializedShape): Button | null {
		if (input['_type'] === 'Button') {
			return new Button(
				input['positionX'] as number,
				input['positionY'] as number,
				new Command(
					(input['action'] as Command).name,
					(input['action'] as Command).parameters
				) as Command,
				input['content'] as string,
				input['id'] as string
			);
		}
		return null;
	}
}
