import { Plus } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useRef } from 'react';
import { useCreateArc } from '@/lib/create-arc-context';
import { haptic } from '@/lib/haptics';
import {
  CREATE_TYPES,
  readLastCreateType,
  writeLastCreateType,
  type CreateType,
} from '@/lib/last-create-type';
import { computeHoveredBubble } from '@/lib/hover-hit-test';
import { usePressAndHold } from '@/hooks/use-press-and-hold';

export function CreateWheel() {
  const navigate = useNavigate();
  const { openArc, closeArc, setHovered } = useCreateArc();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  // We need the latest hoveredId at release time without re-binding handlers
  // each render. Track it in a ref via setHovered's caller.
  const hoveredRef = useRef<CreateType | null>(null);

  const goToCreate = useCallback(
    (type: CreateType) => {
      writeLastCreateType(type);
      navigate({ to: '/create', search: { type } });
    },
    [navigate],
  );

  const getPivot = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { x: rect.left + rect.width / 2, y: rect.top };
  }, []);

  const handlers = usePressAndHold({
    onTap: () => {
      haptic('light');
      goToCreate(readLastCreateType());
    },
    onHoldStart: () => {
      haptic('selection');
      hoveredRef.current = null;
      openArc();
    },
    onHoldMove: (px, py) => {
      const pivot = getPivot();
      if (!pivot) return;
      const next = computeHoveredBubble(px, py, pivot.x, pivot.y);
      if (next !== hoveredRef.current) {
        hoveredRef.current = next;
        setHovered(next);
        if (next !== null) haptic('selection');
      }
    },
    onHoldEnd: () => {
      const target = hoveredRef.current;
      hoveredRef.current = null;
      closeArc();
      if (target !== null) {
        haptic('medium');
        goToCreate(target);
      }
    },
    onHoldCancel: () => {
      hoveredRef.current = null;
      closeArc();
    },
  });

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        haptic('light');
        goToCreate(readLastCreateType());
      }
    },
    [goToCreate],
  );

  return (
    <button
      ref={buttonRef}
      onPointerDown={handlers.onPointerDown}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={handlers.onPointerUp}
      onPointerCancel={handlers.onPointerCancel}
      onKeyDown={onKeyDown}
      onContextMenu={(e) => e.preventDefault()}
      className="relative size-16 rounded-full grid place-items-center bg-background border-2 border-primary text-primary glow-gold animate-glow-pulse select-none active:scale-[0.96] transition-transform duration-150 touch-manipulation"
      style={{
        marginTop: '-1.75rem',
        zIndex: 10001,
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'none',
      }}
      aria-label="Create"
      aria-haspopup="menu"
      type="button"
    >
      <Plus className="size-7" />
      {/* Hidden helper — surfaces the menu items to assistive tech. */}
      <span className="sr-only">
        Tap to start a {readLastCreateType()}. Press and hold to choose: {CREATE_TYPES.join(', ')}.
      </span>
    </button>
  );
}
