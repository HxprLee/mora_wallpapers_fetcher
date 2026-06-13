#!/usr/bin/env bash
# fetch-metadata.sh — Fetches wallpaper metadata from RedMagic Bot API and saves as JSON.
# Intended to run in a GitHub Action (or locally) to populate static/wallpapers/all.json.
set -euo pipefail

API_BASE="https://redmagicbot-api.nubia.com"
ENDPOINT="$API_BASE/botwallpaper/list_all"
SERVER_TOKEN="KbBi1ycbN19VL97IFwSV1hL6qzeKwnye"
PAGE_NO="1"
PAGE_SIZE="100"
DEVICE="1"

OUTFILE="static/wallpapers/all.json"
mkdir -p "$(dirname "$OUTFILE")"

compute_sign() {
	local sorted
	sorted=$(printf "%s\n" "$@" | sort | paste -sd "")
	printf "%s" "${sorted}${SERVER_TOKEN}" | md5sum | awk '{print $1}'
}

merge_json() {
	python3 -c "
import sys, json

merged = {'total': 0, 'code': 0, 'data': []}
for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    d = json.loads(line)
    merged['data'].extend(d.get('data', []))
    merged['total'] += d.get('total', 0)

print(json.dumps(merged, indent=2))
"
}

results=()
for cat_id in 1 2; do
	time_sec=$(date +%s)
	sign=$(compute_sign \
		"category=${cat_id}" \
		"device=${DEVICE}" \
		"page_no=${PAGE_NO}" \
		"page_size=${PAGE_SIZE}" \
		"time=${time_sec}")

	response=$(curl -s --max-time 15 -X POST "$ENDPOINT" \
		-d "time=${time_sec}" \
		-d "page_no=${PAGE_NO}" \
		-d "page_size=${PAGE_SIZE}" \
		-d "category=${cat_id}" \
		-d "device=${DEVICE}" \
		-d "sign=${sign}" || echo "")

	code=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin).get('code',-1))" 2>/dev/null || echo "-1")
	if [[ "$code" != "0" ]]; then
		echo "[!] API error (code=${code}) for category=${cat_id}, skipping" >&2
		continue
	fi

	echo "$response"
done | merge_json > "$OUTFILE"

echo "[+] Metadata saved to ${OUTFILE}"
echo "    Total: $(python3 -c "import json; d=json.load(open('${OUTFILE}')); print(d['total'])") wallpapers"
