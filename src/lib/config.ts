export const CORS_PROXY = 'https://corsproxy.io/?';

export const CATEGORIES = [
	{ id: 1, label: 'Static Wallpapers', slug: 'static', icon: '🖼️' },
	{ id: 2, label: 'Animated Wallpapers', slug: 'dynamic', icon: '🎬' }
] as const;

export function proxyUrl(url: string): string {
	return `${CORS_PROXY}${encodeURIComponent(url)}`;
}
