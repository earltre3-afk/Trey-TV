/**
 * ProfileStatsBar.tsx
 * Stats bar that shows below the identity section.
 * Normal user: Posts, Followers, Following, Prescriptions
 * Creator: Followers/Fans, Episodes, Watch Hours, Subscribers
 * Owner view: owner-neon/glass; public: liquid-glass
 */

import type { ProfileContext } from "./ProfileTypes";

interface Props extends ProfileContext {}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-3 lg:p-4 text-center">
      <div className="text-[10px] lg:text-[11px] tracking-wider text-muted-foreground uppercase">
        {label}
      </div>
      <div className="text-lg lg:text-2xl font-bold mt-0.5 tabular-nums">{value}</div>
    </div>
  );
}

export function ProfileStatsBar({ profile, profileType, isOwner }: Props) {
  const isCreator = profileType === "creator";

  const containerClass = isOwner
    ? "owner-luxe-card rounded-3xl grid divide-x divide-white/10"
    : "rounded-3xl liquid-glass border border-white/10 grid divide-x divide-white/5";

  if (isCreator) {
    const cols = "grid-cols-4";
    return (
      <div className={`${containerClass} ${cols}`}>
        <StatItem label="Fans" value={profile.stats.followers} />
        <StatItem label="Episodes" value={profile.stats.episodes ?? 0} />
        <StatItem label="Watch Hrs" value={profile.stats.watchHours ?? "—"} />
        <StatItem label="Subscribers" value={profile.stats.subscribers ?? "—"} />
      </div>
    );
  }

  return (
    <div className={`${containerClass} grid-cols-4`}>
      <StatItem label="Posts" value={profile.stats.posts} />
      <StatItem label="Followers" value={profile.stats.followers} />
      <StatItem label="Following" value={profile.stats.following} />
      <StatItem label="Prescriptions" value={profile.stats.prescriptions ?? "—"} />
    </div>
  );
}
