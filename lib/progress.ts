// Server-side progress tracking for SSE streaming

export interface ProgressEvent {
  step: string;
  label: string;
  status: "running" | "completed" | "error";
  detail?: string;
}

type ProgressCallback = (event: ProgressEvent) => void;

const STEPS = [
  { key: "scrape", label: "抓取网页内容" },
  { key: "ai", label: "调用Gemini多模态分析" },
  { key: "basic", label: "解析视频基础信息" },
  { key: "shots", label: "逐镜头分镜拆解" },
  { key: "psychology", label: "消费心理学分析" },
  { key: "rhythm", label: "生成节奏曲线" },
  { key: "insights", label: "总结与复刻建议" },
];

export async function runWithProgress(
  taskId: string,
  onProgress: ProgressCallback,
  work: (report: (step: string, detail?: string) => void) => Promise<void>
) {
  const completed = new Set<string>();

  const report = (step: string, detail?: string) => {
    completed.add(step);
    onProgress({ step, label: STEPS.find(s => s.key === step)?.label || step, status: "completed", detail });
  };

  // Start all steps as running
  for (const s of STEPS) {
    onProgress({ step: s.key, label: s.label, status: "running" });
  }

  try {
    await work(report);
  } catch (e) {
    for (const s of STEPS) {
      if (!completed.has(s.key)) {
        onProgress({ step: s.key, label: s.label, status: "error", detail: (e as Error).message });
      }
    }
  }
}

export const ANALYSIS_STEPS = STEPS;
