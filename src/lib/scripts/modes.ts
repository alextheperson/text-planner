import { Command, parseExpression } from './commands';
import { STATIC_TYPES, type Binding, Value } from './dataType';
import { keymap } from './keymap';
import { UserConsole } from './userConsole';
import { workspace as ws } from './workspace';

const FAST_MOVE_SPEED = 5;

enum Modes {
	VIEW_MODE,
	EDIT_MODE,
	MOVE_MODE,
	COMMAND
}

enum ShapeTypes {
	NONE,
	TEXT_BOX,
	FRAME_CHAR,
	LINE
}

function move(event: KeyboardEvent) {
	if (keymap.moveViewUp.includes(event.key)) {
		ws.moveCanvas(0, -(event.shiftKey ? FAST_MOVE_SPEED : 1));
		// wp.moveCursor(0, -(event.shiftKey ? FAST_MOVE_SPEED : 1)));
	} else if (keymap.moveViewDown.includes(event.key)) {
		ws.moveCanvas(0, event.shiftKey ? FAST_MOVE_SPEED : 1);
		// wp.moveCursor(0, event.shiftKey ? FAST_MOVE_SPEED : 1));
	} else if (keymap.moveViewLeft.includes(event.key)) {
		ws.moveCanvas(-(event.shiftKey ? FAST_MOVE_SPEED : 1), 0);
		// wp.moveCursor(-(event.shiftKey ? FAST_MOVE_SPEED : 1), 0));
	} else if (keymap.moveViewRight.includes(event.key)) {
		ws.moveCanvas(event.shiftKey ? FAST_MOVE_SPEED : 1, 0);
		// wp.moveCursor(event.shiftKey ? FAST_MOVE_SPEED : 1, 0));
	} else if (keymap.moveCursorUp.includes(event.key)) {
		ws.currentDocument.moveCursor(0, -(event.shiftKey ? FAST_MOVE_SPEED : 1));
	} else if (keymap.moveCursorDown.includes(event.key)) {
		ws.currentDocument.moveCursor(0, event.shiftKey ? FAST_MOVE_SPEED : 1);
	} else if (keymap.moveCursorLeft.includes(event.key)) {
		ws.currentDocument.moveCursor(-(event.shiftKey ? FAST_MOVE_SPEED : 1), 0);
	} else if (keymap.moveCursorRight.includes(event.key)) {
		ws.currentDocument.moveCursor(event.shiftKey ? FAST_MOVE_SPEED : 1, 0);
	}
}

interface Mode {
	input(event: KeyboardEvent): void;
	click(event: MouseEvent): void;
	open(): void;
	close(): void;
}

class ViewMode implements Mode {
	open() {
		try {
			ws.currentDocument.selected = ws.underCursor();
			ws.render();
		} catch {
			/* empty */
		}
	}

	close() {
		/* empty */
	}
	input(event: KeyboardEvent) {
		move(event);
		if (keymap.select.includes(event.key) || keymap.editMode.includes(event.key)) {
			ws.currentDocument.modeManager.setMode(Modes.EDIT_MODE);
		} else if (keymap.moveMode.includes(event.key)) {
			ws.currentDocument.modeManager.setMode(Modes.MOVE_MODE);
			ws.currentDocument.selected =
				ws.currentDocument.elements[ws.currentDocument.elements.length - 1];
		} else if (event.key == ':') {
			ws.currentDocument.modeManager.setMode(Modes.COMMAND);
		} else if (ws.currentDocument.selected !== null) {
			ws.currentDocument.selected.interact(
				ws.currentDocument.cursorX,
				ws.currentDocument.cursorY,
				event
			);
		}
		ws.currentDocument.selected = ws.underCursor();
		ws.activeBindings = [];
		ws.render();
	}

	click(event: MouseEvent): void {
		ws.currentDocument.setCursorCoords(
			Math.floor(event.clientX / ws.characterWidth) + ws.canvasX,
			Math.floor(event.clientY / ws.characterHeight) + ws.canvasY
		);
		ws.currentDocument.selected = ws.underCursor();
		ws.render();
	}
}

class MoveMode implements Mode {
	willAutoBind = true;

	open() {
		ws.currentDocument.selected = ws.underCursor();
	}

