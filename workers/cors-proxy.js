// Cloudflare Worker — CORS proxy for RedMagic wallpaper downloads
// Deploy via: `npx wrangler deploy`
// Set `WORKER_URL` in config.ts to your worker's URL

export default {
	async fetch(request) {
		const url = new URL(request.url);
		const targetUrl = url.searchParams.get('url');

		if (!targetUrl) {
			return new Response('Missing "url" parameter', { status: 400 });
		}

		try {
			const response = await fetch(targetUrl);

			const headers = new Headers(response.headers);
			headers.set('Access-Control-Allow-Origin', '*');
			headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
			headers.set('Access-Control-Max-Age', '86400');

			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers
			});
		} catch (err) {
			return new Response(err.message, { status: 502 });
		}
	}
};
