import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/tradio/lib/supabaseClient';
import { DEFAULT_MOCK_IDENTITY_KEY, MOCK_TRADIO_IDENTITIES, type MockIdentityKey } from './mockAuth';
import { availableModesFor, currentRoleLabelFor } from './roleUtils';
import {
  bootstrapTradioIdentity,
  syncActiveModeToSupabase,
  type TradioBootstrapPhase,
  type TradioBootstrapStatus,
} from './tradioProfileBootstrap';
import type { TradioBroadcastAccessState, TradioIdentity, TradioMode, TradioRole, TradioRoleGrant, TradioVerificationState } from './types';
import { useSupabaseSession } from './useSupabaseSession';

/**
 * Local-only overlay applied on top of the active identity to SIMULATE the
 * result of an admin approval (Pass 4H mock review). It never writes to a
 * backend and never self-grants admin/owner — the review queue only ever calls
 * it for artist/producer/dj roles, verification, or broadcast clearance.
 */
export interface MockGrantOverlay {
  roles: TradioRole[];
  verification?: TradioVerificationState;
  broadcast?: TradioBroadcastAccessState;
}

export interface MockGrantInput {
  role?: TradioRole;
  verification?: TradioVerificationState;
  broadcast?: TradioBroadcastAccessState;
}

type TradioIdentitySource = 'supabase' | 'mock';

type TradioProfileBridgeStatus =
  | 'not_configured'
  | 'signed_out'
  | 'connected'
  | 'profile_bridge_missing'
  | 'tradio_profile_missing'
  | 'error';

interface TradioIdentityContextValue {
  identity: TradioIdentity;
  identitySource: TradioIdentitySource;
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isConfigured: boolean;
  isSignedOut: boolean;
  isPreviewMode: boolean;
  authError: Error | null;
  identityWarnings: string[];
  profileBridgeStatus: TradioProfileBridgeStatus;
  bootstrapStatus: TradioBootstrapStatus;
  bootstrapPhase: TradioBootstrapPhase;
  mockIdentityKey: MockIdentityKey;
  setMockIdentityKey: (key: MockIdentityKey) => void;
  setActiveMode: (mode: TradioMode) => void;
  updateActiveMode: (mode: TradioMode) => void;
  availableModes: TradioMode[];
  currentMode: TradioMode;
  currentRoleLabel: string;
  /** Local-only simulation of an admin-approved grant (mock review prototype). */
  applyMockGrant: (grant: MockGrantInput) => void;
}

const TradioIdentityContext = createContext<TradioIdentityContextValue | null>(null);

