#!/usr/bin/env bash
set -euo pipefail

API_BASE="https://redmagicbot-api.nubia.com"
ENDPOINT="$API_BASE/botwallpaper/list_all"
SERVER_TOKEN="KbBi1ycbN19VL97IFwSV1hL6qzeKwnye"
PAGE_NO="1"
PAGE_SIZE="100"
DEVICE="1"

CATEGORIES=(
  "1:static"
  "2:dynamic"
)

compute_sign() {
  local sorted
  sorted=$(printf "%s\n" "$@" | sort | paste -sd "")
  printf "%s" "${sorted}${SERVER_TOKEN}" | md5sum | awk '{print $1}'
}

OUTDIR="./wallpapers"
mkdir -p "$OUTDIR"

for entry in "${CATEGORIES[@]}"; do
  cat_id="${entry%%:*}"
  cat_label="${entry##*:}"
  echo "[*] Fetching category=${cat_id} (${cat_label}) ..."

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
    echo "[!] API error (code=${code}) for ${cat_label}, skipping"
    continue
  fi

  subdir="${OUTDIR}/${cat_label}"
  mkdir -p "$subdir"

  manifest="${subdir}/_manifest.txt"
  : > "$manifest"

  tmpfile=$(mktemp)
  echo "$response" | python3 -c "
import sys, json, os
d = json.load(sys.stdin)
for item in d.get('data', []):
    url = (item.get('file_url') or '').strip()
    title = (item.get('title') or '').strip()
    fid = item.get('id', '')
    md5 = (item.get('file_md5') or '').strip()
    size = item.get('file_size', 0)
    ext = os.path.splitext(url.split('?')[0].split('#')[0])[1]
    if not ext:
        ext = '.mp4'
    safe = ''.join(c if c.isalnum() or c in ' _-.' else '_' for c in title)
    if not safe:
        safe = f'wallpaper_{fid}'
    print(f'{url}|{safe}{ext}|{fid}|{md5}|{size}')
" > "$tmpfile"

  pids=()
  while IFS='|' read -r url filename fid md5 size; do
    if [[ -z "$url" ]]; then
      continue
    fi
    echo "${url}|${filename}|${fid}|${md5}|${size}" >> "$manifest"

    outpath="${subdir}/${filename}"
    if [[ ! -f "$outpath" ]]; then
      (
        curl -sL --max-time 120 -o "$outpath" "$url" && echo "  OK: ${filename}" || {
          echo "  FAIL: ${filename}"
          rm -f "$outpath"
        }
      ) &
      pids+=($!)
    else
      echo "  EXISTS: ${filename}"
    fi
  done < "$tmpfile"
  rm -f "$tmpfile"

  if [[ ${#pids[@]} -gt 0 ]]; then
    echo "  Waiting for ${#pids[@]} downloads..."
    wait "${pids[@]}"
  fi

  count=$(ls -1 "$subdir" 2>/dev/null | grep -v _manifest | wc -l)
  echo "[*] ${cat_label}: ${count} files in ${subdir}/"
done

echo ""
echo "[+] All done. Wallpapers saved under ${OUTDIR}/"
echo "    Manifests (*/_manifest.txt) contain: url|filename|id|md5|size"
