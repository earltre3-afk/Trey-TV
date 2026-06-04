import React, { createContext, useCallback, useContext, useRef, useState } from "react";

export type DuckingReason = "notification" | "alert" | "system";

export interface AudioDuckingContextType {
  activeDucks: Map<DuckingReason, number>;
  isDucked: boolean;
  duckLevel: number;
  beginDuck: (reason: DuckingReason, level?: number) => void;
  endDuck: (reason: DuckingReason) => void;
  isDuckActive: (reason: DuckingReason) => boolean;
}

const DuckingCtx = createContext<AudioDuckingContextType | null>(null);

const DEFAULT_DUCK_LEVEL = 0.2;
const DUCK_LEVEL_RANGE = { min: 0.1, max: 0.4 };

export const AudioDuckingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeDucks, setActiveDucks] = useState<Map<DuckingReason, number>>(new Map());
  const duckLevelRef = useRef(DEFAULT_DUCK_LEVEL);

  const isDucked = activeDucks.size > 0;
  const duckLevel = isDucked ? duckLevelRef.current : 1.0;

  const beginDuck = useCallback((reason: DuckingReason, level?: number) => {
    const normalizedLevel = level
      ? Math.max(DUCK_LEVEL_RANGE.min, Math.min(DUCK_LEVEL_RANGE.max, level))
      : DEFAULT_DUCK_LEVEL;
    duckLevelRef.current = Math.min(duckLevelRef.current, normalizedLevel);

    setActiveDucks((prev) => {
      const next = new Map(prev);
      const count = (next.get(reason) || 0) + 1;
      next.set(reason, count);
      return next;
    });
  }, []);

  const endDuck = useCallback((reason: DuckingReason) => {
    setActiveDucks((prev) => {
      const next = new Map(prev);
      const count = (next.get(reason) || 0) - 1;
      if (count <= 0) {
        next.delete(reason);
        if (next.size === 0) {
          duckLevelRef.current = DEFAULT_DUCK_LEVEL;
        }
      } else {
        next.set(reason, count);
      }
      return next;
    });
  }, []);

  const isDuckActive = useCallback(
    (reason: DuckingReason) => {
      const count = activeDucks.get(reason);
      return typeof count === "number" && count > 0;
    },
    [activeDucks],
  );

  const value: AudioDuckingContextType = {
    activeDucks,
    isDucked,
    duckLevel,
    beginDuck,
    endDuck,
    isDuckActive,
  };

  return <DuckingCtx.Provider value={value}>{children}</DuckingCtx.Provider>;
};

export const useAudioDucking = (): AudioDuckingContextType => {
  const ctx = useContext(DuckingCtx);
  if (!ctx) throw new Error("useAudioDucking must be used within AudioDuckingProvider");
  return ctx;
};
