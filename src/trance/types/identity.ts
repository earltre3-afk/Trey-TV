// TRANCE — Production User Identity & Roles System
// Integrates with the larger Trey TV identity context.

export type TranceRole =
  | "listener/viewer"
  | "dancer"
  | "choreographer"
  | "studio_owner"
  | "studio_admin"
  | "studio_member"
  | "producer/team_helper"
  | "admin"
  | "owner";

export type TrancePermission =
  | "browse_public_routines"
  | "practice_routines"
  | "view_own_scores"
  | "join_studio_rooms"
  | "create_public_routines"
  | "create_dance_sessions"
  | "review_submissions"
  | "manage_own_channel"
  | "create_private_rehearsal_rooms"
  | "invite_dancers"
  | "assign_rehearsal_videos"
  | "upload_studio_files"
  | "manage_private_show_prep"
  | "view_assigned_private_content"
  | "moderate_content"
  | "restrict_content"
  | "verify_choreographers"
  | "approve_content"
  | "feature_content"
  | "remove_content";

export interface TranceIdentity {
  authUserId: string;
  treyTvProfileId: string; // 16-digit Trey TV profile ID
  publicProfileUid: string; // Public alphanumeric slug
  treyTvUid: string; // Unique core ecosystem UID
  displayName: string;
  handle: string;
  avatarUrl: string | null; // Real profile avatar Url
  bannerUrl: string | null; // Real profile banner Url
  treyTvRoles: TranceRole[]; // Platform-level roles (e.g. admin, owner)
  tranceRoles: TranceRole[]; // TRANCE-specific capability roles
  activeMode: "Learn" | "Practice" | "Performance";
  permissions: TrancePermission[];

  // Compatibility mappings (retained to prevent UI breakage)
  avatar?: string | null;
  activeRoles: TranceRole[];
  tranceSpecificProfileId?: string;
}
