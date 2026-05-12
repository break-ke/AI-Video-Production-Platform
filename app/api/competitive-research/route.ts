import { NextRequest, NextResponse } from "next/server";
import { competitiveResearch } from "@/lib/store";
import { analyzeCompetitorDeep } from "@/lib/analyzer";
import type { CompetitiveResearch } from "@/types";

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

    const analysis = await analyzeCompetitorDeep(url);

    const id = `CR-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toISOString();

    const totalViralViews = analysis.viralVideos.reduce((s, v) => s + v.views, 0);
    const totalViralLikes = analysis.viralVideos.reduce((s, v) => s + v.likes, 0);

    const item: CompetitiveResearch = {
      id,
      keyword: analysis.keyword,
      industry: analysis.industry,
      competitorLink: url,
      competitorName: analysis.competitorName,
      sellingPointsAnalysis: analysis.sellingPointsAnalysis,
      hotKeywords: analysis.hotKeywords,
      viralVideos: analysis.viralVideos,
      structureSummary: analysis.structureSummary,
      scriptOptimization: analysis.scriptOptimization,
      conclusion: analysis.conclusion,
      sellingPoints: analysis.hotKeywords.join("、"),
      likes: totalViralLikes,
      views: totalViralViews,
      favorites: Math.floor(totalViralLikes * 0.4),
      shares: Math.floor(totalViralLikes * 0.15),
      creator: "AI深度分析",
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
