import React, { useState, useEffect } from 'react';
import { BarChart3, Users, MessageSquare, Music, TrendingUp, Clock, Volume2, Zap, Radio, Music2, Mic, Pause, Play } from 'lucide-react';
import { GlassCard, Chip, PrimaryButton, SecondaryButton } from '../ui';
import type { LiveRoomState } from '../useTradioLiveRoom';
import type { LiveInteractionState } from '../useTradioLiveInteraction';

type LiveShowDashboardProps = {
  live: LiveRoomState;
  interaction: LiveInteractionState;
  showTitle?: string;
  djName?: string;
};

// Sound effects library
const SOUND_EFFECTS = [
  { id: 'horn', label: 'Air Horn', color: 'from-yellow-400/20 to-yellow-400/5' },
  { id: 'bell', label: 'Bell Ding', color: 'from-blue-400/20 to-blue-400/5' },
  { id: 'laugh', label: 'Audience Laugh', color: 'from-purple-400/20 to-purple-400/5' },
  { id: 'whoosh', label: 'Whoosh', color: 'from-cyan-400/20 to-cyan-400/5' },
  { id: 'drop', label: 'Bass Drop', color: 'from-red-400/20 to-red-400/5' },
  { id: 'cheer', label: 'Crowd Cheer', color: 'from-emerald-400/20 to-emerald-400/5' },
];

const MUSIC_BEDS = [
  { id: 'bed-intro', label: 'Intro Bed', duration: '30s' },
  { id: 'bed-outro', label: 'Outro Bed', duration: '45s' },
  { id: 'bed-under', label: 'Under Bed', duration: '∞' },
  { id: 'bed-transition', label: 'Transition', duration: '8s' },
];

type LiveShowDashboardProps = {
  live: LiveRoomState;
  interaction: LiveInteractionState;
  showTitle?: string;
  djName?: string;
};

