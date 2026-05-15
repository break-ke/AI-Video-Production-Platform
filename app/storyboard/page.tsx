"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import type { Storyboard } from "@/types";
import {
  Film, Check, X, Eye, Plus, Loader2, Sparkles, ImageIcon, Upload, RefreshCw, CheckCircle2,
} from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "待确认", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "已确认", color: "bg-green-100 text-green-800" },
  rejected: { label: "已拒绝", color: "bg-red-100 text-red-800" },
};

const GEN_STEPS = [
  { key: "upload", label: "上传参考图片", icon: Upload },
  { key: "main", label: "GPT-Image-2 生成主图", icon: Sparkles },
  { key: "variant1", label: "生成变体图一（特写）", icon: ImageIcon },
  { key: "variant2", label: "生成变体图二（全景）", icon: ImageIcon },
  { key: "done", label: "生成完成", icon: CheckCircle2 },
];

export default function StoryboardPage() {
  const [data, setData] = useState<Storyboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Storyboard | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [refFile, setRefFile] = useState<File | null>(null);
  const [refUrl, setRefUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [progressVisible, setProgressVisible] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<Storyboard | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const fetchData = useCallback(async () => {
    try { const r = await fetch("/api/storyboard"); const j = await r.json(); if (j.success) setData(j.data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUploadRef = async () => {
    if (!refFile) return;
    setUploading(true);
    try {
      const form = new FormData(); form.append("video", refFile);
      const r = await fetch("/api/upload", { method: "POST", body: form });
      const j = await r.json();
      if (j.success) { setRefUrl(j.data.videoUrl); setRefFile(null); }
    } catch { /* ignore */ }
    finally { setUploading(false); }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setGenerating(true);
    setProgressVisible(true);
    setProgressStep(0);

    // Progress animation matching actual steps
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setProgressStep(Math.min(step, GEN_STEPS.length));
      if (step >= GEN_STEPS.length) clearInterval(timer);
    }, 1500);

    try {
      const body: Record<string, string> = { prompt };
      if (refUrl) {
        setProgressStep(1); // upload complete
        body.referenceImageUrl = refUrl;
      }
      const r = await fetch("/api/storyboard", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      clearInterval(timer);
      setProgressStep(GEN_STEPS.length);
      if (j.success) {
        setTimeout(() => {
          setData(d => [j.data, ...d]);
          setShowAdd(false); setPrompt(""); setRefUrl(""); setRefFile(null);
          setProgressVisible(false); setProgressStep(0);
        }, 500);
      }
    } catch {
      clearInterval(timer);
      setProgressVisible(false);
    }
    finally { setGenerating(false); }
  };

  // Regenerate: same prompt, call API again
  const handleRegenerate = async () => {
    if (!rejectTarget) return;
    setRegenerating(true);
    setProgressVisible(true);
    setProgressStep(0);

    let step = 0;
    const timer = setInterval(() => {
      step++;
      setProgressStep(Math.min(step, GEN_STEPS.length));
      if (step >= GEN_STEPS.length) clearInterval(timer);
    }, 1500);

    try {
      const body: Record<string, string> = { prompt: rejectTarget.prompt || rejectTarget.imageDescription };
      const r = await fetch("/api/storyboard", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      clearInterval(timer);
      setProgressStep(GEN_STEPS.length);
      if (j.success) {
        setTimeout(() => {
          // Replace the rejected item with new generated one
          setData(d => [j.data, ...d.filter(s => s.id !== rejectTarget.id)]);
          setShowReject(false); setRejectTarget(null);
          setProgressVisible(false); setProgressStep(0);
        }, 500);
      }
    } catch {
      clearInterval(timer);
      setProgressVisible(false);
    }
    finally { setRegenerating(false); }
  };

  const handleConfirm = (id: string) => {
    setData(d => d.map(s => s.id === id ? { ...s, status: "confirmed" as const } : s));
  };

  const handleReject = (item: Storyboard) => {
    setData(d => d.map(s => s.id === item.id ? { ...s, status: "rejected" as const } : s));
    setRejectTarget(item);
    setShowReject(true);
  };

  return (
    <div className="space-y-6 max-w-[1440px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">故事板生成</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">{data.filter(s => s.status === "confirmed").length} 已确认 · {data.length} 总计</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="size-4"/>生成故事板</Button>
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="size-5 animate-spin text-zinc-400"/></div>
      : data.length === 0 ? (
        <div className="text-center py-16"><ImageIcon className="size-10 text-zinc-300 mx-auto mb-3"/><p className="text-sm text-zinc-500">暂无故事板，点击「生成故事板」开始</p></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map(item => (
            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className="aspect-[2/3] bg-zinc-100 relative overflow-hidden group" onClick={() => { setSelected(item); setShowDetail(true); }}>
                <img src={item.imageUrl || item.frames?.[0]?.imageUrl} alt={item.imageDescription} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2">
                  <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100" onClick={(e)=>{e.stopPropagation();setSelected(item);setShowDetail(true);}}><Eye className="size-3 mr-1"/>查看</Button>
                </div>
                <div className="absolute top-2 right-2"><span className={`px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_MAP[item.status]?.color}`}>{STATUS_MAP[item.status]?.label}</span></div>
                <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded text-xs">{item.frames?.length || 1}张</div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm line-clamp-2 mb-2">{item.imageDescription}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">{formatDate(item.createdAt)}</span>
                  <div className="flex gap-1">
                    {item.status !== "confirmed" && (
                      <Button size="sm" variant="ghost" className="size-8 p-0" onClick={(e) => { e.stopPropagation(); handleConfirm(item.id); }} title="确认保留"><Check className="size-4 text-emerald-500"/></Button>
                    )}
                    {item.status !== "rejected" && (
                      <Button size="sm" variant="ghost" className="size-8 p-0" onClick={(e) => { e.stopPropagation(); handleReject(item); }} title="拒绝"><X className="size-4 text-red-500"/></Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-5xl max-h-[88vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Film className="size-5"/>{selected?.title || "图片详情"}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {selected.frames?.map((f, i) => (
                  <Card key={i} className="shadow-card overflow-hidden">
                    <div className="aspect-[2/3] bg-zinc-100 group relative">
                      <img src={f.imageUrl} alt={f.visualContent} className="w-full h-full object-cover cursor-zoom-in" loading="lazy" onClick={() => window.open(f.imageUrl, "_blank")} />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-[11px]">点击查看原图</p>
                      </div>
                    </div>
                    <CardContent className="p-2.5">
                      <div className="flex items-center gap-1.5 mb-1"><Badge variant="outline" className="text-[10px]">{f.shotSize}</Badge><Badge variant="outline" className="text-[10px]">{f.cameraMovement}</Badge></div>
                      <p className="text-[12px] text-zinc-600 line-clamp-2">{f.visualContent}</p>
                      <p className="text-[11px] text-zinc-400 mt-1 font-mono line-clamp-2">{f.imagePrompt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {selected.photographyNotes && <div className="bg-blue-50 rounded-lg p-4 text-[13px] text-blue-800">{selected.photographyNotes}</div>}
              <p className="text-xs text-zinc-500">提示词: {selected.prompt || selected.imageDescription} · 生成时间: {formatDate(selected.createdAt)}</p>
              <div className="flex gap-2">
                <Button className="flex-1" variant="outline" onClick={() => { handleConfirm(selected.id); }} disabled={selected.status === "confirmed"}><Check className="size-4 mr-1"/>{selected.status === "confirmed" ? "已确认" : "确认保留"}</Button>
                <Button className="flex-1" variant="outline" onClick={() => { handleReject(selected); setShowDetail(false); }} disabled={selected.status === "rejected"}><X className="size-4 mr-1"/>{selected.status === "rejected" ? "已拒绝" : "拒绝"}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate Dialog */}
      <Dialog open={showAdd} onOpenChange={(open) => { if (!generating) { setShowAdd(open); if (!open) setProgressVisible(false); } }}>
        <DialogContent><DialogHeader><DialogTitle><Sparkles className="size-5 inline mr-2"/>生成故事板图片</DialogTitle></DialogHeader>

        {progressVisible ? (
          <div className="py-4">
            <p className="text-sm font-semibold mb-4 text-center">{regenerating ? "正在重新生成..." : "GPT-Image-2 正在生成..."}</p>
            <div className="space-y-2">
              {GEN_STEPS.map((step, i) => {
                const isComplete = i < progressStep;
                const isCurrent = i === progressStep;
                return (
                  <div key={step.key} className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    isComplete ? "bg-emerald-50" : isCurrent ? "bg-blue-50 animate-pulse" : "bg-zinc-50 opacity-40"
                  }`}>
                    <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isComplete ? "bg-emerald-500 text-white" : isCurrent ? "bg-[var(--color-primary)] text-white" : "bg-zinc-200 text-zinc-400"
                    }`}>
                      {isComplete ? <CheckCircle2 className="size-4" /> : <step.icon className="size-4" />}
                    </div>
                    <div className="flex-1"><p className={`text-[13px] font-medium ${isComplete?"text-emerald-700":isCurrent?"text-[var(--color-primary)]":"text-zinc-400"}`}>{step.label}{isComplete && " ✓"}{isCurrent && "..."}</p></div>
                    <span className="text-[11px] text-zinc-400">{i + 1}/{GEN_STEPS.length}</span>
                  </div>
                );
              })}
              {progressStep >= GEN_STEPS.length && <p className="text-center text-sm text-emerald-600 font-medium mt-3">✅ 生成完成！</p>}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-[13px] font-medium">绘图提示词</label>
              <textarea className="w-full h-28 rounded-lg border px-3 py-2 text-sm resize-none bg-[var(--color-background)] mt-1" placeholder="描述画面，如：A cinematic shot of futuristic AI office, blue lighting, photorealistic, 4K" value={prompt} onChange={e => setPrompt(e.target.value)} />
            </div>
            <div className="border-t pt-3">
              <label className="text-[13px] font-medium mb-2 block">上传参考图片（可选）</label>
              {refUrl ? (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <ImageIcon className="size-4 text-emerald-600"/><span className="text-[13px] text-emerald-700">图片已上传</span>
                  <button onClick={() => { setRefUrl(""); setRefFile(null); }} className="ml-auto text-xs text-red-500 hover:underline">移除</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="flex cursor-pointer">
                    <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-zinc-300 rounded-lg hover:border-[var(--color-primary)] hover:bg-blue-50/30 transition-colors w-full">
                      <Upload className="size-5 text-zinc-400"/><span className="text-[13px] text-zinc-500">{refFile ? refFile.name : "点击上传 (JPG/PNG ≤10MB)"}</span>
                    </div>
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setRefFile(f); }} />
                  </label>
                  {refFile && (
                    <div className="flex items-center gap-2"><span className="text-xs text-zinc-500">{(refFile.size/1024).toFixed(0)}KB</span><Button size="sm" variant="outline" onClick={handleUploadRef} disabled={uploading} className="h-7 text-xs">{uploading ? <><Loader2 className="size-3 animate-spin mr-1"/>上传中</> : "上传"}</Button></div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {!progressVisible && (
          <DialogFooter><Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button><Button onClick={handleGenerate} disabled={generating || !prompt}>{generating ? <><Loader2 className="size-4 animate-spin mr-2"/>生成中...</> : <><Sparkles className="size-4 mr-2"/>GPT-Image-2 生成</>}</Button></DialogFooter>
        )}
        </DialogContent>
      </Dialog>

      {/* Reject → Regenerate Dialog */}
      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent>
          <DialogHeader><DialogTitle><RefreshCw className="size-5 inline mr-2"/>确认拒绝</DialogTitle></DialogHeader>
          <p className="text-sm text-zinc-600">该图片已被标记为拒绝。是否重新生成一张新的图片？</p>
          <p className="text-xs text-zinc-400 mt-1">提示词: {rejectTarget?.prompt || rejectTarget?.imageDescription}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReject(false)}>不生成</Button>
            <Button onClick={handleRegenerate} disabled={regenerating}>
              {regenerating ? <Loader2 className="size-4 animate-spin mr-2"/> : <RefreshCw className="size-4 mr-2"/>}
              {regenerating ? "重新生成中..." : "重新生成"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
