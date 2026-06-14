import { CORS_PROXY } from "$lib/config";
import type { WallpaperItem } from "$lib/stores/wallpapers";

function proxyUrl(url: string): string {
  return `${CORS_PROXY}${encodeURIComponent(url)}`;
}

export function downloadSingle(item: WallpaperItem): void {
  const link = document.createElement("a");
  link.href = item.file_url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.download = `${item.title}${getExtension(item.file_url)}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function openInNewTab(item: WallpaperItem): void {
  window.open(item.file_url, "_blank");
}

function getExtension(url: string): string {
  const clean = url.split("?")[0].split("#")[0];
  const ext = clean.split(".").pop();
  return ext ? `.${ext}` : "";
}

export async function downloadBatchAsZip(
  items: WallpaperItem[],
  categoryLabel: string,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  const total = items.length;
  let done = 0;

  const fetches = items.map(async (item) => {
    try {
      const resp = await fetch(proxyUrl(item.file_url));
      const blob = await resp.blob();
      const ext = getExtension(item.file_url);
      zip.file(`${item.title}${ext}`, blob);
    } catch {
      const ext = getExtension(item.file_url);
      zip.file(
        `${item.title}${ext}`,
        new Blob(["download failed"], { type: "text/plain" }),
      );
    }
    done++;
    onProgress?.(done, total);
  });

  await Promise.all(fetches);

  const blob = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `redmagic-wallpapers-${categoryLabel}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
