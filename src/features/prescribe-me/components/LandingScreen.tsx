import React from "react";
import TreyTVHeader from "./TreyTVHeader";
import { LiquidGlassCard, NeonGlassButton } from "./LiquidGlass";
import MoodIcon from "./MoodIcon";
import { ShieldCheck, History as HistoryIcon, ChevronLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { Mood } from "./data";

const PREVIEW_MOODS: Mood[] = ["Happy", "Chill", "Romantic", "Motivated", "Reflective"];

interface Props {
  onStart: () => void;
  onOpenHistory: () => void;
}

const LandingScreen: React.FC<Props> = ({ onStart, onOpenHistory }) => {
  const navigate = useNavigate();
  return (
    <section className="w-full max-w-md mx-auto h-[100dvh] overflow-hidden px-4 pt-[max(0.25rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] flex flex-col relative">
      <button
        onClick={() => void navigate({ to: "/" })}
        className="absolute top-[max(1rem,env(safe-area-inset-top))] left-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 border border-white/10 text-white/70 hover:text-white hover:bg-black/60 transition-colors"
        aria-label="Back to Home"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="shrink-0">
        <TreyTVHeader size="md" />
      </div>

      <div className="flex-1 min-h-0 flex flex-col justify-center">
        <LiquidGlassCard accent="multi">
          <div className="px-5 py-6 text-center">
            <h1
              className="font-serif text-[clamp(2.65rem,12vw,4rem)] font-bold tracking-tight leading-none"
              style={{
                backgroundImage:
                  "linear-gradient(90deg,#fcd34d 0%, #f0abfc 35%, #d8b4fe 70%, #67e8f9 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Prescribe Me
            </h1>

            <div className="flex items-center justify-center gap-3 mt-3" aria-hidden>
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-amber-300/60" />
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                className="text-amber-300"
              >
                <path
                  d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-amber-300/60" />
            </div>

            <p className="mt-3 text-sm text-white/80 leading-relaxed">
              Tell us your mood. We&rsquo;ll curate your{" "}
              <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent font-semibold">
                perfect watch.
              </span>
            </p>

            <div className="relative mt-5 mb-5">
              <div className="text-[9px] tracking-[0.23em] text-amber-300/90 uppercase mb-2">
                How are you feeling?
              </div>
              <div className="grid grid-cols-5 gap-2">
                {PREVIEW_MOODS.map((m, i) => (
                  <div key={m} className="flex flex-col items-center">
                    <div
                      className="relative w-11 h-11 rounded-full flex items-center justify-center bg-black/60 border border-white/15"
                      style={
                        i === 2
                          ? {
                              boxShadow:
                                "0 0 0 2px rgba(251,191,36,0.6), 0 0 24px rgba(251,191,36,0.45)",
                            }
                          : {}
                      }
                    >
                      <MoodIcon mood={m} size={21} />
                    </div>
                    <span className="text-[9px] mt-1 text-white/70 truncate max-w-full">{m}</span>
                  </div>
                ))}
              </div>
            </div>

            <NeonGlassButton onClick={onStart} ariaLabel="Start my prescription" className="w-full">
              <span className="inline-flex items-center gap-2 justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Start My Prescription
              </span>
            </NeonGlassButton>

            <button
              onClick={onOpenHistory}
              className="mt-4 inline-flex items-center gap-2 text-xs text-white/70 hover:text-white transition-colors"
            >
              <HistoryIcon className="w-4 h-4" />
              View your prescriptions
            </button>
          </div>
        </LiquidGlassCard>
      </div>

      <div className="shrink-0 mt-3">
        <LiquidGlassCard accent="cyan">
          <div className="px-3 py-3 flex items-center gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="text-left min-w-0">
              <div className="text-cyan-300 font-semibold text-xs">Your vibe. Your privacy.</div>
              <p className="text-white/65 text-[11px] mt-0.5 leading-snug">
                Responses personalize your Trey TV experience only.
              </p>
            </div>
          </div>
        </LiquidGlassCard>
      </div>
    </section>
  );
};

export default LandingScreen;
