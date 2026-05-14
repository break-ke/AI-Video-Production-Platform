import { NextRequest, NextResponse } from "next/server";
import { storyboards } from "@/lib/store";
import { chatCompletion } from "@/lib/lingke";
import type { Storyboard, StoryboardFrame, StoryboardStyleConfig } from "@/types";

const STORYBOARD_PROMPT = `你是一位顶级影视广告导演和故事板艺术家。参考以下两种模板风格生成视频故事板：

【模板一 - 中国商业广告风格】
标题: [内容] 故事板提示词 ([风格])
副标题: 导演预制作视觉规划表 / 16:9 / 全程中文标注
风格标签、色彩材质、角色风格、环境场景、道具元素
每镜头: 景别、运镜、画面内容、字幕文案、情绪标签
最后: 光影设计、构图原则、镜头语言、场景重点、道具清单、调色说明、声音氛围、情绪关键词

【模板二 - 电影感风格】
标题: PART [N] ([时间]) [主题]
SCENE GOAL、MAIN FRAME PROMPT、VISUAL REFERENCE
每镜头: CAMERA/MOVEMENT、ACTION、DIALOGUE/SILENCE、SOUND DESIGN、TRANSITION
最后: SOUND ATMOSPHERE、EMOTIONAL ARC、KEY VISUAL NOTES、ENDING

根据用户输入生成完整故事板。输出JSON格式，包含以下字段：
{
  "templateType": "chinese_commercial",
  "title": "标题",
  "subtitle": "副标题",
  "styleConfig": {
    "styleTags": ["标签1","标签2"],
    "colorPalette": ["颜色1","颜色2"],
    "lightingDesign": "光影设计描述",
    "compositionNotes": "构图描述",
    "lensLanguage": "镜头语言描述",
    "sceneFocus": ["场景1","场景2"],
    "propsList": ["道具1","道具2"],
    "colorGrade": "调色描述",
    "soundAtmosphere": "声音描述",
    "emotionKeywords": ["情绪1","情绪2"]
  },
  "frames": [
    {
      "frameNumber": 1,
      "timeRange": "0-3s",
      "shotSize": "大全景",
      "cameraMovement": "航拍缓慢推进",
      "visualContent": "画面描述",
      "subtitleText": "字幕文案",
      "emotionTags": ["宁静","史诗感"],
      "action": "人物动作描述",
      "soundDesign": "风声、鸟鸣",
      "transition": "CUT",
      "imagePrompt": "英文绘图提示词，用于AI生成图片"
    }
  ],
  "photographyNotes": "摄影美术说明",
  "soundOverview": "声音氛围总览",
  "emotionalArc": "情绪弧线描述",
  "visualNotes": "视觉说明"
}

每个分镜的imagePrompt必须是详细的英文提示词，适合AI绘图，包含：景别、光线、色彩、构图、人物位置、产品位置、氛围。输出纯JSON。`;

