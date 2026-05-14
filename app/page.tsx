"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatNumber } from "@/lib/utils";
import Link from "next/link";
import {
  Search, Film, FileText, Clapperboard, Copy, ArrowUp, ArrowDown, TrendingUp,
  ChevronRight, Plus, Eye, Clock, Sparkles, BarChart3,
} from "lucide-react";

interface Stats {
  totalResearch: number; totalStoryboards: number; activeEditing: number; completedEditing: number;
  totalViews: number; feedbackCount: number; templateCount: number; scriptCount: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ totalResearch: 0, totalStoryboards: 0, activeEditing: 0, completedEditing: 0, totalViews: 0, feedbackCount: 0, templateCount: 0, scriptCount: 0 });
  const [recentItems, setRecentItems] = useState<{ id: string; type: string; title: string; time: string; status: string }[]>([]);

  const fetchStats = useCallback(async () => {
    try {
      const [cr, sb, fb, sv, et, tp] = await Promise.all([
        fetch("/api/competitive-research").then(r => r.json()),
        fetch("/api/storyboard").then(r => r.json()),
        fetch("/api/feedback").then(r => r.json()),
        fetch("/api/script-iteration").then(r => r.json()),
        fetch("/api/auto-editing").then(r => r.json()),
        fetch("/api/one-click-replicate").then(r => r.json()),
      ]);
      const cData = cr.data || []; const sData = sb.data || []; const fData = fb.data || [];
      const vData = sv.data || []; const eData = et.data || []; const tData = tp.data || [];

      setStats({
        totalResearch: cData.length, totalStoryboards: sData.length,
        activeEditing: eData.filter((t: { status: string }) => t.status !== "completed" && t.status !== "failed").length,
        completedEditing: eData.filter((t: { status: string }) => t.status === "completed").length,
        totalViews: cData.reduce((s: number, r: { views: number }) => s + (r.views || 0), 0),
        feedbackCount: fData.length, templateCount: tData.length, scriptCount: vData.length,
      });

      const all: { id: string; type: string; title: string; time: string; status: string }[] = [];
      cData.slice(0, 3).forEach((r: { id: string; createdAt: string; competitorName: string; keyword: string }) => all.push({ id: r.id, type: "research", title: `竞品分析 · ${r.competitorName}`, time: r.createdAt, status: r.keyword }));
      eData.slice(0, 3).forEach((t: { id: string; createdAt: string; scriptId: string; status: string }) => all.push({ id: t.id, type: "editing", title: `剪辑任务 · ${t.scriptId}`, time: t.createdAt, status: t.status }));
      fData.slice(0, 3).forEach((f: { id: string; createdAt: string; storyboardId: string; type: string }) => all.push({ id: f.id, type: "feedback", title: `用户反馈 · ${f.storyboardId}`, time: f.createdAt, status: f.type }));
      setRecentItems(all.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8));
    } catch { /* leave defaults */ }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const kpiCards = [
    { label: "竞品调研", value: stats.totalResearch, change: "+12%", up: true, icon: Search, color: "#165dff", bg: "#e8f0fe" },
    { label: "故事板", value: stats.totalStoryboards, change: "+8%", up: true, icon: Film, color: "#00b42a", bg: "#e8f7ed" },
    { label: "剪辑任务", value: stats.activeEditing, change: stats.completedEditing + "完成", up: true, icon: Clapperboard, color: "#ff7d00", bg: "#fff7e8" },
    { label: "模板资源", value: stats.templateCount, change: stats.scriptCount + "脚本", up: true, icon: Copy, color: "#722ed1", bg: "#f5e8ff" },
  ];

  return (
    <div className="space-y-6 max-w-[1440px]">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight">数据概览</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">AI视频内容生产协同平台 · 飞书生态</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><BarChart3 className="size-4 mr-1.5" />导出报表</Button>
          <Link href="/competitive-research"><Button size="sm"><Plus className="size-4 mr-1.5" />新建调研</Button></Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="shadow-card hover:shadow-card-hover transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="size-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: kpi.bg }}>
                  <kpi.icon className="size-5" style={{ color: kpi.color }} />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium" style={{ color: kpi.up ? "#00b42a" : "#f53f3f" }}>
                  {kpi.up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                  {kpi.change}
                </div>
              </div>
              <p className="text-[28px] font-semibold tracking-tight leading-none mb-1">{kpi.value}</p>
              <p className="text-sm text-[var(--color-muted-foreground)]">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-[15px] font-medium flex items-center gap-2"><Clock className="size-4 text-[var(--color-muted-foreground)]" />最近动态</h2>
              <Link href="/competitive-research" className="text-xs text-[var(--color-primary)] hover:underline">查看全部 <ChevronRight className="size-3 inline" /></Link>
            </div>
            <CardContent className="px-5 pb-5 pt-0">
              {recentItems.length === 0 ? (
                <p className="text-sm text-[var(--color-muted-foreground)] text-center py-8">系统运行正常，暂无新动态</p>
              ) : (
                <div className="space-y-1">
                  {recentItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--color-secondary)] transition-colors group cursor-pointer">
                      <div className="size-8 rounded-md bg-[var(--color-secondary)] flex items-center justify-center shrink-0">
                        {item.type === "research" && <Search className="size-4 text-[var(--color-primary)]" />}
                        {item.type === "editing" && <Clapperboard className="size-4 text-[var(--color-warning)]" />}
                        {item.type === "feedback" && <FileText className="size-4 text-[var(--color-success)]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{item.title}</p>
                        <p className="text-xs text-[var(--color-muted-foreground)]">{formatDate(item.time)}</p>
                      </div>
                      <Badge variant="outline" className="text-[11px] shrink-0">{item.status}</Badge>
                      <ChevronRight className="size-3.5 text-[var(--color-muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions + Progress */}
        <div className="space-y-4">
          {/* Workflow Progress */}
          <Card className="shadow-card">
            <div className="px-5 pt-5 pb-3">
              <h2 className="text-[15px] font-medium flex items-center gap-2"><TrendingUp className="size-4 text-[var(--color-muted-foreground)]" />流程进度</h2>
            </div>
            <CardContent className="px-5 pb-5 pt-0 space-y-3">
              {[
                { label: "竞品调研", count: stats.totalResearch, color: "#165dff", bg: "#e8f0fe" },
                { label: "故事板", count: stats.totalStoryboards, color: "#00b42a", bg: "#e8f7ed" },
                { label: "反馈记录", count: stats.feedbackCount, color: "#ff7d00", bg: "#fff7e8" },
                { label: "脚本版本", count: stats.scriptCount, color: "#722ed1", bg: "#f5e8ff" },
                { label: "剪辑任务", count: stats.completedEditing, color: "#14c9c9", bg: "#e8fffb" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-sm flex-1">{item.label}</span>
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-card">
            <div className="px-5 pt-5 pb-3">
              <h2 className="text-[15px] font-medium flex items-center gap-2"><Sparkles className="size-4 text-[var(--color-muted-foreground)]" />快捷操作</h2>
            </div>
            <CardContent className="px-5 pb-5 pt-0 space-y-2">
              {[
                { href: "/competitive-research", label: "新建竞品调研", icon: Search },
                { href: "/storyboard", label: "生成故事板", icon: Film },
                { href: "/auto-editing", label: "开始自动剪辑", icon: Clapperboard },
                { href: "/one-click-replicate", label: "使用模板复刻", icon: Copy },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <Button variant="secondary" className="w-full justify-start gap-2.5 h-10 text-sm font-normal">
                    <action.icon className="size-4 text-[var(--color-muted-foreground)]" />
                    {action.label}
                    <ChevronRight className="size-3.5 ml-auto text-[var(--color-muted-foreground)]" />
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
