import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles, Lock } from "lucide-react";
import { COIN_TIERS, CoinTier } from "./coin-tiers";
import { Coin } from "./Coin";
import { triggerCoinGift } from "./GiftBurst";
import { useRewards } from "@/hooks/use-rewards";
import { toast } from "sonner";

export function GiftPickerSheet({
  open,
  onClose,
  recipient,
}: {
  open: boolean;
  onClose: () => void;
  recipient?: string;
}) {
  const { balance, loading } = useRewards();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open || typeof document === "undefined") return null;

  const send = (tier: CoinTier) => {
    if (balance < tier.cost) {
      toast.error(`Need ${tier.cost - balance} more points for ${tier.name}`);
      return;
    }
    triggerCoinGift(tier, recipient);
    toast.success(
      `${tier.name} sent${recipient ? ` to @${recipient}` : ""} · −${tier.cost.toLocaleString()} pts`,
    );
    onClose();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Send a gift"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99998,
        background: "oklch(0 0 0 / 0.6)",
        backdropFilter: "blur(8px)",
        animation: "fade-in 0.2s ease-out",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="liquid-glass border-t border-white/15"
        style={{
          width: "min(100vw, 28rem)",
          maxHeight: "85vh",
          borderRadius: "28px 28px 0 0",
          padding: "1rem 1rem 1.5rem",
          paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))",
          animation: "slide-up 0.3s cubic-bezier(0.2,0.8,0.2,1)",
          overflowY: "auto",
        }}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/20" />

        {/* Header */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div>
            <div className="text-[10px] tracking-[0.3em] text-primary flex items-center gap-1.5">
              <Sparkles className="size-3" /> SEND A GIFT
            </div>
            <h2 className="text-lg font-bold mt-0.5">
              {recipient ? (
                <>
                  To <span className="text-gradient-gold">@{recipient}</span>
                </>
              ) : (
                <span className="text-gradient-gold">Pick a gift</span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="size-9 grid place-items-center rounded-full glass border border-white/10 hover:bg-white/5 tilt-press"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Balance pill */}
        <div className="mx-1 mb-3 px-3 py-2 rounded-2xl glass border border-primary/30 flex items-center justify-between">
          <span className="text-[11px] tracking-[0.2em] text-muted-foreground">YOUR BALANCE</span>
          <span className="text-sm font-bold text-primary tabular-nums">
            {loading ? "—" : balance.toLocaleString()} pts
          </span>
        </div>

        {/* Tier grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {COIN_TIERS.map((tier) => {
            const affordable = !loading && balance >= tier.cost;
            const short = !loading ? Math.max(0, tier.cost - balance) : 0;
            return (
              <button
                key={tier.id}
                onClick={() => send(tier)}
                disabled={!affordable}
                className={`group relative p-3 rounded-2xl border text-left transition tilt-press overflow-hidden ${
                  affordable
                    ? "glass border-white/15 hover:border-primary/60 hover:glow-gold"
                    : "border-white/5 bg-white/[0.02] cursor-not-allowed opacity-60"
                }`}
              >
                <div
                  aria-hidden
                  className="absolute -top-6 -right-6 size-24 rounded-full blur-2xl opacity-50 group-hover:opacity-90 transition"
                  style={{ background: `radial-gradient(circle, ${tier.glow}, transparent 70%)` }}
                />
                <div className="relative flex items-center justify-between">
                  <Coin tier={tier} size={56} />
                  {!affordable && (
                    <div className="size-7 grid place-items-center rounded-full glass border border-white/10">
                      <Lock className="size-3.5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="relative mt-2">
                  <div className="text-sm font-bold leading-tight">{tier.name}</div>
                  <div className="text-[10px] text-muted-foreground line-clamp-1">{tier.blurb}</div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span
                      className={`text-xs font-bold tabular-nums ${affordable ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {tier.cost.toLocaleString()} pts
                    </span>
                    {!affordable && short > 0 && (
                      <span className="text-[9px] text-muted-foreground">
                        −{short.toLocaleString()} short
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          Earn more points by watching, commenting, and inviting friends.
        </p>
      </div>
    </div>,
    document.body,
  );
}
