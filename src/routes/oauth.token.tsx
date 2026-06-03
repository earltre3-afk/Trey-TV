import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/oauth/token")({
  component: OAuthTokenEndpoint,
  head: () => ({ meta: [{ title: "OAuth Token Endpoint — Trey TV" }] }),
});

function OAuthTokenEndpoint() {
  return (
    <EndpointShell title="/oauth/token">
      External apps will exchange authorization codes for bearer tokens here. The data model stores
      authorization codes, access tokens, and refresh tokens as hashes only. Full POST token
      issuance and ID token signing are reserved for the next implementation pass.
    </EndpointShell>
  );
}

function EndpointShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background grid place-items-center px-4">
      <div className="max-w-xl rounded-3xl liquid-glass neon-border p-6">
        <p className="text-[10px] tracking-[0.35em] text-primary">TREY TV OAUTH</p>
        <h1 className="mt-3 text-3xl font-black">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-6">{children}</p>
        <Link
          to="/developers/docs"
          className="mt-5 inline-flex h-10 px-4 rounded-xl liquid-glass border border-white/10 items-center text-sm"
        >
          Developer docs
        </Link>
      </div>
    </main>
  );
}
