import React, { createContext, useCallback, useContext, useRef, useState, useEffect } from "react";

export type InterruptionReason = "camera" | "microphone" | "full-video";

export interface InterruptionState {
  reason: InterruptionReason;
  startedAt: number;
}

export interface MediaInterruptionContextType {
  activeInterruptions: Map<InterruptionReason, number>;
  isInterrupted: boolean;
  beginInterruption: (reason: InterruptionReason) => void;
  endInterruption: (reason: InterruptionReason) => void;
  isInterruptionActive: (reason: InterruptionReason) => boolean;
}

const InterruptionCtx = createContext<MediaInterruptionContextType | null>(null);

export const MediaInterruptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeInterruptions, setActiveInterruptions] = useState<Map<InterruptionReason, number>>(
    new Map(),
  );

  const isInterrupted = activeInterruptions.size > 0;

  const beginInterruption = useCallback((reason: InterruptionReason) => {
    setActiveInterruptions((prev) => {
      const next = new Map(prev);
      const count = (next.get(reason) || 0) + 1;
      next.set(reason, count);
      return next;
    });
  }, []);

  const endInterruption = useCallback((reason: InterruptionReason) => {
    setActiveInterruptions((prev) => {
      const next = new Map(prev);
      const count = (next.get(reason) || 0) - 1;
      if (count <= 0) {
        next.delete(reason);
      } else {
        next.set(reason, count);
      }
      return next;
    });
  }, []);

  const isInterruptionActive = useCallback(
    (reason: InterruptionReason) => {
      const count = activeInterruptions.get(reason);
      return typeof count === "number" && count > 0;
    },
    [activeInterruptions],
  );

  const value: MediaInterruptionContextType = {
    activeInterruptions,
    isInterrupted,
    beginInterruption,
    endInterruption,
    isInterruptionActive,
  };

  return <InterruptionCtx.Provider value={value}>{children}</InterruptionCtx.Provider>;
};

export const useMediaInterruption = (): MediaInterruptionContextType => {
  const ctx = useContext(InterruptionCtx);
  if (!ctx) throw new Error("useMediaInterruption must be used within MediaInterruptionProvider");
  return ctx;
};
