import type { EnvPresence, PluginHealthStatus } from "./types";

const REQUIRED_ENV: EnvPresence[] = [
  { name: "VITE_SUPABASE_URL", present: false, requiredFor: "Supabase browser client" },
  { name: "VITE_SUPABASE_ANON_KEY", present: false, requiredFor: "Supabase browser client" },
  { name: "SUPABASE_SERVICE_ROLE_KEY", present: false, requiredFor: "trusted server helpers" },
  { name: "FWD_OAUTH_SECRET_PEPPER", present: false, requiredFor: "FWD OAuth token signing" },
  { name: "GOOGLE_GENERATIVE_AI_API_KEY", present: false, requiredFor: "Trey-I generation" },
  { name: "ELEVENLABS_API_KEY", present: false, requiredFor: "Trey-I voice sessions" },
];

function readEnvName(name: string): string | undefined {
  const viteEnv = import.meta.env as Record<string, string | undefined>;
  return viteEnv[name] ?? process.env[name];
}

function environmentLabel(): string {
  const viteMode = (import.meta.env.MODE || "").trim();
  const nodeEnv = (process.env.NODE_ENV || "").trim();
  return viteMode || nodeEnv || "unknown";
}

export function getPluginHealthStatus(): PluginHealthStatus {
  const requiredEnv = REQUIRED_ENV.map((entry) => ({
    ...entry,
    present: Boolean(readEnvName(entry.name)),
  }));
  const missingNames = requiredEnv.filter((entry) => !entry.present).map((entry) => entry.name);

  return {
    appName: "Trey TV",
    appStack: [
      "TanStack Start",
      "TanStack Router",
      "Vite",
      "React",
      "Supabase",
      "Cloudflare-compatible server entry",
    ],
    environmentLabel: environmentLabel(),
    timestamp: new Date().toISOString(),
    requiredEnv,
    activeDomainsExpected: ["tv.treytrizzy.com", "fwd.treytv.com"],
    buildSafe: {
      detected: true,
      mode: environmentLabel(),
      readOnly: true,
    },
    warnings: missingNames.map((name) => `Missing environment variable: ${name}`),
  };
}
