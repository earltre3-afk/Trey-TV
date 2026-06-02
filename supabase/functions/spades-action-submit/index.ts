import {
  commandError,
  notImplementedProjectionResponse,
  optionsResponse,
  prepareSpadesCommand,
  requireString,
} from "../_shared/spadesCommand.ts";

const allowedActions = new Set(["bid", "play_card", "next_round", "leave_room", "heartbeat"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return optionsResponse();
  }

  if (req.method !== "POST") {
    return commandError("bad_request", "Use POST to submit a Spades action.", 405);
  }

  const prepared = await prepareSpadesCommand<{
    roomId?: unknown;
    actionType?: unknown;
    actionPayload?: unknown;
    tvDeviceToken?: unknown;
  }>(req);
  if (prepared instanceof Response) {
    return prepared;
  }

  const roomId = requireString(prepared.body.roomId, "roomId");
  if (roomId instanceof Response) {
    return roomId;
  }

  const actionType = requireString(prepared.body.actionType, "actionType");
  if (actionType instanceof Response) {
    return actionType;
  }

  if (!allowedActions.has(actionType)) {
    return commandError("bad_request", "actionType is not supported.", 400);
  }

  if (
    prepared.body.actionPayload !== undefined &&
    (typeof prepared.body.actionPayload !== "object" || prepared.body.actionPayload === null)
  ) {
    return commandError("bad_request", "actionPayload must be an object when provided.", 400);
  }

  // TODO(SPADES-4): Lock the spades_games row, validate turn/phase/legal move
  // server-side, mutate public and private state separately, append spades_actions,
  // and return only the caller-safe projection.
  return notImplementedProjectionResponse("spades-action-submit", prepared.identity);
});
