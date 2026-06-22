import React from "react";
import {
  Share2, Settings, Disc3, Rocket, Swords, Heart, Play, Music, Crown,
  Star, Flame, TrendingUp, ChevronRight, BadgeCheck, Radio, ListMusic,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useTradioIdentity } from "@/tradio/contexts/TradioIdentityContext";
import { useReleases, statusOf, type Release } from "@/tradio/lib/releases";
import { useSaved } from "@/contexts/SavedContext";
import { usePlayer } from "@/contexts/PlayerContext";

/**
 * Tradio "My Profile" — the artist's own profile, structured like Trance's My Profile:
 * hero → tier + level → stat strip → two-card rows (releases / liked, recent / spotlight)
 * → entry points. Wired to real Tradio data (releases, saved, identity).
 */
interface Props {
  onRelease?: () => void;
  onSongWars?: () => void;
  onBrowse?: () => void;
}

export default function MyProfileScreen({ onRelease, onSongWars, onBrowse }: Props) {
  const navigate = useNavigate();
  const { identity, role } = useTradioIdentity() as any;
  const { releases, live, scheduled } = useReleases();
  const { savedTracks, savedPlaylists, createdPlaylists, recentlyPlayed } = useSaved() as any;
  const { playTrack } = usePlayer() as any;

  const name = identity?.displayName || "Tradio Artist";
  const handle = identity?.username ? `@${identity.username}` : "@you";
  const avatar = identity?.avatarUrl || "";
  const roleLabel = ({ artist: "Tradio Artist", producer: "Producer", dj: "DJ", fan: "Listener", admin: "Admin" } as any)[role] || "Tradio Artist";

  const playlistCount = (savedPlaylists?.length || 0) + (createdPlaylists?.length || 0);
  // Listener "level" derived from real activity (releases + saves) so it grows as you create.
  const xp = live.length * 250 + (savedTracks?.length || 0) * 20 + recentlyPlayed.length * 5;
  const level = Math.max(1, Math.floor(xp / 500) + 1);
  const xpToNext = level * 500;

  const playRelease = (r: Release) =>
    playTrack?.({ id: r.id, title: r.title, artist: r.artist, artwork: r.artwork, src: r.src });

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-4">
      {/* top bar */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2 text-amber-300">
          <Radio className="w-5 h-5" />
          <span className="text-sm font-black uppercase tracking-[0.2em]">My Profile</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full border border-white/15 bg-white/5 grid place-items-center text-white/70 active:scale-90 transition" aria-label="Share">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-full border border-white/15 bg-white/5 grid place-items-center text-white/70 active:scale-90 transition" aria-label="Settings">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* hero */}
      <div className="px-5">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08]">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/30 via-amber-500/15 to-cyan-500/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="relative p-4 flex items-end gap-3">
            {avatar ? (
              <img src={avatar} alt={name} className="w-20 h-20 rounded-2xl object-cover border border-white/15 shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-black/40 border border-white/15 grid place-items-center shrink-0">
                <Disc3 className="w-9 h-9 text-amber-300" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 border border-amber-400/40 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-amber-200">
                <BadgeCheck className="w-3 h-3" /> {roleLabel}
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                <h1 className="text-2xl font-black text-white uppercase truncate">{name}</h1>
              </div>
              <div className="text-amber-300/90 font-bold text-sm">{handle}</div>
            </div>
          </div>
        </div>
      </div>

      {/* tier + level */}
      <div className="px-5 mt-3 grid grid-cols-2 gap-3">
        <div className="tradio-glass rounded-2xl p-3 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400/30 to-orange-600/20 border border-amber-400/50 grid place-items-center shrink-0">
            <Crown className="w-5 h-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-black text-white uppercase leading-none">{roleLabel}</div>
            <div className="text-[10px] text-amber-300/80 mt-0.5">Verified on Tradio</div>
          </div>
        </div>
        <div className="tradio-glass rounded-2xl p-3 flex items-center gap-3">
          <div className="min-w-0">
            <div className="text-[9px] text-white/45 uppercase">Artist Level</div>
            <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-cyan-300 leading-none">LV. {level}</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-[9px] text-white/45 uppercase">XP</div>
            <div className="text-sm font-black text-white">{xp}</div>
            <div className="mt-1 h-1.5 w-16 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-300 to-cyan-300" style={{ width: `${Math.min(100, (xp / xpToNext) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* stat strip */}
      <div className="px-5 mt-3">
        <div className="tradio-glass rounded-2xl p-3 grid grid-cols-4 divide-x divide-white/10">
          {([
            [Rocket, live.length, "Releases", "text-amber-300"],
            [Heart, savedTracks?.length || 0, "Liked", "text-fuchsia-300"],
            [ListMusic, playlistCount, "Playlists", "text-cyan-300"],
            [TrendingUp, scheduled.length, "Scheduled", "text-emerald-300"],
          ] as [any, any, string, string][]).map(([Icon, v, l, c], i) => (
            <div key={i} className="flex flex-col items-center">
              <Icon className={`w-4 h-4 mb-1 ${c}`} />
              <div className="text-lg font-black text-white leading-none">{v}</div>
              <div className="text-[8px] text-white/45 uppercase mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* releases + liked */}
      <div className="px-5 mt-3 grid grid-cols-1 gap-3">
        <ProfileCard title="Your Releases" accent="text-amber-300" onSeeAll={onRelease} seeAllLabel="Release +">
          {releases.length === 0 ? (
            <Empty icon={Disc3} text="No releases yet — drop your first track." action="Release music" onAction={onRelease} />
          ) : (
            <div className="space-y-2">
              {releases.slice(0, 4).map((r) => {
                const st = statusOf(r);
                return (
                  <Row key={r.id} img={r.artwork} title={r.title} sub={r.artist}
                    right={st === "live"
                      ? <span className="inline-flex items-center gap-1 rounded-full bg-red-500/90 px-2 py-0.5 text-[9px] font-black text-white"><span className="size-1.5 rounded-full bg-white animate-pulse" /> LIVE</span>
                      : <span className="rounded-full bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-[9px] font-black text-amber-200">SCHEDULED</span>}
                    onPlay={st === "live" ? () => playRelease(r) : undefined} />
                );
              })}
            </div>
          )}
        </ProfileCard>

        <ProfileCard title="Liked Music" accent="text-fuchsia-300" onSeeAll={onBrowse} seeAllLabel="Browse">
          {(!savedTracks || savedTracks.length === 0) ? (
            <Empty icon={Heart} text="Songs you like across Tradio show up here." />
          ) : (
            <div className="space-y-2">
              {savedTracks.slice(0, 4).map((t: any) => (
                <Row key={t.id} img={t.artwork || t.coverUrl} title={t.title} sub={t.artist || "Tradio"}
                  onPlay={() => playTrack?.(t)} />
              ))}
            </div>
          )}
        </ProfileCard>
      </div>

      {/* recently played + spotlight */}
      <div className="px-5 mt-3 grid grid-cols-1 gap-3">
        <ProfileCard title="Recently Played" accent="text-cyan-300">
          {recentlyPlayed.length === 0 ? (
            <Empty icon={Music} text="Your recent plays will appear here." />
          ) : (
            <div className="space-y-2">
              {recentlyPlayed.slice(0, 4).map((t: any, i: number) => (
                <Row key={(t.id || "") + i} img={t.artwork || t.coverUrl} title={t.title} sub={t.artist || "Tradio"} onPlay={() => playTrack?.(t)} />
              ))}
            </div>
          )}
        </ProfileCard>

        <div className="tradio-glass rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-amber-300 fill-amber-300/40" />
            <h3 className="font-black text-amber-300 uppercase text-sm">Spotlight</h3>
          </div>
          <h2 className="text-2xl font-black text-white">Go head-to-head</h2>
          <p className="text-xs text-white/55 mb-3">Enter Song Wars and battle another Tradio artist.</p>
          <button onClick={onSongWars}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-amber-400 px-4 py-2 text-sm font-black text-black active:scale-95 transition">
            <Swords className="w-4 h-4" /> Enter Song Wars
          </button>
        </div>
      </div>

      {/* entry points */}
      <div className="px-5 mt-3 grid grid-cols-3 gap-2">
        <EntryBtn icon={Disc3} label="Studio" color="#22d3ee" onClick={() => navigate({ to: "/tradio/studio" })} />
        <EntryBtn icon={Rocket} label="Release" color="#fbbf24" onClick={onRelease} />
        <EntryBtn icon={Swords} label="Song Wars" color="#d946ef" onClick={onSongWars} />
      </div>
    </div>
  );
}

function ProfileCard({ title, accent, children, onSeeAll, seeAllLabel }: { title: string; accent: string; children: React.ReactNode; onSeeAll?: () => void; seeAllLabel?: string }) {
  return (
    <div className="tradio-glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-black uppercase text-sm ${accent}`}>{title}</h3>
        {onSeeAll && (
          <button onClick={onSeeAll} className="text-[11px] font-bold text-white/55 flex items-center gap-0.5 active:opacity-70">
            {seeAllLabel || "View all"} <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Row({ img, title, sub, right, onPlay }: { img?: string; title: string; sub: string; right?: React.ReactNode; onPlay?: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-2">
      {img ? <img src={img} alt={title} className="w-11 h-11 rounded-lg object-cover shrink-0" /> : <div className="w-11 h-11 rounded-lg bg-black/40 grid place-items-center shrink-0"><Music className="w-4 h-4 text-white/40" /></div>}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-white">{title}</div>
        <div className="truncate text-xs text-white/45">{sub}</div>
      </div>
      {right}
      {onPlay && (
        <button onClick={onPlay} aria-label="Play" className="w-9 h-9 rounded-full bg-white grid place-items-center shrink-0 active:scale-90 transition">
          <Play className="w-4 h-4 text-black translate-x-[1px]" fill="currentColor" />
        </button>
      )}
    </div>
  );
}

function Empty({ icon: Icon, text, action, onAction }: { icon: any; text: string; action?: string; onAction?: () => void }) {
  return (
    <div className="text-center py-6">
      <Icon className="w-7 h-7 mx-auto text-white/25" />
      <p className="mt-2 text-xs text-white/45">{text}</p>
      {action && onAction && (
        <button onClick={onAction} className="mt-3 rounded-full bg-amber-400/15 border border-amber-400/40 px-3 py-1.5 text-xs font-bold text-amber-200 active:scale-95 transition">{action}</button>
      )}
    </div>
  );
}

function EntryBtn({ icon: Icon, label, color, onClick }: { icon: any; label: string; color: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="rounded-2xl border border-white/10 bg-white/[0.03] py-3 flex flex-col items-center gap-1.5 active:scale-95 transition">
      <Icon className="w-5 h-5" style={{ color }} />
      <span className="text-[11px] font-black uppercase" style={{ color }}>{label}</span>
    </button>
  );
}
