export type PluginStatus = "active" | "in_progress" | "protected" | "needs_polish" | "disabled";
export type PluginAccessMode = "local_dev" | "admin" | "codex_internal" | "public_denied";

export type PluginBridgeMetadata = {
  pluginBridgeVersion: "0.2.0";
  readOnly: true;
  generatedAt: string;
  accessMode: PluginAccessMode;
  endpoint: string;
  warnings: string[];
};

export type EnvPresence = {
  name: string;
  present: boolean;
  requiredFor: string;
};

export type PluginHealthStatus = {
  appName: "Trey TV";
  appStack: string[];
  environmentLabel: string;
  timestamp: string;
  requiredEnv: EnvPresence[];
  activeDomainsExpected: string[];
  buildSafe: {
    detected: boolean;
    mode: string;
    readOnly: true;
  };
  warnings: string[];
};

export type PluginFeatureResponse = PluginBridgeMetadata & {
  features: PluginFeature[];
};

export type PluginGamesResponse = PluginBridgeMetadata & {
  games: PluginGame[];
};

export type PluginFeature = {
  key: string;
  displayName: string;
  status: PluginStatus;
  protected: boolean;
  relatedFiles: string[];
  notes: string[];
};

export type PluginGame = {
  gameType: "truno" | "spades" | "blackjack" | "bullshit";
  displayName: string;
  quickPlaySupported: boolean;
  multiplayerSupported: boolean;
  minPlayers: number;
  maxPlayers: number;
  botFillSupported: boolean | "unknown";
  status: PluginStatus;
};

export type PluginFwdStatus = {
  expectedFwdDomain: "fwd.treytv.com";
  oauthRoutePresence: PluginPresence;
  pickerComponentPresence: PluginPresence;
  messageIntegrationStatus: PluginStatus;
  commentIntegrationStatus: PluginStatus;
  profileGifOfTheDayIntegrationStatus: PluginStatus;
  missingIntegrationWarnings: string[];
};

export type PluginPresence = {
  present: boolean;
  evidence: string[];
};

export type ProtectedFlowStatus = {
  treyIOnboardingProtectedFiles: string[];
  treyIOnboardingProtectedPatterns: string[];
  profileUidRoutingRules: string[];
  dateOfBirthRule: string;
  publicUidRule: string;
  warnings: string[];
};

export type PluginMcpToolDescriptor = {
  name: string;
  description: string;
  endpoint: string;
  method: "GET";
  readOnly: true;
  sensitiveData: false;
  requiresAdmin: boolean;
  responseShape?: string;
  safetyNotes?: string[];
};

export type PluginMcpManifest = PluginBridgeMetadata & {
  manifestName: "Trey TV Plugin Bridge MCP Readiness";
  mcpReady: true;
  execution: "descriptor_only";
  tools: PluginMcpToolDescriptor[];
};

export type PluginRegistryPayload =
  | (PluginBridgeMetadata & PluginHealthStatus)
  | PluginFeatureResponse
  | PluginGamesResponse
  | (PluginBridgeMetadata & PluginFwdStatus)
  | (PluginBridgeMetadata & ProtectedFlowStatus)
  | PluginMcpManifest;
