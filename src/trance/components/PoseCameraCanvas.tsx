import React, { useEffect } from "react";
import { Camera, CameraOff, AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "./primitives";
import type { UseTrancePoseSession } from "../hooks/useTrancePoseSession";
import { isPoseDebugEnabled } from "../services/poseProviders";
import type { PoseBodyPart } from "../types";

// Skeleton bones to connect (by body-part label).
const BONES: [PoseBodyPart, PoseBodyPart][] = [
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "right_hip"],
  ["left_hip", "left_knee"],
  ["left_knee", "left_ankle"],
  ["right_hip", "right_knee"],
  ["right_knee", "right_ankle"],
];

export const PoseCameraCanvas: React.FC<{ pose: UseTrancePoseSession; className?: string }> = ({
  pose,
  className,
}) => {
  const { videoRef, canvasRef, status, error, warnings, latestFrame, confidence, aiEnabled, cameraEnabled } = pose;
  const debug = isPoseDebugEnabled();

  // Draw skeleton overlay whenever landmarks change.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = (canvas.width = canvas.clientWidth || 640);
    const h = (canvas.height = canvas.clientHeight || 480);
    ctx.clearRect(0, 0, w, h);
    if (!latestFrame) return;

    const byPart = new Map<string, { x: number; y: number }>();
    for (const l of latestFrame.landmarks) {
      if (l.bodyPart) byPart.set(l.bodyPart, { x: l.x * w, y: l.y * h });
    }

    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(34,211,238,0.85)";
    for (const [a, b] of BONES) {
      const pa = byPart.get(a);
      const pb = byPart.get(b);
      if (pa && pb) {
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }
    }
    ctx.fillStyle = "rgba(217,70,239,0.95)";
    for (const l of latestFrame.landmarks) {
      ctx.beginPath();
      ctx.arc(l.x * w, l.y * h, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [latestFrame, canvasRef]);

  const showVideo = status === "camera_ready" || status === "tracking" || status === "paused";

  // AI disabled / camera disabled → clean, non-blocking fallback.
  if (!aiEnabled || !cameraEnabled) {
    return (
      <div
        className={cn(
          "relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 grid place-items-center text-center p-6",
          className,
        )}
        style={{ minHeight: 240 }}
      >
        <div>
          <CameraOff className="w-8 h-8 mx-auto text-white/40 mb-2" />
          <div className="text-sm font-bold text-white">Camera coaching is off</div>
          <p className="text-xs text-white/50 mt-1 max-w-xs">
            AI pose tracking isn't enabled. You can still learn and finish this session — your score
            uses the standard (non-AI) flow.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("relative rounded-2xl overflow-hidden border border-fuchsia-400/30 bg-black", className)}
      style={{ minHeight: 240 }}
    >
      {/* Live preview (always mounted so the ref binds; hidden until ready) */}
      <video
        ref={videoRef}
        playsInline
        muted
        aria-label="Live dance camera preview"
        className={cn("w-full h-full object-cover", showVideo ? "opacity-100" : "opacity-0")}
        style={{ minHeight: 240, transform: "scaleX(-1)" }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ transform: "scaleX(-1)" }}
      />

      {/* Consent gate — camera only starts on explicit user action. */}
      {status === "idle" && (
        <div className="absolute inset-0 grid place-items-center text-center p-6 bg-black/70">
          <div className="max-w-sm">
            <ShieldCheck className="w-8 h-8 mx-auto text-cyan-300 mb-2" />
            <div className="text-sm font-black text-white uppercase tracking-wide">Camera coaching</div>
            <p className="text-xs text-white/65 mt-2 leading-relaxed">
              TRANCE uses your camera to track your movement during this session. Your camera feed
              stays on this device — nothing is uploaded unless you choose to record or submit a
              replay.
            </p>
            <button
              onClick={() => void pose.start()}
              className="mt-4 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-bold text-sm px-5 py-2.5 active:scale-95 transition inline-flex items-center gap-2"
            >
              <Camera className="w-4 h-4" /> Enable camera
            </button>
            <p className="text-[10px] text-white/40 mt-2">AI-assisted coaching — not perfect judgment.</p>
          </div>
        </div>
      )}

      {status === "requesting_permission" && (
        <div className="absolute inset-0 grid place-items-center bg-black/70 text-center">
          <div className="text-white/70 text-xs flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-300" />
            Waiting for camera permission…
          </div>
        </div>
      )}

      {(status === "permission_denied" || status === "unavailable" || status === "error") && (
        <div className="absolute inset-0 grid place-items-center bg-black/70 text-center p-6">
          <div className="max-w-xs">
            <AlertTriangle className="w-7 h-7 mx-auto text-yellow-300 mb-2" />
            <div className="text-sm font-bold text-white">
              {status === "permission_denied" ? "Camera permission denied" : "Camera coaching unavailable"}
            </div>
            <p className="text-xs text-white/55 mt-1">
              {error?.message ||
                "Pose tracking isn't available right now."}{" "}
              You can still finish this session without the camera.
            </p>
          </div>
        </div>
      )}

      {/* Framing warnings */}
      {showVideo && warnings.length > 0 && (
        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1.5 justify-center">
          {warnings.map((w) => (
            <span
              key={w.kind}
              className="text-[10px] font-bold uppercase tracking-wide bg-black/70 border border-yellow-400/40 text-yellow-300 px-2 py-1 rounded-full flex items-center gap-1"
            >
              <AlertTriangle className="w-3 h-3" /> {w.message}
            </span>
          ))}
        </div>
      )}

      {/* Live confidence chip */}
      {status === "tracking" && confidence && (
        <span className="absolute top-2 left-2 text-[10px] font-bold bg-black/60 border border-cyan-400/30 text-cyan-300 px-2 py-1 rounded-full">
          Camera confidence {Math.round(confidence.bodyConfidence * 100)}%
        </span>
      )}

      {/* Debug panel */}
      {debug && confidence && (
        <div className="absolute top-2 right-2 text-[9px] font-mono bg-black/80 border border-white/15 text-white/70 px-2 py-1.5 rounded-lg text-left leading-snug">
          <div>status: {status}</div>
          <div>conf: {confidence.bodyConfidence.toFixed(2)}</div>
          <div>visible: {(confidence.visibleRatio * 100).toFixed(0)}%</div>
          <div>tracked: {confidence.trackedFrameCount}/{confidence.totalFrameCount}</div>
          <div>people: {confidence.peopleDetected}</div>
        </div>
      )}
    </div>
  );
};

export default PoseCameraCanvas;
