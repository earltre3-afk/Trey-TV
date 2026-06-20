import React from "react";
import { useAuth } from "../auth/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useParams } from "../hooks/router-compat";
import { tranceProfileService } from "../services/tranceProfileService";
import { decodeHandoffToken, isHandoffTokenExpired } from "./handoffToken";
import { QRMobileHandoffGate } from "./QRMobileHandoffGate";
import { CalibrationOverlay } from "./CalibrationOverlay";
import { TranceShell } from "../components/shell";
import type { CalibrationProfile } from "../types";

interface CalibrationGateProps {
  children: React.ReactNode;
}

export function CalibrationGate({ children }: CalibrationGateProps) {
  const isMobile = useIsMobile();
  const { isAuthed, loading: authLoading, effectiveProfile } = useAuth();
  const { routineId = "" } = useParams<{ routineId: string }>();

  // Read ?handoff= token from URL using window.location as a reliable fallback
  const handoffParam = React.useMemo(
    () => new URLSearchParams(window.location.search).get("handoff"),
    []
  );

  const tokenExpired = React.useMemo(() => {
    if (!handoffParam) return false;
    const token = decodeHandoffToken(handoffParam);
    if (!token) return true;
    return isHandoffTokenExpired(token);
  }, [handoffParam]);

  // calibration: undefined = loading, null = not done, CalibrationProfile = done
  const [calibration, setCalibration] = React.useState<CalibrationProfile | null | undefined>(
    undefined
  );

  React.useEffect(() => {
    if (!isAuthed || authLoading) return;

    let cancelled = false;
    tranceProfileService
      .getCalibrationProfile(effectiveProfile.id)
      .then((profile) => {
        if (!cancelled) setCalibration(profile);
      })
      .catch(() => {
        if (!cancelled) setCalibration(null);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthed, authLoading, effectiveProfile.id]);

  // Redirect effect — fires when auth is resolved and user is not authed
  React.useEffect(() => {
    if (authLoading) return;
    if (!isAuthed) {
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    }
  }, [authLoading, isAuthed]);

  // 1. Desktop → QR handoff
  if (!isMobile) {
    return <QRMobileHandoffGate routineId={routineId} />;
  }

  // 2. Handoff token present but expired
  if (tokenExpired) {
    return (
      <TranceShell hideNav>
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="space-y-2">
            <div className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest">
              Link Expired
            </div>
            <h1 className="text-2xl font-black text-white uppercase leading-tight">
              This Link Has Expired
            </h1>
            <p className="text-sm text-white/60 max-w-xs mx-auto">
              Practice links expire after 15 minutes. Go back to your desktop and scan the QR code
              again to get a fresh link.
            </p>
          </div>
        </div>
      </TranceShell>
    );
  }

  // 3. Auth loading or not authed → spinner (redirect effect handles navigation)
  if (authLoading || !isAuthed) {
    return (
      <TranceShell hideNav>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-fuchsia-500 border-t-transparent animate-spin" />
        </div>
      </TranceShell>
    );
  }

  // 4. Calibration loading
  if (calibration === undefined) {
    return (
      <TranceShell hideNav>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-fuchsia-500 border-t-transparent animate-spin" />
        </div>
      </TranceShell>
    );
  }

  // 5. Not calibrated
  if (calibration === null) {
    const handleCalibrationComplete = () => {
      // Re-fetch the calibration profile after completion
      tranceProfileService
        .getCalibrationProfile(effectiveProfile.id)
        .then((profile) => setCalibration(profile))
        .catch(() => setCalibration(null));
    };

    return <CalibrationOverlay onComplete={handleCalibrationComplete} />;
  }

  // 6. All gates passed — render children
  return <>{children}</>;
}
