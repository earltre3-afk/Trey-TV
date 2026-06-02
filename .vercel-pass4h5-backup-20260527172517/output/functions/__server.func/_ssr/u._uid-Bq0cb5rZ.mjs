import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useRouterState, O as Outlet, e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { J as Route$15, b as useAuth$1, K as isTreyOwnerProfile, k as currentUser, c as createBrowserClient } from "./router-BtgGywEC.mjs";
import { u as useProfile, a as useRelationshipStatus, b as useTopThree, p as portrait } from "./lovable-profile-portrait-DJuAO-UE.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { c as useFwdGifLibrary, g as getFwdPosterUrl, d as getAnimatedFwdGifUrl, b as buildFwdGifDetailUrl, F as FwdGifPicker } from "./FwdGifPicker-CLzlV72K.mjs";
import { t as treyTvLogo } from "./trey-tv-logo-CG7PjBoN.mjs";
import { h as heroBg, p as post1, a as post2, b as post3, c as post4, d as post5 } from "./lovable-post5-I8S4Bjy7.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { A as ArrowLeft, bT as Share, aV as Ellipsis, P as Plus, t as Crown, S as Sparkles, be as MapPin, bj as Link2, as as BadgeCheck, at as UserPlus, h as Mail, b as Heart, a4 as Play, r as ChevronRight, ao as Pencil, bg as Instagram, bU as Twitter, bh as Music2, bi as Youtube, bV as Disc3, l as ShieldCheck, bW as FingerprintPattern, bo as KeyRound, F as FileText, a5 as Users, G as Globe, bX as Sparkle, U as User, a9 as Clock, aS as Pin, aN as ShoppingBag, Y as Flame, bk as Rocket, bY as Stethoscope, aw as Trophy, j as Eye, T as TrendingUp, X, bZ as StickyNote, d as Image, a_ as ExternalLink } from "../_libs/lucide-react.mjs";
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
const banner = "/assets/profile-banner-CinOSUIV.jpg";
function useFollowState(targetUserId, initialFollowing = false, onChange) {
  const [following, setFollowing] = reactExports.useState(initialFollowing);
  const [pending, setPending] = reactExports.useState(false);
  const [countsTick, setCountsTick] = reactExports.useState(0);
  reactExports.useEffect(() => setFollowing(initialFollowing), [initialFollowing]);
  reactExports.useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!targetUserId) return;
      const supabase = createBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user || auth.user.id === targetUserId) return;
      const { data } = await supabase.from("follows").select("id").eq("follower_id", auth.user.id).eq("following_id", targetUserId).maybeSingle();
      if (mounted) setFollowing(!!data);
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [targetUserId, countsTick]);
  const toggle = reactExports.useCallback(async () => {
    if (!targetUserId || pending) return false;
    const supabase = createBrowserClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      toast.error("Please sign in to follow users");
      return false;
    }
    if (auth.user.id === targetUserId) {
      toast.error("You cannot follow yourself");
      return false;
    }
    const previous = following;
    const next = !previous;
    setPending(true);
    setFollowing(next);
    onChange?.(next);
    const result = next ? await supabase.from("follows").upsert({ follower_id: auth.user.id, following_id: targetUserId }, { onConflict: "follower_id,following_id" }) : await supabase.from("follows").delete().eq("follower_id", auth.user.id).eq("following_id", targetUserId);
    setPending(false);
    if (result.error) {
      setFollowing(previous);
      onChange?.(previous);
      toast.error(result.error.message || "Could not update follow");
      return false;
    }
    setCountsTick((t) => t + 1);
    toast.success(next ? "Followed" : "Unfollowed");
    return true;
  }, [following, onChange, pending, targetUserId]);
  return { following, pending, toggle };
}
function useSubscribeState(targetUserId, initialSubscribed = false, onChange) {
  const [subscribed, setSubscribed] = reactExports.useState(initialSubscribed);
  const [pending, setPending] = reactExports.useState(false);
  reactExports.useEffect(() => setSubscribed(initialSubscribed), [initialSubscribed]);
  reactExports.useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!targetUserId) return;
      const supabase = createBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user || auth.user.id === targetUserId) return;
      const { data } = await supabase.from("creator_subscriptions").select("id").eq("subscriber_id", auth.user.id).eq("subscribed_to_id", targetUserId).maybeSingle();
      if (mounted) setSubscribed(!!data);
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [targetUserId]);
  const toggle = reactExports.useCallback(async () => {
    if (!targetUserId || pending) return false;
    const supabase = createBrowserClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      toast.error("Please sign in to subscribe");
      return false;
    }
    if (auth.user.id === targetUserId) {
      toast.error("You cannot subscribe to yourself");
      return false;
    }
    const previous = subscribed;
    const next = !previous;
    setPending(true);
    setSubscribed(next);
    onChange?.(next);
    const result = next ? await supabase.from("creator_subscriptions").upsert({ subscriber_id: auth.user.id, subscribed_to_id: targetUserId }, { onConflict: "subscriber_id,subscribed_to_id" }) : await supabase.from("creator_subscriptions").delete().eq("subscriber_id", auth.user.id).eq("subscribed_to_id", targetUserId);
    setPending(false);
    if (result.error) {
      setSubscribed(previous);
      onChange?.(previous);
      toast.error(result.error.message || "Could not update subscription");
      return false;
    }
    toast.success(next ? "Subscribed" : "Unsubscribed");
    return true;
  }, [onChange, pending, subscribed, targetUserId]);
  return { subscribed, pending, toggle };
}
const taurusBull = "/assets/lovable-taurus-bull-Ng9-ZrDJ.png";
const prescribeLock = "/assets/lovable-prescribe-lock-BjW6q-sz.png";
const GOLD = "#FFC857";
const NEON_BLUE = "#22D3EE";
const NEON_PURPLE = "#A855F7";
const PINK = "#EC4899";
const GREEN = "#22C55E";
const RED = "#EF4444";
const FALL_POSTS = [post1, post2, post3, post4, post5];
function GoldCheck({ size = 24, className = "" }) {
  const uid = reactExports.useId().replace(/[^a-zA-Z0-9]/g, "");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      className,
      style: { filter: "drop-shadow(0 0 6px rgba(255,200,87,0.85)) drop-shadow(0 0 16px rgba(255,200,87,0.55)) drop-shadow(0 1px 1px rgba(0,0,0,0.55))" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("defs", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("radialGradient", { id: `gc-face-${uid}`, cx: "35%", cy: "28%", r: "80%", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#FFF6CF" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "35%", stopColor: "#FFD668" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "70%", stopColor: "#E9A917" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#8A5A00" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: `gc-rim-${uid}`, x1: "0", y1: "0", x2: "1", y2: "1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#FFF1B0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "50%", stopColor: "#7A4E00" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#FFEFA8" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: `gc-sheen-${uid}`, x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#FFFFFF", stopOpacity: "0.85" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "55%", stopColor: "#FFFFFF", stopOpacity: "0.05" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#FFFFFF", stopOpacity: "0" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: `gc-spark-${uid}`, x1: "0", y1: "0", x2: "1", y2: "0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#FFFFFF", stopOpacity: "0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "49%", stopColor: "#FFFFFF", stopOpacity: "0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "50%", stopColor: "#FFFFFF", stopOpacity: "0.95" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "51%", stopColor: "#FFFFFF", stopOpacity: "0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#FFFFFF", stopOpacity: "0" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("clipPath", { id: `gc-clip-${uid}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "11" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("g", { style: { transformOrigin: "12px 12px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "11.5", fill: `url(#gc-rim-${uid})`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("animateTransform", { attributeName: "transform", type: "rotate", from: "0 12 12", to: "360 12 12", dur: "9s", repeatCount: "indefinite" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "10.6", fill: `url(#gc-face-${uid})` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ellipse", { cx: "12", cy: "7.5", rx: "7.5", ry: "3.6", fill: `url(#gc-sheen-${uid})`, opacity: "0.9" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6.5 12.4 L10.4 16.2 L17.6 7.8", fill: "none", stroke: "#0a0a0a", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round", style: { filter: "drop-shadow(0 1px 0 rgba(255,235,160,0.55))" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("g", { clipPath: `url(#gc-clip-${uid})`, style: { mixBlendMode: "screen" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "-24", y: "0", width: "24", height: "24", fill: `url(#gc-spark-${uid})`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("animate", { attributeName: "x", from: "-24", to: "24", dur: "3.2s", begin: "0s", repeatCount: "indefinite" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "10.6", fill: "none", stroke: "#FFF6CF", strokeOpacity: "0.5", strokeWidth: "0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "11.5", fill: "none", stroke: "#0a0a0a", strokeOpacity: "0.5", strokeWidth: "0.6" })
      ]
    }
  );
}
function Medallion({ icon: Icon, label, color, accent }) {
  const c2 = accent ?? color;
  const grad = `linear-gradient(135deg, ${color}, ${c2})`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-12 h-12 flex items-center justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full blur-md opacity-60", style: { background: grad } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full", style: { background: `linear-gradient(135deg,${color}26,${c2}14)`, boxShadow: `inset 0 0 0 1px ${color}88,0 0 10px ${c2}55` } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute inset-0 rounded-full opacity-90", style: { padding: 1, background: grad, WebkitMask: "linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-5 h-5 relative z-10 text-white", style: { filter: `drop-shadow(0 0 6px ${color})` } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-foreground/80 text-center leading-tight", children: label })
  ] });
}
function LinkRow({ icon: Icon, color, accent, title, sub }) {
  const c2 = accent ?? color;
  const grad = `linear-gradient(135deg,${color},${c2})`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "#", className: "group relative panel px-2.5 py-2 flex items-center gap-2 hover-lift cursor-pointer overflow-hidden", style: { background: `linear-gradient(135deg,${color}1F,${c2}14 70%)`, borderColor: `${color}55` }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none", style: { background: `linear-gradient(110deg,transparent 40%,${c2}40 50%,transparent 60%)` } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full blur-xl opacity-50 group-hover:opacity-90 transition", style: { background: grad } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform text-white", style: { background: grad, border: `1px solid ${color}88`, boxShadow: `0 0 14px ${color}66,0 0 20px ${c2}40,inset 0 1px 0 rgba(255,255,255,0.35)` }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold truncate leading-tight", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] truncate", style: { color: `${c2}cc` }, children: sub })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "relative w-3 h-3 transition group-hover:translate-x-0.5", style: { color: c2 } })
  ] });
}
function ProfilePageNew({
  profile,
  variant = "public"
}) {
  const navigate = useNavigate();
  const { user: authUser, isGuest } = useAuth$1();
  const myUid = authUser?.uid ?? "";
  const [noteOpen, setNoteOpen] = reactExports.useState(false);
  const [noteTab, setNoteTab] = reactExports.useState("note");
  const [note, setNote] = reactExports.useState("");
  const [localFollowers, setLocalFollowers] = reactExports.useState(Number(profile.stats.followers) || 0);
  const [localSubscribers, setLocalSubscribers] = reactExports.useState(Number(profile.stats.subscribers) || 0);
  const [showFwdGifs, setShowFwdGifs] = reactExports.useState(!!profile.showFwdGifsOnProfile);
  const [showFwdPicker, setShowFwdPicker] = reactExports.useState(false);
  const followState = useFollowState(profile.profileUserId, false, (next) => {
    setLocalFollowers((count) => Math.max(0, count + (next ? 1 : -1)));
  });
  const subscribeState = useSubscribeState(profile.profileUserId, false, (next) => {
    setLocalSubscribers((count) => Math.max(0, count + (next ? 1 : -1)));
  });
  const fwdLibrary = useFwdGifLibrary("created", 12, 0);
  const isPublic = variant === "public";
  const showOwnerBadge = variant === "owner";
  const showCreatorBadge = (variant === "owner" || variant === "creator" || isPublic) && profile.isCreator;
  const showVerifiedBadge = profile.isVerified && variant !== "user";
  const showChannelCTA = profile.isCreator && variant !== "user";
  const showGiftButton = profile.isCreator && variant !== "user";
  const showOwnerControls = variant === "owner";
  const showCreatorControls = variant === "creator";
  const fwdGifs = showOwnerControls && fwdLibrary.data?.ok ? fwdLibrary.data.data.gifs : [];
  const bannerSrc = profile.bannerUrl || heroBg;
  const avatarSrc = profile.avatarUrl || portrait;
  const fmt = (n) => {
    const num = typeof n === "string" ? parseInt(n, 10) : n;
    if (isNaN(num)) return String(n);
    return num >= 1e6 ? `${(num / 1e6).toFixed(1)}M` : num >= 1e3 ? `${(num / 1e3).toFixed(1)}K` : String(num);
  };
  const onShare = async () => {
    try {
      await navigator.share?.({ title: profile.displayName, url: location.href });
    } catch {
      await navigator.clipboard?.writeText(location.href);
      toast.success("Link copied");
    }
  };
  const onMessage = () => {
    navigate({ to: "/inbox", search: { to: profile.handle } });
  };
  const toggleFwdVisibility = async () => {
    if (!authUser || !profile.profileUserId || authUser.uid !== profile.uid) return;
    const next = !showFwdGifs;
    setShowFwdGifs(next);
    const supabase = createBrowserClient();
    const { error } = await supabase.from("profiles").update({ show_fwd_gifs_on_profile: next }).eq("id", profile.profileUserId);
    if (error) {
      setShowFwdGifs(!next);
      toast.error("Could not update FWD visibility");
      return;
    }
    toast.success(next ? "FWD GIFs visible on your profile" : "FWD GIFs hidden from your profile");
  };
  const channelLink = `/channel/${profile.handle}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "profile-refr", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "aria-hidden": true, className: "fixed inset-0 -z-10 overflow-hidden pointer-events-none", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-32 -left-20 w-[420px] h-[420px] rounded-full blur-3xl opacity-30", style: { background: `radial-gradient(circle,${NEON_PURPLE},transparent 60%)` } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/3 -right-24 w-[360px] h-[360px] rounded-full blur-3xl opacity-25", style: { background: `radial-gradient(circle,${NEON_BLUE},transparent 60%)` } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full blur-3xl opacity-20", style: { background: `radial-gradient(circle,${PINK},transparent 60%)` } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative w-full reveal", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-[220px] sm:h-[260px] md:h-[300px] w-full overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: bannerSrc, alt: "", "aria-hidden": true, className: "absolute inset-0 w-full h-full object-cover", decoding: "async" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-[#05070D] via-[#05070D]/40 to-[#05070D]/10" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", style: { background: `radial-gradient(circle at 50% 35%,${NEON_PURPLE}40,transparent 60%)` } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Go back", onClick: () => navigate({ to: "/" }), className: "absolute top-3 left-3 w-9 h-9 rounded-full bg-black/40 border border-white/15 backdrop-blur-md flex items-center justify-center active:scale-95 transition z-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-3 right-3 flex gap-1.5 z-20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Share", onClick: onShare, className: "w-9 h-9 rounded-full bg-black/40 border border-white/15 backdrop-blur-md flex items-center justify-center active:scale-95 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "More", className: "w-9 h-9 rounded-full bg-black/40 border border-white/15 backdrop-blur-md flex items-center justify-center active:scale-95 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "w-4 h-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative logo-anim w-[160px] sm:w-[200px] md:w-[240px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[70%] rounded-[50%] blur-3xl opacity-60 logo-halo-pulse", style: { background: `radial-gradient(ellipse at center,${NEON_PURPLE}55 0%,${NEON_BLUE}33 45%,transparent 70%)` } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: treyTvLogo, alt: "Trey TV", className: "relative w-full h-auto object-contain", style: { filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.85)) drop-shadow(0 0 10px rgba(168,85,247,0.35))" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute inset-0 mix-blend-screen opacity-70", style: { WebkitMaskImage: `url(${treyTvLogo})`, maskImage: `url(${treyTvLogo})`, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center", background: "linear-gradient(to bottom,rgba(255,255,255,0.6) 0%,rgba(255,255,255,0.18) 38%,rgba(255,255,255,0) 55%)" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute inset-0 overflow-hidden", style: { WebkitMaskImage: `url(${treyTvLogo})`, maskImage: `url(${treyTvLogo})`, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -inset-y-6 -left-1/3 w-1/3 animate-scan-sweep", style: { background: "linear-gradient(115deg,transparent 35%,rgba(255,255,255,0.9) 50%,transparent 65%)", filter: "blur(2px)" } }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#05070D] to-transparent" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-1/2 -translate-x-1/2 -bottom-14 z-30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-[120px] h-[120px] md:w-[150px] md:h-[150px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -inset-10 rounded-full opacity-25 blur-3xl", style: { background: NEON_PURPLE } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -inset-[5px] rounded-full ring-gradient animate-spin-slow opacity-80", style: { filter: "blur(0.5px)" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -inset-[2px] rounded-full ring-pulse opacity-90" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full bg-[#05070D] overflow-hidden border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: avatarSrc, alt: profile.displayName, fetchPriority: "high", decoding: "async", className: "w-full h-full object-cover" }) }),
        showVerifiedBadge && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-1 -right-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GoldCheck, { size: 42 }) }),
        showOwnerControls && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setNoteOpen(true), "aria-label": "Add note", className: "absolute -top-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center bg-white text-black border-2 border-white/80 shadow-[0_0_18px_rgba(255,255,255,0.85)] hover:scale-110 active:scale-95 transition-transform plus-pulse z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-5 h-5", strokeWidth: 3 }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[1280px] mx-auto px-3 md:px-6 pt-[72px] md:pt-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-2xl mx-auto mb-5 md:mb-7", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center reveal", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-[26px] md:text-3xl font-extrabold metallic-chrome drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]", children: profile.displayName }),
          showVerifiedBadge && /* @__PURE__ */ jsxRuntimeExports.jsx(GoldCheck, { size: 22 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-[11px] tracking-wide text-muted-foreground", children: [
          "@",
          profile.handle
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2.5 flex items-center justify-center flex-wrap gap-1.5 px-2", children: [
          showOwnerBadge && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "owner-badge inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.22em] whitespace-nowrap px-2.5 py-[4px] sm:px-3 sm:py-[5px] rounded-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "owner-badge__shine" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "owner-badge__crown", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "w-2.5 h-2.5", strokeWidth: 2.5 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "owner-badge__text", children: "Owner" })
          ] }),
          [
            showVerifiedBadge && { I: GoldCheck, l: "Verified", c: GOLD, gold: true },
            showCreatorBadge && { I: Sparkles, l: "Creator", c: NEON_PURPLE, gold: false }
          ].filter(Boolean).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "role-pill inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] text-white/95 px-2 py-[3px] sm:px-2.5 sm:py-1 rounded-full whitespace-nowrap", style: { "--pill-c": b.c }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "role-pill__shine" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "role-pill__ring" }),
            b.gold ? /* @__PURE__ */ jsxRuntimeExports.jsx(GoldCheck, { size: 11, className: "role-pill__icon" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(b.I, { className: "w-2.5 h-2.5 role-pill__icon", strokeWidth: 2.5, style: { color: b.c } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "role-pill__label", style: { textShadow: `0 0 8px ${b.c}66` }, children: b.l })
          ] }, b.l))
        ] }),
        profile.bio && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[12px] text-foreground/85 leading-snug px-4", children: profile.bio }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 flex items-center justify-center gap-3 text-[10px] text-muted-foreground flex-wrap", children: [
          profile.location && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-3 h-3", style: { color: GOLD } }),
            " ",
            profile.location
          ] }),
          profile.websiteLink && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "w-3 h-3", style: { color: NEON_BLUE } }),
            " ",
            profile.websiteLink
          ] })
        ] }),
        !showOwnerControls && !showCreatorControls && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-3 grid gap-2 max-w-md mx-auto ${showGiftButton ? "grid-cols-4" : "grid-cols-3"}`, children: [
          { l: followState.following ? "Followed" : "Follow", I: followState.following ? BadgeCheck : UserPlus, c: NEON_PURPLE, primary: true, onClick: followState.toggle, disabled: followState.pending },
          { l: subscribeState.subscribed ? "Subscribed" : "Subscribe", I: Sparkles, c: GOLD, primary: false, onClick: subscribeState.toggle, disabled: subscribeState.pending },
          { l: "Message", I: Mail, c: NEON_BLUE, primary: false, onClick: onMessage, disabled: false },
          ...showGiftButton ? [{ l: "Gift", I: Heart, c: PINK, primary: false, onClick: () => toast("Gift picker opens from creator profiles soon."), disabled: false }] : []
        ].map(({ l, I, c, primary, onClick, disabled }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", disabled, onClick, className: "cert-btn group disabled:opacity-60", "data-primary": primary ? "true" : "false", style: { "--btn-c": c }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "cert-btn__border" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "cert-btn__surface" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "cert-btn__cert", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 12 12", className: "w-2 h-2", fill: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M2.5 6.2 L4.8 8.4 L9.5 3.5", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "cert-btn__content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "cert-btn__icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(I, { className: "w-3.5 h-3.5", strokeWidth: 2.25 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "cert-btn__label", children: l })
          ] })
        ] }, l)) }),
        showChannelCTA && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: channelLink, className: "group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-extrabold text-[12px] uppercase tracking-[0.18em] text-black overflow-hidden active:scale-95 hover:scale-[1.04] transition-transform", style: { background: `linear-gradient(135deg,#FFE9A8 0%,${GOLD} 35%,#E9A917 60%,#FFF3C4 100%)`, boxShadow: `0 0 0 1px rgba(255,255,255,0.35) inset,0 0 22px ${GOLD}99,0 0 48px ${GOLD}66,0 8px 30px rgba(0,0,0,0.55)` }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "absolute -inset-[2px] rounded-full opacity-90 animate-spin-slow -z-10", style: { background: `conic-gradient(from 0deg,${GOLD},${PINK},${NEON_PURPLE},${NEON_BLUE},${GOLD})`, filter: "blur(6px)" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1100ms] ease-out pointer-events-none", style: { background: "linear-gradient(110deg,transparent 38%,rgba(255,255,255,0.85) 50%,transparent 62%)" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-4 h-4 fill-black", strokeWidth: 2.5 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative", children: "View My Channel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4", strokeWidth: 3 })
        ] }) }),
        showOwnerControls && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex justify-center items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/edit-profile", className: "group relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] text-white/90 border border-white/15 bg-white/[0.04] backdrop-blur-md hover:bg-white/[0.08] hover:border-white/25 active:scale-95 transition", style: { boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08),0 6px 18px rgba(0,0,0,0.45)" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5", style: { color: GOLD } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Edit Profile" })
        ] }) }),
        showCreatorControls && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex justify-center items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/edit-profile", className: "group relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] text-white/90 border border-white/15 bg-white/[0.04] backdrop-blur-md hover:bg-white/[0.08] hover:border-white/25 active:scale-95 transition", style: { boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08),0 6px 18px rgba(0,0,0,0.45)" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5", style: { color: GOLD } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Edit Profile" })
        ] }) }),
        isPublic && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate({ to: -1 }), className: "group relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] text-white/90 border border-white/15 bg-white/[0.04] backdrop-blur-md hover:bg-white/[0.08] active:scale-95 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-3.5 h-3.5", style: { color: NEON_PURPLE } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Back" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3.5 flex items-center justify-center gap-1", children: [
          { I: Instagram, c: PINK, l: "Instagram" },
          { I: Twitter, c: NEON_BLUE, l: "X" },
          { I: Music2, c: "#fff", l: "TikTok" },
          { I: Youtube, c: RED, l: "YouTube" },
          { I: Disc3, c: "#FF7700", l: "SoundCloud" }
        ].map(({ I, c, l }) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": l, className: "w-8 h-8 rounded-full flex items-center justify-center border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 active:scale-90 transition", style: { color: c }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(I, { className: "w-3.5 h-3.5" }) }, l)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-6 lg:items-start space-y-3 lg:space-y-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 lg:sticky lg:top-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "panel neon-border p-2.5 reveal", style: { animationDelay: ".05s" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-1.5 text-center", children: [
            { I: ShieldCheck, l: "Identity", s: "Confirmed", c: GOLD },
            { I: FingerprintPattern, l: "Original", s: "Account", c: NEON_BLUE },
            { I: KeyRound, l: profile.isCreator ? "Creator" : "Member", s: "Verified", c: NEON_PURPLE }
          ].map(({ I, l, s, c }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-0.5 py-1 transition hover:-translate-y-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 rounded-full flex items-center justify-center", style: { background: `${c}1A`, border: `1px solid ${c}66`, boxShadow: `0 0 12px ${c}55,inset 0 0 8px ${c}22` }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(I, { className: "w-3.5 h-3.5", style: { color: c } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold leading-none mt-0.5", style: { color: c }, children: l }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-muted-foreground leading-none", children: s })
          ] }, l)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "panel neon-border grid grid-cols-4 divide-x divide-white/5 reveal", style: { animationDelay: ".08s" }, children: [
            { I: FileText, c: NEON_BLUE, v: fmt(profile.stats.posts || 0), l: "Posts" },
            { I: Users, c: NEON_PURPLE, v: fmt(localFollowers || 0), l: "Followers" },
            { I: UserPlus, c: PINK, v: fmt(profile.stats.following || 0), l: "Following" },
            { I: Sparkles, c: GOLD, v: fmt(localSubscribers || 0), l: "Subs" }
          ].map(({ I, c, v, l }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex items-center justify-center gap-1.5 px-1 py-2.5 transition hover:bg-white/[0.03] active:scale-[0.98]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(I, { className: "w-3.5 h-3.5", style: { color: c, filter: `drop-shadow(0 0 6px ${c})` } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold leading-none tabular-nums", children: v }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: l })
            ] })
          ] }, l)) }),
          profile.gifOfDayUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "panel neon-border p-3 reveal", style: { animationDelay: ".09s" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full", style: { background: NEON_BLUE, boxShadow: `0 0 8px ${NEON_BLUE}` } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-xs", children: "GIF of the Day" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-[9px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-muted-foreground", children: "FWD" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-xl border border-white/10 max-h-52", children: [
              profile.gifOfDayPosterUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: profile.gifOfDayPosterUrl, alt: "", "aria-hidden": true, className: "absolute inset-0 h-full w-full object-cover opacity-25 blur-sm", loading: "lazy" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: profile.gifOfDayUrl,
                  alt: "GIF of the Day",
                  className: "relative w-full object-cover",
                  loading: "lazy"
                }
              )
            ] }),
            profile.gifOfDayCaption && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[11px] text-foreground/70 text-center", children: profile.gifOfDayCaption })
          ] }),
          (showOwnerControls || showFwdGifs) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "panel neon-border p-3 reveal", style: { animationDelay: ".095s" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full", style: { background: NEON_PURPLE, boxShadow: `0 0 8px ${NEON_PURPLE}` } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold", children: "FWD GIF Library" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground", children: "FWD" })
            ] }),
            showOwnerControls && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold", children: showFwdGifs ? "Visible on profile" : "Hidden from public profile" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: "Only public/allowed FWD GIFs are shown." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: toggleFwdVisibility, className: "rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-bold active:scale-95", style: { color: showFwdGifs ? GOLD : NEON_BLUE }, children: showFwdGifs ? "Hide" : "Show" })
            ] }),
            showFwdGifs && fwdGifs.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: fwdGifs.map((gif) => {
              const poster = getFwdPosterUrl(gif);
              const src = getAnimatedFwdGifUrl(gif) || poster || "";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: buildFwdGifDetailUrl(gif.gif_id ?? gif.id), className: "group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]", target: "_blank", rel: "noreferrer", children: [
                poster && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: poster, alt: "", "aria-hidden": true, className: "absolute inset-0 h-full w-full object-cover opacity-25 blur-sm", loading: "lazy" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src, alt: gif.title || "FWD GIF", loading: "lazy", className: "relative h-full w-full object-cover transition duration-500 group-hover:scale-110" })
              ] }, gif.id);
            }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-white/10 bg-white/[0.035] p-3 text-center text-[11px] text-muted-foreground", children: showOwnerControls ? "Choose GIFs in FWD or feature a GIF of the Day from Edit Profile." : "No public FWD GIFs yet." }),
            showOwnerControls && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowFwdPicker(true), className: "mt-3 w-full rounded-full border border-white/15 px-3 py-2 text-[11px] font-bold text-white/90 active:scale-95", children: "Choose from FWD" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "panel neon-border p-3 reveal relative", style: { animationDelay: ".1s" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full", style: { background: NEON_PURPLE, boxShadow: `0 0 8px ${NEON_PURPLE}` } }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-xs", children: [
                  "About ",
                  profile.displayName.split(" ")[0]
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-foreground/80 leading-relaxed mb-2", children: profile.bio || "Member of Trey TV. Building something great." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-semibold inline-flex items-center gap-0.5 hover:bg-white/5 transition", children: [
                "Full bio ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-2.5 h-2.5" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[auto_1fr_auto] gap-x-2 md:gap-x-6 gap-y-1.5 items-center text-[10px] md:text-[11px] w-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5 justify-self-start", children: [
                { I: Globe, l: "Member since" },
                { I: Sparkle, l: "Creator" },
                { I: User, l: "Prescribe Me" },
                { I: BadgeCheck, l: "Response rate" },
                { I: Clock, l: "Avg. response" }
              ].map(({ I, l }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-left", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(I, { className: "w-3 h-3 text-muted-foreground shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: l })
              ] }, l)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center self-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-[96px] h-[112px] md:w-[120px] md:h-[140px] flex items-center justify-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full blur-2xl opacity-60", style: { background: `radial-gradient(circle,${GOLD}66,transparent 70%)` } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-1 rounded-full animate-spin-slow", style: { background: `conic-gradient(${GOLD},transparent 30%,${NEON_PURPLE},transparent 60%,${GOLD})`, WebkitMask: "radial-gradient(circle,transparent 60%,#000 62%,#000 66%,transparent 68%)", mask: "radial-gradient(circle,transparent 60%,#000 62%,#000 66%,transparent 68%)", filter: `drop-shadow(0 0 8px ${GOLD})` } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: taurusBull, alt: "zodiac", className: "relative w-[64px] md:w-[80px] animate-float", style: { filter: `drop-shadow(0 0 12px ${GOLD}) drop-shadow(0 0 22px ${NEON_PURPLE}88)` } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -bottom-1 left-1/2 -translate-x-1/2 text-[7px] font-bold tracking-[0.22em] px-1.5 py-0.5 rounded-full border whitespace-nowrap", style: { color: GOLD, borderColor: `${GOLD}88`, background: "rgba(0,0,0,0.7)", boxShadow: `0 0 10px ${GOLD}55` }, children: profile.zodiacSunSign ? `♉ ${profile.zodiacSunSign.toUpperCase()}` : "♉ TAURUS" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5 justify-self-end text-right", children: [
                { v: profile.joinedDate || "Jan 2023", c: "#fff" },
                { v: profile.isCreator ? "Music • Film" : "Member", c: "#fff" },
                { v: "Open", c: GREEN },
                { v: "98%", c: NEON_BLUE },
                { v: "2h", c: "#fff" }
              ].map(({ v, c }, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "font-medium", style: { color: c }, children: v }, i)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "panel neon-border grid grid-cols-4 reveal", style: { animationDelay: ".15s" }, children: ["Posts", "Likes", "Saved", "About"].map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: `relative py-3 text-[12px] font-semibold transition active:scale-95 ${i === 0 ? "text-white" : "text-muted-foreground hover:text-white"}`, children: [
            t,
            i === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-0 left-1/3 right-1/3 h-[2px] rounded-full", style: { background: GOLD, boxShadow: `0 0 8px ${GOLD}` } })
          ] }, t)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "panel neon-border p-3 reveal", style: { animationDelay: ".2s" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full", style: { background: NEON_BLUE, boxShadow: `0 0 8px ${NEON_BLUE}` } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-xs", children: "Recent Posts" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { className: "text-[9px] text-muted-foreground inline-flex items-center gap-0.5 hover:text-white", href: "#", children: [
                "View all ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-2.5 h-2.5" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2", children: FALL_POSTS.map((img, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10 group hover:border-white/30 transition", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: img, alt: "", loading: "lazy", decoding: "async", className: "w-full h-full object-cover group-hover:scale-110 transition duration-700" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" }),
              i === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1 left-1 w-4 h-4 rounded-full flex items-center justify-center", style: { background: GOLD }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "w-2 h-2 text-black" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-1 left-1 right-1 flex items-center justify-between text-[8px] font-medium text-white", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-2 h-2 fill-current" }),
                  " ",
                  ["34.2K", "52.6K", "12.1K", "18.7K", "24.3K"][i]
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/70", children: ["1:24", "2:08", "0:58", "1:45", "2:12"][i] })
              ] })
            ] }, i)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "panel neon-border p-3 reveal", style: { animationDelay: ".22s" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full", style: { background: GOLD, boxShadow: `0 0 8px ${GOLD}` } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-xs", children: "Top 3 Friends" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-muted-foreground", children: "· inner circle" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { className: "text-[9px] text-muted-foreground inline-flex items-center gap-0.5 hover:text-white", href: "#", children: [
                "View all ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-2.5 h-2.5" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3 md:gap-5 place-items-center pt-2 pb-1", children: [
              { name: "Jaylen K.", handle: "@jayk", img: post2, rank: 1, color: GOLD, accent: "#FFE066", badge: "BFF" },
              { name: "Mira S.", handle: "@mira", img: post3, rank: 2, color: NEON_PURPLE, accent: "#E0E0E0", badge: "Day 1" },
              { name: "Devon R.", handle: "@dev", img: post4, rank: 3, color: NEON_BLUE, accent: "#FF8A3D", badge: "Squad" }
            ].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group flex flex-col items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-20 h-20 md:w-24 md:h-24", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute -inset-1 rounded-full animate-spin-slow opacity-90", style: { background: `conic-gradient(from 0deg,${f.color},${f.accent},${f.color},transparent 70%,${f.color})` } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute -inset-3 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition", style: { background: `radial-gradient(circle,${f.color}77,transparent 70%)` } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full bg-[#05070D] p-[3px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full rounded-full overflow-hidden border border-white/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: f.img, alt: f.name, loading: "lazy", decoding: "async", className: "w-full h-full object-cover group-hover:scale-110 transition duration-700" }) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute -bottom-1.5 -right-1.5 w-8 h-8 flex items-center justify-center", style: { color: f.color }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full blur-md opacity-70", style: { background: f.color } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full border-2", style: { borderColor: f.color, background: `radial-gradient(circle at 35% 30%,${f.color}66,#0a0418 85%)`, backdropFilter: "blur(4px)", boxShadow: `inset 0 1px 0 rgba(255,255,255,0.4),0 0 10px ${f.color}99` } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative z-10 text-[14px] font-black leading-none", style: { color: "#fff", textShadow: `0 1px 0 rgba(0,0,0,0.85),0 0 6px ${f.color}` }, children: f.rank })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center max-w-[88px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold text-white leading-tight truncate", children: f.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full inline-block mt-0.5 text-black", style: { background: f.color, boxShadow: `0 0 8px ${f.color}90` }, children: f.badge })
              ] })
            ] }, f.handle)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "panel neon-border p-3 reveal", style: { animationDelay: ".25s" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full", style: { background: PINK, boxShadow: `0 0 8px ${PINK}` } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-xs", children: "Connect" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LinkRow, { icon: Instagram, color: "#EC4899", accent: "#A855F7", title: "Instagram", sub: `@${profile.handle}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(LinkRow, { icon: Globe, color: "#22D3EE", accent: "#3B82F6", title: "Website", sub: profile.websiteLink || "trey.tv" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(LinkRow, { icon: Twitter, color: "#E2E8F0", accent: "#A855F7", title: "X", sub: `@${profile.handle}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(LinkRow, { icon: Mail, color: "#F59E0B", accent: "#EC4899", title: "Booking", sub: `booking@trey.tv` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(LinkRow, { icon: Music2, color: "#22D3EE", accent: "#EC4899", title: "TikTok", sub: `@${profile.handle}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(LinkRow, { icon: Youtube, color: "#EF4444", accent: "#FF7700", title: "YouTube", sub: `@${profile.handle}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(LinkRow, { icon: ShoppingBag, color: "#10B981", accent: "#22D3EE", title: "Merch", sub: "treytv.store" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(LinkRow, { icon: Disc3, color: "#FF7700", accent: "#FFC857", title: "SoundCloud", sub: `@${profile.handle}` })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "panel neon-border p-3 reveal", style: { animationDelay: ".3s" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full", style: { background: GOLD, boxShadow: `0 0 8px ${GOLD}` } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-xs", children: "Badges" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-muted-foreground", children: "12 earned" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Medallion, { icon: Flame, label: "Trendsetter", color: "#FF7700", accent: "#EF4444" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Medallion, { icon: Rocket, label: "Early", color: "#A855F7", accent: "#EC4899" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Medallion, { icon: Stethoscope, label: "Prescriber", color: "#10B981", accent: "#34D399" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Medallion, { icon: Crown, label: "Top", color: "#FFC857", accent: "#F59E0B" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Medallion, { icon: Trophy, label: "100K Club", color: "#22D3EE", accent: "#67E8F9" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Medallion, { icon: Eye, label: "Watcher", color: "#6366F1", accent: "#8B5CF6" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Medallion, { icon: Heart, label: "Loved", color: "#EC4899", accent: "#FF7700" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Medallion, { icon: TrendingUp, label: "Rising", color: "#A3E635", accent: "#65A30D" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "panel neon-border p-3 relative overflow-hidden reveal", style: { animationDelay: ".35s" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-60", style: { background: `radial-gradient(circle at 50% 40%,${PINK}33,transparent 60%)` } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: prescribeLock, alt: "", className: "h-16 w-auto animate-float shrink-0", style: { filter: "drop-shadow(0 0 20px rgba(255,80,200,0.7))" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-xs mb-0.5", children: "Prescribe Me" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-foreground/80 mb-2 leading-snug", children: "Unlock exclusive content & deeper access." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded-full px-3 py-1.5 text-[10px] font-bold transition hover:scale-[1.02]", style: { background: GOLD, color: "#000", boxShadow: `0 0 16px ${GOLD}66` }, children: "Prescribe Now" })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }),
    noteOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { "aria-label": "Close", onClick: () => setNoteOpen(false), className: "absolute inset-0 bg-black/70 backdrop-blur-md" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full max-w-sm panel neon-border p-4 rounded-2xl pop-in", style: { boxShadow: `0 0 40px ${NEON_PURPLE}66,0 0 80px ${PINK}44` }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full flex items-center justify-center", style: { background: `${GOLD}1A`, border: `1px solid ${GOLD}66`, boxShadow: `0 0 12px ${GOLD}55` }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4", style: { color: GOLD } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold leading-none", children: "Note of the Day" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: "Share what's on your mind" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setNoteOpen(false), className: "w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-1 p-1 rounded-full bg-white/5 border border-white/10 mb-3", children: [{ id: "note", label: "Note", I: StickyNote, c: NEON_PURPLE }, { id: "gif", label: "GIF", I: Image, c: NEON_BLUE }].map(({ id, label, I, c }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setNoteTab(id), className: `relative flex items-center justify-center gap-1.5 py-1.5 rounded-full text-[11px] font-semibold transition ${noteTab === id ? "text-white" : "text-muted-foreground"}`, style: noteTab === id ? { background: `${c}26`, boxShadow: `0 0 14px ${c}55,inset 0 0 8px ${c}33`, border: `1px solid ${c}66` } : {}, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(I, { className: "w-3.5 h-3.5", style: noteTab === id ? { color: c } : void 0 }),
          " ",
          label
        ] }, id)) }),
        noteTab === "note" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: note, onChange: (e) => setNote(e.target.value.slice(0, 50)), placeholder: "What's the vibe today?", rows: 3, className: "w-full resize-none rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-[12px] text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet-400/60 transition" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-2 right-2.5 text-[9px] font-semibold tabular-nums", style: { color: note.length >= 50 ? PINK : note.length >= 40 ? GOLD : "rgba(255,255,255,0.5)" }, children: [
            note.length,
            "/50"
          ] })
        ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-1.5", children: FALL_POSTS.concat([post1]).map((src, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-cyan-400/60 transition group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src, alt: "", loading: "lazy", className: "w-full h-full object-cover group-hover:scale-110 transition duration-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1 left-1 text-[8px] font-bold text-white/90 bg-black/60 px-1 rounded", children: "GIF" })
        ] }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setNoteOpen(false), className: "mt-3 w-full rounded-full py-2 text-[12px] font-bold transition active:scale-95", style: { background: `linear-gradient(90deg,${NEON_PURPLE},${PINK},${GOLD})`, color: "#0a0a0a", boxShadow: `0 0 20px ${NEON_PURPLE}66` }, children: "Post for today" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      FwdGifPicker,
      {
        open: showFwdPicker,
        context: "profile",
        treyTvUid: myUid || null,
        onClose: () => setShowFwdPicker(false),
        onSelect: () => {
          setShowFwdPicker(false);
          toast.success("FWD GIF selected. Use Edit Profile to feature it as GIF of the Day.");
        }
      }
    )
  ] });
}
function PublicProfileRoute() {
  const {
    uid
  } = Route$15.useParams();
  const pathname = useRouterState({
    select: (state) => state.location.pathname
  });
  const {
    user: authUser,
    isGuest,
    role,
    isApprovedCreator
  } = useAuth$1();
  const {
    profile: dbProfile,
    loading
  } = useProfile(uid);
  useRelationshipStatus(dbProfile?.id || "");
  useTopThree(dbProfile?.id || "");
  const isOwnProfile = !isGuest && authUser?.uid === uid;
  const profileData = reactExports.useMemo(() => {
    if (loading || !dbProfile) {
      const isSessionProfile = isOwnProfile && !!authUser;
      const isTreyProfile3 = isTreyOwnerProfile({
        uid
      });
      const fallback = isSessionProfile ? authUser : isTreyProfile3 ? currentUser : null;
      const isFallbackCreator = isTreyProfile3 || isSessionProfile && (fallback?.verified === "creator" || role === "creator" || role === "admin");
      return {
        uid,
        displayName: fallback?.name ?? (loading ? "Loading profile" : "Profile unavailable"),
        handle: fallback?.handle ?? uid,
        avatarUrl: fallback?.avatar ?? "",
        bannerUrl: fallback?.banner || banner,
        bio: fallback?.bio,
        location: fallback?.location,
        websiteLink: fallback?.link,
        tagline: fallback?.tagline,
        pronouns: fallback?.pronouns,
        birthday: fallback?.birthday,
        favoriteGenres: fallback?.favoriteGenres,
        favoriteCreators: fallback?.favoriteCreators,
        socialInstagram: fallback?.socialInstagram,
        socialTikTok: fallback?.socialTikTok,
        socialYouTube: fallback?.socialYouTube,
        profileVisibility: fallback?.profileVisibility,
        showLocation: fallback?.showLocation,
        showBirthday: fallback?.showBirthday,
        joinedDate: void 0,
        profileType: isFallbackCreator ? "creator" : "user",
        isCreator: isFallbackCreator,
        isVerified: !!fallback?.verified,
        verifiedKind: fallback?.verified ?? (isFallbackCreator ? "creator" : "user"),
        isFounder: isTreyProfile3,
        stats: {
          posts: fallback?.stats?.posts ?? 0,
          followers: fallback?.stats?.followers ?? 0,
          following: fallback?.stats?.following ?? 0,
          prescriptions: fallback?.stats?.prescriptions,
          // Creator extras populated once real data flows in
          episodes: 0,
          subscribers: "—",
          watchHours: "—"
        },
        rewards: authUser?.rewards ?? {
          points: 12480,
          tier: "GOLD"
        },
        interests: [],
        creatorStatus: isSessionProfile ? authUser?.creatorStatus : void 0,
        accentColor: isSessionProfile ? authUser?.accent ?? null : null
      };
    }
    const isCreatorProfile = dbProfile.creator_status === "approved" || dbProfile.role === "creator" || dbProfile.role === "admin" || isOwnProfile && (role === "creator" || role === "admin");
    const isTreyProfile2 = isTreyOwnerProfile({
      username: dbProfile.username,
      public_profile_uid: dbProfile.public_profile_uid
    });
    return {
      uid,
      displayName: dbProfile.display_name || dbProfile.username || "Anonymous",
      handle: dbProfile.username || "anonymous",
      avatarUrl: dbProfile.avatar_url || "",
      bannerUrl: dbProfile.banner_url || banner,
      bio: dbProfile.bio ?? void 0,
      location: dbProfile.location ?? void 0,
      websiteLink: dbProfile.link_url ?? void 0,
      tagline: dbProfile.tagline ?? void 0,
      pronouns: dbProfile.pronouns ?? void 0,
      birthday: dbProfile.birthday ?? void 0,
      favoriteGenres: dbProfile.favorite_genres ?? void 0,
      favoriteCreators: dbProfile.favorite_creators ?? void 0,
      socialInstagram: dbProfile.social_instagram ?? void 0,
      socialTikTok: dbProfile.social_tiktok ?? void 0,
      socialYouTube: dbProfile.social_youtube ?? void 0,
      profileVisibility: dbProfile.profile_visibility,
      showLocation: dbProfile.show_location ?? true,
      showBirthday: dbProfile.show_birthday ?? false,
      joinedDate: dbProfile.created_at ? new Date(dbProfile.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long"
      }) : void 0,
      profileType: isCreatorProfile ? "creator" : "user",
      isCreator: isCreatorProfile,
      isVerified: isCreatorProfile || isOwnProfile && isApprovedCreator,
      verifiedKind: isCreatorProfile ? "creator" : "user",
      isFounder: isTreyProfile2,
      stats: {
        posts: dbProfile.post_count ?? 0,
        followers: dbProfile.follower_count ?? 0,
        following: dbProfile.following_count ?? 0,
        prescriptions: void 0,
        episodes: 0,
        subscribers: dbProfile.subscriber_count ?? 0,
        watchHours: "—"
      },
      rewards: isOwnProfile ? authUser?.rewards ?? {
        points: 12480,
        tier: "GOLD"
      } : void 0,
      interests: [],
      creatorStatus: dbProfile.creator_status ?? (isOwnProfile ? authUser?.creatorStatus : void 0),
      accentColor: dbProfile.profile_accent_color,
      gifOfDayUrl: dbProfile.gif_of_day_url ?? null,
      gifOfDayPosterUrl: dbProfile.gif_of_day_poster_url ?? null,
      gifOfDayCaption: dbProfile.gif_of_day_caption ?? null,
      showFwdGifsOnProfile: !!dbProfile.show_fwd_gifs_on_profile,
      profileUserId: dbProfile.id,
      zodiacSunSign: dbProfile.zodiac_public_opt_in === false ? null : dbProfile.zodiac_sun_sign,
      zodiacMoonSign: dbProfile.zodiac_public_opt_in === false ? null : dbProfile.zodiac_moon_sign,
      zodiacRisingSign: dbProfile.zodiac_public_opt_in === false ? null : dbProfile.zodiac_rising_sign,
      zodiacIsCusp: dbProfile.zodiac_public_opt_in !== false && !!dbProfile.zodiac_is_cusp,
      zodiacCuspLabel: dbProfile.zodiac_public_opt_in === false ? null : dbProfile.zodiac_cusp_label,
      zodiacBadgeKey: dbProfile.zodiac_public_opt_in === false ? null : dbProfile.zodiac_badge_key,
      zodiacPublicOptIn: dbProfile.zodiac_public_opt_in !== false,
      birthChartHighlights: dbProfile.zodiac_public_opt_in === false ? null : dbProfile.birth_chart_json
    };
  }, [dbProfile, loading, uid, authUser, isGuest, isOwnProfile, role, isApprovedCreator]);
  if (pathname.endsWith("/channel")) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {});
  }
  const isTreyProfile = isTreyOwnerProfile({
    username: dbProfile?.username,
    public_profile_uid: dbProfile?.public_profile_uid,
    uid
  });
  const variant = isOwnProfile ? isTreyProfile ? "owner" : profileData.isCreator ? "creator" : "user" : "public";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ProfilePageNew, { profile: profileData, variant });
}
export {
  PublicProfileRoute as component
};
