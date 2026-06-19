// Trap Tap — song select + difficulty + neon hub.
// June Nineteenth gets a special Black Power / Juneteenth theme.

import React from 'react';
import { ChevronLeft, Play, Zap } from 'lucide-react';
import { TrapTapSong, TrapTapDifficulty } from '../traptapTypes';
import { SONGS, DIFFICULTIES } from '../traptapData';
import { getBest } from '../traptapStorage';

interface Props {
  songIndex: number;
  diffIndex: number;
  onSelectSong: (i: number) => void;
  onSelectDiff: (i: number) => void;
  onPlay: () => void;
  onExit: () => void;
}

const mono = "'JetBrains Mono',monospace";

const isJuneteenthSong = (song: TrapTapSong) => song.id === 'june-nineteenth';

const TrapTapHome: React.FC<Props> = ({ songIndex, diffIndex, onSelectSong, onSelectDiff, onPlay, onExit }) => {
  const song: TrapTapSong = SONGS[songIndex];
  const diff: TrapTapDifficulty = DIFFICULTIES[diffIndex];
  const best = getBest(song.id, diff.name);
  const isJune = isJuneteenthSong(song);

  // Theme-driven colors
  const titleGrad = isJune
    ? 'linear-gradient(100deg,#E31B23,#FFD700 42%,#00843D 78%)'
    : 'linear-gradient(100deg,#FF0080,#B026FF 42%,#00B4FF 78%,#9CFF2E)';
  const bgGrad = isJune
    ? 'radial-gradient(ellipse at 50% -8%, rgba(227,27,35,0.22), transparent 46%),' +
      'radial-gradient(ellipse at 0% 26%, rgba(0,132,61,0.16), transparent 50%),' +
      'radial-gradient(ellipse at 100% 32%, rgba(255,215,0,0.12), transparent 48%),' +
      'linear-gradient(180deg,#0a0600 0%,#060200 58%,#000 100%)'
    : 'radial-gradient(ellipse at 50% -8%, rgba(255,0,128,0.20), transparent 46%),' +
      'radial-gradient(ellipse at 0% 26%, rgba(0,180,255,0.12), transparent 50%),' +
      'radial-gradient(ellipse at 100% 32%, rgba(176,38,255,0.16), transparent 48%),' +
      'linear-gradient(180deg,#07010f 0%,#020006 58%,#000 100%)';
  const playBtnGrad = isJune
    ? 'linear-gradient(100deg,#E31B23,#8B0000 55%,#00843D)'
    : 'linear-gradient(100deg,#FF0080,#B026FF 55%,#00B4FF)';
  const playBtnShadow = isJune
    ? '0 0 30px rgba(227,27,35,.4), inset 0 1px 0 rgba(255,255,255,.3)'
    : '0 0 30px rgba(255,0,128,.4), inset 0 1px 0 rgba(255,255,255,.3)';
  const bestColor = isJune ? '#00843D' : '#8fb4ff';

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
        @keyframes juneGlow {
          0%, 100% { text-shadow: 0 0 18px rgba(227,27,35,.5), 0 0 40px rgba(255,215,0,.15); }
          50% { text-shadow: 0 0 28px rgba(227,27,35,.7), 0 0 60px rgba(255,215,0,.3); }
        }
        .june-glow { animation: juneGlow 2.5s ease-in-out infinite; }
      `}</style>

      <div className="mx-auto" style={{ maxWidth: 440, padding: '0 22px calc(28px + env(safe-area-inset-bottom))' }}>
        <div className="flex items-center justify-between" style={{ height: 'calc(54px + env(safe-area-inset-top))', paddingTop: 'env(safe-area-inset-top)' }}>
          <button onClick={onExit} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', fontSize: 13, cursor: 'pointer' }}>
            <ChevronLeft size={16} /> Games
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 6 }}>
          <div style={{ fontSize: 13, letterSpacing: '.5em', fontWeight: 600, color: 'rgba(255,255,255,.45)', textIndent: '.5em' }}>RHYTHM · CUSTOM TRACKS</div>
          <div style={{ fontWeight: 900, fontSize: 54, lineHeight: .96, marginTop: 10, letterSpacing: '-.01em', background: titleGrad, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 0 22px rgba(176,38,255,.45))' }}>TRAP TAP</div>
          <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '.62em', color: 'rgba(255,255,255,.5)', marginTop: 6, textIndent: '.62em' }}>T R A P&nbsp;&nbsp;T A P</div>
        </div>

        <SectionLabel text="SELECT TRACK" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SONGS.map((s, i) => {
            const selected = i === songIndex;
            const isThisSongJune = s.id === 'june-nineteenth';
            return (
              <div
                key={s.id}
                onClick={() => onSelectSong(i)}
                style={{
                  position: 'relative', display: 'flex', gap: 14, alignItems: 'center', padding: 12, borderRadius: 20, cursor: 'pointer',
                  background: isThisSongJune
                    ? selected
                      ? 'linear-gradient(135deg,rgba(227,27,35,.18),rgba(0,132,61,.08) 48%,rgba(255,215,0,.06))'
                      : 'linear-gradient(135deg,rgba(227,27,35,.08),rgba(0,0,0,.02) 48%,rgba(0,132,61,.04))'
                    : 'linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.02) 48%,rgba(0,180,255,.05))',
                  border: `1px solid ${
                    isThisSongJune
                      ? selected ? 'rgba(227,27,35,.65)' : 'rgba(227,27,35,.2)'
                      : selected ? 'rgba(255,0,128,.55)' : 'rgba(255,255,255,.1)'
                  }`,
                  boxShadow: selected
                    ? isThisSongJune
                      ? '0 0 26px rgba(227,27,35,.35), 0 0 50px rgba(0,132,61,.12), inset 0 1px 0 rgba(255,215,0,.18)'
                      : '0 0 26px rgba(255,0,128,.28), inset 0 1px 0 rgba(255,255,255,.18)'
                    : '0 8px 22px rgba(0,0,0,.4)',
                  backdropFilter: 'blur(14px)', transition: 'border-color .2s, box-shadow .2s',
                }}
              >
                <div style={{ position: 'relative', width: 62, height: 62, borderRadius: 15, overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg,#1a0a2e,#04121f)', boxShadow: '0 6px 18px rgba(0,0,0,.5)' }}>
                  <img src={s.coverArtUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  {isThisSongJune && (
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(227,27,35,.25),rgba(0,132,61,.2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 24, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.6))' }}>✊</span>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 17, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.title}{isThisSongJune && ' ✊'}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', marginTop: 2 }}>{s.artist}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 7 }}>
                    <Chip>{s.bpm.toFixed(s.bpm % 1 ? 2 : 0)} BPM</Chip>
                    <Chip tone={isThisSongJune ? 'june' : 'pink'}>{s.genre}</Chip>
                    {isThisSongJune && <Chip tone="june">JUNETEENTH</Chip>}
                  </div>
                </div>
                {selected && (
                  <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isThisSongJune ? 'linear-gradient(135deg,#E31B23,#00843D)' : 'linear-gradient(135deg,#FF0080,#B026FF)', boxShadow: isThisSongJune ? '0 0 16px rgba(227,27,35,.6)' : '0 0 16px rgba(176,38,255,.6)', fontSize: 12 }}>▶</div>
                )}
              </div>
            );
          })}
        </div>

        <SectionLabel text="DIFFICULTY" />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DIFFICULTIES.map((d, i) => {
            const selected = i === diffIndex;
            const chipColor = isJune ? (d.color === '#FF0080' ? '#E31B23' : d.color === '#7B2BFF' ? '#00843D' : d.color) : d.color;
            return (
              <div
                key={d.name}
                onClick={() => onSelectDiff(i)}
                style={{
                  flex: 1, minWidth: 62, textAlign: 'center', padding: '11px 6px', borderRadius: 14, cursor: 'pointer',
                  background: selected ? hexA(chipColor, 0.22) : 'rgba(255,255,255,.04)',
                  border: `1.5px solid ${selected ? chipColor : 'rgba(255,255,255,.1)'}`,
                  boxShadow: selected ? `0 0 18px ${hexA(chipColor, 0.45)}` : 'none',
                  transition: 'all .18s',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 12.5, letterSpacing: '.04em', color: selected ? '#fff' : chipColor }}>{d.name}</div>
                <div style={{ fontFamily: mono, fontSize: 10, marginTop: 3, color: 'rgba(255,255,255,.5)' }}>LV {d.level}</div>
              </div>
            );
          })}
        </div>

        {best > 0 && (
          <div style={{ textAlign: 'center', marginTop: 18, fontFamily: mono, fontSize: 11, letterSpacing: '.14em', color: bestColor }}>
            BEST · {best.toLocaleString()} · {song.title} {diff.name.toUpperCase()}
          </div>
        )}

        {isJune && (
          <div className="june-glow" style={{ textAlign: 'center', marginTop: 16, fontWeight: 800, fontSize: 14, letterSpacing: '.22em', color: '#FFD700' }}>
            ✊ FREEDOM DAY · JUNE 19TH ✊
          </div>
        )}

        <button
          onClick={onPlay}
          style={{ position: 'relative', overflow: 'hidden', marginTop: 20, width: '100%', textAlign: 'center', padding: 19, borderRadius: 18, cursor: 'pointer', fontWeight: 900, fontSize: 19, letterSpacing: '.22em', border: 'none', color: '#fff', background: playBtnGrad, boxShadow: playBtnShadow, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
        >
          <Play size={18} fill="#fff" /> {isJune ? '✊ PLAY' : 'PLAY'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 14, fontFamily: mono, fontSize: 10.5, letterSpacing: '.14em', color: 'rgba(255,255,255,.4)' }}>TAP THE LANES · OR KEYS D F J K</div>
      </div>
    </div>
  );
};

const SectionLabel: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '26px 0 14px' }}>
    <div style={{ fontSize: 12, letterSpacing: '.28em', fontWeight: 700, color: 'rgba(255,255,255,.55)' }}>{text}</div>
    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(255,255,255,.18),transparent)' }} />
  </div>
);

const Chip: React.FC<{ children: React.ReactNode; tone?: 'pink' | 'june' }> = ({ children, tone }) => (
  <span style={{
    fontFamily: mono, fontSize: 9.5, letterSpacing: '.08em', padding: '3px 7px', borderRadius: 6,
    background: tone === 'june' ? 'rgba(227,27,35,.14)' : tone === 'pink' ? 'rgba(255,0,128,.12)' : 'rgba(255,255,255,.07)',
    border: `1px solid ${tone === 'june' ? 'rgba(227,27,35,.28)' : tone === 'pink' ? 'rgba(255,0,128,.22)' : 'rgba(255,255,255,.1)'}`,
    color: tone === 'june' ? '#FFD700' : tone === 'pink' ? '#ff77b6' : 'rgba(255,255,255,.7)',
  }}>{children}</span>
);

function hexA(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export default TrapTapHome;
