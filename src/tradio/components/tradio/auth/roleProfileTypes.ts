import type {
  TradioIdentity,
  TradioRole,
  TradioRoleStatus,
  TradioVerificationState,
} from "./types";

/**
 * Comprehensive profile activation state for any role profile (artist, producer, dj).
 * Determines what UI, sections, and actions should appear on the profile page.
 */
export type RoleProfileActivationState =
  | "locked" // No role; request available
  | "request_available" // Same as locked
  | "pending_review" // Request submitted, awaiting approval
  | "needs_more_info" // Request rejected or needs update
  | "rejected" // Final rejection
  | "restricted" // Role active but restricted
  | "approved_incomplete" // Role approved but profile incomplete
  | "active_public" // Fully approved and complete, ready for public
  | "active_private" // Active but private/not ready
  | "suspended"; // Role suspended

export type RoleProfileType = "artist" | "producer" | "dj";

export type RoleProfileVisibility = "private" | "unlisted" | "public";

/**
 * Profile completion item — checklist entries for onboarding.
 * Each role profile page shows what's missing and why.
 */
export interface RoleProfileCompletionItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  required: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

/**
 * Summary of profile completion status.
 */
export interface RoleProfileCompletion {
  totalItems: number;
  completedItems: number;
  requiredItems: number;
  completedRequired: number;
  percentComplete: number;
  isComplete: boolean;
  items: RoleProfileCompletionItem[];
  missingRequiredLabels: string[];
}

/**
 * Public profile context — what's needed to render a public role profile.
 * This bridges Trey TV identity with role-specific data.
 */
export interface RoleProfilePublicContext {
  // Trey TV bridge
  user_id: string;
  profile_id?: string | null;
  public_profile_uid?: string | null;
  trey_tv_uid?: string | null;

  // Role identity
  role: RoleProfileType;
  role_name: string; // "artist_name", "producer_name", "dj_name"
  username: string;
  display_name: string;

  // Media
  avatar_url: string;
  banner_url?: string;

  // Bio and metadata
  bio?: string;
  genres?: string[];
  specialties?: string[]; // For producers
  verified_at?: string;

  // Status
  activation_state: RoleProfileActivationState;
  verification_status: TradioVerificationState;
  role_status: TradioRoleStatus;

  // Broadcast access (for DJ/artist shows)
  broadcast_access_status?: string;

  // Role-specific counts
  follower_count?: number;
  monthly_listeners?: number; // Artist
  beat_count?: number; // Producer
  show_count?: number; // DJ
  release_count?: number; // Artist
}

/**
 * Owner context for editing/managing their own role profile.
 * Extended from public context with editable state and admin details.
 */
export interface RoleProfileOwnerContext extends RoleProfilePublicContext {
  is_owner: true;
  completion: RoleProfileCompletion;
  can_edit: boolean;
  can_publish: boolean;
  can_request_broadcast_access?: boolean;
  broadcast_request_status?: string; // pending, under_review, approved, denied
  setup_checklist_visible: boolean;
}

/**
 * Determine role profile activation state from identity and role.
 *
 * This is the core logic that decides what state the profile is in:
 * - If user doesn't have role: locked
 * - If role requested but not approved: pending_review
 * - If role approved but profile incomplete: approved_incomplete
 * - If role approved and complete: active_public
 */
export const getRoleProfileActivationState = (
  identity: TradioIdentity | null | undefined,
  role: RoleProfileType,
): RoleProfileActivationState => {
  if (!identity) return "locked";

  const roleGrant = identity.roles.find((g) => g.role === (role === "dj" ? "dj" : role));

  if (!roleGrant) {
    return "locked";
  }

  if (roleGrant.role_status === "restricted") {
    return "restricted";
  }

  if (roleGrant.role_status === "requested") {
    return "pending_review";
  }

  if (roleGrant.role_status === "active" || roleGrant.role_status === "approved") {
    // Check if profile is complete (mock for now; real check comes from data)
    // For now, assume active = active_public; later this checks actual profile data
    return "active_public";
  }

  return "locked";
};

/**
 * Can the current user view this role profile?
 * Public profiles are always viewable; owner views have more detail.
 */
export const canViewRoleProfile = (
  identity: TradioIdentity | null | undefined,
  role: RoleProfileType,
  isOwner: boolean = false,
): boolean => {
  // Fans can always view public profiles
  if (!isOwner) return true;

  // Owner can only view their own profile if they have the role
  const hasRole = identity?.roles.some((g) => g.role === (role === "dj" ? "dj" : role));
  return Boolean(hasRole);
};

/**
 * Can the current user edit this role profile?
 * Only the owner can edit, and only if the role is active/approved.
 */
export const canEditRoleProfile = (
  identity: TradioIdentity | null | undefined,
  role: RoleProfileType,
  isOwner: boolean = false,
): boolean => {
  if (!isOwner) return false;

  const roleGrant = identity?.roles.find((g) => g.role === (role === "dj" ? "dj" : role));

  if (!roleGrant) return false;

  return roleGrant.role_status === "active" || roleGrant.role_status === "approved";
};

/**
 * Can the current user publish/make public this role profile?
 * Requires: ownership, role active, profile complete.
 */
