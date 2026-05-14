// ---- E-Commerce Competitive Analysis Model ----

export interface FeatureComparisonItem {
  feature: string;           // 功能点
  competitor: string;        // 竞品表现
  ours: string;             // 我方表现
  advantage: "competitor" | "ours" | "tie"; // 谁占优
}

export interface ProductPositioning {
  priceRange: string;        // 价格区间
  targetUsers: string[];     // 目标用户群
  coreValueProp: string;     // 核心价值主张
  marketSegment: string;     // 细分市场定位
  pricingModel: string;      // 定价模式（订阅/买断/按量）
}

export interface ContentStrategy {
  primaryPlatforms: string[];    // 主要发布平台
  contentTypes: string[];        // 内容类型（教程/测评/案例/产品演示）
  avgDuration: string;           // 平均视频时长
  postingFrequency: string;      // 发布频率
  engagementLevel: string;       // 互动水平（高/中/低）
  topPerformingTopics: string[]; // 表现最好的内容主题
}

export interface MarketAnalysis {
  companySize: string;         // 公司规模（初创/成长/成熟/巨头）
  estimatedMarketShare: string; // 预估市场份额
  growthTrend: string;          // 增长趋势（上升/平稳/下降）
  primaryRegions: string[];     // 主要市场区域
  competitorType: string;       // 竞争类型（直接/间接/替代品）
}

export interface SWOTItem {
  strengths: string[];     // 竞品优势
  weaknesses: string[];    // 竞品劣势
  opportunities: string[]; // 我方机会
  threats: string[];       // 对我方威胁
}

export interface VideoShotBreakdown {
  timeRange: string;
  shotType: string;
  visualDescription: string;
  intent: string;
}

export interface ReferencedVideo {
  title: string;
  url: string;
  platform: string;
  views: number;
  likes: number;
  duration: number; // seconds
  summary: string;  // what this video demonstrates
}

export interface CompetitiveResearch {
  id: string;
  competitorName: string;
  competitorLink: string;
  industry: string;
  // Product analysis
  productDescription: string;
  productPositioning: ProductPositioning;
  features: FeatureComparisonItem[];
  // Market analysis
  marketAnalysis: MarketAnalysis;
  swot: SWOTItem;
  // Content strategy
  contentStrategy: ContentStrategy;
  referencedVideos: ReferencedVideo[];
  // AI-generated insights
  keyInsights: string;          // 核心发现
  actionableRecommendations: string[]; // 可执行建议
  // Metadata
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
