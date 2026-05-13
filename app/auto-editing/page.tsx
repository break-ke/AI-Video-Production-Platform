"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import type { EditingTask } from "@/types";
import {
  Clapperboard, Plus, Eye, Trash2, Loader2, Play, Pause, Mic, Film, CheckCircle2, Clock, Video,
} from "lucide-react";

const stageIcons: Record<string, React.ElementType> = {
  pending: Clock,
  dubbing: Mic,
  editing: Film,
  compositing: Clapperboard,
  completed: CheckCircle2,
  failed: Clock,
};

const stageLabels: Record<string, string> = {
  pending: "等待中",
  dubbing: "配音中",
  editing: "剪辑中",
  compositing: "合成中",
  completed: "已完成",
  failed: "失败",
};

const stageColors: Record<string, string> = {
  pending: "bg-gray-200",
  dubbing: "bg-blue-200",
  editing: "bg-purple-200",
  compositing: "bg-indigo-200",
  completed: "bg-emerald-200",
  failed: "bg-red-200",
};

const stages = ["pending", "dubbing", "editing", "compositing", "completed"];

export default function AutoEditingPage() {
  const [data, setData] = useState<EditingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<EditingTask | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newScriptId, setNewScriptId] = useState("");
  const [newScriptContent, setNewScriptContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try { const res = await fetch("/api/auto-editing"); const json = await res.json(); if (json.success) setData(json.data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); const i = setInterval(fetchData, 5000); return () => clearInterval(i); }, [fetchData]);

  const handleStart = async () => {
    if (!newScriptId) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/auto-editing", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scriptId: newScriptId, scriptContent: newScriptContent || undefined }),
      });
      const json = await res.json();
      if (json.success) { setData([json.data, ...data]); setShowAdd(false); setNewScriptId(""); setNewScriptContent(""); }
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/auto-editing?id=${id}`, { method: "DELETE" });
    setData(data.filter((d) => d.id !== id));
  };

  const completed = data.filter((d) => d.status === "completed").length;
  const inProgress = data.filter((d) => d.status !== "completed" && d.status !== "failed").length;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-semibold">自动剪辑配音</h2><p className="text-sm text-[var(--color-muted-foreground)]">AI自动解析脚本→配音→剪辑→合成，全流程自动化</p></div>
        <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="size-4" />新建剪辑任务</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "总任务", value: data.length, icon: Clapperboard },
          { label: "进行中", value: inProgress, icon: Play },
          { label: "已完成", value: completed, icon: CheckCircle2 },
          { label: "失败", value: data.filter((d) => d.status === "failed").length, icon: Pause },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-3"><div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-[var(--color-muted)] flex items-center justify-center"><s.icon className="size-4" /></div>
            <div><p className="text-lg font-bold">{s.value}</p><p className="text-xs text-[var(--color-muted-foreground)]">{s.label}</p></div>
          </div></CardContent></Card>
        ))}
      </div>

      <Card><CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin" /></div>
        ) : data.length === 0 ? (
          <div className="text-center py-16"><Clapperboard className="size-10 text-[var(--color-muted-foreground)] mx-auto mb-3" /><p className="text-sm text-[var(--color-muted-foreground)]">暂无剪辑任务，点击新建开始</p></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full">
            <thead><tr className="border-b bg-[var(--color-muted)]/50"><th className="text-left p-3 text-xs">ID</th><th className="text-left p-3 text-xs">脚本ID</th><th className="text-left p-3 text-xs">进度</th><th className="text-center p-3 text-xs">状态</th><th className="text-left p-3 text-xs">时间</th><th className="text-center p-3 text-xs">操作</th></tr></thead>
            <tbody>
              {data.map((item) => {
                const StageIcon = stageIcons[item.status] || Clock;
                return (
                  <tr key={item.id} className="border-b hover:bg-[var(--color-muted)]/30">
                    <td className="p-3 text-sm font-mono">{item.id}</td>
                    <td className="p-3 text-sm">{item.scriptId}</td>
                    <td className="p-3 w-48">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-[var(--color-muted)] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${item.status === "failed" ? "bg-red-500" : "bg-[var(--color-primary)]"}`} style={{ width: `${item.progress}%` }} />
                        </div>
                        <span className="text-xs font-mono w-10">{item.progress}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <Badge className={`text-xs flex items-center gap-1 ${stageColors[item.status] || "bg-gray-100"} text-gray-800`}>
                        <StageIcon className="size-3" />{stageLabels[item.status] || item.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm whitespace-nowrap">{formatDate(item.createdAt)}</td>
                    <td className="p-3"><div className="flex justify-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setSelected(item); setShowDetail(true); }}><Eye className="size-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="size-4 text-[var(--color-destructive)]" /></Button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        )}
      </CardContent></Card>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Clapperboard className="size-5" />任务详情 · {selected?.id}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div><p className="text-xs text-[var(--color-muted-foreground)]">脚本ID</p><p className="font-medium">{selected.scriptId}</p></div>
                <div><p className="text-xs text-[var(--color-muted-foreground)]">进度</p><div className="flex items-center gap-2"><div className="flex-1 h-2 bg-[var(--color-muted)] rounded-full"><div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${selected.progress}%` }} /></div><span className="text-sm font-bold">{selected.progress}%</span></div></div>
                <div><p className="text-xs text-[var(--color-muted-foreground)]">状态</p><Badge className={(stageColors[selected.status] || "") + " text-gray-800 text-xs"}>{stageLabels[selected.status]}</Badge></div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">剪辑流程</p>
                <div className="flex items-center gap-1">
                  {stages.map((s, i) => {
                    const activeIdx = stages.indexOf(selected.status);
                    const done = activeIdx > i || (selected.status === "completed" && i === stages.length - 1);
                    const current = activeIdx === i && selected.status !== "completed";
                    return (
                      <div key={s} className="flex items-center flex-1">
                        <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold ${done ? "bg-emerald-500 text-white" : current ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"}`}>
                          {done ? "✓" : i + 1}
                        </div>
                        {i < stages.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${done ? "bg-emerald-300" : "bg-[var(--color-border)]"}`} />}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-1">
                  {stages.map((s) => <span key={s} className="text-[10px] text-[var(--color-muted-foreground)]">{stageLabels[s] || s}</span>)}
                </div>
              </div>

              <div><p className="text-sm font-medium mb-2">剪辑方案</p><div className="bg-[var(--color-muted)] rounded-lg p-3 text-sm whitespace-pre-wrap">{selected.editingPlan}</div></div>
              {selected.outputUrl && <div><p className="text-sm font-medium mb-2">成片输出</p><div className="bg-emerald-50 rounded-lg p-3 text-sm text-emerald-700 flex items-center gap-2"><Video className="size-4" />{selected.outputUrl}</div></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle><Clapperboard className="size-5 inline mr-2" />新建剪辑任务</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-medium">脚本ID</label><Input placeholder="如 SV-MP2XXXX 或 SCRIPT-001" value={newScriptId} onChange={(e) => setNewScriptId(e.target.value)} /></div>
            <div><label className="text-sm font-medium">脚本内容（可选）</label><textarea className="w-full h-32 rounded-md border px-3 py-2 text-sm resize-none bg-[var(--color-background)]" placeholder="粘贴脚本内容，AI自动拆解分镜并生成剪辑方案..." value={newScriptContent} onChange={(e) => setNewScriptContent(e.target.value)} /></div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button>
            <Button onClick={handleStart} disabled={submitting || !newScriptId}>{submitting ? <Loader2 className="size-4 animate-spin mr-2" /> : <Play className="size-4 mr-2" />}{submitting ? "启动中..." : "启动剪辑流水线"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
