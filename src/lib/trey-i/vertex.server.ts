import { createServerFn } from "@tanstack/react-start";
import { UserAnswer, Scenario, SignalResult, NaturalAbility, SignalStrength } from "../../types/naturalAbility";
import { calculateResult } from "../tests/naturalAbilityScoring";
import { SpadesState, botBid as fallbackSpadesBid, botPlay as fallbackSpadesPlay } from "../../features/games/lib/spades/spadesEngine";
import { BSState, botClaim as fallbackBSClaim, botShouldCall as fallbackBSShouldCall } from "../../features/games/lib/bullshit/bullshitEngine";
import { Branch, Choice, AIResult, Tone } from "../../features/interactive-stories/lib/storyTypes";
import { PrescriptionAnswers, CONTENT_LIBRARY, scoreContent, generatePrescriptionTitle } from "../../features/prescribe-me/components/data";
import { getSignalBlend } from "../tests/naturalAbilityResults";
import { aiGenerateText, aiGenerateJson } from "./aiProvider.server";

export type VertexTask =
  | "widget_chat"
  | "caption"
  | "title"
  | "description"
  | "hashtags"
  | "hook"
  | "promo_caption"
  | "bio"
  | "prescribe_reasoning"
  | "mood_suggestions"
  | "admin_summary"
  | "moderate_chat"
  | "signal_interpretation";

type VertexInput = {
  task: VertexTask;
  prompt: string;
  context?: string;
};

export type VertexResult = { text: string } | { error: string };

const VALID_TASKS: VertexTask[] = [
  "widget_chat", "caption", "title", "description", "hashtags",
  "hook", "promo_caption", "bio", "prescribe_reasoning",
  "mood_suggestions", "admin_summary", "moderate_chat", "signal_interpretation",
];

const SYSTEM_PROMPTS: Record<VertexTask, string> = {
  widget_chat:
    "You are Trey-I, a creative co-pilot for Trey TV creators and viewers. " +
    "Help with captions, post ideas, content strategy, mood drops, creative direction, and bio writing. " +
    "Keep responses concise (2-4 sentences), conversational, and on-brand. Never refuse creative requests. " +
    "If asked to generate a bio, do so directly without asking follow-up questions.",

  signal_interpretation:
    "You are Trey-I, reading a member's Natural Ability 'Signal' test result. " +
    "Using their primary ability, secondary ability, and signal strength, write ONE vivid, personal, " +
    "affirming Signal Reading of 3-4 sentences that synthesizes them into a single cohesive insight " +
    "(do not just list the traits). Speak directly to them as 'you'. Be specific and on-brand for " +
    "Trey TV: mystical but grounded, never generic or clinical. End with one short empowering line. " +
    "Plain text only — no headers, markdown, or quotes.",

  caption:
    "You are a social media copywriter for Trey TV, a premium creator platform. " +
    "Generate a single punchy caption (2-3 sentences). Use the creator's context. " +
    "No hashtags in the body. Authentic, not corporate.",

  title:
    "You are a content strategist for Trey TV. Suggest 3 compelling episode titles. " +
    "Each 4-8 words, attention-grabbing, and searchable. Return as a numbered list.",

  description:
    "You are a content writer for Trey TV. Write a short engaging episode description (3-4 sentences). " +
    "Include a hook, what viewers experience, and a soft call-to-action. No hashtags.",

  hashtags:
    "You are a social media strategist for Trey TV. Generate 8-12 relevant hashtags. " +
    "Mix broad reach tags with niche/creator tags. Return as space-separated hashtags starting with #.",

  hook:
    "You are a content editor for Trey TV. Rewrite or improve the opening hook (first 10 seconds). " +
    "Immediately grab attention, tease the payoff, create curiosity. Return 2-3 sentence hook script.",

  promo_caption:
    "You are a marketing copywriter for Trey TV. Write a promotional caption with a strong hook, " +
    "why it's unmissable, and a CTA ('Watch now', 'Drop tonight', etc). Max 3 sentences.",

  bio:
    "You are a profile writer for Trey TV. Generate a compelling creator or viewer bio (2-3 sentences max). " +
    "Make it personal, specific, and authentic. Avoid clichés. Reflect their personality and content style. " +
    "Write the bio directly — do not ask follow-up questions.",

  prescribe_reasoning:
    "You are Trey-I, the recommendation engine for Trey TV. " +
    "Based on a viewer's mood quiz answers, write a short personalized explanation (2-3 sentences) " +
    "for why these recommendations match their vibe. Be warm, insightful, and specific to the mood data.",

  mood_suggestions:
    "You are a content curator for Trey TV. Based on the viewer's current mood and preferences, " +
    "suggest 3-5 content themes or moods to explore tonight. Be specific and evocative. Format as a brief list.",

  admin_summary:
    "You are an admin assistant for Trey TV. Summarize the provided data clearly and concisely for a moderator. " +
    "Highlight key metrics, anomalies, or action items. Plain prose, no markdown headers.",

  moderate_chat:
    "You are Trey-I, a real-time chat moderator for Trey TV. Evaluate the user's message " +
    "for safety. Reply with ONLY a JSON object on a single line, no markdown fences, no commentary:\n" +
    "{ \"verdict\": \"clean\"|\"nudge\"|\"block\"|\"timeout\", \"severity\": \"none\"|\"low\"|\"medium\"|\"high\", \"reason\": \"short reason or empty\" }\n\n" +
    "Rules:\n" +
    "- clean: normal speech, banter, profanity directed at no one. Severity: none.\n" +
    "- nudge: rude, heated, or borderline. Publish anyway with a private warning. Severity: low.\n" +
    "- block: insults at a specific person, harassment, sexual content, spam links, doxxing, " +
    "  self-harm encouragement, hate-speech. Severity: medium.\n" +
    "- timeout: slurs, threats, illegal content, sexualized minors. Severity: high.\n\n" +
    "Be conservative — when in doubt, prefer nudge over block. Trey TV embraces creator energy; " +
    "do not censor harmless trash-talk.",
};

