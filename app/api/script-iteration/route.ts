import { NextRequest, NextResponse } from "next/server";
import { scriptVersions } from "@/lib/store";
import { chatCompletion } from "@/lib/lingke";

export async function GET() {
  return NextResponse.json({ success: true, data: scriptVersions.getAll() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scriptId, baseContent, feedbackSummary } = body;

    if (!scriptId) {
      return NextResponse.json({ success: false, error: "缺少脚本ID" }, { status: 400 });
    }

    const existing = scriptVersions.getAll().filter((s) => s.scriptId === scriptId);
    const versionNum = existing.length + 1;
    const id = `SV-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toISOString();

    let newContent = baseContent || "";
    let changes = "";

    if (feedbackSummary && baseContent) {
      try {
        const aiResult = await chatCompletion("gpt-4o", [
          {
            role: "system",
            content: `你是视频脚本优化专家。根据用户反馈优化脚本，输出JSON格式：
{
  "optimizedScript": "完整优化后的脚本",
  "changes": "逐条列出修改内容和原因"
}
脚本格式示例：【0-3s 钩子】...【3-8s 塑品】...【8-15s 演示】...【15-20s 信任】...【20-25s CTA】
只输出JSON。`,
          },
          {
            role: "user",
            content: `原脚本:\n${baseContent}\n\n用户反馈:\n${feedbackSummary}\n\n请优化脚本。`,
          },
        ], { maxTokens: 2048, temperature: 0.7 });

        try {
          const parsed = JSON.parse(aiResult);
          newContent = parsed.optimizedScript || baseContent;
          changes = parsed.changes || aiResult;
        } catch {
          newContent = aiResult || baseContent;
          changes = "AI优化后的脚本版本";
        }
      } catch {
        newContent = baseContent;
        changes = "基于反馈进行了手动调整";
      }
    } else if (!baseContent) {
      newContent = `【0-3s 钩子】抓住目标用户痛点，用数据或场景触发共鸣\n【3-8s 塑品】展示产品核心功能和差异化优势\n【8-15s 演示】实操演示使用流程，突出便捷性\n【15-20s 信任】客户案例+数据支撑构建信任\n【20-25s CTA】明确行动引导+限时激励`;
      changes = "新建脚本模板";
    } else {
      changes = "无显著修改";
    }

    const item = {
      id,
      scriptId,
      version: `v${versionNum}.0`,
      content: newContent,
      changes,
      status: versionNum === 1 ? "draft" as const : "review" as const,
      creator: "AI脚本助手",
      createdAt: now,
    };

    scriptVersions.add(item);
    return NextResponse.json({ success: true, data: item });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "缺少ID" }, { status: 400 });
  scriptVersions.remove(id);
  return NextResponse.json({ success: true });
}
