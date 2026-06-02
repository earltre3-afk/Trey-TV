import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/.well-known/openid-configuration")({
  component: OpenIdConfiguration,
  head: () => ({ meta: [{ title: "Trey TV OpenID Configuration" }] }),
});

const metadata = {
  issuer: "https://tv.treytrizzy.com",
  authorization_endpoint: "https://tv.treytrizzy.com/oauth/authorize",
  token_endpoint: "https://tv.treytrizzy.com/oauth/token",
  userinfo_endpoint: "https://tv.treytrizzy.com/oauth/userinfo",
  jwks_uri: "https://tv.treytrizzy.com/oauth/jwks.json",
  scopes_supported: [
    "profile:read",
    "email:read",
    "creator:read",
    "verification:read",
    "public_uid:read",
  ],
  response_types_supported: ["code"],
  grant_types_supported: ["authorization_code", "refresh_token"],
  token_endpoint_auth_methods_supported: ["client_secret_post", "client_secret_basic", "none"],
  code_challenge_methods_supported: ["S256"],
  subject_types_supported: ["public"],
  id_token_signing_alg_values_supported: ["RS256"],
};

function OpenIdConfiguration() {
  return (
    <main className="min-h-screen bg-background grid place-items-center px-4">
      <pre className="max-w-3xl w-full rounded-3xl liquid-glass border border-white/10 p-6 text-xs overflow-auto">
        {JSON.stringify(metadata, null, 2)}
      </pre>
    </main>
  );
}
