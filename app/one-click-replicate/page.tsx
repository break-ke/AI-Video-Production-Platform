"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { mockTemplates } from "@/lib/mock/one-click-replicate";
import { formatDate } from "@/lib/utils";
import {
  Copy,
  Eye,
  Play,
  Zap,
  Settings,
  Download,
  TrendingUp,
  Plus,
} from "lucide-react";

export default function OneClickReplicatePage() {
  const [data, setData] = useState(mockTemplates);
  const [selected, setSelected] = useState<(typeof data)[0] | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showReplicate, setShowReplicate] = useState(false);

  const totalReplicates = data.reduce((s, t) => s + t.replicateCount, 0);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">一键复刻</h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            基于已有模板快速复制生成新视频，累计复刻 {totalReplicates} 次
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Plus className="size-4" />
            新建模板
          </Button>
        </div>
      </div>

      {/* Template Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {data.map((template) => (
          <Card key={template.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-video bg-[var(--color-muted)] relative overflow-hidden group">
              <img
                src={template.previewUrl}
                alt={template.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                  onClick={() => { setSelected(template); setShowDetail(true); }}
                >
                  <Eye className="size-3" />
                  预览
                </Button>
                <Button
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                  onClick={() => { setSelected(template); setShowReplicate(true); }}
                >
                  <Zap className="size-3" />
                  一键复刻
                </Button>
              </div>
              <div className="absolute top-2 right-2">
                <Badge className="bg-black/60 text-white text-xs">
                  <Copy className="size-3 mr-1" />
                  {template.replicateCount}次
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-sm">{template.name}</h3>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">{template.id}</p>
                </div>
              </div>
              <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-2 mb-3">
                {template.description}
              </p>

              {/* Params Preview */}
              <div className="bg-[var(--color-muted)] rounded-lg p-2 mb-3">
                <p className="text-xs font-medium mb-1">参数配置</p>
                <p className="text-xs text-[var(--color-muted-foreground)] font-mono line-clamp-1">
                  {template.params}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  更新: {formatDate(template.updatedAt)}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 h-8"
                    onClick={() => { setSelected(template); setShowDetail(true); }}
                  >
                    <Settings className="size-3" />
                    编辑
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1 h-8"
                    onClick={() => { setSelected(template); setShowReplicate(true); }}
                  >
                    <Zap className="size-3" />
                    复刻
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="size-5" />
              模板详情 · {selected?.name}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-[var(--color-muted)]">
                <img src={selected.previewUrl} alt="" className="w-full h-full object-cover" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[var(--color-muted-foreground)]">模板ID</p>
                  <p className="font-medium">{selected.id}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted-foreground)]">使用次数</p>
                  <p className="font-medium flex items-center gap-1">
                    <TrendingUp className="size-4 text-emerald-500" />
                    {selected.replicateCount} 次
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">描述</p>
                <p className="text-sm bg-[var(--color-muted)] rounded-lg p-3">{selected.description}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">参数配置 (JSON)</p>
                <pre className="text-xs font-mono bg-[var(--color-muted)] rounded-lg p-3 overflow-x-auto">
                  {JSON.stringify(JSON.parse(selected.params), null, 2)}
                </pre>
              </div>

              <div className="text-xs text-[var(--color-muted-foreground)]">
                更新时间: {formatDate(selected.updatedAt)}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline">编辑参数</Button>
            <Button className="gap-1" onClick={() => { setShowDetail(false); setShowReplicate(true); }}>
              <Zap className="size-4" />
              一键复刻
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Replicate Dialog */}
      <Dialog open={showReplicate} onOpenChange={setShowReplicate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="size-5" />
              一键复刻 · {selected?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">生成数量</label>
              <Input type="number" defaultValue={1} min={1} max={10} />
            </div>
            <div>
              <label className="text-sm font-medium">目标脚本ID</label>
              <Input placeholder="输入脚本ID或留空自动匹配" />
            </div>
            <Card className="bg-[var(--color-accent)] border-emerald-200">
              <CardContent className="p-3 text-sm text-emerald-900">
                基于模板 <strong>{selected?.name}</strong> ({selected?.id}) 的参数配置，将自动生成包含配音、剪辑方案的完整视频。
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplicate(false)}>取消</Button>
            <Button className="gap-2" onClick={() => setShowReplicate(false)}>
              <Zap className="size-4" />
              确认复刻
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
