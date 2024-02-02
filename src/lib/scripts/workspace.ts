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
import { CommandConsole } from './userConsole';
import { Document } from './document';

class Workspace {
	screenText = '';
	graphicsText = '';

	openDocument = new Document('*unsaved*');

	subdocuments: Document[] = [];
	currentSubdocument = -1;

	showCommandCursor = true;

	displayBuffer: Buffer;

	showInvisibleChars = false;

	activeBindings: { x: number; y: number }[] = [];
	isFirstFrame = false;

	characterWidth = 0;
	characterHeight = 0;
	canvasWidth = 0;
	canvasHeight = 0;

	canvasX = 0;
	canvasY = 0;

	renderListeners: ((screen: string) => void)[] = [];

	cursorMargin = 5;

	console: CommandConsole;

	insets = { top: 1, bottom: 5, left: 0, right: 0 };

	constructor() {
		this.displayBuffer = new Buffer(this.canvasWidth, this.canvasHeight, ' ');
		this.console = new CommandConsole(this.insets.bottom);

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
		this.boundCanvas(this.cursorMargin);
		this.displayBuffer = new Buffer(this.canvasWidth, this.canvasHeight, '&nbsp;');

		for (let i = 0; i < this.currentDocument.elements.length; i++) {
			// Display the user's content
			try {
				this.displayBuffer.composite(
					this.currentDocument.elements[i].positionX.value - this.canvasX + this.insets.left,
					this.currentDocument.elements[i].positionY.value - this.canvasY + this.insets.top,
					this.currentDocument.elements[i].render(
						this.currentDocument.elements[i] == this.currentDocument.selected ? 'selected' : ''
					)
				);
			} catch (e) {
				this.console.addLine((e as Error).message, OUTPUT_TYPE.ERROR);
			}
		}

		this.displayBuffer.composite(
			1,
			0,
			new TextBox(
				new BindableInt(0),
				new BindableInt(0),
				new BindableString(this.currentDocument.fileName),
				''
			).render('')
		);

		for (let i = 0; i < this.activeBindings.length; i++)
			this.displayBuffer.composite(
				this.activeBindings[i].x - this.canvasX,
				this.activeBindings[i].y - this.canvasY,
				new TextBox(new BindableInt(0), new BindableInt(0), new BindableString('X'), '').render('')
			); // Display bindings

		this.displayBuffer.composite(
			this.insets.left,
			this.insets.top,
			this.renderRulers(
				this.displayBuffer.width - (this.insets.left + this.insets.right),
				this.displayBuffer.height - (this.insets.top + this.insets.bottom)
			)
		);

		this.displayBuffer.composite(
			0,
			0,
			this.console.render(this.displayBuffer.width, this.displayBuffer.height)
		);

		const output = this.displayBuffer.render();

		this.renderListeners.forEach((val) => {
			val(output);
		});
		this.isFirstFrame = false;
	}

	renderRulers(width: number, height: number) {
		const buffer = new Buffer(width, height, '');
		for (let i = 1; i < width - 1; i++) {
			// Horizontal ruler
			buffer.setChar(i, 0, FRAME_CHARS[0][0][1][1], '');
		}
		for (let i = 1; i < width - 1; i++) {
			// Horizontal ruler
			if ((i + this.canvasX) % 10 == 0 && (i + this.canvasX).toString().length - 1 < width - i) {
				const string = ` ${(i + this.canvasX).toString()} `;
				buffer.composite(
					i - 1,
					0,
					new TextBox(
						new BindableInt(0),
						new BindableInt(0),
						new BindableString(string),
						''
					).render('')
				);
			}
		}
		buffer.setChar(this.currentDocument.cursorX - this.canvasX, 1, FRAME_CHARS[1][1][0][0], '');

		for (let i = 1; i < height; i++) {
			// Vertical ruler
			buffer.setChar(0, i, FRAME_CHARS[1][1][0][0], '');
		}
		for (let i = 1; i < height; i++) {
			// Vertical ruler
			if ((i + this.canvasY) % 10 == 0 && (i + this.canvasY).toString().length + 1 < height - i) {
				const string = ` ${(i + this.canvasY).toString()} `;
				buffer.composite(
					0,
					i - 1,
					new TextBox(
						new BindableInt(0),
						new BindableInt(0),
						new BindableString(string.split('').join('\n')),
						''
					).render('')
				);
			}
		}
		buffer.setChar(1, this.currentDocument.cursorY - this.canvasY, FRAME_CHARS[0][0][1][1], '');

		buffer.setChar(0, 0, FRAME_CHARS[0][1][0][1], '');

		return buffer;
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

	saveElements(path: string) {
		const normalizedPath = path.replace(/^\//, '').replace(/\/$/, '');
		this.openDocument.fileName = normalizedPath;
		localStorage.setItem(normalizedPath, this.openDocument.serialize());
	}

	loadElements(path: string) {
		this.isFirstFrame = true;
		const normalizedPath = path.replace(/^\//, '').replace(/\/$/, '');
		this.openDocument = new Document(path, localStorage.getItem(normalizedPath) ?? undefined);
		this.subdocuments = [];
		this.currentSubdocument = -1;
		this.setCanvasCoords(0, 0);
		this.boundCanvas(this.cursorMargin);
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

		this.currentDocument.invalidateSelection();
	}

	setCanvasCoords(x: number, y: number) {
		this.canvasX = x;
		this.canvasY = y;

		this.currentDocument.invalidateSelection();
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
		if (
			this.currentDocument.cursorY - this.canvasY >
			this.canvasHeight - margin + this.insets.bottom
		) {
			this.currentDocument.cursorY = this.canvasY + this.canvasHeight + margin + this.insets.bottom;
		}
	}

	private boundCanvas(margin: number) {
		if (this.currentDocument.cursorX - this.canvasX < margin + (this.insets.left + 1)) {
			this.canvasX = this.currentDocument.cursorX - margin - (this.insets.left + 1);
		}
		if (
			this.currentDocument.cursorX - this.canvasX >
			this.canvasWidth - margin - (this.insets.right + 1)
		) {
			this.canvasX =
				this.currentDocument.cursorX - this.canvasWidth + margin + (this.insets.right + 1);
		}
		if (this.currentDocument.cursorY - this.canvasY < margin + (this.insets.top + 1)) {
			this.canvasY = this.currentDocument.cursorY - margin - (this.insets.top + 1);
		}
		if (
			this.currentDocument.cursorY - this.canvasY >
			this.canvasHeight - margin - (this.insets.bottom + 1)
		) {
			this.canvasY =
				this.currentDocument.cursorY - this.canvasHeight + margin + (this.insets.bottom + 1);
		}
	}

	get currentDocument() {
		if (this.currentSubdocument !== -1) {
			return this.subdocuments[this.currentSubdocument];
		}
		return this.openDocument;
	}

	openSubdocument(name: string) {
		this.subdocuments.push(new Document(`${this.currentDocument.fileName} > ${name}`));
		this.currentSubdocument = this.subdocuments.length - 1;
		this.setCanvasCoords(0, 0);
		this.boundCanvas(this.cursorMargin);
	}

	closeSubdocument() {
		this.subdocuments.pop();
		this.currentSubdocument = this.subdocuments.length - 1;
		this.setCanvasCoords(0, 0);
		this.boundCanvas(this.cursorMargin);
	}
}

export const workspace = new Workspace();
// export { Modes, ShapeTypes };
