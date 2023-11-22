import { wp } from '$lib/components/stores';
import { CommandDefinition } from '../commands';
import { STATIC_TYPES, Value } from '../dataType';
import { Bookmark } from '../shapes/bookmark';
import { workspace as ws } from '../workspace';

new CommandDefinition('goto')
	.addOverride(
		(params) => {
			wp.setCursorCoords(params[0].value as number, params[1].value as number);
			// `Cursor moved to (${params[0].parsed as number}, ${params[1].parsed as number})`
			return new Value(null, STATIC_TYPES.NULL);
		},
		STATIC_TYPES.INT,
		STATIC_TYPES.INT
	)
	.addOverride((params) => {
		const targetName = params[0].value as string;
		for (let i = 0; i < ws.elements.length; i++) {
			const currentElement = ws.elements[i];
			if (
				currentElement instanceof Bookmark &&
				currentElement.content.value.toLowerCase() == targetName.toLowerCase()
			) {
				wp.setCursorCoords(currentElement.positionX.value, currentElement.positionY.value);
				// `Moved cursor to the bookmark '${targetName}' at (${currentElement.position.x}, ${currentElement.position.y})`
			}
		}
		// `Could not find a Bookmark with the name '${targetName}' (case insensitive) in the workspace`
		return new Value(null, STATIC_TYPES.NULL);
	}, STATIC_TYPES.STRING)
	.register();
