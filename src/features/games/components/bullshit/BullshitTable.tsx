/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState } from 'react';
import {
  newBullshitGame, makeClaim, callBullshit, passChallenge, botClaim, botShouldCall, BSState,
} from '@/features/games/lib/bullshit/bullshitEngine';
import { TreyBrandMark } from '../shared/TreyBrandMark';
import { GamePlayerSeat } from '../shared/GamePlayerSeat';
import { ArrowLeft, Info, Loader2, Flame } from 'lucide-react';
import { useRealtimeRoom } from '@/features/games/hooks/useRealtimeRoom';
import { PlayerIdentity } from '@/features/games/lib/services/identity';
import { useChat } from '@/features/games/hooks/useChat';
import { GameChatDrawer, ChatHeaderButton } from '../shared/GameChatDrawer';
import { PixiBullshitTableLazy } from '../pixi/PixiGameTables';


interface Props { onBack: () => void; onLegend: () => void; roomId?: string; identity?: PlayerIdentity; }

function bsApply(state: BSState, move: { type: string; seat: number; payload?: any }): BSState {
  switch (move.type) {
    case 'claim': return makeClaim(state, move.seat, move.payload.cardIds, move.payload.rank);
    case 'call':  return callBullshit(state, move.seat);
    case 'pass':  return passChallenge(state);
    case 'clear-reveal': return { ...state, reveal: null };
    default: return state;
  }
}
function bsExtract(s: BSState) {
  return { currentSeat: s.currentSeat, phase: s.phase, ended: s.phase === 'game-over' };
}

export const BullshitTable: React.FC<Props> = (props) => {
  if (props.roomId && props.identity) return <ServerBS {...props} roomId={props.roomId!} identity={props.identity!} />;
  return <LocalBS {...props} />;
};

