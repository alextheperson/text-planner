import Vector2 from '$lib/scripts/vector';
import { writable } from 'svelte/store';

export const display = writable('');
// const cursor = writable(new Vector2(0, 0));
// const canvas = writable(new Vector2(0, 0));

class WorkspacePosition {
	static readonly cursorMargin = 5;
	static cursor = new Vector2(0, 0);
	static canvas = new Vector2(0, 0);

	private static onMove: Array<() => void> = [];

	private static viewSize = new Vector2(1, 1);
	private static charSize = new Vector2(1, 1);

	static moveCursor(pos: Vector2) {
		this.cursor.add(pos);
		this.boundCanvas();
		this.callOnMove();
	}

	static setCursorCoords(pos: Vector2) {
		this.cursor = pos;
		this.boundCanvas();
		this.callOnMove();
	}

	static moveCanvas(pos: Vector2) {
		this.canvas.add(pos);
		// this.cursor.add(pos);
		this.boundCanvas();
		this.callOnMove();
	}

	static setCanvasCoords(pos: Vector2) {
		this.canvas = pos;
		this.boundCanvas();
		this.callOnMove();
	}

	private static boundCursor() {
		if (this.cursor.x - this.canvas.x < this.cursorMargin + 1) {
			this.cursor.x = this.canvas.x + this.cursorMargin + 1;
		}
		if (this.cursor.x - this.canvas.x > this.viewSize.x - this.cursorMargin + 1) {
			this.cursor.x = this.canvas.x + this.viewSize.x + this.cursorMargin + 1;
		}
		if (this.cursor.y - this.canvas.y < this.cursorMargin + 1) {
			this.cursor.y = this.canvas.y + this.cursorMargin + 1;
		}
		if (this.cursor.y - this.canvas.y > this.viewSize.y - this.cursorMargin + 3) {
			this.cursor.y = this.canvas.y + this.viewSize.y + this.cursorMargin + 3;
		}
	}

	private static boundCanvas() {
		if (this.cursor.x - this.canvas.x < this.cursorMargin + 1) {
			this.canvas.x = this.cursor.x - this.cursorMargin - 1;
		}
		if (this.cursor.x - this.canvas.x > this.viewSize.x - this.cursorMargin - 1) {
			this.canvas.x = this.cursor.x - this.viewSize.x + this.cursorMargin + 1;
		}
		if (this.cursor.y - this.canvas.y < this.cursorMargin + 1) {
			this.canvas.y = this.cursor.y - this.cursorMargin - 1;
		}
		if (this.cursor.y - this.canvas.y > this.viewSize.y - this.cursorMargin - 3) {
			this.canvas.y = this.cursor.y - this.viewSize.y + this.cursorMargin + 3;
		}
	}

	static get canvasSize() {
		return this.viewSize;
	}

	static set canvasSize(size: Vector2) {
		this.viewSize = size;
		this.boundCanvas();
		this.callOnMove();
	}

	static get characterSize() {
		return this.charSize;
	}

	static set characterSize(size: Vector2) {
		this.charSize = size;
		this.boundCanvas();
		this.callOnMove();
	}

	static subscribe(cb: () => void) {
		this.onMove.push(cb);
		this.callOnMove();
	}

	private static callOnMove() {
		this.onMove.forEach((el) => el());
	}
}

export { WorkspacePosition as wp };
