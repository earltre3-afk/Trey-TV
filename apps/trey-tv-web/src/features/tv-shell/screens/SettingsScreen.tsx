import React, { useState } from 'react';
import { TVFrame } from '../components/TVFrame';
import { GlassPanel, FocusButton } from '../components/Primitives';
import { User, Tv, Play, Subtitles, Lock, Shield, LogOut, Info, Activity, ChevronRight } from 'lucide-react';

const sections = [
  { id: 'account', label: 'Account', Icon: User, desc: 'Sign-in, devices, subscription.' },
  { id: 'device', label: 'Device', Icon: Tv, desc: 'Display, audio output, performance.' },
  { id: 'playback', label: 'Playback', Icon: Play, desc: 'Auto-play, video quality, data usage.' },
  { id: 'captions', label: 'Captions & Audio', Icon: Subtitles, desc: 'Subtitle style, language.' },
  { id: 'privacy', label: 'Privacy', Icon: Shield, desc: 'Data sharing, ad preferences.' },
  { id: 'parental', label: 'Parental Controls', Icon: Lock, desc: 'PIN, maturity, kids profile.' },
  { id: 'diagnostics', label: 'Diagnostics', Icon: Activity, desc: 'Network, logs, support tools.' },
  { id: 'about', label: 'About Trey TV', Icon: Info, desc: 'App version, terms, credits.' },
];

export const SettingsScreen: React.FC = () => {
  const [sel, setSel] = useState('account');
  return (
    <TVFrame activeRail="Home">
      <h1 className="text-4xl font-black mb-1">Settings</h1>
      <p className="text-white/60 text-sm mb-6">Configure your Trey TV experience.</p>
      <div className="grid grid-cols-[360px_1fr] gap-5">
        <GlassPanel className="p-3">
          <div className="space-y-1.5">
            {sections.map((s) => {
              const active = sel === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSel(s.id)}
                  className={
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left outline-none transition-all ' +
                    (active
                      ? 'bg-gradient-to-br from-fuchsia-600/25 to-purple-700/25 border border-fuchsia-400/60 shadow-[0_0_20px_rgba(255,43,214,0.45)]'
                      : 'border border-transparent hover:bg-white/5 focus:border-fuchsia-400 focus:bg-white/5')
                  }
                >
                  <s.Icon className="w-5 h-5 text-fuchsia-300" />
                  <div className="flex-1">
                    <div className="font-bold">{s.label}</div>
                    <div className="text-[11px] text-white/55">{s.desc}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </button>
              );
            })}
            <button className="mt-3 w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-400/40 text-red-300 outline-none focus:bg-red-500/10 focus:shadow-[0_0_18px_rgba(248,113,113,0.5)]">
              <LogOut className="w-5 h-5" />
              <span className="font-bold">Sign Out</span>
            </button>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <h2 className="text-2xl font-black mb-4">Account</h2>
          <div className="space-y-3">
            {[
              { k: 'Signed in as', v: 'Trey Trizzy' },
              { k: 'Email', v: 'trizzy@treytv.com' },
              { k: 'Plan', v: 'Premium · Annual' },
              { k: 'Device', v: 'Chromecast with Google TV (Living Room)' },
              { k: 'App Version', v: '1.0.0 (TV-Shell)' },
              { k: 'Region', v: 'United States' },
            ].map((r) => (
              <div key={r.k} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-sm text-white/60">{r.k}</div>
                <div className="font-bold">{r.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <FocusButton variant="primary" autoFocus>Manage Subscription</FocusButton>
            <FocusButton variant="ghost">Switch Profile</FocusButton>
          </div>
        </GlassPanel>
      </div>
    </TVFrame>
  );
};
