import { User } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type DefaultAvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface DefaultAvatarProps {
  /** Optional name — used to pick a deterministic neon accent color */
  name?: string;
  /** Optional uid — fallback for color seeding */
  uid?: string;
  /** Size preset. Defaults to "md" */
  size?: DefaultAvatarSize;
  /** Extra class names for the outer wrapper */
  className?: string;
  /** Shape: "circle" (default) or "square" */
  shape?: "circle" | "square";
}

// ─── Deterministic color from string ──────────────────────────────────────────

const NEON_ACCENTS = [
  { ring: "oklch(0.82_0.16_85)", glow: "oklch(0.82_0.16_85_/_0.25)" },   // gold
  { ring: "oklch(0.7_0.25_340)", glow: "oklch(0.7_0.25_340_/_0.25)" },   // magenta
  { ring: "oklch(0.82_0.15_215)", glow: "oklch(0.82_0.15_215_/_0.25)" }, // cyan
  { ring: "oklch(0.78_0.18_150)", glow: "oklch(0.78_0.18_150_/_0.25)" }, // green
  { ring: "oklch(0.65_0.22_300)", glow: "oklch(0.65_0.22_300_/_0.25)" }, // purple
];

function seedIndex(seed?: string): number {
  if (!seed) return 0;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) >>> 0;
  }
  return h % NEON_ACCENTS.length;
}

// ─── Size map ─────────────────────────────────────────────────────────────────

const SIZE_MAP: Record<DefaultAvatarSize, { wrapper: string; icon: string; border: string }> = {
  xs:  { wrapper: "size-6",  icon: "size-3",   border: "border" },
  sm:  { wrapper: "size-8",  icon: "size-4",   border: "border" },
  md:  { wrapper: "size-10", icon: "size-5",   border: "border" },
  lg:  { wrapper: "size-14", icon: "size-6",   border: "border-2" },
  xl:  { wrapper: "size-20", icon: "size-8",   border: "border-2" },
  "2xl": { wrapper: "size-28", icon: "size-10", border: "border-2" },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export function DefaultAvatar({
  name,
  uid,
  size = "md",
  className = "",
  shape = "circle",
}: DefaultAvatarProps) {
  const seed = name ?? uid ?? "";
  const accent = NEON_ACCENTS[seedIndex(seed)];
  const { wrapper, icon, border } = SIZE_MAP[size];
  const radius = shape === "circle" ? "rounded-full" : "rounded-xl";

  return (
    <div
      className={`${wrapper} ${radius} ${border} flex items-center justify-center shrink-0 overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(ellipse at 60% 30%, ${accent.glow}, oklch(0.13_0.02_270) 70%)`,
        borderColor: accent.ring,
        boxShadow: `0 0 12px -4px ${accent.glow}`,
      }}
      aria-hidden="true"
    >
      <User
        className={`${icon} opacity-60`}
        style={{ color: accent.ring }}
        strokeWidth={1.5}
      />
    </div>
  );
}

// ─── Avatar with image fallback ────────────────────────────────────────────────

interface AvatarWithFallbackProps extends DefaultAvatarProps {
  /** The real avatar URL. If falsy, DefaultAvatar renders instead. */
  src?: string | null;
  /** Alt text for the image */
  alt?: string;
}

export function AvatarWithFallback({
  src,
  alt = "Profile photo",
  name,
  uid,
  size = "md",
  className = "",
  shape = "circle",
}: AvatarWithFallbackProps) {
  const { wrapper } = SIZE_MAP[size];
  const radius = shape === "circle" ? "rounded-full" : "rounded-xl";

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${wrapper} ${radius} object-cover shrink-0 ${className}`}
      />
    );
  }

  return <DefaultAvatar name={name} uid={uid} size={size} className={className} shape={shape} />;
}
