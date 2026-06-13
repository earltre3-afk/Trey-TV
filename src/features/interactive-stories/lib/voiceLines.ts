// Character voice line system. Each canonical character_id maps to a distinct
// fictional voice profile. Audio is generated server-side via the
// `character-voice-line` edge function (ElevenLabs through the Audio Gateway).
//
// Rules:
// • Original fictional voice profiles only — never imitates real people.
// • Captions/subtitles always show even when audio plays.
// • One line plays at a time (we hard-stop the previous Audio instance).
// • User-controllable: mute, autoplay, replay, skip.

import { supabase } from "./supabase";
import type {
  StoryBeatVoiceLine,
  StoryCharacterVoices,
  StoryVoiceCharacter,
  StoryVoiceConfig,
} from "./storyVoiceTypes";

export type VoiceCharacterId =
  | "narrator"
  | "malik_carter"
  | "micah_carter"
  | "denise_carter"
  | "ari"
  | "dante_reeves"
  | "reggie"
  | "coach_bridges"
  | "ms_valentina"
  | "compliance_officer";

export interface VoiceProfile {
  character_id: VoiceCharacterId;
  display_name: string;
  description: string;
  accent: string;
}

export const VOICE_PROFILES: Record<VoiceCharacterId, VoiceProfile> = {
  narrator: {
    character_id: "narrator",
    display_name: "Narrator",
    description: "Warm, cinematic, slightly amused. The voice of the story itself.",
    accent: "amber",
  },
  malik_carter: {
    character_id: "malik_carter",
    display_name: "Malik Carter",
    description: "Cocky, animated, leans on charm. Cracks under pressure.",
    accent: "orange",
  },
  micah_carter: {
    character_id: "micah_carter",
    display_name: "Micah Carter",
    description: "Controlled, dry, precise. Same face as Malik, opposite tempo.",
    accent: "sky",
  },
  denise_carter: {
    character_id: "denise_carter",
    display_name: "Denise Carter",
    description: "Mature, warm but sharp. Doesn't raise her voice; doesn't need to.",
    accent: "rose",
  },
  ari: {
    character_id: "ari",
    display_name: 'Ariana "Ari" Cole',
    description: "Bright, perceptive, gentle teasing energy.",
    accent: "pink",
  },
  dante_reeves: {
    character_id: "dante_reeves",
    display_name: "Dante Reeves",
    description: "Low, quiet swagger. Vulnerable when no one's watching.",
    accent: "violet",
  },
  reggie: {
    character_id: "reggie",
    display_name: "Reggie",
    description: "Loud, hilarious, leans into every joke. Sees more than he lets on.",
    accent: "yellow",
  },
  coach_bridges: {
    character_id: "coach_bridges",
    display_name: "Coach Bridges",
    description: "Gravel-voiced, old school, secretly fair.",
    accent: "emerald",
  },
  ms_valentina: {
    character_id: "ms_valentina",
    display_name: "Ms. Valentina",
    description: "Crisp, exacting, theatrical when she wants to be.",
    accent: "fuchsia",
  },
  compliance_officer: {
    character_id: "compliance_officer",
    display_name: "Compliance Officer",
    description: "Calm authority. Long memory. Never raises pace.",
    accent: "slate",
  },
};

export function toVoiceId(appCharacterId?: string | null): VoiceCharacterId {
  if (!appCharacterId) return "narrator";
  const norm = appCharacterId.replace(/-/g, "_");
  if (norm in VOICE_PROFILES) return norm as VoiceCharacterId;
  return "narrator";
}

// -- Settings storage --------------------------------------------------------

const KEY = "trey_voice_settings_v1";
export const VOICE_SETTINGS_EVENT = "trey_voice_settings_changed";

export interface VoiceSettings {
  muted: boolean;
  autoplay: boolean;
  volume: number;
}

export function loadVoiceSettings(): VoiceSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        muted: !!parsed.muted,
        autoplay: true,
        volume: 1.0,
      };
    }
  } catch {}
  return { muted: false, autoplay: true, volume: 1.0 };
}

