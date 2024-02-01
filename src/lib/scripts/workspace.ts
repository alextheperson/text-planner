import Buffer from './buffer';
import { CommandOutput, OUTPUT_TYPE } from './commands';
import { Modes } from './modes';
import { FRAME_CHARS, type Shape } from './shapes/shape';
import { TextBox } from './shapes/textbox';
import { BindableInt, BindableString } from './dataType';

import './commands/bindings';
import './commands/create';
import './commands/edit';
import './commands/io';
import './commands/math';
import './commands/movement';
import './commands/settings';
import './commands/logic';
import './commands/strings';
import './commands/typeConversion';
import { UserConsole } from './userConsole';
import { Document } from './document';

class Workspace {
	screenText = '';
	graphicsText = '';

	currentDocument = new Document();

	showCommandCursor = true;

	displayBuffer: Buffer;

	showInvisibleChars = false;

	writable = true;
	allowedModes = [Modes.VIEW_MODE, Modes.EDIT_MODE, Modes.MOVE_MODE, Modes.COMMAND];
	fileName = '';

	activeBindings: { x: number; y: number }[] = [];
	isFirstFrame = false;

	characterWidth = 0;
	characterHeight = 0;
	canvasWidth = 0;
	canvasHeight = 0;

	canvasX = 0;
	canvasY = 0;

	renderListeners: ((screen: string) => void)[] = [];

	margin = 5;

	constructor() {
		// setInterval(() => {
		// 	this.showCommandCursor = !this.showCommandCursor;
		// 	this.drawScreen();
		// }, 550);
		this.displayBuffer = new Buffer(this.canvasWidth, this.canvasHeight, ' ');

		this.currentDocument.setCursorCoords(0, 0);
	}

	underCursor(): Shape | null {
		for (let i = 0; i < this.currentDocument.elements.length; i++) {
			if (
				this.currentDocument.elements[i] &&
				this.currentDocument.elements[i].isOn(
					this.currentDocument.cursorX,
					this.currentDocument.cursorY
				)
			) {
				return this.currentDocument.elements[i];
			}
		}
		return null;
	}

	// click(e: MouseEvent) {
	// 	ModeManager.currentMode.click(e)
	// }

