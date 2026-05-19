import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MessageSquare, Send, Plus, Trophy, MoreVertical, ChevronDown, Clock, Play, RotateCw, Sparkles } from 'lucide-react';
import TrunoCard from '../components/TrunoCard';
import { avatarFor } from '../lib/avatars';
import { useCurrentUser } from '@/hooks/use-current-user';
import { PlayerIdentity } from '@/features/games/lib/services/identity';
import { useRealtimeRoom } from '@/features/games/hooks/useRealtimeRoom';
import {
  applyBotMove,
  applyPlayerMove,
  createTrunoGame,
  currentPlayer,
  describeMoveEvent,
  isPlayableCard,
  topCard,
  TrunoGameState,
  TrunoMove,
  TrunoMoveEvent,
} from '../lib/trunoEngine';

interface Props {
  onNavigate: (view: string, params?: any) => void;
  identity: PlayerIdentity;
  roomId?: string | null;
  mode?: 'quick' | 'ai';
}

const HUMAN_AFTER_PLAY_DELAY_MS = 450;
const BOT_THINK_MIN_MS = 700;
const BOT_THINK_MAX_MS = 1200;
const BOT_AFTER_ACTION_DELAY_MS = 650;
const ACTION_EFFECT_MS = 900;
const MAX_VISIBLE_BOT_STEPS = 16;
const CARD_DOUBLE_TAP_MS = 320;
const CARD_PLAY_GUARD_MS = 700;

type ActionLogItem = {
  id: string;
  text: string;
  tone: 'play' | 'draw' | 'effect' | 'system';
  label: string;
};

