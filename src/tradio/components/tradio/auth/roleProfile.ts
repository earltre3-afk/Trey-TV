import type { RoleRequestStatus, TradioIdentity, TradioRole, TradioRoleStatus } from "./types";
import { hasRole, ROLE_LABELS } from "./roleUtils";

/**
 * TRADIO PASS 4I — Role profile activation model (MOCK / FRONTEND-ONLY).
 *
 * Pure, local-safe helpers that decide how an Artist / Producer / DJ-Host profile
 * page should render for the current identity. Nothing here grants roles; it only
 * reads the identity (roles/verification/broadcast) + an optional access-request
 * status to derive an activation state. Designed to accept real Supabase-backed
 * data later without signature changes.
 */

export type RoleProfileType = "artist" | "producer" | "dj";

export type RoleProfileStatus =
  | "locked"
  | "request_available"
  | "pending_review"
  | "needs_more_info"
  | "rejected"
  | "restricted"
  | "approved_incomplete"
  | "active_public"
  | "active_private"
  | "suspended";

export type RoleProfileVisibility = "public" | "private" | "unlisted";

export interface RoleProfileChecklistItem {
  id: string;
  label: string;
  complete: boolean;
}

export interface RoleProfileCompletionChecklist {
  items: RoleProfileChecklistItem[];
  completed: number;
  total: number;
  percent: number;
  isComplete: boolean;
}

export interface RoleProfileOwnerContext {
  user_id: string;
  profile_id?: string | null;
  public_profile_uid?: string | null;
  trey_tv_uid?: string | null;
  display_name: string;
  username: string;
  avatar_url: string;
  banner_url?: string;
  bio?: string | null;
  genres?: string[];
  role: RoleProfileType;
  roleLabel: string;
  verified: boolean;
  broadcastCleared: boolean;
  /** Placeholder deep link back to the Trey TV ecosystem profile. */
  treyTvProfileHref: string;
}

export interface RoleProfileActivationState {
  role: RoleProfileType;
  status: RoleProfileStatus;
  hasRole: boolean;
  roleStatus?: TradioRoleStatus;
  visibility: RoleProfileVisibility;
  completion: RoleProfileCompletionChecklist;
  requiresBroadcast: boolean;
  broadcastReady: boolean;
  verificationRequired: boolean;
  verified: boolean;
  publicReady: boolean;
  reviewerNote?: string;
}

/** Maps a profile role → the underlying Tradio role grant. */
const PROFILE_ROLE: Record<RoleProfileType, TradioRole> = {
  artist: "artist",
  producer: "producer",
  dj: "dj",
};

export interface RoleProfileSection {
  id: string;
  title: string;
  description: string;
  ownerOnly?: boolean;
  requiresBroadcast?: boolean;
}

