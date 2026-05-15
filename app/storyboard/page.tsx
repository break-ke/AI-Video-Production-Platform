"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import type { Storyboard } from "@/types";
import {
  Film, Check, X, Eye, Plus, Loader2, Sparkles, ImageIcon, Upload, Camera, Grid3x3, List,
} from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "待确认", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "已确认", color: "bg-green-100 text-green-800" },
  rejected: { label: "已拒绝", color: "bg-red-100 text-red-800" },
};

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
    try {
      const body: Record<string, string> = { prompt };
      if (refUrl) body.referenceImageUrl = refUrl;
      const r = await fetch("/api/storyboard", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (j.success) { setData(d => [j.data, ...d]); setShowAdd(false); setPrompt(""); setRefUrl(""); setRefFile(null); }
    } finally { setGenerating(false); }
  };

  const handleStatus = (id: string, status: "confirmed" | "rejected") => {
    setData(d => d.map(s => s.id === id ? { ...s, status } : s));
  };

  return (
    <div className="space-y-6 max-w-[1440px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">故事板生成</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">输入提示词 → GPT-Image-2 生成图片 · {data.filter(s=>s.status==="confirmed").length} 已确认</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="size-4"/>生成故事板</Button>
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="size-5 animate-spin text-zinc-400"/></div>
      : data.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="size-10 text-zinc-300 mx-auto mb-3"/>
          <p className="text-sm text-zinc-500">暂无故事板，点击「生成故事板」开始</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map(item => (
            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelected(item); setShowDetail(true); }}>
              <div className="aspect-[2/3] bg-zinc-100 relative overflow-hidden group">
                <img src={item.imageUrl || item.frames?.[0]?.imageUrl} alt={item.imageDescription} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100"><Eye className="size-3 mr-1"/>查看</Button>
                </div>
                <div className="absolute top-2 right-2"><span className={`px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_MAP[item.status]?.color}`}>{STATUS_MAP[item.status]?.label}</span></div>
                <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded text-xs">{item.frames?.length || 1}张</div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm line-clamp-2 mb-2">{item.imageDescription}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">{item.id}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="size-8 p-0" onClick={(e) => { e.stopPropagation(); handleStatus(item.id, "confirmed"); }}><Check className="size-4 text-emerald-500"/></Button>
                    <Button size="sm" variant="ghost" className="size-8 p-0" onClick={(e) => { e.stopPropagation(); handleStatus(item.id, "rejected"); }}><X className="size-4 text-red-500"/></Button>
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
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Film className="size-5"/>{selected?.title || "故事板详情"}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selected.frames?.map((f, i) => (
                  <Card key={i} className="shadow-card overflow-hidden">
                    <div className="aspect-[2/3] bg-zinc-100">
                      <img src={f.imageUrl} alt={f.visualContent} className="w-full h-full object-cover" loading="lazy" />
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
              <div className="flex gap-2">
                <Button className="flex-1" variant="outline" onClick={() => handleStatus(selected.id, "confirmed")}><Check className="size-4 mr-1"/>确认</Button>
                <Button className="flex-1" variant="outline" onClick={() => handleStatus(selected.id, "rejected")}><X className="size-4 mr-1"/>拒绝</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent><DialogHeader><DialogTitle><Sparkles className="size-5 inline mr-2"/>生成故事板图片</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-[13px] font-medium">绘图提示词</label>
              <textarea className="w-full h-28 rounded-lg border px-3 py-2 text-sm resize-none bg-[var(--color-background)] mt-1" placeholder="描述你想要的画面，如：A cinematic shot of futuristic AI office with holographic displays, blue lighting, photorealistic, 4K" value={prompt} onChange={e => setPrompt(e.target.value)} />
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
                      <Upload className="size-5 text-zinc-400"/><span className="text-[13px] text-zinc-500">{refFile ? refFile.name : "点击上传参考图片 (JPG/PNG ≤10MB)"}</span>
                    </div>
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setRefFile(f); }} />
                  </label>
                  {refFile && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">{(refFile.size/1024).toFixed(0)}KB</span>
                      <Button size="sm" variant="outline" onClick={handleUploadRef} disabled={uploading} className="h-7 text-xs">{uploading ? <><Loader2 className="size-3 animate-spin mr-1"/>上传中</> : "上传"}</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button><Button onClick={handleGenerate} disabled={generating || !prompt}>{generating ? <><Loader2 className="size-4 animate-spin mr-2"/>生成中...</> : <><Sparkles className="size-4 mr-2"/>GPT-Image-2 生成</>}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
