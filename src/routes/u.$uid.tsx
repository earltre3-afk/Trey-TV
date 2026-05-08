import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Bell, MoreHorizontal, MapPin, Link2, Share2, Copy, Grid3x3, Play, Pencil, Gem, UserPlus, MessageCircle, Crown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { currentUser, prescribed, creators } from "@/lib/mock-data";
import banner from "@/assets/profile-banner.jpg";
import { VerifiedBadge } from "@/components/brand/Badge";
import { useAuth } from "@/lib/auth";
import { useFollow } from "@/lib/follow-store";
import { toast } from "sonner";

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
  const follow = useFollow();

  const profile = user ?? currentUser;
  const isOwnProfile = !isGuest && (user?.uid ?? currentUser.uid) === uid;
  const followingThis = follow.isFollowing(profile.handle);
  const onToggleFollow = () => {
    const now = follow.toggle({
      id: uid, name: profile.name, handle: profile.handle, avatar: profile.avatar as unknown as string,
    });
    toast.success(now ? `Added ${profile.name} to your friends` : `Removed ${profile.name}`);
  };

  const StatItem = ({ k, v }: { k: string; v: string | number }) => (
    <div className="p-3 lg:p-4 text-center">
      <div className="text-[10px] lg:text-[11px] tracking-wider text-muted-foreground">{k}</div>
      <div className="text-lg lg:text-2xl font-bold mt-0.5">{v}</div>
    </div>
  );

  return (
    <AppShell wide>
      <div className="space-y-5 -mt-3 lg:mt-0">
        {/* HERO */}
        <div className="relative">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 liquid-glass">
            <img src={profile.banner || banner} alt="" className="w-full h-40 sm:h-56 lg:h-72 xl:h-80 object-cover" />
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

            {/* Desktop identity overlay */}
            <div className="hidden lg:flex absolute inset-x-0 bottom-0 p-8 gap-6 items-end">
              <div className="size-32 xl:size-36 rounded-full conic-ring bg-background shrink-0">
                <img src={profile.avatar} alt="" className="size-full rounded-full object-cover ring-2 ring-white/20" />
              </div>
              <div className="flex-1 min-w-0 pb-2">
                <h1 className="text-3xl xl:text-4xl font-bold leading-tight flex items-center gap-2">
                  {profile.name}
                  <VerifiedBadge kind="creator" className="!size-5" />
                </h1>
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                  <span>@{profile.handle}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/40">
                    <Crown className="size-3" /> Verified Creator
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  {profile.location && <span className="flex items-center gap-1"><MapPin className="size-3" /> {profile.location}</span>}
                  {profile.link && <span className="flex items-center gap-1 text-[oklch(0.82_0.15_215)]"><Link2 className="size-3" /> {profile.link}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 pb-2">
                {isOwnProfile ? (
                  <Link to="/edit-profile" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground glow-gold tilt-press">
                    <Pencil className="size-4" /> Edit Profile
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={onToggleFollow}
                      className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold tilt-press ${
                        followingThis
                          ? "glass border border-white/15"
                          : "bg-primary text-primary-foreground glow-gold"
                      }`}
                    >
                      <UserPlus className="size-4" /> {followingThis ? "Friends" : "Follow"}
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold glass border border-white/15 hover:bg-white/5">
                      <MessageCircle className="size-4" /> Message
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile-only avatar overlap */}
          <div className="lg:hidden absolute left-1/2 -translate-x-1/2 -bottom-12 size-24 sm:size-28 rounded-full conic-ring bg-background animate-float">
            <img src={profile.avatar} alt="" className="size-full rounded-full object-cover ring-2 ring-white/20" />
          </div>
          <div className="lg:hidden h-12" />
        </div>

        {/* Mobile identity */}
        <div className="lg:hidden text-center px-2 -mt-2">
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

          <div className="mt-3 flex items-center justify-center gap-2">
            {isOwnProfile ? (
              <Link to="/edit-profile" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-primary text-primary-foreground glow-gold tilt-press">
                <Pencil className="size-3.5" /> Edit Profile
              </Link>
            ) : (
              <button
                onClick={onToggleFollow}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold tilt-press ${
                  followingThis
                    ? "glass border border-white/15"
                    : "bg-primary text-primary-foreground glow-gold"
                }`}
              >
                <UserPlus className="size-3.5" /> {followingThis ? "Friends" : "Follow"}
              </button>
            )}
            {isGuest && (
              <Link to="/onboarding" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold liquid-glass border border-white/10 text-foreground">
                Sign up to interact
              </Link>
            )}
          </div>
        </div>

        {/* DESKTOP 2-COL: main + side */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-5 min-w-0">
            {/* Stats */}
            <div className="rounded-3xl liquid-glass border border-white/10 grid grid-cols-4 divide-x divide-white/5">
              <StatItem k="POSTS" v={profile.stats.posts} />
              <StatItem k="FOLLOWERS" v={profile.stats.followers} />
              <StatItem k="FOLLOWING" v={profile.stats.following} />
              <StatItem k="PRESCRIPTIONS" v={profile.stats.prescriptions} />
            </div>

            {/* Desktop bio card */}
            <div className="hidden lg:block rounded-3xl glass neon-border p-5">
              <h3 className="text-xs tracking-widest text-muted-foreground mb-2">ABOUT</h3>
              <p className="text-sm whitespace-pre-line leading-relaxed">{profile.bio}</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-white/10">
              {tabs.map((t) => {
                const active = tab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`relative px-4 py-2.5 text-sm whitespace-nowrap transition ${active ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {t}
                    {active && <span className="absolute left-3 right-3 -bottom-px h-0.5 bg-primary rounded-full shadow-[0_0_8px_var(--gold)]" />}
                  </button>
                );
              })}
            </div>

            {/* Posts grid — denser on desktop */}
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-3">
              {prescribed.concat(prescribed).concat(prescribed).slice(0, 12).map((p, i) => (
                <div key={i} className="group relative aspect-[3/4] rounded-xl lg:rounded-2xl overflow-hidden border border-white/10 cursor-pointer">
                  <img src={p.media} alt="" className="size-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  {i === 0 && (
                    <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[oklch(0.65_0.22_300)] text-white">Pinned</span>
                  )}
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] flex items-center gap-1 text-white/90">
                    <Play className="size-3 fill-white" /> {p.duration ?? p.viewers ?? "8.7K"}
                  </span>
                  <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                    <div className="size-12 rounded-full bg-primary/90 grid place-items-center glow-gold">
                      <Play className="size-5 fill-primary-foreground text-primary-foreground" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 text-muted-foreground text-xs">
              <Grid3x3 className="size-3" /> End of public posts
            </div>
          </div>

          {/* SIDE — desktop only */}
          <aside className="hidden lg:flex flex-col gap-4 sticky top-6 h-fit">
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
                <button key={a.label} onClick={a.onClick} className="rounded-2xl liquid-glass liquid-hover border border-white/10 flex flex-col items-center justify-center py-3">
                  <a.icon className="size-4" />
                  <span className="text-[10px] mt-1 text-muted-foreground">{a.label}</span>
                </button>
              ))}
            </div>

            {/* Rewards card */}
            {isOwnProfile && (
              <Link to="/rewards" className="block rounded-3xl liquid-glass liquid-hover border border-white/10 p-4 relative overflow-hidden group">
                <div aria-hidden className="absolute -top-10 -right-10 size-32 rounded-full bg-primary/30 blur-3xl group-hover:bg-primary/50 transition" />
                <div className="relative flex items-center gap-3">
                  <div className="size-12 rounded-2xl grid place-items-center bg-primary/15 text-primary glow-gold"><Gem className="size-6" /></div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">Rewards · GOLD</div>
                    <div className="text-[11px] text-muted-foreground">12,480 pts available</div>
                  </div>
                  <div className="text-xs text-primary font-semibold">Open →</div>
                </div>
              </Link>
            )}

            {/* Engagement snapshot */}
            <div className="rounded-3xl glass neon-border p-4">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-3"><TrendingUp className="size-4 text-[oklch(0.78_0.18_150)]" /> This month</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between"><span className="text-muted-foreground">Profile views</span><span className="font-semibold">12.4K</span></li>
                <li className="flex items-center justify-between"><span className="text-muted-foreground">New followers</span><span className="font-semibold text-[oklch(0.78_0.18_150)]">+842</span></li>
                <li className="flex items-center justify-between"><span className="text-muted-foreground">Post reach</span><span className="font-semibold">94.1K</span></li>
                <li className="flex items-center justify-between"><span className="text-muted-foreground">Avg. watch time</span><span className="font-semibold">3:42</span></li>
              </ul>
            </div>

            {/* Mutual creators */}
            <div className="rounded-3xl glass neon-border p-4">
              <h3 className="text-sm font-bold mb-3">Frequently watched together</h3>
              <ul className="space-y-3">
                {creators.slice(0, 4).map((c) => (
                  <li key={c.id} className="flex items-center gap-3">
                    <img src={c.avatar} alt="" className="size-9 rounded-full object-cover ring-1 ring-white/15" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">@{c.handle}</div>
                    </div>
                    <button className="text-[11px] px-2.5 py-1 rounded-full border border-primary/40 text-primary hover:bg-primary/10">Follow</button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
