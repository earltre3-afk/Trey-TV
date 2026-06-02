import React from "react";
import { X, Activity } from "lucide-react";
import { Branch } from "../lib/storyTypes";
import { MeterBar } from "./MeterBar";

interface Props {
  branch: Branch | null;
  open: boolean;
  onClose: () => void;
}

export const StatusPanel: React.FC<Props> = ({ branch, open, onClose }) => {
  if (!branch) return null;
  const switchRevealed =
    branch.flags.switch_revealed_to_ari ||
    branch.flags.switch_revealed_to_coach ||
    branch.flags.switch_revealed_to_mom;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-violet-500/30 bg-gradient-to-b from-zinc-900 to-black p-6 shadow-2xl transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-violet-400" />
              <h3 className="font-display text-lg font-bold tracking-wide text-white">
                Status & Mood
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-5 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-widest text-white/50">The Switch</div>
            <div
              className={`mt-1 text-2xl font-bold ${switchRevealed ? "text-red-400" : "text-emerald-400"}`}
            >
              {switchRevealed ? "REVEALED" : "HIDDEN"}
            </div>
          </div>

          <div className="space-y-4">
            <MeterBar label="Risk Level" value={branch.meters.risk_level} color="red" />
            <MeterBar label="Mom Suspicion" value={branch.meters.suspicion_mom} color="amber" />
            <MeterBar label="Coach Risk" value={branch.meters.suspicion_coach} color="amber" />
            <MeterBar
              label="Ms. Valentina"
              value={branch.meters.suspicion_valentina}
              color="amber"
            />
            <div className="my-3 h-px bg-white/10" />
            <MeterBar label="Trust — Ari" value={branch.meters.trust_ari} color="pink" />
            <MeterBar label="Trust — Dante" value={branch.meters.trust_dante} color="violet" />
            <MeterBar
              label="Malik → Micah"
              value={branch.meters.trust_malik_to_micah}
              color="emerald"
            />
            <MeterBar
              label="Micah → Malik"
              value={branch.meters.trust_micah_to_malik}
              color="emerald"
            />
          </div>

          <div className="mt-6 text-center text-xs text-white/40">
            Chapter {branch.chapters.length} • {branch.toneHistory.length} choices made
          </div>
        </div>
      </div>
    </>
  );
};
