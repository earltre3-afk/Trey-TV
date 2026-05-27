// ─────────────────────────────────────────────────────────────────────────────
// Trey-I chat moderation
//
// Uses the existing `@google/genai` plumbing from vertex.server.ts but calls
// the API directly here so we can use a strict JSON-only response with low
// temperature + short max tokens for fast, deterministic verdicts.
// ─────────────────────────────────────────────────────────────────────────────
import { GoogleGenAI } from "@google/genai";

export type ModerationVerdict = "clean" | "nudge" | "block" | "timeout";
export type ModerationSeverity = "none" | "low" | "medium" | "high";

export type ModerationResult = {
  verdict: ModerationVerdict;
  severity: ModerationSeverity;
  reason: string;
};

const SYSTEM_PROMPT =
  "You are Trey-I, a real-time chat moderator for Trey TV. Evaluate the user's message " +
  "for safety. Reply with ONLY a JSON object on a single line, no markdown fences, no commentary:\n" +
  '{ "verdict": "clean"|"nudge"|"block"|"timeout", "severity": "none"|"low"|"medium"|"high", "reason": "short reason or empty" }\n\n' +
  "Rules:\n" +
  "- clean: normal speech, banter, profanity directed at no one. Severity: none.\n" +
  "- nudge: rude, heated, or borderline. Publish anyway with a private warning. Severity: low.\n" +
  "- block: insults at a specific person, harassment, sexual content, spam links, doxxing, " +
  "  self-harm encouragement, hate-speech. Severity: medium.\n" +
  "- timeout: slurs, threats, illegal content, sexualized minors. Severity: high.\n\n" +
  "Be conservative — when in doubt, prefer nudge over block. Trey TV embraces creator energy; " +
  "do not censor harmless trash-talk.";

const MODEL_VERTEX = "gemini-2.5-flash";
const MODEL_GEMINI = "gemini-2.0-flash";
const TIMEOUT_MS = 1500;

function buildClient(): { genai: GoogleGenAI; model: string } | null {
  const project =
    process.env.VERTEX_PROJECT?.trim() ||
    process.env.GOOGLE_CLOUD_PROJECT?.trim();
  const location =
    process.env.VERTEX_LOCATION?.trim() ||
    process.env.GOOGLE_CLOUD_LOCATION?.trim() ||
    "us-central1";

  if (project) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { genai: new GoogleGenAI({ vertexai: true, project, location } as any), model: MODEL_VERTEX };
  }
  const apiKey =
    process.env.GOOGLE_GENAI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim();
  if (!apiKey) return null;
  return { genai: new GoogleGenAI({ apiKey }), model: MODEL_GEMINI };
}

function safeDefault(reason: string): ModerationResult {
  return { verdict: "clean", severity: "none", reason };
}

function parseVerdict(raw: string): ModerationResult | null {
  // Strip code fences if Gemini wrapped the JSON despite instructions.
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    const obj = JSON.parse(cleaned) as Partial<ModerationResult>;
    const verdict = obj.verdict;
    const severity = obj.severity;
    if (verdict !== "clean" && verdict !== "nudge" && verdict !== "block" && verdict !== "timeout") return null;
    if (severity !== "none" && severity !== "low" && severity !== "medium" && severity !== "high") return null;
    return {
      verdict,
      severity,
      reason: typeof obj.reason === "string" ? obj.reason.slice(0, 200) : "",
    };
  } catch {
    return null;
  }
}

export async function moderateChatMessage(body: string): Promise<ModerationResult> {
  // Guard against empty / huge inputs (DB already caps at 500 chars).
  if (!body || body.length > 600) return safeDefault("invalid_length");

  const client = buildClient();
  if (!client) {
    // No AI configured — fail open so chat still works in dev without Gemini keys.
    return safeDefault("no_ai_configured");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const result = await client.genai.models.generateContent({
      model: client.model,
      contents: [{ role: "user", parts: [{ text: body }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0,
        maxOutputTokens: 100,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        abortSignal: controller.signal,
      } as Record<string, unknown>,
    });

    const text =
      (result as unknown as { text?: string }).text ??
      (result as unknown as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })
        .candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ??
      "";

    const parsed = parseVerdict(text);
    if (!parsed) {
      console.warn("[moderate_chat] could not parse verdict from:", text.slice(0, 120));
      return safeDefault("unparseable_response");
    }
    return parsed;
  } catch (err) {
    if ((err as { name?: string })?.name === "AbortError") return safeDefault("timeout");
    console.warn("[moderate_chat] API error:", err);
    return safeDefault("api_error");
  } finally {
    clearTimeout(timer);
  }
}
