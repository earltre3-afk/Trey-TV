/**
 * index.ts — Profile component barrel
 * Re-exports all profile template components and types for clean imports.
 */

// Shell (main entry point)
export { ProfilePageShell } from "./ProfilePageShell";
export type { ProfilePageShellProps } from "./ProfilePageShell";

// Types
export type {
  ProfileData,
  ProfileStats,
  ProfileRewards,
  ProfileContext,
  ProfileType,
  ViewerRole,
  RewardTier,
} from "./ProfileTypes";

// Sub-components (exported for potential standalone use)
export { ProfileBanner } from "./ProfileBanner";
export { ProfileIdentityCard } from "./ProfileIdentityCard";
export { ProfileStatsBar } from "./ProfileStatsBar";
export { ProfileActionBar } from "./ProfileActionBar";
export { ProfileSectionCard, ProfileEmptyState } from "./ProfileSectionCard";
export { ProfileOwnerControls } from "./ProfileOwnerControls";
export { PublicProfileControls } from "./PublicProfileControls";
export { NormalUserProfileModules } from "./NormalUserProfileModules";
export { CreatorProfileModules } from "./CreatorProfileModules";
