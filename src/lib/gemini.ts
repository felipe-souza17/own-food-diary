import "server-only";

import { GEMINI_DEFAULT_MODEL } from "@/lib/constants";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

/** Schema (subset OpenAPI) que o Gemini deve seguir na resposta. */
const responseSchema = {
  type: "object",
  properties: {
    freeMeal: { type: "boolean" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          nome: { type: "string" },
          gramas: { type: "number" },
          calories: { type: "number" },
          protein: { type: "number" },
          carbs: { type: "number" },
          fat: { type: "number" },
          fiber: { type: "number" },
        },
        required: ["nome", "gramas", "calories", "protein", "carbs", "fat", "fiber"],
      },
    },
  },
  required: ["freeMeal", "items"],
} as const;

export function isGeminiEnabled(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || GEMINI_DEFAULT_MODEL;
}

/**
 * Envia um prompt ao Gemini exigindo resposta JSON e devolve o texto bruto.
 * @throws {Error} quando não há chave, timeout ou resposta inválida.
 */
export async function generateJson(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(
      `${GEMINI_ENDPOINT}/${getGeminiModel()}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.2,
          },
        }),
      },
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Gemini respondeu ${response.status}: ${detail.slice(0, 200)}`);
    }

    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Resposta do Gemini sem conteúdo.");
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}
