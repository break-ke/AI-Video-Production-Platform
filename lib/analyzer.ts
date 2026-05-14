import type {
  ProductPositioning, FeatureComparisonItem, MarketAnalysis,
  ContentStrategy, SWOTItem, ReferencedVideo,
} from "@/types";
import { chatCompletion } from "@/lib/lingke";

// ---- Page scraping ----

interface ScrapedPage {
  title: string;
  description: string;
  bodyText: string;
  ogImage: string;
}

async function scrapePage(url: string): Promise<ScrapedPage> {
  const result: ScrapedPage = { title: url, description: "", bodyText: "", ogImage: "" };
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    if (!res.ok) return result;
    const html = await res.text();
    result.title = (html.match(/<title>(.*?)<\/title>/i)?.[1] || url).trim();
    result.description = (html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)?.[1] || "").trim();
    result.ogImage = (html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]*)"/i)?.[1] || "").trim();
    result.bodyText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 8000);
  } catch { /* return defaults */ }
  return result;
}

// ---- Domain → competitor name ----

function domainName(url: string): string {
  try {
    const parts = new URL(url).hostname.split(".");
    const name = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch { return url; }
}

// ---- Industry guess ----

function guessIndustry(domain: string, url: string): string {
  const map: Record<string, string> = {
    ai: "AI工具", video: "视频制作", design: "设计工具",
    marketing: "营销科技", ecommerce: "电商SaaS", content: "内容平台",
    editor: "视频编辑", creative: "创意工具", media: "新媒体",
  };
  const lower = domain + url;
  for (const [k, v] of Object.entries(map)) {
    if (lower.includes(k)) return v;
  }
  return "视频内容SaaS";
}

// ---- AI analysis ----

async function aiAnalyze(prompt: string): Promise<string> {
  try {
    return await chatCompletion("gpt-4o", [
      { role: "system", content: "你是一个电商SaaS产品竞品分析专家。基于提供的网页信息，给出专业、具体、有数据支撑的分析。用中文输出。" },
      { role: "user", content: prompt },
    ], { maxTokens: 3072, temperature: 0.5 });
  } catch {
    return "";
  }
}

// ---- Parse AI response sections ----

function parseSection(text: string, heading: string): string {
  const re = new RegExp(`(?:^|\\n)\\s*#{1,3}\\s*${heading}[\\s\\S]*?(?=\\n\\s*#{1,3}\\s|$)`, "i");
  const m = text.match(re);
  return m ? m[0].replace(/^#{1,3}\s*[^\n]*\n?/, "").trim() : "";
}

function parseList(text: string): string[] {
  return text
    .split(/\n/)
    .map(l => l.replace(/^[\s•\-*\d.]+\s*/, "").trim())
    .filter(Boolean);
}

// ---- Main analysis entry ----

export interface AnalysisResult {
  productDescription: string;
  productPositioning: ProductPositioning;
  features: FeatureComparisonItem[];
  marketAnalysis: MarketAnalysis;
  swot: SWOTItem;
  contentStrategy: ContentStrategy;
  referencedVideos: ReferencedVideo[];
  keyInsights: string;
  actionableRecommendations: string[];
  industry: string;
  competitorName: string;
}

export async function analyzeCompetitor(url: string): Promise<AnalysisResult> {
  const page = await scrapePage(url);
  const domain = new URL(url).hostname;
  const competitorName = domainName(url);
  const industry = guessIndustry(domain, url);

  const pageSummary = `网站: ${page.title}\n描述: ${page.description}\n正文摘要: ${page.bodyText.substring(0, 5000)}`;

  // Build AI analysis prompt
  const aiPrompt = [
    `分析以下竞品网站（${competitorName}），生成专业电商SaaS竞品分析报告。基于网页真实内容，不要编造。`,
    ``,
    pageSummary,
    ``,
    `请按以下格式输出：`,
    ``,
    `### 产品描述`,
    `用2-3句话描述这个产品是什么、解决什么问题、面向谁。`,
    ``,
    `### 产品定位`,
    `价格区间：(免费/低价/中端/高端/企业级)`,
    `目标用户：(列出具体用户群，如"中小电商卖家"、"品牌营销团队")`,
    `核心卖点：(产品最核心的差异化价值)`,
    `定价模式：(SaaS订阅/按量付费/免费增值/买断)`,
    ``,
    `### 功能对比`,
    `逐条列出核心功能，每条格式：功能名 | 竞品表现 | 我方(飞书AI视频)表现 | 优势方`,
    ``,
    `### 市场分析`,
    `公司阶段：(初创/成长/成熟)`,
    `增长趋势：(分析产品更新频率、用户增长势头)`,
    `主要市场：(北美/欧洲/中国/全球)`,
    `竞争类型：(直接竞争/间接竞争)`,
    ``,
    `### SWOT分析`,
    `竞品优势：`,
    `竞品劣势：`,
    `我方机会：`,
    `我方威胁：`,
    ``,
    `### 内容策略`,
    `主要平台：`,
    `内容类型：`,
    `发布频率：`,
    ``,
    `### 核心发现`,
    `3-5条最重要的分析结论。`,
    ``,
    `### 行动建议`,
    `基于分析给出3-5条具体、可执行的行动建议。`,
  ].join("\n");

  const aiResult = await aiAnalyze(aiPrompt);

  // Fallback analysis if AI fails
  const fallbackFeatures: FeatureComparisonItem[] = [
    { feature: "AI视频生成", competitor: page.description ? "支持" : "未知", ours: "灵客AI多模型支持", advantage: "ours" },
    { feature: "模板库", competitor: "标准模板", ours: "飞书生态联动模板", advantage: "ours" },
    { feature: "团队协作", competitor: "基础分享", ours: "飞书深度协同", advantage: "ours" },
    { feature: "数据分析", competitor: "基础统计", ours: "飞书表格数据沉淀", advantage: "ours" },
  ];

  const fallbackSWOT: SWOTItem = {
    strengths: [parseSection(aiResult, "竞品优势") || `${competitorName}在AI视频领域有成熟产品`],
    weaknesses: [parseSection(aiResult, "竞品劣势") || "缺少深度团队协作能力"],
    opportunities: ["飞书生态集成是独特壁垒", "企业级市场对协同需求强烈", "可切入飞书存量客户"],
    threats: ["竞品可能快速补齐协作短板", "AI视频赛道竞争加剧"],
  };

  const fallbackPositioning: ProductPositioning = {
    priceRange: parseSection(aiResult, "价格区间") || "中端",
    targetUsers: parseList(parseSection(aiResult, "目标用户")) || ["内容创作者", "短视频运营"],
    coreValueProp: parseSection(aiResult, "核心卖点") || page.description || "AI驱动的视频内容创作工具",
    pricingModel: parseSection(aiResult, "定价模式") || "SaaS订阅",
    marketSegment: "视频内容SaaS",
  };

  const fallbackMarket: MarketAnalysis = {
    companySize: parseSection(aiResult, "公司阶段") || "成长期",
    estimatedMarketShare: "待量化分析",
    growthTrend: parseSection(aiResult, "增长趋势") || "上升",
    primaryRegions: parseList(parseSection(aiResult, "主要市场")) || ["全球"],
    competitorType: parseSection(aiResult, "竞争类型") || "直接竞争",
  };

  const fallbackContent: ContentStrategy = {
    primaryPlatforms: parseList(parseSection(aiResult, "主要平台")) || ["YouTube", "官网"],
    contentTypes: parseList(parseSection(aiResult, "内容类型")) || ["产品演示", "教程"],
    avgDuration: "2-5分钟",
    postingFrequency: parseSection(aiResult, "发布频率") || "周更",
    engagementLevel: "中",
    topPerformingTopics: ["产品功能更新", "使用技巧"],
  };

  return {
    productDescription: parseSection(aiResult, "产品描述") || `${competitorName}是一个${industry}领域的AI视频创作工具，${page.description || "帮助用户高效制作视频内容"}`,
    productPositioning: fallbackPositioning,
    features: parseSection(aiResult, "功能对比") ? parseList(parseSection(aiResult, "功能对比")).map(line => {
      const parts = line.split("|").map(s => s.trim());
      return {
        feature: parts[0] || line,
        competitor: parts[1] || "未知",
        ours: parts[2] || "飞书AI视频平台",
        advantage: (parts[3] || "").includes("我方") || (parts[3] || "").includes("飞书") ? "ours" as const : "competitor" as const,
      };
    }) : fallbackFeatures,
    marketAnalysis: fallbackMarket,
    swot: fallbackSWOT,
    contentStrategy: fallbackContent,
    referencedVideos: [],
    keyInsights: parseSection(aiResult, "核心发现") || `${competitorName}在AI视频生成方面有一定积累，但其产品侧重于个人创作者，缺少团队协作和数据沉淀能力，这正是我方依托飞书生态的差异化机会。`,
    actionableRecommendations: parseList(parseSection(aiResult, "行动建议")) || [
      `对标${competitorName}的核心功能，优先补齐AI视频生成的基础体验`,
      `重点宣传飞书生态的团队协作+数据闭环能力`,
      `针对${competitorName}的定价策略，制定更有竞争力的定价`,
    ],
    industry,
    competitorName,
  };
}
