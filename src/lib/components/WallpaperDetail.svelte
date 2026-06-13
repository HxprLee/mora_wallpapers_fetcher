<script lang="ts">
    import { onMount } from "svelte";
    import type { WallpaperItem } from "$lib/stores/wallpapers.svelte.ts";
    import { formatSize, formatCount } from "$lib/utils/format";
    import { openInNewTab, downloadSingle } from "$lib/utils/download";

    let { item, onclose }: { item: WallpaperItem; onclose: () => void } =
        $props();

    let closing = $state(false);
    let videoEl = $state<HTMLVideoElement>();
    let isMobile = $state(false);
    let panelOpen = $state(false);
    let dragY = $state(0);
    let isDragging = $state(false);
    let touchStartY = $state(0);
    let touchStartX = $state(0);

    onMount(() => {
        isMobile = window.innerWidth <= 640;
        if (isMobile) {
            requestAnimationFrame(() => {
                panelOpen = true;
            });
        }
    });

    function cleanup() {
        document.body.style.overflow = "";
        if (videoEl) {
            videoEl.pause();
            videoEl.removeAttribute("src");
            videoEl.load();
        }
    }

    function onTouchStart(e: TouchEvent) {
        if (!isMobile) return;
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        isDragging = true;
    }

    function onTouchMove(e: TouchEvent) {
        if (!isDragging) return;
        const dy = e.touches[0].clientY - touchStartY;
        if (dy > 0) {
            dragY = dy;
        }
    }

    function onTouchEnd(e: TouchEvent) {
        if (!isDragging) return;
        isDragging = false;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const dx = e.changedTouches[0].clientX - touchStartX;
        touchStartY = 0;
        touchStartX = 0;
        dragY = 0;
        if (dy > 60 && Math.abs(dx) < dy * 0.6) {
            close();
        }
    }

    function close() {
        if (closing) return;
        closing = true;
        cleanup();
        if (isMobile) {
            panelOpen = false;
            setTimeout(onclose, 350);
        } else {
            setTimeout(onclose, 250);
        }
    }

    function onBackdrop(e: MouseEvent) {
        if (e.target === e.currentTarget) close();
    }

    function onKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") close();
    }

    function isVideo(url: string): boolean {
        return /\.(mp4|webm|mov)$/i.test(url.split("?")[0]);
    }
</script>

<svelte:window onkeydown={onKeydown} ontouchmove={onTouchMove} />

