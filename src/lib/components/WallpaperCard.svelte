<script lang="ts">
	import type { WallpaperItem } from '$lib/stores/wallpapers.svelte.ts';
	import { formatSize, formatCount } from '$lib/utils/format';
	import { downloadSingle } from '$lib/utils/download';

	let { item, onselect }:
		{ item: WallpaperItem; onselect: (item: WallpaperItem) => void }
		= $props();

	function handleDl(e: MouseEvent) {
		e.stopPropagation();
		downloadSingle(item);
	}

	function handleClick() {
		onselect(item);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onselect(item);
		}
	}

	function isVideo(url: string): boolean {
		return /\.(mp4|webm|mov)$/i.test(url.split('?')[0]);
	}
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<div class="card" role="button" tabindex="0" onclick={handleClick} onkeydown={handleKeydown}>
	<div class="thumb-wrap">
		{#if isVideo(item.file_url)}
			<span class="badge-video">▶</span>
		{/if}
		<img class="thumb" src={item.thumbnail_url} alt={item.title} loading="lazy" />
		<div class="gradient"></div>
		<div class="info">
			<span class="title">{item.title}</span>
			<span class="meta">
				{formatSize(item.file_size)} · {formatCount(item.usage_count)} uses
			</span>
		</div>
		<button class="dl-btn" onclick={handleDl} title="Download"><i class="fas fa-arrow-down"></i></button>
	</div>
</div>

<style>
	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		border-radius: 12px;
		overflow: hidden;
		background: #1a1a2e;
		transition: transform 0.2s, box-shadow 0.2s;
		text-decoration: none;
		color: inherit;
		cursor: pointer;
	}
	.card:hover {
		transform: scale(1.04);
		box-shadow: 0 8px 24px rgba(255, 62, 62, 0.25);
	}
	.card:focus-visible {
		outline: 2px solid #ff3e3e;
		outline-offset: 2px;
	}
	.thumb-wrap {
		position: relative;
		aspect-ratio: 9 / 16;
		overflow: hidden;
		background: #0f0f1a;
	}
	.thumb {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.badge-video {
		position: absolute;
		top: 8px;
		right: 8px;
		background: rgba(0,0,0,0.7);
		color: #fff;
		border-radius: 50%;
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		pointer-events: none;
	}
	.gradient {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 60%;
		background: linear-gradient(transparent, rgba(0,0,0,0.85));
		pointer-events: none;
		z-index: 1;
	}
	.info {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 10px 12px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		z-index: 1;
	}
	.title {
		font-size: 14px;
		font-weight: 600;
		color: #fff;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.meta {
		font-size: 12px;
		color: #ccc;
	}
	.dl-btn {
		position: absolute;
		bottom: 8px;
		right: 8px;
		width: 32px;
		height: 32px;
		border: none;
		border-radius: 8px;
		background: rgba(255, 62, 62, 0.9);
		color: #fff;
		font-size: 16px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.2s;
		z-index: 2;
	}
	.card:hover .dl-btn {
		opacity: 1;
	}
	.dl-btn:hover {
		background: #ff3e3e;
	}
</style>
