import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Play,
  Plus,
  Info,
  ChevronRight,
  Sparkles,
  Tv,
  Radio,
  Heart,
  Bookmark,
  Share2,
  MessageCircle,
  Lock,
  Crown,
  Flame,
  Compass,
  Gem,
  Bot,
  ArrowRight,
  CheckCircle2,
  Download,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth";
import {
  shows,
  channels,
  allEpisodes,
  channelById,
  showById,
  episodeById,
  rails,
  featuredHero,
} from "@/lib/watch-data";
import { useGuide } from "@/lib/guide-store";
import { Logo } from "@/components/brand/Logo";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getDailyZodiacReading } from "@/lib/zodiac.server";
import { zodiacSymbol } from "@/lib/zodiac";
import { ReadingOfTheDay } from "@/components/zodiac";

const TREY_TV_BOX_APK_URL = "/downloads/trey-tv-streamingbox-debug.apk";
const TREY_ORIGIN_HERO_VIDEO_URL = "https://cdn.builder.io/o/assets%2Fde09f3f7574845d786350acb13c952c1%2F566b2f5a684c42e59128585a30440d6c?alt=media&token=81986aea-7ddd-4291-8137-dffc0dd4082b&apiKey=de09f3f7574845d786350acb13c952c1";

export const Route = createFileRoute("/")({
  component: WatchNow,
  head: () => ({
    meta: [
      { title: "Watch Now · Trey TV" },
      {
        name: "description",
        content:
          "Trey TV — the creator television network. Watch shows, follow creators, and tune into the live guide.",
      },
      { property: "og:title", content: "Trey TV — Watch Now" },
      {
        property: "og:description",
        content: "The creator television network. Stream shows, channels, and original series.",
      },
    ],
  }),
});

function WatchNow() {
  const { isGuest } = useAuth();
  return isGuest ? <GuestWatchNow /> : <SignedInWatchNow />;
}

function TreyOriginHeroMedia({ className }: { className: string }) {
  return (
    <video
      aria-hidden="true"
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
    >
      <source src={TREY_ORIGIN_HERO_VIDEO_URL} type="video/mp4" />
    </video>
  );
}

/* ============================================================
   GUEST EXPERIENCE
   ============================================================ */