export async function GET() {
  return NextResponse.json({ success: true, data: storyboards.getAll() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { researchId, topic, style = "chinese_commercial" } = body;

    if (!topic) {
      return NextResponse.json({ success: false, error: "请提供故事板主题" }, { status: 400 });
    }

    const id = `SB-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toISOString();

    // Call Gemini to generate storyboard
    let storyboardData: Partial<Storyboard> | null = null;
    try {
      const aiResult = await chatCompletion("gemini-3.1-pro-preview", [
        { role: "system", content: STORYBOARD_PROMPT },
        {
          role: "user",
          content: `生成主题为「${topic}」的视频故事板。使用${style === "cinematic" ? "电影感" : "中国商业广告"}风格。${researchId ? `关联调研: ${researchId}` : ""}`,
        },
      ], { maxTokens: 4096, temperature: 0.7 });

      const cleaned = aiResult.replace(/```json\s*|```\s*/g, "").trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try { storyboardData = JSON.parse(match[0]); } catch { /* keep null */ }
      }
    } catch { /* use fallback */ }

    // Build fallback if AI failed
    const frames: StoryboardFrame[] = storyboardData?.frames?.length
      ? storyboardData.frames as StoryboardFrame[]
      : generateFallbackFrames(topic);

    const styleConfig: StoryboardStyleConfig = storyboardData?.styleConfig || {
      styleTags: ["高级", "专业", "电影感"],
      colorPalette: ["深蓝", "暖金", "雅白"],
      lightingDesign: "侧逆光为主，柔和补光",
      compositionNotes: "对称平衡，前中后景层次清晰",
      lensLanguage: "航拍推进、跟拍漫步、特写推近、拉远收束",
      sceneFocus: [topic],
      propsList: ["产品", "灯光", "背景"],
      colorGrade: "冷调基底，暖色点缀",
      soundAtmosphere: "渐进式氛围音，层层递进",
      emotionKeywords: ["高级感", "专业", "信赖"],
    };

    const storyboard: Storyboard = {
      id,
      researchId: researchId || "",
      templateType: (storyboardData?.templateType as "chinese_commercial" | "cinematic") || "chinese_commercial",
      title: storyboardData?.title || `${topic}故事板`,
      subtitle: storyboardData?.subtitle || `导演预制作视觉规划表 / 16:9 / 全程中文标注`,
      styleConfig,
      frames: frames.map((f, i) => ({
        ...f,
        frameNumber: f.frameNumber || i + 1,
        imageUrl: f.imageUrl || `https://picsum.photos/seed/${id}_${i + 1}/800/450`,
        status: f.status || "pending",
      })),
      photographyNotes: storyboardData?.photographyNotes || styleConfig.lightingDesign + "，" + styleConfig.compositionNotes,
      soundOverview: storyboardData?.soundOverview || styleConfig.soundAtmosphere,
      emotionalArc: storyboardData?.emotionalArc || "开场建立氛围 → 中段展开叙事 → 结尾高潮收束",
      visualNotes: storyboardData?.visualNotes || `${styleConfig.colorPalette.join("、")}调性贯穿全片`,
      endingNote: "渐出黑场，留有余韵",
      // Legacy compat
      frameNumber: frames.length,
      imageDescription: frames[0]?.visualContent || topic,
      prompt: frames[0]?.imagePrompt || topic,
      imageUrl: frames[0]?.imageUrl || `https://picsum.photos/seed/${id}/800/450`,
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

function generateFallbackFrames(topic: string): StoryboardFrame[] {
  return [
    { frameNumber: 1, timeRange: "0-3s", shotSize: "大全景", cameraMovement: "航拍缓慢推进", visualContent: `晨光中${topic}场景全貌`, subtitleText: `这一刻，${topic}的故事开始`, emotionTags: ["宁静", "史诗感"], action: "主角远眺", soundDesign: "环境音渐入", transition: "CUT", imagePrompt: `Cinematic wide aerial shot of ${topic}, golden morning light, misty atmosphere, 4K`, imageUrl: "", status: "pending" },
    { frameNumber: 2, timeRange: "3-6s", shotSize: "中景", cameraMovement: "跟拍轻摇", visualContent: `主角穿梭于${topic}场景中`, subtitleText: `每一步，都是风景`, emotionTags: ["温馨", "生活感"], action: "漫步探索", soundDesign: "脚步声，环境音", transition: "CUT", imagePrompt: `Medium tracking shot of person walking through ${topic}, warm lighting, cinematic`, imageUrl: "", status: "pending" },
    { frameNumber: 3, timeRange: "6-9s", shotSize: "特写", cameraMovement: "微距推近", visualContent: `${topic}核心产品/元素细节`, subtitleText: `细节之中，见真章`, emotionTags: ["精致", "高级感"], action: "手指轻抚细节", soundDesign: "细腻音效", transition: "CUT", imagePrompt: `Close-up macro shot of ${topic} details, soft light, shallow depth of field`, imageUrl: "", status: "pending" },
    { frameNumber: 4, timeRange: "9-12s", shotSize: "中近景", cameraMovement: "环绕小摇臂", visualContent: `${topic}使用/体验场景`, subtitleText: `此刻，属于你的时刻`, emotionTags: ["满足", "温暖"], action: "享受/使用产品", soundDesign: "温暖音乐起", transition: "CUT", imagePrompt: `Medium close-up circular dolly shot of person enjoying ${topic}, warm atmosphere`, imageUrl: "", status: "pending" },
    { frameNumber: 5, timeRange: "12-15s", shotSize: "大全景收束", cameraMovement: "拉远升起", visualContent: `${topic}全景与品牌呈现`, subtitleText: `来体验${topic}，看见不一样`, emotionTags: ["高级", "诗意", "余韵"], action: "回眸微笑", soundDesign: "音乐高潮收束", transition: "FADE OUT", imagePrompt: `Wide establishing shot pulling back from ${topic}, golden hour, cinematic, 4K`, imageUrl: "", status: "pending" },
  ];
}
