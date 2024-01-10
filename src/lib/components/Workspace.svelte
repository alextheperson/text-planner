<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { wp, display } from './stores';
	import { workspace as ws } from '$lib/scripts/workspace';
	import ModeManager from '$lib/scripts/modes';

	let displayString: string;
	let cursorX = 0;
	let cursorY = 0;
	let testCanvas: HTMLCanvasElement | undefined;

	display.subscribe((value) => (displayString = value));

	wp.subscribe(() => {
		cursorX = (wp.cursorX - wp.canvasX) * wp.characterWidth;
		cursorY = (wp.cursorY - wp.canvasY) * wp.characterHeight;
	});

	onMount(() => {
		if (browser) {
			wp.characterWidth = getTextWidth('M', '16px Fira Code');
			wp.characterHeight = 20;
			window.addEventListener('resize', setViewSize);
		}
		setViewSize();
	});

	function setViewSize() {
		wp.canvasWidth = Math.floor(window.innerWidth / wp.characterWidth);
		wp.canvasHeight = Math.floor(window.innerHeight / wp.characterHeight);
		wp.characterWidth = getTextWidth('M', '16px Fira Code');
		wp.characterHeight = 20;
	}

	function click(e: MouseEvent) {
		ModeManager.currentMode.click(e);
		wp.characterWidth = getTextWidth('M', '16px Fira Code');
		wp.characterHeight = 20;
		wp.canvasWidth = Math.floor(window.innerWidth / wp.characterWidth);
		wp.canvasHeight = Math.floor(window.innerHeight / wp.characterHeight);
	}

	function keydown(e: KeyboardEvent) {
		if (!e.metaKey) {
			ModeManager.currentMode.input(e);

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
	style:height={wp.canvasHeight * wp.characterHeight + 'px'}
	style:width={wp.canvasWidth * wp.characterWidth + 'px'}
/>
<div
	class="background"
	style:background-size="{wp.characterWidth}px {wp.characterHeight}px"
	style:transform="translate(-{wp.characterWidth / 2}px, -{wp.characterHeight / 2}px)"
/>
<pre class="workspace">{@html displayString}</pre>

<div
	class="cursor"
	style:left={cursorX + 'px'}
	style:top={cursorY + 'px'}
	style:width={wp.characterWidth + 'px'}
	style:height={wp.characterHeight + 'px'}
/>

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
