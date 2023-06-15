<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { wp, display } from './stores';
	import { workspace as ws } from '$lib/scripts/workspace';
	import ModeManager from '$lib/scripts/modes';
	import Vector2 from '$lib/scripts/vector';

	let displayString: string;
	let cursorPos = new Vector2(0, 0);

	display.subscribe((value) => (displayString = value));

	wp.subscribe(() => {
		cursorPos = new Vector2(
			(wp.cursor.x - wp.canvas.x) * wp.characterSize.x,
			(wp.cursor.y - wp.canvas.y) * wp.characterSize.y
		);
	});

	onMount(() => {
		if (browser) {
			let rect = document.getElementById('sizing')?.getBoundingClientRect();
			wp.characterSize = new Vector2(rect?.width ?? 1, rect?.height ?? 1);
			window.addEventListener('resize', setViewSize);
		}
		setViewSize();
	});

	function setViewSize() {
		wp.canvasSize = new Vector2(
			Math.floor(window.innerWidth / wp.characterSize.x),
			Math.floor(window.innerHeight / wp.characterSize.y)
		);
	}

	function click(e: MouseEvent) {
		ModeManager.currentMode.click(e);
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
</script>

<svelte:window on:click={click} on:keydown={keydown} on:paste={paste} />
<div
	class="background-fill"
	style:height={wp.canvasSize.y * wp.characterSize.y + 'px'}
	style:width={wp.canvasSize.x * wp.characterSize.x + 'px'}
/>
<div
	class="background"
	style:background-size="{wp.characterSize.x}px {wp.characterSize.y}px"
	style:transform="translate(-{wp.characterSize.x / 2}px, -{wp.characterSize.y / 2}px)"
/>
<pre class="workspace">{@html displayString}</pre>
<pre id="sizing">a</pre>

<div
	class="cursor"
	style:left={cursorPos.x + 'px'}
	style:top={cursorPos.y + 'px'}
	style:width={wp.characterSize.x + 'px'}
	style:height={wp.characterSize.y + 'px'}
/>

<style lang="scss">
	#sizing {
		opacity: 0;
		position: absolute;
	}

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
