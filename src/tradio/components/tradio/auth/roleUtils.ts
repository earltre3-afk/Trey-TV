import type { TradioCapability, TradioIdentity, TradioMode, TradioRole, TradioRoleGrant } from './types';

export const MODE_LABELS: Record<TradioMode, string> = {
  listener: 'Listener Mode',
  artist: 'Artist Mode',
  producer: 'Producer Mode',
  dj: 'DJ Mode',
  admin: 'Admin Mode',
};

export const ROLE_LABELS: Record<TradioRole, string> = {
  fan: 'Fan',
  artist: 'Artist',
  producer: 'Producer',
  dj: 'DJ / Host',
  moderator: 'Moderator',
  admin: 'Admin',
  owner: 'Owner',
};

export const modeRoleMap: Record<TradioMode, TradioRole[]> = {
  listener: ['fan', 'artist', 'producer', 'dj', 'moderator', 'admin', 'owner'],
  artist: ['artist', 'admin', 'owner'],
  producer: ['producer', 'admin', 'owner'],
  dj: ['dj', 'admin', 'owner'],
  admin: ['admin', 'owner'],
};

export const isGrantActive = (grant: TradioRoleGrant) => grant.role_status === 'active' || grant.role_status === 'approved';

export const hasRole = (identity: TradioIdentity | null | undefined, role: TradioRole) =>
  Boolean(identity?.roles.some((grant) => grant.role === role && isGrantActive(grant)));

export const hasAnyRole = (identity: TradioIdentity | null | undefined, roles: TradioRole[]) =>
  roles.some((role) => hasRole(identity, role));

export const availableModesFor = (identity: TradioIdentity | null | undefined): TradioMode[] => {
  if (!identity) return ['listener'];
  const modes = (Object.keys(modeRoleMap) as TradioMode[]).filter((mode) => hasAnyRole(identity, modeRoleMap[mode]));
  return modes.includes('listener') ? modes : ['listener', ...modes];
};

export const hasMode = (identity: TradioIdentity | null | undefined, mode: TradioMode) =>
  availableModesFor(identity).includes(mode);

export const isCurrentMode = (identity: TradioIdentity | null | undefined, mode: TradioMode) =>
  identity?.active_mode === mode && hasMode(identity, mode);

export const canAccessStudio = (identity: TradioIdentity | null | undefined) =>
  hasAnyRole(identity, ['artist', 'producer', 'dj', 'moderator', 'admin', 'owner']);

export const canCreateArtistStation = (identity: TradioIdentity | null | undefined) =>
  hasAnyRole(identity, ['artist', 'admin', 'owner']) && (isCurrentMode(identity, 'artist') || isCurrentMode(identity, 'admin'));

export const canReleaseMusic = (identity: TradioIdentity | null | undefined) =>
  hasAnyRole(identity, ['artist', 'admin', 'owner']) && (isCurrentMode(identity, 'artist') || isCurrentMode(identity, 'admin'));

export const canUploadBeat = (identity: TradioIdentity | null | undefined) =>
  hasAnyRole(identity, ['producer', 'admin', 'owner']) && (isCurrentMode(identity, 'producer') || isCurrentMode(identity, 'admin'));

export const canCreateBroadcast = (identity: TradioIdentity | null | undefined) => {
  // Admin/owner can create broadcasts regardless of status or mode
  if (hasAnyRole(identity, ['admin', 'owner']) && isCurrentMode(identity, 'admin')) return true;
  // Other roles require cleared status and appropriate mode
  return (
    hasAnyRole(identity, ['artist', 'producer', 'dj']) &&
    identity?.broadcast_access_status === 'cleared' &&
    ['artist', 'producer', 'dj'].includes(identity.active_mode)
  );
};

export const canHostSongWar = (identity: TradioIdentity | null | undefined) => {
  // Admin/owner can host song wars regardless of mode (admin mode access)
  if (hasAnyRole(identity, ['admin', 'owner']) && isCurrentMode(identity, 'admin')) return true;
  // DJ/moderator must be in DJ or admin mode
  return hasAnyRole(identity, ['dj', 'moderator']) && (isCurrentMode(identity, 'dj') || isCurrentMode(identity, 'admin'));
};

export const canModerateSession = (identity: TradioIdentity | null | undefined) =>
  hasAnyRole(identity, ['moderator', 'admin', 'owner']);

export const canAdminPlatform = (identity: TradioIdentity | null | undefined) =>
  hasAnyRole(identity, ['admin', 'owner']) && isCurrentMode(identity, 'admin');

export const canUseBroadcastStudio = (identity: TradioIdentity | null | undefined) =>
  canCreateBroadcast(identity) || canAdminPlatform(identity);

export const canRequestBroadcastAccess = (identity: TradioIdentity | null | undefined) => {
  // Admin/owner can always access broadcast features (don't need to request)
  if (hasAnyRole(identity, ['admin', 'owner'])) return true;
  // DJ and other roles can request if not already in progress or cleared
  return Boolean(identity && !['cleared', 'pending', 'under_review', 'submitted'].includes(identity.broadcast_access_status));
};

export const canRequestVerification = (identity: TradioIdentity | null | undefined) =>
  Boolean(identity && ['unverified', 'rejected'].includes(identity.verification_status) && hasAnyRole(identity, ['artist', 'producer', 'dj']));

export const can = (identity: TradioIdentity | null | undefined, capability: TradioCapability) => {
  const checks: Record<TradioCapability, () => boolean> = {
    listen: () => Boolean(identity),
    'access-studio': () => canAccessStudio(identity),
    'create-artist-station': () => canCreateArtistStation(identity),
    'release-music': () => canReleaseMusic(identity),
    'upload-beat': () => canUploadBeat(identity),
    'create-broadcast': () => canCreateBroadcast(identity),
    'host-song-war': () => canHostSongWar(identity),
    'moderate-session': () => canModerateSession(identity),
    'admin-platform': () => canAdminPlatform(identity),
    'request-broadcast-access': () => canRequestBroadcastAccess(identity),
    'request-verification': () => canRequestVerification(identity),
  };
  return checks[capability]();
};

export const currentRoleLabelFor = (identity: TradioIdentity | null | undefined) => {
  if (!identity) return MODE_LABELS.listener;
  if (identity.active_mode === 'listener') return MODE_LABELS.listener;
  return MODE_LABELS[identity.active_mode];
};
