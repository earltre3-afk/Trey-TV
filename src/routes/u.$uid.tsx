import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Bell, MoreHorizontal, MapPin, Link2, Share2, Copy, Grid3x3, Play } from "lucide-react";
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
        <div className="relative rounded-3xl overflow-hidden border border-white/10">
          <img src={banner} alt="" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <Link to="/" className="size-9 grid place-items-center rounded-full glass">
              <ArrowLeft className="size-4" />
            </Link>
            <div className="flex items-center gap-2">
              <button className="size-9 grid place-items-center rounded-full glass"><Bell className="size-4" /></button>
              <button className="size-9 grid place-items-center rounded-full glass"><MoreHorizontal className="size-4" /></button>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 top-12 size-32 rounded-full p-1 ring-neon-gold animate-glow-pulse bg-background">
            <img src={currentUser.avatar} alt="" className="size-full rounded-full object-cover" />
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

        {/* UID + actions */}
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-3 rounded-2xl glass border border-primary/30 p-3 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 size-24 rounded-full bg-primary/10 blur-2xl" />
            <div className="text-[10px] tracking-[0.2em] text-muted-foreground">TREY TV ID</div>
            <div className="font-mono text-sm mt-1 flex items-center gap-2">
              {uid.replace(/(.{4})/g, "$1 ").trim()}
              <button aria-label="copy" className="text-muted-foreground hover:text-primary"><Copy className="size-3.5" /></button>
            </div>
            <div className="absolute right-3 bottom-2 text-[9px] tracking-widest text-primary/70 font-bold">TREY · TV</div>
          </div>
          <div className="col-span-2 grid grid-cols-3 gap-2">
            {[
              { icon: Share2, label: "Share" },
              { icon: Link2, label: "Copy" },
              { icon: MoreHorizontal, label: "More" },
            ].map((a) => (
              <button key={a.label} className="rounded-2xl glass border border-white/10 flex flex-col items-center justify-center py-2 hover:bg-white/5">
                <a.icon className="size-4" />
                <span className="text-[10px] mt-1 text-muted-foreground">{a.label}</span>
              </button>
            ))}
          </div>
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
