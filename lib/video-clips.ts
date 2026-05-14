import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

const FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";
const CLIPS_DIR = path.join(process.cwd(), "public", "clips");

export interface VideoClip {
  shotNumber: number;
  timeCode: string;
  startSeconds: number;
  endSeconds: number;
  clipUrl: string;
}

function parseTimeCode(tc: string): { start: number; end: number } {
  // Parse formats like "0:00-0:03" or "00:00-00:03"
  const parts = tc.split(/[-–]/);
  const parseOne = (t: string): number => {
    t = t.trim();
    const m = t.match(/(\d+):(\d+)(?:\.(\d+))?/);
    if (m) return parseInt(m[1]) * 60 + parseInt(m[2]) + (m[3] ? parseInt(m[3]) / 100 : 0);
    const s = parseFloat(t);
    return isNaN(s) ? 0 : s;
  };
  return { start: parseOne(parts[0] || "0"), end: parseOne(parts[1] || parts[0] || "3") || 3 };
}

export async function downloadVideo(videoUrl: string, taskId: string): Promise<string> {
  await mkdir(CLIPS_DIR, { recursive: true });
  const ext = videoUrl.includes(".mp4") ? "mp4" : videoUrl.includes(".webm") ? "webm" : "mp4";
  const videoPath = path.join(CLIPS_DIR, `${taskId}_source.${ext}`);

  // Download using curl
  try {
    await execAsync(`curl -sL -o "${videoPath}" "${videoUrl}" --max-time 120`, { timeout: 130000 });
    return videoPath;
  } catch (e) {
    // If download fails, try a HEAD request to check accessibility
    console.error("Video download failed:", (e as Error).message);
    return "";
  }
}

export async function extractClip(
  videoPath: string,
  taskId: string,
  shotNumber: number,
  timeCode: string
): Promise<string | null> {
  const { start, end } = parseTimeCode(timeCode);
  const duration = Math.max(end - start, 0.5); // minimum 0.5s clip

  if (duration <= 0 || !videoPath) return null;

  const clipName = `${taskId}_shot_${shotNumber}.mp4`;
  const clipPath = path.join(CLIPS_DIR, clipName);

  try {
    await execAsync(
      `"${FFMPEG_PATH}" -y -ss ${start} -i "${videoPath}" -t ${duration} -c:v libx264 -preset ultrafast -crf 28 -an "${clipPath}"`,
      { timeout: 30000 }
    );

    return `/clips/${clipName}`;
  } catch (e) {
    console.error(`Clip extraction failed for shot ${shotNumber}:`, (e as Error).message);
    return null;
  }
}

export async function extractAllClips(
  videoUrl: string,
  taskId: string,
  shots: Array<{ shotNumber: number; timeCode: string }>
): Promise<Map<number, string>> {
  const clipMap = new Map<number, string>();

  const videoPath = await downloadVideo(videoUrl, taskId);
  if (!videoPath) {
    // Use original URL timestamps instead (will be displayed as links)
    return clipMap;
  }

  for (const shot of shots) {
    const clipUrl = await extractClip(videoPath, taskId, shot.shotNumber, shot.timeCode);
    if (clipUrl) {
      clipMap.set(shot.shotNumber, clipUrl);
    }
  }

  // Clean up source video
  try { await unlink(videoPath); } catch { /* ignore */ }

  return clipMap;
}
