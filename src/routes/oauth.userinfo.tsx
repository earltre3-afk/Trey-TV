import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/oauth/userinfo")({
  component: OAuthUserInfoEndpoint,
  head: () => ({ meta: [{ title: "OAuth UserInfo Endpoint — Trey TV" }] }),
});

function OAuthUserInfoEndpoint() {
  return (
    <main className="min-h-screen bg-background grid place-items-center px-4">
      <div className="max-w-xl rounded-3xl liquid-glass neon-border p-6">
        <p className="text-[10px] tracking-[0.35em] text-primary">TREY TV OAUTH</p>
        <h1 className="mt-3 text-3xl font-black">/oauth/userinfo</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-6">
          This endpoint is reserved for scoped Trey TV identity responses. It should require a valid bearer token and return only data covered by approved scopes.
        </p>
        <Link to="/developers/docs" className="mt-5 inline-flex h-10 px-4 rounded-xl liquid-glass border border-white/10 items-center text-sm">Developer docs</Link>
      </div>
    </main>
  );
}

