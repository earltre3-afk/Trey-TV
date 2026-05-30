import type { SupabaseClient, User } from '@supabase/supabase-js';
import { IMG } from '../data';
import type {
  TradioBadge,
  TradioBroadcastAccessState,
  TradioIdentity,
  TradioMode,
  TradioProfileBridge,
  TradioRole,
  TradioRoleGrant,
  TradioRoleStatus,
  TradioVerificationState,
} from './types';

type DbRow = Record<string, unknown>;

export interface TreyProfileBridge extends TradioProfileBridge {
  display_name?: string;
  username?: string;
  avatar_url?: string;
  banner_url?: string;
}

export interface TradioProfileRow extends DbRow {
  user_id?: string;
  profile_id?: string | null;
  public_profile_uid?: string | null;
  trey_tv_uid?: string | null;
  display_name?: string;
  username?: string;
  avatar_url?: string;
  banner_url?: string;
  active_mode?: TradioMode;
  default_mode?: TradioMode;
  tradio_verification_status?: TradioVerificationState;
  tradio_broadcast_access_status?: TradioBroadcastAccessState;
  city?: string;
  region?: string;
  tradio_genres?: string[];
  fan_interests?: string[];
}

export interface TradioRoleProfiles {
  fan?: DbRow | null;
  artist?: DbRow | null;
  producer?: DbRow | null;
  dj?: DbRow | null;
}

export interface TradioIdentityFetchResult {
  treyProfile: TreyProfileBridge | null;
  tradioProfile: TradioProfileRow | null;
  roles: TradioRoleGrant[];
  roleProfiles: TradioRoleProfiles;
  badges: TradioBadge[];
  warnings: string[];
}

const asRecord = (value: unknown): DbRow | null => {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as DbRow;
  return null;
};

const asString = (value: unknown) => typeof value === 'string' ? value : undefined;

const isMode = (value: unknown): value is TradioMode =>
  value === 'listener' || value === 'artist' || value === 'producer' || value === 'dj' || value === 'admin';

const isRole = (value: unknown): value is TradioRole =>
  value === 'fan' || value === 'artist' || value === 'producer' || value === 'dj' || value === 'moderator' || value === 'admin' || value === 'owner';

const isRoleStatus = (value: unknown): value is TradioRoleStatus =>
  value === 'active' || value === 'requested' || value === 'approved' || value === 'restricted' || value === 'revoked' || value === 'archived';

const isVerification = (value: unknown): value is TradioVerificationState =>
  value === 'unverified' || value === 'pending' || value === 'verified' || value === 'rejected' || value === 'revoked';

const isBroadcastAccess = (value: unknown): value is TradioBroadcastAccessState =>
  value === 'invite_only' || value === 'submitted' || value === 'pending' || value === 'under_review' || value === 'cleared' || value === 'denied' || value === 'revoked';

const safeSingle = async <T>(query: PromiseLike<{ data: T | null; error: { message: string; code?: string } | null }>) => {
  const { data, error } = await query;
  if (error) return { data: null, warning: error.message };
  return { data, warning: null };
};

export const fetchTreyProfileBridge = async (client: SupabaseClient, userId: string): Promise<{ data: TreyProfileBridge | null; warning: string | null }> => {
  const result = await safeSingle<DbRow>(
    client
      .from('profiles')
      .select('id,user_id,public_profile_uid,display_name,username,avatar_url,banner_url')
      .or(`id.eq.${userId},user_id.eq.${userId}`)
      .maybeSingle()
  );

  const row = asRecord(result.data);
  if (!row) return { data: null, warning: result.warning };

  return {
    data: {
      user_id: asString(row.user_id) || userId,
      profile_id: asString(row.id) || null,
      public_profile_uid: asString(row.public_profile_uid) || null,
      display_name: asString(row.display_name),
      username: asString(row.username),
      avatar_url: asString(row.avatar_url),
      banner_url: asString(row.banner_url),
    },
    warning: null,
  };
};

