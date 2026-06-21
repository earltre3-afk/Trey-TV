import React from 'react';
import { ChevronLeft, Megaphone, Shield, Swords, Users } from 'lucide-react';
import { useSongWars } from '../../../../contexts/SongWarsContext';
import type { BattleSide, Contestant, LiveStatus, SongWar } from '../../../../data/mockData';
import AdminBattleDock from './AdminBattleDock';
import ArtistBattleCard from './ArtistBattleCard';
import BattleCountdown from './BattleCountdown';
import BattleStatusBadge from './BattleStatusBadge';
import BattleSummary from './BattleSummary';
import BattleWaitingRoom from './BattleWaitingRoom';
import LiveChatPanel from './LiveChatPanel';
import NowPlayingBattleCard from './NowPlayingBattleCard';
import ReactionStrip from './ReactionStrip';
import RoundStatusPanel from './RoundStatusPanel';
import VotePanel from './VotePanel';
import WinnerReveal from './WinnerReveal';

interface Props {
  war: SongWar;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onClose: () => void;
  onPlay: (c: Contestant) => void;
}

export default function SongWarsArena({ war, isAdmin, onToggleAdmin, onClose }: Props) {
  const {
    arenaFor,
    checkIn,
    setCountdownSel,
    startBattle,
    startPerformance,
    openVoting,
    arenaVote,
    closeVoting,
    revealWinner,
    nextRound,
    pauseBattle,
    resumeBattle,
    muteArtist,
    flagTechnicalIssue,
    pushAnnouncement,
    endBattle,
    addArenaReaction,
    resetArena,
  } = useSongWars();

  const arena = arenaFor(war.id);
  const leftWins = arena.roundResults.filter((r) => r.winner === 'left').length;
  const rightWins = arena.roundResults.filter((r) => r.winner === 'right').length;

  const onCheckIn = (side: BattleSide) => checkIn(war.id, side);
  const onSetCountdown = (seconds: number) => setCountdownSel(war.id, seconds);
  const onStartBattle = () => startBattle(war.id);
  const onStartPerformance = (side: BattleSide) => startPerformance(war.id, side);
  const onOpenVoting = () => openVoting(war.id);
  const onVote = (side: BattleSide) => arenaVote(war.id, side);
  const onCloseVoting = () => closeVoting(war.id);
  const onRevealWinner = () => revealWinner(war.id);
  const onNextRound = () => nextRound(war.id);
  const onPause = () => pauseBattle(war.id);
  const onResume = () => resumeBattle(war.id);
  const onMute = (side: BattleSide) => muteArtist(war.id, side);
  const onFlagTech = () => flagTechnicalIssue(war.id);
  const onAnnouncement = () => pushAnnouncement(war.id, 'Admin: Keep it locked. Song Wars is live on Tradio.');
  const onEndBattle = () => endBattle(war.id);
  const onReset = () => resetArena(war.id);
  const onReact = (key: string, label: string) => addArenaReaction(war.id, key, label);

  const showWaiting = arena.status === 'waiting_for_checkins' || arena.status === 'ready_to_start';
  const showCountdown = arena.status === 'live_starting';
  const showWinner = arena.status === 'winner_reveal';
  const showSummary = arena.status === 'completed';

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-600/20 blur-[90px]" />
        <div className="absolute bottom-20 right-[-90px] h-72 w-72 rounded-full bg-cyan-500/15 blur-[90px]" />
        <div className="absolute left-[-80px] top-1/3 h-64 w-64 rounded-full bg-pink-500/10 blur-[90px]" />
      </div>

      <ArenaHeader
        status={arena.status}
        viewers={arena.viewers}
        isAdmin={isAdmin}
        onToggleAdmin={onToggleAdmin}
        onClose={onClose}
      />

      <div className="relative min-h-0 flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
        {showWaiting && (
          <BattleWaitingRoom
            war={war}
            arena={arena}
            isAdmin={isAdmin}
            onCheckIn={onCheckIn}
            onSetCountdown={onSetCountdown}
            onStartBattle={onStartBattle}
          />
        )}

        {showCountdown && <BattleCountdown war={war} arena={arena} />}

        {!showWaiting && !showCountdown && !showWinner && !showSummary && (
          <div className="space-y-4">
            <RoundStatusPanel war={war} arena={arena} />

            {arena.announcement && (
              <div className="flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100">
                <Megaphone className="h-3.5 w-3.5" /> {arena.announcement}
              </div>
            )}

            <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
              <ArtistBattleCard contestant={war.left} side="left" arena={arena} checked={arena.checkLeft} roundWins={leftWins} />
              <div className="flex items-center justify-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/45 bg-cyan-400/10 text-sm font-black text-cyan-100 shadow-[0_0_28px_-10px_rgba(34,211,238,0.9)]">VS</span>
              </div>
              <ArtistBattleCard contestant={war.right} side="right" arena={arena} checked={arena.checkRight} roundWins={rightWins} />
            </div>

            <NowPlayingBattleCard war={war} arena={arena} />
            <VotePanel war={war} arena={arena} onVote={onVote} />
            <ReactionStrip arena={arena} onReact={onReact} />
            <LiveChatPanel />
          </div>
        )}

        {showWinner && (
          <WinnerReveal
            war={war}
            arena={arena}
            isAdmin={isAdmin}
            onNextRound={onNextRound}
            onEndBattle={onEndBattle}
          />
        )}

        {showSummary && <BattleSummary war={war} arena={arena} onReturn={onClose} />}

        {isAdmin && !showCountdown && !showSummary && (
          <AdminBattleDock
            war={war}
            arena={arena}
            onCheckIn={onCheckIn}
            onStartBattle={onStartBattle}
            onSetCountdown={onSetCountdown}
            onStartPerformance={onStartPerformance}
            onOpenVoting={onOpenVoting}
            onCloseVoting={onCloseVoting}
            onRevealWinner={onRevealWinner}
            onNextRound={onNextRound}
            onPause={onPause}
            onResume={onResume}
            onMute={onMute}
            onFlagTech={onFlagTech}
            onAnnouncement={onAnnouncement}
            onEndBattle={onEndBattle}
            onReset={onReset}
          />
        )}
      </div>
    </div>
  );
}

function ArenaHeader({
  status,
  viewers,
  isAdmin,
  onToggleAdmin,
  onClose,
}: {
  status: LiveStatus;
  viewers: number;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onClose: () => void;
}) {
  return (
    <div className="relative z-10 shrink-0 px-5 pb-3 pt-2">
      <div className="flex items-center gap-3">
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white transition active:scale-95">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Swords className="h-4 w-4 text-fuchsia-300" />
            <p className="truncate text-sm font-black tracking-wide text-white">TRADIO · SONG WARS</p>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <BattleStatusBadge status={status} />
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-bold text-white/55">
              <Users className="h-3 w-3 text-cyan-200" /> {viewers.toLocaleString()}
            </span>
          </div>
        </div>
        <button
          onClick={onToggleAdmin}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black transition active:scale-95 ${
            isAdmin
              ? 'border border-fuchsia-300/50 bg-fuchsia-500/20 text-fuchsia-100'
              : 'border border-white/10 bg-white/[0.06] text-white/50'
          }`}
        >
          <Shield className="h-3.5 w-3.5" /> {isAdmin ? 'Admin' : 'Viewer'}
        </button>
      </div>
    </div>
  );
}
