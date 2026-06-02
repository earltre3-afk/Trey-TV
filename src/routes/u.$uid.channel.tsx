import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  BookmarkPlus,
  Calendar,
  ChevronRight,
  Clock,
  Crown,
  Eye,
  Film,
  Gift,
  Globe,
  Instagram,
  MessageSquare,
  Music2,
  Play,
  Radio,
  Share,
  Sparkles,
  Tv,
  UserCheck,
  UserPlus,
  Users,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { LovableChannelPage } from "@/components/profile/lovable/LovableChannelPage";
import { GiftPickerSheet } from "@/components/gifts/GiftPickerSheet";
import { AvatarWithFallback } from "@/components/brand/DefaultAvatar";
import { GoldCheck } from "@/components/brand/Badge";
import { useGoBack } from "@/hooks/use-go-back";
import { useProfile, useRelationshipStatus } from "@/hooks/use-profile";
import { useAuth } from "@/lib/auth";
import { currentUser } from "@/lib/mock-data";
import { isTreyOwnerProfile } from "@/lib/trey-owner";
import { toggleFollow } from "@/lib/social-relationships";
import { useSubmissions, type Submission } from "@/lib/submissions-store";
import heroFallback from "@/assets/pixel-channel-hero.jpg";
import portraitFallback from "@/assets/pixel-profile-portrait.jpg";
import postsStrip from "@/assets/pixel-posts-strip.jpg";
import postFallback1 from "@/assets/pixel-post1.jpg";
import postFallback2 from "@/assets/pixel-post2.jpg";
import postFallback3 from "@/assets/pixel-post3.jpg";
import treyTvLogo from "@/assets/trey-tv-logo.png";

const GOLD = "#FFC857";
const PURPLE = "#A855F7";
const CYAN = "#00B7FF";
const PINK = "#EC4899";

export const Route = createFileRoute("/u/$uid/channel")({
  component: CreatorChannelRoute,
  head: ({ params }) => ({
    meta: [
      { title: `Creator Channel - Trey TV` },
      { name: "description", content: `Creator channel on Trey TV. UID ${params.uid}.` },
    ],
  }),
});

