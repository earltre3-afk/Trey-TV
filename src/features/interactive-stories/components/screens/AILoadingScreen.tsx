import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { IMAGES } from '../../lib/storyData';

const STEPS = [
  'Reading your choiceâ€¦',
  'Weighing the consequencesâ€¦',
  'Updating relationshipsâ€¦',
  'Writing the next chapterâ€¦',
  'Setting the sceneâ€¦',
];

export const AILoadingScreen: React.FC = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1800);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <img src={IMAGES.twinsCover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" />

      <div className="relative z-10 px-8 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-violet-400/40 bg-violet-500/10 shadow-2xl shadow-violet-500/30">
          <Loader2 className="h-10 w-10 animate-spin text-violet-300" />
        </div>
        <div className="font-display text-xs font-bold uppercase tracking-[0.4em] text-amber-400">
          AI Story Engine
        </div>
        <h2 className="mt-2 font-display text-2xl font-black uppercase tracking-tight text-white">
          {STEPS[step]}
        </h2>
        <p className="mt-4 max-w-xs mx-auto text-sm text-white/50">
          The next chapter is being written based on the path you chose.
        </p>

        <div className="mt-8 flex justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 w-8 rounded-full transition-colors ${i === step ? 'bg-violet-400' : 'bg-white/15'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

