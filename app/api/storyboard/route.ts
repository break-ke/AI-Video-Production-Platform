import { NextRequest, NextResponse } from "next/server";
import { storyboards } from "@/lib/store";
import { generateImage } from "@/lib/lingke";

export async function GET() {
  return NextResponse.json({ success: true, data: storyboards.getAll() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { researchId, sellingPointId, frameNumber, imageDescription, prompt } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: "缺少绘图提示词" }, { status: 400 });
    }

    const id = `SB-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toISOString();

    let imageUrl = "";
    try {
      imageUrl = await generateImage(
        "doubao-seedream-5-0-260128",
        prompt,
        { aspect_ratio: "16:9", size: "2K" }
      );
    } catch (genErr) {
      console.error("Image generation failed, using placeholder:", genErr);
      imageUrl = `https://picsum.photos/seed/${id}/800/450`;
    }

    const item = {
      id,
      researchId: researchId || "",
      sellingPointId: sellingPointId || "",
      frameNumber: frameNumber || 1,
      imageDescription: imageDescription || "",
      prompt,
      imageUrl,
      status: "pending" as const,
      createdAt: now,
    };

    storyboards.add(item);
    return NextResponse.json({ success: true, data: item });
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
