import { Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { type ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LegalTOC } from "./LegalTOC";
import { LegalSection } from "./LegalSection";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { LEGAL_LAST_UPDATED, type LegalPolicy } from "@/lib/legal-content";

export function LegalLayout({
  policy,
  children,
}: {
  policy: LegalPolicy;
  children?: ReactNode;
}) {
  return (
    <AppShell wide>
      <div className="relative pb-10">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-[28px] liquid-glass neon-border p-6 lg:p-10 mb-6">
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -right-20 size-[60vmin] rounded-full bg-[radial-gradient(closest-side,oklch(0.82_0.15_215/0.25),transparent)] blur-3xl" />
            <div className="absolute -bottom-32 -left-20 size-[60vmin] rounded-full bg-[radial-gradient(closest-side,oklch(0.82_0.16_85/0.18),transparent)] blur-3xl" />
          </div>
          <div className="relative">
            <Link to="/legal" className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.22em] text-muted-foreground hover:text-foreground transition">
              <ArrowLeft className="size-3.5" /> LEGAL & SAFETY
            </Link>
            <h1 className="font-display mt-3 text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight bg-gradient-to-br from-white via-white/85 to-white/60 bg-clip-text text-transparent">
              {policy.title}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-foreground/70 max-w-2xl">{policy.summary}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full liquid-glass border border-white/10 text-muted-foreground">
                <ShieldCheck className="size-3" /> Last updated: {LEGAL_LAST_UPDATED}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full liquid-glass border border-white/10 text-muted-foreground">
                <Sparkles className="size-3 text-primary" /> Trey TV policy
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <LegalTOC sections={policy.sections} />
            </div>
          </aside>

          <div className="space-y-3 lg:space-y-4">
            {/* Mobile-only TOC */}
            <details className="lg:hidden rounded-2xl liquid-glass border border-white/10 p-3">
              <summary className="cursor-pointer text-xs tracking-[0.22em] text-muted-foreground select-none">
                ON THIS PAGE
              </summary>
              <div className="mt-3">
                <LegalTOC sections={policy.sections} compact />
              </div>
            </details>

            {policy.sections.map((s) => (
              <LegalSection key={s.id} section={s} />
            ))}

            {children}

            <div className="flex flex-wrap gap-2 pt-4">
              <Link to="/legal" className="inline-flex items-center gap-1.5 px-4 h-10 rounded-xl liquid-glass border border-white/10 text-sm font-semibold hover:border-white/30 transition">
                <ArrowLeft className="size-4" /> Back to Legal Hub
              </Link>
              <Link to="/legal/data-deletion" className="inline-flex items-center gap-1.5 px-4 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-bold glow-gold tilt-press">
                Data Request
              </Link>
            </div>
          </div>
        </div>

        <PublicFooter />
      </div>
    </AppShell>
  );
}
