import { NextRequest, NextResponse } from "next/server";
import { competitiveResearch } from "@/lib/store";
import { analyzeVideo } from "@/lib/analyzer";

export async function GET() {
  return NextResponse.json({ success: true, data: competitiveResearch.getAll() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, videoUrl } = body;
    if (!url) return NextResponse.json({ success: false, error: "缺少竞品链接" }, { status: 400 });

    const analysis = await analyzeVideo(url, videoUrl || undefined);

    const id = `CR-${Date.now().toString(36).toUpperCase()}`;
    const item = {
      ...analysis,
      id,
    };
    competitiveResearch.add(item);
    return NextResponse.json({ success: true, data: item });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "缺少ID" }, { status: 400 });
  competitiveResearch.remove(id);
  return NextResponse.json({ success: true });
}
