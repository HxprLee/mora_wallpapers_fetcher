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
		event.respondWith(fetch(targetUrl, { mode: 'no-cors' }));
	}
});
