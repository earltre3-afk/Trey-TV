/**
 * social-relationships.ts
 * Client-side helper functions for social relationships (follow, block, Top 3)
 * These functions interact with Supabase and the server-side functions we created.
 */

import { createBrowserClient } from "./supabase-browser";
import { toast } from "sonner";

export interface RelationshipStatus {
  is_following: boolean;
  is_followed_by: boolean;
  is_mutual_follow: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  can_follow: boolean;
  can_message: boolean;
  can_add_to_top_three: boolean;
}

export interface TopThreeEntry {
  id: string;
  profile_user_id: string;
  featured_user_id: string;
  position: number;
  featured_username: string | null;
  featured_display_name: string | null;
  featured_avatar_url: string | null;
  featured_public_profile_uid: string | null;
  is_mutual_top_three: boolean;
}

export interface SocialCounts {
  followers: number;
  following: number;
}

// ============================================================
// FOLLOW / UNFOLLOW ==========================================
// ============================================================

export async function followUser(targetUserId: string): Promise<boolean> {
  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please sign in to follow users");
      return false;
    }

    if (user.id === targetUserId) {
      toast.error("You cannot follow yourself");
      return false;
    }

    // Check if blocked relationship exists
    const { data: relationshipData, error: relationshipError } = await supabase
      .rpc("get_relationship_status", {
        _viewer_id: user.id,
        _target_id: targetUserId,
      } as any);

    if (relationshipError) {
      console.error("Error checking relationship status:", relationshipError);
      toast.error("Failed to check relationship status");
      return false;
    }

    const relationship = relationshipData as RelationshipStatus;
    if (!relationship.can_follow) {
      toast.error(relationship.is_blocked ? "You have blocked this user" : "This user has blocked you");
      return false;
    }

    // Insert follow relationship
    const { error } = await supabase
      .from("follows")
      .insert({
        follower_id: user.id,
        following_id: targetUserId,
      } as any);

    if (error) {
      if (error.code === "23505") {
        return true;
      }
      console.error("Error following user:", error);
      toast.error(error.message || "Failed to follow user");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in followUser:", error);
    toast.error("Failed to follow user");
    return false;
  }
}

export async function unfollowUser(targetUserId: string): Promise<boolean> {
  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please sign in to unfollow users");
      return false;
    }

    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId);

    if (error) {
      console.error("Error unfollowing user:", error);
      toast.error("Failed to unfollow user");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in unfollowUser:", error);
    toast.error("Failed to unfollow user");
    return false;
  }
}

export async function toggleFollow(targetUserId: string, currentlyFollowing: boolean): Promise<boolean> {
  if (currentlyFollowing) {
    return await unfollowUser(targetUserId);
  } else {
    return await followUser(targetUserId);
  }
}

export async function getSocialCounts(targetUserId: string): Promise<SocialCounts> {
  try {
    const supabase = createBrowserClient();
    const [followersResult, followingResult] = await Promise.all([
      supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", targetUserId),
      supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", targetUserId),
    ]);

    return {
      followers: followersResult.count ?? 0,
      following: followingResult.count ?? 0,
    };
  } catch (error) {
    console.error("Error getting social counts:", error);
    return { followers: 0, following: 0 };
  }
}

// ============================================================
// BLOCK / UNBLOCK ============================================
// ============================================================

export async function blockUser(targetUserId: string): Promise<boolean> {
  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please sign in to block users");
      return false;
    }

    if (user.id === targetUserId) {
      toast.error("You cannot block yourself");
      return false;
    }

    const { error } = await supabase.rpc("block_user", {
      _target_user_id: targetUserId,
    } as any);

    if (error) {
      console.error("Error blocking user:", error);
      toast.error(error.message || "Failed to block user");
      return false;
    }

    toast.success("User blocked");
    return true;
  } catch (error) {
    console.error("Error in blockUser:", error);
    toast.error("Failed to block user");
    return false;
  }
}

export async function unblockUser(targetUserId: string): Promise<boolean> {
  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please sign in to unblock users");
      return false;
    }

    const { error } = await supabase.rpc("unblock_user", {
      _target_user_id: targetUserId,
    } as any);

    if (error) {
      console.error("Error unblocking user:", error);
      toast.error("Failed to unblock user");
      return false;
    }

    toast.success("User unblocked");
    return true;
  } catch (error) {
    console.error("Error in unblockUser:", error);
    toast.error("Failed to unblock user");
    return false;
  }
}

export async function getRelationshipStatus(targetUserId: string): Promise<RelationshipStatus | null> {
  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase.rpc("get_relationship_status", {
      _viewer_id: user.id,
      _target_id: targetUserId,
    } as any);

    if (error) {
      console.error("Error getting relationship status:", error);
      return null;
    }

    return data as RelationshipStatus;
  } catch (error) {
    console.error("Error in getRelationshipStatus:", error);
    return null;
  }
}

// ============================================================
// TOP 3 ======================================================
// ============================================================