export function saveVoiceSettings(s: VoiceSettings) {
  const next = { ...s, autoplay: true, volume: 1.0 };
  localStorage.setItem(KEY, JSON.stringify(next));
  try {
    window.dispatchEvent(new CustomEvent<VoiceSettings>(VOICE_SETTINGS_EVENT, { detail: next }));
  } catch {}
}

// -- Audio playback ----------------------------------------------------------

let currentAudio: HTMLAudioElement | null = null;
let currentUrl: string | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let playbackGeneration = 0;
let activePlaybackToken: string | null = null;
const audioCache = new Map<string, string>();

export interface VoiceQueueLine {
  playthrough_id?: string | null;
  scene_id: string;
  beat_id?: string;
  line_id: string;
  character_id: string;
  voice?: StoryVoiceConfig | null;
  voice_key?: string;
  lineIndex: number;
  text: string;
  audio_url?: string;
  status?: "queued" | "loading" | "playing" | "finished" | "skipped" | "cancelled";
}

function cacheKey(characterId: string, text: string, voice?: StoryVoiceConfig | null) {
  const voicePart = voice?.voiceId || voice?.voiceName || voice?.voiceProvider || characterId;
  return `${characterId}::${voicePart}::${text.trim().toLowerCase().slice(0, 240)}`;
}

function debugVoice(event: string, payload: Record<string, unknown>) {
  try {
    if (localStorage.getItem("trey_voice_debug") !== "1") return;
    // Hidden debug log: turn on with localStorage.setItem('trey_voice_debug','1')
    console.info(`[VoicePlaybackManager] ${event}`, payload);
  } catch {}
}

export function stopVoice() {
  playbackGeneration += 1;
  activePlaybackToken = null;
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {}
    currentAudio = null;
  }
  if (currentUtterance) {
    try {
      window.speechSynthesis?.cancel();
    } catch {}
    currentUtterance = null;
  }
  currentUrl = null;
  debugVoice("stop", { playbackGeneration });
}

export function createPlaybackToken(sceneId: string = "scene"): string {
  playbackGeneration += 1;
  activePlaybackToken = `${sceneId}_${Date.now()}_${playbackGeneration}`;
  return activePlaybackToken;
}

export function isCurrentPlaybackToken(token?: string | null) {
  return !!token && token === activePlaybackToken;
}

export async function generateVoiceLine(
  characterId: string,
  text: string,
  voice?: StoryVoiceConfig | null,
): Promise<string | null> {
  if (voice?.voiceProvider === "none") return null;

  // Resolve voice config to fallback to elevenlabs if provider is system, missing, or falsy
  const resolvedVoice: StoryVoiceConfig = {
    voiceProvider: voice?.voiceProvider && voice.voiceProvider !== "system" ? voice.voiceProvider : "elevenlabs",
    voiceId: voice?.voiceId || null,
    voiceName: voice?.voiceName || null,
    audioStyle: voice?.audioStyle || null,
    settings: voice?.settings || null,
  };

  const key = cacheKey(characterId, text, resolvedVoice);
  if (audioCache.has(key)) return audioCache.get(key)!;

  // Use raw fetch (binary response — supabase.functions.invoke would JSON-parse).
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const sb = supabase as unknown as { supabaseUrl: string; supabaseKey: string };
  const token = session?.access_token || sb.supabaseKey;

  const resp = await fetch(`${sb.supabaseUrl}/functions/v1/character-voice-line`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: sb.supabaseKey,
    },
    body: JSON.stringify({
      text,
      character_id: toVoiceId(characterId),
      story_character_id: characterId,
      voice: resolvedVoice,
    }),
  });
  if (!resp.ok) throw new Error(`Voice request failed: ${resp.status}`);
  const blob = await resp.blob();
  const url = URL.createObjectURL(blob);
  audioCache.set(key, url);
  return url;
}

