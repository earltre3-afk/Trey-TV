import fs from "fs";

// 1. Edit import-screenshot.server.ts
const path1 = "src/lib/trey-i/import-screenshot.server.ts";
let content1 = fs.readFileSync(path1, "utf8");

const target1 = `function buildGeminiClient(): { genai: GoogleGenAI; model: string } {
  const apiKey =
    process.env.GOOGLE_GENAI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim();

  if (apiKey) {
    return { genai: new GoogleGenAI({ apiKey }), model: "gemini-2.0-flash" };
  }

  const project =
    process.env.VERTEX_PROJECT?.trim() || process.env.GOOGLE_CLOUD_PROJECT?.trim();
  const location =
    process.env.VERTEX_LOCATION?.trim() ||
    process.env.GOOGLE_CLOUD_LOCATION?.trim() ||
    "us-central1";

  if (project) {
    const googleAuthOptions = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
      ? { credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) }
      : undefined;

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      genai: new GoogleGenAI({
        vertexai: true,
        project,
        location,
        googleAuthOptions,
      } as any),
      model: "gemini-2.5-flash",
    };
  }

  return { genai: null as unknown as GoogleGenAI, model: "" };
}`;

const replacement1 = `function buildGeminiClient(): { genai: GoogleGenAI; model: string } {
  const apiKey =
    process.env.GOOGLE_GENAI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim();

  const project =
    process.env.VERTEX_PROJECT?.trim() || process.env.GOOGLE_CLOUD_PROJECT?.trim();
  const location =
    process.env.VERTEX_LOCATION?.trim() ||
    process.env.GOOGLE_CLOUD_LOCATION?.trim() ||
    "us-central1";

  let hasServiceAccount = false;
  let googleAuthOptions: any = undefined;

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    try {
      const creds = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      googleAuthOptions = { credentials: creds };
      if (creds.type === "service_account") {
        hasServiceAccount = true;
      }
    } catch (e) {
      console.warn("Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON:", e);
    }
  }

  // Prioritize Vertex AI only if we have a project AND a proper Service Account key
  if (project && hasServiceAccount) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      genai: new GoogleGenAI({
        vertexai: true,
        project,
        location,
        googleAuthOptions,
      } as any),
      model: "gemini-2.5-flash",
    };
  }

  // Fallback to Gemini Developer API Key if configured
  if (apiKey) {
    return { genai: new GoogleGenAI({ apiKey }), model: "gemini-2.0-flash" };
  }

  // If no API key, but we have a project and any credentials, try Vertex AI as a last resort
  if (project && googleAuthOptions) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      genai: new GoogleGenAI({
        vertexai: true,
        project,
        location,
        googleAuthOptions,
      } as any),
      model: "gemini-2.5-flash",
    };
  }

  return { genai: null as unknown as GoogleGenAI, model: "" };
}`;

if (content1.includes(target1)) {
  content1 = content1.replace(target1, replacement1);
  fs.writeFileSync(path1, content1, "utf8");
  console.log("Successfully updated import-screenshot.server.ts");
} else {
  console.log("Error: Target buildGeminiClient not found in import-screenshot.server.ts");
}

// 2. Edit moderation.server.ts
const path2 = "src/lib/watch-party/moderation.server.ts";
let content2 = fs.readFileSync(path2, "utf8");

const target2 = `function buildClient(): { genai: GoogleGenAI; model: string } | null {
  const apiKey =
    process.env.GOOGLE_GENAI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim();

  if (apiKey) {
    return { genai: new GoogleGenAI({ apiKey }), model: MODEL_GEMINI };
  }

  const project =
    process.env.VERTEX_PROJECT?.trim() ||
    process.env.GOOGLE_CLOUD_PROJECT?.trim();
  const location =
    process.env.VERTEX_LOCATION?.trim() ||
    process.env.GOOGLE_CLOUD_LOCATION?.trim() ||
    "us-central1";

  if (project) {
    const googleAuthOptions = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
      ? { credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) }
      : undefined;

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      genai: new GoogleGenAI({
        vertexai: true,
        project,
        location,
        googleAuthOptions,
      } as any),
      model: MODEL_VERTEX,
    };
  }

  return null;
}`;

const replacement2 = `function buildClient(): { genai: GoogleGenAI; model: string } | null {
  const apiKey =
    process.env.GOOGLE_GENAI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim();

  const project =
    process.env.VERTEX_PROJECT?.trim() ||
    process.env.GOOGLE_CLOUD_PROJECT?.trim();
  const location =
    process.env.VERTEX_LOCATION?.trim() ||
    process.env.GOOGLE_CLOUD_LOCATION?.trim() ||
    "us-central1";

  let hasServiceAccount = false;
  let googleAuthOptions: any = undefined;

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    try {
      const creds = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      googleAuthOptions = { credentials: creds };
      if (creds.type === "service_account") {
        hasServiceAccount = true;
      }
    } catch (e) {
      console.warn("Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON:", e);
    }
  }

  // Prioritize Vertex AI only if we have a project AND a proper Service Account key
  if (project && hasServiceAccount) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      genai: new GoogleGenAI({
        vertexai: true,
        project,
        location,
        googleAuthOptions,
      } as any),
      model: MODEL_VERTEX,
    };
  }

  // Fallback to Gemini Developer API Key if configured
  if (apiKey) {
    return { genai: new GoogleGenAI({ apiKey }), model: MODEL_GEMINI };
  }

  // If no API key, but we have a project and any credentials, try Vertex AI as a last resort
  if (project && googleAuthOptions) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      genai: new GoogleGenAI({
        vertexai: true,
        project,
        location,
        googleAuthOptions,
      } as any),
      model: MODEL_VERTEX,
    };
  }

  return null;
}`;

if (content2.includes(target2)) {
  content2 = content2.replace(target2, replacement2);
  fs.writeFileSync(path2, content2, "utf8");
  console.log("Successfully updated moderation.server.ts");
} else {
  console.log("Error: Target buildClient not found in moderation.server.ts");
}
