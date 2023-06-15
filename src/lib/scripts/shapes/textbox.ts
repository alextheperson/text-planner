/* eslint-disable @typescript-eslint/no-unused-vars */
import { wp } from '$lib/components/stores';
import Buffer from '../buffer';
import { keymap } from '../keymap';
import Vector2 from '../vector';
import { workspace as ws } from '../workspace';
import type { Shape } from './shape';

export class TextBox implements Shape {
	position: Vector2;
	size!: Vector2;
	content: string;
	hasBorder = false;
	shouldRemove = false;
	readonly id: number;

	constructor(position: Vector2, content: string) {
		this.position = position;
		this.content = content;

		this.id = 1;

		this.updateDimensions();
	}

	addCharAt(char: string, at: number) {
		this.content = this.content.slice(0, at) + char + this.content.slice(at);
		this.updateCursorPosition(1);
	}

	deleteAt(at: number) {
		this.content = this.content.slice(0, Math.max(at - 1, 0)) + this.content.slice(at);
		this.updateCursorPosition(-1);
	}

	updateDimensions() {
		const lines = this.content.split('\n');
		this.size = new Vector2(0, lines.length);
		lines.forEach((line) => {
			this.size.x = Math.max(this.size.x, line.length);
		});
	}

	isOn(x: number, y: number) {
		const localX = x - this.position.x;
		const localY = y - this.position.y;

		const lines = this.content.split('\n');
		for (let i = 0; i < lines.length; i++) {
			if (localY == i && localX >= 0 && localX <= lines[i].length) {
				return true;
			}
		}
		return false;
	}

	// isOnText(x: number, y: number) {
	// 	const localX = x - this.position.x;
	// 	const localY = y - this.position.y;

	// 	const lines = this.content.split('\n');
	// 	for (let i = 0; i < lines.length; i++) {
	// 		if (localY == i && localX >= 0 && localX <= lines[i].length) {
	// 			return true;
	// 		}
	// 	}
	// 	return false;
	// }

	getIndex(x: number, y: number) {
		const localX = x - this.position.x;
		const localY = y - this.position.y;

		// if (localX == 0 && localY == this.content.replaceAll(/[^\n]/g, '').length) {
		// 	return this.content.length + 1;
		// }

		const lines = this.content.split('\n');
		return lines.slice(0, localY).concat(['']).join('\n').length + localX;
	}

	render(className: string) {
		this.updateDimensions();
		let row = 0;
		let col = 0;
		const buffer = new Buffer(this.size.x /* + (ws.showInvisibleChars ? 1 : 0)*/, this.size.y, '');
		for (let i = 0; i < this.content.length; i++) {
			if (this.content[i] == '\n') {
				// if (ws.showInvisibleChars) {
				// buffer.setChar(col, row, '\u23ce', className);
				// }
				row += 1;
				col = 0;
			} else {
				buffer.setChar(col, row, this.content[i], className);
				col += 1;
			}
		}
		return buffer;
	}

	input(cursor: Vector2, event: KeyboardEvent) {
		const positionInText = this.getIndex(wp.cursor.x, wp.cursor.y);
		if (event.key == 'Backspace') {
			this.deleteAt(positionInText);
			if (this.content === '') {
				this.shouldRemove = true;
				// ModeManager.setMode(Modes.VIEW_MODE);
			}
			return true;
		} else if (event.key == 'Enter' || event.key == 'Return') {
			this.addCharAt('\n', positionInText);
			return true;
		} else if (event.key.length <= 1) {
			if (this.isOn(cursor.x, cursor.y)) {
				this.addCharAt(event.key, positionInText);
			} else {
				console.log('new textbox');
				const newText = new TextBox(cursor, event.key);
				ws.elements.push(newText);
				ws.selected = newText;
				wp.moveCursor(new Vector2(1, 0));
			}
			return true;
		} else if (keymap.moveCursorUp.includes(event.key)) {
			if (this.isOn(cursor.x, cursor.y - 1)) {
				wp.moveCursor(new Vector2(0, -1));
			}
			return true;
		} else if (keymap.moveCursorDown.includes(event.key)) {
			if (this.isOn(cursor.x, cursor.y + 1)) {
				wp.moveCursor(new Vector2(0, 1));
			}
			return true;
		} else if (keymap.moveCursorLeft.includes(event.key)) {
			if (this.isOn(cursor.x - 1, cursor.y)) {
				wp.moveCursor(new Vector2(-1, 0));
			}
			return true;
		} else if (keymap.moveCursorRight.includes(event.key)) {
			if (this.isOn(cursor.x + 1, cursor.y)) {
				wp.moveCursor(new Vector2(1, 0));
			}
			return true;
		}
		return false;
	}

	interact(cursor: Vector2, event: KeyboardEvent): boolean {
		return false;
	}

	updateCursorPosition(offset: number) {
		const positionInText = this.getIndex(wp.cursor.x, wp.cursor.y) + offset;
		wp.setCursorCoords(
			new Vector2(
				this.position.x + (this.content.slice(0, positionInText).split('\n').at(-1) ?? []).length,
				this.position.y + this.content.slice(0, positionInText).replaceAll(/[^\n]/g, '').length
			)
		);
	}

	move(cursor: Vector2, movement: Vector2) {
		this.position.add(movement);
		wp.moveCursor(movement);
	}

	static serialize(input: TextBox): string {
		return JSON.stringify({
			_type: 'TextBox',
			position: input.position,
			content: input.content
		});
	}

	static deserialize(input: string): TextBox | null {
		const json = JSON.parse(input);
		if (json['_type'] === 'TextBox') {
			return new TextBox(
				new Vector2(json['position']['x'], json['position']['y']),
				json['content']
			);
		}
		return null;
	}
}
