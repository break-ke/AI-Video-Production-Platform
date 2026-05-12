import { NextRequest, NextResponse } from "next/server";
import { competitiveResearch } from "@/lib/store";
import { analyzeCompetitor } from "@/lib/analyzer";

export async function GET() {
  const data = competitiveResearch.getAll();
  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: "缺少竞品链接" },
        { status: 400 }
      );
    }

    const analysis = await analyzeCompetitor(url);

    const id = `CR-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toISOString();

    const item = {
      id,
      keyword: analysis.keyword,
      industry: analysis.industry,
      competitorLink: url,
      competitorName: analysis.competitorName,
      sellingPoints: analysis.sellingPoints,
      conclusion: analysis.conclusion,
      likes: Math.floor(Math.random() * 15000) + 500,
      views: Math.floor(Math.random() * 300000) + 10000,
      favorites: Math.floor(Math.random() * 10000) + 500,
      shares: Math.floor(Math.random() * 5000) + 200,
      creator: "AI分析",
      createdAt: now,
    };

    competitiveResearch.add(item);
    return NextResponse.json({ success: true, data: item });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { success: false, error: "缺少ID" },
      { status: 400 }
    );
  }

  const existed = competitiveResearch.getById(id);
  if (!existed) {
    return NextResponse.json(
      { success: false, error: "未找到记录" },
      { status: 404 }
    );
  }

  competitiveResearch.remove(id);
  return NextResponse.json({ success: true });
}
