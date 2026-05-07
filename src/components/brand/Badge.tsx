import { BadgeCheck, Crown } from "lucide-react";

type Kind = "creator" | "user" | "admin";

export function VerifiedBadge({ kind = "user", className = "" }: { kind?: Kind; className?: string }) {
  if (kind === "admin") {
    return <Crown className={`size-4 text-[oklch(0.7_0.18_305)] drop-shadow-[0_0_6px_oklch(0.7_0.18_305_/_0.8)] ${className}`} />;
  }
  const color =
    kind === "creator"
      ? "text-[oklch(0.82_0.16_85)] drop-shadow-[0_0_6px_oklch(0.82_0.16_85_/_0.8)]"
      : "text-[oklch(0.78_0.18_150)] drop-shadow-[0_0_6px_oklch(0.78_0.18_150_/_0.8)]";
  return <BadgeCheck className={`size-4 ${color} ${className}`} />;
}
