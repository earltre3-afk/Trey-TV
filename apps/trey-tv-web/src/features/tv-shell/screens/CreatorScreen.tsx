import React from 'react';
import { TVFrame } from '../components/TVFrame';
import { FocusButton } from '../components/Primitives';
import { ContentRow } from '../components/Rows';
import { featured, musicVideos, episodes, IMG } from '../mockData';
import { Plus, Crown, Bell, BadgeCheck, Instagram, Music, Twitter, Globe } from 'lucide-react';

export const CreatorScreen: React.FC = () => {
  return (
    <TVFrame activeRail="Browse">
      {/* Creator hero */}
      <section className="relative h-[440px] rounded-3xl overflow-hidden border border-fuchsia-500/30 mb-6 shadow-[0_0_60px_rgba(168,85,247,0.2)]">
        <img src={IMG(0)} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <span className="absolute top-5 right-5 px-3 py-1.5 rounded-md bg-amber-400 text-black text-xs font-black">4K ULTRA HD</span>

        <div className="relative grid grid-cols-2 h-full">
          <div className="flex flex-col justify-center px-10">
            <div className="text-fuchsia-300 font-bold tracking-[0.3em] text-sm">CREATOR CHANNEL</div>
            <div className="flex items-center gap-3 mt-2">
              <h1 className="text-6xl font-black">Trey Trizzy</h1>
              <BadgeCheck className="w-9 h-9 text-fuchsia-400" />
            </div>
            <p className="text-lg text-white/85 mt-1 font-semibold">Artist. Creator. Entrepreneur. Built Different.</p>
            <p className="text-sm text-white/65 mt-2 max-w-md">Welcome to the official channel of Trey Trizzy – exclusive content, music videos, behind-the-scenes, live streams, and more.</p>

            <div className="mt-5 flex items-center gap-3">
              <FocusButton variant="primary" icon={<Plus className="w-5 h-5" />} autoFocus>Follow</FocusButton>
              <FocusButton variant="gold" icon={<Crown className="w-5 h-5" />}>Subscribe</FocusButton>
              <FocusButton variant="ghost" icon={<Bell className="w-5 h-5" />} className="!px-4" />
            </div>

            <div className="mt-6 grid grid-cols-4 gap-6 max-w-lg">
              {[
                { n: '1.2M', l: 'Followers' },
                { n: '128', l: 'Videos' },
                { n: '24.8M', l: 'Views' },
                { n: '5.4M', l: 'Monthly Views' },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-black bg-gradient-to-r from-fuchsia-400 to-purple-500 bg-clip-text text-transparent">{s.n}</div>
                  <div className="text-xs text-white/60">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute bottom-4 right-6 flex items-center gap-3">
              {[Instagram, Music, Twitter, Globe].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center outline-none focus:border-fuchsia-400 focus:shadow-[0_0_18px_rgba(255,43,214,0.6)]">
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ContentRow title="Featured Series" items={featured} size="md" />
      <ContentRow title="Music Videos" items={musicVideos} size="sm" />
      <ContentRow title="Live Replays" items={episodes.slice(0, 4)} size="md" />

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-3">Playlists</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { t: 'Trey Trizzy Essentials', c: '25 Videos' },
            { t: 'Hype Hits', c: '18 Videos' },
            { t: 'Behind The Scenes', c: '14 Videos' },
            { t: 'Live Sets', c: '9 Videos' },
          ].map((p, i) => (
            <button key={p.t} className="group relative h-32 rounded-2xl overflow-hidden border border-white/10 bg-white/5 outline-none focus:border-fuchsia-400 focus:shadow-[0_0_28px_rgba(255,43,214,0.55)] focus:scale-[1.04] transition-all">
              <img src={IMG(i + 2)} className="absolute inset-0 w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <div className="absolute bottom-3 left-3 text-left">
                <div className="font-bold">{p.t}</div>
                <div className="text-xs text-white/60">{p.c}</div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </TVFrame>
  );
};
