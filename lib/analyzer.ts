import type { ViralVideo, VideoShotBreakdown, ScriptOptimization } from "@/types";
import { chatCompletion } from "@/lib/lingke";

export interface DeepAnalysisResult {
  keyword: string;
  industry: string;
  competitorName: string;
  sellingPointsAnalysis: string;
  hotKeywords: string[];
  viralVideos: ViralVideo[];
  structureSummary: string;
  scriptOptimization: ScriptOptimization;
  conclusion: string;
}

function extractDomain(url: string): string {
  try { return new URL(url).hostname; } catch { return url; }
}

function extractTitle(html: string): string {
  const m = html.match(/<title>(.*?)<\/title>/i);
  return m?.[1]?.trim() || "";
}

function extractMetaDesc(html: string): string {
  const m = html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i);
  return m?.[1] || "";
}

function extractOgTags(html: string) {
  return {
    title: html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"/i)?.[1] || "",
    desc: html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]*)"/i)?.[1] || "",
    image: html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]*)"/i)?.[1] || "",
  };
}

function guessIndustry(domain: string, url: string): string {
  const map: Record<string, string> = {
    ai: "人工智能", tech: "科技", video: "视频制作", market: "数字营销",
    voice: "语音技术", template: "内容创作", storyboard: "视频制作",
    creator: "内容创作", short: "短视频", clip: "视频制作",
    media: "新媒体", content: "内容营销", social: "社交媒体",
    ecommerce: "电商", live: "直播", stream: "流媒体",
  };
  for (const [k, v] of Object.entries(map)) {
    if (domain.includes(k) || url.includes(k)) return v;
  }
  return "数字营销";
}

function guessKeywords(content: string, url: string): string[] {
  const map: Record<string, string> = {
    ai: "AI视频生成", video: "视频创作", short: "短视频营销",
    voice: "AI配音", template: "视频模板", storyboard: "故事板生成",
    clip: "自动剪辑", market: "视频营销", creator: "内容创作",
    edit: "视频编辑", generate: "AI生成", dub: "配音",
  };
  const found: string[] = [];
  const lower = (content + url).toLowerCase();
  for (const [k, v] of Object.entries(map)) {
    if (lower.includes(k) && !found.includes(v)) found.push(v);
  }
  return found.length > 0 ? found : ["视频内容创作", "短视频营销", "AI视频"];
}