const validateVertexInput = (input: VertexInput): VertexInput => ({
  task: VALID_TASKS.includes(input?.task as VertexTask) ? input.task : "widget_chat",
  prompt: typeof input?.prompt === "string" ? input.prompt.slice(0, 2000) : "",
  context: typeof input?.context === "string" ? input.context.slice(0, 1000) : undefined,
});

export const treyIGenerate = createServerFn({ method: "POST" })
  .inputValidator(validateVertexInput)
  .handler(async ({ data }): Promise<VertexResult> => {
    const { task, prompt, context } = data;
    if (!prompt.trim()) return { error: "Prompt is required" };

    try {
      const systemInstruction = SYSTEM_PROMPTS[task];
      const userContent = context ? `Context: ${context}\n\nRequest: ${prompt}` : prompt;

      const res = await aiGenerateText({
        prompt: userContent,
        systemInstruction,
        temperature: 0.8,
        maxTokens: 512,
      });

      if (!res.text) return { error: "Empty response from AI" };
      return { text: res.text };
    } catch (err) {
      console.error("[treyIGenerate]", err);
      return { error: err instanceof Error ? err.message : "Generation failed" };
    }
  });

type InsightInput = {
  title: string;
  artist: string;
  genre: string;
  notes: string;
};

export const generateMusicReviewInsight = createServerFn({ method: "POST" })
  .inputValidator((input: InsightInput) => ({
    title: String(input.title || "Untitled").slice(0, 100),
    artist: String(input.artist || "Unknown").slice(0, 100),
    genre: String(input.genre || "Other").slice(0, 50),
    notes: String(input.notes || "").slice(0, 500),
  }))
  .handler(async ({ data }) => {
    try {
      const prompt = `Title: ${data.title}\nArtist: ${data.artist}\nGenre: ${data.genre}\nVibe Notes: ${data.notes}`;
      const systemInstruction = 
        "You are Trey-I, a sharp and experienced A&R for Trey TV. Provide a 'first impression' vibe check for this submitted track info. " +
        "Output ONLY a valid JSON object matching this schema exactly, with no markdown formatting: " +
        `{ "vibe": "short 4-6 word description", "strengths": ["string", "string"], "hook": "1 sentence on what to listen for", "hypeScore": number 1-10, "predictedMood": "1 word" }`;

      const parsed = await aiGenerateJson<any>({
        prompt,
        systemInstruction,
        temperature: 0.7,
        maxTokens: 256,
      });

      return {
        vibe: String(parsed.vibe || "Fresh unreleased energy"),
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3).map(String) : ["Atmosphere", "Potential"],
        hook: String(parsed.hook || "Listen for the energy shift in the chorus."),
        hypeScore: typeof parsed.hypeScore === "number" ? Math.min(10, Math.max(1, parsed.hypeScore)) : 7,
        predictedMood: String(parsed.predictedMood || "Reflective"),
      };
    } catch (err) {
      console.error("[generateMusicReviewInsight]", err);
      // Fallback
      return {
        vibe: "Underground energy",
        strengths: ["Raw potential", "Authentic feel"],
        hook: "Listen for the rhythmic pocket on the hook.",
        hypeScore: 7,
        predictedMood: "Hype",
      };
    }
  });

