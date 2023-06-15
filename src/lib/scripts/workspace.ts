import { display } from '$lib/components/stores';
import Buffer from './buffer';
import { parseCommand } from './commands';
import { CommandOutput, OutputType } from './commands/command-definition';
import ModeManager, { CommandMode, Modes } from './modes';
import { ShapeList as SHAPES } from './shapes/index';
import { FRAME_CHARS, type Shape } from './shapes/shape';
import { TextBox } from './shapes/textbox';
import Vector2 from './vector';
import { wp } from '$lib/components/stores';
class Workspace {
	selected: Shape | null = null;

	screenText = '';
	graphicsText = '';

	elements: Array<Shape> = [];

	showCommandCursor = true;

	displayBuffer: Buffer;

	currentCommand = '';
	lastCommand = '';
	currentOutput = new CommandOutput('', OutputType.NORMAL);

	showInvisibleChars = false;

	writable = true;
	allowedModes = [Modes.VIEW_MODE, Modes.EDIT_MODE, Modes.MOVE_MODE, Modes.COMMAND];
	fileName = '';

	constructor() {
		// setInterval(() => {
		// 	this.showCommandCursor = !this.showCommandCursor;
		// 	this.drawScreen();
		// }, 550);
		this.displayBuffer = new Buffer(wp.canvasSize.x, wp.canvasSize.y, ' ');

		wp.subscribe(() => {
			this.drawScreen();
		});

		wp.setCursorCoords(new Vector2(0, 0));
	}

	underCursor(): Shape | null {
		for (let i = 0; i < this.elements.length; i++) {
			if (this.elements[i] && this.elements[i].isOn(wp.cursor.x, wp.cursor.y)) {
				return this.elements[i];
			}
		}
		return null;
	}

	// click(e: MouseEvent) {
	// 	ModeManager.currentMode.click(e)
	// }

	drawScreen() {
		this.displayBuffer = new Buffer(wp.canvasSize.x, wp.canvasSize.y, '&nbsp;');

		for (let i = 0; i < this.elements.length; i++) {
			// Display the user's content
			this.displayBuffer.composite(
				this.elements[i].position.x - wp.canvas.x,
				this.elements[i].position.y - wp.canvas.y,
				this.elements[i].render(this.elements[i] == this.selected ? 'selected' : '')
			);
		}

		for (let i = 1; i < this.displayBuffer.width - 1; i++) {
			// Horizontal ruler
			this.displayBuffer.setChar(i, 0, FRAME_CHARS[0][0][1][1], '');
		}
		for (let i = 1; i < this.displayBuffer.width - 1; i++) {
			// Horizontal ruler
			if (
				(i + wp.canvas.x) % 10 == 0 &&
				(i + wp.canvas.x).toString().length - 1 < this.displayBuffer.width - i
			) {
				const string = ` ${(i + wp.canvas.x).toString()} `;
				this.displayBuffer.composite(i - 1, 0, new TextBox(new Vector2(0, 0), string).render(''));
			}
		}
		for (let i = 1; i < this.displayBuffer.height - 1; i++) {
			// Vertical ruler
			this.displayBuffer.setChar(0, i, FRAME_CHARS[1][1][0][0], '');
		}
		for (let i = 1; i < this.displayBuffer.height - 1; i++) {
			// Vertical ruler
			if (
				(i + wp.canvas.y) % 10 == 0 &&
				(i + wp.canvas.y).toString().length + 1 < this.displayBuffer.height - i
			) {
				const string = ` ${(i + wp.canvas.y).toString()} `;
				this.displayBuffer.composite(
					0,
					i - 1,
					new TextBox(new Vector2(0, 0), string.split('').join('\n')).render('')
				);
			}
		}

		this.displayBuffer.setChar(0, 0, FRAME_CHARS[0][1][0][1], '');

		let modeString = `|-????-|`;
		if (ModeManager.mode == Modes.VIEW_MODE) {
			modeString = `|-View-|`;
		} else if (ModeManager.mode == Modes.EDIT_MODE) {
			modeString = `|-Edit-|`;
		} else if (ModeManager.mode == Modes.MOVE_MODE) {
			modeString = `|-Move-|`;
		} else if (ModeManager.mode == Modes.COMMAND) {
			modeString = `|-Type-|`;
		}

		const permString = this.writable ? '' : `Readonly`;

		this.displayBuffer.composite(
			8,
			this.displayBuffer.height - 2,
			new TextBox(
				new Vector2(0, 0),
				'&lt;|' +
					(ModeManager.currentMode instanceof CommandMode
						? ModeManager.currentMode.currentCommand + '_'
						: '')
			).render('')
		); // Display the command prompt
		this.displayBuffer.composite(
			8,
			this.displayBuffer.height - 1,
			new TextBox(new Vector2(0, 0), '|>').render('')
		);
		this.displayBuffer.composite(
			10,
			this.displayBuffer.height - 1,
			new TextBox(new Vector2(0, 0), this.currentOutput.content).render(
				this.currentOutput.type == OutputType.NORMAL
					? ''
					: this.currentOutput.type == OutputType.ERROR
					? 'error'
					: this.currentOutput.type == OutputType.WARNING
					? 'warning'
					: ''
			)
		); // Display the output prompt
		this.displayBuffer.composite(
			0,
			this.displayBuffer.height - 2,
			new TextBox(new Vector2(0, 0), modeString).render('')
		);
		this.displayBuffer.composite(
			0,
			this.displayBuffer.height - 1,
			new TextBox(new Vector2(0, 0), permString).render('')
		);

		if (ModeManager.currentMode instanceof CommandMode) {
			let optionString = '';
			for (let i = 0; i < ModeManager.currentMode.options.length; i++) {
				if (ModeManager.currentMode.autofillSelection === i) {
					optionString += '> ' + ModeManager.currentMode.options[i] + '\n';
				} else {
					optionString += '  ' + ModeManager.currentMode.options[i] + '\n';
				}
			}
			this.displayBuffer.composite(
				ModeManager.currentMode.currentCommand.lastIndexOf(' ') + 9,
				this.displayBuffer.height - ModeManager.currentMode.options.length - 2,
				new TextBox(new Vector2(0, 0), optionString).render('')
			);
		}

		display.set(this.displayBuffer.render());
	}

