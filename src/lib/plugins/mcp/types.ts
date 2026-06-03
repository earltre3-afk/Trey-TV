import type { PluginMcpToolDescriptor } from "../types";

export type TreyTvMcpToolName =
  | "get_trey_tv_status"
  | "get_trey_tv_features"
  | "get_trey_tv_games"
  | "get_fwd_integration_status"
  | "get_protected_flows";

export type TreyTvMcpEndpoint =
  | "/api/plugins/status"
  | "/api/plugins/features"
  | "/api/plugins/games"
  | "/api/plugins/fwd"
  | "/api/plugins/protected-flows";

export type TreyTvMcpToolDescriptor = PluginMcpToolDescriptor & {
  name: TreyTvMcpToolName;
  endpoint: TreyTvMcpEndpoint;
  responseShape: string;
  safetyNotes: string[];
};
