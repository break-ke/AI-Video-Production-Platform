"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatNumber } from "@/lib/utils";
import type { CompetitiveResearch } from "@/types";
import {
  Search, Plus, Eye, Trash2, TrendingUp, ExternalLink, FileText,
  ThumbsUp, Play, Heart, Share2, Loader2, Sparkles, Film, Clock,
  Target, Camera, Volume2, MessageCircle, Lightbulb, Zap,
  ChevronRight, Hash,
} from "lucide-react";

export default function CompetitiveResearchPage() {
  const [data, setData] = useState<CompetitiveResearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CompetitiveResearch | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/competitive-research");
      const json = await res.json();
      if (json.success) setData(json.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = data.filter(
    (item) =>
      item.keyword.includes(search) ||
      item.industry.includes(search) ||
      item.competitorName.includes(search) ||
      (item.hotKeywords || []).some((k) => k.includes(search))
  );

  const handleDelete = async (id: string) => {
    await fetch(`/api/competitive-research?id=${id}`, { method: "DELETE" });
    setData(data.filter((d) => d.id !== id));
  };

  const handleAdd = async () => {
    if (!newUrl) return;
    setAdding(true); setError("");
    try {
      const res = await fetch("/api/competitive-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl }),
      });
      const json = await res.json();
      if (json.success) {
        setData([json.data, ...data]);
        setShowAdd(false); setNewUrl("");
      } else { setError(json.error || "分析失败"); }
    } catch { setError("网络错误，请重试"); }
    finally { setAdding(false); }
  };

  const intentColor = (intent: string) => {
    if (intent.includes("钩子")) return "bg-red-100 text-red-700";
    if (intent.includes("塑品") || intent.includes("卖点")) return "bg-blue-100 text-blue-700";
    if (intent.includes("信任")) return "bg-emerald-100 text-emerald-700";
    if (intent.includes("引导")) return "bg-orange-100 text-orange-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">竞品调研列表</h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            AI深度分析竞品视频：卖点关键词→爆款视频→分镜拆解→脚本优化
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="size-4" />新建深度调研</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "调研总数", value: data.length, icon: Search, c: "text-indigo-600", bg: "bg-indigo-100" },
          { label: "覆盖行业", value: new Set(data.map((d) => d.industry)).size, icon: TrendingUp, c: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "分析视频", value: data.reduce((s, d) => s + (d.viralVideos?.length || 0), 0), icon: Film, c: "text-blue-600", bg: "bg-blue-100" },
          { label: "总观看量", value: formatNumber(data.reduce((s, d) => s + d.views, 0)), icon: Play, c: "text-orange-600", bg: "bg-orange-100" },
        ].map((stat) => (
          <Card key={stat.label}><CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className={`size-9 rounded-lg ${stat.bg} flex items-center justify-center`}><stat.icon className={`size-4 ${stat.c}`} /></div>
              <div><p className="text-lg font-bold">{stat.value}</p><p className="text-xs text-[var(--color-muted-foreground)]">{stat.label}</p></div>
            </div>
          </CardContent></Card>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-muted-foreground)]" />
        <Input placeholder="搜索关键词、行业、竞品名称..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card><CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-[var(--color-muted-foreground)]" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="size-10 text-[var(--color-muted-foreground)] mx-auto mb-3" />
            <p className="text-sm text-[var(--color-muted-foreground)]">{data.length === 0 ? "暂无调研数据，点击「新建深度调研」开始分析" : "没有匹配的记录"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b bg-[var(--color-muted)]/50">
                <th className="text-left p-3 text-xs font-medium">ID</th><th className="text-left p-3 text-xs font-medium">竞品名称</th><th className="text-left p-3 text-xs font-medium">关键词</th><th className="text-left p-3 text-xs font-medium">行业</th><th className="text-left p-3 text-xs font-medium">爆款视频</th><th className="text-right p-3 text-xs font-medium">总播放</th><th className="text-left p-3 text-xs font-medium">创建人</th><th className="text-left p-3 text-xs font-medium">时间</th><th className="text-center p-3 text-xs font-medium">操作</th>
              </tr></thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-[var(--color-muted)]/30 transition-colors">
                    <td className="p-3 text-sm font-mono">{item.id}</td>
                    <td className="p-3"><div className="flex items-center gap-2"><span className="text-sm font-medium">{item.competitorName}</span>
                      <a href={item.competitorLink} target="_blank" rel="noopener"><ExternalLink className="size-3 text-[var(--color-muted-foreground)]" /></a></div></td>
                    <td className="p-3"><div className="flex flex-wrap gap-1">{(item.hotKeywords || [item.keyword]).slice(0, 2).map((k) => <Badge key={k} variant="outline" className="text-xs">{k}</Badge>)}</div></td>
                    <td className="p-3 text-sm">{item.industry}</td>
                    <td className="p-3 text-sm">{item.viralVideos?.length || 0} 个</td>
                    <td className="p-3 text-sm text-right">{formatNumber(item.views)}</td>
                    <td className="p-3 text-sm">{item.creator}</td>
                    <td className="p-3 text-sm whitespace-nowrap">{formatDate(item.createdAt)}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setSelected(item); setShowDetail(true); }}><Eye className="size-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="size-4 text-[var(--color-destructive)]" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent></Card>

      {/* Detail Dialog — full breakdown */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="size-5" />深度调研报告 · {selected?.competitorName}
          </DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-6">
              {/* Meta row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: Hash, label: "关键词", value: selected.keyword },
                  { icon: TrendingUp, label: "行业", value: selected.industry },
                  { icon: Eye, label: "总观看", value: formatNumber(selected.views) },
                  { icon: ThumbsUp, label: "总互动", value: formatNumber(selected.likes + selected.shares) },
                ].map((m) => (
                  <Card key={m.label}><CardContent className="p-3 text-center">
                    <m.icon className="size-4 mx-auto mb-1 text-[var(--color-muted-foreground)]" />
                    <p className="font-semibold text-sm">{m.value}</p><p className="text-xs text-[var(--color-muted-foreground)]">{m.label}</p>
                  </CardContent></Card>
                ))}
              </div>

              {/* Tabs for deep analysis sections */}
              <Tabs defaultValue="selling">
                <TabsList className="w-full justify-start overflow-x-auto">
                  <TabsTrigger value="selling"><Sparkles className="size-3 mr-1" />卖点分析</TabsTrigger>
                  <TabsTrigger value="viral"><Film className="size-3 mr-1" />爆款视频 ({selected.viralVideos?.length || 0})</TabsTrigger>
                  <TabsTrigger value="shots"><Camera className="size-3 mr-1" />分镜拆解</TabsTrigger>
                  <TabsTrigger value="script"><Lightbulb className="size-3 mr-1" />脚本优化</TabsTrigger>
                  <TabsTrigger value="summary"><FileText className="size-3 mr-1" />总结</TabsTrigger>
                </TabsList>

                {/* Tab 1: 卖点分析 */}
                <TabsContent value="selling" className="mt-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2"><Hash className="size-4 text-[var(--color-primary)]" />热门关键词</p>
                    <div className="flex flex-wrap gap-2">
                      {(selected.hotKeywords || []).map((k) => <Badge key={k} className="text-sm px-3 py-1">{k}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2"><Sparkles className="size-4 text-[var(--color-primary)]" />产品卖点分析</p>
                    <div className="bg-[var(--color-muted)] rounded-lg p-4 text-sm whitespace-pre-wrap">
                      {selected.sellingPointsAnalysis || selected.sellingPoints}
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 2: 爆款视频 */}
                <TabsContent value="viral" className="mt-4 space-y-4">
                  {selected.viralVideos?.map((video, vi) => (
                    <Card key={video.id}>
                      <CardHeader className="pb-2"><div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <span className="size-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-bold">{vi + 1}</span>
                          {video.title}
                        </CardTitle>
                        <Badge variant="outline">{video.platform}</Badge>
                      </div></CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-3 mb-4">
                          {[
                            { icon: Play, label: "播放", value: formatNumber(video.views) },
                            { icon: ThumbsUp, label: "点赞", value: formatNumber(video.likes) },
                            { icon: MessageCircle, label: "评论", value: formatNumber(video.comments) },
                            { icon: Share2, label: "转发", value: formatNumber(video.shares) },
                          ].map((s) => (
                            <div key={s.label} className="text-center p-2 bg-[var(--color-muted)] rounded-lg">
                              <s.icon className="size-3 mx-auto mb-1 text-[var(--color-muted-foreground)]" />
                              <p className="font-bold text-sm">{s.value}</p><p className="text-[10px] text-[var(--color-muted-foreground)]">{s.label}</p>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2"><Badge className="bg-red-100 text-red-700 text-xs mt-0.5 shrink-0">开头钩子</Badge><p className="text-sm">{video.hookDescription}</p></div>
                          <div className="flex items-start gap-2"><Badge className="bg-blue-100 text-blue-700 text-xs mt-0.5 shrink-0">塑品卖点</Badge><p className="text-sm">{video.sellingPointDescription}</p></div>
                          <div className="flex items-start gap-2"><Badge className="bg-orange-100 text-orange-700 text-xs mt-0.5 shrink-0">下单引导</Badge><p className="text-sm">{video.closingDescription}</p></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Tab 3: 分镜拆解 */}
                <TabsContent value="shots" className="mt-4 space-y-6">
                  {selected.viralVideos?.map((video, vi) => (
                    <div key={video.id}>
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Film className="size-4 text-[var(--color-primary)]" />
                        视频{vi + 1}：{video.title}
                        <Badge variant="outline" className="text-xs">{video.structureType}</Badge>
                        <span className="text-xs text-[var(--color-muted-foreground)]">总{video.duration}s</span>
                      </p>
                      <div className="space-y-2">
                        {video.shots?.map((shot, si) => (
                          <Card key={si} className="border-l-4"
                            style={{ borderLeftColor: shot.intent?.includes("钩子") ? "#ef4444" : shot.intent?.includes("卖点") ? "#3b82f6" : shot.intent?.includes("信任") ? "#22c55e" : "#f97316" }}>
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-mono text-xs font-bold bg-[var(--color-muted)] px-2 py-0.5 rounded">{shot.timeRange}</span>
                                <Badge className={`text-xs ${intentColor(shot.intent)}`}>{shot.intent}</Badge>
                                <Badge variant="outline" className="text-xs"><Camera className="size-3 mr-1" />{shot.shotType}</Badge>
                                <Badge variant="outline" className="text-xs">{shot.cameraMovement}</Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div className="flex items-start gap-1"><Eye className="size-3 mt-0.5 text-[var(--color-muted-foreground)]" /><span><strong>画面：</strong>{shot.visualDescription}</span></div>
                                <div className="flex items-start gap-1"><Target className="size-3 mt-0.5 text-[var(--color-muted-foreground)]" /><span><strong>人群：</strong>{shot.targetAudience}</span></div>
                                <div className="flex items-start gap-1"><Zap className="size-3 mt-0.5 text-[var(--color-muted-foreground)]" /><span><strong>动作：</strong>{shot.characterAction}</span></div>
                                <div className="flex items-start gap-1"><Volume2 className="size-3 mt-0.5 text-[var(--color-muted-foreground)]" /><span><strong>音频：</strong>{shot.audioType}</span></div>
                              </div>
                              {shot.textOverlay && (
                                <div className="mt-2 bg-[var(--color-muted)] rounded px-2 py-1 text-sm">
                                  <span className="text-xs text-[var(--color-muted-foreground)]">字幕/花字：</span>{shot.textOverlay}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div>
                    <p className="text-sm font-medium mb-2">结构总结</p>
                    <div className="bg-[var(--color-accent)] border border-emerald-200 rounded-lg p-3 text-sm">{selected.structureSummary}</div>
                  </div>
                </TabsContent>

                {/* Tab 4: 脚本优化 */}
                <TabsContent value="script" className="mt-4 space-y-3">
                  {selected.scriptOptimization && (
                    <>
                      <div className="grid md:grid-cols-2 gap-3">
                        <Card className="border-emerald-200 bg-emerald-50/50">
                          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ThumbsUp className="size-4 text-emerald-600" />值得学习</CardTitle></CardHeader>
                          <CardContent>
                            <ul className="space-y-1">
                              {selected.scriptOptimization.strengthsToLearn.map((s, i) => (
                                <li key={i} className="text-sm flex items-start gap-2"><ChevronRight className="size-3 mt-1 text-emerald-500 shrink-0" />{s}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                        <Card className="border-orange-200 bg-orange-50/50">
                          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="size-4 text-orange-600" />优化方向</CardTitle></CardHeader>
                          <CardContent>
                            <ul className="space-y-1">
                              {selected.scriptOptimization.weaknessesToImprove.map((s, i) => (
                                <li key={i} className="text-sm flex items-start gap-2"><ChevronRight className="size-3 mt-1 text-orange-500 shrink-0" />{s}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2 flex items-center gap-2"><Lightbulb className="size-4 text-yellow-500" />建议关键词</p>
                        <div className="flex flex-wrap gap-2">
                          {selected.scriptOptimization.keywordSuggestions.map((k) => <Badge key={k} variant="secondary">{k}</Badge>)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2 flex items-center gap-2"><FileText className="size-4 text-[var(--color-primary)]" />优化后建议脚本</p>
                        <div className="bg-[var(--color-muted)] rounded-lg p-4 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                          {selected.scriptOptimization.suggestedScript}
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* Tab 5: 总结 */}
                <TabsContent value="summary" className="mt-4">
                  <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                    <CardContent className="p-6">
                      <p className="text-sm font-medium mb-3 flex items-center gap-2"><FileText className="size-5 text-indigo-600" />分析结论</p>
                      <p className="text-sm leading-relaxed">{selected.conclusion}</p>
                      <div className="mt-4 text-xs text-[var(--color-muted-foreground)]">
                        报告生成：{formatDate(selected.createdAt)} · {selected.creator}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Sparkles className="size-5" />新建深度调研</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">竞品视频链接</label>
              <Input placeholder="https://example.com/video" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
              <p className="text-xs text-[var(--color-muted-foreground)] mt-1">AI将抓取页面并进行4维度深度分析：卖点→爆款视频→分镜拆解→脚本优化（约30秒）</p>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button>
            <Button onClick={handleAdd} disabled={adding || !newUrl}>
              {adding ? <Loader2 className="size-4 animate-spin mr-2" /> : <Sparkles className="size-4 mr-2" />}
              {adding ? "深度分析中..." : "开始深度分析"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
