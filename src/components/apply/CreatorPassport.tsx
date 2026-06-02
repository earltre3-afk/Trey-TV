import { MapPin, ShieldCheck } from "lucide-react";

type Variant = "creator" | "gold" | "tradio";

export function CreatorPassport({
  variant,
  displayName,
  handle,
  location,
  uid,
  step,
  totalSteps,
  avatarUrl,
}: {
  variant: Variant;
  displayName: string;
  handle: string;
  location?: string;
  uid: string;
  step: number;
  totalSteps: number;
  avatarUrl?: string;
}) {
  const isGold = variant === "gold";
  const isTradio = variant === "tradio";
  const accent = isTradio ? "text-purple-300" : isGold ? "text-[oklch(0.92_0.18_88)]" : "text-[oklch(0.82_0.2_235)]";
  const accentRing = isTradio
    ? "shadow-[inset_0_0_0_1px_oklch(0.85_0.2_290/0.6),0_0_24px_oklch(0.65_0.3_295/0.35)]"
    : isGold
    ? "shadow-[inset_0_0_0_1px_oklch(0.92_0.18_88/0.6),0_0_24px_oklch(0.65_0.3_85/0.35)]"
    : "shadow-[inset_0_0_0_1px_oklch(0.82_0.2_235/0.6),0_0_24px_oklch(0.65_0.3_245/0.35)]";
  const progress = Math.round((step / totalSteps) * 100);
  const monogram = (displayName || handle || "T").trim().charAt(0).toUpperCase();

  return (
    <div className={`relative ${isTradio ? "neon-purple" : isGold ? "neon-gold" : "neon-blue"} p-5 md:p-6`}>
      <div className="liquid-sheen" />
      <div className="relative">
        <div className={`flex items-center gap-2 text-sm font-semibold ${accent}`}>
          <ShieldCheck className="h-4 w-4" />
          <span>{isTradio ? "Tradio Creative Pass" : isGold ? "Verification Pass" : "Creator Passport"}</span>
        </div>

        <div className={`mx-auto mt-4 h-44 w-full max-w-[220px] overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_50%_30%,oklch(0.2_0.08_260),oklch(0.08_0.02_260))] ${accentRing}`}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName || "Applicant"} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className={`font-display text-7xl tracking-tight ${isTradio ? "title-split-purple text-purple-300" : isGold ? "title-split-gold" : "title-split-blue"}`}>{monogram}</span>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-lg font-semibold tracking-tight">{displayName || "Your Name"}</p>
          <p className={`text-sm ${accent}`}>{handle ? (handle.startsWith("@") ? handle : `@${handle}`) : "@handle"}</p>
          {location && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {location}
            </p>
          )}
        </div>

        <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{isTradio ? "Tradio Applicant UID" : isGold ? "Request UID" : "Creator UID"}</p>
          <p className={`mt-1 font-mono text-base ${accent}`}>{uid || "-"}</p>
        </div>

        <div className="mt-5 flex justify-center">
          <CircularProgress value={progress} variant={variant} label={`${progress}%`} sublabel={`Step ${step} of ${totalSteps}`} />
        </div>
      </div>
    </div>
  );
}

function CircularProgress({
  value,
  size = 130,
  variant = "creator",
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  variant?: Variant;
  label: string;
  sublabel?: string;
}) {
  const stroke = 6;
  const r = (size - stroke) / 2 - 6;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  const ringColor = variant === "tradio" ? "oklch(0.85 0.2 290)" : variant === "gold" ? "oklch(0.92 0.18 88)" : "oklch(0.82 0.2 235)";
  const trackColor = "oklch(1 0 0 / 0.07)";
  const innerStroke = variant === "tradio" ? "oklch(0.85 0.2 290 / 0.45)" : variant === "gold" ? "oklch(0.92 0.18 88 / 0.45)" : "oklch(0.82 0.2 235 / 0.45)";
  const accent = variant === "tradio" ? "text-purple-300" : variant === "gold" ? "text-[oklch(0.92_0.18_88)]" : "text-[oklch(0.82_0.2_235)]";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`ring-${variant}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={ringColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={ringColor} stopOpacity="1" />
          </linearGradient>
          <filter id={`glow-${variant}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={`url(#ring-${variant})`} strokeWidth={stroke} strokeLinecap="round" fill="none" strokeDasharray={c} strokeDashoffset={offset} filter={`url(#glow-${variant})`} style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.2,0.8,0.2,1)" }} />
        <circle cx={size / 2} cy={size / 2} r={r - 10} stroke={innerStroke} strokeWidth={1} fill="none" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-semibold tracking-tight md:text-3xl">{label}</span>
        {sublabel && <span className={`mt-0.5 text-[11px] ${accent}`}>{sublabel}</span>}
      </div>
    </div>
  );
}
