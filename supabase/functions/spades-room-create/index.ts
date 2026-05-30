import {
  commandError,
  notImplementedProjectionResponse,
  optionsResponse,
  prepareSpadesCommand,
} from "../_shared/spadesCommand.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return optionsResponse();
  }

  if (req.method !== "POST") {
    return commandError("bad_request", "Use POST to create a Spades room.", 405);
  }

  const prepared = await prepareSpadesCommand<{
    displayName?: unknown;
    targetScore?: unknown;
    tvDeviceToken?: unknown;
  }>(req);
  if (prepared instanceof Response) {
    return prepared;
  }

  const { body, identity } = prepared;
  if (body.displayName !== undefined && typeof body.displayName !== "string") {
    return commandError("bad_request", "displayName must be a string when provided.", 400);
  }

  if (body.targetScore !== undefined && typeof body.targetScore !== "number") {
    return commandError("bad_request", "targetScore must be a number when provided.", 400);
  }

  // TODO(SPADES-4): In one transaction, create game_rooms, game_room_players,
  // and spades_games rows, then return a caller-safe projection.
  return notImplementedProjectionResponse("spades-room-create", identity);
});
