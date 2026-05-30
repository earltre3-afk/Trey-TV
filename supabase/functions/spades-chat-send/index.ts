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
    return commandError("bad_request", "Use POST to send a Spades chat message.", 405);
  }

  const prepared = await prepareSpadesCommand<{
    roomId?: unknown;
    message?: unknown;
    tvDeviceToken?: unknown;
  }>(req);
  if (prepared instanceof Response) {
    return prepared;
  }

  const roomId = requireString(prepared.body.roomId, "roomId");
  if (roomId instanceof Response) {
    return roomId;
  }

  const message = requireString(prepared.body.message, "message");
  if (message instanceof Response) {
    return message;
  }

  if (message.length > 500) {
    return commandError("bad_request", "message must be 500 characters or fewer.", 400);
  }

  // TODO(SPADES-4): Confirm membership, insert spades_chat_messages, and return
  // the updated caller-safe room projection without private hands from others.
  return notImplementedProjectionResponse("spades-chat-send", prepared.identity);
});
