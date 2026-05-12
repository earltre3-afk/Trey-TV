import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/oauth/jwks/json")({
  component: JwksPlaceholder,
  head: () => ({ meta: [{ title: "Trey TV JWKS" }] }),
});

function JwksPlaceholder() {
  return (
    <main className="min-h-screen bg-background grid place-items-center px-4">
      <pre className="max-w-xl w-full rounded-3xl liquid-glass border border-white/10 p-6 text-xs overflow-auto">{JSON.stringify({ keys: [] }, null, 2)}</pre>
    </main>
  );
}

