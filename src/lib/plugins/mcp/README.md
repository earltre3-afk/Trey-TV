# Trey TV MCP Adapter Foundation

This directory contains read-only MCP adapter metadata for trusted Trey TV admin, Codex, and future MCP tooling.

It does not start an MCP server. It only describes safe tool mappings to the existing Plugin Bridge GET endpoints:

- `get_trey_tv_status` -> `/api/plugins/status`
- `get_trey_tv_features` -> `/api/plugins/features`
- `get_trey_tv_games` -> `/api/plugins/games`
- `get_fwd_integration_status` -> `/api/plugins/fwd`
- `get_protected_flows` -> `/api/plugins/protected-flows`

Production access must continue to pass through the Plugin Bridge gate. Local development may use localhost access, while non-local use requires a verified admin bearer token through the existing server-side admin check.

`codex_internal` is intentionally not enabled. Do not add header bypasses, fake internal token systems, or write tools here.

No tools in this folder write data, run mutations, query private messages, expose private user data, expose environment values, expose Supabase service role values, or expose OAuth tokens.

Do not add write tools without a separate security review.
