import { GoogleGenAI } from "@google/genai";

export type AIProviderName = "gemini" | "openai" | "anthropic" | "mock";

export function getAIProviderName(): AIProviderName {
  const provider = (process.env.AI_PROVIDER || "gemini").trim().toLowerCase();
  if (provider === "openai" || provider === "anthropic" || provider === "mock") {
    return provider;
  }
  return "gemini";
}

// ─── Gemini Client Builder ───────────────────────────────────────────────────

export function buildGeminiClient(): { genai: GoogleGenAI; model: string } {
  const project = process.env.VERTEX_PROJECT?.trim() || process.env.GOOGLE_CLOUD_PROJECT?.trim();
  const location =
    process.env.VERTEX_LOCATION?.trim() ||
    process.env.GOOGLE_CLOUD_LOCATION?.trim() ||
    "us-central1";

  let googleAuthOptions: any = undefined;

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    try {
      const creds = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      googleAuthOptions = { credentials: creds };
    } catch (e) {
      console.warn("Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON in AI Provider:", e);
    }
  }

  const apiKey =
    process.env.GOOGLE_GENAI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim();

  // If a Vertex AI project is configured, use Vertex AI with Application Default Credentials (ADC)
  if (project) {
    return {
      genai: new GoogleGenAI({
        vertexai: true,
        project,
        location,
        ...(googleAuthOptions ? { googleAuthOptions } : {}),
      } as any),
      model: "gemini-2.5-flash",
    };
  }

  // Fallback to Gemini Developer API Key if configured
  if (apiKey) {
    return { genai: new GoogleGenAI({ apiKey }), model: "gemini-2.5-flash" };
  }

  // Fallback if googleAuthOptions is set even if project isn't explicitly configured
  if (googleAuthOptions) {
    return {
      genai: new GoogleGenAI({
        vertexai: true,
        project: undefined,
        location,
        googleAuthOptions,
      } as any),
      model: "gemini-2.5-flash",
    };
  }

  throw new Error(
    "Gemini Configuration Error: Neither GEMINI_API_KEY nor a valid VERTEX_PROJECT (GOOGLE_CLOUD_PROJECT) is configured.",
  );
}

// ─── Helper: sanitize responses ──────────────────────────────────────────────

function sanitize(raw: string): string {
  return raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

// ─── Core Interface Options ──────────────────────────────────────────────────

export interface GenerateOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  /**
   * Optional JSON response schema (Gemini structured output). When provided,
   * the model is constrained to this shape — e.g. `enum` fields force the value
   * to be one of a fixed set. Only honored by the Gemini provider; other
   * providers rely on prompt instructions + caller-side validation.
   */
  responseSchema?: Record<string, unknown>;
}

export interface GenerateVisionOptions extends GenerateOptions {
  imageBase64: string;
  mimeType: string;
}

// ─── AI Providers Implementations ────────────────────────────────────────────

// 1. Text Generation

export async function aiGenerateText(options: GenerateOptions): Promise<{ text: string }> {
  const provider = getAIProviderName();
  const { prompt, systemInstruction, temperature = 0.8, maxTokens = 512 } = options;

  if (provider === "mock") {
    console.log("[AI Provider] Mock generation prompt:", prompt.slice(0, 100));
    return {
      text: `[Mock Response] Based on the system instruction: "${systemInstruction?.slice(0, 50)}...", this is a fallback placeholder.`,
    };
  }

  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey)
      throw new Error(
        "OpenAI Configuration Error: OPENAI_API_KEY environment variable is not set.",
      );
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "";
    return { text: sanitize(text) };
  }

  if (provider === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey)
      throw new Error(
        "Anthropic Configuration Error: ANTHROPIC_API_KEY environment variable is not set.",
      );
    const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        system: systemInstruction,
        messages: [{ role: "user", content: prompt }],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const text = data?.content?.[0]?.text || "";
    return { text: sanitize(text) };
  }

  // Default: gemini
  const { genai, model } = buildGeminiClient();
  const result = await genai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction,
      temperature,
      maxOutputTokens: maxTokens,
    } as Record<string, unknown>,
  });

  const text =
    (result as unknown as { text?: string }).text ??
    (
      result as unknown as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      }
    ).candidates?.[0]?.content?.parts?.[0]?.text ??
    "";

  return { text: sanitize(text) };
}

// 2. JSON Generation

