export type EditProfileRouteAccess =
  | {
      canonicalUid: string;
      requestedUid: string;
      status: "editable";
    }
  | {
      canonicalUid: string;
      requestedUid: string;
      status: "redirect_to_owner";
    }
  | {
      canonicalUid: string;
      requestedUid: string;
      status: "pending";
    };

const normalizeUid = (value?: string | null) => value?.trim() ?? "";

export const PROFILE_UPDATED_EVENT = "treytv:profile-updated";

export function resolveEditProfileRouteAccess(
  routeUid?: string | null,
  signedInPublicUid?: string | null,
): EditProfileRouteAccess {
  const requestedUid = normalizeUid(routeUid);
  const canonicalUid = normalizeUid(signedInPublicUid);

  if (!canonicalUid) {
    return { canonicalUid, requestedUid, status: "pending" };
  }

  if (!requestedUid || requestedUid !== canonicalUid) {
    return { canonicalUid, requestedUid, status: "redirect_to_owner" };
  }

  return { canonicalUid, requestedUid, status: "editable" };
}

export function shouldReinitializeEditProfileDraft(
  currentDraftOwnerUid?: string | null,
  nextOwnerUid?: string | null,
) {
  const currentUid = normalizeUid(currentDraftOwnerUid);
  const nextUid = normalizeUid(nextOwnerUid);

  return Boolean(nextUid && currentUid !== nextUid);
}

export function resolveEditProfilePersistenceIdentity(input: {
  authUserId?: string | null;
  publicProfileUid?: string | null;
  routeUid?: string | null;
}) {
  const authUserId = normalizeUid(input.authUserId);
  const publicProfileUid = normalizeUid(input.publicProfileUid);
  const routeUid = normalizeUid(input.routeUid);

  if (!authUserId || !publicProfileUid) {
    return { authUserId, publicProfileUid, status: "pending" as const };
  }

  if (routeUid && routeUid !== publicProfileUid) {
    return { authUserId, publicProfileUid, status: "route_mismatch" as const };
  }

  return { authUserId, publicProfileUid, status: "ready" as const };
}

export function isProfileUpdateForUid(activeUid?: string | null, updatedUid?: string | null) {
  const active = normalizeUid(activeUid);
  const updated = normalizeUid(updatedUid);
  return Boolean(active && updated && active === updated);
}
