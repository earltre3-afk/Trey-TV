-- AI-assisted session score provenance. Additive only. Raw per-frame pose
-- landmarks are never stored; only aggregate summary fields live here.
-- (trance_pose_feedback already exists and is RLS-protected owner/admin-only.)
alter table public.trance_session_scores
  add column if not exists ai_confidence numeric,
  add column if not exists tracked_frame_count integer,
  add column if not exists missed_cue_count integer,
  add column if not exists completed_sections integer,
  add column if not exists leaderboard_eligible boolean,
  add column if not exists leaderboard_ineligibility_reason text,
  add column if not exists pose_provider text,
  add column if not exists pose_model_version text,
  add column if not exists camera_quality jsonb,
  add column if not exists feedback_summary jsonb;
