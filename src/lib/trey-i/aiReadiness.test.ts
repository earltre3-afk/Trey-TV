import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveAiConfiguration } from "./aiReadiness";

test("Vertex project configuration reports ADC mode without exposing identifiers", () => {
  const result = resolveAiConfiguration({
    AI_PROVIDER: "gemini",
    GOOGLE_CLOUD_PROJECT: "private-project-id",
    GOOGLE_CLOUD_LOCATION: "us-central1",
  });

  assert.equal(result.provider, "gemini");
  assert.equal(result.authMode, "vertex-adc");
  assert.equal(result.configured, true);
  assert.equal(result.projectConfigured, true);
  assert.equal(JSON.stringify(result).includes("private-project-id"), false);
});

test("service account JSON is identified as explicit Vertex credentials", () => {
  const result = resolveAiConfiguration({
    VERTEX_PROJECT: "project",
    GOOGLE_APPLICATION_CREDENTIALS_JSON: '{"client_email":"service@example.com"}',
  });

  assert.equal(result.authMode, "vertex-service-account");
  assert.equal(result.configured, true);
});

test("Gemini without ADC or API key reports an actionable unconfigured state", () => {
  const result = resolveAiConfiguration({});

  assert.equal(result.provider, "gemini");
  assert.equal(result.authMode, "missing");
  assert.equal(result.configured, false);
});
