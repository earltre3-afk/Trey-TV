import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link, e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { Y as Route$z, b as useAuth$1, E as useSubmissions, Z as isTreyOwnerHandle, c as createBrowserClient, g as useSupabaseSession, d as useRewards, f as Coin, t as triggerCoinGift } from "./router-BtgGywEC.mjs";
import { u as useGoBack } from "./use-go-back-DIwqgoNo.mjs";
import { r as reactDomExports } from "../_libs/react-dom.mjs";
import { C as COIN_TIERS } from "./coin-tiers-5eGTJXk-.mjs";
import { C as ChannelChatPanel } from "./ChannelChatPanel-B57B4CA3.mjs";
import { d as createWatchParty } from "./ChatComposer-C-_cuLln.mjs";
import { d as getSocialCounts, t as toggleFollow } from "./social-relationships-wtdld6Dy.mjs";
import { t as treyTvLogo } from "./trey-tv-logo-CG7PjBoN.mjs";
import { h as heroBg, p as post1, a as post2, b as post3, c as post4, d as post5 } from "./lovable-post5-I8S4Bjy7.mjs";
import "./index.mjs";
import { H as House, C as Compass, I as Inbox, a8 as Bookmark, A as ArrowLeft, ae as Share2, B as Bell, t as Crown, as as BadgeCheck, a4 as Play, c4 as UserCheck, at as UserPlus, x as Gift, k as Check, P as Plus, b3 as Camera, e as Mic, b7 as Film, a5 as Users, S as Sparkles, X, i as Lock } from "../_libs/lucide-react.mjs";
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
function GiftPickerSheet({
  open,
  onClose,
  recipient
}) {
  const { balance, loading } = useRewards();
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => setMounted(true), []);
  reactExports.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!mounted || !open || typeof document === "undefined") return null;
  const send = (tier) => {
    if (balance < tier.cost) {
      toast.error(`Need ${tier.cost - balance} more points for ${tier.name}`);
      return;
    }
    triggerCoinGift(tier, recipient);
    toast.success(`${tier.name} sent${recipient ? ` to @${recipient}` : ""} · −${tier.cost.toLocaleString()} pts`);
    onClose();
  };
  return reactDomExports.createPortal(
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        role: "dialog",
        "aria-modal": "true",
        "aria-label": "Send a gift",
        onClick: onClose,
        style: {
          position: "fixed",
          inset: 0,
          zIndex: 99998,
          background: "oklch(0 0 0 / 0.6)",
          backdropFilter: "blur(8px)",
          animation: "fade-in 0.2s ease-out",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            onClick: (e) => e.stopPropagation(),
            className: "liquid-glass border-t border-white/15",
            style: {
              width: "min(100vw, 28rem)",
              maxHeight: "85vh",
              borderRadius: "28px 28px 0 0",
              padding: "1rem 1rem 1.5rem",
              paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))",
              animation: "slide-up 0.3s cubic-bezier(0.2,0.8,0.2,1)",
              overflowY: "auto"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/20" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2 px-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] tracking-[0.3em] text-primary flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3" }),
                    " SEND A GIFT"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold mt-0.5", children: recipient ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    "To ",
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gradient-gold", children: [
                      "@",
                      recipient
                    ] })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient-gold", children: "Pick a gift" }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: onClose,
                    "aria-label": "Close",
                    className: "size-9 grid place-items-center rounded-full glass border border-white/10 hover:bg-white/5 tilt-press",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-1 mb-3 px-3 py-2 rounded-2xl glass border border-primary/30 flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] tracking-[0.2em] text-muted-foreground", children: "YOUR BALANCE" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-primary tabular-nums", children: [
                  loading ? "—" : balance.toLocaleString(),
                  " pts"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2.5", children: COIN_TIERS.map((tier) => {
                const affordable = !loading && balance >= tier.cost;
                const short = !loading ? Math.max(0, tier.cost - balance) : 0;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => send(tier),
                    disabled: !affordable,
                    className: `group relative p-3 rounded-2xl border text-left transition tilt-press overflow-hidden ${affordable ? "glass border-white/15 hover:border-primary/60 hover:glow-gold" : "border-white/5 bg-white/[0.02] cursor-not-allowed opacity-60"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          "aria-hidden": true,
                          className: "absolute -top-6 -right-6 size-24 rounded-full blur-2xl opacity-50 group-hover:opacity-90 transition",
                          style: { background: `radial-gradient(circle, ${tier.glow}, transparent 70%)` }
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-between", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Coin, { tier, size: 56 }),
                        !affordable && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-7 grid place-items-center rounded-full glass border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-3.5 text-muted-foreground" }) })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold leading-tight", children: tier.name }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground line-clamp-1", children: tier.blurb }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 flex items-center justify-between", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs font-bold tabular-nums ${affordable ? "text-primary" : "text-muted-foreground"}`, children: [
                            tier.cost.toLocaleString(),
                            " pts"
                          ] }),
                          !affordable && short > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] text-muted-foreground", children: [
                            "−",
                            short.toLocaleString(),
                            " short"
                          ] })
                        ] })
                      ] })
                    ]
                  },
                  tier.id
                );
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-center text-[10px] text-muted-foreground", children: "Earn more points by watching, commenting, and inviting friends." })
            ]
          }
        )
      }
    ),
    document.body
  );
}
const GOLD = "#FFC857";
const PURPLE = "#A855F7";
const FALL_POSTS = [post1, post2, post3, post4, post5];
const TABS = ["Home", "Videos", "Series", "Playlists", "About"];
const PLAYLIST_ITEMS = [{
  I: Camera,
  label: "VLOGS",
  count: "24 VIDEOS"
}, {
  I: Crown,
  label: "MOTIVATION",
  count: "18 VIDEOS"
}, {
  I: Mic,
  label: "INTERVIEWS",
  count: "15 VIDEOS"
}, {
  I: Film,
  label: "BEHIND THE SCENES",
  count: "12 VIDEOS"
}];
const FALLBACK_SEASONS = [{
  id: "s1",
  title: "LATE NIGHTS\nIN ATL",
  count: "2 SEASONS",
  img: post1
}, {
  id: "s2",
  title: "ON GO\nDIARIES",
  count: "1 SEASON",
  img: post2
}, {
  id: "s3",
  title: "REAL TALKS\nWITH TREY",
  count: "3 SEASONS",
  img: post3
}, {
  id: "s4",
  title: "TREY DAY\nFRIDAYS",
  count: "2 SEASONS",
  img: post4
}];
const FALLBACK_POPULAR = [{
  id: "p1",
  duration: "12:45",
  title: "I Bought My Dream Car… Here's How It Went",
  img: post5
}, {
  id: "p2",
  duration: "15:32",
  title: "SURPRISING My Little Brother With His Dream…",
  img: post2
}, {
  id: "p3",
  duration: "18:20",
  title: "The Truth About Content Creation",
  img: post3
}, {
  id: "p4",
  duration: "22:17",
  title: "RAW CONVERSATION (No Filter)",
  img: post4
}];
function ChannelPage() {
  const {
    handle
  } = Route$z.useParams();
  const {
    user,
    isGuest
  } = useAuth$1();
  const store = useSubmissions();
  const goBack = useGoBack("/explore");
  const isOwnerChannel = isTreyOwnerHandle(handle);
  const isOwnChannel = user?.handle === handle;
  const publicEpisodes = reactExports.useMemo(() => {
    const visible = store.submissions.filter((s) => s.status === "approved" || s.status === "published" || s.status === "scheduled");
    const byThem = visible.filter((s) => s.creator_handle === handle);
    return byThem.length ? byThem : visible.slice(0, 6);
  }, [store.submissions, handle]);
  const featured = publicEpisodes[0];
  const trailer = publicEpisodes.find((s) => s.is_trailer || s.episode_type === "Trailer") ?? featured;
  const shows = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    publicEpisodes.forEach((e) => {
      const id = e.show_id || "misc";
      const title = e.show_title || "Singles & Specials";
      if (!map.has(id)) map.set(id, {
        id,
        title,
        episodes: []
      });
      map.get(id).episodes.push(e);
    });
    return [...map.values()];
  }, [publicEpisodes]);
  const [tab, setTab] = reactExports.useState("Home");
  const [notify, setNotify] = reactExports.useState(false);
  const [giftOpen, setGiftOpen] = reactExports.useState(false);
  const [watchlist, setWatchlist] = reactExports.useState(/* @__PURE__ */ new Set());
  const [slide, setSlide] = reactExports.useState(0);
  const [following, setFollowing] = reactExports.useState(false);
  const [socialCounts, setSocialCounts] = reactExports.useState({
    followers: 0,
    following: 0
  });
  const [creatorDbId, setCreatorDbId] = reactExports.useState(null);
  reactExports.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const supabase = createBrowserClient();
        const {
          data: profileRow
        } = await supabase.from("profiles").select("id").eq("username", handle).maybeSingle();
        if (!mounted) return;
        const dbId = profileRow?.id ?? null;
        setCreatorDbId(dbId);
        if (dbId) {
          const counts = await getSocialCounts(dbId);
          if (mounted) setSocialCounts(counts);
          const {
            data: {
              user: authUser
            }
          } = await supabase.auth.getUser();
          if (authUser && authUser.id !== dbId) {
            const {
              data: followRow
            } = await supabase.from("follows").select("id").eq("follower_id", authUser.id).eq("following_id", dbId).maybeSingle();
            if (mounted) setFollowing(!!followRow);
          }
        }
      } catch (err) {
        console.error("Channel load error:", err);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [handle]);
  const fmt = (n) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : String(n);
  const handleFollowToggle = async () => {
    if (!creatorDbId) return;
    if (!user) {
      toast.error("Sign in to follow");
      return;
    }
    const prev = following;
    setFollowing(!prev);
    setSocialCounts((c) => ({
      ...c,
      followers: Math.max(0, c.followers + (prev ? -1 : 1))
    }));
    const ok = await toggleFollow(creatorDbId, prev);
    if (!ok) {
      setFollowing(prev);
      setSocialCounts((c) => ({
        ...c,
        followers: Math.max(0, c.followers + (prev ? 1 : -1))
      }));
    } else {
      toast.success(prev ? `Unfollowed @${handle}` : `Now following @${handle}`);
    }
  };
  const toggleWatch = (id, title) => {
    setWatchlist((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
        toast("Removed from Watchlist");
      } else {
        n.add(id);
        toast(`Added${title ? ` "${title}"` : ""} to Watchlist`);
      }
      return n;
    });
  };
  const onShare = async () => {
    try {
      await navigator.share?.({
        title: `@${handle} on Trey TV`,
        url: location.href
      });
    } catch {
      await navigator.clipboard?.writeText(location.href);
      toast.success("Channel link copied");
    }
  };
  const heroBg$1 = trailer?.thumbnail_url || heroBg;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "creator-channel-page min-h-screen text-white relative overflow-x-hidden", style: {
    background: "#05070D"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "pointer-events-none fixed inset-0 -z-10", style: {
      background: "radial-gradient(900px 500px at 85% -5%, rgba(168,85,247,0.18), transparent 60%),radial-gradient(700px 400px at -5% 30%, rgba(0,183,255,0.12), transparent 60%)"
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden lg:flex flex-col items-center gap-1 w-[88px] xl:w-[104px] py-5 border-r border-white/5 shrink-0 sticky top-0 h-screen overflow-y-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "block w-16 h-12 mb-4 group", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: treyTvLogo, alt: "Trey TV", className: "w-full h-full object-contain transition-transform group-hover:scale-110", style: {
          filter: "drop-shadow(0 0 12px rgba(255,200,87,0.5))"
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex flex-col items-center gap-1 w-full", children: [{
          I: House,
          label: "Home",
          to: "/"
        }, {
          I: Compass,
          label: "Discover",
          to: "/explore"
        }, {
          I: Inbox,
          label: "Inbox",
          to: "/inbox"
        }, {
          I: Bookmark,
          label: "Watchlist",
          to: "/"
        }].map(({
          I,
          label,
          to
        }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to, className: "group flex flex-col items-center gap-1 w-full py-3 text-white/55 hover:text-white transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-white/25 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(I, { className: "w-[18px] h-[18px]" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] tracking-wide uppercase font-semibold", children: label })
        ] }, label)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 min-w-0 pb-28 lg:pb-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-[560px] md:min-h-[580px] lg:min-h-[640px] overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: heroBg$1, alt: "", loading: "eager", className: "absolute inset-0 w-full h-full object-cover object-top" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none", style: {
            background: "linear-gradient(180deg, rgba(5,7,13,0) 25%, rgba(5,7,13,0.55) 65%, #05070D 100%),linear-gradient(90deg, rgba(5,7,13,0.92) 0%, rgba(5,7,13,0.55) 38%, rgba(5,7,13,0) 62%)"
          } }),
          isOwnerChannel && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute inset-0", style: {
            background: "radial-gradient(circle at 15% 10%, oklch(0.82 0.16 85 / 0.22), transparent 55%),radial-gradient(circle at 85% 90%, oklch(0.7 0.25 340 / 0.18), transparent 55%)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-4 right-4 flex items-center gap-2 z-10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: goBack, className: "size-10 rounded-full border border-white/15 bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 active:scale-95 transition", "aria-label": "Back", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onShare, className: "size-10 rounded-full border border-white/15 bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 active:scale-95 transition", "aria-label": "Share", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "size-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setNotify((n) => !n), className: `size-10 rounded-full border backdrop-blur flex items-center justify-center active:scale-95 transition ${notify ? "border-[#FFC857]/50 bg-[#FFC857]/15 text-[#FFC857]" : "border-white/15 bg-black/40"}`, "aria-label": "Notifications", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "size-4" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-[5] flex flex-col justify-end min-h-[560px] md:min-h-[580px] lg:min-h-[640px] px-5 md:px-10 lg:px-14 pb-8 pt-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xl", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative inline-block mb-3 group cursor-pointer animate-float", children: isOwnerChannel ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "absolute -inset-6 rounded-full opacity-70 blur-2xl animate-spin-slow", style: {
                  background: "conic-gradient(from 0deg, rgba(255,200,87,0.55), rgba(168,85,247,0.55), rgba(0,183,255,0.45), rgba(255,107,214,0.55), rgba(255,200,87,0.55))"
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "absolute -inset-2 rounded-full opacity-60", style: {
                  animation: "glow-pulse 2.4s ease-in-out infinite",
                  boxShadow: "0 0 0 4px rgba(255,200,87,0.35), 0 0 0 8px rgba(255,200,87,0.15)"
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: treyTvLogo, alt: "Trey TV", className: "relative h-16 md:h-20 lg:h-24 w-auto transition-transform duration-500 group-hover:scale-110", style: {
                  filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.7)) drop-shadow(0 0 22px rgba(255,200,87,0.6)) brightness(1.1) contrast(1.08) saturate(1.2)"
                } })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "absolute -inset-1.5 rounded-full", style: {
                  background: "conic-gradient(from 0deg, #ff6bd6, #8b5cf6, #22d3ee, #FFC857, #ff6bd6)",
                  animation: "conic-spin 8s linear infinite",
                  filter: "blur(2px)"
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: user?.avatar || FALL_POSTS[0], alt: `@${handle}`, className: "relative size-20 md:size-24 rounded-full object-cover border-2 border-[#05070D]", style: {
                  boxShadow: "0 0 0 2px rgba(168,85,247,0.55), 0 0 28px rgba(168,85,247,0.55)"
                } })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-2.5 py-1 rounded-full border mb-3", style: {
                background: "rgba(168,85,247,0.12)",
                borderColor: "rgba(168,85,247,0.45)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "w-3.5 h-3.5", style: {
                  color: GOLD
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-extrabold tracking-[0.18em] uppercase", style: {
                  color: GOLD
                }, children: isOwnerChannel ? "Owner" : "Creator" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold tracking-[0.18em] text-white/80 uppercase", children: "Channel" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display font-extrabold text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight", style: {
                textShadow: "0 6px 30px rgba(0,0,0,0.7)"
              }, children: isOwnerChannel ? "KING TREY" : `@${handle}`.toUpperCase() }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[13px] font-medium", style: {
                  color: PURPLE
                }, children: [
                  "@",
                  handle
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "w-4 h-4 fill-[#A855F7] text-black" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-[13px] md:text-sm text-white/85 leading-relaxed", children: isOwnerChannel ? "Content Creator • Entertainer • Story Teller\nNew episodes every week!" : `Creator channel — follow for new content every week` }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex items-center gap-7", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display font-extrabold text-2xl md:text-3xl tabular-nums", children: fmt(socialCounts.followers) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wider text-white/60", children: "Followers" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display font-extrabold text-2xl md:text-3xl", children: publicEpisodes.length || "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wider text-white/60", children: "Videos" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex items-center flex-wrap gap-2.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toast.success(`▶ ${trailer?.title || "Playing latest"}`), className: "channel-primary-btn", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-4 h-4 fill-white" }),
                  " Play Latest"
                ] }),
                !isOwnChannel && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleFollowToggle, className: `channel-secondary-btn ${following ? "!border-[#A855F7]/60 !bg-[#A855F7]/15" : ""}`, children: following ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "w-4 h-4" }),
                  " Following"
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "w-4 h-4" }),
                  " Follow"
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onShare, className: "channel-icon-btn", "aria-label": "Share", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "w-5 h-5" }) }),
                !isOwnChannel && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setGiftOpen(true), className: "channel-icon-btn", "aria-label": "Send gift", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "w-5 h-5" }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden lg:block lg:w-[300px] xl:w-[340px] channel-panel p-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-display font-bold text-base mb-2", children: [
                "About ",
                isOwnerChannel ? "King Trey" : `@${handle}`
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[13px] leading-relaxed text-white/80", children: isOwnerChannel ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                "Bringing real life, raw conversations, and mad entertainment to",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                  color: GOLD
                }, children: "Trey TV" }),
                ". Welcome to the",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                  color: GOLD
                }, children: "family" }),
                "."
              ] }) : `Creator channel on Trey TV. Follow for new content every week.` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab("About"), className: "mt-4 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-[12px] font-semibold transition active:scale-95", children: "More About ›" })
            ] })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "px-5 md:px-10 lg:px-14 mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/50 text-red-400 text-[10px] tracking-widest font-bold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-red-400 animate-pulse" }),
              " LIVE NOW"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-white/60", children: [
              "Live channel for @",
              handle
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StartWatchPartyButton, { channelId: `ch-${handle}`, className: "ml-auto" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 lg:grid-cols-[1fr_360px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black", children: /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { src: `/api/pluto/player?channel=${encodeURIComponent(handle)}`, title: `@${handle} live`, allow: "autoplay; fullscreen; picture-in-picture", allowFullScreen: true, className: "size-full border-0" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChannelChatPanel, { handle, className: "h-auto lg:h-full min-h-[360px]" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 md:px-10 lg:px-14 mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "channel-tabs", children: TABS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab(t), className: tab === t ? "is-active" : "", children: t }, t)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 md:px-10 lg:px-14", children: [
          tab === "Home" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-xl mb-3", children: "Latest Release" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative channel-feature-card group", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: featured?.thumbnail_url || FALL_POSTS[0], alt: "", loading: "lazy", className: "w-full h-[260px] md:h-[340px] lg:h-[400px] object-cover transition-transform duration-700 group-hover:scale-[1.03]" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", style: {
                  background: "linear-gradient(90deg, rgba(5,7,13,0.88) 0%, rgba(5,7,13,0.55) 45%, rgba(5,7,13,0.1) 75%, transparent 100%)"
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 p-6 md:p-8 flex flex-col justify-end max-w-xl", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "channel-eyebrow mb-2", children: [
                    "TREY ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/85", children: "ORIGINAL" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-extrabold text-3xl md:text-4xl lg:text-5xl leading-[0.95] mb-2", children: (featured?.show_title || featured?.title || "LATEST RELEASE").toUpperCase() }),
                  featured && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-white/85 font-medium", children: featured.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-wider", style: {
                      background: PURPLE,
                      color: "#fff"
                    }, children: "NEW" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toast.success(`▶ ${featured?.title || "Latest"}`), className: "channel-primary-btn", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-4 h-4 fill-white" }),
                      " Watch Now"
                    ] }),
                    featured && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggleWatch(featured.content_id, featured.title), className: `size-10 rounded-full border flex items-center justify-center transition active:scale-95 ${watchlist.has(featured.content_id) ? "border-[#A855F7] bg-[#A855F7]/20" : "border-white/25 bg-white/5 hover:bg-white/10"}`, "aria-label": "Watchlist", children: watchlist.has(featured.content_id) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-5 right-6 flex gap-1.5", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSlide(i), "aria-label": `Slide ${i + 1}`, className: `h-1.5 rounded-full transition-all ${i === slide ? "w-6 bg-[#A855F7]" : "w-1.5 bg-white/35 hover:bg-white/60"}` }, i)) })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-xl", children: "Seasons" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-sm font-semibold hover:underline", style: {
                  color: PURPLE
                }, onClick: () => setTab("Series"), children: "View All" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4", children: (shows.length > 0 ? shows.slice(0, 4).map((sh, idx) => ({
                id: sh.id,
                title: sh.title.toUpperCase(),
                count: `${sh.episodes.length} EPISODES`,
                img: sh.episodes[0]?.thumbnail_url || FALL_POSTS[idx % 5]
              })) : FALLBACK_SEASONS).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toast(`Opening ${s.title.replace(/\n/g, " ")}`), className: "channel-poster-card group text-left", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: s.img, alt: "", loading: "lazy", className: "absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", style: {
                  background: "linear-gradient(180deg, transparent 35%, rgba(5,7,13,0.88) 100%)"
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-3.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-extrabold text-lg leading-[0.95] whitespace-pre-line mb-1.5", children: s.title }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-extrabold tracking-[0.18em] uppercase", style: {
                    color: PURPLE
                  }, children: s.count })
                ] })
              ] }, s.id)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-xl", children: "Popular Videos" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-sm font-semibold hover:underline", style: {
                  color: PURPLE
                }, onClick: () => setTab("Videos"), children: "View All" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4", children: (publicEpisodes.length > 0 ? publicEpisodes.slice(0, 4).map((e, idx) => ({
                id: e.content_id,
                title: e.title || "Untitled",
                img: e.thumbnail_url || FALL_POSTS[idx % 5],
                duration: e.duration
              })) : FALLBACK_POPULAR).map((v, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group cursor-pointer", onClick: () => toast(`▶ ${v.title}`), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-xl overflow-hidden border border-white/10 aspect-video", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: v.img, alt: "", loading: "lazy", className: "absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-12 rounded-full bg-white/95 text-black flex items-center justify-center shadow-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-5 fill-black" }) }) }),
                  v.duration && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/85 text-[10px] font-bold", children: v.duration }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    toggleWatch(v.id, v.title);
                  }, className: `absolute top-1.5 right-1.5 size-7 rounded-full border flex items-center justify-center backdrop-blur transition active:scale-90 ${watchlist.has(v.id) ? "border-[#A855F7] bg-[#A855F7]/30" : "border-white/30 bg-black/40 hover:bg-black/70"}`, "aria-label": "Watchlist", children: watchlist.has(v.id) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-3.5" }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-2 text-[13px] font-semibold leading-snug line-clamp-2", children: v.title })
              ] }, v.id)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-8 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-xl", children: "Playlists" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-sm font-semibold hover:underline", style: {
                  color: PURPLE
                }, onClick: () => setTab("Playlists"), children: "View All" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4", children: PLAYLIST_ITEMS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toast(`Opening ${p.label} playlist`), className: "relative rounded-xl overflow-hidden border border-white/10 hover-lift h-[88px] flex items-center gap-3 px-4 text-left active:scale-[0.98] transition", style: {
                background: "linear-gradient(135deg, rgba(168,85,247,0.18) 0%, rgba(99,102,241,0.10) 100%)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-11 h-11 rounded-lg flex items-center justify-center", style: {
                  background: "rgba(168,85,247,0.18)",
                  border: "1px solid rgba(168,85,247,0.4)"
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(p.I, { className: "size-5", style: {
                  color: PURPLE
                } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-extrabold text-sm tracking-wide", children: p.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold tracking-[0.16em] uppercase text-white/55", children: p.count })
                ] })
              ] }, p.label)) })
            ] })
          ] }),
          tab === "Videos" && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-6", children: publicEpisodes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 py-16 text-white/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Film, { className: "size-10 opacity-40" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No videos yet" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4", children: publicEpisodes.map((e, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group cursor-pointer", onClick: () => toast(`▶ ${e.title}`), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-xl overflow-hidden border border-white/10 aspect-video", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: e.thumbnail_url || FALL_POSTS[idx % 5], alt: "", loading: "lazy", className: "absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-12 rounded-full bg-white/95 text-black flex items-center justify-center shadow-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-5 fill-black" }) }) }),
              e.duration && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/85 text-[10px] font-bold", children: e.duration }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (ev) => {
                ev.stopPropagation();
                toggleWatch(e.content_id, e.title);
              }, className: `absolute top-1.5 right-1.5 size-7 rounded-full border flex items-center justify-center backdrop-blur transition active:scale-90 ${watchlist.has(e.content_id) ? "border-[#A855F7] bg-[#A855F7]/30" : "border-white/30 bg-black/40 hover:bg-black/70"}`, "aria-label": "Watchlist", children: watchlist.has(e.content_id) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-3.5" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-2 text-[13px] font-semibold leading-snug line-clamp-2", children: e.title || "Untitled" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-[11px] text-white/55", children: e.show_title || "" })
          ] }, e.content_id)) }) }),
          tab === "Series" && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-6", children: shows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 py-16 text-white/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Film, { className: "size-10 opacity-40" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No series yet" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4", children: shows.map((sh, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toast(`Opening ${sh.title}`), className: "channel-poster-card group text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: sh.episodes[0]?.thumbnail_url || FALL_POSTS[idx % 5], alt: "", loading: "lazy", className: "absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", style: {
              background: "linear-gradient(180deg, transparent 35%, rgba(5,7,13,0.88) 100%)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-3.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-extrabold text-lg leading-[0.95] mb-1.5", children: sh.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-extrabold tracking-[0.18em] uppercase", style: {
                color: PURPLE
              }, children: [
                sh.episodes.length,
                " EPISODES"
              ] })
            ] })
          ] }, sh.id)) }) }),
          tab === "Playlists" && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4", children: PLAYLIST_ITEMS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toast(`Opening ${p.label} playlist`), className: "relative rounded-xl overflow-hidden border border-white/10 hover-lift h-[88px] flex items-center gap-3 px-4 text-left active:scale-[0.98] transition", style: {
            background: "linear-gradient(135deg, rgba(168,85,247,0.18) 0%, rgba(99,102,241,0.10) 100%)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-11 h-11 rounded-lg flex items-center justify-center", style: {
              background: "rgba(168,85,247,0.18)",
              border: "1px solid rgba(168,85,247,0.4)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(p.I, { className: "size-5", style: {
              color: PURPLE
            } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-extrabold text-sm tracking-wide", children: p.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold tracking-[0.16em] uppercase text-white/55", children: p.count })
            ] })
          ] }, p.label)) }) }),
          tab === "About" && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-6 mb-4 max-w-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "channel-panel p-6 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "channel-eyebrow mb-1", children: "About" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-2xl mb-2", children: isOwnerChannel ? "King Trey" : `@${handle}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/80 leading-relaxed", children: isOwnerChannel ? "Bringing real life, raw conversations, and mad entertainment to Trey TV. Welcome to the family." : `Creator channel on Trey TV. Follow @${handle} for new content every week.` })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-8 pt-2 border-t border-white/8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display font-extrabold text-2xl", children: fmt(socialCounts.followers) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wider text-white/60", children: "Followers" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display font-extrabold text-2xl", children: publicEpisodes.length }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wider text-white/60", children: "Videos" })
              ] })
            ] })
          ] }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(GiftPickerSheet, { open: giftOpen, onClose: () => setGiftOpen(false), recipient: handle })
  ] });
}
function StartWatchPartyButton({
  channelId,
  className
}) {
  const {
    session
  } = useSupabaseSession();
  const navigate = useNavigate();
  const [busy, setBusy] = reactExports.useState(false);
  if (!session?.access_token) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/login", className: `text-xs px-3 py-1.5 rounded-full border border-white/15 hover:bg-white/5 inline-flex items-center gap-1.5 ${className ?? ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-3.5" }),
      "Sign in to host a party"
    ] });
  }
  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await createWatchParty({
        data: {
          accessToken: session.access_token,
          channelId
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
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick, disabled: busy, className: `text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 inline-flex items-center gap-1.5 disabled:opacity-50 ${className ?? ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-3.5" }),
    busy ? "Starting…" : "Start watch party"
  ] });
}
export {
  ChannelPage as component
};
