interface AnalysisResult {
  keyword: string;
  industry: string;
  competitorName: string;
  sellingPoints: string;
  conclusion: string;
}

export async function analyzeCompetitor(url: string): Promise<AnalysisResult> {
  let pageContent = "";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    if (res.ok) {
      const html = await res.text();
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      const descMatch = html.match(
        /<meta[^>]+name="description"[^>]+content="([^"]*)"/i
      );
      const ogTitle = html.match(
        /<meta[^>]+property="og:title"[^>]+content="([^"]*)"/i
      );
      const ogDesc = html.match(
        /<meta[^>]+property="og:description"[^>]+content="([^"]*)"/i
      );
      pageContent = [
        titleMatch?.[1] || "",
        descMatch?.[1] || "",
        ogTitle?.[1] || "",
        ogDesc?.[1] || "",
        html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").slice(0, 3000),
      ].join("\n");
    }
  } catch {
    pageContent = `URL: ${url} (页面抓取失败，依赖URL和已知信息进行基础分析)`;
  }

  const urlObj = new URL(url);
  const domain = urlObj.hostname;

  const industries: Record<string, string> = {
    ".ai": "人工智能",
    ai: "人工智能",
    tech: "科技",
    video: "视频制作",
    market: "数字营销",
    voice: "语音技术",
    template: "内容创作",
    storyboard: "视频制作",
    creator: "内容创作",
    short: "短视频",
    clip: "视频制作",
  };

  let industry = "数字营销";
  for (const [key, val] of Object.entries(industries)) {
    if (domain.includes(key) || url.includes(key)) {
      industry = val;
      break;
    }
  }

  const domainParts = domain.split(".");
  const competitorName =
    domainParts.length >= 2
      ? domainParts[domainParts.length - 2].charAt(0).toUpperCase() +
        domainParts[domainParts.length - 2].slice(1)
      : domain;

  const keywords = extractKeywords(pageContent, url);

  return {
    keyword: keywords[0] || "视频内容",
    industry,
    competitorName,
    sellingPoints: generateSellingPoints(pageContent, domain),
    conclusion: generateConclusion(competitorName, industry),
  };
}

function extractKeywords(content: string, url: string): string[] {
  const keywordMap: Record<string, string> = {
    ai: "AI视频生成",
    video: "视频创作",
    short: "短视频营销",
    voice: "AI配音",
    template: "视频模板",
    storyboard: "故事板自动生成",
    clip: "自动剪辑",
    market: "视频营销",
    creator: "内容创作",
    edit: "视频编辑",
    generate: "AI视频生成",
    dub: "AI配音",
  };

  const found: string[] = [];
  const lower = (content + url).toLowerCase();
  for (const [key, val] of Object.entries(keywordMap)) {
    if (lower.includes(key) && !found.includes(val)) {
      found.push(val);
    }
  }
  return found.length > 0 ? found : ["视频内容创作"];
}

function generateSellingPoints(content: string, domain: string): string {
  const lower = content.toLowerCase();
  const points: string[] = [];
  let idx = 1;

  if (lower.includes("ai") || lower.includes("artificial")) {
    points.push(`${idx}. AI智能分析，自动识别视频核心卖点`);
    idx++;
  }
  if (lower.includes("template") || lower.includes("模板")) {
    points.push(`${idx}. 丰富的视频模板库，支持快速内容复用`);
    idx++;
  }
  if (
    lower.includes("generate") ||
    lower.includes("生成") ||
    lower.includes("auto")
  ) {
    points.push(`${idx}. 自动化内容生成，降低人工制作成本`);
    idx++;
  }
  if (lower.includes("short") || lower.includes("短")) {
    points.push(`${idx}. 短视频形式，适配主流平台传播节奏`);
    idx++;
  }
  if (
    lower.includes("voice") ||
    lower.includes("dub") ||
    lower.includes("配音")
  ) {
    points.push(`${idx}. 多语言AI配音能力，覆盖全球市场`);
    idx++;
  }
  if (lower.includes("multi") || lower.includes("platform")) {
    points.push(`${idx}. 多平台一键分发，提升内容曝光效率`);
    idx++;
  }

  if (points.length === 0) {
    return `1. 视频内容创作工具\n2. 在线视频编辑能力\n3. 内容分发与管理平台`;
  }

  return points.join("\n");
}

function generateConclusion(competitor: string, industry: string): string {
  return `基于对${competitor}的分析，该竞品在${industry}领域具有一定的市场影响力。建议我方重点关注其内容策略、用户增长路径和变现模式，结合飞书生态的协同优势，在差异化定位和用户体验上建立竞争壁垒。`;
}
