/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  newSpadesGame, placeBid, playCard, legalCards, botBid, botPlay, startNextRound,
  SpadesState,
} from '@/features/games/lib/spades/spadesEngine';
import { TreyCard } from '../shared/TreyCard';
import { TreyBrandMark } from '../shared/TreyBrandMark';
import { ArrowLeft, Info, RotateCw, Loader2, Crown, Flame, Spade } from 'lucide-react';

import { useRealtimeRoom } from '@/features/games/hooks/useRealtimeRoom';
import { PlayerIdentity } from '@/features/games/lib/services/identity';
import { useChat } from '@/features/games/hooks/useChat';
import { GameChatDrawer, ChatHeaderButton } from '../shared/GameChatDrawer';
import { PixiTableEffectsLazy } from '../pixi/PixiTableEffectsLazy';

interface Props {
  onBack: () => void;
  onLegend: () => void;
  targetScore?: number;
  roomId?: string;
  identity?: PlayerIdentity;
}

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
    if (state.phase === 'bidding' && state.players[state.currentSeat].isBot) {
      const seat = state.currentSeat;
      const t = setTimeout(() => setState(s => placeBid(s, seat, botBid(s, seat))), 700);
      return () => clearTimeout(t);
    }
    if (state.phase === 'playing' && state.players[state.currentSeat].isBot) {
      const seat = state.currentSeat;
      const delay = state.trick.length === 3 ? 900 : 650;
      const t = setTimeout(() => setState(s => playCard(s, seat, botPlay(s, seat))), delay);
      return () => clearTimeout(t);
    }
  }, [state.phase, state.currentSeat, state.trick.length]);

  return (
    <SpadesView
      state={state} mySeat={0}
      selected={selected} setSelected={setSelected}
      onBid={(n) => setState(s => placeBid(s, 0, n))}
      onPlay={() => selected && setState(s => playCard(s, 0, selected!)) && setSelected(null)}
      onPlayClick={() => { if (selected) { setState(s => playCard(s, 0, selected)); setSelected(null); } }}
      onNextRound={() => setState(startNextRound)}
      onPlayAgain={() => setState(newSpadesGame(['You','Aaliyah','Marcus','Jamal'], targetScore))}
      onBack={onBack} onLegend={onLegend}
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

  useEffect(() => {
    if (!room.isHost || !state || !room.session) return;
    const seatPlayer = room.players.find(p => p.seat_index === state.currentSeat);
    if (!seatPlayer || !seatPlayer.is_bot) return;
    if (state.phase === 'bidding') {
      const seat = state.currentSeat;
      const t = setTimeout(() => room.setHostState(placeBid(state, seat, botBid(state, seat))), 800);
      return () => clearTimeout(t);
    }
    if (state.phase === 'playing') {
      const seat = state.currentSeat;
      const delay = state.trick.length === 3 ? 1000 : 700;
      const t = setTimeout(() => room.setHostState(playCard(state, seat, botPlay(state, seat))), delay);
      return () => clearTimeout(t);
    }
  }, [room.isHost, state?.phase, state?.currentSeat, state?.trick.length, room.players.length]);

  if (room.loading || !state || mySeat === null) {
    return <div className="h-[100dvh] flex items-center justify-center text-slate-400" style={{ background: '#05070D' }}><Loader2 className="animate-spin mr-2" /> Syncing room…</div>;
  }

  return (
    <SpadesView
      state={state} mySeat={mySeat}
      selected={selected} setSelected={setSelected}
      onBid={(n) => room.sendMove({ type: 'bid', seat: mySeat, payload: { bid: n } })}
      onPlay={() => selected && room.sendMove({ type: 'play', seat: mySeat, payload: { cardId: selected } })}
      onPlayClick={() => { if (selected) { room.sendMove({ type: 'play', seat: mySeat, payload: { cardId: selected } }); setSelected(null); } }}
      onNextRound={() => room.sendMove({ type: 'next-round', seat: mySeat })}
      onPlayAgain={onBack}
      onBack={onBack} onLegend={onLegend}
      roomCode={room.room?.room_code}
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
// HAND ROW — fits all cards on screen, no overflow
// Measures container width and computes overlap so every card is visible.
// ============================================
const CARD_W = 42; // xs card width in px

const HandRow: React.FC<{
  hand: string[];
  selected?: string | null;
  legalCards?: string[];
  isMyTurn?: boolean;
  playing?: boolean;
  onSelect?: (id: string) => void;
}> = ({ hand, selected, legalCards = [], isMyTurn = false, playing = false, onSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(360);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.offsetWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const count = hand.length;
  // Spacing: divide available width evenly, but never wider than a card
  const available = containerWidth - 16;
  const spacing = count > 1 ? Math.min(CARD_W, available / count) : CARD_W;
  const marginLeft = spacing - CARD_W; // negative = overlap

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex justify-center items-end py-2">
        {hand.map((cardId, idx) => {
          const mid = (count - 1) / 2;
          const offset = idx - mid;
          const rot = offset * 2.2;
          const lift = Math.abs(offset) * 1.2;
          const isLegal = legalCards.includes(cardId);
          const dimmed = playing && isMyTurn && !isLegal;
          const clickable = playing && isMyTurn && isLegal;
          return (
            <div
              key={cardId}
              className="shrink-0"
              style={{
                marginLeft: idx === 0 ? 0 : marginLeft,
                transform: `rotate(${rot}deg) translateY(${lift}px)`,
                transformOrigin: 'bottom center',
                zIndex: selected === cardId ? 50 : idx,
              }}
            >
              <TreyCard
                cardId={cardId}
                size="xs"
                selected={selected === cardId}
                playable={clickable}
                dimmed={dimmed}
                onClick={clickable ? () => onSelect?.(cardId) : undefined}
              />
            </div>
          );
        })}
      </div>
    </div>
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
  onPlay: () => void;
  onPlayClick: () => void;
  onNextRound: () => void;
  onPlayAgain: () => void;
  onBack: () => void;
  onLegend: () => void;
  roomCode?: string;
  chatButton?: React.ReactNode;
  chatDrawer?: React.ReactNode;
}

const SpadesView: React.FC<ViewProps> = ({
  state, mySeat, selected, setSelected, onBid, onPlayClick, onNextRound, onPlayAgain, onBack, onLegend, roomCode, chatButton, chatDrawer,
}) => {

  const you = state.players[mySeat];
  const isMyTurn = state.currentSeat === mySeat;
  const yourLegal = useMemo(() => state.phase === 'playing' && isMyTurn ? legalCards(state, mySeat) : [], [state, mySeat, isMyTurn]);

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
  const pixiEventKey = `${state.round}:${state.phase}:${state.trick.map(t => `${t.seat}-${t.cardId}`).join('|')}:${winnerFlash ?? 'none'}:${state.lastTrickWinner ?? 'none'}`;

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
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/5 transition border border-white/5" aria-label="Back">
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
          <button onClick={onLegend} className="p-1.5 rounded-lg hover:bg-white/5 transition border border-white/5" aria-label="Suit legend" title="Suit legend"><Info size={16} /></button>
        </div>


        {/* COMPACT SCORE ROW */}
        <div className="px-3 pb-2 grid grid-cols-2 gap-2">
          <ScoreCard label="WE" score={teamWeScore} bid={state.teamRoundBids[myTeam]} tricks={state.teamRoundTricks[myTeam]} bags={state.teamBags[myTeam]} color="#00B7FF" />
          <ScoreCard label="THEM" score={teamThemScore} bid={state.teamRoundBids[1 - myTeam]} tricks={state.teamRoundTricks[1 - myTeam]} bags={state.teamBags[1 - myTeam]} color="#A855F7" />
        </div>
      </header>

      {/* FELT — flexes to fill remaining space */}
      <main className="flex-1 min-h-0 relative flex items-center justify-center px-2 py-2">
        <div
          className="relative w-full h-full max-w-md mx-auto rounded-[28px] overflow-hidden trey-felt-rim"
          style={{
            background: `
              radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,183,255,0.10) 0%, rgba(8,17,31,0.0) 60%),
              radial-gradient(ellipse 100% 100% at 50% 50%, rgba(10,20,48,0.95) 0%, rgba(5,7,13,0.98) 70%, #02030A 100%)
            `,
            border: '1.5px solid rgba(0,183,255,0.32)',
          }}
        >
          <PixiTableEffectsLazy
            game="spades"
            accent="#00B7FF"
            eventKey={pixiEventKey}
            cardCount={state.trick.length || 1}
            winnerSeat={winnerFlash}
            className="z-0 opacity-90"
          />
          {/* slow conic spotlight behind everything */}
          <div className="absolute inset-0 pointer-events-none opacity-50">
            <div className="absolute inset-[-25%] trey-conic-light"
              style={{
                background: 'conic-gradient(from 0deg at 50% 50%, rgba(0,183,255,0.08), transparent 25%, rgba(168,85,247,0.10) 50%, transparent 75%, rgba(0,183,255,0.08))',
                filter: 'blur(28px)',
              }} />
          </div>

          {/* drifting smoke */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-[-10%] trey-smoke opacity-60"
              style={{
                background: 'radial-gradient(ellipse 50% 30% at 30% 40%, rgba(0,183,255,0.10), transparent 70%), radial-gradient(ellipse 40% 30% at 70% 70%, rgba(168,85,247,0.10), transparent 70%)',
                filter: 'blur(40px)',
              }} />
          </div>

          {/* inner glass panel highlight (top sheen) */}
          <div className="absolute inset-x-4 top-2 h-10 rounded-full pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.05), transparent)' }} />

          {/* inner felt vignette + reflective inner ring */}
          <div className="absolute inset-3 rounded-[22px] pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.04)',
            }} />

          {/* Opponent seats */}
          {[0, 1, 2, 3].filter(s => s !== mySeat).map(s => (
            <PlayerSeat
              key={s}
              state={state}
              seat={s}
              position={seatPositions[s] as 'left'|'top'|'right'}
              isDealer={s === dealerSeat}
              winnerFlash={winnerFlash === s}
              partner={teamOfSeat(s) === myTeam}
            />
          ))}

          {/* Center trick area */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <TrickArea state={state} seatPositions={seatPositions} winnerFlash={winnerFlash} />
          </div>

          {/* Bottom "you" nameplate — premium floating capsule */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center px-3">
            <div className={`relative inline-flex items-center gap-1.5 rounded-full pl-1 pr-2.5 py-1 border backdrop-blur-xl trey-nameplate-sheen ${isMyTurn ? 'trey-turn-pulse' : ''} ${winnerFlash === mySeat ? 'trey-trick-win' : ''}`}
              style={{
                background: isMyTurn
                  ? 'linear-gradient(180deg, rgba(255,200,87,0.20), rgba(255,200,87,0.06))'
                  : 'linear-gradient(180deg, rgba(8,17,31,0.85), rgba(8,17,31,0.65))',
                borderColor: isMyTurn ? '#FFC857' : 'rgba(255,255,255,0.16)',
                color: isMyTurn ? '#FFC857' : '#F8FAFC',
                boxShadow: isMyTurn ? '0 0 24px rgba(255,200,87,0.4)' : '0 4px 12px rgba(0,0,0,0.4)',
              }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,183,255,0.55), rgba(0,183,255,0.15))',
                  border: '1px solid rgba(0,183,255,0.8)',
                  color: '#fff',
                  textShadow: '0 0 8px rgba(0,183,255,0.9)',
                  boxShadow: '0 0 12px rgba(0,183,255,0.45)',
                }}>
                {(you.name || 'Y').charAt(0).toUpperCase()}
              </div>
              <span className="text-[11px] font-bold leading-tight">{you.name}</span>
              <span className="text-slate-500">·</span>
              <span className="text-[11px] text-slate-300 tabular-nums">Tr {you.tricksWon}</span>
              {you.bid !== null && <><span className="text-slate-500">·</span><span className="text-[11px] tabular-nums" style={{ color: '#00B7FF' }}>Bid {you.bid}</span></>}
              {dealerSeat === mySeat && (
                <span className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black leading-none shrink-0"
                  style={{
                    background: 'radial-gradient(circle, #FFC857, #C99326)',
                    color: '#1A1206',
                    border: '1px solid rgba(255,200,87,0.9)',
                    boxShadow: '0 0 8px rgba(255,200,87,0.6), inset 0 1px 0 rgba(255,255,255,0.4)',
                  }}>D</span>
              )}
            </div>
          </div>
        </div>
      </main>


      {/* BOTTOM ACTION PANEL — bidding OR play hand */}
      {state.phase === 'bidding' && isMyTurn && (
        <section className="shrink-0 z-30 backdrop-blur-2xl border-t px-3 pt-2.5 pb-3 relative overflow-hidden"
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
            <button onClick={() => onBid(0)} className="px-3 py-1.5 rounded-full font-black text-[10px] tracking-[0.18em] shrink-0 active:scale-95 transition relative overflow-hidden"
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
          {/* Your hand — visible during bidding so you can count your books */}
          <HandRow hand={you.hand} />
        </section>
      )}

      {state.phase === 'bidding' && !isMyTurn && (
        <section className="shrink-0 z-30 backdrop-blur-2xl border-t px-3 pt-2.5 pb-3 relative overflow-hidden"
          style={{ background: 'rgba(5,7,13,0.94)', borderColor: 'rgba(0,183,255,0.28)' }}>
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,183,255,0.5), transparent)' }} />
          <div className="text-[9px] tracking-[0.3em] font-bold text-cyan-300 text-center">BIDDING PHASE</div>
          <div className="text-sm font-bold mt-0.5 mb-3 text-center">
            {state.players[state.currentSeat].name} is deciding…
          </div>
          {/* Your hand — visible while waiting so you can plan your bid */}
          <HandRow hand={you.hand} />
        </section>
      )}

      {state.phase !== 'bidding' && state.phase !== 'game-over' && (
        <section className="shrink-0 z-30 backdrop-blur-2xl border-t pt-2 pb-2.5 px-2 relative overflow-hidden"
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
                background: selected && yourLegal.includes(selected) && isMyTurn ? 'linear-gradient(90deg,#00B7FF,#A855F7)' : 'rgba(255,255,255,0.06)',
                boxShadow: selected && yourLegal.includes(selected) && isMyTurn ? '0 0 26px rgba(0,183,255,0.6), inset 0 1px 0 rgba(255,255,255,0.3)' : 'none',
                color: selected && yourLegal.includes(selected) && isMyTurn ? '#fff' : '#94A3B8',
                border: '1px solid ' + (selected && yourLegal.includes(selected) && isMyTurn ? 'transparent' : 'rgba(255,255,255,0.1)'),
              }}>
              Play Card
            </button>
          </div>
          {/* hand */}
          <HandRow
            hand={you.hand}
            selected={selected}
            legalCards={yourLegal}
            isMyTurn={isMyTurn}
            playing
            onSelect={setSelected}
          />
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
        <div key={popKey}
          className="text-2xl font-black tracking-tight tabular-nums trey-score-pop"
          style={{
            color: '#fff',
            textShadow: `0 0 14px ${color}80, 0 0 2px ${color}`,
            fontFamily: "'Cinzel', serif",
          }}>{score}</div>
      </div>
    </div>
  );
};

