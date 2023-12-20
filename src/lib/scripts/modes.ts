import { wp } from '$lib/components/stores';
import { Command, getNextParameters, parseExpression } from './commands';
import { STATIC_TYPES, type Binding, Value } from './dataType';
import { keymap } from './keymap';
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
		wp.moveCanvas(0, -(event.shiftKey ? FAST_MOVE_SPEED : 1));
		// wp.moveCursor(0, -(event.shiftKey ? FAST_MOVE_SPEED : 1)));
	} else if (keymap.moveViewDown.includes(event.key)) {
		wp.moveCanvas(0, event.shiftKey ? FAST_MOVE_SPEED : 1);
		// wp.moveCursor(0, event.shiftKey ? FAST_MOVE_SPEED : 1));
	} else if (keymap.moveViewLeft.includes(event.key)) {
		wp.moveCanvas(-(event.shiftKey ? FAST_MOVE_SPEED : 1), 0);
		// wp.moveCursor(-(event.shiftKey ? FAST_MOVE_SPEED : 1), 0));
	} else if (keymap.moveViewRight.includes(event.key)) {
		wp.moveCanvas(event.shiftKey ? FAST_MOVE_SPEED : 1, 0);
		// wp.moveCursor(event.shiftKey ? FAST_MOVE_SPEED : 1, 0));
	} else if (keymap.moveCursorUp.includes(event.key)) {
		wp.moveCursor(0, -(event.shiftKey ? FAST_MOVE_SPEED : 1));
	} else if (keymap.moveCursorDown.includes(event.key)) {
		wp.moveCursor(0, event.shiftKey ? FAST_MOVE_SPEED : 1);
	} else if (keymap.moveCursorLeft.includes(event.key)) {
		wp.moveCursor(-(event.shiftKey ? FAST_MOVE_SPEED : 1), 0);
	} else if (keymap.moveCursorRight.includes(event.key)) {
		wp.moveCursor(event.shiftKey ? FAST_MOVE_SPEED : 1, 0);
	}
}

interface Mode {
	keybindString: string;
	input(event: KeyboardEvent): void;
	click(event: MouseEvent): void;
}

class ViewMode implements Mode {
	keybindString = `[${keymap.moveViewUp[0]}], [${keymap.moveViewDown[0]}], [${keymap.moveViewLeft[0]}], [${keymap.moveViewRight[0]}]: Move View. [${keymap.moveCursorUp[0]}], [${keymap.moveCursorDown[0]}], [${keymap.moveCursorLeft[0]}], [${keymap.moveCursorRight[0]}]: Move Cursor. [${keymap.select[0]}]: Move Object. [${keymap.editMode[0]}]: Edit. [${keymap.moveMode[0]}]: Move.`;

	input(event: KeyboardEvent) {
		move(event);
		if (keymap.select.includes(event.key) || keymap.editMode.includes(event.key)) {
			ModeManager.setMode(Modes.EDIT_MODE);
		} else if (keymap.moveMode.includes(event.key)) {
			ModeManager.setMode(Modes.MOVE_MODE);
			ws.selected = ws.elements[ws.elements.length - 1];
		} else if (event.key == ':') {
			ModeManager.setMode(Modes.COMMAND);
		} else if (ws.selected !== null) {
			ws.selected.interact(wp.cursorX, wp.cursorY, event);
		}
		ws.selected = ws.underCursor();
		ws.activeBindings = [];
		ws.drawScreen();
	}

	click(event: MouseEvent): void {
		wp.setCursorCoords(
			Math.floor(event.clientX / wp.characterWidth) + wp.canvasX,
			Math.floor(event.clientY / wp.characterHeight) + wp.canvasY
		);
		ws.selected = ws.underCursor();
		ws.drawScreen();
	}
}

class MoveMode implements Mode {
	willAutoBind = true;
	keybindString = `[${keymap.moveViewUp[0]}], [${keymap.moveViewDown[0]}], [${keymap.moveViewLeft[0]}], [${keymap.moveViewRight[0]}]: Move View. [${keymap.moveCursorUp[0]}], [${keymap.moveCursorDown[0]}], [${keymap.moveCursorLeft[0]}], [${keymap.moveCursorRight[0]}]: Move Object. [${keymap.viewMode[0]}]: View Mode.`;

