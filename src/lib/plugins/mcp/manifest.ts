import type { TreyTvMcpToolDescriptor } from "./types";

// Read-only MCP adapter metadata for trusted Trey TV admin/Codex tooling.
// These descriptors map future MCP tools to existing safe Plugin Bridge GET endpoints.
export const TREY_TV_MCP_TOOLS: readonly TreyTvMcpToolDescriptor[] = [
  {
    name: "get_trey_tv_status",
    description:
      "Read Trey TV app health, safe environment-name presence, expected domains, and diagnostic warnings.",
    endpoint: "/api/plugins/status",
    method: "GET",
    readOnly: true,
    sensitiveData: false,
    requiresAdmin: true,
    responseShape:
      "PluginBridgeMetadata plus appName, appStack, environmentLabel, timestamp, requiredEnv name/presence, expected domains, buildSafe, and warnings.",
    safetyNotes: [
      "Reports environment variable names and presence only, never values.",
      "Does not read private user records, private messages, OAuth tokens, or service role values.",
    ],
  },
  {
    name: "get_trey_tv_features",
    description: "Read the safe Trey TV feature registry and protected-feature notes.",
    endpoint: "/api/plugins/features",
    method: "GET",
    readOnly: true,
    sensitiveData: false,
    requiresAdmin: true,
    responseShape:
      "PluginBridgeMetadata plus features with key, displayName, status, protected flag, safe related files, and notes.",
    safetyNotes: [
      "Uses a static registry and safe file references.",
      "Does not inspect protected onboarding data or private account details.",
    ],
  },
  {
    name: "get_trey_tv_games",
    description: "Read the safe Trey TV games capability registry.",
    endpoint: "/api/plugins/games",
    method: "GET",
    readOnly: true,
    sensitiveData: false,
    requiresAdmin: true,
    responseShape:
      "PluginBridgeMetadata plus games with type, displayName, quick play, multiplayer, player limits, bot fill support, and status.",
    safetyNotes: [
      "Uses static capability metadata only.",
      "Does not join game room data, player identity, or private session state.",
    ],
  },
  {
    name: "get_fwd_integration_status",
    description: "Read safe FWD integration status for fwd.treytv.com surfaces.",
    endpoint: "/api/plugins/fwd",
    method: "GET",
    readOnly: true,
    sensitiveData: false,
    requiresAdmin: true,
    responseShape:
      "PluginBridgeMetadata plus expectedFwdDomain, OAuth and picker presence, message/comment/profile integration statuses, and warnings.",
    safetyNotes: [
      "Uses fwd.treytv.com and code-surface presence only.",
      "Does not expose OAuth secrets, access tokens, GIF payloads, private messages, or private comments.",
    ],
  },
  {
    name: "get_protected_flows",
    description:
      "Read protected Trey TV flow rules and file patterns without reading private onboarding data.",
    endpoint: "/api/plugins/protected-flows",
    method: "GET",
    readOnly: true,
    sensitiveData: false,
    requiresAdmin: true,
    responseShape:
      "PluginBridgeMetadata plus protected Trey-I file patterns, profile UID routing rules, date_of_birth rule, public UID rule, and warnings.",
    safetyNotes: [
      "Reports protected paths and rules only.",
      "Does not read Trey-I onboarding submissions, private profile data, or profiles.age.",
    ],
  },
];

export function listTreyTvMcpTools(): TreyTvMcpToolDescriptor[] {
  return TREY_TV_MCP_TOOLS.map((tool) => ({ ...tool, safetyNotes: [...tool.safetyNotes] }));
}

export function getTreyTvMcpTool(name: string): TreyTvMcpToolDescriptor | undefined {
  const tool = TREY_TV_MCP_TOOLS.find((candidate) => candidate.name === name);
  return tool ? { ...tool, safetyNotes: [...tool.safetyNotes] } : undefined;
}
