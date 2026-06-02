import React, { useEffect, useState } from 'react';
import { BarChart3, ChevronLeft, ExternalLink, Eye, Heart, Link2, Lock, MessageCircle, PenSquare, Play, Radio, Share2, Sparkles } from 'lucide-react';
import { BadgeRow, type UniverseBadgeSpec } from '../../universe/RoleBadge';
import { useMessengerBridge } from '../../universe/MessengerBridgeContext';
import { createTradioMessageContext, type MessageSourceSurface, type SourceEntityType } from '@/tradio/lib/universe/messageContext';
import { GlassCard, PrimaryButton, SecondaryButton } from '../ui';
import {
  BroadcastAccessBadge,
  PrescriptionRail,
  VerificationBadge,
} from '../auth/components';
import {
  NeedsMoreInfoState,
  OnboardingState,
  RequestEventTimeline,
  RequestRejectedState,
  RoleRestrictedState,
} from '../auth/onboardingStates';
import { useTradioIdentity } from '../auth/useTradioIdentity';
import { useAccessRequests } from '../auth/AccessRequestsContext';
import { REQUEST_TYPE_LABEL } from '../auth/accessRequests';
import {
  ROLE_PROFILE_SECTIONS,
  getRoleProfileActivationState,
  getRoleProfileOwnerContext,
  getRoleProfilePublicUrl,
  type RoleProfileType,
} from '../auth/roleProfile';
import type { RoleRequestType } from '../auth/types';
import {
  getCreatorProfileByPublicUid,
  getCreatorProfileByHandle,
  getMyCreatorProfile,
} from '../auth/creatorProfileService';
import type { CreatorProfileServiceResult } from '../auth/creatorProfileTypes';
import { RoleProfileEditor } from './RoleProfileEditor';

const ROLE_TITLE: Record<RoleProfileType, string> = { artist: 'Artist Profile', producer: 'Producer Profile', dj: 'DJ / Host Profile' };
const ROLE_REQUEST: Record<RoleProfileType, RoleRequestType> = { artist: 'artist', producer: 'producer', dj: 'dj' };
const ROLE_MESSAGE_CTA: Record<RoleProfileType, string> = { artist: 'Message Artist', producer: 'Contact Producer', dj: 'Message Host' };
const ROLE_MESSAGE_SURFACE: Record<RoleProfileType, MessageSourceSurface> = { artist: 'artist_profile', producer: 'producer_profile', dj: 'dj_profile' };
const ROLE_ENTITY_TYPE: Record<RoleProfileType, SourceEntityType> = { artist: 'artist', producer: 'producer', dj: 'dj' };

const Field: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-black/20 px-3 py-2">
    <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{label}</span>
    <span className="min-w-0 truncate font-mono text-[11px] text-white/70">{value || '—'}</span>
  </div>
);

