/**
 * Minimal browser-side client for Google's Gemini API (bring-your-own-key).
 *
 * The whole app is backend-free, so the user's own free API key lives in the
 * Zustand store / localStorage and we call Gemini directly from the browser.
 * No secrets on a server, each user uses their own free quota.
 *
 * Get a free key: https://aistudio.google.com/app/apikey
 */

// gemini-2.5-flash is on the free tier and is vision-capable, so it can read an
// uploaded wireframe image. Kept as a constant so it's a one-line swap later.
export const GEMINI_MODEL = "gemini-2.5-flash";

const ENDPOINT = (model: string, key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
    key
  )}`;

export type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

export type GeminiTurn = { role: "user" | "model"; parts: GeminiPart[] };

export type GeminiRequest = {
  apiKey: string;
  /** System instruction steering tone / role. */
  system?: string;
  /** Conversation turns (most callers pass a single user turn). */
  contents: GeminiTurn[];
  /** Ask the model for strict JSON output. */
  json?: boolean;
  temperature?: number;
};

export class GeminiError extends Error {}

/**
 * Turns a data URL (`data:image/png;base64,AAAA...`) into the inline-data part
 * Gemini expects. Returns null for anything that isn't a base64 data URL.
 */
export function imagePartFromDataUrl(dataUrl: string): GeminiPart | null {
  const match = /^data:(.+?);base64,(.*)$/.exec(dataUrl);
  if (!match) return null;
  return { inlineData: { mimeType: match[1], data: match[2] } };
}

export async function callGemini(req: GeminiRequest): Promise<string> {
  const key = req.apiKey.trim();
  if (!key) {
    throw new GeminiError("No Gemini API key set. Add one to use the assistant.");
  }

  let res: Response;
  try {
    res = await fetch(ENDPOINT(GEMINI_MODEL, key), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: req.contents,
        ...(req.system
          ? { systemInstruction: { parts: [{ text: req.system }] } }
          : {}),
        generationConfig: {
          temperature: req.temperature ?? 0.4,
          ...(req.json ? { responseMimeType: "application/json" } : {}),
        },
      }),
    });
  } catch {
    throw new GeminiError(
      "Could not reach Gemini. Check your network connection and try again."
    );
  }

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.error?.message ?? "";
    } catch {
      /* ignore parse errors */
    }
    if (res.status === 400 && /api key/i.test(detail)) {
      throw new GeminiError("That API key was rejected. Double-check it and re-paste.");
    }
    if (res.status === 429) {
      throw new GeminiError(
        "Gemini free-tier rate limit hit. Wait a minute and try again."
      );
    }
    throw new GeminiError(
      detail || `Gemini request failed (HTTP ${res.status}).`
    );
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("");

  if (!text) {
    const blocked = data?.promptFeedback?.blockReason;
    throw new GeminiError(
      blocked
        ? `Gemini declined to respond (${blocked}).`
        : "Gemini returned an empty response."
    );
  }
  return text;
}