export const LiveShowDashboard: React.FC<LiveShowDashboardProps> = ({ live, interaction, showTitle, djName }) => {
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [peakListeners, setPeakListeners] = useState(live.listenerCount);
  const [totalChatMessages, setTotalChatMessages] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [micMuted, setMicMuted] = useState(false);
  const [masterVolume, setMasterVolume] = useState(85);
  const [musicBedVolume, setMusicBedVolume] = useState(40);
  const [activeMusicBed, setActiveMusicBed] = useState<string | null>(null);
  const [adBreakActive, setAdBreakActive] = useState(false);

  // Track peak listeners
  useEffect(() => {
    if (live.listenerCount > peakListeners) {
      setPeakListeners(live.listenerCount);
    }
  }, [live.listenerCount, peakListeners]);

  // Update chat/request counts
  useEffect(() => {
    setTotalChatMessages(interaction.chat.length);
    setTotalRequests(interaction.requests.length);
  }, [interaction.chat.length, interaction.requests.length]);

  // Elapsed time counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => {
        const [mins, secs] = prev.split(':').map(Number);
        const total = mins * 60 + secs + 1;
        return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeBroadcast = live.connection === 'connected';
  const pendingRequests = interaction.requests.filter((r) => r.status === 'pending').length;
  const queuedRequests = interaction.requests.filter((r) => r.status === 'queued').length;

  return (
    <GlassCard glow className="p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${activeBroadcast ? 'animate-pulse bg-red-500' : 'bg-white/30'}`} />
            <h2 className="text-xl font-bold text-white">{showTitle || 'Live Show'}</h2>
          </div>
          {djName && <p className="mt-1 text-sm text-white/60">Hosted by {djName}</p>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Chip label={`${elapsedTime} on air`} icon={<Clock className="h-3.5 w-3.5" />} />
          <Chip label={live.connection === 'connecting' ? 'Connecting…' : activeBroadcast ? 'LIVE' : 'STANDBY'} selected={activeBroadcast} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Current Listeners */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">Listeners Now</div>
              <div className="mt-2 text-2xl font-bold text-cyan-300">{live.listenerCount.toLocaleString()}</div>
            </div>
            <Users className="h-5 w-5 text-cyan-400/60" />
          </div>
        </div>

        {/* Peak Listeners */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">Peak</div>
              <div className="mt-2 text-2xl font-bold text-purple-300">{peakListeners.toLocaleString()}</div>
            </div>
            <TrendingUp className="h-5 w-5 text-purple-400/60" />
          </div>
        </div>

        {/* Chat Messages */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">Messages</div>
              <div className="mt-2 text-2xl font-bold text-emerald-300">{totalChatMessages}</div>
            </div>
            <MessageSquare className="h-5 w-5 text-emerald-400/60" />
          </div>
        </div>

        {/* Requests */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">Song Requests</div>
              <div className="mt-2">
                <div className="text-xl font-bold text-amber-300">
                  {pendingRequests}
                  <span className="text-sm font-normal text-white/50"> pending</span>
                </div>
                <div className="text-xs text-white/40">{queuedRequests} queued</div>
              </div>
            </div>
            <Music className="h-5 w-5 text-amber-400/60" />
          </div>
        </div>

        {/* Engagement Index (mock) */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">Engagement</div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-fuchsia-300">
                  {totalChatMessages > 0 ? Math.min(99, Math.floor((totalChatMessages / (live.listenerCount || 1)) * 100)) : 0}%
                </div>
                <div className="text-[10px] text-white/40">Chat ratio</div>
              </div>
            </div>
            <BarChart3 className="h-5 w-5 text-fuchsia-400/60" />
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="text-xs">
          <div className="text-white/50">Connection Status</div>
          <div className={`mt-1 font-semibold ${live.connection === 'connected' ? 'text-emerald-300' : 'text-amber-300'}`}>
            {live.connection === 'connected' ? '✓ Streaming stable' : live.connection === 'connecting' ? '⟳ Connecting…' : '○ Standby'}
          </div>
        </div>
        <div className="text-xs">
          <div className="text-white/50">Avg Listener Duration</div>
          <div className="mt-1 font-semibold text-white">~{Math.max(1, Math.round(elapsedTime.split(':').map(Number).reduce((m, s) => m * 60 + s, 0) / Math.max(1, live.listenerCount / 10)))} min</div>
        </div>
        <div className="text-xs">
          <div className="text-white/50">Show Health</div>
          <div className="mt-1">
            <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
                style={{ width: `${Math.min(100, live.listenerCount > 100 ? 100 : live.listenerCount)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SOUNDBOARD SECTION */}
      <div className="mt-6 space-y-4">
        {/* Mic & Master Controls */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Mic Control */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-semibold text-white">Host Mic</span>
              </div>
              <button
                onClick={() => setMicMuted(!micMuted)}
                className={`rounded-lg border px-3 py-1 text-[11px] font-bold transition ${
                  micMuted
                    ? 'border-red-400/40 bg-red-500/15 text-red-200'
                    : 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                }`}
              >
                {micMuted ? '🔇 Muted' : '🎙️ Live'}
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-white/50">
                  <span>Master Level</span>
                  <span className="font-semibold text-white">{masterVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterVolume}
                  onChange={(e) => setMasterVolume(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer rounded-full bg-white/10 accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Music Bed Control */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music2 className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-semibold text-white">Music Bed</span>
              </div>
              {activeMusicBed && (
                <button
                  onClick={() => setActiveMusicBed(null)}
                  className="rounded-lg border border-amber-400/40 bg-amber-500/15 px-2 py-1 text-[11px] font-bold text-amber-200"
                >
                  ⏹ Stop
                </button>
              )}
            </div>
            <div className="space-y-2">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-white/50">
                  <span>Bed Level</span>
                  <span className="font-semibold text-white">{musicBedVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicBedVolume}
                  onChange={(e) => setMusicBedVolume(Number(e.target.value))}
                  disabled={!activeMusicBed}
                  className="h-2 w-full cursor-pointer rounded-full bg-white/10 accent-amber-400 disabled:opacity-40"
                />
              </div>
              <div className="flex gap-1">
                {MUSIC_BEDS.slice(0, 2).map((bed) => (
                  <button
                    key={bed.id}
                    onClick={() => setActiveMusicBed(bed.id)}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-[10px] font-bold transition ${
                      activeMusicBed === bed.id
                        ? 'border-amber-400/60 bg-amber-500/25 text-amber-100'
                        : 'border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08]'
                    }`}
                  >
                    <Play className="mb-1 h-3 w-3 inline mr-1" /> {bed.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sound Effects Board */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-fuchsia-400" />
            <span className="text-sm font-semibold text-white">Sound Effects</span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {SOUND_EFFECTS.map((effect) => (
              <button
                key={effect.id}
                onClick={() => {
                  /* Trigger sound effect */
                }}
                className={`rounded-xl border border-white/8 bg-gradient-to-br ${effect.color} px-2 py-2 text-center text-[10px] font-bold text-white transition hover:border-white/20 hover:bg-opacity-20`}
              >
                <Zap className="mx-auto mb-1 h-4 w-4" />
                {effect.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ad Break & Quick Actions */}
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            onClick={() => setAdBreakActive(!adBreakActive)}
            className={`rounded-xl border px-4 py-3 text-center text-sm font-bold transition ${
              adBreakActive
                ? 'border-red-400/50 bg-red-500/20 text-red-100'
                : 'border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]'
            }`}
          >
            <Radio className="mb-1 h-4 w-4 inline mr-2" />
            {adBreakActive ? '🔴 Ad Break Active' : 'Start Ad Break'}
          </button>
          <button className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm font-bold text-white/70 transition hover:bg-white/[0.08]">
            <Pause className="mb-1 h-4 w-4 inline mr-2" />
            Take Break
          </button>
          <button className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm font-bold text-white/70 transition hover:bg-white/[0.08]">
            <Volume2 className="mb-1 h-4 w-4 inline mr-2" />
            Fade Out
          </button>
        </div>
      </div>
    </GlassCard>
  );
};
