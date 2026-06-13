import dotenv from "dotenv";
dotenv.config({ path: ".env.development" });

import { buildGeminiClient } from "../src/lib/trey-i/aiProvider.server.ts";

console.log("Loading .env.development...");
console.log("process.env.GOOGLE_CLOUD_PROJECT:", process.env.GOOGLE_CLOUD_PROJECT);

async function run() {
  try {
    const { genai, model } = buildGeminiClient();
    console.log("Gemini Client built successfully. Model:", model);
    console.log("Calling model generateContent...");
    const res = await genai.models.generateContent({
      model,
      contents: "Hello! Respond in 3 words.",
    });
    console.log("SUCCESS! Response text:", res.text);
  } catch (err) {
    console.error("Test Failed:", err);
  }
}

run();
