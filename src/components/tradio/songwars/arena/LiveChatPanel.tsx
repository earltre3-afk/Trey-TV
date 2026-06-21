import React from 'react';
import { Pin, ShieldAlert, BadgeCheck } from 'lucide-react';
import { IMAGES } from '../../../../data/mockData';

const MESSAGES = [
  { user: 'TriibeFan23', text: 'Trey came in crazy 🔥', avatar: IMAGES.avatar, verified: true },
  { user: 'NovaRoom', text: 'Nova got that hook though', avatar: IMAGES.artist2 },
  { user: 'DJ Kai', text: 'This feels like a real event', avatar: IMAGES.artist3, mod: true },
  { user: 'Lena', text: 'Run that back!', avatar: IMAGES.artist4 },
  { user: 'TreyTV Admin', text: 'Song Wars going up', avatar: IMAGES.treyHero, mod: true },
];

export default function LiveChatPanel() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200">Live Chat</p>
        <button className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-bold text-white/50">
          <Pin className="h-3 w-3" /> Pin
        </button>
      </div>
      <div className="space-y-2 max-h-44 overflow-hidden">
        {MESSAGES.map((m, i) => (
          <div key={`${m.user}-${i}`} className="flex items-start gap-2 rounded-2xl bg-black/25 p-2">
            <img src={m.avatar} alt={m.user} className="h-7 w-7 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate text-[11px] font-bold text-white">
                {m.user}
                {m.verified && <BadgeCheck className="h-3 w-3 text-cyan-300" />}
                {m.mod && <span className="rounded-full bg-fuchsia-500/20 px-1.5 py-0.5 text-[8px] text-fuchsia-100">MOD</span>}
              </p>
              <p className="text-xs text-white/65">{m.text}</p>
            </div>
            <ShieldAlert className="mt-1 h-3.5 w-3.5 text-white/25" />
          </div>
        ))}
      </div>
    </div>
  );
}
