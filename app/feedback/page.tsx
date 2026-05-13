"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import type { Feedback } from "@/types";
import {
  MessageSquare, CheckCircle2, AlertTriangle, XCircle, Eye, ArrowUp, ArrowRight, ArrowDown,
  Sparkles, Lightbulb, Plus, Loader2, Send,
} from "lucide-react";

const typeIconMap: Record<string, React.ElementType> = { confirm: CheckCircle2, modify: AlertTriangle, reject: XCircle };
const priorityIconMap: Record<string, React.ElementType> = { high: ArrowUp, medium: ArrowRight, low: ArrowDown };
const statusMap: Record<string, { label: string; color: string }> = {
  confirm: { label: "确认", color: "bg-green-100 text-green-800" },
  modify: { label: "需修改", color: "bg-orange-100 text-orange-800" },
  reject: { label: "已拒绝", color: "bg-red-100 text-red-800" },
  high: { label: "高", color: "bg-red-100 text-red-800" },
  medium: { label: "中", color: "bg-yellow-100 text-yellow-800" },
  low: { label: "低", color: "bg-gray-100 text-gray-800" },
};

export default function FeedbackPage() {
  const [data, setData] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selected, setSelected] = useState<Feedback | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newStoryboardId, setNewStoryboardId] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState("modify");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try { const res = await fetch("/api/feedback"); const json = await res.json(); if (json.success) setData(json.data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = activeTab === "all" ? data : data.filter((f) => f.type === activeTab);
  const confirmCount = data.filter((f) => f.type === "confirm").length;
  const modifyCount = data.filter((f) => f.type === "modify").length;
  const rejectCount = data.filter((f) => f.type === "reject").length;

  const getStatus = (key: string) => statusMap[key] ?? { label: key, color: "bg-gray-100 text-gray-800" };

  const handleSubmit = async () => {
    if (!newStoryboardId || !newContent) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyboardId: newStoryboardId, content: newContent, type: newType }),
      });
      const json = await res.json();
      if (json.success) {
        setData([json.data, ...data]);
        setShowAdd(false);
        setNewStoryboardId(""); setNewContent("");
      }
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/feedback?id=${id}`, { method: "DELETE" });
    setData(data.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">确认与反馈</h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">AI分析反馈意图，自动识别修改方向与优先级</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="size-4" />提交反馈</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "已确认", count: confirmCount, icon: CheckCircle2, c: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "需修改", count: modifyCount, icon: AlertTriangle, c: "text-orange-600", bg: "bg-orange-100" },
          { label: "已拒绝", count: rejectCount, icon: XCircle, c: "text-red-600", bg: "bg-red-100" },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-3">
            <div className="flex items-center gap-3"><div className={`size-9 rounded-lg ${s.bg} flex items-center justify-center`}><s.icon className={`size-4 ${s.c}`} /></div>
            <div><p className="text-lg font-bold">{s.count}</p><p className="text-xs text-[var(--color-muted-foreground)]">{s.label}</p></div></div>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">全部 ({data.length})</TabsTrigger>
              <TabsTrigger value="confirm">已确认 ({confirmCount})</TabsTrigger>
              <TabsTrigger value="modify">需修改 ({modifyCount})</TabsTrigger>
              <TabsTrigger value="reject">已拒绝 ({rejectCount})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="size-6 animate-spin text-[var(--color-muted-foreground)]" /></div>
          ) : filtered.map((item) => {
            const TypeIcon = typeIconMap[item.type] || MessageSquare;
            const PriorityIcon = priorityIconMap[item.priority] || ArrowRight;
            const ts = getStatus(item.type);
            const ps = getStatus(item.priority);
            return (
              <div key={item.id} className="flex items-start gap-4 p-4 rounded-lg border hover:bg-[var(--color-muted)]/30 transition-colors cursor-pointer" onClick={() => { setSelected(item); setShowDetail(true); }}>
                <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${item.type === "confirm" ? "bg-emerald-100" : item.type === "modify" ? "bg-orange-100" : "bg-red-100"}`}>
                  <TypeIcon className={`size-5 ${item.type === "confirm" ? "text-emerald-600" : item.type === "modify" ? "text-orange-600" : "text-red-600"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{item.id}</span>
                    <Badge className={`text-xs ${ts.color}`}>{ts.label}</Badge>
                    <Badge variant="outline" className="text-xs gap-1"><PriorityIcon className="size-3" />{ps.label}优先级</Badge>
                  </div>
                  <p className="text-sm line-clamp-1">{item.content}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-1">关联: {item.storyboardId} · {formatDate(item.createdAt)}</p>
                </div>
                <div className="flex gap-1"><Button variant="ghost" size="sm"><Eye className="size-4" /></Button><Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}><XCircle className="size-4 text-[var(--color-destructive)]" /></Button></div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><MessageSquare className="size-5" />反馈详情 · {selected?.id}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Card><CardContent className="p-3 text-center"><p className="text-xs text-[var(--color-muted-foreground)]">类型</p><Badge className={`mt-1 ${getStatus(selected.type).color}`}>{getStatus(selected.type).label}</Badge></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xs text-[var(--color-muted-foreground)]">优先级</p><Badge className={`mt-1 ${getStatus(selected.priority).color}`}>{getStatus(selected.priority).label}</Badge></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xs text-[var(--color-muted-foreground)]">关联</p><p className="font-medium text-sm mt-1">{selected.storyboardId}</p></CardContent></Card>
              </div>
              <div><p className="text-sm font-medium mb-2">用户反馈内容</p><div className="bg-[var(--color-muted)] rounded-lg p-3 text-sm">{selected.content}</div></div>
              <div><p className="text-sm font-medium mb-2 flex items-center gap-2"><Sparkles className="size-4 text-[var(--color-primary)]" />AI意图分析</p><div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm whitespace-pre-wrap">{selected.intentAnalysis}</div></div>
              {selected.suggestions && <div><p className="text-sm font-medium mb-2 flex items-center gap-2"><Lightbulb className="size-4 text-yellow-500" />修改建议</p><div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm whitespace-pre-wrap">{selected.suggestions}</div></div>}
              <div className="text-xs text-[var(--color-muted-foreground)]">反馈时间: {formatDate(selected.createdAt)}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle><Send className="size-5 inline mr-2" />提交反馈</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-medium">关联故事板ID</label><Input placeholder="SB-XXXX" value={newStoryboardId} onChange={(e) => setNewStoryboardId(e.target.value)} /></div>
            <div><label className="text-sm font-medium">反馈类型</label>
              <select className="w-full rounded-md border px-3 py-2 text-sm bg-[var(--color-background)]" value={newType} onChange={(e) => setNewType(e.target.value)}>
                <option value="modify">需修改</option><option value="confirm">确认</option><option value="reject">拒绝</option>
              </select>
            </div>
            <div><label className="text-sm font-medium">反馈内容</label><textarea className="w-full h-24 rounded-md border px-3 py-2 text-sm resize-none bg-[var(--color-background)]" placeholder="描述需要修改的地方..." value={newContent} onChange={(e) => setNewContent(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={submitting || !newStoryboardId || !newContent}>{submitting ? <Loader2 className="size-4 animate-spin mr-2" /> : null}{submitting ? "分析中..." : "提交并AI分析"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
