<script lang="ts">
	import { base } from '$app/paths';
	let { children } = $props();

	let muted = $state(true);
	let audioEl = $state<HTMLAudioElement>();

	$effect(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register(`${base}/service-worker.js`);
		}
	});

	function toggle() {
		if (!audioEl) return;
		muted = !muted;
		audioEl.muted = muted;
		if (!muted) audioEl.play();
	}
</script>

<svelte:head>
	<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🖼️</text></svg>" />
</svelte:head>

<audio src="{base}/bgm.mp3" autoplay muted loop bind:this={audioEl}></audio>

<div class="app">
	<button class="bgm-toggle" onclick={toggle} aria-label={muted ? 'Unmute music' : 'Mute music'}>
		<i class="fas {muted ? 'fa-volume-mute' : 'fa-volume-up'}"></i>
	</button>
	{@render children()}
</div>

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}
	:global {
		@font-face {
			font-family: 'YouSheBiaoTiHei';
			src: url('/fonts/YouSheBiaoTiHei-2.ttf') format('truetype');
			font-weight: normal;
			font-style: normal;
			font-display: swap;
		}
	}
	:global(body) {
		font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		background: #0f0f1a;
		color: #eee;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}
	:global(a) {
		color: inherit;
	}
	:global(img) {
		max-width: 100%;
	}
	.app {
		min-height: 100vh;
	}
	.bgm-toggle {
		position: fixed;
		top: 12px;
		right: 12px;
		z-index: 50;
		width: 36px;
		height: 36px;
		border: 1px solid #444;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.6);
		color: #ccc;
		font-size: 14px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s;
	}
	.bgm-toggle:hover {
		background: rgba(255, 62, 62, 0.4);
		border-color: #ff3e3e;
	}
</style>
