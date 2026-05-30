import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import { A as ArrowLeft, v as Copy } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "fixed inset-0 pointer-events-none bg-[radial-gradient(70%_55%_at_50%_-10%,oklch(0.82_0.15_215/.18),transparent)]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-4xl mx-auto px-4 sm:px-8 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/developers", className: "size-10 rounded-full liquid-glass border border-white/10 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-12" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-8 rounded-[28px] liquid-glass neon-border p-6 sm:p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] tracking-[0.35em] text-primary", children: "TREY TV DEVELOPERS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-4xl sm:text-5xl font-black", children: "Sign in with Trey TV" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: "Use OAuth for user login. Use API keys for server integrations. Do not use API keys to impersonate users." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DocSection, { title: "Overview", children: "Sign in with Trey TV lets external apps redirect users to Trey TV, request permission, and receive tokens after the user approves. External apps never receive a Trey TV password." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DocSection, { title: "Create a Developer App", children: "Go to the developer portal, create an app, save your Client ID, and save the Client Secret when it is shown once after creation." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DocSection, { title: "Add Redirect URI", children: "Register the exact callback URL your app uses. Trey TV validates redirect URIs by exact match." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DocSection, { title: "Request Authorization Code", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CodeBlock, { value: authUrl }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DocSection, { title: "Exchange Code for Token", children: "Send the authorization code to `/oauth/token` with your client credentials or PKCE verifier. The token endpoint is prepared as part of this staged foundation; full token signing and refresh rotation should be completed before public launch." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DocSection, { title: "Get User Info", children: [
          "Call `/oauth/userinfo` with a valid bearer token. Trey TV returns only data covered by granted scopes.",
          /* @__PURE__ */ jsxRuntimeExports.jsx(CodeBlock, { value: userInfo })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DocSection, { title: "Scopes", children: "`profile:read`, `email:read`, `creator:read`, `verification:read`, and `public_uid:read`." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DocSection, { title: "API Keys vs OAuth", children: "OAuth is for user login and consent. API keys are for server-to-server integrations. Never use API keys as a password replacement or to log a user into an external app." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DocSection, { title: "Security Rules", children: "Store Client Secrets only on servers, use PKCE for public clients, validate `state`, rotate compromised secrets, and revoke unused apps or keys." })
      ] })
    ] })
  ] });
}
function DocSection({
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl liquid-glass border border-white/10 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-sm text-muted-foreground leading-6", children })
  ] });
}
function CodeBlock({
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-2xl bg-black/40 border border-white/10 p-3 flex items-start gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "flex-1 overflow-x-auto text-xs text-white/85 whitespace-pre-wrap", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
      navigator.clipboard?.writeText(value);
      toast.success("Copied");
    }, className: "size-8 rounded-lg liquid-glass border border-white/10 grid place-items-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "size-3.5" }) })
  ] });
}
export {
  DeveloperDocs as component
};
