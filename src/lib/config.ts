export const WORKER_URL = 'https://YOUR-WORKER.workers.dev';

export const CATEGORIES = [
	{ id: 1, label: 'Static Wallpapers', slug: 'static', icon: '🖼️' },
	{ id: 2, label: 'Animated Wallpapers', slug: 'dynamic', icon: '🎬' }
] as const;

export function proxyUrl(url: string): string {
	return `${WORKER_URL}/?url=${encodeURIComponent(url)}`;
}
