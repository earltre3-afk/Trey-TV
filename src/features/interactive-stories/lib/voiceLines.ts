// Character voice line system. Each canonical character_id maps to a distinct
// fictional voice profile. Audio is generated server-side via the
// `character-voice-line` edge function (ElevenLabs through the Audio Gateway).
//
// Rules:
//   â€¢ Original fictional voice profiles only â€” never imitates real people.
//   â€¢ Captions/subtitles always show even when audio plays.
//   â€¢ One line plays at a time (we hard-stop the previous Audio instance).
//   â€¢ User-controllable: mute, autoplay, replay, skip.

import { supabase } from './supabase';

export type VoiceCharacterId =
  | 'narrator'
  | 'malik_carter'
  | 'micah_carter'
  | 'denise_carter'
  | 'ari'
  | 'dante_reeves'
  | 'reggie'
  | 'coach_bridges'
  | 'ms_valentina'
  | 'compliance_officer';

export interface VoiceProfile {
  character_id: VoiceCharacterId;
  display_name: string;
  description: string;
  accent: string;
}

export const VOICE_PROFILES: Record<VoiceCharacterId, VoiceProfile> = {
  narrator:           { character_id: 'narrator',           display_name: 'Narrator',              description: 'Warm, cinematic, slightly amused. The voice of the story itself.', accent: 'amber' },
  malik_carter:       { character_id: 'malik_carter',       display_name: 'Malik Carter',          description: 'Cocky, animated, leans on charm. Cracks under pressure.',           accent: 'orange' },
  micah_carter:       { character_id: 'micah_carter',       display_name: 'Micah Carter',          description: 'Controlled, dry, precise. Same face as Malik, opposite tempo.',     accent: 'sky' },
  denise_carter:      { character_id: 'denise_carter',      display_name: 'Denise Carter',         description: "Mature, warm but sharp. Doesn't raise her voice; doesn't need to.", accent: 'rose' },
  ari:                { character_id: 'ari',                display_name: 'Ariana "Ari" Cole',     description: 'Bright, perceptive, gentle teasing energy.',                        accent: 'pink' },
  dante_reeves:       { character_id: 'dante_reeves',       display_name: 'Dante Reeves',          description: "Low, quiet swagger. Vulnerable when no one's watching.",            accent: 'violet' },
  reggie:             { character_id: 'reggie',             display_name: 'Reggie',                description: 'Loud, hilarious, leans into every joke. Sees more than he lets on.', accent: 'yellow' },
  coach_bridges:      { character_id: 'coach_bridges',      display_name: 'Coach Bridges',         description: 'Gravel-voiced, old school, secretly fair.',                         accent: 'emerald' },
  ms_valentina:       { character_id: 'ms_valentina',       display_name: 'Ms. Valentina',         description: 'Crisp, exacting, theatrical when she wants to be.',                 accent: 'fuchsia' },
  compliance_officer: { character_id: 'compliance_officer', display_name: 'Compliance Officer',    description: 'Calm authority. Long memory. Never raises pace.',                   accent: 'slate' },
};

export function toVoiceId(appCharacterId?: string | null): VoiceCharacterId {
  if (!appCharacterId) return 'narrator';
  const norm = appCharacterId.replace(/-/g, '_');
  if (norm in VOICE_PROFILES) return norm as VoiceCharacterId;
  return 'narrator';
}

// -- Settings storage --------------------------------------------------------

const KEY = 'trey_voice_settings_v1';

export interface VoiceSettings {
  muted: boolean;
  autoplay: boolean;
}

export function loadVoiceSettings(): VoiceSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { muted: false, autoplay: true };
}

