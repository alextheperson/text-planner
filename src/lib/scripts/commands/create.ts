import { workspace as ws } from '../workspace';
import { TextBox } from '../shapes/textbox';
import { Line } from '../shapes/line';
import { Connector } from '../shapes/connector';
import { Rectangle } from '../shapes/rectangle';
import { Bookmark } from '../shapes/bookmark';
import { Button } from '../shapes/button';
import { wp } from '$lib/components/stores';
import Bracket from '../shapes/bracket';
import { Command, CommandDefinition } from '../commands';
import { BindableInt, BindableString, STATIC_TYPES, Value } from '../dataType';

new CommandDefinition('new')
	.addOverride(() => {
		ws.elements.push(
			new TextBox(
				new BindableInt(wp.cursorX),
				new BindableInt(wp.cursorY),
				new BindableString('New Text'),
				ws.getId()
			)
		);
		// `New TextBox created at (${ws.cursorX}, ${ws.cursorY})`
		return new Value(null, STATIC_TYPES.NULL);
	}, ['text'])
	.addOverride(
		(params) => {
			ws.elements.push(
				new TextBox(
					new BindableInt(wp.cursorX),
					new BindableInt(wp.cursorY),
					new BindableString(params[1].value as string),
					ws.getId()
				)
			);
			console.log('abc');
			// `New TextBox created at (${ws.cursorX}, ${ws.cursorY}) with the content '${params[1].parsed.toString()}'`
			return new Value(null, STATIC_TYPES.NULL);
		},
		['text'],
		STATIC_TYPES.STRING
	)
	.addOverride(() => {
		ws.elements.push(
			new Line(
				new BindableInt(wp.cursorX),
				new BindableInt(wp.cursorY),
				new BindableInt(wp.cursorX + 5),
				new BindableInt(wp.cursorY + 5),
				ws.getId()
			)
		);
		// `New Line created from (${ws.cursorX}, ${ws.cursorY}) to (${ws.cursorX + 5}, ${ws.cursorY + 5})`

		return new Value(null, STATIC_TYPES.NULL);
	}, ['line'])
	.addOverride(
		(params) => {
			ws.elements.push(
				new Line(
					new BindableInt(params[1].value as number),
					new BindableInt(params[2].value as number),
					new BindableInt(params[3].value as number),
					new BindableInt(params[4].value as number),
					ws.getId()
				)
			);
			// `New Line created from (${params[1].parsed as number}, ${params[2].parsed as number}) to (${params[3].parsed as number}, ${params[4].parsed as number})`

			return new Value(null, STATIC_TYPES.NULL);
		},
		['line'],
		STATIC_TYPES.INT,
		STATIC_TYPES.INT,
		STATIC_TYPES.INT,
		STATIC_TYPES.INT
	)
	.addOverride(() => {
		ws.elements.push(
			new Connector(
				new BindableInt(wp.cursorX),
				new BindableInt(wp.cursorY),
				new BindableInt(wp.cursorX + 5),
				new BindableInt(wp.cursorY + 5),
				ws.getId()
			)
		);
		// `New Connector created from (${ws.cursorX}, ${ws.cursorY}) to (${ws.cursorX + 5}, ${ws.cursorY + 5})`,
		return new Value(null, STATIC_TYPES.NULL);
	}, ['connector'])
	.addOverride(
		(params) => {
			console.log(params[1].value);
			ws.elements.push(
				new Connector(
					new BindableInt(params[1].value as number),
					new BindableInt(params[2].value as number),
					new BindableInt(params[3].value as number),
					new BindableInt(params[4].value as number),
					ws.getId()
				)
			);
			// `New Connector created from (${params[1].parsed as number}, ${params[2].parsed as number}) to (${params[3].parsed as number}, ${params[4].parsed as number})`
			return new Value(null, STATIC_TYPES.NULL);
		},
		['connector'],
		STATIC_TYPES.INT,
		STATIC_TYPES.INT,
		STATIC_TYPES.INT,
		STATIC_TYPES.INT
	)
	.addOverride(() => {
		ws.elements.push(
			new Rectangle(
				new BindableInt(wp.cursorX),
				new BindableInt(wp.cursorY),
				new BindableInt(wp.cursorX + 5),
				new BindableInt(wp.cursorY + 5),
				ws.getId()
			)
		);
		// `New Rectangle created from (${ws.cursorX}, ${ws.cursorY}) to (${ws.cursorX + 5}, ${ws.cursorY + 5})`
		return new Value(null, STATIC_TYPES.NULL);
	}, ['rect'])
	.addOverride(
		(params) => {
			ws.elements.push(
				new Rectangle(
					new BindableInt(params[1].value as number),
					new BindableInt(params[2].value as number),
					new BindableInt(params[3].value as number),
					new BindableInt(params[4].value as number),
					ws.getId()
				)
			);
			// `New Rectangle created from (${params[1].parsed as number}, ${params[2].parsed as number}) to (${params[3].parsed as number}, ${params[4].parsed as number})`
			return new Value(null, STATIC_TYPES.NULL);
		},
		['rect'],
		STATIC_TYPES.INT,
		STATIC_TYPES.INT,
		STATIC_TYPES.INT,
		STATIC_TYPES.INT
	)
	.addOverride(() => {
		ws.elements.push(
			new Bookmark(
				new BindableInt(wp.cursorX),
				new BindableInt(wp.cursorY),
				new BindableString('New Bookmark'),
				ws.getId()
			)
		);
		// `New Bookmark created at (${ws.cursorX}, ${ws.cursorY})`
		return new Value(null, STATIC_TYPES.NULL);
	}, ['bookmark'])
	.addOverride(
		(params) => {
			ws.elements.push(
				new Bookmark(
					new BindableInt(wp.cursorX),
					new BindableInt(wp.cursorY),
					new BindableString(params[1].value as string),
					ws.getId()
				)
			);
			// `New Bookmark created at (${ws.cursorX}, ${ws.cursorY}) with the name ${params[1].parsed as string}`
			return new Value(null, STATIC_TYPES.NULL);
		},

		['bookmark'],
		STATIC_TYPES.STRING
	)
	.addOverride(
		(params) => {
			ws.elements.push(
				new Button(
					new BindableInt(wp.cursorX),
					new BindableInt(wp.cursorY),
					params[1].value as Command,
					new BindableString('New Button'),
					ws.getId()
				)
			);
			// `New Button created at (${ws.cursorX}, ${ws.cursorY}) with the action ${params[1].parsed as string}`
			return new Value(null, STATIC_TYPES.NULL);
		},
		['button'],
		STATIC_TYPES.COMMAND
	)
	.addOverride(
		(params) => {
			ws.elements.push(
				new Button(
					new BindableInt(wp.cursorX),
					new BindableInt(wp.cursorY),
					params[1].value as Command,
					new BindableString(params[2].value as string),
					ws.getId()
				)
			);
			// `New Button created at (${ws.cursorX}, ${ws.cursorY}) with the action ${params[1].parsed as string} text ${params[2].parsed as string}`
			return new Value(null, STATIC_TYPES.NULL);
		},

		['button'],
		STATIC_TYPES.COMMAND,
		STATIC_TYPES.STRING
	)
	.addOverride(() => {
		ws.elements.push(
			new Bracket(
				new BindableInt(wp.cursorX),
				new BindableInt(wp.cursorY),
				new BindableInt(3),
				ws.getId()
			)
		);
		// `New Button created at (${ws.cursorX}, ${ws.cursorY}) with the action ${params[1].parsed as string} text ${params[2].parsed as string}`
		return new Value(null, STATIC_TYPES.NULL);
	}, ['bracket'])
	.addOverride(() => {
		ws.elements = [];
		ws.fileName = '';
		wp.setCursorCoords(0, 0);
		wp.setCanvasCoords(0, 0);
		return new Value(null, STATIC_TYPES.NULL);
	}, ['file'])
	.register();
