import { mkdir } from "fs/promises";
import path from "path";

const DOWNLOAD_DIR = path.join(process.cwd(), "public", "clips");

export async function downloadTikTokVideo(pageUrl: string, taskId: string): Promise<string | null> {
  await mkdir(DOWNLOAD_DIR, { recursive: true });

  let browser;
  try {
    const { chromium } = await import("playwright");
    browser = await chromium.launch({ headless: true });

    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
      viewport: { width: 412, height: 915 },
    });

    const page = await context.newPage();
    const videoUrls: string[] = [];

    // Intercept network requests to capture video URLs
    page.on("request", (req) => {
      const url = req.url();
      if (/\.mp4|video.*m3u8|tiktok.*video/i.test(url) && !videoUrls.includes(url)) {
        videoUrls.push(url);
      }
    });

    page.on("response", async (res) => {
      const url = res.url();
      const ct = res.headers()["content-type"] || "";
      if ((ct.includes("video/mp4") || url.includes(".mp4")) && !videoUrls.includes(url)) {
        videoUrls.push(url);
      }
    });

    await page.goto(pageUrl, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(3000);

    await page.close();
    await context.close();
    await browser.close();

    // Find best video URL (prefer no-watermark)
    const videoUrl = videoUrls.find(u => u.includes("720") || u.includes("1080"))
      || videoUrls.find(u => u.includes("mp4"))
      || videoUrls[0];

    if (!videoUrl) return null;

    // Download the video
    const fileName = `${taskId}_source.mp4`;
    const outPath = path.join(DOWNLOAD_DIR, fileName);

    const res = await fetch(videoUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return null;

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 10240) return null;

    const { writeFile } = await import("fs/promises");
    await writeFile(outPath, buf);

    return `/clips/${fileName}`;
  } catch (e) {
    console.error("[TikTok] Download failed:", (e as Error).message);
    if (browser) await browser.close().catch(() => {});
    return null;
  }
}
