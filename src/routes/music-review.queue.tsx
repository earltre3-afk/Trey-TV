import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Crown, Flame, ListOrdered, Music2, Radio, Sparkles, Zap, Rocket, ArrowLeft,
  Star, Trophy,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth";
import { useMusicReview, TIER_META, type Submission, type Tier } from "@/lib/music-review-store";

type QueueSearch = { mine?: string };

export const Route = createFileRoute("/music-review/queue")({
  component: QueuePage,
  validateSearch: (s: Record<string, unknown>): QueueSearch => ({
    mine: typeof s.mine === "string" ? s.mine : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Live Queue · Trey TV Music Review" },
      { name: "description", content: "See who's on deck for live music review on Trey TV." },
    ],
  }),
});

const TIER_ICON: Record<Tier, typeof Music2> = {
  regular: Music2, skip: Zap, super: Rocket, turbo: Crown,
};

function QueuePage() {
  const { user } = useAuth();
  const { publicQueue, topThree, positionOf } = useMusicReview();
  const { mine } = useSearch({ from: Route.id });
  const queue = publicQueue();
  const top = topThree();

  const myPos = mine ? positionOf(mine) : 0;

  return (
    <AppShell wide>
      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <Link to="/" className="size-9 grid place-items-center rounded-full liquid-glass border border-white/10">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="text-[10px] tracking-[0.22em] text-muted-foreground">LIVE QUEUE</div>
          <Link to="/music-review" className="px-3 h-9 rounded-full bg-primary text-primary-foreground text-xs font-bold glow-gold inline-flex items-center gap-1.5">
            <Radio className="size-3.5" /> Submit
          </Link>
        </div>

        {/* Hero */}
        <div className="rounded-[28px] liquid-glass neon-border p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_30%_30%,oklch(0.7_0.25_340/0.15),transparent)]" />
          <div className="relative grid lg:grid-cols-[1fr_auto] gap-5 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-white/15 text-[10px] tracking-[0.22em]">
                <span className="size-1.5 rounded-full bg-[oklch(0.65_0.24_15)] animate-glow-pulse" /> ON AIR
              </div>
              <h1 className="font-display mt-3 text-3xl sm:text-5xl font-black bg-gradient-to-r from-white via-white/85 to-white/65 bg-clip-text text-transparent">
                Trey TV · Live Music Review
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-lg">{queue.length} song{queue.length === 1 ? "" : "s"} on deck. Reviews going live on TikTok.</p>
            </div>
            {mine && myPos > 0 && (
              <div className="rounded-2xl bg-primary/15 border border-primary/40 p-4 text-center">
                <div className="text-[10px] tracking-[0.22em] text-primary">YOUR POSITION</div>
                <div className="font-display text-5xl font-black bg-gradient-to-b from-[oklch(0.86_0.17_90)] to-[oklch(0.7_0.18_60)] bg-clip-text text-transparent">#{myPos}</div>
                <div className="text-[11px] text-muted-foreground">in the live queue</div>
              </div>
            )}
          </div>
        </div>

        {/* Top 3 of the day */}
        {top.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="size-4 text-primary" />
              <h2 className="text-lg font-black tracking-tight">Top 3 of the day</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {top.map((s, i) => (
                <div key={s.id} className="rounded-2xl liquid-glass neon-border p-4">
                  <div className="text-[10px] tracking-[0.22em] text-primary">#{i + 1}</div>
                  <div className="mt-1 text-base font-black">{s.title}</div>
                  <div className="text-xs text-muted-foreground">{s.artist}</div>
                  {s.review && <div className="mt-2 text-[11px] text-[oklch(0.78_0.18_150)]">{s.review.score}/10 · reviewed</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Queue list */}
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <ListOrdered className="size-4" />
            <h2 className="text-lg font-black tracking-tight">On deck</h2>
          </div>
          {queue.length === 0 ? (
            <div className="rounded-2xl liquid-glass border border-white/10 p-10 text-center">
              <Music2 className="size-8 mx-auto text-muted-foreground" />
              <div className="mt-3 text-sm font-bold">Queue is empty</div>
              <div className="text-xs text-muted-foreground mt-1">Be the first to drop a track.</div>
              <Link to="/music-review" className="mt-4 inline-flex px-4 h-10 rounded-xl bg-primary text-primary-foreground font-bold glow-gold items-center gap-2">
                <Radio className="size-4" /> Submit a song
              </Link>
            </div>
          ) : (
            <ol className="space-y-2">
              {queue.map((s, i) => (
                <QueueRow key={s.id} sub={s} index={i + 1} highlight={s.id === mine} mineUid={user?.uid} />
              ))}
            </ol>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function QueueRow({ sub, index, highlight, mineUid }: { sub: Submission; index: number; highlight?: boolean; mineUid?: string }) {
  const t = TIER_META[sub.tier];
  const Icon = TIER_ICON[sub.tier];
  const isNow = sub.status === "now_playing";
  const isMine = mineUid && sub.userUid === mineUid;
  const masked = isMine ? sub.userName : sub.userName.replace(/(?<=.{2}).(?=.)/g, "•");
  return (
    <li className={`relative rounded-2xl liquid-glass border p-3 sm:p-4 flex items-center gap-3 transition-all ${highlight ? "ring-2 ring-primary glow-gold" : "border-white/10"} ${isNow ? "bg-[oklch(0.65_0.24_15/0.06)]" : ""}`}>
      <div className={`size-12 sm:size-14 rounded-xl grid place-items-center font-display font-black text-lg ${isNow ? "bg-[oklch(0.65_0.24_15/0.2)] text-[oklch(0.85_0.18_15)]" : "bg-white/5"}`}>
        {isNow ? <span className="flex items-center gap-1 text-[10px] tracking-widest"><span className="size-1.5 rounded-full bg-[oklch(0.65_0.24_15)] animate-glow-pulse" /> LIVE</span> : `#${index}`}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-sm sm:text-base font-bold truncate">{sub.title}</div>
          {sub.tier !== "regular" && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${t.color}`} style={{ borderColor: "currentColor" }}>
              <Icon className="size-3" /> {t.label}
            </span>
          )}
          {sub.topOfDay && <span className="inline-flex items-center gap-1 text-[10px] text-primary"><Star className="size-3" /> Top 3</span>}
        </div>
        <div className="text-xs text-muted-foreground truncate">{sub.artist} · {sub.genre} · {masked}</div>
      </div>
      {sub.aiFirstImpression && (
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground">
          <Flame className="size-3 text-[oklch(0.7_0.25_340)]" /> {sub.aiFirstImpression.hypeScore}/10
        </div>
      )}
    </li>
  );
}
