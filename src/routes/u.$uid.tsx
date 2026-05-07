import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Bell, MoreHorizontal, MapPin, Link2, Share2, Copy, Grid3x3, Play } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { currentUser, prescribed } from "@/lib/mock-data";
import banner from "@/assets/profile-banner.jpg";
import { VerifiedBadge } from "@/components/brand/Badge";

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

  return (
    <AppShell>
      <div className="space-y-5 -mt-3">
        {/* Hero */}
        <div className="relative pb-20">
          <div className="relative rounded-3xl overflow-hidden border border-white/10">
            <img src={banner} alt="" className="w-full h-44 sm:h-48 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

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

          {/* Avatar — outside the overflow-hidden hero so it never clips */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 size-28 sm:size-32 rounded-full conic-ring bg-background animate-float">
            <img src={currentUser.avatar} alt="" className="size-full rounded-full object-cover ring-2 ring-white/20" />
          </div>
        </div>

        {/* Identity */}
        <div className="text-center px-2">
          <h1 className="text-2xl font-bold">{currentUser.name}</h1>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            @{currentUser.handle}
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/40">
              <VerifiedBadge kind="creator" className="!size-3" /> Verified Creator
            </span>
          </div>
          <p className="mt-3 text-sm whitespace-pre-line">{currentUser.bio}</p>
          <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="size-3" /> {currentUser.location}</span>
            <span className="flex items-center gap-1 text-[oklch(0.82_0.15_215)]"><Link2 className="size-3" /> {currentUser.link}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="rounded-2xl glass border border-white/10 grid grid-cols-4 divide-x divide-white/5">
          {[
            ["POSTS", currentUser.stats.posts],
            ["FOLLOWERS", currentUser.stats.followers],
            ["FOLLOWING", currentUser.stats.following],
            ["PRESCRIPTIONS", currentUser.stats.prescriptions],
          ].map(([k, v]) => (
            <div key={k as string} className="p-3 text-center">
              <div className="text-[10px] tracking-wider text-muted-foreground">{k}</div>
              <div className="text-lg font-bold mt-0.5">{v}</div>
            </div>
          ))}
        </div>

        {/* Rewards Card — credit-card format */}
        <div className="relative mx-auto w-full max-w-[420px] aspect-[1.586/1] rounded-2xl p-5 overflow-hidden border border-primary/40 bg-[linear-gradient(135deg,oklch(0.22_0.08_85_/_0.85),oklch(0.16_0.05_60_/_0.9)_45%,oklch(0.18_0.06_300_/_0.85))] shadow-[0_20px_50px_-20px_oklch(0_0_0_/_0.8)] glow-gold hover-lift">
          {/* shine */}
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,oklch(1_0_0_/_0.08)_45%,transparent_60%)]" />
          <div aria-hidden className="absolute -top-20 -right-16 size-56 rounded-full bg-primary/25 blur-3xl" />
          <div aria-hidden className="absolute -bottom-20 -left-16 size-56 rounded-full bg-[oklch(0.7_0.25_340_/_0.25)] blur-3xl" />

          <div className="relative h-full flex flex-col justify-between text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[9px] tracking-[0.25em] text-white/70">TREY · TV</div>
                <div className="mt-0.5 text-[10px] tracking-[0.2em] text-primary font-semibold">REWARDS</div>
              </div>
              {/* chip */}
              <div className="size-9 rounded-md bg-[linear-gradient(135deg,oklch(0.85_0.16_85),oklch(0.65_0.15_60))] grid place-items-center shadow-inner">
                <div className="size-6 rounded-sm border border-white/40 grid grid-cols-2 grid-rows-2 gap-px p-0.5">
                  <span className="bg-white/30 rounded-[1px]" />
                  <span className="bg-white/20 rounded-[1px]" />
                  <span className="bg-white/20 rounded-[1px]" />
                  <span className="bg-white/30 rounded-[1px]" />
                </div>
              </div>
            </div>

            <div>
              <div className="font-mono text-base sm:text-lg tracking-[0.2em] flex items-center gap-2">
                {uid.replace(/(.{4})/g, "$1 ").trim()}
                <button onClick={() => { navigator.clipboard?.writeText(uid); toast.success("UID copied"); }} aria-label="copy" className="text-white/70 hover:text-primary"><Copy className="size-3.5" /></button>
              </div>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <div className="text-[9px] tracking-[0.2em] text-white/60">MEMBER</div>
                  <div className="text-sm font-semibold uppercase tracking-wider">{currentUser.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] tracking-[0.2em] text-white/60">POINTS</div>
                  <div className="text-base font-bold text-primary drop-shadow-[0_0_6px_var(--gold)]">12,480</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] tracking-[0.2em] text-white/60">TIER</div>
                  <div className="text-sm font-bold bg-clip-text text-transparent bg-[linear-gradient(90deg,oklch(0.82_0.16_85),oklch(0.7_0.25_340))]">GOLD</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Share2, label: "Share", onClick: async () => {
              try { await navigator.share?.({ title: currentUser.name, url: location.href }); }
              catch { await navigator.clipboard?.writeText(location.href); toast("Link copied"); }
            }},
            { icon: Link2, label: "Copy", onClick: () => { navigator.clipboard?.writeText(location.href); toast.success("Profile link copied"); } },
            { icon: MoreHorizontal, label: "More", onClick: () => toast("More options") },
          ].map((a) => (
            <button key={a.label} onClick={a.onClick} className="rounded-2xl glass border border-white/10 flex flex-col items-center justify-center py-2.5 hover:bg-white/5">
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
