"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatNumber } from "@/lib/utils";
import Link from "next/link";
import {
  Search, Film, FileText, Clapperboard, Copy, ArrowUpRight,
  ChevronRight, Plus, Clock, Sparkles,
} from "lucide-react";

interface Stats {
  totalResearch: number; totalStoryboards: number; activeEditing: number; completedEditing: number;
  feedbackCount: number; templateCount: number; scriptCount: number;
}
interface RecentItem {
  id: string; type: "research" | "editing" | "feedback"; title: string; time: string; status: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ totalResearch: 0, totalStoryboards: 0, activeEditing: 0, completedEditing: 0, feedbackCount: 0, templateCount: 0, scriptCount: 0 });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

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
      const c = cr.data || []; const s = sb.data || []; const f = fb.data || [];
      const v = sv.data || []; const e = et.data || []; const t = tp.data || [];

      setStats({
        totalResearch: c.length, totalStoryboards: s.length,
        activeEditing: e.filter((x: { status: string }) => x.status !== "completed" && x.status !== "failed").length,
        completedEditing: e.filter((x: { status: string }) => x.status === "completed").length,
        feedbackCount: f.length, templateCount: t.length, scriptCount: v.length,
      });

      const all: RecentItem[] = [];
      c.slice(0, 3).forEach((r: { id: string; createdAt: string; competitorName: string; keyword: string }) =>
        all.push({ id: r.id, type: "research", title: r.competitorName, time: r.createdAt, status: r.keyword }));
      e.slice(0, 3).forEach((x: { id: string; createdAt: string; scriptId: string; status: string }) =>
        all.push({ id: x.id, type: "editing", title: x.scriptId, time: x.createdAt, status: x.status }));
      f.slice(0, 3).forEach((x: { id: string; createdAt: string; storyboardId: string; type: string }) =>
        all.push({ id: x.id, type: "feedback", title: x.storyboardId, time: x.createdAt, status: x.type }));
      setRecentItems(all.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6));
    } catch { /* keep defaults */ }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const kpis = [
    { k: "竞品调研", v: stats.totalResearch, sub: "累计分析", icon: Search, color: "text-[#165dff]", bg: "bg-blue-50", dot: "bg-[#165dff]" },
    { k: "故事板", v: stats.totalStoryboards, sub: "生成分镜", icon: Film, color: "text-[#00b42a]", bg: "bg-emerald-50", dot: "bg-[#00b42a]" },
    { k: "剪辑任务", v: stats.activeEditing, sub: `${stats.completedEditing} 已完成`, icon: Clapperboard, color: "text-[#ff7d00]", bg: "bg-orange-50", dot: "bg-[#ff7d00]" },
    { k: "模板资源", v: stats.templateCount, sub: `${stats.scriptCount} 脚本`, icon: Copy, color: "text-[#722ed1]", bg: "bg-purple-50", dot: "bg-[#722ed1]" },
  ];

  const modules = [
    { label: "竞品调研", count: stats.totalResearch, color: "#165dff" },
    { label: "故事板", count: stats.totalStoryboards, color: "#00b42a" },
    { label: "反馈记录", count: stats.feedbackCount, color: "#ff7d00" },
    { label: "脚本版本", count: stats.scriptCount, color: "#722ed1" },
    { label: "已完成剪辑", count: stats.completedEditing, color: "#14c9c9" },
  ];

  const typeMeta: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    research: { icon: Search, color: "text-[#165dff]", bg: "bg-blue-50" },
    editing: { icon: Clapperboard, color: "text-[#ff7d00]", bg: "bg-orange-50" },
    feedback: { icon: FileText, color: "text-[#00b42a]", bg: "bg-emerald-50" },
  };

  return (
    <div className="space-y-6 max-w-[1440px]">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[var(--color-foreground)]">工作台</h1>
          <p className="text-[13px] text-[var(--color-muted-foreground)] mt-0.5">AI视频内容生产协同平台 · 飞书生态</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-[13px]"><Sparkles className="size-3.5 mr-1.5" />导出报表</Button>
          <Link href="/competitive-research"><Button size="sm" className="h-8 text-[13px]"><Plus className="size-3.5 mr-1.5" />新建调研</Button></Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.k} className="shadow-card hover:shadow-card-hover transition-shadow cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`size-11 rounded-xl ${kpi.bg} flex items-center justify-center shrink-0`}>
                <kpi.icon className={`size-5 ${kpi.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-semibold tabular-nums tracking-tight leading-none">{kpi.v}</p>
                <p className="text-[13px] text-[var(--color-foreground)] mt-1.5 font-medium">{kpi.k}</p>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">{kpi.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Activity feed */}
        <Card className="shadow-card lg:col-span-3">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h2 className="text-sm font-semibold flex items-center gap-2"><Clock className="size-4 text-[var(--color-muted-foreground)]" />最近动态</h2>
            <Link href="/competitive-research" className="text-xs text-[var(--color-primary)] hover:underline font-medium">全部 <ChevronRight className="size-3 inline" /></Link>
          </div>
          <CardContent className="px-5 pb-4 pt-1">
            {recentItems.length === 0 ? (
              <p className="text-[13px] text-[var(--color-muted-foreground)] text-center py-10">暂无动态</p>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {recentItems.map((item, i) => {
                  const tm = typeMeta[item.type] || typeMeta.research;
                  return (
                    <div key={i} className="flex items-center gap-3 py-2.5 group cursor-pointer hover:bg-[var(--color-secondary)] -mx-2 px-2 rounded-lg transition-colors">
                      <div className={`size-8 rounded-lg ${tm.bg} flex items-center justify-center shrink-0`}>
                        <tm.icon className={`size-3.5 ${tm.color}`} />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[13px] truncate font-medium">{item.title}</p>
                          <p className="text-[11px] text-[var(--color-muted-foreground)] mt-0.5">{formatDate(item.time)}</p>
                        </div>
                        <Badge variant="outline" className="text-[11px] font-normal shrink-0">{item.status}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Side panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Module progress */}
          <Card className="shadow-card">
            <div className="px-5 pt-4 pb-2">
              <h2 className="text-sm font-semibold">模块数据</h2>
            </div>
            <CardContent className="px-5 pb-4 pt-1 space-y-0">
              {modules.map((m) => (
                <div key={m.label} className="flex items-center gap-3 py-2.5 border-b border-[var(--color-border)] last:border-b-0">
                  <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                  <span className="text-[13px] text-[var(--color-foreground)] flex-1">{m.label}</span>
                  <span className="text-[13px] font-semibold tabular-nums">{m.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="shadow-card">
            <div className="px-5 pt-4 pb-2">
              <h2 className="text-sm font-semibold">快捷操作</h2>
            </div>
            <CardContent className="px-5 pb-4 pt-1 space-y-1">
              {[
                { href: "/competitive-research", label: "新建竞品调研", icon: Search },
                { href: "/storyboard", label: "生成故事板", icon: Film },
                { href: "/auto-editing", label: "开始自动剪辑", icon: Clapperboard },
                { href: "/one-click-replicate", label: "使用模板复刻", icon: Copy },
              ].map((a) => (
                <Link key={a.href} href={a.href}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-9 text-[13px] font-normal">
                    <a.icon className="size-4 text-[var(--color-muted-foreground)]" />
                    {a.label}
                    <ArrowUpRight className="size-3 ml-auto text-[var(--color-muted-foreground)]" />
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
