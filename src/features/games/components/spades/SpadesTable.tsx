/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  newSpadesGame, placeBid, playCard, legalCards, botBid, botPlay, startNextRound,
  SpadesState,
} from '@/features/games/lib/spades/spadesEngine';
import { TreyBrandMark } from '../shared/TreyBrandMark';
import { GamePlayerSeat } from '../shared/GamePlayerSeat';
import { TreyCard } from '../shared/TreyCard';
import { AVATAR_SEAT_NORM } from '../pixi/pixiLayout';
import { ArrowLeft, Info, RotateCw, Loader2, Crown, Flame, Spade } from 'lucide-react';

import { useRealtimeRoom } from '@/features/games/hooks/useRealtimeRoom';
import { PlayerIdentity } from '@/features/games/lib/services/identity';
import { useChat } from '@/features/games/hooks/useChat';
import { GameChatDrawer, ChatHeaderButton } from '../shared/GameChatDrawer';
import { PixiSpadesTableLazy } from '../pixi/PixiGameTables';

interface Props {
  onBack: () => void;
  onLegend: () => void;
  targetScore?: number;
  roomId?: string;
  identity?: PlayerIdentity;
}

const SUIT_MAP: Record<string, string> = { S: '♠', H: '♥', D: '♦', C: '♣' };

const BOT_BID_DELAY_MS = 1800;
const BOT_CARD_DELAY_MS = 2200;
const BOT_TRICK_CLOSE_DELAY_MS = 3000;
const HUMAN_TURN_TIMEOUT_MS = 15000;
const DOUBLE_TAP_PLAY_MS = 450;

function spadesApplyMove(state: SpadesState, move: { type: string; seat: number; payload?: any }): SpadesState {
  switch (move.type) {
    case 'bid': return placeBid(state, move.seat, move.payload.bid);
    case 'play': return playCard(state, move.seat, move.payload.cardId);
    case 'next-round': return startNextRound(state);
    default: return state;
  }
}
function spadesExtract(s: SpadesState) {
  return { currentSeat: s.currentSeat, phase: s.phase, round: s.round, ended: s.phase === 'game-over' };
}

export const SpadesTable: React.FC<Props> = (props) => {
  if (props.roomId && props.identity) return <ServerSpades {...props} roomId={props.roomId!} identity={props.identity!} />;
  return <LocalSpades {...props} />;
};

// ============================================
// LOCAL SOLO MODE
// ============================================
const LocalSpades: React.FC<Props> = ({ onBack, onLegend, targetScore = 500 }) => {
  const [state, setState] = useState<SpadesState>(() => newSpadesGame(['You','Aaliyah','Marcus','Jamal'], targetScore));
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (state.phase === 'bidding') {
      const seat = state.currentSeat;
      const delay = state.players[seat].isBot ? BOT_BID_DELAY_MS : HUMAN_TURN_TIMEOUT_MS;
      const t = setTimeout(() => setState(s => placeBid(s, seat, botBid(s, seat))), delay);
      return () => clearTimeout(t);
    }
    if (state.phase === 'playing') {
      const seat = state.currentSeat;
      const delay = state.players[seat].isBot
        ? (state.trick.length === 3 ? BOT_TRICK_CLOSE_DELAY_MS : BOT_CARD_DELAY_MS)
        : HUMAN_TURN_TIMEOUT_MS;
      const t = setTimeout(() => setState(s => playCard(s, seat, botPlay(s, seat))), delay);
      return () => clearTimeout(t);
    }
  }, [state.phase, state.currentSeat, state.trick.length]);

  return (
    <SpadesView
      state={state} mySeat={0}
      selected={selected} setSelected={setSelected}
      onBid={(n) => setState(s => placeBid(s, 0, n))}
      onPlayCard={(cardId) => { setState(s => playCard(s, 0, cardId)); setSelected(null); }}
      onPlayClick={() => { if (selected) { setState(s => playCard(s, 0, selected)); setSelected(null); } }}
      onNextRound={() => setState(startNextRound)}
      onPlayAgain={() => setState(newSpadesGame(['You','Aaliyah','Marcus','Jamal'], targetScore))}
      onBack={onBack} onLegend={onLegend}
      myAvatarUrl={null}
    />
  );
};

