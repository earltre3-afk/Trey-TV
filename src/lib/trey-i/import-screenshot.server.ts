import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI } from "@google/genai";
import { verifyTreyIUser, getTreyIServiceClient, saveProfileFieldsForUser } from "./onboarding.server";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ExtractedProfile = {
  display_name?: string;
  username?: string;
  bio?: string;
  location?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  x_handle?: string;
  favorite_categories?: string[];
  avatar_hint?: string;
  banner_hint?: string;
};

export type ImportJobRecord = {
  id: string;
  status: string;
  uploaded_files: string[];
  extracted_json: ExtractedProfile;
  error_message: string | null;
};

const CONSENT_VERSION = "2026-05-11-v1";
const CONSENT_TEXT =
  "I confirm that I own or control this profile/page, or I am authorized to use the photos, name, bio, links, and public information shown in this screenshot. I give Trey TV permission to use this uploaded screenshot to create a draft profile. I understand I can review, edit, replace, or remove anything before publishing.";

// ─── Validators ────────────────────────────────────────────────────────────────

function validateAuthInput(input: { accessToken: string }) {
  return { accessToken: typeof input?.accessToken === "string" ? input.accessToken.trim() : "" };
}

function validateStartInput(input: { accessToken: string; consentAccepted: boolean }) {
  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken.trim() : "",
    consentAccepted: input?.consentAccepted === true,
  };
}

function validateExtractInput(input: { accessToken: string; jobId: string; imageBase64: string; mimeType: string }) {
  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken.trim() : "",
    jobId: typeof input?.jobId === "string" ? input.jobId.trim().slice(0, 64) : "",
    imageBase64: typeof input?.imageBase64 === "string" ? input.imageBase64 : "",
    mimeType: typeof input?.mimeType === "string" ? input.mimeType.slice(0, 30) : "image/png",
  };
}

function validateApproveInput(input: {
  accessToken: string;
  jobId: string;
  draft: Record<string, unknown>;
}) {
  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken.trim() : "",
    jobId: typeof input?.jobId === "string" ? input.jobId.trim().slice(0, 64) : "",
    draft:
      input?.draft && typeof input.draft === "object" && !Array.isArray(input.draft)
        ? input.draft
        : {},
  };
}

// ─── Gemini vision extraction ──────────────────────────────────────────────────

function buildGeminiClient(): { genai: GoogleGenAI; model: string } {
  const project =
    process.env.VERTEX_PROJECT?.trim() || process.env.GOOGLE_CLOUD_PROJECT?.trim();
  const location =
    process.env.VERTEX_LOCATION?.trim() ||
    process.env.GOOGLE_CLOUD_LOCATION?.trim() ||
    "us-central1";

  if (project) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      genai: new GoogleGenAI({ vertexai: true, project, location } as any),
      model: "gemini-2.5-flash",
    };
  }

  const apiKey =
    process.env.GOOGLE_GENAI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim();

  if (!apiKey) return { genai: null as unknown as GoogleGenAI, model: "" };

  return { genai: new GoogleGenAI({ apiKey }), model: "gemini-2.0-flash" };
}

async function extractFromImage(imageBase64: string, mimeType: string): Promise<ExtractedProfile> {
  const { genai, model } = buildGeminiClient();
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
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: "Extract the profile information from this screenshot as JSON." },
        ],
      },
    ],
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.2,
      maxOutputTokens: 1024,
    } as Record<string, unknown>,
  });

  const raw =
    (result as unknown as { text?: string }).text ??
    (
      result as unknown as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      }
    ).candidates?.[0]?.content?.parts?.[0]?.text ??
    "";

  const clean = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const parsed: ExtractedProfile = JSON.parse(clean);

  // Strip any dob or private fields that might have sneaked through
  delete (parsed as Record<string, unknown>).date_of_birth;
  delete (parsed as Record<string, unknown>).age;
  delete (parsed as Record<string, unknown>).phone;
  delete (parsed as Record<string, unknown>).email;

  return parsed;
}

// ─── Server functions ──────────────────────────────────────────────────────────

