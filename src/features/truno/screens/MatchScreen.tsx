import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Mic, MessageSquare, Send, Plus, Trophy, MoreVertical, ChevronDown, Clock, Play } from 'lucide-react';
import TrunoCard from '../components/TrunoCard';
import { avatarFor } from '../lib/avatars';
import { useCurrentUser } from '@/hooks/use-current-user';
import { PlayerIdentity } from '@/features/games/lib/services/identity';
import { useRealtimeRoom } from '@/features/games/hooks/useRealtimeRoom';
import {
  applyPlayerMove,
  createTrunoGame,
  currentPlayer,
  isPlayableCard,
  maybeRunBotTurn,
  topCard,
  TrunoGameState,
  TrunoMove,
} from '../lib/trunoEngine';

interface Props {
  onNavigate: (view: string, params?: any) => void;
  identity: PlayerIdentity;
  roomId?: string | null;
  mode?: 'quick' | 'ai';
}

const MatchScreen: React.FC<Props> = ({ onNavigate, identity, roomId = null, mode = 'quick' }) => {
  const currentUser = useCurrentUser();
  const [localState, setLocalState] = useState<TrunoGameState>(() => (
    createTrunoGame([
      { id: identity.userId, name: identity.displayName, isBot: false },
      { id: 'local-bot-1', name: 'Aaliyah', isBot: true },
      { id: 'local-bot-2', name: 'Marcus', isBot: true },
      ...(mode === 'ai' ? [] : [{ id: 'local-bot-3', name: 'Nova', isBot: true }]),
    ])
  ));
  const [selected, setSelected] = useState<string | null>(null);
  const [voice, setVoice] = useState(false);
  const [chat, setChat] = useState(false);
  const [chatDraft, setChatDraft] = useState('');
  const [localChat, setLocalChat] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const lastBotTurn = useRef<string | null>(null);

  const applyRoomMove = useCallback((state: TrunoGameState, move: { type: string; seat: number; payload?: any }) => {
    const player = state.players[move.seat];
    if (!player) return state;
    if (move.type === 'play') {
      return applyPlayerMove(state, { type: 'play', playerId: player.id, cardId: move.payload?.cardId, wildColor: move.payload?.wildColor });
    }
    if (move.type === 'draw') return applyPlayerMove(state, { type: 'draw', playerId: player.id });
    if (move.type === 'call-truno') return applyPlayerMove(state, { type: 'call-truno', playerId: player.id });
    return state;
  }, []);

  const extractMeta = useCallback((state: TrunoGameState) => ({
    currentSeat: state.currentPlayerIndex,
    phase: state.phase,
    round: state.turn,
    ended: state.phase === 'ended',
  }), []);

  const room = useRealtimeRoom(roomId, identity, applyRoomMove, extractMeta);
  const state = (roomId ? room.state : localState) as TrunoGameState | null;

  useEffect(() => {
    if (!roomId || !state || !room.isHost || state.phase === 'ended') return;
    const active = currentPlayer(state);
    if (!active?.isBot) return;
    if (lastBotTurn.current === state.lastMoveId) return;
    lastBotTurn.current = state.lastMoveId;
    const next = maybeRunBotTurn(state);
    if (next.lastMoveId !== state.lastMoveId) {
      room.setHostState(next);
    }
  }, [roomId, room, state]);

  if (!state) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-zinc-400">
        Loading Truno table...
      </div>
    );
  }

  const activePlayer = currentPlayer(state);
  const mySeat = roomId ? room.mySeat ?? 0 : state.players.findIndex((p) => !p.isBot);
  const me = state.players[mySeat] ?? state.players.find((p) => !p.isBot) ?? state.players[0];
  const myTurn = activePlayer?.id === me.id && state.phase === 'playing';
  const top = topCard(state);
  const selectedCard = me.hand.find((card) => card.id === selected) ?? null;
  const canPlaySelected = !!selectedCard && myTurn && isPlayableCard(selectedCard, state);
  const roomCode = room.room?.room_code ?? (roomId ? 'Loading' : mode === 'ai' ? 'AI MATCH' : 'QUICK PLAY');
  const tableLabel = roomId ? 'PRIVATE TABLE' : mode === 'ai' ? 'AI PRACTICE TABLE' : 'QUICK PLAY TABLE';

  const commitMove = async (move: TrunoMove) => {
    setNotice(null);
    if (roomId) {
      await room.sendMove({
        type: move.type,
        seat: mySeat,
        payload: move.type === 'play' ? { cardId: move.cardId, wildColor: move.wildColor } : {},
      });
      setSelected(null);
      return;
    }
    setLocalState((prev) => maybeRunBotTurn(applyPlayerMove(prev, move)));
    setSelected(null);
  };

  const handleCardTap = (cardId: string) => {
    const card = me.hand.find((c) => c.id === cardId);
    if (!card) return;
    if (!myTurn) {
      setNotice(`Waiting on ${activePlayer?.name ?? 'the table'}.`);
      return;
    }
    if (!isPlayableCard(card, state)) {
      setSelected(null);
      setNotice('That card does not match the current color, number, or action.');
      return;
    }
    setSelected((prev) => prev === cardId ? null : cardId);
  };

  const handlePlay = () => {
    if (!selectedCard) return;
    if (!canPlaySelected) {
      setNotice('Select a playable card first.');
      return;
    }
    commitMove({ type: 'play', playerId: me.id, cardId: selectedCard.id, wildColor: mostCommonColor(me.hand) });
  };

  const handleDraw = () => {
    if (!myTurn) {
      setNotice(`Waiting on ${activePlayer?.name ?? 'the table'}.`);
      return;
    }
    commitMove({ type: 'draw', playerId: me.id });
  };

  const handleCallTruno = () => {
    if (!myTurn) {
      setNotice('Call TRUNO on your turn.');
      return;
    }
    commitMove({ type: 'call-truno', playerId: me.id });
  };

  const handleSendChat = () => {
    const text = chatDraft.trim();
    if (!text) return;
    if (roomId) {
      setNotice('Room chat persistence is coming soon.');
    } else {
      setLocalChat((prev) => [...prev.slice(-3), text]);
    }
    setChatDraft('');
  };

  const leaveParams = roomId ? { roomId, suppressActiveSession: true } : undefined;

  return (
    <div className="px-3 pb-24">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button onClick={() => onNavigate(roomId ? 'room' : 'home', leaveParams)} className="w-9 h-9 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center">
            <ChevronDown className="rotate-90 text-zinc-300" size={16} />
          </button>
          <div className="rounded-xl bg-zinc-950/80 border border-zinc-800 px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <Trophy size={12} className="text-amber-400" />
              <span className="text-[10px] text-zinc-400 font-semibold">Room ID</span>
            </div>
            <span className="text-sm font-bold text-white">{roomCode}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate(roomId ? 'room' : 'home', leaveParams)}
            className="px-4 py-2 rounded-xl border border-pink-500/50 text-pink-300 text-sm font-bold hover:bg-pink-500/10"
          >
            Leave Match
          </button>
          <button onClick={() => setNotice('Table menu is coming soon.')} className="w-9 h-9 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center">
            <MoreVertical size={16} className="text-zinc-300" />
          </button>
        </div>
      </div>

      <div className="mx-auto w-fit rounded-full bg-zinc-950/80 border border-fuchsia-500/30 px-4 py-1.5 mb-4 flex items-center gap-3">
        <span className="text-xs font-bold text-fuchsia-300">{tableLabel}</span>
        <span className="text-xs text-zinc-500">|</span>
        <span className="text-xs text-zinc-300">{state.message}</span>
      </div>

      <div className="relative aspect-square max-w-md mx-auto">
        <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, transparent 35%, rgba(157,78,221,0.15) 50%, transparent 65%)' }} />
        <div className="absolute inset-8 rounded-full border border-purple-500/30" />
        <div className="absolute inset-16 rounded-full border border-fuchsia-500/20" />
        <div className="absolute inset-24 rounded-full border border-blue-500/20" />

        {state.players.map((player, index) => (
          <TablePlayer
            key={player.id}
            player={player}
            index={index}
            active={activePlayer?.id === player.id}
            isYou={player.id === me.id}
            avatar={player.id === me.id ? currentUser.avatar : undefined}
          />
        ))}

        <div className="absolute inset-0 flex items-center justify-center gap-3">
          <TrunoCard card={{ id: 'deck', color: 'black', symbol: 'wild', label: 'W' }} faceDown size="md" />
          {top && <TrunoCard card={top} size="md" playable />}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 bottom-1/4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/80 border border-zinc-800">
          <span className="text-[10px] text-zinc-400">Current Color</span>
          <div className={`w-4 h-4 rounded-full shadow-[0_0_10px_currentColor] ${colorClass(state.currentColor)}`} />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-2 text-xs">
        <button className={`flex items-center gap-1.5 px-3 py-1 rounded-full border font-bold ${myTurn ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-zinc-900/80 border-zinc-800 text-zinc-400'}`}>
          <ChevronDown size={14} className="rotate-180" /> {myTurn ? 'YOUR TURN' : `${activePlayer?.name ?? 'Table'} TURN`}
        </button>
        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300">
          <Clock size={12} /> Turn {state.turn}
        </span>
      </div>

      {state.phase === 'ended' && (
        <div className="mt-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-center text-sm font-black text-amber-300">
          {state.players.find((p) => p.id === state.winnerId)?.name ?? 'A player'} wins the table.
        </div>
      )}

      {notice && (
        <div className="mt-3 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-2 text-center text-xs text-fuchsia-200">
          {notice}
        </div>
      )}

      <div className="mt-3 relative flex justify-center items-end overflow-visible" style={{ height: 130 }}>
        {me.hand.map((c, i) => {
          const mid = Math.floor(me.hand.length / 2);
          const offset = i - mid;
          const isSel = selected === c.id;
          const playable = myTurn && isPlayableCard(c, state);
          return (
            <div
              key={c.id}
              className="absolute transition-transform"
              style={{
                transform: `translateX(${offset * 42}px) translateY(${Math.abs(offset) * 4}px) rotate(${offset * 5}deg) ${isSel ? 'translateY(-20px) scale(1.1)' : ''}`,
                zIndex: isSel ? 100 : 10 + i,
              }}
            >
              <TrunoCard card={c} size="sm" playable={playable} onClick={() => handleCardTap(c.id)} selected={isSel} />
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button onClick={handleDraw} disabled={!myTurn || state.phase === 'ended'} className="rounded-2xl border border-purple-500/40 bg-zinc-950/70 py-3 text-purple-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-purple-500/10 disabled:opacity-40">
          <Plus size={16} /> Draw
        </button>
        <button onClick={handleCallTruno} disabled={!myTurn || state.phase === 'ended'} className="rounded-2xl py-3 font-black text-sm relative overflow-hidden group disabled:opacity-50">
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600" />
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600 blur-md opacity-70 group-hover:opacity-100" />
          <div className="relative">
            <div className="text-white text-base leading-none">CALL TRUNO</div>
            <div className="text-[9px] text-fuchsia-100 mt-0.5">If you have 1 card left</div>
          </div>
        </button>
        <button
          onClick={handlePlay}
          disabled={!canPlaySelected || state.phase === 'ended'}
          className={`rounded-2xl border py-3 font-bold text-sm flex items-center justify-center gap-2 transition ${canPlaySelected ? 'border-cyan-500/40 bg-zinc-950/70 text-cyan-300 hover:bg-cyan-500/10' : 'border-zinc-800 bg-zinc-900/50 text-zinc-600'}`}
        >
          <Play size={15} /> Play Card
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button onClick={() => setVoice(!voice)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800">
          <div className={`w-7 h-7 rounded-full ${voice ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-zinc-800'} flex items-center justify-center`}>
            <Mic size={14} className={voice ? 'text-emerald-300' : 'text-zinc-500'} />
          </div>
          <span className="text-xs text-zinc-300">Voice: <span className={voice ? 'text-emerald-300 font-bold' : 'text-zinc-500'}>{voice ? 'On' : 'Off'}</span></span>
        </button>
        <button onClick={() => setChat(!chat)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800">
          <div className={`w-7 h-7 rounded-full ${chat ? 'bg-cyan-500/20 border border-cyan-500/50' : 'bg-zinc-800'} flex items-center justify-center`}>
            <MessageSquare size={14} className={chat ? 'text-cyan-300' : 'text-zinc-500'} />
          </div>
          <span className="text-xs text-zinc-300">Chat: <span className={chat ? 'text-cyan-300 font-bold' : 'text-zinc-500'}>{chat ? 'On' : 'Off'}</span></span>
        </button>
      </div>

      {chat && (
        <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-300">Table Chat</span>
            <span className="text-[10px] text-zinc-500">{roomId ? 'Persistence coming soon' : 'Local only'}</span>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {localChat.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No chat messages yet.</p>
            ) : localChat.map((msg, i) => (
              <div key={i} className="flex items-start gap-2">
                <img src={currentUser.avatar || avatarFor(me.name)} alt={me.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-fuchsia-300">{me.name}</span>
                  <p className="text-[11px] text-zinc-300 truncate">{msg}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              value={chatDraft}
              onChange={(e) => setChatDraft(e.target.value)}
              placeholder="Say something..."
              className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-fuchsia-500/50"
            />
            <button onClick={handleSendChat} className="w-8 h-8 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center">
              <Send size={12} className="text-fuchsia-300" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const TablePlayer: React.FC<{ player: TrunoGameState['players'][number]; index: number; active: boolean; isYou: boolean; avatar?: string }> = ({ player, index, active, isYou, avatar }) => {
  const positions = [
    'top-0 left-1/2 -translate-x-1/2',
    'top-1/2 right-0 -translate-y-1/2',
    'bottom-0 left-1/2 -translate-x-1/2',
    'top-1/2 left-0 -translate-y-1/2',
  ];
  return (
    <div className={`absolute ${positions[index] ?? positions[0]} flex flex-col items-center`}>
      <div className="flex items-center gap-1 mb-1">
        {Array.from({ length: Math.min(5, player.hand.length) }).map((_, i) => (
          <div key={i} className="w-3 h-8 rounded-sm border border-purple-500/40" style={{ transform: `rotate(${(i - 2) * 4}deg)`, background: 'rgba(157,78,221,0.1)' }} />
        ))}
      </div>
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className={`w-14 h-14 rounded-full overflow-hidden ring-2 ${active ? 'ring-emerald-400' : 'ring-fuchsia-500/60'} shadow-[0_0_20px_rgba(255,0,128,0.45)]`}>
            <img src={avatar || avatarFor(player.name)} alt={player.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <span className="absolute -top-1 -right-1 min-w-6 h-6 px-1.5 rounded-full bg-zinc-950 border border-zinc-700 text-[10px] font-black text-white flex items-center justify-center">{player.hand.length}</span>
          <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-black ${active ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
        </div>
        <span className="mt-1 text-[11px] font-bold text-white">{isYou ? 'You' : player.name}</span>
        <span className="text-[10px] text-amber-400 flex items-center gap-0.5">{player.isBot ? 'BOT' : 'PLAYER'}</span>
      </div>
    </div>
  );
};

function colorClass(color: TrunoGameState['currentColor']) {
  if (color === 'red') return 'bg-red-500 text-red-400';
  if (color === 'blue') return 'bg-cyan-400 text-cyan-400';
  if (color === 'green') return 'bg-emerald-400 text-emerald-400';
  return 'bg-amber-300 text-amber-300';
}

function mostCommonColor(hand: TrunoGameState['players'][number]['hand']): TrunoGameState['currentColor'] {
  const colors: TrunoGameState['currentColor'][] = ['red', 'blue', 'green', 'yellow'];
  const ranked = colors.map((color) => ({ color, n: hand.filter((card) => card.color === color).length }));
  ranked.sort((a, b) => b.n - a.n);
  return ranked[0]?.color ?? 'red';
}

export default MatchScreen;
