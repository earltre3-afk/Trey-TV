import { createServerFn } from "@tanstack/react-start";
import {
  getTreyIServiceClient,
  verifyTreyIUser,
  saveProfileFieldsForUser,
} from "@/lib/trey-i/onboarding.server";

type StartIntakeSessionInput = {
  accessToken: string;
  intakeMethod?: "manual" | "ai_voice";
};

type ProfileSetupTurnInput = {
  accessToken: string;
  sessionId: string;
  transcript: string;
};

type ProfileSetupStage =
  | "ask_display_name"
  | "confirm_display_name"
  | "ask_username"
  | "confirm_username"
  | "ask_bio"
  | "confirm_bio"
  | "ask_location"
  | "confirm_location"
  | "review"
  | "complete";

type PendingField = {
  field: keyof ConfirmedFields;
  value: unknown;
};

type ConfirmedFields = {
  bio?: string;
  display_name?: string;
  location?: string;
  username?: string;
};

type IntakeSession = {
  confirmed_fields: ConfirmedFields | null;
  flow_type: string;
  metadata: Record<string, unknown> | null;
  session_id: string;
  user_id: string | null;
};

type ProfileSetupTurnResponse = {
  assistant: {
    message: string;
  };
  complete?: boolean;
  confirmedFields: ConfirmedFields;
  publicProfileUid?: string;
  switchToManual?: boolean;
};

const STAGES: ProfileSetupStage[] = [
  "ask_display_name",
  "confirm_display_name",
  "ask_username",
  "confirm_username",
  "ask_bio",
  "confirm_bio",
  "ask_location",
  "confirm_location",
  "review",
  "complete",
];

const yesPattern =
  /^(yes|yeah|yep|correct|right|that'?s right|looks good|sounds good|save it|confirm|confirmed|sure|ok|okay|please do)$/i;
const noPattern = /^(no|nope|nah|not quite|wrong|change it|try again)/i;
const skipPattern = /^(skip|skip it|pass|no thanks|not now|later|next)$/i;
const finishPattern = /^(finish|done|complete|wrap up|that'?s all|all set)$/i;
const manualPattern = /^(manual|switch to manual|stop|cancel|i want manual|do it manually)$/i;

const validateStartIntakeSessionInput = (
  input: StartIntakeSessionInput,
): StartIntakeSessionInput => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  intakeMethod:
    input?.intakeMethod === "ai_voice" || input?.intakeMethod === "manual"
      ? input.intakeMethod
      : "manual",
});

const validateProfileSetupTurnInput = (input: ProfileSetupTurnInput): ProfileSetupTurnInput => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  sessionId: typeof input?.sessionId === "string" ? input.sessionId : "",
  transcript: typeof input?.transcript === "string" ? input.transcript : "",
});

function cleanText(value: unknown, max = 500): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, max);
}

function normalizeSpokenUsername(value: string): string {
  return value
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/\s+underscore\s+/g, "_")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 30);
}

function stageFrom(value: unknown): ProfileSetupStage {
  const stage = String(value ?? "ask_display_name");
  return STAGES.includes(stage as ProfileSetupStage)
    ? (stage as ProfileSetupStage)
    : "ask_display_name";
}

function pendingFrom(metadata: Record<string, unknown>): PendingField | null {
  const pending = metadata.profile_setup_voice_pending;
  if (!pending || typeof pending !== "object" || Array.isArray(pending)) return null;
  const candidate = pending as { field?: unknown; value?: unknown };
  if (typeof candidate.field !== "string") return null;
  if (!["display_name", "username", "bio", "location"].includes(candidate.field)) return null;
  return {
    field: candidate.field as keyof ConfirmedFields,
    value: candidate.value,
  };
}

function isFillerAtAskStage(input: string): boolean {
  return yesPattern.test(input) || noPattern.test(input) || skipPattern.test(input);
}

function response(
  message: string,
  confirmedFields: ConfirmedFields,
  extras: Omit<ProfileSetupTurnResponse, "assistant" | "confirmedFields"> = {},
): ProfileSetupTurnResponse {
  return {
    assistant: { message },
    confirmedFields,
    ...extras,
  };
}

function summary(fields: ConfirmedFields): string {
  const parts = [
    `display name: ${fields.display_name ?? "not set"}`,
    `username: @${fields.username ?? "not set"}`,
  ];
  if (fields.bio) parts.push(`bio: ${fields.bio}`);
  if (fields.location) parts.push(`location: ${fields.location}`);
  return parts.join(". ");
}

