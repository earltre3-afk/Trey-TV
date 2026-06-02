import type { LegalRequestType } from "./legalIntakeService";

export type LegalAdminRequestStatus =
  | "new"
  | "open"
  | "pending_review"
  | "needs_more_info"
  | "escalated"
  | "resolved"
  | "rejected"
  | "archived";

export type LegalRequestPriority = "low" | "normal" | "high" | "urgent";

export type LegalRequestCategory =
  | "privacy"
  | "data_rights"
  | "deletion"
  | "copyright"
  | "dmca"
  | "moderation"
  | "safety"
  | "impersonation"
  | "unauthorized_upload"
  | "account"
  | "creator"
  | "general";

export type LegalReviewAction =
  | "created"
  | "opened"
  | "note_added"
  | "status_changed"
  | "needs_more_info"
  | "escalated"
  | "resolved"
  | "rejected"
  | "archived";

export interface LegalAdminRequester {
  name: string;
  email?: string;
  user_id?: string;
  public_profile_uid?: string;
  avatar_url?: string;
}

export interface LegalRequestEvent {
  id: string;
  request_id: string;
  action: LegalReviewAction;
  actor: string;
  note: string;
  created_at: string;
}

export interface LegalAdminRequest {
  id: string;
  category: LegalRequestCategory;
  request_type: LegalRequestType | "privacy_question" | "creator_profile_appeal";
  title: string;
  requester: LegalAdminRequester;
  status: LegalAdminRequestStatus;
  priority: LegalRequestPriority;
  submitted_at: string;
  summary: string;
  details: Record<string, unknown>;
  related_policy?: string;
  related_content_id?: string;
  reviewer_note?: string;
  events: LegalRequestEvent[];
}

export interface LegalDeletionRequest extends LegalAdminRequest {
  category: "deletion";
  confirmation_status: {
    confirmed_delete: boolean;
    acknowledged_retention: boolean;
    identity_verified: boolean;
  };
  retained_records_note: string;
}

export interface LegalDmcaRequest extends LegalAdminRequest {
  category: "dmca" | "copyright" | "unauthorized_upload";
  takedown_status: "not_started" | "review_needed" | "placeholder_only" | "disputed" | "resolved";
  dispute_status?: "none" | "counter_notice_received" | "awaiting_review" | "placeholder_only";
  repeat_infringer_flag?: boolean;
}

export interface LegalModerationAppeal extends LegalAdminRequest {
  category: "moderation" | "creator";
  appealed_action: string;
  appeal_status: LegalAdminRequestStatus;
}

export interface LegalAcceptanceAuditRecord {
  id: string;
  user_id: string;
  public_profile_uid?: string;
  flow_id: string;
  policy_id: string;
  policy_version: string;
  accepted_at: string;
  source_flow: string;
  backend_status: "supabase" | "fallback" | "mock";
  rights_confirmation_type?: "music" | "beat" | "mix" | "other";
  related_reference_id?: string;
  summary: string;
}

export interface LegalAdminQueueFilter {
  tab?:
    | "all"
    | "privacy"
    | "deletion"
    | "copyright"
    | "moderation"
    | "safety"
    | "intake"
    | "acceptance";
  status?: LegalAdminRequestStatus | "all";
  priority?: LegalRequestPriority | "all";
  category?: LegalRequestCategory | "all";
  requestType?: string;
  query?: string;
  date?: string;
}

export interface LegalAdminDashboardStats {
  new_requests: number;
  urgent_requests: number;
  deletion_requests: number;
  copyright_dmca_reports: number;
  unresolved_appeals: number;
  acceptance_records_today: number;
}
