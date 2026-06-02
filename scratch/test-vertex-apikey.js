import { GoogleGenAI } from "@google/genai";

const apiKey = "AIzaSyATfDYQSNXwufcn1s7WVMKW13awzfFxeb0";
const project = "337324215882";
const location = "us-central1";

const ai = new GoogleGenAI({
  apiKey,
  vertexai: true,
});
// Bypass constructor checks by mutating the clientOptions directly
ai.apiClient.clientOptions.project = project;
ai.apiClient.clientOptions.location = location;

async function run() {
  try {
    console.log("Calling generateContent with Vertex AI & API Key (mutated)...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Say hello! Respond in 3 words.",
    });
    console.log("Success! Response text:", response.text);
  } catch (err) {
    console.error("Failed Vertex AI Call:", err);
  }
}

run();
