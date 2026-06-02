/**
 * EditRecipe — the non-destructive source of truth for the Creator Edit Studio.
 *
 * The editor never touches pixels. Every action (split, trim, speed, transition,
 * effect, filter, text, overlay, audio, caption) is a pure mutation of this JSON
 * object. The heavy render happens once, in the cloud, via the RenderProvider
 * adapter (Shotstack) — see render/ and render.server.ts.
 *
 * All mutators are pure: they return a new EditRecipe and never mutate the input,
 * which is what makes undo/redo a trivial history stack.
 */

export type Resolution = "720p" | "1080p" | "4K" | "AI UHD";
export type TrackKind = "video" | "overlay" | "text" | "audio" | "caption";

export type TransitionType =
  | "none" | "fade" | "slideLeft" | "slideRight" | "wipeLeft" | "wipeRight" | "zoom" | "carouselLeft";
export type FilterType =
  | "none" | "boost" | "contrast" | "muted" | "darken" | "lighten" | "greyscale";
export type EffectType = "zoomIn" | "zoomOut" | "slideUp" | "slideDown" | "shake";
export type TextAnimation = "none" | "fadeIn" | "slideUp" | "pop";

export interface ClipBase {
  id: string;
  /** Position on the timeline, in seconds. */
  start: number;
  transitionIn: TransitionType;
  transitionOut: TransitionType;
  effects: EffectType[];
  filter: FilterType;
  /** 0..1 */
  opacity: number;
}

export interface VideoClip extends ClipBase {
  kind: "video";
  /** Source in-point (s). */
  trimIn: number;
  /** Source out-point (s); trimOut > trimIn. */
  trimOut: number;
  /** Playback rate (>0). 2 = 2x faster, 0.5 = half speed. */
  speed: number;
}

export interface OverlayClip extends ClipBase {
  kind: "overlay";
  src: string;
  /** Timeline duration (s). */
  length: number;
  fit: "cover" | "contain" | "none";
  /** Normalized position (0..1) and scale multiplier. */
  x: number; y: number; scale: number;
}

export interface TextClip extends ClipBase {
  kind: "text";
  text: string;
  length: number;
  font: string; size: number; color: string; background: string | null;
  x: number; y: number;
  animation: TextAnimation;
}

export interface AudioClip extends ClipBase {
  kind: "audio";
  src: string;
  trimIn: number;
  length: number;
  /** 0..1 */
  volume: number;
  fadeIn: number; fadeOut: number;
}

export interface CaptionClip extends ClipBase {
  kind: "caption";
  text: string;
  length: number;
}

export type Clip = VideoClip | OverlayClip | TextClip | AudioClip | CaptionClip;

export interface Track {
  id: string;
  kind: TrackKind;
  clips: Clip[];
}

export interface RecipeSource {
  streamUid: string | null;
  srcUrl: string;
  width: number;
  height: number;
  fps: number;
  /** Full source duration (s). */
  duration: number;
}

export interface RecipeOutput {
  resolution: Resolution;
  format: "mp4";
}

