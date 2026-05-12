"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { mockModelAdaptations } from "@/lib/mock/model-adaptation";
import { STATUS_MAP } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import {
  Cpu,
  Plus,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  Zap,
  Lightbulb,
} from "lucide-react";

const resultIconMap = {
  pass: CheckCircle2,
  risk: AlertTriangle,
  fail: XCircle,
};

const resultColorMap = {
  pass: "text-emerald-600 bg-emerald-100",
  risk: "text-yellow-600 bg-yellow-100",
  fail: "text-red-600 bg-red-100",
};

export default function ModelAdaptationPage() {
  const [data, setData] = useState(mockModelAdaptations);
  const [selected, setSelected] = useState<(typeof data)[0] | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const passCount = data.filter((d) => d.result === "pass").length;
  const riskCount = data.filter((d) => d.result === "risk").length;
  const failCount = data.filter((d) => d.result === "fail").length;

  const models = [...new Set(data.map((d) => d.modelName))];

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">模型适配评估</h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            评估本地AI模型能力与适配性，识别风险并输出优化建议
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="size-4" />
          新增评估
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "通过", count: passCount, Icon: CheckCircle2, color: resultColorMap.pass },
          { label: "风险", count: riskCount, Icon: AlertTriangle, color: resultColorMap.risk },
          { label: "不通过", count: failCount, Icon: XCircle, color: resultColorMap.fail },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className={`size-9 rounded-lg flex items-center justify-center ${s.color}`}>
                  <s.Icon className="size-4" />
                </div>
                <div>
                  <p className="text-lg font-bold">{s.count}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">评估{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Model Cards */}
      {models.map((modelName) => {
        const modelEvals = data.filter((d) => d.modelName === modelName);
        return (
          <Card key={modelName}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Cpu className="size-4 text-[var(--color-muted-foreground)]" />
                {modelName}
                <Badge variant="outline" className="text-xs">{modelEvals[0].version}</Badge>
              </CardTitle>
              <Button variant="outline" size="sm">重新评估</Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 text-xs font-medium">评估项</th>
                      <th className="text-center p-2 text-xs font-medium">结果</th>
                      <th className="text-left p-2 text-xs font-medium">风险点</th>
                      <th className="text-left p-2 text-xs font-medium">建议</th>
                      <th className="text-center p-2 text-xs font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelEvals.map((item) => {
                      const ResultIcon = resultIconMap[item.result];
                      return (
                        <tr key={item.id} className="border-b hover:bg-[var(--color-muted)]/30">
                          <td className="p-2 text-sm font-medium">{item.evaluationItem}</td>
                          <td className="p-2 text-center">
                            <Badge className={`text-xs ${STATUS_MAP[item.result].color}`}>
                              {STATUS_MAP[item.result].label}
                            </Badge>
                          </td>
                          <td className="p-2 text-sm text-[var(--color-muted-foreground)] max-w-xs truncate">
                            {item.riskPoints}
                          </td>
                          <td className="p-2 text-sm text-[var(--color-muted-foreground)] max-w-xs truncate">
                            {item.suggestions}
                          </td>
                          <td className="p-2 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setSelected(item); setShowDetail(true); }}
                            >
                              <Eye className="size-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cpu className="size-5" />
              评估详情 · {selected?.id}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[var(--color-muted-foreground)]">模型</p>
                  <p className="font-medium">{selected.modelName}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted-foreground)]">版本</p>
                  <p className="font-medium">{selected.version}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted-foreground)]">评估项</p>
                  <p className="font-medium">{selected.evaluationItem}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted-foreground)]">结果</p>
                  <Badge className={`mt-1 ${STATUS_MAP[selected.result].color}`}>{STATUS_MAP[selected.result].label}</Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Shield className="size-4 text-yellow-500" />
                  风险点与限制
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm whitespace-pre-wrap">
                  {selected.riskPoints}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="size-4 text-[var(--color-primary)]" />
                  优化建议
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm whitespace-pre-wrap">
                  {selected.suggestions}
                </div>
              </div>

              <div className="text-xs text-[var(--color-muted-foreground)]">
                评估时间: {formatDate(selected.evaluatedAt)}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline">重新评估</Button>
            <Button>应用建议</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
