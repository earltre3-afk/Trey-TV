import { createServerFn } from "@tanstack/react-start";
import {
  SHOW_SEGMENT_TYPES,
  generateShowPlan,
  validateGeneratedShow,
  type ShowBuilderFormState,
} from "../tradio-broadcast/showPlan";
import type { RadioShow } from "../tradio-broadcast/showTypes";
import { aiGenerateJson } from "./aiProvider.server";

export const generateRadioShow = createServerFn({ method: "POST" })
  .inputValidator((input: { form: ShowBuilderFormState }) => input)
  .handler(async ({ data }): Promise<RadioShow> => {
    const { form } = data;

    try {
      const prompt = `You are Trey-I, an expert radio producer for Trey TV's Tradio. Design a complete live radio show plan from this brief:
- Show name: ${form.showName || "(untitled)"}
- Target length: ${form.showLength} minutes
- Mood: ${form.showMood}
- Target audience: ${form.targetAudience}
- Host tone: ${form.hostTone}
- Music source: ${form.musicSource}
- Commercial breaks: ${form.commercialBreaks}
- Fan interaction style: ${form.fanInteractionStyle}
- Include producer beat spotlight: ${form.includeProducerBeatSpotlight}
- Include artist premiere: ${form.includeArtistPremiere}
- Include listener requests: ${form.includeListenerRequests}

Produce an ordered list of segments whose durations sum to roughly ${form.showLength} minutes. Each segment has:
- type: one of ${SHOW_SEGMENT_TYPES.join(", ")}
- title: short, vivid
- duration: seconds (integer)
- description: 1 sentence on what happens
- hostNotes: a short production cue
- script: for TALK segments (intro, host-talk, closing, producer-spotlight, artist-premiere) write the actual spoken host lines (2-4 sentences, in the "${form.hostTone}" tone, speaking to "${form.targetAudience}"). For music-block, commercial, poll, fan-request, leave script as an empty string.

Return ONLY JSON: { "title": string, "segments": [ { "type", "title", "duration", "description", "hostNotes", "script" } ] }`;

      const parsed = await aiGenerateJson<any>({
        prompt,
        temperature: 0.8,
        maxTokens: 8192,
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            segments: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  type: { type: "STRING", enum: SHOW_SEGMENT_TYPES },
                  title: { type: "STRING" },
                  duration: { type: "INTEGER" },
                  description: { type: "STRING" },
                  hostNotes: { type: "STRING" },
                  script: { type: "STRING" },
                },
                required: ["type", "title", "duration"],
                propertyOrdering: [
                  "type",
                  "title",
                  "duration",
                  "description",
                  "hostNotes",
                  "script",
                ],
              },
            },
          },
          required: ["title", "segments"],
          propertyOrdering: ["title", "segments"],
        },
      });

      return validateGeneratedShow(parsed, form);
    } catch (error) {
      console.error("[generateRadioShow] fallback to local generator:", error);
      return generateShowPlan(form);
    }
  });
