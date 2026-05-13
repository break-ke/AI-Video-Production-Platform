"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import {
  LayoutDashboard, Search, Film, MessageSquare, FileText, Cpu, Clapperboard, Copy,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState } from "react";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Search, Film, MessageSquare, FileText, Cpu, Clapperboard, Copy,
};

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-[var(--color-sidebar)] flex flex-col transition-all duration-200",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      <div className={cn("flex items-center h-14 px-3", collapsed ? "justify-center" : "gap-2.5")}>
        <div className="size-7 rounded-md bg-white/10 flex items-center justify-center shrink-0">
          <Clapperboard className="size-3.5 text-white" strokeWidth={1.5} />
        </div>
        {!collapsed && <span className="font-semibold text-sm text-white tracking-tight">AI视频协同平台</span>}
      </div>

      <div className="mx-3 h-px bg-white/6" />

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors",
                isActive
                  ? "bg-white/10 text-white font-medium"
                  : "text-[var(--color-sidebar-foreground)] hover:text-white hover:bg-white/[0.06]"
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.5} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 h-px bg-white/6" />

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-9 text-white/30 hover:text-white/60 transition-colors"
      >
        {collapsed ? <ChevronRight className="size-3.5" strokeWidth={1.5} /> : <ChevronLeft className="size-3.5" strokeWidth={1.5} />}
      </button>
    </aside>
  );
}
