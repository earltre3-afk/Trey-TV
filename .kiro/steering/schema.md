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

## Other tables (reference from RESTORE migrations)

- `user_post_comments` — post comments
- `user_post_reactions` — emoji reactions per post
- `follows` — follow relationships
- `direct_messages` — inbox messages
- `notifications` — user notifications
- `community_credits` / `credit_transactions` — rewards system
- `creator_applications` — creator onboarding applications
- `channels` — creator channels
- `episodes` — video episodes

---

## Supabase Client

Browser client (anon key only):
```ts
import { createBrowserClient } from "@/lib/supabase-browser";
const supabase = createBrowserClient();
```

Never use service-role key in `src/`. Server-side admin operations belong in Cloudflare Worker handlers (`src/server.ts`), not in React components or hooks.
