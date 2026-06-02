# Tradio → Trey TV Parent Port Integration Plan

Status: **PLAN ONLY — no code edits in this pass.** Approved approach: **port the Tradio UI
into this parent repo as a `/tradio` TanStack route** and share the universe contracts in-repo.

Parent repo: `Trey-TV-Antigravity` (`tanstack_start_ts`) — TanStack Start + TanStack Router
+ Supabase + LiveKit + Tailwind v4.
Source repo: `tradio-responsive-ui` (Vite + React 18, internal view-state shell).

Goal: Tradio feels like a premium native music wing of Trey TV, using the parent's **one**
account/auth, Messenger, notification backbone, Trey‑I, and Signal Test — with **no**
duplicate inbox/auth/assistant/notification/Signal‑Test systems.

---

## 0. Key facts that shape the port

| Concern | Parent (Trey‑TV‑Antigravity) | Tradio (source) | Implication |
|--------|------------------------------|-----------------|-------------|
| Path alias | `@/*` → `./src/*` | `@/*` → `./src/*` | Same alias — but both resolve to *their own* `src`, so Tradio files must be **copied into the parent `src`** (namespaced) and its `@/` imports re-pointed. |
| Routing | TanStack file-based, dot-segments (`creator-studio.analytics.tsx`) | Internal `view` state in `Shell.tsx` (no URL router) | Mount Tradio under one route `tradio.tsx`; keep its internal view-state initially; add deep routes later. |
| Auth/identity | `useAuth` (`@/lib/auth`) + `profiles` table: `public_profile_uid, display_name, username, avatar_url, role, creator_status, gold_verified` | `useTradioIdentity` + own `supabaseClient`/mock bootstrap | Re-point Tradio identity to parent `useAuth`; **delete Tradio's own auth/bootstrap path**. |
| Messenger | `messages-store.tsx` (`Message`, `MessagesProvider`, `useMessages`), `components/inbox`, `chat` | Bridge contracts only (no inbox) | Tradio bridge feeds `useMessages`; **no Tradio inbox**. |
| Notifications | `notifications-store.ts`, `NotificationsPopover` | bridge demo seed | Tradio mentions/messages push into `notifications-store`. |
| Trey‑I | `TreyIWidget` + `lib/trey-i/vertex.server` (Vertex AI) | `universeRegistry` + `treyIResolver` | Wire `TreyIWidget` to `answerUniverseQuestion()` for nav routing. |
| Signal Test | **already owned**: `lib/tests/naturalAbility*`, table `natural_ability_results`, `StoredSignalRow.primary_ability/completed_at`, 14 abilities | `signalTest.ts` + `SignalTestEntryCard` | Tradio card **reads** parent state + routes to parent test; **no Tradio storage**. |
| Styling | Tailwind v4 (`@tailwindcss/vite`, `tw-animate-css`) | Tailwind v3 + custom tokens (`shadow-premium`, `text-signature`, `animate-*`, fonts) | Port Tradio theme tokens/animations into parent CSS; verify v4 compat. |

> The parent already has Messenger, notifications, Trey‑I, and Signal Test. The port mostly
> **deletes** Tradio's standalone versions of those and **adapts** Tradio to the parent's.

---

## 1. Target file layout in the parent

Namespace everything Tradio under `src/tradio/` to avoid collisions with the 110 existing routes/components:

```
src/tradio/                       ← copied from tradio-responsive-ui/src
  components/tradio/...            ← Tradio screens/shell/songwars/legal/auth/ui
  components/universe/...          ← bridge UI + RoleBadge + SignalTestEntryCard
  components/content-feel/...
  lib/universe/...                 ← messageContext, universeRegistry, signalTest, treyIResolver, parentBridge
  lib/content-feel/...
  contexts/PlayerContext.tsx
src/routes/tradio.tsx             ← NEW layout route mounting the Tradio shell
src/routes/tradio.index.tsx       ← (optional) default music home
```

All Tradio `@/` imports get rewritten `@/…` → `@/tradio/…` (or use a relative codemod).
Parent-owned imports inside ported Tradio (auth, messages, notifications, signal test) point
to the **parent** `@/lib/...` (not the copied tree).

---

## 2. Phased steps (file-by-file)

