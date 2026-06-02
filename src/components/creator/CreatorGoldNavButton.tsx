import { Link } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function CreatorGoldNavButton({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const { isApprovedCreator } = useAuth();
  if (!isApprovedCreator) return null;

  if (compact) {
    return (
      <Link
        to="/creator-studio"
        aria-label="Creator Studio"
        className={`relative size-10 grid place-items-center rounded-xl bg-gradient-to-br from-[oklch(0.82_0.16_85_/_0.4)] to-[oklch(0.6_0.18_60_/_0.3)] border border-primary/50 text-primary glow-gold tilt-press ${className}`}
      >
        <Crown className="size-5" />
        <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary animate-glow-pulse" />
      </Link>
    );
  }

  return (
    <Link
      to="/creator-studio"
      className={`group relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-primary/90 via-primary to-[oklch(0.78_0.18_70)] text-primary-foreground glow-gold tilt-press hover-lift ${className}`}
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_30%_30%,oklch(1_0_0_/_0.4),transparent_60%)] opacity-60 group-hover:opacity-100 transition"
      />
      <Crown className="relative size-4" />
      <span className="relative">Creator Studio</span>
    </Link>
  );
}
