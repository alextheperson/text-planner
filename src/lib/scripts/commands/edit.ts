import { Rectangle } from '../shapes/rectangle';
import { TextBox } from '../shapes/textbox';
import { workspace as ws } from '../workspace';
import { ElementParameter, Pattern, StaticParameter, StringParameter } from './command-definition';

export default [
	new Pattern([new StaticParameter(['del']), new ElementParameter()], (params) => {
		params[0].getElement().shouldRemove = true;
		ws.cullElements();
		// `Deleted the ${elementName} at position (${elementPosition.x}, ${elementPosition.y})`

		// `No element selected`
	}),
	new Pattern(
		[new StaticParameter(['del']), new StaticParameter(['file']), new StringParameter()],
		(params) => {
			const normalizedPath = params[1].getString().replace(/^\//, '').replace(/\/$/, '');
			localStorage.removeItem(normalizedPath);
			localStorage.removeItem('/' + normalizedPath);
			localStorage.removeItem(normalizedPath + '/');
			localStorage.removeItem('/' + normalizedPath + '/');
			// const files = JSON.parse(localStorage.getItem('$files') ?? '[]');
			// files.splice(files.indexOf(params[1].parsed), 1);
			// localStorage.setItem('$files', JSON.stringify(files));

			// `Deleted the file '${normalizedPath}'`
		}
	),
	new Pattern([new StaticParameter(['invisibles'])], () => {
		ws.showInvisibleChars = !ws.showInvisibleChars;
		// `Now ${ws.showInvisibleChars ? 'showing' : 'hiding'} in visible characters`
	}),
	new Pattern([new StaticParameter(['border']), new ElementParameter()], (params) => {
		const selected = params[0].getElement();
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
	})
];
