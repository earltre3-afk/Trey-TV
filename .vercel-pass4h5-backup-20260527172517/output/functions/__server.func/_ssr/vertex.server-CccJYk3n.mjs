import { c as createServerRpc, a as createServerFn } from "./index.mjs";
import { G as GoogleGenAI } from "../_libs/google__genai.mjs";
import "../_libs/react.mjs";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/livekit__protocol.mjs";
import "../_libs/bufbuild__protobuf.mjs";
import "../_libs/livekit-server-sdk.mjs";
import "../_libs/jose.mjs";
import "node:buffer";
import "node:util";
import "node:fs";
import "node:path";
import "../_libs/p-retry.mjs";
import "../_libs/retry.mjs";
import "../_libs/google-auth-library.mjs";
import "child_process";
import "querystring";
import "fs";
import "../_libs/gaxios.mjs";
import "https";
import "../_libs/extend.mjs";
import "../_libs/gcp-metadata.mjs";
import "os";
import "../_libs/json-bigint.mjs";
import "../_libs/bignumber.js.mjs";
import "../_libs/google-logging-utils.mjs";
import "events";
import "process";
import "path";
import "../_libs/base64-js.mjs";
import "../_libs/ecdsa-sig-formatter.mjs";
import "../_libs/safe-buffer.mjs";
import "buffer";
import "../_libs/jws.mjs";
import "../_libs/jwa.mjs";
import "../_libs/buffer-equal-constant-time.mjs";
import "fs/promises";
import "node:stream/promises";
import "../_libs/ws.mjs";
import "zlib";
import "http";
import "net";
import "tls";
import "url";
const VALID_TASKS = ["widget_chat", "caption", "title", "description", "hashtags", "hook", "promo_caption", "bio", "prescribe_reasoning", "mood_suggestions", "admin_summary", "moderate_chat"];
const SYSTEM_PROMPTS = {
  widget_chat: "You are Trey-I, a creative co-pilot for Trey TV creators and viewers. Help with captions, post ideas, content strategy, mood drops, creative direction, and bio writing. Keep responses concise (2-4 sentences), conversational, and on-brand. Never refuse creative requests. If asked to generate a bio, do so directly without asking follow-up questions.",
  caption: "You are a social media copywriter for Trey TV, a premium creator platform. Generate a single punchy caption (2-3 sentences). Use the creator's context. No hashtags in the body. Authentic, not corporate.",
  title: "You are a content strategist for Trey TV. Suggest 3 compelling episode titles. Each 4-8 words, attention-grabbing, and searchable. Return as a numbered list.",
  description: "You are a content writer for Trey TV. Write a short engaging episode description (3-4 sentences). Include a hook, what viewers experience, and a soft call-to-action. No hashtags.",
  hashtags: "You are a social media strategist for Trey TV. Generate 8-12 relevant hashtags. Mix broad reach tags with niche/creator tags. Return as space-separated hashtags starting with #.",
  hook: "You are a content editor for Trey TV. Rewrite or improve the opening hook (first 10 seconds). Immediately grab attention, tease the payoff, create curiosity. Return 2-3 sentence hook script.",
  promo_caption: "You are a marketing copywriter for Trey TV. Write a promotional caption with a strong hook, why it's unmissable, and a CTA ('Watch now', 'Drop tonight', etc). Max 3 sentences.",
  bio: "You are a profile writer for Trey TV. Generate a compelling creator or viewer bio (2-3 sentences max). Make it personal, specific, and authentic. Avoid clichés. Reflect their personality and content style. Write the bio directly — do not ask follow-up questions.",
  prescribe_reasoning: "You are Trey-I, the recommendation engine for Trey TV. Based on a viewer's mood quiz answers, write a short personalized explanation (2-3 sentences) for why these recommendations match their vibe. Be warm, insightful, and specific to the mood data.",
  mood_suggestions: "You are a content curator for Trey TV. Based on the viewer's current mood and preferences, suggest 3-5 content themes or moods to explore tonight. Be specific and evocative. Format as a brief list.",
  admin_summary: "You are an admin assistant for Trey TV. Summarize the provided data clearly and concisely for a moderator. Highlight key metrics, anomalies, or action items. Plain prose, no markdown headers.",
  moderate_chat: `You are Trey-I, a real-time chat moderator for Trey TV. Evaluate the user's message for safety. Reply with ONLY a JSON object on a single line, no markdown fences, no commentary:
{ "verdict": "clean"|"nudge"|"block"|"timeout", "severity": "none"|"low"|"medium"|"high", "reason": "short reason or empty" }

Rules:
- clean: normal speech, banter, profanity directed at no one. Severity: none.
- nudge: rude, heated, or borderline. Publish anyway with a private warning. Severity: low.
- block: insults at a specific person, harassment, sexual content, spam links, doxxing,   self-harm encouragement, hate-speech. Severity: medium.
- timeout: slurs, threats, illegal content, sexualized minors. Severity: high.

Be conservative — when in doubt, prefer nudge over block. Trey TV embraces creator energy; do not censor harmless trash-talk.`
};
const MODEL_VERTEX = "gemini-2.5-flash";
const MODEL_GEMINI = "gemini-2.0-flash";
function buildClient() {
  const project = process.env.VERTEX_PROJECT?.trim() || process.env.GOOGLE_CLOUD_PROJECT?.trim();
  const location = process.env.VERTEX_LOCATION?.trim() || process.env.GOOGLE_CLOUD_LOCATION?.trim() || "us-central1";
  if (project) {
    return {
      genai: new GoogleGenAI({
        vertexai: true,
        project,
        location
      }),
      model: MODEL_VERTEX
    };
  }
  const apiKey = process.env.GOOGLE_GENAI_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Vertex AI: set VERTEX_PROJECT (+ optional VERTEX_LOCATION), or GOOGLE_GENAI_API_KEY for Gemini API fallback.");
  }
  return {
    genai: new GoogleGenAI({
      apiKey
    }),
    model: MODEL_GEMINI
  };
}
function sanitize(raw) {
  return raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim().slice(0, 2e3);
}
const validateVertexInput = (input) => ({
  task: VALID_TASKS.includes(input?.task) ? input.task : "widget_chat",
  prompt: typeof input?.prompt === "string" ? input.prompt.slice(0, 2e3) : "",
  context: typeof input?.context === "string" ? input.context.slice(0, 1e3) : void 0
});
const treyIGenerate_createServerFn_handler = createServerRpc({
  id: "dc9fdbe4622900b26d16a070da5d890bba29d2a01a406bb052087c871e4eaa97",
  name: "treyIGenerate",
  filename: "src/lib/trey-i/vertex.server.ts"
}, (opts) => treyIGenerate.__executeServer(opts));
const treyIGenerate = createServerFn({
  method: "POST"
}).inputValidator(validateVertexInput).handler(treyIGenerate_createServerFn_handler, async ({
  data
}) => {
  const {
    task,
    prompt,
    context
  } = data;
  if (!prompt.trim()) return {
    error: "Prompt is required"
  };
  try {
    const {
      genai,
      model
    } = buildClient();
    const systemInstruction = SYSTEM_PROMPTS[task];
    const userContent = context ? `Context: ${context}

Request: ${prompt}` : prompt;
    const result = await genai.models.generateContent({
      model,
      contents: [{
        role: "user",
        parts: [{
          text: userContent
        }]
      }],
      config: {
        systemInstruction,
        temperature: 0.8,
        maxOutputTokens: 512
      }
    });
    const text = result.text ?? result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text) return {
      error: "Empty response from AI"
    };
    return {
      text: sanitize(text)
    };
  } catch (err) {
    console.error("[treyIGenerate]", err);
    return {
      error: err instanceof Error ? err.message : "Generation failed"
    };
  }
});
const generateMusicReviewInsight_createServerFn_handler = createServerRpc({
  id: "e6faa3368ecd54bb4167f72663dc2bfc157d118957498a35784db1e49a31c399",
  name: "generateMusicReviewInsight",
  filename: "src/lib/trey-i/vertex.server.ts"
}, (opts) => generateMusicReviewInsight.__executeServer(opts));
const generateMusicReviewInsight = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  title: String(input.title || "Untitled").slice(0, 100),
  artist: String(input.artist || "Unknown").slice(0, 100),
  genre: String(input.genre || "Other").slice(0, 50),
  notes: String(input.notes || "").slice(0, 500)
})).handler(generateMusicReviewInsight_createServerFn_handler, async ({
  data
}) => {
  try {
    const {
      genai,
      model
    } = buildClient();
    const prompt = `Title: ${data.title}
Artist: ${data.artist}
Genre: ${data.genre}
Vibe Notes: ${data.notes}`;
    const systemInstruction = `You are Trey-I, a sharp and experienced A&R for Trey TV. Provide a 'first impression' vibe check for this submitted track info. Output ONLY a valid JSON object matching this schema exactly, with no markdown formatting: { "vibe": "short 4-6 word description", "strengths": ["string", "string"], "hook": "1 sentence on what to listen for", "hypeScore": number 1-10, "predictedMood": "1 word" }`;
    const result = await genai.models.generateContent({
      model,
      contents: [{
        role: "user",
        parts: [{
          text: prompt
        }]
      }],
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 256,
        responseMimeType: "application/json"
      }
    });
    const text = result.text ?? result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text) throw new Error("Empty response");
    const parsed = JSON.parse(text);
    return {
      vibe: String(parsed.vibe || "Fresh unreleased energy"),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3).map(String) : ["Atmosphere", "Potential"],
      hook: String(parsed.hook || "Listen for the energy shift in the chorus."),
      hypeScore: typeof parsed.hypeScore === "number" ? Math.min(10, Math.max(1, parsed.hypeScore)) : 7,
      predictedMood: String(parsed.predictedMood || "Reflective")
    };
  } catch (err) {
    console.error("[generateMusicReviewInsight]", err);
    return {
      vibe: "Underground energy",
      strengths: ["Raw potential", "Authentic feel"],
      hook: "Listen for the rhythmic pocket on the hook.",
      hypeScore: 7,
      predictedMood: "Hype"
    };
  }
});
const generateAdminReviewDraft_createServerFn_handler = createServerRpc({
  id: "148e48d6c0a10c56b17563b0cc6cb1af5cb3dd147af07e390d5c64a303ecb22c",
  name: "generateAdminReviewDraft",
  filename: "src/lib/trey-i/vertex.server.ts"
}, (opts) => generateAdminReviewDraft.__executeServer(opts));
const generateAdminReviewDraft = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  title: String(input.title || "Untitled").slice(0, 100),
  artist: String(input.artist || "Unknown").slice(0, 100),
  genre: String(input.genre || "Other").slice(0, 50),
  vibe: String(input.vibe || "").slice(0, 100),
  bodyNotes: String(input.bodyNotes || "").slice(0, 2e3)
})).handler(generateAdminReviewDraft_createServerFn_handler, async ({
  data
}) => {
  try {
    const {
      genai,
      model
    } = buildClient();
    const prompt = `Title: ${data.title}
Artist: ${data.artist}
Genre: ${data.genre}
AI Vibe: ${data.vibe}
Admin's Rough Notes: ${data.bodyNotes}`;
    const systemInstruction = "You are Trey-I, assisting the A&R admin for Trey TV. Write a professional, encouraging, and constructive music review. Use the provided track info and expand cleanly on the Admin's Rough Notes. If rough notes are empty, generate a plausible, constructive review based on the title/genre/vibe. Do not include the score out of 10. Just write 1-2 polished paragraphs. End with '— Reviewed live on Trey TV'";
    const result = await genai.models.generateContent({
      model,
      contents: [{
        role: "user",
        parts: [{
          text: prompt
        }]
      }],
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 500
      }
    });
    const text = result.text ?? result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text) throw new Error("Empty response");
    return {
      text: sanitize(text)
    };
  } catch (err) {
    console.error("[generateAdminReviewDraft]", err);
    return {
      text: `"${data.title}" by ${data.artist} lands as a strong track. The ${data.genre.toLowerCase()} foundation gives it a clear identity. Strongest moments live in the hook. To take it to the next level, tighten the transition into the second verse. Overall: a confident submission with commercial DNA.

— Reviewed live on Trey TV`
    };
  }
});
export {
  generateAdminReviewDraft_createServerFn_handler,
  generateMusicReviewInsight_createServerFn_handler,
  treyIGenerate_createServerFn_handler
};