export const TradioIdentityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabaseSession = useSupabaseSession();
  const [mockIdentityKey, setMockIdentityKeyState] = useState<MockIdentityKey>(DEFAULT_MOCK_IDENTITY_KEY);
  const [modeOverrides, setModeOverrides] = useState<Partial<Record<MockIdentityKey, TradioMode>>>({});
  const [supabaseIdentity, setSupabaseIdentity] = useState<TradioIdentity | null>(null);
  const [supabaseModeOverride, setSupabaseModeOverride] = useState<TradioMode | null>(null);
  const [identityWarnings, setIdentityWarnings] = useState<string[]>([]);
  const [isIdentityLoading, setIsIdentityLoading] = useState(false);
  const [bootstrapStatus, setBootstrapStatus] = useState<TradioBootstrapStatus>('not_configured');
  const [bootstrapPhase, setBootstrapPhase] = useState<TradioBootstrapPhase>('idle');
  const [mockGrants, setMockGrants] = useState<MockGrantOverlay>({ roles: [] });

  const applyMockGrant = useCallback((grant: MockGrantInput) => {
    // Hard guard: never overlay admin/owner — those are not request-grantable.
    const role = grant.role && grant.role !== 'admin' && grant.role !== 'owner' ? grant.role : undefined;
    setMockGrants((current) => ({
      roles: role ? Array.from(new Set([...current.roles, role])) : current.roles,
      verification: grant.verification ?? current.verification,
      broadcast: grant.broadcast ?? current.broadcast,
    }));
  }, []);

  useEffect(() => {
    if (!supabaseSession.isConfigured || !supabaseSession.user || !supabase) {
      setSupabaseIdentity(null);
      setSupabaseModeOverride(null);
      setIdentityWarnings([]);
      setIsIdentityLoading(false);
      setBootstrapStatus(supabaseSession.isConfigured ? 'signed_out' : 'not_configured');
      setBootstrapPhase('idle');
      return;
    }

    let active = true;
    setIsIdentityLoading(true);

    bootstrapTradioIdentity(
      supabaseSession.user,
      (phase) => {
        if (active) setBootstrapPhase(phase);
      },
    )
      .then((result) => {
        if (!active) return;
        setSupabaseIdentity(result.identity);
        setIdentityWarnings(result.warnings);
        setBootstrapStatus(result.status);
        setSupabaseModeOverride(null);
      })
      .catch((error: Error) => {
        if (!active) return;
        setSupabaseIdentity(null);
        setIdentityWarnings([error.message]);
        setBootstrapStatus('error');
        setSupabaseModeOverride(null);
      })
      .finally(() => {
        if (!active) return;
        setIsIdentityLoading(false);
        setBootstrapPhase('idle');
      });

    return () => {
      active = false;
    };
  }, [supabaseSession.isConfigured, supabaseSession.user]);

  const identitySource: TradioIdentitySource = supabaseIdentity && supabaseSession.user ? 'supabase' : 'mock';

  const identity = useMemo<TradioIdentity>(() => {
    const base = identitySource === 'supabase' && supabaseIdentity
      ? { ...supabaseIdentity, active_mode: supabaseModeOverride || supabaseIdentity.active_mode }
      : (() => {
          const mock = MOCK_TRADIO_IDENTITIES[mockIdentityKey];
          return { ...mock, active_mode: modeOverrides[mockIdentityKey] || mock.active_mode };
        })();

    // Overlay any locally-simulated admin grants (mock review prototype, Pass 4H).
    if (!mockGrants.roles.length && !mockGrants.verification && !mockGrants.broadcast) return base;

    const extraRoles: TradioRoleGrant[] = mockGrants.roles
      .filter((role) => !base.roles.some((grant) => grant.role === role))
      .map((role) => ({ id: `${base.user_id}-${role}-granted`, role, role_status: 'active', role_metadata: { source: 'mock_review' } }));

    return {
      ...base,
      roles: [...base.roles, ...extraRoles],
      verification_status: mockGrants.verification ?? base.verification_status,
      broadcast_access_status: mockGrants.broadcast ?? base.broadcast_access_status,
    };
  }, [identitySource, supabaseIdentity, supabaseModeOverride, mockIdentityKey, modeOverrides, mockGrants]);

  const availableModes = useMemo(() => availableModesFor(identity), [identity]);

  const setMockIdentityKey = useCallback((key: MockIdentityKey) => {
    setMockIdentityKeyState(key);
  }, []);

  const setActiveMode = useCallback((mode: TradioMode) => {
    if (!availableModes.includes(mode)) return;
    if (identitySource === 'supabase') {
      setSupabaseModeOverride(mode);
      syncActiveModeToSupabase(identity.user_id, mode).then(({ warning }) => {
        if (warning) setIdentityWarnings((current) => Array.from(new Set([...current, warning])));
      });
      return;
    }

    setModeOverrides((current) => ({ ...current, [mockIdentityKey]: mode }));
  }, [availableModes, identity.user_id, identitySource, mockIdentityKey]);

  const profileBridgeStatus = useMemo<TradioProfileBridgeStatus>(() => {
    if (!supabaseSession.isConfigured) return 'not_configured';
    if (!supabaseSession.user) return 'signed_out';
    if (supabaseSession.error) return 'error';
    if (identitySource === 'supabase' && !identity.public_profile_uid && !identity.profile_id) return 'profile_bridge_missing';
    if (identitySource === 'supabase' && identity.access_state === 'none') return 'tradio_profile_missing';
    return 'connected';
  }, [identity.access_state, identity.profile_id, identity.public_profile_uid, identitySource, supabaseSession.error, supabaseSession.isConfigured, supabaseSession.user]);

  const authError = useMemo(() => supabaseSession.error ?? null, [supabaseSession.error]);

  const value = useMemo<TradioIdentityContextValue>(() => ({
    identity,
    identitySource,
    session: supabaseSession.session,
    user: supabaseSession.user,
    isLoading: supabaseSession.isLoading || isIdentityLoading,
    isConfigured: supabaseSession.isConfigured,
    isSignedOut: supabaseSession.isConfigured && !supabaseSession.user,
    isPreviewMode: identitySource === 'mock',
    authError,
    identityWarnings,
    profileBridgeStatus,
    bootstrapStatus,
    bootstrapPhase,
    mockIdentityKey,
    setMockIdentityKey,
    setActiveMode,
    updateActiveMode: setActiveMode,
    availableModes,
    currentMode: identity.active_mode,
    currentRoleLabel: currentRoleLabelFor(identity),
    applyMockGrant,
  }), [
    identity,
    identitySource,
    supabaseSession.session,
    supabaseSession.user,
    supabaseSession.isLoading,
    supabaseSession.isConfigured,
    isIdentityLoading,
    authError,
    identityWarnings,
    profileBridgeStatus,
    bootstrapStatus,
    bootstrapPhase,
    mockIdentityKey,
    setMockIdentityKey,
    setActiveMode,
    availableModes,
    applyMockGrant,
  ]);

  return <TradioIdentityContext.Provider value={value}>{children}</TradioIdentityContext.Provider>;
};

export const useTradioIdentity = () => {
  const context = useContext(TradioIdentityContext);
  if (!context) {
    throw new Error('useTradioIdentity must be used within TradioIdentityProvider');
  }
  return context;
};
