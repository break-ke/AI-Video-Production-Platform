"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import type { Storyboard } from "@/types";
import {
  Film,
  Check,
  X,
  Edit3,
  Eye,
  Plus,
  Grid3x3,
  List,
  Loader2,
  Sparkles,
  ImageIcon,
} from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "待确认", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "已确认", color: "bg-green-100 text-green-800" },
  rejected: { label: "已拒绝", color: "bg-red-100 text-red-800" },
};

export default function StoryboardPage() {
  const [data, setData] = useState<Storyboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<Storyboard | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [genPrompt, setGenPrompt] = useState("");
  const [genFrameNum, setGenFrameNum] = useState(1);
  const [genDesc, setGenDesc] = useState("");
  const [generating, setGenerating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/storyboard");
      const json = await res.json();
      if (json.success) setData(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const confirmed = data.filter((s) => s.status === "confirmed").length;
  const pending = data.filter((s) => s.status === "pending").length;

  const handleGenerate = async () => {
    if (!genPrompt) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: genPrompt,
          frameNumber: genFrameNum,
          imageDescription: genDesc || genPrompt.slice(0, 50),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setData([json.data, ...data]);
        setShowAdd(false);
        setGenPrompt("");
        setGenDesc("");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleStatus = async (id: string, status: "confirmed" | "rejected") => {
    setData(data.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">故事板管理</h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            AI生成分镜故事板，{confirmed}已确认 / {pending}待确认
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg p-0.5">
            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("grid")}><Grid3x3 className="size-4" /></Button>
            <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("list")}><List className="size-4" /></Button>
          </div>
          <Button className="gap-2" onClick={() => setShowAdd(true)}><Plus className="size-4" />生成故事板</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-[var(--color-muted-foreground)]" /></div>
      ) : data.length === 0 ? (
        <div className="text-center py-16">
          <Film className="size-10 text-[var(--color-muted-foreground)] mx-auto mb-3" />
          <p className="text-sm text-[var(--color-muted-foreground)]">暂无故事板，点击「生成故事板」开始</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => {
            const status = STATUS_MAP[item.status] || STATUS_MAP.pending;
            return (
              <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-[var(--color-muted)] relative overflow-hidden group">
                  <img src={item.imageUrl} alt={`分镜 ${item.frameNumber}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setSelected(item); setShowDetail(true); }}>
                      <Eye className="size-3 mr-1" />查看详情
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2"><span className={`px-2 py-0.5 rounded-md text-xs font-medium ${status.color}`}>{status.label}</span></div>
                  <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded text-xs">分镜 #{item.frameNumber}</div>
                </div>
                <CardContent className="p-3">
                  <p className="text-sm line-clamp-2 mb-2">{item.imageDescription}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)] truncate mb-3">提示词: {item.prompt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--color-muted-foreground)]">{item.id}</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="size-8 p-0" onClick={() => handleStatus(item.id, "confirmed")}><Check className="size-4 text-emerald-500" /></Button>
                      <Button size="sm" variant="ghost" className="size-8 p-0"><Edit3 className="size-4 text-blue-500" /></Button>
                      <Button size="sm" variant="ghost" className="size-8 p-0" onClick={() => handleStatus(item.id, "rejected")}><X className="size-4 text-red-500" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card><CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b bg-[var(--color-muted)]/50">
                <th className="text-left p-3 text-xs font-medium">ID</th><th className="text-left p-3 text-xs font-medium">分镜</th><th className="text-left p-3 text-xs font-medium">画面描述</th><th className="text-left p-3 text-xs font-medium">提示词</th><th className="text-center p-3 text-xs font-medium">状态</th><th className="text-left p-3 text-xs font-medium">时间</th><th className="text-center p-3 text-xs font-medium">操作</th>
              </tr></thead>
              <tbody>
                {data.map((item) => {
                  const status = STATUS_MAP[item.status] || STATUS_MAP.pending;
                  return (
                    <tr key={item.id} className="border-b hover:bg-[var(--color-muted)]/30">
                      <td className="p-3 text-sm font-mono">{item.id}</td>
                      <td className="p-3"><div className="size-12 rounded overflow-hidden"><img src={item.imageUrl} alt="" className="w-full h-full object-cover" /></div></td>
                      <td className="p-3 text-sm max-w-xs truncate">{item.imageDescription}</td>
                      <td className="p-3 text-sm text-[var(--color-muted-foreground)] max-w-xs truncate">{item.prompt}</td>
                      <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-md text-xs font-medium ${status.color}`}>{status.label}</span></td>
                      <td className="p-3 text-sm whitespace-nowrap">{formatDate(item.createdAt)}</td>
                      <td className="p-3"><div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setSelected(item); setShowDetail(true); }}><Eye className="size-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleStatus(item.id, "confirmed")}><Check className="size-4 text-emerald-500" /></Button>
                      </div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Film className="size-5" />分镜详情 · {selected?.id}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-[var(--color-muted)]"><img src={selected.imageUrl} alt="" className="w-full h-full object-cover" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-[var(--color-muted-foreground)]">分镜序号</p><p className="font-medium">#{selected.frameNumber}</p></div>
                <div><p className="text-xs text-[var(--color-muted-foreground)]">状态</p><span className={`px-2 py-0.5 rounded-md text-xs font-medium ${(STATUS_MAP[selected.status] || STATUS_MAP.pending).color}`}>{(STATUS_MAP[selected.status] || STATUS_MAP.pending).label}</span></div>
              </div>
              <div><p className="text-sm font-medium mb-1">画面描述</p><p className="text-sm bg-[var(--color-muted)] rounded-lg p-3">{selected.imageDescription}</p></div>
              <div><p className="text-sm font-medium mb-1">绘图提示词</p><p className="text-sm font-mono bg-[var(--color-muted)] rounded-lg p-3">{selected.prompt}</p></div>
              <div className="flex gap-2">
                <Button className="flex-1 gap-2" variant="outline" onClick={() => handleStatus(selected.id, "confirmed")}><Check className="size-4" />确认</Button>
                <Button className="flex-1 gap-2" variant="outline"><Edit3 className="size-4" />修改</Button>
                <Button className="flex-1 gap-2" variant="outline" onClick={() => handleStatus(selected.id, "rejected")}><X className="size-4" />拒绝</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Sparkles className="size-5" />生成故事板</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">分镜序号</label>
              <Input type="number" value={genFrameNum} onChange={(e) => setGenFrameNum(Number(e.target.value))} min={1} max={20} />
            </div>
            <div>
              <label className="text-sm font-medium">画面描述（可选）</label>
              <Input placeholder="简述这个分镜要表达什么..." value={genDesc} onChange={(e) => setGenDesc(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">绘图提示词</label>
              <textarea
                className="w-full h-24 rounded-md border border-[var(--color-input)] bg-[var(--color-background)] px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
                placeholder="描述画面内容、风格、光线、镜头角度...（建议用英文，效果更好）"
                value={genPrompt}
                onChange={(e) => setGenPrompt(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button>
            <Button onClick={handleGenerate} disabled={generating || !genPrompt} className="gap-2">
              {generating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {generating ? "生成中（约2分钟）..." : "AI生成图片"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
