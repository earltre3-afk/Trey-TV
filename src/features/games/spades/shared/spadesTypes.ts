export type SpadesRoomStatus = "waiting" | "active" | "completed" | "abandoned";

export type SpadesGamePhase =
  | "waiting"
  | "bidding"
  | "playing"
  | "round_end"
  | "game_over"
  | "abandoned";

export type SpadesSyncMode = "supabase-auth" | "tv-device-token" | "server-service-role";

export type SpadesSeat = 0 | 1 | 2 | 3;
export type SpadesTeam = 0 | 1;

export interface SpadesRoomProjection {
  id: string;
  code: string;
  status: SpadesRoomStatus;
  gameType: "spades";
  targetScore: number;
}

export interface SpadesPlayerProjection {
  spadesPlayerId: string;
  roomPlayerId: string;
  seatIndex: SpadesSeat;
  teamIndex: SpadesTeam;
  displayName: string;
  avatarUrl: string | null;
  publicProfileUid: string | null;
  status: string;
  isBot: boolean;
  isConnected: boolean;
  cardCount: number;
  bid: number | null;
  tricksWon: number;
}

export interface SpadesTrickCard {
  seatIndex: SpadesSeat;
  cardId: string;
}

export interface SpadesPublicState {
  id: string;
  phase: SpadesGamePhase;
  status: SpadesRoomStatus;
  roundNumber: number;
  handNumber: number;
  dealerSeat: SpadesSeat | null;
  leadSeat: SpadesSeat | null;
  currentTurnSeat: SpadesSeat | null;
  spadesBroken: boolean;
  teamScores: [number, number];
  teamBags: [number, number];
  teamRoundBids: [number, number];
  teamRoundTricks: [number, number];
  currentTrick: SpadesTrickCard[];
  version: number;
}

export interface SpadesPrivateHandProjection {
  spadesPlayerId: string;
  seatIndex: SpadesSeat;
  hand: string[];
  legalCards: string[];
  legalBids: number[];
}

export interface SpadesCallerProjection {
  room: SpadesRoomProjection;
  me: {
    userId: string;
    publicProfileUid: string | null;
    spadesPlayerId: string;
    roomPlayerId: string;
    seatIndex: SpadesSeat;
    teamIndex: SpadesTeam;
    syncMode: SpadesSyncMode;
  };
  players: SpadesPlayerProjection[];
  game: SpadesPublicState;
  private: SpadesPrivateHandProjection;
}

export type SpadesActionType = "bid" | "play_card" | "next_round" | "leave_room" | "heartbeat";

export type SpadesActionPayload =
  | { type: "bid"; bid: number }
  | { type: "play_card"; cardId: string }
  | { type: "next_round" }
  | { type: "leave_room" }
  | { type: "heartbeat" };

export type SpadesCommandErrorCode =
  | "unauthorized"
  | "invalid_identity"
  | "invalid_payload"
  | "room_not_found"
  | "not_a_participant"
  | "not_your_turn"
  | "illegal_action"
  | "private_state_unavailable"
  | "not_implemented"
  | "server_error";

export type SpadesCommandResponse<T = SpadesCallerProjection> =
  | { ok: true; projection: T; sequence?: number }
  | {
      ok: false;
      error: {
        code: SpadesCommandErrorCode;
        message: string;
        rejectedAction?: SpadesActionPayload;
      };
    };

export interface SpadesRawPlayerState {
  spadesPlayerId: string;
  roomPlayerId: string;
  userId: string | null;
  publicProfileUid: string | null;
  seatIndex: SpadesSeat;
  teamIndex: SpadesTeam;
  displayName: string;
  avatarUrl?: string | null;
  status?: string;
  isBot?: boolean;
  isConnected?: boolean;
  cardCount?: number;
  bid?: number | null;
  tricksWon?: number;
  privateHand?: string[];
}

export interface SpadesProjectionInput {
  room: SpadesRoomProjection;
  game: SpadesPublicState;
  players: SpadesRawPlayerState[];
}
