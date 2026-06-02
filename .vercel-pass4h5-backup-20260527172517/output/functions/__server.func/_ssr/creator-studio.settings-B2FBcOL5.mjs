import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as CreatorStudioLayout, S as SectionHeader } from "./CreatorStudioLayout-DnMAX3C9.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { G as Globe, aM as MessageSquare, u as Gem, B as Bell, p as Shield, n as Settings } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./AppShell-BWcCrjwR.mjs";
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
import "./router-BtgGywEC.mjs";
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
import "./use-creator-studio-BkHsMg4r.mjs";
const GROUPS = [{
  icon: Globe,
  title: "Channel visibility",
  desc: "Who can find and view your channel"
}, {
  icon: MessageSquare,
  title: "Comment controls",
  desc: "Allow, filter, or restrict comments"
}, {
  icon: Gem,
  title: "Gifts & support",
  desc: "Enable gifts, set minimums, thank-you messages"
}, {
  icon: Bell,
  title: "Notification preferences",
  desc: "What we tell you, and when"
}, {
  icon: Shield,
  title: "Safety & moderation",
  desc: "Block lists, keyword filters, mod team"
}];
function CreatorSettingsPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(CreatorStudioLayout, { title: "Creator settings", subtitle: "Fine-tune your network presence.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "rounded-3xl glass neon-border p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-white/5", children: GROUPS.map((g, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 p-4 hover:bg-white/5 rounded-2xl transition", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-xl bg-primary/10 text-primary grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(g.icon, { className: "size-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: g.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: g.desc })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "px-3 py-1.5 rounded-lg text-xs border border-white/15 hover:bg-white/5", children: "Open" })
    ] }, i)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-4 md:p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Settings, title: "Public channel URL" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { defaultValue: "trey.tv/@you", className: "flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "px-3 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground", children: "Save" })
      ] })
    ] })
  ] });
}
export {
  CreatorSettingsPage as component
};
