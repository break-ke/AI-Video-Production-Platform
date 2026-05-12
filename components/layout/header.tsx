"use client";

import { usePathname } from "next/navigation";
import { Bell, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
    <header className="sticky top-0 z-30 h-16 border-b bg-[var(--color-background)]/80 backdrop-blur-sm flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-[var(--color-foreground)]">{currentPage}</h1>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          AI视频内容生产协同平台 · 飞书生态
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-[var(--color-secondary)] transition-colors">
          <Bell className="size-5 text-[var(--color-muted-foreground)]" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[var(--color-destructive)]" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l">
          <Avatar className="size-8">
            <AvatarFallback className="bg-[var(--color-primary)] text-white text-xs font-medium">
              管
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium">管理员</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">admin@feishu.com</p>
          </div>
          <ChevronDown className="size-4 text-[var(--color-muted-foreground)]" />
        </div>
      </div>
    </header>
  );
}