<div class="backdrop" class:closing role="presentation" onclick={onBackdrop}>
    <div
        class="panel"
        class:closing
        class:panelOpen
        class:dragging={isDragging}
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        style:transform={isDragging ? `translateY(${dragY}px)` : undefined}
    >
        <div
            class="drag-handle"
            aria-hidden="true"
            ontouchstart={onTouchStart}
            ontouchend={onTouchEnd}
        ></div>
        <button class="close-btn" onclick={close} aria-label="Close"
            ><i class="fas fa-times"></i></button
        >

        <div class="layout">
            <div class="preview-wrap">
                <div class="preview">
                    {#if isVideo(item.file_url)}
                        <video
                            autoplay
                            muted
                            loop
                            playsinline
                            src={item.file_url}
                            class="media"
                            bind:this={videoEl}
                        ></video>
                    {:else}
                        <img
                            src={item.file_url}
                            alt={item.title}
                            class="media"
                        />
                    {/if}
                </div>
            </div>

            <div class="meta-panel">
                <h2 class="title">{item.title}</h2>

                <div class="meta-grid">
                    <div class="meta-item">
                        <span class="label">Category</span>
                        <span class="value"
                            >{["", "Static", "Dynamic"][item.category] ||
                                "Unknown"}</span
                        >
                    </div>
                    <div class="meta-item">
                        <span class="label">File Size</span>
                        <span class="value">{formatSize(item.file_size)}</span>
                    </div>
                    <div class="meta-item">
                        <span class="label">ID</span>
                        <span class="value">{item.id}</span>
                    </div>
                    <div class="meta-item">
                        <span class="label">Usage Count</span>
                        <span class="value"
                            >{formatCount(item.usage_count)}</span
                        >
                    </div>
                    <div class="meta-item">
                        <span class="label">MD5</span>
                        <span class="value mono">{item.file_md5}</span>
                    </div>
                    <div class="meta-item">
                        <span class="label">Type</span>
                        <span class="value"
                            >{isVideo(item.file_url) ? "Video" : "Image"}</span
                        >
                    </div>
                </div>

                <div class="actions">
                    <button class="btn" onclick={() => downloadSingle(item)}>
                        <i class="fas fa-arrow-down"></i> Download
                    </button>
                    <button
                        class="btn btn-outline"
                        onclick={() => openInNewTab(item)}
                    >
                        <i class="fas fa-external-link-alt"></i> Open in new tab
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    @keyframes backdropIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    @keyframes backdropOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
    @keyframes modalIn {
        from {
            transform: scale(0.92);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
    @keyframes modalOut {
        from {
            transform: scale(1);
            opacity: 1;
        }
        to {
            transform: scale(0.92);
            opacity: 0;
        }
    }
    @keyframes backdropInMobile {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    @keyframes backdropOutMobile {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }

    .backdrop {
        position: fixed;
        inset: 0;
        z-index: 100;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: backdropIn 0.2s ease-out;
    }
    .backdrop.closing {
        animation: backdropOut 0.2s ease-in forwards;
        background: rgba(0, 0, 0, 0.7);
    }
    .panel {
        background: #1a1a2e;
        border-radius: 16px;
        max-width: 900px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        animation: modalIn 0.25s ease-out;
    }
    .panel.closing {
        animation: modalOut 0.2s ease-in forwards;
    }
    .close-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.5);
        color: #fff;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
    }
    .close-btn:hover {
        background: rgba(255, 62, 62, 0.8);
    }
    .drag-handle {
        display: none;
        justify-content: center;
        padding: 10px 0 0;
        position: sticky;
        top: 0;
        z-index: 1;
    }
    .drag-handle::after {
        content: "";
        width: 36px;
        height: 4px;
        border-radius: 2px;
        background: #444;
    }
    .layout {
        display: flex;
    }
    @media (max-width: 640px) {
        .layout {
            flex-direction: column;
        }
        .backdrop {
            padding: 0;
            align-items: flex-end;
            animation: backdropInMobile 0.2s ease-out;
        }
        .backdrop.closing {
            animation: backdropOutMobile 0.15s ease-in forwards;
        }
        .panel {
            border-radius: 16px 16px 0 0;
            max-height: 100vh;
            animation: none;
            transform: translateY(100%);
            transition: transform 0.35s cubic-bezier(0.32, 0, 0, 1);
        }
        .panel.panelOpen {
            transform: translateY(0);
        }
        .panel.dragging {
            transition: none;
        }
        .drag-handle {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            display: flex;
            touch-action: none;
            z-index: 2;
            pointer-events: auto;
        }
        .close-btn {
            position: fixed;
            top: 12px;
            right: 12px;
            z-index: 102;
        }
        .layout {
            position: relative;
        }
        .preview-wrap {
            border-radius: 16px 16px 0 0;
        }
        .preview {
            position: relative;
        }
        .preview::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(transparent 40%, rgba(0, 0, 0, 0.7));
            pointer-events: none;
        }
        .meta-panel {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 48px 16px 20px;
            background: linear-gradient(transparent, rgba(0, 0, 0, 0.8) 40%);
            z-index: 1;
        }
        .title {
            font-size: 18px;
        }
        .actions {
            flex-direction: column;
        }
        .actions .btn {
            width: 100%;
            justify-content: center;
        }
        .actions .btn-outline {
            display: none;
        }
        .meta-grid {
            grid-template-columns: 1fr 1fr;
        }
        .meta-item:nth-child(3) {
            display: none;
        }
        .meta-item:nth-child(5) {
            display: none;
        }
    }
    @media (min-width: 641px) {
        .panel {
            height: 90vh;
            overflow: hidden;
        }
        .layout {
            height: 100%;
        }
        .preview-wrap {
            height: 100%;
            aspect-ratio: 9/16;
            flex-shrink: 0;
        }
        .preview {
            height: 100%;
        }
        .meta-panel {
            flex: 1;
            overflow-y: auto;
            min-width: 0;
        }
    }

    .preview-wrap {
        border-radius: 16px 0 0 16px;
        overflow: hidden;
        background: #0f0f1a;
    }
    .preview {
        aspect-ratio: 9 / 16;
        overflow: hidden;
    }
    .media {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
    }
    .meta-panel {
        padding: 28px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    .title {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        padding-right: 32px;
    }
    .meta-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }
    .meta-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    .label {
        font-size: 11px;
        text-transform: uppercase;
        color: #666;
        letter-spacing: 0.5px;
    }
    .value {
        font-size: 14px;
        color: #ccc;
    }
    .mono {
        font-family: monospace;
        font-size: 12px;
        word-break: break-all;
    }
    .actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
    .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 67px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        background: #ff3e3e;
        color: #fff;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    .btn:hover {
        background: #e63535;
    }
    .btn-outline {
        background: transparent;
        border: 1px solid #444;
        color: #ccc;
    }
    .btn-outline:hover {
        border-color: #ff3e3e;
        color: #ff3e3e;
        background: transparent;
    }
</style>