export function saveVoiceSettings(s: VoiceSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

// -- Audio playback ----------------------------------------------------------

let currentAudio: HTMLAudioElement | null = null;
let currentUrl: string | null = null;
let playbackGeneration = 0;
let activePlaybackToken: string | null = null;
const audioCache = new Map<string, string>();

export interface VoiceQueueLine {
  playthrough_id?: string | null;
  scene_id: string;
  beat_id?: string;
  line_id: string;
  character_id: VoiceCharacterId;
  voice_key?: string;
  lineIndex: number;
  text: string;
  audio_url?: string;
  status?: 'queued' | 'loading' | 'playing' | 'finished' | 'skipped' | 'cancelled';
}

function cacheKey(characterId: VoiceCharacterId, text: string) {
  return `${characterId}::${text.trim().toLowerCase().slice(0, 240)}`;
}

function debugVoice(event: string, payload: Record<string, unknown>) {
  try {
    if (localStorage.getItem('trey_voice_debug') !== '1') return;
    // Hidden debug log: turn on with localStorage.setItem('trey_voice_debug','1')
    console.info(`[VoicePlaybackManager] ${event}`, payload);
  } catch {}
}

export function stopVoice() {
  playbackGeneration += 1;
  activePlaybackToken = null;
  if (currentAudio) {
    try { currentAudio.pause(); currentAudio.currentTime = 0; } catch {}
    currentAudio = null;
  }
  currentUrl = null;
  debugVoice('stop', { playbackGeneration });
}

export function createPlaybackToken(sceneId: string = 'scene'): string {
  playbackGeneration += 1;
  activePlaybackToken = `${sceneId}_${Date.now()}_${playbackGeneration}`;
  return activePlaybackToken;
}

export function isCurrentPlaybackToken(token?: string | null) {
  return !!token && token === activePlaybackToken;
}

export async function generateVoiceLine(
  characterId: VoiceCharacterId,
  text: string
): Promise<string> {
  const key = cacheKey(characterId, text);
  if (audioCache.has(key)) return audioCache.get(key)!;

  // Use raw fetch (binary response â€” supabase.functions.invoke would JSON-parse).
  const { data: { session } } = await supabase.auth.getSession();
  const sb = supabase as unknown as { supabaseUrl: string; supabaseKey: string };
  const token = session?.access_token || sb.supabaseKey;

  const resp = await fetch(`${sb.supabaseUrl}/functions/v1/character-voice-line`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: sb.supabaseKey,
    },
    body: JSON.stringify({ text, character_id: characterId }),
  });
  if (!resp.ok) throw new Error(`Voice request failed: ${resp.status}`);
  const blob = await resp.blob();
  const url = URL.createObjectURL(blob);
  audioCache.set(key, url);
  return url;
}

export async function playVoiceLine(
  characterId: VoiceCharacterId,
  text: string,
  opts: {
    muted?: boolean;
    onEnded?: () => void;
    onError?: (e: unknown) => void;
    playbackToken?: string;
    sceneId?: string;
    lineIndex?: number;
  } = {}
): Promise<HTMLAudioElement | null> {
  const token = opts.playbackToken || createPlaybackToken(opts.sceneId || 'single-line');
  const generationAtStart = playbackGeneration;

  // Clean any currently playing line, but keep this token active.
  if (currentAudio) {
    try { currentAudio.pause(); currentAudio.currentTime = 0; } catch {}
    currentAudio = null;
  }
  currentUrl = null;
  activePlaybackToken = token;

  if (opts.muted) {
    debugVoice('muted-skip', { characterId, token, lineIndex: opts.lineIndex });
    return null;
  }

  try {
    debugVoice('loading', { characterId, token, lineIndex: opts.lineIndex, text: text.slice(0, 80) });
    const url = await generateVoiceLine(characterId, text);

    // Async/race-condition guard: stale voice requests never get to speak.
    if (generationAtStart !== playbackGeneration || !isCurrentPlaybackToken(token)) {
      debugVoice('stale-blocked', { characterId, token, activePlaybackToken, generationAtStart, playbackGeneration });
      return null;
    }

    const audio = new Audio(url);
    currentAudio = audio;
    currentUrl = url;
    audio.addEventListener('ended', () => {
      if (currentAudio === audio && isCurrentPlaybackToken(token)) {
        currentAudio = null;
        debugVoice('finished', { characterId, token, lineIndex: opts.lineIndex });
        opts.onEnded?.();
      }
    });
    audio.addEventListener('error', (e) => {
      if (isCurrentPlaybackToken(token)) opts.onError?.(e);
    });
    debugVoice('playing', { characterId, token, lineIndex: opts.lineIndex, url: currentUrl });
    await audio.play();
    return audio;
  } catch (e) {
    if (isCurrentPlaybackToken(token)) opts.onError?.(e);
    return null;
  }
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
  }
) {
  const token = createPlaybackToken(opts.sceneId);
  const ordered = [...lines].sort((a, b) => a.lineIndex - b.lineIndex);

  for (const line of ordered) {
    if (!isCurrentPlaybackToken(token)) return;
    opts.onLineStart?.({ ...line, status: 'playing' });
    await new Promise<void>((resolve) => {
      playVoiceLine(line.character_id, line.text, {
        muted: opts.muted,
        playbackToken: token,
        sceneId: opts.sceneId,
        lineIndex: line.lineIndex,
        onEnded: () => {
          opts.onLineEnd?.({ ...line, status: 'finished' });
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

