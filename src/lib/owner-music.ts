import { TREY_OWNER_UID } from "@/lib/trey-owner";

export const OWNER_TRADIO_SONG_IDS = ["i-look-like", "call-on"] as const;
export const OWNER_DEFAULT_PROFILE_SONG_ID = OWNER_TRADIO_SONG_IDS[0];
export const OWNER_DEFAULT_MUSIC_ORDER = [
  ...OWNER_TRADIO_SONG_IDS,
  "midnight-velvet",
  "6am-thoughts",
  "neon-heartbreak",
];

export function isOwnerMusicUid(uid?: string | null) {
  return String(uid || "").trim() === TREY_OWNER_UID;
}

export function resolveOwnerProfileSongId(uid?: string | null, current?: string | null) {
  if (!isOwnerMusicUid(uid)) return current ?? null;
  return current || OWNER_DEFAULT_PROFILE_SONG_ID;
}

export function resolveOwnerMusicOrder(uid?: string | null, current?: string[] | null) {
  if (!isOwnerMusicUid(uid)) return current ?? null;

  const currentOrder = Array.isArray(current) ? current.filter(Boolean) : [];
  const required = [...OWNER_TRADIO_SONG_IDS];
  const merged = [
    ...required,
    ...currentOrder.filter((id) => !required.includes(id as (typeof required)[number])),
  ];

  return [
    ...merged,
    ...OWNER_DEFAULT_MUSIC_ORDER.filter((id) => !merged.includes(id)),
  ].slice(0, 5);
}
