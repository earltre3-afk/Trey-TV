import test from "node:test";
import assert from "node:assert/strict";
import {
  ADMIN_ROLES,
  ADMIN_PERMISSIONS,
  ROLE_PERMISSIONS,
  roleHasPermission,
} from "./permissions.ts";

test("owner has every permission", () => {
  for (const perm of ADMIN_PERMISSIONS) {
    assert.equal(roleHasPermission("owner", perm), true, `owner missing ${perm}`);
  }
});

test("moderator can ban but not grant gold", () => {
  assert.equal(roleHasPermission("moderator", "users.ban"), true);
  assert.equal(roleHasPermission("moderator", "users.gold"), false);
});

test("legal can act on legal but not change platform settings", () => {
  assert.equal(roleHasPermission("legal", "legal.act"), true);
  assert.equal(roleHasPermission("legal", "platform.settings"), false);
});

test("only owner can manage admins and platform settings", () => {
  for (const role of ADMIN_ROLES) {
    const expected = role === "owner";
    assert.equal(roleHasPermission(role, "admin.manage"), expected);
    assert.equal(roleHasPermission(role, "platform.settings"), expected);
  }
});

test("extra per-row grants widen a role", () => {
  assert.equal(roleHasPermission("moderator", "users.gold", ["users.gold"]), true);
});

test("ROLE_PERMISSIONS only references declared permission keys", () => {
  for (const perms of Object.values(ROLE_PERMISSIONS)) {
    for (const p of perms) assert.ok(ADMIN_PERMISSIONS.includes(p), `unknown ${p}`);
  }
});
