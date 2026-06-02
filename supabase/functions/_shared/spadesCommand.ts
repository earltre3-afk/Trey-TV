import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export type SpadesIdentity =
  | {
      kind: "supabase_auth";
      userId: string;
      tvDeviceTokenPresent: false;
    }
  | {
      kind: "tv_device_token_pending";
      userId: null;
      tvDeviceTokenPresent: true;
    };

export type SpadesCommandErrorCode =
  | "bad_request"
  | "unauthorized"
  | "not_implemented"
  | "server_config_missing";

export type SpadesCommandEnvelope<TBody = Record<string, unknown>> = {
  body: TBody;
  identity: SpadesIdentity;
  serviceClient: ReturnType<typeof createClient>;
};

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-tv-device-token",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "content-type": "application/json; charset=utf-8",
    },
  });
}

export function optionsResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export function commandError(code: SpadesCommandErrorCode, message: string, status: number): Response {
  return jsonResponse(
    {
      ok: false,
      error: { code, message },
    },
    status,
  );
}

export async function readJsonBody<TBody = Record<string, unknown>>(req: Request): Promise<TBody> {
  if (req.method === "GET") {
    return {} as TBody;
  }

  const raw = await req.text();
  if (!raw.trim()) {
    return {} as TBody;
  }

  try {
    return JSON.parse(raw) as TBody;
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}

export function getBearerToken(req: Request): string | null {
  const header = req.headers.get("authorization");
  const match = header?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export function getTvDeviceToken(req: Request, body: Record<string, unknown>): string | null {
  const headerToken = req.headers.get("x-tv-device-token")?.trim();
  const bodyToken = typeof body.tvDeviceToken === "string" ? body.tvDeviceToken.trim() : "";
  return headerToken || bodyToken || null;
}

export function createServiceClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function resolveSpadesIdentity(
  req: Request,
  body: Record<string, unknown>,
  serviceClient: ReturnType<typeof createClient>,
): Promise<SpadesIdentity | null> {
  const bearerToken = getBearerToken(req);
  if (bearerToken) {
    const { data, error } = await serviceClient.auth.getUser(bearerToken);
    if (error || !data.user) {
      return null;
    }

    return {
      kind: "supabase_auth",
      userId: data.user.id,
      tvDeviceTokenPresent: false,
    };
  }

  const tvDeviceToken = getTvDeviceToken(req, body);
  if (tvDeviceToken) {
    // TODO(SPADES-4): Validate hashed tvDeviceToken server-side, resolve the paired
    // Supabase auth user/profile, and reject unpaired or expired device sessions.
    return {
      kind: "tv_device_token_pending",
      userId: null,
      tvDeviceTokenPresent: true,
    };
  }

  return null;
}

export async function prepareSpadesCommand<TBody = Record<string, unknown>>(
  req: Request,
): Promise<SpadesCommandEnvelope<TBody> | Response> {
  let body: TBody;
  try {
    body = await readJsonBody<TBody>(req);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request body.";
    return commandError("bad_request", message, 400);
  }

  const serviceClient = createServiceClient();
  if (!serviceClient) {
    return commandError("server_config_missing", "Supabase service configuration is not available.", 500);
  }

  const identity = await resolveSpadesIdentity(req, body as Record<string, unknown>, serviceClient);
  if (!identity) {
    return commandError("unauthorized", "A Supabase Auth bearer token or validated TV device session is required.", 401);
  }

  return {
    body,
    identity,
    serviceClient,
  };
}

export function notImplementedProjectionResponse(command: string, identity: SpadesIdentity): Response {
  return jsonResponse(
    {
      ok: false,
      error: {
        code: "not_implemented",
        message: `${command} is scaffolded locally but not wired to the authoritative Spades engine yet.`,
      },
      identityMode: identity.kind,
      projection: null,
    },
    501,
  );
}

export function requireString(value: unknown, fieldName: string): string | Response {
  if (typeof value !== "string" || !value.trim()) {
    return commandError("bad_request", `${fieldName} is required.`, 400);
  }

  return value.trim();
}
