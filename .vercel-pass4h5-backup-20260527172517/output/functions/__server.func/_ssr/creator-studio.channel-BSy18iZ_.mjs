import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as CreatorStudioLayout, S as SectionHeader } from "./CreatorStudioLayout-DnMAX3C9.mjs";
import { b as useAuth$1 } from "./router-BtgGywEC.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { a2 as Tv, bj as Link2, aG as Save, j as Eye, d as Image, t as Crown, b7 as Film } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./AppShell-BWcCrjwR.mjs";
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
import "./use-creator-studio-BkHsMg4r.mjs";
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
function ChannelPage() {
  const {
    user
  } = useAuth$1();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(CreatorStudioLayout, { title: "Channel management", subtitle: "Your public face on Trey TV.", actions: user && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `/channel/${user.handle}`, className: "px-3 py-2 rounded-xl text-xs font-bold glass border border-primary/40 text-primary glow-gold inline-flex items-center gap-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-3.5" }),
    " View public channel"
  ] }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl glass neon-border p-4 md:p-5 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Tv, title: "Channel details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Channel name", defaultValue: user?.name ?? "Your channel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Public URL", defaultValue: `trey.tv/@${user?.handle ?? "you"}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Bio", defaultValue: user?.bio ?? "", multiline: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Main genre", defaultValue: "Music · Documentary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Social links", defaultValue: "instagram.com/you", icon: Link2 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "size-4" }),
          " Save changes"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl glass neon-border p-4 md:p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Eye, title: "Public preview" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl overflow-hidden ring-1 ring-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-32 bg-gradient-to-br from-[oklch(0.25_0.1_300)] via-[oklch(0.18_0.05_270)] to-[oklch(0.22_0.08_85)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] glass border border-white/15 inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "size-3" }),
            " Banner"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 -mt-8 relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-16 rounded-2xl conic-ring inline-block", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: user?.avatar, className: "size-16 rounded-2xl object-cover", alt: "" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: user?.name ?? "Your name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-4 text-primary" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              "@",
              user?.handle ?? "you",
              " · 32.7K fans"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "flex-1 px-3 py-2 rounded-lg text-xs font-bold bg-primary text-primary-foreground", children: "Follow" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "px-3 py-2 rounded-lg text-xs font-semibold border border-white/15", children: "Gift" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "px-3 py-2 rounded-lg text-xs font-semibold border border-[oklch(0.7_0.25_340)] text-[oklch(0.78_0.25_340)]", children: "Subscribe" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-4 md:p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Film, title: "Featured slots" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Slot, { label: "Channel trailer", value: "Late Night S2 Trailer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Slot, { label: "Featured show", value: "Late Night with Trey" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Slot, { label: "Featured video", value: "Studio Sessions E8" })
      ] })
    ] })
  ] });
}
function Field({
  label,
  defaultValue,
  multiline,
  icon: Icon
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-1 flex items-center gap-1.5", children: [
      Icon && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-3" }),
      " ",
      label
    ] }),
    multiline ? /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { defaultValue, rows: 3, className: "w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("input", { defaultValue, className: "w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40" })
  ] });
}
function Slot({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white/5 ring-1 ring-white/10 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.18em] uppercase text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold mt-1", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "mt-2 px-2.5 py-1 rounded-md text-[11px] border border-white/15 hover:bg-white/5", children: "Change" })
  ] });
}
export {
  ChannelPage as component
};