export const canPublishRoleProfile = (
  identity: TradioIdentity | null | undefined,
  role: RoleProfileType,
  isOwner: boolean = false,
  isComplete: boolean = false,
): boolean => {
  if (!isOwner) return false;
  if (!isComplete) return false;

  const roleGrant = identity?.roles.find((g) => g.role === (role === "dj" ? "dj" : role));

  if (!roleGrant) return false;

  return roleGrant.role_status === "active" || roleGrant.role_status === "approved";
};

/**
 * Get a label for the role profile owner (for display purposes).
 */
export const getRoleProfileOwnerLabel = (
  identity: TradioIdentity | null | undefined,
  role: RoleProfileType,
): string => {
  if (!identity) return "Creator";

  const roleLabel = role === "artist" ? "Artist" : role === "producer" ? "Producer" : "Radio Host";

  return `${identity.display_name} — ${roleLabel}`;
};

/**
 * Generate a potential public URL for a role profile.
 * This is a placeholder; real URL generation comes from routing in Pass 4J.
 */
export const getRoleProfilePublicUrl = (
  identity: TradioIdentity | null | undefined,
  role: RoleProfileType,
): string | null => {
  if (!identity || !identity.public_profile_uid) return null;

  // Placeholder format: will be replaced by actual router in Pass 4J
  return `/profile/${role}/${identity.public_profile_uid}`;
};

/**
 * Helper to get default profile completion checklist for each role.
 * This returns the template; actual state comes from identity/role data.
 */
export const getDefaultRoleProfileCompletion = (
  role: RoleProfileType,
): RoleProfileCompletionItem[] => {
  if (role === "artist") {
    return [
      {
        id: "name",
        label: "Artist Name",
        description: "Set your artist display name",
        completed: false,
        required: true,
      },
      {
        id: "avatar",
        label: "Avatar",
        description: "Upload a profile picture",
        completed: false,
        required: true,
      },
      {
        id: "banner",
        label: "Banner",
        description: "Upload a profile banner",
        completed: false,
        required: false,
      },
      {
        id: "bio",
        label: "Bio",
        description: "Write your artist bio (optional)",
        completed: false,
        required: false,
      },
      {
        id: "genres",
        label: "Genres",
        description: "Select your primary genres",
        completed: false,
        required: true,
      },
      {
        id: "station",
        label: "Artist Station",
        description: "Create your artist station",
        completed: false,
        required: true,
      },
      {
        id: "release",
        label: "First Release",
        description: "Upload or feature a track",
        completed: false,
        required: true,
      },
    ];
  }

  if (role === "producer") {
    return [
      {
        id: "name",
        label: "Producer Name",
        description: "Set your producer display name",
        completed: false,
        required: true,
      },
      {
        id: "avatar",
        label: "Avatar",
        description: "Upload a profile picture",
        completed: false,
        required: true,
      },
      {
        id: "banner",
        label: "Banner",
        description: "Upload a profile banner",
        completed: false,
        required: false,
      },
      {
        id: "bio",
        label: "Bio",
        description: "Write your producer bio",
        completed: false,
        required: false,
      },
      {
        id: "genres",
        label: "Beat Genres",
        description: "Select your primary beat genres",
        completed: false,
        required: true,
      },
      {
        id: "beat",
        label: "First Beat",
        description: "Upload your first beat",
        completed: false,
        required: true,
      },
      {
        id: "catalog",
        label: "Beat Catalog Setup",
        description: "Organize beats into packs",
        completed: false,
        required: false,
      },
    ];
  }

  // DJ/Host
  return [
    {
      id: "name",
      label: "Host/DJ Name",
      description: "Set your host display name",
      completed: false,
      required: true,
    },
    {
      id: "avatar",
      label: "Avatar",
      description: "Upload a profile picture",
      completed: false,
      required: true,
    },
    {
      id: "banner",
      label: "Banner",
      description: "Upload a profile banner",
      completed: false,
      required: false,
    },
    {
      id: "bio",
      label: "Bio",
      description: "Write your host bio",
      completed: false,
      required: false,
    },
    {
      id: "genres",
      label: "Show Genres",
      description: "Select your primary show genres",
      completed: false,
      required: true,
    },
    {
      id: "show",
      label: "First Show",
      description: "Create or schedule a show",
      completed: false,
      required: true,
    },
    {
      id: "broadcast",
      label: "Broadcast Access",
      description: "Request or activate broadcast access",
      completed: false,
      required: false,
    },
  ];
};

/**
 * Calculate completion from checklist items.
 */
export const calculateCompletion = (items: RoleProfileCompletionItem[]): RoleProfileCompletion => {
  const totalItems = items.length;
  const completedItems = items.filter((i) => i.completed).length;
  const requiredItems = items.filter((i) => i.required).length;
  const completedRequired = items.filter((i) => i.completed && i.required).length;

  return {
    totalItems,
    completedItems,
    requiredItems,
    completedRequired,
    percentComplete: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
    isComplete: completedRequired === requiredItems && requiredItems > 0,
    items,
    missingRequiredLabels: items.filter((i) => i.required && !i.completed).map((i) => i.label),
  };
};

/**
 * Get missing profile requirements for a role profile.
 * Useful for error messages and setup guidance.
 */
export const getMissingProfileRequirements = (
  role: RoleProfileType,
): RoleProfileCompletionItem[] => {
  const allItems = getDefaultRoleProfileCompletion(role);
  // For now, mock all as incomplete; real logic will check actual profile data
  return allItems.filter((i) => i.required);
};
