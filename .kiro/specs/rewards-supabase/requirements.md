# Requirements: Rewards — Supabase Wiring

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09  
**Scope:** Read-only rewards display. No payments, no Stripe, no creator payouts, no gift writes, no redemption writes, no admin tools, no redesign.

---

## 1. Goal

Replace the hardcoded fallback values in `src/routes/rewards.tsx` (`points`, `tier`, `uid`) and the hardcoded `transactions` array with real Supabase data from `community_credit_balances` and `community_credit_events`. Gift sending and perk redemption remain toast-only local actions — they are not wired in this phase.

---

## 2. What the Lovable UI Currently Reads

| UI element | Current source | Target source |
|---|---|---|
| `points` | `user?.rewards?.points ?? 12480` | `community_credit_balances.current_balance` |
| `tier` | `user?.rewards?.tier ?? 'GOLD'` | `community_credit_balances.engagement_level` → display string |
| `uid` (card number) | `user?.uid ?? '0000000000000000'` | `profiles.public_profile_uid` (already in `useCurrentUser()`) |
| `transactions` | Hardcoded array (5 items) | `community_credit_events` (recent, approved) |
| Quick stats: Earned (30d) | Hardcoded `+3,240` | `community_credit_balances.lifetime_earned` or sum of events |
| Quick stats: Spent (30d) | Hardcoded `1,800` | `community_credit_balances.lifetime_spent` |
| Quick stats: Streak | Hardcoded `12d` | `community_credit_balances.current_streak_days` |
| Gift creators strip | `mock-data.ts creators` | Remains mock (out of scope this phase) |
| Gift packs / perks | Hardcoded arrays | Remain hardcoded (no writes this phase) |

---

## 3. Schema Verification

### Table: `public.community_credit_balances`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK → `auth.users` | NOT NULL, unique |
| `current_balance` | `integer` | NOT NULL, ≥ 0 |
| `lifetime_earned` | `integer` | NOT NULL, ≥ 0 |
| `lifetime_spent` | `integer` | NOT NULL, ≥ 0 |
| `engagement_level` | `text` | enum — see tier mapping below |
| `current_streak_days` | `integer` | NOT NULL, ≥ 0 |
| `longest_streak_days` | `integer` | NOT NULL, ≥ 0 |
| `updated_at` | `timestamptz` | |
| `created_at` | `timestamptz` | |

### Table: `public.community_credit_events`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK → `auth.users` | NOT NULL |
| `event_type` | `text` | enum — see event type mapping below |
| `points` | `integer` | NOT NULL (positive = earn, negative = spend) |
| `source_id` | `text` | nullable — related entity id |
| `source_type` | `text` | nullable |
| `status` | `text` | `pending` / `approved` / `rejected` / `reversed` |
| `reason` | `text` | nullable |
| `created_at` | `timestamptz` | NOT NULL |
| `reviewed_at` | `timestamptz` | nullable |
| `reviewed_by` | `uuid` | nullable |

### Engagement Level → Display Tier

| `engagement_level` | Display `tier` |
|---|---|
| `viewer` | `VIEWER` |
| `supporter` | `SUPPORTER` |
| `regular` | `REGULAR` |
| `premiere_pull_up` | `PREMIERE` |
| `channel_champion` | `CHAMPION` |
| `trey_tv_insider` | `INSIDER` |
| `community_mvp` | `MVP` |

### Card UID

`profiles.public_profile_uid` — format `423` + 13 digits. Already available from `useCurrentUser()`. No new query needed.

### RLS Policies

| Table | Operation | Policy |
|---|---|---|
| `community_credit_balances` | SELECT | `auth.uid() = user_id` |
| `community_credit_events` | SELECT | `auth.uid() = user_id` |
| `community_rewards` | SELECT | `is_active = true` (public) |
| `community_badges` | SELECT | `is_active = true` (public) |
| `user_badges` | SELECT | `auth.uid() = user_id` |
| `reward_redemptions` | SELECT | `auth.uid() = user_id` |

**No browser INSERT or UPDATE on any rewards table.** All writes are server-side only. The browser is read-only for this entire feature.

