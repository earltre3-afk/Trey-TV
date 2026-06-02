import React from 'react';
import { BarChart3, CalendarDays, Disc3, Gavel, Heart, Lock, Mic2, Music2, Radio, Send, ShieldCheck, Sparkles, UploadCloud, Users, Wand2 } from 'lucide-react';
import { TopBar, GlassCard, PrimaryButton, SecondaryButton, Chip, Waveform } from '../ui';
import { ARTIST_STATS } from '../data';
import { ApplyForAccessCTA, BroadcastAccessBadge, ModeSwitcher, PrescriptionRail, RoleIndicator, VerificationBadge } from '../auth/components';
import { AccessCenter } from '../auth/AccessCenter';
import { SignalTestEntryCard } from '../../universe/SignalTestEntryCard';
import { useMessengerBridge } from '../../universe/MessengerBridgeContext';
import type { SignalTestState } from '@/tradio/lib/universe/signalTest';
import { useTradioIdentity } from '../auth/useTradioIdentity';
import { can, canRequestBroadcastAccess, MODE_LABELS } from '../auth/roleUtils';
import type { TradioCapability, TradioMode } from '../auth/types';

// Signal Test lives in the Trey TV parent. This Tradio surface only exposes the
// discoverability card; `onStart` is wired by the parent to route to /signal-test.
const SIGNAL_TEST_STATE: SignalTestState = { status: 'not_taken' };

export type StudioDestination = 'artistHub' | 'producerHub' | 'djStudio' | 'showBuilder' | 'release' | 'analytics' | 'songwars' | 'songwars_setup' | 'songwars_stage' | 'broadcastStudio' | 'legalAdmin' | 'artistProfile' | 'producerProfile' | 'djProfile';

const launchCards: {
  key: StudioDestination;
  title: string;
  eyebrow: string;
  description: string;
  Icon: React.FC<{ className?: string }>;
  capability?: TradioCapability;
}[] = [
  { key: 'broadcastStudio', title: 'Broadcast Studio', eyebrow: 'Invite-Only Suite', description: 'Build live shows, DJ mixes, station premieres, and AI-powered radio experiences.', Icon: Radio, capability: 'create-broadcast' },
  { key: 'artistHub', title: 'Artist Hub', eyebrow: 'Artist Studio', description: 'Manage releases, playlists, fan drops, and station premieres.', Icon: Music2, capability: 'release-music' },
  { key: 'producerHub', title: 'Producer Hub', eyebrow: 'Beat Network', description: 'Upload beats, package catalogs, pitch artists, and reach DJs.', Icon: Disc3, capability: 'upload-beat' },
  { key: 'djStudio', title: 'DJ Studio', eyebrow: 'Broadcast', description: 'Build live shows, schedule mixes, handle requests, and archive replays.', Icon: Mic2, capability: 'host-song-war' },
  { key: 'showBuilder', title: 'AI Show Builder', eyebrow: 'Live AI', description: 'Generate full radio timelines with host notes, music blocks, and ad slots.', Icon: Wand2 },
  { key: 'release', title: 'Instant Release', eyebrow: 'Drop Music', description: 'Publish or schedule a track directly into Tradio stations.', Icon: UploadCloud, capability: 'release-music' },
  { key: 'analytics', title: 'Analytics', eyebrow: 'Pulse', description: 'Track plays, saves, fan growth, release momentum, and station health.', Icon: BarChart3 },
  { key: 'legalAdmin', title: 'Legal Operations', eyebrow: 'Admin Review', description: 'Review legal intake, privacy requests, appeals, deletion queue, and acceptance audit records.', Icon: Gavel, capability: 'admin-platform' },
];

const cardsByMode: Record<TradioMode, StudioDestination[]> = {
  listener: ['songwars', 'showBuilder', 'broadcastStudio'],
  artist: ['artistHub', 'release', 'broadcastStudio', 'songwars', 'analytics'],
  producer: ['producerHub', 'broadcastStudio', 'showBuilder', 'analytics'],
  dj: ['djStudio', 'broadcastStudio', 'showBuilder', 'songwars_stage'],
  admin: ['broadcastStudio', 'songwars', 'artistHub', 'producerHub', 'djStudio', 'legalAdmin', 'analytics'],
};

