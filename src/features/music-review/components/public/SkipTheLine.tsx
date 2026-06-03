import React, { useState } from "react";
import { Zap, Flame, Gem, Crown, Lock, DollarSign, Info, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTreyAuth } from "../../hooks/useTreyAuth";
import { rebuildReviewQueue } from "../../lib/queue/queueLib";
import { Waveform } from "../shared/Waveform";
import { musicReviewEnv } from "../../lib/env";

interface SkipTheLineProps {
  submissionId: string | null;
  onDone: () => void;
  onSkip: () => void;
}

const TIERS = [
  {
    id: "quick",
    label: "QUICK PASS",
    price: 5,
    sub1: "Move up the queue.",
    sub2: "Faster review placement.",
    icon: <Zap size={26} />,
    color: "#FFC857",
    badge: "POPULAR",
  },
  {
    id: "hot",
    label: "HOT SEAT",
    price: 10,
    sub1: "Jump ahead in the queue.",
    sub2: "High-priority review.",
    icon: <Flame size={26} />,
    color: "#A855F7",
    badge: "",
  },
  {
    id: "front",
    label: "FRONT OF LINE",
    price: 15,
    sub1: "Near-immediate review.",
    sub2: "Get to the front.",
    icon: <Gem size={26} />,
    color: "#00B7FF",
    badge: "BEST VALUE",
  },
] as const;

