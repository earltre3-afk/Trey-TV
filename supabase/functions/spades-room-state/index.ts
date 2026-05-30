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

  if (req.method !== "GET" && req.method !== "POST") {
    return commandError("bad_request", "Use GET or POST to read Spades room state.", 405);
  }

  const prepared = await prepareSpadesCommand<{ roomId?: unknown; tvDeviceToken?: unknown }>(req);
  if (prepared instanceof Response) {
    return prepared;
  }

  const roomId =
    req.method === "GET" ? new URL(req.url).searchParams.get("roomId") : prepared.body.roomId;
  const checkedRoomId = requireString(roomId, "roomId");
  if (checkedRoomId instanceof Response) {
    return checkedRoomId;
  }

  // TODO(SPADES-4): Load public state plus only the caller's private hand and
  // run assertNoPrivateHandLeak before returning the projection.
  return notImplementedProjectionResponse("spades-room-state", prepared.identity);
});
