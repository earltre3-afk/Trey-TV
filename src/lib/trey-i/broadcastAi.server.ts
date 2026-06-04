import { createServerFn } from "@tanstack/react-start";
import { aiGenerateText } from "./aiProvider.server";
import {
  buildRundownPrompt,
  buildScriptPrompt
} from "../../tradio/components/tradio/services/broadcastAiPrompts";
import {
  parseRundownJson,
  parseScriptJson,
  type ParsedRundownResponse,
  type ParsedScriptResponse
} from "../../tradio/components/tradio/services/broadcastAiParser";

/**
 * Server function to generate structural Rundowns.
 * Calls Gemini securely from the server side.
 */
export const generateShowRundownServer = createServerFn({ method: "POST" })
  .inputValidator((input: {
    showTitle: string;
    showDescription: string;
    showType: string;
    moodTags: string[];
    genreTags: string[];
    audienceTags: string[];
    episodeTitle: string;
    episodeDescription: string;
    durationMinutes: number;
    creatorRole: string;
    musicSourcePref: string;
    hasAds: boolean;
  }) => input)
  .handler(async ({ data }): Promise<ParsedRundownResponse> => {
    const prompt = buildRundownPrompt(data);
    try {
      const resultText = await aiGenerateText({
        prompt,
        systemInstruction: "You are the AI Program Director for Tradio. Return only strict, well-formed JSON.",
      });
      return parseRundownJson(resultText.text);
    } catch (e: any) {
      console.error("[broadcastAi.server] generateShowRundownServer error:", e);
      throw e;
    }
  });

/**
 * Server function to generate segment scripts (intros, talk-breaks, outros).
 */
export const generateHostScriptsServer = createServerFn({ method: "POST" })
  .inputValidator((input: {
    blockTitle: string;
    blockType: string;
    styleMode: string;
    promptNotes?: string;
    showContext?: string;
    styleModifier?: string;
  }) => input)
  .handler(async ({ data }): Promise<ParsedScriptResponse> => {
    const prompt = buildScriptPrompt(data);
    try {
      const resultText = await aiGenerateText({
        prompt,
        systemInstruction: "You are the AI Host scriptwriter for Tradio. Return only strict, well-formed JSON.",
      });
      return parseScriptJson(resultText.text);
    } catch (e: any) {
      console.error("[broadcastAi.server] generateHostScriptsServer error:", e);
      throw e;
    }
  });

/**
 * Server function to generate station drops.
 */
export const generateStationDropServer = createServerFn({ method: "POST" })
  .inputValidator((input: { dropText: string; hostTone: string }) => input)
  .handler(async ({ data }): Promise<string> => {
    try {
      const prompt = `Write a premium station drop for Tradio. Tone: ${data.hostTone}. Style guidelines: Incorporate "${data.dropText}". Return a short, punchy 1-2 sentence drop read. Do not return markdown, just raw text.`;
      const res = await aiGenerateText({ prompt });
      return res.text.trim();
    } catch (e: any) {
      console.error("[broadcastAi.server] generateStationDropServer error:", e);
      throw e;
    }
  });

/**
 * Server function to generate ad read scripts.
 */
export const generateAdReadServer = createServerFn({ method: "POST" })
  .inputValidator((input: { adProvider: string; durationSeconds: number; tone: string }) => input)
  .handler(async ({ data }): Promise<string> => {
    try {
      const prompt = `Write a conversational, high-end 30-second sponsor ad read script for ${data.adProvider}. Delivery tone: ${data.tone}. Limit to exactly 60-70 words suitable for a ${data.durationSeconds}s read. Do not return markdown, just raw text.`;
      const res = await aiGenerateText({ prompt });
      return res.text.trim();
    } catch (e: any) {
      console.error("[broadcastAi.server] generateAdReadServer error:", e);
      throw e;
    }
  });
