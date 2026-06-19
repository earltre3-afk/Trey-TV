// Trap Tap — results / score screen.
// June Nineteenth gets a special Black Power / Juneteenth theme.

import React from 'react';
import { RotateCcw, Home } from 'lucide-react';
import { TrapTapResult } from '../traptapTypes';

interface Props {
  result: TrapTapResult;
  onPlayAgain: () => void;
  onExit: () => void;
}

const mono = "'JetBrains Mono',monospace";

const isJuneteenthResult = (r: TrapTapResult) => r.songId === 'june-nineteenth';

const GRADE_GRAD: Record<string, string> = {
  'S+': 'linear-gradient(120deg,#3ff0c0,#5cd0ff,#9CFF2E)',
  S: 'linear-gradient(120deg,#5cd0ff,#B026FF)',
  A: 'linear-gradient(120deg,#9CFF2E,#00B4FF)',
  B: 'linear-gradient(120deg,#ffd23f,#FF0080)',
  C: 'linear-gradient(120deg,#ff9f43,#FF0080)',
  D: 'linear-gradient(120deg,#ff5c7a,#7B2BFF)',
};

const JUNE_GRADE_GRAD: Record<string, string> = {
  'S+': 'linear-gradient(120deg,#FFD700,#E31B23,#00843D)',
  S: 'linear-gradient(120deg,#FFD700,#E31B23)',
  A: 'linear-gradient(120deg,#00843D,#FFD700)',
  B: 'linear-gradient(120deg,#FFD700,#E31B23)',
  C: 'linear-gradient(120deg,#E31B23,#8B0000)',
  D: 'linear-gradient(120deg,#8B0000,#4a0000)',
};

