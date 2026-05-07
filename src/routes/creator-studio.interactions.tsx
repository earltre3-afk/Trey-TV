import { createFileRoute } from "@tanstack/react-router";
import { CreatorStudioLayout } from "@/components/layout/CreatorStudioLayout";
import { SectionHeader } from "@/components/creator/CreatorPrimitives";
import { MessageSquare, Heart, Users, Gem, AtSign, Pin, Eye, Reply } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/creator-studio/interactions")({
  component: InteractionsPage,
  head: () => ({ meta: [{ title: "Interactions — Creator Studio" }] }),
});

const FILTERS = ["All", "Comments", "Replies", "Follows", "Gifts", "Mentions", "Admin"] as const;

const ITEMS = [
  { kind: "comment", who: "@nightowl", body: "Bro this episode hit different 🔥", ep: "Late Night S2 E14", ago: "5m" },
  { kind: "gift", who: "@maya", body: "Sent 250 pts", ep: "Studio Sessions E8", ago: "12m" },
  { kind: "follow", who: "@chrishorizon", body: "Started following your channel", ep: "", ago: "27m" },
  { kind: "comment", who: "@zaybeats", body: "When does S3 drop?", ep: "City After Dark", ago: "1h" },
  { kind: "admin", who: "Trey TV Admin", body: "Re-mastered audio approved. Episode is live.", ep: "City After Dark Trailer", ago: "2h" },
  { kind: "mention", who: "@lena", body: "Y'all need to watch @trey's new ep.", ep: "", ago: "3h" },
];

const ICON: Record<string, typeof MessageSquare> = {
  comment: MessageSquare, gift: Gem, follow: Users, admin: Pin, mention: AtSign,
};

function InteractionsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const filtered = ITEMS.filter((i) => filter === "All" || i.kind === filter.toLowerCase().slice(0, -1) || (filter === "Admin" && i.kind === "admin"));

  return (
    <CreatorStudioLayout title="Interactions" subtitle="Your creator inbox.">
      <div className="rounded-2xl glass neon-border p-1.5 overflow-x-auto no-scrollbar">
        <div className="flex gap-1 min-w-max">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${filter === f ? "bg-primary/15 text-primary ring-1 ring-primary/40" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <section className="rounded-3xl glass neon-border p-4 md:p-5">
        <SectionHeader icon={MessageSquare} title="Recent activity" />
        <ul className="divide-y divide-white/5">
          {filtered.map((it, i) => {
            const Icon = ICON[it.kind] ?? MessageSquare;
            return (
              <li key={i} className="flex items-start gap-3 py-3">
                <div className="size-10 rounded-xl bg-white/5 grid place-items-center shrink-0 text-primary">
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="font-semibold">{it.who}</span>{" "}
                    <span className="text-muted-foreground">· {it.ago}</span>
                  </div>
                  <div className="text-sm">{it.body}</div>
                  {it.ep && <div className="text-[11px] text-muted-foreground mt-0.5">on {it.ep}</div>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button title="Like" className="size-8 grid place-items-center rounded-lg hover:bg-white/5 text-muted-foreground"><Heart className="size-4" /></button>
                  <button title="Reply" className="size-8 grid place-items-center rounded-lg hover:bg-white/5 text-muted-foreground"><Reply className="size-4" /></button>
                  <button title="View" className="size-8 grid place-items-center rounded-lg hover:bg-white/5 text-muted-foreground"><Eye className="size-4" /></button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </CreatorStudioLayout>
  );
}