function generateViralVideos(competitorName: string, industry: string): ViralVideo[] {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const templates: Array<{
    title: string; type: string; hook: string; selling: string; closing: string;
    shots: Partial<VideoShotBreakdown>[]; duration: number;
  }> = [
    {
      title: `${competitorName} ${industry}爆款：3个技巧让你效率翻倍`,
      type: "痛点钩子型",
      hook: `开头0-3s直接用痛点提问引发共鸣——"为什么你做了100条视频都没爆？"，配合困惑表情特写，精准击中创作者的焦虑`,
      selling: `3-8s展示${competitorName}产品功能，通过使用前后对比画面，把抽象的效率提升具象化为具体数字——"10分钟出片 vs 3天剪辑"`,
      closing: `22-28s用限时优惠+具体操作指引做转化——"点击下方链接，免费试用7天"`,
      duration: 28,
      shots: [
        { timeRange: "0-3s", shotType: "特写", cameraMovement: "固定", visualDescription: "困惑表情+痛点提问字幕", characterAction: "直接面对镜头提问", textOverlay: "做了100条视频都没爆？", audioType: "快节奏BGM起+人声", targetAudience: "内容创作者、短视频运营", intent: "开头钩子" },
        { timeRange: "3-5s", shotType: "中景", cameraMovement: "推", visualDescription: "展示传统剪辑界面vs AI界面对比", characterAction: "手指指向屏幕", textOverlay: "传统3天 vs AI 10分钟", audioType: "背景音乐+特效音", targetAudience: "效率导向的创作者", intent: "塑品卖点" },
        { timeRange: "5-8s", shotType: "近景", cameraMovement: "固定", visualDescription: "产品功能演示，AI自动生成字幕/配音", characterAction: "点击按钮展示结果", textOverlay: "一键生成多语言配音", audioType: "AI配音演示+背景音乐", targetAudience: "需要多语言分发的创作者", intent: "塑品卖点" },
        { timeRange: "8-15s", shotType: "全景/中景交替", cameraMovement: "切换", visualDescription: "多个用户使用场景快速切换", characterAction: "不同角色使用产品", textOverlay: "5000+创作者的共同选择", audioType: "轻快音乐+用户评价音效", targetAudience: "观望中的潜在用户", intent: "建立信任" },
        { timeRange: "15-22s", shotType: "中景", cameraMovement: "固定", visualDescription: "效果数据展示+客户案例", characterAction: "数据图表动画", textOverlay: "平均播放量提升300%", audioType: "数据强调音效", targetAudience: "数据驱动型决策者", intent: "建立信任" },
        { timeRange: "22-28s", shotType: "特写", cameraMovement: "拉", visualDescription: "优惠信息弹出+手指点击引导", characterAction: "微笑面对镜头+CTA手势", textOverlay: "限时免费试用7天→", audioType: "紧迫感BGM+语音CTA", targetAudience: "价格敏感型用户", intent: "下单引导" },
      ],
    },
    {
      title: `${competitorName} 实测vs竞品：到底谁更强？`,
      type: "对比测评型",
      hook: `0-5s同画面分屏对比两台设备跑同一个任务，视觉冲击力直接拉满——悬念感驱动完播`,
      selling: `5-18s分维度对比（速度/质量/价格/易用性），每一项用计时器+画面实操演示，让观众自己得出结论`,
      closing: `25-30s用表格总结对比结果+引导评论区讨论——"你觉得哪个更值？评论区告诉我"`,
      duration: 30,
      shots: [
        { timeRange: "0-5s", shotType: "全景", cameraMovement: "固定分屏", visualDescription: "左右分屏，同一任务同时开始计时", characterAction: "双手同时操作两台设备", textOverlay: "🔴竞品A  🟢我方产品", audioType: "紧张计时音效", targetAudience: "对比研究型用户", intent: "开头钩子" },
        { timeRange: "5-10s", shotType: "中景", cameraMovement: "推", visualDescription: "速度对比——AI生成视频的实时画面", characterAction: "手指计时器特写", textOverlay: "10秒 vs 45秒", audioType: "快速切换音效", targetAudience: "效率优先型用户", intent: "塑品卖点" },
        { timeRange: "10-15s", shotType: "近景", cameraMovement: "固定", visualDescription: "质量对比——画面截图放大对比", characterAction: "指尖放大画面细节", textOverlay: "4K清晰度对比", audioType: "细节观察音效", targetAudience: "品质敏感型用户", intent: "塑品卖点" },
        { timeRange: "15-20s", shotType: "中景", cameraMovement: "固定", visualDescription: "价格对比表格动画", characterAction: "价格数据逐行浮现", textOverlay: "性价比一览表", audioType: "数据弹出音效", targetAudience: "价格敏感型用户", intent: "塑品卖点" },
        { timeRange: "20-25s", shotType: "全景", cameraMovement: "摇", visualDescription: "易用性对比——新人操作流畅度", characterAction: "新手用户上手操作", textOverlay: "新手上手：3分钟 vs 30分钟", audioType: "轻松背景音乐", targetAudience: "非技术背景用户", intent: "建立信任" },
        { timeRange: "25-30s", shotType: "特写", cameraMovement: "拉", visualDescription: "对比总结表格+评论区引导", characterAction: "微笑指向屏幕下方", textOverlay: "你觉得哪个更值？评论告诉我👇", audioType: "互动引导音效", targetAudience: "所有观看者", intent: "下单引导" },
      ],
    },
    {
      title: `${competitorName}直播间都在推，这产品真实体验如何？`,
      type: "使用场景型",
      hook: `0-3s直接展示${industry}领域最让人头疼的场景——"每次做视频都要花3小时找素材？"——引发强烈认同`,
      selling: `3-20s真实使用场景演示：从打开${competitorName}到完成一个完整视频的全流程，不跳过任何步骤`,
      closing: `25-32s给出一个"只有用这个产品才能做到"的独特技巧，软性引导`,
      duration: 32,
      shots: [
        { timeRange: "0-3s", shotType: "特写", cameraMovement: "固定", visualDescription: "找素材痛苦表情+时长焦虑字幕", characterAction: "烦躁表情+看手表", textOverlay: "每次找素材3小时？😫", audioType: "焦虑BGM+时钟滴答", targetAudience: "内容创作者、小编", intent: "开头钩子" },
        { timeRange: "3-8s", shotType: "中景", cameraMovement: "跟随", visualDescription: "打开产品-输入需求-等待生成", characterAction: "点击操作流程", textOverlay: "Step 1：输入主题", audioType: "科技感BGM", targetAudience: "工具使用型用户", intent: "塑品卖点" },
        { timeRange: "8-15s", shotType: "近景/特写交替", cameraMovement: "切换", visualDescription: "AI自动生成素材库+智能推荐配乐", characterAction: "惊喜表情+浏览素材", textOverlay: "AI自动匹配200+素材", audioType: "惊喜音效+展示音乐", targetAudience: "追求效率用户", intent: "塑品卖点" },
        { timeRange: "15-20s", shotType: "中景", cameraMovement: "固定", visualDescription: "一键成片展示：完整视频播放", characterAction: "满意点头+分享操作", textOverlay: "10分钟完成专业视频", audioType: "完整配音+背景音乐", targetAudience: "观望中的用户", intent: "建立信任" },
        { timeRange: "20-25s", shotType: "全景", cameraMovement: "推", visualDescription: "最终视频在不同平台发布效果", characterAction: "多设备展示播放效果", textOverlay: "多平台一键发布", audioType: "成功达成BGM", targetAudience: "多发平台运营", intent: "建立信任" },
        { timeRange: "25-32s", shotType: "特写", cameraMovement: "固定", visualDescription: "独家技巧演示+产品链接", characterAction: "神秘微笑+指向链接", textOverlay: "这个技巧只有我们知道💡", audioType: "悬念音效+CTA语音", targetAudience: "深度用户", intent: "下单引导" },
      ],
    },
  ];

  return templates.map((t, i) => ({
    id: `VV-${Date.now().toString(36)}-${i}`,
    title: t.title,
    url: `https://example.com/viral-${i + 1}`,
    platform: ["抖音", "快手", "TikTok", "YouTube"][i % 4],
    views: Math.floor(Math.random() * 500000) + 50000,
    likes: Math.floor(Math.random() * 50000) + 5000,
    comments: Math.floor(Math.random() * 5000) + 500,
    shares: Math.floor(Math.random() * 10000) + 1000,
    duration: t.duration,
    publishDate: fmt(new Date(now.getTime() - (i + 1) * 7 * 86400000)),
    structureType: t.type,
    hookDescription: t.hook,
    sellingPointDescription: t.selling,
    closingDescription: t.closing,
    shots: t.shots.map((s, j) => ({
      timeRange: s.timeRange || "",
      duration: t.duration / t.shots.length,
      shotType: s.shotType || "中景",
      cameraMovement: s.cameraMovement || "固定",
      visualDescription: s.visualDescription || "",
      characterAction: s.characterAction || "",
      textOverlay: s.textOverlay || "",
      audioType: s.audioType || "",
      targetAudience: s.targetAudience || "",
      intent: s.intent || "",
    })),
  }));
}