export interface EditRecipe {
  version: 1;
  source: RecipeSource;
  output: RecipeOutput;
  tracks: Track[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

export const uid = (): string =>
  (globalThis.crypto?.randomUUID?.() ?? `id_${Math.random().toString(36).slice(2)}_${Date.now()}`);

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const round = (v: number) => Math.round(v * 1000) / 1000;

/** Timeline duration a clip occupies, in seconds. */
export function clipLength(clip: Clip): number {
  if (clip.kind === "video") return round((clip.trimOut - clip.trimIn) / clip.speed);
  return clip.length;
}

/** Timeline end position of a clip, in seconds. */
export function clipEnd(clip: Clip): number {
  return round(clip.start + clipLength(clip));
}

export function findClip(recipe: EditRecipe, clipId: string): { track: Track; clip: Clip } | null {
  for (const track of recipe.tracks) {
    const clip = track.clips.find((c) => c.id === clipId);
    if (clip) return { track, clip };
  }
  return null;
}

const SPEED_MIN = 0.25;
const SPEED_MAX = 4;

const baseClipDefaults = (): Omit<ClipBase, "id" | "start"> => ({
  transitionIn: "none",
  transitionOut: "none",
  effects: [],
  filter: "none",
  opacity: 1,
});

/** Replace one clip (matched by id) by mapping it; returns a new recipe. */
function mapClip(recipe: EditRecipe, clipId: string, fn: (clip: Clip) => Clip): EditRecipe {
  let changed = false;
  const tracks = recipe.tracks.map((track) => {
    if (!track.clips.some((c) => c.id === clipId)) return track;
    changed = true;
    return { ...track, clips: track.clips.map((c) => (c.id === clipId ? fn(c) : c)) };
  });
  return changed ? { ...recipe, tracks } : recipe;
}

function ensureTrack(recipe: EditRecipe, kind: TrackKind): { recipe: EditRecipe; track: Track } {
  const existing = recipe.tracks.find((t) => t.kind === kind);
  if (existing) return { recipe, track: existing };
  const track: Track = { id: uid(), kind, clips: [] };
  return { recipe: { ...recipe, tracks: [...recipe.tracks, track] }, track };
}

// ── Construction ────────────────────────────────────────────────────────────

export function createRecipe(source: RecipeSource, output?: Partial<RecipeOutput>): EditRecipe {
  const baseClip: VideoClip = {
    ...baseClipDefaults(),
    id: uid(),
    kind: "video",
    start: 0,
    trimIn: 0,
    trimOut: round(source.duration),
    speed: 1,
  };
  return {
    version: 1,
    source,
    output: { resolution: output?.resolution ?? "AI UHD", format: "mp4" },
    tracks: [{ id: uid(), kind: "video", clips: [baseClip] }],
  };
}

// ── Cut operations ──────────────────────────────────────────────────────────

/**
 * Split a clip at an absolute timeline position. The cut point must fall strictly
 * inside the clip; otherwise it's a no-op. The two halves stay contiguous.
 */
export function splitClip(recipe: EditRecipe, clipId: string, atTimelineSec: number): EditRecipe {
  const found = findClip(recipe, clipId);
  if (!found) return recipe;
  const { track, clip } = found;

  const local = round(atTimelineSec - clip.start);
  const len = clipLength(clip);
  if (local <= 0 || local >= len) return recipe; // cut outside the clip

  let first: Clip;
  let second: Clip;

  if (clip.kind === "video") {
    const sourceCut = round(clip.trimIn + local * clip.speed);
    first = { ...clip, trimOut: sourceCut, transitionOut: "none" };
    second = {
      ...clip,
      id: uid(),
      start: round(clip.start + local),
      trimIn: sourceCut,
      transitionIn: "none",
    };
  } else {
    first = { ...clip, length: local, transitionOut: "none" } as Clip;
    second = {
      ...clip,
      id: uid(),
      start: round(clip.start + local),
      length: round(len - local),
      transitionIn: "none",
    } as Clip;
  }

  const clips: Clip[] = [];
  for (const c of track.clips) {
    if (c.id === clipId) clips.push(first, second);
    else clips.push(c);
  }
  return { ...recipe, tracks: recipe.tracks.map((t) => (t.id === track.id ? { ...t, clips } : t)) };
}

/** Adjust a video clip's source in/out points (trim). Timeline length follows. */
export function trimClip(
  recipe: EditRecipe,
  clipId: string,
  patch: { trimIn?: number; trimOut?: number },
): EditRecipe {
  return mapClip(recipe, clipId, (clip) => {
    if (clip.kind !== "video") return clip;
    const maxOut = recipe.source.duration;
    let trimIn = patch.trimIn !== undefined ? clamp(patch.trimIn, 0, maxOut) : clip.trimIn;
    let trimOut = patch.trimOut !== undefined ? clamp(patch.trimOut, 0, maxOut) : clip.trimOut;
    // keep at least 0.05s of source and a valid ordering
    if (trimOut - trimIn < 0.05) {
      if (patch.trimOut !== undefined) trimOut = round(trimIn + 0.05);
      else trimIn = round(trimOut - 0.05);
    }
    return { ...clip, trimIn: round(trimIn), trimOut: round(trimOut) };
  });
}

/** Set playback speed on a video clip. Timeline length follows automatically. */
export function setSpeed(recipe: EditRecipe, clipId: string, speed: number): EditRecipe {
  return mapClip(recipe, clipId, (clip) =>
    clip.kind === "video" ? { ...clip, speed: clamp(speed, SPEED_MIN, SPEED_MAX) } : clip,
  );
}

// ── Look operations ─────────────────────────────────────────────────────────

export function setTransition(
  recipe: EditRecipe,
  clipId: string,
  side: "in" | "out",
  type: TransitionType,
): EditRecipe {
  return mapClip(recipe, clipId, (clip) =>
    side === "in" ? { ...clip, transitionIn: type } : { ...clip, transitionOut: type },
  );
}

export function setFilter(recipe: EditRecipe, clipId: string, filter: FilterType): EditRecipe {
  return mapClip(recipe, clipId, (clip) => ({ ...clip, filter }));
}

export function toggleEffect(recipe: EditRecipe, clipId: string, effect: EffectType): EditRecipe {
  return mapClip(recipe, clipId, (clip) => {
    const has = clip.effects.includes(effect);
    return { ...clip, effects: has ? clip.effects.filter((e) => e !== effect) : [...clip.effects, effect] };
  });
}

export function setOpacity(recipe: EditRecipe, clipId: string, opacity: number): EditRecipe {
  return mapClip(recipe, clipId, (clip) => ({ ...clip, opacity: clamp(opacity, 0, 1) }));
}

// ── Add clips to non-video tracks ───────────────────────────────────────────

export function addTextClip(
  recipe: EditRecipe,
  init: { text: string; start?: number; length?: number } & Partial<Omit<TextClip, "kind" | "id">>,
): EditRecipe {
  const { recipe: r, track } = ensureTrack(recipe, "text");
  const clip: TextClip = {
    ...baseClipDefaults(),
    id: uid(),
    kind: "text",
    start: init.start ?? 0,
    length: init.length ?? 3,
    text: init.text,
    font: init.font ?? "Trey TV Sans",
    size: init.size ?? 48,
    color: init.color ?? "#FFFFFF",
    background: init.background ?? null,
    x: init.x ?? 0.5,
    y: init.y ?? 0.85,
    animation: init.animation ?? "fadeIn",
  };
  return { ...r, tracks: r.tracks.map((t) => (t.id === track.id ? { ...t, clips: [...t.clips, clip] } : t)) };
}

export function addOverlayClip(
  recipe: EditRecipe,
  init: { src: string; start?: number; length?: number } & Partial<Omit<OverlayClip, "kind" | "id">>,
): EditRecipe {
  const { recipe: r, track } = ensureTrack(recipe, "overlay");
  const clip: OverlayClip = {
    ...baseClipDefaults(),
    id: uid(),
    kind: "overlay",
    start: init.start ?? 0,
    length: init.length ?? 3,
    src: init.src,
    fit: init.fit ?? "contain",
    x: init.x ?? 0.5,
    y: init.y ?? 0.5,
    scale: init.scale ?? 1,
  };
  return { ...r, tracks: r.tracks.map((t) => (t.id === track.id ? { ...t, clips: [...t.clips, clip] } : t)) };
}

export function addAudioClip(
  recipe: EditRecipe,
  init: { src: string; start?: number; length?: number } & Partial<Omit<AudioClip, "kind" | "id">>,
): EditRecipe {
  const { recipe: r, track } = ensureTrack(recipe, "audio");
  const clip: AudioClip = {
    ...baseClipDefaults(),
    id: uid(),
    kind: "audio",
    start: init.start ?? 0,
    length: init.length ?? 10,
    src: init.src,
    trimIn: init.trimIn ?? 0,
    volume: init.volume ?? 0.8,
    fadeIn: init.fadeIn ?? 0,
    fadeOut: init.fadeOut ?? 0,
  };
  return { ...r, tracks: r.tracks.map((t) => (t.id === track.id ? { ...t, clips: [...t.clips, clip] } : t)) };
}

export function addCaptionClip(
  recipe: EditRecipe,
  init: { text: string; start?: number; length?: number },
): EditRecipe {
  const { recipe: r, track } = ensureTrack(recipe, "caption");
  const clip: CaptionClip = {
    ...baseClipDefaults(),
    id: uid(),
    kind: "caption",
    start: init.start ?? 0,
    length: init.length ?? 3,
    text: init.text,
  };
  return { ...r, tracks: r.tracks.map((t) => (t.id === track.id ? { ...t, clips: [...t.clips, clip] } : t)) };
}

// ── List operations ─────────────────────────────────────────────────────────

export function deleteClip(recipe: EditRecipe, clipId: string): EditRecipe {
  let changed = false;
  const tracks = recipe.tracks.map((track) => {
    if (!track.clips.some((c) => c.id === clipId)) return track;
    changed = true;
    return { ...track, clips: track.clips.filter((c) => c.id !== clipId) };
  });
  return changed ? { ...recipe, tracks } : recipe;
}

export function moveClip(recipe: EditRecipe, clipId: string, newStart: number): EditRecipe {
  return mapClip(recipe, clipId, (clip) => ({ ...clip, start: round(Math.max(0, newStart)) }));
}

/** Recompute a track's clip starts so they are contiguous from 0 (gapless ripple). */
export function rippleTrack(recipe: EditRecipe, trackId: string): EditRecipe {
  const track = recipe.tracks.find((t) => t.id === trackId);
  if (!track) return recipe;
  let cursor = 0;
  const clips = track.clips.map((clip) => {
    const next = { ...clip, start: round(cursor) };
    cursor = round(cursor + clipLength(clip));
    return next;
  });
  return { ...recipe, tracks: recipe.tracks.map((t) => (t.id === trackId ? { ...t, clips } : t)) };
}

/** Total timeline duration across all tracks (s). */
export function recipeDuration(recipe: EditRecipe): number {
  let max = 0;
  for (const track of recipe.tracks) {
    for (const clip of track.clips) max = Math.max(max, clipEnd(clip));
  }
  return round(max);
}
