import { writeFile, mkdir } from "fs/promises";
import path from "path";

const DOWNLOAD_DIR = path.join(process.cwd(), "public", "clips");

async function fetchDirectVideo(url: string): Promise<string | null> {
  if (/\.(mp4|mov|webm|avi)(\?|$)/i.test(url)) return url;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      redirect: "follow",
    });
    const html = await res.text();
    const og = html.match(/<meta[^>]+property="og:video(?::secure_url)?"[^>]+content="([^"]*)"/i);
    if (og?.[1]) return og[1];
    const tw = html.match(/<meta[^>]+name="twitter:player:stream"[^>]+content="([^"]*)"/i);
    if (tw?.[1]) return tw[1];
    const v = html.match(/<source[^>]+src="([^"]+\.mp4[^"]*)"/i);
    if (v?.[1]) return v[1];
  } catch { /* ignore */ }
  return null;
}

async function downloadFileFromUrl(videoUrl: string, fileName: string): Promise<string | null> {
  const outPath = path.join(DOWNLOAD_DIR, fileName);
  const res = await fetch(videoUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 10240) return null;
  await writeFile(outPath, buf);
  console.log(`[Downloader] Downloaded ${(buf.length / 1024 / 1024).toFixed(1)}MB`);
  return `/clips/${fileName}`;
}

export async function downloadVideoFromUrl(pageUrl: string, taskId: string): Promise<string | null> {
  await mkdir(DOWNLOAD_DIR, { recursive: true });
  const fileName = `${taskId}_source.mp4`;

  // Strategy 1: Direct video detection from page
  const directUrl = await fetchDirectVideo(pageUrl);
  if (directUrl) {
    const result = await downloadFileFromUrl(directUrl, fileName);
    if (result) return result;
  }

  // For TikTok/Douyin/YouTube: return null (need user to upload video file)
  // Users can download the video using any free TikTok downloader tool
  // and upload the MP4 file through our upload button
  if (/tiktok|douyin|youtube|youtu\.be|instagram/i.test(pageUrl)) {
    return null; // Tell frontend to prompt for upload
  }

  return null;
}
