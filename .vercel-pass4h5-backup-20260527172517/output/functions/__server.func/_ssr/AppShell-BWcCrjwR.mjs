import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, f as useLocation, L as Link } from "../_libs/tanstack__react-router.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import { b as useAuth$1, g as useSupabaseSession, k as currentUser, s as supabase } from "./router-BtgGywEC.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { H as House, C as Compass, a as CalendarDays, S as Sparkles, b as Heart, I as Inbox, ak as ChevronDown, u as Gem, t as Crown, c as ChartColumn, a8 as Bookmark, R as Radio, a5 as Users, n as Settings, al as Award, O as Search, B as Bell, L as LogIn, s as LogOut, am as Menu, an as Upload, ao as Pencil, X, ap as Activity, aq as Dices, r as ChevronRight, l as ShieldCheck, ar as CheckCheck, as as BadgeCheck, Z as Zap, at as UserPlus, au as MessageCircle } from "../_libs/lucide-react.mjs";
function VerifiedBadge({ kind = "user", className = "" }) {
  if (kind === "admin") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: `size-4 text-[oklch(0.7_0.18_305)] drop-shadow-[0_0_6px_oklch(0.7_0.18_305_/_0.8)] ${className}` });
  }
  const color = kind === "creator" ? "text-[oklch(0.82_0.16_85)] drop-shadow-[0_0_6px_oklch(0.82_0.16_85_/_0.8)]" : "text-[oklch(0.78_0.18_150)] drop-shadow-[0_0_6px_oklch(0.78_0.18_150_/_0.8)]";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: `size-4 ${color} ${className}` });
}
const db = supabase;
const KIND_MAP = {
  new_follower: "follow",
  user_followed: "follow",
  post_liked: "like",
  like_on_video: "like",
  post_commented: "comment",
  comment_on_video: "comment",
  reply_to_comment: "comment",
  post_saved: "boost"
};
function toKind(type) {
  return KIND_MAP[type] ?? "trey";
}
function timeAgo(iso) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1e3));
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
function deriveLink(row, kind) {
  const meta = row.metadata;
  if (meta && typeof meta.link === "string") return meta.link;
  if (row.post_id) return `/watch/${row.post_id}`;
  if (kind === "comment") return "/inbox";
  return void 0;
}
function mapRow(row) {
  const kind = toKind(row.type);
  const actor = row.actor;
  const who = actor && actor.username ? {
    name: actor.display_name ?? actor.username,
    avatar: actor.avatar_url ?? "",
    handle: actor.username,
    publicProfileUid: actor.public_profile_uid ?? null
  } : void 0;
  return {
    id: row.id,
    kind,
    who,
    text: row.message ?? "",
    time: timeAgo(row.created_at),
    unread: row.read_at === null,
    to: deriveLink(row, kind)
  };
}
function useNotifications() {
  const [notifications, setNotifications] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let mounted = true;
    let unsubscribe = () => {
    };
    const fetchForUser = async (userId) => {
      if (!mounted) return;
      setLoading(true);
      const { data, error } = await db.from("notifications").select(`
          id, type, message, read_at, created_at, post_id, metadata,
          actor:profiles!notifications_actor_id_fkey(public_profile_uid, display_name, username, avatar_url)
        `).eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
      if (!mounted) return;
      setLoading(false);
      if (!error && data) {
        setNotifications(data.map(mapRow));
      }
    };
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchForUser(session.user.id);
    });
    const { data: authSub } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (!mounted) return;
      if (sess?.user) {
        fetchForUser(sess.user.id);
      } else {
        setNotifications([]);
        setLoading(false);
      }
    });
    unsubscribe = () => authSub.subscription.unsubscribe();
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);
  const markRead = reactExports.useCallback(async (id) => {
    setNotifications(
      (prev) => prev.map((n) => n.id === id ? { ...n, unread: false } : n)
    );
    await db.from("notifications").update({ read_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
  }, []);
  const markAllRead = reactExports.useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    await db.from("notifications").update({ read_at: (/* @__PURE__ */ new Date()).toISOString() }).is("read_at", null);
  }, []);
  const unreadCount = notifications.filter((n) => n.unread).length;
  return { notifications, unreadCount, markRead, markAllRead, loading };
}
const PUBLIC_PROFILE_UID_RE = /^423\d{13}$/;
function isPublicProfileUid(value) {
  return Boolean(value && PUBLIC_PROFILE_UID_RE.test(value.trim()));
}
function ProfilePictureLink({
  publicProfileUid,
  label,
  className = "",
  children
}) {
  const uid = publicProfileUid?.trim();
  if (!uid || !isPublicProfileUid(uid)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className, children });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Link,
    {
      to: "/u/$uid",
      params: { uid },
      className,
      "aria-label": label,
      onClick: (event) => {
        event.stopPropagation();
      },
      children
    }
  );
}
const iconFor = (k) => ({
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  live: Radio,
  trey: Sparkles,
  boost: Zap
})[k];
const tintFor = (k) => ({
  like: "text-[oklch(0.7_0.25_340)] bg-[oklch(0.7_0.25_340_/_0.12)]",
  comment: "text-[oklch(0.82_0.15_215)] bg-[oklch(0.82_0.15_215_/_0.12)]",
  follow: "text-primary bg-primary/15",
  live: "text-[oklch(0.7_0.25_340)] bg-[oklch(0.7_0.25_340_/_0.15)]",
  trey: "text-[oklch(0.65_0.22_300)] bg-[oklch(0.65_0.22_300_/_0.15)]",
  boost: "text-primary bg-primary/15"
})[k];
function NotificationsPopover({ open, onClose }) {
  const ref = reactExports.useRef(null);
  const { notifications: items2, unreadCount, markRead, markAllRead } = useNotifications();
  reactExports.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      className: "absolute right-2 top-[calc(100%+6px)] z-50 w-[min(94vw,380px)] origin-top-right animate-rise",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl glass-strong border border-white/10 shadow-[0_20px_60px_-20px_oklch(0_0_0_/_0.8)] overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,oklch(0.82_0.16_85_/_0.7),oklch(0.7_0.25_340_/_0.6),oklch(0.65_0.22_300_/_0.6),transparent)]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute -top-16 -right-10 size-40 rounded-full bg-primary/15 blur-3xl pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute -bottom-16 -left-10 size-40 rounded-full bg-[oklch(0.7_0.25_340_/_0.15)] blur-3xl pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "relative flex items-center justify-between px-4 pt-3 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-8 grid place-items-center rounded-xl bg-primary/15 text-primary glow-gold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "size-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold leading-tight", children: "Notifications" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
                unreadCount,
                " new updates"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, "aria-label": "Close", className: "size-8 grid place-items-center rounded-full glass hover:bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar", children: ["All", "Mentions", "Likes", "Follows", "Live"].map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `shrink-0 px-2.5 py-1 rounded-full text-[11px] border transition ${i === 0 ? "border-primary/50 bg-primary/15 text-primary" : "border-white/10 text-muted-foreground hover:bg-white/5"}`,
            children: c
          },
          c
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[58vh] overflow-y-auto", children: items2.map((n, idx) => {
          const Icon = iconFor(n.kind);
          const Body = /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              style: { animationDelay: `${idx * 35}ms` },
              className: `group relative flex items-start gap-3 px-3 py-2.5 mx-2 my-1 rounded-2xl animate-rise transition cursor-pointer ${n.unread ? "bg-white/[0.03] hover:bg-white/[0.06]" : "hover:bg-white/[0.04]"}`,
              children: [
                n.unread && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-0 top-1/2 -translate-y-1/2 h-7 w-0.5 rounded-r bg-primary shadow-[0_0_8px_var(--gold)]" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative shrink-0", children: [
                  n.who ? /* @__PURE__ */ jsxRuntimeExports.jsx(ProfilePictureLink, { publicProfileUid: n.who.publicProfileUid, label: `Open @${n.who.handle}'s public profile`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: n.who.avatar, alt: "", className: "size-10 rounded-full object-cover ring-1 ring-white/10" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `size-10 rounded-full grid place-items-center ${tintFor(n.kind)}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-5" }) }),
                  n.who && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute -bottom-0.5 -right-0.5 size-5 rounded-full grid place-items-center ring-2 ring-background ${tintFor(n.kind)}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-3" }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs leading-snug", children: [
                    n.who && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
                      n.who.name,
                      " "
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: n.unread ? "text-foreground" : "text-muted-foreground", children: n.text })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-2 text-[10px] text-muted-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: n.time }),
                    n.kind === "follow" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                      e.preventDefault();
                      toast.success("Following back");
                    }, className: "px-2 py-0.5 rounded-full border border-primary/40 text-primary hover:bg-primary/10", children: "Follow back" }),
                    n.kind === "live" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.5 rounded-full bg-[oklch(0.7_0.25_340_/_0.2)] text-[oklch(0.7_0.25_340)] font-semibold uppercase tracking-wider", children: "Live" })
                  ] })
                ] })
              ]
            }
          );
          return n.to ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: n.to, onClick: () => {
            markRead(n.id);
            onClose();
          }, className: "block", children: Body }, n.id) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { onClick: () => {
            markRead(n.id);
            onClose();
          }, children: Body }, n.id);
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "relative flex items-center justify-between px-3 py-2 border-t border-white/5 bg-white/[0.02]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                markAllRead();
                toast.success("All caught up");
              },
              className: "flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "size-3.5" }),
                " Mark all as read"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/inbox", onClick: onClose, className: "text-[11px] font-semibold text-primary hover:underline", children: "Open Inbox →" })
        ] })
      ] })
    }
  );
}
function CreatorGoldNavButton({ compact = false, className = "" }) {
  const { isApprovedCreator } = useAuth$1();
  if (!isApprovedCreator) return null;
  if (compact) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: "/creator-studio",
        "aria-label": "Creator Studio",
        className: `relative size-10 grid place-items-center rounded-xl bg-gradient-to-br from-[oklch(0.82_0.16_85_/_0.4)] to-[oklch(0.6_0.18_60_/_0.3)] border border-primary/50 text-primary glow-gold tilt-press ${className}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary animate-glow-pulse" })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Link,
    {
      to: "/creator-studio",
      className: `group relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-primary/90 via-primary to-[oklch(0.78_0.18_70)] text-primary-foreground glow-gold tilt-press hover-lift ${className}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_30%_30%,oklch(1_0_0_/_0.4),transparent_60%)] opacity-60 group-hover:opacity-100 transition" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "relative size-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative", children: "Creator Studio" })
      ]
    }
  );
}
const tabs = [
  { id: "watch-now", label: "Watch Now" },
  { id: "for-you", label: "For You" },
  { id: "discover", label: "Discover" },
  { id: "guide", label: "Guide" },
  { id: "prescribe", label: "Prescribe Me" },
  { id: "rewards", label: "Rewards" },
  { id: "games", label: "Games" }
];
function AppHeader({
  activeTab = "for-you",
  onTabChange,
  onMenuClick
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = reactExports.useState(false);
  const { unreadCount } = useNotifications();
  const { isGuest, user } = useAuth$1();
  const profileUid = user?.uid ?? currentUser.uid;
  const profileAvatar = user?.avatar ?? currentUser.avatar;
  const computed = location.pathname === "/" ? "watch-now" : location.pathname.startsWith("/for-you") ? "for-you" : location.pathname.startsWith("/explore") ? "discover" : location.pathname.startsWith("/guide") ? "guide" : location.pathname.startsWith("/prescribe-me") ? "prescribe" : location.pathname.startsWith("/rewards") ? "rewards" : location.pathname.startsWith("/games") ? "games" : activeTab;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-30 w-full glass-strong border-b border-white/5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-between px-2 sm:px-4 pt-3 pb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onMenuClick,
          "aria-label": "Open menu",
          className: "size-10 grid place-items-center rounded-xl glass hover:bg-white/5 transition",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "size-5" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/",
          className: "shrink-0 relative group",
          "aria-label": "Trey TV home",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                "aria-hidden": true,
                className: "absolute inset-0 -m-3 rounded-full blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.55),oklch(0.7_0.25_340_/_0.45),oklch(0.65_0.22_300_/_0.5),oklch(0.82_0.15_215_/_0.45),oklch(0.82_0.16_85_/_0.55))] animate-conic-spin"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                "aria-hidden": true,
                className: "absolute inset-0 -m-1 rounded-full bg-primary/30 blur-xl animate-glow-pulse"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "relative h-20 transition-transform duration-500 group-hover:scale-110 group-active:scale-95 drop-shadow-[0_0_24px_oklch(0.82_0.16_85_/_0.7)]" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorGoldNavButton, { compact: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({ to: "/explore" }), "aria-label": "Search", className: "size-10 grid place-items-center rounded-xl glass hover:bg-white/5 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setNotifOpen((v) => !v), "aria-label": "Notifications", "aria-expanded": notifOpen, className: "relative size-10 grid place-items-center rounded-xl glass hover:bg-white/5 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "size-5" }),
          unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[oklch(0.65_0.22_300)] text-[10px] font-bold grid place-items-center text-white shadow-[0_0_10px_oklch(0.65_0.22_300_/_0.8)]", children: unreadCount > 99 ? "99+" : unreadCount })
        ] }),
        isGuest ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", "aria-label": "Sign in", className: "size-10 grid place-items-center rounded-xl glass hover:bg-white/5 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "size-5" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/u/$uid", params: { uid: profileUid }, className: "relative size-10 rounded-full conic-ring shrink-0", "aria-label": "Profile", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: profileAvatar, alt: "profile", className: "size-full rounded-full object-cover", loading: "lazy" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationsPopover, { open: notifOpen, onClose: () => setNotifOpen(false) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "nav",
      {
        className: "flex items-center gap-1 px-1 sm:px-2 pb-2 overflow-x-auto no-scrollbar",
        onTouchStart: (e) => e.stopPropagation(),
        onTouchMove: (e) => e.stopPropagation(),
        onTouchEnd: (e) => e.stopPropagation(),
        children: tabs.map((t) => {
          const active = computed === t.id;
          const handleClick = () => {
            if (t.id === "watch-now") navigate({ to: "/" });
            if (t.id === "for-you") navigate({ to: "/for-you" });
            if (t.id === "discover") navigate({ to: "/explore" });
            if (t.id === "guide") navigate({ to: "/guide" });
            if (t.id === "prescribe") navigate({ to: "/prescribe-me" });
            if (t.id === "rewards") navigate({ to: "/rewards" });
            if (t.id === "games") navigate({ to: "/games" });
            onTabChange?.(t.id);
          };
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleClick,
              className: `relative px-3 py-2 text-sm whitespace-nowrap transition ${active ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`,
              children: [
                t.label,
                active && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-primary shadow-[0_0_8px_oklch(0.82_0.16_85_/_0.9)]" })
              ]
            },
            t.id
          );
        })
      }
    )
  ] });
}
const items = [
  { icon: House, label: "Home", sub: "The streaming home", to: "/", color: "text-primary", active: true },
  { icon: Sparkles, label: "For You", sub: "Personalized feed", to: "/for-you", color: "text-primary" },
  { icon: Search, label: "Discover", sub: "Explore creators & content", to: "/explore", color: "text-[oklch(0.65_0.22_300)]" },
  { icon: CalendarDays, label: "Guide", sub: "What's on right now", to: "/guide", color: "text-[oklch(0.82_0.15_215)]" },
  { icon: Users, label: "Following", sub: "Creators You Follow", to: "/following", color: "text-[oklch(0.65_0.22_300)]" },
  { icon: Heart, label: "Prescribe Me", sub: "Personalized picks", to: "/prescribe-me", color: "text-[oklch(0.7_0.25_340)]" },
  { icon: Bookmark, label: "Collections", sub: "Your Saved Content", to: "/collections", color: "text-[oklch(0.65_0.22_300)]" },
  { icon: Activity, label: "Activity", sub: "Your interactions", to: "/activity", color: "text-[oklch(0.82_0.15_215)]" },
  { icon: Gem, label: "Rewards", sub: "Points · Gifts · Perks", to: "/rewards", color: "text-primary" },
  { icon: Dices, label: "Games", sub: "Lounge · Cards · Coming Soon", to: "/games", color: "text-[#00B7FF]" },
  { icon: Radio, label: "Go Live", sub: "Broadcast to the World", to: "/go-live", color: "text-[oklch(0.7_0.25_340)]" },
  { icon: Award, label: "Apply", sub: "Become a creator", to: "/apply", color: "text-primary" }
];
const creatorItems = [
  { icon: Crown, label: "Creator Hub", sub: "Manage Your Brand", to: "/creator-hub", color: "text-primary" },
  { icon: Upload, label: "My Submissions", sub: "Approval status & feedback", to: "/creator-studio/submissions", color: "text-[oklch(0.82_0.16_85)]" },
  { icon: ChartColumn, label: "Analytics", sub: "Track Your Growth", to: "/analytics", color: "text-[oklch(0.65_0.22_300)]" },
  { icon: Pencil, label: "Edit Profile", sub: "Polish your presence", to: "/edit-profile", color: "text-[oklch(0.7_0.25_340)]" },
  { icon: Settings, label: "Settings", sub: "Account & Preferences", to: "/settings", color: "text-[oklch(0.82_0.15_215)]" }
];
function SideMenu({ open, onClose }) {
  const { user, isGuest, isCreator, isAdmin, signOut } = useAuth$1();
  const { signOutSupabase } = useSupabaseSession();
  const nav = useNavigate();
  const profile = user ?? currentUser;
  const handleSignOut = async () => {
    signOut();
    await signOutSupabase();
    onClose();
    nav({ to: "/login" });
  };
  const visibleCreatorItems = isCreator ? creatorItems : creatorItems.filter((i) => i.label === "Edit Profile" || i.label === "Settings");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        onClick: onClose,
        className: `fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`,
        style: { position: "fixed" }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "aside",
      {
        className: `fixed left-0 top-0 bottom-0 z-50 w-[88vw] max-w-[380px] liquid-glass border-r border-white/10 transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`,
        style: { position: "fixed", borderTopRightRadius: 28, borderBottomRightRadius: 28 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "h-full flex flex-col overflow-y-auto",
            style: {
              paddingTop: "env(safe-area-inset-top)",
              // Leave room for the floating bottom dock (lg:hidden) so the last
              // cards never sit behind it on mobile.
              paddingBottom: "calc(env(safe-area-inset-bottom) + 7rem)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between p-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-12" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, "aria-label": "Close", className: "size-9 grid place-items-center rounded-full glass", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-5" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 space-y-1", children: items.map((i, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Link,
                {
                  to: i.to,
                  onClick: onClose,
                  style: { animationDelay: `${idx * 50}ms` },
                  className: `group flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 hover:translate-x-1 ${open ? "animate-rise" : ""} ${i.active ? "bg-primary/10 ring-1 ring-primary/40 glow-gold" : "hover:bg-white/5"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `size-10 rounded-xl grid place-items-center bg-white/5 transition-transform group-hover:scale-110 ${i.active ? "shadow-[0_0_18px_oklch(0.82_0.16_85_/_0.5)]" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(i.icon, { className: `size-5 ${i.color}` }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-sm font-semibold ${i.active ? "text-primary" : "text-foreground"}`, children: i.label }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: i.sub })
                    ] }),
                    i.active ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2 rounded-full bg-primary shadow-[0_0_8px_var(--gold)] animate-glow-pulse" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4 text-muted-foreground transition-transform group-hover:translate-x-1" })
                  ]
                },
                i.label
              )) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-4 mx-5 h-px bg-white/10" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 space-y-1", children: [
                visibleCreatorItems.map((i, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Link,
                  {
                    to: i.to,
                    onClick: onClose,
                    style: { animationDelay: `${(idx + items.length) * 50}ms` },
                    className: `group flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/5 hover:translate-x-1 transition-all duration-300 ${open ? "animate-rise" : ""}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-xl grid place-items-center bg-white/5 transition-transform group-hover:scale-110", children: /* @__PURE__ */ jsxRuntimeExports.jsx(i.icon, { className: `size-5 ${i.color}` }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: i.label }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: i.sub })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4 text-muted-foreground transition-transform group-hover:translate-x-1" })
                    ]
                  },
                  i.label
                )),
                isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin", onClick: onClose, className: "group flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/5 transition", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-xl grid place-items-center bg-[oklch(0.7_0.25_340_/_0.15)] text-[oklch(0.7_0.25_340)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-5" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Admin Console" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Moderation & site ops" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4 text-muted-foreground" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-3 mt-4 p-4 rounded-2xl border border-[oklch(0.65_0.22_300_/_0.4)] bg-[linear-gradient(135deg,oklch(0.25_0.1_300_/_0.6),oklch(0.18_0.05_270_/_0.6))] glow-purple flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Gem, { className: "size-7 text-[oklch(0.7_0.25_340)]" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: "Trey TV Premium" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Unlock exclusive tools, insights & features." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/premium", onClick: onClose, className: "px-3 py-1.5 rounded-lg text-xs font-semibold border border-[oklch(0.7_0.25_340)] text-[oklch(0.7_0.25_340)] hover:bg-[oklch(0.7_0.25_340_/_0.1)]", children: "Upgrade" })
              ] }),
              isGuest ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-3 my-3 p-4 rounded-2xl liquid-glass neon-border space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: "Guest mode" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Sign up to react, save, follow and earn rewards." }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/signup", onClick: onClose, className: "flex-1 text-center px-3 py-2 rounded-lg text-xs font-bold bg-primary text-primary-foreground glow-gold", children: "Sign up" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/login", onClick: onClose, className: "flex-1 text-center px-3 py-2 rounded-lg text-xs font-bold liquid-glass border border-white/15 inline-flex items-center justify-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "size-3" }),
                    " Log in"
                  ] })
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Link,
                {
                  to: "/u/$uid",
                  params: { uid: profile.uid },
                  onClick: onClose,
                  className: "mx-3 my-3 p-3 rounded-2xl liquid-glass neon-border flex items-center gap-3 hover:bg-white/5 liquid-hover",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative size-12 rounded-full conic-ring shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: profile.avatar, alt: "", className: "size-12 rounded-full object-cover" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: profile.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                        "@",
                        profile.handle
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/40", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(VerifiedBadge, { kind: "creator", className: "!size-3" }),
                        " ",
                        isAdmin ? "Admin" : isCreator ? "Verified Creator" : "Member"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void handleSignOut();
                    }, className: "size-8 grid place-items-center rounded-lg hover:bg-white/5 text-muted-foreground", title: "Sign out", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "size-4" }) })
                  ]
                }
              )
            ]
          }
        )
      }
    )
  ] });
}
const guestLinks = [
  { to: "/", icon: House, label: "Home" },
  { to: "/explore", icon: Compass, label: "Discover" },
  { to: "/guide", icon: CalendarDays, label: "Guide" },
  { to: "/games", label: "Games" }
];
const signedInLinks = [
  { to: "/", icon: House, label: "Home" },
  { to: "/for-you", icon: Sparkles, label: "For You" },
  { to: "/explore", icon: Compass, label: "Discover" },
  { to: "/guide", icon: CalendarDays, label: "Guide" },
  { to: "/prescribe-me", icon: Heart, label: "Prescribe" },
  { to: "/games", label: "Games" },
  { to: "/inbox", icon: Inbox, label: "Inbox" }
];
const moreLinks = [
  { to: "/rewards", icon: Gem, label: "Rewards" },
  { to: "/creator-hub", icon: Crown, label: "Creator Hub" },
  { to: "/analytics", icon: ChartColumn, label: "Analytics" },
  { to: "/collections", icon: Bookmark, label: "Saved" },
  { to: "/go-live", icon: Radio, label: "Go Live" },
  { to: "/following", icon: Users, label: "Following" },
  { to: "/settings", icon: Settings, label: "Settings" },
  { to: "/apply", icon: Award, label: "Apply" }
];
function DesktopTopNav() {
  const { isGuest, user, signOut } = useAuth$1();
  const { signOutSupabase } = useSupabaseSession();
  const { pathname } = useLocation();
  const nav = useNavigate();
  const handleSignOut = async () => {
    signOut();
    await signOutSupabase();
    nav({ to: "/login" });
  };
  const [notifOpen, setNotifOpen] = reactExports.useState(false);
  const [moreOpen, setMoreOpen] = reactExports.useState(false);
  const { unreadCount } = useNotifications();
  const isActive = (p) => p === "/" ? pathname === "/" : pathname.startsWith(p);
  const links = isGuest ? guestLinks : signedInLinks;
  const profileUid = user?.uid ?? currentUser.uid;
  const profileAvatar = user?.avatar ?? currentUser.avatar;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "hidden lg:block sticky top-0 z-40 w-full glass-strong border-b border-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto max-w-[1400px] 2xl:max-w-[1600px] px-6 xl:px-10 h-16 flex items-center gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "relative shrink-0 group", "aria-label": "Trey TV home", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          "aria-hidden": true,
          className: "absolute inset-0 -m-2 rounded-full blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-500 bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.55),oklch(0.7_0.25_340_/_0.45),oklch(0.65_0.22_300_/_0.5),oklch(0.82_0.15_215_/_0.45),oklch(0.82_0.16_85_/_0.55))] animate-conic-spin"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "relative h-12 transition-transform duration-300 group-hover:scale-105" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex items-center gap-1 flex-1 min-w-0", children: [
      links.map((l) => {
        const active = isActive(l.to);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: l.to,
            className: `relative inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition ${active ? "text-foreground font-semibold bg-white/5 ring-1 ring-white/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`,
            children: [
              l.icon && (() => {
                const Icon = l.icon;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-4" });
              })(),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: l.label }),
              l.label === "Inbox" && !isGuest ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-0.5 size-4 grid place-items-center rounded-full bg-[oklch(0.65_0.22_300)] text-[10px] font-bold text-white", children: "8" }) : null,
              active && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-primary shadow-[0_0_8px_oklch(0.82_0.16_85_/_0.9)]" })
            ]
          },
          l.to
        );
      }),
      !isGuest && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setMoreOpen((v) => !v),
            className: `inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition ${moreOpen ? "bg-white/5 text-foreground" : ""}`,
            "aria-haspopup": "menu",
            "aria-expanded": moreOpen,
            children: [
              "More ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: `size-3.5 transition ${moreOpen ? "rotate-180" : ""}` })
            ]
          }
        ),
        moreOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-40", onClick: () => setMoreOpen(false) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-0 top-full mt-2 w-64 rounded-2xl glass-strong border border-white/10 p-2 shadow-[0_30px_80px_-20px_oklch(0_0_0_/_0.8)] z-50 animate-rise", children: moreLinks.map((l) => {
            const Icon = l.icon ?? Sparkles;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: l.to,
                onClick: () => setMoreOpen(false),
                className: "flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-4" }),
                  l.label
                ]
              },
              l.to
            );
          }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
      !isGuest && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorGoldNavButton, { compact: true }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => nav({ to: "/explore" }),
          "aria-label": "Search",
          className: "size-10 grid place-items-center rounded-xl glass hover:bg-white/5 transition",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-5" })
        }
      ),
      !isGuest && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setNotifOpen((v) => !v),
          "aria-label": "Notifications",
          className: "relative size-10 grid place-items-center rounded-xl glass hover:bg-white/5 transition",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "size-5" }),
            unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[oklch(0.65_0.22_300)] text-[10px] font-bold grid place-items-center text-white", children: unreadCount > 99 ? "99+" : unreadCount })
          ]
        }
      ),
      isGuest ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/login",
            className: "px-3 py-2 rounded-xl text-sm font-semibold liquid-glass border border-white/15 hover:bg-white/5 transition",
            children: "Log in"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/signup",
            className: "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold hover-scale",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "size-4" }),
              " Sign up"
            ]
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/u/$uid",
            params: { uid: profileUid },
            className: "relative size-10 rounded-full conic-ring shrink-0",
            "aria-label": "Profile",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: profileAvatar, alt: "", className: "size-full rounded-full object-cover", loading: "lazy" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => void handleSignOut(),
            "aria-label": "Sign out",
            title: "Sign out",
            className: "size-9 grid place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "size-4" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationsPopover, { open: notifOpen, onClose: () => setNotifOpen(false) })
  ] }) });
}
function AppShell({
  children,
  activeTab,
  onTabChange,
  wide = false
}) {
  const [menuOpen, setMenuOpen] = reactExports.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const touchStart = reactExports.useRef(null);
  const swipeRoutes = ["/", "/for-you", "/explore", "/guide", "/prescribe-me", "/rewards", "/games"];
  const currentSwipeIndex = swipeRoutes.findIndex((route) => route === "/" ? location.pathname === "/" : location.pathname.startsWith(route));
  const onTouchEnd = (event) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || currentSwipeIndex < 0) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
    const nextIndex = dx < 0 ? currentSwipeIndex + 1 : currentSwipeIndex - 1;
    const nextRoute = swipeRoutes[nextIndex];
    if (nextRoute) navigate({ to: nextRoute });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "app-shell trey-tv-shell mobile-shell relative min-h-screen min-h-[100dvh] w-full overflow-x-hidden bg-[#05070D]",
      onTouchStart: (event) => {
        const touch = event.touches[0];
        if (touch) touchStart.current = { x: touch.clientX, y: touch.clientY };
      },
      onTouchEnd,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopTopNav, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `relative mx-auto w-full max-w-none ${wide ? "lg:max-w-[1400px] 2xl:max-w-[1600px]" : "lg:max-w-5xl xl:max-w-6xl 2xl:max-w-[1400px]"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AppHeader, { activeTab, onTabChange, onMenuClick: () => setMenuOpen(true) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "main",
                {
                  className: "relative z-10 px-0 sm:px-3 lg:px-8 xl:px-10 2xl:px-12 pt-1 sm:pt-3 lg:pt-8 xl:pt-10 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:!pb-16",
                  style: { overflowAnchor: "none" },
                  children
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SideMenu, { open: menuOpen, onClose: () => setMenuOpen(false) }) })
      ]
    }
  );
}
export {
  AppShell as A,
  ProfilePictureLink as P,
  VerifiedBadge as V,
  isPublicProfileUid as i,
  useNotifications as u
};
