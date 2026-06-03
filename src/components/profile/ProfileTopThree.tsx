/**
 * ProfileTopThree.tsx
 * Displays a user's Top 3 featured profiles with mutual indicators
 */

import { Link } from "@tanstack/react-router";
import { Sparkles, Users } from "lucide-react";
import type { TopThreeEntry } from "./ProfileTypes";
import { ProfileSectionCard } from "./ProfileSectionCard";

interface Props {
  topThree: TopThreeEntry[];
  isOwner?: boolean;
  onEdit?: () => void;
}

export function ProfileTopThree({ topThree, isOwner, onEdit }: Props) {
  if (topThree.length === 0) {
    return null;
  }

  return (
    <ProfileSectionCard title="Top 3" icon={Users} iconColor="oklch(0.82 0.16 85)">
      <div className="space-y-3">
        {topThree.map((entry) => (
          <TopThreeCard key={entry.id} entry={entry} />
        ))}
      </div>
    </ProfileSectionCard>
  );
}

function TopThreeCard({ entry }: { entry: TopThreeEntry }) {
  const displayName =
    (entry.featured_display_name as string) || (entry.featured_username as string) || "Unknown";
  const handle = entry.featured_username ? `@${entry.featured_username}` : "";
  const avatar = (entry.featured_avatar_url as string) || "/default-avatar.png";
  const profileUid = entry.featured_public_profile_uid;

  return (
    <Link
      to={profileUid ? (`/u/${profileUid}` as any) : "#"}
      className="group block rounded-2xl liquid-glass border border-white/10 p-3 hover:border-primary/30 transition-all duration-300"
    >
      <div className="flex items-center gap-3">
        {/* Position badge */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary">
          {entry.position}
        </div>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={avatar}
            alt={displayName}
            className="size-12 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-primary/30 transition-all"
          />
          {entry.is_mutual_top_three && (
            <div className="absolute -top-1 -right-1 size-5 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="size-3 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
            {displayName}
          </div>
          <div className="text-xs text-muted-foreground truncate">{handle}</div>
        </div>

        {/* Mutual indicator */}
        {entry.is_mutual_top_three && (
          <div className="flex-shrink-0 text-[10px] px-2 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary">
            Mutual
          </div>
        )}
      </div>
    </Link>
  );
}
