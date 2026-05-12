import { EditingTask } from "@/types";

export const mockEditingTasks: EditingTask[] = [
  {
    id: "ET-001",
    scriptId: "SCR-001",
    dubbingUrl: "https://example.com/audio/dubbing-001.mp3",
    editingPlan: "镜头1(0-3s): 城市航拍+标题动画 / 镜头2(3-8s): AI界面特写+功能标注 / 镜头3(8-15s): 用户操作场景 / 镜头4(15-22s): 成品展示+CTA",
    progress: 100,
    status: "completed",
    outputUrl: "https://example.com/videos/final-001.mp4",
    createdAt: "2026-05-12T10:00:00Z",
  },
  {
    id: "ET-002",
    scriptId: "SCR-002",
    dubbingUrl: "",
    editingPlan: "镜头1(0-3s): 痛点场景 / 镜头2(3-8s): 竞品不足 / 镜头3(8-16s): 产品优势 / 镜头4(16-22s): 效果对比 / 镜头5(22-25s): 引导优惠",
    progress: 25,
    status: "dubbing",
    outputUrl: "",
    createdAt: "2026-05-12T11:00:00Z",
  },
  {
    id: "ET-003",
    scriptId: "SCR-003",
    dubbingUrl: "https://example.com/audio/dubbing-003.mp3",
    editingPlan: "镜头1(0-5s): 场景引入 / 镜头2(5-12s): 功能介绍 / 镜头3(12-20s): 使用演示 / 镜头4(20-28s): 效果展示",
    progress: 60,
    status: "editing",
    outputUrl: "",
    createdAt: "2026-05-12T09:00:00Z",
  },
  {
    id: "ET-004",
    scriptId: "SCR-004",
    dubbingUrl: "https://example.com/audio/dubbing-004.mp3",
    editingPlan: "镜头1(0-3s): logo动画 / 镜头2(3-10s): 产品开箱 / 镜头3(10-18s): 核心功能 / 镜头4(18-25s): 结尾引导",
    progress: 85,
    status: "compositing",
    outputUrl: "",
    createdAt: "2026-05-11T15:00:00Z",
  },
];
