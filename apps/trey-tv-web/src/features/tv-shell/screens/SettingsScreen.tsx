import React, { useState } from 'react';
import { TVFrame } from '../components/TVFrame';
import { GlassPanel, FocusButton } from '../components/Primitives';
import {
  Activity,
  ChevronRight,
  Headphones,
  Info,
  Lock,
  Play,
  Shield,
  Subtitles,
  Tv,
  User,
} from 'lucide-react';
import { profile } from '../mockData';

type SettingsSectionId =
  | 'account'
  | 'device'
  | 'playback'
  | 'captions'
  | 'audio'
  | 'privacy'
  | 'parental'
  | 'diagnostics'
  | 'about';

const sections: { id: SettingsSectionId; label: string; Icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { id: 'account', label: 'Account', Icon: User, desc: 'Session, profile, sign-in.' },
  { id: 'device', label: 'Device', Icon: Tv, desc: 'App version and device info.' },
  { id: 'playback', label: 'Playback', Icon: Play, desc: 'Autoplay and stream quality.' },
  { id: 'captions', label: 'Captions', Icon: Subtitles, desc: 'Subtitle visibility and style.' },
  { id: 'audio', label: 'Audio', Icon: Headphones, desc: 'Language and output.' },
  { id: 'privacy', label: 'Privacy', Icon: Shield, desc: 'Data and session controls.' },
  { id: 'parental', label: 'Parental Controls', Icon: Lock, desc: 'PIN and family controls.' },
  { id: 'diagnostics', label: 'Diagnostics', Icon: Activity, desc: 'Build and service status.' },
  { id: 'about', label: 'About Trey', Icon: Info, desc: 'Package and app info.' },
];

const rowsBySection: Record<SettingsSectionId, { k: string; v: string }[]> = {
  account: [
    { k: 'Signed in as', v: profile.name },
    { k: 'Session', v: 'Demo TV shell session' },
    { k: 'Plan', v: profile.premium ? 'Premium preview' : 'Guest' },
  ],
  device: [
    { k: 'App version', v: '0.2.0-debug' },
    { k: 'Device class', v: 'Android TV / WebView shell' },
    { k: 'Input', v: 'D-pad and keyboard remote' },
  ],
  playback: [
    { k: 'Autoplay previews', v: 'Off in debug build' },
    { k: 'Default quality', v: 'Auto' },
    { k: 'Watch progress sync', v: 'Placeholder only' },
  ],
  captions: [
    { k: 'Captions', v: 'Off' },
    { k: 'Caption style', v: 'Trey TV high contrast' },
    { k: 'Language', v: 'English' },
  ],
  audio: [
    { k: 'Audio language', v: 'Default' },
    { k: 'Output mode', v: 'TV audio' },
    { k: 'Spatial audio', v: 'Coming Soon' },
  ],
  privacy: [
    { k: 'Data mode', v: 'Debug shell, no payment flow' },
    { k: 'Session storage', v: 'Local device only' },
    { k: 'Revoke access', v: 'Use Sign Out when connected' },
  ],
  parental: [
    { k: 'Status', v: 'Coming Soon' },
    { k: 'PIN controls', v: 'Not enabled in debug build' },
    { k: 'Maturity filters', v: 'Placeholder' },
  ],
  diagnostics: [
    { k: 'Build', v: 'Trey TV APK 4H.8' },
    { k: 'Visual shell', v: 'upgraded-tv-web' },
    { k: 'Build stamp', v: '2026-05-27 23:25 (pass 4H.8)' },
    { k: 'Build type', v: 'Debug APK' },
    { k: 'Package id', v: 'com.treytv.streamingbox' },
    { k: 'Free TV source', v: 'Fallback if API route is unavailable' },
  ],
  about: [
    { k: 'App', v: 'Trey TV Streaming Box' },
    { k: 'Package id', v: 'com.treytv.streamingbox' },
    { k: 'Production status', v: 'Debug build, not production-ready' },
  ],
};

export const SettingsScreen: React.FC = () => {
  const [sel, setSel] = useState<SettingsSectionId>('account');
  const selected = sections.find((section) => section.id === sel) ?? sections[0];

  return (
    <TVFrame activeRail="Settings">
      <h1 className="text-4xl font-black mb-1">Settings</h1>
      <p className="text-white/60 text-sm mb-6">Configure your Trey TV experience.</p>
      <div className="grid grid-cols-[360px_1fr] gap-5">
        <GlassPanel className="p-3">
          <div className="space-y-1.5">
            {sections.map((s, index) => {
              const active = sel === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSel(s.id)}
                  autoFocus={index === 0}
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
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <selected.Icon className="w-7 h-7 text-fuchsia-300" />
            <h2 className="text-2xl font-black">{selected.label}</h2>
          </div>
          <div className="space-y-3">
            {rowsBySection[sel].map((r) => (
              <div key={r.k} className="flex items-center justify-between gap-5 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-sm text-white/60">{r.k}</div>
                <div className="font-bold text-right">{r.v}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {sel === 'account' && (
              <>
                <FocusButton variant="primary">Switch Profile</FocusButton>
                <FocusButton variant="ghost">Sign In</FocusButton>
              </>
            )}
            {sel === 'diagnostics' && (
              <>
                <FocusButton variant="primary">Run Connection Check</FocusButton>
                <FocusButton variant="ghost">Reload Shell</FocusButton>
              </>
            )}
            {sel !== 'account' && sel !== 'diagnostics' && (
              <FocusButton variant="ghost">Save Placeholder Setting</FocusButton>
            )}
          </div>
        </GlassPanel>
      </div>
    </TVFrame>
  );
};
