#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { TreyTvPluginBridgeClient } from "./client.js";
import { readConfig } from "./config.js";
import { TREY_TV_MCP_TOOL_NAMES, type TreyTvMcpToolName } from "./tools.js";

const TOOL_DESCRIPTIONS: Record<TreyTvMcpToolName, string> = {
  get_trey_tv_status:
    "Read Trey TV app health, safe environment-name presence, expected domains, and diagnostic warnings.",
  get_trey_tv_features: "Read the safe Trey TV feature registry and protected-feature notes.",
  get_trey_tv_games: "Read the safe Trey TV games capability registry.",
  get_fwd_integration_status: "Read safe FWD integration status for fwd.treytv.com surfaces.",
  get_protected_flows: "Read protected Trey TV flow rules and file patterns without reading private onboarding data.",
};

export function createTreyTvMcpServer(): McpServer {
  const client = new TreyTvPluginBridgeClient(readConfig());
  const server = new McpServer({
    name: "trey-tv-local-plugin-bridge",
    version: "0.1.0",
  });

  for (const toolName of TREY_TV_MCP_TOOL_NAMES) {
    server.registerTool(
      toolName,
      {
        title: toolName,
        description: TOOL_DESCRIPTIONS[toolName],
        annotations: {
          title: toolName,
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      async () => {
        const result = await client.callTool(toolName);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      },
    );
  }

  return server;
}

async function main(): Promise<void> {
  const server = createTreyTvMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Trey TV MCP server failed: ${message}\n`);
  process.exitCode = 1;
});

