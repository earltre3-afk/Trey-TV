import { supabase } from "@/lib/supabase";
import { shouldUseFixtures } from "./config";
import { gcsAnalyzeStart, gcsAnalyzeStatus } from "@/lib/trance/gcs.server";
import type { ChoreographyAnalysis } from "../types";

const DEFAULT_INTERVAL_MS = 500;
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 100;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const FIXTURE_ANALYSIS: ChoreographyAnalysis = {
  durationMs: 10000,
  sampledFrameCount: 0,
  targetTimeline: [],
  suggestedCountSections: [],
  suggestedDirectionCues: [],
  suggestedMoveHints: [],
  suggested: true,
  poseProvider: "fixture",
  poseModelVersion: "fixture-v0",
};

export const tranceVideoAnalyzerService = {
  analyzeChoreographyVideo: async (input: {
    gcsPath: string;
    jobId: string;
    intervalMs?: number;
  }): Promise<ChoreographyAnalysis> => {
    if (shouldUseFixtures()) {
      await sleep(1500);
      return FIXTURE_ANALYSIS;
    }

    const intervalMs = input.intervalMs ?? DEFAULT_INTERVAL_MS;

    // Trigger Cloud Run (returns 202 immediately; job runs in background).
    await gcsAnalyzeStart({ data: { gcsPath: input.gcsPath, jobId: input.jobId, intervalMs } });

    // Poll GCS results file until done, failed, or timed out.
    for (let i = 0; i < MAX_POLLS; i++) {
      await sleep(POLL_INTERVAL_MS);
      const status = await gcsAnalyzeStatus({ data: { jobId: input.jobId } });
      if (status.status === "done") return (status as any).result as ChoreographyAnalysis;
      if (status.status === "failed") throw new Error((status as any).error ?? "Analysis failed");
    }

    throw new Error("Analysis timed out after 5 minutes.");
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
