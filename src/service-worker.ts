/// <reference types="@sveltejs/kit" />

self.addEventListener('install', () => {
	self.skipWaiting();
});

self.addEventListener('activate', () => {
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
	const opaque = await fetch(targetUrl, { mode: 'no-cors' });
	const { readable, writable } = new TransformStream();
	opaque.body!.pipeTo(writable).catch(() => {});
	return new Response(readable, {
		status: 200,
		statusText: 'OK',
		headers: {
			'Content-Type': getContentType(targetUrl),
			'Access-Control-Allow-Origin': '*'
		}
	});
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
