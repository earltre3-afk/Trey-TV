import { createServerFn } from "@tanstack/react-start";
import { verifyTreyIUser, getTreyIServiceClient } from "@/lib/trey-i/onboarding.server";

export type FwdGifLibraryTab = "saved" | "recent" | "created" | "unsaved" | "favorite";

export type FwdGifItem = {
  id: string;
  gif_id: string | null;
  source_url: string | null;
  title: string | null;
  caption: string | null;
  tags: string[] | null;
  mood: string | null;
  provider: string | null;
  preview_url: string | null;
  media_url: string | null;
  mp4_url: string | null;
  webm_url: string | null;
  gif_url: string | null;
  poster_url: string | null;
  width: number | null;
  height: number | null;
  duration_ms: number | null;
  library_status: string;
  last_used_at: string | null;
  created_at: string;
};

type FwdApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function getFwdIntegrationUrl(route: string): string {
  const base = (process.env.FWD_SUPABASE_URL || "").replace(/\/$/, "");
  return `${base}/functions/v1/fwd-trey-tv-integration/${route}`;
}

async function getTreyTvUid(userId: string): Promise<string | null> {
  const service = getTreyIServiceClient();
  const { data, error } = await (service as any)
    .from("profiles")
    .select("public_profile_uid")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data?.public_profile_uid) return null;
  return data.public_profile_uid as string;
}

async function fwdFetch<T>(
  route: string,
  treyTvUid: string,
  method: "GET" | "POST",
  body?: Record<string, unknown>,
  params?: Record<string, string>,
): Promise<FwdApiResult<T>> {
  const integrationKey = process.env.FWD_INTEGRATION_KEY?.trim();
  if (!integrationKey) {
    return { ok: false, error: "FWD integration not configured." };
  }
  if (!process.env.FWD_SUPABASE_URL?.trim()) {
    return { ok: false, error: "FWD Supabase URL not configured." };
  }

  let url = getFwdIntegrationUrl(route);
  if (params) {
    const qs = new URLSearchParams(params).toString();
    url = `${url}?${qs}`;
  }

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Integration-Key": integrationKey,
        "X-Trey-Tv-Uid": treyTvUid,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const json = await res.json() as Record<string, unknown>;
    if (!res.ok || !json.ok) {
      return { ok: false, error: String(json.error || "FWD API error") };
    }
    return { ok: true, data: json as T };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

type StatusInput = { accessToken: string };
type LibraryInput = { accessToken: string; tab: FwdGifLibraryTab; limit?: number; offset?: number };
type CaptureInput = {
  accessToken: string;
  gif_url: string;
  gif_id?: string | null;
  preview_url?: string | null;
  poster_url?: string | null;
  mp4_url?: string | null;
  title?: string | null;
  provider?: string | null;
  provider_gif_id?: string | null;
  width?: number | null;
  height?: number | null;
};
type SaveInput = { accessToken: string; id: string };
type MarkUsedInput = { accessToken: string; id?: string | null; gif_url?: string | null };
type RemoveInput = { accessToken: string; id: string };

// ─────────────────────────────────────────────────────────────────────────────
// checkFwdStatus — lightweight check: does this user have a public_profile_uid?
// ─────────────────────────────────────────────────────────────────────────────
export const checkFwdStatus = createServerFn({ method: "GET" })
  .inputValidator((input: StatusInput) => input)
  .handler(async ({ data: input }) => {
    const { user } = await verifyTreyIUser(input.accessToken);
    const treyTvUid = await getTreyTvUid(user.id);
    return { ok: true as const, connected: !!treyTvUid, treyTvUid: treyTvUid ?? null };
  });

// ─────────────────────────────────────────────────────────────────────────────
// getFwdGifLibrary
// ─────────────────────────────────────────────────────────────────────────────
export const getFwdGifLibrary = createServerFn({ method: "GET" })
  .inputValidator((input: LibraryInput) => input)
  .handler(async ({ data: input }) => {
    const { user } = await verifyTreyIUser(input.accessToken);
    const treyTvUid = await getTreyTvUid(user.id);
    if (!treyTvUid) return { ok: false as const, error: "No Trey TV UID on profile." };

    return fwdFetch<{ gifs: FwdGifItem[]; total: number; offset: number; limit: number }>(
      "library",
      treyTvUid,
      "GET",
      undefined,
      {
        tab: input.tab,
        limit: String(input.limit ?? 48),
        offset: String(input.offset ?? 0),
      },
    );
  });

// ─────────────────────────────────────────────────────────────────────────────
// captureFwdGif
// ─────────────────────────────────────────────────────────────────────────────
export const captureFwdGif = createServerFn({ method: "POST" })
  .inputValidator((input: CaptureInput) => input)
  .handler(async ({ data: input }) => {
    const { user } = await verifyTreyIUser(input.accessToken);
    const treyTvUid = await getTreyTvUid(user.id);
    if (!treyTvUid) return { ok: false as const, error: "No Trey TV UID on profile." };

    const { accessToken: _at, ...body } = input;
    return fwdFetch<{ action: string; id: string }>("capture", treyTvUid, "POST", body);
  });

// ─────────────────────────────────────────────────────────────────────────────
// saveFwdGif
// ─────────────────────────────────────────────────────────────────────────────
export const saveFwdGif = createServerFn({ method: "POST" })
  .inputValidator((input: SaveInput) => input)
  .handler(async ({ data: input }) => {
    const { user } = await verifyTreyIUser(input.accessToken);
    const treyTvUid = await getTreyTvUid(user.id);
    if (!treyTvUid) return { ok: false as const, error: "No Trey TV UID on profile." };

    return fwdFetch<Record<string, never>>("save", treyTvUid, "POST", { id: input.id });
  });

// ─────────────────────────────────────────────────────────────────────────────
// markFwdGifUsed
// ─────────────────────────────────────────────────────────────────────────────
export const markFwdGifUsed = createServerFn({ method: "POST" })
  .inputValidator((input: MarkUsedInput) => input)
  .handler(async ({ data: input }) => {
    const { user } = await verifyTreyIUser(input.accessToken);
    const treyTvUid = await getTreyTvUid(user.id);
    if (!treyTvUid) return { ok: false as const, error: "No Trey TV UID on profile." };

    return fwdFetch<Record<string, never>>("mark-used", treyTvUid, "POST", {
      ...(input.id ? { id: input.id } : {}),
      ...(input.gif_url ? { gif_url: input.gif_url } : {}),
    });
  });

// ─────────────────────────────────────────────────────────────────────────────
// removeFwdGif
// ─────────────────────────────────────────────────────────────────────────────
export const removeFwdGif = createServerFn({ method: "POST" })
  .inputValidator((input: RemoveInput) => input)
  .handler(async ({ data: input }) => {
    const { user } = await verifyTreyIUser(input.accessToken);
    const treyTvUid = await getTreyTvUid(user.id);
    if (!treyTvUid) return { ok: false as const, error: "No Trey TV UID on profile." };

    return fwdFetch<Record<string, never>>("remove", treyTvUid, "POST", { id: input.id });
  });
