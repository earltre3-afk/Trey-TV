// TRANCE — Choreographer video analyzer.
//
// Runs MediaPipe Pose Landmarker (IMAGE mode) over a sampled choreographer video
// to produce a target pose timeline and SUGGESTED count sections / direction cues
// / move hints. Output is explicitly `suggested: true` — the choreographer reviews
// and edits in the Builder before publishing. Nothing is auto-published.
import { supabase } from "@/lib/supabase";
import { createPoseLandmarker, mapResultToFrame, POSE_MODEL_VERSION, POSE_PROVIDER_NAME } from "./poseProviders/mediapipeLoader";
import { shouldUseFixtures } from "./config";
import type {
  ChoreographyAnalysis,
  ChoreographyTargetFrame,
  CueDirection,
  PoseBodyPart,
  SuggestedDirectionCue,
  SuggestedMoveHint,
  SuggestedCountSection,
} from "../types";

const DEFAULT_INTERVAL_MS = 500;
const SECTION_MS = 4000; // ~one 8-count at ~120 BPM (suggested; choreographer edits)
const DIR_THRESHOLD = 0.02;

const clock = (ms: number): string => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

function once(el: HTMLMediaElement, event: string, timeoutMs = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      el.removeEventListener(event, ok);
      el.removeEventListener("error", fail);
      clearTimeout(timer);
    };
    const ok = () => {
      cleanup();
      resolve();
    };
    const fail = () => {
      cleanup();
      reject(new Error(`Video failed during "${event}".`));
    };
    const timer = setTimeout(() => {
      cleanup();
      resolve(); // best-effort: don't hang the whole analysis on one seek
    }, timeoutMs);
    el.addEventListener(event, ok, { once: true });
    el.addEventListener("error", fail, { once: true });
  });
}

const avg = (frame: ChoreographyTargetFrame, parts: PoseBodyPart[]) => {
  let x = 0;
  let y = 0;
  let n = 0;
  for (const p of parts) {
    const l = frame.landmarks.find((m) => m.bodyPart === p);
    if (l) {
      x += l.x;
      y += l.y;
      n++;
    }
  }
  return n ? { x: x / n, y: y / n } : null;
};

function classifyDirection(dx: number, dy: number): CueDirection | null {
  if (Math.abs(dx) < DIR_THRESHOLD && Math.abs(dy) < DIR_THRESHOLD) return null;
  if (Math.abs(dx) > Math.abs(dy) * 1.3) return dx > 0 ? "right" : "left";
  if (Math.abs(dy) > Math.abs(dx) * 1.3) return dy < 0 ? "up" : "down";
  if (dy < 0) return dx > 0 ? "up-right" : "up-left";
  return dx > 0 ? "right" : "left";
}

function deriveDirectionCues(timeline: ChoreographyTargetFrame[]): SuggestedDirectionCue[] {
  const cues: SuggestedDirectionCue[] = [];
  const tracked: PoseBodyPart[] = ["left_wrist", "right_wrist", "left_hip", "right_hip"];
  let lastDir: CueDirection | null = null;
  for (let i = 1; i < timeline.length; i++) {
    const a = avg(timeline[i - 1], tracked);
    const b = avg(timeline[i], tracked);
    if (!a || !b) continue;
    const dir = classifyDirection(b.x - a.x, b.y - a.y);
    if (dir && dir !== lastDir) {
      cues.push({ timestamp: clock(timeline[i].timestampMs), direction: dir, facing: dir });
      lastDir = dir;
    }
  }
  return cues.slice(0, 24);
}

function deriveCountSections(durationMs: number): SuggestedCountSection[] {
  const count = Math.max(1, Math.min(16, Math.ceil(durationMs / SECTION_MS)));
  return Array.from({ length: count }, (_, i) => ({
    index: i + 1,
    label: `Section ${i + 1}`,
    counts: "1-8",
  }));
}

function deriveMoveHints(
  sections: SuggestedCountSection[],
  cues: SuggestedDirectionCue[],
): SuggestedMoveHint[] {
  return sections.map((s, i) => {
    const sectionStartMs = i * SECTION_MS;
    const cue = cues.find((c) => clockToMs(c.timestamp) >= sectionStartMs);
    return {
      timestamp: clock(sectionStartMs),
      label: s.label,
      description: cue
        ? `Suggested: lead with a ${cue.direction.replace("-", " ")} movement.`
        : "Suggested: hold the pose and hit on the count.",
    };
  });
}

