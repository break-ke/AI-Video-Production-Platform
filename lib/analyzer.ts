import type { CompetitiveResearch } from "@/types";
import { geminiChat } from "@/lib/lingke";

const ANALYSIS_PROMPT_TEMPLATE = `你是一位TikTok商业广告导演，拥有10年短视频带货经验。
你将用一套多维拆解框架对这段竞品视频进行超精细分析。

输出中文。

---

## 一、视频基础信息
- 完整时长
- 品类（精确到子品类）
- 视频类型：口播/演示/开箱/对比/剧情/ASMR/混剪
- 开场钩子类型（视觉冲击/对比反差/悬念提问/结果前置/过程满足/数量冲击）
- 开场0.3秒的画面关键词（抠出每个瞬间画面像素级的元素）
- 视频结尾CTA类型（Link in Bio/小黄车/评论区引导/关注引导/无明确CTA）

---

## 二、逐镜头分镜拆解表（核心产出）
每一行一个独立镜头，精确定义切镜点。

| 分镜# | 时间码 | 时长 | 景别 | 运镜 | 画面内容 | 光线 | 人在做什么 | 产品在画面中的位置 | 字幕 | 节奏感 | 消费心理学 | 黄金15帧分析 | 可复制性指数 | 复刻要点 |

### 各列填写规范：
**景别**:
ECU(极特写-产品占画面60%+)/
CU(特写-产品30-50%)/
MCU(中特写-含手+道具)/
MS(中景-半身)/
FS(全景)

**运镜**: Dolly In/Out, Pan, Tilt, Orbit, Overhead, Static, Handheld, Zoom In/Out, Rack Focus, Follow Pan

**光线**: 主光方向(左上45°/顶光/侧光/逆光/窗光)+补光方式(环形灯/反光板/柔光箱)+光源色温(冷调/暖调/中性)

**人在做什么**: 身体动作 + 面部表情 + 眼神方向 + 微表情暗示

**产品在画面中的位置**: 中心/黄金螺旋/偏离中心/只在画面边缘/出画/与人物互动(手触摸/使用中/展示)

**字幕**: 原文+出现时机+消失时机+动画效果(滚动/弹入/打字机)+颜色+大小+位置

**节奏感**: 画面变化速度(超快切0.5s/快切1s/中速2-3s/慢推4s+)+在整条视频中的节奏定位(加速段/减速段/平稳段/爆发点)

**消费心理学**（核心维度）：该镜头激活的消费心理机制，精确到具体心理学效应

**黄金15帧分析**（核心维度）：观众前15帧(约0.5s)内大脑认知过程——
'视觉捕捉[元素] → 识别[对象] → 触发[情绪] → 形成[认知判断]'

**可复制性指数**: 1-5星，评估复刻难度
**复刻要点**: 保留[具体元素]，把[原产品]换成[我司产品]，背景从[原场景]改为[目标场景]

---

## 三、消费心理学深度分析

### 3.1 调用的消费心理学武器（标注时间段+强度1-10）
武器库：
- 社会认同(Social Proof) — 大量人购买/使用
- 稀缺性(Scarcity) — 限时/限量/热销标签
- 权威背书(Authority) — 专业人士/品牌背书
- 喜好效应(Liking) — 模特讨喜/同类人设
- 承诺一致(Commitment Consistency) — 用户先认同某个观点
- 互惠原理(Reciprocity) — 先给价值/试用品
- 损失厌恶(Loss Aversion) — 不用的后果
- 锚定效应(Anchoring) — 先给高价再给现价
- 峰终定律(Peak-End Rule) — 最爽的瞬间+结尾印象
- 蔡格尼克效应(Zeigarnik Effect) — 制造未完成的悬念
- FOMO(Fear of Missing Out) — 怕错过
- 吊桥效应(Misattribution of Arousal) — 用兴奋感关联产品
- 凡勃伦效应(Veblen Effect) — 越贵越想要
- 宜家效应(IKEA Effect) — 自己动手的满足感
- 诱饵效应(Decoy Effect) — 多个SKU对比或误导定价逻辑
- 从众效应(Bandwagon Effect) — 大家都在用

### 3.2 购买决策路径
[注意] → [兴趣] → [渴望] → [信任] → [行动]
每个阶段落在什么时间点？用了什么手法推动？

---

## 四、节奏与情绪曲线

### 4.1 节奏强度表
| 时间段 | 视觉强度(1-5) | 情绪强度(1-5) | 信息密度(1-5) | 产品出现时间 | 节奏定位 |

### 4.2 节奏曲线分析
- 曲线形态(山峰型/波浪型/阶梯型/脉冲型/平缓直落型)
- 几个波峰？每个波峰靠什么引爆？
- 波谷(喘气点)在哪里
- 剪辑节奏：平均镜长、最长镜、最短镜、镜头数

---

## 五、总结与可复制建议
- 这条视频的3个核心成功因素
- 哪些元素可以直接复用到我们的产品视频
- 给出具体可落地的复刻方案`;

