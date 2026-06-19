// Trap Tap — entry component + screen state machine.
// Mount under /games/traptap. Mirrors the Treynoun standalone-game pattern.

import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { SONGS, DIFFICULTIES } from './traptapData';
import { recordResult } from './traptapStorage';
import { TrapTapResult, TrapTapScreen } from './traptapTypes';

import TrapTapHome from './screens/TrapTapHome';
import TrapTapGameplay from './screens/TrapTapGameplay';
import TrapTapResults from './screens/TrapTapResults';

const TrapTapGame: React.FC = () => {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<TrapTapScreen>('home');
  const [songIndex, setSongIndex] = useState(0);
  const [diffIndex, setDiffIndex] = useState(2); // Hard
  const [result, setResult] = useState<TrapTapResult | null>(null);
  // Remount key forces a fresh engine on retry / new run.
  const [runKey, setRunKey] = useState(0);

  const exitToGames = () => navigate({ to: '/games' });

  const startRun = () => { setRunKey((k) => k + 1); setScreen('gameplay'); };

  const handleFinish = (r: TrapTapResult) => {
    recordResult(r);
    setResult(r);
    setScreen('results');
  };

  if (screen === 'gameplay') {
    return (
      <TrapTapGameplay
        key={runKey}
        song={SONGS[songIndex]}
        difficulty={DIFFICULTIES[diffIndex]}
        onFinish={handleFinish}
        onExit={() => setScreen('home')}
      />
    );
  }

  if (screen === 'results' && result) {
    return (
      <TrapTapResults
        result={result}
        onPlayAgain={startRun}
        onExit={() => setScreen('home')}
      />
    );
  }

  return (
    <TrapTapHome
      songIndex={songIndex}
      diffIndex={diffIndex}
      onSelectSong={setSongIndex}
      onSelectDiff={setDiffIndex}
      onPlay={startRun}
      onExit={exitToGames}
    />
  );
};

export default TrapTapGame;
