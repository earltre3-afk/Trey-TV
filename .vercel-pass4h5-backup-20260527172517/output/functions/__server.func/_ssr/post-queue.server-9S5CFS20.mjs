import { c as createServerRpc, a as createServerFn, k as getSupabasePublicEnv } from "./index.mjs";
import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
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
import "../_libs/livekit__protocol.mjs";
import "../_libs/bufbuild__protobuf.mjs";
import "../_libs/livekit-server-sdk.mjs";
import "../_libs/jose.mjs";
import "node:buffer";
import "node:util";
import "node:fs";
import "node:path";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const VALID_APPROVAL_STATUSES = ["pending", "approved", "rejected", "needs_changes"];
const PROJECT_STATUS_BY_APPROVAL_STATUS = {
  approved: "published",
  rejected: "rejected",
  needs_changes: "ready",
  pending: "submitted"
};
function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);
}
function getErrorMessage(error) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return String(error);
}
const validateAccessToken = (input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : ""
});
const validateQueueItemInput = (input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  queueId: typeof input?.queueId === "string" ? input.queueId : ""
});
const validateReviewInput = (input) => {
  const approvalStatus = typeof input?.approvalStatus === "string" ? input.approvalStatus : "";
  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
    queueId: typeof input?.queueId === "string" ? input.queueId : "",
    approvalStatus: VALID_APPROVAL_STATUSES.includes(approvalStatus) ? approvalStatus : "pending",
    adminNotes: typeof input?.adminNotes === "string" ? input.adminNotes : ""
  };
};
async function verifyAdmin(accessToken) {
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
      persistSession: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
  const {
    data: {
      user
    },
    error
  } = await authClient.auth.getUser(token);
  if (error || !user?.email) {
    throw new Error("Admin access required");
  }
  const {
    data: profile
  } = await authClient.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role === "admin") {
    return {
      id: user.id,
      email: user.email
    };
  }
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean) ?? [];
  if (adminEmails.length > 0 && adminEmails.includes(user.email.toLowerCase())) {
    return {
      id: user.id,
      email: user.email
    };
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
      persistSession: false
    }
  });
}
const getAdminPostQueue_createServerFn_handler = createServerRpc({
  id: "9622aea28e9112208b3685ae3b990230c14b9729f7d320441e916891037c4a87",
  name: "getAdminPostQueue",
  filename: "src/lib/admin/post-queue.server.ts"
}, (opts) => getAdminPostQueue.__executeServer(opts));
const getAdminPostQueue = createServerFn({
  method: "POST"
}).inputValidator(validateAccessToken).handler(getAdminPostQueue_createServerFn_handler, async ({
  data
}) => {
  await verifyAdmin(data.accessToken);
  const supabase = getAdminClient();
  const {
    data: rows,
    error
  } = await supabase.from("creator_post_queue").select("id, creator_id, edit_project_id, channel_id, show_id, episode_number, title, description, stream_uid, thumbnail_url, visibility, is_plus_content, scheduled_at, approval_status, created_at, updated_at").order("created_at", {
    ascending: false
  }).limit(100);
  if (error) {
    throw new Error("Failed to load queue");
  }
  return rows ?? [];
});
const getAdminPostQueueItem_createServerFn_handler = createServerRpc({
  id: "d51fe542052974c790acdd8555c752ea03188b7163304a8b5de332f1ae633013",
  name: "getAdminPostQueueItem",
  filename: "src/lib/admin/post-queue.server.ts"
}, (opts) => getAdminPostQueueItem.__executeServer(opts));
const getAdminPostQueueItem = createServerFn({
  method: "POST"
}).inputValidator(validateQueueItemInput).handler(getAdminPostQueueItem_createServerFn_handler, async ({
  data
}) => {
  await verifyAdmin(data.accessToken);
  if (!data.queueId.trim()) {
    throw new Error("Submission not found");
  }
  const supabase = getAdminClient();
  const {
    data: row,
    error
  } = await supabase.from("creator_post_queue").select("id, creator_id, edit_project_id, channel_id, show_id, episode_number, title, description, stream_uid, thumbnail_url, visibility, is_plus_content, scheduled_at, approval_status, admin_notes, created_at, updated_at").eq("id", data.queueId).maybeSingle();
  if (error) {
    throw new Error("Failed to load submission");
  }
  return row ?? null;
});
const reviewAdminPostQueue_createServerFn_handler = createServerRpc({
  id: "c586ee5e863f87df437cff5077ef812e4211bcc7ce9841448565a58383c7d6e9",
  name: "reviewAdminPostQueue",
  filename: "src/lib/admin/post-queue.server.ts"
}, (opts) => reviewAdminPostQueue.__executeServer(opts));
const reviewAdminPostQueue = createServerFn({
  method: "POST"
}).inputValidator(validateReviewInput).handler(reviewAdminPostQueue_createServerFn_handler, async ({
  data
}) => {
  const adminUser = await verifyAdmin(data.accessToken);
  const supabase = getAdminClient();
  const adminNotes = data.adminNotes.trim();
  if (!VALID_APPROVAL_STATUSES.includes(data.approvalStatus)) {
    throw new Error("Invalid approval status");
  }
  if ((data.approvalStatus === "rejected" || data.approvalStatus === "needs_changes") && !adminNotes) {
    throw new Error("A note is required when rejecting or requesting changes");
  }
  const {
    data: queue,
    error: queueError
  } = await supabase.from("creator_post_queue").select("id, creator_id, edit_project_id, channel_id, show_id, episode_number, title, description, stream_uid, thumbnail_url, scheduled_at, is_plus_content").eq("id", data.queueId).maybeSingle();
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
  const {
    error: updateError
  } = await supabase.from("creator_post_queue").update({
    approval_status: data.approvalStatus,
    admin_notes: adminNotes || null
  }).eq("id", data.queueId);
  if (updateError) {
    throw new Error(updateError.message);
  }
  if (queue.edit_project_id) {
    const {
      error: projectError
    } = await supabase.from("creator_edit_projects").update({
      status: PROJECT_STATUS_BY_APPROVAL_STATUS[data.approvalStatus]
    }).eq("id", queue.edit_project_id);
    if (projectError) {
      throw new Error(projectError.message);
    }
  }
  if (data.approvalStatus === "approved") {
    const rollbackApproval = async () => {
      await supabase.from("creator_post_queue").update({
        approval_status: "pending",
        admin_notes: null
      }).eq("id", data.queueId);
      if (queue.edit_project_id) {
        await supabase.from("creator_edit_projects").update({
          status: "submitted"
        }).eq("id", queue.edit_project_id);
      }
    };
    const now = /* @__PURE__ */ new Date();
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
      published_at: isScheduled ? null : nowIso,
      admin_publish_override: true,
      admin_publish_override_by: adminUser.id,
      admin_publish_override_at: nowIso,
      updated_at: nowIso
    };
    const {
      data: existingEpisode,
      error: existingEpisodeError
    } = await supabase.from("episodes").select("id, slug").eq("show_id", queue.show_id).eq("video_asset_id", queue.stream_uid).limit(1).maybeSingle();
    let episodeError = existingEpisodeError;
    if (!episodeError && existingEpisode) {
      const episodeUpdatePayload = {
        ...episodePayload
      };
      delete episodeUpdatePayload.slug;
      const {
        error
      } = await supabase.from("episodes").update(episodeUpdatePayload).eq("id", existingEpisode.id);
      episodeError = error;
    }
    if (!episodeError && !existingEpisode) {
      const {
        error
      } = await supabase.from("episodes").insert(episodePayload);
      episodeError = error;
      if (error?.code === "23505") {
        const {
          error: retryError
        } = await supabase.from("episodes").insert({
          ...episodePayload,
          slug: `${baseSlug}-${queue.episode_number}`
        });
        episodeError = retryError;
      }
    }
    if (episodeError) {
      await rollbackApproval().catch(() => void 0);
      throw new Error(`Publishing failed: ${getErrorMessage(episodeError)}`);
    }
  }
  return {
    ok: true
  };
});
export {
  getAdminPostQueueItem_createServerFn_handler,
  getAdminPostQueue_createServerFn_handler,
  reviewAdminPostQueue_createServerFn_handler
};