/** Role-specific public content modules surfaced on the profile shell. */
export const ROLE_PROFILE_SECTIONS: Record<RoleProfileType, RoleProfileSection[]> = {
  artist: [
    { id: "station", title: "Artist Station", description: "Your owned radio lane and premieres." },
    { id: "releases", title: "Releases", description: "Tracks dropped directly into Tradio." },
    { id: "featured", title: "Featured Release", description: "Your pinned spotlight track." },
    { id: "playlists", title: "Artist Playlists", description: "Curated sets for your fans." },
    { id: "community", title: "Fan Community", description: "Reactions, requests, and chat." },
    { id: "songwars", title: "Song Wars History", description: "Battles entered and won." },
    {
      id: "shows",
      title: "Artist Shows",
      description: "Broadcast Studio premieres.",
      requiresBroadcast: true,
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "Plays, saves, and fan growth.",
      ownerOnly: true,
    },
  ],
  producer: [
    { id: "catalog", title: "Beat Catalog", description: "Uploaded, tagged, and priced beats." },
    { id: "packs", title: "Beat Packs", description: "Bundled collections for artists." },
    { id: "tags", title: "BPM · Key · Mood · Genre", description: "How your sound is discovered." },
    { id: "station", title: "Producer Station", description: "Your producer radio lane." },
    {
      id: "matches",
      title: "Artist Match Suggestions",
      description: "Artists that fit your sound.",
    },
    { id: "opps", title: "DJ Opportunities", description: "Pitch beat packs to live shows." },
    { id: "battles", title: "Beat Battle History", description: "Producer battles and results." },
    {
      id: "spotlight",
      title: "Producer Spotlight Shows",
      description: "Broadcast Studio features.",
      requiresBroadcast: true,
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "Leases, plays, and collabs.",
      ownerOnly: true,
    },
  ],
  dj: [
    { id: "stations", title: "Hosted Stations", description: "Channels you broadcast on." },
    {
      id: "shows",
      title: "Live Shows",
      description: "Your scheduled and live broadcasts.",
      requiresBroadcast: true,
    },
    { id: "mixes", title: "Scheduled Mixes", description: "Upcoming mix sessions." },
    { id: "replays", title: "Replay Archive", description: "Past shows on demand." },
    { id: "requests", title: "Listener Request Style", description: "How you take fan requests." },
    { id: "songwars", title: "Song Wars Hosting", description: "Battles you have hosted." },
    { id: "templates", title: "Show Templates", description: "Reusable show formats." },
    {
      id: "broadcast",
      title: "Broadcast Studio",
      description: "Build and run premium shows.",
      requiresBroadcast: true,
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "Listeners, fulfillment, tune-ins.",
      ownerOnly: true,
    },
  ],
};

const has = (value: unknown) => (Array.isArray(value) ? value.length > 0 : Boolean(value));

/**
 * Role-specific completion checklist. Item completeness is derived from the
 * identity + a couple of state signals so different mock identities naturally
 * show complete vs incomplete profiles. (Real data wires in later.)
 */
export const getRoleProfileCompletion = (
  identity: TradioIdentity,
  role: RoleProfileType,
): RoleProfileCompletionChecklist => {
  const roleActive = hasRole(identity, PROFILE_ROLE[role]);
  const verified = identity.verification_status === "verified";
  const base = (id: string, label: string, complete: boolean): RoleProfileChecklistItem => ({
    id,
    label,
    complete,
  });

  let items: RoleProfileChecklistItem[];
  if (role === "artist") {
    items = [
      base("name", "Artist name", has(identity.display_name)),
      base("media", "Avatar & banner", has(identity.avatar_url)),
      base("bio", "Bio", verified),
      base("genre", "Genres", has(identity.genres)),
      base("station", "Artist station", roleActive),
      base("release", "First / featured release", roleActive),
      base("community", "Fan community enabled", verified),
    ];
  } else if (role === "producer") {
    items = [
      base("name", "Producer name", has(identity.display_name)),
      base("media", "Avatar & banner", has(identity.avatar_url)),
      base("bio", "Bio", verified),
      base("genre", "Beat genres", has(identity.genres)),
      base("beat", "First beat", roleActive),
      base("pack", "Beat pack / catalog", roleActive),
      base("collab", "Collab availability", verified),
    ];
  } else {
    items = [
      base("name", "Host name", has(identity.display_name)),
      base("media", "Avatar & banner", has(identity.avatar_url)),
      base("bio", "Bio", verified),
      base("concept", "Show concept", roleActive),
      base("genre", "Preferred genres", has(identity.genres)),
      base("show", "First scheduled show / replay", roleActive),
      base("broadcast", "Broadcast access", identity.broadcast_access_status === "cleared"),
    ];
  }

  const completed = items.filter((item) => item.complete).length;
  const total = items.length;
  return {
    items,
    completed,
    total,
    percent: Math.round((completed / total) * 100),
    isComplete: completed === total,
  };
};

export const getMissingProfileRequirements = (
  identity: TradioIdentity,
  role: RoleProfileType,
): string[] =>
  getRoleProfileCompletion(identity, role)
    .items.filter((item) => !item.complete)
    .map((item) => item.label);

