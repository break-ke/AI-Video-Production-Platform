"use client";

import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";

interface Step {
  label: string;
  description: string;
  count: number;
}

const steps: Step[] = [
  { label: "竞品调研", description: "分析竞品视频卖点", count: 5 },
  { label: "故事板生成", description: "生成分镜画面", count: 6 },
  { label: "确认反馈", description: "收集用户意见", count: 5 },
  { label: "脚本迭代", description: "优化视频脚本", count: 4 },
  { label: "模型适配", description: "评估AI模型", count: 5 },
  { label: "自动剪辑", description: "生成完整视频", count: 4 },
  { label: "一键复刻", description: "模板快速复用", count: 4 },
];

export function WorkflowPipeline() {
  return (
    <div className="flex items-start gap-0 overflow-x-auto pb-2">
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-start flex-1 min-w-0">
          <div className="flex flex-col items-center gap-2 flex-1">
            <div
              className={cn(
                "size-10 rounded-full flex items-center justify-center border-2 transition-colors",
                index < 2
                  ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                  : index === 2
                  ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "border-[var(--color-border)] text-[var(--color-muted-foreground)]"
              )}
            >
              {index < 2 ? <Check className="size-5" /> : <span className="text-sm font-semibold">{index + 1}</span>}
            </div>
            <div className="text-center min-w-0 px-1">
              <p className="text-xs font-medium truncate">{step.label}</p>
              <p className="text-[10px] text-[var(--color-muted-foreground)] truncate">{step.description}</p>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">{step.count}项</p>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 mt-5 flex-1 -mx-1",
                index < 2 ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
