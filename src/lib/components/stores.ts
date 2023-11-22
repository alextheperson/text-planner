import { writable } from 'svelte/store';

export const display = writable('');
// const cursor = writable(new Vector2(0, 0));
// const canvas = writable(new Vector2(0, 0));

class WorkspacePosition {
	static readonly cursorMargin = 5;
	static cursorX = 0;
	static cursorY = 0;
	static canvasX = 0;
	static canvasY = 0;

	private static onMove: Array<() => void> = [];

	private static viewWidth = 1;
	private static viewHeight = 1;
	private static charWidth = 1;
	private static charHeight = 1;

	static moveCursor(x: number, y: number) {
		this.cursorX += x;
		this.cursorY += y;
		this.boundCanvas();
		this.callOnMove();
	}

	static setCursorCoords(x: number, y: number) {
		this.cursorX = x;
		this.cursorY = y;
		this.boundCanvas();
		this.callOnMove();
	}

	static moveCanvas(x: number, y: number) {
		this.canvasX += x;
		this.canvasY += y;
		this.boundCanvas();
		this.callOnMove();
	}

	static setCanvasCoords(x: number, y: number) {
		this.canvasX = x;
		this.canvasY = y;
		this.boundCanvas();
		this.callOnMove();
	}

	private static boundCursor() {
		if (this.cursorX - this.canvasX < this.cursorMargin + 1) {
			this.cursorX = this.canvasX + this.cursorMargin + 1;
		}
		if (this.cursorX - this.canvasX > this.viewWidth - this.cursorMargin + 1) {
			this.cursorX = this.canvasX + this.viewWidth + this.cursorMargin + 1;
		}
		if (this.cursorY - this.canvasY < this.cursorMargin + 1) {
			this.cursorY = this.canvasY + this.cursorMargin + 1;
		}
		if (this.cursorY - this.canvasY > this.viewHeight - this.cursorMargin + 3) {
			this.cursorY = this.canvasY + this.viewHeight + this.cursorMargin + 3;
		}
	}

	private static boundCanvas() {
		if (this.cursorX - this.canvasX < this.cursorMargin + 1) {
			this.canvasX = this.cursorX - this.cursorMargin - 1;
		}
		if (this.cursorX - this.canvasX > this.viewWidth - this.cursorMargin - 1) {
			this.canvasX = this.cursorX - this.viewWidth + this.cursorMargin + 1;
		}
		if (this.cursorY - this.canvasY < this.cursorMargin + 1) {
			this.canvasY = this.cursorY - this.cursorMargin - 1;
		}
		if (this.cursorY - this.canvasY > this.viewHeight - this.cursorMargin - 3) {
			this.canvasY = this.cursorY - this.viewHeight + this.cursorMargin + 3;
		}
	}

	static get canvasWidth() {
		return this.viewWidth;
	}

	static set canvasWidth(width: number) {
		this.viewWidth = width;
		this.boundCanvas();
		this.callOnMove();
	}

	static get canvasHeight() {
		return this.viewHeight;
	}

	static set canvasHeight(height: number) {
		this.viewHeight = height;
		this.boundCanvas();
		this.callOnMove();
	}

	static get characterWidth() {
		return this.charWidth;
	}

	static set characterWidth(width: number) {
		this.charWidth = width;
		this.boundCanvas();
		this.callOnMove();
	}

	static get characterHeight() {
		return this.charHeight;
	}

	static set characterHeight(height: number) {
		this.charHeight = height;
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
