import React from 'react';

// Cinematic dark background with flowing liquid ribbons. Pure CSS — no perf-heavy animation libs.
const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black" aria-hidden="true">
      {/* base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 0%, #1a0530 0%, #07000f 55%, #000000 100%)',
        }}
      />
      {/* ribbon 1 - purple/magenta left */}
      <div
        className="absolute -left-32 top-10 w-[60vw] h-[120vh] opacity-70 blur-3xl"
        style={{
          background:
            'conic-gradient(from 220deg at 30% 50%, rgba(168,85,247,0) 0deg, rgba(168,85,247,0.45) 60deg, rgba(217,70,239,0.35) 120deg, rgba(168,85,247,0) 200deg)',
          animation: 'ribbonSpin 28s linear infinite',
        }}
      />
      {/* ribbon 2 - cyan/blue right */}
      <div
        className="absolute -right-32 top-0 w-[60vw] h-[120vh] opacity-60 blur-3xl"
        style={{
          background:
            'conic-gradient(from 40deg at 70% 50%, rgba(34,211,238,0) 0deg, rgba(34,211,238,0.4) 70deg, rgba(99,102,241,0.35) 140deg, rgba(34,211,238,0) 220deg)',
          animation: 'ribbonSpin 36s linear infinite reverse',
        }}
      />
      {/* ribbon 3 - gold/orange bottom */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-[-20vh] w-[110vw] h-[60vh] opacity-50 blur-3xl"
        style={{
          background:
            'radial-gradient(50% 50% at 50% 50%, rgba(251,146,60,0.5) 0%, rgba(217,70,239,0.25) 40%, transparent 70%)',
          animation: 'ribbonPulse 8s ease-in-out infinite',
        }}
      />
      {/* fine grain noise */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
      />
      <style>{`
        @keyframes ribbonSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes ribbonPulse { 0%,100% { opacity: 0.4; transform: translateX(-50%) scale(1); } 50% { opacity: 0.65; transform: translateX(-50%) scale(1.08); } }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Background;