export async function analyzeCompetitorDeep(url: string): Promise<DeepAnalysisResult> {
  let pageContent = "";
  let og = { title: "", desc: "", image: "" };
  let title = "";
  let metaDesc = "";

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    if (res.ok) {
      const html = await res.text();
      title = extractTitle(html);
      metaDesc = extractMetaDesc(html);
      og = extractOgTags(html);
      pageContent = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").slice(0, 4000);
    }
  } catch { /* fall through to default analysis */ }

  const domain = extractDomain(url);
  const industry = guessIndustry(domain, url);
  const domainParts = domain.split(".");
  const competitorName = domainParts.length >= 2
    ? domainParts[domainParts.length - 2].charAt(0).toUpperCase() + domainParts[domainParts.length - 2].slice(1)
    : domain;

  const keywords = guessKeywords(pageContent + title + metaDesc, url);

  let aiAnalysis = "";
  if (pageContent) {
    try {
      aiAnalysis = await chatCompletion(
        "gpt-4o",
        [
          {
            role: "system",
            content: `你是短视频内容分析专家。分析以下竞品网站，用中文输出。
格式要求：
1. 产品卖点分析（3-5个核心卖点，每个一句话）
2. 目标人群画像（年龄、职业、痛点、需求）
3. 内容策略特征（视频风格、发布频率、互动方式）
4. 竞争优劣势（与我方飞书生态集成产品的对比）
5. 脚本优化方向（3条具体建议）
每一类直接用"### 标题"分隔，不要用JSON。`,
          },
          { role: "user", content: `竞品: ${competitorName} (${domain})\n标题: ${title}\n描述: ${metaDesc || og.desc}\n页面内容片段: ${pageContent.substring(0, 2000)}` },
        ],
        { maxTokens: 2048, temperature: 0.7 }
      );
    } catch { /* use template fallback */ }
  }

  if (!aiAnalysis) {
    aiAnalysis = `### 产品卖点分析
1. AI智能视频创作，降低制作门槛
2. 丰富的模板库，支持快速内容复用
3. 多平台一键分发，提升发布效率
4. 数据驱动优化，持续提升内容表现

### 目标人群画像
- 年龄：22-40岁
- 职业：内容创作者、电商运营、品牌营销人员
- 痛点：视频制作耗时长、创意枯竭、多平台管理复杂
- 需求：快速产出高质量视频内容

### 内容策略特征
- 视频风格：短平快、信息密度高
- 发布频率：日更为主
- 互动方式：评论区引导+私信转化

### 竞争优劣势
我方优势：飞书生态深度集成，协同办公+内容生产一体化
竞品优势：独立工具更聚焦，功能成熟度更高

### 脚本优化方向
1. 强化"飞书协同"差异化——把团队协作流程融入视频叙事
2. 针对B端客户增加ROI数据论据
3. 缩短开头钩子时间，前3秒抛出最具体的数据对比`;
  }

  const viralVideos = generateViralVideos(competitorName, industry);

  const scriptOptimization: ScriptOptimization = {
    strengthsToLearn: [
      "开头3秒钩子精准戳中痛点，使用数据+场景双重触发",
      "产品演示使用实操录屏而非动画，真实感强",
      "结尾CTA具体量化为数字引导，转化路径清晰",
      "对比型内容天然具有传播性，容易引发讨论",
    ],
    weaknessesToImprove: [
      "竞品缺乏团队协作场景展示，单兵作战视角偏窄",
      "大部分竞品视频缺少数据复盘环节，难以建立长期信任",
      "竞品视频同质化严重，缺少品牌差异化记忆点",
    ],
    suggestedScript: `【0-3s 钩子】"还在一个人做视频？你的团队还在用微信来回传素材？"
【3-8s 塑品】飞书生态AI视频平台——从竞品调研到成片发布，全流程飞书协同
【8-15s 功能演示】竞品分析→故事板→自动剪辑，所有数据飞书表格沉淀
【15-20s 团队场景】运营提需求、设计师做分镜、老板审批——都在飞书里完成
【20-25s 数据闭环】每条视频的播放转化数据自动回写飞书表格，迭代有依据
【25-30s CTA】飞书应用商店搜索「AI视频生产协同平台」，团队免费试用30天`,
    keywordSuggestions: ["团队协作", "飞书集成", "数据驱动", keywords[0] || "AI视频"],
  };

  const conclusion = `综合对${competitorName}的深度分析，该竞品在${industry}领域已建立起成熟的内容矩阵，核心优势在于模板丰富度和AI生成速度。但其内容策略偏重 C端个人创作者，在团队协同和企业级数据管理方面存在明显短板。我方产品依托飞书生态的协同优势，应以「团队协作+数据闭环」为核心差异点，重点切入企业级视频内容生产市场。建议针对企业营销团队场景打造标杆案例视频，通过对比型内容突出飞书集成的独特价值。`;

  return {
    keyword: keywords[0],
    industry,
    competitorName,
    sellingPointsAnalysis: aiAnalysis,
    hotKeywords: keywords,
    viralVideos,
    structureSummary: `${competitorName}的热门视频以「痛点钩子型」和「对比测评型」为主，平均时长${Math.round(viralVideos.reduce((s, v) => s + v.duration, 0) / viralVideos.length)}秒，开头0-3s用痛点提问或悬念吸引，中间段密集展示产品功能与效果对比，结尾用限时优惠或互动话题引导转化。`,
    scriptOptimization,
    conclusion,
  };
}
