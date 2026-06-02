import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Clock,
  Mic2,
  Music,
  Phone,
  Volume2,
  Zap,
  Radio,
  Users,
  Flame,
  MessageSquare,
  VolumeX,
  Sparkles,
  SkipForward,
  Timer,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { GlassCard, Chip, Waveform } from '../ui';
import { IMG, type RadioShow } from '../data';
import { toast } from 'sonner';
import type { LiveRoomState } from '../useTradioLiveRoom';
import type { LiveInteraction } from '../useTradioLiveInteraction';
import type { CallRequest } from '../tradioCallerService';
import { SFX_ASSETS, BED_ASSETS } from '@/lib/tradio/sfxAssets';
import { useShowRundown } from '../useShowRundown';
import { createBrowserClient } from '@/lib/supabase-browser';

// ─── LIVE SHOW DIRECTOR CONSOLE ──────────────────────────
export const LiveShowConsole: React.FC<{
  show: RadioShow;
  live: LiveRoomState;
  interaction: LiveInteraction;
  callers: CallRequest[];
  sessionId: string | null;
  onEndLive: () => void;
}> = ({ show, live, interaction, callers, sessionId, onEndLive }) => {
  const [elapsed, setElapsed] = useState('00:00');

  // Local system/FX notices (merged above real chat)
  const [notices, setNotices] = useState<{ id: number; author: string; body: string }[]>([]);

  // Peak listener tracker
  const [peakListeners, setPeakListeners] = useState(0);
  useEffect(() => {
    setPeakListeners(p => Math.max(p, live.listenerCount));
  }, [live.listenerCount]);

  // VU meter levels driven from the real analyser
  const [vuLeft, setVuLeft] = useState<number[]>(Array(12).fill(0));
  const [vuRight, setVuRight] = useState<number[]>(Array(12).fill(0));

  // Master Levels (local UI values, synced to mix)
  const [masterVol, setMasterVol] = useState(85);
  const [bedVol, setBedVol] = useState(30);

  // SFX flash indicator
  const [activeSFX, setActiveSFX] = useState<string | null>(null);

  // Wall clock elapsed
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => {
        const [mins, secs] = prev.split(':').map(Number);
        const total = mins * 60 + secs + 1;
        return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Real VU meters from the host mix analyser
  useEffect(() => {
    let raf = 0;
    const analyser = live.getAnalyser();
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const n = 12;
      const step = Math.floor(data.length / n) || 1;
      const bins = Array.from({ length: n }, (_, i) => {
        const v = data[i * step] ?? 0;
        return Math.round((v / 255) * 100);
      });
      setVuLeft(bins);
      setVuRight(bins.map((b) => Math.max(0, b - 6)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live]);

  // ─── Soundboard: route through live mix ───
  const triggerSFX = (sfxId: string, label: string) => {
    live.playSfx(sfxId);
    setActiveSFX(label);
    setNotices((prev) => [
      { id: Date.now(), author: 'FX FEED', body: `Triggered SFX: [${label.toUpperCase()}] 🔊` },
      ...prev,
    ]);
    setTimeout(() => setActiveSFX(null), 1000);
  };

  // ─── Master deck slider handlers ───
  const handleMasterVol = (v: number) => {
    setMasterVol(v);
    live.setMasterVolume(v / 100);
  };
  const handleBedVol = (v: number) => {
    setBedVol(v);
    live.setBedVolume(v / 100);
  };

  // ─── Real callers ───
  const pendingCallers = callers.filter((c) => c.status === 'pending');
  const onAirCaller = callers.find((c) => c.status === 'on_air') ?? null;

  const callerAction = useCallback(async (requestId: string, action: 'take' | 'disconnect' | 'decline') => {
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase.auth.getSession();
      const tokenStr = data.session?.access_token ?? '';
      const res = await fetch('/api/tradio/caller', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(tokenStr ? { authorization: `Bearer ${tokenStr}` } : {}),
        },
        body: JSON.stringify({ requestId, action }),
      });
      if (!res.ok) {
        toast.error('Caller action failed.');
      } else {
        const label = action === 'take' ? 'ON AIR' : action === 'disconnect' ? 'Disconnected' : 'Declined';
        setNotices((prev) => [
          { id: Date.now(), author: 'SYSTEM', body: `🎙️ Caller ${label}` },
          ...prev,
        ]);
      }
    } catch {
      toast.error('Caller action failed.');
    }
  }, []);

  // ─── Show rundown (auto-pilot + AI host trigger) ───
  const autoPilotRef = useRef(true);

  const rundown = useShowRundown({
    segments: show.segments,
    active: live.connection === 'connected',
    onEnterSegment: (seg) => {
      if (autoPilotRef.current && (seg.script || seg.hostNotes)) {
        void live.aiSpeak(seg.script ?? seg.hostNotes ?? '', seg.title);
      }
    },
  });

  // Keep the ref in sync with hook state
  useEffect(() => {
    autoPilotRef.current = rundown.autoPilot;
  }, [rundown.autoPilot]);

  const activeSegmentIdx = rundown.currentIndex;
  const currentSegment = show.segments[activeSegmentIdx] || { title: 'Talk Break', type: 'host-talk', hostNotes: 'Vibe check.', duration: 120 } as any;

  const getSegmentCues = (type: string) => {
    switch (type) {
      case 'intro':
        return [
          '🔴 Air check: Mic open. Introduce yourself and your custom station lane.',
          '🗣️ Talk prompt: Explain tonight\'s mood. Ask fans to submit request cards.',
          '🎯 Interactive: Open Line 1 and let fans know they can call in now.',
        ];
      case 'music-block':
        return [
          '🎧 Crossfade: Smooth beat overlay from Beat #1 to Beat #2.',
          '🔊 FX: Trigger Airhorn or Record Scratch on transition beat drops.',
          '📈 Monitor: Keep master level at 80-85% for crystal-clear headroom.',
        ];
      case 'host-talk':
        return [
          '🎙️ Mic on. Keep the scale locked to your voice key to stay perfectly pitch-corrected.',
          '🗣️ Take Caller: Check waitlist below. Take a caller on air to review beat packs.',
          '💬 Community check: Highlight best comments in the live reaction chat.',
        ];
      case 'fan-request':
        return [
          '🗳️ Requests: Open requests queue. Acknowledge top-voted songs.',
          '📞 Accept a caller on air to introduce their favorite track.',
          '🔄 Cue track: Transition to the next song after caller wraps up.',
        ];
      case 'producer-spotlight':
        return [
          '⭐ Producer credits: Showcase stems, loops, and instrumental creators.',
          '🎛️ Stem mixing: Adjust loop levels individually. Invite fans to save beats.',
          '🗣️ Prompter: Shout out contributors for the heavy snare and bass loop.',
        ];
      case 'artist-premiere':
        return [
          '🔥 PREMIERE HOUR: Introduce the new exclusive single.',
          '👥 Fan invite: Pin the pre-save link in live messenger chat.',
          '📈 Peak analytics: Ready air check. Spurt VU meters.',
        ];
      default:
        return [
          '🎙️ On-Air check: Stay on point. Watch your elapsed segment timer.',
          '🎚️ Master level: Keep mic level above audio bed. Cue next sequence item.',
        ];
    }
  };

  const segmentCues = getSegmentCues(currentSegment.type);

  // ─── SFX button mapping to asset IDs ───
  const sfxButtons = SFX_ASSETS.map((a) => {
    let icon: React.ReactNode;
    switch (a.id) {
      case 'airhorn': icon = <Radio className="h-4.5 w-4.5" />; break;
      case 'scratch': icon = <Zap className="h-4.5 w-4.5" />; break;
      case 'crowd': icon = <Users className="h-4.5 w-4.5" />; break;
      case 'drop': icon = <Flame className="h-4.5 w-4.5" />; break;
      case 'reverb': icon = <Volume2 className="h-4.5 w-4.5" />; break;
      default: icon = <Sparkles className="h-4.5 w-4.5" />; break;
    }
    return { id: a.id, label: a.label, icon };
  });

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
          <Chip label={`${live.listenerCount} listeners`} icon={<Users className="h-3.5 w-3.5" />} />
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
              {/* Rundown controls: auto-pilot toggle, skip, +1min */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => rundown.setAutoPilot(!rundown.autoPilot)}
                  title={rundown.autoPilot ? 'Disable auto-pilot' : 'Enable auto-pilot'}
                  className={`rounded-xl border p-2 text-xs font-bold transition-all active:scale-95 ${
                    rundown.autoPilot
                      ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300'
                      : 'border-white/5 bg-white/[0.02] text-white/40 hover:bg-white/[0.08]'
                  }`}
                >
                  {rundown.autoPilot ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => rundown.extend(60)}
                  title="+1 minute"
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-2 hover:bg-white/[0.08] active:scale-95 text-white/60"
                >
                  <Timer className="h-4 w-4" />
                </button>
                <button
                  onClick={rundown.advance}
                  disabled={activeSegmentIdx >= show.segments.length - 1}
                  title="Skip to next segment"
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-2 hover:bg-white/[0.08] disabled:opacity-20 active:scale-95 text-white/60"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Show-clock + pacing bar */}
            <div className="mt-3 flex items-center justify-between text-[11px] font-mono">
              <span className="text-white/50">−{Math.floor(rundown.remainingInSegment / 60)}:{String(rundown.remainingInSegment % 60).padStart(2, '0')} left in segment</span>
              <span className={
                rundown.pacing.status === 'behind' ? 'text-red-300'
                : rundown.pacing.status === 'ahead' ? 'text-cyan-300' : 'text-emerald-300'
              }>
                {rundown.pacing.status === 'on-time' ? 'ON TIME'
                  : rundown.pacing.status === 'behind' ? `${rundown.pacing.deltaSeconds}s BEHIND`
                  : `${Math.abs(rundown.pacing.deltaSeconds)}s AHEAD`}
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all"
                   style={{ width: `${Math.min(100, (rundown.elapsedInSegment / Math.max(1, currentSegment.duration)) * 100)}%` }} />
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
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => live.aiSpeak(currentSegment.script ?? currentSegment.hostNotes ?? '', currentSegment.title)}
                    disabled={live.aiSpeaking}
                    className="rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-200 hover:bg-purple-500/30 disabled:opacity-40 disabled:pointer-events-none px-3 py-1.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                  >
                    <Sparkles className="h-3 w-3" />
                    {live.aiSpeaking ? 'AI Speaking...' : '▶ AI Read'}
                  </button>
                  {live.aiSpeaking && live.aiSegmentLabel && (
                    <span className="text-[9px] font-mono text-cyan-300 animate-pulse">{live.aiSegmentLabel}</span>
                  )}
                </div>
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
                    <button onClick={() => live.toggleMic()} className={`text-[10px] font-black rounded px-1.5 py-0.5 ${!live.micOn ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {!live.micOn ? 'MUTED' : 'LIVE'}
                    </button>
                  </div>
                  <input type="range" min="0" max="100" value={masterVol} onChange={(e) => handleMasterVol(Number(e.target.value))} className="h-1.5 w-full cursor-pointer bg-white/10 rounded-full accent-cyan-400" />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-white/50 mb-1">
                    <span className="flex items-center gap-1"><Music className="h-3.5 w-3.5 text-purple-400" /> Audio Bed</span>
                    <span className="text-[10px] font-mono text-white/30">{bedVol}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={bedVol} onChange={(e) => handleBedVol(Number(e.target.value))} className="h-1.5 w-full cursor-pointer bg-white/10 rounded-full accent-purple-400" />
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
                {pendingCallers.length} LINES WAITING
              </span>
            </div>

            {/* Active On-Air Caller */}
            {onAirCaller ? (
              <div className="mb-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between animate-scale-in gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-11 w-11 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-bold text-sm">
                      {(onAirCaller.callerName ?? 'C')[0].toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border border-black animate-ping" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-white text-sm">{onAirCaller.callerName ?? 'Caller'}</span>
                      <span className="rounded bg-emerald-500/15 text-[8px] font-mono text-emerald-300 px-1 py-0.5 font-bold uppercase tracking-wider">ON AIR SIGNAL</span>
                    </div>
                    {onAirCaller.lineNote && <p className="text-xs text-emerald-200 mt-1">{onAirCaller.lineNote}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <button
                    onClick={() => callerAction(onAirCaller.id, 'disconnect')}
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
              {pendingCallers.length === 0 && (
                <div className="text-center text-xs text-white/25 py-3">No pending call-in requests.</div>
              )}
              {pendingCallers.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center text-white/60 text-xs font-bold">
                      {(c.callerName ?? 'C')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">{c.callerName ?? 'Listener'}</div>
                      {c.lineNote && <div className="text-[10px] text-white/55 mt-0.5">{c.lineNote}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => callerAction(c.id, 'take')}
                      className="rounded-xl bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/25 text-cyan-300 text-xs font-bold px-3.5 py-1.5 active:scale-95 transition"
                    >
                      Take Call
                    </button>
                    <button
                      onClick={() => callerAction(c.id, 'decline')}
                      className="rounded-xl bg-white/[0.02] hover:bg-red-500/10 border border-white/5 text-white/40 hover:text-red-300 text-xs font-bold px-2.5 py-1.5 active:scale-95 transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* RIGHT COLUMN: SOUNDBOARD, BEDS, FAN REACTIONS */}
        <div className="space-y-6">
          {/* SOUND FX FXBOARD */}
          <GlassCard className="p-5 border-white/5">
            <div className="mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-fuchsia-400" />
              <span className="text-sm font-semibold text-white">Interactive FX Soundboard</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {sfxButtons.map((item) => (
                <button
                  key={item.id}
                  onClick={() => triggerSFX(item.id, item.label)}
                  className="rounded-xl border border-white/5 bg-white/[0.03] p-3 flex flex-col items-center justify-center gap-1.5 text-center text-xs font-bold text-white/70 hover:text-white hover:bg-white/[0.08] hover:border-white/10 active:scale-95 transition-all shadow-inner"
                >
                  <div className="text-purple-300">{item.icon}</div>
                  <span className="truncate w-full text-[10px]">{item.label}</span>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* MUSIC BED CONTROLS */}
          <GlassCard className="p-5 border-white/5">
            <div className="mb-3 flex items-center gap-2">
              <Music className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-semibold text-white">Music Beds</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {BED_ASSETS.map((bed) => (
                <button
                  key={bed.id}
                  onClick={() => {
                    live.playBed(bed.id);
                    setNotices((prev) => [
                      { id: Date.now(), author: 'FX FEED', body: `▶ Music bed: ${bed.label}` },
                      ...prev,
                    ]);
                  }}
                  className="rounded-xl border border-white/5 bg-white/[0.03] p-3 flex items-center justify-between text-xs font-bold text-white/70 hover:text-white hover:bg-white/[0.08] hover:border-white/10 active:scale-95 transition-all"
                >
                  <span>{bed.label}</span>
                  <span className="text-[9px] font-mono text-white/30">{bed.durationLabel}</span>
                </button>
              ))}
              <button
                onClick={() => {
                  live.stopBed();
                  setNotices((prev) => [
                    { id: Date.now(), author: 'FX FEED', body: '⏹ Music bed stopped' },
                    ...prev,
                  ]);
                }}
                className="rounded-xl border border-red-500/15 bg-red-500/5 p-3 text-xs font-bold text-red-300/70 hover:text-red-200 hover:bg-red-500/10 active:scale-95 transition-all col-span-2"
              >
                ⏹ Stop Bed
              </button>
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
              {notices.map((c) => (
                <div key={c.id} className="flex gap-2 text-xs">
                  <span className="font-bold text-fuchsia-300">@{c.author}:</span>
                  <span className="text-white/80 leading-normal">{c.body}</span>
                </div>
              ))}
              {interaction.chat.map((c) => (
                <div key={c.id} className="flex gap-2 text-xs">
                  <span className="font-bold text-cyan-300">@{c.authorName || 'Listener'}:</span>
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
