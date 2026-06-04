import type { Prescription, TradioMode, UserAnswers } from "./prescribeMeTypes";

// Label mappings to turn machine-values into beautiful copy-friendly phrases
export const NEED_LABELS: Record<string, string> = {
  feel_understood: "to feel understood",
  turn_up: "to turn up and elevate",
  calm_down: "to calm down and decompress",
  focus: "to dial in and focus",
  discover_new: "to discover something completely fresh",
  motivation: "raw motivation",
  process: "to process some thoughts",
  creative_inspiration: "creative inspiration",
  background_energy: "background energy",
  live_energy: "live, raw community connection",
};

export const ENERGY_LABELS: Record<string, string> = {
  heavy: "heavy",
  restless: "restless",
  inspired: "inspired",
  numb: "numb",
  excited: "excited",
  reflective: "reflective",
  confident: "confident",
  lonely: "lonely",
  focused: "focused",
  social: "social",
};

export const SHIFT_LABELS: Record<string, string> = {
  match_mood: "match your mood",
  change_mood: "shift your mood",
  challenge_me: "challenge your musical horizons",
  comfort_me: "provide comfort and grounding",
  hype_up: "hype you up completely",
  help_create: "fuel your creative workflow",
  help_decide: "take away decision fatigue",
  find_people: "find your people and sync waves",
};

export const FAMILIARITY_LABELS: Record<string, string> = {
  familiar: "highly familiar sounds",
  hybrid: "a blend of the familiar and the undiscovered",
  surprise: "total surprise and sudden flips",
  underground: "exclusive underground-only signals",
  trending: "top platform-trending waves",
};

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  song: "a singular song",
  station: "a live radio station",
  artist_station: "a curated artist profile station",
  live_show: "an active broadcast show",
  dj_mix: "a high-end DJ transition mix",
  producer_beat: "a raw producer beat lease",
  song_wars: "a live Song Wars PvP matchup",
  playlist: "a personalized playlist",
  replay: "a hosted show replay archive",
  community: "a live chat community room",
  broadcast_idea: "a creative broadcast studio prompt",
  release_strategy: "a release timing blueprint",
  show_flow: "a show timeline structure",
};

/**
 * Main AI-routing mapping function that evaluates mode + psychological answers
 * to generate a beautiful, personalized, content-focused prescription card.
 */