type TableEffect = {
  id: string;
  label: string;
  tone: 'skip' | 'reverse' | 'draw' | 'wild' | 'win';
  targetPlayerId?: string;
} | null;

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
  const [turnNotice, setTurnNotice] = useState<string>('Your turn.');
  const [actionLog, setActionLog] = useState<ActionLogItem[]>([]);
  const [thinkingPlayerId, setThinkingPlayerId] = useState<string | null>(null);
  const [tableEffect, setTableEffect] = useState<TableEffect>(null);
  const [discardPulse, setDiscardPulse] = useState(0);
  const [drawPulse, setDrawPulse] = useState(0);
  const [pulsePlayerId, setPulsePlayerId] = useState<string | null>(null);
  const [invalidCardId, setInvalidCardId] = useState<string | null>(null);
  const tapRef = useRef<{ cardId: string | null; at: number }>({ cardId: null, at: 0 });
  const playGuardRef = useRef<{ cardId: string | null; at: number }>({ cardId: null, at: 0 });

  const sequencerRef = useRef<{ running: boolean; token: number; lastKey: string | null }>({
    running: false,
    token: 0,
    lastKey: null,
  });
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const observedMoveRef = useRef<string | null>(null);

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

  const clearSequencer = useCallback(() => {
    sequencerRef.current.token += 1;
    sequencerRef.current.running = false;
    setThinkingPlayerId(null);
    timeoutsRef.current.forEach((timer) => clearTimeout(timer));
    timeoutsRef.current = [];
  }, []);

  useEffect(() => () => clearSequencer(), [clearSequencer]);

  const sleep = useCallback((ms: number) => new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((item) => item !== timer);
      resolve();
    }, ms);
    timeoutsRef.current.push(timer);
  }), []);

  const showMoveEvent = useCallback((event: TrunoMoveEvent, moveId?: string) => {
    if (moveId) observedMoveRef.current = moveId;
    const tone: ActionLogItem['tone'] = event.effect ? 'effect' : event.kind === 'draw' ? 'draw' : event.kind === 'play' ? 'play' : 'system';
    const label = logLabelFromEvent(event);
    setTurnNotice(event.message);
    setActionLog((prev) => [
      {
        id: `${Date.now()}:${event.playerId}:${event.kind}`,
        text: event.message,
        tone,
        label,
      },
      ...prev,
    ].slice(0, 5));

    if (event.kind === 'play') setDiscardPulse((count) => count + 1);
    if (event.kind === 'draw') setDrawPulse((count) => count + 1);
    if (event.kind === 'draw') setPulsePlayerId(event.playerId);
    if (event.effect === 'draw_two' || event.effect === 'wild_draw_four') setPulsePlayerId(event.targetPlayerId ?? null);

    const effect = effectFromEvent(event);
    if (effect) {
      setTableEffect(effect);
      const timer = setTimeout(() => setTableEffect(null), ACTION_EFFECT_MS);
      timeoutsRef.current.push(timer);
    }

    const pulseTimer = setTimeout(() => setPulsePlayerId(null), ACTION_EFFECT_MS);
    timeoutsRef.current.push(pulseTimer);
  }, []);

  const roomSetHostState = room.setHostState;
  const seatedHostCanRunBots = room.players.some((player) => (
    player.user_id === identity.userId &&
    player.is_host &&
    !player.is_bot
  ));
  const engineHostCanRunBots = !!roomId && state?.players[0]?.id === identity.userId;
  const isRoomHost = room.isHost || seatedHostCanRunBots || engineHostCanRunBots;

  const runBotSequence = useCallback(async (startState: TrunoGameState, token: number) => {
    let workingState = startState;
    let steps = 0;
    await sleep(HUMAN_AFTER_PLAY_DELAY_MS);

    while (
      sequencerRef.current.token === token &&
      workingState.phase === 'playing' &&
      currentPlayer(workingState)?.isBot &&
      steps < MAX_VISIBLE_BOT_STEPS
    ) {
      const bot = currentPlayer(workingState)!;
      setThinkingPlayerId(bot.id);
      setTurnNotice(`${bot.name} is thinking...`);
      await sleep(randomBetween(BOT_THINK_MIN_MS, BOT_THINK_MAX_MS));
      if (sequencerRef.current.token !== token) return;

      const result = applyBotMove(workingState);
      if (!result || result.state.lastMoveId === workingState.lastMoveId) break;

      showMoveEvent(result.event, result.state.lastMoveId);
      workingState = result.state;

      if (roomId) {
        await roomSetHostState(result.state);
      } else {
        setLocalState(result.state);
      }

      await sleep(BOT_AFTER_ACTION_DELAY_MS);
      steps++;
    }

    if (sequencerRef.current.token !== token) return;
    const nextActive = currentPlayer(workingState);
    setThinkingPlayerId(null);
    sequencerRef.current.running = false;

    if (workingState.phase === 'ended') {
      setTurnNotice(workingState.message);
    } else if (nextActive?.isBot && steps >= MAX_VISIBLE_BOT_STEPS) {
      setNotice('The table paused bot play to keep the turn sequence safe.');
    } else if (nextActive?.id === identity.userId || (!roomId && !nextActive?.isBot)) {
      setTurnNotice('Your turn.');
    } else if (nextActive) {
      setTurnNotice(`Waiting for ${nextActive.name}.`);
    }
  }, [identity.userId, roomId, roomSetHostState, showMoveEvent, sleep]);

  useEffect(() => {
    if (!state || state.phase === 'ended') return;
    const active = currentPlayer(state);
    if (!active?.isBot) return;
    if (roomId && !isRoomHost) return;

    const key = `${state.lastMoveId}:${state.currentPlayerIndex}:${active.id}`;
    if (sequencerRef.current.running || sequencerRef.current.lastKey === key) return;
    sequencerRef.current.running = true;
    sequencerRef.current.lastKey = key;
    const token = sequencerRef.current.token + 1;
    sequencerRef.current.token = token;
    void runBotSequence(state, token);
  }, [isRoomHost, roomId, runBotSequence, state]);

  useEffect(() => {
    if (!roomId || isRoomHost) return;
    if (!state || state.lastMoveId === observedMoveRef.current || state.lastMoveId === 'start') return;
    observedMoveRef.current = state.lastMoveId;
    setTurnNotice(state.message);
    setActionLog((prev) => [
      { id: `${Date.now()}:${state.lastMoveId}`, text: state.message, tone: 'system' as const, label: 'TABLE' },
      ...prev,
    ].slice(0, 5));
  }, [isRoomHost, roomId, state]);

  useEffect(() => {
    playGuardRef.current = { cardId: null, at: 0 };
  }, [state?.currentPlayerIndex, state?.turn]);

  if (!state) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-zinc-400">
        Loading Truno table...
      </div>
    );
  }

  const activePlayer = currentPlayer(state);
  const mySeat = roomId ? room.mySeat ?? 0 : state.players.findIndex((p) => !p.isBot);
  const bottomSeat = mySeat >= 0 ? mySeat : 0;
  const me = state.players[bottomSeat] ?? state.players.find((p) => !p.isBot) ?? state.players[0];
  const botIsThinking = !!thinkingPlayerId || !!activePlayer?.isBot;
  const myTurn = activePlayer?.id === me.id && state.phase === 'playing' && !sequencerRef.current.running;
  const top = topCard(state);
  const selectedCard = me.hand.find((card) => card.id === selected) ?? null;
  const canPlaySelected = !!selectedCard && myTurn && isPlayableCard(selectedCard, state);
  const roomCode = room.room?.room_code ?? (roomId ? 'Loading' : mode === 'ai' ? 'AI MATCH' : 'QUICK PLAY');
  const tableLabel = roomId ? 'PRIVATE TABLE' : mode === 'ai' ? 'AI PRACTICE TABLE' : 'QUICK PLAY TABLE';
  const waitingLabel = myTurn ? 'YOUR TURN' : botIsThinking && activePlayer ? `${activePlayer.name} THINKING` : `${activePlayer?.name ?? 'Table'} TURN`;
  const winner = state.winnerId ? state.players.find((p) => p.id === state.winnerId) ?? null : null;
  const handSpread = Math.max(29, Math.min(44, 330 / Math.max(me.hand.length, 1)));

  const commitMove = async (move: TrunoMove) => {
    setNotice(null);
    if (!state) return;
    const next = applyPlayerMove(state, move);
    const event = describeMoveEvent(state, move, next);
    if (next.lastMoveId === state.lastMoveId && next.message !== state.message) {
      setNotice(next.message);
      return;
    }
    showMoveEvent(event, next.lastMoveId);

    if (roomId) {
      await room.sendMove({
        type: move.type,
        seat: mySeat,
        payload: move.type === 'play' ? { cardId: move.cardId, wildColor: move.wildColor } : {},
      });
      setSelected(null);
      return;
    }

    setLocalState(next);
    setSelected(null);
  };

  const flashInvalidCard = (cardId: string, message: string) => {
    setInvalidCardId(cardId);
    setNotice(message);
    const timer = setTimeout(() => setInvalidCardId(null), 400);
    timeoutsRef.current.push(timer);
  };

  const attemptPlayCard = (cardId: string) => {
    const card = me.hand.find((c) => c.id === cardId);
    if (!card) return;
    if (!myTurn) {
      setNotice(`Waiting on ${activePlayer?.name ?? 'the table'}.`);
      return;
    }
    if (!isPlayableCard(card, state)) {
      setSelected(null);
      flashInvalidCard(cardId, 'That card does not match the current color, number, or action.');
      return;
    }
    const now = Date.now();
    if (playGuardRef.current.cardId === cardId && now - playGuardRef.current.at < CARD_PLAY_GUARD_MS) return;
    playGuardRef.current = { cardId, at: now };
    void commitMove({ type: 'play', playerId: me.id, cardId, wildColor: mostCommonColor(me.hand) });
  };

  const handleCardTap = (cardId: string) => {
    const now = Date.now();
    const isDoubleTap = tapRef.current.cardId === cardId && now - tapRef.current.at < CARD_DOUBLE_TAP_MS;
    tapRef.current = { cardId, at: now };
    if (isDoubleTap) {
      attemptPlayCard(cardId);
      return;
    }

    const card = me.hand.find((c) => c.id === cardId);
    if (!card) return;
    if (!myTurn) {
      setNotice(`Waiting on ${activePlayer?.name ?? 'the table'}.`);
      return;
    }
    if (!isPlayableCard(card, state)) {
      setSelected(null);
      flashInvalidCard(cardId, 'That card does not match the current color, number, or action.');
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

  const handleLeaveMatch = () => {
    clearSequencer();
    onNavigate(roomId ? 'room' : 'home', roomId ? { roomId, suppressActiveSession: true } : undefined);
  };

  const handleBackToTruno = () => {
    clearSequencer();
    onNavigate('home');
  };

  const handlePlayAgain = async () => {
    const next = createTrunoGame(state.players.map((player) => ({
      id: player.id,
      name: player.name,
      isBot: player.isBot,
    })));
    setSelected(null);
    setNotice(null);
    setActionLog([]);
    setTableEffect(null);
    setTurnNotice(`${next.players[0]?.name ?? 'Player'} starts.`);
    observedMoveRef.current = next.lastMoveId;
    if (roomId) {
      if (!isRoomHost) {
        setNotice('The room host can start the next table.');
        return;
      }
      await roomSetHostState(next);
      return;
    }
    setLocalState(next);
  };

  return (
    <div className="px-3 pb-24">
      <style>{`
        @keyframes truno-pop { 0% { transform: scale(0.92); filter: brightness(1); } 45% { transform: scale(1.1); filter: brightness(1.4); } 100% { transform: scale(1); filter: brightness(1); } }
        @keyframes truno-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 50% { transform: translateX(6px); } 75% { transform: translateX(-3px); } }
        @keyframes truno-float { 0% { opacity: 0; transform: translateY(14px) scale(0.92); } 20%, 80% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-16px) scale(1.04); } }
        @keyframes truno-ring { 0%, 100% { transform: scale(1); opacity: 0.45; } 50% { transform: scale(1.12); opacity: 0.9; } }
        @keyframes truno-thinking { 0%, 100% { opacity: 0.35; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-2px); } }
      `}</style>

      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <button onClick={handleLeaveMatch} className="w-9 h-9 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center">
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
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleLeaveMatch}
            className="min-h-10 px-3 sm:px-4 py-2 rounded-xl border border-pink-500/50 text-pink-300 text-xs sm:text-sm font-bold hover:bg-pink-500/10"
          >
            Leave Match
          </button>
          <button onClick={() => setNotice('Table menu is coming soon.')} className="w-9 h-9 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center">
            <MoreVertical size={16} className="text-zinc-300" />
          </button>
        </div>
      </div>

      <div className={`mx-auto max-w-full w-fit rounded-full bg-zinc-950/80 border px-4 py-1.5 mb-4 flex items-center gap-3 ${myTurn ? 'border-emerald-400/50 shadow-[0_0_22px_rgba(52,211,153,0.25)]' : 'border-fuchsia-500/30'}`}>
        <span className="text-xs font-bold text-fuchsia-300">{tableLabel}</span>
        <span className="text-xs text-zinc-500">|</span>
        <span className="text-xs text-zinc-300 truncate">{turnNotice || state.message}</span>
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
            relativeIndex={(index - bottomSeat + state.players.length) % state.players.length}
            playerCount={state.players.length}
            active={activePlayer?.id === player.id}
            thinking={thinkingPlayerId === player.id}
            pulsing={pulsePlayerId === player.id || tableEffect?.targetPlayerId === player.id}
            isYou={player.id === me.id}
            avatar={player.id === me.id ? currentUser.avatar : undefined}
          />
        ))}

        <div className="absolute inset-0 flex items-center justify-center gap-3">
          <div key={drawPulse} className={drawPulse ? 'animate-[truno-pop_0.45s_ease-out]' : ''}>
            <TrunoCard card={{ id: 'deck', color: 'black', symbol: 'wild', label: 'W' }} faceDown size="md" />
          </div>
          {top && (
            <div key={`${top.id}:${discardPulse}`} className={discardPulse ? 'animate-[truno-pop_0.45s_ease-out]' : ''}>
              <TrunoCard card={top} size="md" playable />
            </div>
          )}
        </div>

        {tableEffect && (
          <div className={`pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 px-5 py-2 rounded-full border text-xl font-black tracking-widest animate-[truno-float_0.9s_ease-out_both] ${effectClass(tableEffect.tone)}`}>
            <span className="inline-flex items-center gap-2">
              {tableEffect.tone === 'wild' || tableEffect.tone === 'win' ? <Sparkles size={18} /> : null}
              {tableEffect.label}
            </span>
          </div>
        )}

        <div className="absolute left-1/2 -translate-x-1/2 bottom-1/4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/80 border border-zinc-800">
          <span className="text-[10px] text-zinc-400">Current Color</span>
          <div className={`w-4 h-4 rounded-full shadow-[0_0_10px_currentColor] ${colorClass(state.currentColor)}`} />
          <span className="text-[10px] text-zinc-500">|</span>
          <RotateCw size={12} className={`text-cyan-300 ${state.direction === -1 ? '-scale-x-100' : ''}`} />
          <span className="text-[10px] text-zinc-300">{state.direction === 1 ? 'Clockwise' : 'Counter'}</span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-2 text-xs">
        <button className={`min-h-9 flex items-center gap-1.5 px-3 py-1 rounded-full border font-bold ${myTurn ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.2)]' : botIsThinking ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200' : 'bg-zinc-900/80 border-zinc-800 text-zinc-400'}`}>
          <ChevronDown size={14} className="rotate-180" /> {waitingLabel}
        </button>
        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300">
          <Clock size={12} /> Turn {state.turn}
        </span>
      </div>

      {actionLog.length > 0 && (
        <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/65 p-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[10px] font-black tracking-wider text-zinc-500">RECENT MOVES</div>
            <div className="text-[10px] text-zinc-600">real table actions</div>
          </div>
          <div className="grid gap-1">
            {actionLog.slice(0, 3).map((item) => (
              <div key={item.id} className={`grid grid-cols-[3.25rem_1fr] items-center gap-2 text-[11px] rounded-lg px-2 py-1.5 border ${logClass(item.tone)}`}>
                <span className="text-[9px] font-black tracking-wider opacity-80">{item.label}</span>
                <span className="truncate">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {state.phase === 'ended' && (
        <div className="mt-3 rounded-3xl border border-amber-500/50 bg-gradient-to-br from-amber-500/15 via-fuchsia-500/10 to-zinc-950 p-4 text-center shadow-[0_0_34px_rgba(251,191,36,0.14)]">
          <div className="mx-auto mb-2 w-12 h-12 rounded-full border border-amber-400/60 bg-amber-400/15 flex items-center justify-center text-amber-200">
            <Trophy size={24} />
          </div>
          <div className="text-[10px] font-black tracking-[0.24em] text-amber-300">TABLE COMPLETE</div>
          <div className="mt-1 text-xl font-black text-white">{winner?.id === me.id ? 'You win the table' : `${winner?.name ?? 'A player'} wins the table`}</div>
          <p className="mt-1 text-xs text-zinc-400">Start a clean rematch when everyone is ready.</p>
          <div className={`mt-4 grid gap-2 ${roomId ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`}>
            <button onClick={handlePlayAgain} className="min-h-11 rounded-2xl border border-emerald-400/50 bg-emerald-500/10 text-emerald-200 text-sm font-black hover:bg-emerald-500/15">
              Play Again
            </button>
            <button onClick={handleBackToTruno} className="min-h-11 rounded-2xl border border-fuchsia-500/45 bg-fuchsia-500/10 text-fuchsia-200 text-sm font-black hover:bg-fuchsia-500/15">
              Back to Truno
            </button>
            {roomId && (
              <button onClick={handleLeaveMatch} className="min-h-11 rounded-2xl border border-pink-500/45 bg-pink-500/10 text-pink-200 text-sm font-black hover:bg-pink-500/15">
                Leave Room
              </button>
            )}
          </div>
        </div>
      )}

      {notice && (
        <div className="mt-3 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-2 text-center text-xs text-fuchsia-200">
          {notice}
        </div>
      )}

      <div className="mt-3 relative flex justify-center items-end overflow-visible" style={{ height: 150 }}>
        {me.hand.map((c, i) => {
          const mid = Math.floor(me.hand.length / 2);
          const offset = i - mid;
          const isSel = selected === c.id;
          const playable = myTurn && isPlayableCard(c, state);
          const invalid = invalidCardId === c.id;
          return (
            <div
              key={c.id}
              className={`absolute transition-transform duration-200 ${invalid ? 'animate-[truno-shake_0.35s_ease-in-out]' : ''}`}
              style={{
                transform: `translateX(${offset * handSpread}px) translateY(${Math.abs(offset) * 3}px) rotate(${offset * 4}deg) ${isSel ? 'translateY(-28px) scale(1.12)' : ''}`,
                zIndex: isSel ? 100 : 10 + i,
              }}
            >
              {isSel && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-full border border-cyan-300/50 bg-cyan-400/15 px-2 py-0.5 text-[9px] font-black tracking-wider text-cyan-100 whitespace-nowrap">
                  SELECTED
                </div>
              )}
              <TrunoCard
                card={c}
                size="sm"
                playable={playable}
                onClick={() => handleCardTap(c.id)}
                selected={isSel}
                className={`${playable ? 'ring-2 ring-cyan-300/25' : ''} ${invalid ? 'ring-4 ring-pink-400/70' : ''}`}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-3xl border border-zinc-800/80 bg-black/35 p-2 backdrop-blur-sm">
        <button onClick={handleDraw} disabled={!myTurn || state.phase === 'ended'} className="min-h-14 rounded-2xl border border-purple-500/40 bg-zinc-950/80 py-3 text-purple-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-purple-500/10 disabled:opacity-40 disabled:saturate-50 disabled:cursor-not-allowed">
          <Plus size={16} /> Draw
        </button>
        <button onClick={handleCallTruno} disabled={!myTurn || state.phase === 'ended'} className="min-h-14 rounded-2xl py-3 font-black text-sm relative overflow-hidden group disabled:opacity-50 disabled:saturate-50 disabled:cursor-not-allowed">
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
          className={`min-h-14 rounded-2xl border py-3 font-bold text-sm flex items-center justify-center gap-2 transition ${canPlaySelected ? 'border-cyan-500/40 bg-zinc-950/80 text-cyan-300 hover:bg-cyan-500/10 shadow-[0_0_18px_rgba(34,211,238,0.15)]' : 'border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed'}`}
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

const TablePlayer: React.FC<{
  player: TrunoGameState['players'][number];
  relativeIndex: number;
  playerCount: number;
  active: boolean;
  thinking: boolean;
  pulsing: boolean;
  isYou: boolean;
  avatar?: string;
}> = ({ player, relativeIndex, playerCount, active, thinking, pulsing, isYou, avatar }) => {
  const position = seatPosition(relativeIndex, playerCount);
  return (
      <div className={`absolute ${position} flex flex-col items-center transition-all duration-300 ${pulsing ? 'scale-105' : ''}`}>
      <div className={`flex items-center gap-1 mb-1 transition ${pulsing ? 'animate-[truno-pop_0.45s_ease-out]' : ''}`}>
        {Array.from({ length: Math.min(5, player.hand.length) }).map((_, i) => (
          <div key={i} className="w-3 h-8 rounded-sm border border-purple-500/40" style={{ transform: `rotate(${(i - 2) * 4}deg)`, background: 'rgba(157,78,221,0.1)' }} />
        ))}
      </div>
      <div className="flex flex-col items-center">
        <div className="relative">
          {active && (
            <div className="absolute -inset-2 rounded-full border border-emerald-300/50 animate-[truno-ring_1.45s_ease-in-out_infinite]" />
          )}
          <div className={`w-14 h-14 rounded-full overflow-hidden ring-2 transition ${active ? 'ring-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.58)]' : 'ring-fuchsia-500/60 shadow-[0_0_20px_rgba(255,0,128,0.45)]'}`}>
            <img src={avatar || avatarFor(player.name)} alt={player.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <span className={`absolute -top-1 -right-1 min-w-6 h-6 px-1.5 rounded-full bg-zinc-950 border text-[10px] font-black text-white flex items-center justify-center ${pulsing ? 'border-cyan-300 animate-[truno-pop_0.45s_ease-out]' : 'border-zinc-700'}`}>{player.hand.length}</span>
          <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-black ${active ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
        </div>
        <span className="mt-1 text-[11px] font-bold text-white">{isYou ? 'You' : player.name}</span>
        <span className={`text-[10px] flex items-center gap-1 ${thinking ? 'text-cyan-300' : active ? 'text-emerald-300' : 'text-amber-400'}`}>
          {thinking && <span className="inline-flex gap-0.5" aria-hidden="true"><span className="w-1 h-1 rounded-full bg-cyan-300 animate-[truno-thinking_0.9s_ease-in-out_infinite]" /><span className="w-1 h-1 rounded-full bg-cyan-300 animate-[truno-thinking_0.9s_ease-in-out_0.15s_infinite]" /><span className="w-1 h-1 rounded-full bg-cyan-300 animate-[truno-thinking_0.9s_ease-in-out_0.3s_infinite]" /></span>}
          {thinking ? 'THINKING' : active ? 'ACTIVE' : player.isBot ? 'BOT' : 'PLAYER'}
        </span>
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

function randomBetween(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function effectFromEvent(event: TrunoMoveEvent): TableEffect {
  if (!event.effect) return null;
  if (event.effect === 'skip') return { id: `${Date.now()}:skip`, label: 'SKIP', tone: 'skip', targetPlayerId: event.targetPlayerId };
  if (event.effect === 'reverse') return { id: `${Date.now()}:reverse`, label: 'REVERSE', tone: 'reverse' };
  if (event.effect === 'draw_two') return { id: `${Date.now()}:draw2`, label: '+2', tone: 'draw', targetPlayerId: event.targetPlayerId };
  if (event.effect === 'wild_draw_four') return { id: `${Date.now()}:draw4`, label: '+4', tone: 'wild', targetPlayerId: event.targetPlayerId };
  if (event.effect === 'wild') return { id: `${Date.now()}:wild`, label: `${event.color?.toUpperCase() ?? 'WILD'}`, tone: 'wild' };
  if (event.effect === 'win') return { id: `${Date.now()}:win`, label: 'TRUNO', tone: 'win' };
  return null;
}

function logLabelFromEvent(event: TrunoMoveEvent) {
  if (event.effect === 'skip') return 'SKIP';
  if (event.effect === 'reverse') return 'REVERSE';
  if (event.effect === 'draw_two') return '+2';
  if (event.effect === 'wild_draw_four') return '+4';
  if (event.effect === 'wild') return 'WILD';
  if (event.effect === 'win') return 'WIN';
  if (event.kind === 'draw') return 'DRAW';
  if (event.kind === 'call-truno') return 'TRUNO';
  return 'PLAY';
}

function effectClass(tone: NonNullable<TableEffect>['tone']) {
  if (tone === 'skip') return 'border-pink-400/60 bg-pink-500/20 text-pink-200 shadow-[0_0_28px_rgba(236,72,153,0.4)]';
  if (tone === 'reverse') return 'border-cyan-400/60 bg-cyan-500/20 text-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.4)]';
  if (tone === 'draw') return 'border-purple-400/60 bg-purple-500/20 text-purple-200 shadow-[0_0_28px_rgba(168,85,247,0.4)]';
  if (tone === 'wild') return 'border-amber-400/60 bg-amber-500/20 text-amber-100 shadow-[0_0_28px_rgba(251,191,36,0.35)]';
  return 'border-emerald-400/60 bg-emerald-500/20 text-emerald-100 shadow-[0_0_28px_rgba(52,211,153,0.4)]';
}

function logClass(tone: ActionLogItem['tone']) {
  if (tone === 'effect') return 'border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-100';
  if (tone === 'draw') return 'border-purple-500/25 bg-purple-500/10 text-purple-100';
  if (tone === 'play') return 'border-cyan-500/25 bg-cyan-500/10 text-cyan-100';
  return 'border-zinc-800 bg-zinc-900/50 text-zinc-300';
}

function seatPosition(relativeIndex: number, playerCount: number) {
  const two = [
    'bottom-0 left-1/2 -translate-x-1/2',
    'top-0 left-1/2 -translate-x-1/2',
  ];
  const three = [
    'bottom-0 left-1/2 -translate-x-1/2',
    'top-1/2 left-0 -translate-y-1/2',
    'top-1/2 right-0 -translate-y-1/2',
  ];
  const fourPlus = [
    'bottom-0 left-1/2 -translate-x-1/2',
    'top-1/2 left-0 -translate-y-1/2',
    'top-0 left-1/2 -translate-x-1/2',
    'top-1/2 right-0 -translate-y-1/2',
    'top-5 left-16',
    'top-5 right-16',
    'bottom-12 left-4',
    'bottom-12 right-4',
  ];
  if (playerCount <= 2) return two[relativeIndex] ?? two[0];
  if (playerCount === 3) return three[relativeIndex] ?? three[0];
  return fourPlus[relativeIndex] ?? fourPlus[0];
}

export default MatchScreen;
