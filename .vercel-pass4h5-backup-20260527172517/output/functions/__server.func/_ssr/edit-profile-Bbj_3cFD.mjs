import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { A as AppShell, i as isPublicProfileUid } from "./AppShell-BWcCrjwR.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-Bvlih8gu.mjs";
import { a as getMyTopThree, r as reorderTopThree, b as removeFromTopThree, s as searchUsersForTopThree, c as addToTopThree } from "./social-relationships-wtdld6Dy.mjs";
import { u as useGoBack } from "./use-go-back-DIwqgoNo.mjs";
import { b as useAuth$1, u as useAuth, k as currentUser, x as isValidHexColor, y as applyAccentColor, A as ACCENT_COLORS, r as recordUserTrace, c as createBrowserClient, z as uploadProfileMedia } from "./router-BtgGywEC.mjs";
import { u as useMarkFwdGifUsed, F as FwdGifPicker } from "./FwdGifPicker-CLzlV72K.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { ba as CloudUpload, bb as CircleQuestionMark, b3 as Camera, A as ArrowLeft, j as Eye, bc as UserRound, bd as AtSign, ao as Pencil, be as MapPin, a5 as Users, bf as Cake, aM as MessageSquare, S as Sparkles, t as Crown, ai as Star, bg as Instagram, bh as Music2, bi as Youtube, bj as Link2, d as Image, X, p as Shield, G as Globe, i as Lock, bk as Rocket, O as Search, P as Plus } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
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
function AnimatedBanner({
  src,
  fallback,
  className,
  alt = "",
  forceVideo = false
}) {
  const url = src && src.length > 0 ? src : fallback;
  const isVideo = reactExports.useMemo(() => {
    if (forceVideo) return true;
    const u = url.toLowerCase().split("?")[0];
    return /\.(mp4|webm|mov)$/.test(u) || u.startsWith("blob:") && /video/.test(src ?? "");
  }, [forceVideo, url, src]);
  if (isVideo) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "video",
      {
        src: url,
        className,
        autoPlay: true,
        muted: true,
        loop: true,
        playsInline: true,
        preload: "metadata",
        "aria-label": alt
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: url, alt, className, loading: "lazy", decoding: "async" });
}
function TopThreeEditor({ open, onClose, onSave }) {
  const [topThree, setTopThree] = reactExports.useState([]);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [searchResults, setSearchResults] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (open) {
      loadTopThree();
    }
  }, [open]);
  const loadTopThree = async () => {
    setLoading(true);
    const entries = await getMyTopThree();
    setTopThree(entries);
    setLoading(false);
  };
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    const results = await searchUsersForTopThree(query, 10);
    const filtered = results.filter(
      (r) => !topThree.some((t) => t.featured_user_id === r.id)
    );
    setSearchResults(filtered);
  };
  const handleAdd = async (userId) => {
    const nextPosition = topThree.length + 1;
    if (nextPosition > 3) {
      toast.error("Maximum 3 profiles allowed in Top 3");
      return;
    }
    const success = await addToTopThree(userId, nextPosition);
    if (success) {
      await loadTopThree();
      setSearchQuery("");
      setSearchResults([]);
      if (onSave) onSave();
    }
  };
  const handleRemove = async (userId) => {
    const success = await removeFromTopThree(userId);
    if (success) {
      await loadTopThree();
      if (onSave) onSave();
    }
  };
  const handleReorder = async (userId, newPosition) => {
    const success = await reorderTopThree(userId, newPosition);
    if (success) {
      await loadTopThree();
      if (onSave) onSave();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md max-h-[80vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-5" }),
      "Edit Your Top 3"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs tracking-[0.2em] text-muted-foreground mb-3", children: [
          "YOUR TOP 3 (",
          topThree.length,
          "/3)"
        ] }),
        topThree.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 rounded-2xl liquid-glass border border-white/10 text-muted-foreground text-sm", children: "No profiles featured yet. Add up to 3 people you follow or who follow you." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: topThree.map((entry) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          TopThreeEditorItem,
          {
            entry,
            onRemove: handleRemove,
            onReorder: handleReorder,
            maxPosition: topThree.length
          },
          entry.id
        )) })
      ] }),
      topThree.length < 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs tracking-[0.2em] text-muted-foreground mb-3", children: "ADD TO TOP 3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              placeholder: "Search people you follow...",
              value: searchQuery,
              onChange: (e) => handleSearch(e.target.value),
              className: "w-full pl-10 pr-4 py-2.5 rounded-xl glass border border-white/10 text-sm focus:outline-none focus:border-primary/50 transition"
            }
          )
        ] }),
        searchResults.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-1 max-h-48 overflow-y-auto", children: searchResults.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => handleAdd(user.id),
            className: "w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition text-left",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: user.avatar_url || "/default-avatar.png",
                  alt: "",
                  className: "size-8 rounded-full object-cover"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate", children: user.display_name || user.username }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground truncate", children: [
                  "@",
                  user.username
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 text-primary flex-shrink-0" })
            ]
          },
          user.id
        )) })
      ] })
    ] })
  ] }) });
}
function TopThreeEditorItem({
  entry,
  onRemove,
  onReorder,
  maxPosition
}) {
  const displayName = entry.featured_display_name || entry.featured_username || "Unknown";
  const handle = entry.featured_username ? `@${entry.featured_username}` : "";
  const avatar = entry.featured_avatar_url || "/default-avatar.png";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 rounded-xl liquid-glass border border-white/10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => entry.position > 1 && onReorder(entry.featured_user_id, entry.position - 1),
          disabled: entry.position === 1,
          className: "text-xs text-muted-foreground hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed",
          children: "▲"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary", children: entry.position }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => entry.position < maxPosition && onReorder(entry.featured_user_id, entry.position + 1),
          disabled: entry.position === maxPosition,
          className: "text-xs text-muted-foreground hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed",
          children: "▼"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: avatar,
        alt: displayName,
        className: "size-10 rounded-full object-cover ring-2 ring-white/10"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate", children: displayName }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: handle })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => onRemove(entry.featured_user_id),
        className: "p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" })
      }
    )
  ] });
}
const bannerFallback = "/assets/edit-profile-banner-cosmic-DaeI3XSj.jpg";
const RANK_COLORS = ["var(--gold)", "var(--cyan)", "var(--magenta)"];
const accentVariableFor = (hex) => {
  const match = ACCENT_COLORS.find((accent) => accent.hex.toLowerCase() === hex.toLowerCase());
  if (!match) return hex;
  if (match.id === "gold") return "var(--gold)";
  if (match.id === "magenta" || match.id === "pink") return "var(--magenta)";
  if (match.id === "cyan" || match.id === "teal" || match.id === "blue") return "var(--cyan)";
  if (match.id === "purple") return "var(--purple)";
  return hex;
};
function EditProfile() {
  const {
    user,
    updateUser,
    signIn
  } = useAuth$1();
  const {
    user: supabaseUser
  } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const base = user ?? {
    ...currentUser,
    banner: "",
    accent: "#FFC857"
  };
  const [profileUid, setProfileUid] = reactExports.useState(base.uid);
  const baseAccent = isValidHexColor(base.accent) ? base.accent : "#FFC857";
  const [draft, setDraft] = reactExports.useState({
    name: base.name,
    handle: base.handle,
    bio: base.bio,
    tagline: base.tagline ?? "",
    pronouns: base.pronouns ?? "",
    birthday: base.birthday ?? "",
    location: base.location ?? "",
    link: base.link ?? "",
    favoriteGenres: base.favoriteGenres ?? "",
    favoriteCreators: base.favoriteCreators ?? "",
    socialInstagram: base.socialInstagram ?? "",
    socialTikTok: base.socialTikTok ?? base.socialTiktok ?? "",
    socialYouTube: base.socialYouTube ?? "",
    profileVisibility: base.profileVisibility ?? "public",
    showLocation: base.showLocation ?? true,
    showBirthday: base.showBirthday ?? false,
    avatar: base.avatar,
    banner: base.banner || "",
    accent: baseAccent
  });
  const [previewOpen, setPreviewOpen] = reactExports.useState(false);
  const [saving, setSaving] = reactExports.useState(false);
  const [avatarUpload, setAvatarUpload] = reactExports.useState(null);
  const [bannerUpload, setBannerUpload] = reactExports.useState(null);
  const [topThreeOpen, setTopThreeOpen] = reactExports.useState(false);
  const markUsed = useMarkFwdGifUsed();
  const [gifOfDay, setGifOfDay] = reactExports.useState(() => {
    if (base.gifOfDayUrl) {
      return {
        gif_id: base.gifOfDayId || "",
        url: base.gifOfDayUrl,
        preview_url: base.gifOfDayPosterUrl ?? void 0,
        title: void 0
      };
    }
    return null;
  });
  const [gifOfDayCaption, setGifOfDayCaption] = reactExports.useState(() => base.gifOfDayCaption ?? "");
  const [showGifOfDayPicker, setShowGifOfDayPicker] = reactExports.useState(false);
  const avatarFile = reactExports.useRef(null);
  const bannerFile = reactExports.useRef(null);
  const goBack = useGoBack(`/u/${base.uid}`);
  reactExports.useEffect(() => {
    if (base.uid) setProfileUid(base.uid);
    if (base.gifOfDayUrl) {
      setGifOfDay({
        gif_id: base.gifOfDayId || "",
        url: base.gifOfDayUrl,
        preview_url: base.gifOfDayPosterUrl ?? void 0,
        title: void 0
      });
      setGifOfDayCaption(base.gifOfDayCaption ?? "");
    }
  }, [base.uid, base.gifOfDayUrl, base.gifOfDayId, base.gifOfDayPosterUrl, base.gifOfDayCaption]);
  reactExports.useEffect(() => {
    if (isValidHexColor(draft.accent)) applyAccentColor(draft.accent);
  }, [draft.accent]);
  const pickFile = (ref) => {
    ref.current?.click();
  };
  const handleFileChange = (event, key) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    const isBanner = key === "banner";
    const isAllowedMedia = file.type.startsWith("image/") || isBanner && file.type.startsWith("video/");
    const maxSize = isBanner ? 25 * 1024 * 1024 : 8 * 1024 * 1024;
    if (!isAllowedMedia) {
      toast.error(isBanner ? "Choose an image or short video for your banner." : "Choose an image for your avatar.");
      return;
    }
    if (file.size > maxSize) {
      toast.error(isBanner ? "Banner files must be under 25 MB." : "Avatar files must be under 8 MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    setDraft((d) => {
      const previousUrl = d[key];
      if (previousUrl?.startsWith("blob:")) URL.revokeObjectURL(previousUrl);
      return {
        ...d,
        [key]: url
      };
    });
    if (key === "avatar") {
      setAvatarUpload(file);
      toast.success("Avatar ready to save");
      return;
    }
    setBannerUpload(file);
    recordUserTrace({
      userUid: base.uid,
      action: "profile.banner_update",
      targetType: "profile",
      targetId: base.uid,
      details: {
        fileType: file.type
      }
    });
    toast.success(/gif|video/.test(file.type) ? "Animated banner ready - it'll loop forever" : "Banner ready to save");
  };
  const isAnimatedBanner = (() => {
    const b = (draft.banner || "").toLowerCase();
    return b.endsWith(".gif") || /\.(mp4|webm|mov)$/.test(b.split("?")[0]) || b.startsWith("blob:");
  })();
  const save = async () => {
    if (saving) return;
    if (!isValidHexColor(draft.accent)) {
      toast.error("Choose a valid profile accent color.");
      return;
    }
    setSaving(true);
    let persistedAvatar = draft.avatar;
    let persistedBanner = draft.banner;
    let savedPublicProfileUid = profileUid || base.uid;
    try {
      if (supabaseUser) {
        const supabase = createBrowserClient();
        if (avatarUpload) {
          const uploaded = await uploadProfileMedia(supabaseUser.id, avatarUpload, "avatar");
          persistedAvatar = uploaded.url;
        }
        if (bannerUpload) {
          const uploaded = await uploadProfileMedia(supabaseUser.id, bannerUpload, "banner");
          persistedBanner = uploaded.url;
        }
        const {
          data: existingProfile
        } = await supabase.from("profiles").select("public_profile_uid").eq("id", supabaseUser.id).maybeSingle();
        const existingPublicUid = existingProfile?.public_profile_uid;
        const profileUpdate = {
          display_name: draft.name,
          username: draft.handle,
          bio: draft.bio,
          location: draft.location,
          link_url: draft.link,
          tagline: draft.tagline,
          pronouns: draft.pronouns,
          birthday: draft.birthday || null,
          favorite_genres: draft.favoriteGenres,
          favorite_creators: draft.favoriteCreators,
          social_instagram: draft.socialInstagram,
          social_tiktok: draft.socialTikTok,
          social_youtube: draft.socialYouTube,
          profile_visibility: draft.profileVisibility,
          show_location: draft.showLocation,
          show_birthday: draft.showBirthday,
          avatar_url: persistedAvatar,
          banner_url: persistedBanner,
          profile_accent_color: draft.accent,
          updated_at: (/* @__PURE__ */ new Date()).toISOString(),
          gif_of_day_id: gifOfDay ? gifOfDay.gif_id ?? null : null,
          gif_of_day_url: gifOfDay ? gifOfDay.url : null,
          gif_of_day_poster_url: gifOfDay ? gifOfDay.preview_url ?? null : null,
          gif_of_day_provider: gifOfDay ? "fwd" : null,
          gif_of_day_caption: gifOfDay ? gifOfDayCaption.trim() || null : null,
          gif_of_day_set_at: gifOfDay ? (/* @__PURE__ */ new Date()).toISOString() : null
        };
        if (isPublicProfileUid(existingPublicUid)) {
          savedPublicProfileUid = existingPublicUid;
        } else {
          const {
            data: generatedUid,
            error: uidError
          } = await supabase.rpc("generate_trey_public_profile_uid");
          if (uidError) throw uidError;
          if (isPublicProfileUid(generatedUid)) {
            savedPublicProfileUid = generatedUid;
            profileUpdate.public_profile_uid = generatedUid;
            profileUpdate.site_uid = generatedUid;
          }
        }
        const {
          data: savedProfile,
          error
        } = await supabase.from("profiles").update(profileUpdate).eq("id", supabaseUser.id).select("public_profile_uid, avatar_url, banner_url, display_name, username, bio, location, link_url, profile_accent_color").single();
        if (error) {
          if (error.code === "23505") {
            toast("Username already taken - try another.");
            return;
          }
          console.error("Supabase update error:", error);
          toast(`Failed to save profile: ${error.message || error.details || "Unknown error"}`);
          return;
        }
        if (isPublicProfileUid(savedProfile?.public_profile_uid)) {
          savedPublicProfileUid = savedProfile.public_profile_uid;
        }
        setProfileUid(savedPublicProfileUid);
        qc.invalidateQueries({
          queryKey: ["current-user"]
        });
      }
      if (!user) signIn("creator");
      updateUser({
        name: draft.name,
        handle: draft.handle,
        bio: draft.bio,
        tagline: draft.tagline,
        pronouns: draft.pronouns,
        birthday: draft.birthday,
        location: draft.location,
        link: draft.link,
        favoriteGenres: draft.favoriteGenres,
        favoriteCreators: draft.favoriteCreators,
        socialInstagram: draft.socialInstagram,
        socialTikTok: draft.socialTikTok,
        socialYouTube: draft.socialYouTube,
        profileVisibility: draft.profileVisibility,
        showLocation: draft.showLocation,
        showBirthday: draft.showBirthday,
        uid: savedPublicProfileUid,
        avatar: persistedAvatar,
        banner: persistedBanner,
        gifOfDayId: gifOfDay ? gifOfDay.gif_id ?? null : null,
        gifOfDayUrl: gifOfDay ? gifOfDay.url : null,
        gifOfDayPosterUrl: gifOfDay ? gifOfDay.preview_url ?? null : null,
        gifOfDayProvider: gifOfDay ? "fwd" : null,
        gifOfDayCaption: gifOfDay ? gifOfDayCaption.trim() || null : null,
        gifOfDaySetAt: gifOfDay ? (/* @__PURE__ */ new Date()).toISOString() : null
      });
      if (gifOfDay) {
        markUsed.mutate({
          id: gifOfDay.gif_id,
          gif_url: gifOfDay.url
        });
      }
      recordUserTrace({
        userUid: savedPublicProfileUid,
        action: "profile.update",
        targetType: "profile",
        targetId: savedPublicProfileUid,
        details: {
          handle: draft.handle,
          visibility: draft.profileVisibility
        }
      });
      toast.success("Profile published");
      setTimeout(() => nav({
        to: "/u/$uid",
        params: {
          uid: savedPublicProfileUid
        }
      }), 350);
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };
  const accentVar = accentVariableFor(draft.accent);
  const bannerSrc = draft.banner || "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { wide: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "edit-profile-redesign min-h-screen text-foreground pb-36 lg:pb-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative -mx-0 overflow-hidden rounded-b-[2rem] lg:rounded-[2rem]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-56 w-full sm:h-64 lg:h-72", children: [
        bannerSrc ? /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedBanner, { src: bannerSrc, fallback: bannerFallback, alt: "Profile banner", className: "absolute inset-0 size-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_20%,rgba(var(--profile-accent-rgb),0.2),transparent_35%),linear-gradient(135deg,#090b17,#171024_45%,#05070d)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed border-white/20 px-5 py-4 text-center backdrop-blur-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CloudUpload, { className: "mx-auto mb-2 size-7 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Upload Banner" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "JPG, PNG, GIF, MP4" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "absolute left-4 top-4 grid size-9 place-items-center rounded-full border border-white/15 bg-black/45 backdrop-blur-md", "aria-label": "Help", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleQuestionMark, { className: "size-4 text-muted-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => pickFile(bannerFile), className: "absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-3 py-2 text-xs font-medium text-foreground backdrop-blur-md transition hover:border-gold/60 hover:text-gold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CloudUpload, { className: "size-4" }),
          " Change banner"
        ] }),
        isAnimatedBanner && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-4 left-4 rounded-full border border-magenta/40 bg-magenta/15 px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-magenta backdrop-blur-md", children: "LOOPING" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: bannerFile, type: "file", accept: "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm", className: "hidden", onChange: (event) => handleFileChange(event, "banner") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto w-full max-w-2xl px-4 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative -mt-16 flex items-end gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -inset-4 -z-10 rounded-full blur-2xl opacity-60", style: {
              background: `radial-gradient(closest-side, color-mix(in oklab, ${accentVar} 70%, transparent), transparent 70%)`
            }, "aria-hidden": true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -inset-1.5 -z-10 rounded-full", style: {
              background: `conic-gradient(from 0deg, transparent 0deg, ${accentVar} 90deg, transparent 220deg, transparent 360deg)`,
              animation: "edit-profile-orbit 14s linear infinite",
              filter: "blur(0.4px)"
            }, "aria-hidden": true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative rounded-full p-[2px] bg-[var(--edit-gradient-accent-ring)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: draft.avatar, alt: "Avatar", className: "size-28 rounded-full border-4 border-background object-cover" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => pickFile(avatarFile), className: "absolute -bottom-1 -right-1 grid size-9 place-items-center rounded-full border-2 border-background bg-gradient-to-br from-gold to-amber-600 text-primary-foreground gold-glow", "aria-label": "Change avatar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "size-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: avatarFile, type: "file", accept: "image/*", className: "hidden", onChange: (event) => handleFileChange(event, "avatar") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => pickFile(avatarFile), className: "flex-1 pb-2 text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Change Avatar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] tracking-wider text-muted-foreground", children: "JPG, PNG, GIF" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "glass-panel mb-2 flex items-center gap-2 rounded-full border border-gold/30 px-3 py-1.5 text-[11px] font-medium tracking-wider text-gold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-gold animate-pulse" }),
            " EDITING"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: goBack, className: "glass-panel grid size-10 place-items-center rounded-full", "aria-label": "Back", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-medium tracking-[0.3em] text-muted-foreground", children: "PROFILE" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Edit Profile" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPreviewOpen(true), className: `glass-panel grid size-10 place-items-center rounded-full ${previewOpen ? "text-gold neon-static" : ""}`, "aria-label": "Preview changes", style: {
            ["--neon"]: accentVar
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "neon-border panel-sheen glass-panel relative mt-5 overflow-hidden rounded-3xl p-2", style: {
          ["--neon"]: "var(--cyan)",
          ["--accent-2"]: "var(--purple)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "aurora-bg", "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shimmer-sweep", style: {
            ["--shimmer-delay"]: "0s"
          }, "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-px overflow-hidden rounded-2xl", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "size-4" }), label: "DISPLAY NAME", value: draft.name, onChange: (name) => setDraft((d) => ({
              ...d,
              name
            })) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AtSign, { className: "size-4" }), label: "USERNAME", value: draft.handle, onChange: (handle) => setDraft((d) => ({
              ...d,
              handle: handle.replace(/\s+/g, "").toLowerCase()
            })) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "size-4" }), label: "PROFILE TAGLINE", value: draft.tagline, onChange: (tagline) => setDraft((d) => ({
              ...d,
              tagline
            })), placeholder: "Add a short tagline..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-4" }), label: "LOCATION", value: draft.location, onChange: (location) => setDraft((d) => ({
              ...d,
              location
            })), placeholder: "City, Country" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-4" }), label: "PRONOUNS", value: draft.pronouns, onChange: (pronouns) => setDraft((d) => ({
              ...d,
              pronouns
            })), placeholder: "Add pronouns..." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Cake, { className: "size-4" }), label: "BIRTHDAY", value: draft.birthday, type: "date", onChange: (birthday) => setDraft((d) => ({
              ...d,
              birthday
            })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "neon-border panel-sheen glass-panel relative mt-5 overflow-hidden rounded-3xl p-5", style: {
          ["--neon"]: accentVar,
          ["--accent-2"]: "var(--cyan)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "aurora-bg", "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shimmer-sweep", style: {
            ["--shimmer-delay"]: "1.5s"
          }, "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-medium tracking-[0.25em] text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "size-4", style: {
                color: accentVar
              } }),
              " BIO"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] tracking-wider text-muted-foreground", children: [
              draft.bio.length,
              "/240"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: draft.bio, onChange: (e) => setDraft((d) => ({
            ...d,
            bio: e.target.value.slice(0, 240)
          })), rows: 4, placeholder: "Tell people what you're about...", className: "w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-transparent focus:ring-2", style: {
            ["--tw-ring-color"]: `color-mix(in oklab, ${accentVar} 55%, transparent)`
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-1 text-[11px] text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3 text-gold" }),
            " AI can polish this for you"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "neon-border panel-sheen glass-panel relative mt-5 overflow-hidden rounded-3xl p-5", style: {
          ["--neon"]: "var(--gold)",
          ["--accent-2"]: "var(--magenta)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "aurora-bg", "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shimmer-sweep", style: {
            ["--shimmer-delay"]: "2.2s"
          }, "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-medium tracking-[0.25em] text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-4 text-gold" }),
              " TOP 3 FRIENDS"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTopThreeOpen(true), className: "rounded-full border border-gold/30 px-3 py-1 text-[11px] font-semibold text-gold transition hover:bg-gold/10", children: "Manage" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setTopThreeOpen(true), className: "group relative flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-2 transition hover:border-white/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute -top-px left-1/2 -translate-x-1/2 rounded-b-md px-2 py-0.5 text-[10px] font-bold tracking-widest", style: {
              background: RANK_COLORS[i],
              color: "#0a0a0a"
            }, children: [
              "#",
              i + 1
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-14 place-items-center rounded-full border border-dashed border-white/20 bg-white/[0.02]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-5 text-muted-foreground" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-[10px] tracking-wider text-muted-foreground", children: "EDIT TOP 3" })
          ] }, i)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "neon-border panel-sheen glass-panel relative mt-5 overflow-hidden rounded-3xl p-5", style: {
          ["--neon"]: "var(--purple)",
          ["--accent-2"]: "var(--cyan)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "aurora-bg", "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shimmer-sweep", style: {
            ["--shimmer-delay"]: "3.7s"
          }, "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2 text-xs font-medium tracking-[0.25em] text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "size-4", style: {
              color: "var(--purple)"
            } }),
            " SOCIAL HANDLES"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SocialField, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Instagram, { className: "size-4" }), platform: "Instagram", prefix: "@", value: draft.socialInstagram, onChange: (socialInstagram) => setDraft((d) => ({
              ...d,
              socialInstagram
            })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SocialField, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Music2, { className: "size-4" }), platform: "TikTok", prefix: "@", value: draft.socialTikTok, onChange: (socialTikTok) => setDraft((d) => ({
              ...d,
              socialTikTok
            })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SocialField, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Youtube, { className: "size-4" }), platform: "YouTube", prefix: "/", value: draft.socialYouTube, onChange: (socialYouTube) => setDraft((d) => ({
              ...d,
              socialYouTube
            })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SocialField, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "size-4" }), platform: "Website", prefix: "", value: draft.link, onChange: (link) => setDraft((d) => ({
              ...d,
              link
            })), placeholder: "https://" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "neon-border panel-sheen glass-panel relative mt-5 overflow-hidden rounded-3xl p-5", style: {
          ["--neon"]: "var(--cyan)",
          ["--accent-2"]: "var(--gold)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "aurora-bg", "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shimmer-sweep", style: {
            ["--shimmer-delay"]: "2.5s"
          }, "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2 text-xs font-medium tracking-[0.25em] text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "size-4 text-[var(--cyan)]" }),
            " GIF OF THE DAY"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-xs text-muted-foreground", children: "Pick a GIF from your FWD library to feature on your profile. Changes save when you click Save Changes." }),
          gifOfDay ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10", children: [
              gifOfDay.preview_url && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: gifOfDay.preview_url, alt: "", "aria-hidden": true, className: "absolute inset-0 h-full w-full object-cover opacity-25 blur-sm" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: gifOfDay.url, alt: "GIF of the Day", className: "relative h-full w-full object-cover" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setGifOfDay(null), className: "absolute right-1 top-1 size-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black", "aria-label": "Remove GIF of the Day", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: gifOfDayCaption, onChange: (e) => setGifOfDayCaption(e.target.value), placeholder: "Add a caption… (optional)", maxLength: 80, className: "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:border-primary/60" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowGifOfDayPicker(true), className: "mt-2 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2", children: "Change GIF" })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setShowGifOfDayPicker(true), className: "flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-6 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground hover:bg-white/[0.06]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "size-5" }),
            "Choose your GIF of the Day from FWD"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "neon-border panel-sheen glass-panel relative mt-5 overflow-hidden rounded-3xl p-5", style: {
          ["--neon"]: "var(--magenta)",
          ["--accent-2"]: "var(--gold)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "aurora-bg", "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shimmer-sweep", style: {
            ["--shimmer-delay"]: "3s"
          }, "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2 text-xs font-medium tracking-[0.25em] text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "size-4 text-gold" }),
            " PROFILE PRIVACY"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PrivacyPill, { active: draft.profileVisibility === "public", onClick: () => setDraft((d) => ({
              ...d,
              profileVisibility: "public"
            })), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "size-4" }), label: "Public" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PrivacyPill, { active: draft.profileVisibility === "members_only", onClick: () => setDraft((d) => ({
              ...d,
              profileVisibility: "members_only"
            })), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-4" }), label: "Members" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PrivacyPill, { active: draft.profileVisibility === "private", onClick: () => setDraft((d) => ({
              ...d,
              profileVisibility: "private"
            })), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-4" }), label: "Private" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-4" }), label: "Show location on profile", checked: draft.showLocation, onChange: (showLocation) => setDraft((d) => ({
              ...d,
              showLocation
            })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Cake, { className: "size-4" }), label: "Show birthday on profile", checked: draft.showBirthday, onChange: (showBirthday) => setDraft((d) => ({
              ...d,
              showBirthday
            })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "neon-border panel-sheen glass-panel relative mt-5 overflow-hidden rounded-3xl p-5", style: {
          ["--neon"]: accentVar,
          ["--accent-2"]: "var(--cyan)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "aurora-bg", "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shimmer-sweep", style: {
            ["--shimmer-delay"]: "4.5s"
          }, "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2 text-xs font-medium tracking-[0.25em] text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4 text-gold" }),
            " PROFILE ACCENT"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-4", children: ACCENT_COLORS.slice(0, 8).map((a) => {
            const active = a.hex === draft.accent;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setDraft((d) => ({
              ...d,
              accent: a.hex
            })), className: `glass-panel flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-2 text-[12px] font-medium transition ${active ? "neon-static" : "border-white/10 text-foreground/80 hover:border-white/25"}`, style: {
              ["--neon"]: a.hex,
              ...active ? {
                color: a.hex,
                borderColor: `color-mix(in oklab, ${a.hex} 70%, transparent)`
              } : {}
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2.5 rounded-full", style: {
                background: a.hex,
                boxShadow: `0 0 10px ${a.hex}`
              } }),
              a.label
            ] }, a.id);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "neon-border panel-sheen glass-panel relative mt-5 overflow-hidden rounded-3xl p-3", style: {
          ["--neon"]: "var(--gold)",
          ["--accent-2"]: accentVar
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "aurora-bg", "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shimmer-sweep", style: {
            ["--shimmer-delay"]: "6s"
          }, "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setPreviewOpen(true), className: "neon-border rounded-2xl bg-white/[0.04] px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-white/[0.08]", style: {
              ["--neon"]: accentVar
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-4" }),
              " Preview Changes"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: save, disabled: saving, className: "neon-border rounded-2xl bg-gradient-to-r from-amber-300 via-gold to-amber-500 px-4 py-3 text-sm font-semibold text-black transition disabled:cursor-wait disabled:opacity-70", style: {
              ["--neon"]: "var(--gold)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Rocket, { className: "size-4" }),
              " ",
              saving ? "Saving..." : "Save Changes"
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-center text-[11px] text-muted-foreground", children: "Changes are previewed live. Save when you're ready." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ProfilePreviewModal, { open: previewOpen, onClose: () => setPreviewOpen(false), draft, profileUid, accentVar, bannerFallback }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TopThreeEditor, { open: topThreeOpen, onClose: () => setTopThreeOpen(false), onSave: () => qc.invalidateQueries({
      queryKey: ["current-user"]
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FwdGifPicker, { open: showGifOfDayPicker, context: "profile", treyTvUid: profileUid, onClose: () => setShowGifOfDayPicker(false), onSelect: (gif) => {
      setGifOfDay(gif);
      setShowGifOfDayPicker(false);
    } })
  ] });
}
function ProfilePreviewModal({
  open,
  onClose,
  draft,
  profileUid,
  accentVar,
  bannerFallback: bannerFallback2
}) {
  if (!open) return null;
  const bannerSrc = draft.banner || "";
  const showLocation = draft.showLocation && draft.location;
  const socials = [draft.socialInstagram && `Instagram @${draft.socialInstagram.replace(/^@/, "")}`, draft.socialTikTok && `TikTok @${draft.socialTikTok.replace(/^@/, "")}`, draft.socialYouTube && `YouTube /${draft.socialYouTube.replace(/^\//, "")}`, draft.link].filter(Boolean);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "edit-profile-redesign fixed inset-0 z-[10080] overflow-y-auto bg-black/75 px-4 py-5 text-foreground backdrop-blur-xl sm:py-8", role: "dialog", "aria-modal": "true", "aria-label": "Profile preview", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-medium tracking-[0.3em] text-muted-foreground", children: "LIVE PREVIEW" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: "Profile Page" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "glass-panel grid size-10 place-items-center rounded-full", "aria-label": "Close profile preview", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "neon-border panel-sheen glass-panel relative overflow-hidden rounded-[2rem]", style: {
      ["--neon"]: accentVar,
      ["--accent-2"]: "var(--cyan)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "aurora-bg", "aria-hidden": true }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-48 overflow-hidden rounded-t-[2rem] sm:h-64", children: [
        bannerSrc ? /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedBanner, { src: bannerSrc, fallback: bannerFallback2, alt: "Profile banner preview", className: "absolute inset-0 size-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(var(--profile-accent-rgb),0.2),transparent_35%),linear-gradient(135deg,#090b17,#171024_45%,#05070d)]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative px-5 pb-6 sm:px-7", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "-mt-14 flex flex-wrap items-end gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: draft.avatar, alt: "Profile avatar preview", className: "size-28 rounded-full border-4 border-background object-cover ring-2 ring-white/15" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "truncate text-3xl font-black", children: draft.name || "Your name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "truncate text-sm text-muted-foreground", children: [
              "@",
              draft.handle || "username"
            ] })
          ] })
        ] }),
        draft.tagline && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-base font-semibold", style: {
          color: accentVar
        }, children: draft.tagline }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/85", children: draft.bio || "Your bio preview will appear here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground", children: [
          showLocation && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "glass-panel flex items-center gap-1.5 rounded-full px-3 py-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-3.5" }),
            " ",
            draft.location
          ] }),
          draft.pronouns && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "glass-panel rounded-full px-3 py-1.5", children: draft.pronouns }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "glass-panel rounded-full px-3 py-1.5", children: [
            "/u/",
            profileUid
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "glass-panel rounded-full px-3 py-1.5 capitalize", children: draft.profileVisibility.replace("_", " ") })
        ] }),
        socials.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 grid gap-2 sm:grid-cols-2", children: socials.map((social) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground/85", children: social }, social)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-foreground", children: "Message" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-black", style: {
            background: accentVar
          }, children: "Follow" })
        ] })
      ] })
    ] })
  ] }) });
}
function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "group flex items-start gap-3 bg-white/[0.02] p-4 transition hover:bg-white/[0.05] focus-within:bg-white/[0.06] focus-within:ring-1 focus-within:ring-gold/40", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid size-8 shrink-0 place-items-center rounded-full bg-white/5 text-muted-foreground group-focus-within:text-gold", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[10px] font-medium tracking-[0.2em] text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type, value, onChange: (e) => onChange(e.target.value), placeholder, className: "mt-1 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70" })
    ] })
  ] });
}
function PrivacyPill({
  active,
  onClick,
  icon,
  label
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick, className: `glass-panel flex items-center justify-center gap-2 rounded-full px-2 py-2.5 text-xs transition sm:px-3 sm:text-sm ${active ? "border-2 border-gold text-gold gold-glow" : "border border-white/10 text-foreground/80"}`, children: [
    icon,
    " ",
    label
  ] });
}
function ToggleRow({
  icon,
  label,
  checked,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel flex items-center gap-3 rounded-2xl px-4 py-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-sm", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onChange(!checked), className: `relative h-6 w-11 rounded-full transition ${checked ? "bg-gold gold-glow" : "bg-white/15"}`, "aria-pressed": checked, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute top-0.5 size-5 rounded-full bg-white shadow transition ${checked ? "left-[22px]" : "left-0.5"}` }) })
  ] });
}
function SocialField({
  icon,
  platform,
  prefix,
  value,
  onChange,
  placeholder
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 transition hover:border-white/20 focus-within:border-purple/60 focus-within:bg-white/[0.06]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid size-8 shrink-0 place-items-center rounded-full bg-white/5 text-muted-foreground group-focus-within:text-foreground", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[10px] font-medium tracking-[0.2em] text-muted-foreground", children: platform.toUpperCase() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-0.5 flex items-center gap-1", children: [
        prefix && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: prefix }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value, onChange: (e) => onChange(e.target.value), placeholder: placeholder ?? `your${platform.toLowerCase().replace(/[^a-z]/g, "")}`, className: "w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60" })
      ] })
    ] })
  ] });
}
export {
  EditProfile as component
};
