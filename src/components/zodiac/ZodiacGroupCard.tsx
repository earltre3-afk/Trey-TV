import { ChevronRight, LogOut, Plus, Users } from "lucide-react";
import { useState } from "react";

interface GroupMember {
  id: string;
  name: string;
  avatar: string;
}

interface ZodiacGroupCardProps {
  groupName: string;
  matchReason: string;
  memberCount: number;
  members: GroupMember[];
  tags: string[];
  zodiacSigns?: string[];
  icon?: string;
  isMember?: boolean;
  onJoin?: () => void;
  onLeave?: () => void;
  onClick?: () => void;
}

export function ZodiacGroupCard({
  groupName,
  matchReason,
  memberCount,
  members,
  tags,
  zodiacSigns = [],
  icon = "✦",
  isMember = false,
  onJoin,
  onLeave,
  onClick,
}: ZodiacGroupCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="zodiac-group-card glass-strong overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-[0_0_32px_oklch(0.82_0.16_85_/_0.25)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-hovered={isHovered}
    >
      <div className="relative space-y-4 border-b border-[oklch(1_0_0_/_0.08)] p-6">
        <div
          className="absolute right-0 top-0 size-40 rounded-full"
          style={{
            background: "radial-gradient(circle, oklch(0.65 0.22 300 / 0.15), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div className="relative z-10 flex items-start gap-4">
          <div className="glass flex size-14 shrink-0 items-center justify-center rounded-xl text-2xl">
            {icon}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <h3 className="truncate text-lg font-bold">{groupName}</h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">{matchReason}</p>
          </div>
          <div className="glass flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold">
            <Users className="size-3" />
            {memberCount}
          </div>
        </div>
      </div>

      <div className="space-y-3 border-b border-[oklch(1_0_0_/_0.08)] px-6 py-4">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Members
        </p>
        <div className="-space-x-2 flex items-center">
          {members.slice(0, 4).map((member, idx) => (
            <div
              key={member.id}
              className="glass relative flex size-9 shrink-0 items-center justify-center rounded-full ring-2 ring-[oklch(0.17_0.025_270)] transition-transform hover:scale-110"
              style={{ zIndex: members.length - idx }}
              aria-label={member.name}
            >
              <span className="text-xs font-bold">{member.avatar}</span>
            </div>
          ))}
          {memberCount > 4 && (
            <div className="glass flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-muted-foreground ring-2 ring-[oklch(0.17_0.025_270)]">
              +{memberCount - 4}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 border-b border-[oklch(1_0_0_/_0.08)] px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {zodiacSigns.map((sign) => (
            <span
              key={sign}
              className="glass inline-flex items-center gap-1 rounded-lg border border-[#a855f7]/40 px-2.5 py-1.5 text-xs font-medium"
            >
              {sign}
            </span>
          ))}
          {tags.map((tag) => (
            <span
              key={tag}
              className="glass inline-flex items-center gap-1 rounded-lg border border-[oklch(1_0_0_/_0.15)] px-2.5 py-1.5 text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-center gap-2 rounded-lg border border-[oklch(0.82_0.16_85_/_0.25)] bg-[oklch(0.82_0.16_85_/_0.1)] px-3 py-2">
          <span className="text-xs font-bold text-[#ffc857]">Matched by Trey TV</span>
        </div>

        <div className="flex gap-2">
          {isMember ? (
            <>
              <button
                onClick={onClick}
                className="flex flex-1 items-center justify-between rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#a855f7] px-4 py-3 font-semibold text-black transition-all hover:shadow-[0_0_16px_oklch(0.82_0.15_215_/_0.4)]"
              >
                Open Group
                <ChevronRight className="size-4" />
              </button>
              <button
                onClick={onLeave}
                className="rounded-lg border border-[oklch(1_0_0_/_0.15)] px-4 py-3 transition-colors hover:border-destructive/40 hover:bg-destructive/10"
                title="Leave group"
              >
                <LogOut className="size-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onJoin}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#ffc857] to-[#a855f7] px-4 py-3 font-semibold text-black transition-all hover:shadow-[0_0_20px_oklch(0.82_0.16_85_/_0.5)]"
            >
              <Plus className="size-4" />
              Join Group
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
