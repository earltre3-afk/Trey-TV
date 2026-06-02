import React, { useState, useEffect } from 'react';
import { goLive, endLive } from '../tradioLiveService';
import { useTradioLiveRoom } from '../useTradioLiveRoom';
import { useTradioLiveInteraction } from '../useTradioLiveInteraction';
import { Archive, CalendarDays, ListMusic, Mic, Radio, RadioTower, Sparkles, Upload, Users, Volume2, type LucideIcon } from 'lucide-react';
import { TopBar, GlassCard, PrimaryButton, SecondaryButton, Chip, SegmentedTabs, Waveform, VerifiedBadge } from '../ui';
import CoPilotPanel from '../CoPilotPanel';
import { AD_SLOTS, BROADCAST_BLOCKS, BROADCAST_STATUS, DJS, DJ_MIXES, LISTENER_REQUESTS, RADIO_SHOWS, REPLAY_ITEMS, VOICE_DROPS } from '../data';
import type { RadioShow } from '../data';
import { listMyShows } from '../radioShowService';
import { usePlayer } from '@/tradio/contexts/PlayerContext';
import { djMixToPlaybackItem } from '../playbackAdapters';
import { talkSegmentsWithScript } from '../aiVoiceHost';
import { AccessGate } from '../auth/components';
import { ContentFeelAnalysisPanel } from '../../content-feel/ContentFeelComponents';
import { useContentFeelAnalysis } from '../../content-feel/useContentFeelAnalysis';
import { LegalAcceptanceGroup } from '../legal/LegalPrimitives';
import {
  createLegalAcceptanceValues,
  isLegalFlowAccepted,
  LEGAL_ACCEPTANCE_FLOWS,
  recordLegalFlowAcceptance,
  type LegalAcceptanceValues,
} from '../legal/legalAcceptanceConfig';

type DJStudioTab = 'broadcast' | 'shows' | 'mixes' | 'requests' | 'archive';

