import { c as createServerRpc, a as createServerFn, v as verifyTreyIUser, l as saveProfileFieldsForUser } from "./index.mjs";
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
const CONSENT_VERSION = "2026-05-11-v1";
const CONSENT_TEXT = "I confirm that I own or control this profile/page, or I am authorized to use the photos, name, bio, links, and public information shown in this screenshot. I give Trey TV permission to use this uploaded screenshot to create a draft profile. I understand I can review, edit, replace, or remove anything before publishing.";
function validateStartInput(input) {
  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken.trim() : "",
    consentAccepted: input?.consentAccepted === true
  };
}
function validateExtractInput(input) {
  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken.trim() : "",
    jobId: typeof input?.jobId === "string" ? input.jobId.trim().slice(0, 64) : "",
    imageBase64: typeof input?.imageBase64 === "string" ? input.imageBase64 : "",
    mimeType: typeof input?.mimeType === "string" ? input.mimeType.slice(0, 30) : "image/png"
  };
}
function validateApproveInput(input) {
  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken.trim() : "",
    jobId: typeof input?.jobId === "string" ? input.jobId.trim().slice(0, 64) : "",
    draft: input?.draft && typeof input.draft === "object" && !Array.isArray(input.draft) ? input.draft : {}
  };
}
function buildGeminiClient() {
  const project = process.env.VERTEX_PROJECT?.trim() || process.env.GOOGLE_CLOUD_PROJECT?.trim();
  const location = process.env.VERTEX_LOCATION?.trim() || process.env.GOOGLE_CLOUD_LOCATION?.trim() || "us-central1";
  if (project) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      genai: new GoogleGenAI({
        vertexai: true,
        project,
        location
      }),
      model: "gemini-2.5-flash"
    };
  }
  const apiKey = process.env.GOOGLE_GENAI_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
  if (!apiKey) return {
    genai: null,
    model: ""
  };
  return {
    genai: new GoogleGenAI({
      apiKey
    }),
    model: "gemini-2.0-flash"
  };
}
async function extractFromImage(imageBase64, mimeType) {
  const {
    genai,
    model
  } = buildGeminiClient();
  if (!genai || !model) return {};
  const systemPrompt = `You are a profile extraction assistant for Trey TV.
Analyze the screenshot image provided and extract structured profile data.
Return a single JSON object with these optional fields (only include what is clearly visible):
- display_name: the person's display name or full name shown
- username: their @handle or username (without the @ sign, lowercase)
- bio: their profile bio or description text (max 160 chars)
- location: broad location only if visible (city/region, never a street address)
- instagram: Instagram handle if visible
- tiktok: TikTok handle if visible
- youtube: YouTube channel name or URL if visible
- x_handle: X/Twitter handle if visible
- favorite_categories: array of up to 5 content category strings based on their bio/content
- avatar_hint: brief description of their profile photo (e.g., "person in red jacket, smiling")
- banner_hint: brief description of the banner image if visible

CRITICAL RULES:
- Do NOT infer or guess date_of_birth under any circumstances
- Do NOT include phone numbers, email addresses, or private data
- Do NOT include private messages or DMs
- Only include location if clearly and publicly visible on the profile
- If a field is not clearly visible, omit it
- Return ONLY the JSON object, no markdown, no explanation`;
  const result = await genai.models.generateContent({
    model,
    contents: [{
      role: "user",
      parts: [{
        inlineData: {
          mimeType,
          data: imageBase64
        }
      }, {
        text: "Extract the profile information from this screenshot as JSON."
      }]
    }],
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.2,
      maxOutputTokens: 1024
    }
  });
  const raw = result.text ?? result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const clean = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const parsed = JSON.parse(clean);
  delete parsed.date_of_birth;
  delete parsed.age;
  delete parsed.phone;
  delete parsed.email;
  return parsed;
}
const startImportJob_createServerFn_handler = createServerRpc({
  id: "616699ed6892ddd3f1f73adca5ab09feae022407cd58be36c9e5746f2d15ddfd",
  name: "startImportJob",
  filename: "src/lib/trey-i/import-screenshot.server.ts"
}, (opts) => startImportJob.__executeServer(opts));
const startImportJob = createServerFn({
  method: "POST"
}).inputValidator(validateStartInput).handler(startImportJob_createServerFn_handler, async ({
  data
}) => {
  if (!data.consentAccepted) throw new Error("Consent is required to continue.");
  const {
    supabase,
    user
  } = await verifyTreyIUser(data.accessToken);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await supabase.from("profile_import_consents").insert({
    user_id: user.id,
    consent_text: CONSENT_TEXT,
    consent_version: CONSENT_VERSION,
    accepted_at: now
  });
  const {
    data: job,
    error
  } = await supabase.from("profile_import_jobs").insert({
    user_id: user.id,
    source_type: "screenshot",
    status: "pending",
    consent_version: CONSENT_VERSION,
    uploaded_files: [],
    extracted_json: {},
    updated_at: now
  }).select("id").single();
  if (error) throw new Error(error.message);
  return {
    jobId: job.id
  };
});
const extractScreenshot_createServerFn_handler = createServerRpc({
  id: "9f00c8564e148c83c17a18b551a7e490f87de0ee8797abfaea71782551973e2a",
  name: "extractScreenshot",
  filename: "src/lib/trey-i/import-screenshot.server.ts"
}, (opts) => extractScreenshot.__executeServer(opts));
const extractScreenshot = createServerFn({
  method: "POST"
}).inputValidator(validateExtractInput).handler(extractScreenshot_createServerFn_handler, async ({
  data
}) => {
  const {
    supabase,
    user
  } = await verifyTreyIUser(data.accessToken);
  if (!data.jobId) throw new Error("Invalid import job");
  const {
    data: job,
    error: jobError
  } = await supabase.from("profile_import_jobs").select("id, status").eq("id", data.jobId).eq("user_id", user.id).maybeSingle();
  if (jobError || !job) throw new Error("Import job not found");
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await supabase.from("profile_import_jobs").update({
    status: "extracting",
    updated_at: now
  }).eq("id", data.jobId);
  let extracted = {};
  let fallback = false;
  try {
    const allowedMimes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const safeMime = allowedMimes.includes(data.mimeType) ? data.mimeType : "image/png";
    if (!data.imageBase64) throw new Error("No image data");
    extracted = await extractFromImage(data.imageBase64, safeMime);
  } catch (err) {
    console.error("[extractScreenshot] AI extraction failed:", err);
    fallback = true;
    extracted = {};
  }
  await supabase.from("profile_import_jobs").update({
    status: fallback ? "extracted" : "extracted",
    extracted_json: extracted,
    error_message: fallback ? "AI extraction failed; manual review mode." : null,
    updated_at: now
  }).eq("id", data.jobId);
  return {
    extracted,
    fallback
  };
});
const saveImportDraft_createServerFn_handler = createServerRpc({
  id: "2013fb9d641643a76de9394cb914e45d53fc33f2ac8dc4d3a3526038b4b3fda4",
  name: "saveImportDraft",
  filename: "src/lib/trey-i/import-screenshot.server.ts"
}, (opts) => saveImportDraft.__executeServer(opts));
const saveImportDraft = createServerFn({
  method: "POST"
}).inputValidator(validateApproveInput).handler(saveImportDraft_createServerFn_handler, async ({
  data
}) => {
  const {
    supabase,
    user
  } = await verifyTreyIUser(data.accessToken);
  const {
    data: job,
    error: jobError
  } = await supabase.from("profile_import_jobs").select("id").eq("id", data.jobId).eq("user_id", user.id).maybeSingle();
  if (jobError || !job) throw new Error("Import job not found");
  await supabase.from("profile_import_jobs").update({
    extracted_json: data.draft,
    status: "reviewing",
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.jobId);
  return {
    ok: true
  };
});
const publishImportProfile_createServerFn_handler = createServerRpc({
  id: "3159d595375b826eefa825c4544b69c4bfd27bc69bd36b05c30b5a809595876a",
  name: "publishImportProfile",
  filename: "src/lib/trey-i/import-screenshot.server.ts"
}, (opts) => publishImportProfile.__executeServer(opts));
const publishImportProfile = createServerFn({
  method: "POST"
}).inputValidator(validateApproveInput).handler(publishImportProfile_createServerFn_handler, async ({
  data
}) => {
  if (!data.accessToken) throw new Error("Sign in required");
  const dob = typeof data.draft.date_of_birth === "string" ? data.draft.date_of_birth.trim() : "";
  if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    throw new Error("Date of birth is required and must be in YYYY-MM-DD format");
  }
  if (!data.draft.display_name || String(data.draft.display_name).trim().length < 2) {
    throw new Error("Display name is required (minimum 2 characters)");
  }
  if (!data.draft.username || String(data.draft.username).trim().length < 3) {
    throw new Error("Username is required (minimum 3 characters)");
  }
  const {
    publicProfileUid
  } = await saveProfileFieldsForUser(data.accessToken, {
    ...data.draft
  }, {
    complete: true,
    method: "import_screenshot",
    requireBasics: true
  });
  if (!publicProfileUid) {
    throw new Error("Your public profile link is not ready yet. Please try again.");
  }
  const {
    supabase,
    user
  } = await verifyTreyIUser(data.accessToken);
  await supabase.from("profile_import_jobs").update({
    status: "published",
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.draft._jobId ?? "").eq("user_id", user.id);
  return {
    publicProfileUid
  };
});
export {
  extractScreenshot_createServerFn_handler,
  publishImportProfile_createServerFn_handler,
  saveImportDraft_createServerFn_handler,
  startImportJob_createServerFn_handler
};