export const SkipTheLine: React.FC<SkipTheLineProps> = ({ submissionId, onDone, onSkip }) => {
  const { user } = useTreyAuth();
  const [tier, setTier] = useState<string>("quick");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const payWithCashApp = async () => {
    if (!user || !submissionId) return;
    setLoading(true);
    const t = TIERS.find((x) => x.id === tier)!;
    const ref = "CA-" + Math.random().toString(36).slice(2, 10).toUpperCase();

    // Record payment as pending (production: real Cash App callback marks confirmed)
    await supabase.from("music_review_payments").insert({
      user_id: user.id,
      submission_id: submissionId,
      provider: "cashapp",
      tier: t.id,
      amount: t.price,
      currency: "USD",
      status: "pending",
      provider_reference: ref,
      confirmed_by_admin: false,
    });

    // Open Cash App deep link only when the host configured the public cashtag.
    const cashtag = (
      (window as any).__TREY_CASHTAG__ ||
      musicReviewEnv.cashAppCashtag ||
      ""
    ).replace(/^\$/, "");
    if (cashtag) {
      window.open(
        `https://cash.app/$${cashtag}/${t.price}?note=${encodeURIComponent("TreyTV Live Review " + ref)}`,
        "_blank",
      );
    }

    // Optimistic local mark — admin must confirm in admin panel before priority is applied.
    // To keep the demo functional, we apply priority locally with status 'pending_confirmation'.
    await supabase
      .from("music_review_submissions")
      .update({
        priority_tier: t.id,
        priority_paid: false, // ONLY admin can flip to true after confirming
        payment_reference: ref,
        status: "in_queue",
      })
      .eq("id", submissionId);

    await rebuildReviewQueue();
    setLoading(false);
    setConfirmed(true);
  };

  const skipForStandard = async () => {
    if (!submissionId) {
      onSkip();
      return;
    }
    await supabase
      .from("music_review_submissions")
      .update({ status: "in_queue" })
      .eq("id", submissionId);
    await rebuildReviewQueue();
    onSkip();
  };

  if (confirmed) {
    return (
      <div className="px-4 pt-8 pb-32 max-w-md mx-auto">
        <div className="rounded-3xl border border-[#22C55E]/40 bg-[#0B1426] p-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E]">
            <DollarSign size={28} />
          </div>
          <div className="text-[#22C55E] text-xs tracking-[3px] font-bold mt-3">
            PAYMENT INITIATED
          </div>
          <h2 className="text-2xl font-black text-[#F8FAFC] mt-1">Cash App Payment Started</h2>
          <p className="text-[#94A3B8] text-sm mt-2 leading-relaxed">
            Complete payment by scanning the QR code or using the Cash App link if configured.
            Priority placement is applied once admin confirms receipt.
          </p>
          <button
            onClick={onDone}
            className="w-full mt-5 py-3 rounded-2xl bg-gradient-to-r from-[#FFC857] to-[#FFB000] text-[#05070D] font-black tracking-wider"
          >
            VIEW QUEUE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-32 max-w-2xl mx-auto space-y-4">
      <div className="relative overflow-hidden rounded-3xl border border-[#1a2942] bg-gradient-to-br from-[#0B1426] via-[#0a1830] to-[#08111F] p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-black leading-none">
              <span className="text-[#FFC857]">SKIP</span>{" "}
              <span className="text-[#F8FAFC]">THE LINE</span>
            </h1>
            <p className="text-[#94A3B8] mt-2 text-sm max-w-xs">
              Get heard faster. More exposure. Bigger impact.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Crown size={18} className="text-[#FFC857]" />
              <span className="text-[#94A3B8] text-xs">
                Priority placement in the live review queue.
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#00B7FF]/10 border border-[#00B7FF]/40 flex items-center justify-center text-[#00B7FF]">
            <Zap size={20} />
          </div>
        </div>
        <Waveform playing bars={36} height={36} className="mt-4 opacity-60" />
      </div>

      <div className="text-center text-[#00B7FF] text-[11px] tracking-[5px] font-bold">
        • CHOOSE YOUR PRIORITY •
      </div>

      <div className="space-y-3">
        {TIERS.map((t) => {
          const selected = tier === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTier(t.id)}
              className={`w-full text-left rounded-3xl border ${selected ? "border-2" : ""} bg-[#0B1426]/80 p-4 flex items-center gap-4 transition`}
              style={{
                borderColor: selected ? t.color : "#1a2942",
                boxShadow: selected ? `0 0 30px -10px ${t.color}` : "none",
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center border"
                style={{ background: `${t.color}15`, borderColor: `${t.color}50`, color: t.color }}
              >
                {t.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-3xl font-black" style={{ color: t.color }}>
                    ${t.price}
                  </span>
                  <span className="text-[#F8FAFC] font-bold text-lg">{t.label}</span>
                  {t.badge && (
                    <span
                      className="px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wider"
                      style={{
                        background: `${t.color}20`,
                        color: t.color,
                        border: `1px solid ${t.color}40`,
                      }}
                    >
                      {t.badge}
                    </span>
                  )}
                </div>
                <div className="text-[#94A3B8] text-xs mt-1">
                  {t.sub1} {t.sub2}
                </div>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected ? "" : "border-[#94A3B8]"}`}
                style={{ borderColor: selected ? t.color : undefined }}
              >
                {selected && (
                  <div className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-center text-[#00B7FF] text-[11px] tracking-[5px] font-bold pt-2">
        • PAY WITH •
      </div>

      <div className="rounded-3xl border border-[#22C55E]/35 bg-[#06140D]/70 p-4 grid grid-cols-[112px_1fr] gap-4 items-center">
        <div className="rounded-2xl bg-white p-2 shadow-[0_0_25px_-6px_rgba(34,197,94,0.75)]">
          <img
            src={musicReviewEnv.cashAppQrPath}
            alt="Cash App QR code for Trey TV Live Review priority payment"
            className="w-24 h-24 object-contain rounded-xl"
          />
        </div>
        <div>
          <div className="text-[#22C55E] text-xs font-black tracking-[3px]">CASH APP QR</div>
          <div className="text-[#F8FAFC] font-bold mt-1">Scan to pay the selected tier</div>
          <p className="text-[#94A3B8] text-xs mt-1 leading-relaxed">
            After payment, admin confirms the receipt before priority placement is applied.
          </p>
        </div>
      </div>

      <button
        onClick={payWithCashApp}
        disabled={loading || !submissionId}
        className="w-full flex items-center gap-4 rounded-3xl border-2 border-[#22C55E] bg-[#22C55E]/5 p-4 shadow-[0_0_30px_-8px_rgba(34,197,94,0.6)] disabled:opacity-50"
      >
        <div className="w-14 h-14 rounded-2xl bg-[#22C55E] flex items-center justify-center text-white font-black text-2xl">
          $
        </div>
        <div className="flex-1 text-left">
          <div className="text-[#22C55E] font-black tracking-wider">PAY WITH CASH APP</div>
          <div className="text-[#94A3B8] text-xs">Complete your payment and skip the line.</div>
        </div>
        <div className="flex items-center gap-1 text-[#94A3B8] text-xs">
          <Lock size={12} /> Secure
        </div>
      </button>

      <div className="rounded-2xl border border-[#1a2942] bg-[#0B1426]/40 p-3 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#00B7FF]/10 border border-[#00B7FF]/40 flex items-center justify-center text-[#00B7FF] flex-shrink-0">
          <Info size={14} />
        </div>
        <div className="text-xs text-[#94A3B8] leading-relaxed">
          <div className="text-[#F8FAFC] font-semibold mb-0.5">Optional Priority Placement</div>
          Skip The Line is optional and helps you get heard faster. All reviews are still real,
          unbiased, and based on quality.
        </div>
      </div>

      <button
        onClick={skipForStandard}
        className="w-full py-3 rounded-2xl border border-[#1a2942] text-[#94A3B8] hover:border-[#00B7FF]/60 text-sm"
      >
        No thanks, join the standard queue <ChevronRight size={14} className="inline" />
      </button>
    </div>
  );
};
