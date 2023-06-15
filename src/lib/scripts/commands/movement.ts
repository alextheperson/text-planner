import { wp } from '$lib/components/stores';
import { Bookmark } from '../shapes/bookmark';
import Vector2 from '../vector';
import { workspace as ws } from '../workspace';
import { Pattern, StaticParameter, StringParameter, Vector2Parameter } from './command-definition';

export default [
	new Pattern([new StaticParameter(['goto']), new Vector2Parameter()], (params) => {
		wp.setCursorCoords(new Vector2(params[0].getVector().x, params[0].getVector().y));
		// `Cursor moved to (${params[0].parsed as number}, ${params[1].parsed as number})`
	}),
	new Pattern([new StaticParameter(['goto']), new StringParameter()], (params) => {
		const targetName = params[0].getString();
		for (let i = 0; i < ws.elements.length; i++) {
			const currentElement = ws.elements[i];
			if (
				currentElement instanceof Bookmark &&
				currentElement.content.toLowerCase() == targetName.toLowerCase()
			) {
				wp.setCursorCoords(new Vector2(currentElement.position.x, currentElement.position.y));
				// `Moved cursor to the bookmark '${targetName}' at (${currentElement.position.x}, ${currentElement.position.y})`
			}
		}
		// `Could not find a Bookmark with the name '${targetName}' (case insensitive) in the workspace`
	})
];
