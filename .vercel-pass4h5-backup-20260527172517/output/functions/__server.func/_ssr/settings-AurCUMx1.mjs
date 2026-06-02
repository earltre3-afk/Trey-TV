import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { A as AppShell, V as VerifiedBadge } from "./AppShell-BWcCrjwR.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as useCurrentUser, u as useAuth, c as createBrowserClient } from "./router-BtgGywEC.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { S as Sparkles, W as WandSparkles, h as Mail, m as Smartphone, n as Settings, U as User, o as Palette, B as Bell, p as Shield, q as CreditCard, G as Globe, F as FileText, r as ChevronRight, s as LogOut, t as Crown, i as Lock } from "../_libs/lucide-react.mjs";
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
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
const emptyPreferences = {
  profile_preferences: {},
  feed_preferences: {},
  inbox_preferences: {},
  rewards_preferences: {},
  prescribe_preferences: {},
  app_settings: {}
};
const KEY = "treytv_user_preferences_v1";
function useUserPreferences() {
  const { user: supabaseUser, loading } = useAuth();
  const currentUser = useCurrentUser();
  const [preferences, setPreferences] = reactExports.useState(emptyPreferences);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const storageKey = `${KEY}:${currentUser.uid}`;
  reactExports.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setPreferences(raw ? { ...emptyPreferences, ...JSON.parse(raw) } : emptyPreferences);
    } catch {
      setPreferences(emptyPreferences);
    }
  }, [storageKey]);
  reactExports.useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(preferences));
    } catch {
    }
  }, [preferences, storageKey]);
  const load = reactExports.useCallback(async () => {
    if (loading || !supabaseUser) return;
    setIsLoading(true);
    try {
      const supabase = createBrowserClient();
      await supabase.rpc("ensure_user_preferences", { _user_id: supabaseUser.id });
      const { data, error } = await supabase.from("user_preferences").select("profile_preferences, feed_preferences, inbox_preferences, rewards_preferences, prescribe_preferences, app_settings").eq("user_id", supabaseUser.id).maybeSingle();
      if (error) throw error;
      setPreferences({ ...emptyPreferences, ...data ?? {} });
    } catch (error) {
      console.error("Failed to load UID preferences:", error);
    } finally {
      setIsLoading(false);
    }
  }, [loading, supabaseUser?.id]);
  reactExports.useEffect(() => {
    void load();
  }, [load]);
  const updateSection = reactExports.useCallback(
    async (section, patch) => {
      setPreferences((prev) => ({
        ...prev,
        [section]: { ...prev[section] ?? {}, ...patch }
      }));
      if (!supabaseUser) return;
      try {
        const supabase = createBrowserClient();
        const nextSection = { ...preferences[section] ?? {}, ...patch };
        const { error } = await supabase.from("user_preferences").upsert({
          user_id: supabaseUser.id,
          public_profile_uid: currentUser.uid,
          [section]: nextSection,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }, { onConflict: "user_id" });
        if (error) throw error;
      } catch (error) {
        console.error("Failed to save UID preferences:", error);
      }
    },
    [currentUser.uid, preferences, supabaseUser?.id]
  );
  return { preferences, updateSection, loading: loading || isLoading, reload: load };
}
const sections = [{
  id: "account",
  label: "Account",
  icon: User,
  color: "oklch(0.82 0.16 85)"
}, {
  id: "appearance",
  label: "Appearance",
  icon: Palette,
  color: "oklch(0.7 0.25 340)"
}, {
  id: "notifications",
  label: "Notifications",
  icon: Bell,
  color: "oklch(0.82 0.15 215)"
}, {
  id: "privacy",
  label: "Privacy & Safety",
  icon: Shield,
  color: "oklch(0.65 0.22 300)"
}, {
  id: "billing",
  label: "Billing",
  icon: CreditCard,
  color: "oklch(0.78 0.18 150)"
}, {
  id: "language",
  label: "Language & Region",
  icon: Globe,
  color: "oklch(0.82 0.15 215)"
}, {
  id: "legal",
  label: "Legal & Safety",
  icon: FileText,
  color: "oklch(0.82 0.16 85)"
}];
const LEGAL_LINKS = [{
  to: "/legal",
  label: "Legal Hub",
  desc: "Browse every Trey TV policy in one place."
}, {
  to: "/legal/terms",
  label: "Terms of Service",
  desc: "The agreement between you and Trey TV."
}, {
  to: "/legal/privacy",
  label: "Privacy Policy",
  desc: "What we collect and how it's used."
}, {
  to: "/legal/community-guidelines",
  label: "Community Guidelines",
  desc: "How we keep Trey TV safe."
}, {
  to: "/legal/data-deletion",
  label: "Data Deletion",
  desc: "Request deletion, export, or correction."
}, {
  to: "/legal/dmca",
  label: "Copyright / DMCA",
  desc: "File a copyright complaint."
}, {
  to: "/legal/ai-disclosure",
  label: "AI Disclosure",
  desc: "How Trey-I works and its limits."
}];
function SettingsPage() {
  const currentUser = useCurrentUser();
  const {
    preferences,
    updateSection
  } = useUserPreferences();
  const [active, setActive] = reactExports.useState("account");
  const [theme, setTheme] = reactExports.useState("midnight");
  const [accent, setAccent] = reactExports.useState("gold");
  const [toggles, setToggles] = reactExports.useState([{
    id: "live",
    label: "Live Alerts",
    desc: "Notify me when followed creators go live",
    icon: Sparkles,
    on: true
  }, {
    id: "drops",
    label: "New Episode Drops",
    desc: "Push when new episodes are released",
    icon: WandSparkles,
    on: true
  }, {
    id: "email",
    label: "Weekly Email",
    desc: "Highlights, stats and creator picks",
    icon: Mail,
    on: false
  }, {
    id: "sms",
    label: "SMS for Streams",
    desc: "Text me before tonight's show starts",
    icon: Smartphone,
    on: false
  }]);
  reactExports.useEffect(() => {
    const app = preferences.app_settings;
    if (typeof app.theme === "string") setTheme(app.theme);
    if (typeof app.accent === "string") setAccent(app.accent);
    const notificationPrefs = app.notifications;
    if (notificationPrefs) {
      setToggles((current) => current.map((item) => typeof notificationPrefs[item.id] === "boolean" ? {
        ...item,
        on: notificationPrefs[item.id]
      } : item));
    }
  }, [preferences.app_settings]);
  const persistAppSetting = (patch) => {
    void updateSection("app_settings", patch);
  };
  const flip = (id) => setToggles((t) => {
    const next = t.map((x) => x.id === id ? {
      ...x,
      on: !x.on
    } : x);
    persistAppSetting({
      notifications: Object.fromEntries(next.map((item) => [item.id, item.on]))
    });
    return next;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { wide: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] tracking-[0.3em] text-primary flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "size-3.5" }),
        " SETTINGS"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl md:text-4xl font-bold mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient-gold", children: "Control Center" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Tune Trey TV exactly the way you want it." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "rounded-3xl glass neon-border p-3 h-fit lg:sticky lg:top-6", children: [
        sections.map((s, i) => {
          const isActive = active === s.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActive(s.id), style: {
            animationDelay: `${i * 50}ms`
          }, className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl animate-rise text-left transition-all duration-300 hover:translate-x-1 ${isActive ? "bg-white/10 ring-1 ring-white/15" : "hover:bg-white/5"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-8 rounded-lg grid place-items-center", style: {
              background: `${s.color.replace(")", " / 0.15)")}`
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "size-4", style: {
              color: s.color
            } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-sm flex-1 ${isActive ? "font-semibold" : "text-muted-foreground"}`, children: s.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: `size-4 ${isActive ? "text-primary" : "text-muted-foreground"}` })
          ] }, s.id);
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 pt-3 border-t border-white/5 px-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toast("Logged out (demo)"), className: "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-destructive/10 text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "size-4" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Sign out" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        active === "account" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 animate-fade-in", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative size-20 rounded-full conic-ring shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: currentUser.avatar, className: "size-20 rounded-full object-cover", alt: "" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg font-semibold flex items-center gap-1", children: [
                currentUser.name,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(VerifiedBadge, { kind: "creator" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                "@",
                currentUser.handle,
                " · UID ",
                currentUser.uid
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full border border-primary/40 text-primary bg-primary/10", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-3" }),
                " Creator Tier"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast.success("Avatar uploader opened"), className: "px-4 py-2 rounded-xl text-sm border border-primary text-primary glow-gold hover-lift tilt-press", children: "Change avatar" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { label: "Display name", value: currentUser.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { label: "Username", value: `@${currentUser.handle}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { label: "Bio", value: currentUser.bio.split("\n")[0] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { label: "Location", value: currentUser.location ?? "" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { label: "Website", value: currentUser.link ?? "", last: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: Lock, title: "Two-Factor Authentication", desc: "Extra layer of security on sign-in", action: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast.success("2FA enabled"), className: "px-3 py-1.5 rounded-lg text-xs border border-primary text-primary", children: "Enable" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: Mail, title: "Email", desc: "trey@trey.tv", action: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-xs text-primary", children: "Change" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: Smartphone, title: "Connected devices", desc: "3 active sessions", action: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4 text-muted-foreground" }), last: true })
          ] })
        ] }),
        active === "appearance" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 animate-fade-in", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold mb-3", children: "Theme" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: ["midnight", "aurora", "gold"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
              setTheme(t);
              persistAppSetting({
                theme: t
              });
            }, className: `relative rounded-2xl p-3 ring-1 ${theme === t ? "ring-primary glow-gold" : "ring-white/10"} hover-lift tilt-press text-left`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-16 rounded-xl mb-2 ${t === "midnight" ? "bg-[radial-gradient(ellipse_at_top,oklch(0.2_0.07_290),oklch(0.1_0.02_270))]" : t === "aurora" ? "bg-[linear-gradient(135deg,oklch(0.3_0.18_300),oklch(0.25_0.15_215),oklch(0.2_0.18_340))]" : "bg-[linear-gradient(135deg,oklch(0.7_0.18_60),oklch(0.86_0.17_90))]"}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold capitalize", children: t })
            ] }, t)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold mb-3", children: "Accent" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3", children: [{
              id: "gold",
              c: "oklch(0.82 0.16 85)"
            }, {
              id: "magenta",
              c: "oklch(0.7 0.25 340)"
            }, {
              id: "cyan",
              c: "oklch(0.82 0.15 215)"
            }, {
              id: "purple",
              c: "oklch(0.65 0.22 300)"
            }].map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
              setAccent(a.id);
              persistAppSetting({
                accent: a.id
              });
            }, className: `size-10 rounded-full transition hover:scale-110 ${accent === a.id ? "ring-2 ring-white/80 scale-110" : ""}`, style: {
              background: a.c,
              boxShadow: `0 0 16px ${a.c}`
            }, "aria-label": a.id }, a.id)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: Palette, title: "Reduce motion", desc: "Limit animations across the app", action: /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { on: !!preferences.app_settings.reduceMotion, onClick: () => {
              persistAppSetting({
                reduceMotion: !preferences.app_settings.reduceMotion
              });
              toast("Motion preference saved");
            } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: Sparkles, title: "Liquid glass intensity", desc: "Tune blur and translucency", action: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", value: Number(preferences.app_settings.glassIntensity ?? 75), onChange: (e) => persistAppSetting({
              glassIntensity: Number(e.target.value)
            }), className: "w-32 accent-[oklch(0.82_0.16_85)]" }), last: true })
          ] })
        ] }),
        active === "notifications" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4 animate-fade-in", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { children: toggles.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: t.icon, title: t.label, desc: t.desc, last: i === toggles.length - 1, action: /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { on: t.on, onClick: () => flip(t.id) }) }, t.id)) }) }),
        active === "privacy" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: Shield, title: "Private account", desc: "Only approved fans can see your posts", action: /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { on: !!preferences.profile_preferences.privateAccount, onClick: () => {
            void updateSection("profile_preferences", {
              privateAccount: !preferences.profile_preferences.privateAccount
            });
            toast("Private mode saved");
          } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: Lock, title: "Block list", desc: "0 accounts blocked", action: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: User, title: "Who can DM you", desc: "Followers only", action: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4 text-muted-foreground" }), last: true })
        ] }),
        active === "billing" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: Crown, title: "Trey TV Premium", desc: "Active · renews Dec 4", action: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "px-3 py-1.5 rounded-lg text-xs border border-primary text-primary", children: "Manage" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: CreditCard, title: "Payment method", desc: "•••• 4242", action: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-xs text-primary", children: "Update" }), last: true })
        ] }),
        active === "language" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: Globe, title: "Language", desc: "English (US)", action: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: Globe, title: "Region", desc: "United States", action: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4 text-muted-foreground" }), last: true })
        ] }),
        active === "legal" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4 animate-fade-in", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "size-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Legal & Safety" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 gap-2", children: LEGAL_LINKS.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: l.to, className: "group flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-9 rounded-lg bg-primary/15 text-primary grid place-items-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "size-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: l.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4 text-muted-foreground group-hover:text-foreground transition" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: l.desc })
            ] })
          ] }, l.to)) })
        ] }) })
      ] })
    ] })
  ] }) });
}
function Panel({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl glass neon-border p-4 md:p-5 hover-lift overflow-hidden relative", children });
}
function Row({
  icon: Icon,
  title,
  desc,
  action,
  last
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-3 py-3 ${last ? "" : "border-b border-white/5"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-9 rounded-xl bg-white/5 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-4 text-primary" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: desc })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: action })
  ] });
}
function FieldRow({
  label,
  value,
  last
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-3 py-3 ${last ? "" : "border-b border-white/5"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground w-32 shrink-0", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { defaultValue: value, className: "flex-1 bg-transparent text-sm focus:outline-none border-b border-transparent focus:border-primary/40 transition pb-0.5" })
  ] });
}
function Switch({
  on,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, className: `relative w-11 h-6 rounded-full transition ${on ? "bg-primary glow-gold" : "bg-white/10"}`, "aria-pressed": on, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}` }) });
}
export {
  SettingsPage as component
};
