import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { ArrowLeft, Camera, Eye, Save, Sparkles, MapPin, Link2, Image as ImageIcon, Instagram, Youtube, Music2, Shield } from "lucide-react";
import { useGoBack } from "@/hooks/use-go-back";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth";
import { useAuth as useSupabaseAuth } from "@/hooks/use-auth";
import { createBrowserClient } from "@/lib/supabase-browser";
import { uploadProfileMedia } from "@/lib/supabase-storage";
import { currentUser } from "@/lib/mock-data";
import bannerImg from "@/assets/profile-banner.jpg";
import { VerifiedBadge } from "@/components/brand/Badge";
import { AnimatedBanner } from "@/components/profile/AnimatedBanner";
import { recordUserTrace } from "@/lib/user-trace";

export const Route = createFileRoute("/edit-profile")({
  component: EditProfile,
  head: () => ({
    meta: [
      { title: "Edit Profile — Trey TV" },
      { name: "description", content: "Edit your Trey TV profile: name, handle, bio, avatar, banner, accent." },
    ],
  }),
});

const accents = [
  { id: "gold", label: "Gold", color: "oklch(0.82 0.16 85)" },
  { id: "magenta", label: "Magenta", color: "oklch(0.7 0.25 340)" },
  { id: "cyan", label: "Cyan", color: "oklch(0.82 0.15 215)" },
  { id: "purple", label: "Purple", color: "oklch(0.65 0.22 300)" },
] as const;

