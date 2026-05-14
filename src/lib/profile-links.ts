const PUBLIC_PROFILE_UID_RE = /^423\d{13}$/;

export function isPublicProfileUid(value?: string | null) {
  return Boolean(value && PUBLIC_PROFILE_UID_RE.test(value.trim()));
}

export function publicProfilePath(value?: string | null) {
  const uid = value?.trim();
  return isPublicProfileUid(uid) ? `/u/${uid}` : null;
}
