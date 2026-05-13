import { NextRequest, NextResponse } from "next/server";
import { editingTasks } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ success: true, data: editingTasks.getAll() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scriptId, scriptContent } = body;

    if (!scriptId) {
      return NextResponse.json({ success: false, error: "缺少脚本ID" }, { status: 400 });
    }

    const id = `ET-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toISOString();

    // Generate dubbing plan from script structure
    const scriptSections = (scriptContent || "").split(/【\d+s?-\d+s?[^】]*】/g).filter(Boolean);
    const timeMarkers = (scriptContent || "").match(/【\d+s?-\d+s?[^】]*】/g) || [];

    const dubbingPlan = timeMarkers.map((marker: string, i: number) => {
      const section = scriptSections[i] || "";
      return `${marker}: ${section.trim().slice(0, 60)}...`;
    }).join("\n");

    // Simulate dubbing audio generation using Edge TTS reference
    const dubbingUrl = `https://api.ai6800.com/api/v1/media/generate (TTS task for ${scriptId})`;

    const editingPlan = [
      `📝 脚本解析: ${timeMarkers.length}个分镜节点`,
      `🎙️ 配音方案: 中文女声标准音色，语速1.0x`,
      `🎬 剪辑方案: 按分镜节点自动切换，转场效果: 平滑淡入淡出`,
      `🎵 背景音乐: 轻快科技风BGM，音量30%`,
      `📊 字幕: 自动生成SRT字幕，字体: 微软雅黑`,
      `🖼️ 素材匹配: AI自动匹配画面素材库`,
    ].join("\n");

    const item = {
      id,
      scriptId,
      dubbingUrl,
      editingPlan,
      progress: 25,
      status: "dubbing" as const,
      outputUrl: "",
      createdAt: now,
    };

    editingTasks.add(item);

    // Simulate async progress (in production this would be a real pipeline)
    startEditingPipeline(id);

    return NextResponse.json({ success: true, data: item });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "缺少ID" }, { status: 400 });
  editingTasks.remove(id);
  return NextResponse.json({ success: true });
}

// Simulate async editing pipeline
function startEditingPipeline(taskId: string) {
  const stages: Array<{ delay: number; status: string; progress: number }> = [
    { delay: 3000, status: "dubbing", progress: 35 },
    { delay: 8000, status: "dubbing", progress: 50 },
    { delay: 10000, status: "editing", progress: 50 },
    { delay: 15000, status: "editing", progress: 70 },
    { delay: 18000, status: "compositing", progress: 70 },
    { delay: 22000, status: "compositing", progress: 90 },
    { delay: 25000, status: "completed", progress: 100 },
  ];

  let accumulated = 0;
  stages.forEach(({ delay, status, progress }) => {
    accumulated += delay;
    setTimeout(() => {
      const task = editingTasks.getById(taskId);
      if (task) {
        const updated = editingTasks.update(taskId, {
          status: status as "dubbing" | "editing" | "compositing" | "completed",
          progress,
          ...(status === "completed"
            ? { outputUrl: `https://cos.lingkeai.vip/output/${taskId}.mp4` }
            : {}),
        });
        if (updated) {
          // Sync back via store reference
        }
      }
    }, accumulated);
  });
}
