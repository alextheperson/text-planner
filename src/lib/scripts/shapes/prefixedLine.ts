/* eslint-disable @typescript-eslint/no-unused-vars */
import { wp } from '$lib/components/stores';
import Buffer from '../buffer';
import { keymap } from '../keymap';
import Vector2 from '../vector';
import type { Shape } from './shape';

export class PrefixedLine implements Shape {
	// This is a single line of text with preset text preceding it
	position: Vector2;
	size!: Vector2;
	prefix: string;
	content: string;
	readonly id: number;

	shouldRemove = false;

	constructor(position: Vector2, prefix: string, content: string) {
		this.position = position;
		this.prefix = prefix;
		this.content = content;

		this.id = 1;

		this.updateDimensions();
	}

	addCharAt(char: string, at: number): void {
		this.content = this.content.slice(0, at) + char + this.content.slice(at);
		this.updateCursorPosition(1);
	}

	deleteAt(at: number): void {
		this.content = this.content.slice(0, Math.max(at - 1, 0)) + this.content.slice(at);
		this.updateCursorPosition(0);
	}

	updateDimensions(): void {
		this.size = new Vector2(this.content.length + this.prefix.length, 1);
	}

	isOn(x: number, y: number): boolean {
		const localX = x - this.position.x;
		const localY = y - this.position.y;

		return localX >= 0 && localX < this.size.x && localY === 0;
	}

	isOnText(x: number, y: number): boolean {
		const localX = x - this.position.x;
		const localY = y - this.position.y;

		return localX >= this.prefix.length && localX <= this.size.x && localY === 0;
	}

	getIndex(x: number, y: number): number {
		const localX = x - this.position.x;

		return y == this.position.y
			? localX - this.prefix.length > 0
				? localX - this.prefix.length
				: 0
			: -1;
	}

	render(className: string): Buffer {
		this.updateDimensions();
		const buffer = new Buffer(this.size.x /* + (ws.showInvisibleChars ? 1 : 0)*/, this.size.y, '');
		for (let i = 0; i < this.prefix.length; i++) {
			buffer.setChar(i, 0, this.prefix[i], className);
		}
		for (let i = 0; i < this.content.length; i++) {
			buffer.setChar(i + this.prefix.length, 0, this.content[i], className);
		}

		return buffer;
	}

	input(cursor: Vector2, event: KeyboardEvent): boolean {
		const positionInText = this.getIndex(wp.cursor.x, wp.cursor.y);
		if (event.key == 'Backspace') {
			this.deleteAt(positionInText);
			if (this.content === '') {
				this.shouldRemove = true;
			}
			return true;
		} else if (event.key.length <= 1) {
			this.addCharAt(event.key, positionInText);
			return true;
		} else if (keymap.moveCursorUp.includes(event.key)) {
			if (this.isOnText(cursor.x, cursor.y - 1)) {
				wp.moveCursor(new Vector2(0, -1));
			}
			return true;
		} else if (keymap.moveCursorDown.includes(event.key)) {
			if (this.isOnText(cursor.x, cursor.y + 1)) {
				wp.moveCursor(new Vector2(0, 1));
			}
			return true;
		} else if (keymap.moveCursorLeft.includes(event.key)) {
			if (this.isOnText(cursor.x - 1, cursor.y)) {
				wp.moveCursor(new Vector2(-1, 0));
			}
			return true;
		} else if (keymap.moveCursorRight.includes(event.key)) {
			if (this.isOnText(cursor.x + 1, cursor.y)) {
				wp.moveCursor(new Vector2(1, 0));
			}
			return true;
		}
		return false;
	}

	updateCursorPosition(offset: number): void {
		const positionInText = this.getIndex(wp.cursor.x, wp.cursor.y) + offset;
		wp.setCursorCoords(
			new Vector2(
				this.position.x + positionInText + offset + this.prefix.length - 1,
				this.position.y
			)
		);
	}

	move(cursor: Vector2, movement: Vector2) {
		this.position.add(movement);
		wp.moveCursor(movement);
	}

	interact(cursor: Vector2, event: KeyboardEvent): boolean {
		return false;
	}

	static serialize(input: PrefixedLine): string {
		return JSON.stringify({
			_type: 'PrefixedLine',
			position: input.position,
			prefix: input.prefix,
			content: input.content
		});
	}

	static deserialize(input: string): PrefixedLine | null {
		const json = JSON.parse(input);
		if (json['_type'] === 'PrefixedLine') {
			return new PrefixedLine(
				new Vector2(json['position']['x'], json['position']['y']),
				json['prefix'],
				json['content']
			);
		}
		return null;
	}
}
