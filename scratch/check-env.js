import fs from "fs";

// Load production environment variables manually
const envPath = "c:\\Users\\info\\TREY-TV-ANTIGRAVITY\\.env.prod.local";
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let val = match[2] || "";
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      }
      process.env[key] = val;
    }
  });
}

console.log("Environment check:");
console.log("- GOOGLE_CLOUD_PROJECT:", process.env.GOOGLE_CLOUD_PROJECT || "(not set)");
console.log("- GOOGLE_CLOUD_LOCATION:", process.env.GOOGLE_CLOUD_LOCATION || "(not set)");
console.log("- VERTEX_PROJECT:", process.env.VERTEX_PROJECT || "(not set)");
console.log("- VERTEX_LOCATION:", process.env.VERTEX_LOCATION || "(not set)");
console.log("- GEMINI_API_KEY length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
console.log("- GOOGLE_GENAI_API_KEY length:", process.env.GOOGLE_GENAI_API_KEY ? process.env.GOOGLE_GENAI_API_KEY.length : 0);

const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
if (credsJson) {
  try {
    const parsed = JSON.parse(credsJson);
    console.log("- GOOGLE_APPLICATION_CREDENTIALS_JSON is valid JSON");
    console.log("  - type:", parsed.type);
    console.log("  - project_id:", parsed.project_id);
    console.log("  - client_email:", parsed.client_email);
  } catch (err) {
    console.log("- GOOGLE_APPLICATION_CREDENTIALS_JSON is set but NOT valid JSON:", err.message);
  }
} else {
  console.log("- GOOGLE_APPLICATION_CREDENTIALS_JSON: (not set)");
}
