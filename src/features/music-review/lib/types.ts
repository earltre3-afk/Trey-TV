export type SubmissionStatus =
  | "pending"
  | "ai_prechecked"
  | "in_queue"
  | "now_playing"
  | "under_review"
  | "review_complete"
  | "needs_revision"
  | "rejected";

export interface Submission {
  id: string;
  user_id: string;
  user_email?: string | null;
  song_title: string;
  artist_name: string;
  genre?: string | null;
  mood?: string | null;
  explicit?: boolean;
  note_to_reviewer?: string | null;
  audio_storage_path?: string | null;
  cover_art_storage_path?: string | null;
  audio_duration?: number | null;
  file_size?: number | null;
  status: SubmissionStatus;
  queue_position?: number | null;
  priority_tier?: string | null;
  priority_paid?: boolean;
  payment_reference?: string | null;
  ai_precheck_score?: number | null;
  ai_precheck_json?: any;
  admin_notes?: string | null;
  created_at: string;
  submitted_at?: string | null;
  reviewed_at?: string | null;
}

export interface ReviewScore {
  id: string;
  submission_id: string;
  user_id: string;
  song_title?: string;
  artist_name?: string;
  overall_score: number;
  vocals_score: number;
  lyrics_score: number;
  mix_score: number;
  originality_score: number;
  hit_potential_score: number;
  replay_value_score: number;
  marketability_score: number;
  written_summary?: string;
  strengths_json?: string[];
  improvements_json?: string[];
  public_visible: boolean;
  created_at: string;
}

export interface OpenMicItem {
  id: string;
  user_id: string;
  user_name?: string;
  song_title: string;
  artist_name?: string;
  audio_storage_path?: string;
  cover_art_storage_path?: string;
  audio_duration?: number;
  queue_position?: number;
  status: "queued" | "playing" | "played" | "skipped" | "removed";
  submitted_at: string;
  started_at?: string;
  ended_at?: string;
  storage_deleted?: boolean;
  cleanup_failed?: boolean;
}

export interface AIPrecheck {
  total_score: number;
  categories: {
    vocal_performance: number;
    songwriting: number;
    mix_quality: number;
    originality: number;
    hit_potential: number;
    replay_value: number;
    overall_readiness: number;
  };
  confidence_level: "Low" | "Medium" | "High";
  confidence_pct: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendation: string;
}

export interface ChatComment {
  id: string;
  room_type: "live" | "open_mic";
  submission_id?: string;
  open_mic_item_id?: string;
  user_id?: string;
  user_name?: string;
  body: string;
  is_ai_labeled?: boolean;
  is_admin?: boolean;
  is_hidden?: boolean;
  created_at: string;
}

export const PRIORITY_TIERS = [
  { id: "quick", label: "Quick Pass", price: 5, weight: 10, badge: "POPULAR", accent: "#FFC857" },
  { id: "hot", label: "Hot Seat", price: 10, weight: 50, badge: "", accent: "#A855F7" },
  {
    id: "front",
    label: "Front of Line",
    price: 15,
    weight: 100,
    badge: "BEST VALUE",
    accent: "#00B7FF",
  },
] as const;
