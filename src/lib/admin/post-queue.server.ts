import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/backend-env";

export type AdminQueueApprovalStatus = "pending" | "approved" | "rejected" | "needs_changes";

export type AdminQueueItem = {
  id: string;
  creator_id: string;
  edit_project_id: string | null;
  channel_id: string | null;
  show_id: string | null;
  episode_number: number | null;
  title: string;
  description: string | null;
  stream_uid: string;
  thumbnail_url: string | null;
  visibility: string;
  is_plus_content: boolean;
  scheduled_at: string | null;
  approval_status: AdminQueueApprovalStatus;
  created_at: string;
  updated_at: string;
};

export type AdminQueueItemDetail = AdminQueueItem & {
  admin_notes: string | null;
};

type AccessTokenInput = {
  accessToken: string;
};

type QueueItemInput = AccessTokenInput & {
  queueId: string;
};

type ReviewInput = QueueItemInput & {
  adminNotes: string;
  approvalStatus: AdminQueueApprovalStatus;
};

type AdminUser = {
  email: string;
  id: string;
};

const VALID_APPROVAL_STATUSES: AdminQueueApprovalStatus[] = ["pending", "approved", "rejected", "needs_changes"];

const PROJECT_STATUS_BY_APPROVAL_STATUS: Record<AdminQueueApprovalStatus, string> = {
  approved: "published",
  rejected: "rejected",
  needs_changes: "ready",
  pending: "submitted",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

const validateAccessToken = (input: AccessTokenInput): AccessTokenInput => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
});

const validateQueueItemInput = (input: QueueItemInput): QueueItemInput => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  queueId: typeof input?.queueId === "string" ? input.queueId : "",
});

const validateReviewInput = (input: ReviewInput): ReviewInput => {
  const approvalStatus = typeof input?.approvalStatus === "string" ? input.approvalStatus : "";

  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
    queueId: typeof input?.queueId === "string" ? input.queueId : "",
    approvalStatus: VALID_APPROVAL_STATUSES.includes(approvalStatus as AdminQueueApprovalStatus)
      ? (approvalStatus as AdminQueueApprovalStatus)
      : "pending",
    adminNotes: typeof input?.adminNotes === "string" ? input.adminNotes : "",
  };
};

async function verifyAdmin(accessToken: string): Promise<AdminUser> {
  const token = accessToken.trim();
  if (!token) {
    throw new Error("Admin access required");
  }

  const supabaseEnv = getSupabasePublicEnv();
  if (!supabaseEnv) {
    throw new Error("Admin not configured");
  }

  const authClient = createClient(supabaseEnv.url, supabaseEnv.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(token);

  if (error || !user?.email) {
    throw new Error("Admin access required");
  }

  const { data: profile } = await (authClient as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    return { id: user.id, email: user.email };
  }

  const adminEmails = process.env.ADMIN_EMAILS
    ?.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean) ?? [];

  if (adminEmails.length > 0 && adminEmails.includes(user.email.toLowerCase())) {
    return { id: user.id, email: user.email };
  }

  throw new Error(adminEmails.length > 0 ? "Admin access required" : "Admin not configured");
}

