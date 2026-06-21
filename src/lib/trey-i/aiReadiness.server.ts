import { createServerFn } from "@tanstack/react-start";
import { aiGenerateText } from "./aiProvider.server";
import { resolveAiConfiguration, type AiConfiguration } from "./aiReadiness";

export interface TradioAiReadiness extends AiConfiguration {
  status: "ready" | "configured" | "unavailable";
  live: boolean;
  checkedAt: string;
  message: string;
}

function safeFailureMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (/401|unauthenticated|default credentials|credential/i.test(raw)) {
    return "ADC could not authenticate on this server. Configure a production service identity.";
  }
  if (/403|permission.denied|permission/i.test(raw)) {
    return "The configured identity does not have permission to call Vertex AI.";
  }
  if (/404|not found|model/i.test(raw)) {
    return "The configured project or model is not available in this Vertex AI location.";
  }
  return "The live AI probe failed. Review the server log and deployment environment.";
}

export const checkTradioAiReadiness = createServerFn({ method: "POST" })
  .inputValidator((input: { probe?: boolean }) => input)
  .handler(async ({ data }): Promise<TradioAiReadiness> => {
    const configuration = resolveAiConfiguration(process.env);
    const checkedAt = new Date().toISOString();

    if (!configuration.configured) {
      return {
        ...configuration,
        status: "unavailable",
        live: false,
        checkedAt,
        message: "No server-side AI credentials are configured.",
      };
    }

    if (!data.probe) {
      return {
        ...configuration,
        status: "configured",
        live: false,
        checkedAt,
        message: "Credentials are configured. Run the live check to verify model access.",
      };
    }

    try {
      const result = await aiGenerateText({
        prompt: "Reply with the single word READY.",
        systemInstruction: "You are a production health check. Return only READY.",
        temperature: 0,
        // Gemini 2.5 may spend a small part of the output budget on internal reasoning.
        maxTokens: 64,
      });
      const live = result.text.trim().length > 0;
      return {
        ...configuration,
        status: live ? "ready" : "unavailable",
        live,
        checkedAt,
        message: live
          ? "Live model response verified from the Tradio server."
          : "The provider returned an empty health-check response.",
      };
    } catch (error) {
      console.error("[Tradio AI readiness] live probe failed:", error);
      return {
        ...configuration,
        status: "unavailable",
        live: false,
        checkedAt,
        message: safeFailureMessage(error),
      };
    }
  });
