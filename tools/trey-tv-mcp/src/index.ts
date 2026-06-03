#!/usr/bin/env node
import { TreyTvPluginBridgeClient } from "./client.js";
import { readConfig } from "./config.js";

type Command = "manifest" | "list-tools" | "call-tool";

async function main(argv: string[]): Promise<void> {
  const command = argv[2] as Command | undefined;
  const client = new TreyTvPluginBridgeClient(readConfig());

  if (command === "manifest") {
    printJson(await client.fetchManifest());
    return;
  }

  if (command === "list-tools") {
    printJson(await client.listTools());
    return;
  }

  if (command === "call-tool") {
    const toolName = argv[3];
    if (!toolName) {
      throw new Error("Usage: call-tool <tool-name>");
    }
    printJson(await client.callTool(toolName));
    return;
  }

  printJson({
    name: "Trey TV Local MCP Wrapper Foundation",
    readOnly: true,
    commands: ["manifest", "list-tools", "call-tool <tool-name>"],
  });
}

function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

main(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${JSON.stringify({ error: message }, null, 2)}\n`);
  process.exitCode = 1;
});
