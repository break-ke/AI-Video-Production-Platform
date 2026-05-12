import { ReplicateTemplate } from "@/types";

export const mockTemplates: ReplicateTemplate[] = [
  {
    id: "TPL-001",
    name: "产品推广标准模板",
    description: "适用于电商产品推广视频，包含痛点展示、产品介绍、效果对比、优惠引导四段式结构",
    params: '{"duration": 25, "style": "modern", "voice": "female-standard", "music": "upbeat-tech", "transitions": "smooth-fade", "textOverlay": true}',
    replicateCount: 156,
    previewUrl: "https://picsum.photos/seed/template1/400/225",
    updatedAt: "2026-05-12T08:00:00Z",
  },
  {
    id: "TPL-002",
    name: "品牌故事叙事模板",
    description: "适用于品牌宣传视频，以情感叙事为主线，融合品牌历程、价值观传递与愿景表达",
    params: '{"duration": 45, "style": "cinematic", "voice": "male-warm", "music": "emotional-piano", "transitions": "cinematic-dissolve", "textOverlay": true}',
    replicateCount: 89,
    previewUrl: "https://picsum.photos/seed/template2/400/225",
    updatedAt: "2026-05-11T16:00:00Z",
  },
  {
    id: "TPL-003",
    name: "知识科普快节奏模板",
    description: "适用于知识科普类短视频，快速切换镜头配合信息点展示，保持观众注意力",
    params: '{"duration": 60, "style": "dynamic", "voice": "male-energetic", "music": "electronic-fast", "transitions": "quick-cut", "textOverlay": true}',
    replicateCount: 234,
    previewUrl: "https://picsum.photos/seed/template3/400/225",
    updatedAt: "2026-05-12T10:00:00Z",
  },
  {
    id: "TPL-004",
    name: "客户案例采访模板",
    description: "适用于客户成功案例视频，包含采访片段、数据展示、使用场景交替呈现",
    params: '{"duration": 90, "style": "documentary", "voice": "female-professional", "music": "corporate-clean", "transitions": "cross-dissolve", "textOverlay": true}',
    replicateCount: 67,
    previewUrl: "https://picsum.photos/seed/template4/400/225",
    updatedAt: "2026-05-10T14:00:00Z",
  },
];
