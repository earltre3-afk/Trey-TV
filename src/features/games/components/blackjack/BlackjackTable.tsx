/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useState } from "react";
import {
  newBlackjackGame,
  placeBet,
  hit,
  stand,
  doubleDown,
  nextHand,
  handValue,
  BJState,
} from "@/features/games/lib/blackjack/blackjackEngine";

import { TreyBrandMark } from "../shared/TreyBrandMark";
import { GamePlayerSeat } from "../shared/GamePlayerSeat";
import { ArrowLeft, Info, Loader2 } from "lucide-react";
import { useRealtimeRoom } from "@/features/games/hooks/useRealtimeRoom";
import { PlayerIdentity } from "@/features/games/lib/services/identity";
import { useChat } from "@/features/games/hooks/useChat";
import { GameChatDrawer, ChatHeaderButton } from "../shared/GameChatDrawer";
import { PixiBlackjackTableLazy } from "../pixi/PixiGameTables";

interface Props {
  onBack: () => void;
  onLegend: () => void;
  roomId?: string;
  identity?: PlayerIdentity;
}

const CHIPS = [10, 25, 100, 250, 500, 1000];

function bjApply(
  state: BJState,
  move: { type: string; seat: number; payload?: any },
): BJState {
  switch (move.type) {
    case "bet":
      return placeBet(state, move.payload.bet);
    case "hit":
      return hit(state);
    case "stand":
      return stand(state);
    case "double":
      return doubleDown(state);
    case "next":
      return nextHand(state);
    default:
      return state;
  }
}
function bjExtract(s: BJState) {
  return { currentSeat: 0, phase: s.phase, ended: false };
}

export const BlackjackTable: React.FC<Props> = (props) => {
  if (props.roomId && props.identity)
    return (
      <ServerBJ {...props} roomId={props.roomId!} identity={props.identity!} />
    );
  return <LocalBJ {...props} />;
};

const LocalBJ: React.FC<Props> = ({ onBack, onLegend }) => {
  const [state, setState] = useState<BJState>(() => newBlackjackGame(2500));
  return (
    <BJView
      state={state}
      onBack={onBack}
      onLegend={onLegend}
      onBet={(b) => setState((s) => placeBet(s, b))}
      onHit={() => setState(hit)}
      onStand={() => setState(stand)}
      onDouble={() => setState(doubleDown)}
      onNext={() => setState(nextHand)}
    />
  );
};

const ServerBJ: React.FC<
  Props & { roomId: string; identity: PlayerIdentity }
> = ({ roomId, identity, onBack, onLegend }) => {
  const apply = useCallback(bjApply, []);
  const extract = useCallback(bjExtract, []);
  const room = useRealtimeRoom(roomId, identity, apply, extract);
  const [chatOpen, setChatOpen] = useState(false);
  const chat = useChat({
    roomId,
    identity,
    mySeat: room.mySeat ?? 0,
    isOpen: chatOpen,
  });

  if (room.loading || !room.state)
    return (
      <div className="h-[100dvh] flex items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mr-2" /> Syncing room…
      </div>
    );
  const send = (type: string, payload?: any) =>
    room.sendMove({ type, seat: 0, payload });
  return (
    <BJView
      state={room.state as BJState}
      onBack={onBack}
      onLegend={onLegend}
      roomCode={room.room?.room_code}
      onBet={(b) => send("bet", { bet: b })}
      onHit={() => send("hit")}
      onStand={() => send("stand")}
      onDouble={() => send("double")}
      onNext={() => send("next")}
      chatButton={
        <ChatHeaderButton
          unread={chat.unread}
          accent="#FFC857"
          onClick={() => setChatOpen(true)}
        />
      }
      chatDrawer={
        <GameChatDrawer
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          messages={chat.messages}
          loading={chat.loading}
          myUserId={identity.userId}
          mySeat={room.mySeat ?? 0}
          onSend={chat.send}
          accent="#FFC857"
        />
      }
    />
  );
};

interface ViewProps {
  state: BJState;
  onBack: () => void;
  onLegend: () => void;
  onBet: (bet: number) => void;
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onNext: () => void;
  roomCode?: string;
  chatButton?: React.ReactNode;
  chatDrawer?: React.ReactNode;
}

