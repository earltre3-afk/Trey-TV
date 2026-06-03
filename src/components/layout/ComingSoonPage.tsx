import { Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useGoBack } from "@/hooks/use-go-back";
import type { LucideIcon } from "lucide-react";
import { AppShell } from "./AppShell";

export function ComingSoonPage({
  title,
  tagline,
  icon: Icon = Sparkles,
  accent = "primary",
  bullets,
  cta,
}: {
  title: string;
  tagline: string;
  icon?: LucideIcon;
  accent?: "primary" | "magenta" | "cyan" | "purple";
  bullets: string[];
  cta?: { label: string; to: string };
}) {
  const goBack = useGoBack("/");
  const accentClass = {
    primary: "text-primary border-primary/40 bg-primary/10 glow-gold",
    magenta:
      "text-[oklch(0.7_0.25_340)] border-[oklch(0.7_0.25_340_/_0.5)] bg-[oklch(0.7_0.25_340_/_0.1)] glow-magenta",
    cyan: "text-[oklch(0.82_0.15_215)] border-[oklch(0.82_0.15_215_/_0.5)] bg-[oklch(0.82_0.15_215_/_0.1)]",
    purple:
      "text-[oklch(0.65_0.22_300)] border-[oklch(0.65_0.22_300_/_0.5)] bg-[oklch(0.65_0.22_300_/_0.1)] glow-purple",
  }[accent];

  return (
    <AppShell>
      <div className="space-y-6 -mt-2">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back
        </button>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 glass-strong p-6 lg:p-10">
          <div
            aria-hidden
            className="absolute -top-16 -right-16 size-56 rounded-full bg-primary/15 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-16 -left-16 size-56 rounded-full bg-[oklch(0.7_0.25_340_/_0.15)] blur-3xl"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,oklch(0.82_0.16_85_/_0.6),transparent)]"
          />

          <div className="relative flex items-start gap-4">
            <div
              className={`size-14 grid place-items-center rounded-2xl border ${accentClass} animate-glow-pulse`}
            >
              <Icon className="size-7" />
            </div>
            <div className="flex-1">
              <div className="text-[11px] tracking-[0.2em] text-muted-foreground">TREY · TV</div>
              <h1 className="mt-1 text-2xl lg:text-3xl font-bold">{title}</h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-prose">{tagline}</p>
            </div>
          </div>

          <ul className="relative mt-6 grid sm:grid-cols-2 gap-2">
            {bullets.map((b, i) => (
              <li
                key={b}
                style={{ animationDelay: `${i * 60}ms` }}
                className="animate-rise rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm flex items-start gap-2"
              >
                <Sparkles className="size-4 text-primary mt-0.5 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          {cta && (
            <div className="relative mt-6">
              <Link
                to={cta.to}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground glow-gold hover-lift tilt-press"
              >
                {cta.label}
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