export async function getTopThree(profileUserId: string): Promise<TopThreeEntry[]> {
  try {
    const supabase = createBrowserClient();

    const { data, error } = await supabase.rpc("get_profile_top_three", {
      _profile_user_id: profileUserId,
    } as any);

    if (error) {
      console.error("Error getting Top 3:", error);
      return [];
    }

    return (data as TopThreeEntry[]) || [];
  } catch (error) {
    console.error("Error in getTopThree:", error);
    return [];
  }
}

export async function addToTopThree(featuredUserId: string, position: number): Promise<boolean> {
  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please sign in to manage your Top 3");
      return false;
    }

    const { error } = await supabase.rpc("add_to_top_three", {
      _featured_user_id: featuredUserId,
      _position: position,
    } as any);

    if (error) {
      console.error("Error adding to Top 3:", error);
      toast.error(error.message || "Failed to add to Top 3");
      return false;
    }

    toast.success("Added to Top 3");
    return true;
  } catch (error) {
    console.error("Error in addToTopThree:", error);
    toast.error("Failed to add to Top 3");
    return false;
  }
}

export async function removeFromTopThree(featuredUserId: string): Promise<boolean> {
  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please sign in to manage your Top 3");
      return false;
    }

    const { error } = await supabase.rpc("remove_from_top_three", {
      _featured_user_id: featuredUserId,
    } as any);

    if (error) {
      console.error("Error removing from Top 3:", error);
      toast.error("Failed to remove from Top 3");
      return false;
    }

    toast.success("Removed from Top 3");
    return true;
  } catch (error) {
    console.error("Error in removeFromTopThree:", error);
    toast.error("Failed to remove from Top 3");
    return false;
  }
}

export async function reorderTopThree(featuredUserId: string, newPosition: number): Promise<boolean> {
  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please sign in to manage your Top 3");
      return false;
    }

    const { error } = await supabase.rpc("reorder_top_three", {
      _featured_user_id: featuredUserId,
      _new_position: newPosition,
    } as any);

    if (error) {
      console.error("Error reordering Top 3:", error);
      toast.error(error.message || "Failed to reorder Top 3");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in reorderTopThree:", error);
    toast.error("Failed to reorder Top 3");
    return false;
  }
}

export async function getMyTopThree(): Promise<TopThreeEntry[]> {
  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    return await getTopThree(user.id);
  } catch (error) {
    console.error("Error in getMyTopThree:", error);
    return [];
  }
}

// ============================================================
// SEARCH USERS FOR TOP 3 =====================================
// ============================================================

export async function searchUsersForTopThree(query: string, limit: number = 20): Promise<any[]> {
  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    // Search users that the current user follows or who follow them
    const { data: followData, error: followError } = await supabase
      .from("follows")
      .select(`
        following_id,
        follower_id,
        following_profile:profiles!follows_following_id_fkey (
          id,
          public_profile_uid,
          username,
          display_name,
          avatar_url
        ),
        follower_profile:profiles!follows_follower_id_fkey (
          id,
          public_profile_uid,
          username,
          display_name,
          avatar_url
        )
      `)
      .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`)
      .limit(limit * 2) as any;

    if (followError) {
      console.error("Error searching users:", followError);
      return [];
    }

    // Extract unique profiles
    const profilesMap = new Map();
    
    if (followData) {
      for (const row of followData) {
        // Add following profile
        if ((row as any).following_profile && (row as any).following_profile.id !== user.id) {
          const profile = (row as any).following_profile;
          if (!profilesMap.has(profile.id)) {
            profilesMap.set(profile.id, profile);
          }
        }
        // Add follower profile
        if ((row as any).follower_profile && (row as any).follower_profile.id !== user.id) {
          const profile = (row as any).follower_profile;
          if (!profilesMap.has(profile.id)) {
            profilesMap.set(profile.id, profile);
          }
        }
      }
    }

    // Filter by query and convert to array
    const profiles = Array.from(profilesMap.values()).filter((profile: any) => {
      const searchStr = `${profile.display_name || ''} ${profile.username || ''}`.toLowerCase();
      return searchStr.includes(query.toLowerCase());
    }).slice(0, limit);

    const checked = await Promise.all(
      profiles.map(async (profile: any) => {
        const relationship = await getRelationshipStatus(profile.id);
        return relationship?.can_add_to_top_three === false ? null : profile;
      }),
    );

    return checked.filter(Boolean);
  } catch (error) {
    console.error("Error in searchUsersForTopThree:", error);
    return [];
  }
}

export async function getMutualFollows(): Promise<any[]> {
  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Query follows where follower_id is current user
    const { data: followingData } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    if (!followingData || followingData.length === 0) return [];
    const followingIds = followingData.map((f: any) => f.following_id);

    // Query follows where follower_id is in followingIds AND following_id is current user
    const { data: mutualData } = await supabase
      .from("follows")
      .select(`
        follower_id,
        follower_profile:profiles!follows_follower_id_fkey (
          id,
          public_profile_uid,
          username,
          display_name,
          avatar_url,
          verification_type
        )
      `)
      .eq("following_id", user.id)
      .in("follower_id", followingIds);

    if (!mutualData) return [];
    return mutualData.map((m: any) => m.follower_profile).filter(Boolean);
  } catch (error) {
    console.error("Error fetching mutual follows:", error);
    return [];
  }
}