const PlayerSeat: React.FC<{
  state: SpadesState;
  seat: number;
  position: 'top' | 'left' | 'right';
  isDealer: boolean;
  winnerFlash: boolean;
  partner: boolean;
}> = ({ state, seat, position, isDealer, winnerFlash, partner }) => {
  const p = state.players[seat];
  const active = state.currentSeat === seat;
  const accent = partner ? '#00B7FF' : '#A855F7';
  const initial = (p.name || '?').charAt(0).toUpperCase();

  const Nameplate = (
    <div className={`relative inline-flex items-center gap-1 rounded-full pl-0.5 pr-1.5 py-0.5 border backdrop-blur-xl transition-all trey-nameplate-sheen ${active ? 'trey-turn-pulse' : ''} ${winnerFlash ? 'trey-trick-win' : ''}`}
      style={{
        background: active
          ? 'linear-gradient(180deg, rgba(255,200,87,0.22), rgba(255,200,87,0.05))'
          : 'linear-gradient(180deg, rgba(8,17,31,0.92), rgba(8,17,31,0.7))',
        borderColor: active ? '#FFC857' : 'rgba(255,255,255,0.16)',
        maxWidth: '120px',
        boxShadow: active ? '0 0 18px rgba(255,200,87,0.4)' : '0 3px 10px rgba(0,0,0,0.45)',
      }}>
      <div className="relative w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
        style={{
          background: `radial-gradient(circle at 30% 25%, ${accent}, ${accent}50 70%, #0a1228)`,
          border: `1px solid ${accent}`,
          color: '#fff',
          textShadow: `0 0 6px ${accent}`,
          boxShadow: `0 0 10px ${accent}88, inset 0 1px 0 rgba(255,255,255,0.3)`,
        }}>
        {initial}
      </div>
      <div className="text-[10px] font-bold leading-tight truncate" style={{ color: active ? '#FFC857' : '#F8FAFC', maxWidth: '64px' }}>
        {p.name}
      </div>
      {isDealer && (
        <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black leading-none shrink-0"
          style={{
            background: 'radial-gradient(circle at 30% 25%, #FFE7A8, #FFC857 55%, #8C6918)',
            color: '#1A1206',
            border: '1px solid rgba(255,200,87,0.9)',
            boxShadow: '0 0 8px rgba(255,200,87,0.7), inset 0 1px 0 rgba(255,255,255,0.5)',
          }}>D</span>
      )}
    </div>
  );

  const StatLine = (
    <div className="text-[9px] text-slate-400 font-medium tabular-nums whitespace-nowrap inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
      style={{ background: 'rgba(8,17,31,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
      {p.bid !== null
        ? <span style={{ color: accent }}>Bid {p.bid}</span>
        : <span className="text-slate-500">bidding…</span>}
      <span className="text-slate-700">·</span>
      <span className="text-slate-300">Tr {p.tricksWon}</span>
    </div>
  );

  const CardStack = ({ count, horizontal }: { count: number; horizontal: boolean }) => (
    <div className={`flex ${horizontal ? '' : 'flex-col'} items-center`}>
      {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
        <div
          key={i}
          style={{
            marginLeft: horizontal && i > 0 ? -24 : 0,
            marginTop: !horizontal && i > 0 ? -40 : 0,
            transform: horizontal ? `rotate(${(i - 1.5) * 2}deg)` : `rotate(${(i - 1.5) * 1.5}deg)`,
          }}
        >
          <TreyCard faceDown size="xs" />
        </div>
      ))}
    </div>
  );

  if (position === 'top') {
    return (
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10">
        <CardStack count={p.hand.length} horizontal />
        {Nameplate}
        {StatLine}
      </div>
    );
  }

  if (position === 'left') {
    return (
      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10">
        <CardStack count={p.hand.length} horizontal={false} />
        {Nameplate}
        {StatLine}
      </div>
    );
  }

  // right
  return (
    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10">
      <CardStack count={p.hand.length} horizontal={false} />
      {Nameplate}
      {StatLine}
    </div>
  );
};

