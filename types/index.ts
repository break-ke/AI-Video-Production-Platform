export interface CompetitiveResearch {
  id: string;
  keyword: string;
  industry: string;
  competitorLink: string;
  competitorName: string;
  sellingPoints: string;
  conclusion: string;
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