export const generateAdminReviewDraft = createServerFn({ method: "POST" })
  .inputValidator((input: { title: string; artist: string; genre: string; vibe: string; bodyNotes: string }) => ({
    title: String(input.title || "Untitled").slice(0, 100),
    artist: String(input.artist || "Unknown").slice(0, 100),
    genre: String(input.genre || "Other").slice(0, 50),
    vibe: String(input.vibe || "").slice(0, 100),
    bodyNotes: String(input.bodyNotes || "").slice(0, 2000),
  }))
  .handler(async ({ data }) => {
    try {
      const prompt = `Title: ${data.title}\nArtist: ${data.artist}\nGenre: ${data.genre}\nAI Vibe: ${data.vibe}\nAdmin's Rough Notes: ${data.bodyNotes}`;
      const systemInstruction = 
        "You are Trey-I, assisting the A&R admin for Trey TV. Write a professional, encouraging, and constructive music review. " +
        "Use the provided track info and expand cleanly on the Admin's Rough Notes. " +
        "If rough notes are empty, generate a plausible, constructive review based on the title/genre/vibe. " +
        "Do not include the score out of 10. Just write 1-2 polished paragraphs. End with '— Reviewed live on Trey TV'";

      const res = await aiGenerateText({
        prompt,
        systemInstruction,
        temperature: 0.7,
        maxTokens: 500,
      });

      if (!res.text) throw new Error("Empty response");
      return { text: res.text };
    } catch (err) {
      console.error("[generateAdminReviewDraft]", err);
    }
  });

// The 14 canonical Natural Abilities + 4 signal strengths. The model MUST land
// on one of these exact values for the badge UI (keyed by ABILITY_RESULTS) to
// render; anything else is coerced or rejected below.
const SIGNAL_ABILITIES: NaturalAbility[] = [
  "Diviner", "Reaper", "Empath", "Charmer", "Alchemist", "Herbalist", "Seer",
  "Shapeshifter", "Healer", "Dreamer", "Prophet", "Manifestor", "Creative", "Ungifted",
];
const SIGNAL_STRENGTHS: SignalStrength[] = ["Strong", "Mixed", "Emerging", "Unreadable"];

/** Coerce a model-returned ability to a canonical one (case-insensitive, tolerates a leading "The "). Returns null if unrecognizable. */
function coerceAbility(raw: unknown): NaturalAbility | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw.trim().replace(/^the\s+/i, "").toLowerCase();
  return SIGNAL_ABILITIES.find((a) => a.toLowerCase() === cleaned) ?? null;
}

/** Coerce a model-returned signal strength to a canonical one. Returns null if unrecognizable. */
function coerceStrength(raw: unknown): SignalStrength | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw.trim().toLowerCase();
  return SIGNAL_STRENGTHS.find((s) => s.toLowerCase() === cleaned) ?? null;
}

