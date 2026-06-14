<script lang="ts">
	import { base } from '$app/paths';
	let { children } = $props();

	$effect(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register(`${base}/service-worker.js`);
		}
	});
</script>

<svelte:head>
	<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🖼️</text></svg>" />
</svelte:head>

<div class="app">
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
</style>
