import React from 'react';
import { CheckCircle2, Disc3, Lock, Mic2, Music2, Radio, ShieldCheck, Sparkles } from 'lucide-react';
import { GlassCard, PrimaryButton, SecondaryButton } from '../ui';
import { RoleIndicator } from './components';
import { useTradioIdentity } from './useTradioIdentity';
import { useAccessRequests } from './AccessRequestsContext';
import { REQUEST_TYPE_LABEL, getNextAccessStep } from './accessRequests';
import { RequestStatusBadge, RequestEventTimeline } from './onboardingStates';
import { AccessReviewQueue } from './AccessReviewQueue';
import { ROLE_LABELS } from './roleUtils';
import type { RoleProfileType } from './roleProfile';
import type { RoleRequestType, TradioMode } from './types';

/** Role request types that have a creator profile page. */
const PROFILE_ROLE_TYPES: RoleRequestType[] = ['artist', 'producer', 'dj'];
const asProfileRole = (type: RoleRequestType): RoleProfileType | null =>
  (PROFILE_ROLE_TYPES.includes(type) ? (type as RoleProfileType) : null);

interface Lane {
  type: RoleRequestType;
  title: string;
  benefit: string;
  Icon: React.FC<{ className?: string }>;
}

const LANES: Lane[] = [
  { type: 'artist', title: 'Artist', benefit: 'Releases · Artist station · Playlists · Premieres', Icon: Music2 },
  { type: 'producer', title: 'Producer', benefit: 'Beat catalog · Packs · Collabs · Artist pitches', Icon: Disc3 },
  { type: 'dj', title: 'DJ / Host', benefit: 'Live shows · Mixes · Requests · Song Wars hosting', Icon: Mic2 },
  { type: 'verification', title: 'Verification', benefit: 'Creator trust badge · Premiere eligibility', Icon: ShieldCheck },
  { type: 'broadcast', title: 'Broadcast Access', benefit: 'Premium shows · Scheduled broadcasts', Icon: Radio },
];

/** Access requests to surface as primary CTAs for each active mode (Task 8). */
const MODE_SUGGESTIONS: Record<TradioMode, RoleRequestType[]> = {
  listener: ['artist', 'producer', 'dj'],
  artist: ['verification', 'broadcast', 'producer'],
  producer: ['dj', 'verification'],
  dj: ['broadcast', 'verification'],
  admin: [],
};

const LaneCard: React.FC<{ lane: Lane; onOpenRoleProfile?: (role: RoleProfileType, ownerView?: boolean) => void }> = ({ lane, onOpenRoleProfile }) => {
  const access = useAccessRequests();
  const request = access?.getRequestFor(lane.type);
  const canRequest = access?.canRequest(lane.type) ?? false;
  const status = request?.status ?? 'not_started';
  const isApproved = status === 'approved' || (!request && !canRequest);
  const profileRole = asProfileRole(lane.type);

  return (
    <GlassCard className="flex h-full flex-col justify-between p-4">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-400/25 bg-purple-500/10 text-purple-200">
            {isApproved ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : canRequest ? <lane.Icon className="h-5 w-5" /> : <Lock className="h-5 w-5 text-white/35" />}
          </div>
          {request ? <RequestStatusBadge status={status} /> : isApproved ? <RequestStatusBadge status="approved" /> : null}
        </div>
        <div className="mt-3 text-base font-bold text-white">{lane.title}</div>
        <p className="mt-1 text-xs leading-relaxed text-white/55">{lane.benefit}</p>
        {request?.reviewer_note && (
          <p className="mt-2 text-[11px] italic leading-relaxed text-white/45">{request.reviewer_note}</p>
        )}
        <p className="mt-2 text-[11px] leading-relaxed text-cyan-200/70">{getNextAccessStep(lane.type, status)}</p>
      </div>
      <div className="mt-4">
        {isApproved ? (
          profileRole && onOpenRoleProfile ? (
            <SecondaryButton className="w-full px-4 py-2.5 text-[11px]" onClick={() => onOpenRoleProfile(profileRole, true)}>
              {status === 'approved' ? 'Set Up Profile' : 'View Profile'}
            </SecondaryButton>
          ) : (
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Active</span>
          )
        ) : canRequest ? (
          <SecondaryButton className="w-full px-4 py-2.5 text-[11px]" onClick={() => access?.openFlow(lane.type)}>
            Request {REQUEST_TYPE_LABEL[lane.type]}
          </SecondaryButton>
        ) : (
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200/80">{status === 'restricted' ? 'Restricted' : 'In review'}</span>
        )}
      </div>
    </GlassCard>
  );
};

/**
 * TRADIO PASS 4F — Role onboarding gateway / Access Center.
 * Premium surface showing current standing and request CTAs for every lane.
 */
export const AccessCenter: React.FC<{ onOpenRoleProfile?: (role: RoleProfileType, ownerView?: boolean) => void }> = ({ onOpenRoleProfile }) => {
  const { identity, currentMode, currentRoleLabel } = useTradioIdentity();
  const access = useAccessRequests();
  const approvedRoles = identity.roles.filter((g) => g.role_status === 'active' || g.role_status === 'approved');
  const pending = access?.accessState.pending_requests ?? [];
  const suggestions = MODE_SUGGESTIONS[currentMode].filter((type) => access?.canRequest(type));

  return (
    <GlassCard glow className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">Tradio Access Center</span>
            <RoleIndicator mode={currentMode} size="sm" />
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              access?.dataSource === 'supabase'
                ? 'border-emerald-300/25 bg-emerald-500/10 text-emerald-200'
                : 'border-amber-300/25 bg-amber-500/10 text-amber-200'
            }`}>
              {access?.dataSource === 'supabase' ? 'Live' : 'Local / demo'}
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Grow into new lanes</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/62">
            You're operating as {currentRoleLabel}. Everyone starts as a listener — request access to unlock artist,
            producer, and DJ/host tools. Roles are reviewed before activation, never self-granted.
          </p>
        </div>
        <div className="shrink-0 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/45">Approved roles</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {approvedRoles.map((grant) => (
              <span key={grant.id} className="rounded-full border border-emerald-300/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-200">
                {ROLE_LABELS[grant.role]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Mode-aware suggested next steps */}
      {suggestions.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-white/45">Suggested for {currentRoleLabel}</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((type) => (
              <PrimaryButton key={type} className="px-4 py-2.5 text-[11px]" onClick={() => access?.openFlow(type)}>
                <Sparkles className="h-3.5 w-3.5" /> Request {REQUEST_TYPE_LABEL[type]}
              </PrimaryButton>
            ))}
          </div>
        </div>
      )}

      {/* Pending requests */}
      {pending.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-white/45">Your requests in review</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {pending.map((request) => (
              <div key={request.id} className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-white">{REQUEST_TYPE_LABEL[request.request_type]}</div>
                    <div className="truncate text-[11px] text-white/45">{getNextAccessStep(request.request_type, request.status)}</div>
                  </div>
                  <RequestStatusBadge status={request.status} />
                </div>
                {(request.events?.length ?? 0) > 0 && (
                  <div className="mt-2.5 border-t border-white/6 pt-2.5">
                    <RequestEventTimeline events={request.events} compact />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All lanes */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {LANES.map((lane) => <LaneCard key={lane.type} lane={lane} onOpenRoleProfile={onOpenRoleProfile} />)}
      </div>

      {/* Admin review prototype (Pass 4H) — only rendered for admin/owner in admin mode. */}
      {access?.isAdmin && (
        <div className="mt-6">
          <AccessReviewQueue />
        </div>
      )}
    </GlassCard>
  );
};

export default AccessCenter;
