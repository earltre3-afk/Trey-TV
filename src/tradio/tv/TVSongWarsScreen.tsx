import React, { useMemo, useState } from 'react';
import { CheckCircle2, Crown, Pause, Play, Radio, Swords, Trophy, Users, Vote } from 'lucide-react';
import { useSongWars } from '@/contexts/SongWarsContext';
import { usePlayer } from '@/tradio/PlayerContext';
import type { BattleSide, Contestant, SongWar } from '@/data/mockData';

function pct(value: number, total: number) {
  if (!total) return 50;
  return Math.round((value / total) * 100);
}

function ContestantPanel({
  contestant,
  side,
  selected,
  onPlay,
  onVote,
  onCheckIn,
}: {
  contestant: Contestant;
  side: BattleSide;
  selected: boolean;
  onPlay: () => void;
  onVote: () => void;
  onCheckIn: () => void;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border p-5 transition ${
        selected
          ? 'border-cyan-300 bg-cyan-300/10 shadow-[0_0_36px_rgba(34,211,238,0.35)]'
          : 'border-white/10 bg-white/[0.05]'
      }`}
    >
      <img src={contestant.image} alt={contestant.name} className="h-64 w-full rounded-3xl object-cover object-top" />
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-white/40">{side === 'left' ? 'Artist A' : 'Artist B'}</p>
          <h3 className="mt-1 text-4xl font-black text-white">{contestant.name}</h3>
          <p className="text-xl font-semibold text-white/55">{contestant.track}</p>
          <p className="mt-1 text-white/40">{contestant.wins}W / {contestant.losses}L on Song Wars</p>
        </div>
        <div className="rounded-2xl bg-white/10 px-4 py-3 text-right">
          <p className="text-3xl font-black text-white">{contestant.votes.toLocaleString()}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-white/45">base votes</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <button onClick={onPlay} className="rounded-full bg-white px-5 py-3 font-black text-black focus:outline-none focus:ring-4 focus:ring-cyan-300">
          <Play className="mr-2 inline h-5 w-5 fill-black" /> Play
        </button>
        <button onClick={onVote} className="rounded-full bg-cyan-300 px-5 py-3 font-black text-black focus:outline-none focus:ring-4 focus:ring-white">
          <Vote className="mr-2 inline h-5 w-5" /> Vote
        </button>
        <button onClick={onCheckIn} className="rounded-full border border-white/15 bg-white/10 px-5 py-3 font-black text-white focus:outline-none focus:ring-4 focus:ring-cyan-300">
          <CheckCircle2 className="mr-2 inline h-5 w-5" /> Check In
        </button>
      </div>
    </div>
  );
}

function BattleRailCard({
  war,
  active,
  onSelect,
}: {
  war: SongWar;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-[28rem] shrink-0 rounded-3xl border p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-cyan-300 ${
        active ? 'border-white bg-white text-black' : 'border-white/10 bg-white/[0.055] text-white hover:bg-white/10'
      }`}
    >
      <div className="flex items-center gap-3">
        <img src={war.left.image} alt="" className="h-16 w-16 rounded-2xl object-cover object-top" />
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-black uppercase tracking-[0.2em] ${active ? 'text-black/55' : 'text-cyan-200/70'}`}>{war.status}</p>
          <h3 className="truncate text-xl font-black">{war.title}</h3>
          <p className={`truncate text-sm ${active ? 'text-black/60' : 'text-white/45'}`}>{war.left.name} vs {war.right.name}</p>
        </div>
      </div>
    </button>
  );
}

export default function TVSongWarsScreen() {
  const {
    wars,
    arenaFor,
    checkIn,
    startBattle,
    startPerformance,
    openVoting,
    arenaVote,
    closeVoting,
    revealWinner,
    nextRound,
    endBattle,
    voteCount,
    leader,
  } = useSongWars();
  const { playTrack } = usePlayer();
  const [selectedId, setSelectedId] = useState(() => wars.find((w) => w.status === 'active')?.id ?? wars[0]?.id);
  const selected = useMemo(() => wars.find((w) => w.id === selectedId) ?? wars[0], [selectedId, wars]);
  const arena = selected ? arenaFor(selected.id) : null;

  if (!selected || !arena) {
    return <div className="grid min-h-[60vh] place-items-center text-white/50">No Song Wars battles yet.</div>;
  }

  const leftVotes = voteCount(selected.id, 'left') + arena.roundVotes.left;
  const rightVotes = voteCount(selected.id, 'right') + arena.roundVotes.right;
  const total = leftVotes + rightVotes;
  const leftPct = pct(leftVotes, total);
  const rightPct = 100 - leftPct;
  const leading = leader(selected);

  const playContestant = (c: Contestant) => {
    playTrack({
      id: c.id,
      title: c.track,
      artist: c.name,
      artwork: c.image,
      src: c.src,
      streamUrl: c.src,
    });
  };

  return (
    <div className="space-y-7 pb-8">
      <section className="relative overflow-hidden rounded-[2.25rem] border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-800/35 via-black to-cyan-950/30 p-7">
        <div className="absolute right-12 top-8 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-lg font-black text-white">
          <Users className="mr-2 inline h-5 w-5 text-cyan-200" /> {arena.viewers.toLocaleString()} watching
        </div>
        <div className="max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-fuchsia-200/80">Trey TV Music Arena</p>
          <h1 className="mt-2 text-6xl font-black leading-none text-white">Song Wars Live Battle Arena</h1>
          <p className="mt-3 text-2xl font-semibold text-white/60">{selected.title} • {selected.schedule}</p>
        </div>
        <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-5">
          <div>
            <div className="mb-2 flex justify-between text-lg font-black text-white">
              <span>{selected.left.name}</span>
              <span>{leftPct}%</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan-300" style={{ width: `${leftPct}%` }} />
            </div>
          </div>
          <div className="rounded-full bg-white px-6 py-4 text-2xl font-black text-black">VS</div>
          <div>
            <div className="mb-2 flex justify-between text-lg font-black text-white">
              <span>{rightPct}%</span>
              <span>{selected.right.name}</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-white/10">
              <div className="ml-auto h-full rounded-full bg-fuchsia-300" style={{ width: `${rightPct}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {wars.map((war) => (
          <BattleRailCard key={war.id} war={war} active={war.id === selected.id} onSelect={() => setSelectedId(war.id)} />
        ))}
      </section>

      <section className="grid grid-cols-[1fr_24rem_1fr] gap-6">
        <ContestantPanel
          contestant={selected.left}
          side="left"
          selected={leading === 'left'}
          onPlay={() => playContestant(selected.left)}
          onVote={() => arenaVote(selected.id, 'left')}
          onCheckIn={() => checkIn(selected.id, 'left')}
        />

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 text-center">
          <Swords className="mx-auto h-10 w-10 text-fuchsia-300" />
          <p className="mt-3 text-sm font-black uppercase tracking-[0.25em] text-white/40">Round State</p>
          <h2 className="mt-1 text-4xl font-black text-white">Round {arena.roundNumber} / {arena.totalRounds}</h2>
          <p className="mt-2 text-xl font-semibold text-cyan-200">{arena.status.replace(/_/g, ' ')}</p>
          <div className="mt-5 rounded-2xl bg-black/25 p-4">
            <p className="text-white/45">Check-ins</p>
            <p className="mt-1 text-2xl font-black text-white">
              {arena.checkLeft ? 'A ready' : 'A waiting'} • {arena.checkRight ? 'B ready' : 'B waiting'}
            </p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button onClick={() => startBattle(selected.id)} className="rounded-2xl bg-white px-4 py-4 font-black text-black focus:outline-none focus:ring-4 focus:ring-cyan-300">
              <Radio className="mr-2 inline h-5 w-5" /> Start
            </button>
            <button onClick={() => startPerformance(selected.id, arena.currentPerformer === 'left' ? 'right' : 'left')} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 font-black text-white focus:outline-none focus:ring-4 focus:ring-cyan-300">
              <Play className="mr-2 inline h-5 w-5 fill-white" /> Perform
            </button>
            <button onClick={() => openVoting(selected.id)} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 font-black text-white focus:outline-none focus:ring-4 focus:ring-cyan-300">
              <Vote className="mr-2 inline h-5 w-5" /> Voting
            </button>
            <button onClick={() => closeVoting(selected.id)} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 font-black text-white focus:outline-none focus:ring-4 focus:ring-cyan-300">
              <Pause className="mr-2 inline h-5 w-5 fill-white" /> Close
            </button>
            <button onClick={() => revealWinner(selected.id)} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 font-black text-white focus:outline-none focus:ring-4 focus:ring-cyan-300">
              <Crown className="mr-2 inline h-5 w-5" /> Reveal
            </button>
            <button onClick={() => nextRound(selected.id)} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 font-black text-white focus:outline-none focus:ring-4 focus:ring-cyan-300">
              <Trophy className="mr-2 inline h-5 w-5" /> Next
            </button>
          </div>
          <button onClick={() => endBattle(selected.id)} className="mt-3 w-full rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-4 font-black text-red-100 focus:outline-none focus:ring-4 focus:ring-red-300">
            End Battle
          </button>
        </div>

        <ContestantPanel
          contestant={selected.right}
          side="right"
          selected={leading === 'right'}
          onPlay={() => playContestant(selected.right)}
          onVote={() => arenaVote(selected.id, 'right')}
          onCheckIn={() => checkIn(selected.id, 'right')}
        />
      </section>
    </div>
  );
}
