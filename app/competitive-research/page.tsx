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
  Search, Plus, Eye, Trash2, ExternalLink, Loader2, Sparkles,
  TrendingUp, Target, Shield, Zap, Lightbulb, AlertTriangle,
  BarChart3, Users, Globe, DollarSign, Check, Minus, ChevronRight,
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
    try { const r = await fetch("/api/competitive-research"); const j = await r.json(); if (j.success) setData(j.data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = data.filter(d =>
    d.competitorName.toLowerCase().includes(search.toLowerCase()) ||
    d.industry.includes(search) ||
    d.productDescription?.includes(search)
  );

  const handleDelete = async (id: string) => {
    await fetch(`/api/competitive-research?id=${id}`, { method: "DELETE" });
    setData(d => d.filter(x => x.id !== id));
  };

  const handleAdd = async () => {
    if (!newUrl) return;
    setAdding(true); setError("");
    try {
      const r = await fetch("/api/competitive-research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: newUrl }) });
      const j = await r.json();
      if (j.success) { setData(d => [j.data, ...d]); setShowAdd(false); setNewUrl(""); }
      else setError(j.error);
    } catch { setError("网络错误"); }
    finally { setAdding(false); }
  };

  const featColor = (a: string) => a === "ours" ? "text-emerald-600" : a === "competitor" ? "text-orange-600" : "text-zinc-400";

  return (
    <div className="space-y-6 max-w-[1440px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">竞品调研</h1>
          <p className="text-[13px] text-[var(--color-muted-foreground)] mt-0.5">输入竞品链接，AI自动完成产品定位、功能对比、SWOT分析</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="h-9 text-[13px]"><Plus className="size-4 mr-1.5" />新建调研</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { l: "调研报告", v: data.length, icon: BarChart3 },
          { l: "直接竞品", v: data.filter(d => d.marketAnalysis?.competitorType === "直接竞争").length, icon: Target },
          { l: "覆盖行业", v: new Set(data.map(d => d.industry)).size, icon: Globe },
          { l: "行动建议", v: data.reduce((s, d) => s + (d.actionableRecommendations?.length || 0), 0), icon: Lightbulb },
        ].map(s => (
          <Card key={s.l} className="shadow-card"><CardContent className="p-4 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-zinc-100 flex items-center justify-center"><s.icon className="size-4 text-zinc-500" /></div>
            <div><p className="text-xl font-semibold tabular-nums">{s.v}</p><p className="text-xs text-[var(--color-muted-foreground)]">{s.l}</p></div>
          </CardContent></Card>
        ))}
      </div>

      {/* Search + List */}
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" /><Input placeholder="搜索竞品名称、行业或描述..." className="pl-9 h-9 text-[13px]" value={search} onChange={e => setSearch(e.target.value)} /></div>

      <Card className="shadow-card"><CardContent className="p-0">
        {loading ? <div className="flex justify-center py-20"><Loader2 className="size-5 animate-spin text-zinc-400" /></div>
        : filtered.length === 0 ? <div className="text-center py-16"><Search className="size-8 text-zinc-300 mx-auto mb-3" /><p className="text-[13px] text-[var(--color-muted-foreground)]">{data.length === 0 ? "点击「新建调研」开始分析竞品" : "无匹配结果"}</p></div>
        : <table className="w-full">
          <thead><tr className="border-b bg-zinc-50/50">
            <th className="text-left p-3 text-xs font-medium text-zinc-500">竞品</th><th className="text-left p-3 text-xs font-medium text-zinc-500">行业</th><th className="text-left p-3 text-xs font-medium text-zinc-500">价格区间</th><th className="text-left p-3 text-xs font-medium text-zinc-500">目标用户</th><th className="text-left p-3 text-xs font-medium text-zinc-500">竞争类型</th><th className="text-right p-3 text-xs font-medium text-zinc-500">时间</th><th className="text-center p-3 text-xs font-medium text-zinc-500 w-20">操作</th>
          </tr></thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b hover:bg-zinc-50/50 transition-colors">
                <td className="p-3"><div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium">{item.competitorName}</span>
                  <a href={item.competitorLink} target="_blank" rel="noopener"><ExternalLink className="size-3 text-zinc-400 hover:text-[var(--color-primary)]" /></a>
                </div></td>
                <td className="p-3 text-[13px]">{item.industry}</td>
                <td className="p-3 text-[13px]">{item.productPositioning?.priceRange || "-"}</td>
                <td className="p-3"><div className="flex flex-wrap gap-1">{(item.productPositioning?.targetUsers || []).slice(0, 2).map(u => <Badge key={u} variant="outline" className="text-[11px]">{u}</Badge>)}</div></td>
                <td className="p-3"><Badge variant="outline" className="text-[11px]">{item.marketAnalysis?.competitorType || "-"}</Badge></td>
                <td className="p-3 text-[13px] text-zinc-500 text-right whitespace-nowrap">{formatDate(item.createdAt)}</td>
                <td className="p-3"><div className="flex items-center justify-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => { setSelected(item); setShowDetail(true); }}><Eye className="size-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="size-4 text-[var(--color-destructive)]" /></Button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>}
      </CardContent></Card>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="size-5" />竞品分析报告 · {selected?.competitorName}
          </DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-5">
              {/* Product description */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
                <p className="text-[13px] leading-relaxed">{selected.productDescription}</p>
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><DollarSign className="size-3" />{selected.productPositioning?.priceRange}</span>
                  <span className="flex items-center gap-1"><Users className="size-3" />{(selected.productPositioning?.targetUsers || []).join("、")}</span>
                  <span className="flex items-center gap-1"><Globe className="size-3" />{(selected.marketAnalysis?.primaryRegions || []).join("、")}</span>
                </div>
              </div>

              <Tabs defaultValue="features">
                <TabsList className="w-full">
                  <TabsTrigger value="features" className="text-xs">功能对比</TabsTrigger>
                  <TabsTrigger value="market" className="text-xs">市场分析</TabsTrigger>
                  <TabsTrigger value="swot" className="text-xs">SWOT</TabsTrigger>
                  <TabsTrigger value="content" className="text-xs">内容策略</TabsTrigger>
                  <TabsTrigger value="actions" className="text-xs">行动建议</TabsTrigger>
                </TabsList>

                {/* Features comparison */}
                <TabsContent value="features" className="mt-4">
                  <Card className="shadow-card"><CardContent className="p-0">
                    <table className="w-full">
                      <thead><tr className="border-b bg-zinc-50">
                        <th className="text-left p-3 text-xs font-medium text-zinc-500 w-1/4">功能点</th>
                        <th className="text-left p-3 text-xs font-medium text-zinc-500 w-[30%]">{selected.competitorName}</th>
                        <th className="text-left p-3 text-xs font-medium text-zinc-500 w-[30%]">飞书AI视频平台</th>
                        <th className="text-center p-3 text-xs font-medium text-zinc-500 w-16">优势</th>
                      </tr></thead>
                      <tbody>
                        {(selected.features || []).map((f, i) => (
                          <tr key={i} className="border-b last:border-b-0">
                            <td className="p-3 text-[13px] font-medium">{f.feature}</td>
                            <td className="p-3 text-[13px] text-zinc-600">{f.competitor}</td>
                            <td className="p-3 text-[13px] text-zinc-600">{f.ours}</td>
                            <td className="p-3 text-center">
                              {f.advantage === "ours" ? <Check className="size-4 text-emerald-500 mx-auto" />
                              : f.advantage === "competitor" ? <Minus className="size-4 text-orange-500 mx-auto" />
                              : <span className="text-xs text-zinc-400">持平</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent></Card>
                </TabsContent>

                {/* Market + SWOT */}
                <TabsContent value="market" className="mt-4 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { l: "公司阶段", v: selected.marketAnalysis?.companySize, icon: TrendingUp },
                      { l: "增长趋势", v: selected.marketAnalysis?.growthTrend, icon: BarChart3 },
                      { l: "竞争类型", v: selected.marketAnalysis?.competitorType, icon: Target },
                    ].map(m => (
                      <Card key={m.l} className="shadow-card"><CardContent className="p-4 text-center">
                        <m.icon className="size-5 mx-auto mb-2 text-zinc-400" />
                        <p className="text-[13px] font-medium">{m.v || "-"}</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{m.l}</p>
                      </CardContent></Card>
                    ))}
                  </div>
                  <Card className="shadow-card"><CardContent className="p-4">
                    <p className="text-xs font-medium text-zinc-500 mb-1">核心卖点</p>
                    <p className="text-[13px]">{selected.productPositioning?.coreValueProp}</p>
                  </CardContent></Card>
                </TabsContent>

                {/* SWOT */}
                <TabsContent value="swot" className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="shadow-card border-emerald-100 bg-emerald-50/30"><CardContent className="p-4">
                      <p className="text-sm font-semibold flex items-center gap-1.5 mb-3"><Shield className="size-4 text-emerald-600" />竞品优势</p>
                      <ul className="space-y-1.5">{selected.swot?.strengths?.map((s, i) => <li key={i} className="text-[13px] flex items-start gap-1.5"><span className="text-emerald-500 mt-1">•</span>{s}</li>)}</ul>
                    </CardContent></Card>
                    <Card className="shadow-card border-orange-100 bg-orange-50/30"><CardContent className="p-4">
                      <p className="text-sm font-semibold flex items-center gap-1.5 mb-3"><AlertTriangle className="size-4 text-orange-500" />竞品劣势</p>
                      <ul className="space-y-1.5">{selected.swot?.weaknesses?.map((s, i) => <li key={i} className="text-[13px] flex items-start gap-1.5"><span className="text-orange-500 mt-1">•</span>{s}</li>)}</ul>
                    </CardContent></Card>
                    <Card className="shadow-card border-blue-100 bg-blue-50/30"><CardContent className="p-4">
                      <p className="text-sm font-semibold flex items-center gap-1.5 mb-3"><Zap className="size-4 text-blue-600" />我方机会</p>
                      <ul className="space-y-1.5">{selected.swot?.opportunities?.map((s, i) => <li key={i} className="text-[13px] flex items-start gap-1.5"><span className="text-blue-500 mt-1">•</span>{s}</li>)}</ul>
                    </CardContent></Card>
                    <Card className="shadow-card border-red-100 bg-red-50/30"><CardContent className="p-4">
                      <p className="text-sm font-semibold flex items-center gap-1.5 mb-3"><AlertTriangle className="size-4 text-red-500" />潜在威胁</p>
                      <ul className="space-y-1.5">{selected.swot?.threats?.map((s, i) => <li key={i} className="text-[13px] flex items-start gap-1.5"><span className="text-red-500 mt-1">•</span>{s}</li>)}</ul>
                    </CardContent></Card>
                  </div>
                </TabsContent>

                {/* Content Strategy */}
                <TabsContent value="content" className="mt-4">
                  <Card className="shadow-card"><CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { l: "主要平台", v: (selected.contentStrategy?.primaryPlatforms || []).join("、") },
                        { l: "内容类型", v: (selected.contentStrategy?.contentTypes || []).join("、") },
                        { l: "平均时长", v: selected.contentStrategy?.avgDuration },
                        { l: "发布频率", v: selected.contentStrategy?.postingFrequency },
                        { l: "互动水平", v: selected.contentStrategy?.engagementLevel === "高" ? "高互动" : selected.contentStrategy?.engagementLevel === "中" ? "中等互动" : "低互动" },
                        { l: "热门话题", v: (selected.contentStrategy?.topPerformingTopics || []).join("、") },
                      ].map(m => (
                        <div key={m.l} className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500 w-20 shrink-0">{m.l}</span>
                          <span className="text-[13px] font-medium">{m.v || "-"}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent></Card>
                </TabsContent>

                {/* Actionable Insights */}
                <TabsContent value="actions" className="mt-4 space-y-4">
                  <Card className="shadow-card border-indigo-100 bg-indigo-50/30"><CardContent className="p-4">
                    <p className="text-sm font-semibold flex items-center gap-1.5 mb-2"><Lightbulb className="size-4 text-indigo-600" />核心发现</p>
                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{selected.keyInsights}</p>
                  </CardContent></Card>
                  <Card className="shadow-card"><CardContent className="p-4">
                    <p className="text-sm font-semibold flex items-center gap-1.5 mb-3"><Zap className="size-4 text-[var(--color-primary)]" />可执行建议</p>
                    <ol className="space-y-2">{selected.actionableRecommendations?.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px]">
                        <span className="size-5 rounded-full bg-[var(--color-primary)] text-white text-[11px] flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
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

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle><Sparkles className="size-5 inline mr-2" />新建竞品调研</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-[13px] font-medium">竞品链接</label><Input placeholder="https://www.synthesia.io" value={newUrl} onChange={e => setNewUrl(e.target.value)} /></div>
            <p className="text-xs text-zinc-500">AI将抓取网页内容并从产品定位、功能、市场、SWOT维度生成分析报告</p>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button>
            <Button onClick={handleAdd} disabled={adding || !newUrl}>{adding ? <><Loader2 className="size-4 animate-spin mr-2" />分析中...</> : <><Sparkles className="size-4 mr-2" />开始深度分析</>}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
