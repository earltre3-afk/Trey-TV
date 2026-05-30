import {
  assertNoPrivateHandLeak,
  buildCallerSpadesProjection,
  buildPublicSpadesProjection,
  emptyPublicState,
  redactPrivateHands,
  representOutOfTurnRejection,
  validateSpadesActionPayload,
} from "./spadesProjection";
import type { SpadesProjectionInput } from "./spadesTypes";

const fixture: SpadesProjectionInput = {
  room: {
    id: "room-1",
    code: "ABC123",
    status: "active",
    gameType: "spades",
    targetScore: 500,
  },
  game: {
    ...emptyPublicState("game-1"),
    phase: "playing",
    status: "active",
    currentTurnSeat: 0,
  },
  players: [
    {
      spadesPlayerId: "sp-0",
      roomPlayerId: "rp-0",
      userId: "user-0",
      publicProfileUid: "trey0",
      seatIndex: 0,
      teamIndex: 0,
      displayName: "Seat Zero",
      privateHand: ["AS", "KH"],
    },
    {
      spadesPlayerId: "sp-1",
      roomPlayerId: "rp-1",
      userId: "user-1",
      publicProfileUid: "trey1",
      seatIndex: 1,
      teamIndex: 1,
      displayName: "Seat One",
      privateHand: ["2C", "3D"],
    },
  ],
};

export function testPublicProjectionDoesNotIncludePrivateHands() {
  const publicProjection = buildPublicSpadesProjection(fixture);
  assertNoPrivateHandLeak(publicProjection);
  if (JSON.stringify(publicProjection).includes("AS")) {
    throw new Error("Public projection leaked a private card id.");
  }
}

export function testPublicProjectionRejectsPrivateHandKeysInGameState() {
  try {
    buildPublicSpadesProjection({
      ...fixture,
      game: {
        ...fixture.game,
        privateHands: {
          "sp-0": ["AS", "KH"],
        },
      } as typeof fixture.game,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Private hand leak detected")) {
      return;
    }
  }

  throw new Error("Public projection accepted private hand keys in game state.");
}

export function testPublicProjectionRejectsHandsKeyInGameState() {
  try {
    buildPublicSpadesProjection({
      ...fixture,
      game: {
        ...fixture.game,
        hands: [["AS", "KH"]],
      } as typeof fixture.game,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Private hand leak detected")) {
      return;
    }
  }

  throw new Error("Public projection accepted a hands key in game state.");
}

export function testCallerProjectionIncludesOnlyCallerHand() {
  const result = buildCallerSpadesProjection({
    source: fixture,
    callerUserId: "user-0",
    syncMode: "supabase-auth",
    legalCards: ["AS"],
  });
  if (!result.ok) throw new Error(result.error.message);
  if (result.projection.private.hand.join(",") !== "AS,KH") {
    throw new Error("Caller hand was not included.");
  }
  if (JSON.stringify(result.projection.players).includes("2C")) {
    throw new Error("Opponent hand leaked through public player projection.");
  }
}

export function testCallerProjectionNeverIncludesOtherHands() {
  const result = buildCallerSpadesProjection({
    source: fixture,
    callerUserId: "user-0",
    syncMode: "supabase-auth",
  });
  if (!result.ok) throw new Error(result.error.message);

  const serialized = JSON.stringify({
    me: result.projection.me,
    players: result.projection.players,
    game: result.projection.game,
    room: result.projection.room,
    private: result.projection.private,
  });

  if (serialized.includes("2C") || serialized.includes("3D")) {
    throw new Error("Caller projection leaked another player's hand.");
  }
}

export function testOtherPlayersHandsAreRedacted() {
  const redacted = redactPrivateHands({ players: fixture.players });
  if (JSON.stringify(redacted).includes("privateHand")) {
    throw new Error("privateHand key was not redacted.");
  }
  if (JSON.stringify(redacted).includes("AS")) {
    throw new Error("private card value was not redacted.");
  }
}

export function testInvalidActionShapeIsRejected() {
  const result = validateSpadesActionPayload({ type: "bid", bid: 20 });
  if (result.ok || result.error.code !== "invalid_payload") {
    throw new Error("Invalid bid shape was not rejected.");
  }
}

export function testOutOfTurnActionRejectionIsRepresented() {
  const result = representOutOfTurnRejection({ type: "play_card", cardId: "AS" });
  if (result.ok || result.error.code !== "not_your_turn") {
    throw new Error("Out-of-turn rejection was not represented correctly.");
  }
}

export function testActionResponseShapeCannotIncludePrivateHands() {
  try {
    assertNoPrivateHandLeak({
      ok: false,
      error: {
        code: "illegal_action",
        message: "Rejected.",
      },
      privateHands: {
        "sp-1": ["2C", "3D"],
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Private hand leak detected")) {
      return;
    }
  }

  throw new Error("Action response shape accepted privateHands.");
}

export function testChatProjectionCannotIncludeCardData() {
  const chatProjection = {
    messages: [
      {
        id: "chat-1",
        spadesPlayerId: "sp-0",
        message: "good round",
        createdAt: "2026-05-28T00:00:00.000Z",
      },
    ],
  };
  assertNoPrivateHandLeak(chatProjection);

  if (JSON.stringify(chatProjection).match(/"([2-9JQKA]|10)[SHDC]"/)) {
    throw new Error("Chat projection should not include card ids.");
  }
}

export function testTvTokenIdentityPathIsRepresentedButNotTrustedClientSide() {
  const result = buildCallerSpadesProjection({
    source: fixture,
    callerUserId: "user-0",
    syncMode: "tv-device-token",
  });
  if (!result.ok) throw new Error(result.error.message);
  if (result.projection.me.syncMode !== "tv-device-token") {
    throw new Error("TV sync mode was not represented.");
  }
  if (result.projection.me.userId !== "user-0") {
    throw new Error("TV path must still resolve to a real server-side user id.");
  }
}
