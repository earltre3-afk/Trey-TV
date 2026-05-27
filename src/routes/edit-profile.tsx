import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties, type ChangeEvent, type ReactNode, type RefObject } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  AtSign,
  Cake,
  Camera,
  Crown,
  Eye,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Instagram,
  Link2,
  Lock,
  MapPin,
  MessageSquare,
  Music2,
  Pencil,
  Rocket,
  Shield,
  Sparkles,
  Star,
  UploadCloud,
  UserRound,
  Users,
  X,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { AnimatedBanner } from "@/components/profile/AnimatedBanner";
import { TopThreeEditor } from "@/components/profile/TopThreeEditor";
import { useGoBack } from "@/hooks/use-go-back";
import { ACCENT_COLORS, applyAccentColor, isValidHexColor } from "@/hooks/use-accent-color";
import { useAuth } from "@/lib/auth";
import { useAuth as useSupabaseAuth } from "@/hooks/use-auth";
import { currentUser } from "@/lib/mock-data";
import { createBrowserClient } from "@/lib/supabase-browser";
import { uploadProfileMedia } from "@/lib/supabase-storage";
import { recordUserTrace } from "@/lib/user-trace";
import { isPublicProfileUid } from "@/lib/profile-links";
import bannerFallback from "@/assets/edit-profile-banner-cosmic.jpg";
import { FwdGifPicker } from "@/components/fwd/FwdGifPicker";
import type { FwdGifPayload } from "@/lib/fwd/picker";
import { useMarkFwdGifUsed } from "@/lib/fwd-gif-api";

export const Route = createFileRoute("/edit-profile")({
  component: EditProfile,
  head: () => ({
    meta: [
      { title: "Edit Profile - Trey TV" },
      { name: "description", content: "Edit your Trey TV profile: name, handle, bio, avatar, banner, accent." },
    ],
  }),
});

type ProfileVisibility = "public" | "members_only" | "private";

const RANK_COLORS = ["var(--gold)", "var(--cyan)", "var(--magenta)"] as const;

type ProfileDraft = {
  name: string;
  handle: string;
  bio: string;
  tagline: string;
  pronouns: string;
  birthday: string;
  location: string;
  link: string;
  favoriteGenres: string;
  favoriteCreators: string;
  socialInstagram: string;
  socialTikTok: string;
  socialYouTube: string;
  profileVisibility: ProfileVisibility;
  showLocation: boolean;
  showBirthday: boolean;
  avatar: string;
  banner: string;
  accent: string;
};

const accentVariableFor = (hex: string) => {
  const match = ACCENT_COLORS.find((accent) => accent.hex.toLowerCase() === hex.toLowerCase());
  if (!match) return hex;
  if (match.id === "gold") return "var(--gold)";
  if (match.id === "magenta" || match.id === "pink") return "var(--magenta)";
  if (match.id === "cyan" || match.id === "teal" || match.id === "blue") return "var(--cyan)";
  if (match.id === "purple") return "var(--purple)";
  return hex;
};

