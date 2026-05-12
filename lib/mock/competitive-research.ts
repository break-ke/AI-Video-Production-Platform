import { CompetitiveResearch } from "@/types";

const emptyOptimization = {
  strengthsToLearn: [],
  weaknessesToImprove: [],
  suggestedScript: "",
  keywordSuggestions: [],
};

export const mockCompetitiveResearch: CompetitiveResearch[] = [
  {
    id: "CR-001",
    keyword: "AI视频生成",
    industry: "人工智能",
    competitorLink: "https://example.com/video1",
    competitorName: "TechVision AI",
    sellingPointsAnalysis: "### 产品卖点分析\n1. AI智能视频生成，10秒内完成60s短视频\n2. 支持50+语言配音，全球化内容分发\n3. 自动字幕匹配，节省人工校对时间\n4. 模板库2000+套，快速内容复用\n\n### 目标人群画像\n- 年龄：25-40岁\n- 职业：内容创作者、短视频运营\n- 痛点：视频制作效率低、语言障碍\n- 需求：快速批量产出多语言视频\n\n### 内容策略特征\n- 视频风格：科技感、快节奏\n- 发布频率：日更\n- 互动方式：评论区技术问答",
    hotKeywords: ["AI视频生成", "短视频营销", "AI配音", "视频模板"],
    viralVideos: [],
    structureSummary: "该竞品以技术驱动型内容为主，强调产品功能演示和效率对比。视频结构通常以功能演示+效果对比为主，缺少情感共鸣和场景化叙事。",
    scriptOptimization: emptyOptimization,
    conclusion: "竞品在速度和模板数量上有明显优势，但视频创意多样性不足，风格偏保守。建议我方突出创意多样性和本地化适配能力。",
    sellingPoints: "AI视频生成、短视频营销、AI配音、视频模板",
    likes: 12500, views: 230000, favorites: 8900, shares: 3400,
    creator: "张明", createdAt: "2026-05-10T09:30:00Z",
  },
  {
    id: "CR-002",
    keyword: "短视频营销",
    industry: "数字营销",
    competitorLink: "https://example.com/video2",
    competitorName: "MarketVid Pro",
    sellingPointsAnalysis: "### 产品卖点分析\n1. AI智能剪辑+批量生产，ROI追踪\n2. 自动分析热点话题，抢占流量先机\n3. 一键分发多平台，统一内容管理\n4. 数据分析驱动内容优化\n\n### 目标人群画像\n- 年龄：28-45岁\n- 职业：电商运营、品牌营销人员\n- 痛点：多平台管理复杂、ROI难衡量\n- 需求：数据可视化、投放效果追踪",
    hotKeywords: ["短视频营销", "数据分析", "多平台分发", "ROI追踪"],
    viralVideos: [],
    structureSummary: "以数据驱动型内容为主，强调ROI和转化效果。视频风格偏商务，适合B端决策者观看，但娱乐性和传播性不足。",
    scriptOptimization: emptyOptimization,
    conclusion: "竞品强于数据分析和多平台分发，但单视频质量一般。建议强化视频质量与飞书生态深度集成优势。",
    sellingPoints: "短视频营销、数据分析、多平台分发、ROI追踪",
    likes: 8900, views: 156000, favorites: 5600, shares: 2100,
    creator: "李婷", createdAt: "2026-05-09T14:20:00Z",
  },
];
