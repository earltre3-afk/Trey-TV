import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { createBrowserClient } from "@/lib/supabase-browser";

export type RewardTransaction = {
  id: string;
  title: string;
  delta: number;
  when: string;
};

type BalanceRow = {
  current_balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  engagement_level: string | null;
  current_streak_days: number;
};

type EventRow = {
  id: string;
  event_type: string;
  points: number;
  status: string;
  created_at: string;
};

type UseRewardsReturn = {
  balance: number;
  tier: string;
  tierProgress: number;
  nextTier: string | null;
  nextTierAt: number | null;
  pointsToNextTier: number;
  streakDays: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  transactions: RewardTransaction[];
  loading: boolean;
  refresh: () => void;
  spend: (input: { points: number; eventType: string; sourceType?: string; sourceId?: string; metadata?: Record<string, unknown> }) => Promise<{ ok: true } | { ok: false; error: unknown }>;
};

const fallbackTransactions: RewardTransaction[] = [
  { id: "t1", title: "Daily streak bonus", delta: +120, when: "Today" },
  { id: "t2", title: "Sent Mansion Estate gift · Chris H.", delta: -2500, when: "Yesterday" },
  { id: "t3", title: "Comment milestone (50)", delta: +200, when: "2d ago" },
  { id: "t4", title: "Subscription redeem - Pro", delta: -2500, when: "5d ago" },
  { id: "t5", title: "Watched 3hr - weekly bonus", delta: +400, when: "1w ago" },
];

const fallbackRewards: UseRewardsReturn = {
  balance: 12480,
  tier: "RED",
  tierProgress: 24.96,
  nextTier: "GOLD",
  nextTierAt: 50000,
  pointsToNextTier: 37520,
  streakDays: 12,
  lifetimeEarned: 12480,
  lifetimeSpent: 1800,
  transactions: fallbackTransactions,
  loading: false,
  refresh: () => undefined,
  spend: async () => ({ ok: false, error: "signed-out" }),
};

const tierLabels: Record<string, string> = {
  viewer: "VIEWER",
  supporter: "SUPPORTER",
  regular: "REGULAR",
  premiere_pull_up: "PREMIERE",
  channel_champion: "CHAMPION",
  trey_tv_insider: "INSIDER",
  community_mvp: "MVP",
};

export const REWARD_TIERS = [
  { id: "WHITE", min: 0, label: "White", rank: "New member", perks: ["Starter profile badge", "Basic reward wallet"] },
  { id: "GREEN", min: 5000, label: "Green", rank: "Growing", perks: ["Early community drops", "5% membership discount"] },
  { id: "RED", min: 15000, label: "Red", rank: "Core member", perks: ["One music-review skip monthly", "Event presale access"] },
  { id: "GOLD", min: 50000, label: "Gold", rank: "Top member", perks: ["Priority music-review skip", "15% membership discount", "VIP content/event perks"] },
] as const;

export function pointsToRewardTier(points: number) {
  const current = [...REWARD_TIERS].reverse().find((tier) => points >= tier.min) ?? REWARD_TIERS[0];
  const currentIndex = REWARD_TIERS.findIndex((tier) => tier.id === current.id);
  const next = REWARD_TIERS[currentIndex + 1] ?? null;
  const previousMin = current.min;
  const nextMin = next?.min ?? current.min;
  const tierProgress = next
    ? Math.min(100, Math.max(0, ((points - previousMin) / (nextMin - previousMin)) * 100))
    : 100;

  return {
    tier: current.id,
    tierProgress,
    nextTier: next?.id ?? null,
    nextTierAt: next?.min ?? null,
    pointsToNextTier: next ? Math.max(0, next.min - points) : 0,
  };
}

const emptyRewards: UseRewardsReturn = {
  balance: 0,
  ...pointsToRewardTier(0),
  streakDays: 0,
  lifetimeEarned: 0,
  lifetimeSpent: 0,
  transactions: [],
  loading: false,
  refresh: () => undefined,
  spend: async () => ({ ok: false, error: "signed-out" }),
};

