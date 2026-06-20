import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const practiceRoute = readFileSync(
  resolve(__dirname, "trance.session.$routineId.practice.tsx"),
  "utf8",
);

const calibrationGate = readFileSync(
  resolve(__dirname, "../trance/calibration/CalibrationGate.tsx"),
  "utf8",
);

test("practice route wraps LearnModeScreen in CalibrationGate", () => {
  assert.match(practiceRoute, /import\s+\{\s*CalibrationGate\s*\}\s+from/);
  assert.match(practiceRoute, /import\s+LearnModeScreen\s+from/);
  assert.match(practiceRoute, /<CalibrationGate>/);
  assert.match(practiceRoute, /<LearnModeScreen\s*\/>/);
  assert.doesNotMatch(practiceRoute, /component:\s*LearnModeScreen/);
});

test("CalibrationGate renders QRMobileHandoffGate for non-mobile", () => {
  assert.match(calibrationGate, /import\s+\{\s*QRMobileHandoffGate\s*\}/);
  assert.match(calibrationGate, /!isMobile/);
  assert.match(calibrationGate, /<QRMobileHandoffGate\s+routineId=\{routineId\}\s*\/>/);
});

test("CalibrationGate checks isAuthed not identity.authUserId", () => {
  assert.match(calibrationGate, /isAuthed/);
  assert.doesNotMatch(calibrationGate, /authUserId/);
});

test("CalibrationGate redirects to /login on unauthenticated mobile", () => {
  assert.match(calibrationGate, /\/login\?redirect=/);
  assert.match(calibrationGate, /encodeURIComponent/);
});

test("CalibrationGate checks handoff token expiry", () => {
  assert.match(calibrationGate, /decodeHandoffToken/);
  assert.match(calibrationGate, /isHandoffTokenExpired/);
  assert.match(calibrationGate, /tokenExpired/);
});
