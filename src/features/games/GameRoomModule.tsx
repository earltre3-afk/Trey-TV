// Trey TV Game Room — main module entry point.
import './trey-game-room.css';
import React, { useEffect, useState } from 'react';
import { GameRoomHome } from './components/GameRoomHome';
import { SpadesTable } from './components/spades/SpadesTable';
import { BlackjackTable } from './components/blackjack/BlackjackTable';
import { BullshitTable } from './components/bullshit/BullshitTable';
import { AdminPanel } from './components/AdminPanel';
import { SuitLegendModal } from './components/shared/SuitLegendModal';
import { CreateRoomModal, JoinRoomModal } from './components/lounge/CreateJoinModals';
import { RoomLobby } from './components/lounge/RoomLobby';
import { QueueScreen } from './components/lounge/QueueScreen';
import { FriendInviteCenter } from './components/lounge/FriendInviteCenter';
import { GameRequestsInbox } from './components/lounge/GameRequestsInbox';
import { getOrCreateIdentity, identityFromTreyUser, setDisplayName, PlayerIdentity, TreyGameUserInput } from './lib/services/identity';
import {
  createRoom, joinRoomByCode, GameType, getActiveSession, findRoomByCode,
} from './lib/services/roomService';
import { GameRequest } from './lib/services/socialService';

export type GameView = 'home' | 'lobby' | 'spades' | 'blackjack' | 'bullshit' | 'admin' | 'queue' | 'friends' | 'inbox';

interface RoomCtx { roomId: string; gameType: GameType; }

export const GameRoomModule: React.FC<{ initialView?: GameView; currentUser?: TreyGameUserInput | null }> = ({ initialView = 'home', currentUser = null }) => {
  const [view, setView] = useState<GameView>(initialView);
  const [legendOpen, setLegendOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaultGame, setCreateDefaultGame] = useState<GameType>('spades');
  const [joinOpen, setJoinOpen] = useState(false);
  const [identity, setIdentity] = useState<PlayerIdentity>(() => currentUser ? identityFromTreyUser(currentUser) : getOrCreateIdentity());
  const [room, setRoom] = useState<RoomCtx | null>(null);
  const [queueGame, setQueueGame] = useState<GameType>('spades');

  useEffect(() => {
    if (currentUser) setIdentity(identityFromTreyUser(currentUser));
  }, [currentUser?.id, currentUser?.userId, currentUser?.displayName, currentUser?.username, currentUser?.publicProfileUid, currentUser?.public_profile_uid, currentUser?.site_uid, currentUser?.avatarUrl, currentUser?.avatar_url]);

  useEffect(() => {
    if (room && view === 'lobby') {
      getActiveSession(room.roomId).then(s => {
        if (s) setView(room.gameType);
      });
    }
  }, [room, view]);

  const handleCreate = async (opts: { gameType: GameType; isPrivate: boolean; targetScore: number }) => {
    const { room: newRoom } = await createRoom({ identity, ...opts });
    setRoom({ roomId: newRoom.id, gameType: opts.gameType });
    setCreateOpen(false);
    setView('lobby');
  };

  const handleJoin = async (code: string) => {
    const { room: joined } = await joinRoomByCode(code, identity);
    setRoom({ roomId: joined.id, gameType: joined.game_type });
    setJoinOpen(false);
    const s = await getActiveSession(joined.id);
    setView(s ? joined.game_type : 'lobby');
  };

  const handleMatched = (roomId: string, gameType: GameType) => {
    setRoom({ roomId, gameType });
    setView('lobby');
  };

  const handleAcceptInbox = async (req: GameRequest) => {
    try {
      if (req.room_code) {
        const r = await findRoomByCode(req.room_code);
        if (r) {
          const { room: joined } = await joinRoomByCode(req.room_code, identity);
          setRoom({ roomId: joined.id, gameType: joined.game_type });
          const s = await getActiveSession(joined.id);
          setView(s ? joined.game_type : 'lobby');
          return;
        }
      }
      // fallback — drop them into the queue for that game
      setQueueGame(req.game_type);
      setView('queue');
    } catch {
      setQueueGame(req.game_type);
      setView('queue');
    }
  };

  const handleBackToHome = () => { setRoom(null); setView('home'); };

  const handleEditName = () => {
    const next = prompt('Your display name:', identity.displayName);
    if (next && next.trim()) {
      setDisplayName(next);
      setIdentity({ ...identity, displayName: next.trim().slice(0, 24) });
    }
  };

  const renderGameTable = (game: GameType) => {
    const commonProps = room
      ? { roomId: room.roomId, identity, onBack: handleBackToHome, onLegend: () => setLegendOpen(true) }
      : { onBack: handleBackToHome, onLegend: () => setLegendOpen(true) };
    if (game === 'spades') return <SpadesTable {...commonProps} />;
    if (game === 'blackjack') return <BlackjackTable {...commonProps} />;
    return <BullshitTable {...commonProps} />;
  };

  return (
    <div className="trey-game-room font-sans antialiased" style={{ background: '#05070D', color: '#F8FAFC', minHeight: '100vh' }}>
      {view === 'home' && (
        <GameRoomHome
          displayName={identity.displayName}
          userId={identity.userId}
          onEditName={handleEditName}
          onLaunchSolo={(g) => { setRoom(null); setView(g); }}
          onCreateRoom={(g) => { setCreateDefaultGame(g || 'spades'); setCreateOpen(true); }}
          onJoinRoom={() => setJoinOpen(true)}
          onAdmin={() => setView('admin')}
          onLegend={() => setLegendOpen(true)}
          onJoinQueue={(g) => { setQueueGame(g); setView('queue'); }}
          onOpenFriends={() => setView('friends')}
          onOpenInbox={() => setView('inbox')}
        />
      )}

      {view === 'queue' && (
        <QueueScreen
          gameType={queueGame}
          identity={identity}
          onBack={handleBackToHome}
          onMatched={handleMatched}
          onInviteFriends={() => setView('friends')}
        />
      )}

      {view === 'friends' && (
        <FriendInviteCenter
          identity={identity}
          defaultGame={queueGame}
          roomId={room?.roomId ?? null}
          roomCode={null}
          onBack={() => setView('home')}
        />
      )}

      {view === 'inbox' && (
        <GameRequestsInbox
          identity={identity}
          onBack={() => setView('home')}
          onAccept={handleAcceptInbox}
        />
      )}

      {view === 'lobby' && room && (
        <RoomLobby
          roomId={room.roomId}
          identity={identity}
          onBack={handleBackToHome}
          onSessionStarted={() => setView(room.gameType)}
        />
      )}

      {view === 'spades' && renderGameTable('spades')}
      {view === 'blackjack' && renderGameTable('blackjack')}
      {view === 'bullshit' && renderGameTable('bullshit')}
      {view === 'admin' && <AdminPanel onBack={handleBackToHome} />}

      <SuitLegendModal open={legendOpen} onClose={() => setLegendOpen(false)} />
      <CreateRoomModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} defaultGame={createDefaultGame} />
      <JoinRoomModal open={joinOpen} onClose={() => setJoinOpen(false)} onJoin={handleJoin} />
    </div>
  );
};

export const AdminGameRoomModule: React.FC = () => (
  <div className="trey-game-room font-sans antialiased" style={{ background: '#05070D', color: '#F8FAFC', minHeight: '100vh' }}>
    <AdminPanel onBack={() => window.history.back()} />
  </div>
);

export default GameRoomModule;