function EditProfile() {
  const { user, updateUser, signIn } = useAuth();
  const { user: supabaseUser } = useSupabaseAuth();
  const nav = useNavigate();
  const base = user ?? { ...currentUser, role: "creator" as const, banner: "", accent: "gold" as const, rewards: { points: 12480, tier: "GOLD" as const } };

  const [draft, setDraft] = useState({
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
    socialTikTok: (base as any).socialTikTok ?? "",
    socialYouTube: (base as any).socialYouTube ?? "",
    profileVisibility: ((base as any).profileVisibility ?? "public") as "public" | "members_only" | "private",
    showLocation: (base as any).showLocation ?? true,
    showBirthday: (base as any).showBirthday ?? false,
    avatar: base.avatar,
    banner: (base as any).banner || "",
    accent: ((base as any).accent || "gold") as "gold" | "magenta" | "cyan" | "purple",
  });

  const [previewing, setPreviewing] = useState(false);
  const [avatarUpload, setAvatarUpload] = useState<File | null>(null);
  const [bannerUpload, setBannerUpload] = useState<File | null>(null);
  const avatarFile = useRef<HTMLInputElement | null>(null);
  const bannerFile = useRef<HTMLInputElement | null>(null);

  const pickFile = (ref: React.RefObject<HTMLInputElement | null>, key: "avatar" | "banner") => {
    ref.current?.click();
    const input = ref.current;
    if (!input) return;
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      const url = URL.createObjectURL(f);
      setDraft((d) => ({ ...d, [key]: url }));
      if (key === "avatar") setAvatarUpload(f);
      if (key === "banner") {
        setBannerUpload(f);
        recordUserTrace({ userUid: base.uid, action: "profile.banner_update", targetType: "profile", targetId: base.uid, details: { fileType: f.type } });
        const isAnimated = /gif|video/.test(f.type);
        toast.success(isAnimated ? "Animated banner ready — it'll loop forever ✨" : "Banner updated");
      }
    };
  };

  const isAnimatedBanner = (() => {
    const b = (draft.banner || "").toLowerCase();
    return b.endsWith(".gif") || /\.(mp4|webm|mov)$/.test(b.split("?")[0]) || b.startsWith("blob:");
  })();

  const save = async () => {
    let persistedAvatar = draft.avatar;
    let persistedBanner = draft.banner;

    if (supabaseUser) {
      const supabase = createBrowserClient();
      try {
        if (avatarUpload) {
          const uploaded = await uploadProfileMedia(supabaseUser.id, avatarUpload, "avatar");
          persistedAvatar = uploaded.url;
        }
        if (bannerUpload) {
          const uploaded = await uploadProfileMedia(supabaseUser.id, bannerUpload, "banner");
          persistedBanner = uploaded.url;
        }
      } catch (error) {
        console.error("Failed to upload profile media:", error);
        toast("Failed to upload profile media.");
        return;
      }

      const profileUpdate: any = {
        display_name: draft.name,
        username: draft.handle,
        bio: draft.bio,
        location: draft.location,
        link_url: draft.link,
        tagline: draft.tagline,
        pronouns: draft.pronouns,
        birthday: draft.birthday,
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
      };
      const { error } = await (supabase as any)
        .from("profiles")
        .update(profileUpdate)
        .eq("id", supabaseUser.id);

      if (error) {
        if (error.code === "23505") {
          toast("Username already taken — try another.");
          return;
        }
        toast("Failed to save profile.");
        return;
      }
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
      avatar: persistedAvatar,
      banner: persistedBanner,
      accent: draft.accent,
    });
    recordUserTrace({ userUid: base.uid, action: "profile.update", targetType: "profile", targetId: base.uid, details: { handle: draft.handle, visibility: draft.profileVisibility } });
    toast.success("Profile published ✨");
    setTimeout(() => nav({ to: "/u/$uid", params: { uid: base.uid } }), 350);
  };

  const accentColor = accents.find((a) => a.id === draft.accent)?.color ?? "oklch(0.82 0.16 85)";
  const goBack = useGoBack(`/u/${base.uid}`);

  return (
    <AppShell wide>
      <div className="space-y-5 pb-24">
        {/* Header bar */}
        <div className="flex items-center justify-between">
          <button onClick={goBack} className="size-9 grid place-items-center rounded-full liquid-glass border border-white/10">
            <ArrowLeft className="size-4" />
          </button>
          <div className="text-center">
            <div className="text-xs text-muted-foreground tracking-[0.25em]">PROFILE</div>
            <h1 className="text-lg font-bold">Edit Profile</h1>
          </div>
          <button onClick={() => setPreviewing((v) => !v)} className={`px-3 h-9 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${previewing ? "border-primary/50 text-primary bg-primary/10" : "border-white/10 liquid-glass"}`}>
            <Eye className="size-3.5" /> {previewing ? "Editing" : "Preview"}
          </button>
        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-5">
          {/* Editor column */}
          <div className={`space-y-5 ${previewing ? "hidden lg:block opacity-60 pointer-events-none" : ""}`}>
            {/* Banner / avatar uploaders */}
            <div className="rounded-3xl liquid-glass border border-white/10 overflow-hidden">
              <div className="relative h-40">
                <AnimatedBanner src={draft.banner} fallback={bannerImg} alt="banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                {isAnimatedBanner && (
                  <span className="absolute top-3 left-3 px-2 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] bg-[oklch(0.7_0.25_340_/_0.25)] text-[oklch(0.85_0.2_340)] border border-[oklch(0.7_0.25_340_/_0.5)] backdrop-blur-md flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-[oklch(0.85_0.2_340)] animate-glow-pulse" /> LOOPING
                  </span>
                )}
                <button onClick={() => pickFile(bannerFile, "banner")} className="absolute top-3 right-3 px-2.5 py-1.5 rounded-full text-[11px] font-semibold liquid-glass border border-white/15 flex items-center gap-1.5">
                  <ImageIcon className="size-3" /> Change banner
                </button>
                <input ref={bannerFile} type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" className="hidden" />
              </div>
              <div className="px-5 pb-5 -mt-10 flex items-end gap-4">
                <div className="relative size-20 rounded-full conic-ring bg-background">
                  <img src={draft.avatar} alt="" className="size-full rounded-full object-cover ring-2 ring-white/20" />
                  <button onClick={() => pickFile(avatarFile, "avatar")} className="absolute -bottom-1 -right-1 size-7 grid place-items-center rounded-full bg-primary text-primary-foreground glow-gold">
                    <Camera className="size-3.5" />
                  </button>
                  <input ref={avatarFile} type="file" accept="image/*" className="hidden" />
                </div>
                <div className="flex-1 text-xs text-muted-foreground pb-1">Banner: JPG · PNG · GIF · MP4/WebM (loops automatically)</div>
              </div>
            </div>

            {/* Fields */}
            <div className="rounded-3xl liquid-glass border border-white/10 p-5 space-y-4">
              <Field label="Display name" value={draft.name} onChange={(v) => setDraft((d) => ({ ...d, name: v }))} />
              <Field label="Username" prefix="@" value={draft.handle} onChange={(v) => setDraft((d) => ({ ...d, handle: v.replace(/\s+/g, "").toLowerCase() }))} />
              <Field label="Profile tagline" value={draft.tagline} onChange={(v) => setDraft((d) => ({ ...d, tagline: v }))} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Pronouns" value={draft.pronouns} onChange={(v) => setDraft((d) => ({ ...d, pronouns: v }))} />
                <Field label="Birthday" value={draft.birthday} onChange={(v) => setDraft((d) => ({ ...d, birthday: v }))} />
              </div>
              <FieldArea label="Bio" value={draft.bio} onChange={(v) => setDraft((d) => ({ ...d, bio: v }))} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Location" icon={<MapPin className="size-3.5" />} value={draft.location} onChange={(v) => setDraft((d) => ({ ...d, location: v }))} />
                <Field label="Website" icon={<Link2 className="size-3.5" />} value={draft.link} onChange={(v) => setDraft((d) => ({ ...d, link: v }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Favorite genres" icon={<Music2 className="size-3.5" />} value={draft.favoriteGenres} onChange={(v) => setDraft((d) => ({ ...d, favoriteGenres: v }))} />
                <Field label="Favorite creators" icon={<Sparkles className="size-3.5" />} value={draft.favoriteCreators} onChange={(v) => setDraft((d) => ({ ...d, favoriteCreators: v }))} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Instagram" icon={<Instagram className="size-3.5" />} value={draft.socialInstagram} onChange={(v) => setDraft((d) => ({ ...d, socialInstagram: v }))} />
                <Field label="TikTok" value={draft.socialTikTok} onChange={(v) => setDraft((d) => ({ ...d, socialTikTok: v }))} />
                <Field label="YouTube" icon={<Youtube className="size-3.5" />} value={draft.socialYouTube} onChange={(v) => setDraft((d) => ({ ...d, socialYouTube: v }))} />
              </div>
            </div>

            <div className="rounded-3xl liquid-glass border border-white/10 p-5 space-y-3">
              <div className="text-xs tracking-[0.2em] text-muted-foreground flex items-center gap-2"><Shield className="size-3.5" /> PROFILE PRIVACY</div>
              <div className="grid grid-cols-3 gap-2">
                {(["public", "members_only", "private"] as const).map((visibility) => (
                  <button
                    key={visibility}
                    onClick={() => setDraft((d) => ({ ...d, profileVisibility: visibility }))}
                    className={`h-10 rounded-xl border text-xs font-semibold ${draft.profileVisibility === visibility ? "border-primary bg-primary/15 text-primary" : "border-white/10 glass"}`}
                  >
                    {visibility.replace("_", " ")}
                  </button>
                ))}
              </div>
              <label className="flex items-center justify-between gap-3 rounded-xl glass border border-white/10 px-3 py-2 text-sm">
                Show location on profile
                <input type="checkbox" checked={draft.showLocation} onChange={(e) => setDraft((d) => ({ ...d, showLocation: e.target.checked }))} className="accent-[oklch(0.82_0.16_85)]" />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-xl glass border border-white/10 px-3 py-2 text-sm">
                Show birthday on profile
                <input type="checkbox" checked={draft.showBirthday} onChange={(e) => setDraft((d) => ({ ...d, showBirthday: e.target.checked }))} className="accent-[oklch(0.82_0.16_85)]" />
              </label>
            </div>

            {/* Accent */}
            <div className="rounded-3xl liquid-glass border border-white/10 p-5">
              <div className="text-xs tracking-[0.2em] text-muted-foreground mb-3">PROFILE ACCENT</div>
              <div className="flex flex-wrap gap-2">
                {accents.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setDraft((d) => ({ ...d, accent: a.id }))}
                    className={`flex items-center gap-2 px-3 h-9 rounded-full border text-xs font-semibold transition ${draft.accent === a.id ? "border-white/40 bg-white/5" : "border-white/10 hover:bg-white/5"}`}
                  >
                    <span className="size-3 rounded-full" style={{ background: a.color, boxShadow: `0 0 12px ${a.color}` }} />
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live preview column */}
          <div className={`${previewing ? "" : "hidden lg:block"}`}>
            <div className="lg:sticky lg:top-4">
              <div className="text-[10px] tracking-[0.25em] text-muted-foreground mb-2 flex items-center gap-1.5">
                <Sparkles className="size-3 text-primary" /> LIVE PREVIEW
              </div>
              <div className="rounded-3xl liquid-glass border overflow-hidden" style={{ borderColor: `color-mix(in oklab, ${accentColor} 40%, transparent)` }}>
                <div className="relative h-32">
                  <AnimatedBanner src={draft.banner} fallback={bannerImg} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                </div>
                <div className="px-5 pb-5 -mt-10 text-center">
                  <div className="mx-auto size-20 rounded-full bg-background relative" style={{ boxShadow: `0 0 0 2px ${accentColor}, 0 0 24px ${accentColor}` }}>
                    <img src={draft.avatar} className="size-full rounded-full object-cover" alt="" />
                  </div>
                  <h2 className="mt-2 text-lg font-bold">{draft.name || "Your name"}</h2>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                    @{draft.handle || "handle"}
                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full text-primary border border-primary/40 bg-primary/10">
                      <VerifiedBadge kind="creator" className="!size-3" /> Creator
                    </span>
                  </div>
                  <p className="mt-2 text-xs whitespace-pre-line text-foreground/90">{draft.bio || "Your bio will show here."}</p>
                  <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
                    {draft.location && <span className="flex items-center gap-1"><MapPin className="size-3" /> {draft.location}</span>}
                    {draft.link && <span className="flex items-center gap-1" style={{ color: accentColor }}><Link2 className="size-3" /> {draft.link}</span>}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    {[["Posts", base.stats.posts], ["Followers", base.stats.followers], ["Following", base.stats.following]].map(([k, v]) => (
                      <div key={k as string} className="rounded-xl glass border border-white/10 py-2">
                        <div className="text-sm font-bold">{v}</div>
                        <div className="text-[9px] tracking-wider text-muted-foreground">{(k as string).toUpperCase()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-20 lg:bottom-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-1.5rem)] max-w-[640px] rounded-2xl liquid-glass border border-white/10 p-2.5 flex items-center justify-between gap-3 shadow-[0_24px_60px_-20px_oklch(0_0_0_/_0.7)]">
        <div className="text-xs text-muted-foreground pl-2">Changes are previewed live · publish when ready</div>
        <button onClick={save} className="px-4 h-10 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press flex items-center gap-1.5">
          <Save className="size-4" /> Publish
        </button>
      </div>
    </AppShell>
  );
}

function Field({ label, value, onChange, prefix, icon }: { label: string; value: string; onChange: (v: string) => void; prefix?: string; icon?: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-1">{label.toUpperCase()}</div>
      <div className="flex items-center gap-2 rounded-xl glass border border-white/10 px-3 h-10 focus-within:border-primary/50 transition">
        {icon ?? null}
        {prefix && <span className="text-muted-foreground text-sm">{prefix}</span>}
        <input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 bg-transparent text-sm focus:outline-none" />
      </div>
    </label>
  );
}

function FieldArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-1">{label.toUpperCase()}</div>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full rounded-xl glass border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition resize-none" />
    </label>
  );
}
