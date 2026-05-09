import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const KEY = "treytv_guide_v1";

type State = {
  saved: string[];          // episode ids
  watchLater: string[];
  reminders: string[];
  mySchedule: string[];
  watched: string[];
  premiumUnlocked: string[];
};

const empty: State = { saved: [], watchLater: [], reminders: [], mySchedule: [], watched: [], premiumUnlocked: [] };

type Ctx = State & {
  toggle: (key: keyof State, id: string) => void;
  has: (key: keyof State, id: string) => boolean;
};

const C = createContext<Ctx | null>(null);

export function GuideProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(empty);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...empty, ...JSON.parse(raw) });
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const value = useMemo<Ctx>(() => ({
    ...state,
    toggle: (key, id) =>
      setState((s) => {
        const arr = s[key];
        const next = arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
        return { ...s, [key]: next };
      }),
    has: (key, id) => state[key].includes(id),
  }), [state]);

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useGuide() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useGuide must be inside <GuideProvider>");
  return ctx;
}
