import { supabase } from "@/lib/supabase";
import { Badge, BadgeAward } from "../types";
import { badges as devBadges } from "../data/devFixtures";
import { assertConfigured, shouldUseFixtures } from "./config";

async function ensureDefaultBadges() {
  try {
    const defaults = [
      {
        id: "first_session",
        name: "First TRANCE Session",
        description: "You took your first steps in the TRANCE universe.",
        tier: "magenta",
        icon: "Flame",
      },
      {
        id: "first_routine",
        name: "First Routine Completed",
        description: "Completed your first choreography routine.",
        tier: "cyan",
        icon: "Award",
      },
    ];
    for (const badge of defaults) {
      await supabase.from("trance_badges").upsert(badge);
    }
  } catch (err) {
    console.error("Failed to ensure default badges:", err);
  }
}

export const tranceBadgeService = {
  getBadges: async (userId?: string): Promise<Badge[]> => {
    assertConfigured("BadgeService");
    if (shouldUseFixtures()) {
      return devBadges;
    }

    await ensureDefaultBadges();

    // Get all badges
    const { data: allBadges, error: badgeErr } = await supabase.from("trance_badges").select("*");

    if (badgeErr) throw badgeErr;

    if (!userId) {
      return (allBadges as unknown as Badge[]) || [];
    }

    // If user is provided, query awards to mark "earned"
    const { data: awards, error: awardErr } = await supabase
      .from("trance_badge_awards")
      .select("badge_id")
      .eq("user_id", userId);

    if (awardErr) throw awardErr;

    const earnedIds = new Set(awards?.map((a: any) => a.badge_id) || []);

    const badgesList = (allBadges || []) as unknown as Badge[];

    return badgesList.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      tier: b.tier,
      icon: b.icon,
      earned: earnedIds.has(b.id),
    }));
  },

  unlockBadge: async (userId: string, badgeId: string): Promise<BadgeAward | null> => {
    assertConfigured("BadgeService");
    if (shouldUseFixtures()) {
      console.log(`[Dev Mode] Mock unlock badge ${badgeId} for user ${userId}`);
      return {
        id: `awd-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        badgeId,
        awardedAt: new Date().toISOString(),
        txHash: "0xmockRewardsHash",
      };
    }

    await ensureDefaultBadges();

    // Check if already earned
    const { data: existing } = await supabase
      .from("trance_badge_awards")
      .select("*")
      .eq("user_id", userId)
      .eq("badge_id", badgeId)
      .maybeSingle();

    if (existing) {
      return {
        id: existing.id,
        userId: existing.user_id,
        badgeId: existing.badge_id,
        awardedAt: existing.created_at,
        txHash: existing.tx_hash,
      };
    }

    const txHash = `trey-rewards-tx-${Date.now()}`;

    const { data, error } = await supabase
      .from("trance_badge_awards")
      .insert({
        user_id: userId,
        badge_id: badgeId,
        tx_hash: txHash,
      })
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      badgeId: data.badge_id,
      awardedAt: data.created_at,
      txHash: data.tx_hash,
    };
  },
};
