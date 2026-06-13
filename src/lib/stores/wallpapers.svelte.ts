export interface WallpaperItem {
	id: number;
	title: string;
	category: number;
	file_url: string;
	thumbnail_url: string;
	file_size: number;
	file_md5: string;
	usage_count: number;
	audible: number;
	state: number;
}

interface ApiResponse {
	total: number;
	code: number;
	data: WallpaperItem[];
}

export interface CategoryGroup {
	id: number;
	label: string;
	slug: string;
	items: WallpaperItem[];
}

let _wallpapers = $state<WallpaperItem[]>([]);
let _loading = $state(true);
let _error = $state<string | null>(null);
let _searchQuery = $state('');

export function getWallpapers() { return _wallpapers; }
export function getLoading() { return _loading; }
export function getError() { return _error; }
export function getSearchQuery() { return _searchQuery; }
export function setSearchQuery(q: string) { _searchQuery = q; }

const _filtered = $derived.by<WallpaperItem[]>(() => {
	if (!_searchQuery.trim()) return _wallpapers;
	const q = _searchQuery.toLowerCase();
	return _wallpapers.filter((w) => w.title.toLowerCase().includes(q));
});

export function getFiltered() { return _filtered; }

const _byCategory = $derived.by<CategoryGroup[]>(() => {
	const map = new Map<number, WallpaperItem[]>();
	for (const item of _filtered) {
		if (!map.has(item.category)) map.set(item.category, []);
		map.get(item.category)!.push(item);
	}
	const groups: CategoryGroup[] = [
		{ id: 1, label: 'Static Wallpapers', slug: 'static', items: map.get(1) ?? [] },
		{ id: 2, label: 'Animated Wallpapers', slug: 'dynamic', items: map.get(2) ?? [] }
	];
	return groups.filter((g) => g.items.length > 0);
});

export function getByCategory() { return _byCategory; }

import { base } from '$app/paths';

export async function loadWallpapers(): Promise<void> {
	_loading = true;
	_error = null;
	try {
		const resp = await fetch(`${base}/wallpapers/all.json`);
		if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
		const data: ApiResponse = await resp.json();
		if (data.code !== 0) throw new Error(`API error code ${data.code}`);
		_wallpapers = data.data;
	} catch (e) {
		_error = e instanceof Error ? e.message : 'Failed to load wallpapers';
	} finally {
		_loading = false;
	}
}
