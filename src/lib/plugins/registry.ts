import { getPluginHealthStatus } from "./health";
import {
  createPluginMetadata,
  isPluginReadOnlyMethod,
  methodNotAllowed,
  pluginAccessDenied,
  pluginJson,
  pluginNoContent,
  resolvePluginAccess,
  type PluginAccessDecision,
} from "./permissions";
import { getFwdPluginStatus, getProtectedFlowStatus, pluginFeatures, pluginGames } from "./featureRegistry";
import { listTreyTvMcpTools } from "./mcp/manifest";
import type { PluginRegistryPayload } from "./types";

type PluginRoute =
  | "/api/plugins/status"
  | "/api/plugins/features"
  | "/api/plugins/games"
  | "/api/plugins/fwd"
  | "/api/plugins/protected-flows"
  | "/api/plugins/mcp-manifest";

const pluginRoutes = new Set<string>([
  "/api/plugins/status",
  "/api/plugins/features",
  "/api/plugins/games",
  "/api/plugins/fwd",
  "/api/plugins/protected-flows",
  "/api/plugins/mcp-manifest",
]);

function payloadForRoute(request: Request, pathname: PluginRoute, access: PluginAccessDecision): PluginRegistryPayload {
  const metadata = createPluginMetadata(request, access);
  switch (pathname) {
    case "/api/plugins/status": {
      const status = getPluginHealthStatus();
      return {
        ...status,
        ...metadata,
        warnings: [...metadata.warnings, ...status.warnings],
      };
    }
    case "/api/plugins/features":
      return { ...metadata, features: pluginFeatures };
    case "/api/plugins/games":
      return { ...metadata, games: pluginGames };
    case "/api/plugins/fwd": {
      const fwd = getFwdPluginStatus();
      return {
        ...fwd,
        ...metadata,
        warnings: metadata.warnings,
      };
    }
    case "/api/plugins/protected-flows": {
      const protectedFlows = getProtectedFlowStatus();
      return {
        ...protectedFlows,
        ...metadata,
        warnings: [...metadata.warnings, ...protectedFlows.warnings],
      };
    }
    case "/api/plugins/mcp-manifest":
      return {
        ...metadata,
        manifestName: "Trey TV Plugin Bridge MCP Readiness",
        mcpReady: true,
        execution: "descriptor_only",
        tools: listTreyTvMcpTools().map((tool) => ({
          ...tool,
          requiresAdmin: access.accessMode !== "local_dev",
        })),
      };
  }
}

export async function handlePluginApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (!pluginRoutes.has(url.pathname)) return null;

  if (!isPluginReadOnlyMethod(request.method)) {
    return methodNotAllowed(request);
  }

  if (request.method.toUpperCase() === "OPTIONS") {
    return pluginNoContent();
  }

  const access = await resolvePluginAccess(request);
  if (!access.allowed) return pluginAccessDenied(request, access);

  return pluginJson(payloadForRoute(request, url.pathname as PluginRoute, access));
}
