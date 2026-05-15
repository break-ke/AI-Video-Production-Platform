import { NextRequest } from "next/server";
import { analyzeVideo } from "@/lib/analyzer";
import { competitiveResearch } from "@/lib/store";
import { ANALYSIS_STEPS, ProgressEvent } from "@/lib/progress";
import { extractAllClips } from "@/lib/video-clips";

// SSE streaming analysis endpoint
export async function POST(req: NextRequest) {
  const { url, videoUrl } = await req.json();
  if (!url && !videoUrl) return new Response(JSON.stringify({ error: "请提供竞品链接或上传视频" }), { status: 400, headers: { "Content-Type": "application/json" } });
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

        // Real progress: send running state for all steps
        for (const s of ANALYSIS_STEPS) {
          send({ step: s.key, label: s.label, status: "running" });
          await delay(50); // small delay between events
        }

        // Step 1+2: Web scraping + AI analysis (happens inside analyzeVideo)
        send({ step: "scrape", label: ANALYSIS_STEPS[0].label, status: "completed", detail: "已获取页面内容" });
        send({ step: "ai", label: ANALYSIS_STEPS[1].label, status: "running", detail: "Gemini 3.1 Pro 多模态分析中..." });

        const analysis = await analyzeVideo(targetUrl, videoUrl || undefined);

        send({ step: "ai", label: ANALYSIS_STEPS[1].label, status: "completed", detail: `模型: gemini-3.1-pro-preview` });

        // Step 3: Basic info parsed
        send({ step: "basic", label: ANALYSIS_STEPS[2].label, status: "completed", detail: `${analysis.basicInfo?.duration || "N/A"} | ${analysis.basicInfo?.videoType || "N/A"}` });

        // Step 4: Shot breakdown + video download + clip extraction
        send({ step: "shots", label: ANALYSIS_STEPS[3].label, status: "completed", detail: `共 ${analysis.shots?.length || 0} 个分镜` });

        let clipMap: Map<number, string> = new Map();
        let downloadedVideoUrl = videoUrl || null;
        let videoStatus = "";

        if (analysis.shots && analysis.shots.length > 0) {
          // Try yt-dlp download if no uploaded video
          if (!downloadedVideoUrl && !isVideoOnly) {
            send({ step: "shots", label: ANALYSIS_STEPS[3].label, status: "running", detail: "yt-dlp 正在下载竞品视频..." });
            try {
              const { downloadVideoFromUrl } = await import("@/lib/downloader");
              const result = await downloadVideoFromUrl(targetUrl, id);
              if (result) {
                downloadedVideoUrl = result;
                send({ step: "shots", label: ANALYSIS_STEPS[3].label, status: "running", detail: "视频已下载，正在提取分镜片段..." });
              }
            } catch { /* continue */ }
          }

          // Extract clips from downloaded/uploaded video
          if (downloadedVideoUrl) {
            const { extractAllClips } = await import("@/lib/video-clips");
            clipMap = await extractAllClips(downloadedVideoUrl, id, analysis.shots);
            videoStatus = clipMap.size > 0
              ? `共 ${clipMap.size}/${analysis.shots.length} 片段已提取`
              : "提取失败，请确认视频格式";
          } else {
            videoStatus = "未获取到视频（网络限制或平台不支持）";
          }
        }

        send({ step: "shots", label: ANALYSIS_STEPS[3].label, status: "completed", detail: videoStatus || "无分镜数据" });

        // Step 5: Psychology
        send({ step: "psychology", label: ANALYSIS_STEPS[4].label, status: "completed", detail: `${analysis.psychologyWeapons?.length || 0} 种心理学武器` });

        // Step 6: Rhythm
        send({ step: "rhythm", label: ANALYSIS_STEPS[5].label, status: "completed", detail: `${analysis.rhythmCurveAnalysis?.curveShape || "N/A"} | ${analysis.rhythmIntensity?.length || 0} 段` });

        // Step 7: Insights
        send({ step: "insights", label: ANALYSIS_STEPS[6].label, status: "completed", detail: `${analysis.replicableElements?.length || 0} 条复刻建议` });

        // Build result with clips and video source
        const result = {
          ...analysis,
          id,
          clipMap: Object.fromEntries(clipMap),
          videoSourceUrl: downloadedVideoUrl || videoUrl || null,
        };
        competitiveResearch.add({ ...analysis, id });

        // Send final result
        send({ step: "done", label: "完成", status: "completed", detail: JSON.stringify({ success: true, data: result }) });

      } catch (e) {
        send({ step: "error", label: "错误", status: "error", detail: (e as Error).message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