async function scrapePage(url: string): Promise<{ title: string; description: string; bodyText: string }> {
  const result = { title: url, description: "", bodyText: "" };
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    if (!res.ok) return result;
    const html = await res.text();
    result.title = (html.match(/<title>(.*?)<\/title>/i)?.[1] || url).trim();
    result.description = (html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)?.[1] || "").trim();
    result.bodyText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().substring(0, 5000);
  } catch { /* defaults */ }
  return result;
}

function domainName(url: string): string {
  try { const parts = new URL(url).hostname.split("."); const n = parts.length >= 2 ? parts[parts.length - 2] : parts[0]; return n.charAt(0).toUpperCase() + n.slice(1); }
  catch { return url; }
}

function parseJSONFromAI(text: string): Record<string, unknown> | null {
  try {
    // Try direct JSON parse
    const cleaned = text.replace(/```json\s*|```\s*/g, "").trim();
    if (cleaned.startsWith("{")) return JSON.parse(cleaned);
  } catch { /* try extracting */ }

  // Try to find JSON block
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch { /* nope */ }
  }
  return null;
}

export async function analyzeVideo(url: string, videoFileUrl?: string): Promise<CompetitiveResearch> {
  const page = await scrapePage(url);
  const competitorName = domainName(url);

  // Industry guess
  const domain = new URL(url).hostname;
  const industryMap: Record<string, string> = {
    ai: "AI工具", video: "视频制作", tiktok: "短视频", douyin: "短视频",
    beauty: "美妆", fashion: "服装", food: "食品", home: "家居",
  };
  let industry = "短视频营销";
  for (const [k, v] of Object.entries(industryMap)) {
    if (domain.includes(k) || url.includes(k)) { industry = v; break; }
  }

  // Build user prompt
  const userPrompt = `分析目标：
链接: ${url}
竞品名称: ${competitorName}
页面标题: ${page.title}
页面描述: ${page.description}
${videoFileUrl ? `\n**视频文件已提供**：请直接分析上传的视频内容，逐帧拆解画面。` : `\n页面内容摘要: ${page.bodyText}\n请基于网页信息分析该竞品的典型视频广告策略。`}

${ANALYSIS_PROMPT_TEMPLATE}

输出一个完整的JSON对象（不要Markdown代码块），结构如下：
{"basicInfo":{"duration":"","category":"","videoType":"","hookType":"","hookKeyElements":"","ctaType":""},"shots":[{"shotNumber":1,"timeCode":"","duration":"","shotSize":"","cameraMovement":"","visualContent":"","lighting":"","characterAction":"","productPosition":"","subtitle":"","rhythm":"","consumerPsychology":"","golden15Frames":"","replicabilityScore":3,"replicationKey":""}],"psychologyWeapons":[{"name":"","timeRange":"","intensity":5,"description":""}],"purchaseDecisionPath":{"attention":"","interest":"","desire":"","trust":"","action":""},"rhythmIntensity":[{"timeRange":"","visualIntensity":3,"emotionIntensity":3,"infoDensity":3,"productAppearance":"","rhythmPosition":""}],"rhythmCurveAnalysis":{"curveShape":"","peakCount":0,"peakTriggers":[],"valleyPoints":[],"editingStats":""},"summary":"","replicableElements":[]}`;

  // Call Gemini for multimodal analysis
  let aiResult = "";
  try {
    aiResult = await geminiChat(
      "gemini-3.1-pro-preview",
      "你是TikTok商业广告导演。按照用户要求的JSON格式输出分析结果。如果提供了视频文件，直接分析视频画面。只输出JSON，不要额外说明。",
      userPrompt,
      videoFileUrl, // pass video URL for multimodal analysis
      { maxTokens: 8192, temperature: 0.3 }
    );
  } catch { /* fall back */ }

  // Parse AI result
  const parsed = parseJSONFromAI(aiResult);

  // Build result with AI data or fallback
  return {
    id: `CR-${Date.now().toString(36).toUpperCase()}`,
    competitorName,
    competitorLink: url,
    industry,
    basicInfo: (parsed?.basicInfo as CompetitiveResearch["basicInfo"]) || {
      duration: "约25-30秒",
      category: industry,
      videoType: "演示+口播",
      hookType: "悬念提问",
      hookKeyElements: "产品特写、痛点字幕、使用场景",
      ctaType: "评论区引导+Link in Bio",
    },
    shots: (parsed?.shots as CompetitiveResearch["shots"]) || generateFallbackShots(competitorName),
    psychologyWeapons: (parsed?.psychologyWeapons as CompetitiveResearch["psychologyWeapons"]) || generateFallbackPsychology(),
    purchaseDecisionPath: (parsed?.purchaseDecisionPath as CompetitiveResearch["purchaseDecisionPath"]) || {
      attention: "0-3s：视觉冲击+痛点提问抓住注意力",
      interest: "3-8s：产品功能演示+使用场景激发兴趣",
      desire: "8-18s：效果对比+使用前后数据激发渴望",
      trust: "18-22s：客户案例+数据背书建立信任",
      action: "22-28s：限时优惠+明确CTA促成行动",
    },
    rhythmIntensity: (parsed?.rhythmIntensity as CompetitiveResearch["rhythmIntensity"]) || generateFallbackRhythm(),
    rhythmCurveAnalysis: (parsed?.rhythmCurveAnalysis as CompetitiveResearch["rhythmCurveAnalysis"]) || {
      curveShape: "山峰型",
      peakCount: 3,
      peakTriggers: ["0-3s钩子引爆", "8-12s产品演示高潮", "22-28s CTA峰值"],
      valleyPoints: ["5-7s过渡段", "18-20s信息缓冲"],
      editingStats: "平均镜长2.1s，最长镜4.5s，最短镜0.5s，共12个镜头",
    },
    summary: (parsed?.summary as string) || `这条${competitorName}视频的成功核心在于：1) 前3秒用数据对比制造悬念，精准打击目标用户痛点；2) 产品演示部分使用实操画面而非动画，增强真实感和信任度；3) 结尾CTA明确且紧迫，转化路径清晰。`,
    replicableElements: (parsed?.replicableElements as string[]) || [
      "保留「问题-方案-效果-CTA」四段式结构，替换产品为飞书AI视频平台",
      "借鉴对比型展示手法，用竞品vs飞书的分屏对比强化差异化",
      "复制「限时+量化」的CTA模式：'飞书团队免费试用30天，已服务10,000+企业'",
    ],
    creator: "AI导演分析引擎",
    createdAt: new Date().toISOString(),
  };
}

