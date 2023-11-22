import { PrefixedLine } from './prefixedLine';
import type { SerializedShape, Shape } from './shape';

export class Bookmark extends PrefixedLine implements Shape {
	constructor(positionX: number, positionY: number, name: string, id: string) {
		super(positionX, positionY, '\u2302 ', name, id);
	}

	static serialize(input: Bookmark): SerializedShape {
		return {
			_type: 'Bookmark',
			id: input.id,
			positionX: input.positionX.value,
			positionY: input.positionY.value,
			name: input.content.value
		};
	}

	static deserialize(input: SerializedShape): Bookmark | null {
		if (input['_type'] === 'Bookmark') {
			return new Bookmark(
				input['positionX'] as number,
				input['positionY'] as number,
				input['name'] as string,
				input['id'] as string
			);
		}
		return null;
	}
}