export const DJStudio: React.FC<{ onOpenBroadcastStudio?: (initialTab?: string) => void; onViewPublicProfile?: () => void; onEditProfile?: () => void }> = ({ onOpenBroadcastStudio, onViewPublicProfile, onEditProfile }) => {
  const [tab, setTab] = useState<DJStudioTab>('broadcast');
  const [isLive, setIsLive] = useState(BROADCAST_STATUS.isLive);
  const [myShows, setMyShows] = useState<RadioShow[] | null>(null);
  useEffect(() => { void (async () => { const r = await listMyShows(); if (r.source === 'supabase') setMyShows(r.data ?? []); })(); }, []);
  const currentDJ = DJS[0];
  const [liveSessionId, setLiveSessionId] = useState<string | null>(null);
  const live = useTradioLiveRoom({ active: Boolean(liveSessionId), role: 'host', sessionId: liveSessionId });
  const interaction = useTradioLiveInteraction({ sessionId: liveSessionId });
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState('Yes\nNo');
  const featuredShow = RADIO_SHOWS[0];
  const showContentFeel = useContentFeelAnalysis({
    contentId: `draft-show-${featuredShow?.id ?? 'new'}`,
    contentType: 'radio_show',
    sourcePlatform: 'tradio',
    title: featuredShow?.title ?? 'Untitled Show',
    description: `Radio show • ${featuredShow?.mood ?? ''} • for ${featuredShow?.targetAudience ?? 'listeners'}`,
    creatorTags: currentDJ.specialties,
  });
  const { playItem, playQueue, addToQueue } = usePlayer();
  const [legalValues, setLegalValues] = useState<LegalAcceptanceValues>(() => createLegalAcceptanceValues('dj_broadcast_schedule'));
  const [legalStatus, setLegalStatus] = useState<'idle' | 'saving' | 'saved' | 'fallback' | 'error'>('idle');
  const [legalMessage, setLegalMessage] = useState<string | null>(null);
  const legalAccepted = isLegalFlowAccepted('dj_broadcast_schedule', legalValues);
  const [onAirShowId, setOnAirShowId] = useState<string>('');

  const recordBroadcastLegal = async (action: string) => {
    if (!legalAccepted || legalStatus === 'saving') return false;
    setLegalStatus('saving');
    const result = await recordLegalFlowAcceptance('dj_broadcast_schedule', legalValues, {
      action,
      referenceId: 'mock-dj-live-midnight-spin',
      hostName: currentDJ.name,
    });
    setLegalStatus(result.source === 'supabase' ? 'saved' : 'fallback');
    setLegalMessage(result.source === 'supabase' ? 'Broadcast acknowledgement saved.' : result.warning);
    return true;
  };

  const handleGoLive = async () => {
    const accepted = await recordBroadcastLegal(isLive ? 'end_broadcast' : 'go_live');
    if (!accepted) return;
    if (!isLive) {
      const { session, error } = await goLive({ showId: null, title: 'Live Desk', hostName: currentDJ.name });
      if (error || !session) { setIsLive(false); return; }
      setLiveSessionId(session.id);
      setIsLive(true);
    } else {
      if (liveSessionId) await endLive({ sessionId: liveSessionId, showId: null, peakListeners: live.listenerCount });
      live.leave();
      setLiveSessionId(null);
      setIsLive(false);
    }
  };

  return (
    <AccessGate
      capability="host-song-war"
      title="DJ / Host access required"
      message="Switch to DJ Mode or request DJ/Host access to manage live shows, listener requests, mixes, and battle hosting."
      ctaType="dj"
    >
    <div className="space-y-8 pb-4 lg:space-y-10">
      <TopBar title="DJ Studio" />

      {(onEditProfile || onViewPublicProfile) && (
        <div className="flex flex-wrap gap-2 px-4 sm:px-6 lg:px-10">
          {onEditProfile && <SecondaryButton className="px-4 py-2.5 text-[11px]" onClick={onEditProfile}>Edit Host Profile</SecondaryButton>}
          {onViewPublicProfile && <SecondaryButton className="px-4 py-2.5 text-[11px]" onClick={onViewPublicProfile}>View Public Host Profile</SecondaryButton>}
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-10">
        <GlassCard glow className="overflow-hidden">
          <div className="relative min-h-[260px]">
            <img src={currentDJ.avatar} alt="" className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-75" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/10" />
            <div className="relative p-5 sm:p-6">
              <Chip label="DJ Studio" selected icon={<RadioTower className="h-3.5 w-3.5" />} />
              <div className="mt-5 flex max-w-[640px] gap-4">
                <img src={currentDJ.avatar} alt={currentDJ.name} className="h-24 w-24 rounded-2xl border border-white/15 object-cover" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{currentDJ.name}</h1>
                    {currentDJ.verified && <VerifiedBadge />}
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${isLive ? 'border-red-400/50 bg-red-500/15 text-red-200' : 'border-white/10 bg-white/[0.04] text-white/55'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'animate-pulse bg-red-400' : 'bg-white/30'}`} />
                      {isLive ? 'LIVE NOW' : 'STANDBY'}
                    </span>
                    {isLive && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold text-white/70">
                        {live.listenerCount} listening{live.connection === 'connecting' ? ' · connecting…' : ''}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{currentDJ.bio}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {currentDJ.specialties.map((tag) => <Chip key={tag} label={tag} />)}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <PrimaryButton disabled={!legalAccepted || legalStatus === 'saving'} onClick={handleGoLive} className={legalAccepted ? '' : 'pointer-events-none opacity-40'}>
                  <Radio className="h-4 w-4" /> {isLive ? 'End Broadcast' : 'Go Live'}
                </PrimaryButton>
                <SecondaryButton onClick={() => onOpenBroadcastStudio?.('builder')}><Radio className="h-4 w-4 animate-pulse text-purple-300" /> Open Broadcast Studio</SecondaryButton>
                <SecondaryButton onClick={() => onOpenBroadcastStudio?.('builder')}><Sparkles className="h-4 w-4 text-cyan-300" /> Build Show With AI</SecondaryButton>
                <SecondaryButton disabled={!legalAccepted || legalStatus === 'saving'} onClick={() => recordBroadcastLegal('schedule_mix')} className={legalAccepted ? '' : 'pointer-events-none opacity-40'}><CalendarDays className="h-4 w-4" /> Schedule Mix</SecondaryButton>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="px-4 sm:px-6 lg:px-10">
        <LegalAcceptanceGroup
          config={LEGAL_ACCEPTANCE_FLOWS.dj_broadcast_schedule}
          values={legalValues}
          onChange={setLegalValues}
          status={legalStatus}
          statusMessage={legalMessage}
        />
      </div>

      <div className="grid gap-3 px-4 sm:grid-cols-3 sm:px-6 lg:px-10">
        {([
          ['Upcoming shows', currentDJ.upcomingShowCount, CalendarDays],
          ['Audience reach', `${(currentDJ.totalListeners / 1000).toFixed(0)}K`, Users],
          ['Replay archive', REPLAY_ITEMS.length, Archive],
        ] as [string, string | number, LucideIcon][]).map(([label, value, Icon]) => (
          <GlassCard key={label as string} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-white/50">{label as string}</div>
                <div className="mt-1 text-2xl font-bold text-white">{value as string}</div>
              </div>
              <Icon className="h-5 w-5 text-purple-300" />
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="px-4 sm:px-6 lg:px-10">
        <SegmentedTabs
          tabs={[
            { id: 'broadcast', label: 'Broadcast', count: isLive ? 1 : 0 },
            { id: 'shows', label: 'Shows', count: RADIO_SHOWS.length },
            { id: 'mixes', label: 'Mixes', count: DJ_MIXES.length },
            { id: 'requests', label: 'Requests', count: LISTENER_REQUESTS.length },
            { id: 'archive', label: 'Archive', count: REPLAY_ITEMS.length },
          ]}
          activeTab={tab}
          onTabChange={(next) => setTab(next as DJStudioTab)}
        />
      </div>

      {tab === 'broadcast' && (
        <div className="space-y-3">
          <div className="grid gap-3 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-10">
            <GlassCard className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">Active Broadcast Desk</div>
                  <div className="text-xs text-white/50">Music blocks, talk breaks, ads, and live controls</div>
                </div>
                <Waveform className="h-5 w-10" bars={8} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Mic', Mic, 'Ready'],
                  ['Music Bed', Volume2, 'Loaded'],
                  ['Voice Drops', Upload, `${VOICE_DROPS.length} clips`],
                  ['Ad Slots', Radio, `${AD_SLOTS.length} placeholders`],
                ].map(([label, Icon, status]) => (
                  <button key={label as string} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-left">
                    <Icon className="h-5 w-5 text-cyan-300" />
                    <div className="mt-2 text-sm font-semibold text-white">{label as string}</div>
                    <div className="text-xs text-white/50">{status as string}</div>
                  </button>
                ))}
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="mb-3 text-sm font-semibold text-white">Broadcast Blocks</div>
              <div className="space-y-2">
                {BROADCAST_BLOCKS.map((block) => (
                  <div key={block.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{block.title}</div>
                      <div className="text-xs text-white/50">{block.type} - {block.duration} min</div>
                    </div>
                    <span className="rounded-full border border-purple-400/30 bg-purple-500/10 px-2 py-1 text-[10px] font-semibold text-purple-200">{block.status}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
          {liveSessionId && (
            <div className="px-4 sm:px-6 lg:px-10">
              <GlassCard className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">AI Voice Host</div>
                  {live.aiSpeaking && (
                    <button onClick={() => live.stopAi()} className="rounded-full border border-red-400/40 bg-red-500/15 px-3 py-1 text-[11px] font-bold text-red-200">
                      ■ Stop · {live.aiSegmentLabel ?? 'AI speaking'}
                    </button>
                  )}
                </div>
                <select
                  value={onAirShowId}
                  onChange={(e) => setOnAirShowId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="">Select a show to read…</option>
                  {(myShows ?? []).map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
                {(() => {
                  const show = (myShows ?? []).find((s) => s.id === onAirShowId) ?? null;
                  const segs = talkSegmentsWithScript(show);
                  if (!onAirShowId) return <div className="text-xs text-white/40">Pick a show to read its host scripts on air.</div>;
                  if (segs.length === 0) return <div className="text-xs text-white/40">This show has no AI host scripts.</div>;
                  return (
                    <div className="space-y-2">
                      {segs.map((seg) => (
                        <div key={seg.id} className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] p-2.5">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-white">{seg.title}</div>
                            <div className="truncate text-[11px] text-white/45">{seg.script}</div>
                          </div>
                          <button
                            onClick={() => live.aiSpeak(seg.script!, seg.title)}
                            disabled={live.aiSpeaking}
                            className="shrink-0 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-200 disabled:opacity-40"
                          >
                            ▶ AI read
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </GlassCard>
            </div>
          )}
            </div>
          )}

          {liveSessionId && (
            <div className="px-4 sm:px-6 lg:px-10">
              {/* Co-Pilot panel: host-only controls that call server fns */}
              <CoPilotPanel live={live} interaction={interaction} showId={onAirShowId} myShows={myShows} />
            </div>
          )}

          {liveSessionId && (
          {liveSessionId && (
            <div className="px-4 sm:px-6 lg:px-10">
              <GlassCard className="p-4 space-y-4">
                <div className="text-sm font-semibold text-white">Live Room</div>
                {/* Chat */}
                <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                  {interaction.chat.length === 0 ? <div className="py-4 text-center text-xs text-white/40">No chat yet.</div> : interaction.chat.map((c) => (
                    <div key={c.id} className="text-xs"><span className="font-bold text-cyan-300">{c.authorName || 'Listener'}</span> <span className="text-white/80">{c.body}</span></div>
                  ))}
                </div>
                {/* Request queue */}
                <div>
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-white/50">Request Queue</div>
                  <div className="space-y-2">
                    {interaction.requests.filter((r) => r.status !== 'declined').map((r) => (
                      <div key={r.id} className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] p-2.5">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-white">{r.songTitle}{r.artist ? ` — ${r.artist}` : ''}</div>
                          <div className="truncate text-[11px] text-white/45">{r.requesterName || 'Listener'} · {r.status}</div>
                        </div>
                        {r.status === 'pending' && <button onClick={() => interaction.setRequestStatus(r.id, 'queued')} className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[11px] font-bold text-cyan-200">Queue</button>}
                        {r.status === 'queued' && <button onClick={() => interaction.setRequestStatus(r.id, 'played')} className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[11px] font-bold text-emerald-200">Played</button>}
                        <button onClick={() => interaction.setRequestStatus(r.id, 'declined')} className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-white/60">Decline</button>
                      </div>
                    ))}
                    {interaction.requests.filter((r) => r.status !== 'declined').length === 0 && <div className="text-xs text-white/40">No requests yet.</div>}
                  </div>
                </div>
                {/* Poll */}
                <div>
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-white/50">Poll</div>
                  {interaction.activePoll ? (
                    <div className="space-y-1.5">
                      <div className="text-sm font-semibold text-white">{interaction.activePoll.question}</div>
                      {interaction.tallies.map((t) => (
                        <div key={t.optionId} className="relative overflow-hidden rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white">
                          <span className="absolute inset-y-0 left-0 bg-purple-500/25" style={{ width: `${t.pct}%` }} />
                          <span className="relative flex justify-between"><span>{t.label}</span><span className="tabular-nums text-white/70">{t.count} · {t.pct}%</span></span>
                        </div>
                      ))}
                      <button onClick={() => interaction.closePoll()} className="mt-1 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-white/70">Close poll</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} placeholder="Poll question" className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none" />
                      <textarea value={pollOptions} onChange={(e) => setPollOptions(e.target.value)} placeholder="One option per line" className="h-16 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none" />
                      <button
                        onClick={() => {
                          const opts = pollOptions.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 4).map((label, i) => ({ id: `o${i}`, label }));
                          if (pollQuestion.trim() && opts.length >= 2) { interaction.createPoll(pollQuestion.trim(), opts); setPollQuestion(''); setPollOptions('Yes\nNo'); }
                        }}
                        className="rounded-lg border border-purple-400/40 bg-purple-500/15 px-3 py-1.5 text-xs font-bold text-purple-100"
                      >Launch poll</button>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      )}

      {tab === 'shows' && (
        <div className="px-4 sm:px-6 lg:px-10">
          <ContentFeelAnalysisPanel profile={showContentFeel.profile} status={showContentFeel.status} onRun={showContentFeel.run} />
        </div>
      )}

      {tab === 'shows' && (
        <div className="grid gap-3 px-4 sm:px-6 lg:grid-cols-2 lg:px-10">
          {(myShows ?? RADIO_SHOWS).map((show) => (
            <GlassCard key={show.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-bold text-white">{show.title}</div>
                  <div className="mt-1 text-xs text-white/50">{show.duration} min - {show.mood}</div>
                </div>
                <Chip label={show.status} selected />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/70">For {show.targetAudience}, hosted in a {show.hostTone} tone with {show.commercialBreaks} ad breaks.</p>
              <div className="mt-4 flex gap-2">
                <SecondaryButton className="px-3 py-2 text-xs"><ListMusic className="h-3.5 w-3.5" /> Edit Blocks</SecondaryButton>
                <SecondaryButton className="px-3 py-2 text-xs" onClick={() => onOpenBroadcastStudio?.('builder')}><Sparkles className="h-3.5 w-3.5" /> Rebuild With AI</SecondaryButton>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {tab === 'mixes' && (
        <div className="grid gap-3 px-4 sm:px-6 lg:grid-cols-2 lg:px-10">
            {DJ_MIXES.map((mix) => (
            <GlassCard key={mix.id} className="p-4">
              <div className="flex gap-3">
                <img src={mix.artwork} alt="" className="h-20 w-20 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white">{mix.title}</div>
                  <p className="mt-1 line-clamp-2 text-sm text-white/65">{mix.description}</p>
                  <div className="mt-2 text-xs text-white/50">{(mix.duration / 60).toFixed(0)} min - {mix.genre} - {mix.plays.toLocaleString()} plays</div>
                  <div className="mt-3 flex gap-2">
                    <SecondaryButton className="px-3 py-2 text-xs" onClick={() => playItem(djMixToPlaybackItem(mix), {
                      source: {
                        id: mix.id,
                        type: 'dj_mix',
                        label: 'DJ Mix',
                        title: mix.title,
                        subtitle: mix.djName,
                        image: mix.artwork,
                      },
                    })}>Play Mix</SecondaryButton>
                    <SecondaryButton className="px-3 py-2 text-xs" onClick={() => playQueue(mix.tracklist.map((entry) => entry.track), 0, {
                      id: `${mix.id}-tracklist`,
                      type: 'dj_mix',
                      label: 'DJ Mix',
                      title: mix.title,
                      subtitle: mix.djName,
                      image: mix.artwork,
                    })}>Play Tracklist</SecondaryButton>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {tab === 'requests' && (
        <div className="space-y-3 px-4 sm:px-6 lg:px-10">
          {LISTENER_REQUESTS.map((request) => (
            <GlassCard key={request.id} className="p-4">
              <div className="flex gap-3">
                <img src={request.listenerAvatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-white">{request.listenerName}</div>
                    <span className="text-xs text-white/45">{request.requestedAt}</span>
                  </div>
                  <div className="mt-1 text-sm text-white/75">{request.songTitle} - {request.artistName}</div>
                  <p className="mt-1 text-xs italic text-white/55">{request.message}</p>
                </div>
                <SecondaryButton
                  className="self-center px-3 py-2 text-xs"
                  onClick={() => addToQueue({
                    id: request.id,
                    title: request.songTitle ?? 'Listener request',
                    artist: request.artistName ?? request.listenerName,
                    art: request.listenerAvatar,
                    sourceType: 'live_show',
                    sourceLabel: 'Listener Request',
                    station: 'DJ Request Queue',
                  })}
                >
                  Queue
                </SecondaryButton>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {tab === 'archive' && (
        <div className="grid gap-3 px-4 sm:px-6 lg:grid-cols-2 lg:px-10">
          {REPLAY_ITEMS.map((replay) => (
            <GlassCard key={replay.id} className="p-4">
              <div className="flex gap-3">
                <img src={replay.artwork} alt="" className="h-20 w-20 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white">{replay.title}</div>
                  <div className="mt-1 text-xs text-white/50">{replay.host} - {replay.playedAt}</div>
                  <div className="mt-3 flex gap-2 text-[11px] text-white/55">
                    <span>{(replay.duration / 60).toFixed(0)} min</span>
                    <span>{replay.plays.toLocaleString()} plays</span>
                    <span>{replay.saves.toLocaleString()} saves</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
    </AccessGate>
  );
};

export default DJStudio;
