import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
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
function OAuthTokenEndpoint() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(EndpointShell, { title: "/oauth/token", children: "External apps will exchange authorization codes for bearer tokens here. The data model stores authorization codes, access tokens, and refresh tokens as hashes only. Full POST token issuance and ID token signing are reserved for the next implementation pass." });
}
function EndpointShell({
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen bg-background grid place-items-center px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xl rounded-3xl liquid-glass neon-border p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] tracking-[0.35em] text-primary", children: "TREY TV OAUTH" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-3xl font-black", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground leading-6", children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/developers/docs", className: "mt-5 inline-flex h-10 px-4 rounded-xl liquid-glass border border-white/10 items-center text-sm", children: "Developer docs" })
  ] }) });
}
export {
  OAuthTokenEndpoint as component
};
