"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import type { ReplicateTemplate } from "@/types";
import {
  Copy, Eye, Zap, Settings, TrendingUp, Plus, Loader2, CheckCircle2,
} from "lucide-react";

export default function OneClickReplicatePage() {
  const [data, setData] = useState<ReplicateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ReplicateTemplate | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showReplicate, setShowReplicate] = useState(false);
  const [replicateCount, setReplicateCount] = useState(1);
  const [targetScriptId, setTargetScriptId] = useState("");
  const [replicating, setReplicating] = useState(false);
  const [result, setResult] = useState<{ tasks: { taskId: string }[]; message: string } | null>(null);

  const fetchData = useCallback(async () => {
    try { const res = await fetch("/api/one-click-replicate"); const json = await res.json(); if (json.success) setData(json.data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReplicate = async () => {
    if (!selected) return;
    setReplicating(true);
    try {
      const res = await fetch("/api/one-click-replicate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selected.id, count: replicateCount, targetScriptId: targetScriptId || undefined }),
      });
      const json = await res.json();
      if (json.success) { setResult(json.data); fetchData(); }
    } finally { setReplicating(false); }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">一键复刻</h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">基于已有模板快速复制生成新视频，累计复刻 {data.reduce((s, t) => s + t.replicateCount, 0)} 次</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin" /></div>
      ) : data.length === 0 ? (
        <div className="text-center py-16"><Copy className="size-10 text-[var(--color-muted-foreground)] mx-auto mb-3" /><p className="text-sm text-[var(--color-muted-foreground)]">暂无模板</p></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {data.map((template) => (
            <Card key={template.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-[var(--color-muted)] relative overflow-hidden group">
                <img src={template.previewUrl} alt={template.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2">
                  <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setSelected(template); setShowDetail(true); }}><Eye className="size-3 mr-1" />预览</Button>
                  <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setSelected(template); setShowReplicate(true); setResult(null); }}><Zap className="size-3 mr-1" />一键复刻</Button>
                </div>
                <div className="absolute top-2 right-2"><Badge className="bg-black/60 text-white text-xs"><Copy className="size-3 mr-1" />{template.replicateCount}次</Badge></div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm">{template.name}</h3>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-1 line-clamp-2 mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-muted-foreground)]">更新: {formatDate(template.updatedAt)}</span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => { setSelected(template); setShowDetail(true); }}><Settings className="size-3 mr-1" />编辑</Button>
                    <Button size="sm" onClick={() => { setSelected(template); setShowReplicate(true); setResult(null); }}><Zap className="size-3 mr-1" />复刻</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle><Copy className="size-5 inline mr-2" />模板详情 · {selected?.name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-[var(--color-muted)]"><img src={selected.previewUrl} alt="" className="w-full h-full object-cover" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-[var(--color-muted-foreground)]">模板ID</p><p className="font-medium">{selected.id}</p></div>
                <div><p className="text-xs text-[var(--color-muted-foreground)]">使用次数</p><p className="font-medium flex items-center gap-1"><TrendingUp className="size-4 text-emerald-500" />{selected.replicateCount} 次</p></div>
              </div>
              <div><p className="text-sm font-medium mb-2">描述</p><p className="text-sm bg-[var(--color-muted)] rounded-lg p-3">{selected.description}</p></div>
              <div><p className="text-sm font-medium mb-2">参数配置</p><pre className="text-xs font-mono bg-[var(--color-muted)] rounded-lg p-3 overflow-x-auto">{JSON.stringify(JSON.parse(selected.params), null, 2)}</pre></div>
            </div>
          )}
          <DialogFooter><Button variant="outline">编辑参数</Button><Button onClick={() => { setShowDetail(false); setShowReplicate(true); setResult(null); }}><Zap className="size-4 mr-1" />一键复刻</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReplicate} onOpenChange={setShowReplicate}>
        <DialogContent>
          <DialogHeader><DialogTitle><Zap className="size-5 inline mr-2" />一键复刻 · {selected?.name}</DialogTitle></DialogHeader>
          {result ? (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                <CheckCircle2 className="size-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-emerald-800">{result.message}</p>
                <div className="text-xs text-emerald-600 mt-1 space-y-1">
                  {result.tasks.map((t) => <p key={t.taskId}>📋 {t.taskId}</p>)}
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setShowReplicate(false)}>完成</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div><label className="text-sm font-medium">生成数量</label><Input type="number" value={replicateCount} onChange={(e) => setReplicateCount(Number(e.target.value))} min={1} max={10} /></div>
              <div><label className="text-sm font-medium">目标脚本ID（可选）</label><Input placeholder="输入脚本ID或留空自动匹配" value={targetScriptId} onChange={(e) => setTargetScriptId(e.target.value)} /></div>
            </div>
          )}
          {!result && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReplicate(false)}>取消</Button>
              <Button onClick={handleReplicate} disabled={replicating}>{replicating ? <Loader2 className="size-4 animate-spin mr-2" /> : <Zap className="size-4 mr-2" />}{replicating ? "复刻中..." : "确认复刻"}</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
