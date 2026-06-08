export type SpadesTrickCard = {
  seat: number;
  cardId: string;
};

export type SpadesPresentationState = {
  trick: SpadesTrickCard[];
  lastTrick?: SpadesTrickCard[];
};

export function getDisplayedSpadesTrick(state: SpadesPresentationState): SpadesTrickCard[] {
  return state.trick.length > 0 ? state.trick : (state.lastTrick ?? []);
}

export function buildSpadesVisualEventKey(
  state: {
    round: number;
    phase: string;
    currentSeat: number;
  },
  displayedTrick: SpadesTrickCard[],
  winnerSeat: number | null,
): string {
  const cards = displayedTrick.map(({ seat, cardId }) => `${seat}:${cardId}`).join(",");
  return `${state.round}:${state.phase}:${state.currentSeat}:${cards}:winner-${winnerSeat ?? "none"}`;
}