function EditProfile() {
  const { user, updateUser, signIn } = useAuth();
  const { user: supabaseUser } = useSupabaseAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const base = user ?? { ...currentUser, role: "creator" as const, banner: "", accent: "#FFC857" as const, rewards: { points: 0, tier: "GOLD" as const } };
  const [profileUid, setProfileUid] = useState(base.uid);
  const baseAccent = isValidHexColor((base as any).accent) ? (base as any).accent : "#FFC857";

  const [draft, setDraft] = useState<ProfileDraft>({
    name: base.name,
    handle: base.handle,
    bio: base.bio,
    tagline: (base as any).tagline ?? "",
    pronouns: (base as any).pronouns ?? "",
    birthday: (base as any).birthday ?? "",
    location: base.location ?? "",
    link: base.link ?? "",
    favoriteGenres: (base as any).favoriteGenres ?? "",
    favoriteCreators: (base as any).favoriteCreators ?? "",
    socialInstagram: (base as any).socialInstagram ?? "",
    socialTikTok: (base as any).socialTikTok ?? (base as any).socialTiktok ?? "",
    socialYouTube: (base as any).socialYouTube ?? "",
    profileVisibility: ((base as any).profileVisibility ?? "public") as ProfileVisibility,
    showLocation: (base as any).showLocation ?? true,
    showBirthday: (base as any).showBirthday ?? false,
    avatar: base.avatar,
    banner: (base as any).banner || "",
    accent: baseAccent,
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUpload, setAvatarUpload] = useState<File | null>(null);
  const [bannerUpload, setBannerUpload] = useState<File | null>(null);
  const [topThreeOpen, setTopThreeOpen] = useState(false);
  const markUsed = useMarkFwdGifUsed();
  const [gifOfDay, setGifOfDay] = useState<FwdGifPayload | null>(() => {
    if (base.gifOfDayUrl) {
      return {
        gif_id: base.gifOfDayId || "",
        url: base.gifOfDayUrl,
        preview_url: base.gifOfDayPosterUrl ?? undefined,
        title: undefined,
      };
    }
    return null;
  });
  const [gifOfDayCaption, setGifOfDayCaption] = useState(() => base.gifOfDayCaption ?? "");
  const [showGifOfDayPicker, setShowGifOfDayPicker] = useState(false);
  const avatarFile = useRef<HTMLInputElement | null>(null);
  const bannerFile = useRef<HTMLInputElement | null>(null);
  const goBack = useGoBack(`/u/${base.uid}`);

  useEffect(() => {
    if (base.uid) setProfileUid(base.uid);
    if (base.gifOfDayUrl) {
      setGifOfDay({
        gif_id: base.gifOfDayId || "",
        url: base.gifOfDayUrl,
        preview_url: base.gifOfDayPosterUrl ?? undefined,
        title: undefined,
      });
      setGifOfDayCaption(base.gifOfDayCaption ?? "");
    }
  }, [base.uid, base.gifOfDayUrl, base.gifOfDayId, base.gifOfDayPosterUrl, base.gifOfDayCaption]);

  useEffect(() => {
    if (isValidHexColor(draft.accent)) applyAccentColor(draft.accent);
  }, [draft.accent]);

  const pickFile = (ref: RefObject<HTMLInputElement | null>) => {
    ref.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>, key: "avatar" | "banner") => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    const isBanner = key === "banner";
    const isAllowedMedia = file.type.startsWith("image/") || (isBanner && file.type.startsWith("video/"));
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
      return { ...d, [key]: url };
    });

    if (key === "avatar") {
      setAvatarUpload(file);
      toast.success("Avatar ready to save");
      return;
    }

    setBannerUpload(file);
    recordUserTrace({ userUid: base.uid, action: "profile.banner_update", targetType: "profile", targetId: base.uid, details: { fileType: file.type } });
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

        const { data: existingProfile } = await (supabase as any)
          .from("profiles")
          .select("public_profile_uid")
          .eq("id", supabaseUser.id)
          .maybeSingle();

        const existingPublicUid = existingProfile?.public_profile_uid as string | null | undefined;
        const profileUpdate: any = {
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
          updated_at: new Date().toISOString(),
          gif_of_day_id: gifOfDay ? (gifOfDay.gif_id ?? null) : null,
          gif_of_day_url: gifOfDay ? gifOfDay.url : null,
          gif_of_day_poster_url: gifOfDay ? (gifOfDay.preview_url ?? null) : null,
          gif_of_day_provider: gifOfDay ? "fwd" : null,
          gif_of_day_caption: gifOfDay ? (gifOfDayCaption.trim() || null) : null,
          gif_of_day_set_at: gifOfDay ? new Date().toISOString() : null,
        };

        if (isPublicProfileUid(existingPublicUid)) {
          savedPublicProfileUid = existingPublicUid!;
        } else {
          const { data: generatedUid, error: uidError } = await (supabase as any).rpc("generate_trey_public_profile_uid");
          if (uidError) throw uidError;
          if (isPublicProfileUid(generatedUid)) {
            savedPublicProfileUid = generatedUid;
            profileUpdate.public_profile_uid = generatedUid;
            profileUpdate.site_uid = generatedUid;
          }
        }

        const { data: savedProfile, error } = await (supabase as any)
          .from("profiles")
          .update(profileUpdate)
          .eq("id", supabaseUser.id)
          .select("public_profile_uid, avatar_url, banner_url, display_name, username, bio, location, link_url, profile_accent_color")
          .single();
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
        qc.invalidateQueries({ queryKey: ["current-user"] });
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
        gifOfDayId: gifOfDay ? (gifOfDay.gif_id ?? null) : null,
        gifOfDayUrl: gifOfDay ? gifOfDay.url : null,
        gifOfDayPosterUrl: gifOfDay ? (gifOfDay.preview_url ?? null) : null,
        gifOfDayProvider: gifOfDay ? "fwd" : null,
        gifOfDayCaption: gifOfDay ? (gifOfDayCaption.trim() || null) : null,
        gifOfDaySetAt: gifOfDay ? new Date().toISOString() : null,
      });

      if (gifOfDay) {
        markUsed.mutate({ id: gifOfDay.gif_id, gif_url: gifOfDay.url });
      }

      recordUserTrace({ userUid: savedPublicProfileUid, action: "profile.update", targetType: "profile", targetId: savedPublicProfileUid, details: { handle: draft.handle, visibility: draft.profileVisibility } });
      toast.success("Profile published");
      setTimeout(() => nav({ to: "/u/$uid", params: { uid: savedPublicProfileUid } }), 350);
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const accentVar = accentVariableFor(draft.accent);
  const bannerSrc = draft.banner || "";

  return (
    <AppShell wide>
      <div className="edit-profile-redesign min-h-screen text-foreground pb-36 lg:pb-10">
        <section className="relative -mx-0 overflow-hidden rounded-b-[2rem] lg:rounded-[2rem]">
          <div className="relative h-56 w-full sm:h-64 lg:h-72">
            {bannerSrc ? (
              <AnimatedBanner src={bannerSrc} fallback={bannerFallback} alt="Profile banner" className="absolute inset-0 size-full object-cover" />
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_20%,rgba(var(--profile-accent-rgb),0.2),transparent_35%),linear-gradient(135deg,#090b17,#171024_45%,#05070d)]">
                <div className="rounded-2xl border border-dashed border-white/20 px-5 py-4 text-center backdrop-blur-md">
                  <UploadCloud className="mx-auto mb-2 size-7 text-muted-foreground" />
                  <div className="text-sm font-semibold">Upload Banner</div>
                  <div className="text-xs text-muted-foreground">JPG, PNG, GIF, MP4</div>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
            <button className="absolute left-4 top-4 grid size-9 place-items-center rounded-full border border-white/15 bg-black/45 backdrop-blur-md" aria-label="Help">
              <HelpCircle className="size-4 text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={() => pickFile(bannerFile)}
              className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-3 py-2 text-xs font-medium text-foreground backdrop-blur-md transition hover:border-gold/60 hover:text-gold"
            >
              <UploadCloud className="size-4" /> Change banner
            </button>
            {isAnimatedBanner && (
              <span className="absolute bottom-4 left-4 rounded-full border border-magenta/40 bg-magenta/15 px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-magenta backdrop-blur-md">
                LOOPING
              </span>
            )}
            <input
              ref={bannerFile}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
              className="hidden"
              onChange={(event) => handleFileChange(event, "banner")}
            />
          </div>
        </section>

        <main className="mx-auto w-full max-w-2xl px-4 pt-2">
          <div className="relative -mt-16 flex items-end gap-4">
            <div className="relative">
              <span
                className="absolute -inset-4 -z-10 rounded-full blur-2xl opacity-60"
                style={{ background: `radial-gradient(closest-side, color-mix(in oklab, ${accentVar} 70%, transparent), transparent 70%)` }}
                aria-hidden
              />
              <span
                className="absolute -inset-1.5 -z-10 rounded-full"
                style={{
                  background: `conic-gradient(from 0deg, transparent 0deg, ${accentVar} 90deg, transparent 220deg, transparent 360deg)`,
                  animation: "edit-profile-orbit 14s linear infinite",
                  filter: "blur(0.4px)",
                }}
                aria-hidden
              />
              <div className="relative rounded-full p-[2px] bg-[var(--edit-gradient-accent-ring)]">
                <img src={draft.avatar} alt="Avatar" className="size-28 rounded-full border-4 border-background object-cover" />
              </div>
              <button
                type="button"
                onClick={() => pickFile(avatarFile)}
                className="absolute -bottom-1 -right-1 grid size-9 place-items-center rounded-full border-2 border-background bg-gradient-to-br from-gold to-amber-600 text-primary-foreground gold-glow"
                aria-label="Change avatar"
              >
                <Camera className="size-4" />
              </button>
              <input ref={avatarFile} type="file" accept="image/*" className="hidden" onChange={(event) => handleFileChange(event, "avatar")} />
            </div>
            <button type="button" onClick={() => pickFile(avatarFile)} className="flex-1 pb-2 text-left">
              <p className="text-sm font-semibold">Change Avatar</p>
              <p className="text-[11px] tracking-wider text-muted-foreground">JPG, PNG, GIF</p>
            </button>
            <span className="glass-panel mb-2 flex items-center gap-2 rounded-full border border-gold/30 px-3 py-1.5 text-[11px] font-medium tracking-wider text-gold">
              <span className="size-1.5 rounded-full bg-gold animate-pulse" /> EDITING
            </span>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button onClick={goBack} className="glass-panel grid size-10 place-items-center rounded-full" aria-label="Back">
              <ArrowLeft className="size-4" />
            </button>
            <div className="text-center">
              <p className="text-[10px] font-medium tracking-[0.3em] text-muted-foreground">PROFILE</p>
              <h1 className="text-2xl font-bold">Edit Profile</h1>
            </div>
            <button
              onClick={() => setPreviewOpen(true)}
              className={`glass-panel grid size-10 place-items-center rounded-full ${previewOpen ? "text-gold neon-static" : ""}`}
              aria-label="Preview changes"
              style={{ ["--neon" as string]: accentVar } as CSSProperties}
            >
              <Eye className="size-4" />
            </button>
          </div>

          <section className="neon-border panel-sheen glass-panel relative mt-5 overflow-hidden rounded-3xl p-2" style={{ ["--neon" as string]: "var(--cyan)", ["--accent-2" as string]: "var(--purple)" } as CSSProperties}>
            <span className="aurora-bg" aria-hidden />
            <span className="shimmer-sweep" style={{ ["--shimmer-delay" as string]: "0s" } as CSSProperties} aria-hidden />
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl">
              <div className="col-span-2"><Field icon={<UserRound className="size-4" />} label="DISPLAY NAME" value={draft.name} onChange={(name) => setDraft((d) => ({ ...d, name }))} /></div>
              <div className="col-span-2"><Field icon={<AtSign className="size-4" />} label="USERNAME" value={draft.handle} onChange={(handle) => setDraft((d) => ({ ...d, handle: handle.replace(/\s+/g, "").toLowerCase() }))} /></div>
              <div className="col-span-2"><Field icon={<Pencil className="size-4" />} label="PROFILE TAGLINE" value={draft.tagline} onChange={(tagline) => setDraft((d) => ({ ...d, tagline }))} placeholder="Add a short tagline..." /></div>
              <div className="col-span-2"><Field icon={<MapPin className="size-4" />} label="LOCATION" value={draft.location} onChange={(location) => setDraft((d) => ({ ...d, location }))} placeholder="City, Country" /></div>
              <Field icon={<Users className="size-4" />} label="PRONOUNS" value={draft.pronouns} onChange={(pronouns) => setDraft((d) => ({ ...d, pronouns }))} placeholder="Add pronouns..." />
              <Field icon={<Cake className="size-4" />} label="BIRTHDAY" value={draft.birthday} type="date" onChange={(birthday) => setDraft((d) => ({ ...d, birthday }))} />
            </div>
          </section>

          <section className="neon-border panel-sheen glass-panel relative mt-5 overflow-hidden rounded-3xl p-5" style={{ ["--neon" as string]: accentVar, ["--accent-2" as string]: "var(--cyan)" } as CSSProperties}>
            <span className="aurora-bg" aria-hidden />
            <span className="shimmer-sweep" style={{ ["--shimmer-delay" as string]: "1.5s" } as CSSProperties} aria-hidden />
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium tracking-[0.25em] text-muted-foreground">
                <MessageSquare className="size-4" style={{ color: accentVar }} /> BIO
              </div>
              <span className="text-[10px] tracking-wider text-muted-foreground">{draft.bio.length}/240</span>
            </div>
            <textarea
              value={draft.bio}
              onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value.slice(0, 240) }))}
              rows={4}
              placeholder="Tell people what you're about..."
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-transparent focus:ring-2"
              style={{ ["--tw-ring-color" as string]: `color-mix(in oklab, ${accentVar} 55%, transparent)` } as CSSProperties}
            />
            <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Sparkles className="size-3 text-gold" /> AI can polish this for you
            </div>
          </section>

          <section className="neon-border panel-sheen glass-panel relative mt-5 overflow-hidden rounded-3xl p-5" style={{ ["--neon" as string]: "var(--gold)", ["--accent-2" as string]: "var(--magenta)" } as CSSProperties}>
            <span className="aurora-bg" aria-hidden />
            <span className="shimmer-sweep" style={{ ["--shimmer-delay" as string]: "2.2s" } as CSSProperties} aria-hidden />
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium tracking-[0.25em] text-muted-foreground">
                <Crown className="size-4 text-gold" /> TOP 3 FRIENDS
              </div>
              <button onClick={() => setTopThreeOpen(true)} className="rounded-full border border-gold/30 px-3 py-1 text-[11px] font-semibold text-gold transition hover:bg-gold/10">
                Manage
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTopThreeOpen(true)}
                  className="group relative flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-2 transition hover:border-white/30"
                >
                  <span className="absolute -top-px left-1/2 -translate-x-1/2 rounded-b-md px-2 py-0.5 text-[10px] font-bold tracking-widest" style={{ background: RANK_COLORS[i], color: "#0a0a0a" }}>
                    #{i + 1}
                  </span>
                  <div className="grid size-14 place-items-center rounded-full border border-dashed border-white/20 bg-white/[0.02]">
                    <Users className="size-5 text-muted-foreground" />
                  </div>
                  <p className="text-center text-[10px] tracking-wider text-muted-foreground">EDIT TOP 3</p>
                </button>
              ))}
            </div>
          </section>

          <section className="neon-border panel-sheen glass-panel relative mt-5 overflow-hidden rounded-3xl p-5" style={{ ["--neon" as string]: "var(--purple)", ["--accent-2" as string]: "var(--cyan)" } as CSSProperties}>
            <span className="aurora-bg" aria-hidden />
            <span className="shimmer-sweep" style={{ ["--shimmer-delay" as string]: "3.7s" } as CSSProperties} aria-hidden />
            <div className="mb-4 flex items-center gap-2 text-xs font-medium tracking-[0.25em] text-muted-foreground">
              <Star className="size-4" style={{ color: "var(--purple)" }} /> SOCIAL HANDLES
            </div>
            <div className="space-y-2">
              <SocialField icon={<Instagram className="size-4" />} platform="Instagram" prefix="@" value={draft.socialInstagram} onChange={(socialInstagram) => setDraft((d) => ({ ...d, socialInstagram }))} />
              <SocialField icon={<Music2 className="size-4" />} platform="TikTok" prefix="@" value={draft.socialTikTok} onChange={(socialTikTok) => setDraft((d) => ({ ...d, socialTikTok }))} />
              <SocialField icon={<Youtube className="size-4" />} platform="YouTube" prefix="/" value={draft.socialYouTube} onChange={(socialYouTube) => setDraft((d) => ({ ...d, socialYouTube }))} />
              <SocialField icon={<Link2 className="size-4" />} platform="Website" prefix="" value={draft.link} onChange={(link) => setDraft((d) => ({ ...d, link }))} placeholder="https://" />
            </div>
          </section>

          <section className="neon-border panel-sheen glass-panel relative mt-5 overflow-hidden rounded-3xl p-5" style={{ ["--neon" as string]: "var(--cyan)", ["--accent-2" as string]: "var(--gold)" } as CSSProperties}>
            <span className="aurora-bg" aria-hidden />
            <span className="shimmer-sweep" style={{ ["--shimmer-delay" as string]: "2.5s" } as CSSProperties} aria-hidden />
            <div className="mb-4 flex items-center gap-2 text-xs font-medium tracking-[0.25em] text-muted-foreground">
              <ImageIcon className="size-4 text-[var(--cyan)]" /> GIF OF THE DAY
            </div>
            <p className="mb-3 text-xs text-muted-foreground">Pick a GIF from your FWD library to feature on your profile. Changes save when you click Save Changes.</p>
            {gifOfDay ? (
              <div className="flex items-start gap-3">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10">
                  {gifOfDay.preview_url && <img src={gifOfDay.preview_url} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-25 blur-sm" />}
                  <img src={gifOfDay.url} alt="GIF of the Day" className="relative h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setGifOfDay(null)}
                    className="absolute right-1 top-1 size-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
                    aria-label="Remove GIF of the Day"
                  >
                    <X className="size-3" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    value={gifOfDayCaption}
                    onChange={(e) => setGifOfDayCaption(e.target.value)}
                    placeholder="Add a caption… (optional)"
                    maxLength={80}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:border-primary/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGifOfDayPicker(true)}
                    className="mt-2 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    Change GIF
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowGifOfDayPicker(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-6 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground hover:bg-white/[0.06]"
              >
                <ImageIcon className="size-5" />
                Choose your GIF of the Day from FWD
              </button>
            )}
          </section>

          <section className="neon-border panel-sheen glass-panel relative mt-5 overflow-hidden rounded-3xl p-5" style={{ ["--neon" as string]: "var(--magenta)", ["--accent-2" as string]: "var(--gold)" } as CSSProperties}>
            <span className="aurora-bg" aria-hidden />
            <span className="shimmer-sweep" style={{ ["--shimmer-delay" as string]: "3s" } as CSSProperties} aria-hidden />
            <div className="mb-4 flex items-center gap-2 text-xs font-medium tracking-[0.25em] text-muted-foreground">
              <Shield className="size-4 text-gold" /> PROFILE PRIVACY
            </div>
            <div className="grid grid-cols-3 gap-3">
              <PrivacyPill active={draft.profileVisibility === "public"} onClick={() => setDraft((d) => ({ ...d, profileVisibility: "public" }))} icon={<Globe className="size-4" />} label="Public" />
              <PrivacyPill active={draft.profileVisibility === "members_only"} onClick={() => setDraft((d) => ({ ...d, profileVisibility: "members_only" }))} icon={<Users className="size-4" />} label="Members" />
              <PrivacyPill active={draft.profileVisibility === "private"} onClick={() => setDraft((d) => ({ ...d, profileVisibility: "private" }))} icon={<Lock className="size-4" />} label="Private" />
            </div>
            <div className="mt-4 space-y-2">
              <ToggleRow icon={<MapPin className="size-4" />} label="Show location on profile" checked={draft.showLocation} onChange={(showLocation) => setDraft((d) => ({ ...d, showLocation }))} />
              <ToggleRow icon={<Cake className="size-4" />} label="Show birthday on profile" checked={draft.showBirthday} onChange={(showBirthday) => setDraft((d) => ({ ...d, showBirthday }))} />
            </div>
          </section>

          <section className="neon-border panel-sheen glass-panel relative mt-5 overflow-hidden rounded-3xl p-5" style={{ ["--neon" as string]: accentVar, ["--accent-2" as string]: "var(--cyan)" } as CSSProperties}>
            <span className="aurora-bg" aria-hidden />
            <span className="shimmer-sweep" style={{ ["--shimmer-delay" as string]: "4.5s" } as CSSProperties} aria-hidden />
            <div className="mb-4 flex items-center gap-2 text-xs font-medium tracking-[0.25em] text-muted-foreground">
              <Sparkles className="size-4 text-gold" /> PROFILE ACCENT
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ACCENT_COLORS.slice(0, 8).map((a) => {
                const active = a.hex === draft.accent;
                return (
                  <button
                    key={a.id}
                    onClick={() => setDraft((d) => ({ ...d, accent: a.hex }))}
                    className={`glass-panel flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-2 text-[12px] font-medium transition ${active ? "neon-static" : "border-white/10 text-foreground/80 hover:border-white/25"}`}
                    style={{ ["--neon" as string]: a.hex, ...(active ? { color: a.hex, borderColor: `color-mix(in oklab, ${a.hex} 70%, transparent)` } : {}) } as CSSProperties}
                  >
                    <span className="size-2.5 rounded-full" style={{ background: a.hex, boxShadow: `0 0 10px ${a.hex}` }} />
                    {a.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="neon-border panel-sheen glass-panel relative mt-5 overflow-hidden rounded-3xl p-3" style={{ ["--neon" as string]: "var(--gold)", ["--accent-2" as string]: accentVar } as CSSProperties}>
            <span className="aurora-bg" aria-hidden />
            <span className="shimmer-sweep" style={{ ["--shimmer-delay" as string]: "6s" } as CSSProperties} aria-hidden />
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="neon-border rounded-2xl bg-white/[0.04] px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-white/[0.08]"
                style={{ ["--neon" as string]: accentVar } as CSSProperties}
              >
                <span className="flex items-center justify-center gap-2"><Eye className="size-4" /> Preview Changes</span>
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="neon-border rounded-2xl bg-gradient-to-r from-amber-300 via-gold to-amber-500 px-4 py-3 text-sm font-semibold text-black transition disabled:cursor-wait disabled:opacity-70"
                style={{ ["--neon" as string]: "var(--gold)" } as CSSProperties}
              >
                <span className="flex items-center justify-center gap-2"><Rocket className="size-4" /> {saving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">Changes are previewed live. Save when you're ready.</p>
          </section>
        </main>
      </div>

      <ProfilePreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} draft={draft} profileUid={profileUid} accentVar={accentVar} bannerFallback={bannerFallback} />
      <TopThreeEditor open={topThreeOpen} onClose={() => setTopThreeOpen(false)} onSave={() => qc.invalidateQueries({ queryKey: ["current-user"] })} />
      <FwdGifPicker
        open={showGifOfDayPicker}
        context="profile"
        treyTvUid={profileUid}
        onClose={() => setShowGifOfDayPicker(false)}
        onSelect={(gif) => { setGifOfDay(gif); setShowGifOfDayPicker(false); }}
      />
    </AppShell>
  );
}

function ProfilePreviewModal({
  open,
  onClose,
  draft,
  profileUid,
  accentVar,
  bannerFallback,
}: {
  open: boolean;
  onClose: () => void;
  draft: ProfileDraft;
  profileUid: string;
  accentVar: string;
  bannerFallback: string;
}) {
  if (!open) return null;

  const bannerSrc = draft.banner || "";
  const showLocation = draft.showLocation && draft.location;
  const socials = [
    draft.socialInstagram && `Instagram @${draft.socialInstagram.replace(/^@/, "")}`,
    draft.socialTikTok && `TikTok @${draft.socialTikTok.replace(/^@/, "")}`,
    draft.socialYouTube && `YouTube /${draft.socialYouTube.replace(/^\//, "")}`,
    draft.link,
  ].filter(Boolean);

  return (
    <div className="edit-profile-redesign fixed inset-0 z-[10080] overflow-y-auto bg-black/75 px-4 py-5 text-foreground backdrop-blur-xl sm:py-8" role="dialog" aria-modal="true" aria-label="Profile preview">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium tracking-[0.3em] text-muted-foreground">LIVE PREVIEW</p>
            <h2 className="text-xl font-bold">Profile Page</h2>
          </div>
          <button type="button" onClick={onClose} className="glass-panel grid size-10 place-items-center rounded-full" aria-label="Close profile preview">
            <X className="size-4" />
          </button>
        </div>

        <section className="neon-border panel-sheen glass-panel relative overflow-hidden rounded-[2rem]" style={{ ["--neon" as string]: accentVar, ["--accent-2" as string]: "var(--cyan)" } as CSSProperties}>
          <span className="aurora-bg" aria-hidden />
          <div className="relative h-48 overflow-hidden rounded-t-[2rem] sm:h-64">
            {bannerSrc ? (
              <AnimatedBanner src={bannerSrc} fallback={bannerFallback} alt="Profile banner preview" className="absolute inset-0 size-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(var(--profile-accent-rgb),0.2),transparent_35%),linear-gradient(135deg,#090b17,#171024_45%,#05070d)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background" />
          </div>

          <div className="relative px-5 pb-6 sm:px-7">
            <div className="-mt-14 flex flex-wrap items-end gap-4">
              <img src={draft.avatar} alt="Profile avatar preview" className="size-28 rounded-full border-4 border-background object-cover ring-2 ring-white/15" />
              <div className="min-w-0 flex-1 pb-2">
                <h3 className="truncate text-3xl font-black">{draft.name || "Your name"}</h3>
                <p className="truncate text-sm text-muted-foreground">@{draft.handle || "username"}</p>
              </div>
            </div>

            {draft.tagline && <p className="mt-4 text-base font-semibold" style={{ color: accentVar }}>{draft.tagline}</p>}
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/85">{draft.bio || "Your bio preview will appear here."}</p>

            <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {showLocation && (
                <span className="glass-panel flex items-center gap-1.5 rounded-full px-3 py-1.5">
                  <MapPin className="size-3.5" /> {draft.location}
                </span>
              )}
              {draft.pronouns && <span className="glass-panel rounded-full px-3 py-1.5">{draft.pronouns}</span>}
              <span className="glass-panel rounded-full px-3 py-1.5">/u/{profileUid}</span>
              <span className="glass-panel rounded-full px-3 py-1.5 capitalize">{draft.profileVisibility.replace("_", " ")}</span>
            </div>

            {socials.length > 0 && (
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {socials.map((social) => (
                  <div key={social} className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground/85">
                    {social}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button type="button" className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-foreground">
                Message
              </button>
              <button type="button" className="flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-black" style={{ background: accentVar }}>
                Follow
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="group flex items-start gap-3 bg-white/[0.02] p-4 transition hover:bg-white/[0.05] focus-within:bg-white/[0.06] focus-within:ring-1 focus-within:ring-gold/40">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/5 text-muted-foreground group-focus-within:text-gold">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-medium tracking-[0.2em] text-muted-foreground">{label}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
        />
      </span>
    </label>
  );
}

function PrivacyPill({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`glass-panel flex items-center justify-center gap-2 rounded-full px-2 py-2.5 text-xs transition sm:px-3 sm:text-sm ${
        active ? "border-2 border-gold text-gold gold-glow" : "border border-white/10 text-foreground/80"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function ToggleRow({ icon, label, checked, onChange }: { icon: ReactNode; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-3">
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 text-sm">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-gold gold-glow" : "bg-white/15"}`}
        aria-pressed={checked}
      >
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function SocialField({
  icon,
  platform,
  prefix,
  value,
  onChange,
  placeholder,
}: {
  icon: ReactNode;
  platform: string;
  prefix: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 transition hover:border-white/20 focus-within:border-purple/60 focus-within:bg-white/[0.06]">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/5 text-muted-foreground group-focus-within:text-foreground">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-medium tracking-[0.2em] text-muted-foreground">{platform.toUpperCase()}</span>
        <span className="mt-0.5 flex items-center gap-1">
          {prefix && <span className="text-sm text-muted-foreground">{prefix}</span>}
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? `your${platform.toLowerCase().replace(/[^a-z]/g, "")}`}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </span>
      </span>
    </label>
  );
}
