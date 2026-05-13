import { NextRequest, NextResponse } from "next/server";
import { feedbacks } from "@/lib/store";
import { chatCompletion } from "@/lib/lingke";

export async function GET() {
  return NextResponse.json({ success: true, data: feedbacks.getAll() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storyboardId, content, type } = body;

    if (!storyboardId || !content) {
      return NextResponse.json({ success: false, error: "缺少必填字段" }, { status: 400 });
    }

    const id = `FB-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toISOString();

    // AI analyze feedback intent
    let intentAnalysis = "";
    let priority: "high" | "medium" | "low" = "medium";
    let suggestions = "";

    try {
      const aiResult = await chatCompletion("gpt-4o", [
        {
          role: "system",
          content: `你是视频制作反馈分析专家。分析用户对故事板的反馈，输出JSON格式：
{
  "priority": "high/medium/low",
  "intentSummary": "一句话总结用户的核心诉求",
  "modificationDirection": "具体的修改方向和可执行建议",
  "evaluation": "对原故事板的客观评价（优点+不足）"
}
只输出JSON，不要其他内容。`,
        },
        { role: "user", content: `故事板ID: ${storyboardId}\n反馈类型: ${type || "待分析"}\n反馈内容: ${content}` },
      ], { maxTokens: 1024, temperature: 0.3 });

      try {
        const parsed = JSON.parse(aiResult);
        priority = parsed.priority || "medium";
        intentAnalysis = parsed.evaluation + "\n\n核心诉求: " + (parsed.intentSummary || "");
        suggestions = parsed.modificationDirection || "";
      } catch {
        intentAnalysis = aiResult;
        suggestions = "基于AI分析，建议针对性地调整脚本结构和画面表达";
      }
    } catch {
      intentAnalysis = `收到关于故事板${storyboardId}的${type || "反馈"}，建议根据反馈内容迭代优化。`;
      suggestions = "请根据用户具体反馈进行修改";
    }

    const item = {
      id,
      storyboardId,
      content,
      type: type || "modify",
      intentAnalysis,
      priority,
      suggestions,
      createdAt: now,
    };

    feedbacks.add(item);
    return NextResponse.json({ success: true, data: item });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "缺少ID" }, { status: 400 });
  feedbacks.remove(id);
  return NextResponse.json({ success: true });
}
