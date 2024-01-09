import { display } from '$lib/components/stores';
import Buffer from './buffer';
import { parseExpression, CommandOutput, OUTPUT_TYPE } from './commands';
import ModeManager, { Modes } from './modes';
import { ShapeList as SHAPES } from './shapes/index';
import { FRAME_CHARS, type SerializedShape, type Shape } from './shapes/shape';
import { TextBox } from './shapes/textbox';
import { wp } from '$lib/components/stores';
import { BindableInt, BindableString, STATIC_TYPES, Value } from './dataType';

import './commands/bindings';
import './commands/create';
import './commands/edit';
import './commands/io';
import './commands/math';
import './commands/movement';
import './commands/settings';
import './commands/logic';
import { UserConsole } from './userConsole';

class Workspace {
	selected: Shape | null = null;

	screenText = '';
	graphicsText = '';

	elements: Array<Shape> = [];

	showCommandCursor = true;

	displayBuffer: Buffer;

	currentCommand = '';
	lastCommand = '';
	currentOutput = new CommandOutput('', OUTPUT_TYPE.NORMAL);

	showInvisibleChars = false;

	writable = true;
	allowedModes = [Modes.VIEW_MODE, Modes.EDIT_MODE, Modes.MOVE_MODE, Modes.COMMAND];
	fileName = '';

	activeBindings: { x: number; y: number }[] = [];
	isFirstFrame = false;

	constructor() {
		// setInterval(() => {
		// 	this.showCommandCursor = !this.showCommandCursor;
		// 	this.drawScreen();
		// }, 550);
		this.displayBuffer = new Buffer(wp.canvasWidth, wp.canvasHeight, ' ');

		wp.subscribe(() => {
			this.drawScreen();
		});

		wp.setCursorCoords(0, 0);
	}

	underCursor(): Shape | null {
		for (let i = 0; i < this.elements.length; i++) {
			if (this.elements[i] && this.elements[i].isOn(wp.cursorX, wp.cursorY)) {
				return this.elements[i];
			}
		}
		return null;
	}

	// click(e: MouseEvent) {
	// 	ModeManager.currentMode.click(e)
	// }

	drawScreen() {
		this.displayBuffer = new Buffer(wp.canvasWidth, wp.canvasHeight, '&nbsp;');

		for (let i = 0; i < this.elements.length; i++) {
			// Display the user's content
			this.displayBuffer.composite(
				this.elements[i].positionX.value - wp.canvasX,
				this.elements[i].positionY.value - wp.canvasY,
				this.elements[i].render(this.elements[i] == this.selected ? 'selected' : '')
			);
		}

		for (let i = 0; i < this.activeBindings.length; i++)
			this.displayBuffer.composite(
				this.activeBindings[i].x - wp.canvasX,
				this.activeBindings[i].y - wp.canvasY,
				new TextBox(
					new BindableInt(0),
					new BindableInt(0),
					new BindableString('X'),
					this.getId()
				).render('')
			); // Display bindings

		for (let i = 1; i < this.displayBuffer.width - 1; i++) {
			// Horizontal ruler
			this.displayBuffer.setChar(i, 0, FRAME_CHARS[0][0][1][1], '');
		}
		for (let i = 1; i < this.displayBuffer.width - 1; i++) {
			// Horizontal ruler
			if (
				(i + wp.canvasX) % 10 == 0 &&
				(i + wp.canvasX).toString().length - 1 < this.displayBuffer.width - i
			) {
				const string = ` ${(i + wp.canvasX).toString()} `;
				this.displayBuffer.composite(
					i - 1,
					0,
					new TextBox(
						new BindableInt(0),
						new BindableInt(0),
						new BindableString(string),
						this.getId()
					).render('')
				);
			}
		}
		this.displayBuffer.setChar(wp.cursorX - wp.canvasX, 1, FRAME_CHARS[1][1][0][0], '');

		for (let i = 1; i < this.displayBuffer.height - 5; i++) {
			// Vertical ruler
			this.displayBuffer.setChar(0, i, FRAME_CHARS[1][1][0][0], '');
		}
		for (let i = 1; i < this.displayBuffer.height - 5; i++) {
			// Vertical ruler
			if (
				(i + wp.canvasY) % 10 == 0 &&
				(i + wp.canvasY).toString().length + 1 < this.displayBuffer.height - i
			) {
				const string = ` ${(i + wp.canvasY).toString()} `;
				this.displayBuffer.composite(
					0,
					i - 1,
					new TextBox(
						new BindableInt(0),
						new BindableInt(0),
						new BindableString(string.split('').join('\n')),
						this.getId()
					).render('')
				);
			}
		}
		this.displayBuffer.setChar(1, wp.cursorY - wp.canvasY, FRAME_CHARS[0][0][1][1], '');

		this.displayBuffer.setChar(0, 0, FRAME_CHARS[0][1][0][1], '');

		this.displayBuffer.composite(
			0,
			0,
			UserConsole.render(this.displayBuffer.width, this.displayBuffer.height)
		);

		display.set(this.displayBuffer.render());
		this.isFirstFrame = false;
	}