async function updateConversationState(
  supabase: any,
  sessionId: string,
  metadata: Record<string, unknown>,
  stage: ProfileSetupStage,
  pending?: PendingField | null,
) {
  const nextMetadata: Record<string, unknown> = {
    ...metadata,
    profile_setup_voice_stage: stage,
    signup_voice_stage: stage,
  };

  if (pending) {
    nextMetadata.profile_setup_voice_pending = pending;
  } else {
    delete nextMetadata.profile_setup_voice_pending;
  }

  const { error } = await supabase
    .from("intake_sessions")
    .update({
      metadata: nextMetadata,
      updated_at: new Date().toISOString(),
    })
    .eq("session_id", sessionId);

  if (error) {
    throw new Error(error.message);
  }
}

async function saveConfirmedField(
  supabase: any,
  sessionId: string,
  confirmedFields: ConfirmedFields,
  field: keyof ConfirmedFields,
  value: unknown,
): Promise<ConfirmedFields> {
  const nextFields: ConfirmedFields = {
    ...confirmedFields,
    [field]: cleanText(value, field === "bio" ? 160 : 50),
  };

  const { error } = await supabase
    .from("intake_sessions")
    .update({
      confirmed_fields: nextFields,
      updated_at: new Date().toISOString(),
    })
    .eq("session_id", sessionId);

  if (error) {
    throw new Error(error.message);
  }

  return nextFields;
}

async function assertUsernameAvailable(supabase: any, username: string, userId: string) {
  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    throw new Error("Use 3-30 lowercase letters, numbers, or underscores");
  }

  const { data: usernameOwner, error: usernameError } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", username)
    .neq("id", userId)
    .maybeSingle();

  if (usernameError) {
    throw new Error(usernameError.message);
  }

  if (usernameOwner) {
    throw new Error("That username is already taken");
  }

  const { data: draft, error: draftError } = await supabase
    .from("intake_sessions")
    .select("session_id")
    .eq("flow_type", "signup")
    .in("status", ["active", "submitted"])
    .contains("confirmed_fields", { username })
    .neq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (draftError) {
    throw new Error(draftError.message);
  }

  if (draft) {
    throw new Error("That username is already reserved");
  }
}

async function goReview(
  supabase: any,
  sessionId: string,
  metadata: Record<string, unknown>,
  confirmedFields: ConfirmedFields,
): Promise<ProfileSetupTurnResponse> {
  await updateConversationState(supabase, sessionId, metadata, "review", null);
  return response(
    `Here is your profile setup. ${summary(confirmedFields)}. Does this look right?`,
    confirmedFields,
  );
}

export const startIntakeSession = createServerFn({ method: "POST" })
  .inputValidator(validateStartIntakeSessionInput)
  .handler(async ({ data }): Promise<{ sessionId: string }> => {
    const { user } = await verifyTreyIUser(data.accessToken);
    const supabase = getTreyIServiceClient();
    const now = new Date().toISOString();
    const { data: session, error } = await (supabase as any)
      .from("intake_sessions")
      .insert({
        flow_type: "signup",
        intake_method: data.intakeMethod ?? "manual",
        status: data.intakeMethod === "ai_voice" ? "active" : "draft",
        user_id: user.id,
        metadata: {
          profile_setup_voice_stage: "ask_display_name",
          signup_voice_stage: "ask_display_name",
        },
        confirmed_fields: {},
        updated_at: now,
      })
      .select("session_id")
      .single();

    if (error || !session?.session_id) {
      throw new Error(error?.message ?? "Intake session could not start");
    }

    return { sessionId: session.session_id };
  });

