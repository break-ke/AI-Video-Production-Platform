"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import type { CompetitiveResearch } from "@/types";
import {
  Search, Plus, Eye, Trash2, ExternalLink, Loader2, Sparkles, ChevronRight,
  Film, Camera, EyeIcon, Brain, Activity, Target, Zap, Lightbulb, Star, TrendingUp, Clock,
} from "lucide-react";

export default function CompetitiveResearchPage() {
  const [data, setData] = useState<CompetitiveResearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [s, setS] = useState("");
  const [sel, setSel] = useState<CompetitiveResearch | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  const refresh = useCallback(async () => {
    try { const r = await fetch("/api/competitive-research"); const j = await r.json(); if (j.success) setData(j.data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const filtered = data.filter(d =>
    d.competitorName.toLowerCase().includes(s.toLowerCase()) ||
    d.industry.includes(s)
  );

  const handleDelete = async (id: string) => {
    await fetch(`/api/competitive-research?id=${id}`, { method: "DELETE" });
    setData(d => d.filter(x => x.id !== id));
  };

  const handleUpload = async () => {
    if (!videoFile) return;
    setUploading(true); setErr("");
    try {
      const form = new FormData();
      form.append("video", videoFile);
      const r = await fetch("/api/upload", { method: "POST", body: form });
      const j = await r.json();
      if (j.success) { setVideoUrl(j.data.videoUrl); setVideoFile(null); }
      else setErr(j.error);
    } catch { setErr("上传失败"); }
    finally { setUploading(false); }
  };

  const handleAdd = async () => {
    if (!url) return;
    setAdding(true); setErr("");
    try {
      const body: Record<string, string> = { url };
      if (videoUrl) body.videoUrl = videoUrl;
      const r = await fetch("/api/competitive-research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json();
      if (j.success) { setData(d => [j.data, ...d]); setShowAdd(false); setUrl(""); setVideoUrl(""); setVideoFile(null); }
      else setErr(j.error);
    } catch { setErr("网络错误"); }
    finally { setAdding(false); }
  };

  return (
    <div className="space-y-6 max-w-[1440px]">
      <div className="flex items-center justify-between">
        <div><h1 className="text-[22px] font-semibold tracking-tight">竞品视频调研</h1><p className="text-[13px] text-[var(--color-muted-foreground)] mt-0.5">TikTok商业广告导演视角 · 多维精细拆解 · 消费心理学分析</p></div>
        <Button onClick={() => setShowAdd(true)} className="h-9 text-[13px]"><Plus className="size-4 mr-1.5" />新建调研</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { l: "调研报告", v: data.length, icon: Film },
          { l: "分析镜头", v: data.reduce((x, d) => x + (d.shots?.length || 0), 0), icon: Camera },
          { l: "心理学武器", v: data.reduce((x, d) => x + (d.psychologyWeapons?.length || 0), 0), icon: Brain },
          { l: "复刻元素", v: data.reduce((x, d) => x + (d.replicableElements?.length || 0), 0), icon: Lightbulb },
        ].map(m => (
          <Card key={m.l} className="shadow-card"><CardContent className="p-4 flex items-center gap-3"><div className="size-9 rounded-lg bg-zinc-100 flex items-center justify-center"><m.icon className="size-4 text-zinc-500" /></div><div><p className="text-xl font-semibold tabular-nums">{m.v}</p><p className="text-xs text-zinc-500">{m.l}</p></div></CardContent></Card>
        ))}
      </div>

      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" /><Input placeholder="搜索竞品名称..." className="pl-9 h-9 text-[13px]" value={s} onChange={e => setS(e.target.value)} /></div>

      <Card className="shadow-card"><CardContent className="p-0">
        {loading ? <div className="flex justify-center py-20"><Loader2 className="size-5 animate-spin text-zinc-400" /></div>
        : filtered.length === 0 ? <div className="text-center py-16"><Search className="size-8 text-zinc-300 mx-auto mb-3" /><p className="text-[13px] text-zinc-500">{data.length === 0 ? "点击「新建调研」分析竞品视频" : "无匹配结果"}</p></div>
        : <table className="w-full">
          <thead><tr className="border-b bg-zinc-50/50">
            <th className="text-left p-3 text-xs font-medium text-zinc-500">竞品</th><th className="text-left p-3 text-xs font-medium text-zinc-500">行业</th><th className="text-left p-3 text-xs font-medium text-zinc-500">视频类型</th><th className="text-left p-3 text-xs font-medium text-zinc-500">钩子类型</th><th className="text-center p-3 text-xs font-medium text-zinc-500">分镜</th><th className="text-right p-3 text-xs font-medium text-zinc-500">时间</th><th className="text-center p-3 text-xs font-medium text-zinc-500 w-20">操作</th>
          </tr></thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b hover:bg-zinc-50/50 transition-colors">
                <td className="p-3"><div className="flex items-center gap-2"><span className="text-[13px] font-medium">{item.competitorName}</span><a href={item.competitorLink} target="_blank" rel="noopener"><ExternalLink className="size-3 text-zinc-400 hover:text-[var(--color-primary)]" /></a></div></td>
                <td className="p-3 text-[13px]">{item.industry}</td>
                <td className="p-3"><Badge variant="outline" className="text-[11px]">{item.basicInfo?.videoType || "-"}</Badge></td>
                <td className="p-3 text-[13px]">{item.basicInfo?.hookType || "-"}</td>
                <td className="p-3 text-center text-[13px] font-medium tabular-nums">{item.shots?.length || 0}</td>
                <td className="p-3 text-[13px] text-zinc-500 text-right whitespace-nowrap">{formatDate(item.createdAt)}</td>
                <td className="p-3"><div className="flex items-center justify-center gap-1"><Button variant="ghost" size="sm" onClick={() => { setSel(item); setShowDetail(true); }}><Eye className="size-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="size-4 text-[var(--color-destructive)]" /></Button></div></td>
              </tr>
            ))}
          </tbody>
        </table>}
      </CardContent></Card>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-6xl max-h-[88vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-lg flex items-center gap-2"><Film className="size-5" />竞品视频分析报告 · {sel?.competitorName}</DialogTitle></DialogHeader>
          {sel && (
            <div className="space-y-5">
              {/* Basic Info */}
              <div className="grid grid-cols-6 gap-3">
                {[
                  { l: "时长", v: sel.basicInfo?.duration, icon: Clock },
                  { l: "品类", v: sel.basicInfo?.category, icon: Target },
                  { l: "类型", v: sel.basicInfo?.videoType, icon: Film },
                  { l: "钩子", v: sel.basicInfo?.hookType, icon: Zap },
                  { l: "CTA", v: sel.basicInfo?.ctaType, icon: TrendingUp },
                  { l: "行业", v: sel.industry, icon: Target },
                ].map(m => (
                  <Card key={m.l} className="shadow-card"><CardContent className="p-3 text-center">
                    <m.icon className="size-4 mx-auto mb-1 text-zinc-400" />
                    <p className="text-sm font-semibold">{m.v || "-"}</p>
                    <p className="text-[11px] text-zinc-500">{m.l}</p>
                  </CardContent></Card>
                ))}
              </div>

              {/* Hook details */}
              {sel.basicInfo?.hookKeyElements && (
                <Card className="shadow-card border-l-[3px] border-l-[var(--color-destructive)]"><CardContent className="p-4">
                  <p className="text-xs font-medium text-zinc-500 mb-1">开场0.3秒画面关键元素</p>
                  <p className="text-[13px]">{sel.basicInfo.hookKeyElements}</p>
                </CardContent></Card>
              )}

              <Tabs defaultValue="shots">
                <TabsList className="w-full flex-wrap">
                  <TabsTrigger value="shots" className="text-xs"><Camera className="size-3 mr-1" />分镜拆解 ({sel.shots?.length || 0})</TabsTrigger>
                  <TabsTrigger value="psychology" className="text-xs"><Brain className="size-3 mr-1" />消费心理学</TabsTrigger>
                  <TabsTrigger value="rhythm" className="text-xs"><Activity className="size-3 mr-1" />节奏曲线</TabsTrigger>
                  <TabsTrigger value="insights" className="text-xs"><Lightbulb className="size-3 mr-1" />总结复刻</TabsTrigger>
                </TabsList>

                {/* Shots Table */}
                <TabsContent value="shots" className="mt-4">
                  <Card className="shadow-card"><CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-[12px]">
                      <thead><tr className="border-b bg-zinc-50">
                        <th className="p-2 text-center w-10">#</th><th className="p-2 text-left">时间</th><th className="p-2 text-left">时长</th><th className="p-2 text-center">景别</th><th className="p-2 text-left">运镜</th><th className="p-2 text-left">画面内容</th><th className="p-2 text-left">光线</th><th className="p-2 text-left">人物动作</th><th className="p-2 text-left">产品位置</th><th className="p-2 text-left">字幕</th><th className="p-2 text-left">节奏</th><th className="p-2 text-left w-32">消费心理学</th><th className="p-2 text-left w-40">黄金15帧</th><th className="p-2 text-center">复刻</th>
                      </tr></thead>
                      <tbody>
                        {sel.shots?.map((shot, i) => (
                          <tr key={i} className="border-b hover:bg-zinc-50/50 align-top">
                            <td className="p-2 text-center font-mono font-bold">{shot.shotNumber}</td>
                            <td className="p-2 font-mono whitespace-nowrap">{shot.timeCode}</td>
                            <td className="p-2 whitespace-nowrap">{shot.duration}</td>
                            <td className="p-2 text-center"><Badge variant="outline" className="text-[10px]">{shot.shotSize}</Badge></td>
                            <td className="p-2 text-zinc-600">{shot.cameraMovement}</td>
                            <td className="p-2 max-w-[200px]">{shot.visualContent}</td>
                            <td className="p-2 text-zinc-600 text-[11px]">{shot.lighting}</td>
                            <td className="p-2 text-zinc-600 text-[11px] max-w-[150px]">{shot.characterAction}</td>
                            <td className="p-2 text-zinc-600 text-[11px]">{shot.productPosition}</td>
                            <td className="p-2 text-zinc-600 text-[11px] max-w-[200px]">{shot.subtitle}</td>
                            <td className="p-2 text-zinc-600 text-[11px]">{shot.rhythm}</td>
                            <td className="p-2 text-[11px]">{shot.consumerPsychology}</td>
                            <td className="p-2 text-[11px]">{shot.golden15Frames}</td>
                            <td className="p-2 text-center">
                              <span className="text-yellow-500">{"★".repeat(Math.min(shot.replicabilityScore || 3, 5))}</span>
                              <p className="text-[10px] text-zinc-500 mt-0.5">{shot.replicationKey}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent></Card>
                </TabsContent>

                {/* Psychology */}
                <TabsContent value="psychology" className="mt-4 space-y-4">
                  <Card className="shadow-card"><CardContent className="p-4">
                    <p className="text-sm font-semibold mb-3 flex items-center gap-2"><Brain className="size-4 text-indigo-500" />消费心理学武器</p>
                    <div className="space-y-2">{sel.psychologyWeapons?.map((wp, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50">
                        <div className="size-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 font-bold text-sm text-indigo-600">{wp.intensity}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5"><span className="text-[13px] font-medium">{wp.name}</span><Badge variant="outline" className="text-[10px]">{wp.timeRange}</Badge>
                            <div className="flex gap-0.5 ml-auto">{Array.from({ length: 10 }).map((_, j) => <div key={j} className={`w-1.5 h-3 rounded-sm ${j < wp.intensity ? "bg-indigo-400" : "bg-zinc-200"}`} />)}</div>
                          </div>
                          <p className="text-[12px] text-zinc-500">{wp.description}</p>
                        </div>
                      </div>
                    ))}</div>
                  </CardContent></Card>

                  {/* Purchase decision path */}
                  <Card className="shadow-card"><CardContent className="p-4">
                    <p className="text-sm font-semibold mb-3 flex items-center gap-2"><Target className="size-4 text-emerald-500" />购买决策路径</p>
                    <div className="flex items-center gap-1">
                      {[
                        { key: "attention" as const, label: "注意", desc: sel.purchaseDecisionPath?.attention },
                        { key: "interest" as const, label: "兴趣", desc: sel.purchaseDecisionPath?.interest },
                        { key: "desire" as const, label: "渴望", desc: sel.purchaseDecisionPath?.desire },
                        { key: "trust" as const, label: "信任", desc: sel.purchaseDecisionPath?.trust },
                        { key: "action" as const, label: "行动", desc: sel.purchaseDecisionPath?.action },
                      ].map((p, i) => (
                        <div key={p.key} className="flex items-center flex-1">
                          <div className="flex-1 text-center">
                            <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-1 font-bold text-xs text-emerald-700">{p.label}</div>
                            <p className="text-[11px] text-zinc-500 leading-tight">{p.desc?.split("：")[0] || p.label}</p>
                          </div>
                          {i < 4 && <ChevronRight className="size-4 text-zinc-300 shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </CardContent></Card>
                </TabsContent>

                {/* Rhythm */}
                <TabsContent value="rhythm" className="mt-4 space-y-4">
                  <Card className="shadow-card"><CardContent className="p-4 overflow-x-auto">
                    <p className="text-sm font-semibold mb-3 flex items-center gap-2"><Activity className="size-4 text-orange-500" />节奏强度表</p>
                    <table className="w-full text-[13px]">
                      <thead><tr className="border-b"><th className="text-left p-2">时间段</th><th className="text-center p-2">视觉强度</th><th className="text-center p-2">情绪强度</th><th className="text-center p-2">信息密度</th><th className="text-left p-2">产品出现</th><th className="text-left p-2">节奏定位</th></tr></thead>
                      <tbody>{sel.rhythmIntensity?.map((r, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="p-2 font-mono">{r.timeRange}</td>
                          <td className="p-2 text-center"><span className="inline-flex gap-0.5">{[1,2,3,4,5].map(n => <div key={n} className={`w-3 h-3 rounded-sm ${n <= r.visualIntensity ? "bg-[var(--color-destructive)]" : "bg-zinc-100"}`} />)}</span></td>
                          <td className="p-2 text-center"><span className="inline-flex gap-0.5">{[1,2,3,4,5].map(n => <div key={n} className={`w-3 h-3 rounded-sm ${n <= r.emotionIntensity ? "bg-[var(--color-primary)]" : "bg-zinc-100"}`} />)}</span></td>
                          <td className="p-2 text-center"><span className="inline-flex gap-0.5">{[1,2,3,4,5].map(n => <div key={n} className={`w-3 h-3 rounded-sm ${n <= r.infoDensity ? "bg-[var(--color-warning)]" : "bg-zinc-100"}`} />)}</span></td>
                          <td className="p-2 text-zinc-600">{r.productAppearance}</td>
                          <td className="p-2">{r.rhythmPosition}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </CardContent></Card>

                  {/* Rhythm Curve Analysis */}
                  {sel.rhythmCurveAnalysis && (
                    <Card className="shadow-card"><CardContent className="p-4">
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2"><Activity className="size-4 text-orange-500" />节奏曲线分析</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { l: "曲线形态", v: sel.rhythmCurveAnalysis.curveShape },
                          { l: "波峰数量", v: `${sel.rhythmCurveAnalysis.peakCount}个` },
                          { l: "剪辑节奏", v: sel.rhythmCurveAnalysis.editingStats },
                          { l: "波峰引爆", v: (sel.rhythmCurveAnalysis.peakTriggers || []).join("；") },
                        ].map(m => (
                          <div key={m.l} className="flex items-start gap-2"><span className="text-xs text-zinc-500 w-20 shrink-0 mt-0.5">{m.l}</span><span className="text-[13px] font-medium">{m.v || "-"}</span></div>
                        ))}
                      </div>
                      {(sel.rhythmCurveAnalysis.valleyPoints || []).length > 0 && (
                        <div className="flex items-start gap-2 mt-2"><span className="text-xs text-zinc-500 w-20 shrink-0 mt-0.5">波谷位置</span><span className="text-[13px]">{sel.rhythmCurveAnalysis.valleyPoints.join("；")}</span></div>
                      )}
                    </CardContent></Card>
                  )}
                </TabsContent>

                {/* Summary & Replication */}
                <TabsContent value="insights" className="mt-4 space-y-4">
                  <Card className="shadow-card border-indigo-100 bg-indigo-50/30"><CardContent className="p-4">
                    <p className="text-sm font-semibold flex items-center gap-2 mb-2"><Lightbulb className="size-4 text-indigo-600" />总结</p>
                    <p className="text-[13px] leading-relaxed">{sel.summary}</p>
                  </CardContent></Card>

                  <Card className="shadow-card"><CardContent className="p-4">
                    <p className="text-sm font-semibold flex items-center gap-2 mb-3"><Star className="size-4 text-yellow-500" />可复制元素</p>
                    <ol className="space-y-2">{(sel.replicableElements || []).map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px]">
                        <span className="size-5 rounded-full bg-yellow-400 text-white text-[11px] flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
                        {r}
                      </li>
                    ))}</ol>
                  </CardContent></Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent><DialogHeader><DialogTitle><Sparkles className="size-5 inline mr-2" />新建竞品视频调研</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-[13px] font-medium">竞品链接</label><Input placeholder="输入竞品产品/视频链接" value={url} onChange={e => setUrl(e.target.value)} /></div>

            {/* Video upload section */}
            <div className="border-t pt-3">
              <label className="text-[13px] font-medium mb-2 block">上传视频（可选）</label>
              {videoUrl ? (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <Film className="size-4 text-emerald-600" />
                  <span className="text-[13px] text-emerald-700">视频已上传</span>
                  <button onClick={() => { setVideoUrl(""); setVideoFile(null); }} className="ml-auto text-xs text-red-500 hover:underline">移除</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-zinc-300 rounded-lg hover:border-[var(--color-primary)] hover:bg-blue-50/30 transition-colors">
                        <Film className="size-5 text-zinc-400" />
                        <span className="text-[13px] text-zinc-500">{videoFile ? videoFile.name : "点击选择视频文件 (MP4/MOV/WebM, ≤100MB)"}</span>
                      </div>
                      <input type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setVideoFile(f); }} />
                    </label>
                  </div>
                  {videoFile && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">{(videoFile.size / 1024 / 1024).toFixed(1)}MB</span>
                      <Button size="sm" variant="outline" onClick={handleUpload} disabled={uploading} className="h-7 text-xs">
                        {uploading ? <><Loader2 className="size-3 animate-spin mr-1" />上传中</> : "上传视频"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="text-xs text-zinc-500">Gemini 3.1 Pro 多模态分析：网页抓取 + 视频逐帧拆解 + 消费心理学 + 节奏分析</p>
            {err && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2">{err}</p>}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button><Button onClick={handleAdd} disabled={adding || !url}>{adding ? <><Loader2 className="size-4 animate-spin mr-2" />分析中...</> : <><Sparkles className="size-4 mr-2" />{videoUrl ? "视频+网页深度分析" : "网页分析"}</>}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
