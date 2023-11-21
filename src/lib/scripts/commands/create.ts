import Vector2 from '../vector';
import { workspace as ws } from '../workspace';
import { TextBox } from '../shapes/textbox';
import { Line } from '../shapes/line';
import { Connector } from '../shapes/connector';
import { Rectangle } from '../shapes/rectangle';
import { Bookmark } from '../shapes/bookmark';
import { Button } from '../shapes/button';
import { wp } from '$lib/components/stores';
import Bracket, { BracketType } from '../shapes/bracket';
import { Side } from '../shapes/shape';
import { CommandDefinition } from '../commands';
import { Int, STATIC_TYPES, Value } from '../dataType';

new CommandDefinition('new')
	.addOverride(() => {
		ws.elements.push(new TextBox(new Vector2(wp.cursor.x, wp.cursor.y), 'New Text'));
		console.log('abc');
		// `New TextBox created at (${ws.cursor.x}, ${ws.cursor.y})`
		return new Value(null, STATIC_TYPES.NULL);
	}, ['text'])
	.addOverride(
		(params) => {
			ws.elements.push(
				new TextBox(new Vector2(wp.cursor.x, wp.cursor.y), params[1].value as string)
			);
			console.log('abc');
			// `New TextBox created at (${ws.cursor.x}, ${ws.cursor.y}) with the content '${params[1].parsed.toString()}'`
			return new Value(null, STATIC_TYPES.NULL);
		},
		['text'],
		STATIC_TYPES.STRING
	)
	.addOverride(() => {
		ws.elements.push(new Line(wp.cursor.x, wp.cursor.y, wp.cursor.x + 5, wp.cursor.y + 5));
		// `New Line created from (${ws.cursor.x}, ${ws.cursor.y}) to (${ws.cursor.x + 5}, ${ws.cursor.y + 5})`

		return new Value(null, STATIC_TYPES.NULL);
	}, ['line'])
	.addOverride(
		(params) => {
			ws.elements.push(
				new Line(
					(params[1].value as Vector2).x,
					(params[1].value as Vector2).y,
					(params[2].value as Vector2).x,
					(params[2].value as Vector2).y
				)
			);
			// `New Line created from (${params[1].parsed as number}, ${params[2].parsed as number}) to (${params[3].parsed as number}, ${params[4].parsed as number})`

			return new Value(null, STATIC_TYPES.NULL);
		},
		['line'],
		STATIC_TYPES.VECTOR,
		STATIC_TYPES.VECTOR
	)
	.addOverride(() => {
		ws.elements.push(new Connector(wp.cursor.x, wp.cursor.y, wp.cursor.x + 5, wp.cursor.y + 5));
		// `New Connector created from (${ws.cursor.x}, ${ws.cursor.y}) to (${ws.cursor.x + 5}, ${ws.cursor.y + 5})`,
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
					params[4].value as number
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
		ws.elements.push(new Rectangle(wp.cursor.x, wp.cursor.y, wp.cursor.x + 5, wp.cursor.y + 5));
		// `New Rectangle created from (${ws.cursor.x}, ${ws.cursor.y}) to (${ws.cursor.x + 5}, ${ws.cursor.y + 5})`
		return new Value(null, STATIC_TYPES.NULL);
	}, ['rect'])
	.addOverride(
		(params) => {
			ws.elements.push(
				new Rectangle(
					params[1].value as number,
					params[2].value as number,
					params[3].value as number,
					params[4].value as number
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
		ws.elements.push(new Bookmark(new Vector2(wp.cursor.x, wp.cursor.y), 'New Bookmark'));
		// `New Bookmark created at (${ws.cursor.x}, ${ws.cursor.y})`
		return new Value(null, STATIC_TYPES.NULL);
	}, ['bookmark'])
	.addOverride(
		(params) => {
			ws.elements.push(
				new Bookmark(new Vector2(wp.cursor.x, wp.cursor.y), params[1].value as string)
			);
			// `New Bookmark created at (${ws.cursor.x}, ${ws.cursor.y}) with the name ${params[1].parsed as string}`
			return new Value(null, STATIC_TYPES.NULL);
		},

		['bookmark'],
		STATIC_TYPES.STRING
	)
	.addOverride(
		(params) => {
			ws.elements.push(
				new Button(new Vector2(wp.cursor.x, wp.cursor.y), params[1].value as string, 'New Button')
			);
			// `New Button created at (${ws.cursor.x}, ${ws.cursor.y}) with the action ${params[1].parsed as string}`
			return new Value(null, STATIC_TYPES.NULL);
		},
		['button'],
		STATIC_TYPES.STRING
	)
	.addOverride(
		(params) => {
			ws.elements.push(
				new Button(
					new Vector2(wp.cursor.x, wp.cursor.y),
					params[1].value as string,
					params[2].value as string
				)
			);
			// `New Button created at (${ws.cursor.x}, ${ws.cursor.y}) with the action ${params[1].parsed as string} text ${params[2].parsed as string}`
			return new Value(null, STATIC_TYPES.NULL);
		},

		['button'],
		STATIC_TYPES.STRING,
		STATIC_TYPES.STRING
	)
	.addOverride(() => {
		ws.elements.push(
			new Bracket(new Vector2(wp.cursor.x, wp.cursor.y), 3, BracketType.CURLY, Side.LEFT)
		);
		// `New Button created at (${ws.cursor.x}, ${ws.cursor.y}) with the action ${params[1].parsed as string} text ${params[2].parsed as string}`
		return new Value(null, STATIC_TYPES.NULL);
	}, ['bracket'])
	.addOverride(() => {
		ws.elements = [];
		ws.fileName = '';
		wp.setCursorCoords(new Vector2(0, 0));
		wp.setCanvasCoords(new Vector2(0, 0));
		return new Value(null, STATIC_TYPES.NULL);
	}, ['file'])
	.register();