function normalizeVolume(volume?: number) {
  if (!Number.isFinite(volume)) return loadVoiceSettings().volume;
  return Math.max(0, Math.min(1, Number(volume)));
}

function speakWithBrowserVoice(
  characterId: string,
  text: string,
  opts: {
    voice?: StoryVoiceConfig | null;
    volume?: number;
    onEnded?: () => void;
    onError?: (e: unknown) => void;
    playbackToken?: string;
    lineIndex?: number;
  },
): SpeechSynthesisUtterance | null {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    typeof SpeechSynthesisUtterance === "undefined"
  ) {
    return null;
  }

  if (opts.voice?.voiceProvider === "none") {
    return null;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const requestedName =
      opts.voice?.voiceName || VOICE_PROFILES[toVoiceId(characterId)]?.display_name;
    const voices = window.speechSynthesis.getVoices?.() || [];
    const matchedVoice = requestedName
      ? voices.find((candidate) =>
          candidate.name.toLowerCase().includes(requestedName.toLowerCase()),
        )
      : undefined;
    if (matchedVoice) utterance.voice = matchedVoice;
    utterance.volume = normalizeVolume(opts.volume);
    utterance.rate =
      typeof opts.voice?.settings?.rate === "number" ? Number(opts.voice.settings.rate) : 0.96;
    utterance.pitch =
      typeof opts.voice?.settings?.pitch === "number" ? Number(opts.voice.settings.pitch) : 1;
    utterance.onend = () => {
      if (currentUtterance === utterance && isCurrentPlaybackToken(opts.playbackToken)) {
        currentUtterance = null;
        debugVoice("speech-finished", {
          characterId,
          token: opts.playbackToken,
          lineIndex: opts.lineIndex,
        });
        opts.onEnded?.();
      }
    };
    utterance.onerror = (event) => {
      if (isCurrentPlaybackToken(opts.playbackToken)) opts.onError?.(event);
    };
    currentUtterance = utterance;
    debugVoice("speech-playing", {
      characterId,
      token: opts.playbackToken,
      lineIndex: opts.lineIndex,
    });
    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (error) {
    opts.onError?.(error);
    return null;
  }
}

export async function playVoiceLine(
  characterId: string,
  text: string,
  opts: {
    muted?: boolean;
    volume?: number;
    voice?: StoryVoiceConfig | null;
    onEnded?: () => void;
    onError?: (e: unknown) => void;
    playbackToken?: string;
    sceneId?: string;
    lineIndex?: number;
  } = {},
): Promise<HTMLAudioElement | SpeechSynthesisUtterance | null> {
  const token = opts.playbackToken || createPlaybackToken(opts.sceneId || "single-line");
  const generationAtStart = playbackGeneration;

  // Clean any currently playing line, but keep this token active.
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {}
    currentAudio = null;
  }
  if (currentUtterance) {
    try {
      window.speechSynthesis?.cancel();
    } catch {}
    currentUtterance = null;
  }
  currentUrl = null;
  activePlaybackToken = token;

  if (opts.muted) {
    debugVoice("muted-skip", { characterId, token, lineIndex: opts.lineIndex });
    return null;
  }

  try {
    debugVoice("loading", {
      characterId,
      token,
      lineIndex: opts.lineIndex,
      text: text.slice(0, 80),
    });
    const url = await generateVoiceLine(characterId, text, opts.voice);

    // Async/race-condition guard: stale voice requests never get to speak.
    if (generationAtStart !== playbackGeneration || !isCurrentPlaybackToken(token)) {
      debugVoice("stale-blocked", {
        characterId,
        token,
        activePlaybackToken,
        generationAtStart,
        playbackGeneration,
      });
      return null;
    }

    if (!url) {
      return speakWithBrowserVoice(characterId, text, {
        voice: opts.voice,
        volume: opts.volume,
        onEnded: opts.onEnded,
        onError: opts.onError,
        playbackToken: token,
        lineIndex: opts.lineIndex,
      });
    }

    const audio = new Audio(url);
    audio.volume = normalizeVolume(opts.volume);
    currentAudio = audio;
    currentUrl = url;
    audio.addEventListener("ended", () => {
      if (currentAudio === audio && isCurrentPlaybackToken(token)) {
        currentAudio = null;
        debugVoice("finished", { characterId, token, lineIndex: opts.lineIndex });
        opts.onEnded?.();
      }
    });
    audio.addEventListener("error", (e) => {
      if (isCurrentPlaybackToken(token)) opts.onError?.(e);
    });
    debugVoice("playing", { characterId, token, lineIndex: opts.lineIndex, url: currentUrl });
    await audio.play();
    return audio;
  } catch (e) {
    if (!isCurrentPlaybackToken(token)) return null;
    debugVoice("provider-fallback", {
      characterId,
      token,
      error: e instanceof Error ? e.message : String(e),
    });
    return speakWithBrowserVoice(characterId, text, {
      voice: opts.voice,
      volume: opts.volume,
      onEnded: opts.onEnded,
      onError: opts.onError,
      playbackToken: token,
      lineIndex: opts.lineIndex,
    });
  }
}

