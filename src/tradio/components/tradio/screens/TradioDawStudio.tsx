import React from 'react';
import {
  Activity,
  Bot,
  Cable,
  Drum,
  FileArchive,
  Gauge,
  Headphones,
  Mic2,
  Music2,
  Piano,
  Radio,
  Sliders,
  Sparkles,
  UploadCloud,
  Wand2,
  Waves,
  Zap,
} from 'lucide-react';
import { GlassCard, PrimaryButton, SecondaryButton, Waveform } from '../ui';

const transportStats = [
  ['BPM', '92'],
  ['KEY', 'C min'],
  ['SIG', '4/4'],
  ['SNAP', '1/16'],
];

const timelineTracks = [
  { name: 'Lead Vocal', type: 'Lead', color: 'from-emerald-300 to-cyan-300', width: '72%', clips: ['Verse Lead', 'Hook Lead'] },
  { name: 'Backing Vocals', type: 'BVs', color: 'from-fuchsia-300 to-purple-400', width: '58%', clips: ['Stack A', 'Stack B'] },
  { name: 'Drums', type: 'Beat', color: 'from-orange-300 to-pink-400', width: '86%', clips: ['808 + Drums'] },
  { name: 'Bass', type: 'Low', color: 'from-lime-300 to-emerald-400', width: '64%', clips: ['Sub Bass'] },
  { name: 'Instrumental', type: 'Music', color: 'from-sky-300 to-indigo-400', width: '78%', clips: ['Keys', 'Pad'] },
];

const studioTools = [
  { title: 'AI Copilot', sub: 'Session health, clipping warnings, and mix moves.', Icon: Bot, state: 'Ready' },
  { title: 'Stem Splitter', sub: 'Lead, BVs, drums, bass, instrumental, and other.', Icon: Wand2, state: 'Backend needed' },
  { title: 'Vocal Isolator', sub: 'Strength, cleanup, bleed reduction, before/after preview.', Icon: Mic2, state: 'Ready shell' },
  { title: 'FX Rack', sub: 'EQ, compression, limiter, reverb, delay, gate, saturation.', Icon: Sliders, state: 'Ready shell' },
  { title: 'Bus Routing', sub: 'Inputs, sends, buses, main out, and routing visualizer.', Icon: Cable, state: 'Ready shell' },
  { title: 'Export & Master', sub: 'Master WAV, MP3, stems ZIP, and send to Tradio Radio.', Icon: FileArchive, state: 'Needs export hook' },
  { title: 'Record', sub: 'Arm track, capture takes, save vocals into the session.', Icon: Headphones, state: 'Needs audio hook' },
  { title: 'Piano Roll', sub: 'Key/scale grid and touch-friendly note placement.', Icon: Piano, state: 'Ready shell' },
  { title: 'Drum Machine', sub: '16-step sequencer, BPM sync, mute/solo per sound.', Icon: Drum, state: 'Ready shell' },
  { title: 'Tradio Radio', sub: 'Send the current mix to live broadcast or station queue.', Icon: Radio, state: 'Needs radio hook' },
];

const mixerChannels = [
  { name: 'Lead', level: '71%', pan: 'C', color: 'bg-emerald-300' },
  { name: 'BVs', level: '58%', pan: 'L12', color: 'bg-fuchsia-300' },
  { name: 'Drums', level: '82%', pan: 'C', color: 'bg-orange-300' },
  { name: 'Bass', level: '66%', pan: 'C', color: 'bg-lime-300' },
  { name: 'Music', level: '74%', pan: 'R8', color: 'bg-sky-300' },
  { name: 'Master', level: '69%', pan: 'Out', color: 'bg-purple-300' },
];

const progressItems = ['Import stems', 'Detect lead vocal', 'Run AI analysis', 'Apply FX rack', 'Render mix'];

const ToolBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/55">
    {children}
  </span>
);

