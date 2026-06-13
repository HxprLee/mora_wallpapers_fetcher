<script lang="ts">
    import type { WallpaperItem } from "$lib/stores/wallpapers.svelte.ts";
    import WallpaperCard from "./WallpaperCard.svelte";
    import { downloadBatchAsZip } from "$lib/utils/download";

    let {
        label,
        slug,
        items,
        onselect,
    }: {
        label: string;
        slug: string;
        items: WallpaperItem[];
        onselect: (item: WallpaperItem) => void;
    } = $props();

    let zipping = $state(false);
    let zipProgress = $state({ done: 0, total: 0 });

    async function handleBatchZip() {
        zipping = true;
        zipProgress = { done: 0, total: items.length };
        try {
            await downloadBatchAsZip(items, slug, (done, total) => {
                zipProgress = { done, total };
            });
        } finally {
            zipping = false;
        }
    }
</script>

<section class="category" id={slug}>
    <div class="section-header">
        <h2 class="section-title">{label}</h2>
        <span class="count"
            >{items.length} wallpaper{items.length !== 1 ? "s" : ""}</span
        >
        <div class="actions">
            <button class="btn" onclick={handleBatchZip} disabled={zipping}>
                {#if zipping}
                    <i class="fas fa-spinner fa-pulse"></i> Zipping {zipProgress.done}/{zipProgress.total}...
                {:else}
                    <i class="fas fa-arrow-down"></i> Download All
                {/if}
            </button>
        </div>
    </div>
    <div class="grid">
        {#each items as item (item.id)}
            <WallpaperCard {item} {onselect} />
        {/each}
    </div>
</section>

<style>
    .category {
        margin-bottom: 40px;
    }
    .section-header {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 16px;
    }
    .section-title {
        font-size: 22px;
        font-weight: 200;
        margin: 0;
        font-family: "YouSheBiaoTiHei", system-ui, sans-serif;
    }
    .count {
        font-size: 14px;
        color: #888;
    }
    .actions {
        margin-left: auto;
        display: flex;
        gap: 8px;
    }
    .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 67px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        background: #ff3e3e;
        color: #fff;
        transition: background 0.2s;
    }
    .btn:hover {
        background: #e63535;
    }
    .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
	:global(.btn-outline) {
		background: transparent;
		border: 1px solid #444;
		color: #ccc;
	}
	:global(.btn-outline:hover) {
		border-color: #ff3e3e;
		color: #ff3e3e;
		background: transparent;
	}
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
    }
    @media (max-width: 480px) {
        .grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
    }
</style>
