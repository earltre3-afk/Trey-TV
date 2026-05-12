import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Copy } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/developers/docs")({
  component: DeveloperDocs,
  head: () => ({
    meta: [
      { title: "Sign in with Trey TV" },
      { name: "description", content: "OAuth documentation for Sign in with Trey TV." },
    ],
  }),
});

const authUrl = "/oauth/authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_CALLBACK_URL&scope=profile:read email:read&state=RANDOM_STATE";
const userInfo = `{
  "public_profile_uid": "4230000000000000",
  "display_name": "Trey Trizzy",
  "username": "treytrizzy",
  "avatar_url": "...",
  "profile_url": "https://tv.treytrizzy.com/u/4230000000000000",
  "email": "user@example.com"
}`;

function DeveloperDocs() {
  return (
    <main className="min-h-screen bg-background">
      <div aria-hidden className="fixed inset-0 pointer-events-none bg-[radial-gradient(70%_55%_at_50%_-10%,oklch(0.82_0.15_215/.18),transparent)]" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-8 py-8">
        <header className="flex items-center justify-between gap-3">
          <Link to="/developers" className="size-10 rounded-full liquid-glass border border-white/10 grid place-items-center"><ArrowLeft className="size-4" /></Link>
          <Logo className="h-12" />
        </header>

        <section className="mt-8 rounded-[28px] liquid-glass neon-border p-6 sm:p-8">
          <p className="text-[10px] tracking-[0.35em] text-primary">TREY TV DEVELOPERS</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black">Sign in with Trey TV</h1>
          <p className="mt-3 text-muted-foreground">
            Use OAuth for user login. Use API keys for server integrations. Do not use API keys to impersonate users.
          </p>
        </section>

        <div className="mt-6 space-y-5">
          <DocSection title="Overview">
            Sign in with Trey TV lets external apps redirect users to Trey TV, request permission, and receive tokens after the user approves. External apps never receive a Trey TV password.
          </DocSection>
          <DocSection title="Create a Developer App">
            Go to the developer portal, create an app, save your Client ID, and save the Client Secret when it is shown once after creation.
          </DocSection>
          <DocSection title="Add Redirect URI">
            Register the exact callback URL your app uses. Trey TV validates redirect URIs by exact match.
          </DocSection>
          <DocSection title="Request Authorization Code">
            <CodeBlock value={authUrl} />
          </DocSection>
          <DocSection title="Exchange Code for Token">
            Send the authorization code to `/oauth/token` with your client credentials or PKCE verifier. The token endpoint is prepared as part of this staged foundation; full token signing and refresh rotation should be completed before public launch.
          </DocSection>
          <DocSection title="Get User Info">
            Call `/oauth/userinfo` with a valid bearer token. Trey TV returns only data covered by granted scopes.
            <CodeBlock value={userInfo} />
          </DocSection>
          <DocSection title="Scopes">
            `profile:read`, `email:read`, `creator:read`, `verification:read`, and `public_uid:read`.
          </DocSection>
          <DocSection title="API Keys vs OAuth">
            OAuth is for user login and consent. API keys are for server-to-server integrations. Never use API keys as a password replacement or to log a user into an external app.
          </DocSection>
          <DocSection title="Security Rules">
            Store Client Secrets only on servers, use PKCE for public clients, validate `state`, rotate compromised secrets, and revoke unused apps or keys.
          </DocSection>
        </div>
      </div>
    </main>
  );
}

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl liquid-glass border border-white/10 p-5">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-2 text-sm text-muted-foreground leading-6">{children}</div>
    </section>
  );
}

function CodeBlock({ value }: { value: string }) {
  return (
    <div className="mt-3 rounded-2xl bg-black/40 border border-white/10 p-3 flex items-start gap-3">
      <pre className="flex-1 overflow-x-auto text-xs text-white/85 whitespace-pre-wrap">{value}</pre>
      <button onClick={() => { navigator.clipboard?.writeText(value); toast.success("Copied"); }} className="size-8 rounded-lg liquid-glass border border-white/10 grid place-items-center shrink-0">
        <Copy className="size-3.5" />
      </button>
    </div>
  );
}

