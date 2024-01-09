import { BindableInt, BindableString, type SerializedBindable } from '../dataType';
import { PrefixedLine } from './prefixedLine';
import type { SerializedShape, Shape } from './shape';

export class Bookmark extends PrefixedLine implements Shape {
	constructor(positionX: BindableInt, positionY: BindableInt, name: BindableString, id: string) {
		super(positionX, positionY, new BindableString('\u2302 '), name, id);
	}

	static serialize(input: Bookmark): SerializedShape {
		return {
			_type: 'Bookmark',
			id: input.id,
			positionX: input.positionX.serialize(),
			positionY: input.positionY.serialize(),
			name: input.content.serialize()
		};
	}

	static deserialize(input: SerializedShape): Bookmark | null {
		if (input['_type'] === 'Bookmark') {
			return new Bookmark(
				BindableInt.deserialize(input['positionX'] as SerializedBindable<number>),
				BindableInt.deserialize(input['positionY'] as SerializedBindable<number>),
				BindableString.deserialize(input['name'] as SerializedBindable<string>),
				input['id'] as string
			);
		}
		return null;
	}
}
