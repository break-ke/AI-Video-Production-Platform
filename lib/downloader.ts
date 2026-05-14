import { writeFile, mkdir } from "fs/promises";
import path from "path";

const DOWNLOAD_DIR = path.join(process.cwd(), "public", "clips");

async function fetchDirectVideo(url: string): Promise<string | null> {
  // Direct video URL
  if (/\.(mp4|mov|webm|avi)(\?|$)/i.test(url)) {
    return url;
  }

  // Try to find video in page meta
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      redirect: "follow",
    });
    const html = await res.text();

    // Check og:video meta
    const og = html.match(/<meta[^>]+property="og:video(?::secure_url)?"[^>]+content="([^"]*)"/i);
    if (og?.[1]) return og[1];

    // Check twitter:player:stream
    const tw = html.match(/<meta[^>]+name="twitter:player:stream"[^>]+content="([^"]*)"/i);
    if (tw?.[1]) return tw[1];

    // Check video source tags
    const v = html.match(/<source[^>]+src="([^"]+\.mp4[^"]*)"/i);
    if (v?.[1]) return v[1];

  } catch { /* ignore */ }

  return null;
}

export async function downloadVideoFromUrl(pageUrl: string, taskId: string): Promise<string | null> {
  await mkdir(DOWNLOAD_DIR, { recursive: true });

  const videoUrl = await fetchDirectVideo(pageUrl);
  if (!videoUrl) return null;

  try {
    const fileName = `${taskId}_source.mp4`;
    const outPath = path.join(DOWNLOAD_DIR, fileName);

    const res = await fetch(videoUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    if (!res.ok) return null;

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 10240) return null;

    await writeFile(outPath, buf);
    console.log(`[Downloader] Downloaded ${(buf.length / 1024 / 1024).toFixed(1)}MB → ${fileName}`);
    return `/clips/${fileName}`;
  } catch {
    return null;
  }
}
