import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-BWcCrjwR.mjs";
import { A as channels, B as scheduleSlots, C as categories, D as episodeById, E as channelById } from "./index.mjs";
import { l as useGuide } from "./router-BtgGywEC.mjs";
import { D as Drawer$1 } from "../_libs/vaul.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/react-dom.mjs";
import { a2 as Tv, aR as Funnel, R as Radio, r as ChevronRight, t as Crown, a4 as Play, i as Lock, k as Check, B as Bell, b1 as BookmarkPlus, b2 as CalendarPlus } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
import "node:crypto";
import "node:async_hooks";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/livekit__protocol.mjs";
import "../_libs/bufbuild__protobuf.mjs";
import "../_libs/livekit-server-sdk.mjs";
import "../_libs/jose.mjs";
import "node:buffer";
import "node:util";
import "node:fs";
import "node:path";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/zod.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
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
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
const Drawer = ({
  shouldScaleBackground = true,
  ...props
}) => /* @__PURE__ */ jsxRuntimeExports.jsx(Drawer$1.Root, { shouldScaleBackground, ...props });
Drawer.displayName = "Drawer";
const DrawerPortal = Drawer$1.Portal;
const DrawerOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Drawer$1.Overlay,
  {
    ref,
    className: cn("fixed inset-0 z-50 bg-black/80", className),
    ...props
  }
));
DrawerOverlay.displayName = Drawer$1.Overlay.displayName;
const DrawerContent = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DrawerPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Drawer$1.Content,
    {
      ref,
      className: cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" }),
        children
      ]
    }
  )
] }));
DrawerContent.displayName = "DrawerContent";
const DrawerHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("grid gap-1.5 p-4 text-center sm:text-left", className), ...props });
DrawerHeader.displayName = "DrawerHeader";
const DrawerFooter = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("mt-auto flex flex-col gap-2 p-4", className), ...props });
DrawerFooter.displayName = "DrawerFooter";
const DrawerTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Drawer$1.Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DrawerTitle.displayName = Drawer$1.Title.displayName;
const DrawerDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Drawer$1.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DrawerDescription.displayName = Drawer$1.Description.displayName;
const SLOT_PX = 160;
function getSlotStatus(slot, now) {
  const start = new Date(slot.startsAt).getTime();
  const end = new Date(slot.endsAt).getTime();
  return end < now ? "aired" : start <= now ? "live" : "upcoming";
}
function GuidePage() {
  const [now, setNow] = reactExports.useState(null);
  reactExports.useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 6e4);
    return () => clearInterval(t);
  }, []);
  const [activeCat, setActiveCat] = reactExports.useState("All");
  const [activeChannels, setActiveChannels] = reactExports.useState(/* @__PURE__ */ new Set());
  const [openSlot, setOpenSlot] = reactExports.useState(null);
  const filteredChannels = reactExports.useMemo(() => {
    return channels.filter((c) => {
      if (activeCat !== "All" && c.category !== activeCat) return false;
      if (activeChannels.size > 0 && !activeChannels.has(c.id)) return false;
      return true;
    });
  }, [activeCat, activeChannels]);
  const dayStart = reactExports.useMemo(() => {
    const firstSlot = scheduleSlots[0]?.startsAt;
    const d = firstSlot ? new Date(firstSlot) : /* @__PURE__ */ new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);
  const effectiveNow = now ?? dayStart;
  const slotsWithStatus = reactExports.useMemo(() => scheduleSlots.map((slot) => ({
    ...slot,
    status: getSlotStatus(slot, effectiveNow)
  })), [effectiveNow]);
  const minutesSinceMidnight = (effectiveNow - dayStart) / 6e4;
  const nowOffsetPx = minutesSinceMidnight / 30 * SLOT_PX;
  const liveSlots = slotsWithStatus.filter((s) => s.status === "live");
  const upcomingSlots = channels.map((ch) => slotsWithStatus.find((s) => s.channelId === ch.id && s.status === "upcoming")).filter((s) => s !== void 0).slice(0, 6);
  const onNowSlots = liveSlots.length > 0 ? liveSlots : channels.map((ch) => slotsWithStatus.find((s) => s.channelId === ch.id && s.status === "upcoming")).filter((s) => s !== void 0).slice(0, 3);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { wide: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative -mx-3 lg:-mx-8 -mt-3 lg:-mt-8 mb-6 px-5 sm:px-10 py-8 sm:py-10 overflow-hidden rounded-b-[28px] liquid-glass border-b border-white/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(60%_80%_at_20%_30%,oklch(0.82_0.16_85/.18),transparent),radial-gradient(40%_60%_at_85%_70%,oklch(0.65_0.22_300/.18),transparent)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] tracking-[0.22em] text-primary inline-flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, { className: "size-3" }),
          " THE GUIDE"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 font-display text-3xl sm:text-5xl font-black tracking-tight", children: "What's on Trey TV." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl", children: "A living schedule across every creator channel — live now, coming up, and all-day programming." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "size-3.5" }),
        " Filter:"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveCat("All"), className: chip(activeCat === "All"), children: "All" }),
      categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveCat(c), className: chip(activeCat === c), children: c }, c)),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-[11px] text-muted-foreground", suppressHydrationWarning: true, children: new Date(effectiveNow).toLocaleString(void 0, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 overflow-x-auto no-scrollbar -mx-3 lg:-mx-0 px-3 lg:px-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 min-w-max", children: [
      channels.map((c) => {
        const active = activeChannels.has(c.id);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveChannels((s) => {
          const n = new Set(s);
          n.has(c.id) ? n.delete(c.id) : n.add(c.id);
          return n;
        }), className: `shrink-0 flex items-center gap-2 px-3 py-2 rounded-2xl border transition ${active ? "border-primary bg-primary/10 text-primary" : "border-white/10 hover:border-white/30"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.avatar, alt: "", className: "size-7 rounded-full object-cover" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold", children: c.name })
        ] }, c.id);
      }),
      activeChannels.size > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveChannels(/* @__PURE__ */ new Set()), className: "shrink-0 px-3 py-2 rounded-2xl text-xs text-muted-foreground hover:text-foreground", children: "Clear" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "On Now", icon: Radio, accent: "red", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: [
      onNowSlots.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(NowCard, { slot: s, isStartingSoon: liveSlots.length === 0, onClick: () => setOpenSlot(s) }, s.episodeId + s.startsAt)),
      onNowSlots.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Nothing scheduled right now. Check back later ↓" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Coming Up Next", icon: ChevronRight, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: upcomingSlots.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(UpcomingCard, { slot: s, onClick: () => setOpenSlot(s) }, s.episodeId + s.startsAt)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Today's Schedule", icon: Tv, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block rounded-3xl liquid-glass neon-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid", style: {
        gridTemplateColumns: "200px 1fr"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-black/30 border-b border-white/10" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto no-scrollbar border-b border-white/10 bg-black/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", style: {
          width: 48 * SLOT_PX
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex", children: Array.from({
          length: 48
        }, (_, i) => {
          const hour = Math.floor(i / 2);
          const half = i % 2 === 0 ? "00" : "30";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
            width: SLOT_PX
          }, className: "px-2 py-2 text-[10px] tracking-widest text-muted-foreground border-r border-white/5", children: [
            String(hour).padStart(2, "0"),
            ":",
            half
          ] }, i);
        }) }) }) }),
        filteredChannels.map((c) => {
          const slots = slotsWithStatus.filter((s) => s.channelId === c.id);
          return /* @__PURE__ */ jsxRuntimeExports.jsx(RowFragment, { channel: c, slots, nowOffsetPx, onSlotClick: setOpenSlot }, c.id);
        })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden space-y-3", children: filteredChannels.map((c) => {
        const slots = slotsWithStatus.filter((s) => s.channelId === c.id).slice(0, 6);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl liquid-glass border border-white/10 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.avatar, className: "size-9 rounded-full object-cover", alt: "" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-bold truncate inline-flex items-center gap-1", children: [
                c.name,
                c.verified && /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-3 text-primary" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
                c.category,
                " · ",
                c.followers
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5", children: slots.map((s) => {
            const ep = episodeById(s.episodeId);
            const start = new Date(s.startsAt);
            return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setOpenSlot(s), className: "w-full flex items-center gap-3 text-left p-2 rounded-xl hover:bg-white/5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] font-mono text-muted-foreground w-12 shrink-0", children: [
                String(start.getHours()).padStart(2, "0"),
                ":",
                String(start.getMinutes()).padStart(2, "0")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate", children: ep.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground truncate", children: [
                  "S",
                  ep.season,
                  "E",
                  ep.number,
                  " · ",
                  ep.duration,
                  "m"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SlotBadges, { slot: s, ep })
            ] }) }, s.startsAt);
          }) })
        ] }, c.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AllLiveChannelsSection, {}),
    openSlot && /* @__PURE__ */ jsxRuntimeExports.jsx(SlotSheet, { slot: openSlot, open: true, onClose: () => setOpenSlot(null) })
  ] });
}
function AllLiveChannelsSection() {
  const [channels2, setChannels] = reactExports.useState([]);
  const [count, setCount] = reactExports.useState(0);
  const [errored, setErrored] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(true);
  const [showAll, setShowAll] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/pluto/channels?limit=1000");
        if (!res.ok) {
          if (!cancelled) setErrored(true);
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setChannels(data.channels);
        setCount(data.count);
      } catch {
        if (!cancelled) setErrored(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base sm:text-lg font-bold mb-3", children: "All Live Channels" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-white/40", children: "Loading channels…" })
    ] });
  }
  if (errored || channels2.length === 0) {
    return null;
  }
  const visible = showAll ? channels2 : channels2.slice(0, 60);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-base sm:text-lg font-bold inline-flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, { className: "size-4 text-primary" }),
        " All Live Channels",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] tracking-widest text-white/40 font-normal", children: [
          "· ",
          count,
          " channels"
        ] })
      ] }),
      channels2.length > 60 && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowAll((v) => !v), className: "text-xs text-primary hover:underline", children: showAll ? "Show less" : `Show all (${count})` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2", children: visible.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/live/$id", params: {
      id: c.id
    }, className: "group rounded-lg border border-white/10 bg-black/30 p-2 hover:bg-white/5 hover:border-white/20 transition flex flex-col items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square w-full rounded bg-black/40 grid place-items-center overflow-hidden", children: c.logo ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.logo, alt: "", className: "size-full object-contain p-1 transition-transform group-hover:scale-105", loading: "lazy" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, { className: "size-5 text-white/30" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 w-full text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-semibold truncate", children: c.name }),
        c.number ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] text-white/40", children: [
          "Ch. ",
          c.number
        ] }) : null
      ] })
    ] }, c.id)) })
  ] });
}
function chip(active) {
  return `px-3 py-1.5 rounded-full text-xs font-semibold border transition ${active ? "border-primary bg-primary/15 text-primary" : "border-white/10 text-muted-foreground hover:text-foreground hover:border-white/30"}`;
}
function Section({
  title,
  icon: Icon,
  accent,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-base sm:text-lg font-bold flex items-center gap-2 mb-3 px-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `size-4 ${accent === "red" ? "text-[oklch(0.65_0.24_15)]" : "text-primary"}` }),
      title
    ] }),
    children
  ] });
}
function RowFragment({
  channel,
  slots,
  nowOffsetPx,
  onSlotClick
}) {
  const dayStart = (() => {
    const d = slots[0]?.startsAt ? new Date(slots[0].startsAt) : /* @__PURE__ */ new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-black/20 border-b border-r border-white/5 p-3 flex items-center gap-3 sticky left-0 z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: channel.avatar, className: "size-9 rounded-full object-cover", alt: "" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-bold truncate inline-flex items-center gap-1", children: [
          channel.name,
          channel.verified && /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-3 text-primary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground truncate", children: [
          "@",
          channel.handle
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative overflow-x-auto no-scrollbar border-b border-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-20", style: {
      width: 48 * SLOT_PX
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 bottom-0 z-20 pointer-events-none", style: {
        left: nowOffsetPx
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-full bg-[oklch(0.65_0.24_15)] shadow-[0_0_12px_oklch(0.65_0.24_15)]" }) }),
      slots.map((s) => {
        const start = new Date(s.startsAt).getTime();
        const end = new Date(s.endsAt).getTime();
        const left = (start - dayStart) / 6e4 / 30 * SLOT_PX;
        const width = Math.max(80, (end - start) / 6e4 / 30 * SLOT_PX - 4);
        const ep = episodeById(s.episodeId);
        const live = s.status === "live";
        const aired = s.status === "aired";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => onSlotClick(s), style: {
          left,
          width
        }, className: `absolute top-2 bottom-2 rounded-xl text-left p-2.5 overflow-hidden transition border ${live ? "border-[oklch(0.65_0.24_15)] bg-[oklch(0.65_0.24_15/.12)] shadow-[0_0_18px_oklch(0.65_0.24_15/.4)]" : aired ? "border-white/5 bg-white/[0.02] opacity-50" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-primary/40"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[10px] tracking-widest", children: [
            live && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[oklch(0.65_0.24_15)] inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-[oklch(0.65_0.24_15)] animate-glow-pulse" }),
              " LIVE"
            ] }),
            aired && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "AIRED" }),
            ep.premium && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[oklch(0.7_0.25_340)] inline-flex items-center gap-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-3" }) }),
            ep.isFree && ep.number <= 2 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "FREE" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold truncate mt-0.5", children: ep.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground truncate", children: [
            "S",
            ep.season,
            "E",
            ep.number,
            " · ",
            ep.duration,
            "m"
          ] })
        ] }, s.startsAt);
      })
    ] }) })
  ] });
}
function NowCard({
  slot,
  onClick,
  isStartingSoon
}) {
  const ep = episodeById(slot.episodeId);
  const ch = channelById(slot.channelId);
  const start = new Date(slot.startsAt);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, className: "text-left rounded-2xl liquid-glass border border-[oklch(0.65_0.24_15/.6)] p-3 hover:bg-white/5 group", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: ch.avatar, className: "size-12 rounded-full object-cover", alt: "" }),
      !isStartingSoon && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-[oklch(0.65_0.24_15)] ring-2 ring-background animate-glow-pulse" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      isStartingSoon ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] tracking-widest text-muted-foreground inline-flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-3" }),
        " STARTS ",
        start.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit"
        })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] tracking-widest text-[oklch(0.65_0.24_15)] inline-flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "size-3" }),
        " LIVE NOW"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold truncate", children: ep.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground truncate", children: [
        ch.name,
        " · S",
        ep.season,
        "E",
        ep.number
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-5 text-primary opacity-0 group-hover:opacity-100 transition" })
  ] }) });
}
function UpcomingCard({
  slot,
  onClick
}) {
  const ep = episodeById(slot.episodeId);
  const ch = channelById(slot.channelId);
  const start = new Date(slot.startsAt);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, className: "text-left rounded-2xl liquid-glass border border-white/10 p-3 hover:bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: ch.avatar, className: "size-12 rounded-full object-cover", alt: "" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-widest text-muted-foreground", children: start.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold truncate", children: ep.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground truncate", children: [
        ch.name,
        " · ",
        ep.duration,
        "m"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SlotBadges, { slot, ep })
  ] }) });
}
function SlotBadges({
  slot,
  ep
}) {
  const {
    has
  } = useGuide();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 items-end shrink-0", children: [
    ep.premium && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-[oklch(0.7_0.25_340)] text-[oklch(0.7_0.25_340)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-2.5" }),
      "PREMIUM"
    ] }),
    ep.isFree && ep.number <= 2 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-bold", children: "FREE" }),
    has("saved", ep.id) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] inline-flex items-center gap-1 text-primary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-2.5" }),
      "Saved"
    ] }),
    has("reminders", ep.id) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] inline-flex items-center gap-1 text-[oklch(0.82_0.15_215)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "size-2.5" }),
      "Reminded"
    ] }),
    slot.status === "aired" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-muted-foreground", children: "Aired" })
  ] });
}
function SlotSheet({
  slot,
  open,
  onClose
}) {
  const ep = episodeById(slot.episodeId);
  const ch = channelById(slot.channelId);
  const {
    has,
    toggle
  } = useGuide();
  const start = new Date(slot.startsAt);
  const action = (label, key, icon) => {
    const Icon = icon;
    const active = has(key, ep.id);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
      toggle(key, ep.id);
      toast(active ? `Removed from ${label}` : `Added to ${label}`);
    }, className: `flex items-center gap-2 px-3 py-2 rounded-xl border transition ${active ? "border-primary bg-primary/10 text-primary" : "border-white/10 hover:border-white/30"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: active ? `${label} ✓` : label })
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Drawer, { open, onOpenChange: (v) => !v && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DrawerContent, { className: "bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DrawerHeader, { className: "text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: ch.avatar, className: "size-12 rounded-full object-cover", alt: "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerTitle, { className: "truncate", children: ep.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DrawerDescription, { className: "truncate", children: [
            ch.name,
            " · S",
            ep.season,
            "E",
            ep.number,
            " · ",
            ep.duration,
            "m · ",
            start.toLocaleString([], {
              weekday: "short",
              hour: "numeric",
              minute: "2-digit"
            })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-1.5", children: [
        ep.isFree && ep.number <= 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold", children: [
          "FREE EP ",
          ep.number
        ] }),
        ep.premium && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[oklch(0.7_0.25_340)] text-[oklch(0.7_0.25_340)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-3" }),
          "PREMIUM"
        ] }),
        slot.status === "live" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[oklch(0.65_0.24_15/.15)] border border-[oklch(0.65_0.24_15)] text-[oklch(0.65_0.24_15)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "size-3" }),
          "LIVE NOW"
        ] }),
        slot.status === "upcoming" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 rounded-full border border-white/15 text-muted-foreground", children: "Upcoming" }),
        slot.status === "aired" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 rounded-full border border-white/15 text-muted-foreground", children: "Aired" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-2 grid grid-cols-2 sm:grid-cols-3 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/watch/$id", params: {
        id: ep.id
      }, className: "flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground font-bold glow-gold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-4 fill-current" }),
        " Watch"
      ] }),
      action("Saved", "saved", BookmarkPlus),
      action("Watch Later", "watchLater", Play),
      action("My Schedule", "mySchedule", CalendarPlus),
      action("Reminder", "reminders", Bell),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/channel/$handle", params: {
        handle: ch.handle
      }, className: "flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 hover:border-white/30 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "Open Creator" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "w-full px-3 py-2 rounded-xl liquid-glass border border-white/10 text-sm font-semibold", children: "Close" }) })
  ] }) });
}
export {
  GuidePage as component
};
