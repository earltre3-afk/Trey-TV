import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, Activity } from 'lucide-react';
import { PRESCRIBE_ME_QUESTIONS } from './prescribeMeQuestions';
import type { UserAnswers } from './prescribeMeTypes';

interface PrescribeMeQuestionFlowProps {
  onComplete: (answers: UserAnswers) => void;
  onCancel: () => void;
}

export const PrescribeMeQuestionFlow: React.FC<PrescribeMeQuestionFlowProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<UserAnswers>>({
    currentNeed: '',
    emotionalState: '',
    desiredShift: '',
    familiarity: '',
    contentType: '',
  });

  const question = PRESCRIBE_ME_QUESTIONS[currentStep];

  const handleSelectOption = (value: string) => {
    const category = question.category;
    const updatedAnswers = { ...answers, [category]: value };
    setAnswers(updatedAnswers);

    // Auto-advance with a slight delay for slick visual feel
    setTimeout(() => {
      if (currentStep < PRESCRIBE_ME_QUESTIONS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // We reached the end, pass full answers
        onComplete(updatedAnswers as UserAnswers);
      }
    }, 200);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      onCancel();
    }
  };

  const percentProgress = Math.round(((currentStep + 1) / PRESCRIBE_ME_QUESTIONS.length) * 100);

  return (
    <div className="flex flex-col gap-3 sm:gap-4 animate-fade-in relative z-10 select-none">

      {/* Question Header & Nav */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 sm:pb-3">
        <button
          onClick={handleBack}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white transition-all active:scale-90"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-center">
          <span className="text-[9px] font-mono font-black text-purple-300 uppercase tracking-widest block">Question {currentStep + 1} of 5</span>
          <span className="text-[10px] text-white/40 font-mono mt-0.5">{question.category.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
        </div>

        <div className="w-8 h-8 flex items-center justify-center">
          <HelpCircle className="h-4 w-4 text-purple-400 animate-pulse" />
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-400 transition-all duration-300"
          style={{ width: `${percentProgress}%` }}
        />
      </div>

      {/* Question Text */}
      <div className="py-2">
        <h3 className="text-sm font-black text-white leading-relaxed tracking-tight">
          {question.text}
        </h3>
      </div>

      {/* Option Selection Panel */}
      <div className="grid gap-2 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin">
        {question.options.map((opt) => {
           
          const isSelected = (answers as any)[question.category] === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleSelectOption(opt.value)}
              className={`w-full text-left py-2.5 px-3.5 sm:py-3 sm:px-4 rounded-xl sm:rounded-2xl border text-xs font-bold transition-all flex items-center justify-between active:scale-[0.99] ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-500/25 to-cyan-500/15 border-purple-500/50 text-white shadow-[0_0_12px_rgba(168,85,247,0.25)] font-black'
                  : 'bg-white/[0.02] border-white/8 text-white/70 hover:text-white hover:border-white/15'
              }`}
            >
              <span>{opt.label}</span>
              {isSelected ? (
                <CheckCircle className="h-4 w-4 text-purple-300 animate-pulse" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-white/10 group-hover:bg-white/30" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer support */}
      <div className="border-t border-white/5 pt-2 sm:pt-3 flex items-center justify-between text-[9px] font-mono text-white/30">
        <span className="flex items-center gap-1">
          <Activity className="h-3 w-3 text-purple-400 animate-pulse" />
          Intent-based algorithmic routing
        </span>
        <span>Secure & Privacy-Conscious</span>
      </div>
    </div>
  );
};

const CheckCircle = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
  </svg>
);
export default PrescribeMeQuestionFlow;
