/**
 * ProfileTypes.ts
 * Shared type definitions for the Trey TV profile template system.
 * These types are used by all profile components to ensure consistent
 * data shape across every profile page instance.
 */

/** Who is viewing the profile */
export type ViewerRole = "owner" | "user" | "guest";

/** Core profile type driving which modules appear */
export type ProfileType = "user" | "creator";

/** Reward tier */
export type RewardTier = "WHITE" | "GREEN" | "RED" | "GOLD" | "BRONZE" | "SILVER" | "DIAMOND";

/** Stats shown in the stats bar */
export interface ProfileStats {
  posts: number | string;
  followers: number | string;
  following: number | string;
  prescriptions?: number | string;
  subscribers?: number | string;
  watchHours?: number | string;
  episodes?: number | string;
}

/** Reward info */
export interface ProfileRewards {
  points: number;
  tier: RewardTier;
  uid423?: string; // 423 UID for rewards program
}

/** Core profile data — everything needed to render any profile */
export interface ProfileData {
  // Identity
  uid: string; // public_profile_uid
  displayName: string;
  handle: string;
  avatarUrl: string;
  bannerUrl?: string;
  bio?: string;
  location?: string;
  websiteLink?: string;
  joinedDate?: string;
  tagline?: string;
  pronouns?: string;
  birthday?: string;
  favoriteGenres?: string;
  favoriteCreators?: string;
  socialInstagram?: string;
  socialTikTok?: string;
  socialYouTube?: string;
  profileVisibility?: "public" | "members_only" | "private";
  showLocation?: boolean;
  showBirthday?: boolean;

  // Profile type & verification
  profileType: ProfileType;
  isCreator: boolean;
  isVerified: boolean;
  verifiedKind?: "creator" | "user";
  isFounder?: boolean;

  // Stats
  stats: ProfileStats;

  // Rewards
  rewards?: ProfileRewards;

  // Interests / tags
  interests?: string[];

  // Creator-specific extras
  creatorStatus?: "not_applied" | "pending" | "approved" | "rejected";
  accentColor?: string | null;
}

/** Context passed down to all profile sub-components */
export interface ProfileContext {
  profile: ProfileData;
  viewerRole: ViewerRole;
  profileType: ProfileType;
  isOwner: boolean;
  isPublicUser: boolean;
  isGuest: boolean;
}
