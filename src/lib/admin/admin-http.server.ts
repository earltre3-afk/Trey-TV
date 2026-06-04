import { getTreyIServiceClient } from "@/lib/trey-i/onboarding.server";
import { ADMIN_ACTIONS, type AdminActionName } from "@/lib/admin/adminActions";
import { roleHasPermission, type AdminRole } from "@/lib/admin/permissions";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
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

async function loadAdmin(userId: string): Promise<{ role: AdminRole; permissions: string[] } | null> {
  const { data } = await getTreyIServiceClient()
    .from("admin_users")
    .select("role, permissions, revoked_at")
    .eq("user_id", userId)
    .is("revoked_at", null)
    .maybeSingle();
  if (!data?.role) return null;
  return { role: data.role as AdminRole, permissions: (data.permissions as string[]) ?? [] };
}

function actionForPath(pathname: string): AdminActionName | null {
  for (const [name, spec] of Object.entries(ADMIN_ACTIONS)) {
    if (spec.path === pathname) return name as AdminActionName;
  }
  return null;
}

async function dispatch(action: AdminActionName, actorId: string, body: any) {
  const svc = getTreyIServiceClient();
  switch (action) {
    case "users.status":
      return svc.rpc("admin_set_user_status", {
        p_actor: actorId, p_target: body.target, p_status: body.status,
        p_reason: body.reason ?? null, p_days: body.days ?? null,
      });
    case "users.gold":
      return svc.rpc("admin_set_gold", { p_actor: actorId, p_target: body.target, p_value: !!body.value });
    case "users.creator":
      return svc.rpc("admin_set_creator_status", {
        p_actor: actorId, p_target: body.target, p_status: body.status,
      });
  }
}

export async function handleAdminApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/admin/")) return null;
  if (request.method === "OPTIONS") return json({});
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const action = actionForPath(url.pathname);
  if (!action) return json({ error: "Unknown admin action." }, 404);

  const user = await getUserFromBearer(request);
  if (!user) return json({ error: "Not authenticated." }, 401);

  const admin = await loadAdmin(user.id);
  if (!admin) return json({ error: "Forbidden." }, 403);

  const required = ADMIN_ACTIONS[action].requiredPermission;
  if (!roleHasPermission(admin.role, required, admin.permissions)) {
    return json({ error: "Forbidden." }, 403);
  }

  let body: any;
  try { body = await request.json(); } catch { return json({ error: "Bad request." }, 400); }
  if (!body?.target) return json({ error: "Missing target." }, 400);

  const { data, error } = (await dispatch(action, user.id, body)) ?? { data: null, error: null };
  if (error) {
    const status = (error as any).code === "42501" ? 403 : 400;
    return json({ error: "Action failed." }, status);
  }
  return json({ ok: true, record: data });
}