export const fetchTradioProfile = async (client: SupabaseClient, userId: string): Promise<{ data: TradioProfileRow | null; warning: string | null }> => {
  const result = await safeSingle<DbRow>(
    client
      .from('tradio_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
  );
  return { data: asRecord(result.data) as TradioProfileRow | null, warning: result.warning };
};

export const fetchTradioRoles = async (client: SupabaseClient, userId: string): Promise<{ data: TradioRoleGrant[]; warning: string | null }> => {
  const { data, error } = await client
    .from('tradio_user_roles')
    .select('id,role,role_status,granted_at,granted_by,role_metadata')
    .eq('user_id', userId);

  if (error) return { data: [], warning: error.message };

  const roles = (Array.isArray(data) ? data : []).flatMap((row): TradioRoleGrant[] => {
    const record = asRecord(row);
    if (!record || !isRole(record.role)) return [];
    return [{
      id: asString(record.id) || `${userId}-${record.role}`,
      role: record.role,
      role_status: isRoleStatus(record.role_status) ? record.role_status : 'active',
      granted_at: asString(record.granted_at),
      granted_by: asString(record.granted_by) || null,
      role_metadata: asRecord(record.role_metadata) || {},
    }];
  });

  return { data: roles, warning: null };
};

const fetchRoleProfile = async (client: SupabaseClient, table: string, userId: string) => {
  const result = await safeSingle<DbRow>(
    client
      .from(table)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
  );
  return { data: asRecord(result.data), warning: result.warning };
};

export const fetchTradioRoleProfiles = async (client: SupabaseClient, userId: string): Promise<{ data: TradioRoleProfiles; warnings: string[] }> => {
  const [fan, artist, producer, dj] = await Promise.all([
    fetchRoleProfile(client, 'tradio_fan_profiles', userId),
    fetchRoleProfile(client, 'tradio_artist_profiles', userId),
    fetchRoleProfile(client, 'tradio_producer_profiles', userId),
    fetchRoleProfile(client, 'tradio_dj_profiles', userId),
  ]);

  return {
    data: {
      fan: fan.data,
      artist: artist.data,
      producer: producer.data,
      dj: dj.data,
    },
    warnings: [fan.warning, artist.warning, producer.warning, dj.warning].filter((warning): warning is string => Boolean(warning)),
  };
};

export const fetchTradioBadges = async (client: SupabaseClient, userId: string): Promise<{ data: TradioBadge[]; warning: string | null }> => {
  const { data, error } = await client
    .from('tradio_user_badges')
    .select('tradio_badges(id,label,name,slug)')
    .eq('user_id', userId);

  if (error) return { data: [], warning: error.message };

  const badges = (Array.isArray(data) ? data : []).flatMap((row): TradioBadge[] => {
    const record = asRecord(row);
    const badge = asRecord(record?.tradio_badges);
    const label = asString(badge?.label) || asString(badge?.name) || asString(badge?.slug);
    if (!badge || !label) return [];
    return [{ id: asString(badge.id) || label, label, tone: 'violet' }];
  });

  return { data: badges, warning: null };
};

export const fetchTradioIdentityParts = async (client: SupabaseClient, userId: string): Promise<TradioIdentityFetchResult> => {
  const [treyProfile, tradioProfile, roles, roleProfiles, badges] = await Promise.all([
    fetchTreyProfileBridge(client, userId),
    fetchTradioProfile(client, userId),
    fetchTradioRoles(client, userId),
    fetchTradioRoleProfiles(client, userId),
    fetchTradioBadges(client, userId),
  ]);

  return {
    treyProfile: treyProfile.data,
    tradioProfile: tradioProfile.data,
    roles: roles.data,
    roleProfiles: roleProfiles.data,
    badges: badges.data,
    warnings: [treyProfile.warning, tradioProfile.warning, roles.warning, badges.warning, ...roleProfiles.warnings].filter((warning): warning is string => Boolean(warning)),
  };
};

export const mapSupabaseToTradioIdentity = (
  user: User,
  parts: TradioIdentityFetchResult,
): TradioIdentity => {
  const profile = parts.tradioProfile;
  const bridge = parts.treyProfile;
  const metadata = user.user_metadata;
  const displayName = profile?.display_name || bridge?.display_name || asString(metadata?.display_name) || asString(metadata?.name) || user.email?.split('@')[0] || 'Tradio Listener';
  const username = profile?.username || bridge?.username || asString(metadata?.username) || displayName.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 24) || 'tradio_user';
  const fallbackRole: TradioRoleGrant = { id: `${user.id}-fan`, role: 'fan', role_status: 'active', role_metadata: {} };
  const roles: TradioRoleGrant[] = parts.roles.length ? parts.roles : [fallbackRole];
  const activeMode = isMode(profile?.active_mode) ? profile.active_mode : 'listener';
  const defaultMode = isMode(profile?.default_mode) ? profile.default_mode : activeMode;

  return {
    user_id: user.id,
    profile_id: profile?.profile_id || bridge?.profile_id || null,
    public_profile_uid: profile?.public_profile_uid || bridge?.public_profile_uid || null,
    trey_tv_uid: profile?.trey_tv_uid || bridge?.trey_tv_uid || null,
    display_name: displayName,
    username,
    avatar_url: profile?.avatar_url || bridge?.avatar_url || asString(metadata?.avatar_url) || IMG.jordan,
    banner_url: profile?.banner_url || bridge?.banner_url,
    active_mode: activeMode,
    default_mode: defaultMode,
    roles,
    badges: parts.badges,
    verification_status: isVerification(profile?.tradio_verification_status) ? profile.tradio_verification_status : 'unverified',
    broadcast_access_status: isBroadcastAccess(profile?.tradio_broadcast_access_status) ? profile.tradio_broadcast_access_status : 'invite_only',
    access_state: profile ? 'available' : 'none',
    city: asString(profile?.city),
    region: asString(profile?.region),
    genres: Array.isArray(profile?.tradio_genres) ? profile.tradio_genres : [],
    fan_interests: Array.isArray(profile?.fan_interests) ? profile.fan_interests : [],
  };
};

export const updateActiveMode = async (client: SupabaseClient | null, userId: string, mode: TradioMode): Promise<string | null> => {
  if (!client) return 'Supabase is not configured; active mode stored locally.';

  const { error } = await client
    .from('tradio_profiles')
    .update({ active_mode: mode })
    .eq('user_id', userId);

  return error?.message ?? null;
};
