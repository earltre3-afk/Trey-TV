# Task Workflow

Every backend migration task follows this process. No exceptions.

---

## Step 1 — Spec First

Before writing any code, define:

- **What** is being wired (which feature, which route/component)
- **Which table(s)** are involved
- **Which columns** will be queried (check `schema.md` — no banned columns)
- **What the existing mock looks like** (so the shape is preserved)
- **What the real data shape will be** (so TypeScript stays happy)
- **What stays the same** (UI must not change)

Do not proceed until the spec is agreed upon.

---

## Step 2 — Smallest Safe Change

- Add a new hook or extend an existing one in `src/hooks/`
- Do not modify `src/lib/mock-data.ts` until the real hook is proven working
- Do not touch `src/components/ui/` (shadcn primitives)
- Do not touch `src/routeTree.gen.ts` (auto-generated)
- Do not touch `.lovable/` files

---

## Step 3 — Validate

Run both commands. Both must pass with zero errors:

```
pnpm tsc --noEmit
pnpm build
```

If either fails, fix before presenting the result.

---

## Step 4 — Replace Mock

Only after Step 3 passes:

- Swap the mock import/usage in the route or component for the real hook
- Keep the mock data file intact (other routes may still use it)
- Re-run Step 3

---

## Naming Conventions

| Type           | Pattern               | Example              |
| -------------- | --------------------- | -------------------- |
| Supabase hooks | `use-{feature}.ts`    | `use-comments.ts`    |
| Supabase types | `Supabase{Entity}`    | `SupabaseComment`    |
| Store files    | `{feature}-store.tsx` | `comments-store.tsx` |

---

## What NOT to Do

- Do not add new npm packages without a clear reason
- Do not create new routes (Lovable owns the route structure)
- Do not add `console.log` statements to production code
- Do not use `any` types — define proper interfaces
- Do not use `!` non-null assertions without a guard
