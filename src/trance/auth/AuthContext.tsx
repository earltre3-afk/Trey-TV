import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { DancerProfile } from "../types";
import { useAuth as useTvAuth } from "@/lib/auth";
import { mapTreyTvProfileToTranceProfile } from "./tranceAuthBridge";

interface AuthState {
  profile: DancerProfile | null;
  effectiveProfile: DancerProfile;
  isAuthed: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const tvAuth = useTvAuth();
  const [tranceProfile, setTranceProfile] = useState<DancerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tvAuth.authReady) {
      setLoading(true);
      return;
    }

    if (tvAuth.isGuest || !tvAuth.user) {
      setTranceProfile(null);
      setLoading(false);
    } else {
      setTranceProfile(mapTreyTvProfileToTranceProfile(tvAuth.user));
      setLoading(false);
    }
  }, [tvAuth.user, tvAuth.isGuest, tvAuth.authReady]);

  const signIn = useCallback(async () => {
    tvAuth.signIn();
  }, [tvAuth]);

  const signUp = useCallback(async () => {
    // Platform-level signup redirect or no-op since it's controlled by Trey TV
  }, []);

  const signOut = useCallback(async () => {
    tvAuth.signOut();
  }, [tvAuth]);

  const value: AuthState = {
    profile: tranceProfile,
    effectiveProfile: tranceProfile ?? mapTreyTvProfileToTranceProfile(null),
    isAuthed: !tvAuth.isGuest && !!tvAuth.user,
    loading: !tvAuth.authReady || loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
