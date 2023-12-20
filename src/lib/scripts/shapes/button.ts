import { Command } from '../commands';
import { BindableString, BindableInt, type SerializedBindable } from '../dataType';
import { keymap } from '../keymap';
import { PrefixedLine } from './prefixedLine';
import type { SerializedShape, Shape } from './shape';

export class Button extends PrefixedLine implements Shape {
	action: Command;

	constructor(
		positionX: BindableInt,
		positionY: BindableInt,
		action: Command,
		content: BindableString,
		id: string
	) {
		super(positionX, positionY, new BindableString('\u25ba '), content, id);
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
			positionY: input.positionX.serialize(),
			positionX: input.positionY.serialize(),
			action: input.action.serialize(),
			content: input.content.serialize()
		};
	}

	static deserialize(input: SerializedShape): Button | null {
		if (input['_type'] === 'Button') {
			return new Button(
				BindableInt.deserialize(input['positionX'] as SerializedBindable<number>),
				BindableInt.deserialize(input['positionY'] as SerializedBindable<number>),
				Command.deserialize(input['action'] as string),
				BindableString.deserialize(input['content'] as SerializedBindable<string>),
				input['id'] as string
			);
		}
		return null;
	}
}
