export type LiveSessionLite = { host_user_id: string; status: "live" | "ended" } | null;

export interface PublishResolution {
  allowed: boolean; // may the user join the room at all?
  canPublish: boolean; // host only
  canSubscribe: boolean;
}

/** Decide LiveKit grants for a tradio-show room: only the live session's host publishes. */
export function resolveTradioShowPublish(input: {
  session: LiveSessionLite;
  userId: string;
}): PublishResolution {
  const { session, userId } = input;
  if (!session || session.status !== "live") {
    return { allowed: false, canPublish: false, canSubscribe: false };
  }
  const isHost = !!userId && session.host_user_id === userId;
  return { allowed: true, canPublish: isHost, canSubscribe: true };
}

export function tradioShowRoomName(sessionId: string): string {
  return `tradio-show:${sessionId}`;
}
