import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Tv, Radio, Bell, BookmarkPlus, CalendarPlus, Play, Lock, Filter,
  Crown, ChevronLeft, ChevronRight, Check,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
  channels, scheduleSlots, episodeById, channelById, categories, type ScheduleSlot,
} from "@/lib/watch-data";
import { useGuide } from "@/lib/guide-store";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter,
} from "@/components/ui/drawer";
import { toast } from "sonner";

export const Route = createFileRoute("/guide")({
  component: GuidePage,
  head: () => ({
    meta: [
      { title: "Guide · Trey TV" },
      { name: "description", content: "The Trey TV Guide — every channel, every show, every time slot." },
    ],
  }),
});

const SLOT_PX = 160; // 30-min cell width

function getSlotStatus(slot: ScheduleSlot, now: number): ScheduleSlot["status"] {
  const start = new Date(slot.startsAt).getTime();
  const end = new Date(slot.endsAt).getTime();
  return end < now ? "aired" : start <= now ? "live" : "upcoming";
}

function GuidePage() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const [activeCat, setActiveCat] = useState<string>("All");
  const [activeChannels, setActiveChannels] = useState<Set<string>>(new Set());
  const [openSlot, setOpenSlot] = useState<ScheduleSlot | null>(null);

  const filteredChannels = useMemo(() => {
    return channels.filter((c) => {
      if (activeCat !== "All" && c.category !== activeCat) return false;
      if (activeChannels.size > 0 && !activeChannels.has(c.id)) return false;
      return true;
    });
  }, [activeCat, activeChannels]);

  const dayStart = useMemo(() => {
    const firstSlot = scheduleSlots[0]?.startsAt;
    const d = firstSlot ? new Date(firstSlot) : new Date();
    d.setHours(0,0,0,0);
    return d.getTime();
  }, []);
  const effectiveNow = now ?? dayStart;
  const slotsWithStatus = useMemo(
    () => scheduleSlots.map((slot) => ({ ...slot, status: getSlotStatus(slot, effectiveNow) })),
    [effectiveNow],
  );
  const minutesSinceMidnight = (effectiveNow - dayStart) / 60_000;
  const nowOffsetPx = (minutesSinceMidnight / 30) * SLOT_PX;

  const liveSlots = slotsWithStatus.filter((s) => s.status === "live");
  // One upcoming slot per channel, in channel order, capped at 6
  const upcomingSlots = channels
    .map((ch) => slotsWithStatus.find((s) => s.channelId === ch.id && s.status === "upcoming"))
    .filter((s): s is typeof slotsWithStatus[number] => s !== undefined)
    .slice(0, 6);
  // When nothing is live (e.g. before 6 AM or past midnight), fall back to the
  // nearest upcoming slot per channel so the "On Now" section is never blank.
  const onNowSlots = liveSlots.length > 0
    ? liveSlots
    : channels
        .map((ch) => slotsWithStatus.find((s) => s.channelId === ch.id && s.status === "upcoming"))
        .filter((s): s is typeof slotsWithStatus[number] => s !== undefined)
        .slice(0, 3);

  return (
    <AppShell wide>
      {/* Hero strip */}
      <div className="relative -mx-3 lg:-mx-8 -mt-3 lg:-mt-8 mb-6 px-5 sm:px-10 py-8 sm:py-10 overflow-hidden rounded-b-[28px] liquid-glass border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_20%_30%,oklch(0.82_0.16_85/.18),transparent),radial-gradient(40%_60%_at_85%_70%,oklch(0.65_0.22_300/.18),transparent)]" />
        <div className="relative">
          <div className="text-[10px] tracking-[0.22em] text-primary inline-flex items-center gap-2"><Tv className="size-3" /> THE GUIDE</div>
          <h1 className="mt-2 font-display text-3xl sm:text-5xl font-black tracking-tight">What's on Trey TV.</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">A living schedule across every creator channel — live now, coming up, and all-day programming.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Filter className="size-3.5" /> Filter:</span>
        <button onClick={() => setActiveCat("All")} className={chip(activeCat === "All")}>All</button>
        {categories.map((c) => (
          <button key={c} onClick={() => setActiveCat(c)} className={chip(activeCat === c)}>{c}</button>
        ))}
        <span className="ml-auto text-[11px] text-muted-foreground" suppressHydrationWarning>
          {new Date(effectiveNow).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
        </span>
      </div>

      {/* Featured channel strip */}
      <div className="mb-6 overflow-x-auto no-scrollbar -mx-3 lg:-mx-0 px-3 lg:px-0">
        <div className="flex gap-2 min-w-max">
          {channels.map((c) => {
            const active = activeChannels.has(c.id);
            return (
              <button
                key={c.id}
                onClick={() => setActiveChannels((s) => { const n = new Set(s); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n; })}
                className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-2xl border transition ${active ? "border-primary bg-primary/10 text-primary" : "border-white/10 hover:border-white/30"}`}
              >
                <img src={c.avatar} alt="" className="size-7 rounded-full object-cover" />
                <span className="text-xs font-semibold">{c.name}</span>
              </button>
            );
          })}
          {activeChannels.size > 0 && (
            <button onClick={() => setActiveChannels(new Set())} className="shrink-0 px-3 py-2 rounded-2xl text-xs text-muted-foreground hover:text-foreground">Clear</button>
          )}
        </div>
      </div>

      {/* On Now */}
      <Section title="On Now" icon={Radio} accent="red">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {onNowSlots.map((s) => (
            <NowCard key={s.episodeId + s.startsAt} slot={s} isStartingSoon={liveSlots.length === 0} onClick={() => setOpenSlot(s)} />
          ))}
          {onNowSlots.length === 0 && <div className="text-sm text-muted-foreground">Nothing scheduled right now. Check back later ↓</div>}
        </div>
      </Section>

      {/* Coming up */}
      <Section title="Coming Up Next" icon={ChevronRight}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {upcomingSlots.map((s) => <UpcomingCard key={s.episodeId + s.startsAt} slot={s} onClick={() => setOpenSlot(s)} />)}
        </div>
      </Section>

      {/* GRID — desktop/tablet */}
      <Section title="Today's Schedule" icon={Tv}>
        <div className="hidden md:block rounded-3xl liquid-glass neon-border overflow-hidden">
          <div className="grid" style={{ gridTemplateColumns: "200px 1fr" }}>
            {/* Time header */}
            <div className="bg-black/30 border-b border-white/10" />
            <div className="overflow-x-auto no-scrollbar border-b border-white/10 bg-black/30">
              <div className="relative" style={{ width: 48 * SLOT_PX }}>
                <div className="flex">
                  {Array.from({ length: 48 }, (_, i) => {
                    const hour = Math.floor(i / 2);
                    const half = i % 2 === 0 ? "00" : "30";
                    return (
                      <div key={i} style={{ width: SLOT_PX }} className="px-2 py-2 text-[10px] tracking-widest text-muted-foreground border-r border-white/5">
                        {String(hour).padStart(2, "0")}:{half}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Channel rows */}
            {filteredChannels.map((c) => {
              const slots = slotsWithStatus.filter((s) => s.channelId === c.id);
              return (
                <RowFragment key={c.id} channel={c} slots={slots} nowOffsetPx={nowOffsetPx} onSlotClick={setOpenSlot} />
              );
            })}
          </div>
        </div>

        {/* Mobile stacked view */}
        <div className="md:hidden space-y-3">
          {filteredChannels.map((c) => {
            const slots = slotsWithStatus.filter((s) => s.channelId === c.id).slice(0, 6);
            return (
              <div key={c.id} className="rounded-2xl liquid-glass border border-white/10 p-3">
                <div className="flex items-center gap-3 mb-2">
                  <img src={c.avatar} className="size-9 rounded-full object-cover" alt="" />
                  <div className="min-w-0">
                    <div className="text-sm font-bold truncate inline-flex items-center gap-1">
                      {c.name}
                      {c.verified && <Crown className="size-3 text-primary" />}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{c.category} · {c.followers}</div>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {slots.map((s) => {
                    const ep = episodeById(s.episodeId)!;
                    const start = new Date(s.startsAt);
                    return (
                      <li key={s.startsAt}>
                        <button onClick={() => setOpenSlot(s)} className="w-full flex items-center gap-3 text-left p-2 rounded-xl hover:bg-white/5">
                          <div className="text-[11px] font-mono text-muted-foreground w-12 shrink-0">
                            {String(start.getHours()).padStart(2,"0")}:{String(start.getMinutes()).padStart(2,"0")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate">{ep.title}</div>
                            <div className="text-[11px] text-muted-foreground truncate">S{ep.season}E{ep.number} · {ep.duration}m</div>
                          </div>
                          <SlotBadges slot={s} ep={ep} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      {openSlot && <SlotSheet slot={openSlot} open onClose={() => setOpenSlot(null)} />}
    </AppShell>
  );
}

function chip(active: boolean) {
  return `px-3 py-1.5 rounded-full text-xs font-semibold border transition ${active ? "border-primary bg-primary/15 text-primary" : "border-white/10 text-muted-foreground hover:text-foreground hover:border-white/30"}`;
}

function Section({ title, icon: Icon, accent, children }: { title: string; icon: typeof Tv; accent?: "red"; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 mb-3 px-1">
        <Icon className={`size-4 ${accent === "red" ? "text-[oklch(0.65_0.24_15)]" : "text-primary"}`} />
        {title}
      </h2>
      {children}
    </section>
  );
}

function RowFragment({ channel, slots, nowOffsetPx, onSlotClick }: { channel: typeof channels[number]; slots: ScheduleSlot[]; nowOffsetPx: number; onSlotClick: (s: ScheduleSlot) => void }) {
  const dayStart = (() => {
    const d = slots[0]?.startsAt ? new Date(slots[0].startsAt) : new Date();
    d.setHours(0,0,0,0);
    return d.getTime();
  })();
  return (
    <>
      <div className="bg-black/20 border-b border-r border-white/5 p-3 flex items-center gap-3 sticky left-0 z-10">
        <img src={channel.avatar} className="size-9 rounded-full object-cover" alt="" />
        <div className="min-w-0">
          <div className="text-xs font-bold truncate inline-flex items-center gap-1">{channel.name}{channel.verified && <Crown className="size-3 text-primary" />}</div>
          <div className="text-[10px] text-muted-foreground truncate">@{channel.handle}</div>
        </div>
      </div>
      <div className="relative overflow-x-auto no-scrollbar border-b border-white/5">
        <div className="relative h-20" style={{ width: 48 * SLOT_PX }}>
          {/* Now line */}
          <div className="absolute top-0 bottom-0 z-20 pointer-events-none" style={{ left: nowOffsetPx }}>
            <div className="w-px h-full bg-[oklch(0.65_0.24_15)] shadow-[0_0_12px_oklch(0.65_0.24_15)]" />
          </div>

          {slots.map((s) => {
            const start = new Date(s.startsAt).getTime();
            const end = new Date(s.endsAt).getTime();
            const left = ((start - dayStart) / 60_000 / 30) * SLOT_PX;
            const width = Math.max(80, ((end - start) / 60_000 / 30) * SLOT_PX - 4);
            const ep = episodeById(s.episodeId)!;
            const live = s.status === "live";
            const aired = s.status === "aired";
            return (
              <button
                key={s.startsAt}
                onClick={() => onSlotClick(s)}
                style={{ left, width }}
                className={`absolute top-2 bottom-2 rounded-xl text-left p-2.5 overflow-hidden transition border ${live ? "border-[oklch(0.65_0.24_15)] bg-[oklch(0.65_0.24_15/.12)] shadow-[0_0_18px_oklch(0.65_0.24_15/.4)]" : aired ? "border-white/5 bg-white/[0.02] opacity-50" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-primary/40"}`}
              >
                <div className="flex items-center gap-1 text-[10px] tracking-widest">
                  {live && <span className="text-[oklch(0.65_0.24_15)] inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-[oklch(0.65_0.24_15)] animate-glow-pulse" /> LIVE</span>}
                  {aired && <span className="text-muted-foreground">AIRED</span>}
                  {ep.premium && <span className="text-[oklch(0.7_0.25_340)] inline-flex items-center gap-1"><Lock className="size-3" /></span>}
                  {ep.isFree && ep.number <= 2 && <span className="text-primary">FREE</span>}
                </div>
                <div className="text-xs font-bold truncate mt-0.5">{ep.title}</div>
                <div className="text-[10px] text-muted-foreground truncate">S{ep.season}E{ep.number} · {ep.duration}m</div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function NowCard({ slot, onClick, isStartingSoon }: { slot: ScheduleSlot; onClick: () => void; isStartingSoon?: boolean }) {
  const ep = episodeById(slot.episodeId)!;
  const ch = channelById(slot.channelId)!;
  const start = new Date(slot.startsAt);
  return (
    <button onClick={onClick} className="text-left rounded-2xl liquid-glass border border-[oklch(0.65_0.24_15/.6)] p-3 hover:bg-white/5 group">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img src={ch.avatar} className="size-12 rounded-full object-cover" alt="" />
          {!isStartingSoon && <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-[oklch(0.65_0.24_15)] ring-2 ring-background animate-glow-pulse" />}
        </div>
        <div className="min-w-0 flex-1">
          {isStartingSoon ? (
            <div className="text-[10px] tracking-widest text-muted-foreground inline-flex items-center gap-1">
              <ChevronRight className="size-3" /> STARTS {start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </div>
          ) : (
            <div className="text-[10px] tracking-widest text-[oklch(0.65_0.24_15)] inline-flex items-center gap-1"><Radio className="size-3" /> LIVE NOW</div>
          )}
          <div className="text-sm font-bold truncate">{ep.title}</div>
          <div className="text-[11px] text-muted-foreground truncate">{ch.name} · S{ep.season}E{ep.number}</div>
        </div>
        <Play className="size-5 text-primary opacity-0 group-hover:opacity-100 transition" />
      </div>
    </button>
  );
}

function UpcomingCard({ slot, onClick }: { slot: ScheduleSlot; onClick: () => void }) {
  const ep = episodeById(slot.episodeId)!;
  const ch = channelById(slot.channelId)!;
  const start = new Date(slot.startsAt);
  return (
    <button onClick={onClick} className="text-left rounded-2xl liquid-glass border border-white/10 p-3 hover:bg-white/5">
      <div className="flex items-center gap-3">
        <img src={ch.avatar} className="size-12 rounded-full object-cover" alt="" />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] tracking-widest text-muted-foreground">{start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</div>
          <div className="text-sm font-bold truncate">{ep.title}</div>
          <div className="text-[11px] text-muted-foreground truncate">{ch.name} · {ep.duration}m</div>
        </div>
        <SlotBadges slot={slot} ep={ep} />
      </div>
    </button>
  );
}

function SlotBadges({ slot, ep }: { slot: ScheduleSlot; ep: NonNullable<ReturnType<typeof episodeById>> }) {
  const { has } = useGuide();
  return (
    <div className="flex flex-col gap-1 items-end shrink-0">
      {ep.premium && <span className="text-[9px] inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-[oklch(0.7_0.25_340)] text-[oklch(0.7_0.25_340)]"><Lock className="size-2.5" />PREMIUM</span>}
      {ep.isFree && ep.number <= 2 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-bold">FREE</span>}
      {has("saved", ep.id) && <span className="text-[9px] inline-flex items-center gap-1 text-primary"><Check className="size-2.5" />Saved</span>}
      {has("reminders", ep.id) && <span className="text-[9px] inline-flex items-center gap-1 text-[oklch(0.82_0.15_215)]"><Bell className="size-2.5" />Reminded</span>}
      {slot.status === "aired" && <span className="text-[9px] text-muted-foreground">Aired</span>}
    </div>
  );
}

function SlotSheet({ slot, open, onClose }: { slot: ScheduleSlot; open: boolean; onClose: () => void }) {
  const ep = episodeById(slot.episodeId)!;
  const ch = channelById(slot.channelId)!;
  const { has, toggle } = useGuide();
  const start = new Date(slot.startsAt);

  const action = (label: string, key: Parameters<typeof toggle>[0], icon: any) => {
    const Icon = icon;
    const active = has(key, ep.id);
    return (
      <button
        onClick={() => { toggle(key, ep.id); toast(active ? `Removed from ${label}` : `Added to ${label}`); }}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition ${active ? "border-primary bg-primary/10 text-primary" : "border-white/10 hover:border-white/30"}`}
      >
        <Icon className="size-4" />
        <span className="text-sm font-semibold">{active ? `${label} ✓` : label}</span>
      </button>
    );
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="bg-background">
        <DrawerHeader className="text-left">
          <div className="flex items-center gap-3">
            <img src={ch.avatar} className="size-12 rounded-full object-cover" alt="" />
            <div className="min-w-0">
              <DrawerTitle className="truncate">{ep.title}</DrawerTitle>
              <DrawerDescription className="truncate">{ch.name} · S{ep.season}E{ep.number} · {ep.duration}m · {start.toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" })}</DrawerDescription>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {ep.isFree && ep.number <= 2 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold">FREE EP {ep.number}</span>}
            {ep.premium && <span className="text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[oklch(0.7_0.25_340)] text-[oklch(0.7_0.25_340)]"><Lock className="size-3" />PREMIUM</span>}
            {slot.status === "live" && <span className="text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[oklch(0.65_0.24_15/.15)] border border-[oklch(0.65_0.24_15)] text-[oklch(0.65_0.24_15)]"><Radio className="size-3" />LIVE NOW</span>}
            {slot.status === "upcoming" && <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/15 text-muted-foreground">Upcoming</span>}
            {slot.status === "aired" && <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/15 text-muted-foreground">Aired</span>}
          </div>
        </DrawerHeader>

        <div className="px-4 pb-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Link to="/watch/$id" params={{ id: ep.id }} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground font-bold glow-gold">
            <Play className="size-4 fill-current" /> Watch
          </Link>
          {action("Saved", "saved", BookmarkPlus)}
          {action("Watch Later", "watchLater", Play)}
          {action("My Schedule", "mySchedule", CalendarPlus)}
          {action("Reminder", "reminders", Bell)}
          <Link
            to="/channel/$handle"
            params={{ handle: ch.handle }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 hover:border-white/30 transition"
          >
            <Crown className="size-4" />
            <span className="text-sm font-semibold">Open Creator</span>
          </Link>
        </div>

        <DrawerFooter>
          <button onClick={onClose} className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/10 text-sm font-semibold">Close</button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
