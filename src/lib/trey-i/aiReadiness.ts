export type AiAuthMode =
  | "vertex-adc"
  | "vertex-service-account"
  | "gemini-api-key"
  | "provider-api-key"
  | "mock"
  | "missing";

export interface AiConfiguration {
  provider: "gemini" | "openai" | "anthropic" | "mock";
  authMode: AiAuthMode;
  configured: boolean;
  projectConfigured: boolean;
  location: string | null;
  model: string;
}

type Environment = Record<string, string | undefined>;

export function resolveAiConfiguration(env: Environment): AiConfiguration {
  const requestedProvider = (env.AI_PROVIDER || "gemini").trim().toLowerCase();
  const provider =
    requestedProvider === "openai" ||
    requestedProvider === "anthropic" ||
    requestedProvider === "mock"
      ? requestedProvider
      : "gemini";

  if (provider === "mock") {
    return {
      provider,
      authMode: "mock",
      configured: true,
      projectConfigured: false,
      location: null,
      model: "mock",
    };
  }

  if (provider === "openai" || provider === "anthropic") {
    const configured = Boolean(
      provider === "openai" ? env.OPENAI_API_KEY?.trim() : env.ANTHROPIC_API_KEY?.trim(),
    );
    return {
      provider,
      authMode: configured ? "provider-api-key" : "missing",
      configured,
      projectConfigured: false,
      location: null,
      model:
        provider === "openai"
          ? env.OPENAI_MODEL || "gpt-4o-mini"
          : env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
    };
  }

  const projectConfigured = Boolean(
    env.VERTEX_PROJECT?.trim() || env.GOOGLE_CLOUD_PROJECT?.trim(),
  );
  const hasServiceAccountJson = Boolean(env.GOOGLE_APPLICATION_CREDENTIALS_JSON?.trim());
  const hasApiKey = Boolean(
    env.GOOGLE_GENAI_API_KEY?.trim() ||
    env.GEMINI_API_KEY?.trim() ||
    env.GOOGLE_API_KEY?.trim(),
  );
  const authMode: AiAuthMode = projectConfigured
    ? hasServiceAccountJson
      ? "vertex-service-account"
      : "vertex-adc"
    : hasApiKey
      ? "gemini-api-key"
      : "missing";

  return {
    provider,
    authMode,
    configured: authMode !== "missing",
    projectConfigured,
    location:
      env.VERTEX_LOCATION?.trim() ||
      env.GOOGLE_CLOUD_LOCATION?.trim() ||
      (projectConfigured ? "us-central1" : null),
    model: "gemini-2.5-flash",
  };
}
