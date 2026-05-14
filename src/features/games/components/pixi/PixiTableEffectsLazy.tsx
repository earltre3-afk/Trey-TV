import React, { Suspense } from 'react';

export type PixiGameKind = 'spades' | 'blackjack' | 'bullshit';

export interface PixiTableEffectsProps {
  game: PixiGameKind;
  accent: string;
  eventKey: string;
  cardCount?: number;
  secondaryCount?: number;
  result?: string | null;
  winnerSeat?: number | null;
  reveal?: boolean;
  bet?: number;
  className?: string;
}

const LazyPixiTableEffects = React.lazy(() => import('./PixiTableEffects'));

export function PixiTableEffectsLazy(props: PixiTableEffectsProps) {
  return (
    <Suspense fallback={null}>
      <LazyPixiTableEffects {...props} />
    </Suspense>
  );
}

export default PixiTableEffectsLazy;
