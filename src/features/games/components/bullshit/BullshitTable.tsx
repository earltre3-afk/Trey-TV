 
import React, { useCallback, useEffect, useState } from 'react';
import {
  newBullshitGame, makeClaim, callBullshit, passChallenge, botClaim, botShouldCall, BSState,
} from '@/features/games/lib/bullshit/bullshitEngine';
import { TreyBrandMark } from '../shared/TreyBrandMark';
import { GamePlayerSeat } from '../shared/GamePlayerSeat';
import { TreyCard } from '../shared/TreyCard';
import { ArrowLeft, Info, Loader2, Flame } from 'lucide-react';
import { useRealtimeRoom } from '@/features/games/hooks/useRealtimeRoom';
import { PlayerIdentity } from '@/features/games/lib/services/identity';
import { useChat } from '@/features/games/hooks/useChat';
import { GameChatDrawer, ChatHeaderButton } from '../shared/GameChatDrawer';
import { PixiBullshitTableLazy } from '../pixi/PixiGameTables';
import { useTvRemoteInput, useTvRemoteMode } from '@/lib/tv/useTvRemoteInput';
import { getGameBullshitDecision } from '@/lib/trey-i/vertex.server';
import type { Rank } from '@/features/games/lib/cards/cardManifest';


interface Props { onBack: () => void; onLegend: () => void; roomId?: string; identity?: PlayerIdentity; }

const BOT_CLAIM_DELAY_MS = 2400;
const BOT_CHALLENGE_DELAY_MS = 2600;
const REVEAL_CLEAR_DELAY_MS = 3400;
const HUMAN_TURN_TIMEOUT_MS = 15000;

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

async function getBSDecisionWithFallback(state: BSState, seat: number, isClaim: boolean): Promise<{ cardIds?: string[]; rank?: string; callBullshit?: boolean }> {
  let timeoutId: any;
  const timeoutPromise = new Promise<{ cardIds?: string[]; rank?: string; callBullshit?: boolean }>((resolve) => {
    timeoutId = setTimeout(() => {
      console.warn("Bullshit AI decision timed out. Falling back to local engine.");
      if (isClaim) {
        const fallback = botClaim(state, seat);
        resolve({ cardIds: fallback.cardIds, rank: fallback.rank });
      } else {
        resolve({ callBullshit: botShouldCall(state, seat) });
      }
    }, 1800);
  });

  const apiPromise = getGameBullshitDecision({ data: { state, seat, isClaim } })
    .then((res) => {
      clearTimeout(timeoutId);
      return res;
    })
    .catch((err) => {
      console.error("Bullshit AI decision failed:", err);
      clearTimeout(timeoutId);
      if (isClaim) {
        const fallback = botClaim(state, seat);
        return { cardIds: fallback.cardIds, rank: fallback.rank };
      } else {
        return { callBullshit: botShouldCall(state, seat) };
      }
    });

  return Promise.race([apiPromise, timeoutPromise]);
}

export const BullshitTable: React.FC<Props> = (props) => {
  if (props.roomId && props.identity) return <ServerBS {...props} roomId={props.roomId!} identity={props.identity!} />;
  return <LocalBS {...props} />;
};

