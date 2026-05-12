"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mockEditingTasks } from "@/lib/mock/auto-editing";
import { STATUS_MAP } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import {
  Clapperboard,
  Play,
  Download,
  Eye,
  Mic,
  Scissors,
  Film,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Plus,
} from "lucide-react";

const stepIcons = [Mic, Scissors, Film, CheckCircle2];

const stepLabels = ["配音", "剪辑", "合成", "完成"];

export default function AutoEditingPage() {
  const [data, setData] = useState(mockEditingTasks);
  const [selected, setSelected] = useState<(typeof data)[0] | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const activeCount = data.filter((t) => t.status !== "completed" && t.status !== "failed").length;
  const completedCount = data.filter((t) => t.status === "completed").length;
  const failedCount = data.filter((t) => t.status === "failed").length;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">自动剪辑与配音</h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            基于脚本自动生成配音、剪辑方案并合成视频成片
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="size-4" />
          新建剪辑任务
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "总任务", value: data.length, icon: Clapperboard, color: "text-indigo-600", bg: "bg-indigo-100" },
          { label: "进行中", value: activeCount, icon: Loader2, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "已完成", value: completedCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "失败", value: failedCount, icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className={`size-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`size-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {data.map((task) => {
          const status = STATUS_MAP[task.status];
          const stepIndex = task.status === "dubbing" ? 0 : task.status === "editing" ? 1 : task.status === "compositing" ? 2 : task.status === "completed" ? 3 : -1;
          return (
            <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelected(task); setShowDetail(true); }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium">{task.id}</span>
                    <Badge className={`text-xs ${status.color}`}>{status.label}</Badge>
                  </div>
                  <span className="text-xs text-[var(--color-muted-foreground)]">{task.scriptId}</span>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-1 mb-3">
                  {stepIcons.map((Icon, idx) => {
                    const isDone = idx < stepIndex;
                    const isCurrent = idx === stepIndex;
                    return (
                      <div key={idx} className="flex items-center flex-1 last:flex-none">
                        <div className={`size-8 rounded-full flex items-center justify-center ${
                          isDone ? "bg-emerald-500 text-white" :
                          isCurrent ? "bg-[var(--color-primary)] text-white" :
                          "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
                        }`}>
                          {isCurrent && task.status !== "completed" ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Icon className="size-4" />
                          )}
                        </div>
                        {idx < stepIcons.length - 1 && (
                          <div className={`h-0.5 flex-1 mx-1 ${
                            idx < stepIndex ? "bg-emerald-500" : "bg-[var(--color-border)]"
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--color-muted-foreground)]">进度</span>
                    <span className="font-medium">{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} />
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-[var(--color-muted-foreground)]">
                  <span>{formatDate(task.createdAt)}</span>
                  <div className="flex gap-1">
                    {task.status === "completed" && (
                      <>
                        <Button variant="ghost" size="sm" className="h-7 gap-1">
                          <Play className="size-3" /> 预览
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 gap-1">
                          <Download className="size-3" /> 下载
                        </Button>
                      </>
                    )}
                    {task.status === "failed" && (
                      <Button variant="ghost" size="sm" className="h-7 text-[var(--color-destructive)]">
                        重试
                      </Button>
                    )}
                    {task.status !== "completed" && task.status !== "failed" && (
                      <span className="flex items-center gap-1">
                        <Loader2 className="size-3 animate-spin" />
                        处理中...
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clapperboard className="size-5" />
              剪辑任务详情 · {selected?.id}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[var(--color-muted-foreground)]">脚本ID</p>
                  <p className="font-medium">{selected.scriptId}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted-foreground)]">状态</p>
                  <Badge className={`mt-1 ${STATUS_MAP[selected.status].color}`}>{STATUS_MAP[selected.status].label}</Badge>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>总体进度</span>
                  <span className="font-medium">{selected.progress}%</span>
                </div>
                <Progress value={selected.progress} className="h-3" />
              </div>

              {selected.editingPlan && (
                <div>
                  <p className="text-sm font-medium mb-2">剪辑方案</p>
                  <div className="bg-[var(--color-muted)] rounded-lg p-3 text-sm whitespace-pre-wrap">{selected.editingPlan}</div>
                </div>
              )}

              {selected.dubbingUrl && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Mic className="size-4" />
                    配音文件
                  </p>
                  <div className="bg-[var(--color-muted)] rounded-lg p-3 text-sm flex items-center justify-between">
                    <span className="font-mono text-xs">{selected.dubbingUrl}</span>
                    <Button variant="ghost" size="sm"><Play className="size-4" /></Button>
                  </div>
                </div>
              )}

              {selected.outputUrl && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Film className="size-4" />
                    成片链接
                  </p>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm flex items-center justify-between">
                    <span className="font-mono text-xs">{selected.outputUrl}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm"><Play className="size-4" /></Button>
                      <Button variant="ghost" size="sm"><Download className="size-4" /></Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
