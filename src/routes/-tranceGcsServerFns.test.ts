import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const gcsSrc = readFileSync(resolve(__dirname, "../lib/trance/gcs.server.ts"), "utf8");
const uploadSrc = readFileSync(
  resolve(__dirname, "../trance/services/tranceVideoUploadService.ts"),
  "utf8",
);
const analyzerSrc = readFileSync(
  resolve(__dirname, "../trance/services/tranceVideoAnalyzerService.ts"),
  "utf8",
);

test("gcs.server exports gcsGetUploadUrl as a createServerFn", () => {
  assert.match(gcsSrc, /export const gcsGetUploadUrl/);
  assert.match(gcsSrc, /createServerFn/);
  assert.match(gcsSrc, /action:\s*['"]write['"]/);
  assert.match(gcsSrc, /trance-media/);
});

test("gcs.server exports gcsAnalyzeStart as a createServerFn", () => {
  assert.match(gcsSrc, /export const gcsAnalyzeStart/);
  assert.match(gcsSrc, /CLOUD_RUN_ANALYZE_URL/);
  assert.match(gcsSrc, /status.*pending/);
});

test("gcs.server exports gcsAnalyzeStatus as a createServerFn", () => {
  assert.match(gcsSrc, /export const gcsAnalyzeStatus/);
  assert.match(gcsSrc, /results\/\$\{data\.jobId\}\.json/);
  assert.match(gcsSrc, /status.*pending/);
});

test("gcs.server uses lazy imports so module loads without credentials", () => {
  assert.match(gcsSrc, /await import\(['"]@google-cloud\/storage['"]\)/);
  assert.match(gcsSrc, /await import\(['"]google-auth-library['"]\)/);
  assert.doesNotMatch(gcsSrc, /^import.*@google-cloud\/storage/m);
  assert.doesNotMatch(gcsSrc, /^import.*google-auth-library/m);
});

test("tranceVideoUploadService uses GCS not Supabase storage", () => {
  assert.match(uploadSrc, /gcsGetUploadUrl/);
  assert.match(uploadSrc, /uploadChoreographyVideo/);
  assert.doesNotMatch(uploadSrc, /trance-routine-videos/);
  assert.doesNotMatch(uploadSrc, /supabase\.storage/);
});

test("tranceVideoAnalyzerService polls Cloud Run not browser MediaPipe", () => {
  assert.match(analyzerSrc, /gcsAnalyzeStart/);
  assert.match(analyzerSrc, /gcsAnalyzeStatus/);
  assert.doesNotMatch(analyzerSrc, /createPoseLandmarker/);
  assert.doesNotMatch(analyzerSrc, /document\.createElement\(['"]video['"]\)/);
});
