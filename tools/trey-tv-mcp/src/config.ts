export type TreyTvMcpConfig = {
  baseUrl: string;
  adminBearerToken?: string;
  localOnly: boolean;
};

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export function isLocalPluginBaseUrl(baseUrl: string): boolean {
  const url = new URL(baseUrl);
  return LOCAL_HOSTS.has(url.hostname);
}

export function readConfig(env: NodeJS.ProcessEnv = process.env): TreyTvMcpConfig {
  const baseUrl = (env.TREY_TV_PLUGIN_BASE_URL || DEFAULT_BASE_URL).trim().replace(/\/+$/, "");
  const parsed = new URL(baseUrl);

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("TREY_TV_PLUGIN_BASE_URL must be an http or https URL.");
  }

  const adminBearerToken = env.TREY_TV_PLUGIN_ADMIN_BEARER_TOKEN?.trim() || undefined;
  const localOnly = isLocalPluginBaseUrl(baseUrl);

  if (!localOnly && !adminBearerToken) {
    throw new Error(
      "Non-local Trey TV Plugin Bridge access requires TREY_TV_PLUGIN_ADMIN_BEARER_TOKEN.",
    );
  }

  return {
    baseUrl,
    adminBearerToken,
    localOnly,
  };
}
