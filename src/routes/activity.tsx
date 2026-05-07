import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Bookmark, Heart, Send, Eye, Trash2, Filter, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { useActivity, REACTIONS, type ActivityItem } from "@/lib/activity-store";
import { posts } from "@/lib/mock-data";

export const Route = createFileRoute("/activity")({
  component: Activity,
  head: () => ({
    meta: [
      { title: "My Activity — Trey TV" },
      { name: "description", content: "Your interaction history: bookmarks, reactions, shares." },
    ],
  }),
});

const FILTERS = ["All", "Reactions", "Saves", "Shares"] as const;

function Activity() {
  const { activity, reactions, saves, clear } = useActivity();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const reactionCount = Object.values(reactions).filter(Boolean).length;
  const saveCount = Object.values(saves).filter(Boolean).length;
  const shareCount = activity.filter((a) => a.type === "share").length;

  const filtered = activity.filter((a) =>
    filter === "All" ? true :
    filter === "Reactions" ? a.type === "react" :
    filter === "Saves" ? a.type === "save" :
    a.type === "share"
  );

  return (
    <AppShell wide>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Link to="/" className="size-9 grid place-items-center rounded-full liquid-glass border border-white/10"><ArrowLeft className="size-4" /></Link>
          <div className="text-center">
            <div className="text-[10px] tracking-[0.3em] text-primary">YOUR JOURNEY</div>
            <h1 className="text-lg font-bold">Activity</h1>
          </div>
          <button onClick={() => { clear(); toast("Activity cleared"); }} className="size-9 grid place-items-center rounded-full liquid-glass border border-white/10" aria-label="clear">
            <Trash2 className="size-4" />
          </button>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Reactions", value: reactionCount, Icon: Heart, color: "oklch(0.7 0.25 340)" },
            { label: "Saves", value: saveCount, Icon: Bookmark, color: "oklch(0.82 0.16 85)" },
            { label: "Shares", value: shareCount, Icon: Send, color: "oklch(0.82 0.15 215)" },
            { label: "Watched", value: 24, Icon: Eye, color: "oklch(0.65 0.22 300)" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl liquid-glass border border-white/10 p-3">
              <div className="size-8 rounded-lg grid place-items-center mb-2" style={{ background: `color-mix(in oklab, ${s.color} 18%, transparent)`, color: s.color }}>
                <s.Icon className="size-4" />
              </div>
              <div className="text-lg font-bold">{s.value}</div>
              <div className="text-[10px] tracking-wider text-muted-foreground">{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Filter className="size-4 text-muted-foreground shrink-0" />
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`shrink-0 px-3 h-8 rounded-full text-xs font-semibold transition border ${filter === f ? "bg-primary text-primary-foreground border-transparent glow-gold" : "liquid-glass border-white/10 text-muted-foreground hover:text-foreground"}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Currently saved */}
        {saveCount > 0 && (
          <section className="rounded-3xl liquid-glass border border-white/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold flex items-center gap-2"><Bookmark className="size-4 text-primary" /> Saved bookmarks</h2>
              <Link to="/collections" className="text-xs text-primary hover:underline">Open collections</Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {posts.filter((p) => saves[p.id]).map((p) => (
                <div key={p.id} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10">
                  <img src={p.media} className="size-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 text-[10px] truncate">{p.creator.name}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Activity feed */}
        <section className="rounded-3xl liquid-glass border border-white/10 p-5">
          <h2 className="font-bold flex items-center gap-2 mb-3"><Sparkles className="size-4 text-primary" /> Recent activity</h2>
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Nothing here yet — start reacting and saving content from your feed.
              <div className="mt-4">
                <Link to="/" className="px-4 h-9 inline-flex items-center rounded-full bg-primary text-primary-foreground text-xs font-semibold glow-gold">Open feed</Link>
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((a) => <Row key={a.id} a={a} />)}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Row({ a }: { a: ActivityItem }) {
  const r = a.reaction ? REACTIONS.find((x) => x.key === a.reaction) : null;
  const Icon = a.type === "save" ? Bookmark : a.type === "share" ? Send : Heart;
  return (
    <li className="flex items-center gap-3 p-3 rounded-2xl glass border border-white/10">
      {a.thumb ? <img src={a.thumb} className="size-12 rounded-xl object-cover" alt="" />
       : <div className="size-12 rounded-xl bg-white/5 grid place-items-center"><Icon className="size-5 text-muted-foreground" /></div>}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate flex items-center gap-2">
          {r && <span className="text-base">{r.emoji}</span>}
          {a.type === "react" ? `Reacted ${r?.label ?? ""} on ${a.title}` : a.type === "save" ? `Saved ${a.title}` : `Shared ${a.title}`}
        </div>
        <div className="text-[11px] text-muted-foreground truncate">@{a.creator} · {timeAgo(a.ts)}</div>
      </div>
    </li>
  );
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
