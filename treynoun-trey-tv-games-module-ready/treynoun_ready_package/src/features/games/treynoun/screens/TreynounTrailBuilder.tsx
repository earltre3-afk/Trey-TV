import React, { useMemo, useState } from 'react';
import { ScreenWrap, TreyHeader, TreyBottomNav, GlossyButton, GlassCard, catColor } from '../components/TreyShell';
import { NounType } from '../treynounTypes';
import { getSignalPromptsForCategory, validateClue } from '../treynounUtils';
import { ChevronLeft, ChevronRight, Check, AlertTriangle, Users, MapPin, Box, User, Lightbulb, type LucideIcon } from 'lucide-react';

interface Props {
  category: NounType;
  targetNoun: string;
  onStart: (clues: string[]) => void;
  onBack: () => void;
  onExit: () => void;
}

const iconSets: Record<NounType, LucideIcon[]> = {
  person: [MapPin, Box, Users],
  place: [Users, Box, Box],
  thing: [User, MapPin, Box],
};
const catIcons: Record<NounType, LucideIcon> = { person: User, place: MapPin, thing: Box };
const clueColors = ['#FFB800', '#19D3FF', '#C77DFF'];

const TreynounTrailBuilder: React.FC<Props> = ({ category, targetNoun, onStart, onBack, onExit }) => {
  const prompts = getSignalPromptsForCategory(category);
  const [clues, setClues] = useState(['', '', '']);
  const CatIcon = catIcons[category];

  const validations = useMemo(() => clues.map((c) => validateClue(c, targetNoun)), [clues, targetNoun]);
  const filled = clues.filter((c, i) => c.trim() && validations[i].valid).length;
  const allValid = clues.every((c, i) => c.trim() && validations[i].valid);

  const update = (i: number, v: string) => { const next = [...clues]; next[i] = v; setClues(next); };

  return (
    <ScreenWrap>
      <TreyHeader />
      <div className="flex-1 overflow-y-auto trey-scroll px-4 pb-6 trey-rise">
        <div className="relative text-center mt-3">
          <button onClick={onBack} className="absolute left-0 top-1 w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center active:scale-95">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-4xl font-black trey-float inline-block">
            <span className="text-white">Build </span><span className="trey-title">Your Clues</span>
          </h1>
          <div className="mt-3 inline-flex items-center gap-2 trey-glass rounded-full px-5 py-2" style={{ boxShadow: `0 0 18px ${catColor[category]}44` }}>
            <CatIcon className="w-5 h-5" style={{ color: catColor[category] }} />
            <span className="font-black text-lg capitalize" style={{ color: catColor[category] }}>{category}</span>
          </div>
          <p className="text-sm text-white/55 mt-3">
            Create 3 clues to help others guess the <span style={{ color: catColor[category] }} className="font-bold capitalize">{category}</span> without saying it!
          </p>
        </div>

        <div className="text-center text-xs text-white/35 mt-2">Secret noun (you only): <b className="capitalize" style={{ color: catColor[category] }}>{targetNoun}</b></div>

        <div className="space-y-3 mt-4">
          {[0, 1, 2].map((i) => {
            const Icon = iconSets[category][i]; const v = validations[i]; const col = clueColors[i];
            const valid = clues[i].trim() && v.valid && !v.warning;
            return (
              <GlassCard key={i} className="p-4" glow={clues[i].trim() ? col : undefined}>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ color: col, border: `1.5px solid ${col}`, background: `${col}1a` }}>
                    <Icon className="w-6 h-6" />
                    <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center text-black" style={{ background: col }}>{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm leading-tight" style={{ color: col }}>{prompts[i]}</div>
                  </div>
                  {valid && <div className="w-7 h-7 rounded-full bg-green-500/20 border border-green-400/60 flex items-center justify-center shrink-0"><Check className="w-4 h-4 text-green-400" /></div>}
                </div>
                <input value={clues[i]} onChange={(e) => update(i, e.target.value)} placeholder="Type a Signal Clue..."
                  className="mt-3 w-full bg-black/50 border rounded-xl px-3 py-3 text-sm font-semibold outline-none focus:border-cyan-400 transition"
                  style={{ borderColor: clues[i].trim() ? `${col}66` : 'rgba(255,255,255,.12)' }} />
                {clues[i].trim() && v.error && <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400"><AlertTriangle className="w-3.5 h-3.5" /> {v.error}</div>}
                {clues[i].trim() && !v.error && v.warning && <div className="flex items-center gap-1.5 mt-2 text-xs text-yellow-400"><AlertTriangle className="w-3.5 h-3.5" /> {v.warning}</div>}
              </GlassCard>
            );
          })}
        </div>

        {/* step stars */}
        <div className="flex items-center justify-center gap-1 mt-5">
          {[0, 1, 2].map((i) => (
            <React.Fragment key={i}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border"
                style={{ borderColor: i < filled ? '#FFD54F' : 'rgba(255,255,255,.2)', color: i < filled ? '#FFD54F' : 'rgba(255,255,255,.4)', background: i < filled ? 'rgba(255,184,0,.18)' : 'transparent', boxShadow: i < filled ? '0 0 12px rgba(255,184,0,.5)' : 'none' }}>
                {i < filled ? '★' : i + 1}
              </div>
              {i < 2 && <span className="w-6 h-0.5 rounded-full" style={{ background: i < filled - 1 ? '#19D3FF' : 'rgba(255,255,255,.12)' }} />}
            </React.Fragment>
          ))}
        </div>
        <p className="text-center text-xs font-bold mt-1"><span className="text-cyan-300">Step {filled} of 3</span></p>

        <GlossyButton onClick={() => allValid && onStart(clues)} disabled={!allValid} className="w-full py-5 text-2xl mt-4">
          READY FOR GUESSING <ChevronRight className="w-6 h-6" />
        </GlossyButton>
        <p className="text-center text-xs text-white/45 mt-3 flex items-center justify-center gap-1.5"><Lightbulb className="w-4 h-4 text-yellow-400" /> Great clues lead to <b className="text-yellow-300">fast guesses and big points!</b></p>
      </div>
      <TreyBottomNav active="home" onHome={onExit} />
    </ScreenWrap>
  );
};

export default TreynounTrailBuilder;
