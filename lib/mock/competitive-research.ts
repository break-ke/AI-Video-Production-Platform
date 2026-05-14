import { CompetitiveResearch } from "@/types";

export const mockCompetitiveResearch: CompetitiveResearch[] = [
  {
    id: "CR-001",
    competitorName: "Synthesia",
    competitorLink: "https://www.synthesia.io",
    industry: "AI视频工具",
    productDescription: "Synthesia是全球领先的AI数字人视频生成平台，用户无需拍摄即可创建专业视频。面向企业培训、营销和销售团队，主打多语言AI数字人播报。",
    productPositioning: {
      priceRange: "中高端（$22/月起，企业定制）",
      targetUsers: ["企业培训团队", "全球化营销团队", "销售赋能团队", "L&D部门"],
      coreValueProp: "无需真人出镜，AI数字人+多语言生成专业视频",
      pricingModel: "SaaS订阅（按 seats 收费）",
      marketSegment: "企业级AI视频生成",
    },
    features: [
      { feature: "AI视频生成", competitor: "AI数字人播报，140+数字人", ours: "灵客AI多模型，支持数字人+实拍编辑", advantage: "tie" },
      { feature: "模板库", competitor: "65+企业模板", ours: "4种视频模板+一键复刻", advantage: "competitor" },
      { feature: "多语言", competitor: "140+语言", ours: "灵客AI TTS支持50+语言", advantage: "competitor" },
      { feature: "团队协作", competitor: "基础团队共享", ours: "飞书深度协同，表格数据沉淀", advantage: "ours" },
      { feature: "数据分析", competitor: "基础观看统计", ours: "飞书表格全链路数据", advantage: "ours" },
      { feature: "API集成", competitor: "REST API + 嵌入", ours: "飞书SDK + 开放API", advantage: "tie" },
    ],
    marketAnalysis: {
      companySize: "成长期（融资$156M，估值$1B+）",
      estimatedMarketShare: "企业AI视频市场领先者",
      growthTrend: "快速增长，2024年ARR约$65M",
      primaryRegions: ["北美", "欧洲"],
      competitorType: "间接竞争（企业数字人 vs 短视频营销）",
    },
    swot: {
      strengths: ["品牌知名度高，获客能力强", "AI数字人技术领先", "企业客户资源丰富", "多语言覆盖广"],
      weaknesses: ["价格偏高，中小企业门槛高", "专注数字人播报，短视频营销能力弱", "缺少中国本地化", "模板偏向企业风格，缺少社交媒体适配"],
      opportunities: ["切入Synthesia覆盖不到的中小企业市场", "短视频营销赛道是Synthesia盲区", "飞书生态中国企业客户天然优势", "AI短视频+数据闭环是差异化"],
      threats: ["Synthesia可能扩展短视频能力", "国内同类产品可能快速跟进", "企业客户决策周期长"],
    },
    contentStrategy: {
      primaryPlatforms: ["YouTube", "LinkedIn", "官网博客"],
      contentTypes: ["产品教程", "客户案例", "行业报告", "Webinar"],
      avgDuration: "3-8分钟",
      postingFrequency: "周更（YouTube 200K+订阅）",
      engagementLevel: "高（企业决策者精准触达）",
      topPerformingTopics: ["AI数字人教程", "企业培训视频案例", "ROI计算器"],
    },
    referencedVideos: [],
    keyInsights: `1. Synthesia的成功证明了AI视频在企业市场的巨大需求，但其产品定位（企业数字人播报）与我方（短视频营销+团队协同）有明确差异化。
2. Synthesia的价格门槛（$22/月/人起）为中小企业市场留下了空间，我方可以用更灵活的定价切入。
3. Synthesia的视频内容策略偏企业正式风格，短视频社交媒体的创意表达是其弱点，这是我方的切入点。
4. 飞书生态的中国企业客户是Synthesia无法触及的市场，应当优先深耕。`,
    actionableRecommendations: [
      "对标Synthesia的AI数字人功能，评估接入数字人模型到平台",
      "针对中小企业推出更具竞争力的定价（建议¥99/月起）",
      "重点强化短视频营销场景的模板和AI能力",
      "利用飞书生态的企业客户，打造团队协作+AI视频的差异化案例",
      "加强多语言能力，覆盖出海电商客户的视频本地化需求",
    ],
    creator: "AI电商分析引擎",
    createdAt: "2026-05-13T08:30:00Z",
  },
];