	runCommand(command: string) {
		try {
			const output = parseExpression(command);
			if (output instanceof Value) {
				this.currentOutput = new CommandOutput(
					`(${STATIC_TYPES[output.type]}) ${output.value}`,
					OUTPUT_TYPE.NORMAL
				);
			}
			if (output instanceof CommandOutput) {
				this.currentOutput = output;
			}
		} catch (e) {
			this.currentOutput = new CommandOutput((e as Error).message, OUTPUT_TYPE.ERROR);
		}
		this.selected = this.underCursor();
		this.drawScreen();
	}

	cullElements() {
		for (let i = 0; i < this.elements.length; i++) {
			if (this.elements[i].shouldRemove) {
				console.log(this.elements[i]);
				this.elements.splice(i, 1);
				console.log(this.elements, i);
				i -= 1; //since we just deleted an element
			}
		}
	}

	saveElements(path: string): CommandOutput {
		const normalizedPath = path.replace(/^\//, '').replace(/\/$/, '');
		let string = '';
		let output = new CommandOutput(
			`Saved the workspace to file ${normalizedPath}`,
			OUTPUT_TYPE.NORMAL
		);
		string = JSON.stringify({
			cursorPositionX: wp.cursorX,
			cursorPositionY: wp.cursorY,
			viewPositionX: wp.canvasX,
			viewPositionY: wp.canvasY,
			allowedModes: this.allowedModes
		});
		this.elements.forEach((el) => {
			const stringified = JSON.stringify((el.constructor as typeof Shape).serialize(el));
			if (stringified.match(/.*\[,\].*/) !== null) {
				output = new CommandOutput(
					`Saved the workspace to file ${normalizedPath}, but it contained '[,]' which had to be escaped.`,
					OUTPUT_TYPE.WARNING
				);
			}
			string += '[,]' + stringified.replace('[,]', '[]');
		});
		localStorage.setItem(normalizedPath, string);

		// const fileList = JSON.parse(localStorage.getItem('$files') ?? '[]');
		// if (!fileList.includes(normalizedPath) && !path.startsWith('$')) {
		// 	localStorage.setItem('$files', JSON.stringify(fileList.concat(normalizedPath)));
		// }

		return output;
	}

	loadElements(path: string): CommandOutput {
		this.isFirstFrame = true;
		const normalizedPath = path.replace(/^\//, '').replace(/\/$/, '');
		const parts = localStorage.getItem(normalizedPath)?.split('[,]') ?? [];
		if (parts.length < 1) {
			return new CommandOutput(`The files ${normalizedPath} does not exist`, OUTPUT_TYPE.ERROR);
		}
		const list = parts.slice(1);
		const state = JSON.parse(parts[0]);
		this.elements = [];
		list?.map((el) => {
			if (el === '') {
				return;
			}
			for (let i = 0; i < SHAPES.length; i++) {
				const decoded = SHAPES[i].deserialize(JSON.parse(el) as SerializedShape);
				if (decoded !== null) {
					this.elements.push(decoded);
				}
			}
		});
		this.fileName = normalizedPath;
		wp.setCursorCoords(state['cursorPositionX'] ?? 0, state['cursorPositionY'] ?? 0);
		wp.setCanvasCoords(state['viewPositionX'], state['viewPositionY']);
		this.allowedModes = state['allowedModes'];
		ModeManager.setMode(Modes.VIEW_MODE);
		return new CommandOutput(`Loaded the workspace ${path}`, OUTPUT_TYPE.NORMAL);
	}

	getId(): string {
		return 'a' + Math.floor(Math.random() * 1000);
	}
}

export const workspace = new Workspace();
// export { Modes, ShapeTypes };
