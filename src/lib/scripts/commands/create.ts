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
import { STATIC_TYPES, Value } from '../dataType';

new CommandDefinition('new')
	.addOverride(() => {
		ws.elements.push(new TextBox(wp.cursorX, wp.cursorY, 'New Text', ws.getId()));
		console.log('abc');
		// `New TextBox created at (${ws.cursorX}, ${ws.cursorY})`
		return new Value(null, STATIC_TYPES.NULL);
	}, ['text'])
	.addOverride(
		(params) => {
			ws.elements.push(new TextBox(wp.cursorX, wp.cursorY, params[1].value as string, ws.getId()));
			console.log('abc');
			// `New TextBox created at (${ws.cursorX}, ${ws.cursorY}) with the content '${params[1].parsed.toString()}'`
			return new Value(null, STATIC_TYPES.NULL);
		},
		['text'],
		STATIC_TYPES.STRING
	)
	.addOverride(() => {
		ws.elements.push(new Line(wp.cursorX, wp.cursorY, wp.cursorX + 5, wp.cursorY + 5, ws.getId()));
		// `New Line created from (${ws.cursorX}, ${ws.cursorY}) to (${ws.cursorX + 5}, ${ws.cursorY + 5})`

		return new Value(null, STATIC_TYPES.NULL);
	}, ['line'])
	.addOverride(
		(params) => {
			ws.elements.push(
				new Line(
					params[1].value as number,
					params[2].value as number,
					params[3].value as number,
					params[4].value as number,
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
			new Connector(wp.cursorX, wp.cursorY, wp.cursorX + 5, wp.cursorY + 5, ws.getId())
		);
		// `New Connector created from (${ws.cursorX}, ${ws.cursorY}) to (${ws.cursorX + 5}, ${ws.cursorY + 5})`,
		return new Value(null, STATIC_TYPES.NULL);
	}, ['connector'])
	.addOverride(
		(params) => {
			console.log(params[1].value);
			ws.elements.push(
				new Connector(
					params[1].value as number,
					params[2].value as number,
					params[3].value as number,
					params[4].value as number,
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
			new Rectangle(wp.cursorX, wp.cursorY, wp.cursorX + 5, wp.cursorY + 5, ws.getId())
		);
		// `New Rectangle created from (${ws.cursorX}, ${ws.cursorY}) to (${ws.cursorX + 5}, ${ws.cursorY + 5})`
		return new Value(null, STATIC_TYPES.NULL);
	}, ['rect'])
	.addOverride(
		(params) => {
			ws.elements.push(
				new Rectangle(
					params[1].value as number,
					params[2].value as number,
					params[3].value as number,
					params[4].value as number,
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
		ws.elements.push(new Bookmark(wp.cursorX, wp.cursorY, 'New Bookmark', ws.getId()));
		// `New Bookmark created at (${ws.cursorX}, ${ws.cursorY})`
		return new Value(null, STATIC_TYPES.NULL);
	}, ['bookmark'])
	.addOverride(
		(params) => {
			ws.elements.push(new Bookmark(wp.cursorX, wp.cursorY, params[1].value as string, ws.getId()));
			// `New Bookmark created at (${ws.cursorX}, ${ws.cursorY}) with the name ${params[1].parsed as string}`
			return new Value(null, STATIC_TYPES.NULL);
		},

		['bookmark'],
		STATIC_TYPES.STRING
	)
	.addOverride(
		(params) => {
			ws.elements.push(
				new Button(wp.cursorX, wp.cursorY, params[1].value as Command, 'New Button', ws.getId())
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
					wp.cursorX,
					wp.cursorY,
					params[1].value as Command,
					params[2].value as string,
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
		ws.elements.push(new Bracket(wp.cursorX, wp.cursorY, 3, ws.getId()));
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
