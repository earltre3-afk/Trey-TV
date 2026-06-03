# Hard Rules — Never Violate

These rules apply to every task in TREY-TV-ANTIGRAVITY. No exceptions.

## UI Rules

1. Do NOT redesign the Lovable UI.
2. Do NOT replace Lovable components with RESTORE components.
3. Do NOT import any component from `C:\Users\info\TREY-TV-RESTORE-599\components\`.
4. Lovable is the visual source of truth. Backend wiring goes inside existing components.

## Schema Rules

5. Do NOT query `profiles.is_creator` — this column does not exist in the current public schema.
6. Do NOT add or query `profiles.age` — use `date_of_birth` only if needed, never expose it directly.
7. Safe profile columns to query: `id`, `public_profile_uid`, `display_name`, `username`, `avatar_url`, `banner_url`, `bio`, `location`, `created_at`, `role`, `verification_type`, `is_verified`, `verified_creator`.

## Security Rules

8. Do NOT expose the Supabase service-role key in the Vite app. It must never appear in `src/`.
9. Do NOT commit `.env.local`.
10. All Supabase client calls in `src/` use the anon key only via `createBrowserClient()`.

## Quality Rules

11. Every task must pass before being considered done:
    ```
    pnpm tsc --noEmit
    pnpm build
    ```
12. Do not start coding until the task spec is clear and agreed upon.
13. Make the smallest safe change possible. Do not add unrequested features.