	constructor() {
		ws.selected = ws.underCursor();
	}

	input(event: KeyboardEvent) {
		let deltaX = 0;
		let deltaY = 0;
		if (keymap.confirm.includes(event.key) || keymap.viewMode.includes(event.key)) {
			ModeManager.setMode(Modes.VIEW_MODE);
		} else if (keymap.moveViewUp.includes(event.key)) {
			wp.moveCursor(0, -(event.shiftKey ? FAST_MOVE_SPEED : 1));
		} else if (keymap.moveViewDown.includes(event.key)) {
			wp.moveCursor(0, event.shiftKey ? FAST_MOVE_SPEED : 1);
		} else if (keymap.moveViewLeft.includes(event.key)) {
			wp.moveCursor(-(event.shiftKey ? FAST_MOVE_SPEED : 1), 0);
		} else if (keymap.moveViewRight.includes(event.key)) {
			wp.moveCursor(event.shiftKey ? FAST_MOVE_SPEED : 1, 0);
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
		ws.selected?.move(wp.cursorX, wp.cursorY, deltaX, deltaY);
		// move(event);
		if (this.willAutoBind) {
			ws.activeBindings = this.checkForBindings();
		} else {
			ws.activeBindings = [];
		}
		ws.drawScreen();
	}

	click(event: MouseEvent): void {
		wp.setCursorCoords(
			Math.floor(event.clientX / wp.characterWidth) + wp.canvasX,
			Math.floor(event.clientY / wp.characterHeight) + wp.canvasY
		);
		ws.selected = ws.underCursor();
		ws.drawScreen();
	}

	checkForBindings() {
		function pairBindings(list: Binding[]) {
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
		if (ws.selected === null) {
			return [];
		}
		const availableBindings = ws.selected.bindings.filter(
			(val) => val.settable && (val.name.slice(-2) === '/x' || val.name.slice(-2) === '/y')
		);
		const pairedSelfBindings = pairBindings(availableBindings);
		const shape = ws.elements
			.filter((val) => val !== ws.selected)
			// get all shapes within 10units of the cursor
			.sort((val1, val2) => {
				return (
					((wp.cursorX - val1.positionX.value) ** 2 + (wp.cursorY - val1.positionY.value) ** 2) **
						0.5 -
					((wp.cursorX - val2.positionX.value) ** 2 + (wp.cursorY - val2.positionY.value) ** 2) **
						0.5
				);
			})
			.at(0);
		const otherBindings = shape?.bindings || [];
		const otherPairs = pairBindings(otherBindings);
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
					console.log(
						parseExpression(`(get @i${shape?.id} "${pair2.y.name}")`),
						`(get @i${shape?.id} "${pair2.y.name}")`
					);
					pair.x.setValue(
						(parseExpression(`(get @i${shape?.id} "${pair2.x.name}")`) as Value).value as Command
					);
					pair.y.setValue(
						(parseExpression(`(get @i${shape?.id} "${pair2.y.name}")`) as Value).value as Command
					);
					console.log(
						pair.x?.name,
						pair2.x?.name,
						pair.x?.getValue(),
						pair2.x?.getValue(),
						pair.y?.getValue(),
						pair2.y?.getValue()
					);
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
	keybindString = `[${keymap.moveViewUp[0]}], [${keymap.moveViewDown[0]}], [${
		keymap.moveViewLeft[0]
	}, ${keymap.moveViewRight[0]}]: Move Start. [${keymap.moveCursorUp[0]}], [${
		keymap.moveCursorDown[0]
	}], [${keymap.moveCursorLeft[0]}], [${
		keymap.moveCursorRight[0]
	}]: Move End. [${keymap.flipLineDirection.join(', ')}]: H/V. [${
		keymap.toggleStartArrow[0]
	}]: Start Arrow. [${keymap.toggleEndArrow[0]}]: End Arrow. [${keymap.viewMode[0]}]: View Mode.`;

	input(event: KeyboardEvent) {
		if (keymap.viewMode.includes(event.key)) {
			ModeManager.setMode(Modes.VIEW_MODE);
			// ws.selectedType = ShapeTypes.NONE;
		} else if (ws.selected !== null && !ws.selected.input(wp.cursorX, wp.cursorY, event)) {
			move(event);
		}
		ws.activeBindings = [];
		ws.drawScreen();
	}

	click(event: MouseEvent): void {
		wp.setCursorCoords(
			Math.floor(event.clientX / wp.characterWidth) + wp.canvasX,
			Math.floor(event.clientY / wp.characterHeight) + wp.canvasY
		);
		const hoveredElement = ws.underCursor();
		if (ws.selected === null || hoveredElement instanceof ws.selected.constructor) {
			ws.selected = hoveredElement;
		}
		ws.drawScreen();
	}
}

class CommandMode implements Mode {
	keybindString = `[${keymap.moveViewUp[0]}], [${keymap.moveViewDown[0]}], [${
		keymap.moveViewLeft[0]
	}, ${keymap.moveViewRight[0]}]: Move Start. [${keymap.moveCursorUp[0]}], [${
		keymap.moveCursorDown[0]
	}], [${keymap.moveCursorLeft[0]}], [${
		keymap.moveCursorRight[0]
	}]: Move End. [${keymap.flipLineDirection.join(', ')}]: H/V. [${
		keymap.toggleStartArrow[0]
	}]: Start Arrow. [${keymap.toggleEndArrow[0]}]: End Arrow. [${keymap.viewMode[0]}]: View Mode.`;
	autofillSelection = 0;
	currentCommand = '';
	options: Array<string> = [];

	constructor() {
		this.options = getNextParameters(this.currentCommand);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	input(event: KeyboardEvent) {
		if (keymap.viewMode.includes(event.key)) {
			ModeManager.setMode(Modes.VIEW_MODE);
			this.currentCommand = '';
		} else if (keymap.confirm.includes(event.key)) {
			ws.runCommand(':' + this.currentCommand);
			this.currentCommand = '';
			ModeManager.setMode(Modes.VIEW_MODE);
		} else if (event.key == 'Backspace' || event.key == 'Delete') {
			this.currentCommand = this.currentCommand.slice(0, -1);
			this.options = getNextParameters(this.currentCommand);
		} else if (event.key == 'Tab') {
			this.currentCommand =
				this.currentCommand.slice(0, this.currentCommand.lastIndexOf(' ') + 1 ?? 0) +
				this.options[this.autofillSelection];

			this.options = getNextParameters(this.currentCommand);
		} else if (event.key == 'ArrowUp') {
			this.autofillSelection -= 1;
			this.autofillSelection %= this.options.length;
			if (this.autofillSelection < 0) {
				this.autofillSelection = this.options.length - 1;
			}
		} else if (event.key == 'ArrowDown') {
			this.autofillSelection += 1;
			this.autofillSelection %= this.options.length;
			if (this.autofillSelection < 0) {
				this.autofillSelection = this.options.length - 1;
			}
		} else if (event.key.length == 1) {
			this.currentCommand += event.key;
			this.options = getNextParameters(this.currentCommand);
		}
		ws.activeBindings = [];
		ws.drawScreen();
	}

	click(event: MouseEvent): void {
		wp.setCursorCoords(
			Math.floor(event.clientX / wp.characterWidth) + wp.canvasX,
			Math.floor(event.clientY / wp.characterHeight) + wp.canvasY
		);
		ws.drawScreen();
		ws.selected = ws.underCursor();
	}
}

class ModeManager {
	static currentMode: Mode = new ViewMode();
	static mode: Modes = Modes.VIEW_MODE;

	static setMode(setTo: Modes) {
		if (!ws.allowedModes.includes(setTo)) {
			return;
		}
		this.mode = setTo;
		switch (setTo) {
			case Modes.VIEW_MODE:
				ModeManager.currentMode = new ViewMode();
				break;
			case Modes.MOVE_MODE:
				ModeManager.currentMode = new MoveMode();
				break;
			case Modes.EDIT_MODE:
				ModeManager.currentMode = new EditMode();
				break;
			case Modes.COMMAND:
				ModeManager.currentMode = new CommandMode();
				break;
		}
	}
}

export default ModeManager;
export { ShapeTypes, Modes, CommandMode };
