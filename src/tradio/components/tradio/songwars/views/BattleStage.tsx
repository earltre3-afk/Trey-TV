import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, CheckCircle, Crown, Radio, Send, Shield, Volume2, X } from 'lucide-react';
import { GlassCard } from '../../ui';
import { MOCK_BATTLES, MOCK_BATTLE_CHAT_MESSAGES, MOCK_SONG_WAR_ARTISTS } from '../data';
import { VSEmblem, VoteMeter, CrowdEnergyMeter, EmojiTray, AnimatedReactionTray, GIFPickerPlaceholder, ExitBattleModal, WinnerReveal, RoundBreakdown, ArtistEntrance } from '../components/Reusable';
import type { SongWarRole, SongWarBattle, SongWarChatMessage } from '../types';
import { TradioImage } from '../../NoCoverVisualizer';
import { usePlayer } from '@/tradio/contexts/PlayerContext';
import { songWarRoundToPlaybackItem } from '../../playbackAdapters';

interface BattleStageProps {
  battleId?: string;
  role: SongWarRole;
  onNavigate: (dest: { view: 'hub' | 'setup' | 'stage' | 'results' | 'replay'; battleId?: string }) => void;
  onReturnHome?: () => void;
}

const roleCopy: Record<SongWarRole, string> = {
  fan: 'Fan view: vote, react, request, and chat.',
  artist: 'Artist participant: fan-facing drops only.',
  dj: 'Host / DJ view: manage round flow.',
  moderator: 'Moderator view: chat and reaction safety tools.',
  admin: 'Admin view: full mock override drawer.',
};

