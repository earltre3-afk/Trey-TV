# Requirements — Post Reactions / Likes Verification & Hardening

## Scope

Verify and harden the existing reactions/likes implementation in the Lovable feed shell.
No new features. No comments, messaging, notifications, creator studio, or admin.

---

## Functional Requirements

### FR-1 TypeScript

- `pnpm tsc --noEmit` must pass with zero errors.

### FR-2 Build

- `pnpm build` must complete with zero errors.

### FR-3 Signed-out tap — no crash

- Tapping the reaction button while signed out must show a toast ("Sign up to react") and redirect to `/onboarding`.
- Must not throw a JS error, show a browser alert, or crash the feed.

### FR-4 Signed-in reaction insert

- A signed-in user tapping a reaction emoji must insert a row into `user_post_reactions`.
- The displayed count must update without a page reload (optimistic update).
- The selected reaction emoji must visually activate in the PostCard.

### FR-5 Signed-in reaction toggle off

- Tapping the same reaction again must delete the row from `user_post_reactions`.
- The count must decrement and the emoji must deactivate without a page reload.

### FR-6 Signed-in reaction change

- Tapping a different reaction must delete the previous row and insert a new one.
- Only one reaction per user per post must be active at any time.

### FR-7 Optimistic rollback

- If the Supabase insert or delete fails, the UI must revert to the previous reaction state and count.
- A toast must inform the user ("Reaction unavailable").

### FR-8 Count accuracy

- After a successful toggle, the displayed count must be refreshed from the live `user_post_reactions` count, not just incremented locally.

### FR-9 No RESTORE UI imports

- No component from `C:\Users\info\TREY-TV-RESTORE-599\components\` may be imported.

### FR-10 Lovable UI unchanged

- The PostCard visual design must not change. No layout, color, or component structure changes.

---

## Non-Requirements (out of scope)

- Comments wiring
- Follow state
- Notifications
- Creator Studio
- Admin tools
- Reaction analytics
