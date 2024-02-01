<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { workspace as ws } from '$lib/scripts/workspace';

	let testCanvas: HTMLCanvasElement | undefined;

	let workspace: HTMLElement | null;
	let cursor: HTMLElement | null;

	onMount(() => {
		if (browser) {
			workspace = document.getElementById('workspace');
			cursor = document.getElementById('cursor');
			ws.characterWidth = getTextWidth('M', '16px Fira Code');
			ws.characterHeight = 20;
			window.addEventListener('resize', setViewSize);
		}
		setViewSize();
		ws.subscribe(render);
		ws.render();
	});

	function setViewSize() {
		ws.canvasWidth = Math.floor(window.innerWidth / ws.characterWidth);
		ws.canvasHeight = Math.floor(window.innerHeight / ws.characterHeight);
		ws.characterWidth = getTextWidth('M', '16px Fira Code');
		ws.characterHeight = 20;
	}

	function click(e: MouseEvent) {
		ws.currentDocument.modeManager.currentMode.click(e);
		ws.characterWidth = getTextWidth('M', '16px Fira Code');
		ws.characterHeight = 20;
		ws.canvasWidth = Math.floor(window.innerWidth / ws.characterWidth);
		ws.canvasHeight = Math.floor(window.innerHeight / ws.characterHeight);
	}

	function keydown(e: KeyboardEvent) {
		if (!e.metaKey) {
			ws.currentDocument.modeManager.currentMode.input(e);

			e.preventDefault();
		}
	}

	function paste(e: ClipboardEvent) {
		const data = e.clipboardData?.getData('text/plain') ?? '';
		for (let i = 0; i < data.length; i++) {
			const event = new KeyboardEvent('keydown', {
				key: data[i],
				shiftKey: data[i].match(/[A-Z]/) !== null
			});
			keydown(event);
		}
	}

	function render(screen: string) {
		if (workspace === null || cursor === null) {
			return;
		}
		workspace.innerHTML = screen;
		cursor.style.left = (ws.currentDocument.cursorX - ws.canvasX) * ws.characterWidth + 'px';
		cursor.style.top = (ws.currentDocument.cursorY - ws.canvasY) * ws.characterHeight + 'px';
		cursor.style.width = ws.characterWidth + 'px';
		cursor.style.height = ws.characterHeight + 1.5 + 'px';
	}

	/**
	 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
	 *
	 * @param {String} text The text to be rendered.
	 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
	 *
	 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
	 */
	function getTextWidth(text: string, font: string) {
		// re-use canvas object for better performance
		const canvas = testCanvas || (testCanvas = document.createElement('canvas'));
		const context = canvas.getContext('2d') as CanvasRenderingContext2D;
		context.font = font;
		const metrics = context.measureText(text);
		return metrics.width;
	}
</script>

<svelte:window on:click={click} on:keydown={keydown} on:paste={paste} />
<div
	class="background-fill"
	style:height={ws.canvasHeight * ws.characterHeight + 'px'}
	style:width={ws.canvasWidth * ws.characterWidth + 'px'}
/>
<div
	class="background"
	style:background-size="{ws.characterWidth}px {ws.characterHeight}px"
	style:transform="translate(-{ws.characterWidth / 2}px, -{ws.characterHeight / 2}px)"
/>
<pre class="workspace" id="workspace" />
<div class="cursor" id="cursor" />

<style lang="scss">
	.workspace {
		position: absolute;
		top: 0;
		left: 0;
		/* font-family: 'Fira Code', monospace;*/
	}

	.background {
		position: absolute;
		top: 0;
		left: 0;
		background-image: radial-gradient(circle, #aaa 0%, #aaa 10%, transparent 10.1%);
		background-repeat: repeat;
		height: calc(100% + 1em);
		width: calc(100% + 1em);
	}
	.background-fill {
		background: #fff;
	}
</style>
