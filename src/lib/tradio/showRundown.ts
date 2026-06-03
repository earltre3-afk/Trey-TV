export interface RundownSegment {
  duration: number; // seconds
}

/** Start offset (seconds from show start) for each segment. */
export function cumulativeStarts(segments: RundownSegment[]): number[] {
  const out: number[] = [];
  let acc = 0;
  for (const s of segments) {
    out.push(acc);
    acc += s.duration;
  }
  return out;
}

/** True when the current segment has run its full duration and a next segment exists. */
export function shouldAdvance(input: {
  segments: RundownSegment[];
  currentIndex: number;
  elapsedInSegment: number;
}): boolean {
  const { segments, currentIndex, elapsedInSegment } = input;
  if (currentIndex >= segments.length - 1) return false;
  return elapsedInSegment >= segments[currentIndex].duration;
}

export type PacingStatus = "on-time" | "behind" | "ahead";

/**
 * Compare wall-clock elapsed against the planned elapsed (start of current segment
 * plus time spent in it). Positive delta = behind schedule, negative = ahead.
 */
export function pacingState(input: {
  segments: RundownSegment[];
  currentIndex: number;
  elapsedInSegment: number;
  wallElapsed: number;
}): { status: PacingStatus; deltaSeconds: number } {
  const starts = cumulativeStarts(input.segments);
  const plannedElapsed = (starts[input.currentIndex] ?? 0) + input.elapsedInSegment;
  const delta = Math.round(input.wallElapsed - plannedElapsed);
  const status: PacingStatus = delta > 5 ? "behind" : delta < -5 ? "ahead" : "on-time";
  return { status, deltaSeconds: delta };
}
