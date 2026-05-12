export interface VideoShotBreakdown {
  timeRange: string;       // e.g. "0-3s"
  duration: number;        // seconds
  shotType: string;        // 景别：特写/近景/中景/全景/远景
  cameraMovement: string;  // 镜头运动：推/拉/摇/移/固定
  visualDescription: string; // 画面描述
  characterAction: string; // 人物动作
  textOverlay: string;     // 字幕/花字
  audioType: string;       // 配音/背景音乐/音效
  targetAudience: string;  // 触达人群
  intent: string;          // 意图（钩子/塑品/信任/引导）
}

export interface ViralVideo {
  id: string;
  title: string;
  url: string;
  platform: string;        // 抖音/快手/TikTok/YouTube
  views: number;
  likes: number;
  comments: number;
  shares: number;
  duration: number;        // 视频总时长（秒）
  publishDate: string;
  structureType: string;   // 结构类型：痛点钩子型/使用场景型/对比测评型/剧情带入型
  hookDescription: string; // 开头钩子分析
  sellingPointDescription: string; // 塑品卖点分析
  closingDescription: string;      // 下单引导分析
  shots: VideoShotBreakdown[];     // 分镜拆解
}

export interface ScriptOptimization {
  strengthsToLearn: string[];   // 竞品脚本优势（值得学习）
  weaknessesToImprove: string[]; // 竞品脚本不足（我方优化方向）
  suggestedScript: string;      // 基于竞品优化的建议脚本
  keywordSuggestions: string[]; // 建议关键词
}

export interface CompetitiveResearch {
  id: string;
  keyword: string;
  industry: string;
  competitorLink: string;
  competitorName: string;
  // 1. 产品卖点和热门关键词分析
  sellingPointsAnalysis: string;
  hotKeywords: string[];
  // 2. 热门爆款视频
  viralVideos: ViralVideo[];
  // 3. 视频结构拆解汇总
  structureSummary: string;
  // 4. 脚本优化建议
  scriptOptimization: ScriptOptimization;
  // 总结
  conclusion: string;
  // 兼容旧字段
  sellingPoints: string;
  likes: number;
  views: number;
  favorites: number;
  shares: number;
  creator: string;
  createdAt: string;
}

export interface Storyboard {
  id: string;
  researchId: string;
  sellingPointId: string;
  frameNumber: number;
  imageDescription: string;
  prompt: string;
  imageUrl: string;
  status: "pending" | "confirmed" | "rejected";
  createdAt: string;
}

export interface Feedback {
  id: string;
  storyboardId: string;
  content: string;
  type: "confirm" | "modify" | "reject";
  intentAnalysis: string;
  priority: "high" | "medium" | "low";
  suggestions: string;
  createdAt: string;
}

export interface ScriptVersion {
  id: string;
  scriptId: string;
  version: string;
  content: string;
  changes: string;
  status: "draft" | "review" | "approved" | "active";
  creator: string;
  createdAt: string;
}

export interface ModelAdaptation {
  id: string;
  modelName: string;
  version: string;
  evaluationItem: string;
  result: "pass" | "risk" | "fail";
  riskPoints: string;
  suggestions: string;
  evaluatedAt: string;
}

export interface EditingTask {
  id: string;
  scriptId: string;
  dubbingUrl: string;
  editingPlan: string;
  progress: number;
  status: "pending" | "dubbing" | "editing" | "compositing" | "completed" | "failed";
  outputUrl: string;
  createdAt: string;
}

export interface ReplicateTemplate {
  id: string;
  name: string;
  description: string;
  params: string;
  replicateCount: number;
  previewUrl: string;
  updatedAt: string;
}