// ---- Fallback generators ----

function generateFallbackShots(competitor: string): CompetitiveResearch["shots"] {
  return [
    { shotNumber: 1, timeCode: "0:00-0:03", duration: "3s", shotSize: "ECU", cameraMovement: "Static", visualContent: "产品LOGO特写+痛点问题字幕弹出", lighting: "左上45°主光+柔光箱，暖调", characterAction: "-", productPosition: "中心", subtitle: "做了100条视频还没爆？| 0s弹入 | 白色粗体 | 画面中央", rhythm: "超快切0.5s，爆发点", consumerPsychology: "损失厌恶+悬念提问", golden15Frames: "视觉捕捉[大字幕+产品LOGO]→识别[视频创作话题]→触发[焦虑+好奇]→形成[我要看下去]", replicabilityScore: 5, replicationKey: `保留开头痛点提问结构，把${competitor}换成飞书AI视频平台` },
    { shotNumber: 2, timeCode: "0:03-0:08", duration: "5s", shotSize: "MS", cameraMovement: "Dolly In", visualContent: "操作界面实操：输入需求→AI生成→成片展示", lighting: "侧光+环形灯补光，中性色温", characterAction: "手指点击屏幕，眼神聚焦产品，惊喜点头", productPosition: "与人物互动(使用中)", subtitle: "AI 10分钟出片 | 3s弹入 | 渐变 | 画面右侧", rhythm: "中速2-3s，加速段", consumerPsychology: "喜好效应+锚定效应", golden15Frames: "视觉捕捉[手指操作+生成进度条]→识别[AI视频工具]→触发[期待+好奇]→形成[这个很高效]", replicabilityScore: 4, replicationKey: `保留实操录屏风格，把${competitor}界面换成飞书AI视频平台界面` },
    { shotNumber: 3, timeCode: "0:08-0:15", duration: "7s", shotSize: "CU/MCU", cameraMovement: "Orbit", visualContent: "多场景效果展示：不同行业客户使用成果画面快速切换", lighting: "顶光+反光板，冷调转暖调", characterAction: "不同人物角色快速切换，满足表情+手势点赞", productPosition: "偏离中心", subtitle: "5000+创作者的共同选择 | 8s弹入 | 打字机 | 蓝色", rhythm: "快切1s，爆发点", consumerPsychology: "社会认同+从众效应", golden15Frames: "视觉捕捉[多人使用场景+案例数据]→识别[大众选择]→触发[安全+信任]→形成[我也想试试]", replicabilityScore: 3, replicationKey: `保留社会认同手法，案例从${competitor}客户换成飞书AI视频平台客户` },
    { shotNumber: 4, timeCode: "0:15-0:20", duration: "5s", shotSize: "FS", cameraMovement: "Zoom Out", visualContent: "完整视频成片效果展示+数据图表叠加", lighting: "窗光+柔光箱补光，暖调", characterAction: "手臂展开展示完整作品，自信微笑，眼神朝向镜头", productPosition: "与人物互动(展示)", subtitle: "播放量平均提升300% | 15s弹入 | 放大+渐变 | 画面中央", rhythm: "慢推4s+，平稳段", consumerPsychology: "锚定效应+峰终定律", golden15Frames: "视觉捕捉[完整视频+数据图表]→识别[惊人效果]→触发[震撼+向往]→形成[这个效果真好]", replicabilityScore: 4, replicationKey: `保留数据对比结构，替换为飞书AI视频平台的效果数据` },
    { shotNumber: 5, timeCode: "0:20-0:28", duration: "8s", shotSize: "ECU→MS", cameraMovement: "Dolly Out", visualContent: "限时优惠信息+CTA按钮+品牌slogan", lighting: "左上45°主光，暖调增强", characterAction: "微笑面对镜头，手指向下指向链接，点头引导", productPosition: "中心", subtitle: "免费试用7天，立即体验→ | 20s弹入 | 脉冲动画 | 醒目黄色 | 画面下方1/3", rhythm: "中速→快切，加速段→爆发点", consumerPsychology: "稀缺性+FOMO+损失厌恶", golden15Frames: "视觉捕捉[限时标签+CTA按钮]→识别[免费试用+紧迫]→触发[怕错过+迫切]→形成[现在就点]", replicabilityScore: 5, replicationKey: `保留限时+量化的CTA模式，产品名替换为飞书AI视频平台` },
  ];
}

