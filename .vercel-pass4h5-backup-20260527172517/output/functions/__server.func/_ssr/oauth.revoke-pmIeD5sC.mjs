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
function OAuthRevokeEndpoint() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen bg-background grid place-items-center px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xl rounded-3xl liquid-glass neon-border p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] tracking-[0.35em] text-primary", children: "TREY TV OAUTH" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-3xl font-black", children: "/oauth/revoke" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground leading-6", children: "This route is prepared for app/user token revocation. Users can already revoke app consent from Connected Apps." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/settings/connected-apps", className: "mt-5 inline-flex h-10 px-4 rounded-xl liquid-glass border border-white/10 items-center text-sm", children: "Connected Apps" })
  ] }) });
}
export {
  OAuthRevokeEndpoint as component
};