function CreatorChannelRoute() {
  const { uid } = Route.useParams();
  const { user, isGuest } = useAuth();
  const { profile, loading } = useProfile(uid);
  const { status } = useRelationshipStatus(profile?.id || "");
  const submissions = useSubmissions();
  const goBack = useGoBack(`/u/${uid}`);
  const [tab, setTab] = useState<"home" | "videos" | "series" | "community" | "about">("home");
  const [subscribed, setSubscribed] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [following, setFollowing] = useState(false);

  const normalized = useMemo(() => {
    if (!profile) {
      const isTreyProfile = isTreyOwnerProfile({ uid });
      return {
        id: "",
        uid,
        name: isTreyProfile ? currentUser.name : loading ? "Loading channel" : "Creator channel unavailable",
        handle: isTreyProfile ? currentUser.handle : uid,
        avatar: isTreyProfile ? portraitFallback : "",
        banner: heroFallback,
        bio: isTreyProfile ? currentUser.bio : "This creator channel is not available yet.",
        location: isTreyProfile ? currentUser.location : "",
        website: isTreyProfile ? currentUser.link : "",
        instagram: "",
        tiktok: "",
        youtube: "",
        followers: isTreyProfile ? currentUser.stats.followers : 0,
        posts: isTreyProfile ? currentUser.stats.posts : 0,
        creator: isTreyProfile,
        verified: isTreyProfile,
      };
    }

    const isCreator =
      profile.creator_status === "approved" ||
      profile.role === "creator" ||
      profile.role === "admin";

    return {
      id: profile.id,
      uid: profile.public_profile_uid,
      name: profile.display_name || profile.username || "Creator",
      handle: profile.username || "creator",
      avatar: profile.avatar_url || "",
      banner: profile.banner_url || heroFallback,
      bio: profile.bio || "Creator channel is being built.",
      location: profile.location || "",
      website: profile.link_url || "",
      instagram: profile.social_instagram || "",
      tiktok: profile.social_tiktok || "",
      youtube: profile.social_youtube || "",
      followers: profile.follower_count ?? 0,
      posts: profile.post_count ?? 0,
      creator: isCreator,
      verified: isCreator,
    };
  }, [loading, profile, uid]);

  const isOwnChannel = !isGuest && user?.uid === uid;
  const isFollowing = following || Boolean(status?.is_following);

  const publicEpisodes = useMemo(() => {
    if (!profile) return [];
    return submissions.submissions.filter((episode) => {
      const visible = episode.status === "approved" || episode.status === "published" || episode.status === "scheduled";
      const sameCreator =
        episode.creator_id === profile.public_profile_uid ||
        episode.creator_id === profile.id ||
        episode.creator_handle === profile.username;
      return visible && sameCreator;
    });
  }, [profile, submissions.submissions]);

  const trailer = publicEpisodes.find((episode) => episode.is_trailer || episode.episode_type === "Trailer") ?? publicEpisodes[0];
  const featured = publicEpisodes.find((episode) => !episode.is_trailer) ?? publicEpisodes[0];
  const shows = useMemo(() => buildShows(publicEpisodes), [publicEpisodes]);

  const handleFollow = async () => {
    if (!normalized.id || isOwnChannel || status?.can_follow === false) return;
    if (isGuest) {
      window.location.href = "/signup";
      return;
    }
    const previous = isFollowing;
    setFollowing(!previous);
    const ok = await toggleFollow(normalized.id, previous);
    if (!ok) {
      setFollowing(previous);
      return;
    }
    toast.success(previous ? `Unfollowed ${normalized.name}` : `Following ${normalized.name}`);
  };

  const onShare = async () => {
    try {
      await navigator.share?.({ title: `${normalized.name} on Trey TV`, url: location.href });
    } catch {
      await navigator.clipboard?.writeText(location.href);
      toast.success("Channel link copied");
    }
  };

  if (!normalized.creator) {
    return (
      <AppShell wide>
        <div className="creator-channel-page mx-auto max-w-xl py-12 text-center">
          <div className="channel-panel p-8">
            <Crown className="mx-auto size-10 text-white/40" />
            <h1 className="mt-4 text-2xl font-bold">Creator channel unavailable</h1>
            <p className="mt-2 text-sm text-white/60">This profile is not an approved creator channel yet.</p>
            <Link to="/u/$uid" params={{ uid }} className="mt-5 inline-flex rounded-full bg-white px-5 py-2 text-sm font-bold text-black">
              View Profile
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell wide>
      <div className="-mx-4 -mt-4 sm:-mx-6 lg:-mx-8">
        <LovableChannelPage
          profile={{
            uid: normalized.uid,
            id: normalized.id,
            name: normalized.name,
            handle: normalized.handle,
            avatar: normalized.avatar,
            banner: normalized.banner,
            bio: normalized.bio,
            followers: normalized.followers,
            posts: normalized.posts,
            views: "-",
            isVerified: normalized.verified,
            isFounder: isTreyOwnerProfile({ uid: normalized.uid, username: normalized.handle }),
          }}
        />
      </div>
    </AppShell>
  );

  return (
    <AppShell wide>
      <main className="creator-channel-page -mx-4 -mt-4 min-h-screen pb-28 text-white sm:-mx-6 lg:-mx-8">
        <section className="relative min-h-[620px] overflow-hidden">
          <img src={normalized.banner || heroFallback} alt="" className="absolute inset-0 size-full object-cover object-top" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,13,0.05)_20%,rgba(5,7,13,0.70)_72%,#05070D_100%),linear-gradient(90deg,rgba(5,7,13,0.94)_0%,rgba(5,7,13,0.62)_38%,rgba(5,7,13,0.10)_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(800px_420px_at_80%_0%,rgba(168,85,247,0.26),transparent_60%),radial-gradient(520px_360px_at_15%_30%,rgba(0,183,255,0.18),transparent_60%)]" />

          <div className="relative z-10 flex min-h-[620px] flex-col px-5 pb-8 pt-5 md:px-10 lg:px-14">
            <div className="flex items-center justify-between">
              <button onClick={goBack} className="grid size-10 place-items-center rounded-full border border-white/15 bg-black/40 backdrop-blur" aria-label="Back">
                <ArrowLeft className="size-4" />
              </button>
              <img src={treyTvLogo} alt="Trey TV" className="h-12 w-auto object-contain drop-shadow-[0_0_18px_rgba(255,200,87,0.55)]" />
              <button onClick={onShare} className="grid size-10 place-items-center rounded-full border border-white/15 bg-black/40 backdrop-blur" aria-label="Share channel">
                <Share className="size-4" />
              </button>
            </div>

            <div className="mt-auto grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/40 bg-purple-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em]">
                  <Crown className="size-3.5" style={{ color: GOLD }} /> Creator Channel
                </div>

                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="channel-avatar-ring relative size-28 shrink-0 rounded-[2rem] p-[3px] sm:size-36">
                    <AvatarWithFallback
                      src={normalized.avatar}
                      alt={`${normalized.name} profile`}
                      name={normalized.name}
                      uid={normalized.uid}
                      size="2xl"
                      shape="square"
                      className="size-full rounded-[1.75rem] ring-2 ring-white/20"
                    />
                  </div>
                  <div className="min-w-0">
                    <h1 className="flex flex-wrap items-center gap-2 text-5xl font-black leading-none tracking-tight sm:text-6xl lg:text-7xl">
                      {normalized.name}
                      {normalized.verified && <GoldCheck size={28} className="shrink-0" />}
                    </h1>
                    <p className="mt-2 text-sm font-semibold" style={{ color: PURPLE }}>@{normalized.handle}</p>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">{normalized.bio}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {featured ? (
                    <Link to="/watch/$id" params={{ id: featured.content_id }} className="channel-primary-btn">
                      <Play className="size-4 fill-current" /> Play Latest Video
                    </Link>
                  ) : (
                    <button className="channel-primary-btn" onClick={() => toast("First episode coming soon")}>
                      <Play className="size-4 fill-current" /> First Episode Coming Soon
                    </button>
                  )}
                  {!isOwnChannel && (
                    <button onClick={handleFollow} className="channel-secondary-btn">
                      {isFollowing ? <UserCheck className="size-4" /> : <UserPlus className="size-4" />}
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                  <button onClick={() => setSubscribed((value) => !value)} className="channel-secondary-btn">
                    <Sparkles className="size-4" /> {subscribed ? "Subscribed" : "Subscribe"}
                  </button>
                  <button onClick={() => setGiftOpen(true)} className="channel-icon-btn" aria-label="Send gift">
                    <Gift className="size-5" />
                  </button>
                </div>
              </div>

              <aside className="channel-panel p-5">
                <div className="text-base font-bold">About {normalized.name}</div>
                <p className="mt-2 text-sm leading-6 text-white/72">{normalized.bio || "Creator channel is being built."}</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <StatPill label="Followers" value={formatCount(normalized.followers)} />
                  <StatPill label="Posts" value={formatCount(normalized.posts)} />
                  <StatPill label="Episodes" value={String(publicEpisodes.length)} />
                  <StatPill label="Views" value="-" />
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="px-5 md:px-10 lg:px-14">
          <nav className="channel-tabs">
            {(["home", "videos", "series", "community", "about"] as const).map((item) => (
              <button key={item} onClick={() => setTab(item)} className={tab === item ? "is-active" : ""}>
                {item}
              </button>
            ))}
          </nav>
        </section>

        <div className="space-y-8 px-5 pt-6 md:px-10 lg:px-14">
          {tab === "home" && (
            <>
              <PrescribePanel />
              <FeaturedRelease episode={featured} />
              <EpisodeRail title="Uploads" episodes={publicEpisodes} />
              <SeriesGrid shows={shows} />
              <AboutPanel profile={normalized} />
            </>
          )}
          {tab === "videos" && <EpisodeRail title="All Videos" episodes={publicEpisodes} expanded />}
          {tab === "series" && <SeriesGrid shows={shows} expanded />}
          {tab === "community" && <CommunityEmpty />}
          {tab === "about" && <AboutPanel profile={normalized} expanded />}
        </div>

        <GiftPickerSheet open={giftOpen} onClose={() => setGiftOpen(false)} recipient={normalized.handle} />
      </main>
    </AppShell>
  );
}

