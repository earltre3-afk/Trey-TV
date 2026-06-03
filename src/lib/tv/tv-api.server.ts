import { allEpisodes, channels, rails, showById, shows } from "@/lib/watch-data";
import { getTreyIServiceClient } from "@/lib/trey-i/onboarding.server";

type TvDeviceSession = {
  id: string;
  device_code: string;
  user_code: string;
  created_at: string;
  expires_at: string;
  status: "pending" | "approved" | "expired" | "denied";
  user_id?: string | null;
  session_reference?: string | null;
};

const POLLING_INTERVAL_SECONDS = 5;
const DEVICE_SESSION_TTL_MS = 10 * 60 * 1000;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      pragma: "no-cache",
    },
  });
}

function resolveOrigin(request: Request) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
    process.env.VITE_SITE_URL?.trim().replace(/\/+$/, "") ||
    process.env.TREY_TV_PUBLIC_ORIGIN?.trim().replace(/\/+$/, "") ||
    new URL(request.url).origin
  );
}

function randomToken(bytes = 24) {
  const values = new Uint8Array(bytes);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
}

function randomUserCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = new Uint8Array(8);
  crypto.getRandomValues(values);
  const code = Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
  return code;
}

function normalizeUserCode(code: string) {
  return code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function displayUserCode(code: string) {
  const normalized = normalizeUserCode(code);
  return normalized.length > 4 ? `${normalized.slice(0, 4)}-${normalized.slice(4)}` : normalized;
}

async function readJsonBody(request: Request) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function getUserFromBearer(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const bearer = auth.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (!bearer) return null;

  try {
    const service = getTreyIServiceClient();
    const { data, error } = await service.auth.getUser(bearer);
    if (error || !data.user) return null;
    return { user: data.user, accessToken: bearer };
  } catch {
    return null;
  }
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function base64Encode(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64Decode(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function tvSessionCryptoKey() {
  const secret = process.env.TV_DEVICE_SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) return null;
  const material = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", material, "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function encryptSessionReference(accessToken: string) {
  const key = await tvSessionCryptoKey();
  if (!key) return null;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(accessToken),
  );
  return `v1:${base64Encode(iv)}:${base64Encode(new Uint8Array(encrypted))}`;
}

async function decryptSessionReference(reference: string | null | undefined) {
  if (!reference?.startsWith("v1:")) return null;
  const key = await tvSessionCryptoKey();
  if (!key) return null;
  const [, rawIv, rawEncrypted] = reference.split(":");
  if (!rawIv || !rawEncrypted) return null;
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64Decode(rawIv) },
      key,
      base64Decode(rawEncrypted),
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

function isExpired(row: Pick<TvDeviceSession, "expires_at">) {
  return new Date(row.expires_at).getTime() <= Date.now();
}

async function markSessionExpired(deviceCode: string) {
  try {
    const service = getTreyIServiceClient();
    await (service as any)
      .from("tv_device_sessions")
      .update({ status: "expired" })
      .eq("device_code", deviceCode)
      .eq("status", "pending");
  } catch {}
}

function sampleStreamUrl() {
  return "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
}

function episodeToTvItem(episodeId: string, progressByEpisode = new Map<string, any>()) {
  const episode = allEpisodes.find((item) => item.id === episodeId) ?? allEpisodes[0];
  const show = showById(episode.showId) ?? shows[0];
  const channel = channels.find((item) => item.id === episode.channelId);
  const progress = progressByEpisode.get(episode.id);

  return {
    id: episode.id,
    title: episode.title,
    description: show.description,
    thumbnail_url: episode.thumb,
    creator_name: channel?.name ?? "Trey TV",
    channel_name: channel?.name ?? "Trey TV",
    duration_seconds: episode.duration * 60,
    duration_label: `${episode.duration}m`,
    playback_url: sampleStreamUrl(),
    stream_url: sampleStreamUrl(),
    content_rating: show.rating,
    visibility: episode.premium ? "premium" : "free",
    resume_position_seconds: Number(progress?.progress_seconds ?? 0),
  };
}

async function loadProgressRows(userId: string | null): Promise<Map<string, any>> {
  if (!userId) return new Map<string, any>();
  try {
    const service = getTreyIServiceClient();
    const { data } = await (service as any)
      .from("user_video_progress")
      .select(
        "episode_id, progress_seconds, duration_seconds, progress_ratio, completed, last_watched_at",
      )
      .eq("user_id", userId)
      .order("last_watched_at", { ascending: false })
      .limit(50);
    return new Map<string, any>((data ?? []).map((row: any) => [String(row.episode_id), row]));
  } catch {
    return new Map<string, any>();
  }
}

async function loadFeedVideos(progressByEpisode: Map<string, any>) {
  try {
    const service = getTreyIServiceClient();
    const { data, error } = await (service as any)
      .from("user_feed_posts")
      .select(
        "id, body, media_url, gif_poster_url, gif_title, source_type, created_at, profiles:user_id(display_name, username, avatar_url)",
      )
      .not("media_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(24);

    if (error) return [];

    return ((data ?? []) as any[])
      .map((row) => {
        const mediaUrl = String(row.media_url ?? "");
        const looksPlayable = /\.(m3u8|mp4)(\?|$)/i.test(mediaUrl) || mediaUrl.includes("stream");
        if (!mediaUrl || !looksPlayable) return null;
        const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
        const progress = progressByEpisode.get(row.id);
        return {
          id: row.id,
          title: row.gif_title || row.body?.slice(0, 72) || "Trey TV video",
          description: row.body || "Creator video from Trey TV.",
          thumbnail_url: row.gif_poster_url || null,
          creator_name: profile?.display_name || profile?.username || "Trey TV creator",
          channel_name: profile?.display_name || profile?.username || "Trey TV",
          duration_seconds: Number(progress?.duration_seconds ?? 0),
          duration_label: progress?.duration_seconds
            ? `${Math.round(Number(progress.duration_seconds) / 60)}m`
            : "Video",
          playback_url: mediaUrl,
          stream_url: mediaUrl,
          content_rating: null,
          visibility: "public",
          resume_position_seconds: Number(progress?.progress_seconds ?? 0),
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function handleDeviceStart(request: Request) {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const service = getTreyIServiceClient();
  const expiresAt = new Date(Date.now() + DEVICE_SESSION_TTL_MS).toISOString();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const deviceCode = `tv_${randomToken(24)}`;
    const userCode = randomUserCode();
    const { data, error } = await (service as any)
      .from("tv_device_sessions")
      .insert({
        device_code: deviceCode,
        user_code: userCode,
        status: "pending",
        expires_at: expiresAt,
        device_label: "Trey TV streaming-box app",
        user_agent: request.headers.get("user-agent")?.slice(0, 240) ?? null,
      })
      .select("device_code, user_code, expires_at")
      .single();

    if (!error && data) {
      return json({
        device_code: data.device_code,
        user_code: displayUserCode(data.user_code),
        verification_url: `${resolveOrigin(request)}/tv/activate`,
        expires_at: data.expires_at,
        polling_interval_seconds: POLLING_INTERVAL_SECONDS,
      });
    }
  }

  return json({ error: "Could not start TV device sign-in. Try again." }, 500);
}

async function handleDeviceStatus(request: Request) {
  if (request.method !== "GET") return json({ error: "Method not allowed." }, 405);
  const deviceCode = new URL(request.url).searchParams.get("device_code") ?? "";
  if (!deviceCode.startsWith("tv_") || deviceCode.length < 32) return json({ status: "expired" });

  const service = getTreyIServiceClient();
  const { data: session } = await (service as any)
    .from("tv_device_sessions")
    .select(
      "id, device_code, user_code, status, user_id, session_reference, created_at, expires_at",
    )
    .eq("device_code", deviceCode)
    .maybeSingle();

  if (!session) return json({ status: "expired" });

  await (service as any)
    .from("tv_device_sessions")
    .update({ last_polled_at: new Date().toISOString() })
    .eq("device_code", deviceCode);

  if (isExpired(session)) {
    await markSessionExpired(deviceCode);
    return json({ status: "expired" });
  }
  if (session.status === "denied") return json({ status: "denied" });
  if (session.status !== "approved") return json({ status: "pending" });

  const accessToken = await decryptSessionReference(session.session_reference);
  if (!accessToken)
    return json({ status: "approved", error: "TV session handoff is not configured." }, 503);

  return json({
    status: "approved",
    access_token: accessToken,
    token_type: "bearer",
    expires_at: session.expires_at,
    user_id: session.user_id,
  });
}

async function handleDeviceApprove(request: Request) {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const auth = await getUserFromBearer(request);
  if (!auth) return json({ error: "Sign in to approve this TV device." }, 401);

  const body = await readJsonBody(request);
  const userCode = typeof body.user_code === "string" ? body.user_code : "";
  const decision = body.decision === "deny" ? "deny" : "approve";
  const normalizedUserCode = normalizeUserCode(userCode);
  const service = getTreyIServiceClient();
  const { data: session } = await (service as any)
    .from("tv_device_sessions")
    .select("id, device_code, user_code, status, expires_at")
    .eq("user_code", normalizedUserCode)
    .maybeSingle();

  if (!session) return json({ error: "That TV code is invalid or expired." }, 404);
  if (session.status !== "pending" || isExpired(session)) {
    if (isExpired(session)) await markSessionExpired(session.device_code);
    return json({ error: "That TV code is no longer active." }, 410);
  }

  if (decision === "deny") {
    await (service as any)
      .from("tv_device_sessions")
      .update({ status: "denied", denied_at: new Date().toISOString() })
      .eq("id", session.id);
    return json({ ok: true, status: "denied" });
  }

  const sessionReference = await encryptSessionReference(auth.accessToken);
  if (!sessionReference) return json({ error: "TV session handoff is not configured." }, 500);

  await (service as any)
    .from("tv_device_sessions")
    .update({
      status: "approved",
      user_id: auth.user.id,
      access_token_hash: await sha256Hex(auth.accessToken),
      session_reference: sessionReference,
      approved_at: new Date().toISOString(),
    })
    .eq("id", session.id)
    .eq("status", "pending");

  return json({ ok: true, status: "approved" });
}

async function handleProfile(request: Request) {
  if (request.method !== "GET") return json({ error: "Method not allowed." }, 405);
  const auth = await getUserFromBearer(request);
  if (!auth) return json({ error: "Not authenticated." }, 401);

  try {
    const service = getTreyIServiceClient();
    const { data: profile } = await (service as any)
      .from("profiles")
      .select(
        "display_name, username, avatar_url, public_profile_uid, role, creator_status, gold_verified, profile_accent_color",
      )
      .eq("id", auth.user.id)
      .maybeSingle();

    return json({
      display_name: profile?.display_name ?? auth.user.email ?? "Trey TV viewer",
      username: profile?.username ?? null,
      handle: profile?.username ?? null,
      avatar_url: profile?.avatar_url ?? null,
      public_profile_uid: profile?.public_profile_uid ?? null,
      rewards_uid: profile?.public_profile_uid ?? null,
      is_creator: profile?.creator_status === "approved",
      is_admin: profile?.role === "admin" || profile?.role === "owner",
      is_gold_verified: Boolean(profile?.gold_verified),
      accent_color: profile?.profile_accent_color ?? "gold",
    });
  } catch {
    return json({ error: "Could not load TV profile." }, 500);
  }
}

async function handleContentHome(request: Request) {
  if (request.method !== "GET") return json({ error: "Method not allowed." }, 405);
  const auth = await getUserFromBearer(request);
  const progressByEpisode = await loadProgressRows(auth?.user.id ?? null);
  const feedVideos = await loadFeedVideos(progressByEpisode);
  const fallbackVideos = allEpisodes.map((episode) =>
    episodeToTvItem(episode.id, progressByEpisode),
  );
  const videos = feedVideos.length ? feedVideos : fallbackVideos;
  const continueWatching = Array.from(progressByEpisode.keys())
    .map((episodeId) => episodeToTvItem(episodeId, progressByEpisode))
    .filter((item) => item.resume_position_seconds > 0);

  return json({
    rows: [
      { id: "featured", title: "Featured", items: [videos[0] ?? fallbackVideos[0]] },
      { id: "continue-watching", title: "Continue Watching", items: continueWatching.slice(0, 12) },
      {
        id: "new-episodes",
        title: "New Episodes",
        items: rails.newEpisodes.map((id) => episodeToTvItem(id, progressByEpisode)),
      },
      {
        id: "creator-channels",
        title: "Creator Channels",
        items: channels.map((channel) => ({
          id: channel.id,
          name: channel.name,
          handle: channel.handle,
          tagline: `${channel.category} channel - ${channel.followers} followers`,
          avatar_url: channel.avatar,
        })),
      },
      {
        id: "music-videos",
        title: "Music Videos",
        items: rails.music
          .flatMap((showId) => showById(showId)?.episodes ?? [])
          .map((episode) => episodeToTvItem(episode.id, progressByEpisode)),
      },
      {
        id: "games-interactive",
        title: "Games / Interactive",
        items: tvGames(resolveOrigin(request)),
      },
    ],
  });
}

async function handleWatchProgress(request: Request) {
  const auth = await getUserFromBearer(request);
  if (!auth) return json({ error: "Not authenticated." }, 401);

  const service = getTreyIServiceClient();
  if (request.method === "GET") {
    const progressByEpisode = await loadProgressRows(auth.user.id);
    return json({
      progress: Array.from(progressByEpisode.values()).map((row: any) => ({
        video_id: row.episode_id,
        position_seconds: row.progress_seconds,
        duration_seconds: row.duration_seconds,
        completed: row.completed,
        updated_at: row.last_watched_at,
      })),
    });
  }

  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const body = await readJsonBody(request);
  const videoId = typeof body.video_id === "string" ? body.video_id : "";
  if (!videoId) return json({ error: "video_id is required." }, 400);
  const positionSeconds = Math.max(0, Math.floor(Number(body.position_seconds ?? 0)));
  const durationSeconds = Math.max(0, Math.floor(Number(body.duration_seconds ?? 0)));
  const completed = Boolean(body.completed);
  const ratio = durationSeconds > 0 ? Math.min(1, positionSeconds / durationSeconds) : 0;
  const episode = allEpisodes.find((item) => item.id === videoId);
  const watchedAt = typeof body.timestamp === "string" ? body.timestamp : new Date().toISOString();

  try {
    await (service as any).from("user_video_progress").upsert({
      user_id: auth.user.id,
      episode_id: videoId,
      show_id: episode?.showId ?? null,
      channel_id: episode?.channelId ?? null,
      progress_seconds: positionSeconds,
      duration_seconds: durationSeconds,
      progress_ratio: ratio,
      completed,
      last_watched_at: watchedAt,
      updated_at: new Date().toISOString(),
      metadata: { surface: "android_tv" },
    });

    await (service as any).from("user_watch_history").insert({
      user_id: auth.user.id,
      episode_id: videoId,
      show_id: episode?.showId ?? null,
      channel_id: episode?.channelId ?? null,
      progress_seconds: positionSeconds,
      duration_seconds: durationSeconds,
      progress_ratio: ratio,
      completed_at: completed ? watchedAt : null,
      metadata: { surface: "android_tv" },
    });
  } catch {
    return json({ error: "Could not save watch progress." }, 500);
  }

  return json({ ok: true });
}

function tvGames(origin: string) {
  const web = origin.replace(/\/+$/, "");
  return [
    {
      id: "truno",
      title: "Truno",
      description: "Fast color-and-number card battles.",
      launch_url: `${web}/games/truno?surface=tv&input=remote`,
      native_route: null,
      supports_remote: false,
      status: "beta",
    },
    {
      id: "spades",
      title: "Spades",
      description: "Classic team trick-taking for the big screen.",
      launch_url: `${web}/games/spades?surface=tv&input=remote`,
      native_route: null,
      supports_remote: false,
      status: "beta",
    },
    {
      id: "blackjack",
      title: "Blackjack",
      description: "Table-ready blackjack with remote selection.",
      launch_url: `${web}/games/blackjack?surface=tv&input=remote`,
      native_route: null,
      supports_remote: false,
      status: "beta",
    },
    {
      id: "bullshit",
      title: "Bullshit / Cheat",
      description: "Bluff, call, and clear your hand.",
      launch_url: `${web}/games/bullshit?surface=tv&input=remote`,
      native_route: null,
      supports_remote: false,
      status: "beta",
    },
    {
      id: "interactive-stories",
      title: "Interactive Stories",
      description: "Switch Kicks, God Ram, imports, and choice-led stories.",
      launch_url: `${web}/games/interactive-stories?surface=tv&input=remote`,
      native_route: null,
      supports_remote: false,
      status: "beta",
    },
    {
      id: "rpg",
      title: "RPG",
      description: "Trey TV RPG hub placeholder.",
      launch_url: `${web}/games?surface=tv&input=remote`,
      native_route: null,
      supports_remote: false,
      status: "coming_soon",
    },
  ];
}

function handleGames(request: Request) {
  if (request.method !== "GET") return json({ error: "Method not allowed." }, 405);
  return json({ games: tvGames(resolveOrigin(request)) });
}

export async function handleTvApiRequest(request: Request): Promise<Response | null> {
  const pathname = new URL(request.url).pathname;
  if (request.method === "OPTIONS" && pathname.startsWith("/api/tv/")) return json({});

  if (pathname === "/api/tv/device/start") return handleDeviceStart(request);
  if (pathname === "/api/tv/device/status") return handleDeviceStatus(request);
  if (pathname === "/api/tv/device/approve") return handleDeviceApprove(request);
  if (pathname === "/api/tv/profile") return handleProfile(request);
  if (pathname === "/api/tv/content/home") return handleContentHome(request);
  if (pathname === "/api/tv/watch-progress") return handleWatchProgress(request);
  if (pathname === "/api/tv/games") return handleGames(request);

  return null;
}
