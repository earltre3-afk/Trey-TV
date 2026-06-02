import test from "node:test";
import assert from "node:assert/strict";
import { resolveTradioShowPublish, tradioShowRoomName } from "./liveSessionPolicy.ts";

test("host of a live session can publish + subscribe", () => {
  const r = resolveTradioShowPublish({
    session: { host_user_id: "u1", status: "live" },
    userId: "u1",
  });
  assert.deepEqual(r, { allowed: true, canPublish: true, canSubscribe: true });
});
test("non-host listener can subscribe but not publish", () => {
  const r = resolveTradioShowPublish({
    session: { host_user_id: "u1", status: "live" },
    userId: "u2",
  });
  assert.deepEqual(r, { allowed: true, canPublish: false, canSubscribe: true });
});
test("ended session is not allowed", () => {
  const r = resolveTradioShowPublish({
    session: { host_user_id: "u1", status: "ended" },
    userId: "u1",
  });
  assert.equal(r.allowed, false);
});
test("missing session is not allowed", () => {
  const r = resolveTradioShowPublish({ session: null, userId: "u1" });
  assert.equal(r.allowed, false);
});
test("room name is keyed by session id", () => {
  assert.equal(tradioShowRoomName("abc"), "tradio-show:abc");
});
