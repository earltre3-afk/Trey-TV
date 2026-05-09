# File Map — TREY-TV-ANTIGRAVITY

## Entry Points
```
src/start.ts          — Cloudflare Worker entry
src/server.ts         — Server-side handler
src/router.tsx        — TanStack Router setup
src/routeTree.gen.ts  — Auto-generated route tree (do not edit)
src/styles.css        — Global styles
```

## Routes (`src/routes/`)
```
__root.tsx                        — Root layout (BottomNav lives here)
index.tsx                         — Home feed (/)
u.$uid.tsx                        — Public profile (/u/:uid)
login.tsx                         — Login
signup.tsx                        — Signup
edit-profile.tsx                  — Edit profile (REAL — profiles table, tsc ✅ build ✅; avatar/banner upload out of scope)
settings.tsx                      — Settings
inbox.tsx                         — DMs / inbox
notifications.tsx                 — Notifications
explore.tsx                       — Explore
following.tsx                     — Following feed
latest.tsx                        — Latest feed
activity.tsx                      — Activity feed
rewards.tsx                       — Rewards (REAL — community_credit_balances + community_credit_events, tsc ✅ build ✅; read-only; gift/perk actions remain toast-only)
prescribe-me.tsx                  — Prescribe Me
watch.$id.tsx                     — Video watch page
channel.$handle.tsx               — Channel page
category.$slug.tsx                — Category page
creator-studio.tsx                — Creator Studio shell
creator-studio.index.tsx          — Creator Studio home (REAL — channels/shows/episodes via use-creator-studio.ts, tsc ✅ build ✅; metric cards remain hardcoded)
creator-studio.submit.tsx         — Submit content (REAL — metadata wired to creator_edit_projects via use-creator-submit.ts, tsc ✅ build ✅; submissions-store remains local rollback layer; no video upload; no Cloudflare Stream)
creator-studio.edit.tsx           — Edit content (REAL — Cloudflare Stream direct upload wired via use-cloudflare-upload.ts, tsc ✅ build ✅; commit 46f970b; export/edit studio features remain out of scope)
creator-studio.submissions.tsx    — Submissions list (REAL — episodes via use-creator-studio.ts, tsc ✅ build ✅; draft delete is toast-only, no write)
creator-studio.analytics.tsx      — Analytics (REAL — episode table from episodes via use-creator-studio.ts, tsc ✅ build ✅; all other analytics remain hardcoded)
creator-studio.fans.tsx           — Fans (MOSTLY MOCK — fan list remains mock; follower_count query removed as unsafe in commit 8023b58; fan count uses fallback "32.7K")
creator-studio.rewards.tsx        — Creator rewards (NOT WIRED — out of scope)
creator-studio.schedule.tsx       — Schedule (NOT WIRED — out of scope)
creator-studio.settings.tsx       — Studio settings (NOT WIRED — out of scope)
creator-studio.channel.tsx        — Channel settings (NOT WIRED — channel edit writes out of scope)
creator-studio.interactions.tsx   — Interactions (NOT WIRED — out of scope)
creator-studio.submitted.tsx      — Submitted confirmation
admin.tsx                         — Admin shell
admin.videos.tsx / admin.users.tsx / etc.
```

## Hooks (`src/hooks/`)
```
use-auth.ts                   — Auth session (REAL)
use-posts.ts                  — Feed posts (REAL)
use-profile.ts                — Public profile (REAL)
use-supabase-reactions.ts     — Post reactions (REAL)
use-current-user.ts           — Current user profile bridge (REAL — tsc ✅ build ✅, Lovable UI unchanged)
use-notifications.ts          — Supabase-backed notifications (REAL — notifications table, tsc ✅ build ✅; browser SELECT + UPDATE read_at only; no browser INSERT)
use-rewards.ts                — Supabase-backed rewards (REAL — community_credit_balances + community_credit_events, tsc ✅ build ✅; SELECT only; no writes)
use-creator-studio.ts         — Supabase-backed Creator Studio access + data (REAL — channels, shows, episodes, tsc ✅ build ✅; SELECT only; access gate via channels.owner_email + auth email; no writes)
use-creator-submit.ts         — Supabase-backed Creator Studio submit (REAL — `creator_edit_projects` INSERT/UPDATE + `creator_post_queue` INSERT, tsc ✅ build ✅; queue row written only after valid `stream_uid` confirmed from DB; duplicate pre-check on `creator_id + edit_project_id`; queue failure non-fatal; no video upload; no Cloudflare Stream; submissions-store remains rollback layer)
use-cloudflare-upload.ts      — Cloudflare Stream upload client hook (REAL — XHR POST FormData upload with progress, tsc ✅ build ✅; calls upload.server.ts server function; Cloudflare token never in this file)
use-mobile.tsx                — Viewport detection
use-go-back.ts                — Navigation helper
```

## Lib (`src/lib/`)
```
supabase-browser.ts           — Supabase anon client (REAL)
backend-env.ts                — Env var reader (VITE_SUPABASE_*)
mock-data.ts                  — MOCK: creators, posts, moods, currentUser
auth.tsx                      — Auth context provider
feed-store.tsx                — MOCK feed store
comments-store.tsx            — Supabase-backed comments (REAL — user_post_comments, tsc ✅ build ✅)
follow-store.tsx              — Supabase-backed follows (REAL — follows table, tsc ✅ build ✅; bumpWatch/topThree remain local-only)
messages-store.tsx            — Supabase-backed DMs (REAL — direct_messages table, tsc ✅ build ✅; attachments/encryption/message_type out of scope this phase; `as any` cast due to missing generated Supabase table typings)
activity-store.tsx            — LOCAL user action tracking only (reactions/saves/shares in localStorage — not notification inbox)
submissions-store.tsx         — MOCK submissions store
creator-studio/upload.server.ts — Cloudflare Stream server function (REAL — createServerFn; reads CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_STREAM_API_TOKEN from process.env server-side only; returns safe upload response to browser; tsc ✅ build ✅)
utils.ts                      — cn() utility
error-page.ts / error-capture.ts
```

## Components (`src/components/`)
```
layout/     — AppLayout, BottomNav, TopBar, etc.
              NotificationsPopover.tsx — Wired to Supabase notifications via useNotifications() (REAL — tsc ✅ build ✅; mock fallback comment block preserved in file)
              CreatorStudioLayout.tsx — Access gate wired to channels.owner_email via use-creator-studio.ts (REAL — tsc ✅ build ✅; profiles.is_creator not used)
ui/         — shadcn/ui primitives (do not modify)
feed/       — Feed-specific components
creator/    — Creator Studio components
brand/      — Brand/logo components
ai/         — AI assistant components
prescribe/  — Prescribe Me components
CurrentUserSync.tsx — Zero-render bridge: pushes real Supabase profile into Lovable AuthProvider (REAL — tsc ✅ build ✅, Lovable UI is source of truth)
```

## Config
```
vite.config.ts        — Vite + Cloudflare + TanStack plugin
tsconfig.json         — TypeScript config
wrangler.jsonc        — Cloudflare Workers config
.env.local            — VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (never commit)
components.json       — shadcn/ui config
.lovable/             — Lovable project metadata (do not modify)
```
