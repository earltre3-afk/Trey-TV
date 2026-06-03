import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { tranceAuthBridge } from "../auth/tranceAuthBridge";
import { TranceIdentity, DancerProfile } from "../types";
import { shouldUseFixtures } from "../services/config";

export const useTranceIdentity = () => {
  const { isAuthed, profile, loading } = useAuth();
  const [identity, setIdentity] = useState<TranceIdentity | null>(null);
  const [identityLoading, setIdentityLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (loading) return;

    if (shouldUseFixtures()) {
      setIdentity(tranceAuthBridge.demoIdentity);
      setIdentityLoading(false);
      return;
    }

    if (!isAuthed) {
      setIdentity(rowToDefaultIdentity(null));
      setIdentityLoading(false);
      return;
    }

    setIdentityLoading(true);
    tranceAuthBridge
      .getCurrentIdentity()
      .then((ident) => {
        if (active) {
          setIdentity(ident || rowToDefaultIdentity(profile));
        }
      })
      .catch(() => {
        if (active) {
          setIdentity(rowToDefaultIdentity(profile));
        }
      })
      .finally(() => {
        if (active) setIdentityLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthed, profile, loading]);

  return {
    identity,
    loading: loading || identityLoading,
    isAuthed,
  };
};

function rowToDefaultIdentity(profile: DancerProfile | null): TranceIdentity {
  const id = profile?.id || "guest";
  const avatarUrl = profile?.avatar || null;
  const bannerUrl = profile?.cover || null;
  return {
    authUserId: id,
    treyTvProfileId: `tv-prof-${id}`,
    publicProfileUid: `pub-uid-${id}`,
    treyTvUid: `trey-tv-uid-${id}`,
    tranceSpecificProfileId: `trance-prof-${id}`,
    displayName: profile?.displayName || "Guest",
    handle: profile?.handle || "@guest",
    avatarUrl,
    bannerUrl,
    treyTvRoles: [],
    tranceRoles: ["dancer"],
    activeMode: "Learn",
    permissions: [
      "browse_public_routines",
      "practice_routines",
      "view_own_scores",
      "join_studio_rooms",
    ],

    // Compatibility fields
    avatar: avatarUrl,
    activeRoles: ["dancer"],
  };
}
