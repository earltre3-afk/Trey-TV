import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  GameMode,
  NounType,
  TreynounMatchState,
  TreynounRoundState,
  TreynounScoreBreakdown,
  TreynounScreen,
} from './treynounTypes';
import { resetMatch, resetRound, calculateRoundScore } from './treynounScoring';
import { getMockNounForCategory, getMockSignalsForNoun, buildSignals } from './treynounUtils';
import { loadStats, recordMatch, recordBattle, TreynounStats } from './treynounStorage';


import TreynounHome from './screens/TreynounHome';
import TreynounModeSelect from './screens/TreynounModeSelect';
import TreynounTargetSetup from './screens/TreynounTargetSetup';
import TreynounTrailBuilder from './screens/TreynounTrailBuilder';
import TreynounChaseScreen from './screens/TreynounChaseScreen';
import TreynounCorrectScreen from './screens/TreynounCorrectScreen';
import TreynounFailedScreen from './screens/TreynounFailedScreen';
import TreynounMatchResults from './screens/TreynounMatchResults';
import TreynounBattleLobby from './screens/TreynounBattleLobby';
import TreynounBattleScreen from './screens/TreynounBattleScreen';
import TreynounLiveRoom from './screens/TreynounLiveRoom';
import TreynounLeaderboard from './screens/TreynounLeaderboard';

const cats: NounType[] = ['person', 'place', 'thing'];

