"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import {
  LayoutDashboard,
  Search,
  Film,
  MessageSquare,
  FileText,
  Cpu,
  Clapperboard,
  Copy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Search,
  Film,
  MessageSquare,
  FileText,
  Cpu,
  Clapperboard,
  Copy,
};

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-[var(--color-sidebar)] text-[var(--color-sidebar-foreground)] transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
        <div className="size-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center shrink-0">
          <Clapperboard className="size-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-sm leading-tight">
            AI视频生产
            <br />
            协同平台
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group",
                isActive
                  ? "bg-[var(--color-sidebar-accent)] text-white font-medium"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className="size-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-white/10 text-white/40 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
      </button>
    </aside>
  );
}
