# Mora Wallpapers Fetcher

A Simple static site that fetches static/animated wallpapers to download from the Redmagic Mora CN app made with SvelteKit. Deployed with GitHub Pages.

## Development

```sh
npm install
npm run dev
```

Create a production build:

```sh
npm run build
npm run preview
```

## Deployment

The GitHub Action (`.github/workflows/fetch-wallpapers.yml`) runs daily and on push to `main`:

1. Fetches the latest wallpaper metadata from the RedMagic API
2. Builds the SvelteKit site with the correct `BASE_PATH`
3. Deploys to GitHub Pages via `actions/deploy-pages`

Manual re-fetch can be triggered from the Actions tab.

## Endpoint

Endpoint: `POST https://redmagicbot-api.nubia.com/botwallpaper/list_all`

Categories: 1 (Static), 2 (Animated)
