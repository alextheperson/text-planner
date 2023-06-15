import Vector2 from '../vector';
import { PrefixedLine } from './prefixedLine';
import type { Shape } from './shape';

export class Bookmark extends PrefixedLine implements Shape {
	constructor(position: Vector2, name: string) {
		super(position, '\u2302 ', name);
	}

	static serialize(input: Bookmark): string {
		return JSON.stringify({
			_type: 'Bookmark',
			position: input.position,
			name: input.content
		});
	}

	static deserialize(input: string): Bookmark | null {
		const json = JSON.parse(input);
		if (json['_type'] === 'Bookmark') {
			return new Bookmark(new Vector2(json['position']['x'], json['position']['y']), json['name']);
		}
		return null;
	}
}
