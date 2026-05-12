"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockFeedbacks } from "@/lib/mock/feedback";
import { mockStoryboards } from "@/lib/mock/storyboard";
import { formatDate } from "@/lib/utils";
import {
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Sparkles,
  Lightbulb,
} from "lucide-react";

const statusMap: Record<string, { label: string; color: string }> = {
  confirm: { label: "确认", color: "bg-green-100 text-green-800" },
  modify: { label: "需修改", color: "bg-orange-100 text-orange-800" },
  reject: { label: "已拒绝", color: "bg-red-100 text-red-800" },
  high: { label: "高", color: "bg-red-100 text-red-800" },
  medium: { label: "中", color: "bg-yellow-100 text-yellow-800" },
  low: { label: "低", color: "bg-gray-100 text-gray-800" },
};

const typeIconMap: Record<string, React.ElementType> = {
  confirm: CheckCircle2,
  modify: AlertTriangle,
  reject: XCircle,
};

const priorityIconMap: Record<string, React.ElementType> = {
  high: ArrowUp,
  medium: ArrowRight,
  low: ArrowDown,
};

export default function FeedbackPage() {
  const [data, setData] = useState(mockFeedbacks);
  const [activeTab, setActiveTab] = useState("all");
  const [selected, setSelected] = useState<(typeof data)[0] | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const filtered = activeTab === "all" ? data : data.filter((f) => f.type === activeTab);

  const confirmCount = data.filter((f) => f.type === "confirm").length;
  const modifyCount = data.filter((f) => f.type === "modify").length;
  const rejectCount = data.filter((f) => f.type === "reject").length;

  const getStoryboard = (id: string) => mockStoryboards.find((s) => s.id === id);

  const getStatus = (key: string) => statusMap[key] ?? { label: key, color: "bg-gray-100 text-gray-800" };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">确认与反馈</h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            管理用户对故事板的反馈意见，识别修改意图与优先级
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "已确认", count: confirmCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "需修改", count: modifyCount, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-100" },
          { label: "已拒绝", count: rejectCount, icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className={`size-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`size-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-lg font-bold">{s.count}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">全部 ({data.length})</TabsTrigger>
              <TabsTrigger value="confirm">已确认 ({confirmCount})</TabsTrigger>
              <TabsTrigger value="modify">需修改 ({modifyCount})</TabsTrigger>
              <TabsTrigger value="reject">已拒绝 ({rejectCount})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.map((item) => {
            const TypeIcon = typeIconMap[item.type] ?? MessageSquare;
            const PriorityIcon = priorityIconMap[item.priority] ?? ArrowRight;
            const storyboard = getStoryboard(item.storyboardId);
            const typeStatus = getStatus(item.type);
            const priorityStatus = getStatus(item.priority);
            return (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 rounded-lg border hover:bg-[var(--color-muted)]/30 transition-colors cursor-pointer"
                onClick={() => { setSelected(item); setShowDetail(true); }}
              >
                <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${
                  item.type === "confirm" ? "bg-emerald-100" :
                  item.type === "modify" ? "bg-orange-100" : "bg-red-100"
                }`}>
                  <TypeIcon className={`size-5 ${
                    item.type === "confirm" ? "text-emerald-600" :
                    item.type === "modify" ? "text-orange-600" : "text-red-600"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{item.id}</span>
                    <Badge className={`text-xs ${typeStatus.color}`}>{typeStatus.label}</Badge>
                    <Badge variant="outline" className="text-xs gap-1">
                      <PriorityIcon className={`size-3 ${
                        item.priority === "high" ? "text-red-500" :
                        item.priority === "medium" ? "text-yellow-500" : "text-gray-500"
                      }`} />
                      {priorityStatus.label}优先级
                    </Badge>
                  </div>
                  <p className="text-sm line-clamp-1 mb-1">{item.content}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    关联: {item.storyboardId} · {storyboard ? `分镜#${storyboard.frameNumber}` : ""} · {formatDate(item.createdAt)}
                  </p>
                </div>
                <Button variant="ghost" size="sm"><Eye className="size-4" /></Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="size-5" />
              反馈详情 · {selected?.id}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-[var(--color-muted-foreground)]">类型</p>
                    <Badge className={`mt-1 ${getStatus(selected.type).color}`}>{getStatus(selected.type).label}</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-[var(--color-muted-foreground)]">优先级</p>
                    <Badge className={`mt-1 ${getStatus(selected.priority).color}`}>{getStatus(selected.priority).label}</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-[var(--color-muted-foreground)]">关联</p>
                    <p className="font-medium text-sm mt-1">{selected.storyboardId}</p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">用户反馈内容</p>
                <div className="bg-[var(--color-muted)] rounded-lg p-3 text-sm">{selected.content}</div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="size-4 text-[var(--color-primary)]" />
                  意图分析
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  {selected.intentAnalysis}
                </div>
              </div>

              {selected.suggestions && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Lightbulb className="size-4 text-yellow-500" />
                    修改建议
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm whitespace-pre-wrap">
                    {selected.suggestions}
                  </div>
                </div>
              )}

              <div className="text-xs text-[var(--color-muted-foreground)]">
                反馈时间: {formatDate(selected.createdAt)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
