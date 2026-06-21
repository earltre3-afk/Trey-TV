import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const srcRoot = join(import.meta.dirname, "..");

function source(path: string) {
  return readFileSync(join(srcRoot, path), "utf8");
}

test("account bootstrap uses the RLS-aware Supabase browser client", () => {
  const browserClient = source("lib/supabase-browser.ts");

  assert.match(browserClient, /from ["']@\/integrations\/supabase\/client["']/);
  assert.doesNotMatch(browserClient, /from ["']@\/lib\/supabase["']/);
});

test("authentication routes do not send account queries through the Neon proxy", () => {
  for (const route of [
    "routes/login.tsx",
    "routes/signup.tsx",
    "routes/confirm-email.tsx",
  ]) {
    const routeSource = source(route);
    assert.match(
      routeSource,
      /from ["']@\/integrations\/supabase\/client["']/,
      `${route} must use the direct Supabase auth/data client`,
    );
    assert.doesNotMatch(
      routeSource,
      /from ["']@\/lib\/supabase["']/,
      `${route} must not use the Neon database proxy`,
    );
  }
});