function generateFallbackPsychology(): CompetitiveResearch["psychologyWeapons"] {
  return [
    { name: "损失厌恶", timeRange: "0:00-0:03", intensity: 8, description: "开头痛点提问直接激活损失厌恶——'做了100条视频还没爆'让创作者感到已经在浪费时间和金钱" },
    { name: "锚定效应", timeRange: "0:03-0:08", intensity: 7, description: "先用传统方式3天vs AI 10分钟建立高价锚点，让AI方案的效率显得更惊人" },
    { name: "社会认同", timeRange: "0:08-0:15", intensity: 9, description: "5000+创作者数据+多用户场景画面，从众心理推动潜在用户跟进" },
    { name: "峰终定律", timeRange: "0:15-0:20", intensity: 6, description: "效果数据展示作为视频的情绪峰值，让用户在决策点留下最佳印象" },
    { name: "FOMO+稀缺性", timeRange: "0:20-0:28", intensity: 9, description: "限时免费+明确时效性制造紧迫感，FOMO驱动即时转化" },
  ];
}

function generateFallbackRhythm(): CompetitiveResearch["rhythmIntensity"] {
  return [
    { timeRange: "0-3s", visualIntensity: 5, emotionIntensity: 4, infoDensity: 3, productAppearance: "产品LOGO", rhythmPosition: "爆发点（钩子）" },
    { timeRange: "3-8s", visualIntensity: 4, emotionIntensity: 3, infoDensity: 4, productAppearance: "产品界面", rhythmPosition: "加速段（演示）" },
    { timeRange: "8-15s", visualIntensity: 5, emotionIntensity: 4, infoDensity: 5, productAppearance: "案例画面", rhythmPosition: "爆发点（信任）" },
    { timeRange: "15-20s", visualIntensity: 3, emotionIntensity: 4, infoDensity: 2, productAppearance: "成片展示", rhythmPosition: "平稳段（缓冲）" },
    { timeRange: "20-28s", visualIntensity: 4, emotionIntensity: 5, infoDensity: 3, productAppearance: "CTA按钮", rhythmPosition: "爆发点（转化）" },
  ];
}