const LocalBS: React.FC<Props> = ({ onBack, onLegend }) => {
  const [state, setState] = useState<BSState>(() => newBullshitGame(['You','Aaliyah','Marcus','Jamal']));
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (state.phase === 'playing') {
      const seat = state.currentSeat;
      const isBot = state.players[seat].isBot;
      const t = setTimeout(async () => {
        if (isBot) {
          const decision = await getBSDecisionWithFallback(state, seat, true);
          setState(s => {
            if (s.phase === 'playing' && s.currentSeat === seat) {
              return makeClaim(s, seat, decision.cardIds ?? botClaim(s, seat).cardIds, (decision.rank ?? s.expectedRank) as Rank);
            }
            return s;
          });
        } else {
          const { cardIds, rank } = botClaim(state, seat);
          setState(s => makeClaim(s, seat, cardIds, rank));
        }
      }, isBot ? BOT_CLAIM_DELAY_MS : HUMAN_TURN_TIMEOUT_MS);
      return () => clearTimeout(t);
    }
    if (state.phase === 'awaiting-challenge') {
      const callerSeats = state.players.filter(p => p.isBot && p.seat !== state.lastClaim?.seat).map(p => p.seat);
      const hasHumanCaller = state.players.some(p => !p.isBot && p.seat !== state.lastClaim?.seat);
      const t = setTimeout(async () => {
        const decisions = await Promise.all(
          callerSeats.map(async (seatIndex) => {
            const decision = await getBSDecisionWithFallback(state, seatIndex, false);
            return { seatIndex, callBullshit: decision.callBullshit };
          })
        );
        const caller = decisions.find(d => d.callBullshit)?.seatIndex;
        setState(s => {
          if (s.phase === 'awaiting-challenge') {
            if (caller !== undefined) return callBullshit(s, caller);
            return passChallenge(s);
          }
          return s;
        });
      }, hasHumanCaller ? HUMAN_TURN_TIMEOUT_MS : BOT_CHALLENGE_DELAY_MS);
      return () => clearTimeout(t);
    }
  }, [state.phase, state.currentSeat, state.lastClaim?.cardIds.join(',')]);

  useEffect(() => {
    if (state.reveal) {
      const t = setTimeout(() => setState(s => ({ ...s, reveal: null })), REVEAL_CLEAR_DELAY_MS);
      return () => clearTimeout(t);
    }
  }, [state.reveal]);

  return <BSView state={state} mySeat={0}
    selected={selected} setSelected={setSelected}
    onClaim={() => { if (selected.length) { setState(s => makeClaim(s, 0, selected, s.expectedRank)); setSelected([]); } }}
    onCall={() => setState(s => callBullshit(s, 0))}
    onPass={() => setState(passChallenge)}
    onRestart={() => { setState(newBullshitGame(['You','Aaliyah','Marcus','Jamal'])); setSelected([]); }}
    onBack={onBack} onLegend={onLegend} myAvatarUrl={null} />;
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
  const roomPlayersKey = room.players.map(p => `${p.seat_index}:${p.display_name}:${p.is_bot}`).join('|');

  useEffect(() => {
    if (!room.isHost || !state) return;
    const activeState = syncBSPlayersFromRoom(state, room.players);
    if (activeState !== state) room.setHostState(activeState);
    if (activeState.phase === 'playing') {
      const seatPlayer = room.players.find(p => p.seat_index === activeState.currentSeat);
      const seat = activeState.currentSeat;
      const isBot = seatPlayer?.is_bot;
      const t = setTimeout(async () => {
        if (isBot) {
          const decision = await getBSDecisionWithFallback(activeState, seat, true);
          room.setHostState(makeClaim(activeState, seat, decision.cardIds ?? botClaim(activeState, seat).cardIds, (decision.rank ?? activeState.expectedRank) as Rank));
        } else {
          const { cardIds, rank } = botClaim(activeState, seat);
          room.setHostState(makeClaim(activeState, seat, cardIds, rank));
        }
      }, isBot ? BOT_CLAIM_DELAY_MS : HUMAN_TURN_TIMEOUT_MS);
      return () => clearTimeout(t);
    }
    if (activeState.phase === 'awaiting-challenge') {
      const botCallers = room.players.filter(p => p.is_bot && p.seat_index !== activeState.lastClaim?.seat).map(p => p.seat_index);
      const hasHumanCaller = room.players.some(p => !p.is_bot && p.seat_index !== activeState.lastClaim?.seat);
      const t = setTimeout(async () => {
        const decisions = await Promise.all(
          botCallers.map(async (seatIndex) => {
            const decision = await getBSDecisionWithFallback(activeState, seatIndex, false);
            return { seatIndex, callBullshit: decision.callBullshit };
          })
        );
        const caller = decisions.find(d => d.callBullshit)?.seatIndex;
        if (caller !== undefined) room.setHostState(callBullshit(activeState, caller));
        else room.setHostState(passChallenge(activeState));
      }, hasHumanCaller ? HUMAN_TURN_TIMEOUT_MS : BOT_CHALLENGE_DELAY_MS);
      return () => clearTimeout(t);
    }
  }, [room.isHost, state?.phase, state?.currentSeat, state?.lastClaim?.cardIds.join(','), roomPlayersKey]);

  useEffect(() => {
    if (!room.isHost || !state?.reveal) return;
    const t = setTimeout(() => room.setHostState({ ...state, reveal: null }), REVEAL_CLEAR_DELAY_MS);
    return () => clearTimeout(t);
  }, [room.isHost, state?.reveal]);

  if (room.loading || !state || mySeat === null) return <div className="h-[100dvh] flex items-center justify-center text-slate-400"><Loader2 className="animate-spin mr-2" /> Syncing room…</div>;

  return <BSView state={state} mySeat={mySeat}
    selected={selected} setSelected={setSelected}
    onClaim={() => { if (selected.length) { room.sendMove({ type: 'claim', seat: mySeat, payload: { cardIds: selected, rank: state.expectedRank } }); setSelected([]); } }}
    onCall={() => room.sendMove({ type: 'call', seat: mySeat })}
    onPass={() => room.sendMove({ type: 'pass', seat: mySeat })}
    onRestart={onBack} onBack={onBack} onLegend={onLegend} roomCode={room.room?.room_code}
    myAvatarUrl={identity.avatarUrl}
    myPublicProfileUid={identity.publicProfileUid}
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
  myAvatarUrl?: string | null;
  myPublicProfileUid?: string | null;
  chatButton?: React.ReactNode;
  chatDrawer?: React.ReactNode;
}

