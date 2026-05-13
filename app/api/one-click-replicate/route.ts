import { NextRequest, NextResponse } from "next/server";
import { templates } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ success: true, data: templates.getAll() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { templateId, count = 1, targetScriptId } = body;

    if (!templateId) {
      return NextResponse.json({ success: false, error: "缺少模板ID" }, { status: 400 });
    }

    const template = templates.getById(templateId);
    if (!template) {
      return NextResponse.json({ success: false, error: "模板不存在" }, { status: 404 });
    }

    const generatedTasks = [];
    for (let i = 0; i < Math.min(count, 10); i++) {
      const taskId = `REP-${Date.now().toString(36).toUpperCase()}-${i}`;
      const scriptId = targetScriptId || `SCRIPT-AUTO-${Date.now().toString(36)}`;

      generatedTasks.push({
        taskId,
        templateId,
        templateName: template.name,
        scriptId,
        status: "created",
        params: template.params,
        estimatedTime: `${template.params.includes("25") ? "25" : "45"}s`,
      });

      // Update template usage count
      templates.update(templateId, {
        replicateCount: template.replicateCount + 1,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        templateId,
        templateName: template.name,
        generatedCount: generatedTasks.length,
        tasks: generatedTasks,
        message: `成功基于「${template.name}」模板生成${generatedTasks.length}个复刻任务`,
      },
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "缺少ID" }, { status: 400 });
  templates.remove(id);
  return NextResponse.json({ success: true });
}
