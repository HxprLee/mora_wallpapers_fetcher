/// <reference types="@sveltejs/kit" />

const CACHE_NAME = 'download-cache';

self.addEventListener('install', () => {
	self.skipWaiting();
});

self.addEventListener('activate', (event: ExtendableEvent) => {
	event.waitUntil(caches.delete(CACHE_NAME));
	self.clients.claim();
});

self.addEventListener('fetch', (event: FetchEvent) => {
	const url = new URL(event.request.url);

	if (url.pathname.endsWith('/download-proxy') && url.searchParams.has('url')) {
		const targetUrl = url.searchParams.get('url')!;
		event.respondWith(proxyDownload(targetUrl));
	}
});

async function proxyDownload(targetUrl: string): Promise<Response> {
	const cache = await caches.open(CACHE_NAME);

	let cached = await cache.match(targetUrl);
	if (!cached) {
		const opaque = await fetch(targetUrl, { mode: 'no-cors' });
		await cache.put(targetUrl, opaque);
		cached = await cache.match(targetUrl);
	}

	if (cached) {
		try {
			const blob = await cached.blob();
			return new Response(blob, {
				status: 200,
				statusText: 'OK',
				headers: {
					'Content-Type': getContentType(targetUrl),
					'Access-Control-Allow-Origin': '*'
				}
			});
		} catch {
			// opaque body not readable — fall through
		}
	}

	// Pass opaque response through as last resort
	return fetch(targetUrl, { mode: 'no-cors' });
}

function getContentType(url: string): string {
	const ext = url.split('?')[0].split('#')[0].split('.').pop()?.toLowerCase();
	const map: Record<string, string> = {
		png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
		webp: 'image/webp', gif: 'image/gif',
		mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime'
	};
	return map[ext || ''] || 'application/octet-stream';
}
