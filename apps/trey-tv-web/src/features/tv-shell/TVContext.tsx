import React, { createContext, useContext, useState, useCallback } from 'react';

export type Screen =
  | 'home' | 'activate' | 'guide' | 'detail' | 'player'
  | 'games' | 'spades' | 'stories' | 'creator' | 'profile' | 'settings'
  | 'search' | 'browse' | 'my-list' | 'music' | 'premium' | 'watch-parties' | 'source-hub';

type TVCtx = {
  screen: Screen;
  navigate: (s: Screen) => void;
  back: () => void;
  history: Screen[];
};

const Ctx = createContext<TVCtx | null>(null);

export const TVProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<Screen[]>(['home']);
  const screen = history[history.length - 1];

  const navigate = useCallback((s: Screen) => {
    setHistory((h) => [...h, s]);
  }, []);

  const back = useCallback(() => {
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  }, []);

  return <Ctx.Provider value={{ screen, navigate, back, history }}>{children}</Ctx.Provider>;
};

export const useTV = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useTV must be used inside TVProvider');
  return c;
};
