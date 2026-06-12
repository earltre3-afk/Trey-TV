import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { CreateType } from './last-create-type.ts';

interface CreateArcContextValue {
  isOpen: boolean;
  hoveredId: CreateType | null;
  openArc: () => void;
  closeArc: () => void;
  setHovered: (id: CreateType | null) => void;
}

const CreateArcContext = createContext<CreateArcContextValue | null>(null);

export function CreateArcProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<CreateType | null>(null);

  const openArc = useCallback(() => {
    setHoveredId(null);
    setIsOpen(true);
  }, []);
  const closeArc = useCallback(() => {
    setIsOpen(false);
    setHoveredId(null);
  }, []);
  const setHovered = useCallback((id: CreateType | null) => {
    setHoveredId(id);
  }, []);

  const value = useMemo<CreateArcContextValue>(
    () => ({ isOpen, hoveredId, openArc, closeArc, setHovered }),
    [isOpen, hoveredId, openArc, closeArc, setHovered],
  );

  return <CreateArcContext.Provider value={value}>{children}</CreateArcContext.Provider>;
}

export function useCreateArc(): CreateArcContextValue {
  const value = useContext(CreateArcContext);
  if (!value) {
    throw new Error('useCreateArc must be used inside a <CreateArcProvider>.');
  }
  return value;
}
