export const TREY_TV_MCP_TOOL_NAMES = [
  "get_trey_tv_status",
  "get_trey_tv_features",
  "get_trey_tv_games",
  "get_fwd_integration_status",
  "get_protected_flows",
] as const;

export type TreyTvMcpToolName = (typeof TREY_TV_MCP_TOOL_NAMES)[number];

export type TreyTvMcpToolDescriptor = {
  name: string;
  description: string;
  endpoint: string;
  method: string;
  readOnly: boolean;
  sensitiveData: boolean;
  requiresAdmin: boolean;
  responseShape?: string;
  safetyNotes?: string[];
};

export type TreyTvMcpManifest = {
  pluginBridgeVersion: string;
  readOnly: true;
  accessMode: string;
  endpoint: string;
  manifestName: string;
  mcpReady: boolean;
  execution: "descriptor_only";
  tools: TreyTvMcpToolDescriptor[];
};

const ALLOWED_TOOL_NAMES = new Set<string>(TREY_TV_MCP_TOOL_NAMES);

export function isKnownTreyTvToolName(name: string): name is TreyTvMcpToolName {
  return ALLOWED_TOOL_NAMES.has(name);
}

export function assertSafeReadOnlyDescriptor(tool: TreyTvMcpToolDescriptor): void {
  if (!isKnownTreyTvToolName(tool.name)) {
    throw new Error(`Unknown Trey TV MCP tool: ${tool.name}`);
  }

  if (tool.method !== "GET") {
    throw new Error(`Refusing ${tool.name}: descriptor method must be GET.`);
  }

  if (tool.readOnly !== true) {
    throw new Error(`Refusing ${tool.name}: descriptor must be readOnly.`);
  }

  if (tool.sensitiveData !== false) {
    throw new Error(`Refusing ${tool.name}: descriptor must not expose sensitive data.`);
  }

  if (!tool.endpoint.startsWith("/api/plugins/")) {
    throw new Error(`Refusing ${tool.name}: endpoint must stay under /api/plugins/.`);
  }
}

export function findManifestTool(manifest: TreyTvMcpManifest, name: string): TreyTvMcpToolDescriptor {
  if (!isKnownTreyTvToolName(name)) {
    throw new Error(`Unknown Trey TV MCP tool: ${name}`);
  }

  const tool = manifest.tools.find((candidate) => candidate.name === name);
  if (!tool) {
    throw new Error(`Tool is not present in the Trey TV Plugin Bridge manifest: ${name}`);
  }

  assertSafeReadOnlyDescriptor(tool);
  return tool;
}

export function listSafeManifestTools(manifest: TreyTvMcpManifest): TreyTvMcpToolDescriptor[] {
  return manifest.tools
    .filter((tool) => isKnownTreyTvToolName(tool.name))
    .map((tool) => {
      assertSafeReadOnlyDescriptor(tool);
      return tool;
    });
}