const LocalBS: React.FC<Props> = ({ onBack, onLegend }) => {
  const [state, setState] = useState<BSState>(() => newBullshitGame(['You','Aaliyah','Marcus','Jamal']));
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (state.phase === 'playing' && state.players[state.currentSeat].isBot) {
      const seat = state.currentSeat;
      const t = setTimeout(() => {
        const { cardIds, rank } = botClaim(state, seat);
        setState(s => makeClaim(s, seat, cardIds, rank));
      }, 1100);
      return () => clearTimeout(t);
    }
    if (state.phase === 'awaiting-challenge') {
      const callerSeats = state.players.filter(p => p.isBot && p.seat !== state.lastClaim?.seat).map(p => p.seat);
      const t = setTimeout(() => {
        const caller = callerSeats.find(s => botShouldCall(state, s));
        if (caller !== undefined) setState(s => callBullshit(s, caller));
        else setState(passChallenge);
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [state.phase, state.currentSeat, state.lastClaim?.cardIds.join(',')]);

  useEffect(() => {
    if (state.reveal) {
      const t = setTimeout(() => setState(s => ({ ...s, reveal: null })), 2600);
      return () => clearTimeout(t);
    }
  }, [state.reveal]);

  return <BSView state={state} mySeat={0}
    selected={selected} setSelected={setSelected}
    onClaim={() => { if (selected.length) { setState(s => makeClaim(s, 0, selected, s.expectedRank)); setSelected([]); } }}
    onCall={() => setState(s => callBullshit(s, 0))}
    onPass={() => setState(passChallenge)}
    onRestart={() => { setState(newBullshitGame(['You','Aaliyah','Marcus','Jamal'])); setSelected([]); }}
    onBack={onBack} onLegend={onLegend} />;
};

const ServerBS: React.FC<Props & { roomId: string; identity: PlayerIdentity }> = ({ roomId, identity, onBack, onLegend }) => {
  const apply = useCallback(bsApply, []);
  const extract = useCallback(bsExtract, []);
  const room = useRealtimeRoom(roomId, identity, apply, extract);
  const [selected, setSelected] = useState<string[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const chat = useChat({ roomId, identity, mySeat: room.mySeat, isOpen: chatOpen });
  const state = room.state as BSState | null;
  const mySeat = room.mySeat;

  useEffect(() => {
    if (!room.isHost || !state) return;
    if (state.phase === 'playing') {
      const seatPlayer = room.players.find(p => p.seat_index === state.currentSeat);
      if (!seatPlayer?.is_bot) return;
      const seat = state.currentSeat;
      const t = setTimeout(() => {
        const { cardIds, rank } = botClaim(state, seat);
        room.setHostState(makeClaim(state, seat, cardIds, rank));
      }, 1200);
      return () => clearTimeout(t);
    }
    if (state.phase === 'awaiting-challenge') {
      const botCallers = room.players.filter(p => p.is_bot && p.seat_index !== state.lastClaim?.seat).map(p => p.seat_index);
      const t = setTimeout(() => {
        const caller = botCallers.find(s => botShouldCall(state, s));
        if (caller !== undefined) room.setHostState(callBullshit(state, caller));
        else room.setHostState(passChallenge(state));
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [room.isHost, state?.phase, state?.currentSeat, state?.lastClaim?.cardIds.join(','), room.players.length]);

  useEffect(() => {
    if (!room.isHost || !state?.reveal) return;
    const t = setTimeout(() => room.setHostState({ ...state, reveal: null }), 2600);
    return () => clearTimeout(t);
  }, [room.isHost, state?.reveal]);

  if (room.loading || !state || mySeat === null) return <div className="h-[100dvh] flex items-center justify-center text-slate-400"><Loader2 className="animate-spin mr-2" /> Syncing room…</div>;

  return <BSView state={state} mySeat={mySeat}
    selected={selected} setSelected={setSelected}
    onClaim={() => { if (selected.length) { room.sendMove({ type: 'claim', seat: mySeat, payload: { cardIds: selected, rank: state.expectedRank } }); setSelected([]); } }}
    onCall={() => room.sendMove({ type: 'call', seat: mySeat })}
    onPass={() => room.sendMove({ type: 'pass', seat: mySeat })}
    onRestart={onBack} onBack={onBack} onLegend={onLegend} roomCode={room.room?.room_code}
    chatButton={<ChatHeaderButton unread={chat.unread} accent="#A855F7" onClick={() => setChatOpen(true)} />}
    chatDrawer={
      <GameChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={chat.messages}
        loading={chat.loading}
        myUserId={identity.userId}
        mySeat={mySeat}
        onSend={chat.send}
        accent="#A855F7"
      />
    }
  />;
};

interface ViewProps {
  state: BSState; mySeat: number;
  selected: string[]; setSelected: (s: string[] | ((p: string[]) => string[])) => void;
  onClaim: () => void; onCall: () => void; onPass: () => void; onRestart: () => void;
  onBack: () => void; onLegend: () => void; roomCode?: string;
  chatButton?: React.ReactNode;
  chatDrawer?: React.ReactNode;
}

const BSView: React.FC<ViewProps> = ({ state, mySeat, selected, setSelected, onClaim, onCall, onPass, onRestart, onBack, onLegend, roomCode, chatButton, chatDrawer }) => {
  const you = state.players[mySeat];
  const isYourTurn = state.phase === 'playing' && state.currentSeat === mySeat;
  const canCall = state.phase === 'awaiting-challenge' && state.lastClaim && state.lastClaim.seat !== mySeat;
  const opponents = state.players.filter((_, i) => i !== mySeat).slice(0, 3);

  const isCaughtBluff = state.reveal?.liar;
  const pixiEventKey = `${state.phase}:${state.lastClaim?.cardIds.join('|') ?? 'none'}:${state.pile.length}:${state.reveal?.cards.join('|') ?? 'none'}:${state.reveal?.liar ?? 'none'}`;

  return (
    <div
      className={`w-full text-white flex flex-col overflow-hidden relative ${isCaughtBluff ? 'trey-bust-shake' : ''}`}
      style={{
        height: '100dvh',
        background: 'radial-gradient(ellipse at top, #1a0a2a 0%, #05070D 60%)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* ambient halos */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full blur-[140px] trey-ambient-glow"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.20) 0%, transparent 70%)' }} />
      </div>

      {/* HEADER */}
      <header className="shrink-0 z-20 backdrop-blur-2xl border-b" style={{ background: 'rgba(8,17,31,0.85)', borderColor: 'rgba(168,85,247,0.3)' }}>
        <div className="px-3 py-2 flex items-center gap-2">
          <button onClick={onBack} className="w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-white/5 border border-white/5" aria-label="Back" title="Back"><ArrowLeft size={18} /></button>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <TreyBrandMark size={20} glow className="shrink-0" />
            <div className="h-4 w-px bg-white/15 shrink-0" />
            <Flame size={14} className="text-purple-300 shrink-0" />

            <div className="text-sm font-black tracking-tight truncate">Bullshit</div>
            {roomCode && <div className="text-[9px] font-mono text-cyan-300 tracking-wider truncate">· {roomCode}</div>}
          </div>

          {chatButton}
          <button onClick={onLegend} className="w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-white/5 border border-white/5" aria-label="Suit legend" title="Suit legend"><Info size={16} /></button>
        </div>
      </header>

      {/* TABLE — flex-1 */}
      <main className="flex-1 min-h-0 px-3 py-2 flex items-stretch justify-center">
        <div
          className="relative w-full h-full max-w-md mx-auto rounded-[26px] border-2 overflow-hidden"
          style={{
            borderColor: 'rgba(168,85,247,0.45)',
            boxShadow: '0 0 50px rgba(168,85,247,0.18)',
            background: '#05070D',
          }}
        >
          {/* ── Opponent + player seat overlays ── */}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
            {/* Opponent seats — distributed across the top zone, matching Pixi positions */}
            {opponents.map((opp, i) => {
              const n = opponents.length;
              // X positions match Pixi: oppZoneW * i + oppZoneW/2, where oppZoneW = w/n
              const xPct = n === 1 ? 50 : n === 2 ? [25, 75][i] : [16.7, 50, 83.3][i];
              return (
                <div
                  key={opp.seat}
                  style={{
                    position: 'absolute',
                    left: `${xPct}%`,
                    top: '14%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                  }}
                >
                  <GamePlayerSeat
                    displayName={opp.name}
                    isBot={opp.isBot}
                    isCurrentTurn={state.currentSeat === opp.seat}
                    cardCount={opp.hand.length}
                    accentColor="#A855F7"
                    size="sm"
                    position="top"
                  />
                </div>
              );
            })}
            {/* Player seat — bottom, matching Pixi hand zone */}
            <div style={{ position: 'absolute', top: '82%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
              <GamePlayerSeat
                displayName={you.name}
                isBot={you.isBot}
                isCurrentTurn={isYourTurn}
                cardCount={you.hand.length}
                accentColor="#A855F7"
                size="md"
                position="bottom"
              />
            </div>
          </div>

          <PixiBullshitTableLazy
            myHand={you.hand}
            opponents={opponents.map(p => ({ name: p.name, cardCount: p.hand.length }))}
            pileCount={state.pile.length}
            revealCards={state.reveal?.cards ?? null}
            revealLiar={state.reveal?.liar ?? null}
            awaitingChallenge={state.phase === 'awaiting-challenge'}
            selectedCards={selected}
            isMyTurn={isYourTurn}
            expectedRank={state.expectedRank}
            accent="#A855F7"
            eventKey={pixiEventKey}
            onCardClick={(cardId) => {
              if (!isYourTurn) return;
              setSelected(s => s.includes(cardId) ? s.filter(x => x !== cardId) : (s.length < 4 ? [...s, cardId] : s));
            }}
          />

          {/* Floating info overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center px-2 py-2 pointer-events-none z-10">
            {state.reveal ? (
              <div className="inline-block px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider trey-glass-button"
                style={{
                  background: state.reveal.liar ? 'rgba(239,68,68,0.18)' : 'rgba(34,197,94,0.18)',
                  color: state.reveal.liar ? '#EF4444' : '#22C55E',
                  border: '1px solid currentColor',
                  boxShadow: `0 0 26px ${state.reveal.liar ? 'rgba(239,68,68,0.34)' : 'rgba(34,197,94,0.30)'}`,
                }}>
                {state.reveal.liar ? 'BLUFF CAUGHT!' : 'CLAIM WAS TRUE!'}
              </div>
            ) : (
              <div className="relative px-5 py-3 rounded-[24px] border backdrop-blur-xl trey-glass-panel pointer-events-none"
                style={{
                  borderColor: 'rgba(168,85,247,0.45)',
                  boxShadow: '0 0 36px rgba(168,85,247,0.18), inset 0 1px 0 rgba(255,255,255,0.09)',
                }}>
                <div className="text-[9px] text-purple-300 tracking-[0.3em] font-black">CURRENT CLAIM</div>
                <div className="text-2xl font-black mt-0.5">
                  {state.lastClaim ? `${state.lastClaim.count} x ${state.lastClaim.rank}` : `Claim ${state.expectedRank}`}
                </div>
                {state.lastClaim && (
                  <div className="text-[10px] text-slate-400 mt-0.5">by {state.players[state.lastClaim.seat].name}</div>
                )}
              </div>
            )}
            <div className="text-[10px] text-slate-300 font-bold mt-2 bg-black/40 px-2 py-0.5 rounded">
              {isYourTurn ? `Your turn — claim ${state.expectedRank}s` :
               canCall ? `Pass or call BS` :
               state.phase === 'game-over' ? '' :
               `${state.players[state.currentSeat].name} is thinking…`}
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM ACTION PANEL */}
      {state.phase !== 'game-over' && (
        <section className="shrink-0 z-30 backdrop-blur-2xl border-t pt-2 pb-2.5 px-2"
          style={{ background: 'rgba(8,17,31,0.96)', borderColor: 'rgba(168,85,247,0.3)', boxShadow: '0 -10px 30px rgba(168,85,247,0.18)' }}>
          <div className="flex justify-center gap-1.5 mb-2 flex-wrap">
            {isYourTurn && (
              <button onClick={onClaim} disabled={selected.length === 0}
                className="min-h-9 px-5 py-2 rounded-full font-black text-[11px] tracking-[0.15em] uppercase disabled:opacity-40 active:scale-95 transition"
                style={{
                  background: selected.length > 0 ? 'linear-gradient(90deg,#A855F7,#00B7FF)' : 'rgba(255,255,255,0.06)',
                  color: '#fff',
                  boxShadow: selected.length > 0 ? '0 0 22px rgba(168,85,247,0.5)' : 'none',
                  border: selected.length > 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                }}>
                Play {selected.length || 0} × {state.expectedRank}
              </button>
            )}
            {canCall && (
              <>
                <button onClick={onCall}
                  className="px-5 py-1.5 rounded-full font-black text-[11px] tracking-[0.15em] uppercase active:scale-95 transition"
                  style={{ background: 'linear-gradient(90deg,#EF4444,#FFB000)', color: '#fff', boxShadow: '0 0 22px rgba(239,68,68,0.5)' }}>
                  Call BS
                </button>
                <button onClick={onPass}
                  className="px-5 py-1.5 rounded-full font-black text-[11px] tracking-[0.15em] uppercase border active:scale-95 transition"
                  style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#94A3B8' }}>
                  Pass
                </button>
              </>
            )}
          </div>
          {/* Hand is now rendered inside the Pixi canvas */}
        </section>
      )}

      {state.phase === 'game-over' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl p-5 border text-center trey-win-burst relative overflow-hidden"
            style={{ background: 'linear-gradient(160deg,#08111F,#05070D)', borderColor: '#A855F770', boxShadow: '0 0 60px rgba(168,85,247,0.35)' }}>
            <div className="text-[10px] text-purple-300 tracking-[0.35em] font-black">GAME OVER</div>
            <div className="text-2xl sm:text-3xl font-black mt-2 mb-4">{state.players[state.winner!].name} wins!</div>
            <div className="flex gap-2">
              <button onClick={onRestart} className="flex-1 py-3 rounded-2xl font-black text-sm active:scale-95 transition"
                style={{ background: 'linear-gradient(90deg,#A855F7,#00B7FF)', boxShadow: '0 0 22px rgba(168,85,247,0.45)' }}>
                Play Again
              </button>
              <button onClick={onBack} className="flex-1 py-3 rounded-2xl font-bold text-sm border active:scale-95 transition"
                style={{ borderColor: 'rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.04)' }}>
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {chatDrawer}
    </div>
  );
};
