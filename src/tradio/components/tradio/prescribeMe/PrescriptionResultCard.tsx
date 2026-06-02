import React, { useState } from 'react';
import {
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Check,
  Radio,
  Sliders,
  ChevronDown,
  Eye,
  Disc,
  ArrowRight,
  Info
} from 'lucide-react';
import type { Prescription, TradioMode } from './prescribeMeTypes';
import { REFINEMENT_OPTIONS } from './prescribeMeQuestions';
import { handleSavePrescription, handleFeedback } from './prescribeMeService';

interface PrescriptionResultCardProps {
  prescription: Prescription;
  mode: TradioMode;
  onRefine: (refinementId: string) => void;
  onCtaClick: () => void;
  onOpenForge?: () => void;
  onRestart: () => void;
  dailyCount: number;
}

export const PrescriptionResultCard: React.FC<PrescriptionResultCardProps> = ({
  prescription,
  mode,
  onRefine,
  onCtaClick,
  onOpenForge,
  onRestart,
  dailyCount,
}) => {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<'like' | 'dislike' | null>(null);
  const [showRefinements, setShowRefinements] = useState(false);
  const [selectedRefinement, setSelectedRefinement] = useState<string | null>(null);

  const handleSaveAction = () => {
    const success = handleSavePrescription(prescription);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleFeedbackAction = (type: 'like' | 'dislike') => {
    handleFeedback(prescription, type);
    setFeedbackSubmitted(type);
    setTimeout(() => setFeedbackSubmitted(null), 2000);
  };

  const handleRefineSelect = (id: string) => {
    setSelectedRefinement(id);
    onRefine(id);
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4 animate-fade-in select-none relative z-10">

      {/* Active RX card container */}
      <div className="relative rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.06] via-white/[0.015] to-transparent p-3.5 sm:p-4 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
        {/* Colorful left indicator band */}
        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-fuchsia-500 via-purple-500 to-cyan-400 shadow-[0_0_15px_rgba(168,85,247,0.7)]" />

        {/* Header line */}
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1 pr-3">
            <div className="text-[8px] font-mono tracking-[0.2em] text-fuchsia-300 uppercase font-black">Synthesized RX Blueprint</div>
            <h3 className="text-base font-black text-white mt-1 tracking-tight truncate">{prescription.title}</h3>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-0.5 text-[8px] font-bold text-cyan-300 font-mono shrink-0">
            {mode === 'fan' && (
              <div className="flex items-end gap-[1.5px] h-2 w-2.5 mr-0.5">
                {[1, 2, 3].map((bar) => (
                  <span
                    key={bar}
                    className="w-[1px] bg-cyan-400 rounded-full animate-eq-bounce"
                    style={{
                      height: `${30 + Math.random() * 70}%`,
                      animationDuration: `${0.3 + Math.random() * 0.5}s`
                    }}
                  />
                ))}
              </div>
            )}
            {prescription.confidenceLabel}
          </div>
        </div>

        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-[8px] font-mono text-purple-300 uppercase tracking-wider font-extrabold bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded">
            {prescription.routeType}
          </span>
          <span className="text-[8px] font-mono text-white/40">
            Routes to: <span className="text-white/60 font-semibold uppercase">{prescription.destination}</span>
          </span>
        </div>

        {/* Content Description */}
        <p className="text-[11px] text-white/70 mt-2 sm:mt-3 leading-relaxed">
          {prescription.description}
        </p>

        {/* Privacy-safedynamic reasoning based on answers */}
        <div className="mt-2.5 sm:mt-3.5 border-t border-white/5 pt-2 sm:pt-2.5 text-[10px] text-white/50 italic bg-[#0d0914]/40 p-2 sm:p-2.5 rounded-xl border border-white/[0.04]">
          <strong className="text-purple-300/80 not-italic font-bold font-mono text-[9px] uppercase tracking-wider block mb-0.5">Diagnostic Sound Source:</strong>
          “{prescription.reason}”
        </div>

        {/* User ratings and quick CTA */}
        <div className="mt-3 sm:mt-4 flex items-center justify-between gap-3 border-t border-white/5 pt-2 sm:pt-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <button 
              onClick={() => handleFeedbackAction('like')}
              disabled={feedbackSubmitted !== null}
              className={`h-8 w-8 rounded-xl border border-white/12 flex items-center justify-center transition-all ${
                feedbackSubmitted === 'like' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'hover:bg-white/5 text-white/50 hover:text-white'
              }`}
              title="More like this"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={() => handleFeedbackAction('dislike')}
              disabled={feedbackSubmitted !== null}
              className={`h-8 w-8 rounded-xl border border-white/12 flex items-center justify-center transition-all ${
                feedbackSubmitted === 'dislike' ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'hover:bg-white/5 text-white/50 hover:text-white'
              }`}
              title="Less like this"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={handleSaveAction}
              disabled={saveSuccess}
              className={`h-8 w-8 rounded-xl border border-white/12 flex items-center justify-center transition-all ${
                saveSuccess ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 animate-pulse' : 'hover:bg-white/5 text-white/50 hover:text-white'
              }`}
              title="Save prescription"
            >
              {saveSuccess ? <Check className="h-3.5 w-3.5" /> : <Heart className="h-3.5 w-3.5" />}
            </button>
          </div>

          <button
            onClick={onCtaClick}
            className="flex-1 h-8 px-4 rounded-xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500 text-white font-black text-[10px] uppercase tracking-wider shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:scale-[1.02] transition-all flex items-center justify-center gap-1"
          >
            {prescription.ctaType === 'start_radio' ? (
              <Disc className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
            {prescription.primaryCtaLabel}
          </button>
        </div>
      </div>

      {/* Controlled In-Session Refinement Console */}
      <div className="border-t border-white/5 pt-2 sm:pt-3">
        <button
          onClick={() => setShowRefinements(!showRefinements)}
          className="w-full flex items-center justify-between text-[9px] font-mono font-black text-purple-300/80 uppercase tracking-widest pl-1 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-purple-400" />
            Refine this prescription
          </span>
          <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300" style={{ transform: showRefinements ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </button>

        {showRefinements && (
          <div className="mt-2.5 p-2 sm:p-3 rounded-2xl bg-black/50 border border-white/5 space-y-1 sm:space-y-2 animate-fade-in max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
            <p className="text-[10px] text-white/40 leading-relaxed font-mono pl-1">
              Refining adjusts parameter filters within this session without costing another full daily limit prescription.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {REFINEMENT_OPTIONS.map((opt) => {
                const isSelected = selectedRefinement === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleRefineSelect(opt.id)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold font-mono transition-all text-left flex flex-col gap-0.5 ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                        : 'bg-white/[0.02] border-white/5 text-white/50 hover:text-white/80'
                    }`}
                    title={opt.description}
                  >
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Secondary CTAs */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-1">
        {onOpenForge && (
          <button
            onClick={onOpenForge}
            className="h-9 sm:h-10 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-purple-500/30 text-white font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Sliders className="h-3.5 w-3.5 text-purple-300" />
            Playlist Forge
          </button>
        )}

        <button
          onClick={onRestart}
          disabled={dailyCount <= 0}
          className={`h-9 sm:h-10 rounded-xl sm:rounded-2xl border font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
            dailyCount > 0
              ? 'border-purple-500/25 hover:border-purple-500/50 text-purple-200 bg-purple-500/10 hover:bg-purple-500/15'
              : 'border-white/5 text-white/20 cursor-not-allowed bg-transparent'
          }`}
          title={dailyCount <= 0 ? "You've used all prescriptions today." : "Start a brand-new guided route flow"}
        >
          <Sparkles className="h-3.5 w-3.5" />
          New Diagnosis
        </button>
      </div>

    </div>
  );
};
export default PrescriptionResultCard;