export const getRoleProfileOwnerContext = (
  identity: TradioIdentity,
  role: RoleProfileType,
): RoleProfileOwnerContext => ({
  user_id: identity.user_id,
  profile_id: identity.profile_id,
  public_profile_uid: identity.public_profile_uid,
  trey_tv_uid: identity.trey_tv_uid,
  display_name: identity.display_name,
  username: identity.username,
  avatar_url: identity.avatar_url,
  banner_url: identity.banner_url,
  role,
  roleLabel: ROLE_LABELS[PROFILE_ROLE[role]],
  verified: identity.verification_status === "verified",
  broadcastCleared: identity.broadcast_access_status === "cleared",
  treyTvProfileHref: identity.public_profile_uid ? `/treytv/${identity.public_profile_uid}` : "#",
});

export const getRoleProfileOwnerLabel = (identity: TradioIdentity): string =>
  identity.public_profile_uid || identity.username || identity.display_name;

export const getRoleProfilePublicUrl = (
  identity: TradioIdentity,
  role: RoleProfileType,
): string => {
  const handle = identity.public_profile_uid || identity.username;
  return `/tradio/${role}/${handle}`;
};

interface ActivationOptions {
  requestStatus?: RoleRequestStatus;
  requestNote?: string;
  canRequest?: boolean;
  visibility?: RoleProfileVisibility;
}

/**
 * The core decision: what activation state should this role profile render in?
 */
export const getRoleProfileActivationState = (
  identity: TradioIdentity,
  role: RoleProfileType,
  opts: ActivationOptions = {},
): RoleProfileActivationState => {
  const grant = identity.roles.find((g) => g.role === PROFILE_ROLE[role]);
  const roleStatus = grant?.role_status;
  const roleActive = roleStatus === "active" || roleStatus === "approved";
  const completion = getRoleProfileCompletion(identity, role);
  const requiresBroadcast = role === "dj";
  const broadcastReady = identity.broadcast_access_status === "cleared";
  const verified = identity.verification_status === "verified";
  const visibility = opts.visibility ?? "public";

  let status: RoleProfileStatus;
  if (roleStatus === "restricted") {
    status = "restricted";
  } else if (roleStatus === "revoked" || roleStatus === "archived") {
    status = "suspended";
  } else if (roleActive) {
    status = !completion.isComplete
      ? "approved_incomplete"
      : visibility === "private"
        ? "active_private"
        : "active_public";
  } else {
    switch (opts.requestStatus) {
      case "pending":
      case "submitted":
        status = "pending_review";
        break;
      case "needs_more_info":
        status = "needs_more_info";
        break;
      case "rejected":
        status = "rejected";
        break;
      case "restricted":
        status = "restricted";
        break;
      default:
        status = opts.canRequest === false ? "locked" : "request_available";
    }
  }

  return {
    role,
    status,
    hasRole: roleActive,
    roleStatus,
    visibility,
    completion,
    requiresBroadcast,
    broadcastReady,
    verificationRequired: false,
    verified,
    publicReady: roleActive && completion.isComplete,
    reviewerNote: opts.requestNote,
  };
};

export const canViewRoleProfile = (identity: TradioIdentity, role: RoleProfileType): boolean =>
  hasRole(identity, PROFILE_ROLE[role]);

export const canEditRoleProfile = (identity: TradioIdentity, role: RoleProfileType): boolean =>
  hasRole(identity, PROFILE_ROLE[role]);

export const canPublishRoleProfile = (identity: TradioIdentity, role: RoleProfileType): boolean =>
  hasRole(identity, PROFILE_ROLE[role]) && getRoleProfileCompletion(identity, role).isComplete;

/** A profile role maps to the existing visual ProfileScreen role union ('dj' → 'host'). */
export const toProfileScreenRole = (role: RoleProfileType): "artist" | "producer" | "host" =>
  role === "dj" ? "host" : role;
