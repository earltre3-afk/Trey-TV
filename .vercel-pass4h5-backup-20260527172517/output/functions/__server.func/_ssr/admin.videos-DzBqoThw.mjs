import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AdminShell } from "./AdminShell-DTn6ktTs.mjs";
import { E as useSubmissions, v as posts, F as STATUS_LABEL, H as STATUS_TONE } from "./router-BtgGywEC.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./AppShell-BWcCrjwR.mjs";
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
import "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/zod.mjs";
import "node:crypto";
import "node:async_hooks";
import "../_libs/livekit__protocol.mjs";
import "../_libs/bufbuild__protobuf.mjs";
import "../_libs/livekit-server-sdk.mjs";
import "../_libs/jose.mjs";
import "node:buffer";
import "node:util";
import "node:fs";
import "node:path";
import "util";
import "crypto";
import "async_hooks";
import "stream";
const SplitComponent = () => {
  const store = useSubmissions();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminShell, { title: "Videos", subtitle: "All content across the platform.", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-3", children: store.submissions.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/content-approval/$id", params: {
    id: s.content_id
  }, className: "rounded-2xl glass neon-border overflow-hidden hover-lift", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-video", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: s.thumbnail_url || posts[0].media, className: "absolute inset-0 size-full object-cover", alt: "" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute top-2 left-2 text-[9px] px-2 py-0.5 rounded-full border ${STATUS_TONE[s.status]}`, children: STATUS_LABEL[s.status] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold truncate", children: s.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground truncate", children: [
        "@",
        s.creator_handle
      ] })
    ] })
  ] }, s.content_id)) }) });
};
export {
  SplitComponent as component
};