	render() {
		this.boundCanvas(this.margin);
		this.displayBuffer = new Buffer(this.canvasWidth, this.canvasHeight, '&nbsp;');

		for (let i = 0; i < this.currentDocument.elements.length; i++) {
			// Display the user's content
			try {
				this.displayBuffer.composite(
					this.currentDocument.elements[i].positionX.value - this.canvasX,
					this.currentDocument.elements[i].positionY.value - this.canvasY,
					this.currentDocument.elements[i].render(
						this.currentDocument.elements[i] == this.currentDocument.selected ? 'selected' : ''
					)
				);
			} catch (e) {
				UserConsole.addLine((e as Error).message, OUTPUT_TYPE.ERROR);
			}
		}

		for (let i = 0; i < this.activeBindings.length; i++)
			this.displayBuffer.composite(
				this.activeBindings[i].x - this.canvasX,
				this.activeBindings[i].y - this.canvasY,
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
				(i + this.canvasX) % 10 == 0 &&
				(i + this.canvasX).toString().length - 1 < this.displayBuffer.width - i
			) {
				const string = ` ${(i + this.canvasX).toString()} `;
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
		this.displayBuffer.setChar(
			this.currentDocument.cursorX - this.canvasX,
			1,
			FRAME_CHARS[1][1][0][0],
			''
		);

		for (let i = 1; i < this.displayBuffer.height - 5; i++) {
			// Vertical ruler
			this.displayBuffer.setChar(0, i, FRAME_CHARS[1][1][0][0], '');
		}
		for (let i = 1; i < this.displayBuffer.height - 5; i++) {
			// Vertical ruler
			if (
				(i + this.canvasY) % 10 == 0 &&
				(i + this.canvasY).toString().length + 1 < this.displayBuffer.height - i
			) {
				const string = ` ${(i + this.canvasY).toString()} `;
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
		this.displayBuffer.setChar(
			1,
			this.currentDocument.cursorY - this.canvasY,
			FRAME_CHARS[0][0][1][1],
			''
		);

		this.displayBuffer.setChar(0, 0, FRAME_CHARS[0][1][0][1], '');

		this.displayBuffer.composite(
			0,
			0,
			UserConsole.render(this.displayBuffer.width, this.displayBuffer.height)
		);

		const output = this.displayBuffer.render();

		this.renderListeners.forEach((val) => {
			val(output);
		});
		this.isFirstFrame = false;
	}

	// runCommand(command: string) {
	// 	try {
	// 		const output = parseExpression(command);
	// 		if (output instanceof Value) {
	// 			UserConsole.currentOutput = new CommandOutput(
	// 				`(${STATIC_TYPES[output.type]}) ${output.value}`,
	// 				OUTPUT_TYPE.NORMAL
	// 			);
	// 		}
	// 		if (output instanceof CommandOutput) {
	// 			UserConsole.currentOutput = output;
	// 		}
	// 	} catch (e) {
	// 		UserConsole.currentOutput = new CommandOutput((e as Error).message, OUTPUT_TYPE.ERROR);
	// 	}
	// 	this.drawScreen();
	// }

	cullElements() {
		for (let i = 0; i < this.currentDocument.elements.length; i++) {
			if (this.currentDocument.elements[i].shouldRemove) {
				this.currentDocument.elements.splice(i, 1);
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
			cursorPositionX: this.currentDocument.cursorX,
			cursorPositionY: this.currentDocument.cursorY,
			viewPositionX: this.canvasX,
			viewPositionY: this.canvasY,
			allowedModes: this.allowedModes
		});
		this.currentDocument.elements.forEach((el) => {
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

	loadElements(path: string) {
		this.isFirstFrame = true;
		const normalizedPath = path.replace(/^\//, '').replace(/\/$/, '');
		this.currentDocument = new Document(localStorage.getItem(normalizedPath) ?? undefined);
	}

	getId(): string {
		return 'a' + Math.floor(Math.random() * 1000);
	}

	subscribe(cb: (screen: string) => void) {
		this.renderListeners.push(cb);
	}

	moveCanvas(x: number, y: number) {
		this.canvasX += x;
		this.canvasY += y;
	}

	setCanvasCoords(x: number, y: number) {
		this.canvasX = x;
		this.canvasY = y;
	}

	private boundCursor(margin: number) {
		if (this.currentDocument.cursorX - this.canvasX < margin + 1) {
			this.currentDocument.cursorX = this.canvasX + margin + 1;
		}
		if (this.currentDocument.cursorX - this.canvasX > this.canvasWidth - margin + 1) {
			this.currentDocument.cursorX = this.canvasX + this.canvasWidth + margin + 1;
		}
		if (this.currentDocument.cursorY - this.canvasY < margin + 1) {
			this.currentDocument.cursorY = this.canvasY + margin + 1;
		}
		if (this.currentDocument.cursorY - this.canvasY > this.canvasHeight - margin + 3) {
			this.currentDocument.cursorY = this.canvasY + this.canvasHeight + margin + 3;
		}
	}

	private boundCanvas(margin: number) {
		if (this.currentDocument.cursorX - this.canvasX < margin + 1) {
			this.canvasX = this.currentDocument.cursorX - margin - 1;
		}
		if (this.currentDocument.cursorX - this.canvasX > this.canvasWidth - margin - 1) {
			this.canvasX = this.currentDocument.cursorX - this.canvasWidth + margin + 1;
		}
		if (this.currentDocument.cursorY - this.canvasY < margin + 1) {
			this.canvasY = this.currentDocument.cursorY - margin - 1;
		}
		if (this.currentDocument.cursorY - this.canvasY > this.canvasHeight - margin - 3) {
			this.canvasY = this.currentDocument.cursorY - this.canvasHeight + margin + 3;
		}
	}
}

export const workspace = new Workspace();
// export { Modes, ShapeTypes };
