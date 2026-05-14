"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import {
  LayoutDashboard, Search, Film, MessageSquare, FileText, Cpu, Clapperboard, Copy,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Search, Film, MessageSquare, FileText, Cpu, Clapperboard, Copy,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[210px] bg-white border-r border-[var(--color-border)] flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 h-14 px-4 border-b border-[var(--color-border)]">
        <div className="size-7 rounded-lg bg-[var(--color-primary)] flex items-center justify-center shrink-0">
          <Clapperboard className="size-3.5 text-white" />
        </div>
        <span className="font-medium text-[15px] text-[var(--color-foreground)] tracking-tight">AI视频协同</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] transition-all duration-150",
                isActive
                  ? "bg-[var(--color-sidebar-accent)] text-[var(--color-primary)] font-medium"
                  : "text-[var(--color-sidebar-foreground)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-foreground)]"
              )}
            >
              <Icon className={cn("size-[18px] shrink-0", isActive ? "text-[var(--color-primary)]" : "text-[var(--color-muted-foreground)]")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[var(--color-border)]">
        <p className="text-[11px] text-[var(--color-muted-foreground)]">AI Video Platform v1.0</p>
      </div>
    </aside>
  );
}
