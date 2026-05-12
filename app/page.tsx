"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkflowPipeline } from "@/components/layout/workflow-pipeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockCompetitiveResearch } from "@/lib/mock/competitive-research";
import { mockStoryboards } from "@/lib/mock/storyboard";
import { mockFeedbacks } from "@/lib/mock/feedback";
import { mockScriptVersions } from "@/lib/mock/script-iteration";
import { mockModelAdaptations } from "@/lib/mock/model-adaptation";
import { mockEditingTasks } from "@/lib/mock/auto-editing";
import { mockTemplates } from "@/lib/mock/one-click-replicate";
import {
  Search,
  Film,
  FileText,
  Clapperboard,
  Copy,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useMemo } from "react";

export default function Dashboard() {
  const stats = useMemo(() => {
    const activeTasks = mockEditingTasks.filter((t) => t.status !== "completed" && t.status !== "failed").length;
    const completedTasks = mockEditingTasks.filter((t) => t.status === "completed").length;
    return {
      totalResearch: mockCompetitiveResearch.length,
      totalStoryboards: mockStoryboards.length,
      activeTasks,
      completedTasks,
      templates: mockTemplates.length,
      totalViews: mockCompetitiveResearch.reduce((s, r) => s + r.views, 0),
      totalLikes: mockCompetitiveResearch.reduce((s, r) => s + r.likes, 0),
    };
  }, []);

  const recentItems = useMemo(() => {
    const items = [
      ...mockCompetitiveResearch.map((r) => ({ ...r, type: "research" as const, date: r.createdAt })),
      ...mockScriptVersions.map((s) => ({ ...s, type: "script" as const, date: s.createdAt })),
      ...mockEditingTasks.map((e) => ({ ...e, type: "editing" as const, date: e.createdAt })),
    ];
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-muted-foreground)]">竞品调研</p>
                <p className="text-2xl font-bold">{stats.totalResearch}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">{stats.totalViews.toLocaleString()} 总观看</p>
              </div>
              <div className="size-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Search className="size-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-muted-foreground)]">故事板</p>
                <p className="text-2xl font-bold">{stats.totalStoryboards}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">{mockStoryboards.filter((s) => s.status === "confirmed").length} 已确认</p>
              </div>
              <div className="size-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Film className="size-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-muted-foreground)]">剪辑任务</p>
                <p className="text-2xl font-bold">{stats.activeTasks}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">{stats.completedTasks} 已完成</p>
              </div>
              <div className="size-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clapperboard className="size-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-muted-foreground)]">模板资源</p>
                <p className="text-2xl font-bold">{stats.templates}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">一键复刻可用</p>
              </div>
              <div className="size-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Copy className="size-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Pipeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="size-4" />
            生产流程总览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WorkflowPipeline />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="size-4" />
              最近动态
            </CardTitle>
            <Link href="/competitive-research" className="text-xs text-[var(--color-primary)] hover:underline">
              查看全部
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-secondary)] transition-colors">
                <div className="size-8 rounded-lg bg-[var(--color-muted)] flex items-center justify-center shrink-0">
                  {item.type === "research" && <Search className="size-4" />}
                  {item.type === "script" && <FileText className="size-4" />}
                  {item.type === "editing" && <Clapperboard className="size-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">
                    {item.type === "research" && `竞品调研 · ${(item as typeof mockCompetitiveResearch[0]).competitorName}`}
                    {item.type === "script" && `脚本版本 · ${(item as typeof mockScriptVersions[0]).version}`}
                    {item.type === "editing" && `剪辑任务 · ${(item as typeof mockEditingTasks[0]).scriptId}`}
                  </p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">{formatDate(item.date)}</p>
                </div>
                {"status" in item && (
                  <Badge variant="outline" className="text-xs">
                    {item.status}
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              快捷操作
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/competitive-research">
              <Button variant="outline" className="w-full justify-start gap-2 h-11">
                <Search className="size-4" />
                新建竞品调研
                <ArrowRight className="size-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/storyboard">
              <Button variant="outline" className="w-full justify-start gap-2 h-11">
                <Film className="size-4" />
                生成故事板
                <ArrowRight className="size-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/auto-editing">
              <Button variant="outline" className="w-full justify-start gap-2 h-11">
                <Clapperboard className="size-4" />
                开始自动剪辑
                <ArrowRight className="size-3 ml-auto" />
              </Button>
            </Link>
            <Link href="/one-click-replicate">
              <Button variant="outline" className="w-full justify-start gap-2 h-11">
                <Copy className="size-4" />
                使用模板复刻
                <ArrowRight className="size-3 ml-auto" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Alert Banner */}
      <Card className="bg-[var(--color-accent)] border-emerald-200">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="size-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-900">系统运行正常</p>
            <p className="text-xs text-emerald-700">所有模块运行正常，飞书生态连接稳定 · 最近更新: 10分钟前</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
