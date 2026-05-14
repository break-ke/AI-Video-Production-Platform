import { Storyboard } from "@/types";

const defaultStyle = {
  styleTags: ["高级", "科技", "专业"],
  colorPalette: ["深蓝", "青黛", "暖金"],
  lightingDesign: "侧逆光勾勒，柔光箱补光",
  compositionNotes: "对称平衡，前中后景层次清晰",
  lensLanguage: "航拍推进、跟拍、特写推近、拉远收束",
  sceneFocus: ["科技园区", "AI实验室"],
  propsList: ["AI界面", "数据可视化"],
  colorGrade: "冷调基底，金色高光点缀",
  soundAtmosphere: "渐进式科技氛围音",
  emotionKeywords: ["高级感", "科技", "未来感"],
};

export const mockStoryboards: Storyboard[] = [
  {
    id: "SB-001",
    researchId: "CR-001",
    templateType: "chinese_commercial",
    title: "AI视频生成工具故事板",
    subtitle: "导演预制作视觉规划表 / 16:9 / 全程中文标注",
    styleConfig: defaultStyle,
    frames: [
      { frameNumber: 1, timeRange: "0-3s", shotSize: "大全景", cameraMovement: "航拍缓慢推进", visualContent: "都市夜景航拍，灯光璀璨，科技园区", subtitleText: "AI时代，视频创作从未如此简单", emotionTags: ["史诗感","科技"], action: "俯瞰城市", soundDesign: "环境音渐入", transition: "CUT", imagePrompt: "Cinematic aerial shot of futuristic city skyline at night, neon lights, 4K, photorealistic", imageUrl: "https://picsum.photos/seed/sb001_1/800/450", status: "pending" },
      { frameNumber: 2, timeRange: "3-6s", shotSize: "中景", cameraMovement: "跟拍推近", visualContent: "AI界面操作，一键生成视频", subtitleText: "输入主题，AI自动生成完整视频", emotionTags: ["高效","惊喜"], action: "手指点击屏幕", soundDesign: "科技音效", transition: "CUT", imagePrompt: "Medium shot of person using AI interface, holographic display, blue lighting, futuristic", imageUrl: "https://picsum.photos/seed/sb001_2/800/450", status: "confirmed" },
      { frameNumber: 3, timeRange: "6-9s", shotSize: "特写", cameraMovement: "微距推近", visualContent: "AI生成视频细节展示", subtitleText: "每一帧，都精准触达", emotionTags: ["精致","高级"], action: "画面放大展示", soundDesign: "细腻音效", transition: "CUT", imagePrompt: "Close-up macro of AI-generated video frames, crystal clear, soft blue glow", imageUrl: "https://picsum.photos/seed/sb001_3/800/450", status: "pending" },
      { frameNumber: 4, timeRange: "9-12s", shotSize: "中近景", cameraMovement: "环绕小摇臂", visualContent: "团队协作使用AI视频平台", subtitleText: "飞书协同，团队创作无边界", emotionTags: ["温暖","协作"], action: "团队讨论微笑", soundDesign: "温暖音乐起", transition: "CUT", imagePrompt: "Medium close-up circular dolly of diverse team collaborating, warm office light, Feishu interface", imageUrl: "https://picsum.photos/seed/sb001_4/800/450", status: "pending" },
      { frameNumber: 5, timeRange: "12-15s", shotSize: "大全景收束", cameraMovement: "拉远升起", visualContent: "品牌LOGO+飞书生态全景", subtitleText: "AI视频生产协同平台 · 飞书生态", emotionTags: ["高级","诗意","余韵"], action: "品牌呈现", soundDesign: "音乐高潮收束", transition: "FADE OUT", imagePrompt: "Wide shot pulling back to reveal full Feishu ecosystem, golden hour, cinematic, 4K", imageUrl: "https://picsum.photos/seed/sb001_5/800/450", status: "pending" },
    ],
    photographyNotes: defaultStyle.lightingDesign + "，" + defaultStyle.compositionNotes,
    soundOverview: defaultStyle.soundAtmosphere,
    emotionalArc: "开场科技史诗 → 中段高效惊喜 → 结尾品牌信赖",
    visualNotes: "深蓝基调贯穿，金色数据高光点缀",
    endingNote: "渐出品牌LOGO，留有余韵",
    frameNumber: 5,
    imageDescription: "AI视频生成工具故事板-都市夜景航拍",
    prompt: "Cinematic aerial shot of futuristic city skyline",
    imageUrl: "https://picsum.photos/seed/sb001/800/450",
    status: "pending",
    createdAt: "2026-05-10T09:00:00Z",
  },
];