export const judgeSignalTest = createServerFn({ method: "POST" })
  .inputValidator((input: { answers: UserAnswer[]; scenarios: Scenario[] }) => input)
  .handler(async ({ data }): Promise<SignalResult & { interpretation: string }> => {
    // Compute the deterministic result up front — it supplies valid fallbacks
    // for scores / secondary / strength if the model omits or mangles them, and
    // is the full fallback if the AI call fails.
    const local = calculateResult(data.answers, data.scenarios);
    try {
      const prompt = `Below is the list of 20 scenarios from Trey TV's Natural Ability Test and the user's responses (either a multiple-choice ID or a custom text response):
${JSON.stringify(data.answers)}

Scenarios metadata for matching IDs and option bodies:
${JSON.stringify(data.scenarios.map(s => ({ id: s.id, title: s.title, choices: s.choices })))}

The 14 possible archetypes/abilities are:
- Diviner: The Pattern Reader. Notices hidden meanings, sign, motives.
- Reaper: The Ending Maker. Knows when something is dead, fake, or expired.
- Empath: The Energy Feeler. Feels emotional shifts deeply.
- Charmer: The Pull. Naturally attracts attention, comfort, laughter.
- Alchemist: The Transformer. Turns pain, chaos, failure into wisdom.
- Herbalist: The Grounded Restorer. Restores through care, body wisdom, nature.
- Seer: The Future Noticer. Senses what is coming.
- Shapeshifter: The Reinvention Artist. Adapts quickly, survives change.
- Healer: The Peace Bringer. Helps people soften, recover, forgive.
- Dreamer: The World Imaginer. Moves through imagination, fantasy.
- Prophet: The Truth Speaker. Says what others avoid, direct.
- Manifestor: The Reality Caller. Turns intention into reality.
- Creative: The World Builder. Turns feelings, ideas, visuals into art.
- Ungifted: The Unreadable. Hidden, blocked, outside known categories.

Please analyze the user's personality patterns and choices to output a JSON object:
{
  "primaryAbility": "One of the 14 abilities above",
  "secondaryAbility": "One of the 14 abilities above",
  "signalStrength": "Strong" | "Mixed" | "Emerging" | "Unreadable",
  "interpretation": "ONE vivid, personal, affirming Signal Reading of 3-4 sentences that synthesizes their traits into a single cohesive insight. Speak directly to them as 'you'."
}
Return ONLY valid JSON.`;

      const parsed = await aiGenerateJson<any>({
        prompt,
        temperature: 0.7,
        maxTokens: 512,
        // Force the model to return only canonical values (Gemini structured output).
        responseSchema: {
          type: "OBJECT",
          properties: {
            primaryAbility: { type: "STRING", enum: SIGNAL_ABILITIES },
            secondaryAbility: { type: "STRING", enum: SIGNAL_ABILITIES },
            signalStrength: { type: "STRING", enum: SIGNAL_STRENGTHS },
            interpretation: { type: "STRING" },
          },
          required: ["primaryAbility", "secondaryAbility", "signalStrength", "interpretation"],
          propertyOrdering: ["primaryAbility", "secondaryAbility", "signalStrength", "interpretation"],
        },
      });

      // Validate the model output against the canonical sets. If the primary
      // ability isn't recognized, bail to the deterministic result rather than
      // assign (and persist) a badge the UI can't render.
      const primary = coerceAbility(parsed.primaryAbility);
      if (!primary) {
        throw new Error(`AI returned unrecognized primaryAbility: ${JSON.stringify(parsed.primaryAbility)}`);
      }

      let secondary = coerceAbility(parsed.secondaryAbility);
      if (!secondary || secondary === primary) {
        secondary = local.secondaryAbility !== primary
          ? local.secondaryAbility
          : (SIGNAL_ABILITIES.find((a) => a !== primary) as NaturalAbility);
      }

      const signalStrength = coerceStrength(parsed.signalStrength) ?? local.signalStrength;
      const interpretation = typeof parsed.interpretation === "string" && parsed.interpretation.trim()
        ? parsed.interpretation.trim()
        : `Based on your test inputs, you show a primary connection to the path of the ${primary}.`;

      return {
        primaryAbility: primary,
        secondaryAbility: secondary,
        signalBlend: getSignalBlend(primary, secondary),
        signalStrength,
        scores: local.scores,
        interpretation,
      };
    } catch (err) {
      console.error("[judgeSignalTest] fallback to local scoring:", err);
      return {
        ...local,
        interpretation: `Based on your test inputs, you show a primary connection to the path of the ${local.primaryAbility}.`,
      };
    }
  });

