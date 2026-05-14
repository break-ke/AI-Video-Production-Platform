"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, ChevronDown } from "lucide-react";
import { MODULE_NAMES } from "@/lib/constants";

const BREADCRUMB_MAP: Record<string, string> = {
  "/": MODULE_NAMES.dashboard,
  "/competitive-research": MODULE_NAMES.competitiveResearch,
  "/storyboard": MODULE_NAMES.storyboard,
  "/feedback": MODULE_NAMES.feedback,
  "/script-iteration": MODULE_NAMES.scriptIteration,
  "/model-adaptation": MODULE_NAMES.modelAdaptation,
  "/auto-editing": MODULE_NAMES.autoEditing,
  "/one-click-replicate": MODULE_NAMES.oneClickReplicate,
};

export function Header() {
  const pathname = usePathname();
  const currentPage = BREADCRUMB_MAP[pathname] || "工作台";

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/90 backdrop-blur-sm border-b border-[var(--color-border)] flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--color-muted-foreground)]">AI视频生产协同平台</span>
        <span className="text-sm text-[var(--color-muted-foreground)]">/</span>
        <span className="text-sm font-medium text-[var(--color-foreground)]">{currentPage}</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-1.5 rounded-md hover:bg-[var(--color-secondary)] transition-colors">
          <Search className="size-4 text-[var(--color-muted-foreground)]" />
        </button>
        <button className="relative p-1.5 rounded-md hover:bg-[var(--color-secondary)] transition-colors">
          <Bell className="size-4 text-[var(--color-muted-foreground)]" />
          <span className="absolute top-1 right-1 size-2 rounded-full bg-[var(--color-destructive)] ring-1 ring-white" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-[var(--color-border)]">
          <div className="size-7 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-medium">管</div>
          <span className="text-sm text-[var(--color-foreground)] hidden md:block">管理员</span>
          <ChevronDown className="size-3.5 text-[var(--color-muted-foreground)] hidden md:block" />
        </div>
      </div>
    </header>
  );
}
