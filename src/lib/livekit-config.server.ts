/**
 * Strict server-side LiveKit configuration loader.
 *
 * Reads LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and
 * LIVEKIT_AGENT_NAME from the runtime env object (Cloudflare-style)
 * or process.env.  Never returns raw secret values to callers outside
 * this module — only the token-generation helper and the diagnostics
 * endpoint consume the secrets directly.
 */

type EnvRecord = Record<string, unknown>;

function readEnv(env: unknown, key: string): string {
  const fromRuntime = env && typeof env === "object" ? (env as EnvRecord)[key] : undefined;
  if (typeof fromRuntime === "string" && fromRuntime.trim()) return fromRuntime.trim();
  const fromProcess = typeof process !== "undefined" ? process.env?.[key] : undefined;
  return typeof fromProcess === "string" ? fromProcess.trim() : "";
}

export interface LiveKitConfig {
  url: string;
  apiKey: string;
  apiSecret: string;
  agentName: string;
}

export interface LiveKitConfigDiagnostics {
  livekitUrlPresent: boolean;
  livekitUrlHost: string;
  apiKeyPresent: boolean;
  apiKeyPrefix: string;
  apiSecretPresent: boolean;
  apiSecretLength: number;
  agentName: string;
  issues: string[];
}

/**
 * Load and validate LiveKit config from environment.
 *
 * Throws a sanitised error if required values are missing or malformed.
 * The error message never includes raw secret values.
 */
export function loadLiveKitConfig(env: unknown): LiveKitConfig {
  const url =
    readEnv(env, "LIVEKIT_URL") ||
    readEnv(env, "VITE_LIVEKIT_URL"); // legacy fallback

  const apiKey = readEnv(env, "LIVEKIT_API_KEY");
  const apiSecret = readEnv(env, "LIVEKIT_API_SECRET");
  const agentName = readEnv(env, "LIVEKIT_AGENT_NAME") || "Hayden-1f01";

  if (!url) {
    throw new Error("LiveKit URL is not configured. Set LIVEKIT_URL in the environment.");
  }
  if (!url.startsWith("wss://") && !url.startsWith("ws://")) {
    throw new Error("LiveKit URL must start with wss:// or ws://.");
  }
  if (!apiKey) {
    throw new Error("LIVEKIT_API_KEY is missing from the environment.");
  }
  if (!apiSecret) {
    throw new Error("LIVEKIT_API_SECRET is missing from the environment.");
  }

  return { url, apiKey, apiSecret, agentName };
}

/**
 * Build safe diagnostics about the LiveKit configuration.
 *
 * Never includes the full API key, the API secret, or any token.
 */
export function getLiveKitConfigDiagnostics(env: unknown): LiveKitConfigDiagnostics {
  const url = readEnv(env, "LIVEKIT_URL") || readEnv(env, "VITE_LIVEKIT_URL");
  const apiKey = readEnv(env, "LIVEKIT_API_KEY");
  const apiSecret = readEnv(env, "LIVEKIT_API_SECRET");
  const agentName = readEnv(env, "LIVEKIT_AGENT_NAME") || "Hayden-1f01";
  const issues: string[] = [];

  let urlHost = "";
  if (!url) {
    issues.push("LIVEKIT_URL is not set.");
  } else if (!url.startsWith("wss://") && !url.startsWith("ws://")) {
    issues.push("LIVEKIT_URL does not start with wss:// or ws://.");
  } else {
    try {
      urlHost = new URL(url).hostname;
    } catch {
      issues.push("LIVEKIT_URL is not a valid URL.");
    }
  }

  if (!apiKey) issues.push("LIVEKIT_API_KEY is not set.");
  if (!apiSecret) issues.push("LIVEKIT_API_SECRET is not set.");

  if (apiKey && apiSecret && url) {
    // Warn if key/secret might not match the URL project.
    // This is informational only — we can't verify without a real handshake.
  }

  return {
    livekitUrlPresent: Boolean(url),
    livekitUrlHost: urlHost,
    apiKeyPresent: Boolean(apiKey),
    apiKeyPrefix: apiKey ? apiKey.slice(0, 4) : "",
    apiSecretPresent: Boolean(apiSecret),
    apiSecretLength: apiSecret ? apiSecret.length : 0,
    agentName,
    issues,
  };
}
