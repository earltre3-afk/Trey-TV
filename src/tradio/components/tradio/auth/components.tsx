import React from 'react';
import { CheckCircle2, Lock, Radio, ShieldCheck, Sparkles, UserPlus, Wifi, WifiOff } from 'lucide-react';
import { GlassCard, PrimaryButton, SecondaryButton, Chip } from '../ui';
import { MOCK_TRADIO_IDENTITIES, type MockIdentityKey } from './mockAuth';
import { MOCK_TRADIO_PRESCRIPTION_RESULTS } from './prescribeMe';
import { can, MODE_LABELS, ROLE_LABELS } from './roleUtils';
import { useTradioIdentity } from './useTradioIdentity';
import { useAccessRequests } from './AccessRequestsContext';
import { REQUEST_TYPE_LABEL, getNextAccessStep } from './accessRequests';
import { RequestStatusBadge } from './onboardingStates';
import type { RoleRequestType, TradioCapability, TradioMode, TradioRole, TradioVerificationState, TradioBroadcastAccessState } from './types';

export const RoleIndicator: React.FC<{ role?: TradioRole; mode?: TradioMode; size?: 'sm' | 'md' }> = ({ role, mode, size = 'md' }) => {
  const label = mode ? MODE_LABELS[mode] : role ? `${ROLE_LABELS[role]} Role` : 'Listener Mode';
  const tone = mode || role || 'fan';
  const colors: Record<string, string> = {
    listener: 'from-cyan-400/20 to-cyan-400/5 text-cyan-200 border-cyan-400/30',
    fan: 'from-cyan-400/20 to-cyan-400/5 text-cyan-200 border-cyan-400/30',
    artist: 'from-fuchsia-400/20 to-fuchsia-400/5 text-fuchsia-200 border-fuchsia-400/30',
    producer: 'from-purple-400/20 to-purple-400/5 text-purple-200 border-purple-400/30',
    dj: 'from-amber-400/20 to-amber-400/5 text-amber-200 border-amber-400/30',
    moderator: 'from-emerald-400/20 to-emerald-400/5 text-emerald-200 border-emerald-400/30',
    admin: 'from-red-400/20 to-red-400/5 text-red-200 border-red-400/30',
    owner: 'from-red-400/20 to-red-400/5 text-red-200 border-red-400/30',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border bg-gradient-to-r font-semibold ${size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'} ${colors[tone] || colors.listener}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};

export const ModeSwitcher: React.FC = () => {
  const {
    identity,
    availableModes,
    currentMode,
    setActiveMode,
    mockIdentityKey,
    setMockIdentityKey,
    identitySource,
    isConfigured,
    isLoading,
    isSignedOut,
    identityWarnings,
    profileBridgeStatus,
    bootstrapStatus,
    bootstrapPhase,
  } = useTradioIdentity();

  const phaseCopy: Record<string, string> = {
    fetching_bridge: 'Connecting to Trizzy Hub…',
    creating_profile: 'Creating your Tradio profile…',
    setting_up_mode: 'Setting up Listener Mode…',
    finalizing: 'Finishing Tradio setup…',
  };

  const statusCopy = isLoading && phaseCopy[bootstrapPhase]
    ? phaseCopy[bootstrapPhase]
    : identitySource === 'supabase'
      ? 'Connected to Trizzy Hub'
      : isConfigured && isSignedOut
        ? 'Signed out / Preview Mode'
        : 'Using demo identity';
  const statusIcon = identitySource === 'supabase' ? Wifi : WifiOff;
  const StatusIcon = statusIcon;

  return (
    <GlassCard className="p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-3">
          <img src={identity.avatar_url} alt="" className="h-10 w-10 rounded-xl border border-white/15 object-cover" />
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-white">
              <span className="text-signature text-2xl text-fuchsia-300 font-normal drop-shadow-[0_0_10px_rgba(217,70,239,0.5)] hover:scale-105 transition-transform duration-300 select-none block origin-left">{identity.display_name}</span>
            </div>
            <div className="truncate text-[10px] text-white/45">{identity.public_profile_uid}</div>
          </div>
        </div>
        {identitySource === 'mock' && (
          <select
            value={mockIdentityKey}
            onChange={(event) => setMockIdentityKey(event.target.value as MockIdentityKey)}
            className="max-w-[120px] rounded-xl border border-white/10 bg-black/35 px-2 py-2 text-[11px] font-bold text-white outline-none"
            aria-label="Mock identity"
          >
            {(Object.keys(MOCK_TRADIO_IDENTITIES) as MockIdentityKey[]).map((key) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${
          identitySource === 'supabase'
            ? 'border-emerald-300/25 bg-emerald-500/10 text-emerald-200'
            : 'border-cyan-300/20 bg-cyan-500/10 text-cyan-200'
        }`}>
          <StatusIcon className="h-3 w-3" /> {isLoading ? 'Checking Trizzy Hub' : statusCopy}
        </span>
        {profileBridgeStatus === 'profile_bridge_missing' && (
          <span className="rounded-full border border-amber-300/25 bg-amber-500/10 px-2.5 py-1 text-amber-200">Profile bridge not found</span>
        )}
        {!isLoading && bootstrapStatus === 'profile_not_created' && (
          <span className="rounded-full border border-fuchsia-300/25 bg-fuchsia-500/10 px-2.5 py-1 text-fuchsia-200">Tradio profile not created yet</span>
        )}
        {!isLoading && bootstrapStatus === 'database_not_ready' && (
          <span className="rounded-full border border-amber-300/25 bg-amber-500/10 px-2.5 py-1 text-amber-200">Profile setup paused: database not ready</span>
        )}
        {!isLoading && bootstrapStatus === 'setup_incomplete' && (
          <button className="rounded-full border border-cyan-300/30 bg-cyan-500/10 px-2.5 py-1 text-cyan-200 hover:bg-cyan-500/20 transition">Finish Tradio setup</button>
        )}
        {identityWarnings[0] && (
          <span className="max-w-full truncate rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-white/45">{identityWarnings[0]}</span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {availableModes.map((mode) => (
          <button
            key={mode}
            onClick={() => setActiveMode(mode)}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-wider transition ${
              currentMode === mode
                ? 'border-fuchsia-300/50 bg-fuchsia-500/15 text-fuchsia-100'
                : 'border-white/10 bg-white/[0.04] text-white/55 hover:text-white'
            }`}
          >
            {MODE_LABELS[mode]}
          </button>
        ))}
      </div>
    </GlassCard>
  );
};

export const VerificationBadge: React.FC<{ status: TradioVerificationState }> = ({ status }) => (
  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${
    status === 'verified' ? 'border-cyan-300/35 bg-cyan-500/10 text-cyan-200' :
    status === 'pending' ? 'border-amber-300/35 bg-amber-500/10 text-amber-200' :
    'border-white/10 bg-white/[0.04] text-white/45'
  }`}>
    <ShieldCheck className="h-3 w-3" /> {status.replace(/_/g, ' ')}
  </span>
);

export const BroadcastAccessBadge: React.FC<{ status: TradioBroadcastAccessState }> = ({ status }) => (
  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${
    status === 'cleared' ? 'border-emerald-300/35 bg-emerald-500/10 text-emerald-200' :
    ['pending', 'under_review', 'submitted'].includes(status) ? 'border-purple-300/35 bg-purple-500/10 text-purple-200' :
    'border-white/10 bg-white/[0.04] text-white/45'
  }`}>
    <Radio className="h-3 w-3" /> {status.replace(/_/g, ' ')}
  </span>
);

export const RoleCapabilityCard: React.FC<{ title: string; description: string; capability: TradioCapability }> = ({ title, description, capability }) => {
  const { identity } = useTradioIdentity();
  const allowed = can(identity, capability);
  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-white">{title}</div>
          <p className="mt-1 text-xs leading-relaxed text-white/55">{description}</p>
        </div>
        {allowed ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : <Lock className="h-5 w-5 text-white/30" />}
      </div>
      <Chip label={allowed ? 'available' : 'locked'} selected={allowed} />
    </GlassCard>
  );
};

export const ApplyForAccessCTA: React.FC<{ type?: RoleRequestType }> = ({ type = 'broadcast' }) => {
  const access = useAccessRequests();
  const copy = {
    artist: ['Artist access setup', 'Connect your Trey TV creator profile and request artist tools.'],
    producer: ['Producer access setup', 'Unlock beat uploads, packs, collabs, and DJ pitches.'],
    dj: ['DJ / host access setup', 'Request live show, mix, and host controls.'],
    broadcast: ['Apply for Broadcast Access', 'Request clearance for premium Tradio shows and scheduled broadcasts.'],
    verification: ['Request Verification', 'Submit profile evidence for creator trust and badges.'],
  }[type];

  const request = access?.getRequestFor(type);
  const canRequest = access?.canRequest(type) ?? true;
  // Pending/restricted requests are not re-submittable; rejected / needs_more_info can be resubmitted.
  const showButton = canRequest || (request && ['rejected', 'needs_more_info'].includes(request.status));
  const buttonLabel = request && ['rejected', 'needs_more_info'].includes(request.status)
    ? `Update ${REQUEST_TYPE_LABEL[type]} Request`
    : `Request ${REQUEST_TYPE_LABEL[type]}`;

  return (
    <GlassCard glow className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-black text-white">
            <UserPlus className="h-4 w-4 text-cyan-300" /> {copy[0]}
            {request && <RequestStatusBadge status={request.status} />}
          </div>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-white/60">
            {request ? getNextAccessStep(type, request.status) : copy[1]}
          </p>
        </div>
        {showButton && (
          <PrimaryButton className="px-4 py-3 text-xs" onClick={() => access?.openFlow(type)}>
            <Sparkles className="h-4 w-4" /> {buttonLabel}
          </PrimaryButton>
        )}
      </div>
    </GlassCard>
  );
};

const NEEDED_ACCESS_LABEL: Record<RoleRequestType, string> = {
  artist: 'Artist role',
  producer: 'Producer role',
  dj: 'DJ / Host role',
  broadcast: 'Broadcast access',
  verification: 'Verification',
};

export const RoleLockedState: React.FC<{ title: string; message: string; ctaType?: RoleRequestType }> = ({ title, message, ctaType }) => {
  const { currentRoleLabel } = useTradioIdentity();
  const access = useAccessRequests();
  const request = ctaType ? access?.getRequestFor(ctaType) : undefined;

  return (
    <div className="px-4 sm:px-6 lg:px-10">
      <GlassCard glow className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
            <Lock className="h-5 w-5 text-fuchsia-200" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-black tracking-tight text-white">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/62">{message}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-white/55">Current: {currentRoleLabel}</span>
              {ctaType && <span className="rounded-full border border-fuchsia-300/25 bg-fuchsia-500/10 px-2.5 py-1 text-fuchsia-200">Needs: {NEEDED_ACCESS_LABEL[ctaType]}</span>}
              {request && <RequestStatusBadge status={request.status} />}
            </div>
          </div>
        </div>
        {ctaType && <div className="mt-5"><ApplyForAccessCTA type={ctaType} /></div>}
      </GlassCard>
    </div>
  );
};

export const AccessGate: React.FC<{
  capability: TradioCapability;
  title: string;
  message: string;
  ctaType?: React.ComponentProps<typeof ApplyForAccessCTA>['type'];
  children: React.ReactNode;
}> = ({ capability, title, message, ctaType, children }) => {
  const { identity } = useTradioIdentity();
  if (!can(identity, capability)) return <RoleLockedState title={title} message={message} ctaType={ctaType} />;
  return <>{children}</>;
};

export const PrescriptionRail: React.FC<{
  title?: string;
  subtitle?: string;
  compact?: boolean;
}> = ({
  title = 'Prescription Radio',
  subtitle = 'Tuning the music side of your identity.',
  compact = false,
}) => {
  const { currentMode } = useTradioIdentity();

  const handleOpenConsole = () => {
    window.dispatchEvent(new CustomEvent('open-prescription-popout'));
  };

  return (
    <GlassCard glow className="overflow-hidden p-5 relative border border-white/10 bg-gradient-to-r from-purple-950/15 via-black/40 to-cyan-950/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
      <div className="absolute -top-16 -left-16 h-32 w-32 bg-purple-500/10 blur-[40px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-16 -right-16 h-32 w-32 bg-cyan-500/10 blur-[40px] pointer-events-none rounded-full" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="relative h-11 w-11 rounded-full shrink-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/10 border border-purple-500/30 flex items-center justify-center">
            <span className="absolute inset-0 bg-purple-500/20 blur-md animate-pulse" />
            <Sparkles className="h-5 w-5 text-purple-300 animate-pulse-orb" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-mono font-black uppercase tracking-[0.2em] text-white">{title}</h4>
              <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-cyan-300 font-mono">
                Rx Console
              </span>
            </div>
            <p className="mt-1 text-xs text-white/60 leading-relaxed max-w-xl">{subtitle} Formulate and synthesize acoustic, licensing, and broadcast strategies inside the bottom-anchored console.</p>
          </div>
        </div>

        <button
          onClick={handleOpenConsole}
          className="h-10 px-5 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/25 border border-purple-500/35 hover:border-purple-400/60 text-white font-mono font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.1)] active:scale-95"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-300" /> Tune Sound Formula
        </button>
      </div>
    </GlassCard>
  );
};
