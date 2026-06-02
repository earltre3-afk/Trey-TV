// ─────────────────────────────────────────────────────────────────────────────
// Trey-I chat moderation
//
// Refactored to utilize the centralized aiProvider.server.ts module.
// ─────────────────────────────────────────────────────────────────────────────
import { aiGenerateJson } from "../trey-i/aiProvider.server";

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

function safeDefault(reason: string): ModerationResult {
  return { verdict: "clean", severity: "none", reason };
}

function parseVerdict(raw: string): ModerationResult | null {
  // Strip code fences if API wrapped the JSON despite instructions.
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    const obj = JSON.parse(cleaned) as Partial<ModerationResult>;
    const verdict = obj.verdict;
    const severity = obj.severity;
    if (verdict !== "clean" && verdict !== "nudge" && verdict !== "block" && verdict !== "timeout")
      return null;
    if (severity !== "none" && severity !== "low" && severity !== "medium" && severity !== "high")
      return null;
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

  try {
    const parsed = await aiGenerateJson<any>({
      prompt: body,
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0,
      maxTokens: 100,
    });

    const parsedVerdict = parseVerdict(JSON.stringify(parsed));
    if (!parsedVerdict) {
      console.warn("[moderate_chat] could not parse verdict from:", parsed);
      return safeDefault("unparseable_response");
    }
    return parsedVerdict;
  } catch (err) {
    console.warn("[moderate_chat] API error:", err);
    return safeDefault("api_error");
  }
}
