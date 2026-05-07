import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Bell, MoreHorizontal, MapPin, Link2, Share2, Copy, Grid3x3, Play, Pencil, Gem, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { currentUser, prescribed } from "@/lib/mock-data";
import banner from "@/assets/profile-banner.jpg";
import { VerifiedBadge } from "@/components/brand/Badge";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/u/$uid")({
  component: PublicProfile,
  head: ({ params }) => ({
    meta: [
      { title: `${currentUser.name} (@${currentUser.handle}) — Trey TV` },
      { name: "description", content: `${currentUser.name}'s public profile on Trey TV. UID ${params.uid}.` },
    ],
  }),
});

const tabs = ["Posts", "About", "Prescriptions", "Collections", "Likes"];

function PublicProfile() {
  const { uid } = Route.useParams();
  const [tab, setTab] = useState("Posts");
  const { user, isGuest } = useAuth();

  const profile = user ?? currentUser;
  const isOwnProfile = !isGuest && (user?.uid ?? currentUser.uid) === uid;

  return (
    <AppShell>
      <div className="space-y-4 -mt-3">
        {/* Hero — tightened: avatar overlaps banner with minimal gap to name */}
        <div className="relative pb-14">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 liquid-glass">
            <img src={profile.banner || banner} alt="" className="w-full h-40 sm:h-48 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <Link to="/" className="size-9 grid place-items-center rounded-full glass">
                <ArrowLeft className="size-4" />
              </Link>
              <div className="flex items-center gap-2">
                <button className="size-9 grid place-items-center rounded-full glass"><Bell className="size-4" /></button>
                <button className="size-9 grid place-items-center rounded-full glass"><MoreHorizontal className="size-4" /></button>
              </div>
            </div>
          </div>

          {/* Avatar — half-overlapped on banner so the name sits right under it */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 size-24 sm:size-28 rounded-full conic-ring bg-background animate-float">
            <img src={profile.avatar} alt="" className="size-full rounded-full object-cover ring-2 ring-white/20" />
          </div>
        </div>

        {/* Identity — tightened spacing */}
        <div className="text-center px-2 -mt-2">
          <h1 className="text-2xl font-bold leading-tight">{profile.name}</h1>
          <div className="mt-0.5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            @{profile.handle}
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/40">
              <VerifiedBadge kind="creator" className="!size-3" /> Verified Creator
            </span>
          </div>
          <p className="mt-2 text-sm whitespace-pre-line">{profile.bio}</p>
          <div className="mt-1.5 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            {profile.location && <span className="flex items-center gap-1"><MapPin className="size-3" /> {profile.location}</span>}
            {profile.link && <span className="flex items-center gap-1 text-[oklch(0.82_0.15_215)]"><Link2 className="size-3" /> {profile.link}</span>}
          </div>

          {/* Primary CTA row */}
          <div className="mt-3 flex items-center justify-center gap-2">
            {isOwnProfile ? (
              <Link to="/edit-profile" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-primary text-primary-foreground glow-gold tilt-press">
                <Pencil className="size-3.5" /> Edit Profile
              </Link>
            ) : (
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-primary text-primary-foreground glow-gold tilt-press">
                <UserPlus className="size-3.5" /> Follow
              </button>
            )}
            {isGuest && (
              <Link to="/onboarding" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold liquid-glass border border-white/10 text-foreground">
                Sign up to interact
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="rounded-2xl liquid-glass border border-white/10 grid grid-cols-4 divide-x divide-white/5">
          {[
            ["POSTS", profile.stats.posts],
            ["FOLLOWERS", profile.stats.followers],
            ["FOLLOWING", profile.stats.following],
            ["PRESCRIPTIONS", profile.stats.prescriptions],
          ].map(([k, v]) => (
            <div key={k as string} className="p-3 text-center">
              <div className="text-[10px] tracking-wider text-muted-foreground">{k}</div>
              <div className="text-lg font-bold mt-0.5">{v}</div>
            </div>
          ))}
        </div>

        {/* Rewards teaser — full card lives at /rewards */}
        {isOwnProfile && (
          <Link to="/rewards" className="block rounded-2xl liquid-glass liquid-hover border border-white/10 p-3 flex items-center gap-3">
            <div className="size-10 rounded-xl grid place-items-center bg-primary/15 text-primary glow-gold"><Gem className="size-5" /></div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Rewards · GOLD tier</div>
              <div className="text-[11px] text-muted-foreground">12,480 pts available — gifts, subs, perks</div>
            </div>
            <div className="text-xs text-primary font-semibold">Open →</div>
          </Link>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Share2, label: "Share", onClick: async () => {
              try { await navigator.share?.({ title: profile.name, url: location.href }); }
              catch { await navigator.clipboard?.writeText(location.href); toast("Link copied"); }
            }},
            { icon: Copy, label: "Copy UID", onClick: () => { navigator.clipboard?.writeText(uid); toast.success("UID copied"); } },
            { icon: MoreHorizontal, label: "More", onClick: () => toast("More options") },
          ].map((a) => (
            <button key={a.label} onClick={a.onClick} className="rounded-2xl liquid-glass liquid-hover border border-white/10 flex flex-col items-center justify-center py-2.5">
              <a.icon className="size-4" />
              <span className="text-[10px] mt-1 text-muted-foreground">{a.label}</span>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-white/10">
          {tabs.map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative px-3 py-2 text-sm whitespace-nowrap ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}
              >
                {t}
                {active && <span className="absolute left-3 right-3 -bottom-px h-0.5 bg-primary rounded-full shadow-[0_0_8px_var(--gold)]" />}
              </button>
            );
          })}
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-3 gap-2">
          {prescribed.concat(prescribed).slice(0, 6).map((p, i) => (
            <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10">
              <img src={p.media} alt="" className="size-full object-cover" loading="lazy" />
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[oklch(0.65_0.22_300)] text-white">Pinned</span>
              )}
              <span className="absolute bottom-1.5 left-1.5 text-[10px] flex items-center gap-1 text-white/90">
                <Play className="size-3 fill-white" /> {p.duration ?? p.viewers ?? "8.7K"}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 pt-4 text-muted-foreground text-xs">
          <Grid3x3 className="size-3" /> End of public posts
        </div>
      </div>
    </AppShell>
  );
}
