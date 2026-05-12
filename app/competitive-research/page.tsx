"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate, formatNumber } from "@/lib/utils";
import type { CompetitiveResearch } from "@/types";
import {
  Search,
  Plus,
  Eye,
  Trash2,
  TrendingUp,
  ExternalLink,
  FileText,
  ThumbsUp,
  Play,
  Heart,
  Share2,
  Loader2,
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
    } catch {
      // keep current data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = data.filter(
    (item) =>
      item.keyword.includes(search) ||
      item.industry.includes(search) ||
      item.competitorName.includes(search)
  );

  const handleDelete = async (id: string) => {
    await fetch(`/api/competitive-research?id=${id}`, { method: "DELETE" });
    setData(data.filter((d) => d.id !== id));
  };

  const handleAdd = async () => {
    if (!newUrl) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/competitive-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl }),
      });
      const json = await res.json();
      if (json.success) {
        setData([json.data, ...data]);
        setShowAdd(false);
        setNewUrl("");
      } else {
        setError(json.error || "分析失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">竞品调研列表</h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            输入竞品视频链接，AI自动分析行业趋势与爆款卖点
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="size-4" />
          新建调研
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "调研总数", value: data.length, icon: Search, color: "text-indigo-600", bg: "bg-indigo-100" },
          { label: "覆盖行业", value: new Set(data.map((d) => d.industry)).size, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "总观看量", value: formatNumber(data.reduce((s, d) => s + d.views, 0)), icon: Play, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "总互动量", value: formatNumber(data.reduce((s, d) => s + d.likes + d.shares, 0)), icon: ThumbsUp, color: "text-orange-600", bg: "bg-orange-100" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className={`size-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`size-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-muted-foreground)]" />
        <Input
          placeholder="搜索关键词、行业或竞品名称..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-[var(--color-muted-foreground)]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="size-10 text-[var(--color-muted-foreground)] mx-auto mb-3" />
              <p className="text-sm text-[var(--color-muted-foreground)]">
                {data.length === 0 ? "暂无调研数据，点击「新建调研」开始分析竞品" : "没有匹配的记录"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-[var(--color-muted)]/50">
                    <th className="text-left p-3 text-xs font-medium text-[var(--color-muted-foreground)]">ID</th>
                    <th className="text-left p-3 text-xs font-medium">竞品名称</th>
                    <th className="text-left p-3 text-xs font-medium">关键词</th>
                    <th className="text-left p-3 text-xs font-medium">行业</th>
                    <th className="text-right p-3 text-xs font-medium">播放</th>
                    <th className="text-right p-3 text-xs font-medium">互动</th>
                    <th className="text-left p-3 text-xs font-medium">创建人</th>
                    <th className="text-left p-3 text-xs font-medium">时间</th>
                    <th className="text-center p-3 text-xs font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-[var(--color-muted)]/30 transition-colors">
                      <td className="p-3 text-sm font-mono">{item.id}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{item.competitorName}</span>
                          <a href={item.competitorLink} target="_blank" rel="noopener" className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]">
                            <ExternalLink className="size-3" />
                          </a>
                        </div>
                      </td>
                      <td className="p-3"><Badge variant="outline" className="text-xs">{item.keyword}</Badge></td>
                      <td className="p-3 text-sm">{item.industry}</td>
                      <td className="p-3 text-sm text-right">{formatNumber(item.views)}</td>
                      <td className="p-3 text-sm text-right">{formatNumber(item.likes + item.shares)}</td>
                      <td className="p-3 text-sm">{item.creator}</td>
                      <td className="p-3 text-sm text-[var(--color-muted-foreground)] whitespace-nowrap">{formatDate(item.createdAt)}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => { setSelected(item); setShowDetail(true); }}>
                            <Eye className="size-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="size-4 text-[var(--color-destructive)]" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileText className="size-5" />调研报告详情</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-[var(--color-muted-foreground)]">竞品名称</p><p className="font-medium">{selected.competitorName}</p></div>
                <div><p className="text-xs text-[var(--color-muted-foreground)]">关键词/行业</p><p className="font-medium">{selected.keyword} / {selected.industry}</p></div>
                <div><p className="text-xs text-[var(--color-muted-foreground)]">创建人</p><p className="font-medium">{selected.creator}</p></div>
                <div><p className="text-xs text-[var(--color-muted-foreground)]">创建时间</p><p className="font-medium">{formatDate(selected.createdAt)}</p></div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: ThumbsUp, label: "点赞", value: formatNumber(selected.likes) },
                  { icon: Play, label: "播放", value: formatNumber(selected.views) },
                  { icon: Heart, label: "收藏", value: formatNumber(selected.favorites) },
                  { icon: Share2, label: "转发", value: formatNumber(selected.shares) },
                ].map((s) => (
                  <Card key={s.label}><CardContent className="p-3 text-center">
                    <s.icon className="size-4 mx-auto mb-1 text-[var(--color-muted-foreground)]" />
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-xs text-[var(--color-muted-foreground)]">{s.label}</p>
                  </CardContent></Card>
                ))}
              </div>
              <div><p className="text-sm font-medium mb-2">卖点分析</p>
                <div className="bg-[var(--color-muted)] rounded-lg p-3 text-sm whitespace-pre-wrap">{selected.sellingPoints}</div>
              </div>
              <div><p className="text-sm font-medium mb-2">调研结论</p>
                <div className="bg-[var(--color-accent)] border border-emerald-200 rounded-lg p-3 text-sm">{selected.conclusion}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>新建竞品调研</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">竞品视频链接</label>
              <Input
                placeholder="https://example.com/video"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                输入竞品视频或产品链接，AI将自动抓取并分析
              </p>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button>
            <Button onClick={handleAdd} disabled={adding || !newUrl}>
              {adding ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              {adding ? "分析中..." : "开始分析"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