	close(): void {
		if (this.willAutoBind) {
			this.checkForBindings(true);
		}
		ws.activeBindings = [];
	}

	input(event: KeyboardEvent) {
		let deltaX = 0;
		let deltaY = 0;
		if (keymap.confirm.includes(event.key) || keymap.viewMode.includes(event.key)) {
			ws.currentDocument.modeManager.setMode(Modes.VIEW_MODE);
		} else if (keymap.moveViewUp.includes(event.key)) {
			ws.currentDocument.moveCursor(0, -(event.shiftKey ? FAST_MOVE_SPEED : 1));
		} else if (keymap.moveViewDown.includes(event.key)) {
			ws.currentDocument.moveCursor(0, event.shiftKey ? FAST_MOVE_SPEED : 1);
		} else if (keymap.moveViewLeft.includes(event.key)) {
			ws.currentDocument.moveCursor(-(event.shiftKey ? FAST_MOVE_SPEED : 1), 0);
		} else if (keymap.moveViewRight.includes(event.key)) {
			ws.currentDocument.moveCursor(event.shiftKey ? FAST_MOVE_SPEED : 1, 0);
		} else if (keymap.moveCursorUp.includes(event.key)) {
			deltaY = -(event.shiftKey ? FAST_MOVE_SPEED : 1);
		} else if (keymap.moveCursorDown.includes(event.key)) {
			deltaY = event.shiftKey ? FAST_MOVE_SPEED : 1;
		} else if (keymap.moveCursorLeft.includes(event.key)) {
			deltaX = -(event.shiftKey ? FAST_MOVE_SPEED : 1);
		} else if (keymap.moveCursorRight.includes(event.key)) {
			deltaX = event.shiftKey ? FAST_MOVE_SPEED : 1;
		} else if (keymap.cancel.includes(event.key)) {
			this.willAutoBind = !this.willAutoBind;
		}
		ws.currentDocument.selected?.move(
			ws.currentDocument.cursorX,
			ws.currentDocument.cursorY,
			deltaX,
			deltaY
		);
		// move(event);
		if (this.willAutoBind) {
			ws.activeBindings = this.checkForBindings(false);
		} else {
			ws.activeBindings = [];
		}
		ws.render();
	}

	click(event: MouseEvent): void {
		ws.currentDocument.setCursorCoords(
			Math.floor(event.clientX / ws.characterWidth) + ws.canvasX,
			Math.floor(event.clientY / ws.characterHeight) + ws.canvasY
		);
		ws.render();
	}

	pairBindings(list: Binding[]) {
		const pairedBindings: Map<string, { x: Binding | null; y: Binding | null }> = new Map();
		for (let i = 0; i < list.length; i++) {
			const namespace = list[i].name.slice(0, -2);
			const pair = pairedBindings.get(namespace);
			if (pair === undefined) {
				if (list[i].name.slice(-2) === '/x') {
					pairedBindings.set(namespace, {
						x: list[i],
						y: null
					});
				} else if (list[i].name.slice(-2) === '/y') {
					pairedBindings.set(namespace, {
						x: null,
						y: list[i]
					});
				}
			} else if (list[i].name.slice(-2) === '/x') {
				pair.x = list[i];
				pairedBindings.set(namespace, pair);
			} else if (list[i].name.slice(-2) === '/y') {
				pair.y = list[i];
				pairedBindings.set(namespace, pair);
			}
		}
		return pairedBindings;
	}

