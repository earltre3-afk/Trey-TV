import {
  commandError,
  notImplementedProjectionResponse,
  optionsResponse,
  prepareSpadesCommand,
  requireString,
} from "../_shared/spadesCommand.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return optionsResponse();
  }

  if (req.method !== "POST") {
    return commandError("bad_request", "Use POST to join a Spades room.", 405);
  }

  const prepared = await prepareSpadesCommand<{
    joinCode?: unknown;
    displayName?: unknown;
    tvDeviceToken?: unknown;
  }>(req);
  if (prepared instanceof Response) {
    return prepared;
  }

  const joinCode = requireString(prepared.body.joinCode, "joinCode");
  if (joinCode instanceof Response) {
    return joinCode;
  }

  if (prepared.body.displayName !== undefined && typeof prepared.body.displayName !== "string") {
    return commandError("bad_request", "displayName must be a string when provided.", 400);
  }

  // TODO(SPADES-4): Resolve joinCode to one game_rooms row, assign one seat,
  // create/reuse spades_players, and return a caller-safe projection.
  return notImplementedProjectionResponse("spades-room-join", prepared.identity);
});
