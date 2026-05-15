import { CompetitiveResearch } from "@/types";

export const mockCompetitiveResearch: CompetitiveResearch[] = [
  {
    id: "CR-001",
    competitorName: "Synthesia",
    competitorLink: "https://www.synthesia.io",
    industry: "AI视频工具",
    basicInfo: { duration: "25-30s", category: "B2B SaaS", videoType: "演示+口播", hookType: "悬念提问", hookKeyElements: "AI数字人特写+多语言字幕", ctaType: "Link in Bio" },
    shots: [
      { shotNumber: 1, timeCode: "0:00-0:03", duration: "3s", shotSize: "ECU", cameraMovement: "Static", visualContent: "AI数字人特写+痛点提问字幕", lighting: "柔和面光+暖调", characterAction: "数字人直面镜头", productPosition: "中心", subtitle: "还在花3天做视频？", rhythm: "快切爆发", consumerPsychology: "损失厌恶+悬念", golden15Frames: "视觉捕捉[数字人+大字幕]→识别[AI视频]→触发[焦虑]→形成[我要看]", replicabilityScore: 5, replicationKey: "保留痛点提问结构，替换为飞书AI" },
      { shotNumber: 2, timeCode: "0:03-0:08", duration: "5s", shotSize: "MS", cameraMovement: "Dolly In", visualContent: "Synthesia界面演示AI生成流程", lighting: "侧光+环形灯", characterAction: "手指操作界面", productPosition: "互动(使用中)", subtitle: "AI 10分钟生成专业视频", rhythm: "中速加速段", consumerPsychology: "锚定效应+喜好效应", golden15Frames: "视觉捕捉[AI界面+进度条]→识别[高效]→触发[期待]→形成[好用]", replicabilityScore: 4, replicationKey: "保留实操录屏，界面替换为飞书" },
      { shotNumber: 3, timeCode: "0:08-0:15", duration: "7s", shotSize: "CU/MCU", cameraMovement: "Orbit", visualContent: "多行业客户成功案例快速切换", lighting: "顶光+反光板", characterAction: "多人满足表情", productPosition: "偏离中心", subtitle: "5000+企业的共同选择", rhythm: "快切爆发", consumerPsychology: "社会认同+从众效应", golden15Frames: "视觉捕捉[多人+案例]→识别[大众选择]→触发[信任]→形成[想试]", replicabilityScore: 3, replicationKey: "保留社会认同手法，案例换为飞书客户" },
    ],
    psychologyWeapons: [
      { name: "损失厌恶", timeRange: "0-3s", intensity: 8, description: "开头痛点提问激活损失厌恶——'花3天做视频'让创作者感到低效" },
      { name: "社会认同", timeRange: "8-15s", intensity: 9, description: "5000+企业数据建立从众心理" },
    ],
    purchaseDecisionPath: { attention: "0-3s AI数字人吸引", interest: "3-8s 效率演示", desire: "8-15s 案例刺激", trust: "15-22s 数据背书", action: "22-28s CTA" },
    rhythmIntensity: [
      { timeRange: "0-3s", visualIntensity: 5, emotionIntensity: 4, infoDensity: 3, productAppearance: "数字人", rhythmPosition: "爆发点" },
      { timeRange: "3-8s", visualIntensity: 4, emotionIntensity: 3, infoDensity: 4, productAppearance: "界面", rhythmPosition: "加速段" },
    ],
    rhythmCurveAnalysis: { curveShape: "山峰型", peakCount: 2, peakTriggers: ["0-3s钩子", "8-12s高潮"], valleyPoints: ["5-7s过渡"], editingStats: "平均镜长2.5s" },
    summary: "Synthesia成功验证了AI视频在企业市场的需求，但其产品侧重数字人播报，短视频营销是盲区。我方应以飞书协同为差异化切入。",
    replicableElements: ["四段式结构", "操作为主的演示风格", "量化CTA模式"],
    creator: "AI导演分析引擎",
    createdAt: "2026-05-13T08:30:00Z",
  },
] as CompetitiveResearch[];
