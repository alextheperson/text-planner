import { browser } from '$app/environment';

class Keymap {
	moveViewUp: Array<string>;
	moveViewDown: Array<string>;
	moveViewLeft: Array<string>;
	moveViewRight: Array<string>;

	moveCursorUp: Array<string>;
	moveCursorDown: Array<string>;
	moveCursorLeft: Array<string>;
	moveCursorRight: Array<string>;

	flipLineDirection: Array<string>;
	toggleStartArrow: Array<string>;
	toggleEndArrow: Array<string>;

	select: Array<string>;
	confirm: Array<string>;
	cancel: Array<string>;

	viewMode: Array<string>;
	editMode: Array<string>;
	moveMode: Array<string>;

	constructor(
		moveViewUp: Array<string>,
		moveViewDown: Array<string>,
		moveViewLeft: Array<string>,
		moveViewRight: Array<string>,
		moveCursorUp: Array<string>,
		moveCursorDown: Array<string>,
		moveCursorLeft: Array<string>,
		moveCursorRight: Array<string>,
		flipLineDirection: Array<string>,
		toggleStartArrow: Array<string>,
		toggleEndArrow: Array<string>,
		select: Array<string>,
		confirm: Array<string>,
		cancel: Array<string>,
		viewMode: Array<string>,
		editMode: Array<string>,
		moveMode: Array<string>
	) {
		this.moveViewUp = moveViewUp;
		this.moveViewDown = moveViewDown;
		this.moveViewLeft = moveViewLeft;
		this.moveViewRight = moveViewRight;

		this.moveCursorUp = moveCursorUp;
		this.moveCursorDown = moveCursorDown;
		this.moveCursorLeft = moveCursorLeft;
		this.moveCursorRight = moveCursorRight;

		this.flipLineDirection = flipLineDirection;
		this.toggleStartArrow = toggleStartArrow;
		this.toggleEndArrow = toggleEndArrow;

		this.select = select;
		this.confirm = confirm;
		this.cancel = cancel;

		this.viewMode = viewMode;
		this.editMode = editMode;
		this.moveMode = moveMode;
	}
}

const keymaps = {
	qwerty: new Keymap(
		['f', 'F'],
		['d', 'D'],
		['s', 'S'],
		['g', 'G'],
		['k', 'ArrowUp'],
		['j', 'ArrowDown'],
		['h', 'ArrowLeft'],
		['l', 'ArrowRight'],
		['/'],
		[','],
		['.'],
		[' '],
		['Enter', 'Return'],
		['Delete', 'Backspace'],
		['Escape'],
		['w', 'W'],
		['m', 'M']
	),
	dvorak: new Keymap(
		['e', 'E'],
		['o', 'O'],
		['a', 'A'],
		['u', 'U'],
		['n', 'N', 'ArrowUp'],
		['t', 'T', 'ArrowDown'],
		['h', 'H', 'ArrowLeft'],
		['s', 'S', 'ArrowRight'],
		["'", '"'],
		[',', '<'],
		['.', '>'],
		[' '],
		['Enter', 'Return'],
		['Delete', 'Backspace'],
		['Escape'],
		['w', 'W'],
		['m', 'M']
	)
};

export let keymap =
	keymaps[
		browser
			? ((JSON.parse(localStorage.getItem('$settings') ?? '{}')['keymap'] ??
					'qwerty') as keyof typeof keymaps)
			: 'qwerty'
	];
export function setKeymap(to: keyof typeof keymaps) {
	keymap = keymaps[to];
}
