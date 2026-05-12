"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { mockScriptVersions } from "@/lib/mock/script-iteration";
import { STATUS_MAP } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import {
  FileText,
  Plus,
  Eye,
  GitBranch,
  Clock,
  User,
  Check,
  X,
  ArrowUpRight,
} from "lucide-react";

export default function ScriptIterationPage() {
  const [data, setData] = useState(mockScriptVersions);
  const [selected, setSelected] = useState<(typeof data)[0] | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const scripts = [...new Set(data.map((d) => d.scriptId))];

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">脚本迭代管理</h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            管理视频脚本的版本迭代，追踪每次修改与优化
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="size-4" />
          新建版本
        </Button>
      </div>

      {/* Script Cards */}
      {scripts.map((scriptId) => {
        const versions = data.filter((d) => d.scriptId === scriptId).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const latestVersion = versions[0];
        return (
          <Card key={scriptId}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <GitBranch className="size-4 text-[var(--color-muted-foreground)]" />
                {scriptId}
                <Badge variant="outline" className="text-xs">{versions.length}个版本</Badge>
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="size-3" />
                新增迭代
              </Button>
            </CardHeader>
            <CardContent>
              {/* Version Timeline */}
              <div className="space-y-1">
                {versions.map((v, idx) => {
                  const status = STATUS_MAP[v.status];
                  const isLatest = idx === 0;
                  return (
                    <div
                      key={v.id}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-[var(--color-muted)]/30 transition-colors cursor-pointer group"
                      onClick={() => { setSelected(v); setShowDetail(true); }}
                    >
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center pt-1.5">
                        <div className={`size-3 rounded-full border-2 ${
                          v.status === "active" ? "border-[var(--color-primary)] bg-[var(--color-primary)]" :
                          v.status === "approved" ? "border-emerald-500 bg-emerald-500" :
                          v.status === "review" ? "border-blue-500 bg-blue-500" :
                          "border-[var(--color-border)] bg-[var(--color-muted)]"
                        }`} />
                        {idx < versions.length - 1 && (
                          <div className="w-px h-full bg-[var(--color-border)] flex-1 min-h-[20px]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold">{v.version}</span>
                          {isLatest && <Badge className="text-[10px] bg-blue-100 text-blue-800">最新</Badge>}
                          <Badge className={`text-xs ${status.color}`}>{status.label}</Badge>
                        </div>
                        <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-2 mb-1">
                          {v.content}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-[var(--color-muted-foreground)]">
                          <span className="flex items-center gap-1"><User className="size-3" />{v.creator}</span>
                          <span className="flex items-center gap-1"><Clock className="size-3" />{formatDate(v.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm"><Eye className="size-4" /></Button>
                        <Button variant="ghost" size="sm"><Check className="size-4 text-emerald-500" /></Button>
                        <Button variant="ghost" size="sm"><X className="size-4 text-red-500" /></Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              版本详情 · {selected?.version}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-[var(--color-muted-foreground)]">脚本ID</p>
                  <p className="font-medium">{selected.scriptId}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted-foreground)]">状态</p>
                  <Badge className={`mt-1 ${STATUS_MAP[selected.status].color}`}>{STATUS_MAP[selected.status].label}</Badge>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted-foreground)]">创建人</p>
                  <p className="font-medium">{selected.creator}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">修改说明</p>
                <div className="bg-[var(--color-muted)] rounded-lg p-3 text-sm whitespace-pre-wrap">{selected.changes}</div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">脚本内容</p>
                <div className="bg-[var(--color-muted)] rounded-lg p-4 text-sm whitespace-pre-wrap max-h-80 overflow-y-auto">
                  {selected.content}
                </div>
              </div>

              <div className="text-xs text-[var(--color-muted-foreground)]">
                创建时间: {formatDate(selected.createdAt)}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline">编辑</Button>
            <Button>审核通过</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