const modeQuickCards: Record<TradioMode, { title: string; sub: string; icon: React.ReactNode; destination: StudioDestination; capability?: TradioCapability }[]> = {
  listener: [
    { title: 'Saved Stations', sub: 'Jump back into followed stations.', icon: <Heart className="h-4 w-4" />, destination: 'analytics' },
    { title: 'Fan Communities', sub: 'Requests, chat, polls, and reactions.', icon: <Users className="h-4 w-4" />, destination: 'songwars' },
    { title: 'Request Broadcast Access', sub: 'Prepare the premium host application.', icon: <Radio className="h-4 w-4" />, destination: 'broadcastStudio', capability: 'request-broadcast-access' },
  ],
  artist: [
    { title: 'Instant Release', sub: 'Drop or schedule music.', icon: <UploadCloud className="h-4 w-4" />, destination: 'release', capability: 'release-music' },
    { title: 'Artist Station', sub: 'Manage station premieres.', icon: <Radio className="h-4 w-4" />, destination: 'artistHub', capability: 'create-artist-station' },
    { title: 'Release Analytics', sub: 'Track fans, saves, and station lift.', icon: <BarChart3 className="h-4 w-4" />, destination: 'analytics' },
  ],
  producer: [
    { title: 'Beat Catalog', sub: 'Upload, tag, and pitch beats.', icon: <Disc3 className="h-4 w-4" />, destination: 'producerHub', capability: 'upload-beat' },
    { title: 'DJ Opportunities', sub: 'Send beat packs to live shows.', icon: <Radio className="h-4 w-4" />, destination: 'producerHub', capability: 'upload-beat' },
    { title: 'Producer Spotlight', sub: 'Build a featured broadcast block.', icon: <Sparkles className="h-4 w-4" />, destination: 'broadcastStudio', capability: 'create-broadcast' },
  ],
  dj: [
    { title: 'Go Live Desk', sub: 'Shows, mixes, requests, and replay archive.', icon: <Mic2 className="h-4 w-4" />, destination: 'djStudio', capability: 'host-song-war' },
    { title: 'Live Schedule', sub: 'Plan blocks and upcoming broadcasts.', icon: <CalendarDays className="h-4 w-4" />, destination: 'djStudio' },
    { title: 'Song Wars Hosting', sub: 'Open host controls for battle sessions.', icon: <Radio className="h-4 w-4" />, destination: 'songwars_stage', capability: 'host-song-war' },
  ],
  admin: [
    { title: 'Manage Broadcast Access', sub: 'Review requests and grants.', icon: <ShieldCheck className="h-4 w-4" />, destination: 'broadcastStudio', capability: 'admin-platform' },
    { title: 'Manage Song Wars', sub: 'Feature, moderate, and archive battles.', icon: <Radio className="h-4 w-4" />, destination: 'songwars', capability: 'admin-platform' },
    { title: 'Legal Operations', sub: 'Review intake, DMCA, appeals, deletion, and audit queues.', icon: <Gavel className="h-4 w-4" />, destination: 'legalAdmin', capability: 'admin-platform' },
  ],
};