---

## 4. Functional Requirements

### FR-1: New `useRewards()` hook
- Create `src/hooks/use-rewards.ts`.
- Exposes: `balance`, `tier`, `streakDays`, `lifetimeEarned`, `lifetimeSpent`, `transactions`, `loading`.
- Signed-out: returns zero/empty state immediately — no Supabase call, no crash, no alert.

### FR-2: Load balance
- Fetch `community_credit_balances` where `user_id = auth.uid()`.
- Single row (unique constraint on `user_id`).
- If no row exists (user has no balance record yet): return zeros for all fields, empty transactions.
- On error: return zeros, no crash.

### FR-3: Load transaction history
- Fetch `community_credit_events` where `user_id = auth.uid()` AND `status = 'approved'`.
- Order: `created_at DESC`, limit 20.
- Map to the Lovable transaction shape: `{ id, title, delta, when }`.
- `title` derived from `event_type` (see mapping below).
- `delta` = `points` field (positive = earn, negative = spend).
- `when` = relative time string from `created_at`.

### FR-4: Event type → transaction title mapping

| `event_type` | Display title |
|---|---|
| `episode_watch_completed` | `Watched episode` |
| `episode_liked` | `Liked content` |
| `episode_saved` | `Saved content` |
| `meaningful_comment` | `Meaningful comment` |
| `comment_liked` | `Comment liked` |
| `premiere_attended` | `Attended premiere` |
| `daily_streak` | `Daily streak bonus` |
| `weekly_streak` | `Weekly streak bonus` |
| `creator_followed` | `Followed a creator` |
| `friend_invited` | `Friend invited` |
| `helpful_report_confirmed` | `Helpful report` |

### FR-5: Wire rewards.tsx to useRewards()
- Replace `user?.rewards?.points ?? 12480` with `balance` from hook.
- Replace `user?.rewards?.tier ?? 'GOLD'` with `tier` from hook.
- Replace `user?.uid ?? '0000000000000000'` with `currentUser?.public_profile_uid ?? currentUser?.id ?? '0000000000000000'` (from `useCurrentUser()`).
- Replace hardcoded `transactions` array with `transactions` from hook.
- Replace hardcoded quick stats values with `lifetimeEarned`, `lifetimeSpent`, `streakDays` from hook.

### FR-6: Signed-out graceful handling
- `useCurrentUser()` returns `null` when unauthenticated.
- Hook returns zero balance, empty transactions, no Supabase call.
- The rewards card renders with `0` points, `VIEWER` tier, and the fallback UID — no crash.

### FR-7: No writes from browser
- The hook never calls `.insert()` or `.update()` on any rewards table.
- Gift sending and perk redemption remain `toast.success(...)` only — unchanged.

### FR-8: Visual preservation
- `rewards.tsx` layout, card design, gift section, perks section, and history section are structurally unchanged.
- The only changes to `rewards.tsx` are replacing the three hardcoded value reads and the `transactions` array with hook data.
- Gift packs, perks, and creator strip remain hardcoded/mock — no visual change.

### FR-9: No private data exposure
- Do not expose `service_role` key.
- Do not log raw Supabase errors to the UI.
- `reviewed_by`, `reviewed_at`, `reason` fields from events are not rendered.

---

## 5. Non-Functional Requirements

- **Build safety:** Every change must pass `pnpm tsc --noEmit` and `pnpm build`.
- **No browser validation:** No Playwright, no screenshots, no Read URL checks.
- **No new dependencies:** Existing packages only.
- **No redesign:** No RESTORE UI components. No structural changes to Lovable components.
- **Rollback:** Hardcoded fallback values preserved as comments before replacement.

---

## 6. Out of Scope

- Gift sending (remains toast-only)
- Perk redemption (remains toast-only)
- `community_rewards` catalog display (perks remain hardcoded)
- `community_badges` / `user_badges` display
- `reward_redemptions` history
- Creator strip (remains mock-data creators)
- Streak calculation or award logic
- Any write operations
- Payments, Stripe, creator payouts
