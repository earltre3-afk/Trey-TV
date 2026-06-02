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
const validateDirectUploadInput = (input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : ""
});
const requestDirectUpload_createServerFn_handler = createServerRpc({
  id: "17b10bb5598753fba536d07e14923d7c22663af25668f440ba8ff661a0e5dd58",
  name: "requestDirectUpload",
  filename: "src/lib/creator-studio/upload.server.ts"
}, (opts) => requestDirectUpload.__executeServer(opts));
const requestDirectUpload = createServerFn({
  method: "POST"
}).inputValidator(validateDirectUploadInput).handler(requestDirectUpload_createServerFn_handler, async ({
  data
}) => {
  const accessToken = data.accessToken.trim();
  if (!accessToken) {
    throw new Error("Sign in required");
  }
  const supabaseEnv = getSupabasePublicEnv();
  if (!supabaseEnv) {
    throw new Error("Upload not configured");
  }
  const supabase = createClient(supabaseEnv.url, supabaseEnv.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
  const {
    data: {
      user
    },
    error: userError
  } = await supabase.auth.getUser(accessToken);
  if (userError || !user?.email) {
    throw new Error("Sign in required");
  }
  const {
    data: channel,
    error: channelError
  } = await supabase.from("channels").select("id").eq("owner_email", user.email.toLowerCase()).in("status", ["draft", "active"]).maybeSingle();
  if (channelError || !channel) {
    throw new Error("Creator access required");
  }
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN?.trim();
  if (!accountId || !apiToken) {
    throw new Error("Upload not configured");
  }
  const expires = new Date(Date.now() + 60 * 60 * 1e3).toISOString();
  const cloudflareResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      expiry: expires,
      maxDurationSeconds: 14400,
      meta: {
        creatorId: user.id,
        platform: "trey_tv",
        playbackType: "video_on_demand"
      }
    })
  });
  if (!cloudflareResponse.ok) {
    throw new Error("Upload not available");
  }
  const cloudflareBody = await cloudflareResponse.json().catch(() => null);
  const uid = cloudflareBody?.result?.uid;
  const uploadURL = cloudflareBody?.result?.uploadURL;
  if (!cloudflareBody?.success || !uid || !uploadURL) {
    throw new Error("Upload not available");
  }
  let draftId = null;
  try {
    const {
      data: draft
    } = await supabase.from("creator_edit_projects").insert({
      creator_id: user.id,
      title: null,
      description: null,
      status: "uploading",
      stream_uid: uid,
      thumbnail_url: null,
      utility_state: {},
      metadata: {
        upload_status: "upload_url_created",
        upload_expires_at: expires,
        playback_type: "video_on_demand"
      }
    }).select("id").single();
    draftId = draft?.id ?? null;
  } catch {
    draftId = null;
  }
  return {
    uploadURL,
    uid,
    expires,
    draftId
  };
});
export {
  requestDirectUpload_createServerFn_handler
};
