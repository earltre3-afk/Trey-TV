import type { RadioShow, ShowSegment } from "./data";

const TALK_TYPES: ShowSegment["type"][] = [
  "intro",
  "host-talk",
  "closing",
  "producer-spotlight",
  "artist-premiere",
];

/** Talk segments that carry a non-empty host script — the ones the AI voice can read. */
export function talkSegmentsWithScript(show: RadioShow | null | undefined): ShowSegment[] {
  if (!show?.segments) return [];
  return show.segments.filter(
    (s) =>
      TALK_TYPES.includes(s.type) && typeof s.script === "string" && s.script.trim().length > 0,
  );
}
