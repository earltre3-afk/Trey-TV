import React, { useState } from 'react';
import { Play, Swords, Check, Crown, MessageCircle, ChevronDown, Share2, Radio } from 'lucide-react';
import { useSongWars } from '../../../contexts/SongWarsContext';
import CommentThread from './CommentThread';
import ContestantProfileSheet from './ContestantProfileSheet';
import { battleShareText, type SongWar, type Contestant } from '../../../data/mockData';
import { shareReference } from '../../../lib/share';

interface Props {
  war: SongWar;
  onPlay: (c: Contestant) => void;
  highlight?: boolean;
  defaultOpenComments?: boolean;
  onEnterArena?: (warId: string) => void;
}

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;
}

export default function BattleCard({ war, onPlay, highlight, defaultOpenComments, onEnterArena }: Props) {
  const { vote, votedSide, voteCount, leader, commentsFor } = useSongWars();
  const [openComments, setOpenComments] = useState(!!defaultOpenComments);
  const [profile, setProfile] = useState<Contestant | undefined>(undefined);

  const lv = voteCount(war.id, 'left');
  const rv = voteCount(war.id, 'right');
  const total = lv + rv || 1;
  const leftPct = Math.round((lv / total) * 100);
  const rightPct = 100 - leftPct;
  const winner = leader(war);
  const voted = votedSide(war.id);
  const isLive = war.status === 'active';
  const isDone = war.status === 'completed';
  const commentCount = commentsFor(war.id).length;

  const Side = ({ c, side, pct }: { c: Contestant; side: 'left' | 'right'; pct: number }) => {
    const picked = voted === side;
    const winning = winner === side;
    return (
      <div className="flex-1 flex flex-col items-center text-center">
        <div className="relative">
          {/* gold ring + glow */}
          <div
            className={`absolute -inset-1 rounded-full ${
              winning
                ? 'bg-gradient-to-tr from-fuchsia-400 via-pink-300 to-cyan-300 opacity-80 blur-[2px]'
                : 'bg-white/5'
            }`}
          />
          <button
            onClick={() => setProfile(c)}
            className="relative block rounded-full active:scale-95 transition"
            aria-label={`Open ${c.name} profile`}
          >
            <img
              src={c.image}
              alt={c.name}
              className="relative w-24 h-24 rounded-full object-cover border-2 border-black/40"
            />
          </button>
          {isDone && winning && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-black/70 border border-fuchsia-400/40 flex items-center justify-center">
              <Crown className="w-4 h-4 text-fuchsia-300" fill="currentColor" />
            </span>
          )}
          <button
            onClick={() => onPlay(c)}
            className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-300 text-black flex items-center justify-center shadow-lg shadow-fuchsia-500/30 active:scale-90 transition"
            aria-label={`Play ${c.track}`}
          >
            <Play className="w-4 h-4" fill="currentColor" />
          </button>
        </div>
        <button
          onClick={() => setProfile(c)}
          className="text-white font-extrabold text-sm mt-3 leading-tight hover:text-fuchsia-200 transition inline-flex items-center gap-1"
        >
          {c.name}
        </button>
        <p className="text-white/40 text-[10px] tracking-wide">{c.role} • {c.track}</p>
        <p className={`font-black text-2xl mt-1.5 ${winning ? 'text-fuchsia-300' : 'text-white/80'}`}>{pct}%</p>
        <p className="text-white/35 text-[10px]">{fmt(side === 'left' ? lv : rv)} votes</p>

        {!isDone && (
          <button
            onClick={() => vote(war.id, side)}
            disabled={!!voted}
            className={`mt-2.5 w-full text-xs font-bold py-2 rounded-full transition active:scale-95 ${
              picked
                ? 'bg-gradient-to-r from-fuchsia-400 to-cyan-300 text-black shadow-lg shadow-fuchsia-500/30'
                : voted
                ? 'bg-white/5 text-white/40'
                : 'bg-white/[0.07] text-white border border-fuchsia-400/40 hover:bg-amber-400/15'
            }`}
          >
            {picked ? (
              <span className="inline-flex items-center gap-1 justify-center">
                <Check className="w-3.5 h-3.5" /> Voted
              </span>
            ) : (
              'Vote'
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <div
      className={`relative rounded-[28px] overflow-hidden p-5 transition ${
        highlight
          ? 'border-2 border-fuchsia-400/60 shadow-[0_0_50px_-8px_rgba(217,70,239,0.55)]'
          : 'border border-fuchsia-400/15'
      }`}
    >
      {/* cinematic stage background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1224] via-slate-950 to-black" />
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-fuchsia-500/20 blur-[70px]" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cyan-500/10 to-transparent" />

      <div className="relative">
        {/* header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold tracking-[0.2em] tradio-chrome">{war.type.toUpperCase()}</span>
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold shadow-lg shadow-red-600/30">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
              </span>
            ) : (
              <span className="text-[10px] text-white/45">{war.schedule}</span>
            )}
            <button
              onClick={() => shareReference(battleShareText(war), 'Battle copied')}
              className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/70 active:scale-90 transition"
              aria-label="Share battle"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <h3 className="text-white font-black text-lg leading-tight mb-1">{war.title}</h3>
        <p className="text-fuchsia-200/60 text-[11px] mb-5 font-semibold">
          {war.hype}
          {war.vibe ? ` • Vibe: ${war.vibe}` : ''}
        </p>

        {/* versus stage */}
        <div className="flex items-stretch gap-2">
          <Side c={war.left} side="left" pct={leftPct} />
          <div className="flex flex-col items-center justify-center px-1">
            <div className="w-12 h-12 rounded-full bg-black/70 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_20px_-4px_rgba(34,211,238,0.6)]">
              <Swords className="w-6 h-6 text-cyan-300" />
            </div>
            <span className="text-cyan-300/70 text-[9px] font-black mt-1.5 tracking-[0.2em]">VS</span>
          </div>
          <Side c={war.right} side="right" pct={rightPct} />
        </div>


        {onEnterArena && isLive && (
          <button
            onClick={() => onEnterArena(war.id)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-400 to-cyan-300 px-4 py-3 text-sm font-black text-black shadow-[0_0_32px_-12px_rgba(217,70,239,0.9)] transition active:scale-[0.98]"
          >
            <Radio className="h-4 w-4" /> Open Live Arena
          </button>
        )}

        {/* battle energy meter */}
        <div className="mt-5 h-2.5 rounded-full overflow-hidden bg-white/[0.08] flex shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-fuchsia-400 to-cyan-300 transition-all duration-500"
            style={{ width: `${leftPct}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-500"
            style={{ width: `${rightPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-white/40 text-[11px] font-semibold">{fmt(lv + rv)} total votes</span>
          <button
            onClick={() => setOpenComments((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-white/70 text-[11px] font-bold active:scale-95 transition"
          >
            <MessageCircle className="w-3.5 h-3.5 text-fuchsia-300" />
            {commentCount}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${openComments ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {openComments && <CommentThread warId={war.id} />}
      </div>

      <ContestantProfileSheet
        contestant={profile}
        open={!!profile}
        onOpenChange={(o) => !o && setProfile(undefined)}
        onPlay={(c) => {
          setProfile(undefined);
          onPlay(c);
        }}
      />
    </div>
  );
}