export const profileSetupTurn = createServerFn({ method: "POST" })
  .inputValidator(validateProfileSetupTurnInput)
  .handler(async ({ data }): Promise<ProfileSetupTurnResponse> => {
    const transcript = cleanText(data.transcript, 800);
    const sessionId = data.sessionId.trim();
    if (!sessionId || !transcript) {
      throw new Error("Session id and transcript are required");
    }

    const { user } = await verifyTreyIUser(data.accessToken);
    const supabase = getTreyIServiceClient();
    const { data: session, error: sessionError } = await (supabase as any)
      .from("intake_sessions")
      .select("session_id, flow_type, user_id, metadata, confirmed_fields")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (sessionError || !session) {
      throw new Error(sessionError?.message ?? "Profile setup session was not found");
    }

    const typedSession = session as IntakeSession;
    if (typedSession.flow_type !== "signup") {
      throw new Error("Profile setup session was not found");
    }

    if (typedSession.user_id && typedSession.user_id !== user.id) {
      throw new Error("This profile setup session belongs to another user");
    }

    const metadata = typedSession.metadata ?? {};
    const stage = stageFrom(metadata.profile_setup_voice_stage ?? metadata.signup_voice_stage);
    const pending = pendingFrom(metadata);
    const confirmedFields = typedSession.confirmed_fields ?? {};

    if (manualPattern.test(transcript)) {
      return response(
        "No problem. I'll switch you to manual setup and keep what we saved.",
        confirmedFields,
        {
          switchToManual: true,
        },
      );
    }

    if (
      finishPattern.test(transcript) &&
      !["confirm_display_name", "confirm_username", "review", "complete"].includes(stage)
    ) {
      return goReview(supabase as any, sessionId, metadata, confirmedFields);
    }

    if (stage === "ask_display_name") {
      if (isFillerAtAskStage(transcript)) {
        return response("Say the profile name you want people to see on Trey TV.", confirmedFields);
      }

      const displayName = transcript
        .replace(/^my name is\s+/i, "")
        .replace(/^call me\s+/i, "")
        .trim()
        .slice(0, 50);
      if (displayName.length < 2) {
        return response("Say the profile name one more time for me.", confirmedFields);
      }

      await updateConversationState(supabase as any, sessionId, metadata, "confirm_display_name", {
        field: "display_name",
        value: displayName,
      });
      return response(`I heard ${displayName}. Is that spelled right?`, confirmedFields);
    }

    if (stage === "confirm_display_name") {
      if (pending?.field !== "display_name") {
        await updateConversationState(
          supabase as any,
          sessionId,
          metadata,
          "ask_display_name",
          null,
        );
        return response("What name should show on your profile?", confirmedFields);
      }

      if (yesPattern.test(transcript)) {
        const nextFields = await saveConfirmedField(
          supabase as any,
          sessionId,
          confirmedFields,
          "display_name",
          pending.value,
        );
        await updateConversationState(supabase as any, sessionId, metadata, "ask_username", null);
        return response("Saved. What username do you want on Trey TV?", nextFields);
      }

      const replacement = noPattern.test(transcript)
        ? transcript.replace(noPattern, "").trim()
        : transcript;
      if (replacement.length >= 2) {
        await updateConversationState(
          supabase as any,
          sessionId,
          metadata,
          "confirm_display_name",
          {
            field: "display_name",
            value: replacement.slice(0, 50),
          },
        );
        return response(
          `Got it. I heard ${replacement.slice(0, 50)}. Is that spelled right?`,
          confirmedFields,
        );
      }

      await updateConversationState(supabase as any, sessionId, metadata, "ask_display_name", null);
      return response("No problem. Say the profile name one more time for me.", confirmedFields);
    }

    if (stage === "ask_username") {
      if (isFillerAtAskStage(transcript)) {
        return response(
          "Say the username you want, using letters, numbers, or underscores.",
          confirmedFields,
        );
      }

      const username = normalizeSpokenUsername(transcript);
      await assertUsernameAvailable(supabase as any, username, user.id);
      await updateConversationState(supabase as any, sessionId, metadata, "confirm_username", {
        field: "username",
        value: username,
      });
      return response(`${username} is available. Should I save that username?`, confirmedFields);
    }

    if (stage === "confirm_username") {
      if (pending?.field !== "username") {
        await updateConversationState(supabase as any, sessionId, metadata, "ask_username", null);
        return response("What username do you want on Trey TV?", confirmedFields);
      }

      if (yesPattern.test(transcript)) {
        const nextFields = await saveConfirmedField(
          supabase as any,
          sessionId,
          confirmedFields,
          "username",
          pending.value,
        );
        await updateConversationState(supabase as any, sessionId, metadata, "ask_bio", null);
        return response(
          "Username saved. Want to add a short bio? You can say one now, or say skip.",
          nextFields,
        );
      }

      const username = normalizeSpokenUsername(
        noPattern.test(transcript) ? transcript.replace(noPattern, "") : transcript,
      );
      if (username.length >= 3) {
        await assertUsernameAvailable(supabase as any, username, user.id);
        await updateConversationState(supabase as any, sessionId, metadata, "confirm_username", {
          field: "username",
          value: username,
        });
        return response(`${username} is available. Should I save that username?`, confirmedFields);
      }

      await updateConversationState(supabase as any, sessionId, metadata, "ask_username", null);
      return response("No problem. Say the username one more time for me.", confirmedFields);
    }

    if (stage === "ask_bio") {
      if (skipPattern.test(transcript)) {
        await updateConversationState(supabase as any, sessionId, metadata, "ask_location", null);
        return response(
          "No bio for now. Want to add your location? Say it now, or say skip.",
          confirmedFields,
        );
      }

      if (yesPattern.test(transcript) || noPattern.test(transcript)) {
        return response("Say the short bio you want, or say skip.", confirmedFields);
      }

      const bio = transcript.slice(0, 160);
      await updateConversationState(supabase as any, sessionId, metadata, "confirm_bio", {
        field: "bio",
        value: bio,
      });
      return response(`I heard this bio: ${bio}. Should I save it?`, confirmedFields);
    }

    if (stage === "confirm_bio") {
      if (pending?.field !== "bio") {
        await updateConversationState(supabase as any, sessionId, metadata, "ask_bio", null);
        return response(
          "Want to add a short bio? You can say one now, or say skip.",
          confirmedFields,
        );
      }

      if (yesPattern.test(transcript)) {
        const nextFields = await saveConfirmedField(
          supabase as any,
          sessionId,
          confirmedFields,
          "bio",
          pending.value,
        );
        await updateConversationState(supabase as any, sessionId, metadata, "ask_location", null);
        return response(
          "Bio saved. Want to add your location? Say it now, or say skip.",
          nextFields,
        );
      }

      if (skipPattern.test(transcript)) {
        await updateConversationState(supabase as any, sessionId, metadata, "ask_location", null);
        return response(
          "No bio for now. Want to add your location? Say it now, or say skip.",
          confirmedFields,
        );
      }

      const bio = (noPattern.test(transcript) ? transcript.replace(noPattern, "") : transcript)
        .trim()
        .slice(0, 160);
      if (bio) {
        await updateConversationState(supabase as any, sessionId, metadata, "confirm_bio", {
          field: "bio",
          value: bio,
        });
        return response(`Got it. I heard this bio: ${bio}. Should I save it?`, confirmedFields);
      }

      await updateConversationState(supabase as any, sessionId, metadata, "ask_bio", null);
      return response("No problem. Say the bio one more time, or say skip.", confirmedFields);
    }

    if (stage === "ask_location") {
      if (skipPattern.test(transcript)) {
        return goReview(supabase as any, sessionId, metadata, confirmedFields);
      }

      if (yesPattern.test(transcript) || noPattern.test(transcript)) {
        return response("Say the location you want on your profile, or say skip.", confirmedFields);
      }

      const location = transcript.slice(0, 50);
      await updateConversationState(supabase as any, sessionId, metadata, "confirm_location", {
        field: "location",
        value: location,
      });
      return response(`I heard ${location}. Should I save that location?`, confirmedFields);
    }

    if (stage === "confirm_location") {
      if (pending?.field !== "location") {
        await updateConversationState(supabase as any, sessionId, metadata, "ask_location", null);
        return response("Want to add your location? Say it now, or say skip.", confirmedFields);
      }

      if (yesPattern.test(transcript)) {
        const nextFields = await saveConfirmedField(
          supabase as any,
          sessionId,
          confirmedFields,
          "location",
          pending.value,
        );
        return goReview(supabase as any, sessionId, metadata, nextFields);
      }

      if (skipPattern.test(transcript)) {
        return goReview(supabase as any, sessionId, metadata, confirmedFields);
      }

      const location = (noPattern.test(transcript) ? transcript.replace(noPattern, "") : transcript)
        .trim()
        .slice(0, 50);
      if (location) {
        await updateConversationState(supabase as any, sessionId, metadata, "confirm_location", {
          field: "location",
          value: location,
        });
        return response(
          `Got it. I heard ${location}. Should I save that location?`,
          confirmedFields,
        );
      }

      await updateConversationState(supabase as any, sessionId, metadata, "ask_location", null);
      return response("No problem. Say the location one more time, or say skip.", confirmedFields);
    }

    if (stage === "review") {
      if (!yesPattern.test(transcript)) {
        await updateConversationState(
          supabase as any,
          sessionId,
          metadata,
          "ask_display_name",
          null,
        );
        return response(
          "No problem. Let's run it back. What name should show on your profile?",
          confirmedFields,
        );
      }

      const { publicProfileUid } = await saveProfileFieldsForUser(
        data.accessToken,
        confirmedFields,
        {
          complete: true,
          method: "voice",
          requireBasics: true,
        },
      );

      const now = new Date().toISOString();
      const { error } = await (supabase as any)
        .from("intake_sessions")
        .update({
          status: "completed",
          completed_at: now,
          updated_at: now,
          metadata: {
            ...metadata,
            finalized_with_verified_user_at: now,
            profile_setup_voice_stage: "complete",
            signup_voice_stage: "complete",
          },
          user_id: user.id,
        })
        .eq("session_id", sessionId);

      if (error) {
        throw new Error(error.message);
      }

      return response("Your Trey TV profile setup is complete. Welcome in.", confirmedFields, {
        complete: true,
        publicProfileUid: publicProfileUid ?? undefined,
      });
    }

    return response("Your profile setup is complete.", confirmedFields, { complete: true });
  });
