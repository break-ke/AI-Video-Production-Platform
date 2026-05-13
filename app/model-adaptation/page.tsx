"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import type { ModelAdaptation } from "@/types";
import {
  Cpu, Eye, Trash2, Plus, Loader2, ShieldCheck, AlertTriangle, XCircle, Zap,
} from "lucide-react";

const resultMap: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pass: { label: "通过", color: "bg-green-100 text-green-800", icon: ShieldCheck },
  risk: { label: "风险", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
  fail: { label: "不通过", color: "bg-red-100 text-red-800", icon: XCircle },
};

export default function ModelAdaptationPage() {
  const [data, setData] = useState<ModelAdaptation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ModelAdaptation | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [modelName, setModelName] = useState("");
  const [checking, setChecking] = useState(false);

  const fetchData = useCallback(async () => {
    try { const res = await fetch("/api/model-adaptation"); const json = await res.json(); if (json.success) setData(json.data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCheck = async () => {
    if (!modelName) return;
    setChecking(true);
    try {
      const res = await fetch("/api/model-adaptation", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelName }),
      });
      const json = await res.json();
      if (json.success) { setData([json.data, ...data]); setShowAdd(false); setModelName(""); }
    } finally { setChecking(false); }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/model-adaptation?id=${id}`, { method: "DELETE" });
    setData(data.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-semibold">模型适配评估</h2><p className="text-sm text-[var(--color-muted-foreground)]">对接灵客AI平台，检测模型兼容性与适配风险</p></div>
        <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="size-4" />新增评估</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "评估总数", value: data.length },
          { label: "通过", value: data.filter((d) => d.result === "pass").length },
          { label: "风险/失败", value: data.filter((d) => d.result !== "pass").length },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-3 text-center">
            <p className="text-lg font-bold">{s.value}</p><p className="text-xs text-[var(--color-muted-foreground)]">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card><CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin" /></div>
        ) : data.length === 0 ? (
          <div className="text-center py-16"><Cpu className="size-10 text-[var(--color-muted-foreground)] mx-auto mb-3" /><p className="text-sm text-[var(--color-muted-foreground)]">暂无评估，点击新增检测模型兼容性</p></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full">
            <thead><tr className="border-b bg-[var(--color-muted)]/50"><th className="text-left p-3 text-xs">ID</th><th className="text-left p-3 text-xs">模型</th><th className="text-left p-3 text-xs">版本</th><th className="text-center p-3 text-xs">结果</th><th className="text-left p-3 text-xs">时间</th><th className="text-center p-3 text-xs">操作</th></tr></thead>
            <tbody>
              {data.map((item) => {
                const rm = resultMap[item.result] || resultMap.risk;
                return (
                  <tr key={item.id} className="border-b hover:bg-[var(--color-muted)]/30">
                    <td className="p-3 text-sm font-mono">{item.id}</td><td className="p-3 text-sm font-medium">{item.modelName}</td><td className="p-3 text-sm">{item.version}</td>
                    <td className="p-3 text-center"><Badge className={`text-xs ${rm.color}`}><rm.icon className="size-3 mr-1" />{rm.label}</Badge></td>
                    <td className="p-3 text-sm whitespace-nowrap">{formatDate(item.evaluatedAt)}</td>
                    <td className="p-3"><div className="flex justify-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setSelected(item); setShowDetail(true); }}><Eye className="size-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="size-4 text-[var(--color-destructive)]" /></Button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        )}
      </CardContent></Card>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Cpu className="size-5" />评估详情 · {selected?.id}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-[var(--color-muted-foreground)]">模型</p><p className="font-medium">{selected.modelName}</p></div>
                <div><p className="text-xs text-[var(--color-muted-foreground)]">版本</p><p className="font-medium">{selected.version}</p></div>
              </div>
              <div><p className="text-sm font-medium mb-1">评估项</p><p className="text-sm bg-[var(--color-muted)] rounded-lg p-3">{selected.evaluationItem}</p></div>
              <div><p className="text-sm font-medium mb-1">结果</p><Badge className={(resultMap[selected.result] || resultMap.risk).color}>{(resultMap[selected.result] || resultMap.risk).label}</Badge></div>
              <div><p className="text-sm font-medium mb-1">风险点</p><p className="text-sm bg-yellow-50 rounded-lg p-3">{selected.riskPoints}</p></div>
              <div><p className="text-sm font-medium mb-1">优化建议</p><p className="text-sm bg-blue-50 rounded-lg p-3">{selected.suggestions}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle><Zap className="size-5 inline mr-2" />新增模型评估</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-medium">选择模型</label>
              <select className="w-full rounded-md border px-3 py-2 text-sm bg-[var(--color-background)]" value={modelName} onChange={(e) => setModelName(e.target.value)}>
                <option value="">-- 选择模型 --</option>
                <optgroup label="语言"><option value="gpt-5.5">GPT-5.5</option><option value="gpt-4o">GPT-4o</option><option value="claude-opus-4-7">Claude Opus 4.7</option><option value="gemini-3.1-pro-preview">Gemini 3.1 Pro</option></optgroup>
                <optgroup label="图片"><option value="gpt-image-2">GPT-Image-2</option><option value="gemini-3-pro-image-preview">Gemini 3 Pro Image</option></optgroup>
                <optgroup label="视频"><option value="doubao-seedance-1-5-pro-251215">即梦 3.5 Pro</option><option value="sora-2">Sora 2</option></optgroup>
              </select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button><Button onClick={handleCheck} disabled={checking || !modelName}>{checking ? <Loader2 className="size-4 animate-spin mr-2" /> : null}{checking ? "检测中..." : "开始评估"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
