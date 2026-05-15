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

  // Strategy 2: yt-dlp for all supported platforms
  try {
    const { execSync } = await import("child_process");
    const ytDlpPath = path.join(process.env.HOME || "~", "bin", "yt-dlp.exe");
    const outPath = path.join(DOWNLOAD_DIR, fileName);

    execSync(
      `"${ytDlpPath}" -f "best[height<=720][ext=mp4]/best[height<=720]/best[ext=mp4]/best" -o "${outPath}" "${pageUrl}" --max-filesize 100M --no-playlist --socket-timeout 30`,
      { timeout: 120000, stdio: "pipe" }
    );

    // Check if file was created
    const { stat } = await import("fs/promises");
    const info = await stat(outPath);
    if (info.size > 10240) {
      console.log(`[Downloader] yt-dlp downloaded ${(info.size / 1024 / 1024).toFixed(1)}MB`);
      return `/clips/${fileName}`;
    }
  } catch (e) {
    console.log("[Downloader] yt-dlp failed:", (e as Error).message?.substring(0, 100));
  }

  return null;
}
