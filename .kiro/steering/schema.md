# Schema Reference

Source of truth: live Supabase project connected via `VITE_SUPABASE_URL`.
Reference types: `C:\Users\info\TREY-TV-RESTORE-599\lib\social\types.ts`

---

## profiles table

Safe columns (confirmed queryable):
```
id                    uuid
public_profile_uid    text
display_name          text | null
username              text | null
avatar_url            text | null
banner_url            text | null
bio                   text | null
location              text | null
created_at            timestamptz
role                  text | null   ("user" | "creator" | "admin" | "master_admin")
verification_type     text | null   ("green" | "gold" | "none")
is_verified           boolean | null
verified_creator      boolean | null
profile_accent_color  text | null
```

Banned columns — do NOT query:
- `is_creator` — does not exist in current public schema
- `age` — does not exist; use `date_of_birth` only if needed, never expose directly

---

## profiles table — Trey-I onboarding columns

Confirmed present in RESTORE migrations. Assumed present in live project (same Supabase instance).
Must be verified against live project before first server function write.

Migration sources:
- `20260430013000_trey_tv_user_onboarding_profiles.sql` — initial onboarding columns
- `20260501183500_repair_profiles_onboarding_columns_without_age.sql` — adds fan_type, favorite_moods, content_frequency, profile_visibility, show_*, onboarding_completed, onboarding_step, public_profile_uid
- `20260501190000_add_voice_onboarding_method.sql` — adds onboarding_method
- `20260503170000_lock_onboarding_resume_flow.sql` — adds favorite_content_types, accepted_terms_at, age_gate_verified_at, onboarding_last_saved_at; updates onboarding_status constraint
- `20260429183000_trey_tv_public_private_social_streaming.sql` — adds favorite_categories
- `20260427133000_trey_tv_social_platform.sql` — adds social_links

```
site_uid                   text | null   (6-digit numeric, legacy member ID)
public_profile_uid         text | null   (16-digit numeric, starts with "423"; canonical identity)
onboarding_status          text NOT NULL DEFAULT 'setup_needed'
                           CHECK ('not_started'|'in_progress'|'completed'|'setup_needed'|'prescribe_me'|'tutorial'|'complete')
onboarding_completed       boolean NOT NULL DEFAULT false
onboarding_method          text | null   ("voice" | "manual")
onboarding_step            integer | null
onboarding_last_saved_at   timestamptz | null
onboarding_completed_at    timestamptz | null
account_setup_completed_at timestamptz | null
favorite_categories        text[] NOT NULL DEFAULT '{}'
favorite_moods             text[] NOT NULL DEFAULT '{}'
favorite_content_types     text[] DEFAULT '{}'
content_frequency          text | null   ("daily" | "weekly" | "only_drops")
fan_type                   text | null   ("viewer" | "trizfit" | "creator" | "supporter" | "superfan")
profile_visibility         text NOT NULL DEFAULT 'public'   ("public" | "members_only" | "private")
show_location              boolean NOT NULL DEFAULT true
show_birthday              boolean NOT NULL DEFAULT false
show_top_three             boolean NOT NULL DEFAULT true
allow_top_three_adds       boolean NOT NULL DEFAULT true
social_links               jsonb NOT NULL DEFAULT '{}'
accepted_terms_at          timestamptz | null
onboarding_preferences     text[] NOT NULL DEFAULT '{}'
interests                  text[] NOT NULL DEFAULT '{}'
```

Columns NOT safe to use (banned):
- `is_creator` — does not exist
- `age` — does not exist
- `date_of_birth` — exists but must only be collected through a confirmed voice step with explicit user consent; never expose directly

---

## user_posts table

```
id               uuid
author_id        uuid  → profiles.id
creator_id       uuid | null  → profiles.id
body             text | null
content          text | null
image_url        text | null
media_urls       text[] | null
status           text   ("draft" | "published" | "hidden" | "deleted")
visibility       text   ("public" | "followers" | "private")
likes_count      int | null
comments_count   int | null
created_at       timestamptz
```

FK aliases for joins:
- `author:profiles!user_posts_author_id_fkey(...)` — preferred
- `author:profiles(...)` — fallback if FK name fails

---

## intake_sessions table

Confirmed present in RESTORE migrations.
Migration: `20260502150000_voice_intake_sessions.sql`
RLS: enabled. No RLS policies defined in migrations — service-role required for server-side reads/writes.

```
session_id       uuid PK DEFAULT gen_random_uuid()
flow_type        text NOT NULL CHECK ('signup'|'creator_application'|'gold_verification'|'creator_hub')
intake_method    text NOT NULL CHECK ('manual'|'ai_voice'|'ai_voice_started_manual_completed')
status           text NOT NULL DEFAULT 'draft'
                 CHECK ('draft'|'active'|'manual_switched'|'submitted'|'completed'|'abandoned')
user_id          uuid → auth.users (nullable, ON DELETE SET NULL)
metadata         jsonb NOT NULL DEFAULT '{}'   — stores voice stage + pending field
confirmed_fields jsonb NOT NULL DEFAULT '{}'   — stores per-field confirmed values
created_at       timestamptz NOT NULL DEFAULT now()
updated_at       timestamptz NOT NULL DEFAULT now()
completed_at     timestamptz | null
```

Indexes: `(user_id)`, `(flow_type, status, updated_at desc)`

Note: No RLS policies were added in migrations. The server function must use the
service-role client to read/write this table.

---

## user_onboarding table

