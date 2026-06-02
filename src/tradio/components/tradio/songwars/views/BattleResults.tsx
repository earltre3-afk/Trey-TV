import React from "react";
import { Award, RotateCcw, Share2, Trophy } from "lucide-react";
import { GlassCard } from "../../ui";
import { MOCK_BATTLES } from "../data";
import { RoundBreakdown } from "../components/Reusable";

interface BattleResultsProps {
  battleId?: string;
  onNavigate: (dest: {
    view: "hub" | "setup" | "stage" | "results" | "replay";
    battleId?: string;
  }) => void;
  onReturnHome?: () => void;
}

export const BattleResults: React.FC<BattleResultsProps> = ({
  battleId = "battle-1",
  onNavigate,
  onReturnHome,
}) => {
  // Find current custom or pre-populated battle
  const battle = MOCK_BATTLES.find((b) => b.id === battleId) || MOCK_BATTLES[0];

  // Hardcoded or dynamically tallied results
  const isAWinner = battle.scoreA >= battle.scoreB;
  const winner = isAWinner ? battle.artistA : battle.artistB;
  const scoreText = `${battle.scoreA} - ${battle.scoreB}`;

  // Total Votes
  const totalVotesCount = battle.rounds.reduce((sum, r) => sum + r.votesA + r.votesB, 0) || 58000;
  const peakListenersCount = battle.listenersCount || 14850;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10">
      {/* Navigation Headers */}
      <div className="mb-6 flex justify-between items-center flex-wrap gap-2">
        <button
          onClick={() => onNavigate({ view: "hub" })}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white transition-all"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Return to Song Wars Hub
        </button>
        <div className="flex items-center gap-2">
          {onReturnHome && (
            <button
              onClick={onReturnHome}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white/50 hover:text-white"
            >
              Return Home
            </button>
          )}
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">
            Official Results Ledger
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Massive Winner Trophy Showcase */}
        <div className="relative rounded-3xl border border-yellow-500/20 bg-gradient-to-b from-[#1E1103] via-[#0D081F] to-[#0A0A0F] p-8 md:p-12 overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.3)] text-center">
          {/* Neon sparks */}
          <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/10 blur-[130px]" />

          <div className="relative">
            {/* Crown icon floating */}
            <div className="flex justify-center mb-6">
              <div className="relative animate-pulse">
                <div className="absolute -inset-3 rounded-full bg-yellow-500/30 blur-md" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500 text-white shadow-premium border border-yellow-300/20">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 bg-clip-text text-transparent tracking-tight">
              BATTLE CHAMPION
            </h1>
            <p className="mt-2 text-xs md:text-sm font-extrabold uppercase tracking-[0.2em] text-yellow-300/80">
              {battle.title}
            </p>

            {/* Split winner layout */}
            <div className="mt-8 flex flex-col items-center justify-center">
              <div className="relative">
                <img
                  src={winner.avatar}
                  alt={winner.name}
                  className="h-32 w-32 rounded-full object-cover border-4 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.4)]"
                />
                <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-white border-2 border-[#0A0A0F]">
                  <Award className="h-4 w-4" />
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-black text-white">{winner.name}</h2>
              <p className="text-xs text-white/50">{winner.station}</p>
            </div>

            {/* Final Score Pill */}
            <div className="mt-6 inline-flex flex-col items-center bg-white/5 border border-white/8 px-6 py-2 rounded-2xl">
              <span className="text-[10px] text-white/40 uppercase tracking-widest">
                Final Score
              </span>
              <span className="text-xl font-extrabold text-white">{scoreText}</span>
            </div>
          </div>
        </div>

        {/* Highlight Stats Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/5 bg-black/40 p-5 text-center">
            <div className="text-[10px] uppercase text-white/40 tracking-wider">
              Total Tally Votes
            </div>
            <div className="text-2xl font-black text-white mt-1.5">
              {totalVotesCount.toLocaleString()}
            </div>
            <p className="text-[9px] text-emerald-400 mt-1 font-bold">+14% over baseline</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-black/40 p-5 text-center">
            <div className="text-[10px] uppercase text-white/40 tracking-wider">
              Peak Live Audience
            </div>
            <div className="text-2xl font-black text-white mt-1.5">
              {peakListenersCount.toLocaleString()}
            </div>
            <p className="text-[9px] text-purple-300 mt-1 font-bold">14.8K live at final round</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-black/40 p-5 text-center">
            <div className="text-[10px] uppercase text-white/40 tracking-wider">
              Trophy Prize Pool
            </div>
            <div className="text-sm font-black text-yellow-300 mt-2 truncate">{battle.prize}</div>
            <p className="text-[9px] text-white/30 mt-1">Stored in Artist Vault</p>
          </div>
        </div>

        {/* Round by Round & Social Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Round Breakdown Column */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6">
              <h3 className="text-base font-extrabold text-white mb-4">Official Round Ledger</h3>
              <RoundBreakdown
                rounds={battle.rounds}
                artistAName={battle.artistA.name}
                artistBName={battle.artistB.name}
              />
            </GlassCard>

            {/* Winning Playlist */}
            <GlassCard className="p-6">
              <h3 className="text-base font-extrabold text-white mb-3">
                Winning Champion Showcase
              </h3>
              <p className="text-xs text-white/50 mb-4">
                The championship tracks that conquered the session rounds.
              </p>

              <div className="space-y-3">
                {battle.rounds.map((round) => {
                  const song = round.winner === "A" ? round.trackA : round.trackB;
                  return (
                    <div
                      key={round.roundNumber}
                      className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-3.5 rounded-2xl hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img src={song.art} alt="" className="h-10 w-10 rounded-xl object-cover" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{song.title}</div>
                          <div className="text-[10px] text-white/40 truncate">{song.artist}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded">
                          Won Round {round.roundNumber}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          {/* Social CTAs Column */}
          <div className="lg:col-span-1 space-y-6">
            <GlassCard className="p-5 space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Post-Session Actions
              </h3>

              <button
                onClick={() =>
                  alert("Sponsor action: Added winner tracks to your Station Rotation!")
                }
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-500/10 border border-purple-400/20 py-3 text-xs font-extrabold text-purple-200 hover:bg-purple-500/20 transition-all"
              >
                Add Winner to Station Rotation
              </button>

              <button
                onClick={() => alert("Social action: Shared Battle Card to Trey TV network!")}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 py-3 text-xs font-extrabold text-white hover:bg-white/10 transition-all"
              >
                <Share2 className="h-4 w-4" /> Share Results Battle Card
              </button>

              <div className="border-t border-white/5 pt-4">
                <div className="text-[10px] uppercase text-white/40 font-bold mb-3">
                  Follow Competitors
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/70 truncate max-w-[120px]">
                      {battle.artistA.name}
                    </span>
                    <button className="text-[10px] font-bold border border-white/12 bg-white/5 px-2.5 py-1 rounded-full hover:bg-white/10 text-white">
                      Follow
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/70 truncate max-w-[120px]">
                      {battle.artistB.name}
                    </span>
                    <button className="text-[10px] font-bold border border-white/12 bg-white/5 px-2.5 py-1 rounded-full hover:bg-white/10 text-white">
                      Follow
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Quick Playback / Replays */}
            <GlassCard className="p-5 text-center">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/50 mb-2">
                <RotateCcw className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Watch Session Replay</h4>
              <p className="text-[10px] text-white/40 mt-1 leading-normal">
                Relive the battle, read fan chat replays, and check round chapters.
              </p>
              <button
                onClick={() => onNavigate({ view: "replay", battleId: "replay-1" })}
                className="w-full mt-4 rounded-xl bg-purple-500 py-2.5 text-xs font-bold text-white hover:bg-purple-600 transition-all active:scale-95"
              >
                Watch Replay
              </button>
              <button
                onClick={() => onNavigate({ view: "hub" })}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-white/75 transition-all hover:bg-white/10"
              >
                Return to Song Wars Hub
              </button>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Arrow icon wrapper
const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
