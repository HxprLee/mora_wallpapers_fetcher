import { proxyUrl } from "$lib/config";
import type { WallpaperItem } from "$lib/stores/wallpapers";

export async function downloadSingle(item: WallpaperItem): Promise<void> {
  const filename = `${item.title}${getExtension(item.file_url)}`;

  try {
    const resp = await fetch(proxyUrl(item.file_url));
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const blob = await resp.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch {
    window.open(item.file_url, "_blank");
  }
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
