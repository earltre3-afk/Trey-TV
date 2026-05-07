import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CreatorStudioLayout } from "@/components/layout/CreatorStudioLayout";
import { SectionHeader } from "@/components/creator/CreatorPrimitives";
import { Calendar, Plus, Film, Clock, Star, X, Bell } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSubmissions } from "@/lib/submissions-store";
import { toast } from "sonner";

export const Route = createFileRoute("/creator-studio/schedule")({
  component: SchedulePage,
  head: () => ({ meta: [{ title: "Schedule — Creator Studio" }] }),
});

const UPCOMING = [
  { d: "Tonight 9:00 PM", title: "Late Night with Trey · S2 E15", kind: "Premiere", day: 8 },
  { d: "Fri · 7:00 PM", title: "Studio Sessions · E9", kind: "Episode", day: 11 },
  { d: "Sat · 12:00 PM", title: "City After Dark · Bonus Reel", kind: "Bonus", day: 12 },
];

function SchedulePage() {
  const store = useSubmissions();
  const [dialog, setDialog] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [pickEp, setPickEp] = useState<string>("");
  const [pickTime, setPickTime] = useState("20:00");

  const approved = useMemo(() =>
    store.submissions.filter((s) => s.status === "approved" || s.status === "draft" || s.status === "needs_changes")
  , [store.submissions]);

  const dayHas: Record<number, typeof UPCOMING> = useMemo(() => {
    const m: Record<number, typeof UPCOMING> = {};
    UPCOMING.forEach((u) => { (m[u.day] ||= []).push(u); });
    return m;
  }, []);

  const doSchedule = () => {
    if (!pickEp) { toast.error("Pick an episode"); return; }
    store.approve(pickEp, { scheduleAt: new Date(`2026-06-${String((selected ?? 1)).padStart(2, "0")}T${pickTime}`).toISOString() });
    toast.success("Episode scheduled");
    setDialog(false); setPickEp(""); setSelected(null);
  };

  return (
    <CreatorStudioLayout
      title="Schedule & programming"
      subtitle="Run your channel like a network."
      actions={
        <button onClick={() => setDialog(true)} className="px-3.5 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press inline-flex items-center gap-1.5">
          <Plus className="size-4" /> Schedule episode
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
                <button onClick={() => toast.success("Notified your fans")} className="px-2.5 py-1.5 rounded-lg text-[11px] glass border border-white/10 inline-flex items-center gap-1">
                  <Bell className="size-3" /> Notify fans
                </button>
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
            <Link to="/creator-studio/channel" className="mt-3 inline-block px-3 py-1.5 rounded-lg text-xs border border-primary text-primary hover:bg-primary/10">Change</Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl glass neon-border p-4 md:p-5">
        <SectionHeader icon={Calendar} title="Programming planner" action={
          <span className="text-[11px] text-muted-foreground">Tap a day to schedule</span>
        } />
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {["S","M","T","W","T","F","S"].map((d) => <div key={d} className="text-[10px] tracking-widest text-muted-foreground py-1">{d}</div>)}
          {Array.from({ length: 28 }, (_, i) => {
            const day = i + 1;
            const has = dayHas[day];
            const active = selected === day;
            return (
              <button
                key={day}
                onClick={() => { setSelected(day); setDialog(true); }}
                className={`relative aspect-square rounded-lg text-xs grid place-items-center transition ${
                  active ? "bg-primary text-primary-foreground glow-gold ring-1 ring-primary"
                    : has ? "bg-primary/15 text-primary ring-1 ring-primary/40 font-semibold hover:bg-primary/25"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                }`}
              >
                {day}
                {has && !active && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>
        {selected !== null && (
          <div className="mt-3 rounded-2xl bg-white/5 ring-1 ring-white/10 p-3">
            <div className="text-[10px] tracking-[0.2em] text-primary mb-1">DAY {selected}</div>
            {dayHas[selected]?.length ? (
              <ul className="space-y-1">
                {dayHas[selected].map((e, i) => (
                  <li key={i} className="text-sm flex items-center justify-between">
                    <span>{e.title}</span>
                    <span className="text-[11px] text-muted-foreground">{e.d.split(" · ").pop()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-muted-foreground">Nothing scheduled. Use "Schedule episode" to add one.</div>
            )}
          </div>
        )}
      </section>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="bg-background border-white/10">
          <DialogHeader>
            <DialogTitle className="text-gradient-gold">Schedule an episode</DialogTitle>
            <DialogDescription>Pick an approved episode and a release time. Fans get notified automatically.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="block">
              <div className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase mb-1">Episode</div>
              <select value={pickEp} onChange={(e) => setPickEp(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm">
                <option value="">Select…</option>
                {approved.map((s) => (
                  <option key={s.content_id} value={s.content_id}>{s.title || "Untitled"} — S{s.season_number}E{s.episode_number}</option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase mb-1">Day</div>
                <input type="number" min={1} max={28} value={selected ?? 1} onChange={(e) => setSelected(Number(e.target.value))} className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm" />
              </label>
              <label className="block">
                <div className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase mb-1">Time</div>
                <input type="time" value={pickTime} onChange={(e) => setPickTime(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm" />
              </label>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setDialog(false)} className="flex-1 px-3 py-2 rounded-xl text-sm font-semibold glass border border-white/10">Cancel</button>
              <button onClick={doSchedule} className="flex-1 px-3 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold">Schedule</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </CreatorStudioLayout>
  );
}
