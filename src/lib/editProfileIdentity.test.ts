import assert from "node:assert/strict";
import { test } from "node:test";

import {
  isProfileUpdateForUid,
  resolveEditProfilePersistenceIdentity,
  resolveEditProfileRouteAccess,
  shouldReinitializeEditProfileDraft,
} from "./editProfileIdentity.ts";

test("allows editing when the route UID belongs to the signed-in public profile", () => {
  assert.deepEqual(resolveEditProfileRouteAccess("4230000000000001", "4230000000000001"), {
    canonicalUid: "4230000000000001",
    requestedUid: "4230000000000001",
    status: "editable",
  });
});

test("redirects a bare edit profile route to the signed-in public profile UID", () => {
  assert.deepEqual(resolveEditProfileRouteAccess(undefined, "4230000000000001"), {
    canonicalUid: "4230000000000001",
    requestedUid: "",
    status: "redirect_to_owner",
  });
});

test("redirects another profile's edit route back to the signed-in public profile UID", () => {
  assert.deepEqual(resolveEditProfileRouteAccess("4230000000000999", "4230000000000001"), {
    canonicalUid: "4230000000000001",
    requestedUid: "4230000000000999",
    status: "redirect_to_owner",
  });
});

test("waits for the signed-in profile UID before deciding edit route ownership", () => {
  assert.deepEqual(resolveEditProfileRouteAccess("4230000000000001", ""), {
    canonicalUid: "",
    requestedUid: "4230000000000001",
    status: "pending",
  });
});

test("reinitializes the draft when Supabase hydrates a different signed-in profile UID", () => {
  assert.equal(shouldReinitializeEditProfileDraft("4230000000000001", "4230000000000002"), true);
  assert.equal(shouldReinitializeEditProfileDraft("4230000000000001", "4230000000000001"), false);
  assert.equal(shouldReinitializeEditProfileDraft("", "4230000000000001"), true);
});

test("uses the Supabase auth UUID for persistence and the public UID for profile routing", () => {
  assert.deepEqual(
    resolveEditProfilePersistenceIdentity({
      authUserId: "ca765d44-912d-4e5b-8b40-50330b78cbf7",
      publicProfileUid: "4230000000000001",
      routeUid: "4230000000000001",
    }),
    {
      authUserId: "ca765d44-912d-4e5b-8b40-50330b78cbf7",
      publicProfileUid: "4230000000000001",
      status: "ready",
    },
  );
});

test("does not allow profile persistence before both signed-in identities are ready", () => {
  assert.equal(
    resolveEditProfilePersistenceIdentity({
      authUserId: "",
      publicProfileUid: "4230000000000001",
      routeUid: "4230000000000001",
    }).status,
    "pending",
  );
});

test("refreshes only the public profile that was just saved", () => {
  assert.equal(isProfileUpdateForUid("4230000000000001", "4230000000000001"), true);
  assert.equal(isProfileUpdateForUid("4230000000000001", "4230000000000002"), false);
});
