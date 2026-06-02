/**
 * TRADIO PASS 4J — Creator Profile Public Routing
 *
 * Helpers for navigating to public + owner creator profiles
 * within the Shell's view state system.
 *
 * Supports:
 * - `/tradio/artist/:public_profile_uid` (owner or public)
 * - `/tradio/artist/@handle` (future-friendly)
 * - Shell deep link: `openPublicCreatorProfile(role, publicUid or handle)`
 * - Shell deep link: `openMyCreatorProfile(role)`
 * - Shell deep link: `openEditCreatorProfile(role)`
 */

import type { RoleProfileType } from "./roleProfile";

/**
 * Parse a public profile URL into role + lookup key.
 *
 * Supported forms:
 * - `/tradio/artist/:public_profile_uid` → { role: 'artist', publicProfileUid }
 * - `/tradio/artist/@:handle` → { role: 'artist', handle }
 */
export function parseCreatorProfileUrl(
  pathname: string,
): { role: RoleProfileType; publicProfileUid?: string; handle?: string } | null {
  const match = pathname.match(/^\/tradio\/(artist|producer|dj)(?:\/(.+))?$/);
  if (!match) return null;

  const role = match[1] as RoleProfileType;
  const lookup = match[2];

  if (!lookup) return { role };

  if (lookup.startsWith("@")) {
    return { role, handle: lookup.substring(1) };
  }

  return { role, publicProfileUid: lookup };
}

/**
 * Build a public profile URL.
 */
export function buildCreatorProfileUrl(
  role: RoleProfileType,
  lookup: { publicProfileUid?: string; handle?: string },
): string {
  if (lookup.publicProfileUid) {
    return `/tradio/${role}/${lookup.publicProfileUid}`;
  }
  if (lookup.handle) {
    return `/tradio/${role}/@${lookup.handle}`;
  }
  return `/tradio/${role}`;
}

/**
 * Shell integration: command to navigate to a public creator profile.
 * This is intended to be called by Shell view state setters.
 *
 * Example:
 * ```
 * const cmd = openPublicCreatorProfile('artist', 'public-uid-123');
 * // cmd = { kind: 'roleProfile', role: 'artist', ownerView: false, lookup: { publicProfileUid: 'public-uid-123' } }
 * ```
 */
export function openPublicCreatorProfile(
  role: RoleProfileType,
  lookup: string | { publicProfileUid?: string; handle?: string },
): {
  kind: "roleProfile";
  role: RoleProfileType;
  ownerView: false;
  lookup: { publicProfileUid?: string; handle?: string };
} {
  const parsedLookup =
    typeof lookup === "string"
      ? lookup.startsWith("@")
        ? { handle: lookup.substring(1) }
        : { publicProfileUid: lookup }
      : lookup;

  return {
    kind: "roleProfile",
    role,
    ownerView: false,
    lookup: parsedLookup,
  };
}

/**
 * Shell integration: command to navigate to my creator profile (owner view).
 * Automatically uses the current user's identity.
 */
export function openMyCreatorProfile(role: RoleProfileType): {
  kind: "roleProfile";
  role: RoleProfileType;
  ownerView: true;
} {
  return {
    kind: "roleProfile",
    role,
    ownerView: true,
  };
}

/**
 * Shell integration: command to open the edit screen for a creator profile.
 * (Currently the same as owner view; future-friendly for separate edit flow.)
 */
export function openEditCreatorProfile(role: RoleProfileType): {
  kind: "roleProfile";
  role: RoleProfileType;
  ownerView: true;
  editMode?: true;
} {
  return {
    kind: "roleProfile",
    role,
    ownerView: true,
    editMode: true,
  };
}

/**
 * Shell integration: command to open the public viewing mode of ProfileScreen
 * (the legacy polished shell).
 */
export function openPublicProfileScreen(
  role: "artist" | "producer" | "host",
  name?: string,
): {
  kind: "profile";
  role: "artist" | "producer" | "host";
  name: string;
} {
  return {
    kind: "profile",
    role,
    name: name || "Profile",
  };
}

/**
 * Helper: derive the display role name for UI labels.
 */
export function getCreatorRoleLabel(role: RoleProfileType): string {
  const labels: Record<RoleProfileType, string> = {
    artist: "Artist",
    producer: "Producer",
    dj: "DJ / Host",
  };
  return labels[role];
}

/**
 * Helper: map role to the corresponding capability flag for access checks.
 */
export function getCreatorRoleCapability(
  role: RoleProfileType,
): "release-music" | "upload-beat" | "create-broadcast" {
  const capabilities: Record<
    RoleProfileType,
    "release-music" | "upload-beat" | "create-broadcast"
  > = {
    artist: "release-music",
    producer: "upload-beat",
    dj: "create-broadcast",
  };
  return capabilities[role];
}

/**
 * Helper: map role to the corresponding Tradio role for identity checks.
 */
export function getCreatorRoleName(role: RoleProfileType): "artist" | "producer" | "dj" {
  return role;
}