export const getGameSpadesDecision = createServerFn({ method: "POST" })
  .inputValidator((input: { state: SpadesState; seat: number; isBid: boolean }) => input)
  .handler(async ({ data }): Promise<{ bid?: number; cardId?: string }> => {
    try {
      const { state, seat, isBid } = data;
      const me = state.players[seat];
      
      const cardsInHand = me.hand.join(", ");
      const partnerSeat = (seat + 2) % 4;

      if (isBid) {
        const prompt = `You are playing a luxury game of Spades on Trey TV.
Bidding Phase.
Your Seat index: ${seat}
Your Partner's Seat index: ${partnerSeat}
Your Hand cards: [${cardsInHand}]
Previous bids from other players:
${state.players.map(p => `${p.name} (Seat ${p.seat}): ${p.bid !== null ? p.bid : "deciding"}`).join("\n")}

Determine how many tricks (0-13) you should bid. Be realistic and strategic.
Return ONLY a JSON object:
{ "bid": number }`;

        const parsed = await aiGenerateJson<any>({
          prompt,
          temperature: 0.5,
          maxTokens: 64,
        });

        return { bid: typeof parsed.bid === "number" ? parsed.bid : fallbackSpadesBid(state, seat) };
      } else {
        // Playing phase
        const legal = state.trick.length === 0 ? me.hand : me.hand.filter(c => {
          const led = state.ledSuit;
          if (!led) return true;
          const followers = me.hand.filter(x => x.endsWith(led[0].toUpperCase()));
          if (followers.length > 0) return c.endsWith(led[0].toUpperCase());
          return true;
        });

        const prompt = `You are playing a luxury game of Spades on Trey TV.
Card Playing Phase.
Your Seat index: ${seat}
Your Partner's Seat index: ${partnerSeat}
Your Hand: [${cardsInHand}]
Legal cards you are allowed to play: [${legal.join(", ")}]
Current trick in play (order of plays):
${state.trick.map(t => `${state.players[t.seat].name} played ${t.cardId}`).join("\n")}
Led suit: ${state.ledSuit || "None"}
Spades broken: ${state.spadesBroken}

Bids and Tricks won so far this round:
${state.players.map(p => `${p.name}: Bid ${p.bid}, Tricks Won: ${p.tricksWon}`).join("\n")}

Select the best card to play from your legal cards [${legal.join(", ")}].
Return ONLY a JSON object:
{ "cardId": "string" }`;

        const parsed = await aiGenerateJson<any>({
          prompt,
          temperature: 0.6,
          maxTokens: 64,
        });

        const cardId = String(parsed.cardId);
        return { cardId: legal.includes(cardId) ? cardId : fallbackSpadesPlay(state, seat) };
      }
    } catch (err) {
      console.error("[getGameSpadesDecision] fallback:", err);
      if (data.isBid) {
        return { bid: fallbackSpadesBid(data.state, data.seat) };
      } else {
        return { cardId: fallbackSpadesPlay(data.state, data.seat) };
      }
    }
  });