Confirmed present in RESTORE migrations.
Migration: `20260501182500_user_onboarding_answers_no_profile_age.sql`
RLS: enabled. Policy: users manage their own row (`auth.uid() = user_id`).

```
id               uuid PK DEFAULT gen_random_uuid()
user_id          uuid NOT NULL → auth.users (ON DELETE CASCADE, UNIQUE)
current_step     integer | null
selected_path    text | null
answers          jsonb NOT NULL DEFAULT '{}'
completed        boolean NOT NULL DEFAULT false
created_at       timestamptz NOT NULL DEFAULT now()
updated_at       timestamptz NOT NULL DEFAULT now()
```

Note: Browser can write this table directly (anon client, user's own row).
Server function can also write via service-role.

---

## public_profile_uid — ensurePublicProfileUid

`public_profile_uid` is the canonical public identity for routing (`/u/{public_profile_uid}`).
Format: 16-digit numeric string starting with "423" (e.g., `4235358111618238`).
Unique index: `profiles_public_profile_uid_unique_idx`.

`ensurePublicProfileUid(profileId)` in RESTORE (`lib/social/data.ts`):
- Uses service-role client
- Checks if `public_profile_uid` already exists and is valid
- If not, generates a new one via `generate_trey_public_profile_uid()` DB function
- Writes back to `profiles.public_profile_uid` and `profiles.site_uid`
- Returns the UID string or null on failure

ANTIGRAVITY equivalent must be implemented as a helper inside the onboarding server function.
It requires service-role access (to write `public_profile_uid` to any profile row).

---

## Phase 1 Blocker Assessment

| Item | Status | Blocks Phase 1? |
|------|--------|-----------------|
| `intake_sessions` table | Confirmed in RESTORE migrations | YES if not in live project |
| `user_onboarding` table | Confirmed in RESTORE migrations | NO (optional write) |
| `profiles.onboarding_status` | Confirmed | YES — written on completion |
| `profiles.onboarding_completed` | Confirmed | YES — written on completion |
| `profiles.onboarding_method` | Confirmed | YES — written on method choice |
| `profiles.onboarding_step` | Confirmed | NO — informational only |
| `profiles.onboarding_last_saved_at` | Confirmed | NO — informational only |
| `profiles.onboarding_completed_at` | Confirmed | YES — written on completion |
| `profiles.account_setup_completed_at` | Confirmed | NO — optional |
| `profiles.favorite_categories` | Confirmed | NO — optional field |
| `profiles.favorite_moods` | Confirmed | NO — optional field |
| `profiles.content_frequency` | Confirmed | NO — optional field |
| `profiles.fan_type` | Confirmed | NO — optional field |
| `profiles.profile_visibility` | Confirmed | NO — optional field |
| `profiles.show_location` | Confirmed | NO — optional field |
| `profiles.show_birthday` | Confirmed | NO — optional field |
| `profiles.show_top_three` | Confirmed | NO — optional field |
| `profiles.social_links` | Confirmed | NO — optional field |
| `profiles.public_profile_uid` | Confirmed | YES — required for redirect on completion |
| `ensurePublicProfileUid` helper | Must be ported to ANTIGRAVITY | YES — required for completion redirect |

**Hard blockers for Phase 1 (must exist before server functions are written):**
1. `intake_sessions` table — must be confirmed in live project or migration applied
2. `profiles.onboarding_status`, `onboarding_completed`, `onboarding_method`, `onboarding_completed_at` — must exist
3. `profiles.public_profile_uid` — already confirmed safe in existing schema.md

---

## Migration Recommendations

If any of the above tables/columns are missing from the live ANTIGRAVITY Supabase project,
apply the following migrations (in order) from RESTORE:

1. `20260430013000_trey_tv_user_onboarding_profiles.sql` — adds onboarding_status, account_setup_completed_at, onboarding_completed_at, site_uid
2. `20260501183500_repair_profiles_onboarding_columns_without_age.sql` — adds onboarding_completed, onboarding_step, fan_type, favorite_moods, content_frequency, profile_visibility, show_*, public_profile_uid
3. `20260501190000_add_voice_onboarding_method.sql` — adds onboarding_method
4. `20260503170000_lock_onboarding_resume_flow.sql` — adds onboarding_last_saved_at, favorite_content_types, accepted_terms_at; updates onboarding_status constraint
5. `20260502150000_voice_intake_sessions.sql` — creates intake_sessions table
6. `20260501182500_user_onboarding_answers_no_profile_age.sql` — creates user_onboarding table

All migrations use `ADD COLUMN IF NOT EXISTS` and `CREATE TABLE IF NOT EXISTS` — safe to apply idempotently.

---

## Other tables (reference from RESTORE migrations)

- `user_post_comments` — post comments
- `user_post_reactions` — emoji reactions per post
- `follows` — follow relationships
- `direct_messages` — inbox messages
- `notifications` — user notifications
- `community_credits` / `credit_transactions` — rewards system
- `creator_applications` — creator onboarding applications
- `channels` — creator channels
- `episodes` — video episodes (RLS enabled; service-role required for admin writes)
- `creator_edit_projects` — creator draft projects
- `creator_post_queue` — creator submission queue

---

## Supabase Client

Browser client (anon key only):
```ts
import { createBrowserClient } from "@/lib/supabase-browser";
const supabase = createBrowserClient();
```

Never use service-role key in `src/`. Server-side admin operations belong in
`createServerFn()` handlers in `src/lib/*.server.ts` files only.
`SUPABASE_SERVICE_ROLE_KEY` must never have a `VITE_` prefix.
