export type VoiceRenderStatus = "queued" | "rendering" | "completed" | "failed" | "canceled";

export interface VoiceRenderInput {
  script_text: string;
  voice_provider: "elevenlabs" | "openai" | "gemini" | "internal" | "manual_upload";
  provider_voice_id?: string | null;
  provider_model?: string | null;
  voice_name?: string | null;
  style_mode?: string | null; // e.g. Late-night smooth, DJ hype, etc.
  pacing?: number | null; // Speed of delivery
  energy?: number | null; // Energy level
  emotional_tone?: string | null; // e.g. smooth, hype, intimate, etc.
  pronunciation_notes?: string | null;
  show_id?: string | null;
  episode_id?: string | null;
  block_id?: string | null;
  script_id?: string | null;
  station_drop_id?: string | null;
  ad_slot_id?: string | null;
  owner_user_id?: string | null;
}

export interface VoiceRenderResult {
  id: string;
  audio_url?: string | null;
  storage_path?: string | null;
  duration_seconds?: number | null;
  mime_type: string;
  render_status: VoiceRenderStatus;
  render_error?: string | null;
  usage_metadata: Record<string, any>;
  metadata: Record<string, any>;
}

export interface VoiceProfile {
  id: string;
  name: string;
  provider: "elevenlabs" | "openai" | "gemini" | "internal" | "manual_upload";
  gender: "male" | "female" | "neutral";
  description?: string;
}
