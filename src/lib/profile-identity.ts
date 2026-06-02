import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createBrowserClient } from "@/lib/supabase-browser";

export type CanonicalProfile = {
  id?: string | null;
  public_profile_uid?: string | null;
  publicProfileUid?: string | null;
  display_name?: string | null;
  displayName?: string | null;
  username?: string | null;
  handle?: string | null;
  avatar_url?: string | null;
  avatarUrl?: string | null;
  profile_photo_url?: string | null;
  photo_url?: string | null;
};

export const DEFAULT_PROFILE_PHOTO = "";

export function resolveProfilePhoto(profile?: CanonicalProfile | null): string {
  return (
    profile?.avatar_url?.trim() ||
    profile?.avatarUrl?.trim() ||
    profile?.profile_photo_url?.trim() ||
    profile?.photo_url?.trim() ||
    DEFAULT_PROFILE_PHOTO
  );
}

export function getPublicProfileUid(profile?: CanonicalProfile | null): string | null {
  return profile?.public_profile_uid?.trim() || profile?.publicProfileUid?.trim() || null;
}

export function routeToProfile(publicProfileUid?: string | null): string {
  return publicProfileUid?.trim()
    ? `/u/${encodeURIComponent(publicProfileUid.trim())}`
    : "/profile";
}

export function useProfileByUid(publicProfileUid?: string | null) {
  const [profile, setProfile] = useState<CanonicalProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const uid = publicProfileUid?.trim();
    if (!uid) {
      setProfile(null);
      return;
    }
    const load = async () => {
      setLoading(true);
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, public_profile_uid, display_name, username, avatar_url")
        .eq("public_profile_uid", uid)
        .maybeSingle();
      try {
        if (mounted) setProfile((data as CanonicalProfile | null) ?? null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [publicProfileUid]);

  return { profile, loading };
}

export function useProfileById(profileId?: string | null) {
  const [profile, setProfile] = useState<CanonicalProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const id = profileId?.trim();
    if (!id) {
      setProfile(null);
      return;
    }
    const load = async () => {
      setLoading(true);
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, public_profile_uid, display_name, username, avatar_url")
        .eq("id", id)
        .maybeSingle();
      try {
        if (mounted) setProfile((data as CanonicalProfile | null) ?? null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [profileId]);

  return { profile, loading };
}

export function useFollowState(
  targetUserId?: string | null,
  initialFollowing = false,
  onChange?: (following: boolean) => void,
) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);
  const [countsTick, setCountsTick] = useState(0);

  useEffect(() => setFollowing(initialFollowing), [initialFollowing]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!targetUserId) return;
      const supabase = createBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user || auth.user.id === targetUserId) return;
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", auth.user.id)
        .eq("following_id", targetUserId)
        .maybeSingle();
      if (mounted) setFollowing(!!data);
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [targetUserId, countsTick]);

  const toggle = useCallback(async () => {
    if (!targetUserId || pending) return false;
    const supabase = createBrowserClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      toast.error("Please sign in to follow users");
      return false;
    }
    if (auth.user.id === targetUserId) {
      toast.error("You cannot follow yourself");
      return false;
    }

    const previous = following;
    const next = !previous;
    setPending(true);
    setFollowing(next);
    onChange?.(next);

    const result = next
      ? await supabase
          .from("follows")
          .upsert({ follower_id: auth.user.id, following_id: targetUserId } as any, {
            onConflict: "follower_id,following_id",
          })
      : await supabase
          .from("follows")
          .delete()
          .eq("follower_id", auth.user.id)
          .eq("following_id", targetUserId);

    setPending(false);
    if (result.error) {
      setFollowing(previous);
      onChange?.(previous);
      toast.error(result.error.message || "Could not update follow");
      return false;
    }
    setCountsTick((t) => t + 1);
    toast.success(next ? "Followed" : "Unfollowed");
    return true;
  }, [following, onChange, pending, targetUserId]);

  return { following, pending, toggle };
}

export function useSubscribeState(
  targetUserId?: string | null,
  initialSubscribed = false,
  onChange?: (subscribed: boolean) => void,
) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [pending, setPending] = useState(false);

  useEffect(() => setSubscribed(initialSubscribed), [initialSubscribed]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!targetUserId) return;
      const supabase = createBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user || auth.user.id === targetUserId) return;
      const { data } = await (supabase as any)
        .from("creator_subscriptions")
        .select("id")
        .eq("subscriber_id", auth.user.id)
        .eq("subscribed_to_id", targetUserId)
        .maybeSingle();
      if (mounted) setSubscribed(!!data);
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [targetUserId]);

  const toggle = useCallback(async () => {
    if (!targetUserId || pending) return false;
    const supabase = createBrowserClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      toast.error("Please sign in to subscribe");
      return false;
    }
    if (auth.user.id === targetUserId) {
      toast.error("You cannot subscribe to yourself");
      return false;
    }

    const previous = subscribed;
    const next = !previous;
    setPending(true);
    setSubscribed(next);
    onChange?.(next);

    const result = next
      ? await (supabase as any)
          .from("creator_subscriptions")
          .upsert({ subscriber_id: auth.user.id, subscribed_to_id: targetUserId } as any, {
            onConflict: "subscriber_id,subscribed_to_id",
          })
      : await (supabase as any)
          .from("creator_subscriptions")
          .delete()
          .eq("subscriber_id", auth.user.id)
          .eq("subscribed_to_id", targetUserId);

    setPending(false);
    if (result.error) {
      setSubscribed(previous);
      onChange?.(previous);
      toast.error(result.error.message || "Could not update subscription");
      return false;
    }
    toast.success(next ? "Subscribed" : "Unsubscribed");
    return true;
  }, [onChange, pending, subscribed, targetUserId]);

  return { subscribed, pending, toggle };
}
