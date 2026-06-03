import { supabase } from "@/lib/supabase";
import { assertConfigured, shouldUseFixtures } from "./config";

export type TranceAnalyticsEvent =
  | "routine_viewed"
  | "routine_started"
  | "learn_mode_started"
  | "practice_mode_started"
  | "performance_mode_started"
  | "session_completed"
  | "session_failed"
  | "routine_saved"
  | "badge_awarded"
  | "leaderboard_submitted"
  | "studio_room_opened"
  | "rehearsal_assignment_completed"
  | "builder_upload_started"
  | "builder_publish_clicked"
  | "AI_feedback_viewed";

export const tranceAnalyticsService = {
  trackEvent: async (
    userId: string,
    eventName: TranceAnalyticsEvent,
    meta?: Record<string, unknown>,
  ): Promise<void> => {
    assertConfigured("AnalyticsService");
    const payload = {
      userId,
      eventName,
      meta: meta || {},
      timestamp: new Date().toISOString(),
      environment: import.meta.env.VITE_TRANCE_ENV || "development",
    };

    console.log("[Analytics Event Triage]", payload);

    if (shouldUseFixtures()) {
      return;
    }

    const { error } = await supabase.from("trance_analytics_events").insert({
      user_id: userId,
      event_name: eventName,
      meta_data: meta || {},
      environment: import.meta.env.VITE_TRANCE_ENV || "development",
    });

    if (error) {
      console.warn("Analytics event dispatch failed:", error);
    }
  },
};
