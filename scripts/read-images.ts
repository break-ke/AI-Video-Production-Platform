import { readFileSync } from "fs";
import path from "path";

const LINGKE_KEY = process.env.LINGKE_API_KEY || "";
const LINGKE_BASE = process.env.LINGKE_BASE_URL || "https://api.ai6800.com/api";

async function geminiImageChat(
  systemPrompt: string,
  userText: string,
  imagePaths: string[]
): Promise<string> {
  const parts: Record<string, unknown>[] = [{ text: userText }];

  for (const imgPath of imagePaths) {
    const absPath = path.join(process.cwd(), "public", imgPath);
    const buffer = readFileSync(absPath);
    const b64 = buffer.toString("base64");
    parts.push({
      inline_data: {
        mime_type: "image/jpeg",
        data: b64,
      },
    });
  }

  const body = {
    contents: [{ role: "user", parts }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.1,
      thinkingConfig: { thinkingBudget: 512 },
    },
  };

  const res = await fetch(
    `${LINGKE_BASE}/v1beta/models/gemini-3.1-pro-preview:generateContent`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LINGKE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();
  const parts_ = data.candidates?.[0]?.content?.parts;
  if (!parts_ || !Array.isArray(parts_)) {
    console.error("No parts:", JSON.stringify(data).substring(0, 500));
    return "";
  }

  return parts_
    .filter((p: Record<string, unknown>) => !p.thought)
    .map((p: Record<string, unknown>) => p.text || "")
    .join("");
}

async function main() {
  const result = await geminiImageChat(
    "You are an OCR expert. Read ALL text from the images precisely. Output everything in the original language (Chinese). Include all field names, table headers, values, notes, and example content. Do not summarize or skip anything.",
    "Please read these two storyboard template images and output ALL their text content verbatim.",
    ["uploads/storyboard_template_1.jpg", "uploads/storyboard_template_2.jpg"]
  );
  console.log("=== RESULT ===");
  console.log(result);
  console.log("=== END ===");
}

main().catch((e) => console.error("Error:", e.message));
