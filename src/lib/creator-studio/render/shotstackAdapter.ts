/**
 * shotstackAdapter — translate our neutral EditRecipe into Shotstack's
 * timeline→tracks→clips edit JSON. Pure (no env, no network) so it can be
 * unit-tested and reused by the server render fns.
 *
 * Only this file (plus shotstack.server.ts) knows Shotstack exists; the editor
 * speaks EditRecipe and never sees a vendor schema. Swapping providers later is
 * a new adapter, not an editor rewrite.
 */
import {
  clipLength,
  type EditRecipe,
  type Clip,
  type TrackKind,
  type TransitionType,
  type FilterType,
  type EffectType,
  type Resolution,
} from "../editRecipe";

// Shotstack renders tracks top-first (track[0] is above track[1]). Our recipe's
// base video is the bottom layer, so we emit non-video layers first, video last.
const SHOTSTACK_TRACK_ORDER: TrackKind[] = ["caption", "text", "overlay", "audio", "video"];

const SAFE_FONT = "Montserrat ExtraBold"; // a built-in Shotstack font

function transition(t: TransitionType): string | undefined {
  switch (t) {
    case "fade":
      return "fade";
    case "slideLeft":
      return "slideLeft";
    case "slideRight":
      return "slideRight";
    case "wipeLeft":
      return "wipeLeft";
    case "wipeRight":
      return "wipeRight";
    case "zoom":
      return "zoom";
    case "carouselLeft":
      return "carouselLeft";
    default:
      return undefined; // "none"
  }
}

function filter(f: FilterType): string | undefined {
  return f === "none" ? undefined : f; // our names match Shotstack's filter set
}

function effect(effects: EffectType[]): string | undefined {
  const e = effects[0];
  if (!e) return undefined;
  // Shotstack supports zoomIn/zoomOut/slideUp/slideDown/slideLeft/slideRight.
  if (e === "shake") return undefined; // no native equivalent
  return e;
}

function resolutionToSize(r: Resolution): { width: number; height: number } {
  switch (r) {
    case "720p":
      return { width: 1280, height: 720 };
    case "4K":
      return { width: 3840, height: 2160 };
    case "1080p":
    case "AI UHD":
    default:
      return { width: 1920, height: 1080 };
  }
}

// Normalized (0..1, origin top-left) → Shotstack offset (-1..1 from center, +y up).
const toOffset = (x: number, y: number) => ({
  x: Math.round((x - 0.5) * 2 * 1000) / 1000,
  y: Math.round((0.5 - y) * 2 * 1000) / 1000,
});

function clipToShotstack(clip: Clip, srcUrl: string): Record<string, unknown> | null {
  const base: Record<string, unknown> = {
    start: clip.start,
    length: clipLength(clip),
  };
  const tIn = transition(clip.transitionIn);
  const tOut = transition(clip.transitionOut);
  if (tIn || tOut)
    base.transition = { ...(tIn ? { in: tIn } : {}), ...(tOut ? { out: tOut } : {}) };
  const fl = filter(clip.filter);
  if (fl) base.filter = fl;
  const ef = effect(clip.effects);
  if (ef) base.effect = ef;
  if (clip.opacity !== 1) base.opacity = clip.opacity;

  switch (clip.kind) {
    case "video":
      return {
        ...base,
        asset: { type: "video", src: srcUrl, trim: clip.trimIn, volume: 1, speed: clip.speed },
      };
    case "text":
      return {
        ...base,
        asset: {
          type: "text",
          text: clip.text,
          font: { family: SAFE_FONT, color: clip.color, size: clip.size },
          alignment: { horizontal: "center", vertical: "center" },
          ...(clip.background ? { background: { color: clip.background, padding: 12 } } : {}),
        },
        position: "center",
        offset: toOffset(clip.x, clip.y),
      };
    case "overlay":
      return {
        ...base,
        asset: { type: "image", src: clip.src },
        fit: clip.fit === "cover" ? "cover" : clip.fit === "none" ? "none" : "contain",
        scale: clip.scale,
        position: "center",
        offset: toOffset(clip.x, clip.y),
      };
    case "audio":
      return {
        ...base,
        asset: { type: "audio", src: clip.src, trim: clip.trimIn, volume: clip.volume },
      };
    case "caption":
      return {
        ...base,
        asset: {
          type: "text",
          text: clip.text,
          font: { family: SAFE_FONT, color: "#ffffff", size: 36 },
          alignment: { horizontal: "center", vertical: "bottom" },
          background: { color: "#000000", opacity: 0.5, padding: 10 },
        },
        position: "bottom",
      };
    default:
      return null;
  }
}

export interface ShotstackEdit {
  timeline: { background: string; tracks: { clips: Record<string, unknown>[] }[] };
  output: { format: "mp4"; size: { width: number; height: number }; fps: number };
  callback?: string;
}

export function recipeToShotstack(
  recipe: EditRecipe,
  opts?: { callbackUrl?: string },
): ShotstackEdit {
  const srcUrl = recipe.source.srcUrl;
  const tracks: { clips: Record<string, unknown>[] }[] = [];

  for (const kind of SHOTSTACK_TRACK_ORDER) {
    const track = recipe.tracks.find((t) => t.kind === kind);
    if (!track || track.clips.length === 0) continue;
    const clips = track.clips
      .map((c) => clipToShotstack(c, srcUrl))
      .filter((c): c is Record<string, unknown> => c !== null);
    if (clips.length) tracks.push({ clips });
  }

  return {
    timeline: { background: "#000000", tracks },
    output: { format: "mp4", size: resolutionToSize(recipe.output.resolution), fps: 30 },
    ...(opts?.callbackUrl ? { callback: opts.callbackUrl } : {}),
  };
}
