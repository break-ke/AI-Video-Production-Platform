import { NextRequest } from "next/server";
import { analyzeVideo } from "@/lib/analyzer";
import { competitiveResearch } from "@/lib/store";
import { extractAllClips } from "@/lib/video-clips";
import type { ProgressEvent } from "@/lib/progress";

const STEPS = [
  { key: "download", label: "下载竞品视频" },
  { key: "scrape", label: "抓取网页内容" },
  { key: "ai", label: "Gemini AI 实时分析视频" },
  { key: "clips", label: "提取分镜视频片段" },
];

export async function POST(req: NextRequest) {
  const { url, videoUrl } = await req.json();
  if (!url && !videoUrl) return new Response(JSON.stringify({ error: "请提供链接或上传视频" }), { status: 400, headers: { "Content-Type": "application/json" } });

  const targetUrl = url || `https://video-upload.analysis/${Date.now()}`;
  const isVideoOnly = !url && !!videoUrl;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: ProgressEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        const id = `CR-${Date.now().toString(36).toUpperCase()}`;
        let downloadedVideoPath: string | null = videoUrl || null;
        let clipMap: Map<number, string> = new Map();

        // Init all steps as pending
        for (const s of STEPS) send({ step: s.key, label: s.label, status: "running" });
        await delay(100);

        // ===== STEP 1: Download video =====
        if (!downloadedVideoPath && !isVideoOnly) {
          try {
            const { downloadVideoFromUrl } = await import("@/lib/downloader");
            const result = await downloadVideoFromUrl(targetUrl, id);
            if (result) {
              downloadedVideoPath = result;
              send({ step: "download", label: STEPS[0].label, status: "completed", detail: "视频下载成功" });
            } else {
              send({ step: "download", label: STEPS[0].label, status: "completed", detail: "下载失败（网络限制），可上传视频替代" });
            }
          } catch (e) {
            send({ step: "download", label: STEPS[0].label, status: "completed", detail: "下载异常: " + (e as Error).message?.substring(0, 50) });
          }
        } else if (downloadedVideoPath) {
          send({ step: "download", label: STEPS[0].label, status: "completed", detail: "使用已上传视频" });
        }

        // ===== STEP 2: Web scrape =====
        send({ step: "scrape", label: STEPS[1].label, status: "running" });
        let pageInfo = "";
        if (!isVideoOnly) {
          try {
            const res = await fetch(targetUrl, {
              headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
            });
            if (res.ok) {
              const html = await res.text();
              const title = (html.match(/<title>(.*?)<\/title>/i)?.[1] || "").trim();
              const desc = (html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)?.[1] || "").trim();
              pageInfo = `Title: ${title}\nDescription: ${desc}\nBody: ${html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().substring(0, 2000)}`;
            }
          } catch { /* ignore */ }
        }
        send({ step: "scrape", label: STEPS[1].label, status: "completed", detail: pageInfo ? "页面内容已获取" : "无网页内容（纯视频分析）" });

        // ===== STEP 3: AI Analysis =====
        send({ step: "ai", label: STEPS[2].label, status: "running", detail: "调用 Gemini 3.1 Pro..." });
        const analysis = await analyzeVideo(targetUrl, downloadedVideoPath || undefined);
        send({ step: "ai", label: STEPS[2].label, status: "completed", detail: `模型: gemini-3.1-pro-preview | ${analysis.shots?.length || 0} 分镜 | ${analysis.psychologyWeapons?.length || 0} 心理学武器` });

        // ===== STEP 4: Extract clips =====
        if (downloadedVideoPath && analysis.shots && analysis.shots.length > 0) {
          send({ step: "clips", label: STEPS[3].label, status: "running", detail: "ffmpeg 提取分镜片段..." });
          try {
            clipMap = await extractAllClips(downloadedVideoPath, id, analysis.shots);
            send({ step: "clips", label: STEPS[3].label, status: "completed", detail: `${clipMap.size}/${analysis.shots.length} 片段已提取` });
          } catch (e) {
            send({ step: "clips", label: STEPS[3].label, status: "completed", detail: "提取失败: " + (e as Error).message?.substring(0, 40) });
          }
        } else {
          send({ step: "clips", label: STEPS[3].label, status: "completed", detail: !downloadedVideoPath ? "无视频源" : "无分镜数据" });
        }

        // Build final result
        const result = {
          ...analysis, id,
          clipMap: Object.fromEntries(clipMap),
          videoSourceUrl: downloadedVideoPath,
        };
        competitiveResearch.add({ ...analysis, id });

        send({ step: "done", label: "完成", status: "completed", detail: JSON.stringify({ success: true, data: result }) });
      } catch (e) {
        send({ step: "error", label: "错误", status: "error", detail: (e as Error).message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }
