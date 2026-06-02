export type PollOption = { id: string; label: string };
export type PollTally = { optionId: string; label: string; count: number; pct: number };
export type RequestStatus = 'pending' | 'queued' | 'played' | 'declined';
export type RequestAction = 'queue' | 'play' | 'decline';

/** Count votes per option and compute integer percentages (of total votes). */
export function computePollTallies(options: PollOption[], votes: { option_id: string }[]): PollTally[] {
  const total = votes.length;
  return options.map((o) => {
    const count = votes.filter((v) => v.option_id === o.id).length;
    const pct = total === 0 ? 0 : Math.round((count / total) * 100);
    return { optionId: o.id, label: o.label, count, pct };
  });
}

const TRANSITIONS: Record<RequestStatus, Partial<Record<RequestAction, RequestStatus>>> = {
  pending: { queue: 'queued', decline: 'declined' },
  queued: { play: 'played', decline: 'declined' },
  played: {},
  declined: {},
};

/** Returns the resulting status for an action, or null if the transition is not allowed. */
export function nextRequestStatus(current: RequestStatus, action: RequestAction): RequestStatus | null {
  return TRANSITIONS[current]?.[action] ?? null;
}