function normalizeName(value?: string | null) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export function resolveStoryVoiceForLine(
  line: Pick<
    StoryBeatVoiceLine,
    "type" | "character_id" | "characterId" | "speakerId" | "speakerName" | "voice"
  >,
  characterVoices?: StoryCharacterVoices,
  characters: StoryVoiceCharacter[] = [],
): { characterId: string; speakerName: string; voice: StoryVoiceConfig | null } {
  const isNarration = line.type === "narration";
  const rawSpeakerId = line.character_id || line.characterId || line.speakerId;
  const speakerById = rawSpeakerId
    ? characters.find(
        (candidate) =>
          candidate.character_id === rawSpeakerId ||
          normalizeName(candidate.character_id) === normalizeName(rawSpeakerId),
      )
    : undefined;
  const speakerByName =
    !speakerById && line.speakerName
      ? characters.find(
          (candidate) => normalizeName(candidate.display_name) === normalizeName(line.speakerName),
        )
      : undefined;
  const character = speakerById || speakerByName;
  const characterId = isNarration
    ? "narrator"
    : character?.character_id || rawSpeakerId || "narrator";
  const speakerName = isNarration
    ? "Narrator"
    : line.speakerName ||
      character?.display_name ||
      VOICE_PROFILES[toVoiceId(characterId)]?.display_name ||
      "Narrator";
  const voice =
    line.voice ||
    (characterId === "narrator"
      ? characterVoices?.narrator
      : characterVoices?.characters?.[characterId]) ||
    character?.voice ||
    (characterId === "narrator" ? characterVoices?.narrator : null);

  return { characterId, speakerName, voice: voice || null };
}

export async function playVoiceQueue(
  lines: VoiceQueueLine[],
  opts: {
    muted?: boolean;
    sceneId: string;
    onLineStart?: (line: VoiceQueueLine) => void;
    onLineEnd?: (line: VoiceQueueLine) => void;
    onComplete?: () => void;
    onError?: (e: unknown) => void;
  },
) {
  const token = createPlaybackToken(opts.sceneId);
  const ordered = [...lines].sort((a, b) => a.lineIndex - b.lineIndex);

  for (const line of ordered) {
    if (!isCurrentPlaybackToken(token)) return;
    opts.onLineStart?.({ ...line, status: "playing" });
    await new Promise<void>((resolve) => {
      playVoiceLine(line.character_id, line.text, {
        muted: opts.muted,
        voice: line.voice,
        playbackToken: token,
        sceneId: opts.sceneId,
        lineIndex: line.lineIndex,
        onEnded: () => {
          opts.onLineEnd?.({ ...line, status: "finished" });
          resolve();
        },
        onError: (e) => {
          opts.onError?.(e);
          resolve();
        },
      }).then((audio) => {
        // Muted lines return null; keep queue moving.
        if (!audio) resolve();
      });
    });
  }

  if (isCurrentPlaybackToken(token)) opts.onComplete?.();
}