export const getGameBullshitDecision = createServerFn({ method: "POST" })
  .inputValidator((input: { state: BSState; seat: number; isClaim: boolean }) => input)
  .handler(async ({ data }): Promise<{ cardIds?: string[]; rank?: string; callBullshit?: boolean }> => {
    try {
      const { state, seat, isClaim } = data;
      const me = state.players[seat];

      if (isClaim) {
        const prompt = `You are playing Bullshit (Cheat) on Trey TV.
It is your turn to play cards.
Your Hand: [${me.hand.join(", ")}]
The rank you MUST claim to play is: ${state.expectedRank}s.
You must select 1 to 4 card IDs from your hand. You can tell the truth or bluff (lie) about their ranks.
Return ONLY a JSON object:
{ "cardIds": ["ID1", ...], "rank": "${state.expectedRank}" }`;

        const parsed = await aiGenerateJson<any>({
          prompt,
          temperature: 0.7,
          maxTokens: 128,
        });

        const cardIds = Array.isArray(parsed.cardIds) ? parsed.cardIds.map(String) : [];
        const validIds = cardIds.filter(id => me.hand.includes(id));
        if (validIds.length > 0) {
          return { cardIds: validIds, rank: state.expectedRank };
        }
        const fallback = fallbackBSClaim(state, seat);
        return { cardIds: fallback.cardIds, rank: fallback.rank };
      } else {
        const prompt = `You are playing Bullshit (Cheat) on Trey TV.
Someone just made a claim:
${state.players[state.lastClaim!.seat].name} claimed ${state.lastClaim!.count} x ${state.lastClaim!.rank}s.
Your Hand: [${me.hand.join(", ")}]
Sizes of other players' hands:
${state.players.map(p => `${p.name}: ${p.hand.length} cards`).join("\n")}

Determine if you should call "Bullshit" (challenge their claim) or "Pass".
Return ONLY a JSON object:
{ "callBullshit": true or false }`;

        const parsed = await aiGenerateJson<any>({
          prompt,
          temperature: 0.6,
          maxTokens: 64,
        });

        return { callBullshit: typeof parsed.callBullshit === "boolean" ? parsed.callBullshit : fallbackBSShouldCall(state, seat) };
      }
    } catch (err) {
      console.error("[getGameBullshitDecision] fallback:", err);
      if (data.isClaim) {
        const fallback = fallbackBSClaim(data.state, data.seat);
        return { cardIds: fallback.cardIds, rank: fallback.rank };
      } else {
        return { callBullshit: fallbackBSShouldCall(data.state, data.seat) };
      }
    }
  });