const TrickArea: React.FC<{
  state: SpadesState;
  seatPositions: Record<number, 'bottom'|'left'|'top'|'right'>;
  winnerFlash: number | null;
}> = ({ state, seatPositions, winnerFlash }) => {
  const fromOffsets: Record<string, { x: number; y: number; r: number }> = {
    bottom: { x: 0,    y: 130,  r: 6   },
    left:   { x: -140, y: 0,    r: -10 },
    top:    { x: 0,    y: -130, r: -6  },
    right:  { x: 140,  y: 0,    r: 10  },
  };
  const finalOffsets: Record<string, React.CSSProperties> = {
    bottom: { transform: 'translate(0, 28px)' },
    left:   { transform: 'translate(-38px, 0)' },
    top:    { transform: 'translate(0, -28px)' },
    right:  { transform: 'translate(38px, 0)' },
  };

  // Sweep direction toward winner
  const winnerPos = winnerFlash !== null ? seatPositions[winnerFlash] : null;
  const sweepTransform: Record<string, string> = {
    bottom: 'translate(0, 60px)',
    left:   'translate(-60px, 0)',
    top:    'translate(0, -60px)',
    right:  'translate(60px, 0)',
  };

  return (
    <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
      {/* outer ambient ring */}
      <div className="absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(0,183,255,0.18) 0%, transparent 65%)' }} />
      {/* layered glass rings */}
      <div className="absolute inset-2 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 35%, rgba(255,255,255,0.06) 0%, transparent 50%)',
          border: '1px solid rgba(0,183,255,0.22)',
          boxShadow: 'inset 0 0 30px rgba(0,183,255,0.10), 0 0 20px rgba(0,183,255,0.10)',
        }} />
      <div className="absolute inset-6 rounded-full pointer-events-none"
        style={{
          border: '1px dashed rgba(168,85,247,0.18)',
        }} />
      <div className="absolute inset-10 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0,183,255,0.08), transparent 70%)',
          border: '1px solid rgba(255,255,255,0.04)',
        }} />

      {/* tiny center spades crest when idle */}
      {state.trick.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center px-3">
            {state.phase === 'bidding' ? (
              <>
                <div className="text-[9px] tracking-[0.35em] text-cyan-300 opacity-80 font-bold">BIDDING</div>
                <div className="font-black mt-1 text-xs" style={{ textShadow: '0 0 8px rgba(0,183,255,0.6)' }}>
                  {state.players[state.currentSeat].name}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">to bid</div>
              </>
            ) : (
              <>
                <div className="text-[9px] tracking-[0.35em] text-cyan-300 opacity-80 font-bold">LEAD</div>
                <div className="font-black mt-1 text-xs" style={{ textShadow: '0 0 8px rgba(0,183,255,0.6)' }}>
                  {state.players[state.currentSeat].name}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">{state.spadesBroken ? 'spades broken' : 'spades safe'}</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* glow sweep toward winner */}
      {winnerPos && (
        <div className="absolute w-24 h-24 rounded-full pointer-events-none trey-glow-sweep"
          style={{
            background: 'radial-gradient(circle, rgba(255,200,87,0.7), transparent 70%)',
            transform: sweepTransform[winnerPos],
            filter: 'blur(8px)',
          }} />
      )}

      {/* trick cards */}
      {state.trick.map((t) => {
        const pos = seatPositions[t.seat];
        const from = fromOffsets[pos];
        return (
          <div
            key={`${t.seat}-${t.cardId}`}
            className="absolute trey-card-throw pointer-events-none"
            style={{
              ...finalOffsets[pos],
              ['--from-x' as any]: `${from.x}px`,
              ['--from-y' as any]: `${from.y}px`,
              ['--from-r' as any]: `${from.r}deg`,
            }}
          >
            <TreyCard cardId={t.cardId} size="sm" />
          </div>
        );
      })}
    </div>
  );
};