### Phase A — Scaffolding (no behavior change)
1. **Copy** `tradio-responsive-ui/src/{components/tradio,components/universe,components/content-feel,lib/universe,lib/content-feel,contexts/PlayerContext.tsx,components/AppLayout.tsx,components/NoCoverVisualizer.tsx}` → `Trey-TV-Antigravity/src/tradio/...`.
2. **Codemod imports** in the copied tree: `@/components/tradio` → `@/tradio/components/tradio`, `@/lib/universe` → `@/tradio/lib/universe`, `@/contexts/PlayerContext` → `@/tradio/contexts/PlayerContext`, etc. Leave `@/lib/utils` etc. mapped to a shared util (reconcile cn()).
3. **Reconcile deps** (add to parent `package.json` only if used by the ported surface): `uuid`, and verify `embla-carousel-react`, `vaul`, `date-fns`, `input-otp`, `react-day-picker` versions. Drop Tradio-only unused deps (`react-router-dom`, `highlight.js`, `marked`, `next-themes`) if the ported surface doesn't use them.
4. **Tailwind**: port Tradio's theme extensions + keyframes (`shadow-premium`, `animate-fade-in`, `animate-scale-in`, `text-signature` font, glow shadows) from `tradio-responsive-ui/tailwind.config.*` + `index.css` into the parent's Tailwind v4 setup / `styles.css`. Validate v3→v4 differences (e.g. `theme.extend` vs `@theme`).

### Phase B — Route mount
5. **Create** `src/routes/tradio.tsx`:
   ```tsx
   import { createFileRoute } from '@tanstack/react-router';
   import { TradioShell } from '@/tradio/components/tradio/Shell';
   export const Route = createFileRoute('/tradio')({ component: TradioShell });
   ```
   Tradio keeps its internal view-state shell for now. (Deep routes like `/tradio/artist/$handle` are a later phase — see §5.)
6. **Nav entry points** (parent-owned UI): add a "Tradio" item (icon `Radio`/`Music`) to `DesktopSidebar.tsx`, `DesktopTopNav.tsx`, `SideMenu.tsx`, and `BottomNav.tsx` (or `CreateWheel`), `to="/tradio"`. Add a Trey‑I route suggestion + a profile-badge link to the user's Tradio role profile.

### Phase C — Identity unification (delete Tradio auth)
7. **Re-point `useTradioIdentity`**: replace `tradio/components/tradio/auth/useTradioIdentity.tsx` internals to derive from parent `useAuth()` + the `profiles` row (`public_profile_uid`, `display_name`, `username`, `avatar_url`, `role`, `creator_status`, `gold_verified`). Keep the `TradioIdentity` shape; map `role`/`creator_status` → Tradio roles. **Remove** `tradio/.../supabaseClient` usage + the mock bootstrap as the live path (keep mock only behind a dev flag).
8. **Role gating preserved**: Tradio access requests stay reviewed; no client self-grant. Map parent `role==='admin'` → Tradio admin; `creator_status==='approved'` → creator capabilities; elevated music roles still go through Tradio's Access Center → parent review.

### Phase D — Messenger bridge → real Messenger
9. **Mount** `MessengerBridgeProvider` inside `tradio.tsx` with handlers built from `createParentBridgeHandlers({ navigate })` (TanStack `useNavigate`), routing `onOpenMessenger` to the parent inbox route, `onReturnToTreyTV` to `/`, `onOpenNotifications`/`onOpenSignalTest` to parent routes.
10. **Feed real events**: replace the bridge demo seed — on a real `useMessages` event or mention, call `bridge.notify(buildMessageNotification(...) | buildMentionNotification(...))`. Tradio "Message Artist/Producer/Host" CTAs already emit `MessageContext`; wire them to `useMessages` compose with the context attached (extend the parent `Message` type with an optional `context?: MessageContext`).
11. **Inbox context label**: render `display_context_label` ("Sent from Tradio Artist Page") + `About:` in the parent inbox message row; honor `return_to_url`.

### Phase E — Notifications
12. Map Tradio mention/message bridge events into `notifications-store.ts` (mentions = notifications, not DMs). `NotificationsPopover` deep-links via `deep_link_url` back into `/tradio/...`.

