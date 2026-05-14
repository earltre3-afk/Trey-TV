import React from 'react';
import { SUIT_DISPLAY, Suit } from '@/features/games/lib/cards/cardManifest';
import { X } from 'lucide-react';

export const SuitLegendModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  if (!open) return null;
  const suits: Suit[] = ['spades','hearts','diamonds','clubs'];
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-3xl p-6 border"
        style={{ background: 'linear-gradient(160deg,#08111F,#05070D)', borderColor: 'rgba(0,183,255,0.3)', boxShadow: '0 0 60px rgba(0,183,255,0.25)' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
        <h2 className="text-2xl font-bold text-white mb-1">Suit Legend</h2>
        <p className="text-sm text-slate-400 mb-5">Trey TV custom suits map directly to classic gameplay.</p>
        <div className="space-y-3">
          {suits.map(s => {
            const m = SUIT_DISPLAY[s];
            return (
              <div key={s} className="flex items-center gap-4 rounded-2xl p-3 border" style={{ background: 'rgba(16,24,39,0.6)', borderColor: m.color + '40' }}>
                <span className="text-4xl" style={{ color: m.color, textShadow: `0 0 12px ${m.glow}` }}>{m.symbol}</span>
                <div className="flex-1">
                  <div className="text-white font-semibold">{m.name}</div>
                  <div className="text-xs text-slate-400">{m.gameplay}</div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-500 mt-5">Blades is trump in Spades. All rules follow standard card-game logic.</p>
      </div>
    </div>
  );
};