const NeonPanel = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_18px_50px_rgba(0,0,0,.35)] backdrop-blur-2xl ${className}`}>
    {children}
  </div>
);

const PanelTitle = ({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) => (
  <div className="mb-3 flex items-start gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200 shadow-[0_0_24px_rgba(16,185,129,.18)]">
      {icon}
    </div>
    <div className="min-w-0">
      <div className="text-sm font-black uppercase tracking-[0.16em] text-white">{title}</div>
      {sub && <div className="mt-1 text-xs leading-relaxed text-white/50">{sub}</div>}
    </div>
  </div>
);

export const TradioDawStudio: React.FC = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-10">
      <GlassCard glow className="overflow-hidden p-0">
        <div className="relative overflow-hidden rounded-3xl bg-[radial-gradient(70%_55%_at_20%_0%,rgba(47,227,154,.16),transparent_65%),radial-gradient(70%_55%_at_100%_15%,rgba(147,97,253,.22),transparent_70%),linear-gradient(180deg,#0b1020_0%,#070912_52%,#05060b_100%)]">
          <div className="pointer-events-none absolute inset-0 opacity-70 [background:linear-gradient(110deg,transparent,rgba(255,255,255,.07),transparent)]" />
          <div className="relative p-4 sm:p-5 lg:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <ToolBadge>Tradio DAW</ToolBadge>
                  <ToolBadge>Liquid Neon Studio</ToolBadge>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,.9)]" /> Saved
                  </span>
                </div>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">Tradio Studio DAW</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/60">
                  A premium music-studio surface for Trey TV with timeline editing, stem tools, AI Copilot, mixer, routing, FX, export, record, piano roll, drums, samples, visualizer, and Tradio Radio handoff.
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2 rounded-3xl border border-white/10 bg-black/25 p-2">
                {transportStats.map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.045] px-3 py-2 text-center">
                    <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/35">{label}</div>
                    <div className="mt-1 text-sm font-black text-white">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 2xl:grid-cols-[220px_minmax(0,1fr)_310px]">
              <NeonPanel className="hidden 2xl:block">
                <PanelTitle icon={<Music2 className="h-4 w-4" />} title="Library" sub="Session sources" />
                <div className="space-y-2">
                  {['Cloud Stems', 'My Projects', 'Samples', 'Loops', 'Presets', 'Tradio Radio'].map((item) => (
                    <button key={item} className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-2 text-left text-xs font-bold text-white/70 transition hover:border-emerald-300/30 hover:text-white">
                      {item}<Zap className="h-3.5 w-3.5 text-emerald-300/70" />
                    </button>
                  ))}
                </div>
              </NeonPanel>

              <NeonPanel className="min-w-0">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200/80">Timeline</div>
                    <div className="text-sm text-white/45">Lead vocal-centered arrangement with stem lanes and phrase-safe editing.</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <SecondaryButton className="px-4 py-2 text-[10px]">Import Stem</SecondaryButton>
                    <PrimaryButton className="px-4 py-2 text-[10px]">Add Track</PrimaryButton>
                  </div>
                </div>
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/25">
                  <div className="grid grid-cols-[110px_1fr] border-b border-white/10 bg-white/[0.035] text-[10px] font-black uppercase tracking-[0.14em] text-white/35 sm:grid-cols-[145px_1fr]">
                    <div className="px-3 py-2">Tracks</div>
                    <div className="grid grid-cols-8 gap-px px-2 py-2">
                      {Array.from({ length: 8 }).map((_, index) => <span key={index}>B{index + 1}</span>)}
                    </div>
                  </div>
                  {timelineTracks.map((track) => (
                    <div key={track.name} className="grid min-h-[62px] grid-cols-[110px_1fr] border-b border-white/[0.045] last:border-b-0 sm:grid-cols-[145px_1fr]">
                      <div className="flex flex-col justify-center border-r border-white/[0.06] px-3">
                        <div className="truncate text-xs font-black text-white">{track.name}</div>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-white/45">
                          <span className="rounded border border-white/10 px-1.5 py-0.5">M</span>
                          <span className="rounded border border-white/10 px-1.5 py-0.5">S</span>
                          <span>{track.type}</span>
                        </div>
                      </div>
                      <div className="relative px-2 py-3">
                        <div className="absolute inset-y-0 left-[12%] w-px bg-white/[0.05]" />
                        <div className="absolute inset-y-0 left-[25%] w-px bg-white/[0.05]" />
                        <div className="absolute inset-y-0 left-[38%] w-px bg-white/[0.05]" />
                        <div className="absolute inset-y-0 left-[51%] w-px bg-white/[0.05]" />
                        <div className="absolute inset-y-0 left-[64%] w-px bg-white/[0.05]" />
                        <div className={`relative h-10 rounded-xl border border-white/10 bg-gradient-to-r ${track.color} p-1 shadow-[0_0_28px_rgba(56,189,248,.12)]`} style={{ width: track.width }}>
                          <div className="flex h-full items-center justify-between gap-2 rounded-lg bg-black/20 px-2">
                            <Waveform className="h-5 flex-1" bars={26} color={track.color} />
                            <span className="hidden text-[10px] font-black text-black/70 sm:inline">{track.clips[0]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </NeonPanel>

              <NeonPanel>
                <PanelTitle icon={<Bot className="h-4 w-4" />} title="AI Copilot" sub="Live session assistant" />
                <div className="space-y-3">
                  {[
                    ['Headroom', '-6.2 dB', 'Safe'],
                    ['Lead Vocal', 'Center', 'Locked'],
                    ['Export', 'Master + stems', 'Ready shell'],
                  ].map(([label, value, status]) => (
                    <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.035] p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/45">{label}</span>
                        <span className="font-black text-emerald-200">{status}</span>
                      </div>
                      <div className="mt-1 text-sm font-black text-white">{value}</div>
                    </div>
                  ))}
                  <div className="rounded-2xl border border-purple-300/20 bg-purple-500/10 p-3 text-xs leading-relaxed text-white/60">
                    Copilot controls are visible now. Heavy audio analysis, stem separation, and export wiring should connect to existing backend jobs next.
                  </div>
                </div>
              </NeonPanel>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <NeonPanel>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <PanelTitle icon={<Sliders className="h-4 w-4" />} title="Mixer + Bus Routing" sub="Touch-friendly channel strips" />
                  <ToolBadge>Main Out</ToolBadge>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {mixerChannels.map((channel) => (
                    <div key={channel.name} className="min-w-[96px] rounded-3xl border border-white/10 bg-black/25 p-3 text-center">
                      <div className="text-xs font-black text-white">{channel.name}</div>
                      <div className="mt-1 text-[10px] text-white/40">Pan {channel.pan}</div>
                      <div className="mx-auto mt-3 flex h-36 w-9 items-end justify-center rounded-xl border border-white/10 bg-white/[0.035] p-1">
                        <div className={`w-full rounded-lg ${channel.color} shadow-[0_0_20px_rgba(255,255,255,.16)]`} style={{ height: channel.level }} />
                      </div>
                      <div className="mt-3 flex justify-center gap-1.5">
                        <span className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-black text-white/50">M</span>
                        <span className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-black text-white/50">S</span>
                      </div>
                    </div>
                  ))}
                </div>
              </NeonPanel>

              <NeonPanel>
                <PanelTitle icon={<Activity className="h-4 w-4" />} title="Project Progress" sub="Production checklist" />
                <div className="space-y-2">
                  {progressItems.map((item, index) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-white/65">
                      <span className={`h-2.5 w-2.5 rounded-full ${index < 2 ? 'bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,.8)]' : 'bg-white/20'}`} />
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-purple-300" />
                </div>
              </NeonPanel>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {studioTools.map(({ title, sub, Icon, state }) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-emerald-300/25 hover:bg-emerald-300/[0.04]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/10 text-purple-100">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="rounded-full border border-white/10 bg-black/25 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/40">{state}</span>
                  </div>
                  <div className="mt-3 text-sm font-black text-white">{title}</div>
                  <p className="mt-1 text-xs leading-relaxed text-white/50">{sub}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <NeonPanel>
                <PanelTitle icon={<Gauge className="h-4 w-4" />} title="FX Rack" sub="Selected channel" />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['EQ', 'Compressor', 'Limiter', 'Saturation', 'Noise Gate', 'Delay'].map((fx) => (
                    <div key={fx} className="rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-2 text-white/60">{fx}</div>
                  ))}
                </div>
              </NeonPanel>
              <NeonPanel>
                <PanelTitle icon={<Waves className="h-4 w-4" />} title="Visualizer" sub="Live waveform energy" />
                <div className="flex h-24 items-center justify-center rounded-3xl border border-white/8 bg-black/25 px-4">
                  <Waveform className="h-16 w-full" bars={42} color="from-emerald-300 to-purple-300" />
                </div>
              </NeonPanel>
              <NeonPanel>
                <PanelTitle icon={<UploadCloud className="h-4 w-4" />} title="Export + Master" sub="Honest wiring status" />
                <div className="space-y-2">
                  <PrimaryButton className="w-full py-3 text-[10px]">Export Master</PrimaryButton>
                  <SecondaryButton className="w-full py-3 text-[10px]">Export Stems ZIP</SecondaryButton>
                  <SecondaryButton className="w-full py-3 text-[10px]">Send To Tradio Radio</SecondaryButton>
                </div>
              </NeonPanel>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default TradioDawStudio;
