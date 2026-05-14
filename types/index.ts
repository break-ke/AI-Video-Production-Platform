// ---- TikTok Video Commercial Analysis Model ----

export interface VideoBasicInfo {
  duration: string;            // 完整时长
  category: string;            // 品类（精确到子品类）
  videoType: string;           // 口播/演示/开箱/对比/剧情/ASMR/混剪
  hookType: string;            // 开场钩子类型
  hookKeyElements: string;     // 开场0.3秒画面关键词
  ctaType: string;             // 结尾CTA类型
}

export interface VideoShot {
  shotNumber: number;          // 分镜#
  timeCode: string;            // 时间码
  duration: string;            // 时长
  shotSize: string;            // ECU/CU/MCU/MS/FS
  cameraMovement: string;      // Dolly In/Out, Pan, Tilt, etc.
  visualContent: string;       // 画面内容
  lighting: string;            // 主光+补光+色温
  characterAction: string;     // 身体动作+表情+眼神+微表情
  productPosition: string;     // 产品在画面中的位置
  subtitle: string;            // 字幕：原文+时机+动画+颜色+大小+位置
  rhythm: string;              // 节奏感：变化速度+节奏定位
  consumerPsychology: string;  // 消费心理学效应
  golden15Frames: string;      // 黄金15帧分析
  replicabilityScore: number;  // 可复制性指数 1-5
  replicationKey: string;      // 复刻要点
}

export interface PsychologyWeapon {
  name: string;                // 心理学武器名称
  timeRange: string;           // 时间段
  intensity: number;           // 强度 1-10
  description: string;         // 具体表现
}

export interface PurchaseDecisionPath {
  attention: string;           // 注意阶段
  interest: string;            // 兴趣阶段
  desire: string;              // 渴望阶段
  trust: string;               // 信任阶段
  action: string;              // 行动阶段
}

export interface RhythmIntensityRow {
  timeRange: string;
  visualIntensity: number;     // 1-5
  emotionIntensity: number;    // 1-5
  infoDensity: number;         // 1-5
  productAppearance: string;   // 产品出现时间
  rhythmPosition: string;      // 节奏定位
}

export interface RhythmCurveAnalysis {
  curveShape: string;          // 山峰型/波浪型/阶梯型/脉冲型/平缓直落型
  peakCount: number;
  peakTriggers: string[];      // 每个波峰的引爆因素
  valleyPoints: string[];      // 波谷位置
  editingStats: string;        // 平均镜长、最长镜、最短镜、镜头数
}

export interface CompetitiveResearch {
  id: string;
  competitorName: string;
  competitorLink: string;
  industry: string;
  // 一、视频基础信息
  basicInfo: VideoBasicInfo;
  // 二、逐镜头分镜拆解表
  shots: VideoShot[];
  // 三、消费心理学深度分析
  psychologyWeapons: PsychologyWeapon[];
  purchaseDecisionPath: PurchaseDecisionPath;
  // 四、节奏与情绪曲线
  rhythmIntensity: RhythmIntensityRow[];
  rhythmCurveAnalysis: RhythmCurveAnalysis;
  // 五、总结与可复制建议
  summary: string;
  replicableElements: string[];
  // Video clips (shotNumber → clipUrl)
  clipMap?: Record<number, string>;
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
