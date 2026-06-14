// Cloudflare Worker — CORS proxy for RedMagic wallpaper downloads
// Deploy via: `npx wrangler deploy`

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
	'Access-Control-Allow-Headers': '*',
	'Access-Control-Max-Age': '86400'
};

export default {
	async fetch(request) {
		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: CORS_HEADERS });
		}

		const url = new URL(request.url);
		const targetUrl = url.searchParams.get('url');

		if (!targetUrl) {
			return new Response('Missing "url" parameter', { status: 400, headers: CORS_HEADERS });
		}

		try {
			const response = await fetch(targetUrl);

			const headers = new Headers(response.headers);
			for (const [key, value] of Object.entries(CORS_HEADERS)) {
				headers.set(key, value);
			}

			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers
			});
		} catch (err) {
			return new Response(err.message, { status: 502, headers: CORS_HEADERS });
		}
	}
};