	checkForBindings(shouldBind: boolean) {
		if (ws.currentDocument.selected === null) {
			return [];
		}
		const availableBindings = ws.currentDocument.selected.bindings.filter(
			(val) => val.settable && (val.name.slice(-2) === '/x' || val.name.slice(-2) === '/y')
		);
		const pairedSelfBindings = this.pairBindings(availableBindings);
		const shape = ws.currentDocument.elements
			.filter((val) => val !== ws.currentDocument.selected)
			// get all shapes within 10units of the cursor
			.sort((val1, val2) => {
				return (
					((ws.currentDocument.cursorX - val1.positionX.value) ** 2 +
						(ws.currentDocument.cursorY - val1.positionY.value) ** 2) **
						0.5 -
					((ws.currentDocument.cursorX - val2.positionX.value) ** 2 +
						(ws.currentDocument.cursorY - val2.positionY.value) ** 2) **
						0.5
				);
			})
			.at(0);
		const otherBindings = shape?.bindings || [];
		const otherPairs = this.pairBindings(otherBindings);
		const pairs: { x: number; y: number }[] = [];
		pairedSelfBindings.forEach((pair) => {
			otherPairs.forEach((pair2) => {
				if (
					pair.x !== null &&
					pair2.x !== null &&
					pair.y !== null &&
					pair2.y !== null &&
					pair.x.getValue().type === STATIC_TYPES.INT &&
					pair2.x.getValue().type === STATIC_TYPES.INT &&
					pair.y.getValue().type === STATIC_TYPES.INT &&
					pair2.y.getValue().type === STATIC_TYPES.INT &&
					pair.x.getValue().value === pair2.x.getValue().value &&
					pair.y.getValue().value === pair2.y.getValue().value
				) {
					if (shouldBind) {
						pair.x.setValue(
							(parseExpression(`(get @i${shape?.id} "${pair2.x.name}")`) as Value).value as Command
						);
						pair.y.setValue(
							(parseExpression(`(get @i${shape?.id} "${pair2.y.name}")`) as Value).value as Command
						);
					}
					pairs.push({
						x: pair.x.getValue().value as number,
						y: pair.y.getValue().value as number
					});
				}
			});
		});
		return pairs;
	}
}

// class DrawMode implements Mode {
// 	input(key: string, shiftKey: boolean) {}
// }
class EditMode implements Mode {
	open() {
		ws.render();
	}

	close() {
		/* empty */
	}

	input(event: KeyboardEvent) {
		if (keymap.viewMode.includes(event.key)) {
			ws.currentDocument.modeManager.setMode(Modes.VIEW_MODE);
			// ws.selectedType = ShapeTypes.NONE;
		} else if (
			ws.currentDocument.selected !== null &&
			!ws.currentDocument.selected.input(
				ws.currentDocument.cursorX,
				ws.currentDocument.cursorY,
				event
			)
		) {
			move(event);
		}
		ws.activeBindings = [];
		ws.render();
	}

	click(event: MouseEvent): void {
		ws.currentDocument.setCursorCoords(
			Math.floor(event.clientX / ws.characterWidth) + ws.canvasX,
			Math.floor(event.clientY / ws.characterHeight) + ws.canvasY
		);
		const hoveredElement = ws.underCursor();
		if (
			ws.currentDocument.selected === null ||
			hoveredElement instanceof ws.currentDocument.selected.constructor
		) {
			ws.currentDocument.selected = hoveredElement;
		}
		ws.render();
	}
}

class CommandMode implements Mode {
	open() {
		UserConsole.open();
		UserConsole.input(':');
		ws.render();
	}

	close() {
		UserConsole.close();
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	input(event: KeyboardEvent) {
		if (keymap.viewMode.includes(event.key)) {
			ws.currentDocument.modeManager.setMode(Modes.VIEW_MODE);
		} else {
			UserConsole.input(event.key);
		}
		ws.render();
	}

	click(event: MouseEvent): void {
		ws.currentDocument.setCursorCoords(
			Math.floor(event.clientX / ws.characterWidth) + ws.canvasX,
			Math.floor(event.clientY / ws.characterHeight) + ws.canvasY
		);
		ws.render();
	}
}

class ModeManager {
	currentMode: Mode = new ViewMode();
	mode: Modes = Modes.VIEW_MODE;

	setMode(setTo: Modes) {
		if (!ws.allowedModes.includes(setTo)) {
			return;
		}
		this.currentMode.close();
		this.mode = setTo;
		switch (setTo) {
			case Modes.VIEW_MODE:
				this.currentMode = new ViewMode();
				break;
			case Modes.MOVE_MODE:
				this.currentMode = new MoveMode();
				break;
			case Modes.EDIT_MODE:
				this.currentMode = new EditMode();
				break;
			case Modes.COMMAND:
				this.currentMode = new CommandMode();
				break;
		}
		this.currentMode.open();
	}
}

export default ModeManager;
export { ShapeTypes, Modes, CommandMode };
