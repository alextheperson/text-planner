import Vector2 from '../vector';
import {
	IntParameter,
	Pattern,
	StaticParameter,
	StringParameter,
	Vector2Parameter
} from './command-definition';
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

const createCommandName = ['new'];

export default [
	new Pattern([new StaticParameter(createCommandName), new StaticParameter(['text'])], () => {
		ws.elements.push(new TextBox(new Vector2(wp.cursor.x, wp.cursor.y), 'New Text'));
		// `New TextBox created at (${ws.cursor.x}, ${ws.cursor.y})`
	}),
	new Pattern(
		[new StaticParameter(createCommandName), new StaticParameter(['text']), new StringParameter()],
		(params) => {
			ws.elements.push(new TextBox(new Vector2(wp.cursor.x, wp.cursor.y), params[1].getString()));
			// `New TextBox created at (${ws.cursor.x}, ${ws.cursor.y}) with the content '${params[1].parsed.toString()}'`
		}
	),
	new Pattern([new StaticParameter(createCommandName), new StaticParameter(['line'])], () => {
		ws.elements.push(new Line(wp.cursor.x, wp.cursor.y, wp.cursor.x + 5, wp.cursor.y + 5));
		// `New Line created from (${ws.cursor.x}, ${ws.cursor.y}) to (${ws.cursor.x + 5}, ${ws.cursor.y + 5})`
	}),
	new Pattern(
		[
			new StaticParameter(createCommandName),
			new StaticParameter(['line']),
			new Vector2Parameter(),
			new Vector2Parameter()
		],
		(params) => {
			ws.elements.push(
				new Line(
					params[1].getVector().x,
					params[1].getVector().y,
					params[2].getVector().x,
					params[2].getVector().y
				)
			);
			// `New Line created from (${params[1].parsed as number}, ${params[2].parsed as number}) to (${params[3].parsed as number}, ${params[4].parsed as number})`
		}
	),
	new Pattern([new StaticParameter(createCommandName), new StaticParameter(['connector'])], () => {
		ws.elements.push(new Connector(wp.cursor.x, wp.cursor.y, wp.cursor.x + 5, wp.cursor.y + 5));
		// `New Connector created from (${ws.cursor.x}, ${ws.cursor.y}) to (${ws.cursor.x + 5}, ${ws.cursor.y + 5})`,
	}),
	new Pattern(
		[
			new StaticParameter(createCommandName),
			new StaticParameter(['connector']),
			new IntParameter(),
			new IntParameter(),
			new IntParameter(),
			new IntParameter()
		],
		(params) => {
			ws.elements.push(
				new Connector(
					params[1].getInt(),
					params[2].getInt(),
					params[3].getInt(),
					params[4].getInt()
				)
			);
			// `New Connector created from (${params[1].parsed as number}, ${params[2].parsed as number}) to (${params[3].parsed as number}, ${params[4].parsed as number})`
		}
	),
	new Pattern([new StaticParameter(createCommandName), new StaticParameter(['rect'])], () => {
		ws.elements.push(new Rectangle(wp.cursor.x, wp.cursor.y, wp.cursor.x + 5, wp.cursor.y + 5));
		// `New Rectangle created from (${ws.cursor.x}, ${ws.cursor.y}) to (${ws.cursor.x + 5}, ${ws.cursor.y + 5})`
	}),
	new Pattern(
		[
			new StaticParameter(createCommandName),
			new StaticParameter(['rect']),
			new IntParameter(),
			new IntParameter(),
			new IntParameter(),
			new IntParameter()
		],
		(params) => {
			ws.elements.push(
				new Rectangle(
					params[1].getInt(),
					params[2].getInt(),
					params[3].getInt(),
					params[4].getInt()
				)
			);
			// `New Rectangle created from (${params[1].parsed as number}, ${params[2].parsed as number}) to (${params[3].parsed as number}, ${params[4].parsed as number})`
		}
	),
	new Pattern([new StaticParameter(createCommandName), new StaticParameter(['bookmark'])], () => {
		ws.elements.push(new Bookmark(new Vector2(wp.cursor.x, wp.cursor.y), 'New Bookmark'));
		// `New Bookmark created at (${ws.cursor.x}, ${ws.cursor.y})`
	}),
	new Pattern(
		[
			new StaticParameter(createCommandName),
			new StaticParameter(['bookmark']),
			new StringParameter()
		],
		(params) => {
			ws.elements.push(new Bookmark(new Vector2(wp.cursor.x, wp.cursor.y), params[1].getString()));
			// `New Bookmark created at (${ws.cursor.x}, ${ws.cursor.y}) with the name ${params[1].parsed as string}`
		}
	),
	new Pattern(
		[
			new StaticParameter(createCommandName),
			new StaticParameter(['button']),
			new StringParameter()
		],
		(params) => {
			ws.elements.push(
				new Button(new Vector2(wp.cursor.x, wp.cursor.y), params[1].getString(), 'New Button')
			);
			// `New Button created at (${ws.cursor.x}, ${ws.cursor.y}) with the action ${params[1].parsed as string}`
		}
	),
	new Pattern(
		[
			new StaticParameter(createCommandName),
			new StaticParameter(['button']),
			new StringParameter(),
			new StringParameter()
		],
		(params) => {
			ws.elements.push(
				new Button(
					new Vector2(wp.cursor.x, wp.cursor.y),
					params[1].getString(),
					params[2].getString()
				)
			);
			// `New Button created at (${ws.cursor.x}, ${ws.cursor.y}) with the action ${params[1].parsed as string} text ${params[2].parsed as string}`
		}
	),
	new Pattern([new StaticParameter(createCommandName), new StaticParameter(['bracket'])], () => {
		ws.elements.push(
			new Bracket(new Vector2(wp.cursor.x, wp.cursor.y), 3, BracketType.CURLY, Side.LEFT)
		);
		// `New Button created at (${ws.cursor.x}, ${ws.cursor.y}) with the action ${params[1].parsed as string} text ${params[2].parsed as string}`
	}),
	new Pattern([new StaticParameter(createCommandName), new StaticParameter(['file'])], () => {
		ws.elements = [];
		ws.fileName = '';
	})
];
