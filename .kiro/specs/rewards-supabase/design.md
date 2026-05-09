# Design: Rewards — Supabase Wiring

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09

---

## 1. Architecture Overview

```
rewards.tsx
  ├── useRewards()          ← NEW hook (src/hooks/use-rewards.ts)
  │     ├── useCurrentUser()  ← existing hook (user_id + public_profile_uid)
  │     ├── supabase-browser  ← existing client
  │     ├── community_credit_balances  ← SELECT (RLS: user_id = auth.uid())
  │     └── community_credit_events    ← SELECT (RLS: user_id = auth.uid())
  └── useCurrentUser()      ← existing hook (for uid/card number)
```

Two new data reads. One new file. Targeted edits to `rewards.tsx` only.

---

## 2. New Hook: `use-rewards.ts`

### Public interface

```ts
type RewardTransaction = {
  id: string;
  title: string;
  delta: number;   // positive = earn, negative = spend
  when: string;    // relative time string
};

type UseRewardsReturn = {
  balance: number;
  tier: string;
  streakDays: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  transactions: RewardTransaction[];
  loading: boolean;
};
```

`RewardTransaction` mirrors the existing hardcoded transaction shape in `rewards.tsx` exactly — no changes needed to the JSX that renders it.

---

## 3. Data Flow

### 3a. Load (mount)

```
useRewards() mounts
  → user = useCurrentUser()
  → if null: return { balance:0, tier:'VIEWER', streakDays:0, lifetimeEarned:0, lifetimeSpent:0, transactions:[], loading:false }
  → setLoading(true)
  → parallel:
      supabase.from('community_credit_balances')
        .select('current_balance, lifetime_earned, lifetime_spent, engagement_level, current_streak_days')
        .eq('user_id', user.id)
        .maybeSingle()

      supabase.from('community_credit_events')
        .select('id, event_type, points, created_at')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(20)
  → on balance row null (no record yet): use zero defaults
  → on error: use zero defaults, no crash
  → map results → state
  → setLoading(false)
```

### 3b. No writes

The hook has no `markRead`, no `send`, no `insert`. Read-only.

---

## 4. Type Mapping

### `engagement_level` → `tier` display string

```ts
const TIER_LABELS: Record<string, string> = {
  viewer: 'VIEWER',
  supporter: 'SUPPORTER',
  regular: 'REGULAR',
  premiere_pull_up: 'PREMIERE',
  channel_champion: 'CHAMPION',
  trey_tv_insider: 'INSIDER',
  community_mvp: 'MVP',
};
function toTier(level: string | null): string {
  return TIER_LABELS[level ?? ''] ?? 'VIEWER';
}
```

### `event_type` → transaction `title`

```ts
const EVENT_TITLES: Record<string, string> = {
  episode_watch_completed: 'Watched episode',
  episode_liked: 'Liked content',
  episode_saved: 'Saved content',
  meaningful_comment: 'Meaningful comment',
  comment_liked: 'Comment liked',
  premiere_attended: 'Attended premiere',
  daily_streak: 'Daily streak bonus',
  weekly_streak: 'Weekly streak bonus',
  creator_followed: 'Followed a creator',
  friend_invited: 'Friend invited',
  helpful_report_confirmed: 'Helpful report',
};
function toTitle(eventType: string): string {
  return EVENT_TITLES[eventType] ?? eventType.replace(/_/g, ' ');
}
```

### `created_at` → relative `when` string

```ts
function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 86400) return 'Today';
  if (s < 172800) return 'Yesterday';
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return `${Math.floor(s / 604800)}w ago`;
}
```

### Internal Supabase types

```ts
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
  created_at: string;
};
```

Internal only — not exported.

---

## 5. Changes to `rewards.tsx`

Five targeted replacements only:

| # | Current | Replacement |
|---|---|---|
| 1 | `user?.rewards?.points ?? 12480` | `balance` from `useRewards()` |
| 2 | `user?.rewards?.tier ?? 'GOLD'` | `tier` from `useRewards()` |
| 3 | `user?.uid ?? '0000000000000000'` | `currentUser?.public_profile_uid ?? currentUser?.id ?? '0000000000000000'` |
| 4 | `const transactions = [...]` (hardcoded) | `transactions` from `useRewards()` |
| 5 | Quick stats hardcoded values | `lifetimeEarned`, `lifetimeSpent`, `streakDays` from `useRewards()` |

Add two imports: `useRewards` and `useCurrentUser`. No JSX structure changes.

The hardcoded `transactions` array is preserved as a comment block for rollback.

---

## 6. Quick Stats Mapping

| Stat label | Current hardcoded | Hook field |
|---|---|---|
| Earned (30d) | `+3,240` | `lifetimeEarned.toLocaleString()` (prefixed `+`) |
| Spent (30d) | `1,800` | `lifetimeSpent.toLocaleString()` |
| Streak | `12d` | `` `${streakDays}d` `` |

Note: `lifetime_earned` and `lifetime_spent` are all-time totals, not 30-day. The label "Earned (30d)" / "Spent (30d)" is a UI label in the Lovable design — it is not changed. The data is the best available from the schema without a date-filtered aggregation query.

---

## 7. Files Changed

| File | Change |
|---|---|
| `src/hooks/use-rewards.ts` | New file |
| `src/routes/rewards.tsx` | 5 targeted replacements + 2 new imports |

No other files touched.

---

## 8. Rollback Plan

Before modifying `rewards.tsx`, the three hardcoded value lines and the `transactions` array are preserved as comment blocks. To rollback: remove the two hook imports, uncomment the originals. One-minute revert.

---

## 9. Validation

```
pnpm tsc --noEmit   # zero errors
pnpm build          # clean build
```
