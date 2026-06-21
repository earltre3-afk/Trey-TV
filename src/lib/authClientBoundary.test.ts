import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
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

test("no authentication call is made through the hybrid Neon proxy", () => {
  const hybridImport = /from ["']@\/lib\/supabase["']/;
  const hybridAuthCall = /\bsupabase\.auth\./;
  const violations: string[] = [];

  const visit = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(path);
        continue;
      }
      if (!/\.(ts|tsx)$/.test(entry.name) || entry.name.endsWith(".test.ts")) continue;

      const fileSource = readFileSync(path, "utf8");
      if (hybridImport.test(fileSource) && hybridAuthCall.test(fileSource)) {
        violations.push(path.slice(srcRoot.length + 1).replaceAll("\\", "/"));
      }
    }
  };

  visit(srcRoot);
  assert.deepEqual(
    violations,
    [],
    `auth must use the direct Supabase client, not the hybrid Neon proxy:\n${violations.join("\n")}`,
  );
});
