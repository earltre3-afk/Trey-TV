import { useCallback } from 'react';
import { useTranceIdentity } from './useTranceIdentity';
import { TrancePermission, TranceRole } from '../types';

export const useTrancePermissions = () => {
  const { identity, loading } = useTranceIdentity();

  const hasPermission = useCallback(
    (permission: TrancePermission): boolean => {
      if (loading || !identity) return false;
      
      // Admin/Owner roles bypass permission checks (unlimited access)
      if (identity.activeRoles.includes('admin') || identity.activeRoles.includes('owner')) {
        return true;
      }
      
      return identity.permissions.includes(permission);
    },
    [identity, loading]
  );

  const hasRole = useCallback(
    (role: TranceRole): boolean => {
      if (loading || !identity) return false;
      return identity.activeRoles.includes(role);
    },
    [identity, loading]
  );

  const isDancer = identity?.activeRoles.includes('dancer') ?? false;
  const isChoreographer = identity?.activeRoles.includes('choreographer') ?? false;
  const isStudioOwner = identity?.activeRoles.includes('studio_owner') ?? false;
  const isStudioAdmin = identity?.activeRoles.includes('studio_admin') ?? false;
  const isStudioMember = identity?.activeRoles.includes('studio_member') ?? false;
  const isAdmin = identity?.activeRoles.includes('admin') || identity?.activeRoles.includes('owner') || false;

  return {
    hasPermission,
    hasRole,
    isDancer,
    isChoreographer,
    isStudioOwner,
    isStudioAdmin,
    isStudioMember,
    isAdmin,
    loading,
  };
};
