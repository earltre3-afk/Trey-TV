import React, { useState } from 'react';
import { ScreenWrap, TreyHeader, TreyBottomNav, GlossyButton, GhostButton, GlassCard, BrandLogo, Stepper, catColor } from '../components/TreyShell';
import { NounType } from '../treynounTypes';
import { getMockNounForCategory } from '../treynounUtils';
import { ChevronRight, Shuffle, Trash2, Check, User, MapPin, Box, Lock, X, Pencil, type LucideIcon } from 'lucide-react';

interface Props {
  initialCategory?: NounType;
  onContinue: (cat: NounType, noun: string) => void;
  onBack: () => void;
  onExit: () => void;
}

const cats: { id: NounType; label: string; desc: string; Icon: LucideIcon }[] = [
  { id: 'person', label: 'PERSON', desc: 'A person, character, or someone you admire.', Icon: User },
  { id: 'place', label: 'PLACE', desc: 'A place, location, or somewhere in the world.', Icon: MapPin },
  { id: 'thing', label: 'THING', desc: 'An object, item, or something you can touch.', Icon: Box },
];

const TreynounTargetSetup: React.FC<Props> = ({ initialCategory = 'thing', onContinue, onBack, onExit }) => {
  const [category, setCategory] = useState<NounType>(initialCategory);
  const [noun, setNoun] = useState('');
  const [step, setStep] = useState<1 | 2>(1);

  const random = () => setNoun(getMockNounForCategory(category));
  const randomCat = () => { const c = cats[Math.floor(Math.random() * 3)].id; setCategory(c); };
  const active = cats.find((c) => c.id === category)!;

  return (
    <ScreenWrap>
      <TreyHeader />
      <div className="flex-1 overflow-y-auto trey-scroll px-4 pb-6">
        {step === 1 && (
          <div className="trey-rise">
            <div className="text-center mt-3">
              <BrandLogo size="text-6xl" className="trey-float inline-block" />
              <div className="mt-3 inline-block trey-glass rounded-full px-5 py-1.5 text-xs font-black tracking-[0.25em] text-white/80">STEP 1 OF 3</div>
              <h2 className="mt-3 text-3xl font-black">Choose Your <span style={{ color: catColor.person }}>Noun</span> <span style={{ color: catColor.place }}>Type</span></h2>
              <p className="text-sm text-white/45 mt-1">Pick a category to get started!</p>
            </div>

            <div className="flex gap-3 mt-5">
              {cats.map(({ id, label, desc, Icon }) => {
                const sel = category === id; const col = catColor[id];
                return (
                  <button key={id} onClick={() => setCategory(id)}
                    className="relative flex-1 rounded-3xl border-2 p-3 pt-5 flex flex-col items-center text-center transition active:scale-95 overflow-hidden"
                    style={{ borderColor: sel ? col : `${col}40`, background: `linear-gradient(180deg,${col}26,${col}08)`, boxShadow: sel ? `0 0 26px ${col}66` : 'none' }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 trey-glow" style={{ color: col, border: `1.5px solid ${col}`, background: `${col}1a` }}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="font-black text-base" style={{ color: col }}>{label}</span>
                    <span className="text-[10px] text-white/55 mt-2 leading-tight">{desc}</span>
                    {sel && <span className="absolute top-2 right-2"><Check className="w-4 h-4" style={{ color: col }} /></span>}
                  </button>
                );
              })}
            </div>

            <GlossyButton onClick={() => setStep(2)} className="w-full py-5 text-2xl mt-6">
              CONTINUE <ChevronRight className="w-6 h-6" />
            </GlossyButton>
            <GhostButton onClick={randomCat} className="w-full py-3 mt-3" color="#8B9AFF">
              <Shuffle className="w-4 h-4" />
              <span className="flex flex-col leading-tight items-center">
                <span className="font-black text-sm">RANDOM CATEGORY</span>
                <span className="text-[10px] opacity-70 font-medium">Let fate decide for you!</span>
              </span>
            </GhostButton>
            <button onClick={onBack} className="w-full mt-4 text-xs text-white/35 underline">Back</button>
          </div>
        )}

        {step === 2 && (
          <div className="trey-rise">
            <div className="text-center mt-3">
              <BrandLogo size="text-5xl" className="trey-float inline-block" />
              <h2 className="mt-2 text-3xl font-black">ENTER THE <span className="trey-title">SECRET NOUN</span></h2>
            </div>

            <div className="mt-5"><Stepper step={2} labels={['Pick Category', 'Enter Noun', 'Start Game']} /></div>

            <GlassCard className="mt-5 p-4 flex items-center justify-between" glow={catColor[category]}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center trey-glow" style={{ color: catColor[category], border: `1.5px solid ${catColor[category]}`, background: `${catColor[category]}1a` }}>
                  <active.Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] text-white/45 font-bold tracking-wider">CATEGORY</div>
                  <div className="text-xl font-black capitalize" style={{ color: catColor[category] }}>{active.label.toLowerCase()}</div>
                </div>
              </div>
              <button onClick={() => setStep(1)} className="text-xs font-bold bg-black/40 border border-white/15 rounded-full px-3 py-2 flex items-center gap-1.5 active:scale-95">Change <Pencil className="w-3.5 h-3.5" /></button>
            </GlassCard>

            <GlassCard className="mt-4 p-4">
              <div className="text-[11px] font-black text-white/55 tracking-wider mb-2">ENTER YOUR SECRET NOUN</div>
              <div className="relative">
                <input value={noun} onChange={(e) => setNoun(e.target.value)} placeholder="microphone"
                  className="w-full bg-black/50 border-2 border-cyan-500/60 rounded-2xl px-4 py-4 text-2xl font-bold outline-none focus:border-cyan-400 transition"
                  style={{ boxShadow: '0 0 18px rgba(0,240,255,.2)' }} />
                {noun && <button onClick={() => setNoun('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center"><X className="w-4 h-4 text-white/60" /></button>}
              </div>
              <div className="flex items-start gap-2 mt-3 text-white/55 text-xs">
                <Lock className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                <span><b className="text-white/75">Keep it secret from the guesser.</b><br />They won't see what you type!</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={random} className="rounded-2xl bg-black/40 border border-white/15 py-3 flex items-center justify-center gap-2 active:scale-95 font-bold text-sm"><Shuffle className="w-4 h-4 text-purple-400" /> Shuffle</button>
                <button onClick={() => setNoun('')} className="rounded-2xl bg-black/40 border border-white/15 py-3 flex items-center justify-center gap-2 active:scale-95 font-bold text-sm"><Trash2 className="w-4 h-4 text-fuchsia-400" /> Clear</button>
              </div>
            </GlassCard>

            <GlossyButton onClick={() => noun.trim() && onContinue(category, noun.trim().toLowerCase())} disabled={!noun.trim()} className="w-full py-5 text-2xl mt-5">
              START ROUND <ChevronRight className="w-6 h-6" />
            </GlossyButton>
          </div>
        )}
      </div>
      <TreyBottomNav active="home" onHome={onExit} />
    </ScreenWrap>
  );
};

export default TreynounTargetSetup;