	runCommand(command: string) {
		const output = parseCommand(command);
		if (output instanceof CommandOutput) {
			this.currentOutput = output;
		}
		this.selected = this.underCursor();
		this.drawScreen();
	}

	cullElements() {
		for (let i = 0; i < this.elements.length; i++) {
			if (this.elements[i].shouldRemove) {
				this.elements.splice(i, 1);
				i -= 1; //since we just deleted an element
			}
		}
	}

	saveElements(path: string): CommandOutput {
		const normalizedPath = path.replace(/^\//, '').replace(/\/$/, '');
		let string = '';
		let output = new CommandOutput(
			`Saved the workspace to file ${normalizedPath}`,
			OutputType.NORMAL
		);
		string = JSON.stringify({
			cursorPosition: wp.cursor,
			viewPosition: new Vector2(wp.canvas.x, wp.canvas.y),
			allowedModes: this.allowedModes
		});
		this.elements.forEach((el) => {
			const stringified = (el.constructor as typeof Shape).serialize(el);
			if (stringified.match(/.*\[,\].*/) !== null) {
				output = new CommandOutput(
					`Saved the workspace to file ${normalizedPath}, but it contained '[,]' which had to be escaped.`,
					OutputType.WARNING
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
		const normalizedPath = path.replace(/^\//, '').replace(/\/$/, '');
		const parts = localStorage.getItem(normalizedPath)?.split('[,]') ?? [];
		if (parts.length < 1) {
			return new CommandOutput(`The files ${normalizedPath} does not exist`, OutputType.ERROR);
		}
		const list = parts.slice(1);
		const state = JSON.parse(parts[0]);
		this.elements = [];
		list?.map((el) => {
			if (el === '') {
				return;
			}
			for (let i = 0; i < SHAPES.length; i++) {
				const decoded = SHAPES[i].deserialize(el);
				if (decoded !== null) {
					this.elements.push(decoded);
				}
			}
		});
		this.fileName = normalizedPath;
		wp.setCursorCoords(
			new Vector2(state['cursorPosition']['x'] ?? 0, state['cursorPosition']['y'] ?? 0)
		);
		wp.setCanvasCoords(new Vector2(state['viewPosition']['x'], state['viewPosition']['y']));
		this.allowedModes = state['allowedModes'];
		ModeManager.setMode(Modes.VIEW_MODE);
		return new CommandOutput(`Loaded the workspace ${path}`, OutputType.NORMAL);
	}

	getId(): number {
		return 1;
	}
}

export const workspace = new Workspace();
// export { Modes, ShapeTypes };
