"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import type { ScriptVersion } from "@/types";
import {
  FileText, Plus, Eye, GitBranch, Clock, User, Check, X, Loader2, Sparkles,
} from "lucide-react";

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: "草稿", color: "bg-gray-100 text-gray-800" },
  review: { label: "审核中", color: "bg-blue-100 text-blue-800" },
  approved: { label: "已通过", color: "bg-green-100 text-green-800" },
  active: { label: "生效中", color: "bg-emerald-100 text-emerald-800" },
};

export default function ScriptIterationPage() {
  const [data, setData] = useState<ScriptVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ScriptVersion | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newScriptId, setNewScriptId] = useState("");
  const [newBaseContent, setNewBaseContent] = useState("");
  const [newFeedback, setNewFeedback] = useState("");
  const [generating, setGenerating] = useState(false);

  const fetchData = useCallback(async () => {
    try { const res = await fetch("/api/script-iteration"); const json = await res.json(); if (json.success) setData(json.data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const scripts = [...new Set(data.map((d) => d.scriptId))];

  const handleGenerate = async () => {
    if (!newScriptId) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/script-iteration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scriptId: newScriptId, baseContent: newBaseContent || undefined, feedbackSummary: newFeedback || undefined }),
      });
      const json = await res.json();
      if (json.success) {
        setData([json.data, ...data]);
        setShowAdd(false); setNewScriptId(""); setNewBaseContent(""); setNewFeedback("");
      }
    } finally { setGenerating(false); }
  };

  const handleApprove = (id: string) => {
    setData(data.map((s) => (s.id === id ? { ...s, status: "approved" as const } : s)));
  };

  const handleActivate = (id: string, scriptId: string) => {
    setData(data.map((s) => (s.scriptId === scriptId && s.status === "active" ? { ...s, status: "approved" as const } : s.id === id ? { ...s, status: "active" as const } : s)));
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-semibold">脚本迭代管理</h2><p className="text-sm text-[var(--color-muted-foreground)]">AI根据反馈自动优化脚本，追踪版本迭代历史</p></div>
        <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="size-4" />新建/迭代脚本</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-[var(--color-muted-foreground)]" /></div>
      ) : scripts.length === 0 ? (
        <div className="text-center py-16"><FileText className="size-10 text-[var(--color-muted-foreground)] mx-auto mb-3" /><p className="text-sm text-[var(--color-muted-foreground)]">暂无脚本，点击「新建/迭代脚本」开始</p></div>
      ) : (
        scripts.map((scriptId) => {
          const versions = data.filter((d) => d.scriptId === scriptId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          const latest = versions[0];
          return (
            <Card key={scriptId}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base flex items-center gap-2"><GitBranch className="size-4" />{scriptId}<Badge variant="outline" className="text-xs">{versions.length}个版本</Badge></CardTitle>
                <Button variant="outline" size="sm" onClick={() => { setNewScriptId(scriptId); setShowAdd(true); }}><Plus className="size-3 mr-1" />新增迭代</Button>
              </CardHeader>
              <CardContent className="space-y-1">
                {versions.map((v, idx) => {
                  const st = statusMap[v.status] || statusMap.draft;
                  return (
                    <div key={v.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-[var(--color-muted)]/30 transition-colors cursor-pointer group" onClick={() => { setSelected(v); setShowDetail(true); }}>
                      <div className="flex flex-col items-center pt-1.5">
                        <div className={`size-3 rounded-full border-2 ${v.status === "active" ? "border-emerald-500 bg-emerald-500" : v.status === "approved" ? "border-green-500 bg-green-500" : v.status === "review" ? "border-blue-500 bg-blue-500" : "border-gray-300 bg-gray-200"}`} />
                        {idx < versions.length - 1 && <div className="w-px h-full bg-[var(--color-border)] flex-1 min-h-[20px]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1"><span className="text-sm font-semibold">{v.version}</span>{idx === 0 && <Badge className="text-[10px] bg-blue-100 text-blue-800">最新</Badge>}<Badge className={`text-xs ${st.color}`}>{st.label}</Badge></div>
                        <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-2 mb-1">{v.content}</p>
                        <div className="flex items-center gap-3 text-xs text-[var(--color-muted-foreground)]"><span className="flex items-center gap-1"><User className="size-3" />{v.creator}</span><span className="flex items-center gap-1"><Clock className="size-3" />{formatDate(v.createdAt)}</span></div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                        <Button variant="ghost" size="sm"><Eye className="size-4" /></Button>
                        {v.status === "review" && <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleApprove(v.id); }}><Check className="size-4 text-emerald-500" /></Button>}
                        {v.status === "approved" && <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleActivate(v.id, v.scriptId); }}><Sparkles className="size-4 text-emerald-500" /></Button>}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })
      )}

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="size-5" />版本详情 · {selected?.version}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div><p className="text-xs text-[var(--color-muted-foreground)]">脚本ID</p><p className="font-medium">{selected.scriptId}</p></div>
                <div><p className="text-xs text-[var(--color-muted-foreground)]">状态</p><Badge className={`mt-1 ${(statusMap[selected.status] || statusMap.draft).color}`}>{(statusMap[selected.status] || statusMap.draft).label}</Badge></div>
                <div><p className="text-xs text-[var(--color-muted-foreground)]">创建人</p><p className="font-medium">{selected.creator}</p></div>
              </div>
              <div><p className="text-sm font-medium mb-2">修改说明</p><div className="bg-[var(--color-muted)] rounded-lg p-3 text-sm whitespace-pre-wrap">{selected.changes}</div></div>
              <div><p className="text-sm font-medium mb-2">脚本内容</p><div className="bg-[var(--color-muted)] rounded-lg p-4 text-sm whitespace-pre-wrap max-h-80 overflow-y-auto">{selected.content}</div></div>
            </div>
          )}
          <DialogFooter><Button variant="outline">编辑</Button><Button>审核通过</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle><Sparkles className="size-5 inline mr-2" />{newScriptId ? "迭代脚本" : "新建脚本"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-medium">脚本ID</label><Input placeholder="如 SCRIPT-001" value={newScriptId} onChange={(e) => setNewScriptId(e.target.value)} /></div>
            <div><label className="text-sm font-medium">当前脚本内容（可选）</label><textarea className="w-full h-24 rounded-md border px-3 py-2 text-sm resize-none bg-[var(--color-background)]" placeholder="粘贴需要优化的脚本..." value={newBaseContent} onChange={(e) => setNewBaseContent(e.target.value)} /></div>
            <div><label className="text-sm font-medium">反馈摘要（可选）</label><Input placeholder="用户反馈要点，AI据此优化脚本" value={newFeedback} onChange={(e) => setNewFeedback(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); setNewScriptId(""); }}>取消</Button>
            <Button onClick={handleGenerate} disabled={generating || !newScriptId}>{generating ? <Loader2 className="size-4 animate-spin mr-2" /> : <Sparkles className="size-4 mr-2" />}{generating ? "AI优化中..." : "AI生成/优化脚本"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
