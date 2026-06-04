let interruptionCallbacks: {
  beginInterruption: ((reason: "camera" | "microphone" | "full-video") => void) | null;
  endInterruption: ((reason: "camera" | "microphone" | "full-video") => void) | null;
} = {
  beginInterruption: null,
  endInterruption: null,
};

export function setMediaInterruptionCallbacks(
  beginInterruption: ((reason: "camera" | "microphone" | "full-video") => void) | null,
  endInterruption: ((reason: "camera" | "microphone" | "full-video") => void) | null,
) {
  interruptionCallbacks = { beginInterruption, endInterruption };
}

export function getMediaInterruptionCallbacks() {
  return interruptionCallbacks;
}

export async function getUserMediaWithInterruption(
  constraints: MediaStreamConstraints,
): Promise<MediaStream> {
  const { beginInterruption, endInterruption } = getMediaInterruptionCallbacks();

  const hasVideo = constraints.video !== false;
  const hasAudio = constraints.audio !== false;

  if (hasVideo || hasAudio) {
    if (beginInterruption) {
      if (hasAudio) beginInterruption("microphone");
      if (hasVideo) beginInterruption("camera");
    }
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    stream.getTracks().forEach((track) => {
      track.addEventListener("ended", () => {
        const activeTracks = stream.getTracks().filter((t) => t.readyState === "live");
        if (activeTracks.length === 0) {
          if (endInterruption) {
            if (track.kind === "audio") endInterruption("microphone");
            if (track.kind === "video") endInterruption("camera");
          }
        }
      });
    });

    return stream;
  } catch (error) {
    if (endInterruption) {
      if (hasVideo) endInterruption("camera");
      if (hasAudio) endInterruption("microphone");
    }
    throw error;
  }
}

export function notifyVideoPlaybackStarted() {
  const { beginInterruption } = getMediaInterruptionCallbacks();
  if (beginInterruption) beginInterruption("full-video");
}

export function notifyVideoPlaybackEnded() {
  const { endInterruption } = getMediaInterruptionCallbacks();
  if (endInterruption) endInterruption("full-video");
}
