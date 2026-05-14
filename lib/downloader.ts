import { writeFile, mkdir } from "fs/promises";
import path from "path";

const DOWNLOAD_DIR = path.join(process.cwd(), "public", "clips");

export async function downloadVideoFromUrl(pageUrl: string, taskId: string): Promise<string | null> {
  await mkdir(DOWNLOAD_DIR, { recursive: true });

  // Strategy 1: Look for og:video meta tag
  try {
    const res = await fetch(pageUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      redirect: "follow",
    });
    const html = await res.text();

    // Try og:video meta
    const ogVideo = html.match(/<meta[^>]+property="og:video"[^>]+content="([^"]*)"/i);
    if (ogVideo?.[1]) {
      return await downloadFile(ogVideo[1], taskId, "mp4");
    }

    // Try video tag source
    const videoSrc = html.match(/<source[^>]+src="([^"]*\.mp4[^"]*)"/i)
      || html.match(/<video[^>]+src="([^"]*\.mp4[^"]*)"/i);
    if (videoSrc?.[1]) {
      return await downloadFile(videoSrc[1], taskId, "mp4");
    }

    // Try JSON-LD video
    const jsonLdMatch = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
    if (jsonLdMatch?.[1]) {
      try {
        const ld = JSON.parse(jsonLdMatch[1]);
        const v = ld?.video || ld?.["@graph"]?.find((g: Record<string, unknown>) => g["@type"] === "VideoObject");
        if (v?.contentUrl) return await downloadFile(v.contentUrl, taskId, "mp4");
      } catch { /* not JSON */ }
    }

    // Strategy 2: Direct download if URL ends with video extension
    if (/\.(mp4|mov|webm)(\?|$)/i.test(pageUrl)) {
      return await downloadFile(pageUrl, taskId, path.extname(pageUrl).replace("?", ""));
    }

  } catch (e) {
    console.error("Video discovery failed:", (e as Error).message);
  }

  // Strategy 3: Try yt-dlp if available
  try {
    const { execSync } = await import("child_process");
    const ext = "mp4";
    const outPath = path.join(DOWNLOAD_DIR, `${taskId}_source.${ext}`);
    execSync(`yt-dlp -f "best[ext=${ext}]/best" -o "${outPath}" "${pageUrl}" --max-filesize 100M --no-playlist`, {
      timeout: 120000,
      stdio: "pipe",
    });
    return outPath;
  } catch {
    /* yt-dlp not available or failed */
  }

  return null;
}

async function downloadFile(url: string, taskId: string, ext: string): Promise<string | null> {
  try {
    const fileName = `${taskId}_source.${ext}`;
    const outPath = path.join(DOWNLOAD_DIR, fileName);
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    if (!res.ok) return null;

    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(outPath, buf);

    if (buf.length < 1024) return null;

    // Return HTTP-accessible path
    return `/clips/${fileName}`;
  } catch {
    return null;
  }
}
