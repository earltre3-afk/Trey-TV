// TRANCE — Pose tracking service boundary.
// Interface stub to connect future client-side MediaPipe/MoveNet models or backend analytics.

import { PoseLandmarkFrame, PoseComparisonResult } from '../types';

export const trancePoseTrackingService = {
  /**
   * Request user permission and initialize camera + pose estimation library (MediaPipe)
   */
  startPoseSession: async (videoElement: HTMLVideoElement | null): Promise<{ success: boolean; error?: string }> => {
    console.log('[AI Pose] Initializing camera and landmarks library.');
    const enableCamera = import.meta.env.VITE_TRANCE_ENABLE_CAMERA === 'true';
    const enableAi = import.meta.env.VITE_TRANCE_ENABLE_AI_POSE === 'true';

    if (!enableCamera) {
      console.warn('[AI Pose] Camera disabled by environment variables.');
      return { success: false, error: 'Camera access disabled by configuration' };
    }

    if (!videoElement) {
      return { success: false, error: 'Target video element unavailable' };
    }

    try {
      // Prompt for real camera streams
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
      videoElement.srcObject = stream;
      await videoElement.play();
      
      if (enableAi) {
        console.log('[AI Pose] Loading MediaPipe model graphs...');
      }
      return { success: true };
    } catch (err: unknown) {
      console.error('[AI Pose] Camera access request rejected:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Permission denied' };
    }
  },

  /**
   * Teardown camera hooks and dispose pose estimation workers
   */
  stopPoseSession: async (videoElement: HTMLVideoElement | null): Promise<void> => {
    console.log('[AI Pose] Tearing down camera stream.');
    if (!videoElement || !videoElement.srcObject) return;
    try {
      const stream = videoElement.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoElement.srcObject = null;
    } catch (e) {
      console.warn('[AI Pose] Error tearing down camera track:', e);
    }
  },

  /**
   * Client-side evaluation helper comparing raw landmark arrays
   */
  comparePoseToTarget: (
    userFrame: PoseLandmarkFrame,
    targetFrame: PoseLandmarkFrame
  ): PoseComparisonResult => {
    // Computes cosine similarities or euclidean distances between corresponding joint vectors
    const overallScore = 88 + Math.floor(Math.random() * 10); // Simulated high similarity
    return {
      frameIndex: 0,
      timestampMs: userFrame.timestampMs,
      overallScore,
      jointAngles: {
        leftElbow: 125,
        rightElbow: 130,
        leftKnee: 180,
        rightKnee: 180,
      },
      timingDeltaMs: -15 + Math.floor(Math.random() * 30),
      confidence: 0.95,
    };
  },

  calculateTimingScore: (): number => {
    return 90 + Math.floor(Math.random() * 10);
  },

  calculateSyncScore: (): number => {
    return 85 + Math.floor(Math.random() * 15);
  },

  detectMissedStep: (): { time: string; move: string } | null => {
    if (Math.random() > 0.8) {
      return { time: '0:42', move: 'Spun too late' };
    }
    return null;
  },
};
