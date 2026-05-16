import { getTreyIServiceClient } from "@/lib/trey-i/onboarding.server";

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

// Server-side site URL resolution uses process.env, never client-visible env.
function resolveSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
    process.env.VITE_SITE_URL?.trim().replace(/\/+$/, "") ||
    process.env.TREY_TV_PUBLIC_ORIGIN?.trim().replace(/\/+$/, "") ||
    "https://tv.treytrizzy.com"
  );
}

async function getUserFromBearer(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const bearer = auth.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (!bearer) return null;

  try {
    const service = getTreyIServiceClient();
    const { data, error } = await service.auth.getUser(bearer);
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

// GET /api/auth/session
// Returns whether the caller is authenticated and a safe profile summary.
// Accepts: Authorization: Bearer <supabase-jwt>
// Never exposes secrets, tokens, or stack traces.
export async function handleAuthSession(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return json({});
  if (request.method !== "GET") return json({ error: "Method not allowed." }, 405);

  try {
    const user = await getUserFromBearer(request);
    if (!user) return json({ authenticated: false, user: null });

    const service = getTreyIServiceClient();
    const { data: profile } = await service
      .from("profiles")
      .select(
        "public_profile_uid, display_name, username, onboarding_completed, role, creator_status, gold_verified",
      )
      .eq("id", user.id)
      .maybeSingle();

    return json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email ?? null,
        public_profile_uid: profile?.public_profile_uid ?? null,
        display_name: profile?.display_name ?? null,
        username: profile?.username ?? null,
        onboarding_completed: profile?.onboarding_completed ?? false,
        role: profile?.role ?? "user",
        is_creator: profile?.creator_status === "approved",
        is_admin: profile?.role === "admin",
        is_gold_verified: Boolean(profile?.gold_verified),
      },
    });
  } catch {
    return json({ error: "Session check failed." }, 500);
  }
}

// GET /api/auth/me
// Returns the authenticated user + full profile summary.
// Returns 401 with a safe message if not signed in.
export async function handleAuthMe(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return json({});
  if (request.method !== "GET") return json({ error: "Method not allowed." }, 405);

  const user = await getUserFromBearer(request);
  if (!user) return json({ error: "Not authenticated." }, 401);

  try {
    const service = getTreyIServiceClient();
    const { data: profile } = await service
      .from("profiles")
      .select(
        "public_profile_uid, display_name, username, avatar_url, bio, role, creator_status, gold_verified, onboarding_completed",
      )
      .eq("id", user.id)
      .maybeSingle();

    const origin = resolveSiteUrl();
    const uid = profile?.public_profile_uid ?? null;

    return json({
      id: user.id,
      email: user.email ?? null,
      public_profile_uid: uid,
      display_name: profile?.display_name ?? null,
      username: profile?.username ?? null,
      avatar_url: profile?.avatar_url ?? null,
      bio: profile?.bio ?? null,
      onboarding_completed: profile?.onboarding_completed ?? false,
      role: profile?.role ?? "user",
      is_creator: profile?.creator_status === "approved",
      is_admin: profile?.role === "admin",
      is_gold_verified: Boolean(profile?.gold_verified),
      profile_url: uid ? `${origin}/u/${uid}` : null,
    });
  } catch {
    return json({ error: "Could not load profile." }, 500);
  }
}

// POST /api/auth/logout
// Instructs the client to clear its local session.
// In this Cloudflare Worker setup, Supabase sessions live in the browser
// (localStorage), so the client must also call supabase.auth.signOut().
// Accepts JSON (returns JSON) or plain requests (redirects to /).
export async function handleAuthLogout(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return json({});
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const accepts = request.headers.get("accept") ?? "";
  const wantsJson = accepts.includes("application/json") || accepts.includes("*/*");

  if (wantsJson) {
    return json({ ok: true, redirect: resolveSiteUrl() });
  }

  return new Response(null, {
    status: 302,
    headers: { Location: resolveSiteUrl() },
  });
}
