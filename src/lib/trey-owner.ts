export const TREY_OWNER_EMAIL = "californiatrey@gmail.com";
export const TREY_OWNER_HANDLE = "trey";
export const TREY_OWNER_UID = "4234118205271678";

const normalize = (value?: string | null) => value?.trim().toLowerCase() ?? "";

export function isTreyOwnerEmail(email?: string | null) {
  return normalize(email) === TREY_OWNER_EMAIL;
}

export function isTreyOwnerHandle(handle?: string | null) {
  return normalize(handle).replace(/^@/, "") === TREY_OWNER_HANDLE;
}

export function isTreyOwnerUid(uid?: string | null) {
  return normalize(uid) === TREY_OWNER_UID;
}

export function isTreyOwnerProfile(profile: {
  email?: string | null;
  username?: string | null;
  handle?: string | null;
  public_profile_uid?: string | null;
  uid?: string | null;
}) {
  return (
    isTreyOwnerHandle(profile.username ?? profile.handle) ||
    isTreyOwnerUid(profile.public_profile_uid ?? profile.uid) ||
    isTreyOwnerEmail(profile.email)
  );
}
