import { c as createBrowserClient } from "./router-BtgGywEC.mjs";
import { t as toast } from "../_libs/sonner.mjs";
async function followUser(targetUserId) {
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
    const { data: relationshipData, error: relationshipError } = await supabase.rpc("get_relationship_status", {
      _viewer_id: user.id,
      _target_id: targetUserId
    });
    if (relationshipError) {
      console.error("Error checking relationship status:", relationshipError);
      toast.error("Failed to check relationship status");
      return false;
    }
    const relationship = relationshipData;
    if (!relationship.can_follow) {
      toast.error(relationship.is_blocked ? "You have blocked this user" : "This user has blocked you");
      return false;
    }
    const { error } = await supabase.from("follows").insert({
      follower_id: user.id,
      following_id: targetUserId
    });
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
async function unfollowUser(targetUserId) {
  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to unfollow users");
      return false;
    }
    const { error } = await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetUserId);
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
async function toggleFollow(targetUserId, currentlyFollowing) {
  if (currentlyFollowing) {
    return await unfollowUser(targetUserId);
  } else {
    return await followUser(targetUserId);
  }
}
async function getSocialCounts(targetUserId) {
  try {
    const supabase = createBrowserClient();
    const [followersResult, followingResult] = await Promise.all([
      supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", targetUserId),
      supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", targetUserId)
    ]);
    return {
      followers: followersResult.count ?? 0,
      following: followingResult.count ?? 0
    };
  } catch (error) {
    console.error("Error getting social counts:", error);
    return { followers: 0, following: 0 };
  }
}
async function getRelationshipStatus(targetUserId) {
  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }
    const { data, error } = await supabase.rpc("get_relationship_status", {
      _viewer_id: user.id,
      _target_id: targetUserId
    });
    if (error) {
      console.error("Error getting relationship status:", error);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error in getRelationshipStatus:", error);
    return null;
  }
}
async function getTopThree(profileUserId) {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.rpc("get_profile_top_three", {
      _profile_user_id: profileUserId
    });
    if (error) {
      console.error("Error getting Top 3:", error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Error in getTopThree:", error);
    return [];
  }
}
async function addToTopThree(featuredUserId, position) {
  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to manage your Top 3");
      return false;
    }
    const { error } = await supabase.rpc("add_to_top_three", {
      _featured_user_id: featuredUserId,
      _position: position
    });
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
async function removeFromTopThree(featuredUserId) {
  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to manage your Top 3");
      return false;
    }
    const { error } = await supabase.rpc("remove_from_top_three", {
      _featured_user_id: featuredUserId
    });
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
async function reorderTopThree(featuredUserId, newPosition) {
  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to manage your Top 3");
      return false;
    }
    const { error } = await supabase.rpc("reorder_top_three", {
      _featured_user_id: featuredUserId,
      _new_position: newPosition
    });
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
async function getMyTopThree() {
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
async function searchUsersForTopThree(query, limit = 20) {
  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }
    const { data: followData, error: followError } = await supabase.from("follows").select(`
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
      `).or(`follower_id.eq.${user.id},following_id.eq.${user.id}`).limit(limit * 2);
    if (followError) {
      console.error("Error searching users:", followError);
      return [];
    }
    const profilesMap = /* @__PURE__ */ new Map();
    if (followData) {
      for (const row of followData) {
        if (row.following_profile && row.following_profile.id !== user.id) {
          const profile = row.following_profile;
          if (!profilesMap.has(profile.id)) {
            profilesMap.set(profile.id, profile);
          }
        }
        if (row.follower_profile && row.follower_profile.id !== user.id) {
          const profile = row.follower_profile;
          if (!profilesMap.has(profile.id)) {
            profilesMap.set(profile.id, profile);
          }
        }
      }
    }
    const profiles = Array.from(profilesMap.values()).filter((profile) => {
      const searchStr = `${profile.display_name || ""} ${profile.username || ""}`.toLowerCase();
      return searchStr.includes(query.toLowerCase());
    }).slice(0, limit);
    const checked = await Promise.all(
      profiles.map(async (profile) => {
        const relationship = await getRelationshipStatus(profile.id);
        return relationship?.can_add_to_top_three === false ? null : profile;
      })
    );
    return checked.filter(Boolean);
  } catch (error) {
    console.error("Error in searchUsersForTopThree:", error);
    return [];
  }
}
async function getMutualFollows() {
  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data: followingData } = await supabase.from("follows").select("following_id").eq("follower_id", user.id);
    if (!followingData || followingData.length === 0) return [];
    const followingIds = followingData.map((f) => f.following_id);
    const { data: mutualData } = await supabase.from("follows").select(`
        follower_id,
        follower_profile:profiles!follows_follower_id_fkey (
          id,
          public_profile_uid,
          username,
          display_name,
          avatar_url,
          verification_type
        )
      `).eq("following_id", user.id).in("follower_id", followingIds);
    if (!mutualData) return [];
    return mutualData.map((m) => m.follower_profile).filter(Boolean);
  } catch (error) {
    console.error("Error fetching mutual follows:", error);
    return [];
  }
}
export {
  getMyTopThree as a,
  removeFromTopThree as b,
  addToTopThree as c,
  getSocialCounts as d,
  getMutualFollows as g,
  reorderTopThree as r,
  searchUsersForTopThree as s,
  toggleFollow as t
};
