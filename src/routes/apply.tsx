import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Clock,
  Crown,
  Diamond,
  ShieldCheck,
  Star,
  Tv,
  Radio,
} from "lucide-react";
import creatorIcon from "@/assets/apply-creator-icon.jpg";
import goldIcon from "@/assets/apply-gold-icon.jpg";

export const Route = createFileRoute("/apply")({
  component: ApplyRoot,
  head: () => ({
    meta: [
      { title: "Choose Your Trey TV Path" },
      {
        name: "description",
        content: "Apply to create a channel or request Go verification on Trey TV.",
      },
    ],
  }),
});

function ApplyRoot() {
  const { location } = useRouterState();
  if (location.pathname !== "/apply") return <Outlet />;
  return <ApplyHub />;
}

const FEATURES = [
  { icon: <Diamond className="h-4 w-4" />, label: "Curated", sub: "Hand-picked content" },
  { icon: <Crown className="h-4 w-4" />, label: "Premium", sub: "Elite creator status" },
  { icon: <Star className="h-4 w-4" />, label: "Exclusive", sub: "Invite-only access" },
];

function ApplyHub() {
  const navigate = useNavigate();

  const handleBack = () => {
    void navigate({ to: "/" });
  };

  return (
    /* ── Full-viewport liquid stage ── */
    <div className="apply-scroll-page liquid-stage min-h-screen min-h-[100dvh] gold">
      <div className="grid-veil" aria-hidden />
      <div className="orb-extra" aria-hidden />
      <button
        type="button"
        onClick={handleBack}
        className="neon-btn-ghost absolute left-4 top-4 mt-[max(0.5rem,env(safe-area-inset-top))] z-30 gap-2 px-3 py-2 text-xs text-white/75 hover:text-white sm:left-6 sm:top-6 sm:text-sm lg:left-8 lg:top-8"
        aria-label="Go back"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      {/* ══ MOBILE: centred single-column ══ DESKTOP: two-column split ══ */}
      <div className="mx-auto flex min-h-[100dvh] max-w-7xl flex-col lg:flex-row lg:items-stretch">
        {/* ─── LEFT PANEL — hero / branding ─── */}
        <div className="flex flex-col items-center justify-center px-6 sm:px-8 py-10 sm:py-12 pt-[max(3rem,calc(env(safe-area-inset-top)+1.5rem))] text-center lg:w-[42%] lg:items-start lg:px-16 lg:py-20 lg:pt-20 lg:text-left xl:px-24">
          {/* Logo */}
          <Logo className="logo-float h-24 md:h-28 lg:h-32" />

          {/* Headline */}
          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl lg:leading-[1.08]">
            <span className="text-foreground">Choose Your </span>
            <br className="hidden lg:block" />
            <span className="title-split-blue">Trey TV</span>
            <span className="text-foreground"> Path</span>
          </h1>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground lg:text-base">
            Apply to create a channel or request Go verification if you're notable. Every creator
            starts here.
          </p>

          {/* Feature pills — desktop only */}
          <div className="mt-8 hidden space-y-3 lg:block">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 backdrop-blur-sm"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[oklch(0.85_0.2_240)]"
                  style={{
                    boxShadow:
                      "inset 0 0 0 1px oklch(0.65 0.22 245 / 0.4), 0 0 12px oklch(0.6 0.3 245 / 0.18)",
                  }}
                >
                  {f.icon}
                </span>
                <div className="text-left">
                  <p className="text-sm font-semibold">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Status link */}
          <Link
            to="/applications"
            className="mt-8 inline-flex items-center gap-1.5 text-xs text-white/45 transition hover:text-white lg:mt-10 lg:text-sm"
          >
            Check my application status <ChevronRight className="h-3 w-3" />
          </Link>

          {/* Mobile feature badges */}
          <div className="mt-6 grid grid-cols-3 gap-2 lg:hidden">
            {[
              { icon: <Diamond className="h-3.5 w-3.5" />, label: "Curated" },
              { icon: <Crown className="h-3.5 w-3.5" />, label: "Premium" },
              { icon: <Star className="h-3.5 w-3.5" />, label: "Exclusive" },
            ].map((c) => (
              <span key={c.label} className="neon-btn-ghost justify-center px-2 py-2 text-xs">
                <span className="text-[oklch(0.85_0.2_240)]">{c.icon}</span> {c.label}
              </span>
            ))}
          </div>
        </div>

        {/* ─── RIGHT PANEL — path cards ─── */}
        <div className="flex flex-col justify-center gap-5 px-6 pb-[max(4rem,env(safe-area-inset-bottom))] lg:w-[58%] lg:py-20 lg:pr-16 xl:pr-24">
          {/* Desktop section eyebrow */}
          <div className="hidden items-center gap-3 lg:flex">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[oklch(0.65_0.22_245/0.35)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[oklch(0.65_0.22_245)]">
              Select Your Path
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[oklch(0.65_0.22_245/0.35)]" />
          </div>

          {/* Cards */}
          <DesktopPathCard
            variant="creator"
            image={creatorIcon}
            tag="Apply to Create"
            tagIcon={<Tv className="h-4 w-4" />}
            desc="Launch your own channel, build your brand, and share your vision with the world on Trey TV."
            cta="Start Creator Application"
            time="5–7 minutes"
            to="/apply/content-creator"
          />
          <DesktopPathCard
            variant="gold"
            image={goldIcon}
            tag="Go Verification"
            tagIcon={<ShieldCheck className="h-4 w-4" />}
            desc="Request a Go badge to verify your notable status and stand out on Trey TV."
            cta="Request Go Badge"
            time="3–5 minutes"
            to="/apply/go-verification"
          />
          <DesktopPathCard
            variant="tradio"
            image="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop"
            tag="Tradio Creative Position"
            tagIcon={<Radio className="h-4 w-4" />}
            desc="Apply to join Tradio as an approved Artist, Producer, or Radio Host/DJ to drop tracks and run live shows."
            cta="Start Tradio Creator Application"
            time="5–7 minutes"
            to="/apply/tradio-creator"
          />

          {/* Desktop small print */}
          <p className="hidden text-center text-xs text-white/30 lg:block">
            Applications are reviewed by the Trey TV team. Approval is not automatic.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Unified card: mobile horizontal, desktop richer ─── */
function DesktopPathCard({
  variant,
  image,
  tag,
  tagIcon,
  desc,
  cta,
  time,
  to,
}: {
  variant: "creator" | "gold" | "tradio";
  image: string;
  tag: string;
  tagIcon: React.ReactNode;
  desc: string;
  cta: string;
  time: string;
  to: string;
}) {
  const isGold = variant === "gold";
  const isTradio = variant === "tradio";
  const outer = isTradio ? "neon-purple" : isGold ? "neon-gold" : "neon-blue";
  const accent = isTradio
    ? "text-purple-300"
    : isGold
      ? "text-[oklch(0.92_0.18_88)]"
      : "text-[oklch(0.85_0.2_240)]";
  const btn = isTradio ? "neon-btn-purple" : isGold ? "neon-btn-gold" : "neon-btn-blue";
  const ctaText = isGold || isTradio ? "!text-white" : "";
  const tagBg = isTradio
    ? "bg-[oklch(0.13_0.05_292/0.7)] shadow-[inset_0_0_0_1px_oklch(0.85_0.2_290/0.5)]"
    : isGold
      ? "bg-[oklch(0.13_0.05_80/0.7)] shadow-[inset_0_0_0_1px_oklch(0.92_0.18_88/0.5)]"
      : "bg-[oklch(0.13_0.07_252/0.7)] shadow-[inset_0_0_0_1px_oklch(0.85_0.2_240/0.5)]";

  return (
    <div
      className={`group relative ${outer} p-4 transition-all duration-300 hover:-translate-y-0.5 lg:p-6`}
    >
      <Link to={to} className="absolute inset-0 z-10" aria-label={cta} />
      <div className="swoosh-bg" />
      <div className="liquid-sheen" />

      {/* ── Mobile layout: horizontal image + text ── */}
      <div className="relative grid grid-cols-[110px_1fr] items-center gap-3 lg:hidden">
        <img
          src={image}
          alt={tag}
          loading="lazy"
          className="h-[110px] w-[110px] rounded-2xl object-cover"
        />
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className={`text-lg font-semibold ${accent}`}>{tag}</h3>
            <ChevronRight className={`h-5 w-5 ${accent}`} />
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="relative z-20 mt-3 lg:hidden">
        <Link to={to} className={`${btn} ${ctaText} w-full py-3 text-sm`}>
          {cta} <ChevronRight className="h-4 w-4" />
        </Link>
        <p className={`mt-2 inline-flex items-center gap-1.5 text-xs ${accent}`}>
          <Clock className="h-3 w-3" /> {time}
        </p>
      </div>

      {/* ── Desktop layout: image left, rich content right ── */}
      <div className="relative hidden lg:flex lg:gap-6">
        {/* Image with glow wrap */}
        <div className="shrink-0">
          <div
            className="overflow-hidden rounded-2xl"
            style={{
              padding: "3px",
              background: isTradio
                ? "linear-gradient(135deg, oklch(0.85 0.2 290 / 0.5), oklch(0.55 0.25 295 / 0.15))"
                : isGold
                  ? "linear-gradient(135deg, oklch(0.95 0.2 88 / 0.6), oklch(0.78 0.18 80 / 0.15))"
                  : "linear-gradient(135deg, oklch(0.85 0.2 240 / 0.5), oklch(0.55 0.25 245 / 0.15))",
              boxShadow: isTradio
                ? "0 0 30px oklch(0.6 0.3 295 / 0.3)"
                : isGold
                  ? "0 0 30px oklch(0.85 0.2 85 / 0.3)"
                  : "0 0 30px oklch(0.6 0.3 245 / 0.3)",
            }}
          >
            <img
              src={image}
              alt={tag}
              loading="lazy"
              className="h-[140px] w-[140px] rounded-[13px] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            {/* Tag pill */}
            <div
              className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${accent} ${tagBg}`}
            >
              {tagIcon}
              {tag}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <Link to={to} className={`relative z-20 ${btn} ${ctaText} flex-1 py-3 text-sm`}>
              {cta} <ArrowRight className="h-4 w-4" />
            </Link>
            <span className={`inline-flex shrink-0 items-center gap-1.5 text-xs ${accent}`}>
              <Clock className="h-3.5 w-3.5" /> {time}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