const eventTitles: Record<string, string> = {
  episode_watch_completed: "Watched episode",
  episode_liked: "Liked content",
  episode_saved: "Saved content",
  meaningful_comment: "Meaningful comment",
  comment_liked: "Comment liked",
  premiere_attended: "Attended premiere",
  daily_streak: "Daily streak bonus",
  weekly_streak: "Weekly streak bonus",
  creator_followed: "Followed a creator",
  friend_invited: "Friend invited",
  helpful_report_confirmed: "Helpful report",
  gift_sent: "Sent creator gift",
  perk_redeemed: "Redeemed perk",
};

const balanceColumns = "current_balance, lifetime_earned, lifetime_spent, engagement_level, current_streak_days";
const eventColumns = "id, event_type, points, status, created_at";

function creditBalancesTable(supabase: ReturnType<typeof createBrowserClient>) {
  return (supabase as any).from("community_credit_balances");
}

function creditEventsTable(supabase: ReturnType<typeof createBrowserClient>) {
  return (supabase as any).from("community_credit_events");
}

export function engagementLevelToTier(level: string | null): string {
  return tierLabels[level ?? ""] ?? "VIEWER";
}

export function eventTypeToTitle(eventType: string): string {
  return eventTitles[eventType] ?? eventType.replace(/_/g, " ");
}

export function rewardTimeAgo(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 86400) return "Today";
  if (seconds < 172800) return "Yesterday";
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

function mapTransaction(row: EventRow): RewardTransaction {
  return {
    id: row.id,
    title: eventTypeToTitle(row.event_type),
    delta: row.points,
    when: rewardTimeAgo(row.created_at),
  };
}

export function useRewards(): UseRewardsReturn {
  const { user, loading: authLoading } = useAuth();
  const [rewards, setRewards] = useState<UseRewardsReturn>(fallbackRewards);
  const [loading, setLoading] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadRewards() {
      if (authLoading) return;

      if (!user) {
        setRewards(fallbackRewards);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const supabase = createBrowserClient();
        await (supabase as any).rpc("ensure_user_credit_balance", { _user_id: user.id });
        const [balanceResult, eventsResult] = await Promise.all([
          creditBalancesTable(supabase).select(balanceColumns).eq("user_id", user.id).maybeSingle(),
          creditEventsTable(supabase)
            .select(eventColumns)
            .eq("user_id", user.id)
            .eq("status", "approved")
            .order("created_at", { ascending: false })
            .limit(20),
        ]);

        const balanceRow = (balanceResult.data ?? null) as BalanceRow | null;
        const eventRows = ((eventsResult.data ?? []) as EventRow[]).filter((event) => event.status === "approved");

        if (!mounted) return;

        if (balanceResult.error || eventsResult.error) {
          console.error("Failed to load UID rewards:", balanceResult.error || eventsResult.error);
          setRewards(emptyRewards);
          return;
        }

        if (!balanceRow) {
          setRewards(emptyRewards);
          return;
        }

        const earned = balanceRow.lifetime_earned || balanceRow.current_balance;
        const tierMeta = pointsToRewardTier(earned);
        setRewards({
          balance: balanceRow.current_balance,
          ...tierMeta,
          streakDays: balanceRow.current_streak_days,
          lifetimeEarned: earned,
          lifetimeSpent: balanceRow.lifetime_spent,
          transactions: eventRows.map(mapTransaction),
          loading: false,
          refresh: () => undefined,
          spend: async () => ({ ok: false, error: "not-ready" }),
        });
      } catch {
        if (mounted) setRewards(fallbackRewards);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadRewards();

    return () => {
      mounted = false;
    };
  }, [authLoading, user, refreshNonce]);

  const refresh = () => setRefreshNonce((n) => n + 1);

  const spend: UseRewardsReturn["spend"] = async (input) => {
    if (!user) return { ok: false, error: "signed-out" };
    try {
      const supabase = createBrowserClient();
      const { error } = await (supabase as any).rpc("spend_community_credit", {
        _points: input.points,
        _event_type: input.eventType,
        _source_type: input.sourceType ?? null,
        _source_id: input.sourceId ?? null,
        _metadata: input.metadata ?? {},
      });
      if (error) throw error;
      refresh();
      return { ok: true };
    } catch (error) {
      console.error("Failed to spend UID rewards:", error);
      return { ok: false, error };
    }
  };

  return {
    ...rewards,
    loading: authLoading || loading,
    refresh,
    spend,
  };
}
