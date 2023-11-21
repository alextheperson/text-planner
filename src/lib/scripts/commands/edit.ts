import { CommandDefinition } from '../commands';
import { STATIC_TYPES, Value } from '../dataType';
import { Rectangle } from '../shapes/rectangle';
import type { Shape } from '../shapes/shape';
import { TextBox } from '../shapes/textbox';
import { workspace as ws } from '../workspace';

new CommandDefinition('del')
	.addOverride((params) => {
		(params[0].value as Shape).shouldRemove = true;
		ws.cullElements();
		// `Deleted the ${elementName} at position (${elementPosition.x}, ${elementPosition.y})`

		// `No element selected`
		return new Value(null, STATIC_TYPES.NULL);
	}, STATIC_TYPES.SHAPE)
	.addOverride(
		(params) => {
			const normalizedPath = (params[1].value as string).replace(/^\//, '').replace(/\/$/, '');
			localStorage.removeItem(normalizedPath);
			localStorage.removeItem('/' + normalizedPath);
			localStorage.removeItem(normalizedPath + '/');
			localStorage.removeItem('/' + normalizedPath + '/');
			// const files = JSON.parse(localStorage.getItem('$files') ?? '[]');
			// files.splice(files.indexOf(params[1].parsed), 1);
			// localStorage.setItem('$files', JSON.stringify(files));

			// `Deleted the file '${normalizedPath}'`
			return new Value(null, STATIC_TYPES.NULL);
		},
		['file'],
		STATIC_TYPES.STRING
	)
	.register();

new CommandDefinition('invisibles')
	.addOverride(() => {
		ws.showInvisibleChars = !ws.showInvisibleChars;
		// `Now ${ws.showInvisibleChars ? 'showing' : 'hiding'} in visible characters`
		return new Value(null, STATIC_TYPES.NULL);
	})
	.register();

new CommandDefinition('border')
	.addOverride((params) => {
		const selected = params[0].value as Shape;
		if (selected instanceof TextBox) {
			ws.elements.push(
				new Rectangle(
					selected.position.x - 1,
					selected.position.y - 1,
					selected.position.x + selected.size.x,
					selected.position.y + selected.size.y
				)
			);
			// `Put ${ws.selected.position.x + ws.selected.size.x}x${ws.selected.position.y + ws.selected.size.y} Rectangle around the selected TextBox`,
		}
		//CommandOutput(`No TextBox was selected`, OutputType.ERROR);
		return new Value(null, STATIC_TYPES.NULL);
	}, STATIC_TYPES.SHAPE)
	.register();