// ============================================
// SERVER MODE
// ============================================
const ServerSpades: React.FC<Props & { roomId: string; identity: PlayerIdentity }> = ({ roomId, identity, onBack, onLegend }) => {
  const apply = useCallback(spadesApplyMove, []);
  const extract = useCallback(spadesExtract, []);
  const room = useRealtimeRoom(roomId, identity, apply, extract);
  const [selected, setSelected] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const chat = useChat({ roomId, identity, mySeat: room.mySeat, isOpen: chatOpen });

  const state = room.state as SpadesState | null;
  const mySeat = room.mySeat;
  const roomPlayersKey = room.players.map(p => `${p.seat_index}:${p.display_name}:${p.is_bot}`).join('|');

  useEffect(() => {
    if (!room.isHost || !state || !room.session) return;
    const activeState = syncSpadesPlayersFromRoom(state, room.players);
    if (activeState !== state) room.setHostState(activeState);
    const seatPlayer = room.players.find(p => p.seat_index === activeState.currentSeat);
    if (activeState.phase === 'bidding') {
      const seat = activeState.currentSeat;
      const delay = seatPlayer?.is_bot ? BOT_BID_DELAY_MS : HUMAN_TURN_TIMEOUT_MS;
      const t = setTimeout(() => room.setHostState(placeBid(activeState, seat, botBid(activeState, seat))), delay);
      return () => clearTimeout(t);
    }
    if (activeState.phase === 'playing') {
      const seat = activeState.currentSeat;
      const delay = seatPlayer?.is_bot
        ? (activeState.trick.length === 3 ? BOT_TRICK_CLOSE_DELAY_MS : BOT_CARD_DELAY_MS)
        : HUMAN_TURN_TIMEOUT_MS;
      const t = setTimeout(() => room.setHostState(playCard(activeState, seat, botPlay(activeState, seat))), delay);
      return () => clearTimeout(t);
    }
  }, [room.isHost, state?.phase, state?.currentSeat, state?.trick.length, roomPlayersKey]);

  if (room.loading || !state || mySeat === null) {
    return <div className="h-[100dvh] flex items-center justify-center text-slate-400" style={{ background: '#05070D' }}><Loader2 className="animate-spin mr-2" /> Syncing room…</div>;
  }

  return (
    <SpadesView
      state={state} mySeat={mySeat}
      selected={selected} setSelected={setSelected}
      onBid={(n) => room.sendMove({ type: 'bid', seat: mySeat, payload: { bid: n } })}
      onPlayCard={(cardId) => { room.sendMove({ type: 'play', seat: mySeat, payload: { cardId } }); setSelected(null); }}
      onPlayClick={() => { if (selected) { room.sendMove({ type: 'play', seat: mySeat, payload: { cardId: selected } }); setSelected(null); } }}
      onNextRound={() => room.sendMove({ type: 'next-round', seat: mySeat })}
      onPlayAgain={onBack}
      onBack={onBack} onLegend={onLegend}
      roomCode={room.room?.room_code}
      myAvatarUrl={identity.avatarUrl}
      chatButton={
        <ChatHeaderButton unread={chat.unread} accent="#00B7FF" onClick={() => setChatOpen(true)} />
      }
      chatDrawer={
        <GameChatDrawer
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          messages={chat.messages}
          loading={chat.loading}
          myUserId={identity.userId}
          mySeat={mySeat}
          onSend={chat.send}
          accent="#00B7FF"
        />
      }
    />
  );
};


// ============================================
// SHARED VIEW — mobile-first, no-scroll, fixed viewport
// ============================================
interface ViewProps {
  state: SpadesState;
  mySeat: number;
  selected: string | null;
  setSelected: (s: string | null) => void;
  onBid: (n: number) => void;
  onPlayCard: (cardId: string) => void;
  onPlayClick: () => void;
  onNextRound: () => void;
  onPlayAgain: () => void;
  onBack: () => void;
  onLegend: () => void;
  roomCode?: string;
  myAvatarUrl?: string | null;
  chatButton?: React.ReactNode;
  chatDrawer?: React.ReactNode;
}

