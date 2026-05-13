import { NextRequest, NextResponse } from "next/server";
import { modelAdaptations } from "@/lib/store";

const LINGKE_BASE = process.env.LINGKE_BASE_URL || "https://api.ai6800.com/api";
const LINGKE_KEY = process.env.LINGKE_API_KEY || "";

async function fetchModelList() {
  const res = await fetch(`${LINGKE_BASE}/v1/skills`, {
    headers: { Authorization: `Bearer ${LINGKE_KEY}` },
  });
  return res.json();
}

export async function GET() {
  return NextResponse.json({ success: true, data: modelAdaptations.getAll() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { modelName } = body;

    if (!modelName) {
      return NextResponse.json({ success: false, error: "缺少模型名称" }, { status: 400 });
    }

    // Check model capabilities via 灵客AI
    let evaluationResult: "pass" | "risk" | "fail" = "pass";
    let riskPoints = "";
    let suggestions = "";

    try {
      const skills = await fetchModelList();
      const modelInfo = skills?.chat_models?.find((m: { name: string }) => m.name === modelName)
        || skills?.image_models?.find((m: { name: string }) => m.name === modelName)
        || skills?.video_models?.find((m: { name: string }) => m.name === modelName);

      if (modelInfo) {
        evaluationResult = "pass";
        riskPoints = "模型已在灵客AI平台验证通过";
        suggestions = `推荐使用${modelName}进行对应任务，已通过平台兼容性检查`;
      } else {
        evaluationResult = "risk";
        riskPoints = "模型未在灵客AI平台注册，可能存在兼容性问题";
        suggestions = "建议使用平台已验证的模型或联系平台添加支持";
      }
    } catch {
      evaluationResult = "risk";
      riskPoints = "无法连接灵客AI进行模型验证";
      suggestions = "请检查网络连接和API配置后重试";
    }

    const id = `MA-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toISOString();

    const item = {
      id,
      modelName,
      version: "latest",
      evaluationItem: `模型${modelName}适配性评估`,
      result: evaluationResult,
      riskPoints,
      suggestions,
      evaluatedAt: now,
    };

    modelAdaptations.add(item);
    return NextResponse.json({ success: true, data: item });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "缺少ID" }, { status: 400 });
  modelAdaptations.remove(id);
  return NextResponse.json({ success: true });
}
