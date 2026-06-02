/**
 * previewFromRecipe — given a recipe and a playhead time, compute what is
 * visible/audible right now. Drives the in-editor approximate preview; the
 * Shotstack render remains authoritative.
 */
import {
  clipLength,
  type EditRecipe,
  type VideoClip,
  type TextClip,
  type OverlayClip,
  type AudioClip,
  type CaptionClip,
} from "./editRecipe";

export interface ActivePreview {
  /** Base video clip under the playhead + the source time to display. */
  video: { clip: VideoClip; sourceTime: number } | null;
  texts: TextClip[];
  overlays: OverlayClip[];
  captions: CaptionClip[];
  audios: { clip: AudioClip; sourceTime: number }[];
}

const within = (start: number, len: number, t: number) => t >= start && t < start + len;

export function previewFromRecipe(recipe: EditRecipe, t: number): ActivePreview {
  const out: ActivePreview = { video: null, texts: [], overlays: [], captions: [], audios: [] };

  for (const track of recipe.tracks) {
    for (const clip of track.clips) {
      const len = clipLength(clip);
      if (!within(clip.start, len, t)) continue;
      const local = t - clip.start;

      switch (clip.kind) {
        case "video":
          // top-most video clip wins (later tracks render above earlier ones)
          out.video = { clip, sourceTime: clip.trimIn + local * clip.speed };
          break;
        case "text":
          out.texts.push(clip);
          break;
        case "overlay":
          out.overlays.push(clip);
          break;
        case "caption":
          out.captions.push(clip);
          break;
        case "audio":
          out.audios.push({ clip, sourceTime: clip.trimIn + local });
          break;
      }
    }
  }
  return out;
}

/** Map a recipe filter to an approximate CSS `filter` string for the preview. */
export function filterToCss(filter: string): string {
  switch (filter) {
    case "boost":
      return "saturate(1.4) contrast(1.1)";
    case "contrast":
      return "contrast(1.3)";
    case "muted":
      return "saturate(0.6)";
    case "darken":
      return "brightness(0.8)";
    case "lighten":
      return "brightness(1.2)";
    case "greyscale":
      return "grayscale(1)";
    default:
      return "none";
  }
}
