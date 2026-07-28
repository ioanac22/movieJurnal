const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

type GeminiOptions = {
  systemInstruction?: string;
  json?: boolean;
  temperature?: number;
};

export async function askGemini(
  prompt: string,
  options: GeminiOptions = {}
): Promise<string> {
  const { systemInstruction, json = false, temperature = 0.7 } = options;

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      ...(json ? { responseMimeType: "application/json" } : {}),
    },
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY!,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Gemini ${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error("Empty Gemini response");
  return text;
}

export function parseJsonSafe<T>(raw: string): T {
  const cleaned = raw.replace(/```json\s*|```/g, "").trim();
  return JSON.parse(cleaned) as T;
}