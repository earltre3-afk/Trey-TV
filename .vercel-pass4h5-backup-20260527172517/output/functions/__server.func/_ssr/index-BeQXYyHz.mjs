import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-BWcCrjwR.mjs";
import { b as useAuth$1, l as useGuide, s as supabase } from "./router-BtgGywEC.mjs";
import { G as showById, H as featuredHero, F as shows, E as channelById, I as allEpisodes, A as channels, J as rails, D as episodeById } from "./index.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { g as getDailyZodiacReading } from "./zodiac.server-aEkMpDn_.mjs";
import { z as zodiacSymbol } from "./zodiac-BJiAMBSd.mjs";
import "../_libs/react-dom.mjs";
import { a4 as Play, aE as Info, r as ChevronRight, a2 as Tv, S as Sparkles, R as Radio, i as Lock, aj as ArrowRight, u as Gem, aO as Bot, t as Crown, P as Plus, Y as Flame, C as Compass, ax as CircleCheck, bl as Download, Z as Zap, b as Heart, a8 as Bookmark, au as MessageCircle, ae as Share2 } from "../_libs/lucide-react.mjs";
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
import "./trey-tv-logo-CG7PjBoN.mjs";
function ReadingOfTheDay({
  sign,
  symbol,
  dailyReading,
  energyWord,
  luckyColor,
  luckyNumber,
  recommendedAction,
  isCusp = false,
  cuspNote
}) {
  const colorSwatch = {
    "Blue flame": "#48c8ff",
    "Molten gold": "#ffc857",
    "Deep violet": "#8b5cf6",
    "Chrome silver": "#c7d2fe",
    "Midnight teal": "#14b8a6"
  };
  const swatchColor = /^#|rgb|hsl|oklch/.test(luckyColor) ? luckyColor : colorSwatch[luckyColor] ?? "#ffc857";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "reading-of-the-day", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong rounded-2xl overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden p-6 space-y-4 border-b border-[oklch(1_0_0_/_0.08)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute top-0 right-0 w-64 h-64 rounded-full",
          style: {
            background: "radial-gradient(circle, oklch(0.82 0.16 85 / 0.2), transparent 70%)",
            filter: "blur(80px)"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-xl glass flex items-center justify-center flex-shrink-0 text-3xl", children: symbol }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-widest text-muted-foreground font-medium", children: "Reading of the Day" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: sign }),
            isCusp && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block text-xs px-2 py-1 rounded-full bg-gradient-to-r from-[#ffc857] to-[#a855f7] text-black font-bold", children: "Cusp Soul" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full glass flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-5 text-[#ffc857]" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground uppercase tracking-wide font-medium", children: "Your Cosmic Message" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg leading-relaxed", children: dailyReading })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-xl p-4 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-widest text-muted-foreground font-medium", children: "Energy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "size-4 text-[#ffc857]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: energyWord })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-xl p-4 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-widest text-muted-foreground font-medium", children: "Lucky Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold", children: luckyNumber })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-xl p-4 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-widest text-muted-foreground font-medium", children: "Lucky Color" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "w-8 h-8 rounded-full border border-[oklch(1_0_0_/_0.2)] ring-2 ring-offset-2 ring-offset-[oklch(0.17_0.025_270)]",
              style: { backgroundColor: swatchColor }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium capitalize", children: luckyColor })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-xl p-4 space-y-2 border-l-2 border-[#06b6d4]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-widest text-muted-foreground font-medium", children: "Today's Action" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed", children: recommendedAction })
      ] }),
      isCusp && cuspNote && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-strong rounded-xl p-4 space-y-2 bg-gradient-to-br from-[#ffc857]/5 via-[#a855f7]/5 to-[#06b6d4]/5 border-l-2 border-[#a855f7]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "size-4 text-[#a855f7] flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-widest text-muted-foreground font-medium", children: "Cusp Soul Insight" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed", children: cuspNote })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 border-t border-[oklch(1_0_0_/_0.08)] flex gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#ffc857] to-[#a855f7] text-black font-semibold hover:shadow-[0_0_24px_oklch(0.82_0.16_85_/_0.4)] transition-all text-sm", children: "Full Reading" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "flex-1 px-4 py-2.5 rounded-lg glass hover:bg-[oklch(1_0_0_/_0.08)] transition-colors font-medium text-sm", children: "Save" })
    ] })
  ] }) });
}
const TREY_TV_BOX_APK_URL = "/downloads/trey-tv-streamingbox-debug.apk";
function WatchNow() {
  const {
    isGuest
  } = useAuth$1();
  return isGuest ? /* @__PURE__ */ jsxRuntimeExports.jsx(GuestWatchNow, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(SignedInWatchNow, {});
}
function GuestWatchNow() {
  const [scrolled, setScrolled] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const heroShow = showById(featuredHero.showId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `fixed top-0 inset-x-0 z-40 transition-all duration-500 ${scrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong border-b border-white/10 px-4 py-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-9" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "px-3 py-1.5 rounded-lg text-xs font-semibold liquid-glass border border-white/15", children: "Log in" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/signup", className: "px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground glow-gold", children: "Sign up" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative min-h-[100svh] w-full overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: heroShow.backdrop, alt: "", className: "absolute inset-0 w-full h-full object-cover scale-105" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_30%,transparent,oklch(0.13_0.02_270/.85)_70%,oklch(0.13_0.02_270)_100%)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,oklch(0.13_0.02_270/.4),transparent_30%,oklch(0.13_0.02_270)_95%)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 top-0 z-20 p-5 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-12" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "hidden sm:inline px-3 py-1.5 rounded-lg text-xs font-semibold liquid-glass border border-white/15", children: "Log in" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/signup", className: "px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground glow-gold", children: "Sign up" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 max-w-3xl mx-auto px-5 pt-[18vh] pb-24 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-white/15 text-[11px] tracking-[0.22em] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-primary animate-glow-pulse" }),
          " THE CREATOR TELEVISION NETWORK"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display mt-6 text-5xl sm:text-7xl font-black leading-[0.95] bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent drop-shadow-[0_4px_30px_oklch(0.82_0.16_85_/_0.4)]", children: [
          "Watch the future",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "of television."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto", children: "Trey TV is a premium streaming network built around creators. Original shows, live channels, AI-curated picks — all in one cinematic home." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 mx-auto flex max-w-xs flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/signup", className: "inline-flex w-full items-center justify-center gap-2 whitespace-nowrap px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold glow-gold hover-scale sm:w-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-4 fill-current" }),
            " Start Watching"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/login", className: "inline-flex w-full items-center justify-center gap-2 whitespace-nowrap px-5 py-3 rounded-xl liquid-glass border border-white/15 font-semibold sm:w-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "size-4" }),
            " I have an account"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TvAppDownloadCta, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-12 inline-flex flex-col items-center text-muted-foreground text-xs tracking-widest", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "SCROLL TO EXPLORE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-2 size-6 rounded-full border border-white/20 grid place-items-center animate-bounce", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-3 rotate-90" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "What is Trey TV?", subtitle: "A new kind of network — built by creators, designed like cinema, alive like social.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 lg:grid-cols-4 gap-4", children: [
      [{
        icon: Tv,
        title: "Watch",
        body: "Original shows, live channels, music videos and creator series — all premium-grade."
      }, {
        icon: Sparkles,
        title: "Discover",
        body: "Trey-I, our AI host, prescribes what to watch based on your mood, mind and moment."
      }, {
        icon: Radio,
        title: "Connect",
        body: "Follow creators, react, comment, send messages, and earn rewards for tuning in."
      }].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl liquid-glass neon-border p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-11 rounded-2xl bg-primary/15 text-primary grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(c.icon, { className: "size-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 text-lg font-bold", children: c.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: c.body })
      ] }, c.title)),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LiveMusicReviewCard, {})
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "How Trey TV works", subtitle: "Four steps from sign-up to your favorite new show.", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-3", children: ["Create your free account.", "Pick the moods, channels, and creators you love.", "Trey-I builds your personalized prescription.", "Tune in live, save for later, or binge episodes."].map((step, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "rounded-2xl liquid-glass border border-white/10 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] tracking-[0.22em] text-primary", children: [
        "STEP ",
        i + 1
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-sm font-semibold", children: step })
    ] }, i)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PreviewRail, { title: "Featured shows", items: shows.filter((s, i, arr) => arr.findIndex((x) => x.poster === s.poster) === i).map((s) => ({
      id: s.id,
      title: s.title,
      sub: channelById(s.channelId)?.name ?? "",
      img: s.poster,
      locked: false
    })) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PreviewRail, { title: "Trending episodes", items: allEpisodes.slice(0, 6).map((e) => ({
      id: e.id,
      title: e.title,
      sub: `${channelById(e.channelId)?.name} · S${e.season}E${e.number}`,
      img: e.thumb,
      locked: !e.isFree
    })), footer: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/signup", className: "inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-3" }),
      " Sign up free to unlock all episodes"
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Creator channels", subtitle: "Every creator gets their own live channel.", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3", children: channels.slice(0, 8).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl liquid-glass neon-border p-4 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto size-16 rounded-full conic-ring overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.avatar, alt: "", className: "size-full object-cover" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full pixel-ring-pulse" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-sm font-bold truncate", children: c.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
        "@",
        c.handle,
        " · ",
        c.followers
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/signup", className: "mt-3 inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border border-primary/40 text-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-3" }),
        " Sign up to follow"
      ] })
    ] }, c.id)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "The Guide", subtitle: "A modern TV guide for creator programming. See what's on now and what's coming up.", action: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/guide", className: "text-sm text-primary hover:underline inline-flex items-center gap-1", children: [
      "Open Guide ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-3.5" })
    ] }), children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl liquid-glass neon-border p-4 overflow-x-auto no-scrollbar", onTouchStart: (e) => e.stopPropagation(), onTouchMove: (e) => e.stopPropagation(), onTouchEnd: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 min-w-max", children: channels.slice(0, 5).map((c) => {
      const ep = allEpisodes.find((e) => e.channelId === c.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-56 shrink-0 rounded-2xl glass border border-white/10 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative size-8 rounded-full conic-ring overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.avatar, className: "size-full object-cover", alt: "" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full pixel-ring-pulse" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold truncate", children: c.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: c.category })
          ] })
        ] }),
        ep && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-widest text-primary", children: "ON NOW" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold truncate", children: ep.title })
        ] })
      ] }, c.id);
    }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Prescribe Me", subtitle: "Tell Trey-I how you feel. Get a perfect mood-mix in seconds.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl liquid-glass neon-border p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: ["Motivated", "Chill", "Hype", "Focused", "Reflective", "Inspired", "Happy"].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center shrink-0 px-3 py-1.5 rounded-full liquid-glass border border-white/10 text-xs", children: m }, m)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/signup", className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm glow-gold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-4" }),
        " Sign up to unlock"
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Rewards", subtitle: "Earn points just for watching. Trade them for perks, badges, and exclusives.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl liquid-glass neon-border p-6 flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Gem, { className: "size-10 text-[oklch(0.7_0.25_340)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: "Trey TV Rewards" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Bronze · Silver · Gold · Diamond tiers." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/signup", className: "px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground glow-gold", children: "Join free" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Meet Trey-I", subtitle: "Your AI host. Always on, always watching with you.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl liquid-glass neon-border p-6 flex items-start gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-12 rounded-2xl bg-[oklch(0.82_0.15_215_/_0.15)] text-[oklch(0.82_0.15_215)] grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "size-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
          `"Hey — I noticed it's late where you are. Want a chill mix from `,
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Zay Beats" }),
          '?"'
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-[11px] text-muted-foreground", children: "— Trey-I, your in-app host" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative px-4 sm:px-8 py-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-4xl mx-auto rounded-[32px] overflow-hidden liquid-glass neon-border p-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,oklch(0.82_0.16_85/.18),transparent)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl sm:text-5xl font-black", children: "Welcome home to Trey TV." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground max-w-xl mx-auto", children: "Your free account unlocks every channel, the full Guide, Prescribe Me, and Rewards." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 mx-auto flex max-w-xs flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/signup", className: "inline-flex w-full items-center justify-center gap-2 whitespace-nowrap px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold glow-gold hover-scale sm:w-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-4 fill-current" }),
            " Create free account"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "inline-flex w-full items-center justify-center gap-2 whitespace-nowrap px-5 py-3 rounded-xl liquid-glass border border-white/15 font-semibold sm:w-auto", children: "Log in" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TvAppDownloadCta, {})
      ] })
    ] }) })
  ] });
}
function TvAppDownloadCta() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 mx-auto flex max-w-xs flex-col items-stretch gap-2 sm:max-w-lg sm:items-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: TREY_TV_BOX_APK_URL, download: true, className: "inline-flex w-full items-center justify-center gap-2 whitespace-nowrap px-5 py-3 rounded-xl liquid-glass border border-primary/45 text-primary font-bold sm:w-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4" }),
      " Download TV App"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-1 text-center text-xs font-semibold text-primary/90", children: "Android TV / Google TV test build" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-1 text-center text-xs text-muted-foreground", children: "This is a test build for Android TV / Google TV devices. You may need to allow installs from unknown sources on your device." })
  ] });
}
function LiveMusicReviewCard() {
  const {
    isGuest
  } = useAuth$1();
  if (!isGuest) return null;
  const onClick = () => {
    try {
      sessionStorage.setItem("treytv_post_auth_redirect", "/music-review");
    } catch {
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/signup", onClick, className: "group relative rounded-3xl liquid-glass neon-border p-6 overflow-hidden md:col-span-2 lg:col-span-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(80%_80%_at_30%_20%,oklch(0.7_0.25_340/0.18),transparent),radial-gradient(80%_80%_at_80%_80%,oklch(0.82_0.15_215/0.18),transparent)]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-10 -right-10 size-40 rounded-full bg-[oklch(0.82_0.16_85/0.15)] blur-3xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 border border-primary/40 text-[10px] tracking-[0.22em] text-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-2.5" }),
        " CREATOR FEATURE"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-11 mt-4 rounded-2xl bg-gradient-to-br from-[oklch(0.82_0.16_85)] to-[oklch(0.7_0.25_340)] text-primary-foreground grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "size-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 text-lg font-bold", children: "Live Music Review" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Submit your original music for a live on-air review by Trey. Get discovered on the network." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary", children: [
        "Apply to feature ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-3.5 transition-transform group-hover:translate-x-0.5" })
      ] })
    ] })
  ] });
}
function Section({
  title,
  subtitle,
  children,
  action
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative px-4 sm:px-8 py-12 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between mb-5 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl sm:text-3xl font-black tracking-tight", children: title }),
        subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1 max-w-2xl", children: subtitle })
      ] }),
      action
    ] }),
    children
  ] });
}
function PreviewRail({
  title,
  items,
  footer
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 snap-x", onTouchStart: (e) => e.stopPropagation(), onTouchMove: (e) => e.stopPropagation(), onTouchEnd: (e) => e.stopPropagation(), children: items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "snap-start shrink-0 w-44 sm:w-52", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[2/3] rounded-2xl overflow-hidden ring-1 ring-white/10 group", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: it.img, alt: "", className: "absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" }),
      it.locked && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-2 left-2 size-6 grid place-items-center rounded-full bg-black/60 backdrop-blur border border-white/15", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-3" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-2 inset-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold truncate", children: it.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-white/70 truncate", children: it.sub })
      ] })
    ] }) }, it.id)) }),
    footer
  ] });
}
function SignedInWatchNow() {
  const heroShow = showById(featuredHero.showId);
  const heroChannel = channelById(heroShow.channelId);
  const guide = useGuide();
  const continueWatching = guide.continueWatching.length > 0 ? guide.continueWatching : rails.continueWatching.map((item) => ({
    episodeId: item.episodeId,
    progress: item.progress,
    progressSeconds: 0,
    durationSeconds: 0,
    completed: false,
    updatedAt: 0
  }));
  const [zodiac, setZodiac] = reactExports.useState(null);
  const [reading, setReading] = reactExports.useState(null);
  reactExports.useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(async ({
      data
    }) => {
      const userId = data.user?.id;
      if (!userId) return;
      const {
        data: profile
      } = await supabase.from("profiles").select("zodiac_sun_sign, zodiac_is_cusp, zodiac_cusp_label, zodiac_public_opt_in").eq("id", userId).maybeSingle();
      if (cancelled || !profile?.zodiac_sun_sign || profile.zodiac_public_opt_in === false) return;
      setZodiac(profile);
      const daily = await getDailyZodiacReading({
        data: {
          zodiacSign: profile.zodiac_sun_sign,
          cuspLabel: profile.zodiac_is_cusp ? profile.zodiac_cusp_label : null,
          isCusp: !!profile.zodiac_is_cusp
        }
      });
      if (!cancelled) setReading(daily);
    }).catch(() => {
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { wide: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative -mx-3 lg:-mx-8 xl:-mx-10 -mt-3 lg:-mt-8 xl:-mt-10 mb-6 lg:mb-10 overflow-hidden rounded-b-[32px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-[60vh] min-h-[420px] xl:h-[72vh] xl:min-h-[560px] w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: heroShow.backdrop, alt: "", className: "absolute inset-0 size-full object-cover" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[linear-gradient(180deg,oklch(0.13_0.02_270/.2),transparent_30%,oklch(0.13_0.02_270/.95)_92%)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(80%_60%_at_15%_50%,transparent,oklch(0.13_0.02_270/.55)_70%)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10 h-full flex items-end p-6 sm:p-10 xl:p-14", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[minmax(0,640px)_1fr] xl:grid-cols-[minmax(0,720px)_1fr] gap-8 w-full items-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-2.5 py-1 rounded-full liquid-glass border border-white/15 text-[10px] tracking-widest", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-3 text-primary" }),
            " TREY TV ORIGINAL"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 font-display text-4xl sm:text-6xl xl:text-7xl font-black leading-[0.95] drop-shadow-[0_4px_30px_oklch(0.82_0.16_85_/_0.4)]", children: heroShow.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-sm text-muted-foreground", children: [
            heroChannel.name,
            " · ",
            heroShow.year,
            " · ",
            heroShow.rating,
            " · ",
            heroShow.category
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm sm:text-base xl:text-lg text-white/85 max-w-xl line-clamp-3", children: heroShow.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/watch/$id", params: {
              id: heroShow.episodes[0].id
            }, className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold glow-gold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-4 fill-current" }),
              " Watch Now"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/collections", className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl liquid-glass border border-white/15 font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
              " Save"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/watch/$id", params: {
              id: heroShow.episodes[0].id
            }, className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl liquid-glass border border-white/15 font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "size-4" }),
              " More Info"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "xl:hidden mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl liquid-glass border border-white/10 p-4 backdrop-blur-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative size-12 rounded-full conic-ring overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: heroChannel.avatar, className: "size-full object-cover", alt: "" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full pixel-ring-pulse" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-widest text-primary", children: "FROM THE CREATOR" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold truncate", children: heroChannel.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
              "@",
              heroChannel.handle
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/channel/$handle", params: {
            handle: heroChannel.handle
          }, className: "text-[11px] px-3 py-1.5 rounded-full border border-primary/40 text-primary hover:bg-primary/10 font-semibold", children: "View Channel" })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden xl:flex flex-col gap-3 self-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl liquid-glass border border-white/10 p-4 backdrop-blur-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative size-10 rounded-full conic-ring overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: heroChannel.avatar, className: "size-full object-cover", alt: "" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full pixel-ring-pulse" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-widest text-primary", children: "FROM THE CREATOR" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold truncate", children: heroChannel.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/channel/$handle", params: {
              handle: heroChannel.handle
            }, className: "ml-auto text-[11px] px-2.5 py-1 rounded-full border border-primary/40 text-primary hover:bg-primary/10", children: "View" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl liquid-glass border border-white/10 p-4 backdrop-blur-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-widest text-muted-foreground mb-2", children: "UP NEXT" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: heroShow.episodes.slice(0, 3).map((ep) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/watch/$id", params: {
              id: ep.id
            }, className: "flex items-center gap-3 group", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative size-14 rounded-lg overflow-hidden shrink-0 ring-1 ring-white/10", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: ep.thumb, alt: "", className: "size-full object-cover transition group-hover:scale-110" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center bg-black/40 opacity-0 group-hover:opacity-100 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-4 text-white fill-current" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold truncate", children: ep.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
                  "S",
                  ep.season,
                  "E",
                  ep.number,
                  " · ",
                  ep.duration,
                  "m"
                ] })
              ] })
            ] }, ep.id)) })
          ] })
        ] })
      ] }) })
    ] }) }),
    zodiac?.zodiac_sun_sign && reading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReadingOfTheDay, { sign: zodiac.zodiac_sun_sign, symbol: zodiacSymbol(zodiac.zodiac_sun_sign), dailyReading: reading.short_message ?? reading.full_message, energyWord: reading.energy_word, luckyColor: reading.lucky_color, luckyNumber: reading.lucky_number, recommendedAction: reading.recommended_action, isCusp: !!zodiac.zodiac_is_cusp, cuspNote: zodiac.zodiac_is_cusp ? "You were born where two energies meet. Today, don't choose one side of yourself. Use both." : void 0 }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Rail, { title: "Continue Watching", icon: Play, children: continueWatching.map((c) => {
      const ep = episodeById(c.episodeId);
      if (!ep) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(EpisodeCard, { ep, progress: c.progress }, c.episodeId);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Rail, { title: "Trending on Trey TV", icon: Flame, children: rails.trending.map((id) => {
      const s = showById(id);
      return s ? /* @__PURE__ */ jsxRuntimeExports.jsx(PosterCard, { show: s }, id) : null;
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Rail, { title: "New Episodes", icon: Sparkles, children: rails.newEpisodes.map((id) => {
      const e = episodeById(id);
      return e ? /* @__PURE__ */ jsxRuntimeExports.jsx(EpisodeCard, { ep: e }, id) : null;
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Rail, { title: "Creator Channels", icon: Tv, children: channels.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(ChannelCard, { ch: c }, c.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Rail, { title: "Featured Creators", icon: Crown, children: channels.slice().reverse().map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(ChannelCard, { ch: c }, c.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Rail, { title: "Recommended by Trey-I", icon: Bot, accent: "cyan", children: rails.treyiPicks.map((id) => {
      const s = showById(id);
      return s ? /* @__PURE__ */ jsxRuntimeExports.jsx(PosterCard, { show: s }, id) : null;
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Rail, { title: "Shows You Might Like", icon: Compass, children: shows.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(PosterCard, { show: s }, s.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Rail, { title: "Music Videos", icon: Radio, children: rails.music.flatMap((id) => showById(id)?.episodes ?? []).map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(EpisodeCard, { ep: e }, e.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Rail, { title: "Comedy", icon: Sparkles, children: rails.comedy.flatMap((id) => showById(id)?.episodes ?? []).map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(EpisodeCard, { ep: e }, e.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Rail, { title: "Drama / Reality", icon: Flame, children: rails.drama.map((id) => {
      const s = showById(id);
      return s ? /* @__PURE__ */ jsxRuntimeExports.jsx(PosterCard, { show: s }, id) : null;
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Rail, { title: "Documentaries / Real Stories", icon: Info, children: rails.docs.map((id) => {
      const s = showById(id);
      return s ? /* @__PURE__ */ jsxRuntimeExports.jsx(PosterCard, { show: s }, id) : null;
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Rail, { title: "Recently Added", icon: Sparkles, children: rails.recentlyAdded.map((id) => {
      const s = showById(id);
      return s ? /* @__PURE__ */ jsxRuntimeExports.jsx(PosterCard, { show: s }, id) : null;
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Rail, { title: "Free Episodes", icon: CircleCheck, children: rails.free.map((id) => {
      const e = episodeById(id);
      return e ? /* @__PURE__ */ jsxRuntimeExports.jsx(EpisodeCard, { ep: e }, id) : null;
    }) })
  ] });
}
function Rail({
  title,
  icon: Icon,
  accent,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 px-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-base sm:text-lg font-bold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `size-4 ${accent === "cyan" ? "text-[oklch(0.82_0.15_215)]" : "text-primary"}` }),
        title
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1", children: [
        "See all ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-3" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 overflow-x-auto no-scrollbar -mx-3 lg:-mx-8 px-3 lg:px-8 snap-x", onTouchStart: (e) => e.stopPropagation(), onTouchMove: (e) => e.stopPropagation(), onTouchEnd: (e) => e.stopPropagation(), children })
  ] });
}
function PosterCard({
  show
}) {
  if (!show) return null;
  const ch = channelById(show.channelId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/watch/$id", params: {
    id: show.episodes[0].id
  }, className: "snap-start shrink-0 w-40 sm:w-48 group", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[2/3] rounded-2xl overflow-hidden ring-1 ring-white/10 group-hover:ring-primary/60 transition", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: show.poster, alt: "", className: "absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" }),
      show.premium && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-[oklch(0.7_0.25_340_/_0.2)] border border-[oklch(0.7_0.25_340)] text-[oklch(0.7_0.25_340)]", children: "PREMIUM" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-2 inset-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-white/70 truncate", children: ch?.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold truncate", children: show.title })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: show.category }),
      ch && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] px-2 py-0.5 rounded-full border border-white/15 text-muted-foreground group-hover:text-foreground", children: [
        "@",
        ch.handle
      ] })
    ] })
  ] });
}
function EpisodeCard({
  ep,
  progress
}) {
  const {
    has,
    toggle
  } = useGuide();
  if (!ep) return null;
  const ch = channelById(ep.channelId);
  const saved = has("saved", ep.id);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/watch/$id", params: {
    id: ep.id
  }, className: "snap-start shrink-0 w-64 sm:w-72 group", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-video rounded-2xl overflow-hidden ring-1 ring-white/10 group-hover:ring-primary/60 transition", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: ep.thumb, alt: "", className: "absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-2 left-2 flex gap-1", children: [
        ep.isLive && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[oklch(0.65_0.24_15)] text-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-white animate-glow-pulse" }),
          " LIVE"
        ] }),
        ep.isFree && ep.number <= 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold", children: [
          "FREE EP ",
          ep.number
        ] }),
        ep.premium && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-black/60 border border-[oklch(0.7_0.25_340)] text-[oklch(0.7_0.25_340)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-3" }),
          " PREMIUM"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 right-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
        e.preventDefault();
        toggle("saved", ep.id);
        toast(saved ? "Removed from saves" : "Saved");
      }, className: `size-8 grid place-items-center rounded-full liquid-glass border border-white/15 ${saved ? "text-primary" : "text-white/80"}`, "aria-label": "Save", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: `size-4 ${saved ? "fill-current" : ""}` }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-2 inset-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-white/70 truncate", children: [
          ch?.name,
          " · S",
          ep.season,
          "E",
          ep.number,
          " · ",
          ep.duration,
          "m"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold truncate", children: ep.title })
      ] }),
      typeof progress === "number" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 inset-x-0 h-1 bg-white/15", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary shadow-[0_0_8px_oklch(0.82_0.16_85_/_0.8)]", style: {
        width: `${progress * 100}%`
      } }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-3 px-1 text-[11px] text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "size-3" }),
        " ",
        ep.reactions.toLocaleString()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "size-3" }),
        " ",
        ep.comments
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto inline-flex items-center gap-1 hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "size-3" }) })
    ] })
  ] });
}
function ChannelCard({
  ch
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/channel/$handle", params: {
    handle: ch.handle
  }, className: "snap-start shrink-0 w-40 sm:w-44 text-center group", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto size-28 sm:size-32 rounded-full conic-ring overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: ch.avatar, alt: "", className: "absolute inset-0 size-full object-cover" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full pixel-ring-pulse" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,black/.7)]" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-sm font-bold truncate", children: ch.name }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground truncate", children: [
      "@",
      ch.handle,
      " · ",
      ch.followers
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-2 inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full border border-white/15 text-muted-foreground group-hover:text-foreground transition", children: "Open Channel" })
  ] });
}
export {
  WatchNow as component
};
