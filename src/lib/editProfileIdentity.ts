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
