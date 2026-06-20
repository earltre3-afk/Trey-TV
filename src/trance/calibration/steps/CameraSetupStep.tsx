import React from "react";
import { PoseCameraCanvas } from "../../components/PoseCameraCanvas";
import { cn } from "../../components/primitives";
import type { UseTrancePoseSession } from "../../hooks/useTrancePoseSession";

interface CameraSetupStepProps {
  pose: UseTrancePoseSession;
  onReady: () => void;
}

function StatusDot({ ok }: { ok: boolean | undefined }) {
  return (
    <div
      className={cn(
        "w-2.5 h-2.5 rounded-full flex-shrink-0",
        ok === true && "bg-emerald-400",
        ok === false && "bg-red-400",
        ok === undefined && "bg-yellow-400 animate-pulse",
      )}
    />
  );
}

export function CameraSetupStep({ pose, onReady }: CameraSetupStepProps) {
  React.useEffect(() => {
    void pose.start();
    // pose.stop() is called by CalibrationOverlay when leaving step 1
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const bodyVisible = pose.confidence?.fullBodyInFrame;
  const lightingOk = pose.confidence?.lightingOk;
  const distanceOk =
    pose.warnings.length === 0 ||
    !pose.warnings.some((w) => w.message.includes("distance") || w.message.includes("far") || w.message.includes("close"));

  const allGood = bodyVisible === true && lightingOk === true && distanceOk;

  const isError =
    pose.status === "unavailable" || pose.status === "permission_denied";

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6 text-center">
        <div className="text-4xl">📷</div>
        <div className="text-base font-black text-white uppercase">Camera Unavailable</div>
        <p className="text-sm text-white/60 max-w-xs">
          {pose.error?.code === "permission_denied"
            ? "Camera permission was denied. Allow camera access in your phone's settings, then come back."
            : "Your device doesn't support camera tracking. Try on a different device."}
        </p>
      </div>
    );
  }

  const isLoading =
    pose.status === "idle" ||
    pose.status === "requesting_permission" ||
    pose.status === "camera_ready";

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 relative">
        <PoseCameraCanvas pose={pose} className="min-h-[50vh]" />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-t-fuchsia-500 border-white/10 animate-spin" />
              <div className="text-xs text-white/50 uppercase tracking-widest">
                Starting camera…
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-6 space-y-4">
        <div>
          <div className="text-[9px] font-black text-fuchsia-400 uppercase tracking-widest mb-1">
            Step 1 of 4
          </div>
          <h2 className="text-lg font-black text-white uppercase">Frame Your Full Body</h2>
          <p className="text-xs text-white/50 mt-1">
            Step back until your head and feet are both visible.
          </p>
        </div>

        <div className="space-y-2.5">
          {[
            { label: "Full body visible", ok: bodyVisible },
            { label: "Lighting OK", ok: lightingOk },
            { label: "Distance OK", ok: distanceOk || pose.status !== "tracking" ? distanceOk : undefined },
          ].map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-3">
              <StatusDot ok={pose.status === "tracking" ? ok : undefined} />
              <span className="text-sm font-semibold text-white/80">{label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onReady}
          disabled={!allGood || pose.status !== "tracking"}
          className="w-full py-4 rounded-2xl font-black text-sm uppercase bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
        >
          Looks Good →
        </button>
      </div>
    </div>
  );
}
