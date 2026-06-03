# Trey TV Local MCP Wrapper Foundation

This package is a local-only MCP stdio wrapper for connecting Codex Desktop to the existing Trey TV Plugin Bridge.

It does not start a production-facing MCP server. It runs on stdio for a local MCP client and reads the Plugin Bridge manifest at:

`http://127.0.0.1:3000/api/plugins/mcp-manifest`

The Trey TV app must be running locally first:

```bash
pnpm dev -- --host 127.0.0.1 --port 3000
```

## Tools

The wrapper exposes only read-only tool names from the Plugin Bridge manifest:

- `get_trey_tv_status` -> `GET /api/plugins/status`
- `get_trey_tv_features` -> `GET /api/plugins/features`
- `get_trey_tv_games` -> `GET /api/plugins/games`
- `get_fwd_integration_status` -> `GET /api/plugins/fwd`
- `get_protected_flows` -> `GET /api/plugins/protected-flows`

Every call is validated against the manifest before execution. Unknown tools, non-GET tools, non-read-only descriptors, and sensitive-data descriptors are refused.

## Safety

This wrapper does not write to the database, does not call Supabase directly, does not expose secrets, does not expose OAuth tokens, does not expose private messages, and does not expose private user data.

Local use defaults to `TREY_TV_PLUGIN_BASE_URL=http://127.0.0.1:3000`.

Non-local use requires `TREY_TV_PLUGIN_ADMIN_BEARER_TOKEN` so the existing Plugin Bridge admin gate can verify the request. The token is never printed by this wrapper.

`codex_internal` remains disabled. Do not add header bypasses, fake internal token systems, write tools, or production-facing MCP server behavior here.

## Commands

Build and typecheck the wrapper:

```bash
pnpm --dir tools/trey-tv-mcp typecheck
pnpm --dir tools/trey-tv-mcp build
```

Run the local MCP stdio server:

```bash
pnpm --dir tools/trey-tv-mcp start
```

The CLI foundation can also list manifest tools or call one read-only tool:

```bash
node tools/trey-tv-mcp/dist/index.js list-tools
node tools/trey-tv-mcp/dist/index.js call-tool get_trey_tv_status
```

## Codex Desktop

Point Codex Desktop at the built local stdio server. Use local paths and placeholder-only environment values:

```json
{
  "mcpServers": {
    "trey-tv": {
      "command": "node",
      "args": ["C:/Users/info/TREY-TV-ANTIGRAVITY/tools/trey-tv-mcp/dist/server.js"],
      "env": {
        "TREY_TV_PLUGIN_BASE_URL": "http://127.0.0.1:3000"
      }
    }
  }
}
```

For non-local/admin use, add `TREY_TV_PLUGIN_ADMIN_BEARER_TOKEN` only in local Codex Desktop environment configuration. Do not commit real tokens, paste them into docs, or print them in logs.

Write tools are intentionally forbidden. Additions that mutate Trey TV data require a separate security review.
