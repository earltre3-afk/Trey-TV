import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth";
import { useSubmissions, type Submission } from "@/lib/submissions-store";
import { creators, posts, currentUser } from "@/lib/mock-data";
import {
  Crown, Play, UserPlus, UserCheck, Gift, Sparkles, Share2, Bell, Verified,
  ArrowLeft, Users, Eye, MessageSquare, Image as ImageIcon, Film, Tv, Calendar, Clock, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/channel/$handle")({
  component: ChannelPage,
  head: ({ params }) => ({
    meta: [
      { title: `@${params.handle} — Trey TV Creator Channel` },
      { name: "description", content: `Watch shows, episodes, and live moments from @${params.handle} on Trey TV.` },
      { property: "og:title", content: `@${params.handle} on Trey TV` },
      { property: "og:description", content: `Approved Trey TV creator channel — full shows, trailers, and behind-the-scenes.` },
    ],
  }),
});

function ChannelPage() {
  const { handle } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const store = useSubmissions();

  // Resolve creator (by handle from session, mock creators, or fallback)
  const creator = useMemo(() => {
    if (user && user.handle === handle) {
      return { name: user.name, handle: user.handle, avatar: user.avatar, uid: user.uid };
    }
    const c = creators.find((x) => x.handle === handle);
    if (c) return { name: c.name, handle: c.handle, avatar: c.avatar, uid: c.id };
    return { name: handle, handle, avatar: currentUser.avatar, uid: handle };
  }, [handle, user]);

  // Public episodes by this creator (fall back to all approved if none match)
  const publicEpisodes = useMemo(() => {
    const visible = store.submissions.filter((s) => s.status === "approved" || s.status === "published" || s.status === "scheduled");
    const byThem = visible.filter((s) => s.creator_handle === handle || s.creator_id === creator.uid);
    return byThem.length ? byThem : visible.slice(0, 6);
  }, [store.submissions, handle, creator.uid]);

  const trailer = publicEpisodes.find((s) => s.is_trailer || s.episode_type === "Trailer") ?? publicEpisodes[0];
  const featured = publicEpisodes.find((s) => !s.is_trailer) ?? publicEpisodes[0];

  // Group into shows/seasons
  const shows = useMemo(() => {
    const map = new Map<string, { id: string; title: string; episodes: Submission[] }>();
    publicEpisodes.forEach((e) => {
      const id = e.show_id || "misc";
      const title = e.show_title || "Singles & Specials";
      if (!map.has(id)) map.set(id, { id, title, episodes: [] });
      map.get(id)!.episodes.push(e);
    });
    return [...map.values()].map((sh) => ({
      ...sh,
      seasons: groupBy(sh.episodes, (e) => e.season_number).sort((a, b) => Number(a.key) - Number(b.key)),
    }));
  }, [publicEpisodes]);

  const [tab, setTab] = useState<"home" | "shows" | "episodes" | "live" | "about">("home");
  const [following, setFollowing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [notify, setNotify] = useState(true);

  const isOwnChannel = user?.handle === handle;

  const onShare = async () => {
    try { await navigator.share?.({ title: `@${handle} on Trey TV`, url: location.href }); }
    catch { await navigator.clipboard?.writeText(location.href); toast.success("Channel link copied"); }
  };

  return (
    <AppShell wide>
      <div className="space-y-5 -mt-3">
        {/* Cinematic hero */}
        <section className="relative rounded-3xl overflow-hidden glass neon-border">
          <div className="relative aspect-[16/8] md:aspect-[16/6]">
            <img src={trailer?.thumbnail_url || posts[2].media} className="absolute inset-0 size-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,oklch(0.7_0.25_340_/_0.25),transparent_60%),radial-gradient(circle_at_80%_70%,oklch(0.65_0.22_300_/_0.25),transparent_60%)]" />

            <button
              onClick={() => navigate({ to: ".." as any })}
              className="absolute top-3 left-3 size-9 grid place-items-center rounded-full glass border border-white/10"
              aria-label="Back"
            ><ArrowLeft className="size-4" /></button>

            <div className="absolute top-3 right-3 flex gap-2">
              <button onClick={() => setNotify((n) => !n)} className={`size-9 grid place-items-center rounded-full glass border ${notify ? "border-primary/40 text-primary glow-gold" : "border-white/10"}`} aria-label="Notifications">
                <Bell className="size-4" />
              </button>
              <button onClick={onShare} className="size-9 grid place-items-center rounded-full glass border border-white/10" aria-label="Share">
                <Share2 className="size-4" />
              </button>
            </div>

            {/* Watch trailer CTA */}
            {trailer && (
              <Link to="/watch/$id" params={{ id: trailer.content_id }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-16 rounded-full bg-primary text-primary-foreground grid place-items-center glow-gold tilt-press">
                <Play className="size-7 fill-current ml-0.5" />
              </Link>
            )}

            {/* Creator identity strip */}
            <div className="absolute bottom-3 left-3 right-3 flex items-end gap-3 md:gap-4">
              <div className="size-16 md:size-20 rounded-2xl conic-ring shrink-0">
                <img src={creator.avatar} className="size-full rounded-2xl object-cover" alt="" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10px] tracking-[0.3em] text-primary mb-1">
                  <Crown className="size-3" /> APPROVED CREATOR
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-gradient-gold leading-tight truncate flex items-center gap-2">
                  {creator.name}
                  <Verified className="size-5 text-primary fill-primary/20 shrink-0" />
                </h1>
                <div className="text-xs md:text-sm text-muted-foreground truncate">@{creator.handle} · 32.7K fans · {publicEpisodes.length} episodes</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA bar */}
        <section className="flex flex-wrap gap-2">
          {isOwnChannel ? (
            <Link to="/creator-studio/channel" className="px-4 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold flex items-center gap-2 tilt-press">
              <Crown className="size-4" /> Manage channel
            </Link>
          ) : (
            <>
              <button
                onClick={() => { setFollowing((f) => !f); toast(following ? "Unfollowed" : "Following"); }}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 tilt-press ${
                  following ? "glass border border-white/15" : "bg-primary text-primary-foreground glow-gold"
                }`}
              >
                {following ? <><UserCheck className="size-4" /> Following</> : <><UserPlus className="size-4" /> Follow</>}
              </button>
              <button
                onClick={() => { setSubscribed((s) => !s); toast(subscribed ? "Unsubscribed" : "Subscribed ✦"); }}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 tilt-press ${
                  subscribed
                    ? "border border-[oklch(0.7_0.25_340_/_0.5)] text-[oklch(0.85_0.25_340)] bg-[oklch(0.7_0.25_340_/_0.12)]"
                    : "border border-[oklch(0.7_0.25_340_/_0.5)] text-[oklch(0.85_0.25_340)] hover:bg-[oklch(0.7_0.25_340_/_0.1)]"
                }`}
              >
                <Sparkles className="size-4" /> {subscribed ? "Subscribed" : "Subscribe"}
              </button>
              <button onClick={() => toast("Gift sent ✨")} className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 glass border border-primary/40 text-primary glow-gold tilt-press">
                <Gift className="size-4" /> Send gift
              </button>
            </>
          )}
        </section>

        {/* Tabs */}
        <nav className="rounded-2xl glass neon-border p-1.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 min-w-max">
            {([
              ["home", "Home"], ["shows", "Shows"], ["episodes", "Episodes"], ["live", "Live"], ["about", "About"],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                  tab === id ? "bg-primary/15 text-primary ring-1 ring-primary/40 glow-gold" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >{label}</button>
            ))}
          </div>
        </nav>

        {/* Tab content */}
        {tab === "home" && (
          <div className="space-y-5">
            {/* Featured show */}
            {featured && (
              <section className="rounded-3xl glass neon-border overflow-hidden">
                <div className="grid md:grid-cols-[1.4fr,1fr]">
                  <Link to="/watch/$id" params={{ id: featured.content_id }} className="relative aspect-video md:aspect-auto group">
                    <img src={featured.thumbnail_url || posts[0].media} className="absolute inset-0 size-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent md:to-transparent" />
                    <div className="absolute inset-0 grid place-items-center">
                      <span className="size-14 rounded-full bg-white/95 text-black grid place-items-center group-hover:scale-110 transition"><Play className="size-6 fill-current ml-0.5" /></span>
                    </div>
                  </Link>
                  <div className="p-5 flex flex-col justify-center gap-2">
                    <div className="text-[10px] tracking-[0.3em] text-primary flex items-center gap-1.5"><Sparkles className="size-3" /> FEATURED</div>
                    <h2 className="text-2xl font-bold text-gradient-gold leading-tight">{featured.title || "Featured episode"}</h2>
                    <div className="text-xs text-muted-foreground">{featured.show_title} · S{featured.season_number} E{featured.episode_number}</div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{featured.short_description || featured.full_description}</p>
                    <div className="flex gap-2 mt-2">
                      <Link to="/watch/$id" params={{ id: featured.content_id }} className="px-4 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold inline-flex items-center gap-1.5">
                        <Play className="size-4 fill-current" /> Watch now
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <Stats />
            <ShowsRail shows={shows} />
            <EpisodesGrid title="Latest episodes" items={publicEpisodes.slice(0, 6)} />
            <CommunityPanel />
          </div>
        )}

        {tab === "shows" && (
          <div className="space-y-4">
            {shows.length === 0 && <Empty icon={Tv} label="No shows yet" />}
            {shows.map((sh) => (
              <section key={sh.id} className="rounded-3xl glass neon-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold flex items-center gap-2"><Tv className="size-4 text-primary" /> {sh.title}</h3>
                  <span className="text-[11px] text-muted-foreground">{sh.episodes.length} episodes</span>
                </div>
                {sh.seasons.map((season) => (
                  <div key={season.key} className="mb-4 last:mb-0">
                    <div className="text-[10px] tracking-[0.3em] text-muted-foreground mb-2">SEASON {season.key}</div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {season.items.map((e) => <EpisodeCard key={e.content_id} e={e} />)}
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>
        )}

        {tab === "episodes" && (
          <EpisodesGrid title="All episodes" items={publicEpisodes} />
        )}

        {tab === "live" && (
          <section className="rounded-3xl glass neon-border p-8 text-center space-y-3">
            <div className="mx-auto size-14 rounded-2xl glass grid place-items-center bg-[oklch(0.65_0.24_15_/_0.18)] border border-[oklch(0.65_0.24_15_/_0.4)]">
              <Calendar className="size-7 text-[oklch(0.85_0.22_15)]" />
            </div>
            <h3 className="text-xl font-bold">No live show right now</h3>
            <p className="text-sm text-muted-foreground">Turn on notifications to be the first to know when {creator.name} goes live.</p>
            <button onClick={() => setNotify(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold">
              <Bell className="size-4" /> Notify me
            </button>
          </section>
        )}

        {tab === "about" && (
          <section className="rounded-3xl glass neon-border p-5 space-y-4">
            <div>
              <div className="text-[10px] tracking-[0.3em] text-primary mb-1">ABOUT</div>
              <p className="text-sm">{user?.bio ?? "Approved Trey TV creator. Original shows, episodes, and live moments — only on Trey TV."}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Pill label="Joined" value="2024" />
              <Pill label="Shows" value={String(shows.length)} />
              <Pill label="Episodes" value={String(publicEpisodes.length)} />
              <Pill label="Tier" value="Gold" />
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function Stats() {
  const items = [
    { k: "Fans", v: "32.7K", icon: Users },
    { k: "Watch time", v: "184K hrs", icon: Clock },
    { k: "Episodes", v: "48", icon: Film },
    { k: "Avg views", v: "12.4K", icon: Eye },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {items.map((i) => (
        <div key={i.k} className="rounded-2xl glass neon-border p-3 flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 grid place-items-center text-primary"><i.icon className="size-4" /></div>
          <div>
            <div className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">{i.k}</div>
            <div className="text-base font-bold tabular-nums">{i.v}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ShowsRail({ shows }: { shows: { id: string; title: string; episodes: Submission[] }[] }) {
  if (shows.length === 0) return null;
  return (
    <section>
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-base font-bold flex items-center gap-2"><Tv className="size-4 text-primary" /> Shows</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-3 px-3 pb-1">
        {shows.map((sh) => (
          <div key={sh.id} className="shrink-0 w-44 rounded-2xl glass neon-border overflow-hidden hover-lift">
            <div className="relative aspect-[3/4]">
              <img src={sh.episodes[0].thumbnail_url || posts[1].media} className="absolute inset-0 size-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <div className="text-sm font-bold leading-tight drop-shadow line-clamp-2">{sh.title}</div>
                <div className="text-[10px] text-white/70 mt-0.5">{sh.episodes.length} episodes</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EpisodesGrid({ title, items }: { title: string; items: Submission[] }) {
  if (items.length === 0) return <Empty icon={Film} label="No episodes yet" />;
  return (
    <section>
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-base font-bold flex items-center gap-2"><Film className="size-4 text-primary" /> {title}</h3>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((e) => <EpisodeCard key={e.content_id} e={e} />)}
      </div>
    </section>
  );
}

function EpisodeCard({ e }: { e: Submission }) {
  return (
    <Link to="/watch/$id" params={{ id: e.content_id }} className="group rounded-2xl glass neon-border overflow-hidden hover-lift block">
      <div className="relative aspect-video">
        <img src={e.thumbnail_url || posts[0].media} className="absolute inset-0 size-full object-cover group-hover:scale-105 transition" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-black/60 border border-white/15">S{e.season_number} · E{e.episode_number}</span>
        <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-black/60 border border-white/15 tabular-nums">{e.duration}</span>
        <span className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
          <span className="size-10 rounded-full bg-white/95 text-black grid place-items-center"><Play className="size-4 fill-current ml-0.5" /></span>
        </span>
      </div>
      <div className="p-2.5">
        <div className="text-sm font-semibold truncate">{e.title || "Untitled"}</div>
        <div className="text-[11px] text-muted-foreground truncate">{e.show_title || "—"}</div>
      </div>
    </Link>
  );
}

function CommunityPanel() {
  return (
    <section className="rounded-3xl glass neon-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold flex items-center gap-2"><MessageSquare className="size-4 text-primary" /> Community</h3>
        <button className="text-xs text-primary inline-flex items-center gap-1">See all <ChevronRight className="size-3" /></button>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-3">
            <div className="flex items-center gap-2">
              <img src={posts[i % posts.length].media} className="size-7 rounded-full object-cover" alt="" />
              <span className="text-xs font-semibold">Fan #{i}</span>
              <span className="text-[10px] text-muted-foreground ml-auto">2h</span>
            </div>
            <p className="text-xs mt-2 text-muted-foreground">"This show is the reason I joined Trey TV. The cinematography is unreal."</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-2.5">
      <div className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground">{label}</div>
      <div className="text-sm font-bold mt-0.5">{value}</div>
    </div>
  );
}

function Empty({ icon: Icon, label }: { icon: typeof Film; label: string }) {
  return (
    <div className="rounded-3xl glass neon-border p-10 text-center">
      <div className="mx-auto size-12 rounded-2xl glass grid place-items-center mb-3"><Icon className="size-6 text-muted-foreground" /></div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function groupBy<T>(arr: T[], key: (x: T) => string | number) {
  const map = new Map<string, T[]>();
  arr.forEach((item) => {
    const k = String(key(item));
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(item);
  });
  return [...map.entries()].map(([key, items]) => ({ key, items: items.sort((a: any, b: any) => (a.episode_number ?? 0) - (b.episode_number ?? 0)) }));
}