const SpadesView: React.FC<ViewProps> = ({
  state, mySeat, selected, setSelected, onBid, onPlayClick, onNextRound, onPlayAgain, onBack, onLegend, roomCode, myAvatarUrl, chatButton, chatDrawer,
  onPlayCard,
}) => {

  const you = state.players[mySeat];
  const isMyTurn = state.currentSeat === mySeat;
  const yourLegal = useMemo(() => state.phase === 'playing' && isMyTurn ? legalCards(state, mySeat) : [], [state, mySeat, isMyTurn]);
  const legalSet = useMemo(() => new Set(yourLegal), [yourLegal]);
  const lastCardTap = useRef<{ cardId: string; at: number } | null>(null);

  useEffect(() => {
    if (selected && !legalSet.has(selected)) setSelected(null);
  }, [legalSet, selected, setSelected]);

  const selectionResetKey = `${state.round}:${state.phase}:${state.currentSeat}:${state.trick.length}:${you.hand.length}`;
  const prevSelectionResetKey = useRef(selectionResetKey);
  useEffect(() => {
    if (prevSelectionResetKey.current !== selectionResetKey) {
      setSelected(null);
      lastCardTap.current = null;
      prevSelectionResetKey.current = selectionResetKey;
    }
  }, [selectionResetKey, setSelected]);

  const seatPositions = useMemo(() => {
    const map: Record<number, 'bottom' | 'left' | 'top' | 'right'> = {} as any;
    map[mySeat] = 'bottom';
    map[(mySeat + 1) % 4] = 'left';
    map[(mySeat + 2) % 4] = 'top';
    map[(mySeat + 3) % 4] = 'right';
    return map;
  }, [mySeat]);

  const myTeam = (mySeat % 2) as 0 | 1;
  const teamWeScore = state.teamScores[myTeam];
  const teamThemScore = state.teamScores[1 - myTeam];

  const [winnerFlash, setWinnerFlash] = useState<number | null>(null);
  const prevTrickLen = useRef(state.trick.length);
  useEffect(() => {
    if (prevTrickLen.current === 3 && state.trick.length === 0 && state.lastTrickWinner !== null) {
      setWinnerFlash(state.lastTrickWinner);
      const t = setTimeout(() => setWinnerFlash(null), 750);
      return () => clearTimeout(t);
    }
    prevTrickLen.current = state.trick.length;
  }, [state.trick.length, state.lastTrickWinner]);

  const dealerSeat = ((state.round - 1) + 3) % 4;
  const pixiEventKey = `${state.round}:${state.phase}:${state.trick.map(t => `${t.seat}-${t.cardId}`).join('|')}:${winnerFlash ?? 'none'}:${state.lastTrickWinner ?? 'none'}:${selected ?? 'none'}`;
  const handleCardTap = useCallback((cardId: string) => {
    if (!isMyTurn || !legalSet.has(cardId)) return;
    const now = Date.now();
    const lastTap = lastCardTap.current;
    const isDoubleTap = selected === cardId || (lastTap?.cardId === cardId && now - lastTap.at <= DOUBLE_TAP_PLAY_MS);
    if (isDoubleTap) {
      onPlayCard(cardId);
      lastCardTap.current = null;
      return;
    }
    setSelected(cardId);
    lastCardTap.current = { cardId, at: now };
  }, [isMyTurn, legalSet, onPlayCard, selected, setSelected]);

  return (
    <div
      className="w-full text-white flex flex-col overflow-hidden relative trey-screen-enter"
      style={{
        height: '100dvh',
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,183,255,0.10) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 50% 100%, rgba(168,85,247,0.10) 0%, transparent 60%),
          linear-gradient(180deg, #04060C 0%, #02030A 100%)
        `,
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* ambient halos */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full blur-[140px] trey-ambient-glow"
          style={{ background: 'radial-gradient(circle, rgba(0,183,255,0.22) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 -right-32 w-[420px] h-[420px] rounded-full blur-[140px] trey-ambient-glow"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.20) 0%, transparent 70%)' }} />
        {/* subtle film grain via noise */}
        <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '3px 3px' }} />
      </div>

      {/* COMPACT HEADER */}
      <header className="shrink-0 z-20 backdrop-blur-2xl border-b relative"
        style={{
          background: 'linear-gradient(180deg, rgba(8,17,31,0.92), rgba(8,17,31,0.78))',
          borderColor: 'rgba(0,183,255,0.28)',
          boxShadow: '0 6px 24px rgba(0,0,0,0.4)',
        }}>
        <div className="px-3 py-2 flex items-center gap-2">
          <button onClick={onBack} className="w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-white/5 transition" aria-label="Back"
            style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(14px)' }}>
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            {/* Official Trey TV brandmark (transparent, no white box) */}
            <TreyBrandMark size={20} glow className="shrink-0" />
            <div className="h-4 w-px bg-white/15 shrink-0" />
            <Spade size={13} className="text-cyan-300 shrink-0" />

            <div className="text-sm font-black tracking-tight truncate">Spades</div>
            <div className="text-[10px] text-slate-500 font-bold tabular-nums">· R{state.round}</div>
            {roomCode && (
              <div className="text-[9px] font-mono text-amber-300 tracking-wider ml-1 truncate">· {roomCode}</div>
            )}
          </div>

          {state.spadesBroken && (
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black tracking-widest shrink-0"
              style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.45)', color: '#FB7185' }}>
              <Flame size={9} /> BROKEN
            </div>
          )}
          {chatButton}
          <button onClick={onLegend} className="w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-white/5 transition border border-white/5" aria-label="Suit legend" title="Suit legend"><Info size={16} /></button>
        </div>


        {/* COMPACT SCORE ROW */}
        <div className="px-3 pb-2 grid grid-cols-2 gap-2">
          <ScoreCard label="WE" score={teamWeScore} bid={state.teamRoundBids[myTeam]} tricks={state.teamRoundTricks[myTeam]} bags={state.teamBags[myTeam]} color="#00B7FF" />
          <ScoreCard label="THEM" score={teamThemScore} bid={state.teamRoundBids[1 - myTeam]} tricks={state.teamRoundTricks[1 - myTeam]} bags={state.teamBags[1 - myTeam]} color="#A855F7" />
        </div>
      </header>

      {/* FELT — flexes to fill remaining space */}
      <main className="flex-1 min-h-0 relative flex items-center justify-center px-2 py-1.5">
        <div
          data-game-table
          className="relative w-full h-full max-w-md mx-auto rounded-[28px] overflow-hidden ombre-border"
          style={{
            background: 'radial-gradient(120% 90% at 50% 0%, oklch(0.32 0.13 280) 0%, oklch(0.20 0.10 270) 30%, oklch(0.14 0.08 255) 60%, oklch(0.10 0.06 240) 100%)',
            boxShadow: '0 0 60px oklch(0.72 0.26 300 / 0.22), 0 0 90px oklch(0.84 0.16 215 / 0.15)',
          }}
        >
          {/* Top gloss */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2" style={{ background: 'linear-gradient(180deg, oklch(1 0 0 / 0.06) 0%, oklch(1 0 0 / 0.01) 50%, transparent 100%)' }} />
          {/* Color wash */}
          <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-60" style={{ background: 'radial-gradient(80% 60% at 20% 110%, oklch(0.84 0.14 82 / 0.18) 0%, transparent 60%), radial-gradient(80% 60% at 90% 0%, oklch(0.84 0.16 215 / 0.16) 0%, transparent 60%)' }} />
          {/* Grain */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(oklch(1 0 0 / 0.4) 0.5px, transparent 0.6px)', backgroundSize: '3px 3px' }} />
          {/* Gold filigree corners */}
          <span className="filigree-corner" style={{ top: 6, left: 6 }} />
          <span className="filigree-corner" style={{ top: 6, right: 6, transform: 'scaleX(-1)' }} />
          <span className="filigree-corner" style={{ bottom: 6, left: 6, transform: 'scaleY(-1)' }} />
          <span className="filigree-corner" style={{ bottom: 6, right: 6, transform: 'scale(-1,-1)' }} />
          {/* Center logo */}
          <img src="/assets/trey-tv-logo.png" alt="" className="pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-auto" style={{ opacity: 0.12, filter: 'drop-shadow(0 0 12px oklch(0.84 0.14 82 / 0.3))' }} />
          {/* Double gold ring */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] rounded-full breathe" style={{ border: '1px solid oklch(0.84 0.14 82 / 0.40)', boxShadow: '0 0 20px oklch(0.84 0.14 82 / 0.25)' }} />
          {/* Sparkles */}
          <span className="sparkle" style={{ top: '18%', left: '22%', animationDelay: '0s' }} />
          <span className="sparkle" style={{ top: '30%', right: '18%', animationDelay: '1.4s' }} />
          <span className="sparkle" style={{ bottom: '28%', left: '30%', animationDelay: '2.6s' }} />
          <span className="sparkle" style={{ bottom: '35%', right: '26%', animationDelay: '0.8s' }} />

          <PixiSpadesTableLazy
            hands={state.players.map(p => p.hand)}
            trick={state.trick}
            mySeat={mySeat}
            currentSeat={state.currentSeat}
            winnerSeat={winnerFlash}
            selectedCardId={selected}
            legalCards={yourLegal}
            accent="#00B7FF"
            eventKey={pixiEventKey}
            onCardClick={handleCardTap}
            renderHand={false}
          />

          {/* ── Player seat overlays — positioned at AVATAR_SEAT_NORM, NOT at card stack positions ── */}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
            {([0, 1, 2, 3] as const).map(seat => {
              const pos = seatPositions[seat as keyof typeof seatPositions];
              if (!pos || pos === 'bottom') return null;
              const player = state.players[seat];
              const norm = AVATAR_SEAT_NORM[pos];
              const isMyTeam = (seat % 2) === (mySeat % 2);
              return (
                <div
                  key={seat}
                  style={{
                    position: 'absolute',
                    top: `${norm.y * 100}%`,
                    left: `${norm.x * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                  }}
                >
                  <GamePlayerSeat
                    displayName={player.name}
                    isBot={player.isBot}
                    isCurrentTurn={state.currentSeat === seat}
                    isDealer={dealerSeat === seat}
                    bid={player.bid}
                    tricks={player.tricksWon}
                    accentColor={isMyTeam ? '#00B7FF' : '#A855F7'}
                    size="sm"
                    position={pos}
                    winFlash={winnerFlash === seat}
                  />
                </div>
              );
            })}
          </div>

          <div className="absolute inset-x-2 bottom-2 pointer-events-none" style={{ zIndex: 14 }}>
            <div
              className="relative overflow-hidden rounded-[22px] border px-3 py-2 flex items-center gap-3"
              style={{
                minHeight: 72,
                background: 'linear-gradient(90deg, rgba(3,8,18,0.90), rgba(8,17,31,0.74))',
                borderColor: isMyTurn ? 'rgba(255,200,87,0.62)' : 'rgba(0,183,255,0.30)',
                boxShadow: isMyTurn
                  ? '0 0 28px rgba(255,200,87,0.22), inset 0 1px 0 rgba(255,255,255,0.08)'
                  : '0 10px 28px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
                backdropFilter: 'blur(18px)',
              }}
            >
              <div className="absolute inset-x-3 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,183,255,0.65), rgba(255,200,87,0.45), transparent)' }} />
              <GamePlayerSeat
                displayName={you.name}
                avatarUrl={myAvatarUrl}
                isBot={you.isBot}
                isCurrentTurn={isMyTurn}
                isDealer={dealerSeat === mySeat}
                bid={you.bid}
                tricks={you.tricksWon}
                accentColor="#00B7FF"
                size="md"
                position="bottom"
                winFlash={winnerFlash === mySeat}
              />
              <div className="min-w-0 flex-1">
                <div className="text-[9px] tracking-[0.30em] font-black" style={{ color: isMyTurn ? '#FFC857' : '#00B7FF' }}>
                  {isMyTurn ? 'ACTIVE SEAT' : 'YOUR SEAT'}
                </div>
                <div className="text-sm font-black truncate mt-0.5">{you.name}</div>
                <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] font-bold tabular-nums">
                  <span className="rounded-full px-2 py-0.5 border text-cyan-200" style={{ background: 'rgba(0,183,255,0.10)', borderColor: 'rgba(0,183,255,0.32)' }}>
                    Bid {you.bid ?? '-'}
                  </span>
                  <span className="rounded-full px-2 py-0.5 border text-slate-200" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}>
                    Tricks {you.tricksWon}
                  </span>
                  <span className="rounded-full px-2 py-0.5 border text-amber-200" style={{ background: 'rgba(255,200,87,0.08)', borderColor: 'rgba(255,200,87,0.22)' }}>
                    {you.hand.length} cards
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* React hand section — replaces Pixi hand rendering */}
      {state.phase !== 'game-over' && (
        <section className="shrink-0 z-20 px-2 pt-1" style={{ overflow: 'visible' }}>
          <div className="relative flex items-end justify-center" style={{ height: 120, pointerEvents: 'none' }}>
            {(() => {
              const myHand = state.players[mySeat]?.hand ?? [];
              const total = myHand.length;
              if (total === 0) return null;
              const center = (total - 1) / 2;
              const viewportWidth = typeof window === 'undefined' ? 390 : window.innerWidth;
              const handWidth = Math.min(372, Math.max(304, viewportWidth - 34));
              const spreadX = Math.min(27, (handWidth - 70) / Math.max(total - 1, 1));
              const arc = 2.4;
              return myHand.map((cardId, i) => {
                const offset = i - center;
                const isSelected = cardId === selected;
                const isLegal = state.phase !== 'playing' || legalSet.has(cardId);
                return (
                  <button
                    type="button"
                    key={cardId}
                    onClick={() => {
                      if (state.phase !== 'playing' || !isMyTurn || !isLegal) return;
                      handleCardTap(cardId);
                    }}
                    className="absolute bottom-0 transition-all duration-200 ease-out focus:outline-none"
                    style={{
                      left: '50%',
                      width: 60,
                      height: 86,
                      marginLeft: -30,
                      transform: `translateX(${offset * spreadX}px) translateY(${isSelected ? -42 : Math.abs(offset) * 1.6}px) rotate(${isSelected ? 0 : offset * arc}deg) scale(${isSelected ? 1.18 : 1})`,
                      zIndex: isSelected ? 100 : i + 1,
                      pointerEvents: state.phase === 'playing' && isMyTurn && isLegal ? 'auto' : 'none',
                    }}
                    aria-label={cardId}
                    aria-pressed={isSelected}
                  >
                    <TreyCard cardId={cardId} selected={isSelected} isLegal={isLegal} />
                  </button>
                );
              });
            })()}
          </div>
        </section>
      )}

      {/* BOTTOM ACTION PANEL — bidding OR play hand */}
      {state.phase === 'bidding' && isMyTurn && (
        <section data-game-action-panel className="shrink-0 z-30 backdrop-blur-2xl border-t px-3 pt-2.5 pb-3 relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(5,7,13,0.96), rgba(5,7,13,0.99))',
            borderColor: 'rgba(0,183,255,0.35)',
            boxShadow: '0 -14px 36px rgba(0,183,255,0.22), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,183,255,0.7), rgba(168,85,247,0.7), transparent)' }} />
          <div className="flex items-center justify-between mb-2">
            <div className="min-w-0">
              <div className="text-[9px] tracking-[0.3em] font-bold" style={{ color: '#FFC857' }}>YOUR TURN</div>
              <div className="text-xs font-bold text-slate-200">How many tricks will you take?</div>
            </div>
            <button onClick={() => onBid(0)} className="min-h-9 px-3 py-2 rounded-full font-black text-[10px] tracking-[0.18em] shrink-0 active:scale-95 transition relative overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(244,63,94,0.28), rgba(244,63,94,0.10))',
                border: '1px solid rgba(244,63,94,0.6)',
                color: '#FCA5A5',
                boxShadow: '0 0 16px rgba(244,63,94,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}>
              NIL · 0
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-3">
            {Array.from({ length: 13 }).map((_, n) => {
              const bid = n + 1;
              return (
                <button key={bid} onClick={() => onBid(bid)}
                  className="h-9 rounded-lg font-black text-sm transition-all active:scale-90 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(180deg, rgba(0,183,255,0.22), rgba(0,183,255,0.05))',
                    border: '1px solid rgba(0,183,255,0.5)',
                    color: '#F8FAFC',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 8px rgba(0,183,255,0.18)',
                  }}>
                  <span className="relative z-10">{bid}</span>
                  <span className="absolute inset-x-1 top-0.5 h-2 rounded-full"
                    style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.18), transparent)' }} />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {state.phase === 'bidding' && !isMyTurn && (
        <section data-game-action-panel className="shrink-0 z-30 backdrop-blur-2xl border-t px-3 pt-2.5 pb-3 relative overflow-hidden"
          style={{ background: 'rgba(5,7,13,0.94)', borderColor: 'rgba(0,183,255,0.28)' }}>
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,183,255,0.5), transparent)' }} />
          <div className="text-[9px] tracking-[0.3em] font-bold text-cyan-300 text-center">BIDDING PHASE</div>
          <div className="text-sm font-bold mt-0.5 mb-3 text-center">
            {state.players[state.currentSeat].name} is deciding…
          </div>
        </section>
      )}

      {state.phase !== 'bidding' && state.phase !== 'game-over' && (
        <section data-game-action-panel className="shrink-0 z-30 backdrop-blur-2xl border-t pt-2 pb-2.5 px-2 relative overflow-hidden liquid-shimmer"
          style={{
            background: 'linear-gradient(180deg, rgba(5,7,13,0.96), rgba(5,7,13,0.99))',
            borderColor: 'rgba(0,183,255,0.35)',
            boxShadow: '0 -14px 36px rgba(0,183,255,0.22), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,183,255,0.7), rgba(168,85,247,0.7), transparent)' }} />
          {/* status + play button row */}
          <div className="flex items-center justify-between gap-2 mb-2 px-2">
            <div className="text-[9px] tracking-[0.3em] font-bold truncate" style={{ color: isMyTurn ? '#FFC857' : '#64748B' }}>
              {isMyTurn ? 'YOUR TURN' : `${state.players[state.currentSeat].name.toUpperCase()} TO PLAY`}
            </div>
            <button onClick={onPlayClick}
              disabled={!selected || !yourLegal.includes(selected) || !isMyTurn}
              className="px-5 py-1.5 rounded-full font-black text-[11px] tracking-[0.15em] uppercase transition-all disabled:opacity-30 active:scale-95 relative overflow-hidden"
              style={{
                background: selected && yourLegal.includes(selected) && isMyTurn ? 'var(--gradient-cta)' : 'rgba(255,255,255,0.06)',
                boxShadow: selected && yourLegal.includes(selected) && isMyTurn ? '0 0 26px rgba(0,183,255,0.6), inset 0 1px 0 rgba(255,255,255,0.3)' : 'none',
                color: selected && yourLegal.includes(selected) && isMyTurn ? '#fff' : '#94A3B8',
                border: '1px solid ' + (selected && yourLegal.includes(selected) && isMyTurn ? 'transparent' : 'rgba(255,255,255,0.1)'),
              }}>
              {selected && yourLegal.includes(selected) && isMyTurn
                ? `PLAY ${selected.slice(0, -1)}${SUIT_MAP[selected.slice(-1).toUpperCase()] ?? selected.slice(-1)}`
                : 'Play Card'}
              {selected && yourLegal.includes(selected) && isMyTurn && (
                <span className="absolute inset-0 holo-sheen" />
              )}
            </button>
          </div>
        </section>
      )}


      {/* ROUND-END / GAME-OVER */}
      {(state.phase === 'round-end' || state.phase === 'game-over') && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl p-5 border text-center trey-win-burst relative overflow-hidden"
            style={{
              background: 'linear-gradient(160deg,#08111F,#05070D)',
              borderColor: '#FFC85770',
              boxShadow: '0 0 80px rgba(255,200,87,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}>
            <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[100px]"
              style={{ background: 'radial-gradient(circle, rgba(255,200,87,0.35) 0%, transparent 70%)' }} />
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.35em] font-black px-3 py-1 rounded-full"
                style={{ background: 'rgba(255,200,87,0.12)', border: '1px solid rgba(255,200,87,0.45)', color: '#FFC857' }}>
                <Crown size={11} /> {state.phase === 'game-over' ? 'GAME OVER' : `ROUND ${state.round} COMPLETE`}
              </div>
              <div className="text-2xl sm:text-3xl font-black mt-3 mb-4 tracking-tight">
                {state.phase === 'game-over'
                  ? (teamWeScore > teamThemScore ? 'Team We Wins!' : 'Team Them Wins!')
                  : 'Round Recap'}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-2xl p-3 border" style={{ background: 'rgba(0,183,255,0.1)', borderColor: 'rgba(0,183,255,0.45)' }}>
                  <div className="text-[10px] text-cyan-300 tracking-[0.25em] font-bold">TEAM WE</div>
                  <div className="text-3xl font-black mt-1">{teamWeScore}</div>
                </div>
                <div className="rounded-2xl p-3 border" style={{ background: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.45)' }}>
                  <div className="text-[10px] text-purple-300 tracking-[0.25em] font-bold">TEAM THEM</div>
                  <div className="text-3xl font-black mt-1">{teamThemScore}</div>
                </div>
              </div>
              <div className="flex gap-2">
                {state.phase === 'round-end' ? (
                  <button onClick={onNextRound}
                    className="flex-1 py-3 rounded-2xl font-black text-sm tracking-wide active:scale-95 transition"
                    style={{ background: 'linear-gradient(90deg,#00B7FF,#A855F7)', boxShadow: '0 0 24px rgba(0,183,255,0.45)' }}>
                    Next Round
                  </button>
                ) : (
                  <button onClick={onPlayAgain}
                    className="flex-1 py-3 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition"
                    style={{ background: 'linear-gradient(90deg,#00B7FF,#A855F7)', boxShadow: '0 0 24px rgba(0,183,255,0.45)' }}>
                    <RotateCw size={16} /> Play Again
                  </button>
                )}
                <button onClick={onBack} className="flex-1 py-3 rounded-2xl font-bold text-sm border active:scale-95 transition"
                  style={{ borderColor: 'rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.04)' }}>
                  Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {chatDrawer}
    </div>
  );
};


// ============================================
// SUB-COMPONENTS
// ============================================
function teamOfSeat(seat: number): 0 | 1 { return (seat % 2) as 0 | 1; }

function syncSpadesPlayersFromRoom(state: SpadesState, players: Array<{ seat_index: number; display_name: string; is_bot: boolean }>) {
  let changed = false;
  const next: SpadesState = JSON.parse(JSON.stringify(state));
  players.forEach((player) => {
    const seat = player.seat_index;
    if (seat < 0 || seat >= next.players.length) return;
    if (next.players[seat].name !== player.display_name || next.players[seat].isBot !== player.is_bot) {
      next.players[seat].name = player.display_name;
      next.players[seat].isBot = player.is_bot;
      changed = true;
    }
  });
  return changed ? next : state;
}

const ScoreCard: React.FC<{ label: string; score: number; bid: number; tricks: number; bags: number; color: string }> =
({ label, score, bid, tricks, bags, color }) => {
  const [popKey, setPopKey] = useState(0);
  const prevScore = useRef(score);
  useEffect(() => {
    if (prevScore.current !== score) {
      setPopKey(k => k + 1);
      prevScore.current = score;
    }
  }, [score]);

  return (
    <div className="relative rounded-2xl px-3 py-1.5 backdrop-blur-xl overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${color}1F, ${color}05 60%, rgba(8,17,31,0.9))`,
        boxShadow: `0 4px 14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 18px ${color}28`,
      }}>
      {/* gradient border */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
        padding: 1,
        background: `linear-gradient(135deg, ${color}aa, ${color}30 60%, ${color}88)`,
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor', maskComposite: 'exclude',
      }} />
      {/* top sheen */}
      <div className="absolute inset-x-2 top-0.5 h-3 rounded-full pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.12), transparent)' }} />

      <div className="relative flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
            <div className="text-[9px] tracking-[0.32em] font-black leading-none" style={{ color }}>{label}</div>
          </div>
          <div className="text-[9px] text-slate-400 font-semibold leading-tight mt-1 tabular-nums">
            <span className="text-slate-200">{tricks}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-300">{bid}</span>
            <span className="text-slate-600"> · </span>
            <span className="text-amber-300">{bags}b</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div key={popKey}
            className="text-2xl font-black tracking-tight tabular-nums trey-score-pop"
            style={{
              color: '#fff',
              textShadow: `0 0 14px ${color}80, 0 0 2px ${color}`,
              fontFamily: "'Cinzel', serif",
            }}>{score}</div>
          <div className="flex items-center gap-1 mt-1">
            <span style={{ fontSize: 7, color: 'oklch(0.65 0.03 250)', letterSpacing: '0.18em', fontWeight: 700 }}>BAGS</span>
            <div className="flex gap-[2px]">
              {Array.from({ length: Math.min(bags, 10) }).map((_, i) => (
                <span key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}`, display: 'inline-block' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
