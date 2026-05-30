import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { M as Route$U, g as useSupabaseSession } from "./router-BtgGywEC.mjs";
import { d as createWatchParty } from "./ChatComposer-C-_cuLln.mjs";
import { C as ChannelChatPanel } from "./ChannelChatPanel-B57B4CA3.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { A as ArrowLeft, a2 as Tv, a5 as Users } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
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
function LiveChannelPage() {
  const {
    id
  } = Route$U.useParams();
  const {
    session
  } = useSupabaseSession();
  const navigate = useNavigate();
  const [meta, setMeta] = reactExports.useState(null);
  const [startingParty, setStartingParty] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/pluto/channels?limit=1000");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setMeta(data.channels.find((c) => c.id === id) ?? null);
      } catch {
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);
  const onStartParty = async () => {
    if (!session?.access_token) {
      navigate({
        to: "/login",
        search: {
          next: encodeURIComponent(`/live/${id}`)
        }
      });
      return;
    }
    if (startingParty) return;
    setStartingParty(true);
    try {
      const res = await createWatchParty({
        data: {
          accessToken: session.access_token,
          channelId: `pluto:${id}`,
          name: meta?.name ?? "Live party"
        }
      });
      if (!res.ok) {
        toast.error(`Couldn't create party: ${res.error}`);
        return;
      }
      navigate({
        to: "/watch-party/$id",
        params: {
          id: res.partyId
        }
      });
    } finally {
      setStartingParty(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
        to: "/explore"
      }), "aria-label": "Back", className: "text-white/70 hover:text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
      meta?.logo ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: meta.logo, alt: "", className: "size-8 rounded object-contain bg-white/5 p-0.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, { className: "size-5 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/50 text-red-400 text-[10px] tracking-widest font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-red-400 animate-pulse" }),
            " LIVE"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-sm font-semibold truncate", children: meta?.name ?? "Live channel" }),
          meta?.number ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-white/40", children: [
            "Ch. ",
            meta.number
          ] }) : null
        ] }),
        meta?.summary && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-white/50 truncate max-w-md", children: meta.summary })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onStartParty, disabled: startingParty, className: "text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 inline-flex items-center gap-1.5 disabled:opacity-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-3.5" }),
        startingParty ? "Starting…" : "Watch party"
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr_360px] gap-4 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black", children: /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { src: `/api/pluto/player?id=${encodeURIComponent(id)}`, title: meta?.name ?? "Live channel", allow: "autoplay; fullscreen; picture-in-picture", allowFullScreen: true, className: "size-full border-0" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChannelChatPanel, { handle: `pluto:${id}`, className: "lg:h-auto min-h-[420px]" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pb-8 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/explore", className: "text-xs text-white/50 hover:text-white/80", children: "← Back to Discover" }) })
  ] });
}
export {
  LiveChannelPage as component
};
