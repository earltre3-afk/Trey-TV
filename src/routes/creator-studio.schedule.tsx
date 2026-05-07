import { createFileRoute } from "@tanstack/react-router";
import { CreatorStudioLayout } from "@/components/layout/CreatorStudioLayout";
import { SectionHeader } from "@/components/creator/CreatorPrimitives";
import { Calendar, Plus, Film, Clock, Star } from "lucide-react";

export const Route = createFileRoute("/creator-studio/schedule")({
  component: SchedulePage,
  head: () => ({ meta: [{ title: "Schedule — Creator Studio" }] }),
});

const UPCOMING = [
  { d: "Tonight 9:00 PM", title: "Late Night with Trey · S2 E15", kind: "Premiere" },
  { d: "Fri · 7:00 PM", title: "Studio Sessions · E9", kind: "Episode" },
  { d: "Sat · 12:00 PM", title: "City After Dark · Bonus Reel", kind: "Bonus" },
];

function SchedulePage() {
  return (
    <CreatorStudioLayout title="Schedule & programming" subtitle="Run your channel like a network."
      actions={
        <button className="px-3.5 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press inline-flex items-center gap-1.5">
          <Plus className="size-4" /> New Show
        </button>
      }
    >
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-3xl glass neon-border p-4 md:p-5">
          <SectionHeader icon={Calendar} title="Upcoming premieres" />
          <ul className="divide-y divide-white/5">
            {UPCOMING.map((u, i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                <div className="size-12 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/30 grid place-items-center shrink-0">
                  <Clock className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{u.title}</div>
                  <div className="text-[11px] text-muted-foreground">{u.d}</div>
                </div>
                <span className="text-[10px] tracking-[0.18em] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 uppercase">{u.kind}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl glass neon-border p-4 md:p-5">
          <SectionHeader icon={Star} title="Featured series" />
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 text-center">
            <Film className="size-8 text-primary mx-auto mb-2" />
            <div className="font-semibold">Late Night with Trey</div>
            <div className="text-xs text-muted-foreground">Pinned to your channel</div>
            <button className="mt-3 px-3 py-1.5 rounded-lg text-xs border border-primary text-primary hover:bg-primary/10">Change</button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl glass neon-border p-4 md:p-5">
        <SectionHeader icon={Calendar} title="Programming planner" />
        <div className="grid grid-cols-7 gap-1 text-center">
          {Array.from({ length: 28 }, (_, i) => {
            const has = [3, 6, 11, 17, 21].includes(i);
            return (
              <div key={i} className={`aspect-square rounded-lg text-xs grid place-items-center ${has ? "bg-primary/15 text-primary ring-1 ring-primary/40 font-semibold" : "bg-white/5 text-muted-foreground"}`}>
                {i + 1}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">Drag-and-drop episode ordering coming soon.</p>
      </section>
    </CreatorStudioLayout>
  );
}
