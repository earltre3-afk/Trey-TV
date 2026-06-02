import test from "node:test";
import assert from "node:assert/strict";
import {
  validateMediaFile,
  validateCaption,
  MAX_CAPTION,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from "./mediaValidation";

test("accepts an image under the size cap", () => {
  const r = validateMediaFile({ type: "image/png", size: 1000 });
  assert.deepEqual(r, { ok: true, kind: "image" });
});
test("accepts a video under the size cap", () => {
  const r = validateMediaFile({ type: "video/mp4", size: 1000 });
  assert.deepEqual(r, { ok: true, kind: "video" });
});
test("rejects a non image/video type", () => {
  assert.equal(validateMediaFile({ type: "application/pdf", size: 10 }).ok, false);
});
test("rejects an oversized image", () => {
  assert.equal(validateMediaFile({ type: "image/jpeg", size: MAX_IMAGE_BYTES + 1 }).ok, false);
});
test("rejects an oversized video", () => {
  assert.equal(validateMediaFile({ type: "video/mp4", size: MAX_VIDEO_BYTES + 1 }).ok, false);
});
test("caption: empty is allowed", () => {
  assert.deepEqual(validateCaption("   "), { ok: true });
});
test("caption: over max is rejected", () => {
  assert.equal(validateCaption("x".repeat(MAX_CAPTION + 1)).ok, false);
});
