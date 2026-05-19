import { getTreyTvMcpTool } from "./manifest";
import type { TreyTvMcpEndpoint } from "./types";

export function resolveTreyTvMcpEndpoint(name: string): TreyTvMcpEndpoint | undefined {
  return getTreyTvMcpTool(name)?.endpoint;
}

export function validateReadOnlyTool(name: string): boolean {
  const tool = getTreyTvMcpTool(name);
  return Boolean(tool && tool.method === "GET" && tool.readOnly === true && tool.sensitiveData === false);
}

