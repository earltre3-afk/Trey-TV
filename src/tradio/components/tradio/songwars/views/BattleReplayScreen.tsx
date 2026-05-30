import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Play, Share2 } from 'lucide-react';
import { GlassCard, PrimaryButton } from '../../ui';
import { MOCK_REPLAYS } from '../data';

interface BattleReplayScreenProps {
  replayId?: string;
  onNavigate: (dest: { view: 'hub' | 'setup' | 'stage' | 'results' | 'replay'; battleId?: string }) => void;
  onReturnHome?: () => void;
}

export const BattleReplayScreen: React.FC<BattleReplayScreenProps> = ({ replayId = 'replay-1', onNavigate, onReturnHome }) => {
  const replay = MOCK_REPLAYS.find(r => r.id === replayId) || MOCK_REPLAYS[0];

  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [chatReplay, setChatReplay] = useState(true);
  const [isPlayingReplay, setIsPlayingReplay] = useState(false);

  // Play current chapter
  const handlePlayChapter = (idx: number) => {
    setActiveChapterIndex(idx);
    setIsPlayingReplay(true);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10">
      
      {/* Back to Hub Nav */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <button 
          onClick={() => onNavigate({ view: 'hub' })} 
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Song Wars Hub
        </button>
        {onReturnHome && (
          <button
            onClick={onReturnHome}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white/50 hover:text-white"
          >
            Return Home
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Replay Player Hero Layout */}
        <div className="relative rounded-3xl border border-white/10 bg-[#0B0714] overflow-hidden shadow-premium">
          <div className="aspect-video md:aspect-[21/9] w-full relative">
            <img src={replay.artwork} alt="" className="h-full w-full object-cover opacity-35" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0714] via-black/40 to-transparent" />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <button 
                onClick={() => setIsPlayingReplay(!isPlayingReplay)}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500 text-white shadow-[0_0_40px_rgba(176,38,255,0.7)] hover:scale-105 active:scale-95 transition-all"
              >
                {isPlayingReplay ? (
                  <span className="h-6 w-6 flex items-center justify-center font-black">||</span>
                ) : (
                  <Play className="h-6 w-6 fill-current ml-1" />
                )}
              </button>
              
              <h2 className="mt-4 text-xl md:text-2xl font-black text-white">{replay.title}</h2>
              <p className="text-xs text-purple-300 mt-1 uppercase tracking-widest font-extrabold">{replay.playedAt} - Completed Replay</p>
            </div>
          </div>

          <div className="p-6 border-t border-white/5 bg-black/60 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-6 text-xs text-white/50">
              <div>
                <span className="block text-[10px] uppercase text-white/30 tracking-wider">Total Session Votes</span>
                <strong className="text-white text-sm font-black mt-0.5">{(replay.totalVotes).toLocaleString()}</strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-white/30 tracking-wider">Peak Live Audience</span>
                <strong className="text-white text-sm font-black mt-0.5">{(replay.peakListeners).toLocaleString()}</strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-white/30 tracking-wider">Final Session Score</span>
                <strong className="text-yellow-300 text-sm font-black mt-0.5">{replay.scoreA} - {replay.scoreB}</strong>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsPlayingReplay(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-4 py-2 text-xs font-bold text-white hover:brightness-110"
              >
                Watch Full Replay
              </button>
              <button 
                onClick={() => alert('Clip saved to Studio workspace!')}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10"
              >
                <Share2 className="h-3.5 w-3.5" /> Share Clip
              </button>
              <button 
                onClick={() => onNavigate({ view: 'setup' })}
                className="inline-flex items-center gap-1.5 rounded-full bg-purple-500 px-4 py-2 text-xs font-bold text-white hover:bg-purple-600"
              >
                Challenge Winner
              </button>
            </div>
          </div>
        </div>

        {/* Chapters & Replay Chat Toggle Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chapter points list (Left column) */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6">
              <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4">Round Matches & Chapter Marks</h3>
              
              <div className="space-y-3">
                {replay.rounds.map((round, idx) => {
                  const isActive = idx === activeChapterIndex;
                  const isAWinner = round.winner === 'A';
                  return (
                    <div 
                      key={round.roundNumber} 
                      onClick={() => handlePlayChapter(idx)}
                      className={`rounded-2xl border p-4 cursor-pointer transition-all flex items-center justify-between gap-4 ${
                        isActive 
                          ? 'border-purple-500/40 bg-purple-500/10 shadow-[0_0_15px_-5px_rgba(176,38,255,0.4)]' 
                          : 'border-white/5 bg-black/20 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${isActive ? 'bg-purple-500 text-white' : 'bg-white/5 text-white/50'}`}>
                          R{round.roundNumber}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{round.trackA.title} vs {round.trackB.title}</div>
                          <div className="text-[10px] text-white/40 truncate">Matchup length: {round.duration}s</div>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <span className="text-[10px] font-black text-purple-300 uppercase">
                          Winner: {isAWinner ? replay.artistAName : replay.artistBName}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-white/30" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Winning Tracks Playlist */}
            <GlassCard className="p-6">
              <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4">Winning Playlist</h3>
              <div className="space-y-2">
                {replay.rounds.map((round) => {
                  const song = round.winner === 'A' ? round.trackA : round.trackB;
                  return (
                    <div key={round.roundNumber} className="flex items-center justify-between bg-white/[0.01] p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white/30">Round {round.roundNumber}</span>
                        <span className="text-xs font-bold text-white truncate max-w-[200px]">{song.title}</span>
                      </div>
                      <button 
                        onClick={() => alert(`Now playing song: ${song.title}`)}
                        className="text-[10px] font-black text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded uppercase"
                      >
                        Play Song
                      </button>
                    </div>
                  );
                })}
              </div>
              <PrimaryButton className="mt-4 w-full justify-center py-3" onClick={() => alert('Playing all winning songs in order.')}>
                Play Winning Songs
              </PrimaryButton>
            </GlassCard>
          </div>

          {/* Side panel (Right column) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Replay Chat Queue Mock */}
            <GlassCard className="p-5 flex flex-col justify-between h-[300px]">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white/60">Fan Chat Replay</h4>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-purple-300 select-none">
                    <input type="checkbox" checked={chatReplay} onChange={() => setChatReplay(!chatReplay)} className="accent-purple-500" />
                    Sync
                  </label>
                </div>

                {chatReplay ? (
                  <div className="space-y-3 max-h-[200px] overflow-y-auto no-scrollbar">
                    <div className="text-[10px] text-white/50">
                      <strong className="text-purple-300 font-bold">[00:15] Casey:</strong> ATL Sound is destroying this sub-bass loop!
                    </div>
                    <div className="text-[10px] text-white/50">
                      <strong className="text-cyan-300 font-bold">[00:42] Alex:</strong> LA Sunset vibe is pure liquid glass though 
                    </div>
                    <div className="text-[10px] text-white/50">
                      <strong className="text-purple-300 font-bold">[01:10] Moderator_D:</strong> 34K concurrent streams right now! Let\'s go!
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-[10px] text-white/30 italic">Chat replay muted. Toggle sync to view historical chat blocks.</div>
                )}
              </div>

              <div className="text-[10px] text-white/40 border-t border-white/5 pt-3">
                Chat runs in sync with active media play timestamps.
              </div>
            </GlassCard>

            {/* Related battles list */}
            <GlassCard className="p-5">
              <h4 className="text-xs font-black uppercase tracking-widest text-white/60 mb-3">Related Replays</h4>
              <div className="space-y-3">
                {MOCK_REPLAYS.filter(r => r.id !== replay.id).map(r => (
                  <div 
                    key={r.id} 
                    onClick={() => onNavigate({ view: 'replay', battleId: r.id })}
                    className="flex gap-3 items-center bg-white/[0.02] border border-white/5 hover:border-white/12 p-2 rounded-xl cursor-pointer"
                  >
                    <img src={r.artwork} alt="" className="h-9 w-9 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-white truncate">{r.title}</div>
                      <div className="text-[9px] text-white/40 truncate">Winner: {r.winnerName}</div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

          </div>

        </div>

      </div>

    </div>
  );
};
