// TRANCE — Trey TV auth/profile bridge.
// Wraps Supabase auth + the public.trance_profiles table.
// Maps Trey TV core profiles to TRANCE roles and identities.

import { supabase } from "@/lib/supabase";
import { TranceIdentity, DancerProfile, TranceRole, TrancePermission } from "../types";

export interface TranceCapabilities {
  canCreateRoutine: boolean;
  canApproveContent: boolean;
  canManageStudio: boolean;
}

export const getTranceCapabilities = (identity: TranceIdentity | null): TranceCapabilities => {
  if (!identity) {
    return {
      canCreateRoutine: false,
      canApproveContent: false,
      canManageStudio: false,
    };
  }

  const roles = identity.activeRoles || [];
  const isAdmin = roles.includes("admin") || roles.includes("owner");
  const isChoreographer = roles.includes("choreographer");
  const isStudioOwnerOrAdmin = roles.includes("studio_owner") || roles.includes("studio_admin");

  return {
    canCreateRoutine: isAdmin || isChoreographer || isStudioOwnerOrAdmin,
    canApproveContent: isAdmin,
    canManageStudio: isAdmin || isStudioOwnerOrAdmin,
  };
};

// Raw DB row to TranceIdentity interface
export const rowToIdentity = (row: Record<string, unknown>): TranceIdentity => {
  const treyTvRoles = Array.isArray(row.trey_tv_roles)
    ? (row.trey_tv_roles as TranceRole[])
    : Array.isArray(row.roles) && row.roles.includes("admin")
      ? ["admin" as TranceRole]
      : [];

  const tranceRoles = Array.isArray(row.trance_roles)
    ? (row.trance_roles as TranceRole[])
    : Array.isArray(row.roles)
      ? (row.roles as TranceRole[])
      : ["dancer" as TranceRole];

  const combinedRoles = [...new Set([...treyTvRoles, ...tranceRoles])];
  const avatarUrl = (row.avatar_url || row.avatar || null) as string | null;
  const bannerUrl = (row.banner_url || row.cover || null) as string | null;

  return {
    authUserId: (row.id || "") as string,
    treyTvProfileId: (row.trey_tv_profile_id || `tv-prof-${String(row.id).slice(0, 8)}`) as string,
    publicProfileUid: (row.public_profile_uid || `pub-uid-${String(row.id).slice(0, 8)}`) as string,
    treyTvUid: (row.trey_tv_uid || `trey-tv-uid-${String(row.id).slice(0, 8)}`) as string,
    displayName: (row.display_name || "New Trancer") as string,
    handle: (row.handle || "@trancer") as string,
    avatarUrl,
    bannerUrl,
    treyTvRoles,
    tranceRoles,
    activeMode: (row.active_mode || "Learn") as "Learn" | "Practice" | "Performance",
    permissions: (Array.isArray(row.permissions)
      ? row.permissions
      : [
          "browse_public_routines",
          "practice_routines",
          "view_own_scores",
          "join_studio_rooms",
        ]) as TrancePermission[],

    // Compatibility fields
    avatar: avatarUrl,
    activeRoles: combinedRoles,
  };
};

// Raw DB row to DancerProfile interface
export const rowToProfile = (row: Record<string, unknown>): DancerProfile => ({
  id: (row.id || "") as string,
  handle: (row.handle || "@trancer") as string,
  displayName: (row.display_name || "New Trancer") as string,
  avatar: (row.avatar_url || row.avatar || "") as string,
  verified: !!row.verified,
  role: "dancer",
  level: Number(row.level ?? 1),
  xp: Number(row.xp ?? 0),
  xpToNext: Number(row.xp_to_next ?? 1000),
  rankTitle: (row.rank_title || "Rookie Trancer") as string,
  dayStreak: Number(row.day_streak ?? 0),
  totalPoints: Number(row.total_points ?? 0),
  routinesMastered: Number(row.routines_mastered ?? 0),
  globalRank: Number(row.global_rank ?? 9999),
  tranceEnergy: Number(row.trance_energy ?? 100),
  bio: (row.bio || "New to the movement.") as string,
  cover: (row.banner_url || row.cover || "") as string,
  memberNumber: row.member_number ? Number(row.member_number) : undefined,
});

