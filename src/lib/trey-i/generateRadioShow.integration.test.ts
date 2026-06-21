import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(new URL("./vertex.server.ts", import.meta.url), "utf8");
const start = source.indexOf("export const generateRadioShow");
const end = source.indexOf("// ------------------------------", start);
const generatorSource = source.slice(start, end);

test("the Gemini radio builder has enough output budget for a complete JSON rundown", () => {
  assert.match(generatorSource, /responseSchema/);
  assert.match(generatorSource, /maxTokens:\s*(?:8192|[1-9][0-9]{4,})/);
});
