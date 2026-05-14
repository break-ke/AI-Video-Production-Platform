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
  Film, Check, X, Edit3, Eye, Plus, Grid3x3, List, Loader2, Sparkles,
  Camera, Palette, Volume2, Lightbulb, Tag,
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
  const [genTopic, setGenTopic] = useState("");
  const [genStyle, setGenStyle] = useState("chinese_commercial");
  const [generating, setGenerating] = useState(false);

  const fetchData = useCallback(async () => {
    try { const r = await fetch("/api/storyboard"); const j = await r.json(); if (j.success) setData(j.data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const confirmed = data.filter((s) => s.status === "confirmed").length;

  const handleGenerate = async () => {
    if (!genTopic) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/storyboard", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: genTopic, style: genStyle }),
      });
      const json = await res.json();
      if (json.success) { setData([json.data, ...data]); setShowAdd(false); setGenTopic(""); }
    } finally { setGenerating(false); }
  };

  const handleStatus = async (id: string, status: "confirmed" | "rejected") => {
    setData(data.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  return (
    <div className="space-y-6 max-w-[1440px]">
      <div className="flex items-center justify-between">
        <div><h1 className="text-[22px] font-semibold tracking-tight">故事板生成</h1><p className="text-[13px] text-zinc-500 mt-0.5">双模板参考：中国商业广告风格 / 电影感风格 · {confirmed}已确认</p></div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg p-0.5"><Button variant={viewMode==="grid"?"secondary":"ghost"} size="sm" onClick={()=>setViewMode("grid")}><Grid3x3 className="size-4"/></Button><Button variant={viewMode==="list"?"secondary":"ghost"} size="sm" onClick={()=>setViewMode("list")}><List className="size-4"/></Button></div>
          <Button className="gap-2" onClick={()=>setShowAdd(true)}><Plus className="size-4"/>生成故事板</Button>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="size-5 animate-spin text-zinc-400"/></div>
      : data.length===0 ? <div className="text-center py-16"><Film className="size-10 text-zinc-300 mx-auto mb-3"/><p className="text-sm text-zinc-500">暂无故事板，点击生成开始</p></div>
      : viewMode==="grid" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map(item => (
            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-zinc-100 relative overflow-hidden group">
                <img src={item.imageUrl||item.frames?.[0]?.imageUrl} alt="" className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100" onClick={()=>{setSelected(item);setShowDetail(true);}}><Eye className="size-3 mr-1"/>查看详情</Button>
                </div>
                <div className="absolute top-2 right-2"><span className={`px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_MAP[item.status]?.color}`}>{STATUS_MAP[item.status]?.label}</span></div>
                <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded text-xs">{item.frames?.length||item.frameNumber||0} 个分镜</div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">{item.title||item.imageDescription}</p>
                {item.styleConfig && <div className="flex flex-wrap gap-1 mt-1">{item.styleConfig.styleTags?.slice(0,3).map(t=><Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}</div>}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-zinc-500">{item.id}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="size-8 p-0" onClick={()=>handleStatus(item.id,"confirmed")}><Check className="size-4 text-emerald-500"/></Button>
                    <Button size="sm" variant="ghost" className="size-8 p-0" onClick={()=>handleStatus(item.id,"rejected")}><X className="size-4 text-red-500"/></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card><CardContent className="p-0 overflow-x-auto"><table className="w-full"><thead><tr className="border-b bg-zinc-50"><th className="text-left p-3 text-xs">ID</th><th className="text-left p-3 text-xs">标题</th><th className="text-left p-3 text-xs">模板</th><th className="text-center p-3 text-xs">分镜</th><th className="text-center p-3 text-xs">状态</th><th className="text-left p-3 text-xs">时间</th></tr></thead><tbody>{data.map(item=>(<tr key={item.id} className="border-b hover:bg-zinc-50/50 cursor-pointer" onClick={()=>{setSelected(item);setShowDetail(true);}}><td className="p-3 text-sm font-mono">{item.id}</td><td className="p-3 text-sm font-medium">{item.title||item.imageDescription}</td><td className="p-3"><Badge variant="outline" className="text-xs">{item.templateType==="cinematic"?"电影感":"中国商业广告"}</Badge></td><td className="p-3 text-center text-sm">{item.frames?.length||0}</td><td className="p-3 text-center"><Badge className={`text-xs ${STATUS_MAP[item.status]?.color}`}>{STATUS_MAP[item.status]?.label}</Badge></td><td className="p-3 text-sm text-zinc-500">{formatDate(item.createdAt)}</td></tr>))}</tbody></table></CardContent></Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-5xl max-h-[88vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-lg flex items-center gap-2"><Film className="size-5"/>{selected?.title||"故事板详情"}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-5">
              {/* Style Config */}
              {selected.styleConfig && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    {l:"风格",v:selected.styleConfig.styleTags?.join("、"),icon:Tag},
                    {l:"色彩",v:selected.styleConfig.colorPalette?.join("、"),icon:Palette},
                    {l:"光影",v:selected.styleConfig.lightingDesign,icon:Camera},
                    {l:"声音",v:selected.styleConfig.soundAtmosphere,icon:Volume2},
                    {l:"情绪",v:selected.styleConfig.emotionKeywords?.join("、"),icon:Lightbulb},
                  ].map(m=>(<Card key={m.l} className="shadow-card"><CardContent className="p-3 text-center"><m.icon className="size-4 mx-auto mb-1 text-zinc-400"/><p className="text-[11px] text-zinc-500 mb-0.5">{m.l}</p><p className="text-[12px] font-medium leading-tight">{m.v||"-"}</p></CardContent></Card>))}
                </div>
              )}

              {/* Frames */}
              <div className="space-y-3">
                <p className="text-sm font-semibold flex items-center gap-2"><Camera className="size-4"/>分镜列表 ({selected.frames?.length||0})</p>
                {selected.frames?.map((f,i)=>(
                  <Card key={i} className="shadow-card overflow-hidden">
                    <div className="flex">
                      <div className="w-[180px] shrink-0 bg-zinc-100">
                        <img src={f.imageUrl||`https://picsum.photos/seed/${selected.id}_${i}/400/300`} alt="" className="w-full h-full object-cover"/>
                      </div>
                      <CardContent className="p-4 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm font-bold">{f.timeRange}</span>
                          <Badge variant="outline" className="text-[10px]">{f.shotSize}</Badge>
                          <Badge variant="outline" className="text-[10px]">{f.cameraMovement}</Badge>
                          <span className="ml-auto text-yellow-500">{"★".repeat(f.status==="confirmed"?5:f.status==="pending"?3:1)}</span>
                        </div>
                        <p className="text-[13px] mb-1.5"><span className="text-xs text-zinc-500">画面：</span>{f.visualContent}</p>
                        <p className="text-[13px] mb-1.5"><span className="text-xs text-zinc-500">字幕：</span>{f.subtitleText}</p>
                        <p className="text-[13px] mb-1.5"><span className="text-xs text-zinc-500">情绪：</span>{(f.emotionTags||[]).join("、")} | 声音：{f.soundDesign} | 转场：{f.transition}</p>
                        <p className="text-[12px] text-zinc-400 font-mono">Prompt: {f.imagePrompt}</p>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Photography Notes */}
              {selected.photographyNotes && <Card className="shadow-card border-l-[3px] border-l-[var(--color-primary)]"><CardContent className="p-4"><p className="text-sm font-semibold mb-2 flex items-center gap-2"><Camera className="size-4"/>摄影美术说明</p><p className="text-[13px] text-zinc-600">{selected.photographyNotes}</p></CardContent></Card>}
              {selected.emotionalArc && <Card className="shadow-card"><CardContent className="p-4"><p className="text-sm font-semibold mb-1 flex items-center gap-2"><Lightbulb className="size-4 text-yellow-500"/>情绪弧线</p><p className="text-[13px] text-zinc-600">{selected.emotionalArc}</p></CardContent></Card>}

              <div className="flex gap-2">
                <Button className="flex-1" variant="outline" onClick={()=>handleStatus(selected.id,"confirmed")}><Check className="size-4 mr-1"/>确认</Button>
                <Button className="flex-1" variant="outline"><Edit3 className="size-4 mr-1"/>修改</Button>
                <Button className="flex-1" variant="outline" onClick={()=>handleStatus(selected.id,"rejected")}><X className="size-4 mr-1"/>拒绝</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent><DialogHeader><DialogTitle><Sparkles className="size-5 inline mr-2"/>生成故事板</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-[13px] font-medium">故事板主题</label><Input placeholder="如：AI视频工具产品推广 / 千户苗寨人文风光" value={genTopic} onChange={e=>setGenTopic(e.target.value)}/></div>
            <div><label className="text-[13px] font-medium">模板风格</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button onClick={()=>setGenStyle("chinese_commercial")} className={`p-3 rounded-lg border-2 text-left transition-colors ${genStyle==="chinese_commercial"?"border-[var(--color-primary)] bg-blue-50":"border-zinc-200 hover:border-zinc-300"}`}>
                  <p className="text-sm font-medium">中国商业广告</p><p className="text-[11px] text-zinc-500">15秒 / 全程中文 / 色彩+光影+情绪标签</p>
                </button>
                <button onClick={()=>setGenStyle("cinematic")} className={`p-3 rounded-lg border-2 text-left transition-colors ${genStyle==="cinematic"?"border-[var(--color-primary)] bg-blue-50":"border-zinc-200 hover:border-zinc-300"}`}>
                  <p className="text-sm font-medium">电影感</p><p className="text-[11px] text-zinc-500">CAMERA/SOUND/TRANSITION/EMOTIONAL ARC</p>
                </button>
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={()=>setShowAdd(false)}>取消</Button><Button onClick={handleGenerate} disabled={generating||!genTopic}>{generating?<><Loader2 className="size-4 animate-spin mr-2"/>生成中...</>:<><Sparkles className="size-4 mr-2"/>AI生成故事板</>}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