/**
 * Adapter function to translate an existing Trey TV profile into a TRANCE profile.
 */
export const mapTreyTvProfileToTranceProfile = (
  treyProfile: Record<string, unknown> | null | undefined,
): DancerProfile => {
  if (!treyProfile) {
    return tranceAuthBridge.demoProfile;
  }
  const p = treyProfile as Record<string, string | number | boolean | undefined>;
  return {
    id: String(p.id || p.userId || "unknown"),
    handle: String(p.handle || p.username || "@trancer"),
    displayName: String(p.displayName || p.name || "New Trancer"),
    avatar: String(p.avatarUrl || p.avatar || ""),
    verified: !!p.verified || !!p.isVerified,
    role: "dancer",
    level: Number(p.level ?? 1),
    xp: Number(p.xp ?? 0),
    xpToNext: Number(p.xpToNext ?? 1000),
    rankTitle: String(p.rankTitle || "Rookie Trancer"),
    dayStreak: Number(p.dayStreak ?? 0),
    totalPoints: Number(p.totalPoints ?? 0),
    routinesMastered: Number(p.routinesMastered ?? 0),
    globalRank: Number(p.globalRank ?? 9999),
    tranceEnergy: Number(p.tranceEnergy ?? 100),
    bio: String(p.bio || "Trey TV Dance Universe member."),
    cover: String(p.bannerUrl || p.cover || ""),
    memberNumber: p.memberNumber ? Number(p.memberNumber) : undefined,
  };
};

