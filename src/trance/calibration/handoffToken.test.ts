import assert from "node:assert/strict";
import { test } from "node:test";
import { encodeHandoffToken, decodeHandoffToken, isHandoffTokenExpired } from "./handoffToken";

test("encodeHandoffToken produces a non-empty URL-safe string", () => {
  const token = encodeHandoffToken("rt001");
  assert.ok(token.length > 0);
  assert.doesNotMatch(token, /[+/=]/);
});

test("decodeHandoffToken round-trips correctly", () => {
  const encoded = encodeHandoffToken("rt001");
  const decoded = decodeHandoffToken(encoded);
  assert.ok(decoded !== null);
  assert.equal(decoded!.routineId, "rt001");
  assert.equal(decoded!.mode, "practice");
  assert.ok(decoded!.exp > Date.now());
});

test("decodeHandoffToken returns null for garbage input", () => {
  assert.equal(decodeHandoffToken("not-valid-base64!!!"), null);
});

test("isHandoffTokenExpired returns false for fresh token", () => {
  const encoded = encodeHandoffToken("rt001");
  const decoded = decodeHandoffToken(encoded)!;
  assert.equal(isHandoffTokenExpired(decoded), false);
});

test("isHandoffTokenExpired returns true for expired token", () => {
  const expired = { routineId: "rt001", mode: "practice" as const, exp: Date.now() - 1000 };
  assert.equal(isHandoffTokenExpired(expired), true);
});

test("token expiry is approximately 15 minutes from now", () => {
  const before = Date.now();
  const encoded = encodeHandoffToken("rt001");
  const decoded = decodeHandoffToken(encoded)!;
  const fifteenMin = 15 * 60 * 1000;
  assert.ok(decoded.exp >= before + fifteenMin - 100);
  assert.ok(decoded.exp <= before + fifteenMin + 100);
});
