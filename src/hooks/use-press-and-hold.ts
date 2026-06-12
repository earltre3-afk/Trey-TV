import { useCallback, useRef } from 'react';

export const HOLD_THRESHOLD_MS = 220;

export interface PressAndHoldHandlers {
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: React.PointerEvent<HTMLElement>) => void;
}

export interface UsePressAndHoldArgs {
  onTap: () => void;
  onHoldStart: () => void;
  onHoldMove: (pointerX: number, pointerY: number) => void;
  onHoldEnd: () => void;
  onHoldCancel: () => void;
}

type Phase = 'idle' | 'pressing' | 'holding';

export function usePressAndHold(args: UsePressAndHoldArgs): PressAndHoldHandlers {
  const phaseRef = useRef<Phase>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  // Latest args in a ref so the handlers don't re-bind on every render.
  const argsRef = useRef(args);
  argsRef.current = args;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (phaseRef.current !== 'idle') return;
    // Only respond to primary button / single-touch.
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    phaseRef.current = 'pressing';
    pointerIdRef.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // older browsers — capture isn't critical, hit-testing still works.
    }
    e.preventDefault();
    timerRef.current = setTimeout(() => {
      if (phaseRef.current === 'pressing') {
        phaseRef.current = 'holding';
        argsRef.current.onHoldStart();
      }
    }, HOLD_THRESHOLD_MS);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (phaseRef.current !== 'holding') return;
    if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
    argsRef.current.onHoldMove(e.clientX, e.clientY);
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
    const phase = phaseRef.current;
    clearTimer();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch { /* noop */ }
    phaseRef.current = 'idle';
    pointerIdRef.current = null;
    if (phase === 'pressing') {
      argsRef.current.onTap();
    } else if (phase === 'holding') {
      argsRef.current.onHoldEnd();
    }
  }, [clearTimer]);

  const onPointerCancel = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
    const phase = phaseRef.current;
    clearTimer();
    phaseRef.current = 'idle';
    pointerIdRef.current = null;
    if (phase === 'holding') {
      argsRef.current.onHoldCancel();
    }
  }, [clearTimer]);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