/** Step 1 – Record consent and create the import job. */
export const startImportJob = createServerFn({ method: "POST" })
  .inputValidator(validateStartInput)
  .handler(async ({ data }): Promise<{ jobId: string }> => {
    if (!data.consentAccepted) throw new Error("Consent is required to continue.");

    const { supabase, user } = await verifyTreyIUser(data.accessToken);

    const now = new Date().toISOString();

    // Record consent
    await (supabase as any)
      .from("profile_import_consents")
      .insert({
        user_id: user.id,
        consent_text: CONSENT_TEXT,
        consent_version: CONSENT_VERSION,
        accepted_at: now,
      });

    // Create job
    const { data: job, error } = await (supabase as any)
      .from("profile_import_jobs")
      .insert({
        user_id: user.id,
        source_type: "screenshot",
        status: "pending",
        consent_version: CONSENT_VERSION,
        uploaded_files: [],
        extracted_json: {},
        updated_at: now,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return { jobId: job.id };
  });

/** Step 2 – Extract profile data from an uploaded screenshot (server-side, key never exposed). */
export const extractScreenshot = createServerFn({ method: "POST" })
  .inputValidator(validateExtractInput)
  .handler(
    async ({ data }): Promise<{ extracted: ExtractedProfile; fallback: boolean }> => {
      const { supabase, user } = await verifyTreyIUser(data.accessToken);

      if (!data.jobId) throw new Error("Invalid import job");

      // Verify job belongs to this user
      const { data: job, error: jobError } = await (supabase as any)
        .from("profile_import_jobs")
        .select("id, status")
        .eq("id", data.jobId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (jobError || !job) throw new Error("Import job not found");

      const now = new Date().toISOString();

      // Mark extracting
      await (supabase as any)
        .from("profile_import_jobs")
        .update({ status: "extracting", updated_at: now })
        .eq("id", data.jobId);

      let extracted: ExtractedProfile = {};
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

      // Save extracted data to job
      await (supabase as any)
        .from("profile_import_jobs")
        .update({
          status: fallback ? "extracted" : "extracted",
          extracted_json: extracted,
          error_message: fallback ? "AI extraction failed; manual review mode." : null,
          updated_at: now,
        })
        .eq("id", data.jobId);

      return { extracted, fallback };
    },
  );

/** Step 3 – Save edited draft back to the job (does not publish to profile). */
export const saveImportDraft = createServerFn({ method: "POST" })
  .inputValidator(validateApproveInput)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { supabase, user } = await verifyTreyIUser(data.accessToken);

    const { data: job, error: jobError } = await (supabase as any)
      .from("profile_import_jobs")
      .select("id")
      .eq("id", data.jobId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (jobError || !job) throw new Error("Import job not found");

    await (supabase as any)
      .from("profile_import_jobs")
      .update({
        extracted_json: data.draft,
        status: "reviewing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.jobId);

    return { ok: true };
  });

/** Step 4 – Publish the approved import draft to the live profile. */
export const publishImportProfile = createServerFn({ method: "POST" })
  .inputValidator(validateApproveInput)
  .handler(async ({ data }): Promise<{ publicProfileUid: string }> => {
    if (!data.accessToken) throw new Error("Sign in required");

    // date_of_birth is required for publish
    const dob =
      typeof data.draft.date_of_birth === "string" ? data.draft.date_of_birth.trim() : "";
    if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      throw new Error("Date of birth is required and must be in YYYY-MM-DD format");
    }

    // display_name required
    if (!data.draft.display_name || String(data.draft.display_name).trim().length < 2) {
      throw new Error("Display name is required (minimum 2 characters)");
    }

    // username required
    if (!data.draft.username || String(data.draft.username).trim().length < 3) {
      throw new Error("Username is required (minimum 3 characters)");
    }

    const { publicProfileUid } = await saveProfileFieldsForUser(
      data.accessToken,
      {
        ...data.draft,
        onboarding_method: "import_screenshot",
      },
      {
        complete: true,
        method: "manual",
        requireBasics: true,
      },
    );

    if (!publicProfileUid) {
      throw new Error("Your public profile link is not ready yet. Please try again.");
    }

    // Mark job as published
    const { supabase, user } = await verifyTreyIUser(data.accessToken);
    await (supabase as any)
      .from("profile_import_jobs")
      .update({
        status: "published",
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.draft._jobId ?? "")
      .eq("user_id", user.id);

    return { publicProfileUid };
  });
