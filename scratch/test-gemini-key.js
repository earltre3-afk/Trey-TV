import { GoogleGenAI } from "@google/genai";

const apiKey = "AIzaSyATfDYQSNXwufcn1s7WVMKW13awzfFxeb0";
const ai = new GoogleGenAI({ apiKey });

async function run() {
  try {
    console.log("Calling generateContent with Gemini API Key...");
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Say hello! Respond in 3 words.",
    });
    console.log("Success! Response text:", response.text);
  } catch (err) {
    console.error("Failed Gemini API Call:", err);
  }
}

run();
