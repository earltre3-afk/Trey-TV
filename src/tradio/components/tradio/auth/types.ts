export type TradioRole = 'fan' | 'artist' | 'producer' | 'dj' | 'moderator' | 'admin' | 'owner';

export type TradioMode = 'listener' | 'artist' | 'producer' | 'dj' | 'admin';

export type TradioRoleStatus = 'active' | 'requested' | 'approved' | 'restricted' | 'revoked' | 'archived';

export type TradioAccessState = 'none' | 'available' | 'requested' | 'granted' | 'restricted';

export type TradioVerificationState = 'unverified' | 'pending' | 'verified' | 'rejected' | 'revoked';

export type TradioBroadcastAccessState = 'invite_only' | 'submitted' | 'pending' | 'under_review' | 'cleared' | 'denied' | 'revoked';

export type TradioCapability =
  | 'listen'
  | 'access-studio'
  | 'create-artist-station'
  | 'release-music'
  | 'upload-beat'
  | 'create-broadcast'
  | 'host-song-war'
  | 'moderate-session'
  | 'admin-platform'
  | 'request-broadcast-access'
  | 'request-verification';

export interface TradioProfileBridge {
  user_id: string;
  profile_id?: string | null;
  public_profile_uid?: string | null;
  trey_tv_uid?: string | null;
}

export interface TradioRoleGrant {
  id: string;
  role: TradioRole;
  role_status: TradioRoleStatus;
  granted_at?: string;
  granted_by?: string | null;
  role_metadata?: Record<string, unknown>;
}

export interface TradioBadge {
  id: string;
  label: string;
  tone?: 'cyan' | 'violet' | 'magenta' | 'gold' | 'emerald';
}

export interface TradioIdentity extends TradioProfileBridge {
  display_name: string;
  username: string;
  avatar_url: string;
  banner_url?: string;
  active_mode: TradioMode;
  default_mode: TradioMode;
  roles: TradioRoleGrant[];
  badges: TradioBadge[];
  verification_status: TradioVerificationState;
  broadcast_access_status: TradioBroadcastAccessState;
  access_state: TradioAccessState;
  city?: string;
  region?: string;
  genres?: string[];
  fan_interests?: string[];
}

// ─── PASS 4F: Role onboarding & access requests ───────────────────────────
// Frontend-only request surfaces. Elevated roles are NEVER self-granted here;
// the user submits a request and waits for backend/RPC review (Pass 4G).

/** Roles a user can apply to step up into (fan/listener is the default, not requestable). */
export type TradioOnboardingRole = 'artist' | 'producer' | 'dj';

/** The kinds of access a user can request from the frontend. */
export type RoleRequestType = 'artist' | 'producer' | 'dj' | 'verification' | 'broadcast';

/** Lifecycle of any access request. */
export type RoleRequestStatus =
  | 'not_started'
  | 'draft'
  | 'submitted'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'restricted'
  | 'needs_more_info'
  | 'cancelled';

export type VerificationRequestStatus = RoleRequestStatus;
export type BroadcastAccessRequestStatus = RoleRequestStatus;

export interface RoleOnboardingStep {
  id: string;
  label: string;
  description?: string;
  complete: boolean;
}

export interface RoleOnboardingProgress {
  request_type: RoleRequestType;
  steps: RoleOnboardingStep[];
  completed_steps: number;
  total_steps: number;
}

/** One answered field in a role application form. */
export interface RoleApplicationAnswer {
  field: string;
  label: string;
  value: string;
}

/** Lifecycle event types for an access request (mirrors tradio_access_request_event_type). */
export type AccessRequestEventType =
  | 'submitted'
  | 'updated'
  | 'needs_more_info'
  | 'approved'
  | 'rejected'
  | 'restricted'
  | 'cancelled'
  | 'note_added';

/** One entry in an access request's audit timeline. */
export interface AccessRequestEvent {
  id: string;
  request_id?: string;
  event_type: AccessRequestEventType;
  from_status?: RoleRequestStatus;
  to_status?: RoleRequestStatus;
  note?: string;
  actor?: string;
  created_at: string;
}

/** A submitted (or draft) request for role / verification / broadcast access. */
export interface RoleAccessRequest {
  id: string;
  request_type: RoleRequestType;
  requested_role?: TradioRole;
  status: RoleRequestStatus;
  submitted_at?: string;
  reviewed_at?: string;
  reviewer_note?: string;
  answers: RoleApplicationAnswer[];
  evidence?: RoleApplicationAnswer[];
  events?: AccessRequestEvent[];
}

/** Aggregate, mock-only view of a user's creator-access standing. */
export interface CreatorSetupState {
  user_id: string;
  approved_roles: TradioRole[];
  pending_requests: RoleAccessRequest[];
  history: RoleAccessRequest[];
  verification_status: VerificationRequestStatus;
  broadcast_access_status: BroadcastAccessRequestStatus;
}
