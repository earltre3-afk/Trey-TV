import React, { useState, useEffect } from 'react';
import {
  Clock,
  Mic2,
  Music,
  Phone,
  Volume2,
  Activity,
  Sliders,
  Zap,
  Radio,
  Users,
  Flame,
  MessageSquare,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { GlassCard, Chip, Waveform } from '../ui';
import { IMG, type RadioShow } from '../data';
import { toast } from 'sonner';

// ─── LIVE SHOW DIRECTOR CONSOLE ──────────────────────────
export const LiveShowConsole: React.FC<{
  show: RadioShow;
  onEndLive: () => void;
}> = ({ show, onEndLive }) => {
  const [elapsed, setElapsed] = useState('00:00');

  // Callers waitlist
  const [callers, setCallers] = useState([
    { id: 'c-1', name: 'DJ Noel (VIP)', text: 'Line 1 • Shouting out the studio beat loop', status: 'queued', avatar: IMG.noahKade },
    { id: 'c-2', name: 'TreyFan_99', text: 'Line 2 • Requesting "Midnight Velvet"', status: 'queued', avatar: IMG.jordan },
    { id: 'c-3', name: 'Mila Rain', text: 'Line 3 • Pitching new vocal stem', status: 'queued', avatar: IMG.milaRain },
  ]);
  const [activeCaller, setActiveCaller] = useState<any>(null);
  const [activeCallerVolume, setActiveCallerVolume] = useState(70);
  const [callerFilter, setCallerFilter] = useState<'none' | 'radio' | 'autotune'>('none');

  // Auto-Pitch / Vocal Correct (keeps host on key)
  const [autoPitch, setAutoPitch] = useState(true);
  const [vocalKey, setVocalKey] = useState('C# Minor');
  const [vocalStrength, setVocalStrength] = useState(85);

  // Active segments Timeline
  const [activeSegmentIdx, setActiveSegmentIdx] = useState(0);

  // Chat feeds
  const [chats, setChats] = useState<{ id: number; author: string; body: string }[]>([
    { id: 1, author: 'TrapSoulSis', body: 'This live set is absolute magic!' },
    { id: 2, author: 'Darius_Cole', body: 'The vocal corrections are so clean.' },
    { id: 3, author: 'JAYE.', body: 'Wait, is that Jordan on Line 1? 🔥' },
  ]);

  // Sound effects spike meters
  const [activeSFX, setActiveSFX] = useState<string | null>(null);
  const [vuLeft, setVuLeft] = useState([40, 50, 60, 45, 30, 20]);
  const [vuRight, setVuRight] = useState([35, 55, 65, 40, 25, 15]);

  // Master Levels
  const [micMuted, setMicMuted] = useState(false);
  const [masterVol, setMasterVol] = useState(85);
  const [bedVol, setBedVol] = useState(30);

  // Time counting & VU spikes
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => {
        const [mins, secs] = prev.split(':').map(Number);
        const total = mins * 60 + secs + 1;
        return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
      });

      // VU meter updates
      setVuLeft(Array.from({ length: 12 }, () => Math.floor(Math.random() * 45) + (activeSFX ? 50 : 25)));
      setVuRight(Array.from({ length: 12 }, () => Math.floor(Math.random() * 45) + (activeSFX ? 50 : 25)));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSFX]);

  // Chat simulator
  useEffect(() => {
    const timer = setInterval(() => {
      const users = ['Noel', 'Kiana', 'Zaylen', 'BeatManiac', 'TreyGroupie', 'LiveRider'];
      const comments = [
        'Holy cow! The sound effects are perfectly timed!',
        'Is that a caller on line? Let them speak!',
        'Host is staying perfectly on key! 🔥',
        'Loving the transition guides',
        'Unbelievable nighttime vibe in here.',
        'This is expensive-level broadcasting!'
      ];
      const author = users[Math.floor(Math.random() * users.length)];
      const body = comments[Math.floor(Math.random() * comments.length)];
      setChats((prev) => [{ id: Date.now(), author, body }, ...prev.slice(0, 10)]);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const triggerSFX = (sfx: string) => {
    setActiveSFX(sfx);
    setVuLeft(Array.from({ length: 12 }, () => Math.floor(Math.random() * 20) + 80));
    setVuRight(Array.from({ length: 12 }, () => Math.floor(Math.random() * 20) + 80));
    setChats((prev) => [
      { id: Date.now(), author: 'FX FEED', body: `Triggered SFX: [${sfx.toUpperCase()}] 🔊` },
      ...prev
    ]);
    setTimeout(() => setActiveSFX(null), 1000);
  };

  const handleTakeCaller = (callerId: string) => {
    const target = callers.find(c => c.id === callerId);
    if (!target) return;

    setActiveCaller({ ...target, status: 'on_air' });
    setCallers(callers.filter(c => c.id !== callerId));
    toast.success(`Caller ${target.name} is now ON AIR!`);

    setChats((prev) => [
      { id: Date.now(), author: 'SYSTEM', body: `🎙️ Accepted live call from @${target.name}` },
      ...prev
    ]);
  };

  const handleDisconnectCaller = () => {
    if (!activeCaller) return;
    toast.info(`Disconnected call with ${activeCaller.name}`);
    setActiveCaller(null);
  };

  const currentSegment = show.segments[activeSegmentIdx] || { title: 'Talk Break', type: 'host-talk', hostNotes: 'Vibe check.' };

  const getSegmentCues = (type: string) => {
    switch (type) {
      case 'intro':
        return [
          '🔴 Air check: Mic open. Introduce yourself and your custom station lane.',
          '🗣️ Talk prompt: Explain tonight\'s mood. Ask fans to submit request cards.',
          '🎯 Interactive: Open Line 1 and let fans know they can call in now.'
        ];
      case 'music-block':
        return [
          '🎧 Crossfade: Smooth beat overlay from Beat #1 to Beat #2.',
          '🔊 FX: Trigger Airhorn or Record Scratch on transition beat drops.',
          '📈 Monitor: Keep master level at 80-85% for crystal-clear headroom.'
        ];
      case 'host-talk':
        return [
          '🎙️ Mic on. Keep the scale locked to your voice key to stay perfectly pitch-corrected.',
          '🗣️ Take Caller: Check waitlist below. Take @DJ Noel on Line 1 to review beat packs.',
          '💬 Community check: Highlight best comments in the live reaction chat.'
        ];
      case 'fan-request':
        return [
          '🗳️ Requests: Open requests queue. Acknowledge top-voted songs.',
          '📞 Accept Line 2: Bring @TreyFan_99 on air to introduce their favorite track.',
          '🔄 Cue track: Transition to "Midnight Velvet" after caller wraps up.'
        ];
      case 'producer-spotlight':
        return [
          '⭐ Producer credits: Showcase stems, loops, and instrumental creators.',
          '🎛️ Stem mixing: Adjust loop levels individually. Invite fans to save beats.',
          '🗣️ Prompter: Shout out JAYE. for the heavy snare and bass loop.'
        ];
      case 'artist-premiere':
        return [
          '🔥 PREMIERE HOUR: Introduce SZA or Trey Trizzy new exclusive single.',
          '👥 Fan invite: Pin the pre-save link in live messenger chat.',
          '📈 Peak analytics: Ready air check. Spurt VU meters.'
        ];
      default:
        return [
          '🎙️ On-Air check: Stay on point. Watch your elapsed segment timer.',
          '🎚️ Master level: Keep mic level above audio bed. Cue next sequence item.'
        ];
    }
  };

  const segmentCues = getSegmentCues(currentSegment.type);

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-10 animate-fade-in">
      {/* Active Broadcast Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-red-500/10 border border-red-500/20 rounded-3xl p-5 shadow-[0_0_40px_rgba(239,68,68,0.15)] backdrop-blur-md gap-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
          </span>
          <div>
            <span className="block text-[9px] font-mono text-red-400 font-bold uppercase tracking-[0.3em] animate-pulse">BROADCAST ACTIVE</span>
            <h1 className="text-2xl font-black text-white mt-0.5">{show.title || 'Live Show'}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Chip label={`${elapsed} ON AIR`} icon={<Clock className="h-3.5 w-3.5" />} selected />
          <button
            onClick={onEndLive}
            className="rounded-full bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
          >
            <VolumeX className="h-4 w-4" /> END BROADCAST
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
        {/* LEFT COLUMN: ACTIVE SEGMENT, PROMPTERS & TIMELINE */}
        <div className="space-y-6">
          {/* Active Segment Panel */}
          <GlassCard glow className="p-6 border border-white/10 relative overflow-hidden">
            {activeSFX && (
              <div className="absolute inset-0 bg-fuchsia-500/5 backdrop-blur-[1px] pointer-events-none rounded-[2rem] border border-fuchsia-500/30 z-30 animate-pulse" />
            )}

            <div className="flex justify-between items-start pb-4 border-b border-white/5">
              <div>
                <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-widest">
                  SEGMENT {activeSegmentIdx + 1} OF {show.segments.length} • {currentSegment.type.toUpperCase()}
                </span>
                <h2 className="text-2xl font-black text-white mt-1">{currentSegment.title}</h2>
                {currentSegment.description && <p className="text-xs text-white/50 mt-1">{currentSegment.description}</p>}
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setActiveSegmentIdx(prev => Math.max(0, prev - 1))}
                  disabled={activeSegmentIdx === 0}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-2 hover:bg-white/[0.08] disabled:opacity-20 active:scale-95"
                >
                  ◀
                </button>
                <button
                  onClick={() => setActiveSegmentIdx(prev => Math.min(show.segments.length - 1, prev + 1))}
                  disabled={activeSegmentIdx === show.segments.length - 1}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-2 hover:bg-white/[0.08] disabled:opacity-20 active:scale-95"
                >
                  ▶
                </button>
              </div>
            </div>

            {/* AI HOST PROMPT & NOTES */}
            {currentSegment.hostNotes && (
              <div className="mt-5 bg-[#100B1A]/80 border border-purple-500/10 rounded-2xl p-4 relative overflow-hidden">
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[9px] font-mono text-cyan-300 font-bold uppercase tracking-wider">AI Host Prompting</span>
                </div>
                <div className="text-[9px] font-bold text-purple-300 uppercase tracking-widest font-mono">TELEPROMPTER NOTES</div>
                <p className="mt-3 text-sm italic leading-relaxed text-purple-100 font-medium">
                  "{currentSegment.hostNotes}"
                </p>
                <Waveform className="h-4 w-full opacity-35 mt-4" bars={36} color="from-cyan-300 to-purple-400" />
              </div>
            )}

            {/* SEGMENT SPECIFIC POINTS TO STAY ON POINT */}
            <div className="mt-5 space-y-3">
              <div className="text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-widest">SEGMENT CUES & DIRECTIVES</div>
              <div className="space-y-2.5">
                {segmentCues.map((cue, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-black">{idx + 1}</span>
                    <p className="text-xs text-white/80 leading-relaxed font-medium">{cue}</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* DUAL MASTER VU METERS & SLIDERS */}
          <div className="grid gap-4 md:grid-cols-2">
            <GlassCard className="p-5 border-white/5 space-y-4">
              <div className="text-[10px] font-mono text-purple-300 font-bold uppercase tracking-widest">Console VU Meters</div>
              <div className="flex gap-6 justify-center bg-black/40 p-4 rounded-2xl border border-white/5">
                <div className="flex gap-1 items-center">
                  <span className="text-xs font-mono text-white/40">L</span>
                  <div className="flex gap-[2px] items-end h-12 w-28">
                    {Array.from({ length: 16 }).map((_, idx) => {
                      const levelVal = (idx / 16) * 100;
                      const active = Math.max(...vuLeft) > levelVal;
                      let bg = 'bg-white/5';
                      if (active) {
                        if (levelVal > 80) bg = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
                        else if (levelVal > 60) bg = 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]';
                        else bg = 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]';
                      }
                      return <div key={idx} className={`w-[5px] h-10 rounded-[1px] ${bg} transition-all duration-150`} />;
                    })}
                  </div>
                </div>
                <div className="flex gap-1 items-center">
                  <span className="text-xs font-mono text-white/40">R</span>
                  <div className="flex gap-[2px] items-end h-12 w-28">
                    {Array.from({ length: 16 }).map((_, idx) => {
                      const levelVal = (idx / 16) * 100;
                      const active = Math.max(...vuRight) > levelVal;
                      let bg = 'bg-white/5';
                      if (active) {
                        if (levelVal > 80) bg = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
                        else if (levelVal > 60) bg = 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]';
                        else bg = 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]';
                      }
                      return <div key={idx} className={`w-[5px] h-10 rounded-[1px] ${bg} transition-all duration-150`} />;
                    })}
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-5 border-white/5 space-y-4">
              <div className="text-[10px] font-mono text-purple-300 font-bold uppercase tracking-widest">Master Mix Deck</div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-white/50 mb-1">
                    <span className="flex items-center gap-1"><Mic2 className="h-3.5 w-3.5 text-cyan-400" /> Host Mic</span>
                    <button onClick={() => setMicMuted(!micMuted)} className={`text-[10px] font-black rounded px-1.5 py-0.5 ${micMuted ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {micMuted ? 'MUTED' : 'LIVE'}
                    </button>
                  </div>
                  <input type="range" min="0" max="100" value={masterVol} onChange={(e) => setMasterVol(Number(e.target.value))} className="h-1.5 w-full cursor-pointer bg-white/10 rounded-full accent-cyan-400" />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-white/50 mb-1">
                    <span className="flex items-center gap-1"><Music className="h-3.5 w-3.5 text-purple-400" /> Audio Bed</span>
                    <span className="text-[10px] font-mono text-white/30">{bedVol}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={bedVol} onChange={(e) => setBedVol(Number(e.target.value))} className="h-1.5 w-full cursor-pointer bg-white/10 rounded-full accent-purple-400" />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* CALL QUEUE MANAGER: TAKE CALLERS ON AIR */}
          <GlassCard className="p-5 border-white/10 relative">
            <div className="mb-4 flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Phone className="h-4 w-4 text-cyan-400" /> Live Caller Dispatch Queue
              </h3>
              <span className="rounded-full bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 text-[9px] font-mono text-cyan-300 font-bold">
                {callers.length} LINES WAITING
              </span>
            </div>

            {/* Active On-Air Caller */}
            {activeCaller ? (
              <div className="mb-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between animate-scale-in gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={activeCaller.avatar} className="h-11 w-11 rounded-full object-cover border border-emerald-400/40" />
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border border-black animate-ping" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-white text-sm">{activeCaller.name}</span>
                      <span className="rounded bg-emerald-500/15 text-[8px] font-mono text-emerald-300 px-1 py-0.5 font-bold uppercase tracking-wider">ON AIR SIGNAL</span>
                    </div>
                    <p className="text-xs text-emerald-200 mt-1">{activeCaller.text}</p>
                    <div className="mt-1.5 flex items-center gap-1 text-[9px] font-mono text-emerald-300 font-bold uppercase">
                      <Sliders className="h-3 w-3" /> Voice Filter: <span className="underline">{callerFilter.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Filter selector */}
                  <div className="flex gap-1 bg-black/40 border border-white/5 p-1 rounded-xl text-[9px] font-mono font-bold">
                    {['none', 'radio', 'autotune'].map((f) => (
                      <button key={f} onClick={() => setCallerFilter(f as any)} className={`px-2 py-1 rounded-lg ${callerFilter === f ? 'bg-emerald-500/20 text-emerald-300' : 'text-white/40'}`}>
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleDisconnectCaller}
                    className="rounded-xl bg-red-500/15 border border-red-500/20 text-red-300 hover:bg-red-500/25 px-4 py-2 text-xs font-bold uppercase shrink-0"
                  >
                    DISCONNECT
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4 rounded-2xl border border-dashed border-white/10 py-5 text-center text-xs text-white/35">
                No active callers currently on the air layer. Accept a line from the waitlist below.
              </div>
            )}

            {/* Waitlist */}
            <div className="space-y-2">
              {callers.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                    <img src={c.avatar} className="h-9 w-9 rounded-lg object-cover border border-white/15" />
                    <div>
                      <div className="font-bold text-xs text-white">{c.name}</div>
                      <div className="text-[10px] text-white/55 mt-0.5">{c.text}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTakeCaller(c.id)}
                    className="rounded-xl bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/25 text-cyan-300 text-xs font-bold px-3.5 py-1.5 active:scale-95 transition"
                  >
                    Take Call
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* RIGHT COLUMN: AUTO-PITCH Correction, SOUNDBOARD, FAN REACTIONS */}
        <div className="space-y-6">
          {/* AUTO-PITCH CORRECTION & KEY ASSISTANT */}
          <GlassCard glow className="p-5 border border-cyan-400/20 bg-gradient-to-br from-[#0c1a2d]/30 to-transparent space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 border border-cyan-400/20">
                  <Activity className="h-5 w-5 text-cyan-300 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">Host Auto-Pitch Correction</h4>
                  <p className="text-[10px] text-white/45">Keep vocal commentary locked to the musical scale</p>
                </div>
              </div>
              <button
                onClick={() => setAutoPitch(!autoPitch)}
                className={`rounded-full px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider transition ${
                  autoPitch ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(34,211,238,0.4)]' : 'border border-white/10 text-white/40'
                }`}
              >
                {autoPitch ? 'Correcting' : 'Bypassed'}
              </button>
            </div>

            {autoPitch && (
              <div className="space-y-3 pt-3 border-t border-white/5 animate-scale-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-white/40 block mb-1">Lock To Scale</label>
                    <select
                      value={vocalKey}
                      onChange={(e) => setVocalKey(e.target.value)}
                      className="w-full text-xs font-bold text-white bg-black/40 border border-white/10 rounded-xl px-2.5 py-2 outline-none"
                    >
                      {['C# Minor', 'F# Major', 'A Major', 'G# Minor', 'D Minor', 'Pentatonic Blues'].map((k) => (
                        <option key={k} value={k}>{k.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-white/40 block mb-1">correction Strength</label>
                    <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5">
                      <Sliders className="h-4 w-4 text-cyan-400" />
                      <span className="text-xs font-mono font-bold text-white">{vocalStrength}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-white/40 mb-1">
                    <span>Correction mix curve</span>
                    <span>Razor Edge</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={vocalStrength}
                    onChange={(e) => setVocalStrength(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer bg-white/10 rounded-full accent-cyan-400"
                  />
                </div>
              </div>
            )}
          </GlassCard>

          {/* SOUND FX FXBOARD */}
          <GlassCard className="p-5 border-white/5">
            <div className="mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-fuchsia-400" />
              <span className="text-sm font-semibold text-white">Interactive FX Soundboard</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { sfx: "Airhorn", icon: <Radio className="h-4.5 w-4.5" /> },
                { sfx: "Scratch", icon: <Activity className="h-4.5 w-4.5" /> },
                { sfx: "Crowd Cheer", icon: <Users className="h-4.5 w-4.5" /> },
                { sfx: "Bass Drop", icon: <Flame className="h-4.5 w-4.5" /> },
                { sfx: "Reverb Out", icon: <Volume2 className="h-4.5 w-4.5" /> },
                { sfx: "AI Drop", icon: <Sparkles className="h-4.5 w-4.5" /> },
              ].map((item) => (
                <button
                  key={item.sfx}
                  onClick={() => triggerSFX(item.sfx)}
                  className="rounded-xl border border-white/5 bg-white/[0.03] p-3 flex flex-col items-center justify-center gap-1.5 text-center text-xs font-bold text-white/70 hover:text-white hover:bg-white/[0.08] hover:border-white/10 active:scale-95 transition-all shadow-inner"
                >
                  <div className="text-purple-300">{item.icon}</div>
                  <span className="truncate w-full text-[10px]">{item.sfx}</span>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* CHAT REACTION REAL TIME FEED */}
          <GlassCard className="p-5 border-white/5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-cyan-300" /> Real-time Listeners Feed
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto scrollbar-none flex flex-col gap-2">
              {chats.map((c) => (
                <div key={c.id} className="flex gap-2 text-xs">
                  <span className="font-bold text-cyan-300">@{c.author}:</span>
                  <span className="text-white/80 leading-normal">{c.body}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default LiveShowConsole;