export const RoleProfilePage: React.FC<{
  role: RoleProfileType;
  ownerView?: boolean;
  lookup?: { publicProfileUid?: string; handle?: string };
  onBack: () => void;
  onOpenPublicShell?: (role: RoleProfileType) => void;
  onOpenBroadcastStudio?: () => void;
}> = ({ role, ownerView = true, lookup, onBack, onOpenPublicShell, onOpenBroadcastStudio }) => {
  const { identity, currentRoleLabel } = useTradioIdentity();
  const access = useAccessRequests();
  const messengerBridge = useMessengerBridge();
  const request = access?.getRequestFor(ROLE_REQUEST[role]);
  const canRequest = access?.canRequest(ROLE_REQUEST[role]) ?? false;

  // Service state for public profile lookups
  const [serviceResult, setServiceResult] = useState<CreatorProfileServiceResult | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileNotFound, setProfileNotFound] = useState(false);

  // Load public profile via service if lookup params provided
  useEffect(() => {
    if (!lookup || ownerView) {
      setServiceResult(null);
      setIsLoadingProfile(false);
      setProfileNotFound(false);
      return;
    }

    let active = true;
    const loadPublicProfile = async () => {
      setIsLoadingProfile(true);
      setProfileNotFound(false);

      let result: CreatorProfileServiceResult | null = null;

      if (lookup.publicProfileUid) {
        result = await getCreatorProfileByPublicUid(role, lookup.publicProfileUid);
      } else if (lookup.handle) {
        result = await getCreatorProfileByHandle(role, lookup.handle);
      }

      if (active) {
        if (result) {
          if (result.backendStatus === 'not_found') {
            setProfileNotFound(true);
          }
          setServiceResult(result);
        }
        setIsLoadingProfile(false);
      }
    };

    loadPublicProfile().catch((err) => {
      if (active) {
        console.error('[RoleProfilePage] Error loading public profile:', err);
        setIsLoadingProfile(false);
      }
    });

    return () => {
      active = false;
    };
  }, [lookup, ownerView, role]);

  const [profileResult, setProfileResult] = useState<CreatorProfileServiceResult | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Load owner profile data
  useEffect(() => {
    if (!ownerView) return;

    let active = true;
    const fetchMyProfile = async () => {
      const res = await getMyCreatorProfile(role, identity);
      if (active) {
        setProfileResult(res);
      }
    };

    fetchMyProfile();
    return () => { active = false; };
  }, [role, identity, ownerView, reloadTrigger]);

  // Handle reload profile events (e.g. from editor)
  useEffect(() => {
    const handleReload = () => setReloadTrigger(prev => prev + 1);
    window.addEventListener('reload-profile', handleReload);
    return () => window.removeEventListener('reload-profile', handleReload);
  }, []);

  const [viewMode, setViewMode] = useState<'owner' | 'public'>(ownerView ? 'owner' : 'public');
  const isOwner = viewMode === 'owner';

  const visibility = ownerView ? (profileResult?.visibility || 'private') : (serviceResult?.visibility || 'private');

  const activation = getRoleProfileActivationState(identity, role, {
    requestStatus: request?.status,
    requestNote: request?.reviewer_note,
    canRequest,
    visibility,
  });

  const baseOwner = getRoleProfileOwnerContext(identity, role);
   
  const profileRecord: any = ownerView ? profileResult?.profile : serviceResult?.profile;

  const owner = {
    ...baseOwner,
    display_name: (role === 'artist'
      ? profileRecord?.artist_name
      : role === 'producer'
        ? profileRecord?.producer_name
        : profileRecord?.dj_name) || baseOwner.display_name,
    avatar_url: profileRecord?.avatar_url || baseOwner.avatar_url,
    banner_url: profileRecord?.banner_url || baseOwner.banner_url,
    bio: profileRecord?.bio || baseOwner.bio,
    genres: profileRecord?.tradio_genres || baseOwner.genres,
  };

  const openFlow = () => access?.openFlow(ROLE_REQUEST[role]);

  const Header = (
    <div className="flex items-center justify-between px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-3 sm:px-6 lg:px-10">
      <button onClick={onBack} aria-label="Back" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-white hover:border-white/25 transition">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">{ROLE_TITLE[role]}</div>
      <div className="w-10" />
    </div>
  );

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen pb-16">
        {Header}
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-16 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400" />
          <p className="text-sm text-white/50">Loading {role} profile...</p>
        </div>
      </div>
    );
  }

  // ── Profile not found state ────────────────────────────────────────────────
  if (profileNotFound || (lookup && serviceResult?.backendStatus === 'not_found')) {
    return (
      <div className="min-h-screen pb-16">
        {Header}
        <div className="px-4 sm:px-6 lg:px-10">
          <GlassCard className="mt-8 p-8 text-center">
            <div className="text-5xl mb-3">🔍</div>
            <h2 className="text-2xl font-bold text-white">Profile Not Found</h2>
            <p className="mt-2 text-white/50">
              We couldn't find a {ROLE_TITLE[role].toLowerCase()} with {lookup?.handle ? `@${lookup.handle}` : lookup?.publicProfileUid}.
            </p>
            <p className="mt-1 text-xs text-white/40">It may not be public yet or the URL might be incorrect.</p>
            <SecondaryButton className="mt-6 px-6 py-2.5 text-sm" onClick={onBack}>Back</SecondaryButton>
          </GlassCard>
        </div>
      </div>
    );
  }

  // ── Non-active states ──────────────────────────────────────────────────────
  if (activation.status !== 'active_public' && activation.status !== 'active_private' && activation.status !== 'approved_incomplete') {
    return (
      <div className="min-h-screen pb-16">
        {Header}
        <div className="px-4 sm:px-6 lg:px-10">
          {activation.status === 'pending_review' && (
            <OnboardingState
              icon={<Sparkles className="h-5 w-5" />}
              eyebrow={REQUEST_TYPE_LABEL[ROLE_REQUEST[role]]}
              status="pending"
              title={`${owner.roleLabel} access under review`}
              message="Your request is with the review team. Your profile activates automatically once it's approved."
            />
          )}
          {activation.status === 'needs_more_info' && (
            <NeedsMoreInfoState reason={activation.reviewerNote} onContinue={openFlow} />
          )}
          {activation.status === 'rejected' && (
            <RequestRejectedState reason={activation.reviewerNote} onResubmit={canRequest ? openFlow : undefined} />
          )}
          {(activation.status === 'restricted' || activation.status === 'suspended') && (
            <RoleRestrictedState reason={activation.reviewerNote} />
          )}
          {(activation.status === 'locked' || activation.status === 'request_available') && (
            <OnboardingState
              icon={<Lock className="h-5 w-5" />}
              eyebrow={REQUEST_TYPE_LABEL[ROLE_REQUEST[role]]}
              title={`${owner.roleLabel} access required`}
              message={`Set up a ${owner.roleLabel} profile to unlock these tools. Every creator starts as a listener and requests access — roles are reviewed, never self-granted.`}
              primaryLabel={canRequest ? `Request ${REQUEST_TYPE_LABEL[ROLE_REQUEST[role]]}` : undefined}
              onPrimary={canRequest ? openFlow : undefined}
            />
          )}
          {request?.events && request.events.length > 0 && activation.status === 'pending_review' && (
            <GlassCard className="mt-3 p-4">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/40">Request timeline</div>
              <RequestEventTimeline events={request.events} compact />
            </GlassCard>
          )}
        </div>
      </div>
    );
  }

  // ── Active states (approved_incomplete / active_public / active_private) ─────
  if (isEditing) {
    return (
      <RoleProfileEditor
        role={role}
        identity={identity}
        onClose={() => {
          setIsEditing(false);
          setReloadTrigger(prev => prev + 1);
        }}
      />
    );
  }

  const sections = ROLE_PROFILE_SECTIONS[role].filter((section) => isOwner || !section.ownerOnly);

  return (
    <div className="min-h-screen pb-16">
      {Header}

      {/* Identity band */}
      <div className="px-4 sm:px-6 lg:px-10">
        <GlassCard glow className="overflow-hidden">
          <div className="relative h-28 w-full bg-gradient-to-r from-fuchsia-600/30 via-purple-600/20 to-cyan-500/20">
            {owner.banner_url && <img src={owner.banner_url} alt="" className="h-full w-full object-cover opacity-60" />}
          </div>
          <div className="relative px-5 pb-5">
            <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <img src={owner.avatar_url} alt={owner.display_name} className="h-20 w-20 rounded-2xl border-2 border-[#0A0A0F] object-cover shadow-lg" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-2xl font-black tracking-tight text-white">{owner.display_name}</h1>
                    {owner.verified && <VerificationBadge status="verified" />}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <BadgeRow
                      size="sm"
                      badges={[
                        { kind: role === 'artist' ? (owner.verified ? 'verified_artist' : 'artist') : role === 'producer' ? 'producer' : 'dj_host' },
                        ...(role === 'dj' && owner.verified ? [{ kind: 'verified_creator' as const }] : []),
                      ] as UniverseBadgeSpec[]}
                    />
                    {role === 'dj' && <BroadcastAccessBadge status={identity.broadcast_access_status} />}
                    <span className="text-[11px] text-white/45">@{owner.username}</span>

                    {/* Social Handles Icons */}
                    {(profileRecord?.social_instagram || profileRecord?.social_tiktok || profileRecord?.social_youtube || profileRecord?.social_twitter) && (
                      <div className="flex items-center gap-1.5 ml-2 border-l border-white/10 pl-2">
                        {profileRecord.social_instagram && (
                          <a
                            href={`https://instagram.com/${profileRecord.social_instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="size-6 rounded-md bg-white/5 border border-white/8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all text-[10px] font-bold"
                            title={`Instagram: @${profileRecord.social_instagram}`}
                          >
                            IG
                          </a>
                        )}
                        {profileRecord.social_tiktok && (
                          <a
                            href={`https://tiktok.com/@${profileRecord.social_tiktok}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="size-6 rounded-md bg-white/5 border border-white/8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all text-[10px] font-bold"
                            title={`TikTok: @${profileRecord.social_tiktok}`}
                          >
                            TK
                          </a>
                        )}
                        {profileRecord.social_youtube && (
                          <a
                            href={`https://youtube.com/@${profileRecord.social_youtube}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="size-6 rounded-md bg-white/5 border border-white/8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all text-[10px] font-bold"
                            title={`YouTube: @${profileRecord.social_youtube}`}
                          >
                            YT
                          </a>
                        )}
                        {profileRecord.social_twitter && (
                          <a
                            href={`https://twitter.com/${profileRecord.social_twitter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="size-6 rounded-md bg-white/5 border border-white/8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all text-[10px] font-bold"
                            title={`X / Twitter: @${profileRecord.social_twitter}`}
                          >
                            X
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <SecondaryButton className="px-4 py-2.5 text-[11px]"><Heart className="h-3.5 w-3.5" /> Follow</SecondaryButton>
                <SecondaryButton className="px-4 py-2.5 text-[11px]"><Share2 className="h-3.5 w-3.5" /> Share</SecondaryButton>
                {!isOwner && (
                  <PrimaryButton
                    className="px-4 py-2.5 text-[11px]"
                    onClick={() => messengerBridge?.notify({
                      senderName: owner.display_name,
                      body: `About: ${owner.display_name}`,
                      context: createTradioMessageContext({
                        surface: ROLE_MESSAGE_SURFACE[role],
                        route: getRoleProfilePublicUrl(identity, role),
                        entityType: ROLE_ENTITY_TYPE[role],
                        entityTitle: owner.display_name,
                        entityOwnerId: owner.user_id,
                        returnToUrl: getRoleProfilePublicUrl(identity, role),
                        recipientRole: role === 'dj' ? 'host' : role,
                      }),
                    })}
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> {ROLE_MESSAGE_CTA[role]}
                  </PrimaryButton>
                )}
                {isOwner && activation.hasRole && (
                  <PrimaryButton className="px-4 py-2.5 text-[11px]" onClick={() => setIsEditing(true)}>
                    <PenSquare className="h-3.5 w-3.5" /> Edit Profile
                  </PrimaryButton>
                )}
              </div>
            </div>

            {/* Owner / public view toggle */}
            <div className="mt-4 inline-flex rounded-full border border-white/10 bg-black/30 p-1">
              {(['owner', 'public'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition ${
                    viewMode === mode ? 'bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white' : 'text-white/55 hover:text-white'
                  }`}
                >
                  {mode === 'owner' ? <PenSquare className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {mode === 'owner' ? 'Owner view' : 'Public view'}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Trey TV identity bridge (owner view only) */}
      {isOwner && (
        <div className="mt-4 px-4 sm:px-6 lg:px-10">
          <GlassCard className="p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
              <Link2 className="h-4 w-4 text-cyan-300" /> Trey TV identity bridge
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-cyan-200/70">
                <a href={owner.treyTvProfileHref} className="inline-flex items-center gap-1 hover:text-cyan-200">Trey TV profile <ExternalLink className="h-3 w-3" /></a>
              </span>
            </div>
            <p className="mb-3 text-[11px] leading-relaxed text-white/50">
              This {owner.roleLabel} profile is an extension of your Trey TV identity — not a separate account.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="User ID" value={owner.user_id} />
              <Field label="Profile ID" value={owner.profile_id} />
              <Field label="Public UID" value={owner.public_profile_uid} />
              <Field label="Trey TV UID" value={owner.trey_tv_uid} />
              <Field label="Username" value={`@${owner.username}`} />
              <Field label="Public URL" value={getRoleProfilePublicUrl(identity, role)} />
            </div>
          </GlassCard>
        </div>
      )}

      {/* Completion checklist (owner + incomplete) */}
      {isOwner && activation.status === 'approved_incomplete' && (
        <div className="mt-4 px-4 sm:px-6 lg:px-10">
          <GlassCard glow className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-black text-white">Finish your {owner.roleLabel} profile</div>
                <p className="mt-1 text-xs text-white/55">Complete these to publish a public-ready profile.</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-fuchsia-300">{activation.completion.percent}%</div>
                <div className="text-[10px] uppercase tracking-wider text-white/40">{activation.completion.completed}/{activation.completion.total} done</div>
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400" style={{ width: `${activation.completion.percent}%` }} />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {activation.completion.items.map((item) => (
                <div key={item.id} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${item.complete ? 'border-emerald-300/20 bg-emerald-500/5 text-emerald-100' : 'border-white/8 bg-white/[0.02] text-white/55'}`}>
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${item.complete ? 'bg-emerald-400/30 text-emerald-100' : 'border border-white/20 text-transparent'}`}>✓</span>
                  {item.label}
                </div>
              ))}
            </div>
            <PrimaryButton className="mt-4 px-4 py-2.5 text-xs" onClick={() => setIsEditing(true)}>
              <Sparkles className="h-4 w-4" /> Set Up Profile
            </PrimaryButton>
          </GlassCard>
        </div>
      )}

      {/* DJ broadcast-pending banner */}
      {role === 'dj' && activation.requiresBroadcast && !activation.broadcastReady && (
        <div className="mt-4 px-4 sm:px-6 lg:px-10">
          <GlassCard className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white"><Radio className="h-4 w-4 text-purple-300" /> Live broadcast features need Broadcast Access</div>
            <SecondaryButton className="px-4 py-2.5 text-[11px]" onClick={() => access?.openFlow('broadcast')}>Apply for Broadcast Access</SecondaryButton>
          </GlassCard>
        </div>
      )}

      {/* Spotify-style Creator Pick / Artist Pick Pinned Release */}
      {profileRecord?.artist_pick_title && (
        <div className="mt-6 px-4 sm:px-6 lg:px-10 animate-fade-in">
          <div className="mb-3 text-sm font-bold uppercase tracking-[0.15em] text-white/45 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" /> {role === 'artist' ? 'Artist' : role === 'producer' ? 'Producer' : 'Host'}'s Featured Pick
          </div>
          <GlassCard glow className="p-5 flex flex-col md:flex-row items-start md:items-center gap-5 bg-gradient-to-r from-purple-950/10 via-black/40 to-cyan-950/10 border-white/10 relative overflow-hidden group">
            {/* Soft backdrop glow */}
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-all duration-700 pointer-events-none" />

            {/* Pick Cover art / moving FWD GIF */}
            <div className="relative h-24 w-24 rounded-2xl overflow-hidden border border-white/10 shadow-md shrink-0 bg-white/5">
              {profileRecord.artist_pick_image ? (
                <img src={profileRecord.artist_pick_image} alt="Featured Pick" className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-500" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-cyan-500/10 text-white/30 font-mono text-[9px] uppercase tracking-wider font-bold p-2 text-center">
                  {profileRecord.artist_pick_type || 'featured'}
                </div>
              )}
              {/* Floating Badge */}
              <div className="absolute bottom-1.5 left-1.5 rounded-md bg-black/75 border border-white/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-primary">
                {profileRecord.artist_pick_type === 'track' ? 'Release' : profileRecord.artist_pick_type === 'beat' ? 'Beat' : profileRecord.artist_pick_type === 'show' ? 'Show' : 'Album'}
              </div>
            </div>

            {/* Title / Description / Message block */}
            <div className="flex-1 min-w-0 space-y-1.5">
              {profileRecord.artist_pick_message && (
                <div className="inline-block rounded-lg bg-white/5 border border-white/8 px-3 py-1.5 text-xs text-white/80 italic relative after:content-[''] after:absolute after:top-full after:left-4 after:border-[6px] after:border-transparent after:border-t-white/5">
                  "{profileRecord.artist_pick_message}"
                </div>
              )}
              <div className="pt-2 md:pt-0">
                <h3 className="text-lg font-black tracking-tight text-white group-hover:text-primary transition-colors truncate">{profileRecord.artist_pick_title}</h3>
                <p className="text-xs text-white/50 leading-relaxed mt-0.5">
                  Featured {profileRecord.artist_pick_type || 'release'} curated directly by the creator.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="shrink-0 w-full md:w-auto">
              <PrimaryButton className="w-full md:w-auto px-5 py-2.5 text-xs font-black uppercase tracking-widest">
                <Play className="h-3.5 w-3.5 fill-current" /> Play Feature
              </PrimaryButton>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Content modules */}
      <div className="mt-6 px-4 sm:px-6 lg:px-10">
        <div className="mb-3 text-lg font-bold text-white">{isOwner ? 'Your modules' : `${owner.display_name}'s profile`}</div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => {
            const broadcastLocked = section.requiresBroadcast && !activation.broadcastReady;
            return (
              <GlassCard key={section.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-bold text-white">{section.title}</div>
                  {section.ownerOnly && <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/40">Owner</span>}
                  {broadcastLocked && <Lock className="h-4 w-4 text-white/30" />}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-white/55">{section.description}</p>
                {broadcastLocked && <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-amber-200/70">Broadcast access required</p>}
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Analytics preview (owner only) */}
      {isOwner && (
        <div className="mt-6 px-4 sm:px-6 lg:px-10">
          <div className="mb-3 flex items-center gap-2 text-lg font-bold text-white"><BarChart3 className="h-4 w-4 text-cyan-300" /> Analytics preview</div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Plays', '128.4K', '+12%'],
              ['Followers', '34.2K', '+6%'],
              [role === 'producer' ? 'Beat leases' : role === 'dj' ? 'Tune-ins' : 'Saves', '18.9K', '+9%'],
            ].map(([label, value, delta]) => (
              <GlassCard key={label} className="p-4">
                <div className="text-xs text-white/50">{label}</div>
                <div className="mt-1 text-2xl font-bold text-white">{value}</div>
                <div className="mt-1 text-[11px] text-emerald-300">{delta}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Prescribe Me rail */}
      <div className="mt-6 px-4 sm:px-6 lg:px-10">
        <PrescriptionRail
          title={role === 'artist' ? 'Prescribe my next release strategy' : role === 'producer' ? 'Prescribe artists for my beats' : "Prescribe tonight's show flow"}
          subtitle="Role-aware prescriptions stay connected to your Trey TV identity and active Tradio mode."
        />
      </div>

      {/* Open polished public shell */}
      <div className="mt-6 px-4 sm:px-6 lg:px-10">
        <GlassCard className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-bold text-white">View the full public profile</div>
            <p className="mt-1 text-xs text-white/55">Open the polished, fan-facing {owner.roleLabel} page.</p>
          </div>
          <div className="flex gap-2">
            {role === 'dj' && (
              <SecondaryButton className="px-4 py-2.5 text-[11px]" onClick={onOpenBroadcastStudio}><Radio className="h-3.5 w-3.5" /> Broadcast Studio</SecondaryButton>
            )}
            <PrimaryButton className="px-4 py-2.5 text-[11px]" onClick={() => onOpenPublicShell?.(role)}>
              <Eye className="h-3.5 w-3.5" /> Open Public Profile
            </PrimaryButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default RoleProfilePage;