export const StudioScreen: React.FC<{
  onOpenRelease: () => void;
  onOpenDestination?: (destination: StudioDestination) => void;
}> = ({ onOpenRelease, onOpenDestination }) => {
  const { identity, currentMode, currentRoleLabel } = useTradioIdentity();
  const messengerBridge = useMessengerBridge();
  const visibleLaunchCards = launchCards.filter((card) => cardsByMode[currentMode].includes(card.key) || currentMode === 'admin');

  const open = (destination: StudioDestination) => {
    if (destination === 'release') onOpenRelease();
    else onOpenDestination?.(destination);
  };

  return (
    <div className="space-y-8 pb-4 lg:space-y-10">
      <TopBar title="Studio" />

      <div className="px-4 sm:px-6 lg:px-10">
        <GlassCard glow className="p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <RoleIndicator mode={currentMode} />
                <Chip label="Trey TV music layer" selected icon={<Sparkles className="h-3.5 w-3.5" />} />
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">Tradio Studio</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">
                Operating as {currentRoleLabel}. Tradio mode changes visible creator, broadcast, and moderation tools without changing the shared Trey TV profile.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-3xl border border-white/8 bg-white/[0.03] p-3">
              <img src={identity.avatar_url} alt="" className="h-14 w-14 rounded-2xl object-cover" />
              <div>
                <div className="text-sm font-semibold text-white">{identity.display_name}</div>
                <div className="text-xs text-white/50">{identity.public_profile_uid}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  <VerificationBadge status={identity.verification_status} />
                  <BroadcastAccessBadge status={identity.broadcast_access_status} />
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="px-4 sm:px-6 lg:px-10">
        <ModeSwitcher />
      </div>

      <div className="px-4 sm:px-6 lg:px-10">
        <AccessCenter
          onOpenRoleProfile={(role) => open(role === 'artist' ? 'artistProfile' : role === 'producer' ? 'producerProfile' : 'djProfile')}
        />
      </div>

      <div className="px-4 sm:px-6 lg:px-10">
        <SignalTestEntryCard state={SIGNAL_TEST_STATE} onStart={messengerBridge?.parentHandlers.onOpenSignalTest} />
      </div>

      <div className="px-4 sm:px-6 lg:px-10">
        <div className="mb-3 text-lg font-bold text-white">Creator Profiles</div>
        <div className="grid gap-3 sm:grid-cols-3">
          {([
            { role: 'artist' as const, label: 'Artist Profile', destination: 'artistProfile' as StudioDestination, Icon: Music2 },
            { role: 'producer' as const, label: 'Producer Profile', destination: 'producerProfile' as StudioDestination, Icon: Disc3 },
            { role: 'dj' as const, label: 'DJ / Host Profile', destination: 'djProfile' as StudioDestination, Icon: Mic2 },
          ]).map(({ role, label, destination, Icon }) => (
            <button key={role} onClick={() => open(destination)} className="group text-left">
              <GlassCard className="flex items-center gap-3 p-4 transition-all duration-300 group-hover:border-purple-300/30 group-hover:bg-purple-500/[0.04]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-400/25 bg-purple-500/10 text-purple-200">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white">{label}</div>
                  <div className="text-[11px] text-white/50">Activation-aware · owner & public view</div>
                </div>
              </GlassCard>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 px-4 sm:grid-cols-3 sm:px-6 lg:px-10">
        {[
          ['Plays', ARTIST_STATS.plays.toLocaleString(), 'Station and release plays'],
          ['Fan Saves', ARTIST_STATS.likes.toLocaleString(), 'Saved tracks and playlists'],
          ['New Fans', ARTIST_STATS.newFollowers.toLocaleString(), 'Last 7 days'],
        ].map(([label, value, sub]) => (
          <GlassCard key={label} className="p-4">
            <div className="text-xs text-white/50">{label}</div>
            <div className="mt-1 text-2xl font-bold text-white">{value}</div>
            <div className="mt-1 text-[11px] text-cyan-300">{sub}</div>
          </GlassCard>
        ))}
      </div>

      <div className="px-4 sm:px-6 lg:px-10">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-white">Studio Launch Pads</div>
            <div className="text-xs text-white/50">{MODE_LABELS[currentMode]} surfaces the tools that match your active lane</div>
          </div>
          <Waveform className="hidden h-6 w-16 sm:flex" bars={12} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleLaunchCards.map(({ key, title, eyebrow, description, Icon, capability }) => {
            const allowed = !capability || can(identity, capability);
            return (
              <button key={key} onClick={() => allowed && open(key)} className="group text-left">
                <GlassCard className="h-full p-4 transition-all duration-300 group-hover:border-purple-300/30 group-hover:bg-purple-500/[0.04]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/25 bg-purple-500/10">
                      {allowed ? <Icon className="h-5 w-5 text-purple-200" /> : <Lock className="h-5 w-5 text-white/35" />}
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">{allowed ? eyebrow : 'Locked'}</span>
                  </div>
                  <div className="mt-4 text-lg font-bold text-white">{title}</div>
                  <p className="mt-2 min-h-[42px] text-sm leading-relaxed text-white/62">{description}</p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-cyan-300">
                    {allowed ? 'Open module' : 'Switch/request access'} <Radio className="h-3.5 w-3.5" />
                  </div>
                </GlassCard>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 px-4 sm:px-6 lg:grid-cols-3 lg:px-10">
        {modeQuickCards[currentMode].map((item) => {
          const allowed = !item.capability || can(identity, item.capability);
          return (
            <GlassCard key={item.title} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-purple-200">{item.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white">{item.title}</div>
                  <p className="mt-1 text-xs leading-relaxed text-white/55">{item.sub}</p>
                  <button onClick={() => allowed && open(item.destination)} className={`mt-3 text-xs font-bold ${allowed ? 'text-cyan-300' : 'text-white/35'}`}>
                    {allowed ? 'Open' : 'Access required'}
                  </button>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {(canRequestBroadcastAccess(identity) || can(identity, 'request-verification')) && (
        <div className="px-4 sm:px-6 lg:px-10">
          <ApplyForAccessCTA type={canRequestBroadcastAccess(identity) ? 'broadcast' : 'verification'} />
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-10">
        <PrescriptionRail
          title={
            currentMode === 'artist' ? 'Prescribe my next release strategy' :
            currentMode === 'producer' ? 'Prescribe artists for this beat' :
            currentMode === 'dj' ? "Prescribe tonight's show flow" :
            currentMode === 'admin' ? 'Prescribe platform moves' :
            'Prescribe what I should hear now'
          }
          subtitle="Role-aware prescriptions respect your active Tradio mode and stay connected to Trey TV identity."
        />
      </div>

      <div className="px-4 sm:px-6 lg:px-10">
        <div className="mb-4">
          <div className="text-lg font-bold text-white">Song Wars Creator Room</div>
          <div className="text-xs text-white/50">Launch, configure, and control live PvP battle sessions</div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { title: 'Create Song War', sub: 'Setup round constraints, choose competitors, select tracks, and schedule.', action: 'songwars_setup', badge: 'Creator', capability: 'access-studio' as TradioCapability },
            { title: 'Manage Battles', sub: 'Archive sessions, update badges, override ledger winner, or feature battles.', action: 'songwars', badge: 'Admin Only', capability: 'admin-platform' as TradioCapability },
            { title: 'Host Battle Session', sub: 'Open live voting, queue tracks, reveal round winners, and trigger ad breaks.', action: 'songwars_stage', badge: 'DJ / Host', capability: 'host-song-war' as TradioCapability },
          ].map((item) => {
            const allowed = can(identity, item.capability);
            return (
              <GlassCard key={item.title} className="flex flex-col justify-between p-4 transition-all hover:border-purple-500/25 hover:bg-purple-500/[0.02]">
                <div>
                  <span className="inline-block rounded border border-purple-400/20 bg-purple-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-purple-300">{item.badge}</span>
                  <h4 className="mt-3 text-sm font-bold text-white">{item.title}</h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/50">{item.sub}</p>
                </div>
                <button
                  onClick={() => allowed && open(item.action as StudioDestination)}
                  className={`mt-4 flex items-center gap-1 text-left text-xs font-semibold transition-colors ${allowed ? 'text-cyan-300 hover:text-cyan-200' : 'text-white/35'}`}
                >
                  {allowed ? 'Launch Panel' : 'Locked'}
                </button>
              </GlassCard>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-10">
        <GlassCard className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Send className="h-4 w-4 text-fuchsia-300" /> Recommended Next Moves
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              ['Release to Tradio', 'Push a track into station rotation.', 'release', 'release-music'],
              ['Build Show With AI', 'Plan a premiere or live DJ block.', 'showBuilder', undefined],
              ['Pitch Beat', 'Match a producer loop with an artist.', 'producerHub', 'upload-beat'],
            ].map(([title, sub, key, capability]) => {
              const allowed = !capability || can(identity, capability as TradioCapability);
              return (
                <button key={title} onClick={() => allowed && open(key as StudioDestination)} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-left">
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <div className="mt-1 text-xs text-white/55">{sub}</div>
                  {!allowed && <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-white/35">Access required</div>}
                </button>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="text-sm font-semibold text-white">Mode Permissions</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {identity.roles.map((grant) => <Chip key={grant.id} label={`${grant.role} ${grant.role_status}`} selected={grant.role_status === 'active'} />)}
          </div>
          <PrimaryButton className="mt-4 w-full py-3" onClick={() => open('showBuilder')}>
            <Sparkles className="h-4 w-4" /> Build Show With AI
          </PrimaryButton>
          <SecondaryButton className="mt-2 w-full py-3" onClick={() => can(identity, 'release-music') && open('release')}>
            <UploadCloud className="h-4 w-4" /> Release to Tradio
          </SecondaryButton>
        </GlassCard>
      </div>
    </div>
  );
};

export default StudioScreen;