function PrescribePanel() {
  return (
    <section className="channel-panel relative overflow-hidden p-5">
      <div className="absolute inset-0 opacity-60" style={{ background: `radial-gradient(circle at 20% 20%, ${PINK}33, transparent 55%), radial-gradient(circle at 80% 70%, ${CYAN}22, transparent 55%)` }} />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: GOLD }}>
            <Sparkles className="size-4" /> Prescribe Me
          </div>
          <p className="mt-2 max-w-2xl text-sm text-white/75">Mood match and compatibility tools can connect fans to this creator's best content as soon as channel uploads are available.</p>
        </div>
        <button className="rounded-full px-5 py-2 text-sm font-black text-black" style={{ background: GOLD, boxShadow: `0 0 24px ${GOLD}66` }}>
          Prescribe Now
        </button>
      </div>
    </section>
  );
}

function FeaturedRelease({ episode }: { episode?: Submission }) {
  if (!episode) {
    return (
      <section className="channel-feature-card">
        <img src={postsStrip} alt="" className="absolute inset-0 size-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070D] via-[#05070D]/75 to-transparent" />
        <div className="relative max-w-lg p-6 md:p-8">
          <div className="channel-eyebrow">Trey Original</div>
          <h2 className="mt-2 text-4xl font-black leading-none">First Episode<br />Coming Soon</h2>
          <p className="mt-3 text-sm text-white/70">No uploads yet. This creator channel is being built.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="channel-feature-card">
      <img src={episode.thumbnail_url || postFallback1} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#05070D] via-[#05070D]/70 to-transparent" />
      <div className="relative max-w-xl p-6 md:p-8">
        <div className="channel-eyebrow">Latest Release</div>
        <h2 className="mt-2 text-4xl font-black leading-none md:text-5xl">{episode.title || "Untitled Episode"}</h2>
        <p className="mt-3 text-sm text-white/75">{episode.short_description || episode.full_description || "New Trey TV creator upload."}</p>
        <Link to="/watch/$id" params={{ id: episode.content_id }} className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-black">
          <Play className="size-4 fill-current" /> Watch Now
        </Link>
      </div>
    </section>
  );
}

function EpisodeRail({ title, episodes, expanded = false }: { title: string; episodes: Submission[]; expanded?: boolean }) {
  if (episodes.length === 0) return <EmptyState icon={Film} title="No uploads yet" body="First episode coming soon." />;
  return (
    <section>
      <SectionHeader icon={Film} title={title} />
      <div className={expanded ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex gap-4 overflow-x-auto pb-2"}>
        {episodes.map((episode, index) => (
          <EpisodeCard key={episode.content_id} episode={episode} fallback={[postFallback1, postFallback2, postFallback3][index % 3]} expanded={expanded} />
        ))}
      </div>
    </section>
  );
}

function EpisodeCard({ episode, fallback, expanded }: { episode: Submission; fallback: string; expanded: boolean }) {
  return (
    <Link to="/watch/$id" params={{ id: episode.content_id }} className={`group block ${expanded ? "" : "w-72 shrink-0"}`}>
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <img src={episode.thumbnail_url || fallback} alt="" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <span className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-1 text-[10px] font-bold">{episode.duration || "0:00"}</span>
        <span className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
          <span className="grid size-12 place-items-center rounded-full bg-white text-black"><Play className="size-5 fill-current" /></span>
        </span>
      </div>
      <h3 className="mt-2 line-clamp-2 text-sm font-bold">{episode.title || "Untitled Episode"}</h3>
      <p className="mt-0.5 text-xs text-white/50">{episode.show_title || "Trey TV"} {episode.season_number ? `- S${episode.season_number} E${episode.episode_number || 1}` : ""}</p>
    </Link>
  );
}

function SeriesGrid({ shows, expanded = false }: { shows: ChannelShow[]; expanded?: boolean }) {
  if (shows.length === 0) return <EmptyState icon={Tv} title="No series yet" body="Creator channel is being built." />;
  return (
    <section>
      <SectionHeader icon={Tv} title="Seasons and Series" />
      <div className={expanded ? "grid grid-cols-2 gap-4 md:grid-cols-4" : "grid grid-cols-2 gap-4 md:grid-cols-4"}>
        {shows.map((show, index) => (
          <div key={show.id} className="channel-poster-card">
            <img src={show.episodes[0]?.thumbnail_url || [postFallback1, postFallback2, postFallback3][index % 3]} alt="" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-lg font-black leading-none">{show.title}</h3>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: PURPLE }}>{show.episodes.length} episodes</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutPanel({ profile, expanded = false }: { profile: ReturnType<typeof useProfileShape>; expanded?: boolean }) {
  const socials = [
    profile.instagram && { icon: Instagram, label: "Instagram", value: profile.instagram },
    profile.tiktok && { icon: Music2, label: "TikTok", value: profile.tiktok },
    profile.youtube && { icon: Youtube, label: "YouTube", value: profile.youtube },
    profile.website && { icon: Globe, label: "Website", value: profile.website },
  ].filter(Boolean) as Array<{ icon: typeof Instagram; label: string; value: string }>;

  return (
    <section className={`channel-panel p-5 ${expanded ? "max-w-4xl" : ""}`}>
      <SectionHeader icon={Users} title={`About ${profile.name}`} />
      <p className="mt-3 text-sm leading-7 text-white/76">{profile.bio || "Creator channel is being built."}</p>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {profile.location && <InfoPill icon={Calendar} label="Location" value={profile.location} />}
        <InfoPill icon={Film} label="Posts" value={formatCount(profile.posts)} />
        <InfoPill icon={Users} label="Followers" value={formatCount(profile.followers)} />
        <InfoPill icon={Clock} label="Watch Time" value="-" />
      </div>
      {socials.length > 0 && (
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {socials.map((social) => (
            <InfoPill key={social.label} icon={social.icon} label={social.label} value={social.value} />
          ))}
        </div>
      )}
    </section>
  );
}

function CommunityEmpty() {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <EmptyState icon={MessageSquare} title="Community posts coming soon" body="This channel has not posted community updates yet." />
      <EmptyState icon={Radio} title="No live show right now" body="Turn on notifications to know when this creator goes live." />
    </section>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: typeof Film; title: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-xl font-black">
        <Icon className="size-5" style={{ color: GOLD }} /> {title}
      </h2>
      <ChevronRight className="size-4 text-white/35" />
    </div>
  );
}

function EmptyState({ icon: Icon, title, body }: { icon: typeof Film; title: string; body: string }) {
  return (
    <div className="channel-panel p-8 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
        <Icon className="size-7 text-white/40" />
      </div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-white/55">{body}</p>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">{label}</div>
      <div className="mt-1 text-lg font-black">{value}</div>
    </div>
  );
}

function InfoPill({ icon: Icon, label, value }: { icon: typeof Film; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <Icon className="size-4" style={{ color: CYAN }} />
      <div className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">{label}</div>
      <div className="mt-1 truncate text-sm font-bold">{value}</div>
    </div>
  );
}

type ChannelShow = {
  id: string;
  title: string;
  episodes: Submission[];
};

function buildShows(episodes: Submission[]): ChannelShow[] {
  const map = new Map<string, ChannelShow>();
  episodes.forEach((episode) => {
    const id = episode.show_id || "singles";
    const title = episode.show_title || "Singles and Specials";
    if (!map.has(id)) map.set(id, { id, title, episodes: [] });
    map.get(id)!.episodes.push(episode);
  });
  return [...map.values()];
}

function formatCount(value: string | number | undefined) {
  if (typeof value === "string") return value;
  if (!value) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function useProfileShape() {
  return {
    name: "",
    bio: "",
    followers: 0 as string | number,
    posts: 0 as string | number,
    location: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    website: "",
  };
}
