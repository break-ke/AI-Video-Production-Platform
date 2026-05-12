const BASE = process.env.LINGKE_BASE_URL || "https://api.ai6800.com/api";
const API_KEY = process.env.LINGKE_API_KEY || "";

async function lingkeFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`灵客AI error: ${res.status} ${err}`);
  }
  return res.json();
}

// -------- Image Generation --------

export interface MediaGenerateParams {
  model: string;
  params: Record<string, string | number | boolean | string[]>;
}

export interface TaskStatus {
  task_id: string;
  state: "pending" | "processing" | "completed" | "failed";
  progress: number;
  is_final: boolean;
  result_url?: string;
  refunded?: boolean;
  error?: string;
}

export async function generateImage(
  model: string,
  prompt: string,
  extraParams: Record<string, string | number | boolean> = {}
): Promise<string> {
  const body: MediaGenerateParams = {
    model,
    params: { prompt, ...extraParams },
  };

  const data = await lingkeFetch("/v1/media/generate", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const taskId = data.task_id || data.data?.task_id;
  if (!taskId) throw new Error(`No task_id returned: ${JSON.stringify(data)}`);

  const resultUrl = await pollTask(taskId);
  return resultUrl;
}

export async function pollTask(
  taskId: string,
  maxWaitSeconds = 600,
  interval = 5
): Promise<string> {
  const deadline = Date.now() + maxWaitSeconds * 1000;

  while (Date.now() < deadline) {
    const status: TaskStatus = await lingkeFetch(
      `/v1/skills/task-status?task_id=${taskId}`
    );

    if (status.result_url) return status.result_url;

    if (status.is_final) {
      if (status.state === "failed" || status.error) {
        throw new Error(`Task failed: ${status.error || "unknown error"}`);
      }
      throw new Error("Task completed but no result_url");
    }

    await new Promise((r) => setTimeout(r, interval * 1000));
  }

  throw new Error(`Task ${taskId} timed out after ${maxWaitSeconds}s`);
}

// -------- Chat Completion (OpenAI format) --------

export async function chatCompletion(
  model: string,
  messages: { role: string; content: string }[],
  options: { maxTokens?: number; temperature?: number; stream?: boolean } = {}
): Promise<string> {
  const data = await lingkeFetch("/v1/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model,
      messages,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature ?? 0.7,
      stream: false,
    }),
  });

  return data.choices?.[0]?.message?.content || "";
}

// -------- Balance check --------

export async function checkBalance() {
  const data = await lingkeFetch("/v1/skills/balance");
  return { balance: data.balance as number, unit: data.unit as string };
}
