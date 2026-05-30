import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as CreatorStudioLayout, S as SectionHeader } from "./CreatorStudioLayout-DnMAX3C9.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { O as Search, aM as MessageSquare, bd as AtSign, aS as Pin, a5 as Users, u as Gem, b as Heart, b5 as Reply, j as Eye, f as Send, ar as CheckCheck } from "../_libs/lucide-react.mjs";
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
const FILTERS = ["All", "Comments", "Replies", "Follows", "Gifts", "Mentions", "Admin"];
const INITIAL = [{
  id: "1",
  kind: "comment",
  who: "@nightowl",
  body: "Bro this episode hit different 🔥",
  ep: "Late Night S2 E14",
  ago: "5m"
}, {
  id: "2",
  kind: "gift",
  who: "@maya",
  body: "Sent 250 pts",
  ep: "Studio Sessions E8",
  ago: "12m"
}, {
  id: "3",
  kind: "follow",
  who: "@chrishorizon",
  body: "Started following your channel",
  ep: "",
  ago: "27m"
}, {
  id: "4",
  kind: "comment",
  who: "@zaybeats",
  body: "When does S3 drop?",
  ep: "City After Dark",
  ago: "1h"
}, {
  id: "5",
  kind: "admin",
  who: "Trey TV Admin",
  body: "Re-mastered audio approved. Episode is live.",
  ep: "City After Dark Trailer",
  ago: "2h",
  read: true
}, {
  id: "6",
  kind: "mention",
  who: "@lena",
  body: "Y'all need to watch @trey's new ep.",
  ep: "",
  ago: "3h"
}];
const ICON = {
  comment: MessageSquare,
  gift: Gem,
  follow: Users,
  admin: Pin,
  mention: AtSign
};
function InteractionsPage() {
  const [filter, setFilter] = reactExports.useState("All");
  const [q, setQ] = reactExports.useState("");
  const [items, setItems] = reactExports.useState(INITIAL);
  const [replyTo, setReplyTo] = reactExports.useState(null);
  const [draft, setDraft] = reactExports.useState("");
  const matches = (it) => {
    if (filter === "All") return true;
    if (filter === "Admin") return it.kind === "admin";
    return it.kind === filter.toLowerCase().slice(0, -1);
  };
  const filtered = reactExports.useMemo(() => items.filter(matches).filter((i) => !q || `${i.who} ${i.body} ${i.ep}`.toLowerCase().includes(q.toLowerCase())), [items, filter, q]);
  const unread = items.filter((i) => !i.read).length;
  const markAllRead = () => {
    setItems((s) => s.map((x) => ({
      ...x,
      read: true
    })));
    toast.success("All marked as read");
  };
  const sendReply = (id) => {
    if (!draft.trim()) return;
    setItems((s) => s.map((x) => x.id === id ? {
      ...x,
      read: true
    } : x));
    toast.success("Reply sent");
    setDraft("");
    setReplyTo(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(CreatorStudioLayout, { title: "Interactions", subtitle: `Your creator inbox · ${unread} unread`, actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: markAllRead, disabled: unread === 0, className: "px-3 py-2 rounded-xl text-xs font-semibold glass border border-white/10 inline-flex items-center gap-1.5 disabled:opacity-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "size-3.5" }),
    " Mark all read"
  ] }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl glass neon-border p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search interactions…", className: "w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl glass neon-border p-1.5 overflow-x-auto no-scrollbar", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 min-w-max", children: FILTERS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilter(f), className: `px-3 py-1.5 rounded-xl text-xs font-semibold transition ${filter === f ? "bg-primary/15 text-primary ring-1 ring-primary/40 glow-gold" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`, children: f }, f)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-3 md:p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: MessageSquare, title: "Recent activity" }),
      filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-sm text-muted-foreground", children: "No matching interactions." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-white/5", children: filtered.map((it) => {
        const Icon = ICON[it.kind] ?? MessageSquare;
        const isReplying = replyTo === it.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: `py-3 px-1 ${!it.read ? "bg-primary/[0.03]" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `size-10 rounded-xl bg-white/5 grid place-items-center shrink-0 ${!it.read ? "text-primary ring-1 ring-primary/40" : "text-muted-foreground"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: it.who }),
                !it.read && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-primary animate-glow-pulse" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-xs", children: [
                  "· ",
                  it.ago
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: it.body }),
              it.ep && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground mt-0.5", children: [
                "on ",
                it.ep
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast("Liked"), title: "Like", className: "size-8 grid place-items-center rounded-lg hover:bg-white/5 text-muted-foreground hover:text-[oklch(0.78_0.25_340)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "size-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setReplyTo(isReplying ? null : it.id), title: "Reply", className: `size-8 grid place-items-center rounded-lg hover:bg-white/5 ${isReplying ? "text-primary" : "text-muted-foreground"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Reply, { className: "size-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast("Opening episode"), title: "View", className: "size-8 grid place-items-center rounded-lg hover:bg-white/5 text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-4" }) })
            ] })
          ] }),
          isReplying && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 ml-13 pl-13 flex items-center gap-2 animate-fade-in", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { autoFocus: true, value: draft, onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => e.key === "Enter" && sendReply(it.id), placeholder: `Reply to ${it.who}…`, className: "flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => sendReply(it.id), className: "size-9 grid place-items-center rounded-xl bg-primary text-primary-foreground glow-gold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "size-4" }) })
          ] })
        ] }, it.id);
      }) })
    ] })
  ] });
}
export {
  InteractionsPage as component
};
