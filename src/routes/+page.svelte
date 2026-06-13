<script lang="ts">
    import { onMount } from "svelte";
    import {
        loadWallpapers,
        getLoading,
        getError,
        setSearchQuery,
        getByCategory,
        getWallpapers,
        type WallpaperItem,
    } from "$lib/stores/wallpapers.svelte.ts";
    import CategorySection from "$lib/components/CategorySection.svelte";
    import WallpaperDetail from "$lib/components/WallpaperDetail.svelte";

    onMount(() => {
        loadWallpapers();
    });

    let search = $state("");
    let selectedItem = $state<WallpaperItem | null>(null);

    function onSearch(e: Event) {
        const val = (e.target as HTMLInputElement).value;
        search = val;
        setSearchQuery(val);
    }

    function onselect(item: WallpaperItem) {
        selectedItem = item;
    }

    function onClose() {
        selectedItem = null;
    }
</script>

<svelte:head>
    <title>RedMagic Wallpapers</title>
    <meta
        name="description"
        content="Browse and download RedMagic wallpapers"
    />
</svelte:head>

<div class="page">
    <header class="hero">
        <h1>RedMagic Mora Wallpapers</h1>
        <p class="subtitle">Offical Wallpaper from RedMagic Mora CN app</p>
    </header>

    <main>
        {#if getLoading()}
            <div class="center">
                <div class="spinner"></div>
                <p>Loading wallpapers...</p>
            </div>
        {:else if getError()}
            <div class="center error">
                <p>Failed to load: {getError()}</p>
                <button class="btn" onclick={loadWallpapers}
                    ><i class="fas fa-redo"></i> Retry</button
                >
            </div>
        {:else if getByCategory().length === 0}
            <div class="center">
                <p>No wallpapers found.</p>
            </div>
        {:else}
            {#each getByCategory() as group (group.id)}
                <CategorySection
                    label={group.label}
                    slug={group.slug}
                    items={group.items}
                    {onselect}
                />
            {/each}
            <div class="footer-info">
                {getWallpapers().length} wallpapers total
            </div>
        {/if}
    </main>
</div>

{#if selectedItem}
    <WallpaperDetail item={selectedItem} onclose={onClose} />
{/if}

<style>
    .page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
    }
    .hero {
        text-align: left;
        padding: 40px 0 32px;
    }
    .hero h1 {
        font-size: 32px;
        font-weight: 200;
        margin: 0 0 8px;
        font-family: "YouSheBiaoTiHei", system-ui, sans-serif;
        background: linear-gradient(135deg, #ff3e3e, #ff6b35);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    .subtitle {
        color: #888;
        margin: 0 0 20px;
        font-size: 15px;
    }
    .center {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px 20px;
        gap: 16px;
        color: #888;
    }
    .error {
        color: #ff6b6b;
    }
    .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #333;
        border-top-color: #ff3e3e;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
    .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        background: #ff3e3e;
        color: #fff;
    }
    .btn:hover {
        background: #e63535;
    }
    .footer-info {
        text-align: center;
        padding: 24px;
        color: #555;
        font-size: 13px;
    }
</style>