function getAdminClient() {
  const supabaseEnv = getSupabasePublicEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseEnv || !serviceKey) {
    throw new Error("Admin not configured");
  }

  return createClient(supabaseEnv.url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export const getAdminPostQueue = createServerFn({ method: "POST" })
  .inputValidator(validateAccessToken)
  .handler(async ({ data }): Promise<AdminQueueItem[]> => {
    await verifyAdmin(data.accessToken);

    const supabase = getAdminClient();
    const { data: rows, error } = await (supabase as any)
      .from("creator_post_queue")
      .select(
        "id, creator_id, edit_project_id, channel_id, show_id, episode_number, title, description, stream_uid, thumbnail_url, visibility, is_plus_content, scheduled_at, approval_status, created_at, updated_at",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      throw new Error("Failed to load queue");
    }

    return (rows as AdminQueueItem[]) ?? [];
  });

export const getAdminPostQueueItem = createServerFn({ method: "POST" })
  .inputValidator(validateQueueItemInput)
  .handler(async ({ data }): Promise<AdminQueueItemDetail | null> => {
    await verifyAdmin(data.accessToken);

    if (!data.queueId.trim()) {
      throw new Error("Submission not found");
    }

    const supabase = getAdminClient();
    const { data: row, error } = await (supabase as any)
      .from("creator_post_queue")
      .select(
        "id, creator_id, edit_project_id, channel_id, show_id, episode_number, title, description, stream_uid, thumbnail_url, visibility, is_plus_content, scheduled_at, approval_status, admin_notes, created_at, updated_at",
      )
      .eq("id", data.queueId)
      .maybeSingle();

    if (error) {
      throw new Error("Failed to load submission");
    }

    return (row as AdminQueueItemDetail) ?? null;
  });

export const reviewAdminPostQueue = createServerFn({ method: "POST" })
  .inputValidator(validateReviewInput)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const adminUser = await verifyAdmin(data.accessToken);
    const supabase = getAdminClient();
    const adminNotes = data.adminNotes.trim();

    if (!VALID_APPROVAL_STATUSES.includes(data.approvalStatus)) {
      throw new Error("Invalid approval status");
    }

    if ((data.approvalStatus === "rejected" || data.approvalStatus === "needs_changes") && !adminNotes) {
      throw new Error("A note is required when rejecting or requesting changes");
    }

    const { data: queue, error: queueError } = await (supabase as any)
      .from("creator_post_queue")
      .select(
        "id, creator_id, edit_project_id, channel_id, show_id, episode_number, title, description, stream_uid, thumbnail_url, scheduled_at, is_plus_content",
      )
      .eq("id", data.queueId)
      .maybeSingle();

    if (queueError) {
      throw new Error("Failed to load submission");
    }

    if (!queue) {
      throw new Error("Submission not found");
    }

    if (data.approvalStatus === "approved") {
      if (!queue.title?.trim()) throw new Error("Approval blocked: missing title");
      if (!queue.stream_uid?.trim()) throw new Error("Approval blocked: missing stream UID");
      if (!queue.episode_number || queue.episode_number < 1) throw new Error("Approval blocked: invalid episode number");
      if (!queue.channel_id) throw new Error("Approval blocked: missing channel");
      if (!queue.show_id) throw new Error("Approval blocked: missing show");
      if (!queue.edit_project_id) throw new Error("Approval blocked: missing edit project");
      if ((queue.episode_number === 1 || queue.episode_number === 2) && queue.is_plus_content) {
        throw new Error("Approval blocked: episodes 1 and 2 must be free");
      }
      if (queue.creator_id === adminUser.id) {
        throw new Error("Admins cannot approve their own content");
      }
    }

    const { error: updateError } = await (supabase as any)
      .from("creator_post_queue")
      .update({
        approval_status: data.approvalStatus,
        admin_notes: adminNotes || null,
      })
      .eq("id", data.queueId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (queue.edit_project_id) {
      const { error: projectError } = await (supabase as any)
        .from("creator_edit_projects")
        .update({ status: PROJECT_STATUS_BY_APPROVAL_STATUS[data.approvalStatus] })
        .eq("id", queue.edit_project_id);

      if (projectError) {
        throw new Error(projectError.message);
      }
    }

    if (data.approvalStatus === "approved") {
      const rollbackApproval = async () => {
        await (supabase as any)
          .from("creator_post_queue")
          .update({
            approval_status: "pending",
            admin_notes: null,
          })
          .eq("id", data.queueId);

        if (queue.edit_project_id) {
          await (supabase as any)
            .from("creator_edit_projects")
            .update({ status: "submitted" })
            .eq("id", queue.edit_project_id);
        }
      };

      const now = new Date();
      const nowIso = now.toISOString();
      const scheduledAt = queue.scheduled_at ? new Date(queue.scheduled_at) : null;
      const isScheduled = scheduledAt ? scheduledAt.getTime() > now.getTime() : false;
      const accessType = queue.episode_number <= 2 ? "free" : queue.is_plus_content ? "locked" : "free";
      const baseSlug = slugify(queue.title) || `episode-${queue.episode_number}`;
      const episodePayload = {
        channel_id: queue.channel_id,
        show_id: queue.show_id,
        episode_number: queue.episode_number,
        season_number: 1,
        title: queue.title,
        slug: baseSlug,
        description: queue.description ?? null,
        thumbnail_url: queue.thumbnail_url ?? null,
        video_thumbnail_url: queue.thumbnail_url ?? null,
        video_provider: "cloudflare_stream",
        video_asset_id: queue.stream_uid,
        video_playback_id: queue.stream_uid,
        video_status: "ready",
        publish_status: isScheduled ? "scheduled" : "published",
        access_type: accessType,
        scheduled_at: queue.scheduled_at ?? null,
        admin_publish_override: true,
        admin_publish_override_by: adminUser.id,
        admin_publish_override_at: nowIso,
        updated_at: nowIso,
      };

      const { data: existingEpisode, error: existingEpisodeError } = await (supabase as any)
        .from("episodes")
        .select("id, slug")
        .eq("show_id", queue.show_id)
        .eq("video_asset_id", queue.stream_uid)
        .limit(1)
        .maybeSingle();

      let episodeError: unknown = existingEpisodeError;

      if (!episodeError && existingEpisode) {
        const episodeUpdatePayload: Record<string, unknown> = { ...episodePayload };
        delete episodeUpdatePayload.slug;
        const { error } = await (supabase as any)
          .from("episodes")
          .update(episodeUpdatePayload)
          .eq("id", existingEpisode.id);
        episodeError = error;
      }

      if (!episodeError && !existingEpisode) {
        const { error } = await (supabase as any).from("episodes").insert(episodePayload);
        episodeError = error;

        if (error?.code === "23505") {
          const { error: retryError } = await (supabase as any)
            .from("episodes")
            .insert({
              ...episodePayload,
              slug: `${baseSlug}-${queue.episode_number}`,
            });
          episodeError = retryError;
        }
      }

      if (episodeError) {
        await rollbackApproval().catch(() => undefined);
        throw new Error(`Publishing failed: ${getErrorMessage(episodeError)}`);
      }
    }

    return { ok: true };
  });
