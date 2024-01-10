import { Command, CommandDefinition, parseExpression } from '../commands';
import { BindableInt, STATIC_TYPES, Value } from '../dataType';
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
			const rect = new Rectangle(
				new BindableInt(selected.positionX.value - 1),
				new BindableInt(selected.positionY.value - 1),
				new BindableInt(selected.positionX.value + selected.width.value),
				new BindableInt(selected.positionY.value + selected.height.value),
				ws.getId()
			);

			rect.bindings
				.filter((val) => val.name === 'corners/topLeft/x')
				.at(0)
				?.setValue(
					new Command(
						'get',
						[new Value(selected, STATIC_TYPES.SHAPE), new Value('position/x', STATIC_TYPES.STRING)],
						`:get @i${selected.id} "position/x"`
					)
				);
			rect.bindings
				.filter((val) => val.name === 'corners/topLeft/y')
				.at(0)
				?.setValue(
					new Command(
						'get',
						[new Value(selected, STATIC_TYPES.SHAPE), new Value('position/y', STATIC_TYPES.STRING)],
						`:get @i${selected.id} "position/y"`
					)
				);
			rect.bindings
				.filter((val) => val.name === 'corners/bottomRight/x')
				.at(0)
				?.setValue(
					parseExpression(
						`(:floor (:add (:get @i${selected.id} "position/x") (:get @i${selected.id} "size/width")))`
					) as Command
				);
			rect.bindings
				.filter((val) => val.name === 'corners/bottomRight/y')
				.at(0)
				?.setValue(
					parseExpression(
						`(:floor (:add (:get @i${selected.id} "position/y") (:get @i${selected.id} "size/height")))`
					) as Command
				);
			ws.elements.push(rect);
			// `Put ${ws.selected.position.x + ws.selected.size.x}x${ws.selected.position.y + ws.selected.size.y} Rectangle around the selected TextBox`,
		}
		//CommandOutput(`No TextBox was selected`, OutputType.ERROR);
		return new Value(null, STATIC_TYPES.NULL);
	}, STATIC_TYPES.SHAPE)
	.register();

new CommandDefinition('id')
	.addOverride((params) => {
		return new Value((params[0].value as Shape).id, STATIC_TYPES.STRING);
	}, STATIC_TYPES.SHAPE)
	.register();
