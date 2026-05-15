import { NextRequest } from "next/server";
import { storyboards } from "@/lib/store";
import { generateImage } from "@/lib/lingke";

const GEN_STEPS = [
  { key: "upload", label: "上传参考图片" },
  { key: "main", label: "GPT-Image-2 生成主图" },
  { key: "variant1", label: "生成变体图一（特写）" },
  { key: "variant2", label: "生成变体图二（全景）" },
  { key: "done", label: "生成完成" },
];

// SSE streaming generation endpoint
export async function POST(req: NextRequest) {
  const { prompt, referenceImageUrl } = await req.json();
  if (!prompt) return new Response(JSON.stringify({ error: "请输入提示词" }), { status: 400, headers: { "Content-Type": "application/json" } });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (step: string, status: string, detail?: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ step, status, detail })}\n\n`));
      };

      try {
        const id = `SB-${Date.now().toString(36).toUpperCase()}`;
        const now = new Date().toISOString();

        // Start: send all steps as running
        for (const s of GEN_STEPS) send(s.key, "running");

        // Step 1: upload
        send("upload", "completed", referenceImageUrl ? "已上传" : "跳过（未上传参考图）");

        // Step 2: Generate main image
        send("main", "running", "正在调用 GPT-Image-2...");
        let mainImageUrl = "";
        try {
          const extraParams: Record<string, string | boolean | number> = { size: "1024x1536", quality: "standard" };
          if (referenceImageUrl) { extraParams.reference_image = referenceImageUrl; }
          mainImageUrl = await generateImage("gpt-image-2", prompt, extraParams);
          send("main", "completed", mainImageUrl ? "主图已生成" : "主图生成失败，使用占位图");
        } catch (e) {
          send("main", "completed", "主图生成失败: " + (e as Error).message);
          mainImageUrl = `https://picsum.photos/seed/${id}/800/450`;
        }

        // Step 3: Generate variant 1
        send("variant1", "running", "正在生成变体一（特写）...");
        let variant1Url = "";
        try {
          variant1Url = await generateImage("gpt-image-2", `Close-up detail shot: ${prompt}, shallow DOF, macro`, { size: "1024x1536", quality: "standard" });
          send("variant1", "completed", "变体一完成");
        } catch {
          send("variant1", "completed", "变体一失败，跳过");
        }

        // Step 4: Generate variant 2
        send("variant2", "running", "正在生成变体二（全景）...");
        let variant2Url = "";
        try {
          variant2Url = await generateImage("gpt-image-2", `Wide cinematic shot: ${prompt}, golden hour`, { size: "1024x1536", quality: "standard" });
          send("variant2", "completed", "变体二完成");
        } catch {
          send("variant2", "completed", "变体二失败，跳过");
        }

        const frames = [
          { frameNumber: 1, timeRange: "主图", shotSize: "全景", cameraMovement: "Static", visualContent: prompt, subtitleText: prompt, emotionTags: [] as string[], action: "", soundDesign: "", transition: "CUT", imagePrompt: prompt, imageUrl: mainImageUrl, status: "pending" as const },
        ];
        if (variant1Url) frames.push({ frameNumber: 2, timeRange: "变体1", shotSize: "特写", cameraMovement: "推近", visualContent: "变体特写", subtitleText: "", emotionTags: [], action: "", soundDesign: "", transition: "CUT", imagePrompt: `Close-up: ${prompt}`, imageUrl: variant1Url, status: "pending" as const });
        if (variant2Url) frames.push({ frameNumber: 3, timeRange: "变体2", shotSize: "大全景", cameraMovement: "拉远", visualContent: "变体全景", subtitleText: "", emotionTags: [], action: "", soundDesign: "", transition: "CUT", imagePrompt: `Wide: ${prompt}`, imageUrl: variant2Url, status: "pending" as const });

        const storyboard = {
          id, researchId: "", templateType: "chinese_commercial" as const,
          title: prompt.length > 40 ? prompt.slice(0, 40) + "..." : prompt,
          subtitle: `GPT-Image-2 · ${frames.length}张`,
          styleConfig: { styleTags: ["AI"], colorPalette: [], lightingDesign: "", compositionNotes: "", lensLanguage: "", sceneFocus: [], propsList: [], colorGrade: "", soundAtmosphere: "", emotionKeywords: [] },
          frames,
          photographyNotes: referenceImageUrl ? "已参考上传图片" : "GPT-Image-2 生成",
          soundOverview: "", emotionalArc: "", visualNotes: "", endingNote: "",
          frameNumber: frames.length, imageDescription: prompt, prompt, imageUrl: mainImageUrl,
          status: "pending" as const, createdAt: now,
        };

        storyboards.add(storyboard);

        // Done
        send("done", "completed", JSON.stringify({ success: true, data: storyboard }));
      } catch (e) {
        send("error", "error", (e as Error).message);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}
