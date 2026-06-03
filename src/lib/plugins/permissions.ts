// Internal read-only diagnostic plugin layer. Keep this module free of writes,
// secrets, tokens, passwords, private messages, and private user data.
import { verifyAdmin } from "../admin/post-queue.server";
import type { PluginAccessMode, PluginBridgeMetadata } from "./types";

const READ_ONLY_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const PLUGIN_BRIDGE_VERSION = "0.2.0" as const;

export function isPluginReadOnlyMethod(method: string): boolean {
  return READ_ONLY_METHODS.has(method.toUpperCase());
}

export function pluginJson(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      pragma: "no-cache",
    },
  });
}

export function pluginNoContent(status = 204): Response {
  return new Response(null, {
    status,
    headers: {
      "cache-control": "no-store",
      pragma: "no-cache",
    },
  });
}

export async function methodNotAllowed(request: Request): Promise<Response> {
  const access = await resolvePluginAccess(request);
  return pluginJson(
    {
      error: "Method not allowed.",
      ...createPluginMetadata(request, access, [
        "Only read-only plugin bridge methods are allowed.",
      ]),
      readOnly: true,
      allowedMethods: ["GET", "HEAD", "OPTIONS"],
    },
    405,
  );
}

export type PluginAccessDecision = {
  allowed: boolean;
  accessMode: PluginAccessMode;
  warnings: string[];
};

function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization")?.trim();
  if (!authHeader?.toLowerCase().startsWith("bearer ")) return null;

  const token = authHeader.slice("bearer ".length).trim();
  return token || null;
}

export async function resolvePluginAccess(request: Request): Promise<PluginAccessDecision> {
  const url = new URL(request.url);
  if (LOCAL_HOSTS.has(url.hostname)) {
    return {
      allowed: true,
      accessMode: "local_dev",
      warnings: [],
    };
  }

  const bearerToken = getBearerToken(request);
  if (bearerToken) {
    try {
      await verifyAdmin(bearerToken);
      return {
        allowed: true,
        accessMode: "admin",
        warnings: [],
      };
    } catch {
      // Do not reveal whether the token, profile, admin config, or account status failed.
    }
  }

  // TODO: Enable codex_internal only after Trey TV has a confirmed server-side
  // internal request helper. Do not add a header/token bypass here.
  return {
    allowed: false,
    accessMode: "public_denied",
    warnings: [
      "Plugin Bridge access is denied for non-local requests unless a confirmed server-side admin auth check succeeds.",
      "codex_internal access remains disabled until Trey TV has a confirmed server-side internal request helper.",
    ],
  };
}

export function createPluginMetadata(
  request: Request,
  access: PluginAccessDecision,
  warnings: string[] = [],
): PluginBridgeMetadata {
  return {
    pluginBridgeVersion: PLUGIN_BRIDGE_VERSION,
    readOnly: true,
    generatedAt: new Date().toISOString(),
    accessMode: access.accessMode,
    endpoint: new URL(request.url).pathname,
    warnings: [...access.warnings, ...warnings],
  };
}

export function pluginAccessDenied(request: Request, access: PluginAccessDecision): Response {
  return pluginJson(
    {
      error: "Plugin Bridge access denied.",
      ...createPluginMetadata(request, access),
    },
    403,
  );
}
