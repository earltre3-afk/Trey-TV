import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/oauth/revoke")({
  component: OAuthRevokeEndpoint,
  head: () => ({ meta: [{ title: "OAuth Revoke Endpoint — Trey TV" }] }),
});

function OAuthRevokeEndpoint() {
  return (
    <main className="min-h-screen bg-background grid place-items-center px-4">
      <div className="max-w-xl rounded-3xl liquid-glass neon-border p-6">
        <p className="text-[10px] tracking-[0.35em] text-primary">TREY TV OAUTH</p>
        <h1 className="mt-3 text-3xl font-black">/oauth/revoke</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-6">
          This route is prepared for app/user token revocation. Users can already revoke app consent from Connected Apps.
        </p>
        <Link to="/settings/connected-apps" className="mt-5 inline-flex h-10 px-4 rounded-xl liquid-glass border border-white/10 items-center text-sm">Connected Apps</Link>
      </div>
    </main>
  );
}

