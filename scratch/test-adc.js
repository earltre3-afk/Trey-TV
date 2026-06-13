import { GoogleGenAI } from "@google/genai";

const project = process.env.VERTEX_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "project-b5c70f9e-62d4-4ba6-ad6";
console.log("Using Google Cloud Project:", project);

const ai = new GoogleGenAI({
  vertexai: true,
  project: project,
  location: "us-central1"
});

async function run() {
  try {
    console.log("Attempting Gemini model call via ADC...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Say hello! Respond in 3 words.",
    });
    console.log("SUCCESS! Response:", response.text);
  } catch (err) {
    console.error("ADC Authentication FAILED:", err);
  }
}

run();
