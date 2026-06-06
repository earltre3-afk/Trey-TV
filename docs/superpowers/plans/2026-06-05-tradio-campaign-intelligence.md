# Tradio Campaign Intelligence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a privacy-safe campaign performance feedback loop for Tradio creators and administrators without external integrations, scraping, invented metrics, or automated publishing.

**Architecture:** Store durable internal and creator-entered observations in a private `tradio_campaign_metrics` ledger. Build campaign summaries and recommendations in pure TypeScript rules from allowlisted rows fetched by authenticated server functions, then expose creator and aggregate-only admin dashboards through the existing Broadcast Studio gateway.

**Tech Stack:** TypeScript, React 19, TanStack Start server functions, Supabase/Postgres RLS, Tailwind CSS, Lucide icons, Node test runner.

---

### Task 1: Campaign domain rules and tests

**Files:**
- Create: `src/lib/trey-i/broadcastCampaignTypes.ts`
- Create: `src/lib/trey-i/broadcastCampaignRules.ts`
- Create: `src/lib/trey-i/broadcastCampaignRules.test.ts`

- [ ] Write failing tests proving manual metrics are forced to `creator_manual`, external metrics are never generated, rejected/archived assets are excluded, recommendations state their basis, and Prescribe Me signals omit private fields.
- [ ] Run `node --test src/lib/trey-i/broadcastCampaignRules.test.ts` and confirm failure because the campaign modules do not exist.
- [ ] Implement focused campaign types, manual metric normalization, summary aggregation, recommendation generation, reusable/underperforming selection, and safe Prescribe Me signals.
- [ ] Re-run the focused test and confirm all cases pass.

### Task 2: Private campaign metrics migration

**Files:**
- Create: `supabase/migrations/<timestamp>_tradio_campaign_intelligence.sql`
- Create: `src/lib/trey-i/broadcastCampaignMigration.test.ts`

- [ ] Generate the migration with `supabase migration new tradio_campaign_intelligence`.
- [ ] Write a migration test covering RLS, explicit authenticated/service grants, no anonymous grant, owner-scoped policies, constrained metric source/type values, and indexes.
- [ ] Run the migration test and confirm it fails against the empty generated migration.
- [ ] Implement `tradio_campaign_metrics`, constraints, indexes, grants, owner/admin RLS, and updated-at trigger.
- [ ] Re-run the migration test and confirm it passes.

### Task 3: Authenticated campaign server layer

**Files:**
- Create: `src/lib/trey-i/broadcastCampaignService.ts`
- Create: `src/lib/trey-i/broadcastCampaign.server.ts`
- Modify: `src/lib/trey-i/broadcastDistribution.server.ts`

- [ ] Add testable service helpers for safe row projection and aggregate-only admin summaries.
- [ ] Implement token-derived creator/admin verification using `supabaseAdmin.auth.getUser(accessToken)` and `is_admin`.
- [ ] Implement creator dashboard loading, entity summaries, manual metric CRUD, safe recommendations, Prescribe Me signals, and public Tradio clip-play recording.
- [ ] Record draft copied/used metrics after successful Distribution Desk actions without changing their no-send/no-post behavior.
- [ ] Run campaign tests and TypeScript.

### Task 4: Creator and admin campaign dashboards

**Files:**
- Create: `src/tradio/components/tradio/screens/CampaignIntelligenceDashboard.tsx`
- Create: `src/tradio/components/tradio/screens/AdminCampaignIntelligenceDashboard.tsx`
- Modify: `src/tradio/components/tradio/screens/BroadcastStudioGateway.tsx`
- Modify: `src/tradio/components/tradio/screens/DistributionDeskDashboard.tsx`
- Modify: `src/tradio/components/tradio/screens/PostShowProducerDashboard.tsx`
- Modify: `src/tradio/components/tradio/screens/CreatorArchiveDashboard.tsx`
- Modify: `src/tradio/components/tradio/screens/PublicReplayLibrary.tsx`
- Modify: `src/tradio/contexts/PlayerContext.tsx`

- [ ] Build a dense creator operations dashboard with overview, top clips/drafts/assets, platform and tag comparison, manual metric form/history, recommendations, reuse warnings, and Prescribe Me preview.
- [ ] Build an aggregate-only admin dashboard with creator/channel search and no private body/source fields.
- [ ] Add Campaign Intelligence navigation from the gateway and existing creator workflow screens.
- [ ] Make public replay cards start real player playback and record a truthful Tradio clip-play event.
- [ ] Add `clip` as a player source type so the MiniPlayer persists clip playback correctly.

### Task 5: Full verification and git hygiene

**Files:**
- Review all Pass 13 files only.

- [ ] Run all focused Pass 10-13 safety tests.
- [ ] Run `pnpm tsc --noEmit --pretty false`.
- [ ] Run `pnpm build`.
- [ ] Run `pnpm lint` and record errors/warnings exactly.
- [ ] Run `git status`, `git diff --cached --stat`, and `git diff --stat`.
- [ ] Review the requirements against the implementation and report limitations, commit safety, and ship safety without applying the migration or deploying.
