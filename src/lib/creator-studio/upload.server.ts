import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/backend-env";

export type DirectUploadResponse = {
  uploadURL: string;
  uid: string;
  expires: string;
  draftId: string | null;
};

type RequestDirectUploadInput = {
  accessToken: string;
};

type CloudflareDirectUploadResponse = {
  success?: boolean;
  result?: {
    uid?: string;
    uploadURL?: string;
  };
};

const validateDirectUploadInput = (input: RequestDirectUploadInput): RequestDirectUploadInput => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
});

export const requestDirectUpload = createServerFn({ method: "POST" })
  .inputValidator(validateDirectUploadInput)
  .handler(async ({ data }): Promise<DirectUploadResponse> => {
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
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user?.email) {
      throw new Error("Sign in required");
    }

    const { data: channel, error: channelError } = await supabase
      .from("channels")
      .select("id")
      .eq("owner_email", user.email.toLowerCase())
      .in("status", ["draft", "active"])
      .maybeSingle();

    if (channelError || !channel) {
      throw new Error("Creator access required");
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
    const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN?.trim();
    if (!accountId || !apiToken) {
      throw new Error("Upload not configured");
    }

    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const cloudflareResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expiry: expires,
          maxDurationSeconds: 14400,
          meta: {
            creatorId: user.id,
            platform: "trey_tv",
            playbackType: "video_on_demand",
          },
        }),
      },
    );

    if (!cloudflareResponse.ok) {
      throw new Error("Upload not available");
    }

    const cloudflareBody = (await cloudflareResponse
      .json()
      .catch(() => null)) as CloudflareDirectUploadResponse | null;

    const uid = cloudflareBody?.result?.uid;
    const uploadURL = cloudflareBody?.result?.uploadURL;
    if (!cloudflareBody?.success || !uid || !uploadURL) {
      throw new Error("Upload not available");
    }

    let draftId: string | null = null;
    try {
      const { data: draft } = await (supabase as any)
        .from("creator_edit_projects")
        .insert({
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
            playback_type: "video_on_demand",
          },
        })
        .select("id")
        .single();

      draftId = draft?.id ?? null;
    } catch {
      draftId = null;
    }

    return { uploadURL, uid, expires, draftId };
  });
