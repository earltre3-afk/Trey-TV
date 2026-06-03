import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Tv,
  Compass,
  Crown,
  Bot,
  Trophy,
  MessageCircle,
  ArrowRight,
  Mail,
  ShieldCheck,
  Radio,
  Users,
  ListVideo,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { SUPPORT_CONTACT } from "@/lib/legal-content";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Trey TV" },
      {
        name: "description",
        content:
          "Trey TV is a creator-first entertainment platform for shows, episodes, live moments, recommendations, and rewards.",
      },
      { property: "og:title", content: "About Trey TV" },
      {
        property: "og:description",
        content:
          "Creator-first entertainment, built for the people who watch and the people who make.",
      },
    ],
  }),
});

function AboutPage() {
  return (
    <AppShell wide>
      <div className="pb-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[28px] liquid-glass neon-border p-6 lg:p-12 mb-8">
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[80vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.3),oklch(0.7_0.25_340_/_0.25),oklch(0.82_0.15_215_/_0.3),oklch(0.82_0.16_85_/_0.3))] blur-3xl opacity-60 animate-conic-spin" />
          </div>
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-white/15 text-[10px] tracking-[0.22em]">
              <Sparkles className="size-3 text-primary" /> ABOUT TREY TV
            </div>
            <h1 className="font-display mt-4 text-4xl sm:text-6xl xl:text-7xl font-black leading-[0.95] bg-gradient-to-br from-white via-white/85 to-white/55 bg-clip-text text-transparent">
              Creator-first entertainment.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-foreground/75 max-w-2xl">
              Trey TV is a live, social platform built for the people who make shows and the people
              who love them. Discover episodes, follow creators, get personal picks from Trey-I,
              earn rewards, and tune in to live moments — all in one premium app.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to="/"
                className="px-5 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold glow-gold tilt-press inline-flex items-center gap-1.5"
              >
                Open Trey TV <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/legal"
                className="px-5 h-11 rounded-xl liquid-glass border border-white/10 text-sm font-semibold inline-flex items-center gap-1.5 hover:border-white/30"
              >
                <ShieldCheck className="size-4" /> Legal & Safety
              </Link>
            </div>
          </div>
        </section>

        {/* What it is */}
        <Section
          eyebrow="WHAT TREY TV IS"
          title="A home for shows, creators, and the moments in between."
          body="Trey TV brings shows, episodes, livestreams, and creator content into one premium experience. Watch what you love, find what's next, and join the conversation in real time."
        />

        {/* How it works */}
        <Section eyebrow="HOW IT WORKS" title="Built around a simple loop." body="">
          <div className="grid sm:grid-cols-3 gap-3 mt-5">
            <StepCard
              step="01"
              title="Discover"
              body="Browse Watch Now, Guide, and Discover to find shows, creators, and live moments."
              icon={Compass}
            />
            <StepCard
              step="02"
              title="Engage"
              body="Follow, react, comment, message, and join live shows as they happen."
              icon={MessageCircle}
            />
            <StepCard
              step="03"
              title="Earn"
              body="Use rewards, gifts, and Trey TV Plus to support the creators you love."
              icon={Trophy}
            />
          </div>
        </Section>

        {/* Viewer experience */}
        <Section eyebrow="VIEWER EXPERIENCE" title="Made for the way you actually watch.">
          <div className="grid sm:grid-cols-2 gap-3 mt-5">
            <FeatureCard
              icon={Tv}
              title="Watch Now"
              body="A clean, app-store-grade player with episodes, shows, and live content ready when you are."
            />
            <FeatureCard
              icon={ListVideo}
              title="Guide"
              body="A live programming guide that shows what's on now and what's coming up next."
            />
            <FeatureCard
              icon={Compass}
              title="Prescribe Me"
              body="Tell us what you're in the mood for and we'll prescribe the perfect Trey TV picks."
            />
            <FeatureCard
              icon={Radio}
              title="Live Music Review"
              body="Submit a song to be reviewed live on Trey TV's interactive review show."
            />
          </div>
        </Section>

        {/* Creator */}
        <Section eyebrow="CREATOR EXPERIENCE" title="A studio for the people making the show.">
          <div className="grid sm:grid-cols-2 gap-3 mt-5">
            <FeatureCard
              icon={Crown}
              title="Creator Studio"
              body="Upload, schedule, manage episodes, and monitor performance from one place."
            />
            <FeatureCard
              icon={Users}
              title="Community Tools"
              body="Reactions, comments, and DMs help creators build a real audience, not just a follower count."
            />
          </div>
          <p className="mt-4 text-xs text-muted-foreground max-w-2xl">
            Creators retain ownership of their content. Read the{" "}
            <Link
              to="/legal/$slug"
              params={{ slug: "creator-terms" }}
              className="text-primary hover:underline"
            >
              Creator Terms
            </Link>{" "}
            and{" "}
            <Link
              to="/legal/$slug"
              params={{ slug: "content-policy" }}
              className="text-primary hover:underline"
            >
              Content Policy
            </Link>{" "}
            for details.
          </p>
        </Section>

        {/* Trey-I */}
        <Section eyebrow="TREY-I ASSISTANT" title="Your in-app guide.">
          <div className="mt-5 rounded-3xl liquid-glass border border-white/10 p-6 lg:p-8 grid lg:grid-cols-[auto_1fr] gap-5 items-center">
            <div className="size-16 rounded-2xl bg-primary/15 text-primary grid place-items-center ring-1 ring-primary/30">
              <Bot className="size-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Trey-I helps you set up, find, and personalize.</h3>
              <p className="mt-2 text-sm text-foreground/75">
                Trey-I is a conversational assistant that can help you build your profile, recommend
                shows, and explore the app — all without leaving the screen. You always review and
                confirm before anything is saved.
              </p>
              <Link
                to="/legal/$slug"
                params={{ slug: "ai-disclosure" }}
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
              >
                Read the Trey-I disclosure <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </Section>

        {/* Rewards */}
        <Section eyebrow="REWARDS" title="Show up. Get something for it.">
          <div className="mt-5 rounded-3xl liquid-glass border border-white/10 p-6 lg:p-8">
            <p className="text-sm text-foreground/75 max-w-2xl">
              Trey TV rewards make watching, following, and supporting creators feel like more than
              a tap. Earn points, send gifts, and unlock perks — terms vary, no cash value unless
              explicitly stated.
            </p>
            <Link
              to="/legal/$slug"
              params={{ slug: "subscription-terms" }}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
            >
              See subscription & digital terms <ArrowRight className="size-3" />
            </Link>
          </div>
        </Section>

        {/* Contact */}
        <Section eyebrow="CONTACT & SUPPORT" title="Reach the team.">
          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            <ContactCard icon={Mail} label="Support" value={SUPPORT_CONTACT} />
            <ContactCard icon={ShieldCheck} label="Legal" value="See the Legal Hub" to="/legal" />
          </div>
        </Section>

        <PublicFooter />
      </div>
    </AppShell>
  );
}

