export const MODULE_NAMES = {
  dashboard: "工作台",
  competitiveResearch: "竞品调研",
  storyboard: "故事板生成",
  feedback: "确认与反馈",
  scriptIteration: "脚本迭代",
  modelAdaptation: "模型适配",
  autoEditing: "自动剪辑配音",
  oneClickReplicate: "一键复刻",
} as const;

export const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "待处理", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "已确认", color: "bg-green-100 text-green-800" },
  rejected: { label: "已拒绝", color: "bg-red-100 text-red-800" },
  modify: { label: "需修改", color: "bg-orange-100 text-orange-800" },
  draft: { label: "草稿", color: "bg-gray-100 text-gray-800" },
  review: { label: "审核中", color: "bg-blue-100 text-blue-800" },
  approved: { label: "已通过", color: "bg-green-100 text-green-800" },
  active: { label: "生效中", color: "bg-emerald-100 text-emerald-800" },
  pass: { label: "通过", color: "bg-green-100 text-green-800" },
  risk: { label: "风险", color: "bg-yellow-100 text-yellow-800" },
  fail: { label: "不通过", color: "bg-red-100 text-red-800" },
  dubbing: { label: "配音中", color: "bg-blue-100 text-blue-800" },
  editing: { label: "剪辑中", color: "bg-purple-100 text-purple-800" },
  compositing: { label: "合成中", color: "bg-indigo-100 text-indigo-800" },
  completed: { label: "已完成", color: "bg-green-100 text-green-800" },
  failed: { label: "失败", color: "bg-red-100 text-red-800" },
  high: { label: "高", color: "bg-red-100 text-red-800" },
  medium: { label: "中", color: "bg-yellow-100 text-yellow-800" },
  low: { label: "低", color: "bg-gray-100 text-gray-800" },
  confirm: { label: "确认", color: "bg-green-100 text-green-800" },
};

export const NAV_ITEMS = [
  { href: "/", label: "工作台", icon: "LayoutDashboard" },
  { href: "/competitive-research", label: "竞品调研", icon: "Search" },
  { href: "/storyboard", label: "故事板生成", icon: "Film" },
  { href: "/feedback", label: "确认与反馈", icon: "MessageSquare" },
  { href: "/script-iteration", label: "脚本迭代", icon: "FileText" },
  { href: "/model-adaptation", label: "模型适配", icon: "Cpu" },
  { href: "/auto-editing", label: "自动剪辑配音", icon: "Clapperboard" },
  { href: "/one-click-replicate", label: "一键复刻", icon: "Copy" },
] as const;
