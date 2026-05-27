---
name: antigravity-codex
description: Use when connecting Antigravity workflows to Codex, drafting Codex tasks from Antigravity context, or planning MCP/app surfaces that let Codex inspect and modify an Antigravity workspace.
license: MIT
---

# Antigravity Codex

Use this skill when a user wants Codex to participate in an Antigravity workflow.

## Workflow

1. Identify the Antigravity context the user wants Codex to use:
   - current workspace or project
   - selected files or diagnostics
   - task description, issue, or agent handoff
   - desired output from Codex
2. Convert that context into a small Codex task:
   - state the goal
   - include relevant file paths and constraints
   - name any commands or checks Codex should run
   - define the expected final artifact
3. Prefer Codex for repository-aware work:
   - code edits
   - test fixes
   - refactors
   - local verification
   - documentation updates
4. Keep Antigravity-specific integration details isolated in plugin scripts, MCP tools, or app manifests as those surfaces are added.

## Integration Notes

- Use `scripts/` for bridge helpers that transform Antigravity context into Codex prompts or task payloads.
- Use `.mcp.json` when the plugin exposes Antigravity data through an MCP server.
- Use `.app.json` when the plugin gains an app connector surface.
- Do not assume Antigravity APIs are available until the integration files explicitly configure them.

## Starter Prompt Shape

```text
Goal: <what Codex should accomplish>
Antigravity context: <workspace, selected files, diagnostics, or task notes>
Constraints: <style, tests, commands, no-touch areas>
Expected output: <patch, explanation, verification summary, or handoff>
```
