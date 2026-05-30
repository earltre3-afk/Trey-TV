import type {
  SpadesActionPayload,
  SpadesCallerProjection,
  SpadesCommandResponse,
  SpadesPrivateHandProjection,
  SpadesProjectionInput,
  SpadesPublicState,
  SpadesRawPlayerState,
  SpadesSeat,
  SpadesSyncMode,
} from "./spadesTypes";

const PRIVATE_HAND_KEYS = new Set([
  "hand",
  "hands",
  "privateHand",
  "privateHands",
  "encrypted_or_private_hand",
  "encryptedOrPrivateHand",
]);

export function redactPrivateHands<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => redactPrivateHands(item)) as T;
  }
  if (!value || typeof value !== "object") return value;

  const output: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (PRIVATE_HAND_KEYS.has(key)) continue;
    output[key] = redactPrivateHands(nested);
  }
  return output as T;
}

export function assertNoPrivateHandLeak(value: unknown): void {
  const path = findPrivateHandLeak(value);
  if (path) {
    throw new Error(`Private hand leak detected at ${path}`);
  }
}

export function buildPublicSpadesProjection(input: SpadesProjectionInput) {
  const projection = {
    room: input.room,
    game: input.game,
    players: input.players.map(toPublicPlayer),
  };
  assertNoPrivateHandLeak(projection);
  return projection;
}

export function buildCallerSpadesProjection(input: {
  source: SpadesProjectionInput;
  callerUserId: string;
  callerPublicProfileUid?: string | null;
  syncMode: SpadesSyncMode;
  legalCards?: string[];
  legalBids?: number[];
}): SpadesCommandResponse<SpadesCallerProjection> {
  const caller = input.source.players.find((player) => (
    !player.isBot &&
    (player.userId === input.callerUserId ||
      (!!input.callerPublicProfileUid && player.publicProfileUid === input.callerPublicProfileUid))
  ));

  if (!caller) {
    return {
      ok: false,
      error: {
        code: "not_a_participant",
        message: "The caller is not seated in this Spades game.",
      },
    };
  }

  const privateProjection: SpadesPrivateHandProjection = {
    spadesPlayerId: caller.spadesPlayerId,
    seatIndex: caller.seatIndex,
    hand: [...(caller.privateHand ?? [])],
    legalCards: [...(input.legalCards ?? [])],
    legalBids: [...(input.legalBids ?? [])],
  };

  const projection: SpadesCallerProjection = {
    room: input.source.room,
    me: {
      userId: input.callerUserId,
      publicProfileUid: caller.publicProfileUid ?? input.callerPublicProfileUid ?? null,
      spadesPlayerId: caller.spadesPlayerId,
      roomPlayerId: caller.roomPlayerId,
      seatIndex: caller.seatIndex,
      teamIndex: caller.teamIndex,
      syncMode: input.syncMode,
    },
    players: input.source.players.map(toPublicPlayer),
    game: input.source.game,
    private: privateProjection,
  };

  assertNoPrivateHandLeak({
    room: projection.room,
    me: projection.me,
    players: projection.players,
    game: projection.game,
  });

  return { ok: true, projection };
}

export function validateSpadesActionPayload(value: unknown): SpadesCommandResponse<SpadesActionPayload> {
  if (!value || typeof value !== "object") {
    return invalidPayload("Action payload must be an object.");
  }

  const candidate = value as Record<string, unknown>;
  if (candidate.type === "bid") {
    if (!Number.isInteger(candidate.bid) || Number(candidate.bid) < 0 || Number(candidate.bid) > 13) {
      return invalidPayload("Bid must be an integer from 0 through 13.");
    }
    return { ok: true, projection: { type: "bid", bid: Number(candidate.bid) } };
  }

  if (candidate.type === "play_card") {
    if (typeof candidate.cardId !== "string" || !/^(10|[2-9JQKA])[SHDC]$/.test(candidate.cardId)) {
      return invalidPayload("Card id must be a valid compact card id such as AS or 10H.");
    }
    return { ok: true, projection: { type: "play_card", cardId: candidate.cardId } };
  }

  if (candidate.type === "next_round") return { ok: true, projection: { type: "next_round" } };
  if (candidate.type === "leave_room") return { ok: true, projection: { type: "leave_room" } };
  if (candidate.type === "heartbeat") return { ok: true, projection: { type: "heartbeat" } };

  return invalidPayload("Unsupported Spades action type.");
}

export function representOutOfTurnRejection(action: SpadesActionPayload): SpadesCommandResponse {
  return {
    ok: false,
    error: {
      code: "not_your_turn",
      message: "It is not the caller's turn for this Spades action.",
      rejectedAction: action,
    },
  };
}

function toPublicPlayer(player: SpadesRawPlayerState) {
  return {
    spadesPlayerId: player.spadesPlayerId,
    roomPlayerId: player.roomPlayerId,
    seatIndex: player.seatIndex,
    teamIndex: player.teamIndex,
    displayName: player.displayName,
    avatarUrl: player.avatarUrl ?? null,
    publicProfileUid: player.publicProfileUid,
    status: player.status ?? "joined",
    isBot: !!player.isBot,
    isConnected: player.isConnected ?? true,
    cardCount: player.cardCount ?? player.privateHand?.length ?? 0,
    bid: player.bid ?? null,
    tricksWon: player.tricksWon ?? 0,
  };
}

function invalidPayload(message: string): SpadesCommandResponse<SpadesActionPayload> {
  return { ok: false, error: { code: "invalid_payload", message } };
}

function findPrivateHandLeak(value: unknown, path = "$"): string | null {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findPrivateHandLeak(value[index], `${path}[${index}]`);
      if (found) return found;
    }
    return null;
  }

  if (!value || typeof value !== "object") return null;

  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (PRIVATE_HAND_KEYS.has(key)) return `${path}.${key}`;
    const found = findPrivateHandLeak(nested, `${path}.${key}`);
    if (found) return found;
  }

  return null;
}

export function seatFromNumber(value: number | null | undefined): SpadesSeat | null {
  return value === 0 || value === 1 || value === 2 || value === 3 ? value : null;
}

export function emptyPublicState(gameId: string): SpadesPublicState {
  return {
    id: gameId,
    phase: "waiting",
    status: "waiting",
    roundNumber: 1,
    handNumber: 1,
    dealerSeat: null,
    leadSeat: null,
    currentTurnSeat: null,
    spadesBroken: false,
    teamScores: [0, 0],
    teamBags: [0, 0],
    teamRoundBids: [0, 0],
    teamRoundTricks: [0, 0],
    currentTrick: [],
    version: 0,
  };
}
