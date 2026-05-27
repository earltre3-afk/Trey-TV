import React from 'react';
import { TreyLogo } from '../components/Logo';
import { GlassPanel } from '../components/Primitives';
import { Smartphone, Monitor, User, Tv, Gem, Cloud, Shield, Loader2 } from 'lucide-react';
import { useTV } from '../TVContext';

// Replace QR with real one from /api/tv/device/start
const QR_PLACEHOLDER =
  'https://api.qrserver.com/v1/create-qr-code/?size=300x300&bgcolor=000000&color=FF2BD6&data=https://tv.treytrizzy.com/activate?code=X9M2K7B4';

export const ActivationScreen: React.FC = () => {
  const { navigate } = useTV();
  return (
    <div className="relative min-h-screen w-full bg-[#05050A] text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/3 w-[700px] h-[700px] rounded-full bg-fuchsia-700/20 blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-purple-700/20 blur-[160px]" />
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-10 px-16 py-14 max-w-[1600px] mx-auto">
        {/* Left: logo */}
        <div className="flex flex-col justify-center">
          <TreyLogo size="xl" className="!h-48" />
          <h1 className="mt-10 text-6xl font-black leading-tight">
            Activate Your <span className="bg-gradient-to-r from-fuchsia-400 to-purple-500 bg-clip-text text-transparent">Device</span>
          </h1>
          <p className="mt-4 text-xl text-white/70">Unlock the full Trey TV experience.</p>
        </div>

        {/* Right: code card */}
        <GlassPanel className="p-10">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2"><Smartphone className="w-5 h-5 text-fuchsia-400" /><div className="text-xl font-bold">Scan to Activate</div></div>
              <p className="text-sm text-white/65 mb-4">Open your phone camera <u>and</u> scan this QR code</p>
              <div className="relative w-[260px] h-[260px] rounded-2xl border-2 border-fuchsia-400/70 shadow-[0_0_36px_rgba(255,43,214,0.5)] overflow-hidden bg-white">
                <img src={QR_PLACEHOLDER} alt="QR" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="border-l border-white/10 pl-8">
              <div className="flex items-center gap-2 mb-2"><Monitor className="w-5 h-5 text-fuchsia-400" /><div className="text-xl font-bold">Enter Code on Web</div></div>
              <p className="text-sm text-white/65 mb-4">
                Visit <span className="text-fuchsia-300">tv.treytrizzy.com/tv/activate</span> and enter this code
              </p>
              <div className="rounded-2xl border border-fuchsia-500/40 bg-black/50 px-6 py-7 text-center shadow-[0_0_30px_rgba(255,43,214,0.3)_inset]">
                <div className="text-5xl font-black tracking-[0.2em] bg-gradient-to-r from-white to-fuchsia-200 bg-clip-text text-transparent">
                  X9 M2 K7 B4
                </div>
              </div>
              <div className="mt-4 text-sm text-white/65 text-center">
                Code expires in <span className="text-fuchsia-300 font-bold">14:55</span>
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Status bar */}
        <GlassPanel className="col-span-2 p-6 flex items-center gap-5">
          <Loader2 className="w-10 h-10 text-fuchsia-400 animate-spin" />
          <div>
            <div className="text-xl font-bold">Waiting for approval</div>
            <div className="text-sm text-white/60">Don't see your activation? Check your internet connection or try again in a moment.</div>
          </div>
          <button onClick={() => navigate('home')} className="ml-auto px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-fuchsia-400 focus:shadow-[0_0_20px_rgba(255,43,214,0.5)]">
            Skip (Demo) →
          </button>
        </GlassPanel>

        {/* Benefits */}
        <GlassPanel className="col-span-2 p-8">
          <div className="text-lg font-bold mb-5">Signing in gets you <span className="text-fuchsia-300">more</span></div>
          <div className="grid grid-cols-4 gap-6">
            {[
              { Icon: User, t: 'Personalized for You', d: "Get recommendations you'll love." },
              { Icon: Tv, t: 'Watch Anywhere', d: 'Pick up where you left off on any device.' },
              { Icon: Gem, t: 'Premium Access', d: 'Unlock exclusive content and early releases.' },
              { Icon: Cloud, t: 'Your Watchlist', d: 'Save favorites and never lose track.' },
            ].map((b) => (
              <div key={b.t} className="flex items-start gap-3">
                <b.Icon className="w-8 h-8 text-fuchsia-400 shrink-0" />
                <div>
                  <div className="font-bold">{b.t}</div>
                  <div className="text-sm text-white/65">{b.d}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        <div className="col-span-2 flex items-center justify-between text-sm text-white/60">
          <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Secure. Private. Always Yours. Your data is protected and never shared.</div>
          <div>Need help? Visit <span className="text-fuchsia-300">tv.treytrizzy.com/help</span></div>
        </div>
      </div>
    </div>
  );
};
