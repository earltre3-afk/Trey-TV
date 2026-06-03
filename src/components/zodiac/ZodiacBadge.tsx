import { Sparkles } from "lucide-react";
import { zodiacSymbol } from "@/lib/zodiac";

export function ZodiacBadge({
  sign,
  symbol,
  isCusp = false,
  cuspLabel,
  size = "md",
  showName,
}: {
  sign?: string | null;
  symbol?: string;
  isCusp?: boolean;
  cuspLabel?: string | null;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}) {
  if (!sign) return null;
  const dims =
    size === "lg" ? "size-20 text-4xl" : size === "sm" ? "size-9 text-lg" : "size-12 text-2xl";
  const shouldShowName = showName ?? size !== "sm";
  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={`relative grid shrink-0 place-items-center rounded-full border ${dims} ${
          isCusp
            ? "border-[oklch(0.86_0.2_300/0.7)] bg-[radial-gradient(circle,oklch(0.86_0.2_300/0.22),oklch(0.82_0.16_85/0.13),transparent)] text-[oklch(0.9_0.18_92)] shadow-[0_0_28px_oklch(0.75_0.25_300/0.45)]"
            : "border-primary/50 bg-primary/10 text-primary shadow-[0_0_22px_oklch(0.82_0.16_85/0.32)]"
        }`}
        aria-label={`${sign} zodiac badge`}
      >
        <span className="absolute inset-1 rounded-full border border-white/10" />
        {symbol ?? zodiacSymbol(sign)}
      </span>
      {shouldShowName && (
        <span className="min-w-0">
          <span className="block text-sm font-black leading-tight">{sign}</span>
          {isCusp && (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[oklch(0.9_0.18_92)]">
              <Sparkles className="size-3" /> {cuspLabel ?? "Cusp Soul"}
            </span>
          )}
        </span>
      )}
    </div>
  );
}

export function ProfileZodiacCard({
  sign,
  symbol,
  isCusp = false,
  cuspLabel,
  moonSign,
  risingSign,
  joinedDate,
}: {
  sign?: string | null;
  symbol?: string;
  isCusp?: boolean;
  cuspLabel?: string | null;
  moonSign?: string | null;
  risingSign?: string | null;
  joinedDate?: string;
}) {
  if (!sign) return null;
  return (
    <section className="relative overflow-hidden rounded-3xl liquid-glass neon-border p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-[oklch(0.65_0.22_300/.22)] blur-3xl"
      />
      <div className="relative flex items-start gap-4">
        <div className="grid size-16 shrink-0 place-items-center rounded-full border border-primary/40 bg-primary/10 text-3xl shadow-[0_0_30px_oklch(0.82_0.16_85/.28)]">
          {symbol ?? zodiacSymbol(sign)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
            Zodiac Identity
          </div>
          <h3 className="mt-1 text-xl font-black">{sign}</h3>
          {isCusp && <CuspBadge label={cuspLabel} />}
          {(moonSign || risingSign) && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              {moonSign && (
                <span className="rounded-xl bg-white/5 px-3 py-2 text-muted-foreground">
                  Moon <b className="text-foreground">{moonSign}</b>
                </span>
              )}
              {risingSign && (
                <span className="rounded-xl bg-white/5 px-3 py-2 text-muted-foreground">
                  Rising <b className="text-foreground">{risingSign}</b>
                </span>
              )}
            </div>
          )}
          {joinedDate && (
            <p className="mt-2 text-[11px] text-muted-foreground">Unlocked {joinedDate}</p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Exact birth date, time, and location stay private.
          </p>
        </div>
      </div>
    </section>
  );
}

export function CuspBadge({ label }: { label?: string | null }) {
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.86_0.2_300/0.45)] bg-[oklch(0.7_0.25_340/0.14)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[oklch(0.9_0.18_92)]">
      <Sparkles className="size-3" /> Cusp Soul
    </span>
  );
}
