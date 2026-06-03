import React from "react";
import TreyTVHeader from "./TreyTVHeader";
import { ChevronLeft } from "lucide-react";

interface Props {
  step: number;
  totalSteps: number;
  title: React.ReactNode;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}

const StepShell: React.FC<Props> = ({
  step,
  totalSteps,
  title,
  subtitle,
  onBack,
  children,
  footer,
}) => {
  return (
    <section className="w-full max-w-md mx-auto h-[100dvh] overflow-hidden px-4 pt-[max(0.25rem,env(safe-area-inset-top))] pb-[max(0.65rem,env(safe-area-inset-bottom))] flex flex-col">
      <div className="relative shrink-0">
        <TreyTVHeader size="sm" />
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Go back"
            className="absolute left-0 top-3 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/15 text-white/80 hover:text-white hover:bg-white/10 backdrop-blur"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="text-center shrink-0 mb-2 px-1">
        <h2
          className="font-serif font-bold text-[clamp(1.65rem,7vw,2.45rem)] leading-[0.95]"
          style={{
            backgroundImage:
              "linear-gradient(90deg,#fcd34d 0%, #f0abfc 40%, #c4b5fd 75%, #67e8f9 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {title}
        </h2>
        <div className="flex items-center justify-center gap-2 mt-2" aria-hidden>
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-300/50" />
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-amber-300/80">
            <path
              d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-300/50" />
        </div>
        {subtitle && <p className="text-white/65 text-xs mt-2 leading-snug">{subtitle}</p>}
      </div>

      <div className="flex-1 min-h-0 flex flex-col justify-center">{children}</div>

      <div className="shrink-0 mt-3 mb-3 px-1">
        <div className="flex items-center justify-center gap-2 text-[9px] tracking-[0.23em] text-amber-300/80 uppercase">
          Step {step} of {totalSteps}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full ${i < step ? "bg-gradient-to-r from-amber-300 via-pink-400 to-fuchsia-500 shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "bg-white/10"}`}
            />
          ))}
        </div>
      </div>

      <div className="shrink-0">{footer}</div>
    </section>
  );
};

export default StepShell;
