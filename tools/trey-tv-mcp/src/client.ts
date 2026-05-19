import type { TreyTvMcpConfig } from "./config.js";
import { findManifestTool, listSafeManifestTools, type TreyTvMcpManifest, type TreyTvMcpToolDescriptor } from "./tools.js";

const MANIFEST_ENDPOINT = "/api/plugins/mcp-manifest";

export class TreyTvPluginBridgeClient {
  constructor(private readonly config: TreyTvMcpConfig) {}

  async fetchManifest(): Promise<TreyTvMcpManifest> {
    const manifest = await this.getJson(MANIFEST_ENDPOINT);
    if (!isManifest(manifest)) {
      throw new Error("Trey TV Plugin Bridge manifest response was not valid.");
    }
    return manifest;
  }

  async listTools(): Promise<TreyTvMcpToolDescriptor[]> {
    const manifest = await this.fetchManifest();
    return listSafeManifestTools(manifest);
  }

  async callTool(name: string): Promise<unknown> {
    const manifest = await this.fetchManifest();
    const tool = findManifestTool(manifest, name);
    return this.getJson(tool.endpoint);
  }

  private async getJson(endpoint: string): Promise<unknown> {
    const url = new URL(endpoint, `${this.config.baseUrl}/`);
    const headers: Record<string, string> = {
      accept: "application/json",
    };

    if (this.config.adminBearerToken) {
      headers.authorization = `Bearer ${this.config.adminBearerToken}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    const text = await response.text();
    let body: unknown = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = { error: "Trey TV Plugin Bridge returned non-JSON content." };
      }
    }

    if (!response.ok) {
      throw new Error(`Trey TV Plugin Bridge request failed with HTTP ${response.status}: ${safeErrorSummary(body)}`);
    }

    return body;
  }
}

function isManifest(value: unknown): value is TreyTvMcpManifest {
  return Boolean(
    value &&
      typeof value === "object" &&
      "mcpReady" in value &&
      "execution" in value &&
      "tools" in value &&
      Array.isArray((value as { tools: unknown }).tools),
  );
}

function safeErrorSummary(body: unknown): string {
  if (body && typeof body === "object" && "error" in body) {
    return String((body as { error: unknown }).error).slice(0, 240);
  }
  return "request denied or unavailable";
}