const TreynounGame: React.FC = () => {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<TreynounScreen>('home');
  const [match, setMatch] = useState<TreynounMatchState>(() => resetMatch('solo', 'normal'));
  const [round, setRound] = useState<TreynounRoundState | null>(null);
  const [breakdown, setBreakdown] = useState<TreynounScoreBreakdown | null>(null);
  const [lastReason, setLastReason] = useState('');
  const [lastGems, setLastGems] = useState(0);
  // pass-the-noun setup
  const [setupCat, setSetupCat] = useState<NounType>('thing');
  const [setupNoun, setSetupNoun] = useState('');
  // persisted lifetime stats
  const [stats, setStats] = useState<TreynounStats>(() => loadStats());
  const recordedRef = useRef(false);

  const exitToGames = () => navigate('/games');

  // Persist a finished match exactly once, then show results.
  const finishMatch = () => {
    if (!recordedRef.current) {
      recordedRef.current = true;
      setStats(recordMatch(match));
    }
    setScreen('match-results');
  };

  const startSoloRun = () => {
    const m = resetMatch('solo', 'normal');
    setMatch(m);
    recordedRef.current = false;
    beginSoloRound(1, m);
    toast.success('Noun Chase started! Clear the run.');
  };


  const beginSoloRound = (roundNumber: number, m: TreynounMatchState) => {
    const cat = cats[Math.floor(Math.random() * cats.length)];
    const used = m.history.map((h) => h.noun);
    const noun = getMockNounForCategory(cat, used);
    const signals = getMockSignalsForNoun(noun, cat);
    setRound(resetRound(roundNumber, cat, noun, signals, 60));
    setScreen('chase');
  };

  const beginPassRound = (cat: NounType, noun: string, clues: string[]) => {
    const signals = buildSignals(cat, clues);
    setRound(resetRound(1, cat, noun, signals, 60));
    setMatch(resetMatch('pass-noun', 'normal'));
    recordedRef.current = false;
    setScreen('chase');
  };


  const handleWin = (finalRound: TreynounRoundState) => {
    const bd = calculateRoundScore(finalRound, match.streak);
    const timeUsed = finalRound.maxTime - finalRound.timeLeft;
    const gems = match.streak + 1 >= 5 ? 2 : 1;
    setBreakdown(bd);
    setLastGems(gems);
    setRound({ ...finalRound, scoreBreakdown: bd });
    setMatch((m) => {
      const newStreak = m.streak + 1;
      return {
        ...m,
        totalScore: m.totalScore + bd.total,
        roundsWon: m.roundsWon + 1,
        streak: newStreak,
        bestStreak: Math.max(m.bestStreak, newStreak),
        fastestLockIn: m.fastestLockIn === null ? timeUsed : Math.min(m.fastestLockIn, timeUsed),
        gemsEarned: m.gemsEarned + gems,
        history: [...m.history, { round: finalRound.roundNumber, category: finalRound.category, noun: finalRound.targetNoun, won: true, score: bd.total, timeUsed }],
      };
    });
    setScreen('correct');
  };

  const handleLose = (finalRound: TreynounRoundState, reason: string) => {
    setLastReason(reason);
    setRound(finalRound);
    setMatch((m) => ({
      ...m,
      roundsFailed: m.roundsFailed + 1,
      streak: 0,
      history: [...m.history, { round: finalRound.roundNumber, category: finalRound.category, noun: finalRound.targetNoun, won: false, score: 0, timeUsed: finalRound.maxTime }],
    }));
    setScreen('failed');
  };

  const nextRound = () => {
    if (match.mode === 'pass-noun') { finishMatch(); return; }
    const next = match.currentRound + 1;
    if (next > match.totalRounds || match.roundsFailed >= 3) {
      finishMatch();
      return;
    }
    setMatch((m) => ({ ...m, currentRound: next }));
    beginSoloRound(next, { ...match, currentRound: next });
  };


  const retryRound = () => {
    if (!round) return;
    if (match.mode === 'pass-noun') {
      beginPassRound(round.category, round.targetNoun, round.signals.map((s) => s.text));
    } else {
      setRound(resetRound(round.roundNumber, round.category, round.targetNoun, round.signals, 60));
      setScreen('chase');
    }
  };

  const isLastRound = match.currentRound >= match.totalRounds || match.roundsFailed >= 3 || match.mode === 'pass-noun';

  // ---------- render ----------
  if (screen === 'home')
    return (
      <TreynounHome
        stats={stats}
        onPlay={startSoloRun}
        onMode={(m: GameMode) => {
          if (m === 'solo') startSoloRun();
          else if (m === 'battle') setScreen('battle-lobby');
          else if (m === 'live-room') setScreen('live-room');
          else if (m === 'pass-noun') setScreen('target-setup');
        }}
        onModeSelect={() => setScreen('mode-select')}
        onLeaderboard={() => setScreen('leaderboard')}
        onExit={exitToGames}
      />
    );


  if (screen === 'mode-select')
    return (
      <TreynounModeSelect
        onPick={(m) => {
          if (m === 'solo') startSoloRun();
          else if (m === 'battle') setScreen('battle-lobby');
          else if (m === 'live-room') setScreen('live-room');
          else if (m === 'pass-noun') setScreen('target-setup');
          else toast('Daily Noun Drop is coming soon!');
        }}
        onBack={() => setScreen('home')}
        onExit={exitToGames}
      />
    );

  if (screen === 'target-setup')
    return (
      <TreynounTargetSetup
        initialCategory={setupCat}
        onContinue={(cat, noun) => { setSetupCat(cat); setSetupNoun(noun); setScreen('trail-builder'); }}
        onBack={() => setScreen('home')}
        onExit={exitToGames}
      />
    );

  if (screen === 'trail-builder')
    return (
      <TreynounTrailBuilder
        category={setupCat}
        targetNoun={setupNoun}
        onStart={(clues) => beginPassRound(setupCat, setupNoun, clues)}
        onBack={() => setScreen('target-setup')}
        onExit={exitToGames}
      />
    );

  if (screen === 'chase' && round)
    return (
      <TreynounChaseScreen
        round={round}
        roundNumber={match.currentRound}
        totalRounds={match.totalRounds}
        totalScore={match.totalScore}
        streak={match.streak}
        onWin={handleWin}
        onLose={handleLose}
        onExit={() => setScreen('home')}
      />
    );

  if (screen === 'correct' && round && breakdown)
    return (
      <TreynounCorrectScreen
        round={round}
        breakdown={breakdown}
        streak={match.streak}
        gems={lastGems}
        isLastRound={isLastRound}
        onNext={nextRound}
        onResults={finishMatch}
        onExit={exitToGames}
      />
    );


  if (screen === 'failed' && round)
    return (
      <TreynounFailedScreen
        round={round}
        reason={lastReason}
        isLastRound={isLastRound}
        onNext={nextRound}
        onRetry={retryRound}
        onExit={exitToGames}
      />
    );

  if (screen === 'match-results')
    return (
      <TreynounMatchResults
        match={match}
        onPlayAgain={() => { setScreen('home'); }}
        onExit={exitToGames}
      />
    );

  if (screen === 'battle-lobby')
    return <TreynounBattleLobby onStart={() => setScreen('battle-chase')} onBack={() => setScreen('home')} onExit={exitToGames} />;

  if (screen === 'battle-chase')
    return (
      <TreynounBattleScreen
        onFinish={(glow, vibe) => {
          setStats(recordBattle(glow, vibe));
          toast.success(glow > vibe ? 'Team Glow wins the Battle!' : vibe > glow ? 'Team Vibe wins the Battle!' : 'Sudden Chase tie!');
          setScreen('home');
        }}
        onExit={() => setScreen('home')}
      />
    );

  if (screen === 'live-room') return <TreynounLiveRoom onExit={() => setScreen('home')} />;

  if (screen === 'leaderboard') return <TreynounLeaderboard stats={stats} onBack={() => setScreen('home')} onExit={exitToGames} />;


  return <TreynounHome onPlay={startSoloRun} onMode={() => {}} onModeSelect={() => setScreen('mode-select')} onLeaderboard={() => setScreen('leaderboard')} onExit={exitToGames} />;
};

export default TreynounGame;