function Section({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="text-[10px] tracking-[0.25em] text-primary">{eyebrow}</div>
      <h2 className="mt-2 text-2xl sm:text-3xl xl:text-4xl font-black tracking-tight">{title}</h2>
      {body && <p className="mt-2 text-sm sm:text-base text-foreground/70 max-w-2xl">{body}</p>}
      {children}
    </section>
  );
}

function StepCard({
  step,
  title,
  body,
  icon: Icon,
}: {
  step: string;
  title: string;
  body: string;
  icon: typeof Compass;
}) {
  return (
    <div className="rounded-2xl liquid-glass border border-white/10 p-5 hover:border-white/25 transition">
      <div className="flex items-center justify-between">
        <div className="size-10 rounded-xl bg-primary/15 text-primary grid place-items-center">
          <Icon className="size-5" />
        </div>
        <div className="text-[11px] font-mono text-muted-foreground">{step}</div>
      </div>
      <div className="mt-3 text-base font-bold">{title}</div>
      <div className="mt-1 text-xs text-foreground/70">{body}</div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Compass;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl liquid-glass border border-white/10 p-5 hover:border-white/25 transition">
      <div className="size-10 rounded-xl bg-white/5 grid place-items-center">
        <Icon className="size-5" />
      </div>
      <div className="mt-3 text-base font-bold">{title}</div>
      <div className="mt-1 text-xs text-foreground/70">{body}</div>
    </div>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  to,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  to?: string;
}) {
  const inner = (
    <div className="rounded-2xl liquid-glass border border-white/10 p-5 hover:border-white/25 transition flex items-center gap-3">
      <div className="size-10 rounded-xl bg-primary/15 text-primary grid place-items-center">
        <Icon className="size-5" />
      </div>
      <div>
        <div className="text-[10px] tracking-[0.22em] text-muted-foreground">{label}</div>
        <div className="text-sm font-bold">{value}</div>
      </div>
    </div>
  );
  return to ? <Link to={to as any}>{inner}</Link> : inner;
}
