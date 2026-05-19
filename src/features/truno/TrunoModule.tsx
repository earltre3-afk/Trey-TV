// TRUNO — Trey TV's original card game. Main module entry point.
// Pattern mirrors GameRoomModule.tsx for consistency.
import React, { useMemo, useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import MatchScreen from './screens/MatchScreen';
import RoomScreen from './screens/RoomScreen';
import TournamentScreen from './screens/TournamentScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import ClubsScreen from './screens/ClubsScreen';
import ProfileScreen from './screens/ProfileScreen';
import InboxScreen from './screens/InboxScreen';
import PassScreen from './screens/PassScreen';
import TutorialScreen from './screens/TutorialScreen';
import VictoryScreen from './screens/VictoryScreen';
import PlayScreen from './screens/PlayScreen';
import { useCurrentUser } from '@/hooks/use-current-user';
import { createRoom, joinRoomByCode } from '@/features/games/lib/services/roomService';
import { identityFromTreyUser } from '@/features/games/lib/services/identity';

export type TrunoView =
  | 'home'
  | 'match'
  | 'room'
  | 'tournament'
  | 'leaderboard'
  | 'clubs'
  | 'profile'
  | 'inbox'
  | 'pass'
  | 'tutorial'
  | 'victory'
  | 'play';

interface Props {
  initialView?: TrunoView;
  onExitToGames?: () => void;
}

const SCREEN_BG = 'min-h-screen bg-zinc-950 text-white font-sans antialiased overflow-x-hidden';

const TrunoModule: React.FC<Props> = ({ initialView = 'home', onExitToGames }) => {
  const currentUser = useCurrentUser();
  const identity = useMemo(() => identityFromTreyUser({
    name: currentUser.name,
    username: currentUser.handle,
    publicProfileUid: currentUser.uid,
    avatarUrl: currentUser.avatar,
  }), [currentUser.avatar, currentUser.handle, currentUser.name, currentUser.uid]);
  const [view, setView] = useState<TrunoView>(initialView);
  const [matchParams, setMatchParams] = useState<any>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);

  const navigate = (nextView: string, params?: any) => {
    if (nextView === 'exit') {
      onExitToGames?.();
      return;
    }
    setMatchParams(params ?? null);
    setView(nextView as TrunoView);
  };

  const startLocalMatch = (mode: 'quick' | 'ai' = 'quick') => {
    setRoomId(null);
    navigate('match', { mode });
  };

  const createPrivateRoom = async () => {
    setRoomError(null);
    try {
      const { room } = await createRoom({ identity, gameType: 'truno', isPrivate: true, targetScore: 500 });
      setRoomId(room.id);
      navigate('room', { roomId: room.id });
    } catch (e: any) {
      setRoomError(e?.message || 'Could not create a Truno room.');
      navigate('room', { unavailable: true });
    }
  };

  const joinRoom = async (code: string) => {
    setRoomError(null);
    const { room } = await joinRoomByCode(code, identity);
    if (room.game_type !== 'truno') throw new Error('That code belongs to another Trey TV game.');
    setRoomId(room.id);
    navigate('room', { roomId: room.id });
  };

  return (
    <div className={SCREEN_BG}>
      {/* Ambient background shared across all screens */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-50">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[160px]"
          style={{ background: 'radial-gradient(circle, rgba(157,78,221,0.35) 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(0,217,255,0.2) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/2 w-[600px] h-[400px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(255,0,128,0.15) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10">
        {view === 'home'         && <HomeScreen         onNavigate={navigate} onQuickPlay={() => startLocalMatch('quick')} onAiMatch={() => startLocalMatch('ai')} onPlayFriends={createPrivateRoom} />}
        {view === 'match'        && <MatchScreen         onNavigate={navigate} identity={identity} roomId={matchParams?.roomId ?? roomId} mode={matchParams?.mode ?? 'quick'} />}
        {view === 'room'         && <RoomScreen          onNavigate={navigate} identity={identity} roomId={matchParams?.roomId ?? roomId} roomError={roomError} suppressActiveSession={!!matchParams?.suppressActiveSession} onJoinRoom={joinRoom} onRoomReady={(id) => setRoomId(id)} />}
        {view === 'tournament'   && <TournamentScreen    onNavigate={navigate} />}
        {view === 'leaderboard'  && <LeaderboardScreen />}
        {view === 'clubs'        && <ClubsScreen         onNavigate={navigate} />}
        {view === 'profile'      && <ProfileScreen />}
        {view === 'inbox'        && <InboxScreen         onNavigate={navigate} />}
        {view === 'pass'         && <PassScreen />}
        {view === 'tutorial'     && <TutorialScreen      onNavigate={navigate} />}
        {view === 'victory'      && <VictoryScreen       onNavigate={navigate} />}
        {view === 'play'         && <PlayScreen          onNavigate={navigate} onQuickPlay={() => startLocalMatch('quick')} onAiMatch={() => startLocalMatch('ai')} onPlayFriends={createPrivateRoom} />}
      </div>
    </div>
  );
};

export default TrunoModule;