function GuestWatchNow() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroShow = showById(featuredHero.showId)!;

  return (
    <div className="min-h-screen w-full text-foreground">
      {/* Floating mini-nav appears after scroll */}
      <div
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${scrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
      >
        <div className="glass-strong border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <Logo className="h-9" />
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold liquid-glass border border-white/15"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground glow-gold"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="relative min-h-[100svh] w-full overflow-hidden">
        <TreyOriginHeroMedia className="absolute inset-0 w-full h-full object-cover scale-105" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_30%,transparent,oklch(0.13_0.02_270/.85)_70%,oklch(0.13_0.02_270)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,oklch(0.13_0.02_270/.4),transparent_30%,oklch(0.13_0.02_270)_95%)]"
        />
        <div className="absolute inset-x-0 top-0 z-20 p-5 flex items-center justify-between">
          <Logo className="h-12" />
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden sm:inline px-3 py-1.5 rounded-lg text-xs font-semibold liquid-glass border border-white/15"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground glow-gold"
            >
              Sign up
            </Link>
          </div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-5 pt-[18vh] pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-white/15 text-[11px] tracking-[0.22em] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary animate-glow-pulse" /> THE CREATOR
            TELEVISION NETWORK
          </div>
          <h1 className="font-display mt-6 text-5xl sm:text-7xl font-black leading-[0.95] bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent drop-shadow-[0_4px_30px_oklch(0.82_0.16_85_/_0.4)]">
            Watch the future
            <br />
            of television.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Trey TV is a premium streaming network built around creators. Original shows, live
            channels, AI-curated picks — all in one cinematic home.
          </p>
          <div className="mt-8 mx-auto flex max-w-xs flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center">
            <Link
              to="/signup"
              className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold glow-gold hover-scale sm:w-auto"
            >
              <Play className="size-4 fill-current" /> Start Watching
            </Link>
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap px-5 py-3 rounded-xl liquid-glass border border-white/15 font-semibold sm:w-auto"
            >
              <Info className="size-4" /> I have an account
            </Link>
          </div>
          <TvAppDownloadCta />
          <div className="mt-12 inline-flex flex-col items-center text-muted-foreground text-xs tracking-widest">
            <span>SCROLL TO EXPLORE</span>
            <span className="mt-2 size-6 rounded-full border border-white/20 grid place-items-center animate-bounce">
              <ChevronRight className="size-3 rotate-90" />
            </span>
          </div>
        </div>
      </section>

      {/* WHAT IS */}
      <Section
        title="What is Trey TV?"
        subtitle="A new kind of network — built by creators, designed like cinema, alive like social."
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Tv,
              title: "Watch",
              body: "Original shows, live channels, music videos and creator series — all premium-grade.",
            },
            {
              icon: Sparkles,
              title: "Discover",
              body: "Trey-I, our AI host, prescribes what to watch based on your mood, mind and moment.",
            },
            {
              icon: Radio,
              title: "Connect",
              body: "Follow creators, react, comment, send messages, and earn rewards for tuning in.",
            },
          ].map((c) => (
            <div key={c.title} className="rounded-3xl liquid-glass neon-border p-6">
              <div className="size-11 rounded-2xl bg-primary/15 text-primary grid place-items-center">
                <c.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
            </div>
          ))}
          <LiveMusicReviewCard />
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section
        title="How Trey TV works"
        subtitle="Four steps from sign-up to your favorite new show."
      >
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            "Create your free account.",
            "Pick the moods, channels, and creators you love.",
            "Trey-I builds your personalized prescription.",
            "Tune in live, save for later, or binge episodes.",
          ].map((step, i) => (
            <li key={i} className="rounded-2xl liquid-glass border border-white/10 p-4">
              <div className="text-[10px] tracking-[0.22em] text-primary">STEP {i + 1}</div>
              <div className="mt-2 text-sm font-semibold">{step}</div>
            </li>
          ))}
        </ol>
      </Section>

      {/* PREVIEWS */}
      <PreviewRail
        title="Featured shows"
        items={shows
          .filter((s, i, arr) => arr.findIndex((x) => x.poster === s.poster) === i)
          .map((s) => ({
            id: s.id,
            title: s.title,
            sub: channelById(s.channelId)?.name ?? "",
            img: s.poster,
            locked: false,
          }))}
      />
      <PreviewRail
        title="Trending episodes"
        items={allEpisodes.slice(0, 6).map((e) => ({
          id: e.id,
          title: e.title,
          sub: `${channelById(e.channelId)?.name} · S${e.season}E${e.number}`,
          img: e.thumb,
          locked: !e.isFree,
        }))}
        footer={
          <div className="mt-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            >
              <Lock className="size-3" /> Sign up free to unlock all episodes
            </Link>
          </div>
        }
      />

      {/* CHANNELS */}
      <Section title="Creator channels" subtitle="Every creator gets their own live channel.">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {channels.slice(0, 8).map((c) => (
            <div key={c.id} className="rounded-3xl liquid-glass neon-border p-4 text-center">
              <div className="relative mx-auto size-16 rounded-full conic-ring overflow-hidden">
                <img src={c.avatar} alt="" className="size-full object-cover" />
                <div className="absolute inset-0 rounded-full pixel-ring-pulse" />
              </div>
              <div className="mt-3 text-sm font-bold truncate">{c.name}</div>
              <div className="text-[11px] text-muted-foreground">
                @{c.handle} · {c.followers}
              </div>
              <Link
                to="/signup"
                className="mt-3 inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border border-primary/40 text-primary"
              >
                <Lock className="size-3" /> Sign up to follow
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* GUIDE PREVIEW */}
      <Section
        title="The Guide"
        subtitle="A modern TV guide for creator programming. See what's on now and what's coming up."
        action={
          <Link
            to="/guide"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            Open Guide <ArrowRight className="size-3.5" />
          </Link>
        }
      >
        <div
          className="rounded-3xl liquid-glass neon-border p-4 overflow-x-auto no-scrollbar"
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <div className="flex gap-3 min-w-max">
            {channels.slice(0, 5).map((c) => {
              const ep = allEpisodes.find((e) => e.channelId === c.id);
              return (
                <div
                  key={c.id}
                  className="w-56 shrink-0 rounded-2xl glass border border-white/10 p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="relative size-8 rounded-full conic-ring overflow-hidden">
                      <img src={c.avatar} className="size-full object-cover" alt="" />
                      <div className="absolute inset-0 rounded-full pixel-ring-pulse" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{c.name}</div>
                      <div className="text-[10px] text-muted-foreground">{c.category}</div>
                    </div>
                  </div>
                  {ep && (
                    <div className="mt-3">
                      <div className="text-[10px] tracking-widest text-primary">ON NOW</div>
                      <div className="text-sm font-bold truncate">{ep.title}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* PRESCRIBE PREVIEW */}
      <Section
        title="Prescribe Me"
        subtitle="Tell Trey-I how you feel. Get a perfect mood-mix in seconds."
      >
        <div className="rounded-3xl liquid-glass neon-border p-6">
          <div className="flex flex-wrap gap-2">
            {["Motivated", "Chill", "Hype", "Focused", "Reflective", "Inspired", "Happy"].map(
              (m) => (
                <span
                  key={m}
                  className="inline-flex items-center shrink-0 px-3 py-1.5 rounded-full liquid-glass border border-white/10 text-xs"
                >
                  {m}
                </span>
              ),
            )}
          </div>
          <div className="mt-5">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm glow-gold"
            >
              <Lock className="size-4" /> Sign up to unlock
            </Link>
          </div>
        </div>
      </Section>

      {/* REWARDS */}
      <Section
        title="Rewards"
        subtitle="Earn points just for watching. Trade them for perks, badges, and exclusives."
      >
        <div className="rounded-3xl liquid-glass neon-border p-6 flex items-center gap-4">
          <Gem className="size-10 text-[oklch(0.7_0.25_340)]" />
          <div className="flex-1">
            <div className="text-sm font-bold">Trey TV Rewards</div>
            <div className="text-xs text-muted-foreground">
              Bronze · Silver · Gold · Diamond tiers.
            </div>
          </div>
          <Link
            to="/signup"
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground glow-gold"
          >
            Join free
          </Link>
        </div>
      </Section>

      {/* TREY-I */}
      <Section title="Meet Trey-I" subtitle="Your AI host. Always on, always watching with you.">
        <div className="rounded-3xl liquid-glass neon-border p-6 flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-[oklch(0.82_0.15_215_/_0.15)] text-[oklch(0.82_0.15_215)] grid place-items-center">
            <Bot className="size-6" />
          </div>
          <div className="flex-1">
            <div className="text-sm">
              "Hey — I noticed it's late where you are. Want a chill mix from <b>Zay Beats</b>?"
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">— Trey-I, your in-app host</div>
          </div>
        </div>
      </Section>

      {/* FINAL CTA */}
      <section className="relative px-4 sm:px-8 py-24">
        <div className="relative max-w-4xl mx-auto rounded-[32px] overflow-hidden liquid-glass neon-border p-10 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,oklch(0.82_0.16_85/.18),transparent)]" />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-5xl font-black">
              Welcome home to Trey TV.
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Your free account unlocks every channel, the full Guide, Prescribe Me, and Rewards.
            </p>
            <div className="mt-6 mx-auto flex max-w-xs flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center">
              <Link
                to="/signup"
                className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold glow-gold hover-scale sm:w-auto"
              >
                <Play className="size-4 fill-current" /> Create free account
              </Link>
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap px-5 py-3 rounded-xl liquid-glass border border-white/15 font-semibold sm:w-auto"
              >
                Log in
              </Link>
            </div>
            <TvAppDownloadCta />
          </div>
        </div>
      </section>
    </div>
  );
}

function TvAppDownloadCta() {
  return (
    <div className="mt-4 mx-auto flex max-w-xs flex-col items-stretch gap-2 sm:max-w-lg sm:items-center">
      <a
        href={TREY_TV_BOX_APK_URL}
        download
        className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap px-5 py-3 rounded-xl liquid-glass border border-primary/45 text-primary font-bold sm:w-auto"
      >
        <Download className="size-4" /> Download TV App
      </a>
      <p className="px-1 text-center text-xs font-semibold text-primary/90">
        Android TV / Google TV test build
      </p>
      <p className="px-1 text-center text-xs text-muted-foreground">
        This is a test build for Android TV / Google TV devices. You may need to allow installs from
        unknown sources on your device.
      </p>
    </div>
  );
}

function LiveMusicReviewCard() {
  const { isGuest } = useAuth();
  // Signed-in users access this from Discover. On home, only show to guests.
  if (!isGuest) return null;
  const onClick = () => {
    try {
      sessionStorage.setItem("treytv_post_auth_redirect", "/music-review");
    } catch {}
  };
  return (
    <Link
      to="/signup"
      onClick={onClick}
      className="group relative rounded-3xl liquid-glass neon-border p-6 overflow-hidden md:col-span-2 lg:col-span-1"
    >
      <div className="absolute inset-0 bg-[radial-gradient(80%_80%_at_30%_20%,oklch(0.7_0.25_340/0.18),transparent),radial-gradient(80%_80%_at_80%_80%,oklch(0.82_0.15_215/0.18),transparent)]" />
      <div className="absolute -top-10 -right-10 size-40 rounded-full bg-[oklch(0.82_0.16_85/0.15)] blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 border border-primary/40 text-[10px] tracking-[0.22em] text-primary">
            <Crown className="size-2.5" /> CREATOR FEATURE
          </span>
        </div>
        <div className="size-11 mt-4 rounded-2xl bg-gradient-to-br from-[oklch(0.82_0.16_85)] to-[oklch(0.7_0.25_340)] text-primary-foreground grid place-items-center">
          <Radio className="size-5" />
        </div>
        <h3 className="mt-4 text-lg font-bold">Live Music Review</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit your original music for a live on-air review by Trey. Get discovered on the
          network.
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary">
          Apply to feature{" "}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

function Section({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="relative px-4 sm:px-8 py-12 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-5 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function PreviewRail({
  title,
  items,
  footer,
}: {
  title: string;
  items: { id: string; title: string; sub: string; img: string; locked?: boolean }[];
  footer?: React.ReactNode;
}) {
  return (
    <Section title={title}>
      <div
        className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 snap-x"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        {items.map((it) => (
          <div key={it.id} className="snap-start shrink-0 w-44 sm:w-52">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden ring-1 ring-white/10 group">
              <img
                src={it.img}
                alt=""
                className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              {it.locked && (
                <span className="absolute top-2 left-2 size-6 grid place-items-center rounded-full bg-black/60 backdrop-blur border border-white/15">
                  <Lock className="size-3" />
                </span>
              )}
              <div className="absolute bottom-2 inset-x-2">
                <div className="text-xs font-bold truncate">{it.title}</div>
                <div className="text-[10px] text-white/70 truncate">{it.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {footer}
    </Section>
  );
}

/* ============================================================
   SIGNED-IN EXPERIENCE
   ============================================================ */
function SignedInWatchNow() {
  const heroShow = showById(featuredHero.showId)!;
  const heroChannel = channelById(heroShow.channelId)!;
  const guide = useGuide();
  const continueWatching =
    guide.continueWatching.length > 0
      ? guide.continueWatching
      : rails.continueWatching.map((item) => ({
          episodeId: item.episodeId,
          progress: item.progress,
          progressSeconds: 0,
          durationSeconds: 0,
          completed: false,
          updatedAt: 0,
        }));
  const [zodiac, setZodiac] = useState<any>(null);
  const [reading, setReading] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth
      .getUser()
      .then(async ({ data }) => {
        const userId = data.user?.id;
        if (!userId) return;
        const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("zodiac_sun_sign, zodiac_is_cusp, zodiac_cusp_label, zodiac_public_opt_in")
          .eq("id", userId)
          .maybeSingle();
        if (cancelled || !profile?.zodiac_sun_sign || profile.zodiac_public_opt_in === false)
          return;
        setZodiac(profile);
        const daily = await getDailyZodiacReading({
          data: {
            zodiacSign: profile.zodiac_sun_sign,
            cuspLabel: profile.zodiac_is_cusp ? profile.zodiac_cusp_label : null,
            isCusp: !!profile.zodiac_is_cusp,
          },
        });
        if (!cancelled) setReading(daily);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell wide>
      {/* Hero */}
      <div className="relative -mx-3 lg:-mx-8 xl:-mx-10 -mt-3 lg:-mt-8 xl:-mt-10 mb-6 lg:mb-10 overflow-hidden rounded-b-[32px]">
        <div className="relative h-[60vh] min-h-[420px] xl:h-[72vh] xl:min-h-[560px] w-full">
          <TreyOriginHeroMedia className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.13_0.02_270/.2),transparent_30%,oklch(0.13_0.02_270/.95)_92%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_15%_50%,transparent,oklch(0.13_0.02_270/.55)_70%)]" />
          <div className="relative z-10 h-full flex items-end p-6 sm:p-10 xl:p-14">
            <div className="grid lg:grid-cols-[minmax(0,640px)_1fr] xl:grid-cols-[minmax(0,720px)_1fr] gap-8 w-full items-end">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full liquid-glass border border-white/15 text-[10px] tracking-widest">
                  <Crown className="size-3 text-primary" /> TREY TV ORIGINAL
                </div>
                <h1 className="mt-4 font-display text-4xl sm:text-6xl xl:text-7xl font-black leading-[0.95] drop-shadow-[0_4px_30px_oklch(0.82_0.16_85_/_0.4)]">
                  {heroShow.title}
                </h1>
                <div className="mt-2 text-sm text-muted-foreground">
                  {heroChannel.name} · {heroShow.year} · {heroShow.rating} · {heroShow.category}
                </div>
                <p className="mt-3 text-sm sm:text-base xl:text-lg text-white/85 max-w-xl line-clamp-3">
                  {heroShow.description}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <Link
                    to="/watch/$id"
                    params={{ id: heroShow.episodes[0].id }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold glow-gold"
                  >
                    <Play className="size-4 fill-current" /> Watch Now
                  </Link>
                  <Link
                    to="/collections"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl liquid-glass border border-white/15 font-semibold"
                  >
                    <Plus className="size-4" /> Save
                  </Link>
                  <Link
                    to="/watch/$id"
                    params={{ id: heroShow.episodes[0].id }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl liquid-glass border border-white/15 font-semibold"
                  >
                    <Info className="size-4" /> More Info
                  </Link>
                </div>
              </div>

              {/* Mobile creator card — visible on tablet/smaller desktop */}
              <div className="xl:hidden mt-6">
                <div className="rounded-2xl liquid-glass border border-white/10 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 rounded-full conic-ring overflow-hidden">
                      <img src={heroChannel.avatar} className="size-full object-cover" alt="" />
                      <div className="absolute inset-0 rounded-full pixel-ring-pulse" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] tracking-widest text-primary">
                        FROM THE CREATOR
                      </div>
                      <div className="text-sm font-bold truncate">{heroChannel.name}</div>
                      <div className="text-[11px] text-muted-foreground">@{heroChannel.handle}</div>
                    </div>
                    <Link
                      to="/channel/$handle"
                      params={{ handle: heroChannel.handle }}
                      className="text-[11px] px-3 py-1.5 rounded-full border border-primary/40 text-primary hover:bg-primary/10 font-semibold"
                    >
                      View Channel
                    </Link>
                  </div>
                </div>
              </div>

              {/* Desktop side panel — Up Next + creator */}
              <aside className="hidden xl:flex flex-col gap-3 self-end">
                <div className="rounded-2xl liquid-glass border border-white/10 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 rounded-full conic-ring overflow-hidden">
                      <img src={heroChannel.avatar} className="size-full object-cover" alt="" />
                      <div className="absolute inset-0 rounded-full pixel-ring-pulse" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] tracking-widest text-primary">
                        FROM THE CREATOR
                      </div>
                      <div className="text-sm font-bold truncate">{heroChannel.name}</div>
                    </div>
                    <Link
                      to="/channel/$handle"
                      params={{ handle: heroChannel.handle }}
                      className="ml-auto text-[11px] px-2.5 py-1 rounded-full border border-primary/40 text-primary hover:bg-primary/10"
                    >
                      View
                    </Link>
                  </div>
                </div>
                <div className="rounded-2xl liquid-glass border border-white/10 p-4 backdrop-blur-md">
                  <div className="text-[10px] tracking-widest text-muted-foreground mb-2">
                    UP NEXT
                  </div>
                  <div className="space-y-2">
                    {heroShow.episodes.slice(0, 3).map((ep) => (
                      <Link
                        key={ep.id}
                        to="/watch/$id"
                        params={{ id: ep.id }}
                        className="flex items-center gap-3 group"
                      >
                        <div className="relative size-14 rounded-lg overflow-hidden shrink-0 ring-1 ring-white/10">
                          <img
                            src={ep.thumb}
                            alt=""
                            className="size-full object-cover transition group-hover:scale-110"
                          />
                          <div className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                            <Play className="size-4 text-white fill-current" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate">{ep.title}</div>
                          <div className="text-[10px] text-muted-foreground">
                            S{ep.season}E{ep.number} · {ep.duration}m
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      {zodiac?.zodiac_sun_sign && reading && (
        <div className="mb-8">
          <ReadingOfTheDay
            sign={zodiac.zodiac_sun_sign}
            symbol={zodiacSymbol(zodiac.zodiac_sun_sign)}
            dailyReading={reading.short_message ?? reading.full_message}
            energyWord={reading.energy_word}
            luckyColor={reading.lucky_color}
            luckyNumber={reading.lucky_number}
            recommendedAction={reading.recommended_action}
            isCusp={!!zodiac.zodiac_is_cusp}
            cuspNote={
              zodiac.zodiac_is_cusp
                ? "You were born where two energies meet. Today, don't choose one side of yourself. Use both."
                : undefined
            }
          />
        </div>
      )}

      {/* Continue Watching */}
      <Rail title="Continue Watching" icon={Play}>
        {continueWatching.map((c) => {
          const ep = episodeById(c.episodeId);
          if (!ep) return null;
          return <EpisodeCard key={c.episodeId} ep={ep} progress={c.progress} />;
        })}
      </Rail>

      <Rail title="Trending on Trey TV" icon={Flame}>
        {rails.trending.map((id) => {
          const s = showById(id);
          return s ? <PosterCard key={id} show={s} /> : null;
        })}
      </Rail>

      <Rail title="New Episodes" icon={Sparkles}>
        {rails.newEpisodes.map((id) => {
          const e = episodeById(id);
          return e ? <EpisodeCard key={id} ep={e} /> : null;
        })}
      </Rail>

      <Rail title="Creator Channels" icon={Tv}>
        {channels.map((c) => (
          <ChannelCard key={c.id} ch={c} />
        ))}
      </Rail>

      <Rail title="Featured Creators" icon={Crown}>
        {channels
          .slice()
          .reverse()
          .map((c) => (
            <ChannelCard key={c.id} ch={c} />
          ))}
      </Rail>

      <Rail title="Recommended by Trey-I" icon={Bot} accent="cyan">
        {rails.treyiPicks.map((id) => {
          const s = showById(id);
          return s ? <PosterCard key={id} show={s} /> : null;
        })}
      </Rail>

      <Rail title="Shows You Might Like" icon={Compass}>
        {shows.map((s) => (
          <PosterCard key={s.id} show={s} />
        ))}
      </Rail>

      <Rail title="Music Videos" icon={Radio}>
        {rails.music
          .flatMap((id) => showById(id)?.episodes ?? [])
          .map((e) => (
            <EpisodeCard key={e.id} ep={e} />
          ))}
      </Rail>

      <Rail title="Comedy" icon={Sparkles}>
        {rails.comedy
          .flatMap((id) => showById(id)?.episodes ?? [])
          .map((e) => (
            <EpisodeCard key={e.id} ep={e} />
          ))}
      </Rail>

      <Rail title="Drama / Reality" icon={Flame}>
        {rails.drama.map((id) => {
          const s = showById(id);
          return s ? <PosterCard key={id} show={s} /> : null;
        })}
      </Rail>

      <Rail title="Documentaries / Real Stories" icon={Info}>
        {rails.docs.map((id) => {
          const s = showById(id);
          return s ? <PosterCard key={id} show={s} /> : null;
        })}
      </Rail>

      <Rail title="Recently Added" icon={Sparkles}>
        {rails.recentlyAdded.map((id) => {
          const s = showById(id);
          return s ? <PosterCard key={id} show={s} /> : null;
        })}
      </Rail>

      <Rail title="Free Episodes" icon={CheckCircle2}>
        {rails.free.map((id) => {
          const e = episodeById(id);
          return e ? <EpisodeCard key={id} ep={e} /> : null;
        })}
      </Rail>
    </AppShell>
  );
}

function Rail({
  title,
  icon: Icon,
  accent,
  children,
}: {
  title: string;
  icon: typeof Play;
  accent?: "cyan";
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
          <Icon
            className={`size-4 ${accent === "cyan" ? "text-[oklch(0.82_0.15_215)]" : "text-primary"}`}
          />
          {title}
        </h2>
        <button className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
          See all <ChevronRight className="size-3" />
        </button>
      </div>
      <div
        className="flex gap-3 overflow-x-auto no-scrollbar -mx-3 lg:-mx-8 px-3 lg:px-8 snap-x"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </section>
  );
}

function PosterCard({ show }: { show: ReturnType<typeof showById> }) {
  if (!show) return null;
  const ch = channelById(show.channelId);
  return (
    <Link
      to="/watch/$id"
      params={{ id: show.episodes[0].id }}
      className="snap-start shrink-0 w-40 sm:w-48 group"
    >
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden ring-1 ring-white/10 group-hover:ring-primary/60 transition">
        <img
          src={show.poster}
          alt=""
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        {show.premium && (
          <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-[oklch(0.7_0.25_340_/_0.2)] border border-[oklch(0.7_0.25_340)] text-[oklch(0.7_0.25_340)]">
            PREMIUM
          </span>
        )}
        <div className="absolute bottom-2 inset-x-2">
          <div className="text-[10px] text-white/70 truncate">{ch?.name}</div>
          <div className="text-sm font-bold truncate">{show.title}</div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{show.category}</span>
        {ch && (
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/15 text-muted-foreground group-hover:text-foreground">
            @{ch.handle}
          </span>
        )}
      </div>
    </Link>
  );
}

function EpisodeCard({ ep, progress }: { ep: ReturnType<typeof episodeById>; progress?: number }) {
  const { has, toggle } = useGuide();
  if (!ep) return null;
  const ch = channelById(ep.channelId);
  const saved = has("saved", ep.id);
  return (
    <Link to="/watch/$id" params={{ id: ep.id }} className="snap-start shrink-0 w-64 sm:w-72 group">
      <div className="relative aspect-video rounded-2xl overflow-hidden ring-1 ring-white/10 group-hover:ring-primary/60 transition">
        <img
          src={ep.thumb}
          alt=""
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
        <div className="absolute top-2 left-2 flex gap-1">
          {ep.isLive && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[oklch(0.65_0.24_15)] text-white">
              <span className="size-1.5 rounded-full bg-white animate-glow-pulse" /> LIVE
            </span>
          )}
          {ep.isFree && ep.number <= 2 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold">
              FREE EP {ep.number}
            </span>
          )}
          {ep.premium && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-black/60 border border-[oklch(0.7_0.25_340)] text-[oklch(0.7_0.25_340)]">
              <Lock className="size-3" /> PREMIUM
            </span>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggle("saved", ep.id);
              toast(saved ? "Removed from saves" : "Saved");
            }}
            className={`size-8 grid place-items-center rounded-full liquid-glass border border-white/15 ${saved ? "text-primary" : "text-white/80"}`}
            aria-label="Save"
          >
            <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>
        <div className="absolute bottom-2 inset-x-2">
          <div className="text-[10px] text-white/70 truncate">
            {ch?.name} · S{ep.season}E{ep.number} · {ep.duration}m
          </div>
          <div className="text-sm font-bold truncate">{ep.title}</div>
        </div>
        {typeof progress === "number" && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/15">
            <div
              className="h-full bg-primary shadow-[0_0_8px_oklch(0.82_0.16_85_/_0.8)]"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-3 px-1 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Heart className="size-3" /> {ep.reactions.toLocaleString()}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="size-3" /> {ep.comments}
        </span>
        <span className="ml-auto inline-flex items-center gap-1 hover:text-foreground">
          <Share2 className="size-3" />
        </span>
      </div>
    </Link>
  );
}

function ChannelCard({ ch }: { ch: (typeof channels)[number] }) {
  return (
    <Link
      to="/channel/$handle"
      params={{ handle: ch.handle }}
      className="snap-start shrink-0 w-40 sm:w-44 text-center group"
    >
      <div className="relative mx-auto size-28 sm:size-32 rounded-full conic-ring overflow-hidden">
        <img src={ch.avatar} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 rounded-full pixel-ring-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,black/.7)]" />
      </div>
      <div className="mt-3 text-sm font-bold truncate">{ch.name}</div>
      <div className="text-[11px] text-muted-foreground truncate">
        @{ch.handle} · {ch.followers}
      </div>
      <span className="mt-2 inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full border border-white/15 text-muted-foreground group-hover:text-foreground transition">
        Open Channel
      </span>
    </Link>
  );
}