async function ensureProfile(
  userId: string,
  meta?: { handle?: string; display_name?: string },
): Promise<DancerProfile> {
  try {
    const { data: existing, error } = await supabase
      .from("trance_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    if (existing) return rowToProfile(existing);

    // Initial sign-in: create a default profile row.
    const handle = meta?.handle || "@trancer_" + userId.slice(0, 5);
    const displayName = meta?.display_name || "Trancer " + userId.slice(0, 5);

    const insert = {
      id: userId,
      handle,
      display_name: displayName,
      roles: ["dancer"],
      permissions: [
        "browse_public_routines",
        "practice_routines",
        "view_own_scores",
        "join_studio_rooms",
      ],
    };

    const { data: created, error: insErr } = await supabase
      .from("trance_profiles")
      .insert(insert)
      .select("*")
      .maybeSingle();

    if (insErr) throw insErr;
    return created ? rowToProfile(created) : rowToProfile(insert);
  } catch (err) {
    console.error("Supabase profile fetch failed, using local fallback:", err);
    return {
      id: userId,
      handle: meta?.handle || "@dev_trancer",
      displayName: meta?.display_name || "Dev Trancer",
      avatar: "",
      verified: false,
      role: "dancer",
      level: 1,
      xp: 0,
      xpToNext: 1000,
      rankTitle: "Rookie Trancer",
      dayStreak: 0,
      totalPoints: 0,
      routinesMastered: 0,
      globalRank: 9999,
      tranceEnergy: 100,
      bio: "Running in developer fallback mode.",
      cover: "",
    };
  }
}

export const tranceAuthBridge = {
  getCurrentUser: async (): Promise<DancerProfile | null> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      return ensureProfile(user.id);
    } catch {
      return null;
    }
  },

  getCurrentIdentity: async (): Promise<TranceIdentity | null> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("trance_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) return rowToIdentity(profile);

      return rowToIdentity({
        id: user.id,
        display_name: user.user_metadata?.display_name || "Trancer",
        handle: user.user_metadata?.handle || "@trancer",
      });
    } catch {
      return null;
    }
  },

  isAuthenticated: async (): Promise<boolean> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return !!session;
    } catch {
      return false;
    }
  },

  signUp: async (email: string, password: string, displayName: string): Promise<DancerProfile> => {
    const handle =
      "@" +
      email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, handle } },
    });
    if (error) throw error;
    if (!data.user) throw new Error("Sign up failed.");
    return ensureProfile(data.user.id, { handle, display_name: displayName });
  },

  signIn: async (email: string, password: string): Promise<DancerProfile> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error("Sign in failed.");
    return ensureProfile(data.user.id);
  },

  signOut: async (): Promise<void> => {
    await supabase.auth.signOut();
  },

  updateProfile: async (id: string, patch: Partial<DancerProfile>): Promise<void> => {
    const dbPatch: Record<string, unknown> = {};
    if (patch.displayName) dbPatch.display_name = patch.displayName;
    if (patch.handle) dbPatch.handle = patch.handle;
    if (patch.bio) dbPatch.bio = patch.bio;
    if (patch.avatar) dbPatch.avatar_url = patch.avatar;

    try {
      await supabase.from("trance_profiles").update(dbPatch).eq("id", id);
    } catch (e) {
      console.warn("Could not update profile on Supabase:", e);
    }
  },

  onAuthChange: (cb: (profile: DancerProfile | null) => void) => {
    try {
      const { data } = supabase.auth.onAuthStateChange(async (_e: any, session: any) => {
        if (session?.user) cb(await ensureProfile(session.user.id));
        else cb(null);
      });
      return () => data.subscription.unsubscribe();
    } catch {
      return () => {};
    }
  },

  // Seeded first profile data representing Trey Trizzy
  demoProfile: {
    id: "u001",
    handle: "@treytrizzy",
    displayName: "Trey Trizzy",
    avatar:
      "https://d64gsuwffb70l.cloudfront.net/6a1ddb096616cb7e4e894f24_1780341613307_1a2c4519.jpg",
    verified: true,
    role: "dancer" as const,
    level: 25,
    xp: 8742,
    xpToNext: 10000,
    rankTitle: "Elite Trancer",
    dayStreak: 124,
    totalPoints: 3860,
    routinesMastered: 87,
    globalRank: 42,
    tranceEnergy: 860,
    bio: "Trey TV Founder. Dancer. Visionary. Leading the movement.",
    cover:
      "https://d64gsuwffb70l.cloudfront.net/6a1ddb096616cb7e4e894f24_1780341613307_1a2c4519.jpg",
    memberNumber: 1,
  },

  demoIdentity: {
    authUserId: "u001",
    treyTvProfileId: "tv-prof-u001",
    publicProfileUid: "pub-uid-u001",
    treyTvUid: "trey-tv-uid-u001",
    tranceSpecificProfileId: "trance-prof-u001",
    displayName: "Trey Trizzy",
    handle: "@treytrizzy",
    avatarUrl:
      "https://d64gsuwffb70l.cloudfront.net/6a1ddb096616cb7e4e894f24_1780341613307_1a2c4519.jpg",
    bannerUrl:
      "https://d64gsuwffb70l.cloudfront.net/6a1ddb096616cb7e4e894f24_1780341613307_1a2c4519.jpg",
    treyTvRoles: ["admin"] as TranceRole[],
    tranceRoles: ["dancer", "choreographer"] as TranceRole[],
    activeMode: "Learn" as const,
    permissions: [
      "browse_public_routines",
      "practice_routines",
      "view_own_scores",
      "join_studio_rooms",
      "create_public_routines",
      "create_dance_sessions",
      "review_submissions",
      "manage_own_channel",
      "create_private_rehearsal_rooms",
      "invite_dancers",
      "assign_rehearsal_videos",
      "upload_studio_files",
      "manage_private_show_prep",
      "view_assigned_private_content",
      "moderate_content",
      "restrict_content",
      "verify_choreographers",
      "approve_content",
      "feature_content",
      "remove_content",
    ] as TrancePermission[],

    // Compatibility fields
    avatar:
      "https://d64gsuwffb70l.cloudfront.net/6a1ddb096616cb7e4e894f24_1780341613307_1a2c4519.jpg",
    activeRoles: ["dancer", "choreographer", "admin"] as TranceRole[],
  },
};