export function generateAIPreRoutePrescription(
  mode: TradioMode,
  answers: UserAnswers,
  refinementId?: string | null,
): Prescription {
  const { currentNeed, emotionalState, desiredShift, familiarity, contentType } = answers;

  // 1. Resolve readable text from selected values
  const needText = NEED_LABELS[currentNeed] || "content flow";
  const energyText = ENERGY_LABELS[emotionalState] || "dynamic";
  const shiftText = SHIFT_LABELS[desiredShift] || "align with you";
  const famText = FAMILIARITY_LABELS[familiarity] || "custom content";
  const contentText = CONTENT_TYPE_LABELS[contentType] || "music experience";

  // 2. Select route destination screen & type based on mode and content choice
  let destination = "home";
  let routeType = "Acoustic Station";
  let title = "Midnight Velvet Formula";
  let primaryCtaLabel = "Start Prescription Radio";
  let ctaType: "start_radio" | "navigate_screen" | "open_forge" | "action_alert" = "start_radio";

  // Mode-Specific Mapping
  if (mode === "fan" || mode === "listener") {
    if (contentType === "song_wars" || desiredShift === "challenge_me") {
      destination = "stations"; // Song Wars Hub is inside Stations
      routeType = "Song Wars Arena";
      title = "Holographic Matchup Rx";
      primaryCtaLabel = "Enter Arena";
      ctaType = "navigate_screen";
    } else if (contentType === "playlist" || contentType === "dj_mix") {
      destination = "library";
      routeType = "Sound Library";
      title = "Custom Wavepack Formula";
      primaryCtaLabel = "Open Library";
      ctaType = "navigate_screen";
    } else if (contentType === "community" || desiredShift === "find_people") {
      destination = "community";
      routeType = "Live Community Room";
      title = "Late Night Vibestate Group";
      primaryCtaLabel = "Connect to Chat";
      ctaType = "navigate_screen";
    } else if (contentType === "search" || familiarity === "underground") {
      destination = "search";
      routeType = "Sound Search";
      title = "Underground Discovery Dig";
      primaryCtaLabel = "Start Digging";
      ctaType = "navigate_screen";
    } else {
      destination = "stations";
      routeType = "Prescription Radio";
      title = "Synthesized Live Formula";
      primaryCtaLabel = "Start Prescription Radio";
      ctaType = "start_radio";
    }
  } else if (mode === "artist") {
    routeType = "Artist Blueprint";
    ctaType = "navigate_screen";

    if (contentType === "release_strategy" || desiredShift === "help_create") {
      destination = "release";
      title = "Friday Night Premiere Strategy";
      primaryCtaLabel = "Review Release Plan";
    } else if (contentType === "song_wars") {
      destination = "stations";
      title = "Fan Heat PvP Arena";
      primaryCtaLabel = "Enter PvP Deck";
    } else {
      destination = "artistHub";
      title = "Acoustic Station Programming";
      primaryCtaLabel = "Configure Streams";
    }
  } else if (mode === "producer") {
    routeType = "Producer Blueprint";

    if (contentType === "playlist" || currentNeed === "creative_inspiration") {
      destination = "build"; // Playlist Forge
      title = "92 BPM Beat Blueprint";
      primaryCtaLabel = "Open Playlist Forge";
      ctaType = "open_forge";
    } else {
      destination = "producerHub";
      title = "Artist Match Prescription";
      primaryCtaLabel = "View Matches";
      ctaType = "navigate_screen";
    }
  } else if (mode === "dj") {
    routeType = "DJ Show Grid";
    destination = "djStudio";
    ctaType = "navigate_screen";

    if (contentType === "show_flow" || desiredShift === "help_create") {
      title = "Smooth-to-Hype Show Flow";
      primaryCtaLabel = "Build Show Arc";
    } else {
      title = "45-Minute Southern Heat Grid";
      primaryCtaLabel = "Open Deck Slots";
    }
  } else {
    // Admin / Owner
    routeType = "Platform Telemetry";
    destination = "studio";
    title = "Platform Opportunity Scan";
    primaryCtaLabel = "Review Telemetry";
    ctaType = "navigate_screen";
  }

  // 3. Handle Refinement overrides (if session refinement active)
  let energyAdjustment = "";
  let surpriseAdjustment = "";
  if (refinementId) {
    if (refinementId === "calmer") {
      title = `Calmed: ${title}`;
      energyAdjustment = " We have dialed down the pacing and velocity limits for extreme calm.";
    } else if (refinementId === "harder") {
      title = `Heavy: ${title}`;
      energyAdjustment =
        " We have heavily boosted the bass and wave saturation to maximize impact.";
    } else if (refinementId === "familiar") {
      title = `Familiarized: ${title}`;
      surpriseAdjustment = " Filters updated to strict catalog saves and frequent plays.";
    } else if (refinementId === "surprising") {
      title = `Surprise Wave: ${title}`;
      surpriseAdjustment = " Underground discovery values dialed to maximum.";
    } else if (refinementId === "live_only") {
      title = `Live: ${title}`;
      surpriseAdjustment = " Strictly matching broadcasting hosts and interactive chat slots.";
    } else if (refinementId === "no_song_wars") {
      title = `Pure: ${title}`;
      surpriseAdjustment = " Removed PvP matchups to preserve long-form streams.";
    } else if (refinementId === "producer_dj") {
      title = `Curated: ${title}`;
      surpriseAdjustment = " Infused exclusive beat transitions and DJ drops.";
    }
  }

  // 4. Construct behavioral explanation summary using answer parameters (privacy-safe, supportive, non-diagnostic)
  const description = `This custom ${routeType.toLowerCase()} is optimized for a ${energyText} energy level, targeting your stated intent ${needText}. Fits a desire to ${shiftText} with ${famText}.`;

  const isListeningMode = mode === "fan" || mode === "listener";
  const reason = `Formulated because you said you need ${needText} and want this content to ${shiftText}.${energyAdjustment}${surpriseAdjustment} Designed for a highly intentional, content-focused ${isListeningMode ? "listening" : "creator"} lane.`;

  const confidenceScore = Math.floor(88 + Math.random() * 11);

  return {
    id: `rx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    title,
    routeType,
    destination,
    description,
    reason,
    confidenceLabel: `${confidenceScore}% MATCH`,
    primaryCtaLabel,
    ctaType,
    secondaryCtaLabel: "Refine Result",
    timestamp: Date.now(),
  };
}