const BSView: React.FC<ViewProps> = ({ state, mySeat, selected, setSelected, onClaim, onCall, onPass, onRestart, onBack, onLegend, roomCode, myAvatarUrl, myPublicProfileUid, chatButton, chatDrawer }) => {
  const you = state.players[mySeat];
  const isYourTurn = state.phase === 'playing' && state.currentSeat === mySeat;
  const canCall = state.phase === 'awaiting-challenge' && state.lastClaim && state.lastClaim.seat !== mySeat;
  const opponents = state.players.filter((_, i) => i !== mySeat).slice(0, 3);
  const [remoteZone, setRemoteZone] = useState<'hand' | 'actions'>('hand');
  const [remoteCardIndex, setRemoteCardIndex] = useState(0);
  const [remoteActionIndex, setRemoteActionIndex] = useState(0);
  const tvRemoteMode = useTvRemoteMode();

  const isCaughtBluff = state.reveal?.liar;
  const pixiEventKey = `${state.phase}:${state.lastClaim?.cardIds.join('|') ?? 'none'}:${state.pile.length}:${state.reveal?.cards.join('|') ?? 'none'}:${state.reveal?.liar ?? 'none'}`;
  const selectionResetKey = `${state.phase}:${state.currentSeat}:${state.lastClaim?.cardIds.join('|') ?? 'none'}:${state.pile.length}:${you.hand.length}`;

  useEffect(() => {
    setSelected([]);
  }, [selectionResetKey, setSelected]);

  const toggleSelectedCard = useCallback((cardId: string) => {
    if (!isYourTurn) return;
    setSelected(s => s.includes(cardId) ? s.filter(x => x !== cardId) : (s.length < 4 ? [...s, cardId] : s));
  }, [isYourTurn, setSelected]);

  useTvRemoteInput((action) => {
    if (action === 'BACK') {
      onBack();
      return;
    }
    if (action === 'MENU') {
      onLegend();
      return;
    }
    if (state.phase === 'game-over') {
      if (action === 'SELECT') onRestart();
      return;
    }
    if (action === 'UP' || action === 'DOWN') {
      setRemoteZone((zone) => zone === 'hand' ? 'actions' : 'hand');
      return;
    }
    if (remoteZone === 'hand') {
      if (action === 'LEFT' || action === 'RIGHT') {
        const delta = action === 'LEFT' ? -1 : 1;
        setRemoteCardIndex((index) => (index + delta + Math.max(you.hand.length, 1)) % Math.max(you.hand.length, 1));
        return;
      }
      if (action === 'SELECT') {
        const card = you.hand[remoteCardIndex % Math.max(you.hand.length, 1)];
        if (card) toggleSelectedCard(card);
      }
      return;
    }
    const actions = canCall
      ? [onCall, onPass]
      : isYourTurn
        ? [onClaim]
        : [];
    if (action === 'LEFT' || action === 'RIGHT') {
      setRemoteActionIndex((index) => actions.length ? (index + (action === 'LEFT' ? -1 : 1) + actions.length) % actions.length : index);
      return;
    }
    if (action === 'SELECT') actions[remoteActionIndex % Math.max(actions.length, 1)]?.();
  });

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
          data-game-table
          className="relative w-full h-full max-w-md mx-auto rounded-[26px] overflow-hidden ombre-border"
          style={{
            background: 'radial-gradient(120% 90% at 50% 0%, oklch(0.30 0.14 295) 0%, oklch(0.20 0.10 290) 30%, oklch(0.13 0.07 285) 60%, oklch(0.08 0.03 280) 100%)',
            boxShadow: '0 0 70px oklch(0.72 0.24 300 / 0.22), 0 0 100px oklch(0.84 0.16 215 / 0.12)',
          }}
        >
          {/* Top gloss */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 z-[1]" style={{ background: 'linear-gradient(180deg, oklch(1 0 0 / 0.06) 0%, transparent 55%)' }} />
          {/* Color wash */}
          <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-50 z-[1]" style={{ background: 'radial-gradient(80% 60% at 15% 110%, oklch(0.84 0.14 82 / 0.16) 0%, transparent 60%), radial-gradient(70% 50% at 90% 5%, oklch(0.84 0.16 215 / 0.18) 0%, transparent 60%)' }} />
          {/* Grain */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.05] z-[1]" style={{ backgroundImage: 'radial-gradient(oklch(1 0 0 / 0.4) 0.5px, transparent 0.6px)', backgroundSize: '3px 3px' }} />
          {/* Gold filigree corners */}
          <span className="filigree-corner z-[2]" style={{ top: 6, left: 6 }} />
          <span className="filigree-corner z-[2]" style={{ top: 6, right: 6, transform: 'scaleX(-1)' }} />
          <span className="filigree-corner z-[2]" style={{ bottom: 6, left: 6, transform: 'scaleY(-1)' }} />
          <span className="filigree-corner z-[2]" style={{ bottom: 6, right: 6, transform: 'scale(-1,-1)' }} />
          {/* Center logo watermark */}
          <img src="/assets/games/spades-elite/treytv-logo.png" alt="" className="pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[110px] h-auto z-[1]" style={{ opacity: 0.10, filter: 'drop-shadow(0 0 10px oklch(0.72 0.26 300 / 0.3))' }} />
          {/* Double gold ring */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] rounded-full breathe z-[1]" style={{ border: '1px solid oklch(0.84 0.14 82 / 0.35)', boxShadow: '0 0 18px oklch(0.72 0.26 300 / 0.20)' }} />
          {/* Sparkles */}
          <span className="sparkle z-[2]" style={{ top: '16%', left: '22%', animationDelay: '0.5s' }} />
          <span className="sparkle z-[2]" style={{ top: '28%', right: '18%', animationDelay: '2.0s' }} />
          <span className="sparkle z-[2]" style={{ bottom: '32%', right: '24%', animationDelay: '1.1s' }} />

          {/* ── Seat overlays — avatars above Pixi card stacks, not on top of them ── */}
          {/* Opponent card stacks render at Pixi y≈19%; avatars sit above at 8% */}
          {/* Player hand fan renders at Pixi y≈82%; avatar sits above at 74% */}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
            {opponents.map((opp, i) => {
              const n = opponents.length;
              const xPct = n === 1 ? 50 : n === 2 ? [25, 75][i] : [16.7, 50, 83.3][i];
              return (
                <div
                  key={opp.seat}
                  style={{
                    position: 'absolute',
                    left: `${xPct}%`,
                    top: '8%',
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
            <div style={{ position: 'absolute', insetInline: 8, bottom: 8, pointerEvents: 'none' }}>
              <div className="relative overflow-hidden rounded-[22px] border px-3 py-2 flex items-center gap-3"
                style={{
                  minHeight: 72,
                  background: 'linear-gradient(90deg, rgba(8,6,18,0.90), rgba(18,10,31,0.76))',
                  borderColor: isYourTurn ? 'rgba(255,200,87,0.60)' : 'rgba(168,85,247,0.34)',
                  boxShadow: isYourTurn ? '0 0 26px rgba(255,200,87,0.20), inset 0 1px 0 rgba(255,255,255,0.08)' : '0 10px 28px rgba(0,0,0,0.34)',
                  backdropFilter: 'blur(18px)',
                }}>
              <GamePlayerSeat
                displayName={you.name}
                avatarUrl={myAvatarUrl}
                publicProfileUid={myPublicProfileUid}
                isBot={you.isBot}
                isCurrentTurn={isYourTurn}
                cardCount={you.hand.length}
                accentColor="#A855F7"
                size="md"
                position="bottom"
              />
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] tracking-[0.30em] font-black" style={{ color: isYourTurn ? '#FFC857' : '#C4A6FF' }}>
                    {isYourTurn ? 'ACTIVE SEAT' : 'YOUR SEAT'}
                  </div>
                  <div className="text-sm font-black truncate mt-0.5">{you.name}</div>
                  <div className="mt-1 inline-flex rounded-full px-2 py-0.5 border text-[10px] font-bold text-purple-100"
                    style={{ background: 'rgba(168,85,247,0.10)', borderColor: 'rgba(168,85,247,0.28)' }}>
                    {you.hand.length} cards
                  </div>
                </div>
              </div>
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
            onCardClick={toggleSelectedCard}
            renderHand={false}
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

      {state.phase !== 'game-over' && (
        <section className="shrink-0 z-20 px-2 pt-1" style={{ overflow: 'visible' }}>
          <div className="relative flex items-end justify-center" style={{ height: 120, pointerEvents: 'none' }}>
            {(() => {
              const total = you.hand.length;
              if (total === 0) return null;
              const center = (total - 1) / 2;
              const viewportWidth = typeof window === 'undefined' ? 390 : window.innerWidth;
              const handWidth = Math.min(372, Math.max(304, viewportWidth - 34));
              const spreadX = Math.min(27, (handWidth - 70) / Math.max(total - 1, 1));
              const arc = 2.2;
              return you.hand.map((cardId, i) => {
                const offset = i - center;
                const isSelected = selected.includes(cardId);
                const remoteFocused = tvRemoteMode && remoteZone === 'hand' && remoteCardIndex % Math.max(you.hand.length, 1) === i;
                return (
                  <button
                    type="button"
                    key={cardId}
                    onClick={() => toggleSelectedCard(cardId)}
                    className="absolute bottom-0 transition-all duration-200 ease-out focus:outline-none"
                    style={{
                      left: '50%',
                      width: 60,
                      height: 86,
                      marginLeft: -30,
                      transform: `translateX(${offset * spreadX}px) translateY(${isSelected || remoteFocused ? -40 : Math.abs(offset) * 1.5}px) rotate(${isSelected || remoteFocused ? 0 : offset * arc}deg) scale(${isSelected || remoteFocused ? 1.16 : 1})`,
                      zIndex: isSelected ? 100 + i : i + 1,
                      pointerEvents: isYourTurn ? 'auto' : 'none',
                      filter: remoteFocused ? 'drop-shadow(0 0 18px rgba(251,191,36,0.7))' : undefined,
                    }}
                    aria-label={cardId}
                    aria-pressed={isSelected}
                  >
                    <TreyCard cardId={cardId} selected={isSelected} isLegal={isYourTurn} />
                    {remoteFocused && <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-300/70 bg-amber-400/20 px-2 py-0.5 text-[9px] font-black tracking-wider text-amber-100">TV FOCUS</span>}
                  </button>
                );
              });
            })()}
          </div>
        </section>
      )}

      {/* BOTTOM ACTION PANEL */}
      {state.phase !== 'game-over' && (
        <section data-game-action-panel className="shrink-0 z-30 backdrop-blur-2xl border-t pt-2 pb-2.5 px-2"
          style={{ background: 'rgba(8,17,31,0.96)', borderColor: 'rgba(168,85,247,0.3)', boxShadow: '0 -10px 30px rgba(168,85,247,0.18)' }}>
          <div className="flex justify-center gap-1.5 mb-2 flex-wrap">
            {isYourTurn && (
              <>
              <button onClick={onClaim} disabled={selected.length === 0}
                className={`min-h-9 px-5 py-2 rounded-full font-black text-[11px] tracking-[0.15em] uppercase disabled:opacity-40 active:scale-95 transition ${tvRemoteMode && remoteZone === 'actions' ? 'ring-4 ring-amber-300/70' : ''}`}
                style={{
                  background: selected.length > 0 ? 'linear-gradient(90deg,#A855F7,#00B7FF)' : 'rgba(255,255,255,0.06)',
                  color: '#fff',
                  boxShadow: selected.length > 0 ? '0 0 22px rgba(168,85,247,0.5)' : 'none',
                  border: selected.length > 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                }}>
                Play {selected.length || 0} × {state.expectedRank}
              </button>
              {selected.length > 0 && (
                <div className="self-center rounded-full px-2.5 py-1 border text-[10px] font-black text-purple-100"
                  style={{ background: 'rgba(168,85,247,0.12)', borderColor: 'rgba(168,85,247,0.36)' }}>
                  {selected.length} selected
                </div>
              )}
              </>
            )}
            {canCall && (
              <>
                <button onClick={onCall}
                  className={`px-5 py-1.5 rounded-full font-black text-[11px] tracking-[0.15em] uppercase active:scale-95 transition ${tvRemoteMode && remoteZone === 'actions' && remoteActionIndex % 2 === 0 ? 'ring-4 ring-amber-300/70' : ''}`}
                  style={{ background: 'linear-gradient(90deg,#EF4444,#FFB000)', color: '#fff', boxShadow: '0 0 22px rgba(239,68,68,0.5)' }}>
                  Call BS
                </button>
                <button onClick={onPass}
                  className={`px-5 py-1.5 rounded-full font-black text-[11px] tracking-[0.15em] uppercase border active:scale-95 transition ${tvRemoteMode && remoteZone === 'actions' && remoteActionIndex % 2 === 1 ? 'ring-4 ring-amber-300/70' : ''}`}
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

function syncBSPlayersFromRoom(state: BSState, players: Array<{ seat_index: number; display_name: string; is_bot: boolean }>) {
  let changed = false;
  const next: BSState = JSON.parse(JSON.stringify(state));
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