const TrapTapResults: React.FC<Props> = ({ result, onPlayAgain, onExit }) => {
  const isJune = isJuneteenthResult(result);

  const breakdown = isJune ? [
    { label: 'PERFECT+', count: result.counts.pp, color: '#FFD700', border: 'rgba(255,215,0,.25)' },
    { label: 'PERFECT', count: result.counts.p, color: '#E31B23', border: 'rgba(227,27,35,.25)' },
    { label: 'GOOD', count: result.counts.g, color: '#00843D', border: 'rgba(0,132,61,.25)' },
    { label: 'MISS', count: result.counts.m, color: '#8B0000', border: 'rgba(139,0,0,.25)' },
  ] : [
    { label: 'PERFECT+', count: result.counts.pp, color: '#ffd23f', border: 'rgba(255,210,63,.25)' },
    { label: 'PERFECT', count: result.counts.p, color: '#5cd0ff', border: 'rgba(92,208,255,.25)' },
    { label: 'GOOD', count: result.counts.g, color: '#B07cff', border: 'rgba(176,38,255,.25)' },
    { label: 'MISS', count: result.counts.m, color: '#ff5c7a', border: 'rgba(255,92,122,.25)' },
  ];

  const bgGrad = isJune
    ? 'radial-gradient(ellipse at 50% -8%, rgba(227,27,35,0.22), transparent 46%),' +
      'radial-gradient(ellipse at 0% 26%, rgba(0,132,61,0.16), transparent 50%),' +
      'radial-gradient(ellipse at 100% 32%, rgba(255,215,0,0.12), transparent 48%),' +
      'linear-gradient(180deg,#0a0600 0%,#060200 58%,#000 100%)'
    : 'radial-gradient(ellipse at 50% -8%, rgba(255,0,128,0.20), transparent 46%),' +
      'radial-gradient(ellipse at 0% 26%, rgba(0,180,255,0.12), transparent 50%),' +
      'radial-gradient(ellipse at 100% 32%, rgba(176,38,255,0.16), transparent 48%),' +
      'linear-gradient(180deg,#07010f 0%,#020006 58%,#000 100%)';

  const gradeGrad = isJune ? JUNE_GRADE_GRAD : GRADE_GRAD;
  const gradeShadow = isJune
    ? 'drop-shadow(0 0 40px rgba(255,215,0,.5))'
    : 'drop-shadow(0 0 40px rgba(92,208,255,.5))';
  const rankColor = isJune ? '#FFD700' : '#5cd0ff';
  const newBestColor = isJune ? '#00843D' : '#ffd23f';
  const playAgainGrad = isJune
    ? 'linear-gradient(100deg,#E31B23,#8B0000 55%,#00843D)'
    : 'linear-gradient(100deg,#FF0080,#B026FF 55%,#00B4FF)';
  const playAgainShadow = isJune ? '0 0 26px rgba(227,27,35,.4)' : '0 0 26px rgba(255,0,128,.4)';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{
        color: '#fff',
        fontFamily: "'Inter',system-ui,sans-serif",
        background: bgGrad,
      }}
    >
      <style>{`
        @keyframes ttGradePop{0%{transform:scale(2.4) rotate(-8deg);opacity:0;filter:blur(8px)}55%{transform:scale(.92) rotate(2deg);opacity:1;filter:blur(0)}100%{transform:scale(1) rotate(0);opacity:1}}
        .tt-grade{animation:ttGradePop 1s cubic-bezier(.18,.9,.2,1) forwards}
        @keyframes juneResultGlow{0%,100%{text-shadow:0 0 18px rgba(227,27,35,.5),0 0 40px rgba(255,215,0,.15)}50%{text-shadow:0 0 28px rgba(227,27,35,.7),0 0 60px rgba(255,215,0,.3)}}
        .june-result-glow{animation:juneResultGlow 2.5s ease-in-out infinite}
      `}</style>

      <div className="mx-auto" style={{ maxWidth: 440, padding: 'calc(40px + env(safe-area-inset-top)) 22px calc(28px + env(safe-area-inset-bottom))', textAlign: 'center' }}>
        <div style={{ fontSize: 12, letterSpacing: '.4em', fontWeight: 700, color: 'rgba(255,255,255,.45)', textIndent: '.4em' }}>RESULTS</div>

        {isJune && <div style={{ fontSize: 48, lineHeight: 1, marginTop: 8, filter: 'drop-shadow(0 0 16px rgba(227,27,35,.4))' }}>✊</div>}

        <div style={{ fontWeight: 900, fontSize: 24, marginTop: 8 }}>{result.songTitle}{isJune && ' ✊'}</div>
        <div style={{ fontFamily: mono, fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 3, letterSpacing: '.1em' }}>{result.artist} · {result.difficulty}</div>

        {isJune && (
          <div className="june-result-glow" style={{ marginTop: 10, fontWeight: 700, fontSize: 12, letterSpacing: '.22em', color: '#FFD700' }}>
            FREEDOM · LIBERATION · POWER
          </div>
        )}

        <div className="tt-grade" style={{ margin: '26px auto 6px', fontWeight: 900, fontSize: 120, lineHeight: 1, background: gradeGrad[result.grade] || '#fff', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: gradeShadow }}>{result.grade}</div>
        <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '.3em', textIndent: '.3em', color: rankColor }}>{result.rank}</div>

        <div style={{ marginTop: 26, padding: 20, borderRadius: 22, background: 'linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.02))', border: `1px solid ${isJune ? 'rgba(227,27,35,.18)' : 'rgba(255,255,255,.13)'}`, backdropFilter: 'blur(14px)' }}>
          <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '.2em', color: 'rgba(255,255,255,.5)' }}>SCORE</div>
          <div style={{ fontWeight: 900, fontSize: 44, lineHeight: 1.05, marginTop: 4 }}>{result.score.toLocaleString()}</div>
          {result.isNewBest && <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '.2em', color: newBestColor, marginTop: 4 }}>{isJune ? '✊ NEW BEST' : '★ NEW BEST'}</div>}
          <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
            <Stat label="ACCURACY" value={`${result.accuracy.toFixed(2).replace(/\.?0+$/, '')}%`}
              color={isJune ? '#FFD700' : '#ff77b6'}
              bg={isJune ? 'rgba(255,215,0,.08)' : 'rgba(255,0,128,.08)'}
              border={isJune ? 'rgba(255,215,0,.2)' : 'rgba(255,0,128,.2)'} />
            <Stat label="MAX COMBO" value={String(result.maxCombo)}
              color={isJune ? '#00843D' : '#5cd0ff'}
              bg={isJune ? 'rgba(0,132,61,.08)' : 'rgba(0,180,255,.08)'}
              border={isJune ? 'rgba(0,132,61,.2)' : 'rgba(0,180,255,.2)'} />
          </div>
        </div>

        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {breakdown.map((b) => (
            <div key={b.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderRadius: 13, background: 'rgba(255,255,255,.04)', border: `1px solid ${b.border}` }}>
              <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: '.08em', color: b.color }}>{b.label}</span>
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 15 }}>{b.count}</span>
            </div>
          ))}
        </div>

        <button onClick={onPlayAgain} style={{ marginTop: 22, width: '100%', padding: 17, borderRadius: 16, cursor: 'pointer', fontWeight: 900, letterSpacing: '.18em', border: 'none', color: '#fff', background: playAgainGrad, boxShadow: playAgainShadow, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <RotateCcw size={16} /> {isJune ? '✊ PLAY AGAIN' : 'PLAY AGAIN'}
        </button>
        <button onClick={onExit} style={{ marginTop: 10, width: '100%', padding: 15, borderRadius: 16, cursor: 'pointer', fontWeight: 800, letterSpacing: '.16em', color: 'rgba(255,255,255,.8)', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.16)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Home size={15} /> GAMES
        </button>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string; color: string; bg: string; border: string }> = ({ label, value, color, bg, border }) => (
  <div style={{ flex: 1, padding: 12, borderRadius: 14, background: bg, border: `1px solid ${border}` }}>
    <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '.16em', color: 'rgba(255,255,255,.55)' }}>{label}</div>
    <div style={{ fontWeight: 900, fontSize: 22, marginTop: 3, color }}>{value}</div>
  </div>
);

export default TrapTapResults;
