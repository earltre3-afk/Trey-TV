// Trey TV Game Room identity helpers.
//
// In standalone preview mode, this falls back to a local guest identity.
// In the Trey TV app, pass the authenticated Trey TV profile into
// <GameRoomModule currentUser={...} /> so rooms, queue entries, chat, requests,
// and stats attach to the user's real profile/UID instead of guest storage.

const ID_KEY = "trey_game_user_id";
const NAME_KEY = "trey_game_display_name";

export interface PlayerIdentity {
  userId: string;
  displayName: string;
  publicProfileUid?: string | null;
  avatarUrl?: string | null;
}

export interface TreyGameUserInput {
  id?: string | null;
  userId?: string | null;
  displayName?: string | null;
  name?: string | null;
  username?: string | null;
  publicProfileUid?: string | null;
  public_profile_uid?: string | null;
  site_uid?: string | null;
  avatarUrl?: string | null;
  avatar_url?: string | null;
  profileImageUrl?: string | null;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function randomHex(n: number): string {
  const chars = "abcdef0123456789";
  let s = "";
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

const NAMES = [
  "Neon Ace",
  "Velvet Wolf",
  "Midnight King",
  "Silver Spade",
  "Echo Queen",
  "Glass Bishop",
  "Storm Joker",
  "Crown Drift",
  "Vapor Knight",
  "Lux Phantom",
  "Onyx Reign",
  "Ember Sage",
  "Cobalt Lyric",
  "Soul Marquis",
  "Pulse Heir",
];

export function getOrCreateIdentity(): PlayerIdentity {
  if (!canUseStorage()) {
    return {
      userId: `guest-${randomHex(12)}`,
      displayName: "Trey TV Guest",
      publicProfileUid: null,
      avatarUrl: null,
    };
  }

  let userId = localStorage.getItem(ID_KEY);
  let displayName = localStorage.getItem(NAME_KEY);
  if (!userId) {
    userId = `guest-${randomHex(12)}`;
    localStorage.setItem(ID_KEY, userId);
  }
  if (!displayName) {
    displayName = NAMES[Math.floor(Math.random() * NAMES.length)];
    localStorage.setItem(NAME_KEY, displayName);
  }
  return { userId, displayName, publicProfileUid: null, avatarUrl: null };
}

export function identityFromTreyUser(user?: TreyGameUserInput | null): PlayerIdentity {
  const fallback = getOrCreateIdentity();
  if (!user) return fallback;

  const userId =
    user.userId ||
    user.id ||
    user.publicProfileUid ||
    user.public_profile_uid ||
    user.site_uid ||
    fallback.userId;
  const displayName = user.displayName || user.name || user.username || fallback.displayName;
  const publicProfileUid =
    user.publicProfileUid || user.public_profile_uid || user.site_uid || null;
  const avatarUrl = user.avatarUrl || user.avatar_url || user.profileImageUrl || null;

  return {
    userId: String(userId),
    displayName: String(displayName).trim().slice(0, 32) || fallback.displayName,
    publicProfileUid: publicProfileUid ? String(publicProfileUid) : null,
    avatarUrl: avatarUrl ? String(avatarUrl) : null,
  };
}

export function setDisplayName(name: string) {
  const trimmed = name.trim().slice(0, 24);
  if (trimmed && canUseStorage()) localStorage.setItem(NAME_KEY, trimmed);
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
