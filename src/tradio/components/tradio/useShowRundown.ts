import { useEffect, useRef, useState, useCallback } from 'react';
import { shouldAdvance, pacingState, type PacingStatus } from '@/lib/tradio/showRundown';
import type { ShowSegment } from './data';

export interface ShowRundownState {
  currentIndex: number;
  elapsedInSegment: number;
  remainingInSegment: number;
  pacing: { status: PacingStatus; deltaSeconds: number };
  autoPilot: boolean;
  setAutoPilot: (v: boolean) => void;
  advance: () => void;
  extend: (seconds: number) => void;
}

/**
 * Drives the live show clock: per-segment timers, on-time/behind pacing, and
 * (when autoPilot is on) automatic advance to the next segment when a segment's
 * timer runs out. `onEnterSegment` fires once per segment entry — used to trigger
 * the AI host / surface cues.
 */
export function useShowRundown(opts: {
  segments: ShowSegment[];
  active: boolean;
  onEnterSegment?: (segment: ShowSegment, index: number) => void;
}): ShowRundownState {
  const { segments, active, onEnterSegment } = opts;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsedInSegment, setElapsed] = useState(0);
  const [wallElapsed, setWall] = useState(0);
  const [autoPilot, setAutoPilot] = useState(true);
  const [extra, setExtra] = useState(0); // host-added seconds for the current segment
  const enteredRef = useRef<number>(-1);

  const enterSegment = useCallback((index: number) => {
    setCurrentIndex(index);
    setElapsed(0);
    setExtra(0);
  }, []);

  // Fire onEnterSegment exactly once per segment entry.
  useEffect(() => {
    if (!active) return;
    if (enteredRef.current !== currentIndex) {
      enteredRef.current = currentIndex;
      const seg = segments[currentIndex];
      if (seg) onEnterSegment?.(seg, currentIndex);
    }
  }, [active, currentIndex, segments, onEnterSegment]);

  // 1s tick while live.
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      setElapsed((e) => e + 1);
      setWall((w) => w + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [active]);

  // Auto-advance when the (possibly extended) segment runs out.
  useEffect(() => {
    if (!active || !autoPilot) return;
    const effective = segments.map((s, i) => (i === currentIndex ? { duration: s.duration + extra } : { duration: s.duration }));
    if (shouldAdvance({ segments: effective, currentIndex, elapsedInSegment })) {
      enterSegment(currentIndex + 1);
    }
  }, [active, autoPilot, segments, currentIndex, elapsedInSegment, extra, enterSegment]);

  const curDur = (segments[currentIndex]?.duration ?? 0) + extra;
  const pacing = pacingState({ segments, currentIndex, elapsedInSegment, wallElapsed });

  return {
    currentIndex,
    elapsedInSegment,
    remainingInSegment: Math.max(0, curDur - elapsedInSegment),
    pacing,
    autoPilot,
    setAutoPilot,
    advance: () => enterSegment(Math.min(segments.length - 1, currentIndex + 1)),
    extend: (s) => setExtra((x) => x + s),
  };
}
