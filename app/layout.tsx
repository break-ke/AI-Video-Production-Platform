import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI视频内容生产协同平台",
  description: "基于飞书生态的AI驱动视频内容生产全流程协同系统",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[var(--color-background)] antialiased">
        <ToastProvider>
          <Sidebar />
          <div className="pl-[220px] transition-all duration-200">
            <Header />
            <main className="p-6 max-w-[1600px] mx-auto">{children}</main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
