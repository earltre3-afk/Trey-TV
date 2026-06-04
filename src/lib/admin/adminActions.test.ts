import test from "node:test";
import assert from "node:assert/strict";
import { ADMIN_ACTIONS, requiredPermissionFor } from "./adminActions.ts";
import { ADMIN_PERMISSIONS } from "./permissions.ts";

test("every action maps to a declared permission and POST path", () => {
  for (const [name, spec] of Object.entries(ADMIN_ACTIONS)) {
    assert.ok(ADMIN_PERMISSIONS.includes(spec.requiredPermission), `${name} bad perm`);
    assert.ok(spec.path.startsWith("/api/admin/"), `${name} bad path`);
    assert.equal(spec.method, "POST");
  }
});

test("requiredPermissionFor resolves known actions and rejects unknown", () => {
  assert.equal(requiredPermissionFor("users.status"), "users.ban");
  assert.equal(requiredPermissionFor("users.gold"), "users.gold");
  assert.equal(requiredPermissionFor("users.creator"), "creators.approve");
  assert.equal(requiredPermissionFor("nope" as never), null);
});