export const BattleStage: React.FC<BattleStageProps> = ({ battleId = 'battle-1', role, onNavigate, onReturnHome }) => {
  // Load initial battle data
  const initialBattle = MOCK_BATTLES.find(b => b.id === battleId) || MOCK_BATTLES[0];
  const [battle, setBattle] = useState<SongWarBattle>(initialBattle);
  
  // Battle state variables
  const [currentRoundIndex, setCurrentRoundIndex] = useState(battle.currentRoundIndex);
  const currentRound = battle.rounds[currentRoundIndex] || battle.rounds[0];
  const [roundStatus, setRoundStatus] = useState<'playing' | 'voting' | 'completed'>(currentRound.status as 'playing' | 'voting' | 'completed');

  // Playback simulation states
  const [isPlayingA, setIsPlayingA] = useState(true);
  const [isPlayingB, setIsPlayingB] = useState(false);
  const [activePlaySec, setActivePlaySec] = useState(0);
  const { playItem, currentItem, isPlaying: globalPlaybackPlaying } = usePlayer();

  // Voting metrics
  const [votesA, setVotesA] = useState(currentRound.votesA);
  const [votesB, setVotesB] = useState(currentRound.votesB);
  const [isVoteLocked, setIsVoteLocked] = useState(false);
  const [userVote, setUserVote] = useState<'A' | 'B' | null>(null);

  // Energy & Metrics
  const [listenersCount, setListenersCount] = useState(battle.listenersCount);
  const [crowdEnergy, setCrowdEnergy] = useState(82);

  // Chat panel states
  const [chatMessages, setChatMessages] = useState<SongWarChatMessage[]>(MOCK_BATTLE_CHAT_MESSAGES);
  const [chatTab, setChatTab] = useState<'Live Chat' | 'Polls' | 'Requests' | 'Top Fans'>('Live Chat');
  const [chatInput, setChatInput] = useState('');
  const [showGIFPicker, setShowGIFPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<{ id: number; emoji: string; x: number; y: number }[]>([]);
  const reactionIdCounter = useRef(0);

  // Moderation variables
  const [chatLocked, setChatLocked] = useState(false);
  const [slowMode, setSlowMode] = useState(false);
  const [reactionsDisabled, setReactionsDisabled] = useState(false);

  // Pinned chat message
  const [pinnedMessage, setPinnedMessage] = useState<string | null>(
    'Host Pinned: Welcome to Song Wars. Round 2 R&B clashes are heating up. Cast your reaction bursts!'
  );

  // Modal flows
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showWinnerReveal, setShowWinnerReveal] = useState(false);
  const [battleFinished, setBattleFinished] = useState(false);
  const [showEntrance, setShowEntrance] = useState(true);
  const handleEntranceComplete = useCallback(() => setShowEntrance(false), []);

  // Ref for chat auto-scrolling
  const chatEndRef = useRef<HTMLDivElement>(null);

  const triggerFloatingReaction = useCallback((emoji: string) => {
    if (reactionsDisabled) return;

    const id = reactionIdCounter.current++;
    const x = 15 + Math.random() * 70; // Keep emojis contained on the stage center 15% - 85%
    const newReact = { id, emoji, x, y: 10 };
    setFloatingReactions(prev => [...prev, newReact]);

    // Lift reaction upwards over time
    setTimeout(() => {
      setFloatingReactions(prev => prev.map(r => r.id === id ? { ...r, y: 80 } : r));
    }, 50);

    // Filter out after completion
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, 4000);
  }, [reactionsDisabled]);

  const playSongWarCorner = useCallback((corner: 'A' | 'B') => {
    const item = songWarRoundToPlaybackItem(battle, corner, currentRoundIndex);
    playItem(item, {
      source: {
        id: `${battle.id}-round-${currentRound.roundNumber}`,
        type: 'song_war_round',
        label: 'Song War',
        title: battle.title,
        subtitle: `${battle.artistA.name} vs ${battle.artistB.name}`,
        image: corner === 'A' ? battle.artistA.avatar : battle.artistB.avatar,
      },
    });
    setIsPlayingA(corner === 'A');
    setIsPlayingB(corner === 'B');
  }, [battle, currentRound.roundNumber, currentRoundIndex, playItem]);

  useEffect(() => {
    playSongWarCorner(isPlayingB ? 'B' : 'A');
    // Intentionally keyed to round changes so the mock player follows the battle without restarting every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battle.id, currentRoundIndex]);

  // Timer loop for simulating active song playback & real-time changes
  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate listener counts wavering slightly
      setListenersCount(prev => prev + Math.floor(Math.random() * 50) - 20);

      // Simulate equalizer and song seconds ticking
      if (roundStatus === 'playing') {
        setActivePlaySec(prev => {
          if (prev >= currentRound.duration) {
            // Automatically switch from playing to voting
            setRoundStatus('voting');
            return 0;
          }
          return prev + 1;
        });

        // Simulate crawl of voting percentages during play (pre-locked display)
        if (Math.random() > 0.4) {
          setVotesA(prev => prev + Math.floor(Math.random() * 25));
          setVotesB(prev => prev + Math.floor(Math.random() * 25));
        }
      }

      // Simulate floating reaction bursts from other users periodically
      if (!reactionsDisabled && Math.random() > 0.7) {
        const emojis = ['\uD83D\uDD25', '\uD83D\uDC51', '\u26A1', '\uD83D\uDC96', '\uD83D\uDD0A', '\uD83E\uDD81'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        triggerFloatingReaction(randomEmoji);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [roundStatus, currentRound, reactionsDisabled, triggerFloatingReaction]);

  // Handle auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleCastVote = (corner: 'A' | 'B') => {
    if (isVoteLocked) return;
    setIsVoteLocked(true);
    setUserVote(corner);

    // Increment votes
    if (corner === 'A') {
      setVotesA(prev => prev + 1);
    } else {
      setVotesB(prev => prev + 1);
    }

    // Boost crowd energy on fan lock-in
    setCrowdEnergy(prev => Math.min(prev + 4, 100));

    // Send mock notification in chat
    const newMsg: SongWarChatMessage = {
      id: `system-v-${Date.now()}`,
      author: 'Tradio System',
      avatar: MOCK_SONG_WAR_ARTISTS.treyTrizzy.avatar,
      message: `A listener locked in their vote for Artist ${corner === 'A' ? 'A (' + battle.artistA.name + ')' : 'B (' + battle.artistB.name + ')'}.`,
      timestamp: 'Just now',
      role: 'fan',
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const handleSendMessage = () => {
    if (chatLocked && role !== 'admin' && role !== 'moderator') return;
    if (!chatInput.trim()) return;

    const roleBadges: Record<SongWarRole, string | null> = {
      fan: 'VIP',
      artist: 'Artist',
      dj: 'Host',
      moderator: 'Mod',
      admin: 'Admin',
    };

    const newMsg: SongWarChatMessage = {
      id: `chat-${Date.now()}`,
      author: role === 'admin' ? 'Trizzy Trey' : role === 'dj' ? 'DJ Midnight Spin' : 'You (Jordan)',
      avatar: role === 'admin' ? MOCK_SONG_WAR_ARTISTS.treyTrizzy.avatar : MOCK_SONG_WAR_ARTISTS.djSparkles.avatar,
      message: chatInput,
      timestamp: 'Just now',
      role: role,
      badge: roleBadges[role],
      isArtist: role === 'artist' || role === 'admin',
      isVerified: role === 'admin' || role === 'dj' || role === 'artist',
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setCrowdEnergy(prev => Math.min(prev + 2, 100));

    // Simulate typing indicator response from others
    setTimeout(() => {
      if (Math.random() > 0.4) {
        const responses = [
          'Song-1 is going to take this round for sure!',
          'Kiana is killing this deep soul pocket! ',
          'Trey Trizzy is legendary on this synth line',
          'CROWD IN THE BUILDING! Trigger more fires!',
        ];
        const randomMsg: SongWarChatMessage = {
          id: `chat-res-${Date.now()}`,
          author: 'VibeGeneral',
          avatar: MOCK_SONG_WAR_ARTISTS.jaye.avatar,
          message: responses[Math.floor(Math.random() * responses.length)],
          timestamp: 'Just now',
          role: 'fan',
        };
        setChatMessages(prev => [...prev, randomMsg]);
      }
    }, 1500);
  };

  const handleSendArtistDrop = () => {
    // Participant Artist feature
    const dropMsg: SongWarChatMessage = {
      id: `drop-${Date.now()}`,
      author: battle.artistA.name,
      avatar: battle.artistA.avatar,
      message: `Voice Drop: "Tradio listeners! Run it back on my station rotation after this. Let's claim this diamond disc prize. Love!"`,
      timestamp: 'Just now',
      role: 'artist',
      badge: 'Artist',
      isArtist: true,
      isVerified: true,
    };
    setChatMessages(prev => [...prev, dropMsg]);
    setCrowdEnergy(100); // Max energy
  };

  // Host Actions
  const handleHostAction = (action: 'open_voting' | 'close_voting' | 'reveal_winner' | 'next_round' | 'sponsor_break' | 'end_battle') => {
    if (action === 'open_voting') {
      setRoundStatus('voting');
      setIsVoteLocked(false);
      setUserVote(null);
      setChatMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        author: 'Host Controls',
        avatar: MOCK_SONG_WAR_ARTISTS.djSparkles.avatar,
        message: 'Host opened voting. Fans, cast your votes now.',
        timestamp: 'Just now',
        role: 'dj',
        badge: 'Host',
      }]);
    } else if (action === 'close_voting') {
      setRoundStatus('completed');
      setChatMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        author: 'Host Controls',
        avatar: MOCK_SONG_WAR_ARTISTS.djSparkles.avatar,
        message: 'Host locked the voting box. Tallying final numbers...',
        timestamp: 'Just now',
        role: 'dj',
        badge: 'Host',
      }]);
    } else if (action === 'reveal_winner') {
      // Tally winner of current round
      const winnerCorner = votesA >= votesB ? 'A' : 'B';
      const updatedRounds = [...battle.rounds];
      updatedRounds[currentRoundIndex] = {
        ...currentRound,
        votesA,
        votesB,
        winner: winnerCorner,
        status: 'completed',
      };

      const updatedScoreA = winnerCorner === 'A' ? battle.scoreA + 1 : battle.scoreA;
      const updatedScoreB = winnerCorner === 'B' ? battle.scoreB + 1 : battle.scoreB;

      setBattle(prev => ({
        ...prev,
        rounds: updatedRounds,
        scoreA: updatedScoreA,
        scoreB: updatedScoreB,
      }));

      setRoundStatus('completed');

      setChatMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        author: 'Host Controls',
        avatar: MOCK_SONG_WAR_ARTISTS.djSparkles.avatar,
        message: `Round ${currentRound.roundNumber} winner is ${winnerCorner === 'A' ? battle.artistA.name : battle.artistB.name} (${votesA.toLocaleString()} - ${votesB.toLocaleString()} votes).`,
        timestamp: 'Just now',
        role: 'dj',
        badge: 'Host',
      }]);
    } else if (action === 'next_round') {
      const nextIndex = currentRoundIndex + 1;
      if (nextIndex < battle.roundsCount) {
        setCurrentRoundIndex(nextIndex);
        const nextRoundData = battle.rounds[nextIndex];
        setVotesA(nextRoundData.votesA || 10000 + Math.floor(Math.random() * 5000));
        setVotesB(nextRoundData.votesB || 10000 + Math.floor(Math.random() * 5000));
        setRoundStatus('playing');
        setActivePlaySec(0);
        setIsVoteLocked(false);
        setUserVote(null);
        setIsPlayingA(true);
        setIsPlayingB(false);
      } else {
        // End of all rounds
        handleHostAction('end_battle');
      }
    } else if (action === 'sponsor_break') {
      setChatMessages(prev => [...prev, {
        id: `sponsor-${Date.now()}`,
        author: 'Tradio Broadcast Sponsor',
        avatar: MOCK_SONG_WAR_ARTISTS.treyTrizzy.avatar,
        message: 'Commercial break placeholder: "Support the Tradio creator network. Double your fan votes with Trey TV pass."',
        timestamp: 'Just now',
        role: 'admin',
        badge: 'Sponsor',
      }]);
    } else if (action === 'end_battle') {
      const finalWinnerId = battle.scoreA >= battle.scoreB ? battle.artistA.id : battle.artistB.id;
      setBattle(prev => ({
        ...prev,
        winnerId: finalWinnerId,
      }));
      setBattleFinished(true);
      setShowWinnerReveal(true);
    }
  };

  // Moderator actions
  const handleModAction = (action: 'mute_all' | 'lock_chat' | 'slow_mode' | 'clear_gifs') => {
    if (action === 'lock_chat') {
      setChatLocked(!chatLocked);
      setChatMessages(prev => [...prev, {
        id: `mod-${Date.now()}`,
        author: 'Moderator Controls',
        avatar: MOCK_SONG_WAR_ARTISTS.jaye.avatar,
        message: `Chat was ${!chatLocked ? 'locked' : 'unlocked'} by the moderator panel.`,
        timestamp: 'Just now',
        role: 'moderator',
        badge: 'Mod',
      }]);
    } else if (action === 'slow_mode') {
      setSlowMode(!slowMode);
      setChatMessages(prev => [...prev, {
        id: `mod-${Date.now()}`,
        author: 'Moderator Controls',
        avatar: MOCK_SONG_WAR_ARTISTS.jaye.avatar,
        message: `Slow mode was ${!slowMode ? 'enabled with 3 second delays' : 'disabled'} by the moderator panel.`,
        timestamp: 'Just now',
        role: 'moderator',
        badge: 'Mod',
      }]);
    } else if (action === 'clear_gifs') {
      //concept GIF clearing
      setChatMessages(prev => prev.filter(m => !m.message.includes('GIF:')));
      setChatMessages(prev => [...prev, {
        id: `mod-${Date.now()}`,
        author: 'Moderator Controls',
        avatar: MOCK_SONG_WAR_ARTISTS.jaye.avatar,
        message: 'Moderator cleared all active GIF images from the chat queue.',
        timestamp: 'Just now',
        role: 'moderator',
        badge: 'Mod',
      }]);
    }
  };

  // Admin overrides
  const handleAdminOverride = (corner: 'A' | 'B') => {
    const overrideWinnerId = corner === 'A' ? battle.artistA.id : battle.artistB.id;
    setBattle(prev => ({
      ...prev,
      winnerId: overrideWinnerId,
      scoreA: corner === 'A' ? 3 : 0,
      scoreB: corner === 'B' ? 3 : 0,
    }));
    setBattleFinished(true);
    setShowWinnerReveal(true);

    setChatMessages(prev => [...prev, {
      id: `admin-${Date.now()}`,
      author: 'Network Admin',
      avatar: MOCK_SONG_WAR_ARTISTS.treyTrizzy.avatar,
      message: `Admin force override: assigned victory to Artist ${corner === 'A' ? 'A' : 'B'}.`,
      timestamp: 'Just now',
      role: 'admin',
      badge: 'Admin',
    }]);
  };

  const currentWinner = battle.winnerId === battle.artistA.id ? battle.artistA : battle.artistB;

  return (
    <div className="relative min-h-dvh flex flex-col">
      {showEntrance && (
        <ArtistEntrance
          artistA={battle.artistA}
          artistB={battle.artistB}
          onComplete={handleEntranceComplete}
        />
      )}
      
      {/* Floating Animated Reaction Burst Layer */}
      <AnimatedReactionTray floatingReactions={floatingReactions} />

      {/* Header Bar */}
      <div className="sticky top-0 z-20 border-b border-white/5 bg-black/40 px-4 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <button 
            onClick={() => setShowExitConfirm(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Exit Battle
          </button>
          {onReturnHome && (
            <button
              onClick={onReturnHome}
              className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white/50 transition hover:text-white sm:inline-flex"
            >
              Home
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-rose-500 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80 bg-rose-500/10 border border-rose-500/25 px-2.5 py-1 rounded-full">
              LIVE SHOWCASE
            </span>
            <span className="text-[10px] text-white/50 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              {listenersCount.toLocaleString()} LISTENING
            </span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-300">{role === 'dj' ? 'DJ / Host' : role} mode</div>
            <div className="text-[10px] text-white/50">{roleCopy[role]}</div>
          </div>
          <div className="flex flex-wrap gap-1.5 text-[9px] font-black uppercase tracking-wider">
            <span className={`rounded-full border px-2 py-1 ${chatLocked ? 'border-rose-400/40 bg-rose-500/10 text-rose-200' : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'}`}>{chatLocked ? 'Chat locked' : 'Chat open'}</span>
            {slowMode && <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-amber-200">Slow mode</span>}
            <span className={`rounded-full border px-2 py-1 ${reactionsDisabled ? 'border-white/10 bg-white/5 text-white/40' : 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200'}`}>{reactionsDisabled ? 'Reactions off' : 'Reactions live'}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 sm:p-6">
        
        {/* Battle Stage (Left & Center Columns) */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          
          {/* Main Visual Arena */}
          <GlassCard glow className="p-6 overflow-hidden bg-gradient-to-br from-[#100720]/90 via-[#04020a]/95 to-[#060A18]/90 border-purple-500/20 flex-1 flex flex-col justify-between relative min-h-[420px]">

            {/* Swaying Stage Light Rings for Luxury Polish */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
              <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-gradient-to-br from-fuchsia-500/10 via-purple-500/5 to-transparent blur-[120px] animate-[pulse_6s_infinite]" />
              <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent blur-[120px] animate-[pulse_8s_infinite]" />
            </div>

            {/* Top Indicator Block */}
            <div className="flex justify-between items-center z-10 border-b border-white/5 pb-4">
              <div className="text-left">
                <div className="text-[10px] font-black uppercase tracking-[0.25em] bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">ROUND {currentRound.roundNumber} OF {battle.roundsCount}</div>
                <div className="text-xs text-white/50 mt-1 font-semibold tracking-wide">{battle.title}</div>
              </div>

              <div className="flex items-center gap-4 bg-white/[0.03] border border-white/8 rounded-2xl px-5 py-2 shadow-inner">
                <div className="text-right">
                  <div className="text-[8px] uppercase text-white/40 tracking-[0.18em] font-extrabold">Session Score</div>
                  <div className="text-lg font-black text-white mt-0.5 tracking-wider">{battle.scoreA} - {battle.scoreB}</div>
                </div>
              </div>
            </div>

            {/* Split Screen Combat Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-auto relative py-8">

              {/* Artist A (Pink Glow Corner) */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left z-10">
                <div className="relative p-1.5 rounded-3xl bg-gradient-to-tr from-white/10 via-transparent to-white/5 border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.6)]">
                  <img src={battle.artistA.avatar} alt="" className={`h-28 w-28 rounded-2xl object-cover transition-transform duration-700 ${isPlayingA && globalPlaybackPlaying ? 'scale-105 shadow-[0_0_40px_rgba(244,63,94,0.6)] border border-fuchsia-400/40' : 'opacity-65'}`} />
                  {isPlayingA && (
                    <span className="absolute -top-2.5 -right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white border-2 border-black animate-pulse shadow-lg">
                      <Volume2 className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>

                <div className="mt-5 min-w-0 w-full">
                  <span className="inline-block rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 px-3 py-1 text-[9px] font-black text-fuchsia-300 uppercase tracking-widest">Artist A</span>
                  <h3 className="text-xl font-black text-white mt-2 tracking-tight">{battle.artistA.name}</h3>

                  {/* Song Playing Card */}
                  <div className="mt-5 bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 p-4 rounded-2xl flex items-center gap-4 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-xl hover:border-white/20 transition-all duration-300">
                    <TradioImage
                      src={currentRound.trackA.coverUrl || currentRound.trackA.art}
                      title={currentRound.trackA.title}
                      artist={battle.artistA.name}
                      isPlaying={isPlayingA && currentItem?.id === currentRound.trackA.id && globalPlaybackPlaying}
                      isLoading={false}
                      fallbackSize="mini"
                      className="h-12 w-12 rounded-xl object-cover border border-white/10 shadow-md"
                      imgClassName="h-12 w-12 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1 text-left">
                      <div className="text-xs font-bold text-white tracking-wide truncate">{currentRound.trackA.title}</div>
                      <div className="text-[10px] text-fuchsia-300 font-bold mt-0.5 tracking-wider uppercase">{battle.artistA.station}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clashing Emblem in Absolute Center on Desktop */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <VSEmblem active={roundStatus === 'playing'} className="scale-[1.3]" />
              </div>

              {/* Artist B (Cyan Glow Corner) */}
              <div className="flex flex-col items-center md:items-end text-center md:text-right mt-10 md:mt-0 z-10">
                <div className="relative p-1.5 rounded-3xl bg-gradient-to-tr from-white/10 via-transparent to-white/5 border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.6)]">
                  <img src={battle.artistB.avatar} alt="" className={`h-28 w-28 rounded-2xl object-cover transition-transform duration-700 ${isPlayingB && globalPlaybackPlaying ? 'scale-105 shadow-[0_0_40px_rgba(6,182,212,0.6)] border border-cyan-400/40' : 'opacity-55'}`} />
                  {isPlayingB && (
                    <span className="absolute -top-2.5 -right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 text-white border-2 border-black animate-pulse shadow-lg">
                      <Volume2 className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>

                <div className="mt-5 min-w-0 w-full">
                  <span className="inline-block rounded-full bg-cyan-500/15 border border-cyan-500/30 px-3 py-1 text-[9px] font-black text-cyan-300 uppercase tracking-widest">Artist B</span>
                  <h3 className="text-xl font-black text-white mt-2 tracking-tight">{battle.artistB.name}</h3>

                  {/* Song Playing Card */}
                  <div className="mt-5 bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 p-4 rounded-2xl flex items-center gap-4 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-xl hover:border-white/20 transition-all duration-300 flex-row-reverse">
                    <TradioImage
                      src={currentRound.trackB.coverUrl || currentRound.trackB.art}
                      title={currentRound.trackB.title}
                      artist={battle.artistB.name}
                      isPlaying={isPlayingB && currentItem?.id === currentRound.trackB.id && globalPlaybackPlaying}
                      isLoading={false}
                      fallbackSize="mini"
                      className="h-12 w-12 rounded-xl object-cover border border-white/10 shadow-md"
                      imgClassName="h-12 w-12 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1 text-right">
                      <div className="text-xs font-bold text-white tracking-wide truncate">{currentRound.trackB.title}</div>
                      <div className="text-[10px] text-cyan-300 font-bold mt-0.5 tracking-wider uppercase">{battle.artistB.station}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Custom equalizer bar clashing graphics */}
            <div className="z-10 bg-black/20 p-4 border border-white/5 rounded-2xl">
              <div className="flex justify-between items-center text-[10px] text-white/40 uppercase tracking-widest mb-1 font-extrabold">
                <span>Active Track Soundwaves</span>
                <span className="text-purple-300 animate-pulse">{roundStatus === 'playing' ? `00:${activePlaySec.toString().padStart(2, '0')} / 00:${currentRound.duration}` : 'Waiting on voting'}</span>
              </div>
              <div className="h-4 w-full flex items-end justify-between overflow-hidden gap-1 bg-white/5 rounded p-1">
                {Array.from({ length: 30 }).map((_, idx) => {
                  const isACol = idx < 15;
                  const amp = roundStatus === 'playing' 
                    ? (isACol && isPlayingA) || (!isACol && isPlayingB) 
                      ? 15 + Math.floor(Math.random() * 85) 
                      : 5 + Math.floor(Math.random() * 15)
                    : 10;
                  
                  return (
                    <div 
                      key={idx} 
                      style={{ height: `${amp}%` }} 
                      className={`w-full rounded-sm transition-all duration-300 ${
                        isACol 
                          ? 'bg-gradient-to-t from-fuchsia-500 to-purple-400' 
                          : 'bg-gradient-to-t from-cyan-500 to-blue-400'
                      }`} 
                    />
                  );
                })}
              </div>
            </div>

            {/* In-view playback simulation drawer for demo context */}
            <div className="z-10 mt-4 flex items-center justify-between border-t border-white/5 pt-3">
              <span className="text-[10px] text-white/40">Simulation Control Room</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => playSongWarCorner('A')}
                  className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${isPlayingA ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-300' : 'border-white/5 text-white/40 hover:bg-white/5'}`}
                >
                  Listen Artist A
                </button>
                <button 
                  onClick={() => playSongWarCorner('B')}
                  className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${isPlayingB ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300' : 'border-white/5 text-white/40 hover:bg-white/5'}`}
                >
                  Listen Artist B
                </button>
              </div>
            </div>

          </GlassCard>

          {/* Voting Box / Vote locked */}
          {roundStatus === 'voting' ? (
            <div className="space-y-4">
              <VoteMeter
                votesA={votesA}
                votesB={votesB}
                labelA={battle.artistA.name}
                labelB={battle.artistB.name}
                hasVoted={isVoteLocked}
                userVote={userVote}
              />
              {!isVoteLocked ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleCastVote('A')}
                    className="flex items-center justify-center gap-2 rounded-full py-3 text-sm font-black bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white transition-all active:scale-95 shadow-[0_10px_20px_rgba(244,63,94,0.4)]"
                  >
                    Vote {battle.artistA.name}
                  </button>
                  <button
                    onClick={() => handleCastVote('B')}
                    className="flex items-center justify-center gap-2 rounded-full py-3 text-sm font-black bg-gradient-to-r from-cyan-500 to-teal-400 text-white transition-all active:scale-95 shadow-[0_10px_20px_rgba(6,182,212,0.4)]"
                  >
                    Vote {battle.artistB.name}
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 text-center">
                  <span className="text-xs font-extrabold text-emerald-300 flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Your vote is securely locked on the Tradio ledger!
                  </span>
                  <p className="text-[10px] text-white/40 mt-1">Real-time tally counts update with listener blocks.</p>
                </div>
              )}
            </div>
          ) : roundStatus === 'playing' ? (
            <div className="bg-white/5 border border-white/8 rounded-2xl p-5 text-center">
              <span className="text-xs font-bold text-white/80 animate-pulse"> Song is playing in live rotation...</span>
              <p className="text-[10px] text-white/40 mt-1">Voting panel opens automatically in {currentRound.duration - activePlaySec}s once track play ends.</p>
            </div>
          ) : (
            <div className="bg-purple-950/20 border border-purple-500/25 rounded-2xl p-4 text-center flex justify-between items-center">
              <span className="text-xs font-bold text-purple-200">Round {currentRound.roundNumber} is fully concluded.</span>
              <span className="text-xs font-extrabold text-white">Winner Revealed!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CrowdEnergyMeter energy={crowdEnergy} />
            <RoundBreakdown rounds={battle.rounds} artistAName={battle.artistA.name} artistBName={battle.artistB.name} />
          </div>

        </div>

        {/* Live Chat Drawer (Right Column) */}
        <div className="lg:col-span-1 space-y-6 flex flex-col justify-between">
          
          <GlassCard className="flex-1 flex flex-col justify-between overflow-hidden bg-black/60 min-h-[450px] lg:max-h-[calc(100dvh-10rem)]">
            
            {/* Chat Headers Tabs */}
            <div>
              <div className="flex border-b border-white/5 bg-black/40">
                {(['Live Chat', 'Polls', 'Requests', 'Top Fans'] as ('Live Chat' | 'Polls' | 'Requests' | 'Top Fans')[]).map((tabKey) => (
                  <button
                    key={tabKey}
                    onClick={() => setChatTab(tabKey)}
                    className={`flex-1 text-center py-3 text-xs font-bold transition-all border-b-2 ${
                      chatTab === tabKey 
                        ? 'border-purple-400 text-purple-200 bg-purple-500/5' 
                        : 'border-transparent text-white/45 hover:text-white/80'
                    }`}
                  >
                    {tabKey}
                  </button>
                ))}
              </div>

              {/* Pinned Message */}
              {pinnedMessage && (
                <div className="bg-purple-500/10 border-b border-purple-400/20 px-4 py-2.5 flex items-center justify-between text-[11px] text-purple-200">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-extrabold text-[10px] bg-purple-500/25 border border-purple-400/30 px-1.5 py-0.5 rounded uppercase tracking-wider">PINNED</span>
                    <span className="truncate">{pinnedMessage}</span>
                  </div>
                  {(role === 'admin' || role === 'moderator' || role === 'dj') && (
                    <button onClick={() => setPinnedMessage(null)} className="text-white/40 hover:text-white ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Tab view area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[45dvh] lg:max-h-[350px] scrollbar-thin">
              {chatTab === 'Live Chat' ? (
                <>
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="flex gap-2.5 items-start">
                      <img src={msg.avatar} alt="" className="h-8 w-8 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1 bg-white/[0.02] border border-white/5 rounded-2xl px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-black flex items-center gap-1 ${msg.isArtist ? 'text-purple-300' : 'text-white/70'}`}>
                            {msg.author}
                            {msg.badge && (
                              <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border ${
                                msg.role === 'admin' 
                                  ? 'bg-red-500/20 border-red-500/30 text-red-300' 
                                  : msg.role === 'dj' 
                                    ? 'bg-blue-500/20 border-blue-500/30 text-blue-300' 
                                    : msg.role === 'moderator' 
                                      ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' 
                                      : 'bg-purple-500/10 border-purple-400/20 text-purple-300'
                              }`}>
                                {msg.badge}
                              </span>
                            )}
                          </span>
                          <span className="text-[9px] text-white/30">{msg.timestamp}</span>
                        </div>
                        <p className="text-xs text-white/80 mt-1 leading-relaxed break-words">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </>
              ) : chatTab === 'Polls' ? (
                <div className="space-y-4 py-4 text-center">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 mb-2">
                    <Crown className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">Interactive Polls Room</h4>
                  <p className="text-[11px] text-white/40 max-w-[200px] mx-auto">No mini polls are running in this session. Host can launch a poll from the control drawer.</p>
                </div>
              ) : chatTab === 'Requests' ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-white/50 uppercase tracking-widest mb-3">Live Fan Requests</h4>
                  
                  {/* Mock Request list */}
                  <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">"Run It Back Round 1!"</div>
                        <div className="text-[10px] text-white/40 truncate">Request by Casey - 2m ago</div>
                    </div>
                    {role === 'dj' && (
                      <button 
                        onClick={() => {
                          setChatMessages(prev => [...prev, {
                            id: `system-rib-${Date.now()}`,
                            author: 'Host Actions',
                            avatar: MOCK_SONG_WAR_ARTISTS.djSparkles.avatar,
                            message: 'Host accepted run-it-back request. Replaying Round 1 songs...',
                            timestamp: 'Just now',
                            role: 'dj',
                            badge: 'Host',
                          }]);
                        }}
                        className="text-[9px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-400/20 px-2 py-1 rounded"
                      >
                        Accept
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-white/50 uppercase tracking-widest mb-3">Top VIP Supporters</h4>
                  {[
                    { name: 'Jordan', badge: 'Top Fan', pts: '18,420 pts', avatar: MOCK_SONG_WAR_ARTISTS.treyTrizzy.avatar },
                    { name: 'Casey', badge: 'Request Captain', pts: '15,110 pts', avatar: MOCK_SONG_WAR_ARTISTS.milaRain.avatar },
                    { name: 'Liv', badge: 'Premiere Star', pts: '13,240 pts', avatar: MOCK_SONG_WAR_ARTISTS.jaye.avatar },
                  ].map((vip, i) => (
                    <div key={vip.name} className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-white/40 w-4">{i + 1}</span>
                        <img src={vip.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                        <div>
                          <div className="text-xs font-bold text-white">{vip.name}</div>
                          <div className="text-[9px] text-purple-300 font-bold">{vip.badge}</div>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-white/50">{vip.pts}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="p-4 border-t border-white/5 bg-black/40 relative">
              
              <div className="mb-2 flex items-center justify-between gap-2 text-[10px] text-white/45">
                <span>{slowMode ? 'Slow mode: 3s delay' : 'Live chat speed'}</span>
                <span className="text-cyan-300">VibeGeneral is typing...</span>
              </div>

              {/* Interaction tools */}
              <div className="flex gap-2 mb-3">
                <span className="hidden items-center rounded-xl border border-white/8 bg-white/5 px-2 text-[9px] font-black uppercase tracking-wider text-white/40 sm:flex">Animated reactions</span>
                <EmojiTray 
                  onSelect={(emoji) => triggerFloatingReaction(emoji)} 
                  disabled={reactionsDisabled}
                />
                
                {/* Concept GIF picker */}
                <button
                  onClick={() => setShowGIFPicker(!showGIFPicker)}
                  className="rounded-xl border border-white/8 bg-white/5 px-3 py-1.5 text-[10px] font-black text-white/70 hover:bg-white/10"
                >
                  GIF
                </button>
              </div>

              {showGIFPicker && (
                <GIFPickerPlaceholder 
                  onSelect={(gifUrl) => {
                    setChatMessages(prev => [...prev, {
                      id: `gif-msg-${Date.now()}`,
                      author: 'You (Jordan)',
                      avatar: MOCK_SONG_WAR_ARTISTS.djSparkles.avatar,
                      message: `GIF: ${gifUrl}`,
                      timestamp: 'Just now',
                      role: 'fan',
                    }]);
                    setShowGIFPicker(false);
                    triggerFloatingReaction('\uD83D\uDD25');
                  }}
                  onClose={() => setShowGIFPicker(false)}
                />
              )}

              {/* Main text input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  disabled={chatLocked && role !== 'admin' && role !== 'moderator'}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 rounded-full border border-white/10 bg-black/40 px-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none"
                  placeholder={chatLocked ? "Chat locked by moderator" : "Type live message..."}
                />
                <button
                  onClick={handleSendMessage}
                  className="rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 p-2.5 text-white hover:scale-105 active:scale-95 transition-all"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

            </div>

          </GlassCard>

          {/* Role-based privilege controls panels */}
          {role === 'artist' && (
            <div className="bg-purple-950/20 border border-purple-500/25 rounded-2xl p-4">
              <h4 className="text-xs font-black text-purple-300 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Radio className="h-4 w-4 text-purple-400 animate-pulse" /> Artist Participant Controls
              </h4>
              <p className="text-[10px] text-white/50 leading-relaxed mb-3">As an active competitor, you can record voice drops and post live notices directly to fan chat queues.</p>
              <button 
                onClick={handleSendArtistDrop}
                className="w-full rounded-xl bg-purple-500/25 border border-purple-400/40 text-xs font-bold text-white py-2.5 hover:bg-purple-500/40 transition-all"
              >
                Send Live Artist Voice Drop
              </button>
            </div>
          )}

          {(role === 'dj' || role === 'admin') && (
            <div className="bg-blue-950/20 border border-blue-500/25 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-black text-blue-300 uppercase tracking-widest flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-blue-400 animate-pulse" /> Host Control Drawer
              </h4>
              
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-white uppercase">
                <button 
                  onClick={() => handleHostAction('open_voting')}
                  disabled={roundStatus === 'voting'}
                  className="rounded bg-blue-500/20 border border-blue-400/30 p-2 text-center hover:bg-blue-500/35 transition-all disabled:opacity-50"
                >
                  Open Voting
                </button>
                <button 
                  onClick={() => handleHostAction('close_voting')}
                  disabled={roundStatus !== 'voting'}
                  className="rounded bg-rose-500/20 border border-rose-400/30 p-2 text-center hover:bg-rose-500/35 transition-all disabled:opacity-50"
                >
                  Lock Voting
                </button>
                <button 
                  onClick={() => handleHostAction('reveal_winner')}
                  disabled={roundStatus !== 'completed' && roundStatus !== 'voting'}
                  className="rounded bg-amber-500/20 border border-amber-400/30 p-2 text-center hover:bg-amber-500/35 transition-all disabled:opacity-50"
                >
                  Reveal Winner
                </button>
                <button 
                  onClick={() => handleHostAction('next_round')}
                  className="rounded bg-purple-500/20 border border-purple-400/30 p-2 text-center hover:bg-purple-500/35 transition-all"
                >
                  Next Round
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[9px] font-black text-white/50 uppercase border-t border-white/5 pt-2">
                <button 
                  onClick={() => handleHostAction('sponsor_break')}
                  className="text-left hover:text-white"
                >
                  Trigger Sponsor Break
                </button>
                <button 
                  onClick={() => handleHostAction('end_battle')}
                  className="text-right text-rose-300 hover:text-rose-100"
                >
                  End Battle Session
                </button>
              </div>
            </div>
          )}

          {(role === 'moderator' || role === 'admin') && (
            <div className="bg-amber-950/20 border border-amber-500/25 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-black text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-amber-400 animate-pulse" /> Moderator Control Box
              </h4>
              
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-white uppercase">
                <button 
                  onClick={() => handleModAction('lock_chat')}
                  className="rounded bg-amber-500/25 border border-amber-400/35 p-2 text-center hover:bg-amber-500/40"
                >
                  {chatLocked ? 'Unlock Chat' : 'Lock Chat'}
                </button>
                <button 
                  onClick={() => handleModAction('slow_mode')}
                  className="rounded bg-amber-500/25 border border-amber-400/35 p-2 text-center hover:bg-amber-500/40"
                >
                  {slowMode ? 'Disable Slow' : 'Slow Chat (3s)'}
                </button>
                <button 
                  onClick={() => handleModAction('clear_gifs')}
                  className="rounded bg-amber-500/25 border border-amber-400/35 p-2 text-center hover:bg-amber-500/40"
                >
                  Clear GIFs
                </button>
                <button 
                  onClick={() => setReactionsDisabled(!reactionsDisabled)}
                  className="rounded bg-amber-500/25 border border-amber-400/35 p-2 text-center hover:bg-amber-500/40"
                >
                  {reactionsDisabled ? 'Enable Reacts' : 'Disable Reacts'}
                </button>
              </div>
            </div>
          )}

          {role === 'admin' && (
            <div className="bg-red-950/20 border border-red-500/25 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-black text-red-300 uppercase tracking-widest flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-red-400 animate-pulse" /> Administrator Overrides
              </h4>
              
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-white uppercase">
                <button 
                  onClick={() => handleAdminOverride('A')}
                  className="rounded bg-red-500/25 border border-red-400/35 p-2 text-center hover:bg-red-500/40"
                >
                  Override Win A
                </button>
                <button 
                  onClick={() => handleAdminOverride('B')}
                  className="rounded bg-red-500/25 border border-red-400/35 p-2 text-center hover:bg-red-500/40"
                >
                  Override Win B
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Confirmation Modals & Winner reveals */}
      {showExitConfirm && (
        <ExitBattleModal 
          onConfirm={() => {
            setShowExitConfirm(false);
            onNavigate({ view: 'hub' });
          }}
          onCancel={() => setShowExitConfirm(false)}
        />
      )}

      {showWinnerReveal && currentWinner && (
        <WinnerReveal
          winner={currentWinner}
          score={`${battle.scoreA} - ${battle.scoreB}`}
          prize={battle.prize}
          winningSong={battle.rounds[battle.rounds.length - 1].trackA.title}
          onClose={() => {
            setShowWinnerReveal(false);
            onNavigate({ view: 'results', battleId: battle.id });
          }}
        />
      )}

    </div>
  );
};