function clockToMs(c: string): number {
  const [m, s] = c.split(":").map((n) => parseInt(n, 10) || 0);
  return (m * 60 + s) * 1000;
}

export const tranceVideoAnalyzerService = {
  /**
   * Analyze a choreographer video into a suggested target timeline + cues.
   * Throws if AI pose analysis is unavailable on this device.
   */
  analyzeChoreographyVideo: async (input: {
    videoUrl?: string;
    file?: File;
    intervalMs?: number;
    onProgress?: (pct: number) => void;
  }): Promise<ChoreographyAnalysis> => {
    const interval = input.intervalMs ?? DEFAULT_INTERVAL_MS;
    const objectUrl = input.file ? URL.createObjectURL(input.file) : undefined;
    const src = input.videoUrl ?? objectUrl;
    if (!src) throw new Error("No video provided for analysis.");

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.preload = "auto";
    video.src = src;

    const landmarker = await createPoseLandmarker("IMAGE");
    if (!landmarker) {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      throw new Error("AI pose analysis is unavailable on this device/browser.");
    }

    const timeline: ChoreographyTargetFrame[] = [];
    try {
      await once(video, "loadedmetadata");
      const durationMs = (isFinite(video.duration) ? video.duration : 0) * 1000;

      for (let t = 0; t < durationMs; t += interval) {
        video.currentTime = t / 1000;
        await once(video, "seeked");
        if (video.videoWidth === 0) continue;
        let frame = null;
        try {
          frame = mapResultToFrame(landmarker.detect(video), t);
        } catch {
          frame = null;
        }
        if (frame) timeline.push({ timestampMs: t, landmarks: frame.landmarks });
        input.onProgress?.(durationMs ? Math.min(1, t / durationMs) : 1);
      }

      const cues = deriveDirectionCues(timeline);
      const sections = deriveCountSections(durationMs);
      const hints = deriveMoveHints(sections, cues);

      return {
        durationMs,
        sampledFrameCount: timeline.length,
        targetTimeline: timeline,
        suggestedCountSections: sections,
        suggestedDirectionCues: cues,
        suggestedMoveHints: hints,
        suggested: true,
        poseProvider: POSE_PROVIDER_NAME,
        poseModelVersion: POSE_MODEL_VERSION,
      };
    } finally {
      try {
        landmarker.close();
      } catch {
        /* ignore */
      }
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      video.src = "";
    }
  },

  /**
   * Apply AI suggestions to a DRAFT routine for the choreographer to review/edit.
   * Replaces any existing sections/cues/hints on the draft. Does NOT publish —
   * the routine stays a private/pending draft until the choreographer publishes.
   */
  applyAnalysisToDraft: async (routineId: string, analysis: ChoreographyAnalysis): Promise<void> => {
    if (shouldUseFixtures()) {
      console.log("[Dev Mode] Mock apply choreography suggestions to draft:", routineId, analysis);
      return;
    }
    // Clear previous suggestions for an idempotent re-apply.
    await Promise.all([
      supabase.from("trance_count_sections").delete().eq("routine_id", routineId),
      supabase.from("trance_move_hints").delete().eq("routine_id", routineId),
      supabase.from("trance_direction_cues").delete().eq("routine_id", routineId),
    ]);

    if (analysis.suggestedCountSections.length) {
      await supabase.from("trance_count_sections").insert(
        analysis.suggestedCountSections.map((s) => ({
          routine_id: routineId,
          index: s.index,
          label: s.label,
          counts: s.counts,
        })),
      );
    }
    if (analysis.suggestedMoveHints.length) {
      await supabase.from("trance_move_hints").insert(
        analysis.suggestedMoveHints.map((h) => ({
          routine_id: routineId,
          timestamp: h.timestamp,
          label: h.label,
          description: h.description,
        })),
      );
    }
    if (analysis.suggestedDirectionCues.length) {
      await supabase.from("trance_direction_cues").insert(
        analysis.suggestedDirectionCues.map((c) => ({
          routine_id: routineId,
          timestamp: c.timestamp,
          direction: c.direction,
          facing: c.facing,
        })),
      );
    }
  },
};
