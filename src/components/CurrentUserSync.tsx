import { useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAuth as useLovableAuth } from "@/lib/auth";

export function CurrentUserSync() {
  const currentUser = useCurrentUser();
  const { user: lovableUser, updateUser } = useLovableAuth();

  useEffect(() => {
    if (!currentUser || !lovableUser) return;

    // Compare stable fields to avoid infinite update loops
    if (
      lovableUser.uid !== currentUser.uid ||
      lovableUser.name !== currentUser.name ||
      lovableUser.handle !== currentUser.handle ||
      lovableUser.avatar !== currentUser.avatar ||
      lovableUser.banner !== currentUser.banner ||
      lovableUser.bio !== currentUser.bio ||
      lovableUser.location !== currentUser.location ||
      lovableUser.accent !== currentUser.accent ||
      lovableUser.verified !== currentUser.verified ||
      lovableUser.role !== currentUser.role
    ) {
      updateUser({
        uid: currentUser.uid,
        name: currentUser.name,
        handle: currentUser.handle,
        avatar: currentUser.avatar,
        banner: currentUser.banner,
        bio: currentUser.bio,
        location: currentUser.location,
        accent: currentUser.accent,
        verified: currentUser.verified,
        role: currentUser.role,
      });
    }
  }, [currentUser, lovableUser, updateUser]);

  return null;
}
