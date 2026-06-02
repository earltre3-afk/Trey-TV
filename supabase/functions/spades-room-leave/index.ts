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
    return commandError("bad_request", "Use POST to leave a Spades room.", 405);
  }

  const prepared = await prepareSpadesCommand<{
    roomId?: unknown;
    tvDeviceToken?: unknown;
  }>(req);
  if (prepared instanceof Response) {
    return prepared;
  }

  const roomId = requireString(prepared.body.roomId, "roomId");
  if (roomId instanceof Response) {
    return roomId;
  }

  // TODO(SPADES-4): Mark the caller's room membership disconnected/left,
  // apply any game-abandonment rules, and return a caller-safe projection.
  return notImplementedProjectionResponse("spades-room-leave", prepared.identity);
});