const BJView: React.FC<ViewProps> = ({
  state,
  onBack,
  onLegend,
  onBet,
  onHit,
  onStand,
  onDouble,
  onNext,
  roomCode,
  chatButton,
  chatDrawer,
}) => {
  const [pendingBet, setPendingBet] = useState(50);
  const playerVal = state.player.length ? handValue(state.player).total : 0;
  const dealerShownVal = state.dealer.length
    ? state.phase === "player"
      ? handValue([state.dealer[0]]).total
      : handValue(state.dealer).total
    : 0;

  const isBust = state.result === "lose" && playerVal > 21;
  const isWin = state.result === "win" || state.result === "blackjack";
  const isPush = state.result === "push";
  const accent = isBust ? "#EF4444" : isWin ? "#22C55E" : "#FFC857";
  const canDouble =
    state.phase === "player" &&
    state.player.length === 2 &&
    state.balance >= state.bet;
  const pixiEventKey = `${state.phase}:${state.player.join("|")}:${state.dealer.join("|")}:${state.result ?? "none"}:${state.bet}`;

  return (
    <div
      className="w-full text-white flex flex-col overflow-hidden relative trey-screen-enter"
      style={{
        height: "100dvh",
        background: `
          radial-gradient(ellipse at 50% -10%, rgba(255,200,87,0.20) 0%, transparent 42%),
          radial-gradient(ellipse at 15% 35%, rgba(0,183,255,0.12) 0%, transparent 38%),
          radial-gradient(ellipse at 88% 72%, rgba(168,85,247,0.16) 0%, transparent 42%),
          linear-gradient(180deg, #05070D 0%, #07101f 48%, #02040a 100%)
        `,
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full blur-[150px] trey-ambient-glow"
          style={{
            background:
              "radial-gradient(circle, rgba(255,200,87,0.18) 0%, transparent 72%)",
          }}
        />
        <div
          className="absolute bottom-10 -right-28 w-[420px] h-[420px] rounded-full blur-[130px]"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.16) 0%, transparent 72%)",
          }}
        />
      </div>

      {/* COMPACT HEADER */}
      <header
        className="shrink-0 z-20 backdrop-blur-2xl border-b"
        style={{
          background: "rgba(5,7,13,0.78)",
          borderColor: "rgba(255,200,87,0.25)",
        }}
      >
        <div className="px-3 py-2 flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-10 h-10 inline-flex items-center justify-center rounded-xl hover:bg-white/5 border border-white/5"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <TreyBrandMark size={22} glow className="shrink-0" />
            <div className="h-5 w-px bg-white/15 shrink-0" />
            <span className="text-amber-300 text-base leading-none drop-shadow-[0_0_10px_rgba(255,200,87,0.75)]">
              ♦
            </span>
            <div className="min-w-0">
              <div className="text-base font-black tracking-tight leading-none truncate">
                Blackjack
              </div>
              <div className="text-[9px] text-amber-200/70 tracking-[0.22em] font-bold leading-tight truncate">
                PRIVATE TABLE {roomCode ? `· ${roomCode}` : "· SOLO LOUNGE"}
              </div>
            </div>
          </div>
          {chatButton || (
            <span className="text-[9px] text-slate-500 font-bold tracking-[0.18em] hidden xs:inline">
              CHAT IN ROOMS
            </span>
          )}
          <button
            onClick={onLegend}
            className="w-10 h-10 inline-flex items-center justify-center rounded-xl hover:bg-white/5 border border-white/5"
            aria-label="Info"
          >
            <Info size={16} />
          </button>
        </div>

        <div className="px-3 pb-2 grid grid-cols-4 gap-1.5 text-center">
          <Metric
            label="BAL"
            value={state.balance.toLocaleString()}
            color="#FFC857"
          />
          <Metric
            label="BET"
            value={`${state.bet || pendingBet}`}
            color="#00B7FF"
          />
          <Metric
            label="DEALER"
            value={state.dealer.length ? `${dealerShownVal}` : "—"}
            color="#A855F7"
          />
          <Metric
            label="YOU"
            value={state.player.length ? `${playerVal}` : "—"}
            color={accent}
          />
        </div>
      </header>

      {/* PIXI TABLE — primary game visual layer */}
      <main className="flex-1 min-h-0 px-3 py-2 flex items-center justify-center">
        <div
          className={`relative w-full h-full max-w-md mx-auto rounded-[32px] border overflow-hidden ${isBust ? "trey-bust-shake" : ""} ${isWin ? "trey-win-burst" : ""}`}
          style={{
            borderColor: `${accent}66`,
            boxShadow: `0 0 60px ${accent}24, inset 0 0 68px ${accent}10, inset 0 1px 0 rgba(255,255,255,0.08)`,
            background: '#05070D',
          }}
        >
          {/* Pixi renders the entire table scene: felt, rim, dealer cards, player cards, chips */}
          <PixiBlackjackTableLazy
            dealerCards={state.dealer}
            playerCards={state.player}
            phase={state.phase}
            result={state.result}
            bet={state.bet}
            accent={accent}
            eventKey={pixiEventKey}
          />

          {/* ── Seat identity overlays — avatars offset from Pixi card zones ── */}
          {/* Dealer cards render at Pixi y≈28%; avatar sits above at 8% */}
          {/* Player cards render at Pixi y≈68%; avatar sits below at 88% */}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
            <div style={{ position: 'absolute', top: '8%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
              <GamePlayerSeat
                displayName="Dealer"
                isBot
                isCurrentTurn={state.phase === 'dealer'}
                accentColor="#FFC857"
                size="lg"
                position="top"
              />
            </div>
            <div style={{ position: 'absolute', top: '88%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
              <GamePlayerSeat
                displayName="You"
                isBot={false}
                isCurrentTurn={state.phase === 'player'}
                accentColor="#00B7FF"
                size="md"
                position="bottom"
              />
            </div>
          </div>

          {/* Score labels — floating React overlay on top of Pixi canvas */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <TableLabel label="DEALER" value={state.dealer.length > 0 ? dealerShownVal : undefined} color="#FFC857" />
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <TableLabel label="YOU" value={state.player.length > 0 ? playerVal : undefined} color="#00B7FF" />
          </div>

          {/* Center info strip — table rules + result badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex flex-col items-center gap-1">
            <div
              className="rounded-2xl border px-3 py-1.5 text-center backdrop-blur-xl"
              style={{
                background: "rgba(5,7,13,0.72)",
                borderColor: `${accent}40`,
                boxShadow: `0 0 22px ${accent}18, inset 0 1px 0 rgba(255,255,255,0.06)`,
              }}
            >
              <div className="text-[8px] tracking-[0.32em] font-black" style={{ color: accent }}>
                TREY TV BLACKJACK
              </div>
              <div className="text-[9px] text-slate-500 font-bold tracking-wide">
                3:2 · Dealer 17 · Virtual
              </div>
            </div>
            {state.result && (
              <div
                className="mt-1 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black trey-score-pop"
                style={{
                  background: isWin ? "rgba(34,197,94,0.18)" : isPush ? "rgba(255,200,87,0.18)" : "rgba(239,68,68,0.18)",
                  color: accent,
                  border: `1px solid ${accent}90`,
                  boxShadow: `0 0 18px ${accent}35`,
                }}
              >
                {state.result.toUpperCase()} · {state.message}
              </div>
            )}
            {state.player.length === 0 && state.phase === 'betting' && (
              <div className="text-[10px] text-slate-500 font-bold tracking-wide mt-1">Select chips below to deal</div>
            )}
          </div>
        </div>
      </main>

      {/* BOTTOM ACTION PANEL */}
      <section
        className="shrink-0 z-30 backdrop-blur-2xl border-t px-3 pt-2.5 pb-3"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,17,31,0.90), rgba(5,7,13,0.98))",
          borderColor: `${accent}40`,
          boxShadow: `0 -14px 34px ${accent}16`,
        }}
      >
        {state.phase === "betting" && (
          <>
            <div className="flex items-center justify-between mb-2 gap-3">
              <div>
                <div className="text-[10px] tracking-[0.32em] font-black text-amber-300">
                  PLACE BET
                </div>
                <div className="text-xs text-slate-400">
                  Choose your virtual chips
                </div>
              </div>
              <div
                className="px-3 py-1 rounded-full text-xs font-black tabular-nums"
                style={{
                  color: "#05070D",
                  background: "linear-gradient(90deg,#FFC857,#FFB000)",
                  boxShadow: "0 0 16px rgba(255,200,87,0.45)",
                }}
              >
                {pendingBet}
              </div>
            </div>
            <div className="grid grid-cols-6 gap-1.5 mb-2">
              {CHIPS.map((c) => (
                <button
                  key={c}
                  onClick={() => setPendingBet(c)}
                  className="h-10 rounded-full font-black text-[11px] transition-all active:scale-95 trey-gold-chip"
                  style={{
                    border:
                      "1px solid " +
                      (pendingBet === c ? "#FFC857" : "rgba(255,200,87,0.28)"),
                    color: pendingBet === c ? "#05070D" : "#FFE4A3",
                    opacity: pendingBet === c ? 1 : 0.72,
                    boxShadow:
                      pendingBet === c
                        ? "0 0 22px rgba(255,200,87,0.62), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -5px 10px rgba(88,55,4,0.50)"
                        : "0 5px 12px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.20)",
                  }}
                >
                  {c >= 1000 ? "1K" : c}
                </button>
              ))}
            </div>
            <button
              disabled={pendingBet > state.balance}
              onClick={() => onBet(pendingBet)}
              className="w-full py-3 rounded-2xl font-black text-sm disabled:opacity-40 active:scale-[0.98] transition tracking-[0.1em] trey-glass-button"
              style={{
                background: "linear-gradient(90deg,#FFC857,#FFB000)",
                color: "#05070D",
                boxShadow: "0 0 22px rgba(255,200,87,0.45)",
              }}
            >
              DEAL HAND · BET {pendingBet}
            </button>
          </>
        )}
        {state.phase === "player" && (
          <div className="grid grid-cols-4 gap-2">
            <ActionBtn label="HIT" onClick={onHit} />
            <ActionBtn label="STAND" onClick={onStand} primary />
            <ActionBtn
              label="DOUBLE"
              onClick={onDouble}
              disabled={!canDouble}
            />
            <ActionBtn label="SPLIT" onClick={() => {}} disabled />
          </div>
        )}
        {state.phase === "settled" && (
          <button
            onClick={onNext}
            className="w-full py-3 rounded-2xl font-black text-sm active:scale-[0.98] transition tracking-[0.12em] trey-glass-button"
            style={{
              background: isWin
                ? "linear-gradient(90deg,#22C55E,#00B7FF)"
                : "linear-gradient(90deg,#00B7FF,#A855F7)",
              boxShadow: `0 0 22px ${accent}55`,
            }}
          >
            NEXT HAND
          </button>
        )}
      </section>

      {chatDrawer}
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div
    className="rounded-xl px-1.5 py-1.5 border overflow-hidden"
    style={{
      background: `${color}0f`,
      borderColor: `${color}40`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 14px ${color}10`,
    }}
  >
    <div className="text-[8px] tracking-[0.22em] font-black" style={{ color }}>
      {label}
    </div>
    <div className="font-black text-xs tabular-nums truncate">{value}</div>
  </div>
);

const TableLabel: React.FC<{
  label: string;
  value?: number;
  color: string;
}> = ({ label, value, color }) => (
  <div
    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-xl"
    style={{
      background: "rgba(5,7,13,0.58)",
      borderColor: `${color}55`,
      boxShadow: `0 0 16px ${color}22`,
    }}
  >
    <span className="text-[9px] tracking-[0.28em] font-black" style={{ color }}>
      {label}
    </span>
    {value !== undefined && (
      <span className="text-xs font-black text-white/90 tabular-nums">
        {value}
      </span>
    )}
  </div>
);

const ActionBtn: React.FC<{
  label: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}> = ({ label, onClick, primary, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`py-3 rounded-2xl font-black text-[11px] tracking-[0.13em] transition-all active:scale-95 trey-glass-button ${disabled ? 'trey-premium-disabled' : ''}`}
    style={{
      background: primary
        ? "linear-gradient(90deg,#FFC857,#FFB000)"
        : "rgba(255,200,87,0.08)",
      color: primary ? "#05070D" : "#FFC857",
      border: "1px solid rgba(255,200,87,0.38)",
      boxShadow: primary
        ? "0 0 18px rgba(255,200,87,0.4), inset 0 1px 0 rgba(255,255,255,0.25)"
        : "inset 0 1px 0 rgba(255,255,255,0.05)",
    }}
  >
    {label}
  </button>
);
