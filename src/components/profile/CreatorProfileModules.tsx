/**
 * CreatorProfileModules.tsx
 * All main-column content sections for a CREATOR profile.
 * Adapts between owner and public/guest views.
 *
 * Sections:
 * - Creator bio / about card
 * - Tab nav: Home | Shows | Episodes | Live | About
 * - Featured show/episode
 * - Episodes grid
 * - Shows rail
 * - Community panel
 * - Pinned content
 * - Watch Now rail
 * - Fan/subscriber stats (public)
 * - Owner analytics teaser (inline, mobile)
 */

import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Play, Sparkles, Tv, Film, Calendar, Bell, MessageSquare, ChevronRight,
  Users, Eye, Clock, Crown, TrendingUp, BarChart2,
} from "lucide-react";
import { posts as mockPosts } from "@/lib/mock-data";
import { useSubmissions, type Submission } from "@/lib/submissions-store";
import { ProfileSectionCard, ProfileEmptyState } from "./ProfileSectionCard";
import type { ProfileContext } from "./ProfileTypes";

type CreatorTab = "home" | "shows" | "episodes" | "live" | "about";

interface Props extends ProfileContext {}

export function CreatorProfileModules({ profile, isOwner, viewerRole }: Props) {
  const [tab, setTab] = useState<CreatorTab>("home");
  const [notify, setNotify] = useState(true);
  const store = useSubmissions();
  const isGuest = viewerRole === "guest";

  // Resolve public episodes for this creator
  const publicEpisodes = useMemo(() => {
    const visible = store.submissions.filter(
      (s) => s.status === "approved" || s.status === "published" || s.status === "scheduled"
    );
    const byThem = visible.filter(
      (s) => s.creator_handle === profile.handle || s.creator_id === profile.uid
    );
    return byThem.length ? byThem : visible.slice(0, 6);
  }, [store.submissions, profile.handle, profile.uid]);

  const trailer = publicEpisodes.find((s) => s.is_trailer || s.episode_type === "Trailer") ?? publicEpisodes[0];
  const featured = publicEpisodes.find((s) => !s.is_trailer) ?? publicEpisodes[0];

  const shows = useMemo(() => {
    const map = new Map<string, { id: string; title: string; episodes: Submission[] }>();
    publicEpisodes.forEach((e) => {
      const id = e.show_id || "misc";
      const title = e.show_title || "Singles & Specials";
      if (!map.has(id)) map.set(id, { id, title, episodes: [] });
      map.get(id)!.episodes.push(e);
    });
    return [...map.values()];
  }, [publicEpisodes]);

  const TAB_ITEMS: Array<[CreatorTab, string]> = [
    ["home", "Home"],
    ["shows", "Shows"],
    ["episodes", "Episodes"],
    ["live", "Live"],
    ["about", "About"],
  ];

  return (
    <div className="space-y-5 min-w-0">
      {/* ── Creator bio card (desktop) ───────────────────────── */}
      <div className={`hidden lg:block rounded-3xl ${isOwner ? "owner-neon owner-glass" : "glass neon-border"} p-5`}>
        <div className="text-[10px] tracking-[0.3em] text-primary mb-2 flex items-center gap-1.5">
          <Crown className="size-3" /> CREATOR CHANNEL
        </div>
        <p className="text-sm whitespace-pre-line leading-relaxed">
          {profile.bio || "Approved Trey TV creator. Original shows, episodes, and live moments — only on Trey TV."}
        </p>
        {profile.joinedDate && (
          <p className="text-[11px] text-muted-foreground mt-2">Member since {profile.joinedDate}</p>
        )}
      </div>

      {/* ── Owner quick analytics (mobile only) ─────────────── */}
      {isOwner && (
        <div className="lg:hidden rounded-3xl owner-neon owner-glass p-4">
          <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
            <BarChart2 className="size-4 text-[oklch(0.78_0.18_150)]" /> Quick Stats
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { k: "Profile views", v: "12.4K" },
              { k: "New fans", v: "+842" },
              { k: "Watch hours", v: "3.2K" },
              { k: "Avg. watch time", v: "3:42" },
            ].map((row) => (
              <div key={row.k} className="rounded-xl bg-white/5 p-2.5">
                <div className="text-[10px] text-muted-foreground">{row.k}</div>
                <div className="text-sm font-bold">{row.v}</div>
              </div>
            ))}
          </div>
          <Link
            to="/creator-studio/analytics"
            className="mt-3 block text-xs text-center text-primary hover:underline"
          >
            Full analytics →
          </Link>
        </div>
      )}

      {/* ── Channel-style stats bar (all viewers) ───────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { k: "Fans", v: profile.stats.followers, icon: Users },
          { k: "Watch hrs", v: profile.stats.watchHours ?? "—", icon: Clock },
          { k: "Episodes", v: profile.stats.episodes ?? publicEpisodes.length, icon: Film },
          { k: "Avg views", v: "12.4K", icon: Eye },
        ].map((item) => (
          <div key={item.k} className="rounded-2xl glass neon-border p-3 flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/10 grid place-items-center text-primary shrink-0">
              <item.icon className="size-4" />
            </div>
            <div>
              <div className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">{item.k}</div>
              <div className="text-base font-bold tabular-nums">{item.v}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab nav ──────────────────────────────────────────── */}
      <nav className="rounded-2xl glass neon-border p-1.5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 min-w-max">
          {TAB_ITEMS.map(([id, label]) => (
            <button
              key={id}
              id={`creator-tab-${id}`}
              onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                tab === id
                  ? "bg-primary/15 text-primary ring-1 ring-primary/40 glow-gold"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Home tab ─────────────────────────────────────────── */}
      {tab === "home" && (
        <div className="space-y-5">
          {featured && <FeaturedCard ep={featured} />}
          <ShowsRail shows={shows} />
          <EpisodesGrid title="Latest episodes" items={publicEpisodes.slice(0, 6)} />
          <CommunityPanel />
        </div>
      )}

      {/* ── Shows tab ────────────────────────────────────────── */}
      {tab === "shows" && (
        <div className="space-y-4">
          {shows.length === 0 && (
            <ProfileEmptyState
              icon={Tv}
              label="No shows yet"
              subLabel={isOwner ? "Submit your first show via Creator Studio." : undefined}
              action={
                isOwner ? (
                  <Link
                    to="/creator-studio/submit"
                    search={{ id: undefined }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground glow-gold"
                  >
                    Submit show
                  </Link>
                ) : undefined
              }
            />
          )}
          {shows.map((sh) => (
            <section key={sh.id} className="rounded-3xl glass neon-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Tv className="size-4 text-primary" /> {sh.title}
                </h3>
                <span className="text-[11px] text-muted-foreground">{sh.episodes.length} episodes</span>
              </div>
              <EpisodesGrid title="" items={sh.episodes} />
            </section>
          ))}
        </div>
      )}

      {/* ── Episodes tab ─────────────────────────────────────── */}
      {tab === "episodes" && (
        <EpisodesGrid title="All episodes" items={publicEpisodes} />
      )}

      {/* ── Live tab ─────────────────────────────────────────── */}
      {tab === "live" && (
        <section className="rounded-3xl glass neon-border p-8 text-center space-y-3">
          <div className="mx-auto size-14 rounded-2xl glass grid place-items-center bg-[oklch(0.65_0.24_15_/_0.18)] border border-[oklch(0.65_0.24_15_/_0.4)]">
            <Calendar className="size-7 text-[oklch(0.85_0.22_15)]" />
          </div>
          <h3 className="text-xl font-bold">No live show right now</h3>
          <p className="text-sm text-muted-foreground">
            Turn on notifications to be the first to know when {profile.displayName} goes live.
          </p>
          {isGuest ? (
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold"
            >
              Sign up for alerts
            </Link>
          ) : (
            <button
              onClick={() => setNotify(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold"
            >
              <Bell className="size-4" /> Notify me
            </button>
          )}
        </section>
      )}

      {/* ── About tab ────────────────────────────────────────── */}
      {tab === "about" && (
        <section className="rounded-3xl glass neon-border p-5 space-y-4">
          <div>
            <div className="text-[10px] tracking-[0.3em] text-primary mb-1">ABOUT</div>
            <p className="text-sm">
              {profile.bio ||
                "Approved Trey TV creator. Original shows, episodes, and live moments — only on Trey TV."}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: "Joined", value: profile.joinedDate ?? "2024" },
              { label: "Shows", value: String(shows.length) },
              { label: "Episodes", value: String(publicEpisodes.length) },
              { label: "Tier", value: profile.rewards?.tier ?? "Gold" },
            ].map((p) => (
              <div key={p.label} className="rounded-xl bg-white/5 ring-1 ring-white/10 p-2.5">
                <div className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground">{p.label}</div>
                <div className="text-sm font-bold mt-0.5">{p.value}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Featured episode card ───────────────────────────────────────────────────

function FeaturedCard({ ep }: { ep: Submission }) {
  return (
    <section className="rounded-3xl glass neon-border overflow-hidden">
      <div className="grid md:grid-cols-[1.4fr,1fr]">
        <Link
          to="/watch/$id"
          params={{ id: ep.content_id }}
          className="relative aspect-video md:aspect-auto group"
        >
          <img
            src={ep.thumbnail_url || mockPosts[0].media}
            className="absolute inset-0 size-full object-cover"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
          <div className="absolute inset-0 grid place-items-center">
            <span className="size-14 rounded-full bg-white/95 text-black grid place-items-center group-hover:scale-110 transition">
              <Play className="size-6 fill-current ml-0.5" />
            </span>
          </div>
        </Link>
        <div className="p-5 flex flex-col justify-center gap-2">
          <div className="text-[10px] tracking-[0.3em] text-primary flex items-center gap-1.5">
            <Sparkles className="size-3" /> FEATURED
          </div>
          <h2 className="text-2xl font-bold text-gradient-gold leading-tight">
            {ep.title || "Featured episode"}
          </h2>
          <div className="text-xs text-muted-foreground">
            {ep.show_title} · S{ep.season_number} E{ep.episode_number}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {ep.short_description || ep.full_description}
          </p>
          <div className="flex gap-2 mt-2">
            <Link
              to="/watch/$id"
              params={{ id: ep.content_id }}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold inline-flex items-center gap-1.5"
            >
              <Play className="size-4 fill-current" /> Watch now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Shows rail ─────────────────────────────────────────────────────────────

function ShowsRail({ shows }: { shows: Array<{ id: string; title: string; episodes: Submission[] }> }) {
  if (shows.length === 0) return null;
  return (
    <section>
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-base font-bold flex items-center gap-2">
          <Tv className="size-4 text-primary" /> Shows
        </h3>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-3 px-3 pb-1">
        {shows.map((sh) => (
          <div key={sh.id} className="shrink-0 w-44 rounded-2xl glass neon-border overflow-hidden hover-lift">
            <div className="relative aspect-[3/4]">
              <img
                src={sh.episodes[0]?.thumbnail_url || mockPosts[1].media}
                className="absolute inset-0 size-full object-cover"
                alt=""
              />
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

// ─── Episodes grid ───────────────────────────────────────────────────────────

function EpisodesGrid({ title, items }: { title: string; items: Submission[] }) {
  if (items.length === 0 && title) {
    return <ProfileEmptyState icon={Film} label="No episodes yet" />;
  }
  return (
    <section>
      {title && (
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Film className="size-4 text-primary" /> {title}
          </h3>
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((e) => (
          <Link
            key={e.content_id}
            to="/watch/$id"
            params={{ id: e.content_id }}
            className="group rounded-2xl glass neon-border overflow-hidden hover-lift block"
          >
            <div className="relative aspect-video">
              <img
                src={e.thumbnail_url || mockPosts[0].media}
                className="absolute inset-0 size-full object-cover group-hover:scale-105 transition"
                alt=""
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-black/60 border border-white/15">
                S{e.season_number} · E{e.episode_number}
              </span>
              <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-black/60 border border-white/15 tabular-nums">
                {e.duration}
              </span>
              <span className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                <span className="size-10 rounded-full bg-white/95 text-black grid place-items-center">
                  <Play className="size-4 fill-current ml-0.5" />
                </span>
              </span>
            </div>
            <div className="p-2.5">
              <div className="text-sm font-semibold truncate">{e.title || "Untitled"}</div>
              <div className="text-[11px] text-muted-foreground truncate">{e.show_title || "—"}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Community panel ─────────────────────────────────────────────────────────

function CommunityPanel() {
  return (
    <section className="rounded-3xl glass neon-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold flex items-center gap-2">
          <MessageSquare className="size-4 text-primary" /> Community
        </h3>
        <button className="text-xs text-primary inline-flex items-center gap-1">
          See all <ChevronRight className="size-3" />
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-3">
            <div className="flex items-center gap-2">
              <img
                src={mockPosts[i % mockPosts.length].media}
                className="size-7 rounded-full object-cover"
                alt=""
              />
              <span className="text-xs font-semibold">Fan #{i}</span>
              <span className="text-[10px] text-muted-foreground ml-auto">2h</span>
            </div>
            <p className="text-xs mt-2 text-muted-foreground">
              "This show is the reason I joined Trey TV. The cinematography is unreal."
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