export const generateStoryChapterWithGemini = createServerFn({ method: "POST" })
  .inputValidator((input: { context: any; choice: any; premise: string; tone: Tone }) => input)
  .handler(async ({ data }): Promise<AIResult> => {
    try {
      const { context, choice, premise, tone } = data;

      const prompt = `You are the lead storyteller for Trey TV's premium Interactive Stories.
Create the next chapter of the interactive story.
Story Premise: "${premise}"
Current Chapter Number: ${context.chapter_number + 1}
Previous Chapter Summaries:
${context.summaries.join("\n")}

Current State Meters (0 to 100):
- trust_ari: ${context.meters.trust_ari}
- trust_dante: ${context.meters.trust_dante}
- trust_malik_to_micah: ${context.meters.trust_malik_to_micah}
- trust_micah_to_malik: ${context.meters.trust_micah_to_malik}
- suspicion_mom: ${context.meters.suspicion_mom}
- suspicion_coach: ${context.meters.suspicion_coach}
- suspicion_valentina: ${context.meters.suspicion_valentina}
- risk_level: ${context.meters.risk_level}

The Player's Choice was: "${choice.text}" (Tone: ${choice.tone || "Bold"})

Generate:
1. "prose": 2-3 detailed paragraphs of engaging narrative.
2. "chapter_title": A creative title.
3. "chapter_summary": A 1-sentence recap of this chapter.
4. "state_delta": Changes to the meters (modest adjustments e.g. +5, -10).
5. "tone_tag": Tone tag for this chapter ('Bold' | 'Risky' | 'Funny' | 'Romantic' | 'Safe').
6. "next_stop_point": A prompt and 3 interesting choices for the next chapter.
7. "is_ending": true if story reaches a satisfying conclusion (typically chapter 4 or 5).
8. "ending_unlocked": name of ending if is_ending is true.
9. "ending_tagline": description of ending.

Return ONLY a JSON object matching this schema:
{
  "prose": "string",
  "state": {
    "chapter_title": "string",
    "chapter_summary": "string",
    "state_delta": {
      "trust_ari": number,
      "trust_dante": number,
      "trust_malik_to_micah": number,
      "trust_micah_to_malik": number,
      "suspicion_mom": number,
      "suspicion_coach": number,
      "suspicion_valentina": number,
      "risk_level": number
    },
    "tone_tag": "Bold" | "Risky" | "Funny" | "Romantic" | "Safe",
    "is_ending": boolean,
    "ending_unlocked": "string" | null,
    "ending_tagline": "string" | null,
    "next_stop_point": {
      "prompt": "string",
      "choices": [
        { "id": "c1", "label": "A", "text": "string", "tone": "Bold" | "Risky" | "Funny" | "Romantic" | "Safe" },
        { "id": "c2", "label": "B", "text": "string", "tone": "Bold" | "Risky" | "Funny" | "Romantic" | "Safe" },
        { "id": "c3", "label": "C", "text": "string", "tone": "Bold" | "Risky" | "Funny" | "Romantic" | "Safe" }
      ]
    }
  }
}`;

      const parsed = await aiGenerateJson<any>({
        prompt,
        temperature: 0.8,
        maxTokens: 800,
      });

      return parsed as AIResult;
    } catch (err) {
      console.error("[generateStoryChapterWithGemini] fallback:", err);
      // Fail-safe default chapter
      return {
        prose: `You move forward with determination. Your choice to proceed with a ${data.choice.tone || "Bold"} energy shifts the focus, and you adapt quickly to the surrounding drama. The story continues.`,
        state: {
          chapter_title: `Chapter ${data.context.chapter_number + 1} — Moving Forward`,
          chapter_summary: "The story continues as they resolve the recent conflict.",
          state_delta: { risk_level: 5 },
          tone_tag: data.choice.tone || ("Bold" as Tone),
          is_ending: false,
          ending_unlocked: null,
          ending_tagline: null,
          next_stop_point: {
            prompt: "What will you do now?",
            choices: [
              { id: "c1", label: "A", text: "Take a big risk and reveal the secret.", tone: "Risky" },
              { id: "c2", label: "B", text: "Keep it safe and watch from a distance.", tone: "Safe" },
              { id: "c3", label: "C", text: "Crack a joke to break the ice.", tone: "Funny" },
            ],
          },
        },
      };
    }
  });

export const generateSmartReplies = createServerFn({ method: "POST" })
  .inputValidator((input: { messages: { from: string; text: string }[]; peerName: string }) => input)
  .handler(async ({ data }): Promise<{ replies: string[] }> => {
    try {
      const prompt = `Below is the recent history of a DM conversation between the user and ${data.peerName}:
${data.messages.slice(-5).map(m => `${m.from}: ${m.text}`).join("\n")}

Suggest exactly 3 short, conversational, and contextually appropriate quick replies (1-4 words each) that the user could send next.
Return ONLY a JSON array of strings:
["reply 1", "reply 2", "reply 3"]`;

      const parsed = await aiGenerateJson<any>({
        prompt,
        temperature: 0.7,
        maxTokens: 64,
      });

      return { replies: Array.isArray(parsed) ? parsed.slice(0, 3).map(String) : ["I'm in!", "Let's lock it", "Talk soon!"] };
    } catch (err) {
      console.error("[generateSmartReplies] fallback:", err);
      return { replies: ["I'm in!", "Let's lock it", "Talk soon!"] };
    }
  });

