# Requirements — Wire Edit Profile to Supabase

## Context

The Lovable Edit Profile page (`src/routes/edit-profile.tsx`) has a fully-built form
with live preview. On "Publish", it currently calls `updateUser()` from the mock
`AuthProvider` only — no DB write occurs. The goal is to also write the safe text
fields to the `profiles` table while keeping the UI exactly as-is.

The page manages a `draft` state with these fields:
`name`, `handle`, `bio`, `location`, `link`, `avatar`, `banner`, `accent`

Avatar and banner use `URL.createObjectURL()` — local blob URLs that cannot be
written to Supabase. File upload to Supabase Storage is out of scope for this task.
Only text fields are written to the DB.

---

## Functional Requirements

### FR-1 Save text fields to Supabase on Publish
When a signed-in user clicks Publish, the following fields must be written to
`profiles` where `id = auth.uid()`:
- `display_name` ← `draft.name`
- `username` ← `draft.handle`
- `bio` ← `draft.bio`
- `location` ← `draft.location`
- `profile_accent_color` ← `draft.accent`

### FR-2 `website_url` excluded
`draft.link` maps to `website_url` in the schema. `website_url` is not in the
confirmed safe columns list. Do not write it to the DB in this task.

### FR-3 Avatar and banner excluded from DB write
`draft.avatar` and `draft.banner` may be local blob URLs from `URL.createObjectURL()`.
Do not write them to `avatar_url` or `banner_url`. File upload is a separate task.

### FR-4 Mock AuthProvider update preserved
The existing `updateUser()` call must remain. The DB write is additive — it runs
alongside the existing mock update, not instead of it.

### FR-5 Signed-out guard
If no Supabase session exists, skip the DB write silently. The existing mock
`updateUser()` still runs. No crash, no error toast for the missing session.

### FR-6 DB error handling
If the Supabase UPDATE fails, show a toast ("Failed to save profile") and do not
navigate away. The mock `updateUser()` still applies locally.

### FR-7 `public_profile_uid` not updated
`public_profile_uid` must never be written. It is the public identity key.

### FR-8 Role and verification fields not updated
`role`, `verification_type`, `is_verified`, `verified_creator` must never be
written by this form.

### FR-9 `is_creator` not queried or updated
Per hard rules — do not touch this column.

### FR-10 `date_of_birth` / `age` not updated
The edit-profile page has no DOB field. Do not add one. Do not write these columns.

### FR-11 Username uniqueness
`username` has a UNIQUE constraint in the schema. If the UPDATE fails due to a
duplicate username, the error must be caught and a specific toast shown:
"Username already taken — try another."

### FR-12 Lovable UI unchanged
No JSX, layout, color, or component structure may change in `edit-profile.tsx`.
The save button, preview toggle, field layout, and accent picker are untouched.

### FR-13 RLS respected
The `profiles` RLS `for all` policy covers UPDATE with `auth.uid() = id`.
Do not bypass with a service-role key.

### FR-14 TypeScript passes
`pnpm tsc --noEmit` must pass with zero errors.

### FR-15 Build passes
`pnpm build` must complete with zero errors.

---

## Out of Scope
- Avatar / banner file upload to Supabase Storage
- `website_url` write
- Username availability check before submit
- Real-time username conflict feedback
- Stats (followers, following, posts) — remain mock
