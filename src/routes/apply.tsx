import type React from "react";
import { createFileRoute, useNavigate, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { ChevronRight, Clock, Diamond, Crown, Star } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/apply")({
  component: ApplyRoot,
  head: () => ({
    meta: [
      { title: "Apply — Trey TV" },
      { name: "description", content: "Apply to become a creator or get Gold Verification on Trey TV." },
    ],
  }),
});

type BottomIcon =
  | { isLogo: true; label: string }
  | { isLogo?: false; icon: React.ElementType; label: string };

const BOTTOM_ICONS: BottomIcon[] = [
  { icon: Star, label: "Curated" },
  { icon: Diamond, label: "Premium" },
  { icon: Crown, label: "Exclusive" },
  { isLogo: true, label: "Trey TV" },
];

function ApplyRoot() {
  const { location } = useRouterState();
  if (location.pathname !== "/apply") return <Outlet />;
  return <ApplyChoice />;
}

function ApplyChoice() {
  const { isGuest } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isGuest) {
      try { sessionStorage.setItem("treytv_post_auth_redirect", "/apply"); } catch {}
      navigate({ to: "/login" });
    }
  }, [isGuest, navigate]);

  if (isGuest) return null;

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ background: "radial-gradient(ellipse 120% 60% at 50% 0%, oklch(0.18 0.08 215 / 0.5) 0%, #02050B 60%)" }}
    >
      {/* Ambient glow arcs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[oklch(0.82_0.15_215_/_0.08)] blur-[120px]" />
        <div className="absolute -top-20 -right-40 w-[400px] h-[400px] rounded-full bg-[oklch(0.65_0.22_300_/_0.06)] blur-[100px]" />
      </div>

      <div className="relative flex-1 flex flex-col px-5 pt-10 pb-6 max-w-lg mx-auto w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 -m-4 rounded-full blur-2xl opacity-40 bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.6),oklch(0.82_0.15_215_/_0.5),oklch(0.65_0.22_300_/_0.4),oklch(0.82_0.16_85_/_0.6))] animate-conic-spin" />
            <Logo className="relative h-16 mx-auto drop-shadow-[0_0_24px_oklch(0.82_0.16_85_/_0.8)]" />
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
            Choose Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[oklch(0.92_0.18_85)] to-primary drop-shadow-[0_0_20px_oklch(0.82_0.16_85_/_0.8)]">
              Trey TV
            </span>{" "}
            Path
          </h1>
          <p className="text-sm text-muted-foreground">
            Apply to create a channel or request gold verification if you're notable.
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-4 flex-1">
          {/* Apply to Create — neon blue */}
          <div className="relative rounded-3xl overflow-hidden border border-[oklch(0.82_0.15_215_/_0.5)] bg-gradient-to-br from-[oklch(0.14_0.06_215_/_0.9)] to-[oklch(0.10_0.04_230_/_0.95)] shadow-[0_0_60px_-10px_oklch(0.82_0.15_215_/_0.5),inset_0_1px_0_oklch(0.82_0.15_215_/_0.3)]">
            {/* Inner glow edge */}
            <div className="absolute inset-0 rounded-3xl border border-[oklch(0.82_0.15_215_/_0.2)] pointer-events-none" />
            <div className="flex items-start gap-4 p-5">
              {/* Icon scene */}
              <div className="shrink-0 size-24 rounded-2xl bg-[oklch(0.82_0.15_215_/_0.1)] border border-[oklch(0.82_0.15_215_/_0.3)] grid place-items-center shadow-[inset_0_0_30px_oklch(0.82_0.15_215_/_0.15)]">
                <span className="text-4xl select-none">🎬</span>
              </div>
              <div className="flex-1 min-w-0 py-1">
                <h2 className="text-xl font-extrabold mb-1">Apply to Create</h2>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Launch your own channel, build your brand, and share your vision with the world on Trey TV.
                </p>
                <Link
                  to="/apply/creator"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[oklch(0.55_0.18_215)] hover:bg-[oklch(0.60_0.18_215)] text-white text-sm font-bold transition shadow-[0_0_20px_oklch(0.82_0.15_215_/_0.5)]"
                >
                  Start Creator Application <ChevronRight className="size-4" />
                </Link>
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="size-3" /> 5–7 minutes
                </div>
              </div>
            </div>
          </div>

          {/* Gold Verification — neon gold */}
          <div className="relative rounded-3xl overflow-hidden border border-[oklch(0.82_0.16_85_/_0.7)] bg-gradient-to-br from-[oklch(0.16_0.07_85_/_0.95)] to-[oklch(0.11_0.04_70_/_0.98)] shadow-[0_0_70px_-10px_oklch(0.82_0.16_85_/_0.7),inset_0_1px_0_oklch(0.82_0.16_85_/_0.4)]">
            <div className="absolute inset-0 rounded-3xl border border-[oklch(0.82_0.16_85_/_0.25)] pointer-events-none" />
            {/* Featured badge */}
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-[0.15em] px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/50">
                <Star className="size-2.5" fill="currentColor" /> FEATURED
              </span>
            </div>
            <div className="flex items-start gap-4 p-5 pr-[6rem]">
              {/* Gold shield */}
              <div className="shrink-0 size-24 rounded-2xl bg-[oklch(0.82_0.16_85_/_0.15)] border border-[oklch(0.82_0.16_85_/_0.4)] grid place-items-center shadow-[inset_0_0_30px_oklch(0.82_0.16_85_/_0.2),0_0_30px_oklch(0.82_0.16_85_/_0.3)]">
                <span className="text-4xl select-none">🛡️</span>
              </div>
              <div className="flex-1 min-w-0 py-1">
                <h2 className="text-xl font-extrabold mb-1">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[oklch(0.92_0.18_85)] to-primary">
                    Gold Verification
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Request a gold badge to verify your notable status and stand out on Trey TV.
                </p>
                <Link
                  to="/apply/verification"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-[oklch(0.65_0.18_75)] to-[oklch(0.70_0.20_80)] hover:from-[oklch(0.70_0.20_80)] hover:to-[oklch(0.75_0.20_85)] text-black text-sm font-bold transition glow-gold"
                >
                  Request Gold Badge <ChevronRight className="size-4" />
                </Link>
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="size-3" /> 3–5 minutes
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom icon row */}
        <div className="mt-6 grid grid-cols-4 gap-2">
          {BOTTOM_ICONS.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1.5">
              <div className="size-14 rounded-2xl liquid-glass border border-white/10 grid place-items-center">
                {item.isLogo ? (
                  <Logo className="h-7" />
                ) : (
                  <item.icon className="size-6 text-primary" />
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Check status link */}
        <div className="mt-5 text-center">
          <Link to="/applications" className="text-xs text-muted-foreground hover:text-foreground transition inline-flex items-center gap-1.5">
            Check my application status <ChevronRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