export async function aiGenerateJson<T>(options: GenerateOptions): Promise<T> {
  const provider = getAIProviderName();
  const { prompt, systemInstruction, temperature = 0.7, maxTokens = 512 } = options;

  if (provider === "mock") {
    console.log("[AI Provider] Mock JSON generation prompt:", prompt.slice(0, 100));
    // Try to return a valid JSON format if requested in prompt, or generic object
    if (prompt.includes("moderate")) {
      return { verdict: "clean", severity: "none", reason: "mock clear" } as unknown as T;
    }
    if (prompt.includes("Spades")) {
      if (prompt.includes("Bidding")) return { bid: 3 } as unknown as T;
      return { cardId: "AH" } as unknown as T;
    }
    if (prompt.includes("Bullshit")) {
      if (prompt.includes("challenge")) return { callBullshit: false } as unknown as T;
      return { cardIds: [], rank: "A" } as unknown as T;
    }
    if (prompt.includes("answers")) {
      return {
        primaryAbility: "Dreamer",
        secondaryAbility: "Charmer",
        signalStrength: "Strong",
        interpretation:
          "You navigate life through rich imagination and draw people to your energy.",
      } as unknown as T;
    }
    return {} as T;
  }

  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey)
      throw new Error(
        "OpenAI Configuration Error: OPENAI_API_KEY environment variable is not set.",
      );
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI JSON API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "";
    return JSON.parse(sanitize(text)) as T;
  }

  if (provider === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey)
      throw new Error(
        "Anthropic Configuration Error: ANTHROPIC_API_KEY environment variable is not set.",
      );
    const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";

    // Anthropic does not support json response format natively in all versions,
    // but we prompt explicitly to return ONLY json in the prompt.
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        system:
          systemInstruction +
          "\nOutput strictly valid JSON only. Do not wrap in markdown or any other tags.",
        messages: [{ role: "user", content: prompt }],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic JSON API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const text = (data?.content?.[0]?.text || "").trim();
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    return JSON.parse(sanitize(cleaned)) as T;
  }

  // Default: gemini
  const { genai, model } = buildGeminiClient();
  const result = await genai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction,
      temperature,
      maxOutputTokens: maxTokens,
      responseMimeType: "application/json",
      ...(options.responseSchema ? { responseSchema: options.responseSchema } : {}),
    } as any,
  });

  const text =
    (result as any).text ?? (result as any).candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  return JSON.parse(sanitize(text)) as T;
}

// 3. Vision Generation (Image-to-JSON)

export async function aiGenerateVisionJson<T>(options: GenerateVisionOptions): Promise<T> {
  const provider = getAIProviderName();
  const {
    imageBase64,
    mimeType,
    prompt,
    systemInstruction,
    temperature = 0.2,
    maxTokens = 1024,
  } = options;

  if (provider === "mock") {
    console.log("[AI Provider] Mock Vision JSON generation");
    return {
      display_name: "Mock Profile",
      username: "mock_profile",
      bio: "Just a local mock user profile generated without API keys.",
      location: "Los Angeles, CA",
    } as unknown as T;
  }

  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey)
      throw new Error(
        "OpenAI Configuration Error: OPENAI_API_KEY environment variable is not set.",
      );
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({
      role: "user",
      content: [
        { type: "text", text: prompt },
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${imageBase64}`,
          },
        },
      ],
    });

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI Vision API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "";
    return JSON.parse(sanitize(text)) as T;
  }

  if (provider === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey)
      throw new Error(
        "Anthropic Configuration Error: ANTHROPIC_API_KEY environment variable is not set.",
      );
    const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        system:
          systemInstruction +
          "\nOutput strictly valid JSON only. Do not wrap in markdown or any other tags.",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType,
                  data: imageBase64,
                },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic Vision API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const text = (data?.content?.[0]?.text || "").trim();
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    return JSON.parse(sanitize(cleaned)) as T;
  }

  // Default: gemini
  const { genai, model } = buildGeminiClient();
  const result = await genai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [{ inlineData: { mimeType, data: imageBase64 } }, { text: prompt }],
      },
    ],
    config: {
      systemInstruction,
      temperature,
      maxOutputTokens: maxTokens,
      responseMimeType: "application/json",
    } as any,
  });

  const text =
    (result as any).text ?? (result as any).candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  return JSON.parse(sanitize(text)) as T;
}