### Phase F — Signal Test (read parent state)
13. **Adapter** `src/tradio/.../signalTestAdapter.ts`: map parent `StoredSignalRow` → Tradio `SignalTestState` (`primary_ability`→`result`, `completed_at`→`completed`/timestamp). Feed real state into `SignalTestEntryCard`.
14. **Route `onStart`** → the parent Signal Test route (confirm the exact route that renders `components/tests/Signal*`; appears under onboarding/a dedicated route). Enforce permanence (parent already stores; card hides retake via `canTakeSignalTest`).
15. **Badges**: map parent `StoredSignalRow.primary_ability` → shared `NaturalAbilityBadge`; reconcile parent `badge_*` styling with Tradio `RoleBadge` (keep one source — prefer the shared `RoleBadge`/`NaturalAbilityBadge`).

### Phase G — Trey‑I
16. In `TreyIWidget`, on a navigation-style question, call `answerUniverseQuestion(query)` from `@/tradio/lib/universe/treyIResolver` and render the returned `routes` as buttons (`navigate(route.route)`), respecting `requiresAccount`/`roleRelated`. The Vertex AI generation stays for open-ended chat; the registry handles "where is X / how do I Y".

### Phase H — Cleanup + validation
17. Remove now-dead Tradio standalone pieces (its own Supabase client live path, demo seed, duplicate badge indicators) behind the unified systems.
18. Run `npx tsc --noEmit`, `npm run build`, `npm run lint` (parent's `eslint .`). Smoke `/tradio` and a deep flow.

---

## 3. Identity / profile separation (must preserve)

- Trey TV `profiles` row = personal/social identity (parent-owned).
- Tradio artist/producer/DJ-host/show pages = public music identity, connected via the same
  `public_profile_uid` / user id — **never collapsed** into the personal profile, never
  exposing unnecessary personal info. The ported Tradio role profiles already enforce this.

## 4. Anti-duplication checklist (enforced by the port)

- ❌ No Tradio inbox — Tradio uses `messages-store`/`useMessages`.
- ❌ No Tradio auth — Tradio uses `useAuth` + `profiles`.
- ❌ No Tradio assistant — Trey‑I (`TreyIWidget`) consumes the registry.
- ❌ No Tradio notification backend — uses `notifications-store`.
- ❌ No Tradio Signal Test storage — reads `natural_ability_results`.
- ✅ Tradio-specific: music UI, role profiles, Song Wars, content-feel, context labels.

## 5. Deferred / later phases

- **Deep routing**: give Tradio real URLs (`/tradio/artist/$handle`, `/tradio/song-wars`, …)
  by adding splat/child routes and mapping the registry routes to them (the registry already
  uses `/tradio/...` paths). Requires Tradio's shell to accept an initial view from route params.
- **SSR**: Tradio shell is client-state heavy; mount client-only (`ssr: false` or guarded) initially.
- **Content-feel backend**, **access-request RPC/RLS** (drafts already in Tradio repo) applied to the shared Supabase project.

## 6. Risks / open questions

1. **Tailwind v3 → v4** token/animation port is the biggest visual risk — validate `shadow-premium`, `text-signature` font, and keyframes render under v4.
2. **Confirm the parent Signal Test route** (which route renders `components/tests/Signal*`) for `onStart`.
3. **`profiles` → Tradio role mapping**: define how `role`/`creator_status`/`gold_verified` map to Tradio artist/producer/dj/verified — and where Tradio elevated-role grants are stored (reuse parent creator tables vs Tradio's drafted `tradio_*` tables on the shared Supabase project).
4. **SSR/window usage** in Tradio (device-detect effects, `window` refs) must be client-guarded under TanStack Start.
5. **Dependency version drift** (React 18 both; verify radix/recharts/embla versions match).

## 7. Suggested execution order (next passes)

1. Phase A+B behind a hidden `/tradio` route (compiles, renders mock identity) → validate build.
2. Phase C identity unification → real account in Tradio.
3. Phase D+E Messenger + notifications.
4. Phase F+G Signal Test + Trey‑I.
5. Phase H cleanup + deep routing.

Each phase ends with `tsc` + `build` + `lint` green and a `/tradio` smoke.
