import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { C as CreatorStudioLayout, S as SectionHeader } from "./CreatorStudioLayout-DnMAX3C9.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription } from "./dialog-Bvlih8gu.mjs";
import { E as useSubmissions } from "./router-BtgGywEC.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { aY as Calendar, a9 as Clock, B as Bell, ai as Star, b7 as Film, P as Plus } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./AppShell-BWcCrjwR.mjs";
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
import "./use-creator-studio-BkHsMg4r.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
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
const UPCOMING = [{
  d: "Tonight 9:00 PM",
  title: "Late Night with Trey · S2 E15",
  kind: "Premiere",
  day: 8
}, {
  d: "Fri · 7:00 PM",
  title: "Studio Sessions · E9",
  kind: "Episode",
  day: 11
}, {
  d: "Sat · 12:00 PM",
  title: "City After Dark · Bonus Reel",
  kind: "Bonus",
  day: 12
}];
function SchedulePage() {
  const store = useSubmissions();
  const [dialog, setDialog] = reactExports.useState(false);
  const [selected, setSelected] = reactExports.useState(null);
  const [pickEp, setPickEp] = reactExports.useState("");
  const [pickTime, setPickTime] = reactExports.useState("20:00");
  const approved = reactExports.useMemo(() => store.submissions.filter((s) => s.status === "approved" || s.status === "draft" || s.status === "needs_changes"), [store.submissions]);
  const dayHas = reactExports.useMemo(() => {
    const m = {};
    UPCOMING.forEach((u) => {
      (m[u.day] ||= []).push(u);
    });
    return m;
  }, []);
  const doSchedule = () => {
    if (!pickEp) {
      toast.error("Pick an episode");
      return;
    }
    store.approve(pickEp, {
      scheduleAt: (/* @__PURE__ */ new Date(`2026-06-${String(selected ?? 1).padStart(2, "0")}T${pickTime}`)).toISOString()
    });
    toast.success("Episode scheduled");
    setDialog(false);
    setPickEp("");
    setSelected(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(CreatorStudioLayout, { title: "Schedule & programming", subtitle: "Run your channel like a network.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setDialog(true), className: "px-3.5 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press inline-flex items-center gap-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
    " Schedule episode"
  ] }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 rounded-3xl glass neon-border p-4 md:p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Calendar, title: "Upcoming premieres" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-white/5", children: UPCOMING.map((u, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-12 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/30 grid place-items-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "size-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate", children: u.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: u.d })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toast.success("Notified your fans"), className: "px-2.5 py-1.5 rounded-lg text-[11px] glass border border-white/10 inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "size-3" }),
            " Notify fans"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] tracking-[0.18em] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 uppercase", children: u.kind })
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl glass neon-border p-4 md:p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Star, title: "Featured series" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Film, { className: "size-8 text-primary mx-auto mb-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Late Night with Trey" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Pinned to your channel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/creator-studio/channel", className: "mt-3 inline-block px-3 py-1.5 rounded-lg text-xs border border-primary text-primary hover:bg-primary/10", children: "Change" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-4 md:p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Calendar, title: "Programming planner", action: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: "Tap a day to schedule" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-7 gap-1.5 text-center", children: [
        ["S", "M", "T", "W", "T", "F", "S"].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-widest text-muted-foreground py-1", children: d }, d)),
        Array.from({
          length: 28
        }, (_, i) => {
          const day = i + 1;
          const has = dayHas[day];
          const active = selected === day;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            setSelected(day);
            setDialog(true);
          }, className: `relative aspect-square rounded-lg text-xs grid place-items-center transition ${active ? "bg-primary text-primary-foreground glow-gold ring-1 ring-primary" : has ? "bg-primary/15 text-primary ring-1 ring-primary/40 font-semibold hover:bg-primary/25" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`, children: [
            day,
            has && !active && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary" })
          ] }, day);
        })
      ] }),
      selected !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-2xl bg-white/5 ring-1 ring-white/10 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] tracking-[0.2em] text-primary mb-1", children: [
          "DAY ",
          selected
        ] }),
        dayHas[selected]?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: dayHas[selected].map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-sm flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: e.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: e.d.split(" · ").pop() })
        ] }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: 'Nothing scheduled. Use "Schedule episode" to add one.' })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialog, onOpenChange: setDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "bg-background border-white/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-gradient-gold", children: "Schedule an episode" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Pick an approved episode and a release time. Fans get notified automatically." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] tracking-[0.18em] text-muted-foreground uppercase mb-1", children: "Episode" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: pickEp, onChange: (e) => setPickEp(e.target.value), className: "w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select…" }),
            approved.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: s.content_id, children: [
              s.title || "Untitled",
              " — S",
              s.season_number,
              "E",
              s.episode_number
            ] }, s.content_id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] tracking-[0.18em] text-muted-foreground uppercase mb-1", children: "Day" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 1, max: 28, value: selected ?? 1, onChange: (e) => setSelected(Number(e.target.value)), className: "w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] tracking-[0.18em] text-muted-foreground uppercase mb-1", children: "Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "time", value: pickTime, onChange: (e) => setPickTime(e.target.value), className: "w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDialog(false), className: "flex-1 px-3 py-2 rounded-xl text-sm font-semibold glass border border-white/10", children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: doSchedule, className: "flex-1 px-3 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold", children: "Schedule" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  SchedulePage as component
};
