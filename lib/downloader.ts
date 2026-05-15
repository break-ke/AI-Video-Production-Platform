import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { spawn } from "child_process";

const DOWNLOAD_DIR = path.join(process.cwd(), "public", "clips");
const YT_DLP = "C:\\Users\\Administrator\\bin\\yt-dlp.exe";

async function fetchDirectVideo(url: string): Promise<string | null> {
  if (/\.(mp4|mov|webm|avi)(\?|$)/i.test(url)) return url;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    const html = await res.text();
    return html.match(/<meta[^>]+property="og:video(?::secure_url)?"[^>]+content="([^"]*)"/i)?.[1]
      || html.match(/<source[^>]+src="([^"]+\.mp4[^"]*)"/i)?.[1]
      || null;
  } catch { return null; }
}

function ytDlpDownload(url: string, outPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(YT_DLP, [
      "-f", "best[height<=720][ext=mp4]/best[height<=720]/best[ext=mp4]/best",
      "-o", outPath, url,
      "--max-filesize", "100M", "--no-playlist", "--socket-timeout", "60",
      "--no-check-certificates",
    ], { stdio: "pipe", timeout: 120000 });

    let stderr = "";
    child.stderr.on("data", (d) => { stderr += d.toString(); });
    child.on("close", (code) => {
      if (code === 0) resolve(true);
      else {
        console.log("[Downloader] yt-dlp exit:", code, stderr.substring(stderr.length - 200));
        resolve(false);
      }
    });
    child.on("error", (e) => {
      console.log("[Downloader] yt-dlp spawn error:", e.message);
      resolve(false);
    });
  });
}

async function downloadFileFromUrl(videoUrl: string, outPath: string): Promise<boolean> {
  try {
    const res = await fetch(videoUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 10240) return false;
    await writeFile(outPath, buf);
    console.log(`[Downloader] Downloaded ${(buf.length / 1024 / 1024).toFixed(1)}MB`);
    return true;
  } catch { return false; }
}

export async function downloadVideoFromUrl(pageUrl: string, taskId: string): Promise<string | null> {
  await mkdir(DOWNLOAD_DIR, { recursive: true });
  const fileName = `${taskId}_source.mp4`;
  const outPath = path.join(DOWNLOAD_DIR, fileName);

  // Strategy 1: direct video URL
  const directUrl = await fetchDirectVideo(pageUrl);
  if (directUrl && await downloadFileFromUrl(directUrl, outPath)) {
    return `/clips/${fileName}`;
  }

  // Strategy 2: yt-dlp via spawn (better process isolation)
  const ok = await ytDlpDownload(pageUrl, outPath);

  if (ok) {
    try {
      const { stat } = await import("fs/promises");
      const info = await stat(outPath);
      if (info.size > 10240) {
        console.log(`[Downloader] yt-dlp OK: ${(info.size / 1024 / 1024).toFixed(1)}MB`);
        return `/clips/${fileName}`;
      }
    } catch { /* file not found */ }
  }

  return null;
}
