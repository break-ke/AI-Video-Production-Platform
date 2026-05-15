import { NextRequest, NextResponse } from "next/server";
import { storyboards } from "@/lib/store";
import { generateImage } from "@/lib/lingke";
import type { Storyboard } from "@/types";

export async function GET() {
  return NextResponse.json({ success: true, data: storyboards.getAll() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, referenceImageUrl } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: "请输入提示词" }, { status: 400 });
    }

    const id = `SB-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toISOString();

    // Call GPT-Image-2 via 灵客AI to generate the storyboard image
    let imageUrl = "";
    try {
      const extraParams: Record<string, string | number | boolean> = {
        size: "1024x1536",
        quality: "standard",
      };
      if (referenceImageUrl) {
        extraParams.reference_image = referenceImageUrl;
        extraParams.reference_strength = "0.6";
      }

      imageUrl = await generateImage("gpt-image-2", prompt, extraParams);
    } catch (e) {
      console.error("GPT-Image-2 generation failed:", (e as Error).message);
      imageUrl = `https://picsum.photos/seed/${id}/800/450`;
    }

    // Build storyboard frames
    const frameCount = 1;
    const frames = [{
      frameNumber: 1,
      timeRange: "完整画面",
      shotSize: "全景",
      cameraMovement: "Static",
      visualContent: prompt,
      subtitleText: prompt,
      emotionTags: [] as string[],
      action: "",
      soundDesign: "",
      transition: "CUT",
      imagePrompt: prompt,
      imageUrl,
      status: "pending" as const,
    }];

    // For multi-shot: generate additional frames (simple variation prompts)
    const additionalPrompts = [
      `Close-up detail shot of: ${prompt}, shallow depth of field, macro photography`,
      `Wide cinematic establishing shot of: ${prompt}, golden hour, breathtaking`,
    ];

    for (let i = 0; i < additionalPrompts.length; i++) {
      try {
        const extraImg = await generateImage("gpt-image-2", additionalPrompts[i], {
          size: "1024x1536",
          quality: "standard",
        });
        frames.push({
          frameNumber: frames.length + 1,
          timeRange: `变体${i + 1}`,
          shotSize: i === 0 ? "特写" : "大全景",
          cameraMovement: i === 0 ? "推近" : "拉远",
          visualContent: additionalPrompts[i],
          subtitleText: "",
          emotionTags: [],
          action: "",
          soundDesign: "",
          transition: "CUT",
          imagePrompt: additionalPrompts[i],
          imageUrl: extraImg,
          status: "pending" as const,
        });
      } catch {
        // skip failed frames
      }
    }

    const storyboard: Storyboard = {
      id,
      researchId: "",
      templateType: "chinese_commercial",
      title: prompt.length > 40 ? prompt.slice(0, 40) + "..." : prompt,
      subtitle: `GPT-Image-2 生成 · ${frames.length}张`,
      styleConfig: {
        styleTags: ["AI生成", "GPT-Image-2"],
        colorPalette: ["自动"],
        lightingDesign: "AI自动光影",
        compositionNotes: "AI自动构图",
        lensLanguage: "AI生成",
        sceneFocus: [prompt],
        propsList: [],
        colorGrade: "AI自动调色",
        soundAtmosphere: "",
        emotionKeywords: [],
      },
      frames,
      photographyNotes: `由GPT-Image-2根据提示词生成${referenceImageUrl ? "，参考上传图片风格" : ""}`,
      soundOverview: "",
      emotionalArc: "",
      visualNotes: referenceImageUrl ? "已参考上传图片风格" : "",
      endingNote: "",
      frameNumber: frames.length,
      imageDescription: prompt,
      prompt,
      imageUrl,
      status: "pending",
      createdAt: now,
    };

    storyboards.add(storyboard);
    return NextResponse.json({ success: true, data: storyboard });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "缺少ID" }, { status: 400 });
  storyboards.remove(id);
  return NextResponse.json({ success: true });
}
