import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { ZodiacGroupCard } from "./ZodiacGroupCard";

export type ZodiacHubGroup = {
  id: string;
  groupName: string;
  matchReason: string;
  memberCount: number;
  members: Array<{ id: string; name: string; avatar: string }>;
  tags: string[];
  zodiacSigns?: string[];
  icon?: string;
  isMember?: boolean;
};

export function ZodiacGroupsHub({
  groups = [],
  onOpen,
  onJoin,
  onLeave,
}: {
  groups?: ZodiacHubGroup[];
  onOpen?: (group: ZodiacHubGroup) => void;
  onJoin?: (group: ZodiacHubGroup) => void;
  onLeave?: (group: ZodiacHubGroup) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterByMembership, setFilterByMembership] = useState<"all" | "joined" | "available">(
    "all",
  );

  const filteredGroups = groups.filter((group) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      group.groupName.toLowerCase().includes(q) ||
      group.tags.some((tag) => tag.toLowerCase().includes(q));
    const matchesMembership =
      filterByMembership === "all" ||
      (filterByMembership === "joined" && group.isMember) ||
      (filterByMembership === "available" && !group.isMember);
    return matchesSearch && matchesMembership;
  });

  return (
    <div className="zodiac-groups-hub space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Sparkles className="size-8 text-[#ffc857]" />
            Zodiac Communities
          </h1>
          <p className="text-muted-foreground">
            Your matched groups appear here once Trey TV has enough profile context.
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search groups, signs, interests..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="glass-input w-full pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Groups" },
              { id: "joined", label: "Joined" },
              { id: "available", label: "Discover" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterByMembership(filter.id as typeof filterByMembership)}
                className={`rounded-lg px-4 py-2 font-medium transition-all ${
                  filterByMembership === filter.id
                    ? "bg-gradient-to-r from-[#ffc857] to-[#a855f7] text-black shadow-[0_0_16px_oklch(0.82_0.16_85_/_0.3)]"
                    : "glass hover:bg-[oklch(1_0_0_/_0.08)]"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredGroups.length > 0 ? (
        <div className="grid gap-4 sm:gap-6">
          {filteredGroups.map((group) => (
            <ZodiacGroupCard
              key={group.id}
              groupName={group.groupName}
              matchReason={group.matchReason}
              memberCount={group.memberCount}
              members={group.members}
              tags={group.tags}
              zodiacSigns={group.zodiacSigns}
              icon={group.icon}
              isMember={group.isMember}
              onClick={() => onOpen?.(group)}
              onJoin={() => onJoin?.(group)}
              onLeave={() => onLeave?.(group)}
            />
          ))}
        </div>
      ) : (
        <div className="glass-strong space-y-3 rounded-2xl p-12 text-center">
          <Sparkles className="mx-auto size-7 text-primary" />
          <p className="text-lg font-semibold">No matched groups yet</p>
          <p className="text-muted-foreground">
            Confirm your zodiac identity and profile interests to unlock age-safe community matches.
          </p>
        </div>
      )}
    </div>
  );
}
