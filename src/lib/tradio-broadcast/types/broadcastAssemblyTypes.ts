export type AssemblyStatus = "queued" | "assembling" | "completed" | "failed" | "canceled";
export type AssemblyType = "preview" | "review" | "final_candidate";

export interface TimelineManifestItem {
  block_id: string;
  block_type: string;
  title: string;
  sort_order: number;
  source_audio_url?: string | null;
  source_storage_path?: string | null;
  script_text?: string | null;
  duration_seconds: number;
  start_time_seconds: number;
  end_time_seconds: number;
  fade_in_seconds: number;
  fade_out_seconds: number;
  volume_level: number;
  rights_status: string;
  approval_status: string;
  metadata: Record<string, any>;
}

export interface TimelineManifest {
  episode_id: string;
  show_id: string;
  block_count: number;
  total_duration_seconds: number;
  items: TimelineManifestItem[];
}

export interface RenderSettings {
  output_format: "mp3" | "wav";
  target_loudness_lufs?: number | null; // e.g. -16 LUFS
  crossfade_seconds?: number | null;
  normalize_voice_clips?: boolean;
  include_draft_watermark?: boolean;
  silence_between_blocks_seconds?: number | null;
  use_block_fade_settings?: boolean;
}

export interface EpisodeAssembly {
  id: string;
  owner_user_id: string;
  show_id: string;
  episode_id: string;
  assembly_status: AssemblyStatus;
  assembly_type: AssemblyType;
  output_audio_url?: string | null;
  output_storage_path?: string | null;
  mime_type: string;
  duration_seconds?: number | null;
  sample_rate?: number | null;
  loudness_lufs?: number | null;
  peak_db?: number | null;
  block_count: number;
  source_manifest: TimelineManifest;
  render_settings: RenderSettings;
  render_error?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimelineValidationResult {
  ready: boolean;
  validation_state: "draft-ready" | "script-ready" | "voice-ready" | "timeline-preview-ready" | "review-ready" | "publish-ready";
  warnings: string[];
  missing_audio_blocks: string[];
  rights_issue_blocks: string[];
}