export const summarizeInboxThread = createServerFn({ method: "POST" })
  .inputValidator((input: { messages: { from: string; text: string }[]; peerName: string }) => input)
  .handler(async ({ data }): Promise<{ summary: string }> => {
    try {
      const prompt = `Summarize this conversation between the user and ${data.peerName} in 2-3 sentences. Highlighting any collaborative plans, beats, or next steps.
Conversation history:
${data.messages.map(m => `${m.from}: ${m.text}`).join("\n")}

Format output as a clean prose paragraph. No headers or bullet points.`;

      const res = await aiGenerateText({
        prompt,
        temperature: 0.6,
        maxTokens: 196,
      });

      return { summary: res.text || "A conversation about future collaborations." };
    } catch (err) {
      console.error("[summarizeInboxThread] fallback:", err);
      return { summary: `A conversation with ${data.peerName} regarding creative collaboration and upcoming projects on Trey TV.` };
    }
  });

export const curatePrescriptionWithAI = createServerFn({ method: "POST" })
  .inputValidator((input: { answers: PrescriptionAnswers }) => input)
  .handler(async ({ data }): Promise<{ title: string; explanation: string; rankedIds: string[] }> => {
    // Destructured outside the try so the catch-block fallback can reference it
    // (previously the fallback threw a ReferenceError on any AI failure).
    const { answers } = data;
    try {
      const prompt = `You are Trey-I, the recommendation engine for Trey TV.
The user took the Vibe quiz. Here are their selections:
- Moods: ${answers.moods.join(", ")}
- Energy level: ${answers.energy || "Surprise Me"}
- Content Categories: ${answers.contentTypes.join(", ")}
- Moment Needs: ${answers.momentNeeds.join(", ")}

Here is the library of available content on Trey TV:
${JSON.stringify(CONTENT_LIBRARY.map(item => ({ id: item.id, title: item.title, description: item.description, category: item.category, moods: item.moods, energy: item.energy })))}

Please:
1. Select the top 6 content item IDs that best match their vibe, ranked from best to sixth-best.
2. Formulate a creative, premium "Prescription Title" that summarizes this mood recipe.
3. Write a warm, personalized, and specific explanation (2-3 sentences) explaining why this prescription is exactly what they need right now.

Return ONLY a JSON object matching this schema:
{
  "title": "string",
  "explanation": "string",
  "rankedIds": ["id1", "id2", "id3", "id4", "id5", "id6"]
}`;

      const parsed = await aiGenerateJson<any>({
        prompt,
        temperature: 0.7,
        maxTokens: 512,
      });

      return {
        title: String(parsed.title || generatePrescriptionTitle(answers)),
        explanation: String(parsed.explanation || "A custom vibe curation for your night."),
        rankedIds: Array.isArray(parsed.rankedIds) ? parsed.rankedIds.map(String) : scoreContent(answers).slice(0, 6).map(x => x.id),
      };
    } catch (err) {
      console.error("[curatePrescriptionWithAI] fallback:", err);
      const scoredLocal = scoreContent(answers);
      return {
        title: generatePrescriptionTitle(answers),
        explanation: `Curated based on your active choices for ${answers.moods.slice(0, 2).join(" & ")}.`,
        rankedIds: scoredLocal.slice(0, 6).map(x => x.id),
      };
    }
  });

export const reRankFeedWithAI = createServerFn({ method: "POST" })
  .inputValidator((input: { posts: any[]; userBadge: string | null; query: string }) => input)
  .handler(async ({ data }): Promise<{ rankedIds: string[] }> => {
    try {
      const prompt = `Rank these posts in order of relevance for a user with the Natural Ability Badge: "${data.userBadge || "None"}".
Search/Filter term: "${data.query || "None"}"

Posts:
${JSON.stringify(data.posts.map(p => ({ id: p.id, creator: p.creator.name, text: p.text, tags: p.tags })))}

Provide the ranked list of post IDs from most relevant to least.
Return ONLY a JSON object:
{ "rankedIds": ["id1", "id2", ...] }`;

      const parsed = await aiGenerateJson<any>({
        prompt,
        temperature: 0.5,
        maxTokens: 256,
      });

      return { rankedIds: Array.isArray(parsed.rankedIds) ? parsed.rankedIds.map(String) : data.posts.map(p => p.id) };
    } catch (err) {
      console.error("[reRankFeedWithAI] fallback:", err);
      return { rankedIds: data.posts.map(p => p.id) };
    }
  });
