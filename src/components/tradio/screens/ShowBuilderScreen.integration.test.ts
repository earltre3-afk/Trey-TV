import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const builderSource = readFileSync(new URL("./ShowBuilderScreen.tsx", import.meta.url), "utf8");

test("the show builder uses server-side AI and exposes live readiness", () => {
  assert.match(builderSource, /generateRadioShow/);
  assert.match(builderSource, /checkTradioAiReadiness/);
  assert.match(builderSource, /await\s+generateRadioShow/);
  assert.match(builderSource, /AI SYSTEM/);
});

test("the show builder uses the focused Tradio AI server function instead of the monolithic Trey-I bundle", () => {
  assert.match(builderSource, /@\/lib\/trey-i\/tradioShowBuilder\.server/);
  assert.doesNotMatch(builderSource, /@\/lib\/trey-i\/vertex\.server/);
});

test("the show builder generation and save actions have real state", () => {
  assert.match(builderSource, /isGenerating/);
  assert.match(builderSource, /generationError/);
  assert.match(builderSource, /result\.id\s*!==\s*['"]ai-generated-show['"]/);
  assert.match(builderSource, /tradio\.show-builder\.drafts/);
  assert.match(builderSource, /setSaveState\(['"]saved['"]\)/);
});
