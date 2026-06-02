import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, b as useRouterState, O as Outlet, H as HeadContent, S as Scripts, d as createFileRoute, l as lazyRouteComponent, e as useNavigate, f as useLocation } from "../_libs/tanstack__react-router.mjs";
import { x as notFound } from "../_libs/tanstack__router-core.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { T as Toaster$1, t as toast } from "../_libs/sonner.mjs";
import { p as postStudio, m as chris, t as treyi, o as lena, z as zay, q as postConcert, r as postNight, a as createServerFn, u as createSsrRpc } from "./index.mjs";
import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
import { r as reactDomExports } from "../_libs/react-dom.mjs";
import { H as House, C as Compass, a as CalendarDays, L as LogIn, S as Sparkles, I as Inbox, M as Move, X, W as WandSparkles, b as Heart, c as ChartColumn, d as Image, e as Mic, f as Send, R as Radio, V as Video, F as FileText, g as CalendarClock, P as Plus } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
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
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const portraitFallback = "/assets/pixel-profile-portrait-CJXu_2Nd.jpg";
const creators = [
  { id: "chris", name: "Chris H.", handle: "chrishorizon", avatar: chris, ring: "magenta", live: true, verified: "creator" },
  { id: "treyi", name: "Trey-I", handle: "treyipicks", avatar: treyi, ring: "cyan", verified: "creator" },
  { id: "lena", name: "Lena", handle: "lena", avatar: lena, ring: "magenta", verified: "creator" },
  { id: "zay", name: "Zay Beats", handle: "zaybeats", avatar: zay, ring: "purple", verified: "creator" },
  { id: "maya", name: "Maya", handle: "maya", avatar: lena, ring: "cyan", verified: "user" }
];
const posts = [
  {
    id: "1",
    creator: creators[0],
    timeAgo: "2h",
    text: "Behind the scenes of my new video shoot 🎬\nThis one's going to be crazy. Stay tuned!",
    media: postStudio,
    duration: "1:45",
    likes: 1200,
    comments: 86,
    reshares: 34,
    saves: 215
  },
  {
    id: "2",
    creator: creators[1],
    timeAgo: "4h",
    text: "High energy track for your workout 🎵",
    media: postConcert,
    duration: "3:12",
    likes: 845,
    comments: 52,
    reshares: 21,
    saves: 110
  },
  {
    id: "3",
    creator: creators[2],
    timeAgo: "6h",
    text: "Late night thoughts in the city. Some moods can't be explained.",
    media: postNight,
    duration: "0:48",
    likes: 2100,
    comments: 142,
    reshares: 67,
    saves: 320
  }
];
const prescribed = [
  { id: "p1", kind: "VIDEO", title: "Level Up Your Mindset", creator: "Chris Horizon", media: postStudio, duration: "12:45", mood: "Motivated", moodColor: "gold", vibes: ["all", "motivated", "focused", "hype"] },
  { id: "p2", kind: "MUSIC", title: "Late Night Drive", creator: "Zay Beats", media: postNight, duration: "03:21", mood: "Chill", moodColor: "cyan", vibes: ["all", "chill", "reflective", "happy"] },
  { id: "p3", kind: "LIVE", title: "Creator Talk Live", creator: "Lena", media: postConcert, viewers: "2.3K", mood: "Inspired", moodColor: "purple", vibes: ["all", "inspired", "motivated"] },
  { id: "p4", kind: "VIDEO", title: "Morning Grind Ritual", creator: "Chris Horizon", media: postStudio, duration: "08:30", mood: "Motivated", moodColor: "gold", vibes: ["motivated", "hype", "focused"] },
  { id: "p5", kind: "MUSIC", title: "Focus Flow Mix", creator: "Zay Beats", media: postNight, duration: "45:00", mood: "Focused", moodColor: "cyan", vibes: ["focused", "chill"] },
  { id: "p6", kind: "LIVE", title: "Hype Hour with Zay", creator: "Zay Beats", media: postConcert, viewers: "8.7K", mood: "Hype", moodColor: "magenta", vibes: ["hype", "motivated", "happy"] },
  { id: "p7", kind: "VIDEO", title: "Night Reflections", creator: "Lena", media: postNight, duration: "15:22", mood: "Reflective", moodColor: "cyan", vibes: ["reflective", "chill"] },
  { id: "p8", kind: "VIDEO", title: "Laugh Track: Season 2", creator: "Lena", media: postConcert, duration: "22:00", mood: "Happy", moodColor: "magenta", vibes: ["happy", "hype"] },
  { id: "p9", kind: "VIDEO", title: "Creative Block Breaker", creator: "Trey-I", media: postStudio, duration: "10:00", mood: "Inspired", moodColor: "purple", vibes: ["inspired", "focused", "motivated"] }
];
const currentUser = {
  name: "Trey",
  handle: "trey",
  uid: "4234118205271678",
  avatar: portraitFallback,
  banner: "/profile-banner",
  bio: "I create. I inspire. I elevate.\nYour favorite creator's favorite creator.",
  location: "Los Angeles, CA",
  link: "trey.tv",
  verified: "creator",
  stats: { posts: 248, followers: "128K", following: 342, prescriptions: "1.2K" }
};
function createSupabaseClient() {
  const SUPABASE_URL = "https://wcdwlqnfcsuaacbvdmgx.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_UnUWy7-FW9UqH_y0l0wEDQ_B7yw8W64";
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : void 0,
      persistSession: true,
      autoRefreshToken: true
    }
  });
}
let _supabase;
const supabase = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  }
});
const TREY_OWNER_EMAIL = "californiatrey@gmail.com";
const TREY_OWNER_HANDLE = "trey";
const TREY_OWNER_UID = "4234118205271678";
const normalize = (value) => value?.trim().toLowerCase() ?? "";
function isTreyOwnerEmail(email) {
  return normalize(email) === TREY_OWNER_EMAIL;
}
function isTreyOwnerHandle(handle) {
  return normalize(handle).replace(/^@/, "") === TREY_OWNER_HANDLE;
}
function isTreyOwnerUid(uid2) {
  return normalize(uid2) === TREY_OWNER_UID;
}
function isTreyOwnerProfile(profile) {
  return isTreyOwnerHandle(profile.username ?? profile.handle) || isTreyOwnerUid(profile.public_profile_uid ?? profile.uid) || isTreyOwnerEmail(profile.email);
}
const C$7 = reactExports.createContext(null);
function SupabaseSessionProvider({ children }) {
  const [session, setSession] = reactExports.useState(null);
  const [adminRole, setAdminRole] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        setTimeout(() => loadAdmin(s.user.id, s.user.email), 0);
      } else {
        setAdminRole(null);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) loadAdmin(data.session.user.id, data.session.user.email);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  async function loadAdmin(uid2, email) {
    const { data } = await supabase.from("admin_users").select("role").eq("user_id", uid2).maybeSingle();
    if (data?.role === "owner") {
      setAdminRole(isTreyOwnerEmail(email) ? "owner" : null);
      return;
    }
    if (data?.role) {
      setAdminRole(data.role);
      return;
    }
    setAdminRole(isTreyOwnerEmail(email) ? "owner" : null);
  }
  const value = {
    session,
    user: session?.user ?? null,
    adminRole,
    isRealAdmin: !!adminRole,
    isOwner: adminRole === "owner",
    loading,
    signOutSupabase: async () => {
      await supabase.auth.signOut();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(C$7.Provider, { value, children });
}
function useSupabaseSession() {
  const ctx = reactExports.useContext(C$7);
  if (!ctx) throw new Error("useSupabaseSession requires SupabaseSessionProvider");
  return ctx;
}
const KEY$9 = "treytv_user_traces_v1";
const LIMIT = 500;
function getTraceUid(uid2) {
  return uid2?.trim() || "guest";
}
function recordUserTrace(trace) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(KEY$9);
    const existing = raw ? JSON.parse(raw) : [];
    const next = {
      id: crypto.randomUUID(),
      at: trace.at ?? (/* @__PURE__ */ new Date()).toISOString(),
      ...trace,
      userUid: getTraceUid(trace.userUid)
    };
    window.localStorage.setItem(KEY$9, JSON.stringify([next, ...existing].slice(0, LIMIT)));
  } catch {
  }
}
const createBrowserClient = () => {
  return supabase;
};
const Ctx = reactExports.createContext(null);
const KEY$8 = "treytv_session_v1";
const buildUser = (role) => ({
  ...currentUser,
  banner: "",
  accent: "#FFC857",
  profileVisibility: "public",
  showLocation: true,
  showBirthday: false,
  role,
  creatorStatus: role === "creator" || role === "admin" ? "approved" : "not_applied",
  rewards: { points: 12480, tier: "GOLD" }
});
const mapProfileToSessionUser = (profile, fallbackRole = "user") => {
  const publicUid = profile?.public_profile_uid || profile?.id || "";
  const handle = profile?.username || (publicUid ? `user_${String(publicUid).slice(-6)}` : "member");
  const isCreator = Boolean(profile?.verified_creator || profile?.verification_type === "creator" || profile?.creator_status === "approved");
  return {
    ...currentUser,
    name: profile?.display_name || profile?.username || "Trey TV Member",
    handle,
    uid: publicUid,
    avatar: profile?.avatar_url || "",
    banner: profile?.banner_url || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    link: profile?.link_url || "",
    accent: profile?.profile_accent_color || "#FFC857",
    verified: isCreator ? "creator" : profile?.is_verified ? "user" : void 0,
    role: profile?.role || fallbackRole,
    creatorStatus: profile?.creator_status ?? (fallbackRole === "creator" || fallbackRole === "admin" ? "approved" : "not_applied"),
    tagline: profile?.tagline ?? "",
    pronouns: profile?.pronouns ?? "",
    birthday: profile?.birthday ?? "",
    favoriteGenres: profile?.favorite_genres ?? "",
    favoriteCreators: profile?.favorite_creators ?? "",
    socialInstagram: profile?.social_instagram ?? "",
    socialTikTok: profile?.social_tiktok ?? "",
    socialYouTube: profile?.social_youtube ?? "",
    profileVisibility: profile?.profile_visibility ?? "public",
    showLocation: profile?.show_location ?? true,
    showBirthday: profile?.show_birthday ?? false,
    gifOfDayId: profile?.gif_of_day_id ?? null,
    gifOfDayUrl: profile?.gif_of_day_url ?? null,
    gifOfDayPosterUrl: profile?.gif_of_day_poster_url ?? null,
    gifOfDayProvider: profile?.gif_of_day_provider ?? null,
    gifOfDayCaption: profile?.gif_of_day_caption ?? null,
    gifOfDaySetAt: profile?.gif_of_day_set_at ?? null,
    showFwdGifsOnProfile: !!profile?.show_fwd_gifs_on_profile,
    onboarding_completed: !!profile?.onboarding_completed,
    rewards: { points: 0, tier: "WHITE" }
  };
};
function AuthProvider({ children }) {
  const { isRealAdmin, isOwner, user: supaUser } = useSupabaseSession();
  const [user, setUser] = reactExports.useState(null);
  const [role, setRoleState] = reactExports.useState("guest");
  reactExports.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY$8);
      if (raw) {
        const parsed = JSON.parse(raw);
        setRoleState(parsed.role);
        setUser(parsed.user);
      }
    } catch {
    }
  }, []);
  reactExports.useEffect(() => {
    if (!supaUser) return;
    let cancelled = false;
    const hydrateProfile = async () => {
      const fallbackRole = isOwner ? "admin" : isRealAdmin ? "creator" : "user";
      try {
        const supabase2 = createBrowserClient();
        const { data, error } = await supabase2.from("profiles").select("id, public_profile_uid, display_name, username, avatar_url, banner_url, bio, location, link_url, role, creator_status, verification_type, is_verified, verified_creator, profile_accent_color, tagline, pronouns, birthday, favorite_genres, favorite_creators, social_instagram, social_tiktok, social_youtube, profile_visibility, show_location, show_birthday, gif_of_day_id, gif_of_day_url, gif_of_day_poster_url, gif_of_day_provider, gif_of_day_caption, gif_of_day_set_at, show_fwd_gifs_on_profile, onboarding_completed").eq("id", supaUser.id).maybeSingle();
        if (cancelled) return;
        if (error || !data) {
          const u = buildUser(fallbackRole);
          setUser(u);
          setRoleState(fallbackRole);
          return;
        }
        const mapped = mapProfileToSessionUser(data, fallbackRole);
        const effectiveRole = isOwner ? "admin" : isRealAdmin ? "creator" : mapped.role;
        setUser({ ...mapped, role: effectiveRole });
        setRoleState(effectiveRole);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to hydrate UID profile:", error);
          const u = buildUser(fallbackRole);
          setUser(u);
          setRoleState(fallbackRole);
        }
      }
    };
    hydrateProfile();
    return () => {
      cancelled = true;
    };
  }, [supaUser?.id, isRealAdmin, isOwner]);
  reactExports.useEffect(() => {
    try {
      localStorage.setItem(KEY$8, JSON.stringify({ role, user }));
    } catch {
    }
  }, [role, user]);
  const signIn = (r = "creator") => {
    const u = buildUser(r);
    setUser(u);
    setRoleState(r);
    recordUserTrace({ userUid: u.uid, action: "auth.sign_in", targetType: "session", details: { role: r } });
  };
  const signOut = () => {
    recordUserTrace({ userUid: user?.uid ?? "", action: "auth.sign_out", targetType: "session", details: { role } });
    try {
      localStorage.removeItem(KEY$8);
      sessionStorage.removeItem("treytv_post_auth_redirect");
      sessionStorage.removeItem("treytv_voice_profile");
    } catch {
    }
    setUser(null);
    setRoleState("guest");
  };
  const setRole = (r) => {
    setRoleState(r);
    if (r === "guest") setUser(null);
    else setUser((prev) => prev ? { ...prev, role: r } : buildUser(r));
  };
  const updateUser = (patch) => {
    setUser((prev) => prev ? { ...prev, ...patch } : prev);
    if (supaUser) {
      void (async () => {
        try {
          const supabase2 = createBrowserClient();
          const profilePatch = {};
          if (patch.name !== void 0) profilePatch.display_name = patch.name;
          if (patch.handle !== void 0) profilePatch.username = patch.handle;
          if (patch.avatar !== void 0) profilePatch.avatar_url = patch.avatar;
          if (patch.banner !== void 0) profilePatch.banner_url = patch.banner;
          if (patch.bio !== void 0) profilePatch.bio = patch.bio;
          if (patch.location !== void 0) profilePatch.location = patch.location;
          if (patch.link !== void 0) profilePatch.link_url = patch.link;
          if (patch.accent !== void 0) profilePatch.profile_accent_color = patch.accent;
          if (patch.tagline !== void 0) profilePatch.tagline = patch.tagline;
          if (patch.pronouns !== void 0) profilePatch.pronouns = patch.pronouns;
          if (patch.birthday !== void 0) profilePatch.birthday = patch.birthday;
          if (patch.favoriteGenres !== void 0) profilePatch.favorite_genres = patch.favoriteGenres;
          if (patch.favoriteCreators !== void 0) profilePatch.favorite_creators = patch.favoriteCreators;
          if (patch.socialInstagram !== void 0) profilePatch.social_instagram = patch.socialInstagram;
          if (patch.socialTikTok !== void 0) profilePatch.social_tiktok = patch.socialTikTok;
          if (patch.socialYouTube !== void 0) profilePatch.social_youtube = patch.socialYouTube;
          if (patch.profileVisibility !== void 0) profilePatch.profile_visibility = patch.profileVisibility;
          if (patch.showLocation !== void 0) profilePatch.show_location = patch.showLocation;
          if (patch.showBirthday !== void 0) profilePatch.show_birthday = patch.showBirthday;
          if (patch.gifOfDayId !== void 0) profilePatch.gif_of_day_id = patch.gifOfDayId;
          if (patch.gifOfDayUrl !== void 0) profilePatch.gif_of_day_url = patch.gifOfDayUrl;
          if (patch.gifOfDayPosterUrl !== void 0) profilePatch.gif_of_day_poster_url = patch.gifOfDayPosterUrl;
          if (patch.gifOfDayProvider !== void 0) profilePatch.gif_of_day_provider = patch.gifOfDayProvider;
          if (patch.gifOfDayCaption !== void 0) profilePatch.gif_of_day_caption = patch.gifOfDayCaption;
          if (patch.gifOfDaySetAt !== void 0) profilePatch.gif_of_day_set_at = patch.gifOfDaySetAt;
          if (patch.showFwdGifsOnProfile !== void 0) profilePatch.show_fwd_gifs_on_profile = patch.showFwdGifsOnProfile;
          if (Object.keys(profilePatch).length === 0) return;
          const { error } = await supabase2.from("profiles").update({ ...profilePatch, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", supaUser.id);
          if (error) throw error;
        } catch (error) {
          console.error("Failed to persist UID profile settings:", error);
        }
      })();
    }
  };
  const effectiveIsAdmin = role === "admin" || isRealAdmin;
  const effectiveIsCreator = effectiveIsAdmin || role === "creator";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Ctx.Provider, { value: {
    role,
    user,
    isGuest: role === "guest" && !supaUser,
    isCreator: effectiveIsCreator,
    isAdmin: effectiveIsAdmin,
    creatorStatus: user?.creatorStatus ?? (effectiveIsCreator ? "approved" : "not_applied"),
    isApprovedCreator: (user?.creatorStatus ?? (effectiveIsCreator ? "approved" : "not_applied")) === "approved" && effectiveIsCreator,
    setCreatorStatus: (s) => setUser((prev) => prev ? { ...prev, creatorStatus: s } : prev),
    signIn,
    signOut,
    setRole,
    updateUser
  }, children });
}
function useAuth$1() {
  const ctx = reactExports.useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
const VALID_TASKS = ["widget_chat", "caption", "title", "description", "hashtags", "hook", "promo_caption", "bio", "prescribe_reasoning", "mood_suggestions", "admin_summary", "moderate_chat"];
const validateVertexInput = (input) => ({
  task: VALID_TASKS.includes(input?.task) ? input.task : "widget_chat",
  prompt: typeof input?.prompt === "string" ? input.prompt.slice(0, 2e3) : "",
  context: typeof input?.context === "string" ? input.context.slice(0, 1e3) : void 0
});
const treyIGenerate = createServerFn({
  method: "POST"
}).inputValidator(validateVertexInput).handler(createSsrRpc("dc9fdbe4622900b26d16a070da5d890bba29d2a01a406bb052087c871e4eaa97"));
createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  title: String(input.title || "Untitled").slice(0, 100),
  artist: String(input.artist || "Unknown").slice(0, 100),
  genre: String(input.genre || "Other").slice(0, 50),
  notes: String(input.notes || "").slice(0, 500)
})).handler(createSsrRpc("e6faa3368ecd54bb4167f72663dc2bfc157d118957498a35784db1e49a31c399"));
createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  title: String(input.title || "Untitled").slice(0, 100),
  artist: String(input.artist || "Unknown").slice(0, 100),
  genre: String(input.genre || "Other").slice(0, 50),
  vibe: String(input.vibe || "").slice(0, 100),
  bodyNotes: String(input.bodyNotes || "").slice(0, 2e3)
})).handler(createSsrRpc("148e48d6c0a10c56b17563b0cc6cb1af5cb3dd147af07e390d5c64a303ecb22c"));
const seed$2 = [
  { id: "1", from: "ai", text: "Hey 👋 I'm Trey-I — your creative co-pilot. Drag me anywhere. Ask me to draft a caption, prescribe a vibe, or remix your last drop.", time: "now" }
];
const quick = [
  { icon: WandSparkles, label: "Caption my last post" },
  { icon: Heart, label: "Suggest a mood drop" },
  { icon: ChartColumn, label: "What's trending tonight?" },
  { icon: Image, label: "Generate a thumbnail" }
];
const POS_KEY = "treyi_pos_v1";
const SIZE = 56;
const PAD = 12;
const INITIAL_POS = { x: 16, y: 200 };
function clampToViewport(x, y, isFormPage = false) {
  if (typeof window === "undefined") return { x, y };
  const isMobile = window.innerWidth < 1024;
  const safeAreaBottom = typeof window !== "undefined" ? parseInt(getComputedStyle(document.documentElement).getPropertyValue("--safe-area-inset-bottom") || "0") : 0;
  const baseBottomPad = isMobile ? 120 : PAD;
  const bottomPad = isFormPage ? Math.max(baseBottomPad, 140) : baseBottomPad;
  const maxX = Math.max(PAD, window.innerWidth - SIZE - PAD);
  const maxY = Math.max(PAD, window.innerHeight - SIZE - bottomPad - safeAreaBottom);
  return {
    x: Math.min(Math.max(PAD, x), maxX),
    y: Math.min(Math.max(PAD, y), maxY)
  };
}
function defaultPos(isFormPage = false) {
  if (typeof window === "undefined") return { x: 16, y: 200 };
  const isMobile = window.innerWidth < 1024;
  const x = window.innerWidth - SIZE - 16;
  const baseBottomMargin = isMobile ? 100 : 24;
  const bottomMargin = isFormPage ? 150 : baseBottomMargin;
  const y = window.innerHeight - SIZE - bottomMargin;
  return clampToViewport(x, y, isFormPage);
}
function TreyIWidget() {
  const { signIn } = useAuth$1();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const isFormPage = pathname.includes("/music-review/submit") || pathname.includes("/create") || pathname.includes("/upload");
  const [open, setOpen] = reactExports.useState(false);
  const [msgs, setMsgs] = reactExports.useState(seed$2);
  const [text, setText] = reactExports.useState("");
  const [aibusy, setAibusy] = reactExports.useState(false);
  const [pos, setPos] = reactExports.useState(INITIAL_POS);
  const posRef = reactExports.useRef(INITIAL_POS);
  const loadedRef = reactExports.useRef(false);
  const [mounted, setMounted] = reactExports.useState(false);
  const [dragging, setDragging] = reactExports.useState(false);
  const dragInfo = reactExports.useRef({ dx: 0, dy: 0, moved: false, startX: 0, startY: 0, lastX: 0, lastY: 0, lastT: 0, vx: 0, vy: 0, pendingX: 0, pendingY: 0, rafId: null });
  const btnRef = reactExports.useRef(null);
  const scrollRef = reactExports.useRef(null);
  const pointerToggleHandledRef = reactExports.useRef(false);
  const [tilt, setTilt] = reactExports.useState({ rx: 0, ry: 0 });
  const applyTransform = reactExports.useCallback((x, y) => {
    const el = btnRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, []);
  const moveTo = reactExports.useCallback((next, commit = true) => {
    const clamped = clampToViewport(next.x, next.y, isFormPage);
    posRef.current = clamped;
    applyTransform(clamped.x, clamped.y);
    if (commit) setPos(clamped);
  }, [applyTransform, isFormPage]);
  reactExports.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (typeof saved.x === "number" && typeof saved.y === "number") {
          moveTo({ x: saved.x, y: saved.y });
          loadedRef.current = true;
          return;
        }
      }
    } catch {
    }
    moveTo(defaultPos(isFormPage));
    loadedRef.current = true;
  }, [moveTo, isFormPage]);
  reactExports.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);
  reactExports.useEffect(() => {
    if (!loadedRef.current) return;
    try {
      localStorage.setItem(POS_KEY, JSON.stringify(pos));
    } catch {
    }
  }, [pos]);
  reactExports.useEffect(() => {
    const onResize = () => moveTo(posRef.current);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [moveTo]);
  const flushDrag = reactExports.useCallback(() => {
    dragInfo.current.rafId = null;
    const { pendingX, pendingY } = dragInfo.current;
    const clamped = clampToViewport(pendingX, pendingY, isFormPage);
    posRef.current = clamped;
    applyTransform(clamped.x, clamped.y);
    const vx = dragInfo.current.vx;
    const vy = dragInfo.current.vy;
    const ry = Math.max(-14, Math.min(14, vx * 0.6));
    const rx = Math.max(-14, Math.min(14, -vy * 0.6));
    setTilt({ rx, ry });
  }, [applyTransform, isFormPage]);
  const onPointerDown = reactExports.useCallback((e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const current = posRef.current;
    const now2 = performance.now();
    pointerToggleHandledRef.current = false;
    dragInfo.current = {
      dx: e.clientX - current.x,
      dy: e.clientY - current.y,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      lastT: now2,
      vx: 0,
      vy: 0,
      pendingX: current.x,
      pendingY: current.y,
      rafId: null
    };
    setDragging(true);
  }, []);
  const onPointerMove = reactExports.useCallback((e) => {
    if (!dragging) return;
    e.preventDefault();
    const nx = e.clientX - dragInfo.current.dx;
    const ny = e.clientY - dragInfo.current.dy;
    const now2 = performance.now();
    const dt = Math.max(1, now2 - dragInfo.current.lastT);
    const instVx = (e.clientX - dragInfo.current.lastX) / dt * 16;
    const instVy = (e.clientY - dragInfo.current.lastY) / dt * 16;
    dragInfo.current.vx = dragInfo.current.vx * 0.7 + instVx * 0.3;
    dragInfo.current.vy = dragInfo.current.vy * 0.7 + instVy * 0.3;
    dragInfo.current.lastX = e.clientX;
    dragInfo.current.lastY = e.clientY;
    dragInfo.current.lastT = now2;
    if (Math.hypot(e.clientX - dragInfo.current.startX, e.clientY - dragInfo.current.startY) > 8) {
      dragInfo.current.moved = true;
    }
    dragInfo.current.pendingX = nx;
    dragInfo.current.pendingY = ny;
    if (dragInfo.current.rafId == null) {
      dragInfo.current.rafId = requestAnimationFrame(flushDrag);
    }
  }, [dragging, flushDrag]);
  const onPointerUp = reactExports.useCallback((e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    if (dragInfo.current.rafId != null) {
      cancelAnimationFrame(dragInfo.current.rafId);
      dragInfo.current.rafId = null;
    }
    setDragging(false);
    setTilt({ rx: 0, ry: 0 });
    if (!dragInfo.current.moved) {
      setOpen((o) => !o);
      pointerToggleHandledRef.current = true;
      e.stopPropagation();
      return;
    }
    if (typeof window !== "undefined") {
      const start = posRef.current;
      const speed = Math.hypot(dragInfo.current.vx, dragInfo.current.vy);
      const nearLeft = start.x < 48;
      const nearRight = start.x > window.innerWidth - SIZE - 48;
      const flicked = speed > 28;
      let to = clampToViewport(start.x, start.y, isFormPage);
      if (nearLeft || nearRight || flicked) {
        const projectedX = start.x + dragInfo.current.vx * 8;
        const projectedY = start.y + dragInfo.current.vy * 8;
        const snapLeft = projectedX + SIZE / 2 < window.innerWidth / 2;
        const targetX = snapLeft ? PAD : window.innerWidth - SIZE - PAD;
        to = clampToViewport(targetX, projectedY);
      }
      const from = { ...start };
      const duration = 420;
      const t0 = performance.now();
      const ease = (t) => {
        const c1 = 1.4;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      };
      const step = (now2) => {
        const t = Math.min(1, (now2 - t0) / duration);
        const k = ease(t);
        const x = from.x + (to.x - from.x) * k;
        const y = from.y + (to.y - from.y) * k;
        applyTransform(x, y);
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          posRef.current = to;
          setPos(to);
        }
      };
      requestAnimationFrame(step);
    }
    e.stopPropagation();
  }, [applyTransform, isFormPage]);
  const onLauncherClick = reactExports.useCallback(() => {
    if (pointerToggleHandledRef.current) {
      pointerToggleHandledRef.current = false;
      return;
    }
    setOpen((o) => !o);
  }, []);
  const send = async (raw) => {
    const value = (raw ?? text).trim();
    if (!value || aibusy) return;
    if (value === "04231993") {
      signIn("creator");
      setText("");
      setMsgs((m) => [
        ...m,
        { id: crypto.randomUUID(), from: "you", text: value, time: "now" },
        { id: crypto.randomUUID(), from: "ai", text: "Access granted. Tester environment active — you're in as a verified creator.", time: "now" }
      ]);
      setTimeout(() => nav({ to: "/" }), 1600);
      return;
    }
    const youMsg = { id: crypto.randomUUID(), from: "you", text: value, time: "now" };
    setMsgs((m) => [...m, youMsg]);
    setText("");
    setAibusy(true);
    try {
      const result = await treyIGenerate({ data: { task: "widget_chat", prompt: value } });
      const reply = "text" in result && result.text ? result.text : aiReply(value);
      setMsgs((m) => [...m, { id: crypto.randomUUID(), from: "ai", text: reply, time: "now" }]);
    } catch {
      setMsgs((m) => [...m, { id: crypto.randomUUID(), from: "ai", text: aiReply(value), time: "now" }]);
    } finally {
      setAibusy(false);
    }
  };
  const panelStyle = (() => {
    if (!mounted || typeof window === "undefined") return { left: pos.x, top: pos.y };
    const W = Math.min(380, window.innerWidth - 2 * PAD);
    const H = Math.min(560, window.innerHeight * 0.75);
    const onLeft = pos.x + SIZE / 2 < window.innerWidth / 2;
    const left = onLeft ? Math.min(pos.x + SIZE + 10, window.innerWidth - W - PAD) : Math.max(PAD, pos.x - W - 10);
    const top = Math.max(PAD, Math.min(pos.y + SIZE / 2 - H / 2, window.innerHeight - H - PAD));
    return { left, top, width: W };
  })();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        ref: btnRef,
        type: "button",
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onClick: onLauncherClick,
        "aria-label": "Open Trey-I assistant — drag to move",
        style: {
          position: "fixed",
          left: 0,
          top: 0,
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
          touchAction: "none",
          willChange: "transform"
        },
        className: `z-[10020] size-14 rounded-full grid place-items-center select-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "span",
          {
            "aria-hidden": true,
            style: {
              transform: `perspective(600px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${dragging ? 1.12 : 1})`,
              transition: dragging ? "transform 140ms cubic-bezier(0.22, 1, 0.36, 1)" : "transform 520ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              willChange: "transform"
            },
            className: `absolute inset-0 rounded-full grid place-items-center ${dragging ? "shadow-[0_30px_70px_-10px_oklch(0.7_0.25_340_/_0.55),0_0_40px_oklch(0.82_0.16_85_/_0.35)]" : open ? "ring-2 ring-primary/60 shadow-[0_0_30px_oklch(0.82_0.16_85_/_0.6)]" : "shadow-[0_10px_30px_-10px_oklch(0_0_0_/_0.5)]"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(circle,oklch(0.25_0.15_300_/_0.55),oklch(0.1_0.08_320_/_0.35)_45%,transparent_72%)] blur-2xl animate-dread-breathe" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "pointer-events-none absolute -inset-6 rounded-full bg-[conic-gradient(from_0deg,transparent,oklch(0.18_0.12_320_/_0.7),transparent_40%,oklch(0.22_0.18_280_/_0.6),transparent_75%)] blur-xl opacity-80 animate-dread-spin" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "pointer-events-none absolute -inset-2 rounded-full ring-1 ring-[oklch(0.7_0.25_340_/_0.45)] animate-dread-ring" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "pointer-events-none absolute -inset-4 rounded-full ring-1 ring-[oklch(0.65_0.22_300_/_0.35)] animate-dread-ring [animation-delay:1.2s]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "pointer-events-none absolute -inset-6 rounded-full ring-1 ring-[oklch(0.55_0.2_320_/_0.25)] animate-dread-ring [animation-delay:2.4s]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "pointer-events-none absolute -inset-3 rounded-full bg-[radial-gradient(ellipse_at_30%_20%,oklch(0.7_0.25_340_/_0.4),transparent_60%),radial-gradient(ellipse_at_70%_80%,oklch(0.55_0.22_280_/_0.4),transparent_60%)] blur-md animate-dread-drift mix-blend-screen" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85),oklch(0.7_0.25_340),oklch(0.65_0.22_300),oklch(0.82_0.15_215),oklch(0.82_0.16_85))] animate-conic-spin opacity-90 blur-[1px]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "absolute inset-0.5 rounded-full bg-[oklch(0.13_0.02_270)]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "absolute inset-0 rounded-full bg-primary/30 blur-xl animate-glow-pulse" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "relative size-6 text-primary drop-shadow-[0_0_8px_oklch(0.82_0.16_85_/_0.9)] animate-dread-flicker" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -right-1 size-3 rounded-full bg-[oklch(0.7_0.25_340)] ring-2 ring-background animate-glow-pulse" }),
              dragging && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -bottom-1 -left-1 size-5 grid place-items-center rounded-full bg-background/90 ring-1 ring-white/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Move, { className: "size-3 text-primary" }) })
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: { position: "fixed", ...panelStyle },
        className: `fixed z-[10030] max-h-[75vh] flex flex-col rounded-3xl treyi-chatbox-frost neon-border shadow-[0_30px_80px_-20px_oklch(0_0_0_/_0.8)] origin-bottom-right transition-all duration-300 ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative p-4 border-b border-white/5 overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-10 -right-10 size-32 rounded-full bg-[radial-gradient(circle,oklch(0.7_0.25_340_/_0.5),transparent_70%)] blur-xl" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative size-10 rounded-full conic-ring shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-full grid place-items-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-5 text-primary" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: "Trey-I" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-[oklch(0.78_0.18_150)] animate-glow-pulse" }),
                  "Online · co-pilot for creators"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setOpen(false), className: "size-8 grid place-items-center rounded-full hover:bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: scrollRef, className: "flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar", children: [
            msgs.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex ${m.from === "you" ? "justify-end" : "justify-start"} animate-rise`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `max-w-[85%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${m.from === "you" ? "bg-primary text-primary-foreground rounded-br-sm shadow-[0_0_18px_oklch(0.82_0.16_85_/_0.4)]" : "glass border border-white/10 rounded-bl-sm"}`,
                children: m.text
              }
            ) }, m.id)),
            aibusy && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-start animate-rise", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" })
            ] }) })
          ] }),
          msgs.length <= 2 && !aibusy && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar", children: quick.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => send(q.label), className: "shrink-0 px-3 py-1.5 rounded-full text-[11px] glass border border-white/10 hover:bg-white/5 flex items-center gap-1.5 tilt-press", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(q.icon, { className: "size-3 text-primary" }),
            q.label
          ] }, q.label)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 border-t border-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-2xl glass border border-white/10 px-3 py-2 focus-within:border-primary/50 transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-muted-foreground hover:text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "size-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: text,
                onChange: (e) => setText(e.target.value),
                onKeyDown: (e) => e.key === "Enter" && send(),
                placeholder: "Ask Trey-I anything…",
                className: "flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => send(), disabled: !text.trim() || aibusy, className: `size-8 grid place-items-center rounded-xl transition ${text.trim() && !aibusy ? "bg-primary text-primary-foreground glow-gold tilt-press" : "bg-white/5 text-muted-foreground"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "size-4" }) })
          ] }) })
        ]
      }
    )
  ] });
}
function aiReply(input) {
  const t = input.toLowerCase();
  if (t.includes("caption")) return "Try: 'Lights low, vibes high. Late nights only make sense at the studio. New drop loading…' 🎬✨";
  if (t.includes("mood") || t.includes("prescribe")) return "Tonight feels like a Late-Night Drive set. I can stitch a 4-track moodboard. Want me to send it to your Prescribe Me feed?";
  if (t.includes("trend")) return "Top movers right now: #StudioSessions (+184%), #LateNightDrops (+92%), and 'Aurora' filter. Wanna ride one?";
  if (t.includes("thumbnail") || t.includes("image")) return "Cooking up a 3-variant thumbnail pack — gold-noir, neon-purple, and aurora. ETA 12s. ⏳";
  return "On it. I'll line up a draft and ping you in your Inbox when it's ready.";
}
const PATTERNS = {
  light: 8,
  medium: 14,
  heavy: 22,
  selection: [4, 18, 4],
  success: [10, 30, 10]
};
function haptic(pattern = "light") {
  if (typeof window === "undefined") return;
  try {
    const nav = window.navigator;
    nav.vibrate?.(PATTERNS[pattern]);
  } catch {
  }
}
const ITEMS = [
  { icon: Radio, label: "Go Live", to: "/go-live", color: "oklch(0.7 0.22 25)" },
  { icon: Video, label: "Clip", to: "/creator-studio/submit", color: "oklch(0.78 0.18 320)" },
  { icon: WandSparkles, label: "Trey-I", to: "/trey-i", color: "oklch(0.78 0.2 280)" },
  { icon: FileText, label: "Post", to: "/create", color: "oklch(0.82 0.16 85)" },
  { icon: Mic, label: "Audio", to: "/create", color: "oklch(0.78 0.18 200)" },
  { icon: CalendarClock, label: "Schedule", to: "/creator-studio/schedule", color: "oklch(0.78 0.18 150)" }
];
const HOLD_MS = 240;
function CreateWheel() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = reactExports.useState(false);
  const [hovered, setHovered] = reactExports.useState(null);
  const holdTimer = reactExports.useRef(null);
  const didOpen = reactExports.useRef(false);
  const pressOrigin = reactExports.useRef(null);
  const fabRef = reactExports.useRef(null);
  const close = () => {
    setOpen(false);
    setHovered(null);
    didOpen.current = false;
    pressOrigin.current = null;
  };
  const onPointerDown = (e) => {
    pressOrigin.current = { x: e.clientX, y: e.clientY };
    didOpen.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
    holdTimer.current = window.setTimeout(() => {
      didOpen.current = true;
      setOpen(true);
      if (navigator.vibrate) navigator.vibrate(8);
    }, HOLD_MS);
  };
  const onPointerMove = (e) => {
    if (!didOpen.current) return;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const rawIndex = target?.closest("[data-create-menu-index]")?.dataset.createMenuIndex;
    setHovered(rawIndex ? Number(rawIndex) : null);
  };
  const onPointerUp = (e) => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (didOpen.current) {
      didOpen.current = false;
      if (hovered !== null) {
        navigate({ to: ITEMS[hovered].to });
        close();
      }
    } else {
      navigate({ to: "/create" });
    }
  };
  const onPointerCancel = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
    close();
  };
  reactExports.useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    const onScroll = () => close();
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);
  reactExports.useEffect(() => {
    close();
  }, [pathname]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    open && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 z-[9998] backdrop-blur-md animate-fade-in",
        style: { background: "oklch(0 0 0 / 0.55)" },
        onClick: close
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex justify-center", style: { overflow: "visible" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", style: { marginTop: "-1.75rem" }, children: [
      open && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "fixed left-1/2 z-[10000] w-[min(92vw,380px)] -translate-x-1/2 rounded-[28px] border border-white/15 bg-[#05070D]/95 p-3 shadow-[0_24px_80px_-24px_oklch(0.65_0.22_300_/_0.9)] backdrop-blur-2xl animate-scale-in",
          style: { bottom: "calc(5.75rem + env(safe-area-inset-bottom))" },
          onClick: (event) => event.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 px-2 text-[10px] font-black uppercase tracking-[0.26em] text-muted-foreground", children: "Create" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: ITEMS.map((item, i) => {
              const Icon = item.icon;
              const isHover = hovered === i;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  "data-create-menu-index": i,
                  onClick: () => {
                    navigate({ to: item.to });
                    close();
                  },
                  className: "flex min-h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2 text-left active:scale-[0.98]",
                  style: { boxShadow: isHover ? `0 0 20px ${item.color}55` : void 0 },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid size-9 shrink-0 place-items-center rounded-xl", style: { background: `${item.color}22`, color: item.color, border: `1px solid ${item.color}66` }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-4" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 text-sm font-bold text-white", children: item.label })
                  ]
                },
                item.label
              );
            }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          ref: fabRef,
          type: "button",
          "aria-label": "Create — tap to post, hold for options",
          onPointerDown,
          onPointerMove,
          onPointerUp,
          onPointerCancel,
          onContextMenu: (e) => e.preventDefault(),
          style: {
            position: "relative",
            zIndex: 10001,
            transform: open ? "rotate(45deg) scale(1.05)" : "rotate(0deg) scale(1)",
            transition: "transform 220ms cubic-bezier(0.34,1.56,0.64,1)",
            touchAction: "none"
          },
          className: "size-16 rounded-full grid place-items-center bg-background border-2 border-primary text-primary glow-gold animate-glow-pulse",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-7" })
        }
      )
    ] }) })
  ] });
}
function BottomNav() {
  const { pathname } = useLocation();
  const { isGuest, user } = useAuth$1();
  const isActive = (p) => p === "/" ? pathname === "/" : pathname.startsWith(p);
  const profileUid = user?.uid ?? currentUser.uid;
  const profileAvatar = user?.avatar ?? currentUser.avatar;
  const onProfile = pathname.startsWith("/u/");
  const hideNav = pathname.startsWith("/apply/") || pathname.startsWith("/onboarding/") || pathname.startsWith("/music-review");
  if (hideNav) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "nav",
    {
      className: "bottom-nav mobile-bottom-nav lg:hidden",
      style: {
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        transform: "translate3d(0, 0, 0)",
        zIndex: 9999,
        width: "100vw",
        contain: "layout style",
        backfaceVisibility: "hidden",
        willChange: "transform",
        paddingTop: "1.75rem",
        paddingLeft: "max(env(safe-area-inset-left), 0.25rem)",
        paddingRight: "max(env(safe-area-inset-right), 0.25rem)",
        background: "#05070D"
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-t-3xl rounded-b-none glass-strong border-x-0 border-b-0 border-t border-white/10 shadow-[0_-10px_40px_-10px_oklch(0_0_0_/_0.7)] overflow-visible", children: isGuest ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-5 items-center px-2 pt-2 pb-1 relative overflow-visible", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { to: "/", icon: House, label: "Home", active: isActive("/") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { to: "/explore", icon: Compass, label: "Discover", active: isActive("/explore") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreateWheel, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { to: "/guide", icon: CalendarDays, label: "Guide", active: isActive("/guide") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { to: "/signup", icon: LogIn, label: "Sign up", active: isActive("/login") || isActive("/signup") })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-7 items-center px-2 pt-2 pb-1 relative overflow-visible", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { to: "/", icon: House, label: "Home", active: isActive("/") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { to: "/for-you", icon: Sparkles, label: "For You", active: isActive("/for-you") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { to: "/explore", icon: Compass, label: "Discover", active: isActive("/explore") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreateWheel, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { to: "/guide", icon: CalendarDays, label: "Guide", active: isActive("/guide") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { to: "/inbox", icon: Inbox, label: "Inbox", active: isActive("/inbox"), badge: 8 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileItem, { active: onProfile, uid: profileUid, avatar: profileAvatar })
      ] }) })
    }
  );
}
function NavItem({
  to,
  icon: Icon,
  label,
  active,
  badge
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Link,
    {
      to,
      onPointerDown: () => haptic(active ? "light" : "selection"),
      className: "group relative flex flex-col items-center justify-center gap-1 min-w-0 -my-2 py-3 px-1 rounded-2xl touch-manipulation select-none active:scale-[0.96] transition-transform",
      style: { WebkitTapHighlightColor: "transparent", minHeight: 56 },
      "aria-label": label,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "relative grid place-items-center size-10 rounded-xl transition-colors",
            style: {
              color: active ? "var(--color-primary)" : "var(--color-muted-foreground)",
              background: active ? "oklch(0.82 0.16 85 / 0.15)" : "transparent",
              boxShadow: active ? "var(--shadow-gold)" : "none"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-5" }),
              badge ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold grid place-items-center text-primary-foreground", children: badge }) : null
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "text-[10px] leading-none",
            style: { color: active ? "var(--color-primary)" : "var(--color-muted-foreground)" },
            children: label
          }
        )
      ]
    }
  );
}
function ProfileItem({ active, uid: uid2, avatar }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Link,
    {
      to: "/u/$uid",
      params: { uid: uid2 },
      onPointerDown: () => haptic(active ? "light" : "selection"),
      className: "group relative flex flex-col items-center justify-center gap-1 min-w-0 -my-2 py-3 px-1 rounded-2xl touch-manipulation select-none active:scale-[0.96] transition-transform",
      style: { WebkitTapHighlightColor: "transparent", minHeight: 56 },
      "aria-label": "Profile",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "relative size-10 rounded-full overflow-hidden",
            style: {
              boxShadow: active ? "0 0 0 2px var(--gold), 0 0 12px oklch(0.82 0.16 85 / 0.55)" : "0 0 0 1px oklch(1 0 0 / 15%)"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: avatar, alt: "", className: "size-full rounded-full object-cover" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "text-[10px] leading-none",
            style: { color: active ? "var(--color-primary)" : "var(--color-muted-foreground)" },
            children: "Profile"
          }
        )
      ]
    }
  );
}
function useAuth() {
  const [session, setSession] = reactExports.useState(null);
  const [user, setUser] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    let mounted = true;
    const initializeAuth = async () => {
      try {
        const supabase2 = createBrowserClient();
        const { data: { session: session2 }, error } = await supabase2.auth.getSession();
        if (mounted) {
          if (error) {
            console.error("Auth session error:", error);
            setSession(null);
            setUser(null);
          } else {
            setSession(session2);
            setUser(session2?.user ?? null);
          }
          setLoading(false);
        }
        const { data: { subscription } } = supabase2.auth.onAuthStateChange(
          (_event, session3) => {
            if (mounted) {
              setSession(session3);
              setUser(session3?.user ?? null);
              setLoading(false);
            }
          }
        );
        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.warn("Failed to initialize Supabase client. Missing env vars?", err);
        if (mounted) {
          setLoading(false);
        }
        return () => {
        };
      }
    };
    const cleanupPromise = initializeAuth();
    return () => {
      mounted = false;
      cleanupPromise.then((cleanup) => {
        if (cleanup) cleanup();
      });
    };
  }, []);
  return {
    session,
    user,
    loading,
    isSignedIn: !!session
  };
}
const REACTIONS = [
  { key: "fire", emoji: "🔥", label: "Fire", color: "oklch(0.75 0.2 40)" },
  { key: "gem", emoji: "💎", label: "Gem", color: "oklch(0.82 0.15 215)" },
  { key: "crown", emoji: "👑", label: "Crown", color: "oklch(0.82 0.16 85)" },
  { key: "dead", emoji: "💀", label: "Dead", color: "oklch(0.75 0.05 270)" },
  { key: "cinematic", emoji: "🎬", label: "Cinematic", color: "oklch(0.7 0.25 340)" }
];
const C$6 = reactExports.createContext(null);
const KEY$7 = "treytv_activity_v1";
function ActivityProvider({ children }) {
  const { user } = useAuth$1();
  const { user: supabaseUser } = useAuth();
  const [reactions, setReactions] = reactExports.useState({});
  const [saves, setSaves] = reactExports.useState({});
  const [activity, setActivity] = reactExports.useState([]);
  const storageKey = `${KEY$7}:${user?.uid ?? "guest"}`;
  reactExports.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const p = JSON.parse(raw);
        setReactions(p.reactions || {});
        setSaves(p.saves || {});
        setActivity(p.activity || []);
      } else {
        setReactions({});
        setSaves({});
        setActivity([]);
      }
    } catch {
    }
  }, [storageKey]);
  reactExports.useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ reactions, saves, activity }));
    } catch {
    }
  }, [reactions, saves, activity, storageKey]);
  reactExports.useEffect(() => {
    if (!supabaseUser) return;
    let cancelled = false;
    const loadActivity = async () => {
      try {
        const supabase2 = createBrowserClient();
        const [activityResult, savedResult] = await Promise.all([
          supabase2.from("user_feed_activity").select("id, activity_type, target_id, reaction, metadata, created_at").eq("user_id", supabaseUser.id).order("created_at", { ascending: false }).limit(80),
          supabase2.from("user_saved_items").select("target_id, metadata, created_at").eq("user_id", supabaseUser.id).eq("target_type", "post")
        ]);
        if (activityResult.error || savedResult.error) throw activityResult.error || savedResult.error;
        if (cancelled) return;
        const rows = activityResult.data ?? [];
        const nextActivity = rows.map((row) => ({
          id: row.id,
          ts: new Date(row.created_at).getTime(),
          type: row.activity_type,
          userUid: user?.uid ?? "guest",
          postId: row.target_id,
          reaction: row.reaction ?? void 0,
          title: row.metadata?.title ?? "Post",
          creator: row.metadata?.creator ?? "Trey TV",
          thumb: row.metadata?.thumb
        }));
        const nextReactions = {};
        const nextSaves = {};
        nextActivity.forEach((item) => {
          if (item.type === "react") nextReactions[item.postId] = item.reaction ?? null;
        });
        (savedResult.data ?? []).forEach((row) => {
          nextSaves[row.target_id] = true;
        });
        setActivity(nextActivity);
        setReactions(nextReactions);
        setSaves(nextSaves);
      } catch (error) {
        console.error("Failed to load UID feed activity:", error);
      }
    };
    loadActivity();
    return () => {
      cancelled = true;
    };
  }, [supabaseUser?.id, user?.uid]);
  const traceUid = user?.uid ?? "guest";
  const push = (a) => {
    const item = { ...a, userUid: a.userUid ?? traceUid };
    setActivity((prev) => [item, ...prev].slice(0, 80));
    if (supabaseUser) {
      void (async () => {
        try {
          const supabase2 = createBrowserClient();
          await supabase2.from("user_feed_activity").insert({
            user_id: supabaseUser.id,
            public_profile_uid: traceUid,
            activity_type: item.type,
            target_type: "post",
            target_id: item.postId,
            reaction: item.reaction ?? null,
            metadata: {
              title: item.title,
              creator: item.creator,
              thumb: item.thumb
            }
          });
        } catch (error) {
          console.error("Failed to save UID feed activity:", error);
        }
      })();
    }
  };
  const setReaction = (postId, r, meta) => {
    setReactions((prev) => ({ ...prev, [postId]: r }));
    if (r) {
      push({ id: crypto.randomUUID(), ts: Date.now(), type: "react", postId, reaction: r, ...meta });
      recordUserTrace({ userUid: traceUid, action: "feed.react", targetType: "post", targetId: postId, details: { reaction: r, title: meta.title } });
    }
  };
  const toggleSave = (postId, meta) => {
    setSaves((prev) => {
      const next = !prev[postId];
      if (next) {
        push({ id: crypto.randomUUID(), ts: Date.now(), type: "save", postId, ...meta });
        recordUserTrace({ userUid: traceUid, action: "feed.save", targetType: "post", targetId: postId, details: { title: meta.title } });
      }
      if (supabaseUser) {
        void (async () => {
          try {
            const supabase2 = createBrowserClient();
            if (next) {
              await supabase2.from("user_saved_items").upsert({
                user_id: supabaseUser.id,
                target_type: "post",
                target_id: postId,
                metadata: meta
              }, { onConflict: "user_id,target_type,target_id" });
            } else {
              await supabase2.from("user_saved_items").delete().eq("user_id", supabaseUser.id).eq("target_type", "post").eq("target_id", postId);
            }
          } catch (error) {
            console.error("Failed to persist saved item:", error);
          }
        })();
      }
      return { ...prev, [postId]: next };
    });
  };
  const logShare = (postId, meta) => {
    push({ id: crypto.randomUUID(), ts: Date.now(), type: "share", postId, ...meta });
    recordUserTrace({ userUid: traceUid, action: "feed.share", targetType: "post", targetId: postId, details: { title: meta.title } });
    if (supabaseUser) {
      void (async () => {
        try {
          const supabase2 = createBrowserClient();
          await supabase2.from("user_shares").insert({
            user_id: supabaseUser.id,
            target_type: "post",
            target_id: postId,
            destination: "native_share",
            metadata: meta
          });
        } catch (error) {
          console.error("Failed to persist share:", error);
        }
      })();
    }
  };
  const clear = () => {
    setReactions({});
    setSaves({});
    setActivity([]);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(C$6.Provider, { value: { reactions, saves, activity, setReaction, toggleSave, logShare, clear }, children });
}
function useActivity() {
  const ctx = reactExports.useContext(C$6);
  if (!ctx) throw new Error("useActivity must be inside <ActivityProvider>");
  return ctx;
}
const KEY$6 = "treytv_submissions_v1";
const now$1 = () => (/* @__PURE__ */ new Date()).toISOString();
const emptyDraft = (id, creator = currentUser) => ({
  content_id: id,
  creator_id: creator.uid,
  creator_name: creator.name,
  creator_handle: creator.handle,
  creator_avatar: creator.avatar,
  title: "",
  short_description: "",
  full_description: "",
  viewer_context: "",
  what_to_know: "",
  why_it_matters: "",
  creator_note: "",
  show_id: "",
  show_title: "",
  season_number: 1,
  episode_number: 1,
  episode_type: "Full Episode",
  category: [],
  tags: [],
  mood_tags: [],
  thumbnail_url: "",
  poster_url: "",
  video_url: "",
  duration: "0:00",
  quality: "AI UHD",
  visibility: "public",
  access_type: "free",
  content_rating: "PG",
  language: "English",
  explicit_content: false,
  is_trailer: false,
  is_bonus: false,
  is_finale: false,
  is_premiere: false,
  status: "draft",
  admin_feedback: "",
  admin_internal_note: "",
  policy_ack: false,
  created_at: now$1(),
  updated_at: now$1()
});
const seed$1 = [
  {
    ...emptyDraft("seed-1"),
    title: "The Come Up",
    short_description: "Where it all begins — the first studio session of the season.",
    full_description: "Trey opens up Season 1 with a raw studio session and the story behind the music.",
    viewer_context: "Filmed in one take. No retouching.",
    show_id: "late-night",
    show_title: "Late Night with Trey",
    season_number: 1,
    episode_number: 3,
    episode_type: "Full Episode",
    category: ["Music", "Documentary"],
    tags: ["studio", "raw", "season1"],
    mood_tags: ["Inspired", "Raw"],
    thumbnail_url: posts[0].media,
    video_url: posts[0].media,
    duration: "12:42",
    quality: "4K",
    status: "pending",
    policy_ack: true,
    submitted_at: now$1()
  },
  {
    ...emptyDraft("seed-2"),
    title: "City After Dark — Trailer",
    short_description: "A first look at the new docuseries.",
    full_description: "A 90-second teaser for the City After Dark docuseries.",
    show_id: "city",
    show_title: "City After Dark",
    season_number: 3,
    episode_number: 1,
    episode_type: "Trailer",
    category: ["Documentary", "Lifestyle"],
    tags: ["trailer", "neon"],
    mood_tags: ["Reflective", "Cinematic"],
    thumbnail_url: posts[2].media,
    video_url: posts[2].media,
    duration: "1:30",
    quality: "AI UHD",
    status: "needs_changes",
    policy_ack: true,
    admin_feedback: "Audio is hot in the second half — please re-master and resubmit.",
    submitted_at: now$1(),
    reviewed_at: now$1()
  },
  {
    ...emptyDraft("seed-3"),
    title: "Studio Sessions — Episode 8",
    short_description: "Behind the boards with Zay Beats.",
    full_description: "Zay walks through the production of his latest record.",
    show_id: "studio",
    show_title: "Studio Sessions",
    season_number: 1,
    episode_number: 8,
    episode_type: "Full Episode",
    category: ["Music", "Behind the Scenes"],
    tags: ["zay", "production"],
    mood_tags: ["Hype", "Educational"],
    thumbnail_url: posts[1].media,
    video_url: posts[1].media,
    duration: "24:18",
    quality: "4K",
    status: "published",
    policy_ack: true,
    submitted_at: now$1(),
    reviewed_at: now$1(),
    approved_at: now$1(),
    published_at: now$1()
  }
];
const SubsCtx = reactExports.createContext(null);
function SubmissionsProvider({ children }) {
  const [submissions, setSubs] = reactExports.useState(seed$1);
  reactExports.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY$6);
      if (raw) setSubs(JSON.parse(raw));
    } catch {
    }
  }, []);
  reactExports.useEffect(() => {
    try {
      localStorage.setItem(KEY$6, JSON.stringify(submissions));
    } catch {
    }
  }, [submissions]);
  const value = reactExports.useMemo(() => ({
    submissions,
    get: (id) => submissions.find((s) => s.content_id === id),
    createDraft: (patch = {}) => {
      const id = typeof crypto !== "undefined" && crypto.randomUUID?.() || `sub-${Date.now()}`;
      const draft = { ...emptyDraft(id), ...patch, content_id: id, updated_at: now$1() };
      setSubs((s) => [draft, ...s]);
      return id;
    },
    updateDraft: (id, patch) => setSubs((s) => s.map((x) => x.content_id === id ? { ...x, ...patch, updated_at: now$1() } : x)),
    submit: (id) => setSubs((s) => s.map(
      (x) => x.content_id === id ? { ...x, status: "pending", submitted_at: now$1(), updated_at: now$1() } : x
    )),
    approve: (id, opts) => setSubs((s) => s.map((x) => {
      if (x.content_id !== id) return x;
      const ts = now$1();
      if (opts?.scheduleAt) return { ...x, status: "scheduled", scheduled_at: opts.scheduleAt, reviewed_at: ts, approved_at: ts, admin_internal_note: opts.note ?? x.admin_internal_note, updated_at: ts };
      if (opts?.publish) return { ...x, status: "published", reviewed_at: ts, approved_at: ts, published_at: ts, admin_internal_note: opts.note ?? x.admin_internal_note, updated_at: ts };
      return { ...x, status: "approved", reviewed_at: ts, approved_at: ts, admin_internal_note: opts?.note ?? x.admin_internal_note, updated_at: ts };
    })),
    requestChanges: (id, feedback) => setSubs((s) => s.map(
      (x) => x.content_id === id ? { ...x, status: "needs_changes", admin_feedback: feedback, reviewed_at: now$1(), updated_at: now$1() } : x
    )),
    reject: (id, reason) => setSubs((s) => s.map(
      (x) => x.content_id === id ? { ...x, status: "rejected", admin_feedback: reason, reviewed_at: now$1(), updated_at: now$1() } : x
    )),
    remove: (id) => setSubs((s) => s.filter((x) => x.content_id !== id)),
    byCreator: (uid2) => submissions.filter((x) => x.creator_id === uid2)
  }), [submissions]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SubsCtx.Provider, { value, children });
}
function useSubmissions() {
  const ctx = reactExports.useContext(SubsCtx);
  if (!ctx) throw new Error("useSubmissions must be used inside <SubmissionsProvider>");
  return ctx;
}
const STATUS_LABEL = {
  draft: "Draft",
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  needs_changes: "Needs Changes",
  scheduled: "Scheduled",
  published: "Published"
};
const STATUS_TONE = {
  draft: "bg-white/10 text-muted-foreground border-white/15",
  pending: "bg-[oklch(0.82_0.16_85_/_0.18)] text-primary border-primary/40",
  approved: "bg-[oklch(0.78_0.18_150_/_0.18)] text-[oklch(0.82_0.18_150)] border-[oklch(0.78_0.18_150_/_0.4)]",
  rejected: "bg-[oklch(0.65_0.24_15_/_0.18)] text-[oklch(0.78_0.24_15)] border-[oklch(0.65_0.24_15_/_0.4)]",
  needs_changes: "bg-[oklch(0.7_0.25_340_/_0.18)] text-[oklch(0.78_0.25_340)] border-[oklch(0.7_0.25_340_/_0.4)]",
  scheduled: "bg-[oklch(0.65_0.22_300_/_0.18)] text-[oklch(0.78_0.22_300)] border-[oklch(0.65_0.22_300_/_0.4)]",
  published: "bg-[oklch(0.82_0.15_215_/_0.18)] text-[oklch(0.82_0.15_215)] border-[oklch(0.82_0.15_215_/_0.4)]"
};
const SHOWS = [
  { id: "late-night", title: "Late Night with Trey" },
  { id: "studio", title: "Studio Sessions" },
  { id: "city", title: "City After Dark" }
];
const EPISODE_TYPES = [
  "Full Episode",
  "Clip",
  "Trailer",
  "Behind the Scenes",
  "Promo",
  "Music Video",
  "Interview",
  "Live Replay",
  "Bonus Content"
];
const CATEGORIES = [
  "Music",
  "Comedy",
  "Motivation",
  "Fashion",
  "Gaming",
  "Lifestyle",
  "Documentary",
  "Behind the Scenes",
  "Live Performance",
  "Interview"
];
const MOOD_TAGS = [
  "Motivated",
  "Chill",
  "Inspired",
  "Hype",
  "Reflective",
  "Funny",
  "Emotional",
  "Raw",
  "Educational",
  "Cinematic"
];
const fallbackTransactions = [
  { id: "t1", title: "Daily streak bonus", delta: 120, when: "Today" },
  { id: "t2", title: "Sent Mansion Estate gift · Chris H.", delta: -2500, when: "Yesterday" },
  { id: "t3", title: "Comment milestone (50)", delta: 200, when: "2d ago" },
  { id: "t4", title: "Subscription redeem - Pro", delta: -2500, when: "5d ago" },
  { id: "t5", title: "Watched 3hr - weekly bonus", delta: 400, when: "1w ago" }
];
const fallbackRewards = {
  balance: 12480,
  tier: "RED",
  tierProgress: 24.96,
  nextTier: "GOLD",
  nextTierAt: 5e4,
  pointsToNextTier: 37520,
  streakDays: 12,
  lifetimeEarned: 12480,
  lifetimeSpent: 1800,
  transactions: fallbackTransactions,
  loading: false,
  refresh: () => void 0,
  spend: async () => ({ ok: false, error: "signed-out" })
};
const REWARD_TIERS = [
  { id: "WHITE", min: 0, label: "White", rank: "New member", perks: ["Starter profile badge", "Basic reward wallet"] },
  { id: "GREEN", min: 5e3, label: "Green", rank: "Growing", perks: ["Early community drops", "5% membership discount"] },
  { id: "RED", min: 15e3, label: "Red", rank: "Core member", perks: ["One music-review skip monthly", "Event presale access"] },
  { id: "GOLD", min: 5e4, label: "Gold", rank: "Top member", perks: ["Priority music-review skip", "15% membership discount", "VIP content/event perks"] }
];
function pointsToRewardTier(points) {
  const current = [...REWARD_TIERS].reverse().find((tier) => points >= tier.min) ?? REWARD_TIERS[0];
  const currentIndex = REWARD_TIERS.findIndex((tier) => tier.id === current.id);
  const next = REWARD_TIERS[currentIndex + 1] ?? null;
  const previousMin = current.min;
  const nextMin = next?.min ?? current.min;
  const tierProgress = next ? Math.min(100, Math.max(0, (points - previousMin) / (nextMin - previousMin) * 100)) : 100;
  return {
    tier: current.id,
    tierProgress,
    nextTier: next?.id ?? null,
    nextTierAt: next?.min ?? null,
    pointsToNextTier: next ? Math.max(0, next.min - points) : 0
  };
}
const emptyRewards = {
  balance: 0,
  ...pointsToRewardTier(0),
  streakDays: 0,
  lifetimeEarned: 0,
  lifetimeSpent: 0,
  transactions: [],
  loading: false,
  refresh: () => void 0,
  spend: async () => ({ ok: false, error: "signed-out" })
};
const eventTitles = {
  episode_watch_completed: "Watched episode",
  episode_liked: "Liked content",
  episode_saved: "Saved content",
  meaningful_comment: "Meaningful comment",
  comment_liked: "Comment liked",
  premiere_attended: "Attended premiere",
  daily_streak: "Daily streak bonus",
  weekly_streak: "Weekly streak bonus",
  creator_followed: "Followed a creator",
  friend_invited: "Friend invited",
  helpful_report_confirmed: "Helpful report",
  gift_sent: "Sent creator gift",
  perk_redeemed: "Redeemed perk"
};
const balanceColumns = "current_balance, lifetime_earned, lifetime_spent, engagement_level, current_streak_days";
const eventColumns = "id, event_type, points, status, created_at";
function creditBalancesTable(supabase2) {
  return supabase2.from("community_credit_balances");
}
function creditEventsTable(supabase2) {
  return supabase2.from("community_credit_events");
}
function eventTypeToTitle(eventType) {
  return eventTitles[eventType] ?? eventType.replace(/_/g, " ");
}
function rewardTimeAgo(iso) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1e3));
  if (seconds < 86400) return "Today";
  if (seconds < 172800) return "Yesterday";
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}
function mapTransaction(row) {
  return {
    id: row.id,
    title: eventTypeToTitle(row.event_type),
    delta: row.points,
    when: rewardTimeAgo(row.created_at)
  };
}
function useRewards() {
  const { user, loading: authLoading } = useAuth();
  const [rewards, setRewards] = reactExports.useState(fallbackRewards);
  const [loading, setLoading] = reactExports.useState(false);
  const [refreshNonce, setRefreshNonce] = reactExports.useState(0);
  reactExports.useEffect(() => {
    let mounted = true;
    async function loadRewards() {
      if (authLoading) return;
      if (!user) {
        setRewards(fallbackRewards);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const supabase2 = createBrowserClient();
        await supabase2.rpc("ensure_user_credit_balance", { _user_id: user.id });
        const [balanceResult, eventsResult] = await Promise.all([
          creditBalancesTable(supabase2).select(balanceColumns).eq("user_id", user.id).maybeSingle(),
          creditEventsTable(supabase2).select(eventColumns).eq("user_id", user.id).eq("status", "approved").order("created_at", { ascending: false }).limit(20)
        ]);
        const balanceRow = balanceResult.data ?? null;
        const eventRows = (eventsResult.data ?? []).filter((event) => event.status === "approved");
        if (!mounted) return;
        if (balanceResult.error || eventsResult.error) {
          console.error("Failed to load UID rewards:", balanceResult.error || eventsResult.error);
          setRewards(emptyRewards);
          return;
        }
        if (!balanceRow) {
          setRewards(emptyRewards);
          return;
        }
        const earned = balanceRow.lifetime_earned || balanceRow.current_balance;
        const tierMeta = pointsToRewardTier(earned);
        setRewards({
          balance: balanceRow.current_balance,
          ...tierMeta,
          streakDays: balanceRow.current_streak_days,
          lifetimeEarned: earned,
          lifetimeSpent: balanceRow.lifetime_spent,
          transactions: eventRows.map(mapTransaction),
          loading: false,
          refresh: () => void 0,
          spend: async () => ({ ok: false, error: "not-ready" })
        });
      } catch {
        if (mounted) setRewards(fallbackRewards);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadRewards();
    return () => {
      mounted = false;
    };
  }, [authLoading, user, refreshNonce]);
  const refresh = () => setRefreshNonce((n) => n + 1);
  const spend = async (input) => {
    if (!user) return { ok: false, error: "signed-out" };
    try {
      const supabase2 = createBrowserClient();
      const { error } = await supabase2.rpc("spend_community_credit", {
        _points: input.points,
        _event_type: input.eventType,
        _source_type: input.sourceType ?? null,
        _source_id: input.sourceId ?? null,
        _metadata: input.metadata ?? {}
      });
      if (error) throw error;
      refresh();
      return { ok: true };
    } catch (error) {
      console.error("Failed to spend UID rewards:", error);
      return { ok: false, error };
    }
  };
  return {
    ...rewards,
    loading: authLoading || loading,
    refresh,
    spend
  };
}
function useCurrentUser() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = reactExports.useState(null);
  const [isFetching, setIsFetching] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let mounted = true;
    async function fetchProfile() {
      if (!user) {
        if (mounted) setProfile(null);
        return;
      }
      setIsFetching(true);
      const supabase2 = createBrowserClient();
      try {
        const [{ data: rawData, error }, { data: rewardsData }] = await Promise.all([
          supabase2.from("profiles").select("id, public_profile_uid, display_name, username, avatar_url, banner_url, bio, location, link_url, created_at, role, verification_type, is_verified, verified_creator, profile_accent_color, tagline, pronouns, birthday, favorite_genres, favorite_creators, social_instagram, social_tiktok, social_youtube, profile_visibility, show_location, show_birthday").eq("id", user.id).single(),
          supabase2.from("community_credit_balances").select("current_balance, lifetime_earned").eq("user_id", user.id).maybeSingle()
        ]);
        const data = rawData;
        const rewardBalance = rewardsData;
        if (error || !data) {
          console.error("Failed to fetch profile:", error);
          if (mounted) setProfile(null);
        } else {
          if (mounted) {
            let verified = void 0;
            if (data.is_verified) {
              verified = data.verified_creator ? "creator" : "user";
            } else if (data.verification_type === "creator") {
              verified = "creator";
            }
            const rewardPoints = Number(rewardBalance?.current_balance ?? 0);
            const rewardTier = pointsToRewardTier(Number(rewardBalance?.lifetime_earned ?? rewardPoints)).tier;
            const publicUid = data.public_profile_uid || data.id || "";
            const mappedProfile = {
              name: data.display_name || data.username || "Trey TV Member",
              handle: data.username || (publicUid ? `user_${String(publicUid).slice(-6)}` : "member"),
              uid: publicUid,
              avatar: data.avatar_url || "",
              banner: data.banner_url || "",
              bio: data.bio || "",
              location: data.location || "",
              link: data.link_url || "",
              accent: data.profile_accent_color || "gold",
              tagline: data.tagline || "",
              pronouns: data.pronouns || "",
              birthday: data.birthday || "",
              favoriteGenres: data.favorite_genres || "",
              favoriteCreators: data.favorite_creators || "",
              socialInstagram: data.social_instagram || "",
              socialTikTok: data.social_tiktok || "",
              socialYouTube: data.social_youtube || "",
              verified,
              role: data.role || "user",
              stats: currentUser.stats,
              rewards: { points: rewardPoints, tier: rewardTier },
              profileVisibility: data.profile_visibility || "public",
              showLocation: data.show_location ?? true,
              showBirthday: data.show_birthday ?? false
            };
            setProfile(mappedProfile);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        if (mounted) setProfile(null);
      } finally {
        if (mounted) setIsFetching(false);
      }
    }
    if (!loading) {
      fetchProfile();
    }
    return () => {
      mounted = false;
    };
  }, [user, loading]);
  const defaultSessionUser = {
    name: "Trey TV Member",
    handle: "member",
    uid: "",
    avatar: "",
    banner: "",
    bio: "",
    location: "",
    link: "",
    verified: void 0,
    stats: currentUser.stats,
    role: "user",
    accent: "#FFC857",
    rewards: { points: 12480, tier: "GOLD" }
  };
  if (loading || isFetching || !user || !profile) {
    return defaultSessionUser;
  }
  return profile;
}
({
  publicProfileUid: currentUser.uid,
  name: currentUser.name,
  handle: currentUser.handle,
  avatar: currentUser.avatar,
  verified: currentUser.verified
});
const C$5 = reactExports.createContext(null);
const KEY$5 = "treytv_user_posts_v1";
const SERVER_FALLBACK_CTX = {
  posts: [],
  addPost: () => {
    throw new Error("FeedProvider is required before adding posts");
  },
  updatePost: async () => ({ ok: false, reason: "FeedProvider is required" }),
  removePost: async () => ({ ok: false, reason: "FeedProvider is required" })
};
function timeAgo(ts) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1e3));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
function FeedProvider({ children }) {
  const [raw, setRaw] = reactExports.useState([]);
  const [hydrated, setHydrated] = reactExports.useState(false);
  const { user: supabaseUser } = useAuth();
  const profileUser = useCurrentUser();
  const storageKey = `${KEY$5}:${profileUser.uid}`;
  const meAsCreator = {
    id: profileUser.uid,
    publicProfileUid: profileUser.uid,
    name: profileUser.name,
    handle: profileUser.handle,
    avatar: profileUser.avatar,
    ring: "gold",
    verified: profileUser.verified
  };
  reactExports.useEffect(() => {
    try {
      const v = localStorage.getItem(storageKey);
      if (v) setRaw(JSON.parse(v));
      else setRaw([]);
    } catch {
    }
    setHydrated(true);
  }, [storageKey]);
  reactExports.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(raw));
    } catch {
    }
  }, [raw, hydrated, storageKey]);
  reactExports.useEffect(() => {
    if (!supabaseUser) return;
    let cancelled = false;
    const loadPosts = async () => {
      try {
        const supabase2 = createBrowserClient();
        const { data, error } = await supabase2.from("user_feed_posts").select("id, user_id, body, media_url, audience, tags, metrics, created_at, source_type, gif_fwd_id, gif_poster_url, gif_title").eq("user_id", supabaseUser.id).order("created_at", { ascending: false }).limit(100);
        if (error) throw error;
        if (cancelled) return;
        setRaw((data ?? []).map((row) => ({
          id: row.id,
          ownerId: row.user_id,
          creator: meAsCreator,
          timeAgo: timeAgo(new Date(row.created_at).getTime()),
          text: row.body,
          media: row.media_url ?? void 0,
          sourceType: row.source_type ?? "trey",
          gifFwdId: row.gif_fwd_id ?? null,
          gifPosterUrl: row.gif_poster_url ?? null,
          gifTitle: row.gif_title ?? null,
          duration: void 0,
          likes: Number(row.metrics?.likes ?? 0),
          comments: Number(row.metrics?.comments ?? 0),
          reshares: Number(row.metrics?.reshares ?? 0),
          saves: Number(row.metrics?.saves ?? 0),
          audience: row.audience ?? "Everyone",
          tags: Array.isArray(row.tags) ? row.tags : [],
          createdAt: new Date(row.created_at).getTime()
        })));
      } catch (error) {
        console.error("Failed to load UID feed posts:", error);
      }
    };
    loadPosts();
    return () => {
      cancelled = true;
    };
  }, [supabaseUser?.id]);
  const posts2 = raw.map((p) => ({ ...p, timeAgo: timeAgo(p.createdAt) }));
  const addPost = ({
    text,
    audience = "Everyone",
    tags = [],
    media,
    sourceType = "trey",
    gifFwdId = null,
    gifPosterUrl = null,
    gifTitle = null
  }) => {
    const id = typeof crypto !== "undefined" && crypto.randomUUID?.() || `p-${Date.now()}`;
    const post = {
      id,
      ownerId: supabaseUser?.id ?? null,
      creator: meAsCreator,
      timeAgo: "now",
      text,
      media,
      sourceType,
      gifFwdId,
      gifPosterUrl,
      gifTitle,
      duration: void 0,
      likes: 0,
      comments: 0,
      reshares: 0,
      saves: 0,
      audience,
      tags,
      createdAt: Date.now()
    };
    setRaw((s) => [post, ...s].slice(0, 100));
    if (supabaseUser) {
      void (async () => {
        try {
          const supabase2 = createBrowserClient();
          const { data, error } = await supabase2.from("user_feed_posts").insert({
            user_id: supabaseUser.id,
            public_profile_uid: profileUser.uid,
            body: text,
            media_url: media ?? null,
            source_type: sourceType,
            gif_fwd_id: gifFwdId,
            gif_poster_url: gifPosterUrl,
            gif_title: gifTitle,
            audience,
            tags,
            metrics: { likes: 0, comments: 0, reshares: 0, saves: 0 }
          }).select("id, created_at").single();
          if (error) throw error;
          if (data?.id) {
            const createdAt = data.created_at ? new Date(data.created_at).getTime() : post.createdAt;
            setRaw((s) => s.map((p) => p.id === id ? { ...p, id: data.id, createdAt } : p));
          }
        } catch (error) {
          console.error("Failed to save UID feed post:", error);
        }
      })();
    }
    return post;
  };
  const updatePost = async (id, { text }) => {
    if (!supabaseUser) return { ok: false, reason: "Sign in to edit posts." };
    const previous = raw;
    const post = raw.find((p) => p.id === id);
    if (!post || post.ownerId !== supabaseUser.id) {
      return { ok: false, reason: "Only the post owner can edit this." };
    }
    setRaw((s) => s.map((p) => p.id === id ? { ...p, text } : p));
    try {
      const supabase2 = createBrowserClient();
      const { data, error } = await supabase2.from("user_feed_posts").update({ body: text, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).eq("user_id", supabaseUser.id).select("id").maybeSingle();
      if (error) throw error;
      if (!data?.id) throw new Error("Only the post owner can edit this.");
      return { ok: true };
    } catch (error) {
      setRaw(previous);
      console.error("Failed to update UID feed post:", error);
      return { ok: false, reason: error instanceof Error ? error.message : "Post update failed." };
    }
  };
  const removePost = async (id) => {
    if (!supabaseUser) return { ok: false, reason: "Sign in to delete posts." };
    const previous = raw;
    const post = raw.find((p) => p.id === id);
    if (!post || post.ownerId !== supabaseUser.id) {
      return { ok: false, reason: "Only the post owner can delete this." };
    }
    setRaw((s) => s.filter((p) => p.id !== id));
    try {
      const supabase2 = createBrowserClient();
      const { data, error } = await supabase2.from("user_feed_posts").delete().eq("id", id).eq("user_id", supabaseUser.id).select("id").maybeSingle();
      if (error) throw error;
      if (!data?.id) throw new Error("Only the post owner can delete this.");
      return { ok: true };
    } catch (error) {
      setRaw(previous);
      console.error("Failed to remove UID feed post:", error);
      return { ok: false, reason: error instanceof Error ? error.message : "Post delete failed." };
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(C$5.Provider, { value: { posts: posts2, addPost, updatePost, removePost }, children });
}
function useFeed() {
  const ctx = reactExports.useContext(C$5);
  if (!ctx && typeof window === "undefined") return SERVER_FALLBACK_CTX;
  if (!ctx) throw new Error("useFeed must be inside <FeedProvider>");
  return ctx;
}
const C$4 = reactExports.createContext(null);
const KEY$4 = "treytv_comments_v1";
const SEED$1 = [
  { id: "c-seed-1", postId: "p1", author: { name: "Aria Knox", handle: "ariaknox", avatar: "https://i.pravatar.cc/120?img=47" }, text: "This shot is unreal", likes: 12, likedByMe: false, createdAt: Date.now() - 1e3 * 60 * 22 },
  { id: "c-seed-2", postId: "p1", author: { name: "Miles Vega", handle: "milesvega", avatar: "https://i.pravatar.cc/120?img=12" }, text: "Drop the preset pls", likes: 4, likedByMe: false, createdAt: Date.now() - 1e3 * 60 * 8 }
];
const isUUID$1 = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
function CommentsProvider({ children }) {
  const [items, setItems] = reactExports.useState([]);
  const [loadedPosts, setLoadedPosts] = reactExports.useState(() => /* @__PURE__ */ new Set());
  const fetchedPosts = reactExports.useRef(/* @__PURE__ */ new Set());
  const currentUser2 = useCurrentUser();
  const { user: supabaseUser } = useAuth();
  reactExports.useEffect(() => {
    if (supabaseUser) {
      setItems([]);
      setLoadedPosts(/* @__PURE__ */ new Set());
      fetchedPosts.current.clear();
      return;
    }
    try {
      const raw = localStorage.getItem(KEY$4);
      setItems(raw ? JSON.parse(raw) : SEED$1);
    } catch {
      setItems(SEED$1);
    }
  }, [supabaseUser?.id]);
  reactExports.useEffect(() => {
    if (supabaseUser) return;
    try {
      localStorage.setItem(KEY$4, JSON.stringify(items));
    } catch {
    }
  }, [items, supabaseUser?.id]);
  const fetchCommentsForPost = async (postId) => {
    const supabase2 = createBrowserClient();
    const { data, error } = await supabase2.from("user_post_comments").select(`
        id,
        post_id,
        creator_id,
        parent_comment_id,
        body,
        gif_url,
        gif_poster_url,
        gif_fwd_id,
        edited_at,
        created_at
      `).eq("post_id", postId).eq("moderation_status", "visible").is("deleted_at", null).order("created_at", { ascending: true });
    if (error) {
      console.error("Failed to fetch comments for post:", error);
      setLoadedPosts((prev) => new Set(prev).add(postId));
      return;
    }
    const rows = data ?? [];
    const ids = rows.map((row) => row.id);
    const creatorIds = [...new Set(rows.map((row) => row.creator_id).filter(Boolean))];
    let reactionRows = [];
    const profilesById = /* @__PURE__ */ new Map();
    await Promise.all([
      ids.length > 0 ? supabase2.from("user_comment_reactions").select("comment_id, user_id").in("comment_id", ids) : Promise.resolve({ data: [], error: null }),
      creatorIds.length > 0 ? supabase2.from("profiles").select("id, display_name, username, avatar_url, public_profile_uid").in("id", creatorIds) : Promise.resolve({ data: [], error: null })
    ]).then(([reactionResult, profileResult]) => {
      if (!reactionResult.error) reactionRows = reactionResult.data ?? [];
      if (!profileResult.error) {
        (profileResult.data ?? []).forEach((profile) => profilesById.set(profile.id, profile));
      }
    });
    const likesByComment = /* @__PURE__ */ new Map();
    const likedByMe = /* @__PURE__ */ new Set();
    reactionRows.forEach((row) => {
      likesByComment.set(row.comment_id, (likesByComment.get(row.comment_id) ?? 0) + 1);
      if (supabaseUser && row.user_id === supabaseUser.id) likedByMe.add(row.comment_id);
    });
    const dbComments = rows.map((row) => {
      const profile = profilesById.get(row.creator_id);
      return {
        id: row.id,
        postId: row.post_id,
        parentId: row.parent_comment_id || void 0,
        author: {
          id: row.creator_id,
          publicProfileUid: profile?.public_profile_uid || null,
          name: profile?.display_name || profile?.username || "Trey TV Member",
          handle: profile?.username || "member",
          avatar: profile?.avatar_url || ""
        },
        text: row.body,
        gifUrl: row.gif_url ?? null,
        gifPosterUrl: row.gif_poster_url ?? null,
        gifFwdId: row.gif_fwd_id ?? null,
        likes: likesByComment.get(row.id) ?? 0,
        likedByMe: likedByMe.has(row.id),
        createdAt: new Date(row.created_at).getTime(),
        editedAt: row.edited_at ? new Date(row.edited_at).getTime() : void 0
      };
    });
    setItems((prev) => {
      const localOnly = supabaseUser ? [] : prev.filter((c) => !isUUID$1(c.id));
      return [...localOnly, ...prev.filter((c) => c.postId !== postId && isUUID$1(c.id)), ...dbComments];
    });
    setLoadedPosts((prev) => new Set(prev).add(postId));
  };
  const byPost = (postId) => {
    if (!fetchedPosts.current.has(postId)) {
      fetchedPosts.current.add(postId);
      setTimeout(() => {
        void fetchCommentsForPost(postId);
      }, 0);
    }
    return items.filter((c) => c.postId === postId).sort((a, b) => a.createdAt - b.createdAt);
  };
  const loaded = (postId) => loadedPosts.has(postId);
  const add = async (postId, text, parentId, gif) => {
    const trimmed = text.trim();
    if (!trimmed && !gif?.gifUrl) return false;
    const localId = typeof crypto !== "undefined" && crypto.randomUUID?.() || `c-${Date.now()}`;
    const newComment = {
      id: localId,
      postId,
      parentId,
      author: {
        id: supabaseUser?.id,
        publicProfileUid: currentUser2.uid || null,
        name: currentUser2.name,
        handle: currentUser2.handle,
        avatar: currentUser2.avatar
      },
      text: trimmed,
      likes: 0,
      likedByMe: false,
      createdAt: Date.now(),
      gifUrl: gif?.gifUrl ?? null,
      gifPosterUrl: gif?.gifPosterUrl ?? null,
      gifFwdId: gif?.gifFwdId ?? null
    };
    setItems((s) => [...s, newComment]);
    if (!supabaseUser) return true;
    const supabase2 = createBrowserClient();
    const { data, error } = await supabase2.from("user_post_comments").insert({
      post_id: postId,
      parent_comment_id: parentId || null,
      body: trimmed || null,
      creator_id: supabaseUser.id,
      gif_url: gif?.gifUrl ?? null,
      gif_poster_url: gif?.gifPosterUrl ?? null,
      gif_fwd_id: gif?.gifFwdId ?? null
    }).select("id, created_at").single();
    if (error) {
      console.error("Failed to add comment:", error);
      setItems((s) => s.filter((x) => x.id !== localId));
      return false;
    }
    if (data) {
      setItems((s) => s.map((x) => x.id === localId ? {
        ...x,
        id: data.id,
        createdAt: data.created_at ? new Date(data.created_at).getTime() : x.createdAt
      } : x));
    }
    return true;
  };
  const toggleLike = async (id) => {
    const comment = items.find((c) => c.id === id);
    if (!comment) return false;
    const nextLiked = !comment.likedByMe;
    setItems((s) => s.map((c) => c.id === id ? {
      ...c,
      likedByMe: nextLiked,
      likes: Math.max(0, c.likes + (nextLiked ? 1 : -1))
    } : c));
    if (!supabaseUser || !isUUID$1(id)) return true;
    try {
      const supabase2 = createBrowserClient();
      const result = nextLiked ? await supabase2.from("user_comment_reactions").upsert({
        comment_id: id,
        user_id: supabaseUser.id,
        reaction_type: "like"
      }, { onConflict: "comment_id,user_id" }) : await supabase2.from("user_comment_reactions").delete().eq("comment_id", id).eq("user_id", supabaseUser.id);
      if (result.error) throw result.error;
      return true;
    } catch (error) {
      console.error("Failed to persist comment reaction:", error);
      setItems((s) => s.map((c) => c.id === id ? {
        ...c,
        likedByMe: !nextLiked,
        likes: Math.max(0, c.likes + (nextLiked ? -1 : 1))
      } : c));
      return false;
    }
  };
  const remove = async (id) => {
    const comment = items.find((c) => c.id === id);
    if (!comment) return false;
    setItems((s) => s.filter((c) => c.id !== id && c.parentId !== id));
    if (!supabaseUser || !isUUID$1(id)) return true;
    const supabase2 = createBrowserClient();
    const { error } = await supabase2.from("user_post_comments").update({ deleted_at: (/* @__PURE__ */ new Date()).toISOString(), updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).eq("creator_id", supabaseUser.id);
    if (error) {
      console.error("Failed to delete comment:", error);
      void fetchCommentsForPost(comment.postId);
      return false;
    }
    return true;
  };
  const edit = async (id, text) => {
    const trimmed = text.trim();
    if (!trimmed) return false;
    const comment = items.find((c) => c.id === id);
    if (!comment) return false;
    setItems((s) => s.map((c) => c.id === id ? { ...c, text: trimmed, editedAt: Date.now() } : c));
    if (!supabaseUser || !isUUID$1(id)) return true;
    try {
      const supabase2 = createBrowserClient();
      const { error } = await supabase2.from("user_post_comments").update({ body: trimmed, edited_at: (/* @__PURE__ */ new Date()).toISOString(), updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).eq("creator_id", supabaseUser.id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Failed to edit comment:", error);
      setItems((s) => s.map((c) => c.id === id ? comment : c));
      return false;
    }
  };
  const isMine = (c) => !!supabaseUser && c.author.id === supabaseUser.id || c.author.handle === currentUser2.handle;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(C$4.Provider, { value: { byPost, loaded, add, toggleLike, remove, edit, isMine }, children });
}
function useComments() {
  const ctx = reactExports.useContext(C$4);
  if (!ctx) throw new Error("useComments must be inside <CommentsProvider>");
  return ctx;
}
const extFromFile = (file, fallback) => {
  if ("name" in file && file.name.includes(".")) {
    return file.name.split(".").pop()?.toLowerCase() || fallback;
  }
  const subtype = file.type.split("/")[1]?.split(";")[0]?.toLowerCase();
  if (!subtype) return fallback;
  if (subtype === "jpeg") return "jpg";
  return subtype;
};
const safePart = (value) => value.replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
async function uploadProfileMedia(userId, file, kind) {
  const supabase2 = createBrowserClient();
  const ext = extFromFile(file, kind === "avatar" ? "jpg" : "webp");
  const path = `${userId}/${kind}-${Date.now()}-${safePart(file.name || "upload")}.${ext}`;
  const { error } = await supabase2.storage.from("profile-media").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || void 0,
    upsert: true
  });
  if (error) throw error;
  const { data } = supabase2.storage.from("profile-media").getPublicUrl(path);
  return { path, url: data.publicUrl };
}
async function uploadMessageMedia(userId, file, kind) {
  const supabase2 = createBrowserClient();
  const ext = extFromFile(file, kind === "voice" ? "webm" : "bin");
  const path = `${userId}/${kind}-${Date.now()}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase2.storage.from("message-media").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || void 0,
    upsert: false
  });
  if (error) throw error;
  return path;
}
async function createMessageMediaUrl(pathOrUrl) {
  if (!pathOrUrl) return void 0;
  if (/^(https?:|blob:|data:)/i.test(pathOrUrl)) return pathOrUrl;
  const supabase2 = createBrowserClient();
  const { data, error } = await supabase2.storage.from("message-media").createSignedUrl(pathOrUrl, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}
const C$3 = reactExports.createContext(null);
const KEY$3 = "treytv_messages_v1";
const SEED_PEERS = creators.slice(0, 5).map((c, i) => ({
  id: c.id,
  name: c.name,
  handle: c.handle,
  avatar: c.avatar,
  verified: c.verified,
  online: i < 2
}));
const now = Date.now();
const SEED_THREADS = SEED_PEERS.map((p, i) => ({
  id: p.id,
  peer: p,
  pinned: i === 0,
  lastReadAt: 0,
  myLastReadAt: i > 1 ? now : 0
}));
const SEED_MSGS = [
  { id: "sm1", threadId: SEED_PEERS[0].id, from: "them", text: "Yooo just watched the BTS — that lighting setup is unreal 🔥", ts: now - 1e3 * 60 * 18, status: "read" },
  { id: "sm2", threadId: SEED_PEERS[0].id, from: "me", text: "Appreciate it 🙏 took 4 hours to dial the rig", ts: now - 1e3 * 60 * 17, status: "read" },
  { id: "sm3", threadId: SEED_PEERS[0].id, from: "them", text: "Reels swap? I'll plug your show on my channel tomorrow", ts: now - 1e3 * 60 * 4, status: "read" },
  { id: "sm4", threadId: SEED_PEERS[1].id, from: "them", text: "Just dropped a new beat — wanna preview?", ts: now - 1e3 * 60 * 12, status: "read" },
  { id: "sm5", threadId: SEED_PEERS[2].id, from: "them", text: "voice memo about the moodboard ✨", ts: now - 1e3 * 60 * 60, status: "read" }
];
function uid() {
  return typeof crypto !== "undefined" && crypto.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
function MessagesProvider({ children }) {
  const [threads, setThreads] = reactExports.useState([]);
  const [messages, setMessages] = reactExports.useState([]);
  const [hydrated, setHydrated] = reactExports.useState(false);
  const { user: supabaseUser } = useAuth();
  const currentProfile = useCurrentUser();
  const storageKey = `${KEY$3}:${currentProfile.uid}`;
  reactExports.useEffect(() => {
    const tick = () => {
      const now2 = Date.now();
      setMessages((prev) => {
        const hasExpired = prev.some(
          (m) => m.ghostExpiresAt && m.ghostExpiresAt <= now2 && m.status !== "read"
        );
        if (!hasExpired) return prev;
        return prev.filter(
          (m) => !(m.ghostExpiresAt && m.ghostExpiresAt <= now2 && m.status !== "read")
        );
      });
    };
    const id = setInterval(tick, 5e3);
    return () => clearInterval(id);
  }, []);
  reactExports.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY$3);
      const scopedRaw = localStorage.getItem(storageKey);
      if (scopedRaw) {
        const p = JSON.parse(scopedRaw);
        if (Array.isArray(p.threads)) setThreads(p.threads);
        if (Array.isArray(p.messages)) setMessages(p.messages);
      } else if (raw) {
        const p = JSON.parse(raw);
        if (Array.isArray(p.threads)) setThreads(p.threads);
        if (Array.isArray(p.messages)) setMessages(p.messages);
      } else {
        setThreads(SEED_THREADS);
        setMessages(SEED_MSGS);
      }
    } catch {
    }
    setHydrated(true);
  }, [storageKey]);
  reactExports.useEffect(() => {
    if (!hydrated) return;
    try {
      const localThreads = threads.filter((t) => !isUUID(t.id));
      const localMsgs = messages.filter((m) => !isUUID(m.threadId));
      localStorage.setItem(storageKey, JSON.stringify({ threads: localThreads, messages: localMsgs }));
    } catch {
    }
  }, [threads, messages, hydrated, storageKey]);
  reactExports.useEffect(() => {
    if (!supabaseUser) return;
    let mounted = true;
    const fetchConversations = async () => {
      const supabase2 = createBrowserClient();
      const { data, error } = await supabase2.from("direct_messages").select(`
          id, sender_id, recipient_id, body, message_type, media_url, media_type, voice_duration, ghost_expires_at, ghost_label, read_at, created_at, gif_fwd_id, gif_poster_url, gif_title,
          sender:sender_id ( id, public_profile_uid, display_name, username, avatar_url, verification_type ),
          recipient:recipient_id ( id, public_profile_uid, display_name, username, avatar_url, verification_type )
        `).or(`sender_id.eq.${supabaseUser.id},recipient_id.eq.${supabaseUser.id}`).order("created_at", { ascending: false }).limit(200);
      if (error) {
        console.error("Failed to fetch DMs:", error);
        return;
      }
      if (mounted && data) {
        const peerThreads = /* @__PURE__ */ new Map();
        const dbMsgs = [];
        for (const rawRow of data) {
          const row = rawRow;
          const isMeSender = row.sender_id === supabaseUser.id;
          const peerId = isMeSender ? row.recipient_id : row.sender_id;
          const peerProfile = isMeSender ? row.recipient : row.sender;
          if (!peerThreads.has(peerId)) {
            peerThreads.set(peerId, {
              id: peerId,
              peer: {
                id: peerProfile?.id || peerId,
                publicProfileUid: peerProfile?.public_profile_uid || null,
                name: peerProfile?.display_name || "Unknown",
                handle: peerProfile?.username || "unknown",
                avatar: peerProfile?.avatar_url || "",
                verified: peerProfile?.verification_type === "creator" ? "creator" : "user"
              },
              lastReadAt: 0,
              myLastReadAt: 0
            });
          }
          peerThreads.get(peerId);
          let status = "delivered";
          if (row.read_at) status = "read";
          else if (isMeSender) status = "sent";
          const isGifMsg = row.message_type === "gif" || row.gif_fwd_id != null && row.media_url;
          const resolvedMediaUrl = await createMessageMediaUrl(row.media_url);
          dbMsgs.push({
            id: row.id,
            threadId: peerId,
            from: isMeSender ? "me" : "them",
            text: row.body ?? "",
            ts: new Date(row.created_at).getTime(),
            status,
            ghostExpiresAt: row.ghost_expires_at ? new Date(row.ghost_expires_at).getTime() : void 0,
            ghostLabel: row.ghost_label ?? void 0,
            mediaUrl: row.message_type === "voice" ? void 0 : resolvedMediaUrl,
            mediaType: row.media_type === "video" ? "video" : row.media_type === "image" || isGifMsg ? "image" : void 0,
            voiceUrl: row.message_type === "voice" ? resolvedMediaUrl : void 0,
            voiceDuration: row.voice_duration ? Number(row.voice_duration) : void 0,
            isGif: !!isGifMsg,
            gifFwdId: row.gif_fwd_id ?? void 0,
            gifPosterUrl: row.gif_poster_url ?? void 0,
            gifTitle: row.gif_title ?? void 0
          });
        }
        setThreads((prev) => {
          const locals = prev.filter((t) => !isUUID(t.id));
          return [...Array.from(peerThreads.values()), ...locals];
        });
        setMessages((prev) => {
          const locals = prev.filter((m) => !isUUID(m.threadId));
          return [...dbMsgs.sort((a, b) => a.ts - b.ts), ...locals];
        });
      }
    };
    fetchConversations();
    return () => {
      mounted = false;
    };
  }, [supabaseUser?.id]);
  reactExports.useEffect(() => {
    if (!supabaseUser) return;
    const supabase2 = createBrowserClient();
    const channel = supabase2.channel(`direct_messages:${supabaseUser.id}`).on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "direct_messages",
        filter: `recipient_id=eq.${supabaseUser.id}`
      },
      async (payload) => {
        const row = payload.new;
        if (!row) return;
        const { data: peerProfile } = await supabase2.from("profiles").select("id, public_profile_uid, display_name, username, avatar_url, verification_type").eq("id", row.sender_id).maybeSingle();
        const peer = {
          id: row.sender_id,
          publicProfileUid: peerProfile?.public_profile_uid || null,
          name: peerProfile?.display_name || "Unknown",
          handle: peerProfile?.username || "unknown",
          avatar: peerProfile?.avatar_url || "",
          verified: peerProfile?.verification_type === "creator" ? "creator" : "user",
          online: true
        };
        setThreads((prev) => {
          const existing = prev.find((t) => t.id === row.sender_id);
          if (existing) return prev.map((t) => t.id === row.sender_id ? { ...t, peer } : t);
          return [{ id: row.sender_id, peer, lastReadAt: 0, myLastReadAt: 0 }, ...prev];
        });
        const isGifMsg = row.message_type === "gif" || row.gif_fwd_id != null && row.media_url;
        const resolvedMediaUrl = await createMessageMediaUrl(row.media_url);
        setMessages((prev) => prev.some((m) => m.id === row.id) ? prev : [...prev, {
          id: row.id,
          threadId: row.sender_id,
          from: "them",
          text: row.body ?? "",
          ts: new Date(row.created_at).getTime(),
          status: row.read_at ? "read" : "delivered",
          ghostExpiresAt: row.ghost_expires_at ? new Date(row.ghost_expires_at).getTime() : void 0,
          ghostLabel: row.ghost_label ?? void 0,
          mediaUrl: row.message_type === "voice" ? void 0 : resolvedMediaUrl,
          mediaType: row.media_type === "video" ? "video" : row.media_type === "image" || isGifMsg ? "image" : void 0,
          voiceUrl: row.message_type === "voice" ? resolvedMediaUrl : void 0,
          voiceDuration: row.voice_duration ? Number(row.voice_duration) : void 0,
          isGif: !!isGifMsg,
          gifFwdId: row.gif_fwd_id ?? void 0,
          gifPosterUrl: row.gif_poster_url ?? void 0,
          gifTitle: row.gif_title ?? void 0
        }]);
      }
    ).subscribe();
    return () => {
      supabase2.removeChannel(channel);
    };
  }, [supabaseUser?.id]);
  const outThreads = supabaseUser ? threads : [];
  const outMessages = supabaseUser ? messages : [];
  const messagesOf = (id) => outMessages.filter((m) => m.threadId === id).sort((a, b) => a.ts - b.ts);
  const unreadOf = (id) => {
    return outMessages.filter((m) => m.threadId === id && m.from === "them" && m.status !== "read").length;
  };
  const totalUnread = reactExports.useMemo(
    () => outThreads.reduce((s, t) => s + outMessages.filter((m) => m.threadId === t.id && m.from === "them" && m.status !== "read").length, 0),
    [outThreads, outMessages]
  );
  const markRead = async (id) => {
    if (!supabaseUser) return;
    setMessages((s) => s.map((m) => m.threadId === id && m.from === "them" ? { ...m, status: "read" } : m));
    setThreads((s) => s.map((t) => t.id === id ? { ...t, myLastReadAt: Date.now() } : t));
    if (isUUID(id)) {
      const supabase2 = createBrowserClient();
      const { error } = await supabase2.from("direct_messages").update({ read_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("sender_id", id).eq("recipient_id", supabaseUser.id).is("read_at", null);
      if (error) console.error("Failed to mark read:", error);
    }
  };
  const openThread = (peer) => {
    setThreads((s) => s.find((t) => t.id === peer.id) ? s : [{ id: peer.id, peer, lastReadAt: 0, myLastReadAt: Date.now() }, ...s]);
    return peer.id;
  };
  const ensureFromHandle = (handle) => {
    const existing = threads.find((t) => t.peer.handle === handle);
    if (existing) return existing.id;
    const c = creators.find((c2) => c2.handle === handle);
    if (c) {
      const peer = { id: c.id, name: c.name, handle: c.handle, avatar: c.avatar, verified: c.verified, online: false };
      setThreads((s) => [{ id: c.id, peer, lastReadAt: 0, myLastReadAt: Date.now() }, ...s]);
      return c.id;
    }
    if (supabaseUser) {
      const supabase2 = createBrowserClient();
      supabase2.from("profiles").select("id, public_profile_uid, display_name, username, avatar_url, verification_type").eq("username", handle).single().then(({ data }) => {
        if (data) {
          const p = data;
          const peer = {
            id: p.id,
            publicProfileUid: p.public_profile_uid || null,
            name: p.display_name || handle,
            handle: p.username || handle,
            avatar: p.avatar_url || "",
            verified: p.verification_type === "creator" ? "creator" : "user",
            online: false
          };
          setThreads((s) => {
            const filtered = s.filter((t) => t.id !== handle);
            return [{ id: peer.id, peer, lastReadAt: 0, myLastReadAt: Date.now() }, ...filtered];
          });
        }
      });
    }
    const tempPeer = { id: handle, name: handle, handle, avatar: "", online: false };
    setThreads((s) => [{ id: handle, peer: tempPeer, lastReadAt: 0, myLastReadAt: Date.now() }, ...s]);
    return handle;
  };
  const send = async (threadId, text) => {
    if (!text.trim()) return;
    if (!supabaseUser) {
      toast.error("Please sign in to send messages");
      return;
    }
    const localId = uid();
    const ts = Date.now();
    setMessages((s) => [...s, { id: localId, threadId, from: "me", text: text.trim(), ts, status: "sent" }]);
    if (isUUID(threadId)) {
      const supabase2 = createBrowserClient();
      const { data, error } = await supabase2.from("direct_messages").insert({
        sender_id: supabaseUser.id,
        recipient_id: threadId,
        body: text.trim(),
        message_type: "text"
      }).select("id").single();
      if (error) {
        console.error("Failed to send message:", error);
        toast.error("Failed to send message");
        setMessages((s) => s.filter((m) => m.id !== localId));
      } else if (data) {
        setMessages((s) => s.map((m) => m.id === localId ? { ...m, id: data.id, status: "delivered" } : m));
      }
    } else {
      setTimeout(() => setMessages((s) => s.map((m) => m.id === localId ? { ...m, status: "delivered" } : m)), 600);
      setTimeout(() => setMessages((s) => s.map((m) => m.id === localId ? { ...m, status: "read" } : m)), 1800);
    }
  };
  const sendGhost = (threadId, text, durationSecs, label) => {
    if (!supabaseUser) {
      toast.error("Please sign in to send messages");
      return;
    }
    const localId = uid();
    const ts = Date.now();
    const ghostExpiresAt = ts + durationSecs * 1e3;
    const body = text.trim() || `Ghost message · ${label}`;
    setMessages((s) => [...s, {
      id: localId,
      threadId,
      from: "me",
      text: body,
      ts,
      status: "sent",
      ghostExpiresAt,
      ghostLabel: label
    }]);
    if (isUUID(threadId)) {
      void (async () => {
        const supabase2 = createBrowserClient();
        const { data, error } = await supabase2.from("direct_messages").insert({
          sender_id: supabaseUser.id,
          recipient_id: threadId,
          body,
          message_type: "ghost",
          ghost_expires_at: new Date(ghostExpiresAt).toISOString(),
          ghost_label: label
        }).select("id").single();
        if (error) {
          console.error("Failed to send ghost message:", error);
          toast.error("Ghost message failed");
          setMessages((s) => s.filter((m) => m.id !== localId));
        } else if (data) {
          setMessages((s) => s.map((m) => m.id === localId ? { ...m, id: data.id, status: "delivered" } : m));
        }
      })();
    } else {
      setTimeout(() => setMessages((s) => s.map((m) => m.id === localId ? { ...m, status: "delivered" } : m)), 600);
    }
    toast.success(`Ghost message set to dissolve in ${label}`);
  };
  const sendMedia = async (threadId, file) => {
    if (!supabaseUser) {
      toast.error("Please sign in to send media");
      return;
    }
    const localId = uid();
    const ts = Date.now();
    const objectUrl = URL.createObjectURL(file);
    const mediaType = file.type.startsWith("video") ? "video" : "image";
    setMessages((s) => [...s, {
      id: localId,
      threadId,
      from: "me",
      text: "",
      ts,
      status: "sent",
      mediaUrl: objectUrl,
      mediaType
    }]);
    if (isUUID(threadId)) {
      try {
        const mediaPath = await uploadMessageMedia(supabaseUser.id, file, "media");
        const supabase2 = createBrowserClient();
        const { data, error } = await supabase2.from("direct_messages").insert({
          sender_id: supabaseUser.id,
          recipient_id: threadId,
          body: "",
          message_type: mediaType,
          media_url: mediaPath,
          media_type: mediaType
        }).select("id").single();
        if (error) throw error;
        setMessages((s) => s.map((m) => m.id === localId ? { ...m, id: data.id, status: "delivered" } : m));
      } catch (error) {
        console.error("Failed to send media:", error);
        toast.error("Media failed");
        setMessages((s) => s.filter((m) => m.id !== localId));
        return;
      }
    } else {
      setTimeout(() => setMessages((s) => s.map((m) => m.id === localId ? { ...m, status: "delivered" } : m)), 800);
    }
    toast.success(`${mediaType === "video" ? "Video" : "Image"} sent`);
  };
  const sendFwdGif = async (threadId, gif, text) => {
    if (!supabaseUser) {
      toast.error("Please sign in to send with FWD");
      return;
    }
    const localId = uid();
    const ts = Date.now();
    const displayText = text?.trim() || gif.title || "";
    setMessages((s) => [...s, {
      id: localId,
      threadId,
      from: "me",
      text: displayText,
      ts,
      status: "sent",
      mediaUrl: gif.url,
      mediaType: "image",
      isGif: true,
      gifFwdId: gif.gif_id || void 0,
      gifPosterUrl: gif.preview_url || void 0,
      gifTitle: gif.title || void 0
    }]);
    if (isUUID(threadId)) {
      try {
        const supabase2 = createBrowserClient();
        const { data, error } = await supabase2.from("direct_messages").insert({
          sender_id: supabaseUser.id,
          recipient_id: threadId,
          body: displayText || null,
          message_type: "gif",
          media_url: gif.url,
          media_type: "image",
          gif_fwd_id: gif.gif_id ?? null,
          gif_poster_url: gif.preview_url ?? null,
          gif_title: gif.title ?? null
        }).select("id").single();
        if (error) throw error;
        setMessages((s) => s.map((m) => m.id === localId ? { ...m, id: data.id, status: "delivered" } : m));
      } catch (err) {
        console.error("Failed to send FWD GIF:", err);
        toast.error("FWD GIF failed");
        setMessages((s) => s.filter((m) => m.id !== localId));
        return;
      }
    } else {
      setTimeout(() => setMessages((s) => s.map((m) => m.id === localId ? { ...m, status: "delivered" } : m)), 800);
    }
    toast.success("Sent with FWD");
  };
  const sendVoice = async (threadId, blob, durationSecs) => {
    if (!supabaseUser) {
      toast.error("Please sign in to send voice notes");
      return;
    }
    const localId = uid();
    const ts = Date.now();
    const voiceUrl = URL.createObjectURL(blob);
    const mins = Math.floor(durationSecs / 60);
    const secs = Math.floor(durationSecs % 60).toString().padStart(2, "0");
    const label = `Voice note · ${mins}:${secs}`;
    setMessages((s) => [...s, {
      id: localId,
      threadId,
      from: "me",
      text: label,
      ts,
      status: "sent",
      voiceUrl,
      voiceDuration: durationSecs
    }]);
    if (isUUID(threadId)) {
      try {
        const voicePath = await uploadMessageMedia(supabaseUser.id, blob, "voice");
        const supabase2 = createBrowserClient();
        const { data, error } = await supabase2.from("direct_messages").insert({
          sender_id: supabaseUser.id,
          recipient_id: threadId,
          body: label,
          message_type: "voice",
          media_url: voicePath,
          media_type: "audio",
          voice_duration: durationSecs
        }).select("id").single();
        if (error) throw error;
        setMessages((s) => s.map((m) => m.id === localId ? { ...m, id: data.id, status: "delivered" } : m));
      } catch (error) {
        console.error("Failed to send voice note:", error);
        toast.error("Voice note failed");
        setMessages((s) => s.filter((m) => m.id !== localId));
        return;
      }
    } else {
      setTimeout(() => setMessages((s) => s.map((m) => m.id === localId ? { ...m, status: "delivered" } : m)), 600);
    }
    toast.success("Voice note sent");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(C$3.Provider, { value: { threads: outThreads, messagesOf, unreadOf, totalUnread, send, sendGhost, sendMedia, sendFwdGif, sendVoice, openThread, markRead, ensureFromHandle }, children });
}
function useMessages() {
  const ctx = reactExports.useContext(C$3);
  if (!ctx) throw new Error("useMessages must be inside <MessagesProvider>");
  return ctx;
}
const KEY$2 = "treytv_guide_v1";
const empty = {
  saved: [],
  watchLater: [],
  reminders: [],
  mySchedule: [],
  watched: [],
  premiumUnlocked: [],
  progress: {}
};
const C$2 = reactExports.createContext(null);
const guideStateType = {
  saved: "saved",
  reminders: "reminder",
  mySchedule: "my_schedule",
  watched: "watched",
  premiumUnlocked: "premium_unlocked"
};
const arrayToggle = (arr, id) => arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
function GuideProvider({ children }) {
  const { user: supabaseUser } = useAuth();
  const currentUser2 = useCurrentUser();
  const [state, setState] = reactExports.useState(empty);
  const storageKey = `${KEY$2}:${currentUser2.uid}`;
  reactExports.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setState(raw ? { ...empty, ...JSON.parse(raw) } : empty);
    } catch {
      setState(empty);
    }
  }, [storageKey]);
  reactExports.useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
    }
  }, [state, storageKey]);
  reactExports.useEffect(() => {
    if (!supabaseUser) return;
    let cancelled = false;
    const load2 = async () => {
      try {
        const supabase2 = createBrowserClient();
        const [guideResult, laterResult, savedResult, progressResult] = await Promise.all([
          supabase2.from("user_guide_items").select("episode_id, state_type").eq("user_id", supabaseUser.id),
          supabase2.from("user_watch_later").select("episode_id").eq("user_id", supabaseUser.id),
          supabase2.from("user_saved_items").select("target_id").eq("user_id", supabaseUser.id).eq("target_type", "episode"),
          supabase2.from("user_video_progress").select("episode_id, progress_seconds, duration_seconds, progress_ratio, completed, updated_at, last_watched_at").eq("user_id", supabaseUser.id).order("last_watched_at", { ascending: false })
        ]);
        if (guideResult.error || laterResult.error || savedResult.error || progressResult.error) {
          throw guideResult.error || laterResult.error || savedResult.error || progressResult.error;
        }
        if (cancelled) return;
        const next = { ...empty, progress: {} };
        (guideResult.data ?? []).forEach((row) => {
          if (row.state_type === "saved") next.saved.push(row.episode_id);
          if (row.state_type === "reminder") next.reminders.push(row.episode_id);
          if (row.state_type === "my_schedule") next.mySchedule.push(row.episode_id);
          if (row.state_type === "watched") next.watched.push(row.episode_id);
          if (row.state_type === "premium_unlocked") next.premiumUnlocked.push(row.episode_id);
        });
        (laterResult.data ?? []).forEach((row) => next.watchLater.push(row.episode_id));
        (savedResult.data ?? []).forEach((row) => {
          if (!next.saved.includes(row.target_id)) next.saved.push(row.target_id);
        });
        (progressResult.data ?? []).forEach((row) => {
          next.progress[row.episode_id] = {
            episodeId: row.episode_id,
            progress: Number(row.progress_ratio ?? 0),
            progressSeconds: Number(row.progress_seconds ?? 0),
            durationSeconds: Number(row.duration_seconds ?? 0),
            completed: !!row.completed,
            updatedAt: new Date(row.last_watched_at ?? row.updated_at).getTime()
          };
          if (row.completed && !next.watched.includes(row.episode_id)) next.watched.push(row.episode_id);
        });
        setState(next);
      } catch (error) {
        console.error("Failed to load UID guide/watch state:", error);
      }
    };
    void load2();
    return () => {
      cancelled = true;
    };
  }, [supabaseUser?.id]);
  const persistToggle = async (key, id, active) => {
    if (!supabaseUser) return;
    const supabase2 = createBrowserClient();
    if (key === "watchLater") {
      const result = active ? await supabase2.from("user_watch_later").upsert({ user_id: supabaseUser.id, episode_id: id }, { onConflict: "user_id,episode_id" }) : await supabase2.from("user_watch_later").delete().eq("user_id", supabaseUser.id).eq("episode_id", id);
      if (result.error) throw result.error;
      return;
    }
    if (key === "saved") {
      const savedResult = active ? await supabase2.from("user_saved_items").upsert({ user_id: supabaseUser.id, target_type: "episode", target_id: id }, { onConflict: "user_id,target_type,target_id" }) : await supabase2.from("user_saved_items").delete().eq("user_id", supabaseUser.id).eq("target_type", "episode").eq("target_id", id);
      if (savedResult.error) throw savedResult.error;
    }
    const stateType = guideStateType[key];
    if (!stateType) return;
    const guideResult = active ? await supabase2.from("user_guide_items").upsert({ user_id: supabaseUser.id, episode_id: id, state_type: stateType }, { onConflict: "user_id,episode_id,state_type" }) : await supabase2.from("user_guide_items").delete().eq("user_id", supabaseUser.id).eq("episode_id", id).eq("state_type", stateType);
    if (guideResult.error) throw guideResult.error;
  };
  const value = reactExports.useMemo(() => {
    const continueWatching = Object.values(state.progress).filter((item) => !item.completed && item.progress > 0).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 12);
    const toggle = (key, id) => {
      const active = !state[key].includes(id);
      setState((s) => ({ ...s, [key]: arrayToggle(s[key], id) }));
      void persistToggle(key, id, active).catch((error) => console.error("Failed to persist guide item:", error));
    };
    const recordProgress = (input) => {
      const ratio = Math.min(1, Math.max(0, input.completed ? 1 : input.progress));
      const completed = input.completed || ratio >= 0.92;
      const item = {
        episodeId: input.episodeId,
        progress: ratio,
        progressSeconds: Math.max(0, Math.round(input.progressSeconds ?? ratio * (input.durationSeconds ?? 0))),
        durationSeconds: Math.max(0, Math.round(input.durationSeconds ?? 0)),
        completed,
        updatedAt: Date.now()
      };
      setState((s) => ({
        ...s,
        watched: completed && !s.watched.includes(input.episodeId) ? [...s.watched, input.episodeId] : s.watched,
        progress: { ...s.progress, [input.episodeId]: item }
      }));
      if (!supabaseUser) return;
      void (async () => {
        try {
          const supabase2 = createBrowserClient();
          const payload = {
            user_id: supabaseUser.id,
            episode_id: input.episodeId,
            show_id: input.showId ?? null,
            channel_id: input.channelId ?? null,
            progress_seconds: item.progressSeconds,
            duration_seconds: item.durationSeconds,
            progress_ratio: item.progress,
            completed,
            last_watched_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          const { error } = await supabase2.from("user_video_progress").upsert(payload, { onConflict: "user_id,episode_id" });
          if (error) throw error;
          await supabase2.from("user_watch_history").insert({
            user_id: supabaseUser.id,
            episode_id: input.episodeId,
            show_id: input.showId ?? null,
            channel_id: input.channelId ?? null,
            progress_seconds: item.progressSeconds,
            duration_seconds: item.durationSeconds,
            progress_ratio: item.progress,
            completed_at: completed ? (/* @__PURE__ */ new Date()).toISOString() : null
          });
          if (completed) {
            await persistToggle("watched", input.episodeId, true);
          }
        } catch (error) {
          console.error("Failed to persist watch progress:", error);
        }
      })();
    };
    return {
      ...state,
      continueWatching,
      toggle,
      has: (key, id) => state[key].includes(id),
      progressOf: (episodeId) => state.progress[episodeId] ?? null,
      recordProgress,
      markWatched: (episodeId) => recordProgress({ episodeId, progress: 1, completed: true })
    };
  }, [state, supabaseUser?.id]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(C$2.Provider, { value, children });
}
function useGuide() {
  const ctx = reactExports.useContext(C$2);
  if (!ctx) throw new Error("useGuide must be inside <GuideProvider>");
  return ctx;
}
const TIER_META = {
  regular: { label: "Regular Queue", price: 0, weight: 0, color: "text-foreground", ring: "border-white/15" },
  skip: { label: "Skip the Line", price: 5, weight: 1, color: "text-[oklch(0.82_0.15_215)]", ring: "ring-neon-cyan" },
  super: { label: "Super Skip", price: 10, weight: 2, color: "text-[oklch(0.7_0.25_340)]", ring: "ring-neon-magenta" },
  turbo: { label: "Turbo Skip", price: 15, weight: 3, color: "text-[oklch(0.82_0.16_85)]", ring: "ring-neon-gold" }
};
const KEY$1 = "treytv_music_review_v1";
const C$1 = reactExports.createContext(null);
function load() {
  try {
    const raw = localStorage.getItem(KEY$1);
    if (raw) return JSON.parse(raw);
  } catch {
  }
  return seed();
}
function seed() {
  const now2 = Date.now();
  return [
    { id: "demo-1", userUid: "demo", userName: "KaiWave", userEmail: "kai@trey.tv", title: "Midnight Bloom", artist: "KaiWave", genre: "R&B", notes: "Late-night cruise vibe", source: "drive", driveLink: "https://drive.google.com/file/d/x", tier: "turbo", paymentStatus: "verified", status: "now_playing", createdAt: now2 - 6e4, aiFirstImpression: { vibe: "Velvety after-hours R&B", strengths: ["Atmosphere", "Vocal texture"], hook: "Listen for the chorus drop at 1:12.", hypeScore: 8, predictedMood: "Reflective" } },
    { id: "demo-2", userUid: "demo", userName: "808 Saint", userEmail: "saint@trey.tv", title: "Pressure Cooker", artist: "808 Saint", genre: "Hip-Hop", notes: "Heavy 808s", source: "file", fileName: "pressure.mp3", tier: "super", paymentStatus: "verified", status: "queued", createdAt: now2 - 3e4 },
    { id: "demo-3", userUid: "demo", userName: "Lyric", userEmail: "lyric@trey.tv", title: "Glass House", artist: "Lyric", genre: "Pop", notes: "Anthemic", source: "file", fileName: "glass.wav", tier: "skip", paymentStatus: "verified", status: "queued", createdAt: now2 - 2e4 },
    { id: "demo-4", userUid: "demo", userName: "Verse", userEmail: "verse@trey.tv", title: "First Light", artist: "Verse", genre: "Indie", notes: "", source: "file", fileName: "first.mp3", tier: "regular", paymentStatus: "none", status: "queued", createdAt: now2 - 1e4 }
  ];
}
function rank(a, b) {
  if (a.status === "now_playing" && b.status !== "now_playing") return -1;
  if (b.status === "now_playing" && a.status !== "now_playing") return 1;
  const wa = TIER_META[a.tier].weight;
  const wb = TIER_META[b.tier].weight;
  if (wa !== wb) return wb - wa;
  return a.createdAt - b.createdAt;
}
function MusicReviewProvider({ children }) {
  const [submissions, setSubmissions] = reactExports.useState(() => typeof window !== "undefined" ? load() : []);
  reactExports.useEffect(() => {
    try {
      localStorage.setItem(KEY$1, JSON.stringify(submissions));
    } catch {
    }
  }, [submissions]);
  const value = reactExports.useMemo(() => ({
    submissions,
    add: (s) => {
      const sub = { ...s, id: crypto.randomUUID(), createdAt: Date.now(), status: "queued" };
      setSubmissions((prev) => [...prev, sub]);
      return sub;
    },
    update: (id, patch) => setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s)),
    remove: (id) => setSubmissions((prev) => prev.filter((s) => s.id !== id)),
    reorder: (ids) => setSubmissions((prev) => {
      const map = new Map(prev.map((s) => [s.id, s]));
      const ordered = ids.map((i) => map.get(i)).filter(Boolean);
      const rest = prev.filter((s) => !ids.includes(s.id));
      return [...ordered, ...rest];
    }),
    byId: (id) => submissions.find((s) => s.id === id),
    positionOf: (id) => {
      const live = [...submissions].filter((s) => s.status === "queued" || s.status === "now_playing").sort(rank);
      return live.findIndex((s) => s.id === id) + 1;
    },
    publicQueue: () => [...submissions].filter((s) => s.status === "queued" || s.status === "now_playing").sort(rank),
    topThree: () => submissions.filter((s) => s.topOfDay).slice(0, 3)
  }), [submissions]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(C$1.Provider, { value, children });
}
const DEFAULT_ACCENT = "#FFC857";
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
function useAccentColor(userId) {
  reactExports.useEffect(() => {
    let mounted = true;
    async function loadAccentColor() {
      try {
        const supabase2 = createBrowserClient();
        const { data: { user } } = await supabase2.auth.getUser();
        if (!user) {
          if (mounted) {
            applyAccentColor(DEFAULT_ACCENT);
          }
          return;
        }
        const { data, error } = await supabase2.from("profiles").select("profile_accent_color").eq("id", user.id).single();
        if (error || !data) {
          console.error("Error loading accent color:", error);
          if (mounted) {
            applyAccentColor(DEFAULT_ACCENT);
          }
          return;
        }
        const accentColor = data.profile_accent_color || DEFAULT_ACCENT;
        if (mounted) {
          applyAccentColor(accentColor);
        }
      } catch (error) {
        console.error("Error in useAccentColor:", error);
        if (mounted) {
          applyAccentColor(DEFAULT_ACCENT);
        }
      }
    }
    loadAccentColor();
    return () => {
      mounted = false;
    };
  }, [userId]);
}
function applyAccentColor(hexColor) {
  const safeHex = isValidHexColor(hexColor) ? hexColor : DEFAULT_ACCENT;
  const rgb = hexToRgb(safeHex) || { r: 255, g: 200, b: 87 };
  document.documentElement.style.setProperty("--profile-accent", safeHex);
  document.documentElement.style.setProperty("--profile-accent-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
}
function isValidHexColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}
const ACCENT_COLORS = [
  { id: "gold", label: "Gold", hex: "#FFC857" },
  { id: "magenta", label: "Magenta", hex: "#FF006E" },
  { id: "cyan", label: "Cyan", hex: "#00B4D8" },
  { id: "purple", label: "Purple", hex: "#9D4EDD" },
  { id: "red", label: "Red", hex: "#FF4D4D" },
  { id: "orange", label: "Orange", hex: "#FF8C42" },
  { id: "green", label: "Green", hex: "#06D6A0" },
  { id: "blue", label: "Blue", hex: "#118AB2" },
  { id: "pink", label: "Pink", hex: "#FF5D8F" },
  { id: "teal", label: "Teal", hex: "#2EC4B6" }
];
function CurrentUserSync() {
  const currentUser2 = useCurrentUser();
  const { user: lovableUser, updateUser } = useAuth$1();
  reactExports.useEffect(() => {
    if (!currentUser2?.uid || !lovableUser) return;
    if (lovableUser.uid !== currentUser2.uid || lovableUser.name !== currentUser2.name || lovableUser.handle !== currentUser2.handle || lovableUser.avatar !== currentUser2.avatar || lovableUser.banner !== currentUser2.banner || lovableUser.bio !== currentUser2.bio || lovableUser.location !== currentUser2.location || lovableUser.accent !== currentUser2.accent || lovableUser.verified !== currentUser2.verified || lovableUser.role !== currentUser2.role) {
      updateUser({
        uid: currentUser2.uid,
        name: currentUser2.name,
        handle: currentUser2.handle,
        avatar: currentUser2.avatar,
        banner: currentUser2.banner,
        bio: currentUser2.bio,
        location: currentUser2.location,
        accent: currentUser2.accent,
        verified: currentUser2.verified,
        role: currentUser2.role
      });
    }
    applyAccentColor(currentUser2.accent || "#FFC857");
  }, [currentUser2, lovableUser, updateUser]);
  return null;
}
function Coin({
  tier,
  size = 56,
  spinning = false,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      style: {
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        position: "relative",
        animation: spinning ? "gift-float 2.4s ease-in-out infinite" : void 0
      },
      className,
      "aria-hidden": true,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            style: {
              position: "absolute",
              inset: -size * 0.2,
              borderRadius: "9999px",
              background: `radial-gradient(circle, ${tier.glow}, transparent 65%)`,
              filter: "blur(6px)",
              opacity: 0.85
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            style: {
              position: "relative",
              zIndex: 1,
              fontSize: size * 0.78,
              lineHeight: 1,
              filter: `drop-shadow(0 4px 14px ${tier.glow})`
            },
            children: tier.symbol
          }
        )
      ]
    }
  );
}
let _emit = null;
function triggerCoinGift(tier, recipient) {
  _emit?.(tier, recipient);
}
function GiftBurstHost() {
  const [bursts, setBursts] = reactExports.useState([]);
  const [mounted, setMounted] = reactExports.useState(false);
  const idRef = reactExports.useRef(0);
  reactExports.useEffect(() => {
    setMounted(true);
    _emit = (tier, recipient) => {
      const id = ++idRef.current;
      setBursts((b) => [...b, { id, tier, recipient }]);
      window.setTimeout(() => {
        setBursts((b) => b.filter((x) => x.id !== id));
      }, 2800);
    };
    return () => {
      _emit = null;
    };
  }, []);
  if (!mounted || typeof document === "undefined") return null;
  return reactDomExports.createPortal(
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        "aria-live": "polite",
        style: {
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 99999,
          overflow: "hidden"
        },
        children: bursts.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(BurstLayer, { tier: b.tier, recipient: b.recipient }, b.id))
      }
    ),
    document.body
  );
}
function BurstLayer({ tier, recipient }) {
  const shower = reactExports.useRef(
    Array.from({ length: tier.shower }, (_, i) => ({
      cx: `${(Math.random() * 110 - 55).toFixed(1)}vw`,
      cx2: `${(Math.random() * 110 - 55).toFixed(1)}vw`,
      delay: Math.random() * 700,
      dur: 1600 + Math.random() * 1100,
      size: 18 + Math.random() * 26,
      rot: `${Math.random() * 720 - 360}deg`,
      glyph: tier.showerGlyphs[i % tier.showerGlyphs.length],
      key: i
    }))
  ).current;
  const sparkles = reactExports.useRef(
    Array.from({ length: tier.particles }, (_, i) => {
      const a = i / tier.particles * Math.PI * 2;
      const r = 90 + Math.random() * 80;
      return {
        sx: `${Math.cos(a) * r}px`,
        sy: `${Math.sin(a) * r}px`,
        delay: Math.random() * 250,
        size: 3 + Math.random() * 5,
        key: i
      };
    })
  ).current;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        style: {
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 45%, ${tier.glow}, transparent 60%)`,
          opacity: 0,
          animation: "fade-in 0.3s ease-out forwards, fade-out 0.7s ease-out 1.8s forwards",
          mixBlendMode: "screen"
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: {
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          animation: "coin-rise 2.5s cubic-bezier(0.2,0.8,0.2,1) forwards"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { animation: "gift-float 2.2s ease-in-out infinite" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Coin, { tier, size: 160 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              style: {
                marginTop: 14,
                textAlign: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                letterSpacing: "0.18em",
                fontSize: 13,
                color: "oklch(0.97 0.03 80)",
                textShadow: `0 0 18px ${tier.glow}`,
                textTransform: "uppercase"
              },
              children: [
                tier.name,
                recipient ? ` → @${recipient}` : ""
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              style: {
                marginTop: 4,
                textAlign: "center",
                fontSize: 11,
                color: "oklch(0.85 0.03 80 / 0.85)",
                fontStyle: "italic"
              },
              children: tier.blurb
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        style: {
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 140,
          height: 140,
          borderRadius: "9999px",
          border: `2px solid ${tier.glow}`,
          boxShadow: `0 0 50px ${tier.glow}`,
          animation: "ring-burst 1.4s cubic-bezier(0.2,0.8,0.2,1) forwards"
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        style: {
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 90,
          height: 90,
          borderRadius: "9999px",
          border: `1px solid ${tier.glow}`,
          animation: "ring-burst 1.9s cubic-bezier(0.2,0.8,0.2,1) 0.18s forwards",
          opacity: 0
        }
      }
    ),
    sparkles.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        style: {
          position: "absolute",
          left: "50%",
          top: "50%",
          width: s.size,
          height: s.size,
          borderRadius: "9999px",
          background: tier.accent,
          boxShadow: `0 0 14px ${tier.glow}`,
          ["--sx"]: s.sx,
          ["--sy"]: s.sy,
          animation: `sparkle-pop 1.2s cubic-bezier(0.2,0.8,0.2,1) ${s.delay}ms forwards`,
          opacity: 0
        }
      },
      s.key
    )),
    shower.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        style: {
          position: "absolute",
          left: "50%",
          top: 0,
          fontSize: c.size,
          lineHeight: 1,
          ["--cx"]: c.cx,
          ["--cx2"]: c.cx2,
          ["--cr"]: c.rot,
          animation: `coin-fall ${c.dur}ms cubic-bezier(0.4,0.05,0.3,1) ${c.delay}ms forwards`,
          opacity: 0,
          filter: `drop-shadow(0 0 8px ${tier.glow})`,
          willChange: "transform, opacity"
        },
        children: c.glyph
      },
      c.key
    ))
  ] });
}
const STORAGE_KEY = "treytv_splash_v1";
const RAY_STYLES = [
  { transform: "rotate(-40deg)" },
  { transform: "rotate(-25deg)", width: "1px", opacity: 0.6 },
  { transform: "rotate(-12deg)" },
  { transform: "rotate(0deg)", width: "3px", background: "linear-gradient(to bottom, rgba(255,210,60,0.22), transparent 50%)" },
  { transform: "rotate(12deg)" },
  { transform: "rotate(25deg)", width: "1px", opacity: 0.6 },
  { transform: "rotate(40deg)" }
];
function WelcomeSplash({ onDone }) {
  const [show, setShow] = reactExports.useState(true);
  const [animate, setAnimate] = reactExports.useState(false);
  const [dismissing, setDismissing] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen) {
      setShow(false);
      onDone();
    } else {
      setAnimate(true);
    }
  }, []);
  function handleNext() {
    setDismissing(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "1");
      setShow(false);
      onDone();
    }, 700);
  }
  if (!show) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: CSS }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `spl-root${animate ? " spl-animate" : ""}${dismissing ? " spl-out" : ""}`,
        role: "dialog",
        "aria-label": "Welcome to Trey TV",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spl-scan", "aria-hidden": "true" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spl-bg", "aria-hidden": "true" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spl-rays", "aria-hidden": "true", children: RAY_STYLES.map((style, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spl-ray", style }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "spl-stage", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spl-welcome-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spl-welcome-text", children: "Welcome to" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "spl-divider", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spl-div-line" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spl-div-diamond" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spl-div-line spl-right" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "spl-logo-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "spl-logo-trey", children: "Trey" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "spl-logo-tv", children: [
                "TV",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "spl-sparkles", "aria-hidden": "true", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "spl-sp spl-sp1" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "spl-sp spl-sp2" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "spl-sp spl-sp3" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "spl-sp spl-sp4" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spl-tagline-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spl-tagline", children: "Your world. Your channel." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "spl-gold-bar-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spl-gold-bar" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spl-bar-dot", "aria-hidden": "true" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "spl-next", onClick: handleNext, children: "Next →" })
        ]
      }
    )
  ] });
}
const CSS = `
/* ── Root overlay ───────────────────────────────────────────── */
.spl-root {
  position: fixed; inset: 0; z-index: 10100;
  background: #060606;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  font-family: 'Cinzel', serif;
  transition: opacity 0.7s ease;
}
.spl-out { opacity: 0 !important; pointer-events: none; }

/* ── Scan lines (always visible) ──────────────────────────── */
.spl-scan {
  position: absolute; inset: 0; z-index: 100; pointer-events: none;
  background: repeating-linear-gradient(
    0deg, transparent, transparent 3px,
    rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px
  );
}

/* ── Background glow (always animates) ──────────────────── */
.spl-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% 50%, rgba(160,110,10,0.12) 0%, transparent 65%),
    radial-gradient(ellipse 40% 30% at 30% 70%, rgba(80,80,100,0.08) 0%, transparent 60%),
    #060606;
  animation: splBgBreath 4s ease-in-out infinite;
}
@keyframes splBgBreath { 0%,100%{opacity:.7} 50%{opacity:1} }

/* ── Rays ───────────────────────────────────────────────── */
.spl-rays {
  position: absolute; inset: 0; pointer-events: none;
  display: flex; justify-content: center;
  opacity: 0;
}
.spl-ray {
  position: absolute; top: 0; left: 50%;
  width: 2px; height: 100vh;
  transform-origin: top center;
  background: linear-gradient(to bottom, rgba(220,170,30,0.18), transparent 60%);
}

/* ── Stage ──────────────────────────────────────────────── */
.spl-stage {
  position: relative; z-index: 10;
  display: flex; flex-direction: column; align-items: center;
}

/* ── Content — invisible until .spl-animate fires them ── */
.spl-welcome-wrap { overflow: hidden; margin-bottom: 8px; opacity: 0; }
.spl-welcome-text {
  font-family: 'Cinzel', serif;
  font-size: clamp(13px,2.2vw,18px); font-weight: 600;
  letter-spacing: 10px; text-transform: uppercase;
  color: rgba(210,180,80,0.85); text-align: center;
}

.spl-divider { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; opacity: 0; }
.spl-div-line {
  height: 1px; width: clamp(40px,8vw,80px);
  background: linear-gradient(to right, transparent, rgba(200,150,30,0.7));
}
.spl-div-line.spl-right { background: linear-gradient(to left, transparent, rgba(200,150,30,0.7)); }
.spl-div-diamond {
  width: 6px; height: 6px; background: #f0c040;
  transform: rotate(45deg); box-shadow: 0 0 8px rgba(240,192,64,0.8);
}

.spl-logo-row { display: flex; align-items: center; position: relative; opacity: 0; }
.spl-logo-trey {
  font-family: 'Cinzel Decorative', cursive;
  font-size: clamp(58px,10vw,96px); font-weight: 700; letter-spacing: -2px;
  background: linear-gradient(150deg,#d0d0d0 0%,#ffffff 18%,#a8a8a8 35%,#f5f5f5 50%,#888 65%,#e0e0e0 80%,#ffffff 100%);
  background-size: 250% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: drop-shadow(0 0 20px rgba(200,200,200,0.2));
}
.spl-logo-tv {
  font-family: 'Cinzel Decorative', cursive;
  font-size: clamp(58px,10vw,96px); font-weight: 700;
  background: linear-gradient(150deg,#b8720a 0%,#fce060 22%,#e0980a 42%,#fff0a0 58%,#c07808 75%,#f5d040 100%);
  background-size: 250% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: drop-shadow(0 0 24px rgba(220,170,30,0.55));
  position: relative;
}

.spl-sparkles {
  position: absolute; top: -14px; right: -22px;
  width: 38px; height: 38px; opacity: 0;
}
.spl-sp {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%,-50%); background: #fce45a; border-radius: 1px;
}
.spl-sp1 { width: 2px;   height: 32px; }
.spl-sp2 { width: 32px;  height: 2px; }
.spl-sp3 { width: 1.5px; height: 22px; transform: translate(-50%,-50%) rotate(45deg); background: rgba(252,228,90,0.7); }
.spl-sp4 { width: 22px;  height: 1.5px;transform: translate(-50%,-50%) rotate(45deg); background: rgba(252,228,90,0.7); }

.spl-tagline-wrap { margin-top: 22px; overflow: hidden; opacity: 0; }
.spl-tagline {
  font-family: 'Cinzel', serif;
  font-size: clamp(10px,1.6vw,13px); letter-spacing: 7px; text-transform: uppercase;
  color: rgba(200,170,70,0.6); text-align: center;
}

.spl-gold-bar-wrap {
  margin-top: 36px; width: clamp(200px,35vw,340px); height: 2px;
  background: rgba(255,255,255,0.06); border-radius: 2px; overflow: visible; position: relative;
  opacity: 0;
}
.spl-gold-bar {
  height: 100%; width: 0; border-radius: 2px;
  background: linear-gradient(90deg,#8a5500,#f5d060,#fffacc,#f0c040,#8a5500); background-size: 300% auto;
  box-shadow: 0 0 10px rgba(240,192,64,0.5), 0 0 30px rgba(240,192,64,0.2);
}
.spl-bar-dot {
  position: absolute; right: 0; top: 50%;
  width: 8px; height: 8px; transform: translate(50%,-50%);
  background: #fce060; border-radius: 50%;
  box-shadow: 0 0 12px 4px rgba(252,224,96,0.7);
  opacity: 0;
}

.spl-next {
  position: fixed; bottom: 28px; right: 28px;
  background: rgba(240,192,64,0.12); border: 1px solid rgba(240,192,64,0.35);
  color: rgba(240,192,64,0.8);
  font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
  padding: 10px 20px; cursor: pointer; border-radius: 2px; transition: all 0.3s;
  opacity: 0;
}
.spl-next:hover { background: rgba(240,192,64,0.22); color: #fce060; box-shadow: 0 0 20px rgba(240,192,64,0.2); }


/* ── Animations — only fire after .spl-animate is added ── */

.spl-root.spl-animate .spl-rays {
  animation: splRaysReveal 1.5s ease 2.2s forwards;
}
@keyframes splRaysReveal { to { opacity: 1; } }

.spl-root.spl-animate .spl-welcome-wrap {
  animation: splFadeSlideDown 0.9s cubic-bezier(0.16,1,0.3,1) 0.4s forwards;
}
@keyframes splFadeSlideDown { from{opacity:0;transform:translateY(-30px)} to{opacity:1;transform:translateY(0)} }

.spl-root.spl-animate .spl-divider {
  animation: splFadeIn 0.8s ease 1s forwards;
}

.spl-root.spl-animate .spl-logo-row {
  animation: splLogoBurst 1.1s cubic-bezier(0.16,1,0.3,1) 1.1s forwards;
}
@keyframes splLogoBurst {
  0%   { opacity:0; transform:scale(0.6); filter:blur(12px); }
  60%  { filter:blur(0); }
  100% { opacity:1; transform:scale(1); filter:blur(0); }
}

.spl-root.spl-animate .spl-logo-trey {
  animation: splSilverFlow 3s linear 2.2s infinite;
}
.spl-root.spl-animate .spl-logo-tv {
  animation: splGoldFlow 2.5s linear 2.2s infinite;
}
@keyframes splSilverFlow { 0%{background-position:0% center} 100%{background-position:250% center} }
@keyframes splGoldFlow   { 0%{background-position:0% center} 100%{background-position:250% center} }

.spl-root.spl-animate .spl-sparkles {
  animation: splFadeIn 0.5s ease 2.2s forwards;
}
.spl-root.spl-animate .spl-sp1 { animation: splSpPulse 2s ease-in-out 2.2s infinite; }
.spl-root.spl-animate .spl-sp2 { animation: splSpPulse 2s ease-in-out 2.2s infinite; }
.spl-root.spl-animate .spl-sp3 { animation: splSpPulse 2s ease-in-out 2.4s infinite; }
.spl-root.spl-animate .spl-sp4 { animation: splSpPulse 2s ease-in-out 2.4s infinite; }
@keyframes splSpPulse {
  0%,100% { opacity:.5; transform:translate(-50%,-50%) scaleY(0.7); }
  50%     { opacity:1;  transform:translate(-50%,-50%) scaleY(1); }
}

.spl-root.spl-animate .spl-tagline-wrap {
  animation: splFadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) 2s forwards;
}
@keyframes splFadeSlideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

.spl-root.spl-animate .spl-gold-bar-wrap {
  animation: splFadeIn 0.5s ease 2.4s forwards;
}
.spl-root.spl-animate .spl-gold-bar {
  animation: splBarGrow 1.2s cubic-bezier(0.4,0,0.2,1) 2.5s forwards,
             splBarShimmer 2s linear 3.7s infinite;
}
@keyframes splBarGrow    { from{width:0} to{width:100%} }
@keyframes splBarShimmer { 0%{background-position:0% center} 100%{background-position:300% center} }

.spl-root.spl-animate .spl-bar-dot {
  animation: splFadeIn 0.3s ease 3.6s forwards;
}

.spl-root.spl-animate .spl-next {
  animation: splFadeIn 1s ease 4s forwards;
}

@keyframes splFadeIn { to { opacity: 1; } }
`;
const C = reactExports.createContext(null);
const KEY = "treytv_follows_v1";
const PUBLIC_UID_RE = /^\d{10,}$/;
const SEED = creators.slice(0, 3).map((c, i) => ({
  id: c.id,
  name: c.name,
  handle: c.handle,
  avatar: c.avatar,
  followedAt: Date.now() - i * 864e5,
  watchScore: 100 - i * 20
}));
const isRealProfileId = (id) => PUBLIC_UID_RE.test(id);
function FollowProvider({ children }) {
  const [localFollowed, setLocalFollowed] = reactExports.useState(SEED);
  const [dbFollowed, setDbFollowed] = reactExports.useState(/* @__PURE__ */ new Map());
  const [ownPublicProfileUid, setOwnPublicProfileUid] = reactExports.useState(null);
  const { user: supabaseUser, isSignedIn } = useAuth();
  const currentProfile = useCurrentUser();
  const navigate = useNavigate();
  const storageKey = `${KEY}:${currentProfile.uid}`;
  reactExports.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setLocalFollowed(raw ? JSON.parse(raw) : SEED);
    } catch {
    }
  }, [storageKey]);
  reactExports.useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(localFollowed));
    } catch {
    }
  }, [localFollowed, storageKey]);
  reactExports.useEffect(() => {
    let cancelled = false;
    const loadDbFollows = async () => {
      if (!supabaseUser) {
        setDbFollowed(/* @__PURE__ */ new Map());
        setOwnPublicProfileUid(null);
        return;
      }
      try {
        const supabase2 = createBrowserClient();
        const [{ data: ownProfile }, { data, error }] = await Promise.all([
          supabase2.from("profiles").select("public_profile_uid").eq("id", supabaseUser.id).maybeSingle(),
          supabase2.from("follows").select(`
              following:profiles!follows_following_id_fkey(
                public_profile_uid,
                display_name,
                username,
                avatar_url
              )
            `).eq("follower_id", supabaseUser.id)
        ]);
        if (cancelled) return;
        setOwnPublicProfileUid(ownProfile?.public_profile_uid ?? null);
        if (error) {
          console.error("Failed to load follows:", error);
          setDbFollowed(/* @__PURE__ */ new Map());
          return;
        }
        const next = /* @__PURE__ */ new Map();
        (data ?? []).forEach((row) => {
          const profile = row.following;
          const handle = profile?.username;
          if (!profile || !handle) return;
          next.set(handle, {
            id: profile.public_profile_uid ?? handle,
            name: profile.display_name || handle,
            handle,
            avatar: profile.avatar_url || "",
            followedAt: Date.now(),
            watchScore: 0
          });
        });
        setDbFollowed(next);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to initialize follows:", error);
          setDbFollowed(/* @__PURE__ */ new Map());
          setOwnPublicProfileUid(null);
        }
      }
    };
    loadDbFollows();
    return () => {
      cancelled = true;
    };
  }, [supabaseUser]);
  const followed = reactExports.useMemo(() => {
    const merged = /* @__PURE__ */ new Map();
    dbFollowed.forEach((creator, handle) => merged.set(handle, creator));
    localFollowed.forEach((creator) => merged.set(creator.handle, creator));
    return [...merged.values()];
  }, [dbFollowed, localFollowed]);
  const isFollowing = (handle) => dbFollowed.has(handle) || localFollowed.some((f) => f.handle === handle);
  const toggle = (c) => {
    if (!isRealProfileId(c.id)) {
      setLocalFollowed((s) => {
        if (s.some((f) => f.handle === c.handle)) return s.filter((f) => f.handle !== c.handle);
        return [...s, { id: c.id, name: c.name, handle: c.handle, avatar: c.avatar, followedAt: Date.now(), watchScore: 10 }];
      });
      recordUserTrace({
        userUid: ownPublicProfileUid ?? "",
        action: isFollowing(c.handle) ? "social.unfollow" : "social.follow",
        targetType: "profile",
        targetId: c.id,
        details: { handle: c.handle }
      });
      return !isFollowing(c.handle);
    }
    if (!isSignedIn || !supabaseUser) {
      toast("Sign up to follow");
      navigate({ to: "/signup" });
      return false;
    }
    if (ownPublicProfileUid === c.id) {
      toast("You cannot follow yourself");
      return false;
    }
    const wasFollowing = isFollowing(c.handle);
    recordUserTrace({
      userUid: ownPublicProfileUid ?? "",
      action: wasFollowing ? "social.unfollow" : "social.follow",
      targetType: "profile",
      targetId: c.id,
      details: { handle: c.handle }
    });
    const optimisticCreator = {
      id: c.id,
      name: c.name,
      handle: c.handle,
      avatar: c.avatar,
      followedAt: Date.now(),
      watchScore: 0
    };
    const rollbackOptimistic = () => {
      setDbFollowed((prev) => {
        const next = new Map(prev);
        if (wasFollowing) next.set(c.handle, optimisticCreator);
        else next.delete(c.handle);
        return next;
      });
    };
    setDbFollowed((prev) => {
      const next = new Map(prev);
      if (wasFollowing) next.delete(c.handle);
      else next.set(c.handle, optimisticCreator);
      return next;
    });
    void (async () => {
      try {
        const supabase2 = createBrowserClient();
        const { data: profile, error: profileError } = await supabase2.from("profiles").select("id").eq("public_profile_uid", c.id).maybeSingle();
        if (profileError) throw profileError;
        const followingId = profile?.id;
        if (!followingId) throw new Error("Follow target profile was not found.");
        if (followingId === supabaseUser.id) {
          rollbackOptimistic();
          toast("You cannot follow yourself");
          return;
        }
        const followRow = { follower_id: supabaseUser.id, following_id: followingId };
        const { error } = wasFollowing ? await supabase2.from("follows").delete().eq("follower_id", supabaseUser.id).eq("following_id", followingId) : await supabase2.from("follows").insert(followRow);
        if (error) throw error;
      } catch (error) {
        console.error("Failed to update follow:", error);
        rollbackOptimistic();
        toast.error("Follow failed");
      }
    })();
    return !wasFollowing;
  };
  const bumpWatch = (handle) => setLocalFollowed((s) => s.map((f) => f.handle === handle ? { ...f, watchScore: f.watchScore + 5 } : f));
  const topThree = reactExports.useMemo(
    () => [...followed].sort((a, b) => b.watchScore - a.watchScore).slice(0, 3),
    [followed]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(C.Provider, { value: { followed, isFollowing, toggle, bumpWatch, topThree }, children });
}
function useFollow() {
  const ctx = reactExports.useContext(C);
  if (!ctx) throw new Error("useFollow must be inside <FollowProvider>");
  return ctx;
}
const appCss = "/assets/styles-DPeoDI_P.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-[100svh] items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-[100svh] items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$1I = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "theme-color", content: "#05070D" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Trey TV" },
      { name: "description", content: "Trey TV — the premium creator entertainment platform for shows, seasons, and episodes." },
      { name: "author", content: "Trey TV" },
      { property: "og:title", content: "Trey TV" },
      { property: "og:description", content: "Trey TV — the premium creator entertainment platform for shows, seasons, and episodes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@TreyTV" },
      { name: "twitter:title", content: "Trey TV" },
      { name: "twitter:description", content: "Trey TV — the premium creator entertainment platform for shows, seasons, and episodes." },
      { property: "og:image", content: "/trey-tv-seo-logo.png" },
      { name: "twitter:image", content: "/trey-tv-seo-logo.png" }
    ],
    links: [
      { rel: "icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Cinzel:wght@400;600;900&family=Raleway:wght@300;400;500&display=swap"
      },
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("head", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("script", { async: true, src: "https://www.googletagmanager.com/gtag/js?id=G-QV9ZERGNP4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "script",
        {
          dangerouslySetInnerHTML: {
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-QV9ZERGNP4');
            `
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$1I.useRouteContext();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const showWelcomeSplash = pathname === "/";
  const isImmersivePrescribeMe = pathname.startsWith("/prescribe-me");
  const isImmersiveGameRoom = pathname.startsWith("/games");
  const isFocusedAuthSurface = pathname.startsWith("/oauth/consent");
  const hideGlobalMobileChrome = isImmersivePrescribeMe || isImmersiveGameRoom || isFocusedAuthSurface;
  useAccentColor();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SupabaseSessionProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuthProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FollowProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CurrentUserSync, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ActivityProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SubmissionsProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeedProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CommentsProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessagesProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(GuideProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MusicReviewProvider, { children: [
      showWelcomeSplash && /* @__PURE__ */ jsxRuntimeExports.jsx(WelcomeSplash, { onDone: () => void 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AuthGuard, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) }),
      !hideGlobalMobileChrome && /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, {}),
      !hideGlobalMobileChrome && /* @__PURE__ */ jsxRuntimeExports.jsx(TreyIWidget, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(GiftBurstHost, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, {})
    ] }) }) }) }) }) }) })
  ] }) }) }) });
}
function AuthGuard({ children }) {
  const { user, isGuest } = useAuth$1();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    let cancelled = false;
    const checkOnboarding = async () => {
      const publicRoutes = [
        "/login",
        "/signup",
        "/auth/callback",
        "/confirm-email",
        "/onboarding",
        "/legal",
        "/developers",
        "/api",
        "/.well-known"
      ];
      const isPublicRoute = publicRoutes.some(
        (route) => location.pathname === route || location.pathname.startsWith(route + "/")
      );
      if (isGuest) {
        const guestAllowed = ["/", "/explore", "/guide", "/explore/"];
        const isAllowedGuestPage = guestAllowed.some(
          (route) => location.pathname === route || route !== "/" && location.pathname.startsWith(route)
        );
        if (!isPublicRoute && !isAllowedGuestPage) {
          sessionStorage.setItem("treytv_post_auth_redirect", location.pathname + location.search);
          navigate({ to: "/login" });
        }
        if (!cancelled) setLoading(false);
        return;
      }
      if (user) {
        const supabase2 = createBrowserClient();
        const { data: profile } = await supabase2.from("profiles").select("onboarding_completed").eq("id", user.uid).maybeSingle();
        if (cancelled) return;
        const isOnboardingCompleted = profile?.onboarding_completed ?? user.onboarding_completed ?? false;
        if (!isOnboardingCompleted) {
          const onboardingRoutes = [
            "/onboarding",
            "/auth/callback",
            "/login",
            "/signup",
            "/legal",
            "/confirm-email"
          ];
          const isOnboardingRoute = onboardingRoutes.some(
            (route) => location.pathname === route || location.pathname.startsWith(route + "/")
          );
          if (!isOnboardingRoute) {
            sessionStorage.setItem("treytv_post_onboarding_redirect", location.pathname + location.search);
            const { data: onboarding } = await supabase2.from("user_onboarding").select("selected_path, current_step").eq("user_id", user.uid).maybeSingle();
            if (onboarding && !onboarding.completed && onboarding.selected_path) {
              let targetPath = "/onboarding";
              if (onboarding.selected_path === "manual") {
                targetPath = "/onboarding/manual";
              } else if (onboarding.selected_path === "voice" || onboarding.selected_path === "trey_i") {
                targetPath = "/onboarding/voice";
              } else if (onboarding.selected_path === "import_screenshot") {
                targetPath = "/onboarding/import-screenshot";
              }
              navigate({ to: targetPath });
            } else {
              navigate({ to: "/onboarding" });
            }
          }
        } else {
          if (location.pathname.startsWith("/onboarding")) {
            const redirect = sessionStorage.getItem("treytv_post_onboarding_redirect");
            if (redirect) {
              sessionStorage.removeItem("treytv_post_onboarding_redirect");
              window.location.href = redirect;
            } else {
              navigate({ to: "/" });
            }
          }
        }
      }
      if (!cancelled) setLoading(false);
    };
    checkOnboarding();
    return () => {
      cancelled = true;
    };
  }, [user, isGuest, location.pathname, navigate]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-[#05070D] text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-white/10 bg-[#05070D]/95 px-10 py-8 text-center space-y-3 shadow-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Checking authorization…" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
}
const $$splitComponentImporter$1H = () => import("../_index_-DoH9cjl7.mjs");
const Route$1H = createFileRoute("/index")({
  component: lazyRouteComponent($$splitComponentImporter$1H, "component")
});
const $$splitComponentImporter$1G = () => import("./signup-BIsVAx1u.mjs");
const Route$1G = createFileRoute("/signup")({
  component: lazyRouteComponent($$splitComponentImporter$1G, "component"),
  head: () => ({
    meta: [{
      title: "Sign Up — Trey TV"
    }, {
      name: "description",
      content: "Create your free Trey TV account and start building your universe."
    }]
  })
});
const $$splitComponentImporter$1F = () => import("./settings-AurCUMx1.mjs");
const Route$1F = createFileRoute("/settings")({
  component: lazyRouteComponent($$splitComponentImporter$1F, "component"),
  head: () => ({
    meta: [{
      title: "Settings — Trey TV"
    }, {
      name: "description",
      content: "Manage your Trey TV account, appearance, notifications and privacy."
    }]
  })
});
const $$splitComponentImporter$1E = () => import("./rewards-BKTS20Ix.mjs");
const Route$1E = createFileRoute("/rewards")({
  component: lazyRouteComponent($$splitComponentImporter$1E, "component"),
  head: () => ({
    meta: [{
      title: "Rewards — Trey TV"
    }, {
      name: "description",
      content: "Track Trey TV reward points, gift creators, redeem subscriptions and perks."
    }]
  })
});
const $$splitComponentImporter$1D = () => import("./prescribe-me-Hzg6wao3.mjs");
const Route$1D = createFileRoute("/prescribe-me")({
  component: lazyRouteComponent($$splitComponentImporter$1D, "component"),
  head: () => ({
    meta: [{
      title: "Prescribe Me - Trey TV"
    }, {
      name: "description",
      content: "Tell Trey-I your vibe and get the perfect creators and content prescribed just for you."
    }]
  })
});
const $$splitComponentImporter$1C = () => import("./premium-2k1TxTCA.mjs");
const Route$1C = createFileRoute("/premium")({
  component: lazyRouteComponent($$splitComponentImporter$1C, "component"),
  head: () => ({
    meta: [{
      title: "Trey TV Premium — Unlock Everything"
    }, {
      name: "description",
      content: "Exclusive creator tools, AI insights and ad-free viewing on Trey TV Premium."
    }]
  })
});
const $$splitComponentImporter$1B = () => import("./onboarding-Bzs2XaMr.mjs");
const Route$1B = createFileRoute("/onboarding")({
  component: lazyRouteComponent($$splitComponentImporter$1B, "component"),
  head: () => ({
    meta: [{
      title: "Welcome to Trey TV"
    }, {
      name: "description",
      content: "Choose your path into the Trey TV universe — voice setup with Trey-I or manual signup."
    }]
  })
});
const $$splitComponentImporter$1A = () => import("./notifications-t9A3DO-1.mjs");
const Route$1A = createFileRoute("/notifications")({
  component: lazyRouteComponent($$splitComponentImporter$1A, "component"),
  head: () => ({
    meta: [{
      title: "Notifications — Trey TV"
    }]
  })
});
const $$splitComponentImporter$1z = () => import("./music-review-s8LjBk3u.mjs");
const Route$1z = createFileRoute("/music-review")({
  component: lazyRouteComponent($$splitComponentImporter$1z, "component"),
  head: () => ({
    meta: [{
      title: "Live Music Review - Trey TV"
    }, {
      name: "description",
      content: "Submit, queue, skip the line, and join Trey TV live music review."
    }]
  })
});
const $$splitComponentImporter$1y = () => import("./login-CMDW9ZXm.mjs");
const Route$1y = createFileRoute("/login")({
  component: lazyRouteComponent($$splitComponentImporter$1y, "component"),
  head: () => ({
    meta: [{
      title: "Log In — Trey TV"
    }, {
      name: "description",
      content: "Log in to your Trey TV account."
    }]
  })
});
function CinematicBackdrop() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "aria-hidden": true, className: "absolute inset-0 pointer-events-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-32 left-1/2 -translate-x-1/2 size-[70vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.4),oklch(0.7_0.25_340_/_0.35),oklch(0.65_0.22_300_/_0.4),oklch(0.82_0.15_215_/_0.35))] blur-3xl opacity-60 animate-conic-spin" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-background to-transparent" })
  ] });
}
function GoogleIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "size-4", viewBox: "0 0 48 48", "aria-hidden": true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#EA4335", d: "M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#4285F4", d: "M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#FBBC05", d: "M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#34A853", d: "M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" })
  ] });
}
const $$splitComponentImporter$1x = () => import("./latest-CKNbsGN7.mjs");
const Route$1x = createFileRoute("/latest")({
  component: lazyRouteComponent($$splitComponentImporter$1x, "component"),
  head: () => ({
    meta: [{
      title: "Latest — Trey TV"
    }]
  })
});
const $$splitComponentImporter$1w = () => import("./inbox-DMGeqmGM.mjs");
const Route$1w = createFileRoute("/inbox")({
  component: lazyRouteComponent($$splitComponentImporter$1w, "component"),
  validateSearch: (s) => objectType({
    to: stringType().optional()
  }).parse(s),
  head: () => ({
    meta: [{
      title: "Inbox - Trey TV"
    }, {
      name: "description",
      content: "Premium TreyTV creator-network inbox for DMs, requests, AI assist, voice notes, and collaborations."
    }]
  })
});
const $$splitComponentImporter$1v = () => import("./guide-a_5LNNn4.mjs");
const Route$1v = createFileRoute("/guide")({
  component: lazyRouteComponent($$splitComponentImporter$1v, "component"),
  head: () => ({
    meta: [{
      title: "Guide · Trey TV"
    }, {
      name: "description",
      content: "The Trey TV Guide — every channel, every show, every time slot."
    }]
  })
});
const $$splitComponentImporter$1u = () => import("./go-live-CFwnsKkc.mjs");
const Route$1u = createFileRoute("/go-live")({
  component: lazyRouteComponent($$splitComponentImporter$1u, "component"),
  head: () => ({
    meta: [{
      title: "Go Live — Trey TV"
    }]
  })
});
const $$splitComponentImporter$1t = () => import("./games-BFsOu0JM.mjs");
const Route$1t = createFileRoute("/games")({
  component: lazyRouteComponent($$splitComponentImporter$1t, "component"),
  head: () => ({
    meta: [{
      title: "Games · Trey TV"
    }, {
      name: "description",
      content: "Trey TV Gaming Lounge — Spades, Blackjack, Bullshit, and more coming soon."
    }]
  })
});
const $$splitComponentImporter$1s = () => import("./for-you-Bvh5kTng.mjs");
const Route$1s = createFileRoute("/for-you")({
  component: lazyRouteComponent($$splitComponentImporter$1s, "component"),
  head: () => ({
    meta: [{
      title: "For You · Trey TV"
    }, {
      name: "description",
      content: "Your personalized creator feed on Trey TV."
    }]
  })
});
const $$splitComponentImporter$1r = () => import("./following-Bq07MCo8.mjs");
const Route$1r = createFileRoute("/following")({
  component: lazyRouteComponent($$splitComponentImporter$1r, "component"),
  head: () => ({
    meta: [{
      title: "Following — Trey TV"
    }]
  })
});
const $$splitComponentImporter$1q = () => import("./explore-Dxfco6MY.mjs");
const Route$1q = createFileRoute("/explore")({
  component: lazyRouteComponent($$splitComponentImporter$1q, "component"),
  head: () => ({
    meta: [{
      title: "Explore — Trey TV"
    }, {
      name: "description",
      content: "Discover trending creators, shows, and channels on Trey TV."
    }]
  })
});
const $$splitComponentImporter$1p = () => import("./edit-profile-Bbj_3cFD.mjs");
const Route$1p = createFileRoute("/edit-profile")({
  component: lazyRouteComponent($$splitComponentImporter$1p, "component"),
  head: () => ({
    meta: [{
      title: "Edit Profile - Trey TV"
    }, {
      name: "description",
      content: "Edit your Trey TV profile: name, handle, bio, avatar, banner, accent."
    }]
  })
});
const $$splitComponentImporter$1o = () => import("./download-tv-app-DeQqz2PS.mjs");
const Route$1o = createFileRoute("/download-tv-app")({
  component: lazyRouteComponent($$splitComponentImporter$1o, "component"),
  head: () => ({
    meta: [{
      title: "Download TV App - Trey TV"
    }, {
      name: "description",
      content: "Download the Trey TV Android TV test build for owner/internal device testing."
    }]
  })
});
const $$splitComponentImporter$1n = () => import("./developers-B6NOHYkx.mjs");
const Route$1n = createFileRoute("/developers")({
  component: lazyRouteComponent($$splitComponentImporter$1n, "component"),
  head: () => ({
    meta: [{
      title: "Trey TV Developers"
    }, {
      name: "description",
      content: "Create apps, generate credentials, and connect Trey TV identity to your own projects."
    }]
  })
});
const $$splitComponentImporter$1m = () => import("./creator-studio-BFsOu0JM.mjs");
const Route$1m = createFileRoute("/creator-studio")({
  component: lazyRouteComponent($$splitComponentImporter$1m, "component")
});
const $$splitComponentImporter$1l = () => import("./creator-hub-5LNJJK1W.mjs");
const Route$1l = createFileRoute("/creator-hub")({
  component: lazyRouteComponent($$splitComponentImporter$1l, "component"),
  head: () => ({
    meta: [{
      title: "Creator Hub — Trey TV"
    }, {
      name: "description",
      content: "Manage your channel, shows, episodes and audience on Trey TV."
    }]
  })
});
const $$splitComponentImporter$1k = () => import("./create-rRXf0E_Z.mjs");
const Route$1k = createFileRoute("/create")({
  component: lazyRouteComponent($$splitComponentImporter$1k, "component"),
  head: () => ({
    meta: [{
      title: "Create — Trey TV"
    }]
  })
});
const $$splitComponentImporter$1j = () => import("./confirm-email--vx_uvJk.mjs");
const Route$1j = createFileRoute("/confirm-email")({
  component: lazyRouteComponent($$splitComponentImporter$1j, "component"),
  validateSearch: objectType({
    email: stringType().optional()
  }).parse,
  head: () => ({
    meta: [{
      title: "Confirm Your Email — Trey TV"
    }, {
      name: "description",
      content: "Check your inbox to confirm your Trey TV account."
    }]
  })
});
const $$splitComponentImporter$1i = () => import("./collections-DBqItSH6.mjs");
const Route$1i = createFileRoute("/collections")({
  component: lazyRouteComponent($$splitComponentImporter$1i, "component"),
  head: () => ({
    meta: [{
      title: "Collections — Trey TV"
    }]
  })
});
const $$splitComponentImporter$1h = () => import("./apply-v6e_3IPh.mjs");
const Route$1h = createFileRoute("/apply")({
  component: lazyRouteComponent($$splitComponentImporter$1h, "component"),
  head: () => ({
    meta: [{
      title: "Choose Your Trey TV Path"
    }, {
      name: "description",
      content: "Apply to create a channel or request Go verification on Trey TV."
    }]
  })
});
const $$splitComponentImporter$1g = () => import("./applications-DfTFLTD7.mjs");
const Route$1g = createFileRoute("/applications")({
  component: lazyRouteComponent($$splitComponentImporter$1g, "component"),
  head: () => ({
    meta: [{
      title: "My Applications — Trey TV"
    }]
  })
});
const $$splitComponentImporter$1f = () => import("./analytics-gfwNmA7L.mjs");
const Route$1f = createFileRoute("/analytics")({
  component: lazyRouteComponent($$splitComponentImporter$1f, "component"),
  head: () => ({
    meta: [{
      title: "Analytics — Trey TV"
    }, {
      name: "description",
      content: "Track watch time, growth, audience and revenue across your Trey TV channel."
    }]
  })
});
const $$splitComponentImporter$1e = () => import("./admin-DIrTDHjC.mjs");
const Route$1e = createFileRoute("/admin")({
  component: lazyRouteComponent($$splitComponentImporter$1e, "component"),
  head: () => ({
    meta: [{
      title: "Admin Command Center — Trey TV"
    }, {
      name: "description",
      content: "Owner Admin command center for Trey TV."
    }]
  })
});
const $$splitComponentImporter$1d = () => import("./activity-BAa2sZeo.mjs");
const Route$1d = createFileRoute("/activity")({
  component: lazyRouteComponent($$splitComponentImporter$1d, "component"),
  head: () => ({
    meta: [{
      title: "My Activity — Trey TV"
    }, {
      name: "description",
      content: "Your interaction history: bookmarks, reactions, shares."
    }]
  })
});
const $$splitComponentImporter$1c = () => import("./about-BaNNJVqN.mjs");
const Route$1c = createFileRoute("/about")({
  component: lazyRouteComponent($$splitComponentImporter$1c, "component"),
  head: () => ({
    meta: [{
      title: "About Trey TV"
    }, {
      name: "description",
      content: "Trey TV is a creator-first entertainment platform for shows, episodes, live moments, recommendations, and rewards."
    }, {
      property: "og:title",
      content: "About Trey TV"
    }, {
      property: "og:description",
      content: "Creator-first entertainment, built for the people who watch and the people who make."
    }]
  })
});
const $$splitComponentImporter$1b = () => import("./index-BeQXYyHz.mjs");
const Route$1b = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$1b, "component"),
  head: () => ({
    meta: [{
      title: "Watch Now · Trey TV"
    }, {
      name: "description",
      content: "Trey TV — the creator television network. Watch shows, follow creators, and tune into the live guide."
    }, {
      property: "og:title",
      content: "Trey TV — Watch Now"
    }, {
      property: "og:description",
      content: "The creator television network. Stream shows, channels, and original series."
    }]
  })
});
const $$splitComponentImporter$1a = () => import("./legal.index-Dz662nOk.mjs");
const Route$1a = createFileRoute("/legal/")({
  component: lazyRouteComponent($$splitComponentImporter$1a, "component"),
  head: () => ({
    meta: [{
      title: "Legal & Safety — Trey TV"
    }, {
      name: "description",
      content: "Trey TV's legal and safety center: terms, privacy, community guidelines, content policy, and more."
    }, {
      property: "og:title",
      content: "Legal & Safety — Trey TV"
    }, {
      property: "og:description",
      content: "Trey TV's trust and safety center."
    }]
  })
});
const $$splitComponentImporter$19 = () => import("./games.index-BbZ3jDTQ.mjs");
const Route$19 = createFileRoute("/games/")({
  component: lazyRouteComponent($$splitComponentImporter$19, "component"),
  head: () => ({
    meta: [{
      title: "Games · Trey TV"
    }, {
      name: "description",
      content: "Trey TV Gaming Lounge — Spades, Blackjack, Bullshit, and more coming soon."
    }]
  })
});
const $$splitComponentImporter$18 = () => import("./creator-studio.index-CSIhcysi.mjs");
const Route$18 = createFileRoute("/creator-studio/")({
  component: lazyRouteComponent($$splitComponentImporter$18, "component"),
  head: () => ({
    meta: [{
      title: "Creator Studio — Trey TV"
    }, {
      name: "description",
      content: "Your premium creator command center: upload, edit, analyze, and grow your channel on Trey TV."
    }]
  })
});
const $$splitComponentImporter$17 = () => import("./watch._id-AQNmJMTP.mjs");
const Route$17 = createFileRoute("/watch/$id")({
  component: lazyRouteComponent($$splitComponentImporter$17, "component"),
  head: () => ({
    meta: [{
      title: "Watch — Trey TV"
    }]
  })
});
const $$splitComponentImporter$16 = () => import("./watch-party._id-B7JnU29M.mjs");
const Route$16 = createFileRoute("/watch-party/$id")({
  validateSearch: (search) => ({
    join: typeof search.join === "string" ? search.join : void 0
  }),
  component: lazyRouteComponent($$splitComponentImporter$16, "component"),
  head: () => ({
    meta: [{
      title: "Watch Party · Trey TV"
    }]
  })
});
const $$splitComponentImporter$15 = () => import("./u._uid-Bq0cb5rZ.mjs");
const Route$15 = createFileRoute("/u/$uid")({
  component: lazyRouteComponent($$splitComponentImporter$15, "component"),
  head: ({
    params
  }) => ({
    meta: [{
      title: `Profile (@${params.uid}) — Trey TV`
    }, {
      name: "description",
      content: `Public profile on Trey TV. UID ${params.uid}.`
    }]
  })
});
const $$splitComponentImporter$14 = () => import("./tv.activate-YYC3tZiq.mjs");
const Route$14 = createFileRoute("/tv/activate")({
  component: lazyRouteComponent($$splitComponentImporter$14, "component"),
  head: () => ({
    meta: [{
      title: "Activate Trey TV - TV App"
    }, {
      name: "description",
      content: "Link your Trey TV account to an Android TV, Google TV, Chromecast, or Fire TV device."
    }]
  })
});
const $$splitComponentImporter$13 = () => import("./settings.verification-DLebAkmz.mjs");
const Route$13 = createFileRoute("/settings/verification")({
  component: lazyRouteComponent($$splitComponentImporter$13, "component"),
  head: () => ({
    meta: [{
      title: "Apply for Gold Verification — Trey TV"
    }]
  })
});
const $$splitComponentImporter$12 = () => import("./settings.connected-apps-BNonIgYg.mjs");
const Route$12 = createFileRoute("/settings/connected-apps")({
  component: lazyRouteComponent($$splitComponentImporter$12, "component"),
  head: () => ({
    meta: [{
      title: "Connected Apps — Trey TV"
    }, {
      name: "description",
      content: "Review and revoke apps connected to your Trey TV account."
    }]
  })
});
const $$splitComponentImporter$11 = () => import("./onboarding.voice-DZVSiAjq.mjs");
const Route$11 = createFileRoute("/onboarding/voice")({
  component: lazyRouteComponent($$splitComponentImporter$11, "component"),
  head: () => ({
    meta: [{
      title: "Build your profile with Trey-I — Trey TV"
    }, {
      name: "description",
      content: "Premium voice setup with Trey-I. Cinematic, fast, beautifully guided."
    }]
  })
});
const $$splitComponentImporter$10 = () => import("./onboarding.manual-BBLf2haT.mjs");
const Route$10 = createFileRoute("/onboarding/manual")({
  component: lazyRouteComponent($$splitComponentImporter$10, "component"),
  head: () => ({
    meta: [{
      title: "Set up your profile — Trey TV"
    }, {
      name: "description",
      content: "Build your Trey TV profile step by step."
    }]
  })
});
const $$splitComponentImporter$$ = () => import("./onboarding.import-screenshot-k2lDq1tf.mjs");
const Route$$ = createFileRoute("/onboarding/import-screenshot")({
  component: lazyRouteComponent($$splitComponentImporter$$, "component"),
  head: () => ({
    meta: [{
      title: "Import From Screenshot — Trey TV"
    }, {
      name: "description",
      content: "Upload a screenshot of your public profile and Trey TV will turn it into a draft you can edit before it goes live."
    }]
  })
});
const $$splitComponentImporter$_ = () => import("./oauth.userinfo-D6vrmZEn.mjs");
const Route$_ = createFileRoute("/oauth/userinfo")({
  component: lazyRouteComponent($$splitComponentImporter$_, "component"),
  head: () => ({
    meta: [{
      title: "OAuth UserInfo Endpoint — Trey TV"
    }]
  })
});
const $$splitComponentImporter$Z = () => import("./oauth.token-CeEbR7sz.mjs");
const Route$Z = createFileRoute("/oauth/token")({
  component: lazyRouteComponent($$splitComponentImporter$Z, "component"),
  head: () => ({
    meta: [{
      title: "OAuth Token Endpoint — Trey TV"
    }]
  })
});
const $$splitComponentImporter$Y = () => import("./oauth.revoke-pmIeD5sC.mjs");
const Route$Y = createFileRoute("/oauth/revoke")({
  component: lazyRouteComponent($$splitComponentImporter$Y, "component"),
  head: () => ({
    meta: [{
      title: "OAuth Revoke Endpoint — Trey TV"
    }]
  })
});
const $$splitComponentImporter$X = () => import("./oauth.consent-D3b1zCT8.mjs");
const Route$X = createFileRoute("/oauth/consent")({
  component: lazyRouteComponent($$splitComponentImporter$X, "component"),
  head: () => ({
    meta: [{
      title: "Authorize FWD - Trey TV"
    }, {
      name: "description",
      content: "Approve sign-in access for FWD using your Trey TV account."
    }]
  })
});
const $$splitComponentImporter$W = () => import("./oauth.authorize--ZCdO7bh.mjs");
const Route$W = createFileRoute("/oauth/authorize")({
  component: lazyRouteComponent($$splitComponentImporter$W, "component"),
  head: () => ({
    meta: [{
      title: "Authorize App — Trey TV"
    }, {
      name: "description",
      content: "Authorize an app to use your Trey TV account."
    }]
  })
});
const $$splitComponentImporter$V = () => import("./music-review.queue-B2RN4h19.mjs");
const Route$V = createFileRoute("/music-review/queue")({
  component: lazyRouteComponent($$splitComponentImporter$V, "component"),
  head: () => ({
    meta: [{
      title: "Live Queue - Trey TV Music Review"
    }, {
      name: "description",
      content: "See who is on deck for Trey TV live music review."
    }]
  })
});
const $$splitComponentImporter$U = () => import("./live._id-YR0KGzaH.mjs");
const Route$U = createFileRoute("/live/$id")({
  component: lazyRouteComponent($$splitComponentImporter$U, "component"),
  head: () => ({
    meta: [{
      title: "Live · Trey TV"
    }]
  })
});
const $$splitComponentImporter$T = () => import("./legal.data-deletion-D70Ug3Nw.mjs");
const Route$T = createFileRoute("/legal/data-deletion")({
  component: lazyRouteComponent($$splitComponentImporter$T, "component"),
  head: () => ({
    meta: [{
      title: "Data Deletion Request — Trey TV"
    }, {
      name: "description",
      content: "Request deletion, export, or correction of your Trey TV data."
    }, {
      property: "og:title",
      content: "Data Deletion Request — Trey TV"
    }, {
      property: "og:description",
      content: "Submit a data action request to Trey TV."
    }]
  })
});
const LEGAL_LAST_UPDATED = "May 9, 2026";
const LEGAL_CONTACT_EMAIL = "[legal contact email]";
const SUPPORT_CONTACT = "[support contact placeholder]";
const COMPANY_NAME = "Trey TV";
const POLICY_INDEX = [
  { slug: "terms", title: "Terms of Service", summary: "The agreement between you and Trey TV.", category: "core", icon: "FileText" },
  { slug: "privacy", title: "Privacy Policy", summary: "What we collect and how it's used.", category: "core", icon: "ShieldCheck" },
  { slug: "community-guidelines", title: "Community Guidelines", summary: "How we keep Trey TV welcoming and safe.", category: "user", icon: "Users" },
  { slug: "content-policy", title: "Content Policy", summary: "Rules for posts, episodes, and uploads.", category: "user", icon: "Film" },
  { slug: "creator-terms", title: "Creator Terms", summary: "Specific terms for creators on Trey TV.", category: "creator", icon: "Crown" },
  { slug: "risk-disclosure", title: "Risk Disclosure", summary: "Risks of using a live, social platform.", category: "user", icon: "AlertTriangle" },
  { slug: "cookie-policy", title: "Cookie Policy", summary: "Cookies, local storage, and session tools.", category: "core", icon: "Cookie" },
  { slug: "dmca", title: "Copyright / DMCA Policy", summary: "Copyright complaints and takedown process.", category: "core", icon: "Copyright" },
  { slug: "accessibility", title: "Accessibility Statement", summary: "Our commitment to an accessible app.", category: "support", icon: "Accessibility" },
  { slug: "data-deletion", title: "Data Deletion Request", summary: "Request deletion, export, or correction.", category: "support", icon: "Trash2" },
  { slug: "subscription-terms", title: "Subscription & Digital Purchase Terms", summary: "Subscriptions, gifts, and rewards.", category: "core", icon: "CreditCard" },
  { slug: "ai-disclosure", title: "Trey-I / AI Assistant Disclosure", summary: "How Trey-I works and its limits.", category: "ai", icon: "Sparkles" }
];
const POLICIES = {
  terms: {
    slug: "terms",
    title: "Terms of Service",
    category: "core",
    summary: "These Terms govern your access to and use of Trey TV. By creating an account or using the app, you agree to these Terms.",
    sections: [
      { id: "acceptance", heading: "Acceptance of Terms", body: [
        `By accessing or using ${COMPANY_NAME}, you agree to be bound by these Terms of Service and all referenced policies, including our Privacy Policy, Community Guidelines, Content Policy, and any product-specific terms. If you do not agree, do not use the platform.`,
        `We may update these Terms from time to time. Material changes will be communicated in-app or by email where reasonably possible.`
      ] },
      { id: "eligibility", heading: "Eligibility & Age Requirements", body: [
        `You must be at least the minimum age required in your jurisdiction to enter a binding contract and to use a social media or entertainment service. Some features may require you to be 18+.`,
        `You agree to provide accurate information when creating your account and keep that information current.`
      ] },
      { id: "registration", heading: "Account Registration", body: [
        `You are responsible for maintaining the security of your login credentials. You are responsible for all activity under your account. Notify us immediately if you suspect unauthorized access.`
      ] },
      { id: "responsibilities", heading: "User Responsibilities", body: [
        `You agree to use Trey TV in compliance with applicable laws, these Terms, and our Community Guidelines. You will not misuse the service, attempt to disrupt it, or use it to harm others.`
      ] },
      { id: "ugc", heading: "User-Generated Content", body: [
        `You retain ownership of content you post, upload, or share. By submitting content to Trey TV, you grant us a worldwide, non-exclusive, royalty-free, sublicensable license to host, store, reproduce, modify (for technical purposes such as transcoding and resizing), publicly display, and distribute that content as needed to operate, promote, and improve the service.`,
        `You represent that you have the rights necessary to grant this license, and that your content does not violate the rights of others or applicable law.`
      ] },
      { id: "creator-uploads", heading: "Creator Uploads & Episode Content", body: [
        `If you publish episodes, shows, livestreams, or premium content, you are responsible for ensuring you own or have permission to use all elements of that content, including music, footage, talent likeness, and trademarks. Additional rules apply under the Creator Terms and Content Policy.`
      ] },
      { id: "license-to-treytv", heading: "Content Ownership & License to Trey TV", body: [
        `You own your content. The license you grant Trey TV is limited to what is reasonably needed to operate, secure, moderate, market, and improve the service, and survives termination only to the extent necessary for these purposes (for example, backups, anti-abuse, and legal preservation).`
      ] },
      { id: "prohibited", heading: "Prohibited Conduct", list: [
        "Harassment, threats, hate speech, or targeted abuse",
        "Sexual content involving minors or any exploitation of minors",
        "Doxing, stalking, or sharing private information without consent",
        "Impersonation or deceptive identity",
        "Spam, scams, fake engagement, or inflated metrics",
        "Uploading malware, attempting to breach security, or scraping the service",
        "Infringing intellectual property, publicity, or privacy rights",
        "Illegal activity or content that violates applicable law"
      ] },
      { id: "interactions", heading: "Community Interactions", body: [
        `Comments, reactions, messaging, and other social features must follow our Community Guidelines. We may moderate, limit, hide, or remove interactions that violate our policies.`
      ] },
      { id: "rewards", heading: "Rewards, Points, Gifts & Digital Features", body: [
        `Rewards, points, gifts, and other digital features have no cash value unless we expressly state otherwise. Additional terms apply under our Subscription & Digital Purchase Terms.`
      ] },
      { id: "changes", heading: "Platform Changes & Availability", body: [
        `We may modify, suspend, or discontinue features at any time. We strive for high uptime but do not guarantee uninterrupted availability.`
      ] },
      { id: "termination", heading: "Account Suspension or Termination", body: [
        `We may suspend or terminate accounts that violate these Terms or our policies, or where required by law. You may close your account at any time using the in-app settings or our Data Deletion request.`
      ] },
      { id: "disclaimers", heading: "Disclaimers", body: [
        `The service is provided "as is" and "as available." To the fullest extent permitted by law, we disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.`
      ] },
      { id: "liability", heading: "Limitation of Liability", body: [
        `To the maximum extent permitted by law, Trey TV will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, arising out of or in connection with the service.`
      ] },
      { id: "indemnification", heading: "Indemnification", body: [
        `You agree to defend, indemnify, and hold harmless Trey TV and its affiliates, officers, employees, and agents from any claim arising out of your content, your use of the service, or your violation of these Terms or applicable law.`
      ] },
      { id: "disputes", heading: "Dispute Resolution", body: [
        `[Dispute resolution placeholder — to be finalized by counsel. May include informal resolution, arbitration, class action waiver, and venue.]`
      ] },
      { id: "governing-law", heading: "Governing Law", body: [
        `[Governing law placeholder — to be finalized by counsel.]`
      ] },
      { id: "contact", heading: "Contact", body: [
        `Questions about these Terms? Reach us at ${LEGAL_CONTACT_EMAIL}.`
      ] }
    ]
  },
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    category: "core",
    summary: "This Privacy Policy explains what information Trey TV collects, how we use it, who we share it with, and the choices you have.",
    sections: [
      { id: "collected", heading: "Information We Collect", body: [
        `We collect information you provide directly, information generated through your use of the service, and information from third parties (such as service providers and authentication partners).`
      ] },
      { id: "account", heading: "Account & Profile Information", list: [
        "Name, username, email address, password",
        "Profile details such as display name, avatar, banner, bio, location, and links",
        "Role (viewer, creator) and verification status where applicable"
      ] },
      { id: "dob-location", heading: "Date of Birth & Broad Location", body: [
        `We may collect your date of birth to confirm eligibility, enforce age-restricted features, and personalize your experience. We may use broad/approximate location (such as country or region) to tailor content and comply with legal requirements. We do not require precise GPS location for core features.`
      ] },
      { id: "preferences", heading: "Content Preferences & Prescribe Me Selections", body: [
        `Your topic selections, follow lists, watch history, ratings, reactions, and Prescribe Me inputs help us recommend shows, episodes, and creators. You can adjust these in Settings.`
      ] },
      { id: "uploads", heading: "Uploaded Photos, Videos, Posts, Comments & Reactions", body: [
        `Content you upload — including photos, banners, episode files, posts, comments, and reactions — is stored to operate the service, deliver it to viewers, and enable safety/moderation tooling.`
      ] },
      { id: "trey-i", heading: "Trey-I Voice / Chat Onboarding Data", body: [
        `If you use Trey-I to set up your profile or receive recommendations, we may process your voice or chat input to provide that feature. You can review and edit information before it is saved to your profile. See our Trey-I / AI Assistant Disclosure for details.`
      ] },
      { id: "device", heading: "Device, Usage, Analytics & Log Data", list: [
        "Device type, operating system, browser, app version",
        "IP address (used in part for broad geolocation and security)",
        "Pages and screens viewed, features used, performance and crash logs",
        "Referring URLs and timestamps"
      ] },
      { id: "cookies", heading: "Cookies, Local Storage & Session Technologies", body: [
        `We use cookies, local storage, and similar technologies for authentication, preferences, analytics, and abuse prevention. See our Cookie Policy for details.`
      ] },
      { id: "use", heading: "How We Use Information", list: [
        "To provide, maintain, secure, and improve the service",
        "To personalize content, recommendations, and notifications",
        "To enforce our Terms and policies and prevent abuse",
        "To communicate with you about updates, support, and legal notices",
        "To comply with legal obligations and respond to lawful requests"
      ] },
      { id: "sharing", heading: "How We Share Information", body: [
        `We share information with service providers that help us run the platform (hosting, analytics, payments, communications, moderation), with creators and other users when you publicly post or interact, and as required by law.`,
        `We do not sell personal information for monetary consideration. Some sharing may be considered "sharing" under certain state laws; see "Privacy Choices" below.`
      ] },
      { id: "providers", heading: "Service Providers", body: [
        `Service providers process information on our behalf under contractual obligations and only as needed to deliver their services to us.`
      ] },
      { id: "creator-visibility", heading: "Creator & Public Profile Visibility", body: [
        `Profiles, posts, episodes, and creator pages may be publicly visible. Be mindful of what you choose to display publicly.`
      ] },
      { id: "choices", heading: "Privacy Choices", list: [
        "Update your profile and preferences in Settings",
        "Manage notifications, content preferences, and visibility",
        "Use the in-app Data Deletion form to request deletion or export"
      ] },
      { id: "rights", heading: "Data Access, Correction, Deletion & Export", body: [
        `Depending on your jurisdiction, you may have the right to access, correct, delete, port, or restrict processing of your personal information. To make a request, use our Data Deletion Request page.`
      ] },
      { id: "minors", heading: "Children & Minors", body: [
        `Trey TV is not directed to children under the minimum age permitted in your jurisdiction. We do not knowingly collect personal information from children under that age. If you believe a child has provided us information, contact ${LEGAL_CONTACT_EMAIL}.`
      ] },
      { id: "security", heading: "Security Practices", body: [
        `We use administrative, technical, and physical safeguards designed to protect personal information. No method of transmission or storage is 100% secure.`
      ] },
      { id: "retention", heading: "Retention", body: [
        `We retain information for as long as needed to provide the service, comply with legal obligations, resolve disputes, and enforce agreements. We may retain certain information after account deletion when required by law or for legitimate safety/security purposes.`
      ] },
      { id: "international", heading: "International & State Privacy Rights", body: [
        `[International / state privacy rights placeholder — to be finalized by counsel. May include EEA/UK/Swiss rights, US state rights such as CA, CO, CT, VA, UT, and others, and applicable transfer mechanisms.]`
      ] },
      { id: "contact", heading: "Contact", body: [
        `Privacy questions or requests can be sent to ${LEGAL_CONTACT_EMAIL}.`
      ] }
    ]
  },
  "community-guidelines": {
    slug: "community-guidelines",
    title: "Community Guidelines",
    category: "user",
    summary: "Trey TV is built for entertainment, creativity, and real connection. These guidelines keep the community welcoming and safe.",
    sections: [
      { id: "respect", heading: "Respect Everyone", body: [
        `Trey TV is for all kinds of viewers and creators. Treat others the way you want to be treated. Disagreement is fine; cruelty is not.`
      ] },
      { id: "no-harm", heading: "Zero Tolerance Behavior", list: [
        "Harassment, threats, or targeted abuse",
        "Hate speech or discrimination based on protected characteristics",
        "Sexual exploitation, especially involving minors",
        "Stalking, doxing, or sharing private information",
        "Impersonation or deceptive identity",
        "Spam, scams, fake engagement, or manipulated metrics",
        "Promotion of illegal activity or violence"
      ] },
      { id: "content", heading: "Content Standards", body: [
        `Posts, comments, messages, episodes, profile content, and live interactions must follow our Content Policy. Some content may be age-gated; some content is not allowed at all.`
      ] },
      { id: "reporting", heading: "Reporting Content", body: [
        `If you see something that violates our policies, use the in-app report button. Reports are reviewed by our moderation team. We may take action on content, accounts, or both.`
      ] },
      { id: "moderation", heading: "Moderation Actions", list: [
        "Content removal or labeling",
        "Limits on visibility or distribution",
        "Temporary feature limits",
        "Account warnings, suspensions, or termination"
      ] },
      { id: "appeals", heading: "Appeals", body: [
        `If you believe a moderation action was made in error, you may submit an appeal. [Appeal flow placeholder — final intake details to be confirmed.]`
      ] },
      { id: "creators", heading: "Creator Conduct Expectations", body: [
        `Creators have an outsized influence on the community. We expect creators to model the behavior they want to see, respect their audiences, and follow Creator Terms and Content Policy.`
      ] },
      { id: "contact", heading: "Contact", body: [
        `Questions about a moderation decision: ${SUPPORT_CONTACT}.`
      ] }
    ]
  },
  "content-policy": {
    slug: "content-policy",
    title: "Content Policy",
    category: "user",
    summary: "Rules for what can be posted, uploaded, and broadcast on Trey TV.",
    sections: [
      { id: "creator-uploads", heading: "Creator Uploads", body: [
        `Creators are responsible for everything they upload, including video, audio, thumbnails, episode metadata, descriptions, and titles.`
      ] },
      { id: "episodes", heading: "Episodes & Show Content", body: [
        `Episodes must comply with this Content Policy and applicable law. Episodes that violate our rules may be removed, age-restricted, or demonetized.`
      ] },
      { id: "copyright", heading: "Copyright Ownership", body: [
        `Only upload content that you own or are licensed to use. This includes background music, clips, voiceovers, b-roll, and any third-party material.`
      ] },
      { id: "third-party", heading: "Music, Footage, Likeness & Trademarks", body: [
        `You must have the rights to all music, footage, talent likeness, and trademarks featured in your uploads. Failure to clear rights may result in content removal and account action under our Copyright / DMCA Policy.`
      ] },
      { id: "mature", heading: "Mature Content Labeling", body: [
        `Some content may require age-restriction or labeling. Creators must accurately label mature content. Sexual content involving minors is strictly prohibited and will be reported to authorities.`
      ] },
      { id: "prohibited", heading: "Prohibited Content", list: [
        "Illegal content or content that promotes illegal acts",
        "Sexual content involving minors",
        "Content depicting graphic violence, gore, or animal cruelty",
        "Doxing or sharing private information",
        "Content designed to manipulate elections, defraud users, or impersonate public officials"
      ] },
      { id: "misleading", heading: "Misleading Content", body: [
        `Do not post deceptive content that could cause real-world harm, including health misinformation, deceptive deepfakes, and fraudulent claims.`
      ] },
      { id: "ai", heading: "AI-Assisted Content Disclosure", body: [
        `If your content is materially generated or altered by AI in a way that a reasonable viewer would want to know, disclose it. Synthetic depictions of real people require their consent where required by law.`
      ] },
      { id: "review", heading: "Platform Review & Removal Rights", body: [
        `Trey TV may review, label, restrict, or remove content that violates this policy or is otherwise unlawful or harmful.`
      ] },
      { id: "fake-engagement", heading: "No Fake Engagement", body: [
        `Do not buy, sell, or coordinate fake views, follows, reactions, comments, or any other engagement metric.`
      ] },
      { id: "first-two-free", heading: "First-Two-Free Episode Policy", body: [
        `Where applicable, the first two episodes of a series may be made freely available to viewers as part of show discovery. Creators participating in this discovery experience agree to this preview availability.`
      ] },
      { id: "contact", heading: "Contact", body: [
        `Report violations using the in-app report flow or email ${SUPPORT_CONTACT}.`
      ] }
    ]
  },
  "creator-terms": {
    slug: "creator-terms",
    title: "Creator Terms",
    category: "creator",
    summary: "These terms apply to creators who publish content, run shows, or use Creator Studio on Trey TV.",
    sections: [
      { id: "eligibility", heading: "Creator Eligibility", body: [
        `To publish as a creator, you must meet the minimum age requirement, hold a valid Trey TV account in good standing, and follow our Terms, Community Guidelines, and Content Policy.`
      ] },
      { id: "application", heading: "Application & Review", body: [
        `Creator status may require an application or review. We may approve, deny, or revoke creator status at our discretion, including based on content history, identity verification, and compliance with our policies.`
      ] },
      { id: "rights", heading: "Upload Rights & Ownership", body: [
        `You retain ownership of your content. By uploading, you grant Trey TV the license described in our Terms of Service to host, distribute, and promote your content on the platform.`
      ] },
      { id: "responsibility", heading: "Creator Responsibility for Content", body: [
        `You are solely responsible for the content you publish, including securing all necessary rights, releases, clearances, and consents. You agree to defend Trey TV from claims arising out of your content.`
      ] },
      { id: "interactions", heading: "Viewer Interaction Expectations", body: [
        `Treat your audience with respect. Do not encourage harassment, dogpiling, or behavior that violates our Community Guidelines.`
      ] },
      { id: "publishing", heading: "Show & Episode Publishing Rules", body: [
        `Episodes must include accurate metadata. Mature content must be properly labeled. Submissions may be queued for moderation and may be edited (for example, thumbnails or labels) where required for compliance.`
      ] },
      { id: "studio", heading: "Creator Studio Usage", body: [
        `Creator Studio is provided to help you manage uploads, schedules, analytics, and monetization tools. You agree not to misuse Studio features, scrape data, or abuse APIs.`
      ] },
      { id: "moderation", heading: "Moderation & Removal", body: [
        `We may remove, restrict, or label content that violates our policies or applicable law. Repeat violations may result in suspension or termination of creator status.`
      ] },
      { id: "no-guarantees", heading: "No Guarantees", body: [
        `Trey TV does not guarantee fame, audience growth, views, monetization, payouts, approval, placement, promotion, or any specific outcome from publishing on the platform.`
      ] },
      { id: "monetization", heading: "Subscriptions, Gifts, Rewards & Monetization", body: [
        `Monetization features such as subscriptions, gifts, rewards, and payouts are governed by additional product terms, including our Subscription & Digital Purchase Terms. [Detailed monetization terms placeholder.]`
      ] },
      { id: "license", heading: "License to Display & Distribute", body: [
        `As described in our Terms of Service, you grant Trey TV a worldwide, non-exclusive, royalty-free, sublicensable license to host, store, reproduce, modify (for technical purposes), publicly display, and distribute your content as part of operating and promoting the service.`
      ] },
      { id: "termination", heading: "Account Termination", body: [
        `We may suspend or terminate creator status for policy violations, legal reasons, or risk to users. You may stop publishing or close your account at any time.`
      ] },
      { id: "contact", heading: "Contact / Support", body: [
        `Creator support: ${SUPPORT_CONTACT}.`
      ] }
    ]
  },
  "risk-disclosure": {
    slug: "risk-disclosure",
    title: "Risk Disclosure",
    category: "user",
    summary: "Using a live, social, creator-driven platform involves real-world risks. Please read this disclosure carefully.",
    sections: [
      { id: "ugc", heading: "User-Generated Content Risk", body: [
        `Trey TV hosts content created by users and creators. We do not pre-screen all content and cannot guarantee its accuracy, safety, legality, or quality.`
      ] },
      { id: "creator", heading: "Creator Content Themes", body: [
        `Creator content may include opinion, entertainment, emotional or mature themes, and dramatic presentation. Use viewer discretion.`
      ] },
      { id: "discretion", heading: "Viewer Discretion", body: [
        `You are responsible for what you choose to watch, follow, share, and engage with. Use age-restriction, mute, block, and report tools as needed.`
      ] },
      { id: "no-success", heading: "No Guarantee of Creator Success", body: [
        `We do not guarantee creator success, audience growth, income, approval, visibility, rewards value, or content performance.`
      ] },
      { id: "social", heading: "Social Interaction Risks", body: [
        `Comments, messaging, and live interactions can be unpredictable. Block, mute, and report tools are available; not all interactions can be moderated in real time.`
      ] },
      { id: "ai", heading: "Trey-I / AI Assistant Limitations", body: [
        `Trey-I is a helpful assistant, not a substitute for professional advice. Outputs can be inaccurate or incomplete. Verify important details on your own.`
      ] },
      { id: "availability", heading: "Technical Availability", body: [
        `The service may be temporarily unavailable due to maintenance, outages, or factors outside our control.`
      ] },
      { id: "third-party", heading: "Third-Party Services", body: [
        `Trey TV integrates with third-party services for hosting, payments, analytics, and more. Their terms and risks apply to their portions of the service.`
      ] },
      { id: "rewards", heading: "Digital Rewards & Subscriptions", body: [
        `Digital rewards, gifts, and points have no cash value unless we expressly state otherwise. Features may change. See Subscription & Digital Purchase Terms.`
      ] },
      { id: "responsibility", heading: "Your Responsibility", body: [
        `You are responsible for what you post, upload, buy, watch, share, and rely on through Trey TV.`
      ] }
    ]
  },
  "cookie-policy": {
    slug: "cookie-policy",
    title: "Cookie Policy",
    category: "core",
    summary: "How Trey TV uses cookies, local storage, and similar technologies.",
    sections: [
      { id: "what", heading: "What Cookies & Local Storage Are", body: [
        `Cookies and local storage are small pieces of data stored on your device by the app or your browser. We use these technologies to keep you signed in, remember preferences, measure performance, and prevent abuse.`
      ] },
      { id: "essential", heading: "Essential Cookies", body: [
        `Required for core functionality such as authentication, session management, and security. The service cannot function without these.`
      ] },
      { id: "analytics", heading: "Analytics & Performance", body: [
        `Used to understand how the app is used, measure performance, and improve features. May be disabled where required by law.`
      ] },
      { id: "preferences", heading: "Preferences & Session Storage", body: [
        `Used to remember your settings, theme, and recent activity to make the experience smoother.`
      ] },
      { id: "auth", heading: "Authentication / Session Usage", body: [
        `We use cookies/local storage to keep you signed in and to detect and prevent unauthorized access to your account.`
      ] },
      { id: "manage", heading: "How You Can Manage Cookies", body: [
        `Most browsers let you block or delete cookies. Some app settings let you control non-essential storage. Disabling essential cookies may break parts of Trey TV.`
      ] },
      { id: "controls", heading: "Browser Controls", body: [
        `Refer to your browser or device documentation for instructions on managing cookies and local storage.`
      ] },
      { id: "contact", heading: "Contact", body: [
        `Cookie questions: ${LEGAL_CONTACT_EMAIL}.`
      ] }
    ]
  },
  dmca: {
    slug: "dmca",
    title: "Copyright / DMCA Policy",
    category: "core",
    summary: "How to report copyright infringement on Trey TV and how we handle takedown notices.",
    sections: [
      { id: "process", heading: "Copyright Complaint Process", body: [
        `If you believe content on Trey TV infringes your copyright, you may submit a written takedown notice to our designated agent.`
      ] },
      { id: "required", heading: "Required Information for a Takedown Notice", list: [
        "Your name, address, telephone number, and email",
        "Identification of the copyrighted work claimed to be infringed",
        "Identification of the material claimed to be infringing and where it is located",
        "A statement that you have a good-faith belief the use is not authorized",
        "A statement, under penalty of perjury, that the information is accurate and you are authorized to act",
        "Your physical or electronic signature"
      ] },
      { id: "counter", heading: "Counter-Notification", body: [
        `If your content was removed and you believe it was a mistake or misidentification, you may submit a counter-notification. [Counter-notification details placeholder.]`
      ] },
      { id: "repeat", heading: "Repeat Infringer Policy", body: [
        `We terminate accounts of users determined to be repeat infringers in appropriate circumstances.`
      ] },
      { id: "creator", heading: "Creator Responsibility", body: [
        `Creators are responsible for clearing rights to all elements of uploaded content. See our Content Policy and Creator Terms.`
      ] },
      { id: "contact", heading: "Designated Copyright Contact", body: [
        `Send copyright notices to ${LEGAL_CONTACT_EMAIL}.`
      ] }
    ]
  },
  accessibility: {
    slug: "accessibility",
    title: "Accessibility Statement",
    category: "support",
    summary: "Trey TV is committed to building an accessible, inclusive entertainment experience.",
    sections: [
      { id: "commitment", heading: "Our Commitment", body: [
        `We strive to make Trey TV usable by as many people as possible, regardless of ability or technology. Accessibility is an ongoing effort, and we welcome feedback.`
      ] },
      { id: "goals", heading: "Supported Accessibility Goals", list: [
        "Meaningful color contrast and readable typography",
        "Keyboard navigation across primary flows",
        "Focus indicators on interactive elements",
        "Screen-reader-friendly labels for key controls",
        "Captions or subtitles where supported",
        "Reduced-motion considerations for users who prefer less animation"
      ] },
      { id: "feedback", heading: "Feedback & Contact", body: [
        `If you encounter an accessibility barrier, please tell us at ${SUPPORT_CONTACT}. Your feedback directly informs improvements.`
      ] },
      { id: "ongoing", heading: "Ongoing Improvement", body: [
        `Accessibility work is never finished. We continue to test, fix, and add features to make Trey TV more accessible over time.`
      ] }
    ]
  },
  "data-deletion": {
    slug: "data-deletion",
    title: "Data Deletion Request",
    category: "support",
    summary: "Use this page to request deletion, export, correction, or other data action on your Trey TV account.",
    sections: [
      { id: "how", heading: "How to Request", body: [
        `Submit the form on this page and we will follow up using the contact information you provide. You may also email ${LEGAL_CONTACT_EMAIL}.`
      ] },
      { id: "deleted", heading: "What May Be Deleted", list: [
        "Profile information",
        "Posts, comments, reactions, and uploaded media",
        "Watch history and recommendation signals",
        "Saved settings and preferences"
      ] },
      { id: "retained", heading: "What May Be Retained", body: [
        `We may retain limited information for legal, safety, security, or fraud-prevention reasons, or where required by law. Backups may persist for a limited window before being overwritten.`
      ] },
      { id: "verification", heading: "Verification", body: [
        `For your protection, we may need to verify your identity before processing certain requests.`
      ] }
    ]
  },
  "subscription-terms": {
    slug: "subscription-terms",
    title: "Subscription & Digital Purchase Terms",
    category: "core",
    summary: "Terms for Trey TV Plus, subscriptions, creator gifts, rewards, and other digital purchases.",
    sections: [
      { id: "plus", heading: "Trey TV Plus", body: [
        `Trey TV Plus [placeholder] is a paid membership that may include premium features, perks, and content. Specific benefits, pricing, and availability may vary by region and over time.`
      ] },
      { id: "subscriptions", heading: "Subscriptions", body: [
        `Subscriptions renew automatically until canceled. You can manage or cancel your subscription in Settings or via the app store/payment platform you used to subscribe.`
      ] },
      { id: "gifts", heading: "Creator Gifts", body: [
        `Gifts are digital items used to support creators or unlock interactions. Gifts have no cash value unless explicitly stated.`
      ] },
      { id: "rewards", heading: "Rewards & Points", body: [
        `Rewards and points are promotional features that may be earned, redeemed, or expire under their associated rules. They are not currency, are not transferable except where allowed, and have no cash value unless explicitly stated.`
      ] },
      { id: "digital-only", heading: "Digital-Only Purchases", body: [
        `Digital purchases are non-tangible and are typically delivered immediately. Refund availability depends on jurisdiction and platform of purchase.`
      ] },
      { id: "no-cash", heading: "No Cash Value", body: [
        `Unless we expressly state otherwise, digital items, points, gifts, and rewards have no cash value and are non-transferable outside the platform.`
      ] },
      { id: "refunds", heading: "Refund Policy", body: [
        `[Refund policy placeholder — final terms to be confirmed by counsel and aligned with payment platforms and applicable consumer law.]`
      ] },
      { id: "cancellation", heading: "Cancellation", body: [
        `Cancel any time before your renewal date. Access to subscription benefits typically continues until the end of the paid period.`
      ] },
      { id: "renewal", heading: "Renewal", body: [
        `By subscribing, you authorize recurring charges using your selected payment method until you cancel.`
      ] },
      { id: "failed", heading: "Failed Payments", body: [
        `If a payment fails, we may attempt to reprocess and may suspend access to paid features until payment is resolved.`
      ] },
      { id: "store", heading: "App Store / Third-Party Payments", body: [
        `Purchases made through an app store or third-party payment platform are also subject to the terms of that platform.`
      ] },
      { id: "contact", heading: "Contact", body: [
        `Billing questions: ${SUPPORT_CONTACT}.`
      ] }
    ]
  },
  "ai-disclosure": {
    slug: "ai-disclosure",
    title: "Trey-I / AI Assistant Disclosure",
    category: "ai",
    summary: "How Trey-I works, what data it processes, and what it should not be used for.",
    sections: [
      { id: "what", heading: "What Trey-I Does", body: [
        `Trey-I is an in-app assistant that can help you set up your profile, find shows and creators you'll love, and explore the app conversationally.`
      ] },
      { id: "onboarding", heading: "Onboarding & Profile Help", body: [
        `Trey-I may help collect onboarding and profile information. You can review, edit, and confirm anything before it is saved to your profile.`
      ] },
      { id: "review", heading: "Review Before Publishing", body: [
        `Suggestions from Trey-I are drafts. You decide what is published, kept, or discarded.`
      ] },
      { id: "not-advice", heading: "Not Legal, Medical, Financial, or Emergency Advice", body: [
        `Trey-I is not a substitute for professional advice. Do not rely on Trey-I for legal, medical, financial, or emergency decisions. In an emergency, contact your local emergency services.`
      ] },
      { id: "voice-data", heading: "Voice & Chat Data", body: [
        `When you use Trey-I, your voice or chat input may be processed to provide the feature, including transcription and recommendation generation. See our Privacy Policy.`
      ] },
      { id: "sensitive", heading: "Avoid Sharing Sensitive Information", body: [
        `Do not share information you would not want processed by an AI feature, such as government IDs, payment details, or sensitive personal data unrelated to setting up your profile.`
      ] },
      { id: "availability", heading: "Availability", body: [
        `Trey-I features may vary by device, region, account type, or time. We may add, change, or remove capabilities.`
      ] },
      { id: "contact", heading: "Privacy Requests", body: [
        `Privacy questions related to Trey-I: ${LEGAL_CONTACT_EMAIL}.`
      ] }
    ]
  }
};
function getPolicy(slug) {
  return POLICIES[slug];
}
const $$splitNotFoundComponentImporter = () => import("./legal._slug-DNplOm1O.mjs");
const $$splitComponentImporter$S = () => import("./legal._slug-CUB70860.mjs");
const Route$S = createFileRoute("/legal/$slug")({
  component: lazyRouteComponent($$splitComponentImporter$S, "component"),
  beforeLoad: ({
    params
  }) => {
    if (!getPolicy(params.slug)) throw notFound();
  },
  head: ({
    params
  }) => {
    const policy = POLICIES[params.slug];
    const title = policy ? `${policy.title} — Trey TV` : "Trey TV — Legal";
    const desc = policy?.summary ?? "Trey TV legal and safety policy.";
    return {
      meta: [{
        title
      }, {
        name: "description",
        content: desc
      }, {
        property: "og:title",
        content: title
      }, {
        property: "og:description",
        content: desc
      }]
    };
  },
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
const $$splitComponentImporter$R = () => import("./games.truno-DRc65_O5.mjs");
const Route$R = createFileRoute("/games/truno")({
  component: lazyRouteComponent($$splitComponentImporter$R, "component"),
  head: () => ({
    meta: [{
      title: "Truno · Trey TV Games"
    }, {
      name: "description",
      content: "Truno — Trey TV's original color-matching card game. Match colors, play action cards, and call TRUNO when you're down to one."
    }]
  })
});
const $$splitComponentImporter$Q = () => import("./games.spades-DrWjrS8O.mjs");
const Route$Q = createFileRoute("/games/spades")({
  component: lazyRouteComponent($$splitComponentImporter$Q, "component"),
  head: () => ({
    meta: [{
      title: "Spades - Trey TV Games"
    }, {
      name: "description",
      content: "Play Trey TV Spades with the cinematic Trey TV deck."
    }]
  })
});
const $$splitComponentImporter$P = () => import("./games.interactive-stories-BFsOu0JM.mjs");
const Route$P = createFileRoute("/games/interactive-stories")({
  component: lazyRouteComponent($$splitComponentImporter$P, "component"),
  head: () => ({
    meta: [{
      title: "Interactive Stories · Trey TV Games"
    }, {
      name: "description",
      content: "Play cinematic stories where every choice changes the outcome. Interactive Stories on Trey TV."
    }]
  })
});
const $$splitComponentImporter$O = () => import("./games.bullshit-imEszQay.mjs");
const Route$O = createFileRoute("/games/bullshit")({
  component: lazyRouteComponent($$splitComponentImporter$O, "component"),
  head: () => ({
    meta: [{
      title: "Bullshit - Trey TV Games"
    }, {
      name: "description",
      content: "Play Trey TV Bullshit with the cinematic Trey TV deck."
    }]
  })
});
const $$splitComponentImporter$N = () => import("./games.blackjack-B6FRkmph.mjs");
const Route$N = createFileRoute("/games/blackjack")({
  component: lazyRouteComponent($$splitComponentImporter$N, "component"),
  head: () => ({
    meta: [{
      title: "Blackjack - Trey TV Games"
    }, {
      name: "description",
      content: "Play Trey TV Blackjack with the cinematic Trey TV deck."
    }]
  })
});
const $$splitComponentImporter$M = () => import("./developers.docs-DZKx9al5.mjs");
const Route$M = createFileRoute("/developers/docs")({
  component: lazyRouteComponent($$splitComponentImporter$M, "component"),
  head: () => ({
    meta: [{
      title: "Sign in with Trey TV"
    }, {
      name: "description",
      content: "OAuth documentation for Sign in with Trey TV."
    }]
  })
});
const $$splitComponentImporter$L = () => import("./creator-studio.submitted-D1ryIaj_.mjs");
const Route$L = createFileRoute("/creator-studio/submitted")({
  validateSearch: (s) => ({
    id: s.id || void 0
  }),
  component: lazyRouteComponent($$splitComponentImporter$L, "component"),
  head: () => ({
    meta: [{
      title: "Submitted for Review — Trey TV"
    }, {
      name: "description",
      content: "Your episode has been submitted for admin approval."
    }]
  })
});
const $$splitComponentImporter$K = () => import("./creator-studio.submit-CqSpFHIY.mjs");
const Route$K = createFileRoute("/creator-studio/submit")({
  validateSearch: (s) => ({
    id: s.id || void 0
  }),
  component: lazyRouteComponent($$splitComponentImporter$K, "component"),
  head: () => ({
    meta: [{
      title: "Prepare Your Episode — Trey TV"
    }, {
      name: "description",
      content: "Organize your content for Trey TV before it goes to admin review."
    }]
  })
});
const $$splitComponentImporter$J = () => import("./creator-studio.submissions-D1JlhIYv.mjs");
const Route$J = createFileRoute("/creator-studio/submissions")({
  component: lazyRouteComponent($$splitComponentImporter$J, "component"),
  head: () => ({
    meta: [{
      title: "Content Library — Trey TV"
    }, {
      name: "description",
      content: "Track every Trey TV submission, draft, episode, and approval status."
    }]
  })
});
const $$splitComponentImporter$I = () => import("./creator-studio.settings-B2FBcOL5.mjs");
const Route$I = createFileRoute("/creator-studio/settings")({
  component: lazyRouteComponent($$splitComponentImporter$I, "component"),
  head: () => ({
    meta: [{
      title: "Creator Settings — Trey TV"
    }]
  })
});
const $$splitComponentImporter$H = () => import("./creator-studio.schedule-CNdbCHab.mjs");
const Route$H = createFileRoute("/creator-studio/schedule")({
  component: lazyRouteComponent($$splitComponentImporter$H, "component"),
  head: () => ({
    meta: [{
      title: "Schedule — Creator Studio"
    }]
  })
});
const $$splitComponentImporter$G = () => import("./creator-studio.rewards-D8i1f_IY.mjs");
const Route$G = createFileRoute("/creator-studio/rewards")({
  component: lazyRouteComponent($$splitComponentImporter$G, "component"),
  head: () => ({
    meta: [{
      title: "Rewards — Creator Studio"
    }]
  })
});
const $$splitComponentImporter$F = () => import("./creator-studio.interactions-c-4_2yt1.mjs");
const Route$F = createFileRoute("/creator-studio/interactions")({
  component: lazyRouteComponent($$splitComponentImporter$F, "component"),
  head: () => ({
    meta: [{
      title: "Interactions — Creator Studio"
    }]
  })
});
const $$splitComponentImporter$E = () => import("./creator-studio.fans-QbxG-D3Q.mjs");
const Route$E = createFileRoute("/creator-studio/fans")({
  component: lazyRouteComponent($$splitComponentImporter$E, "component"),
  head: () => ({
    meta: [{
      title: "Fans — Creator Studio"
    }]
  })
});
const $$splitComponentImporter$D = () => import("./creator-studio.edit-CZvR6nQX.mjs");
const Route$D = createFileRoute("/creator-studio/edit")({
  component: lazyRouteComponent($$splitComponentImporter$D, "component"),
  head: () => ({
    meta: [{
      title: "Creator Edit Studio — Trey TV"
    }, {
      name: "description",
      content: "Cinematic mobile-first editor for Trey TV creators."
    }]
  })
});
const $$splitComponentImporter$C = () => import("./creator-studio.channel-BSy18iZ_.mjs");
const Route$C = createFileRoute("/creator-studio/channel")({
  component: lazyRouteComponent($$splitComponentImporter$C, "component"),
  head: () => ({
    meta: [{
      title: "Channel — Creator Studio"
    }]
  })
});
const $$splitComponentImporter$B = () => import("./creator-studio.analytics-CALirdmL.mjs");
const Route$B = createFileRoute("/creator-studio/analytics")({
  component: lazyRouteComponent($$splitComponentImporter$B, "component"),
  head: () => ({
    meta: [{
      title: "Analytics — Creator Studio"
    }]
  })
});
const $$splitComponentImporter$A = () => import("./creator-hub.studio-BbP6VK_Z.mjs");
const Route$A = createFileRoute("/creator-hub/studio")({
  component: lazyRouteComponent($$splitComponentImporter$A, "component"),
  head: () => ({
    meta: [{
      title: "Edit Studio — Trey TV"
    }, {
      name: "description",
      content: "Cinematic editor inside the Creator Hub. Cut, mix, caption and AI-enhance your shows."
    }]
  })
});
const $$splitComponentImporter$z = () => import("./channel._handle-BLeoi2y2.mjs");
const Route$z = createFileRoute("/channel/$handle")({
  component: lazyRouteComponent($$splitComponentImporter$z, "component"),
  head: ({
    params
  }) => ({
    meta: [{
      title: `@${params.handle} — Trey TV Creator Channel`
    }, {
      name: "description",
      content: `Watch shows, episodes, and live moments from @${params.handle} on Trey TV.`
    }, {
      property: "og:title",
      content: `@${params.handle} on Trey TV`
    }]
  })
});
function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
const $$splitComponentImporter$y = () => import("./category._slug-CeJH8Alk.mjs");
const Route$y = createFileRoute("/category/$slug")({
  component: lazyRouteComponent($$splitComponentImporter$y, "component"),
  head: ({
    params
  }) => ({
    meta: [{
      title: `${cap(params.slug)} — Popular on Trey TV`
    }, {
      name: "description",
      content: `Most popular ${params.slug} videos and creators trending right now on Trey TV.`
    }, {
      property: "og:title",
      content: `${cap(params.slug)} — Popular on Trey TV`
    }, {
      property: "og:description",
      content: `Discover the top ${params.slug} content on Trey TV.`
    }]
  })
});
const $$splitComponentImporter$x = () => import("./auth.callback-CphroxWA.mjs");
const Route$x = createFileRoute("/auth/callback")({
  component: lazyRouteComponent($$splitComponentImporter$x, "component")
});
const $$splitComponentImporter$w = () => import("./apply.verification-D94REaLy.mjs");
const Route$w = createFileRoute("/apply/verification")({
  component: lazyRouteComponent($$splitComponentImporter$w, "component"),
  head: () => ({
    meta: [{
      title: "Gold Verification — Trey TV"
    }]
  })
});
const $$splitComponentImporter$v = () => import("./apply.go-verification-DIdQnh95.mjs");
const Route$v = createFileRoute("/apply/go-verification")({
  component: lazyRouteComponent($$splitComponentImporter$v, "component"),
  head: () => ({
    meta: [{
      title: "Go Verification Badge Application - Trey TV"
    }]
  })
});
const $$splitComponentImporter$u = () => import("./apply.creator-g-CZwEGq.mjs");
const Route$u = createFileRoute("/apply/creator")({
  component: lazyRouteComponent($$splitComponentImporter$u, "component"),
  head: () => ({
    meta: [{
      title: "Apply to Create — Trey TV"
    }]
  })
});
const $$splitComponentImporter$t = () => import("./apply.content-creator-Bi-PRgo4.mjs");
const Route$t = createFileRoute("/apply/content-creator")({
  component: lazyRouteComponent($$splitComponentImporter$t, "component"),
  head: () => ({
    meta: [{
      title: "Content Creator Application - Trey TV"
    }]
  })
});
const $$splitComponentImporter$s = () => import("./admin.zodiac-D6gYT3o1.mjs");
const Route$s = createFileRoute("/admin/zodiac")({
  component: lazyRouteComponent($$splitComponentImporter$s, "component"),
  head: () => ({
    meta: [{
      title: "Zodiac Support - Admin"
    }]
  })
});
const $$splitComponentImporter$r = () => import("./admin.view-as-BKa7MwHQ.mjs");
const Route$r = createFileRoute("/admin/view-as")({
  component: lazyRouteComponent($$splitComponentImporter$r, "component"),
  head: () => ({
    meta: [{
      title: "View As — Admin"
    }]
  })
});
const $$splitComponentImporter$q = () => import("./admin.videos-DzBqoThw.mjs");
const Route$q = createFileRoute("/admin/videos")({
  component: lazyRouteComponent($$splitComponentImporter$q, "component"),
  head: () => ({
    meta: [{
      title: "Videos — Admin"
    }]
  })
});
const $$splitComponentImporter$p = () => import("./admin.verification-CwB1JazD.mjs");
const Route$p = createFileRoute("/admin/verification")({
  component: lazyRouteComponent($$splitComponentImporter$p, "component"),
  head: () => ({
    meta: [{
      title: "Verification Review - Admin"
    }]
  })
});
const $$splitComponentImporter$o = () => import("./admin.users-BUNCdq4J.mjs");
const Route$o = createFileRoute("/admin/users")({
  component: lazyRouteComponent($$splitComponentImporter$o, "component"),
  head: () => ({
    meta: [{
      title: "Users — Admin"
    }]
  })
});
const $$splitComponentImporter$n = () => import("./admin.site-editor-u2zYm5o3.mjs");
const Route$n = createFileRoute("/admin/site-editor")({
  component: lazyRouteComponent($$splitComponentImporter$n, "component"),
  head: () => ({
    meta: [{
      title: "Site Editor — Admin"
    }]
  })
});
const $$splitComponentImporter$m = () => import("./admin.settings-BPa4V_GX.mjs");
const Route$m = createFileRoute("/admin/settings")({
  component: lazyRouteComponent($$splitComponentImporter$m, "component"),
  head: () => ({
    meta: [{
      title: "Platform Settings — Admin"
    }]
  })
});
const $$splitComponentImporter$l = () => import("./admin.rewards-WLD8-CMF.mjs");
const Route$l = createFileRoute("/admin/rewards")({
  component: lazyRouteComponent($$splitComponentImporter$l, "component"),
  head: () => ({
    meta: [{
      title: "Rewards — Admin"
    }]
  })
});
const $$splitComponentImporter$k = () => import("./admin.reports-D74_IBOQ.mjs");
const Route$k = createFileRoute("/admin/reports")({
  component: lazyRouteComponent($$splitComponentImporter$k, "component"),
  head: () => ({
    meta: [{
      title: "Reports — Admin"
    }]
  })
});
const $$splitComponentImporter$j = () => import("./admin.recommendations-kiP0OEwo.mjs");
const Route$j = createFileRoute("/admin/recommendations")({
  component: lazyRouteComponent($$splitComponentImporter$j, "component"),
  head: () => ({
    meta: [{
      title: "Recommendations — Admin"
    }]
  })
});
const $$splitComponentImporter$i = () => import("./admin.profile-decorations-BZUInlli.mjs");
const Route$i = createFileRoute("/admin/profile-decorations")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component"),
  head: () => ({
    meta: [{
      title: "Profile Decorations — Admin"
    }]
  })
});
const $$splitComponentImporter$h = () => import("./admin.music-review-Bc4YyCpF.mjs");
const Route$h = createFileRoute("/admin/music-review")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component"),
  head: () => ({
    meta: [{
      title: "Music Review Admin - Trey TV"
    }]
  })
});
const $$splitComponentImporter$g = () => import("./admin.games-ByC1M01J.mjs");
const Route$g = createFileRoute("/admin/games")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component"),
  head: () => ({
    meta: [{
      title: "Games Admin - Trey TV"
    }, {
      name: "description",
      content: "Trey TV Games room monitor."
    }]
  })
});
const $$splitComponentImporter$f = () => import("./admin.developer-apps-BJF8f2HJ.mjs");
const Route$f = createFileRoute("/admin/developer-apps")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component"),
  head: () => ({
    meta: [{
      title: "Developer Apps Admin — Trey TV"
    }]
  })
});
const $$splitComponentImporter$e = () => import("./admin.creators-C0qjdBI-.mjs");
const Route$e = createFileRoute("/admin/creators")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component"),
  head: () => ({
    meta: [{
      title: "Creators — Admin"
    }]
  })
});
const $$splitComponentImporter$d = () => import("./admin.content-approval-CzcFL13W.mjs");
const Route$d = createFileRoute("/admin/content-approval")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component"),
  head: () => ({
    meta: [{
      title: "Content Approval — Trey TV Admin"
    }, {
      name: "description",
      content: "Review creator episodes before they go live on Trey TV."
    }]
  })
});
const $$splitComponentImporter$c = () => import("./admin.audit-log-BZw0dWIw.mjs");
const Route$c = createFileRoute("/admin/audit-log")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component"),
  head: () => ({
    meta: [{
      title: "Audit Log — Admin"
    }]
  })
});
const $$splitComponentImporter$b = () => import("./admin.applications-B1Xv6Pey.mjs");
const Route$b = createFileRoute("/admin/applications")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component"),
  head: () => ({
    meta: [{
      title: "Creator Applications — Admin"
    }]
  })
});
const $$splitComponentImporter$a = () => import("./games.interactive-stories.index-rI_h4UHt.mjs");
const Route$a = createFileRoute("/games/interactive-stories/")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component"),
  head: () => ({
    meta: [{
      title: "Interactive Stories · Trey TV Games"
    }, {
      name: "description",
      content: "Browse and play cinematic interactive stories on Trey TV."
    }]
  })
});
const $$splitComponentImporter$9 = () => import("./u._uid.channel-BVnW2byO.mjs");
const Route$9 = createFileRoute("/u/$uid/channel")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component"),
  head: ({
    params
  }) => ({
    meta: [{
      title: `Creator Channel - Trey TV`
    }, {
      name: "description",
      content: `Creator channel on Trey TV. UID ${params.uid}.`
    }]
  })
});
const $$splitComponentImporter$8 = () => import("./oauth.jwks.json-DWB2xghy.mjs");
const Route$8 = createFileRoute("/oauth/jwks/json")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component"),
  head: () => ({
    meta: [{
      title: "Trey TV JWKS"
    }]
  })
});
const $$splitComponentImporter$7 = () => import("./games.interactive-stories._storySlug-fIYCOX1N.mjs");
const Route$7 = createFileRoute("/games/interactive-stories/$storySlug")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component"),
  head: () => ({
    meta: [{
      title: "Playing Story · Trey TV Games"
    }, {
      name: "description",
      content: "Play this interactive story on Trey TV."
    }]
  })
});
const $$splitComponentImporter$6 = () => import("./admin.content-approval._id-h5UjlOwB.mjs");
const Route$6 = createFileRoute("/admin/content-approval/$id")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component"),
  head: () => ({
    meta: [{
      title: "Review Submission — Trey TV Admin"
    }]
  })
});
const $$splitComponentImporter$5 = () => import("./games.interactive-stories.share._shareSlug-BVrmqv8n.mjs");
const Route$5 = createFileRoute("/games/interactive-stories/share/$shareSlug")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component"),
  head: () => ({
    meta: [{
      title: "Shared Ending · Trey TV Interactive Stories"
    }, {
      name: "description",
      content: "Someone shared their story ending with you on Trey TV Interactive Stories."
    }]
  })
});
const $$splitComponentImporter$4 = () => import("./games.interactive-stories._storySlug.playthroughs-C31NU6V-.mjs");
const Route$4 = createFileRoute("/games/interactive-stories/$storySlug/playthroughs")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./games.interactive-stories._storySlug.play-D3vOXJjl.mjs");
const Route$3 = createFileRoute("/games/interactive-stories/$storySlug/play")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./games.interactive-stories._storySlug.characters-CIHUfd1B.mjs");
const Route$2 = createFileRoute("/games/interactive-stories/$storySlug/characters")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./games.interactive-stories._storySlug.branches-DuUUHSgB.mjs");
const Route$1 = createFileRoute("/games/interactive-stories/$storySlug/branches")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./api.fwd.oauth.authorize-to1L8jsq.mjs");
const Route = createFileRoute("/api/fwd/oauth/authorize")({
  component: lazyRouteComponent($$splitComponentImporter, "component"),
  head: () => ({
    meta: [{
      title: "Continue with Trey TV"
    }, {
      name: "description",
      content: "Authorize FWD to use your Trey TV account."
    }]
  })
});
const Char91indexChar93Route = Route$1H.update({
  id: "/index",
  path: "/index",
  getParentRoute: () => Route$1I
});
const SignupRoute = Route$1G.update({
  id: "/signup",
  path: "/signup",
  getParentRoute: () => Route$1I
});
const SettingsRoute = Route$1F.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => Route$1I
});
const RewardsRoute = Route$1E.update({
  id: "/rewards",
  path: "/rewards",
  getParentRoute: () => Route$1I
});
const PrescribeMeRoute = Route$1D.update({
  id: "/prescribe-me",
  path: "/prescribe-me",
  getParentRoute: () => Route$1I
});
const PremiumRoute = Route$1C.update({
  id: "/premium",
  path: "/premium",
  getParentRoute: () => Route$1I
});
const OnboardingRoute = Route$1B.update({
  id: "/onboarding",
  path: "/onboarding",
  getParentRoute: () => Route$1I
});
const NotificationsRoute = Route$1A.update({
  id: "/notifications",
  path: "/notifications",
  getParentRoute: () => Route$1I
});
const MusicReviewRoute = Route$1z.update({
  id: "/music-review",
  path: "/music-review",
  getParentRoute: () => Route$1I
});
const LoginRoute = Route$1y.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$1I
});
const LatestRoute = Route$1x.update({
  id: "/latest",
  path: "/latest",
  getParentRoute: () => Route$1I
});
const InboxRoute = Route$1w.update({
  id: "/inbox",
  path: "/inbox",
  getParentRoute: () => Route$1I
});
const GuideRoute = Route$1v.update({
  id: "/guide",
  path: "/guide",
  getParentRoute: () => Route$1I
});
const GoLiveRoute = Route$1u.update({
  id: "/go-live",
  path: "/go-live",
  getParentRoute: () => Route$1I
});
const GamesRoute = Route$1t.update({
  id: "/games",
  path: "/games",
  getParentRoute: () => Route$1I
});
const ForYouRoute = Route$1s.update({
  id: "/for-you",
  path: "/for-you",
  getParentRoute: () => Route$1I
});
const FollowingRoute = Route$1r.update({
  id: "/following",
  path: "/following",
  getParentRoute: () => Route$1I
});
const ExploreRoute = Route$1q.update({
  id: "/explore",
  path: "/explore",
  getParentRoute: () => Route$1I
});
const EditProfileRoute = Route$1p.update({
  id: "/edit-profile",
  path: "/edit-profile",
  getParentRoute: () => Route$1I
});
const DownloadTvAppRoute = Route$1o.update({
  id: "/download-tv-app",
  path: "/download-tv-app",
  getParentRoute: () => Route$1I
});
const DevelopersRoute = Route$1n.update({
  id: "/developers",
  path: "/developers",
  getParentRoute: () => Route$1I
});
const CreatorStudioRoute = Route$1m.update({
  id: "/creator-studio",
  path: "/creator-studio",
  getParentRoute: () => Route$1I
});
const CreatorHubRoute = Route$1l.update({
  id: "/creator-hub",
  path: "/creator-hub",
  getParentRoute: () => Route$1I
});
const CreateRoute = Route$1k.update({
  id: "/create",
  path: "/create",
  getParentRoute: () => Route$1I
});
const ConfirmEmailRoute = Route$1j.update({
  id: "/confirm-email",
  path: "/confirm-email",
  getParentRoute: () => Route$1I
});
const CollectionsRoute = Route$1i.update({
  id: "/collections",
  path: "/collections",
  getParentRoute: () => Route$1I
});
const ApplyRoute = Route$1h.update({
  id: "/apply",
  path: "/apply",
  getParentRoute: () => Route$1I
});
const ApplicationsRoute = Route$1g.update({
  id: "/applications",
  path: "/applications",
  getParentRoute: () => Route$1I
});
const AnalyticsRoute = Route$1f.update({
  id: "/analytics",
  path: "/analytics",
  getParentRoute: () => Route$1I
});
const AdminRoute = Route$1e.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$1I
});
const ActivityRoute = Route$1d.update({
  id: "/activity",
  path: "/activity",
  getParentRoute: () => Route$1I
});
const AboutRoute = Route$1c.update({
  id: "/about",
  path: "/about",
  getParentRoute: () => Route$1I
});
const IndexRoute = Route$1b.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$1I
});
const LegalIndexRoute = Route$1a.update({
  id: "/legal/",
  path: "/legal/",
  getParentRoute: () => Route$1I
});
const GamesIndexRoute = Route$19.update({
  id: "/",
  path: "/",
  getParentRoute: () => GamesRoute
});
const CreatorStudioIndexRoute = Route$18.update({
  id: "/",
  path: "/",
  getParentRoute: () => CreatorStudioRoute
});
const WatchIdRoute = Route$17.update({
  id: "/watch/$id",
  path: "/watch/$id",
  getParentRoute: () => Route$1I
});
const WatchPartyIdRoute = Route$16.update({
  id: "/watch-party/$id",
  path: "/watch-party/$id",
  getParentRoute: () => Route$1I
});
const UUidRoute = Route$15.update({
  id: "/u/$uid",
  path: "/u/$uid",
  getParentRoute: () => Route$1I
});
const TvActivateRoute = Route$14.update({
  id: "/tv/activate",
  path: "/tv/activate",
  getParentRoute: () => Route$1I
});
const SettingsVerificationRoute = Route$13.update({
  id: "/verification",
  path: "/verification",
  getParentRoute: () => SettingsRoute
});
const SettingsConnectedAppsRoute = Route$12.update({
  id: "/connected-apps",
  path: "/connected-apps",
  getParentRoute: () => SettingsRoute
});
const OnboardingVoiceRoute = Route$11.update({
  id: "/voice",
  path: "/voice",
  getParentRoute: () => OnboardingRoute
});
const OnboardingManualRoute = Route$10.update({
  id: "/manual",
  path: "/manual",
  getParentRoute: () => OnboardingRoute
});
const OnboardingImportScreenshotRoute = Route$$.update({
  id: "/import-screenshot",
  path: "/import-screenshot",
  getParentRoute: () => OnboardingRoute
});
const OauthUserinfoRoute = Route$_.update({
  id: "/oauth/userinfo",
  path: "/oauth/userinfo",
  getParentRoute: () => Route$1I
});
const OauthTokenRoute = Route$Z.update({
  id: "/oauth/token",
  path: "/oauth/token",
  getParentRoute: () => Route$1I
});
const OauthRevokeRoute = Route$Y.update({
  id: "/oauth/revoke",
  path: "/oauth/revoke",
  getParentRoute: () => Route$1I
});
const OauthConsentRoute = Route$X.update({
  id: "/oauth/consent",
  path: "/oauth/consent",
  getParentRoute: () => Route$1I
});
const OauthAuthorizeRoute = Route$W.update({
  id: "/oauth/authorize",
  path: "/oauth/authorize",
  getParentRoute: () => Route$1I
});
const MusicReviewQueueRoute = Route$V.update({
  id: "/queue",
  path: "/queue",
  getParentRoute: () => MusicReviewRoute
});
const LiveIdRoute = Route$U.update({
  id: "/live/$id",
  path: "/live/$id",
  getParentRoute: () => Route$1I
});
const LegalDataDeletionRoute = Route$T.update({
  id: "/legal/data-deletion",
  path: "/legal/data-deletion",
  getParentRoute: () => Route$1I
});
const LegalSlugRoute = Route$S.update({
  id: "/legal/$slug",
  path: "/legal/$slug",
  getParentRoute: () => Route$1I
});
const GamesTrunoRoute = Route$R.update({
  id: "/truno",
  path: "/truno",
  getParentRoute: () => GamesRoute
});
const GamesSpadesRoute = Route$Q.update({
  id: "/spades",
  path: "/spades",
  getParentRoute: () => GamesRoute
});
const GamesInteractiveStoriesRoute = Route$P.update({
  id: "/interactive-stories",
  path: "/interactive-stories",
  getParentRoute: () => GamesRoute
});
const GamesBullshitRoute = Route$O.update({
  id: "/bullshit",
  path: "/bullshit",
  getParentRoute: () => GamesRoute
});
const GamesBlackjackRoute = Route$N.update({
  id: "/blackjack",
  path: "/blackjack",
  getParentRoute: () => GamesRoute
});
const DevelopersDocsRoute = Route$M.update({
  id: "/docs",
  path: "/docs",
  getParentRoute: () => DevelopersRoute
});
const CreatorStudioSubmittedRoute = Route$L.update({
  id: "/submitted",
  path: "/submitted",
  getParentRoute: () => CreatorStudioRoute
});
const CreatorStudioSubmitRoute = Route$K.update({
  id: "/submit",
  path: "/submit",
  getParentRoute: () => CreatorStudioRoute
});
const CreatorStudioSubmissionsRoute = Route$J.update({
  id: "/submissions",
  path: "/submissions",
  getParentRoute: () => CreatorStudioRoute
});
const CreatorStudioSettingsRoute = Route$I.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => CreatorStudioRoute
});
const CreatorStudioScheduleRoute = Route$H.update({
  id: "/schedule",
  path: "/schedule",
  getParentRoute: () => CreatorStudioRoute
});
const CreatorStudioRewardsRoute = Route$G.update({
  id: "/rewards",
  path: "/rewards",
  getParentRoute: () => CreatorStudioRoute
});
const CreatorStudioInteractionsRoute = Route$F.update({
  id: "/interactions",
  path: "/interactions",
  getParentRoute: () => CreatorStudioRoute
});
const CreatorStudioFansRoute = Route$E.update({
  id: "/fans",
  path: "/fans",
  getParentRoute: () => CreatorStudioRoute
});
const CreatorStudioEditRoute = Route$D.update({
  id: "/edit",
  path: "/edit",
  getParentRoute: () => CreatorStudioRoute
});
const CreatorStudioChannelRoute = Route$C.update({
  id: "/channel",
  path: "/channel",
  getParentRoute: () => CreatorStudioRoute
});
const CreatorStudioAnalyticsRoute = Route$B.update({
  id: "/analytics",
  path: "/analytics",
  getParentRoute: () => CreatorStudioRoute
});
const CreatorHubStudioRoute = Route$A.update({
  id: "/studio",
  path: "/studio",
  getParentRoute: () => CreatorHubRoute
});
const ChannelHandleRoute = Route$z.update({
  id: "/channel/$handle",
  path: "/channel/$handle",
  getParentRoute: () => Route$1I
});
const CategorySlugRoute = Route$y.update({
  id: "/category/$slug",
  path: "/category/$slug",
  getParentRoute: () => Route$1I
});
const AuthCallbackRoute = Route$x.update({
  id: "/auth/callback",
  path: "/auth/callback",
  getParentRoute: () => Route$1I
});
const ApplyVerificationRoute = Route$w.update({
  id: "/verification",
  path: "/verification",
  getParentRoute: () => ApplyRoute
});
const ApplyGoVerificationRoute = Route$v.update({
  id: "/go-verification",
  path: "/go-verification",
  getParentRoute: () => ApplyRoute
});
const ApplyCreatorRoute = Route$u.update({
  id: "/creator",
  path: "/creator",
  getParentRoute: () => ApplyRoute
});
const ApplyContentCreatorRoute = Route$t.update({
  id: "/content-creator",
  path: "/content-creator",
  getParentRoute: () => ApplyRoute
});
const AdminZodiacRoute = Route$s.update({
  id: "/zodiac",
  path: "/zodiac",
  getParentRoute: () => AdminRoute
});
const AdminViewAsRoute = Route$r.update({
  id: "/view-as",
  path: "/view-as",
  getParentRoute: () => AdminRoute
});
const AdminVideosRoute = Route$q.update({
  id: "/videos",
  path: "/videos",
  getParentRoute: () => AdminRoute
});
const AdminVerificationRoute = Route$p.update({
  id: "/verification",
  path: "/verification",
  getParentRoute: () => AdminRoute
});
const AdminUsersRoute = Route$o.update({
  id: "/users",
  path: "/users",
  getParentRoute: () => AdminRoute
});
const AdminSiteEditorRoute = Route$n.update({
  id: "/site-editor",
  path: "/site-editor",
  getParentRoute: () => AdminRoute
});
const AdminSettingsRoute = Route$m.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => AdminRoute
});
const AdminRewardsRoute = Route$l.update({
  id: "/rewards",
  path: "/rewards",
  getParentRoute: () => AdminRoute
});
const AdminReportsRoute = Route$k.update({
  id: "/reports",
  path: "/reports",
  getParentRoute: () => AdminRoute
});
const AdminRecommendationsRoute = Route$j.update({
  id: "/recommendations",
  path: "/recommendations",
  getParentRoute: () => AdminRoute
});
const AdminProfileDecorationsRoute = Route$i.update({
  id: "/profile-decorations",
  path: "/profile-decorations",
  getParentRoute: () => AdminRoute
});
const AdminMusicReviewRoute = Route$h.update({
  id: "/music-review",
  path: "/music-review",
  getParentRoute: () => AdminRoute
});
const AdminGamesRoute = Route$g.update({
  id: "/games",
  path: "/games",
  getParentRoute: () => AdminRoute
});
const AdminDeveloperAppsRoute = Route$f.update({
  id: "/developer-apps",
  path: "/developer-apps",
  getParentRoute: () => AdminRoute
});
const AdminCreatorsRoute = Route$e.update({
  id: "/creators",
  path: "/creators",
  getParentRoute: () => AdminRoute
});
const AdminContentApprovalRoute = Route$d.update({
  id: "/content-approval",
  path: "/content-approval",
  getParentRoute: () => AdminRoute
});
const AdminAuditLogRoute = Route$c.update({
  id: "/audit-log",
  path: "/audit-log",
  getParentRoute: () => AdminRoute
});
const AdminApplicationsRoute = Route$b.update({
  id: "/applications",
  path: "/applications",
  getParentRoute: () => AdminRoute
});
const GamesInteractiveStoriesIndexRoute = Route$a.update({
  id: "/",
  path: "/",
  getParentRoute: () => GamesInteractiveStoriesRoute
});
const UUidChannelRoute = Route$9.update({
  id: "/channel",
  path: "/channel",
  getParentRoute: () => UUidRoute
});
const OauthJwksJsonRoute = Route$8.update({
  id: "/oauth/jwks/json",
  path: "/oauth/jwks/json",
  getParentRoute: () => Route$1I
});
const GamesInteractiveStoriesStorySlugRoute = Route$7.update({
  id: "/$storySlug",
  path: "/$storySlug",
  getParentRoute: () => GamesInteractiveStoriesRoute
});
const AdminContentApprovalIdRoute = Route$6.update({
  id: "/$id",
  path: "/$id",
  getParentRoute: () => AdminContentApprovalRoute
});
const GamesInteractiveStoriesShareShareSlugRoute = Route$5.update({
  id: "/share/$shareSlug",
  path: "/share/$shareSlug",
  getParentRoute: () => GamesInteractiveStoriesRoute
});
const GamesInteractiveStoriesStorySlugPlaythroughsRoute = Route$4.update({
  id: "/playthroughs",
  path: "/playthroughs",
  getParentRoute: () => GamesInteractiveStoriesStorySlugRoute
});
const GamesInteractiveStoriesStorySlugPlayRoute = Route$3.update({
  id: "/play",
  path: "/play",
  getParentRoute: () => GamesInteractiveStoriesStorySlugRoute
});
const GamesInteractiveStoriesStorySlugCharactersRoute = Route$2.update({
  id: "/characters",
  path: "/characters",
  getParentRoute: () => GamesInteractiveStoriesStorySlugRoute
});
const GamesInteractiveStoriesStorySlugBranchesRoute = Route$1.update({
  id: "/branches",
  path: "/branches",
  getParentRoute: () => GamesInteractiveStoriesStorySlugRoute
});
const ApiFwdOauthAuthorizeRoute = Route.update({
  id: "/api/fwd/oauth/authorize",
  path: "/api/fwd/oauth/authorize",
  getParentRoute: () => Route$1I
});
const AdminContentApprovalRouteChildren = {
  AdminContentApprovalIdRoute
};
const AdminContentApprovalRouteWithChildren = AdminContentApprovalRoute._addFileChildren(AdminContentApprovalRouteChildren);
const AdminRouteChildren = {
  AdminApplicationsRoute,
  AdminAuditLogRoute,
  AdminContentApprovalRoute: AdminContentApprovalRouteWithChildren,
  AdminCreatorsRoute,
  AdminDeveloperAppsRoute,
  AdminGamesRoute,
  AdminMusicReviewRoute,
  AdminProfileDecorationsRoute,
  AdminRecommendationsRoute,
  AdminReportsRoute,
  AdminRewardsRoute,
  AdminSettingsRoute,
  AdminSiteEditorRoute,
  AdminUsersRoute,
  AdminVerificationRoute,
  AdminVideosRoute,
  AdminViewAsRoute,
  AdminZodiacRoute
};
const AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);
const ApplyRouteChildren = {
  ApplyContentCreatorRoute,
  ApplyCreatorRoute,
  ApplyGoVerificationRoute,
  ApplyVerificationRoute
};
const ApplyRouteWithChildren = ApplyRoute._addFileChildren(ApplyRouteChildren);
const CreatorHubRouteChildren = {
  CreatorHubStudioRoute
};
const CreatorHubRouteWithChildren = CreatorHubRoute._addFileChildren(
  CreatorHubRouteChildren
);
const CreatorStudioRouteChildren = {
  CreatorStudioAnalyticsRoute,
  CreatorStudioChannelRoute,
  CreatorStudioEditRoute,
  CreatorStudioFansRoute,
  CreatorStudioInteractionsRoute,
  CreatorStudioRewardsRoute,
  CreatorStudioScheduleRoute,
  CreatorStudioSettingsRoute,
  CreatorStudioSubmissionsRoute,
  CreatorStudioSubmitRoute,
  CreatorStudioSubmittedRoute,
  CreatorStudioIndexRoute
};
const CreatorStudioRouteWithChildren = CreatorStudioRoute._addFileChildren(
  CreatorStudioRouteChildren
);
const DevelopersRouteChildren = {
  DevelopersDocsRoute
};
const DevelopersRouteWithChildren = DevelopersRoute._addFileChildren(
  DevelopersRouteChildren
);
const GamesInteractiveStoriesStorySlugRouteChildren = {
  GamesInteractiveStoriesStorySlugBranchesRoute,
  GamesInteractiveStoriesStorySlugCharactersRoute,
  GamesInteractiveStoriesStorySlugPlayRoute,
  GamesInteractiveStoriesStorySlugPlaythroughsRoute
};
const GamesInteractiveStoriesStorySlugRouteWithChildren = GamesInteractiveStoriesStorySlugRoute._addFileChildren(
  GamesInteractiveStoriesStorySlugRouteChildren
);
const GamesInteractiveStoriesRouteChildren = {
  GamesInteractiveStoriesStorySlugRoute: GamesInteractiveStoriesStorySlugRouteWithChildren,
  GamesInteractiveStoriesIndexRoute,
  GamesInteractiveStoriesShareShareSlugRoute
};
const GamesInteractiveStoriesRouteWithChildren = GamesInteractiveStoriesRoute._addFileChildren(
  GamesInteractiveStoriesRouteChildren
);
const GamesRouteChildren = {
  GamesBlackjackRoute,
  GamesBullshitRoute,
  GamesInteractiveStoriesRoute: GamesInteractiveStoriesRouteWithChildren,
  GamesSpadesRoute,
  GamesTrunoRoute,
  GamesIndexRoute
};
const GamesRouteWithChildren = GamesRoute._addFileChildren(GamesRouteChildren);
const MusicReviewRouteChildren = {
  MusicReviewQueueRoute
};
const MusicReviewRouteWithChildren = MusicReviewRoute._addFileChildren(
  MusicReviewRouteChildren
);
const OnboardingRouteChildren = {
  OnboardingImportScreenshotRoute,
  OnboardingManualRoute,
  OnboardingVoiceRoute
};
const OnboardingRouteWithChildren = OnboardingRoute._addFileChildren(
  OnboardingRouteChildren
);
const SettingsRouteChildren = {
  SettingsConnectedAppsRoute,
  SettingsVerificationRoute
};
const SettingsRouteWithChildren = SettingsRoute._addFileChildren(
  SettingsRouteChildren
);
const UUidRouteChildren = {
  UUidChannelRoute
};
const UUidRouteWithChildren = UUidRoute._addFileChildren(UUidRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AboutRoute,
  ActivityRoute,
  AdminRoute: AdminRouteWithChildren,
  AnalyticsRoute,
  ApplicationsRoute,
  ApplyRoute: ApplyRouteWithChildren,
  CollectionsRoute,
  ConfirmEmailRoute,
  CreateRoute,
  CreatorHubRoute: CreatorHubRouteWithChildren,
  CreatorStudioRoute: CreatorStudioRouteWithChildren,
  DevelopersRoute: DevelopersRouteWithChildren,
  DownloadTvAppRoute,
  EditProfileRoute,
  ExploreRoute,
  FollowingRoute,
  ForYouRoute,
  GamesRoute: GamesRouteWithChildren,
  GoLiveRoute,
  GuideRoute,
  InboxRoute,
  Char91indexChar93Route,
  LatestRoute,
  LoginRoute,
  MusicReviewRoute: MusicReviewRouteWithChildren,
  NotificationsRoute,
  OnboardingRoute: OnboardingRouteWithChildren,
  PremiumRoute,
  PrescribeMeRoute,
  RewardsRoute,
  SettingsRoute: SettingsRouteWithChildren,
  SignupRoute,
  AuthCallbackRoute,
  CategorySlugRoute,
  ChannelHandleRoute,
  LegalSlugRoute,
  LegalDataDeletionRoute,
  LiveIdRoute,
  OauthAuthorizeRoute,
  OauthConsentRoute,
  OauthRevokeRoute,
  OauthTokenRoute,
  OauthUserinfoRoute,
  TvActivateRoute,
  UUidRoute: UUidRouteWithChildren,
  WatchPartyIdRoute,
  WatchIdRoute,
  LegalIndexRoute,
  OauthJwksJsonRoute,
  ApiFwdOauthAuthorizeRoute
};
const routeTree = Route$1I._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  cap as $,
  ACCENT_COLORS as A,
  Route$1j as B,
  CinematicBackdrop as C,
  Route$17 as D,
  useSubmissions as E,
  STATUS_LABEL as F,
  GoogleIcon as G,
  STATUS_TONE as H,
  Route$16 as I,
  Route$15 as J,
  isTreyOwnerProfile as K,
  LEGAL_LAST_UPDATED as L,
  Route$U as M,
  LEGAL_CONTACT_EMAIL as N,
  getPolicy as O,
  POLICY_INDEX as P,
  Route$S as Q,
  REWARD_TIERS as R,
  SUPPORT_CONTACT as S,
  SHOWS as T,
  EPISODE_TYPES as U,
  CATEGORIES as V,
  MOOD_TAGS as W,
  treyIGenerate as X,
  Route$z as Y,
  isTreyOwnerHandle as Z,
  Route$y as _,
  useCurrentUser as a,
  Toaster as a0,
  Route$9 as a1,
  portraitFallback as a2,
  Route$6 as a3,
  router as a4,
  useAuth$1 as b,
  createBrowserClient as c,
  useRewards as d,
  creators as e,
  Coin as f,
  useSupabaseSession as g,
  useMessages as h,
  haptic as i,
  Route$1w as j,
  currentUser as k,
  useGuide as l,
  useFeed as m,
  useActivity as n,
  useComments as o,
  REACTIONS as p,
  useFollow as q,
  recordUserTrace as r,
  supabase as s,
  triggerCoinGift as t,
  useAuth as u,
  posts as v,
  prescribed as w,
  isValidHexColor as x,
  applyAccentColor as y,
  uploadProfileMedia as z
};
