/**
 * LiveKit token generation endpoint and diagnostics handler.
 *
 * Story narration rooms explicitly dispatch the deployed narrator agent with
 * LiveKit's RoomConfiguration/RoomAgentDispatch token grant. Game and inbox
 * rooms deliberately receive only normal participant grants.
 */

import { RoomAgentDispatch, RoomConfiguration } from "@livekit/protocol";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { getTreyIServiceClient } from "./trey-i/onboarding.server";
import { loadLiveKitConfig, getLiveKitConfigDiagnostics } from "./livekit-config.server";
import { resolveTradioShowPublish, tradioShowRoomName } from "./tradio/liveSessionPolicy";

const AGENT_NAME = "Hayden-1f01";
const TOKEN_TTL = "15m";

type RoomKind =
  | "interactive-story"
  | "story-maker"
  | "game"
  | "inbox"
  | "watch-party"
  | "tradio-show";

type ParticipantProfile = {
  identity: string;
  name: string;
  userUid: string;
};

type RoomResolution = {
  kind: RoomKind;
  roomName: string;
  dispatchAgent: boolean;
  metadata: {
    mode: "story-narrator" | "voice-room";
    storyId: string | null;
    beatId: string | null;
    pageId: string | null;
    projectId: string | null;
    userUid: string | null;
  };
};

type TokenInspection = {
  hasRoomConfig: boolean;
  agentCount: number;
  agentNames: string[];
  dispatchAgentPresent: boolean;
  dispatchMetadataValid: boolean;
  dispatchMetadataMode: string;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function cleanPart(value: unknown, fallback: string): string {
  const raw = typeof value === "string" ? value : fallback;
  return (
    raw
      .trim()
      .toLowerCase()
      .replace(/[_\s]+/g, "-")
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 96) || fallback
  );
}

function cleanIdentity(value: unknown, fallback: string): string {
  const raw = typeof value === "string" ? value : fallback;
  return (
    raw
      .trim()
      .replace(/[^a-zA-Z0-9_.@-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 128) || fallback
  );
}

function cleanName(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

function emailUsername(email: unknown): string {
  if (typeof email !== "string") return "";
  return cleanName(email.split("@")[0]);
}

function shortId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function apiKeyFingerprint(apiKey: string): string {
  if (!apiKey) return "";
  return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
}

function livekitHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

async function readPayload(request: Request): Promise<Record<string, unknown>> {
  if (request.method === "GET") {
    const url = new URL(request.url);
    return Object.fromEntries(url.searchParams.entries());
  }
  return (await request.json().catch(() => ({}))) as Record<string, unknown>;
}

function decodeJwtPayload(jwt: string): Record<string, unknown> | null {
  try {
    const [, payload] = jwt.split(".");
    if (!payload) return null;
    if (typeof Buffer !== "undefined") {
      return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<
        string,
        unknown
      >;
    }
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function bearerToken(request: Request): string {
  const auth = request.headers.get("authorization") ?? "";
  return auth.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? "";
}

async function resolveParticipant(request: Request): Promise<ParticipantProfile> {
  const token = bearerToken(request);
  if (!token) {
    const id = `guest-${shortId()}`;
    return { identity: id, name: "Storyteller", userUid: id };
  }

  try {
    const service = getTreyIServiceClient();
    const { data, error } = await service.auth.getUser(token);
    const user = error ? null : data.user;
    if (!user) throw new Error("Unauthenticated");

    const { data: profile } = await (service as any)
      .from("profiles")
      .select("public_profile_uid, display_name, username, full_name")
      .eq("id", user.id)
      .maybeSingle();

    const identity = cleanIdentity(profile?.public_profile_uid || user.id, user.id);
    const name =
      cleanName(profile?.display_name) ||
      cleanName(profile?.username) ||
      cleanName(profile?.full_name) ||
      emailUsername(user.email) ||
      "Storyteller";

    return { identity, name, userUid: user.id };
  } catch {
    const id = `guest-${shortId()}`;
    return { identity: id, name: "Storyteller", userUid: id };
  }
}

function roomKindFrom(body: Record<string, unknown>): RoomKind {
  const raw = String(body.roomKind || body.mode || "interactive-story")
    .trim()
    .toLowerCase();
  if (raw === "story-maker" || raw === "ai-story-maker" || raw === "story-journey")
    return "story-maker";
  if (raw === "game" || raw === "game-room") return "game";
  if (raw === "inbox" || raw === "inbox-call" || raw === "private-call") return "inbox";
  if (raw === "watch-party" || raw === "wp") return "watch-party";
  if (raw === "tradio-show" || raw === "tradio_show" || raw === "radio") return "tradio-show";
  return "interactive-story";
}

function resolveRoom(
  body: Record<string, unknown>,
  participant: ParticipantProfile,
): RoomResolution {
  const kind = roomKindFrom(body);

  if (kind === "game") {
    const gameSlug = cleanPart(body.gameSlug, "game");
    const matchId = cleanPart(body.matchId, "match");
    return {
      kind,
      roomName: `game:${gameSlug}:match:${matchId}`,
      dispatchAgent: false,
      metadata: {
        mode: "voice-room",
        storyId: null,
        beatId: null,
        pageId: null,
        projectId: null,
        userUid: participant.userUid,
      },
    };
  }

  if (kind === "inbox") {
    const conversationId = cleanPart(body.conversationId, "conversation");
    return {
      kind,
      roomName: `inbox-call:${conversationId}`,
      dispatchAgent: false,
      metadata: {
        mode: "voice-room",
        storyId: null,
        beatId: null,
        pageId: null,
        projectId: null,
        userUid: participant.userUid,
      },
    };
  }

  if (kind === "watch-party") {
    const partyId = cleanPart(body.partyId, "party");
    return {
      kind,
      roomName: `wp:${partyId}`,
      dispatchAgent: false,
      metadata: {
        mode: "voice-room",
        storyId: null,
        beatId: null,
        pageId: null,
        projectId: null,
        userUid: participant.userUid,
      },
    };
  }

  if (kind === "tradio-show") {
    const sessionId = cleanPart(body.sessionId, "session");
    return {
      kind,
      roomName: tradioShowRoomName(sessionId),
      dispatchAgent: false,
      metadata: {
        mode: "voice-room",
        storyId: null,
        beatId: null,
        pageId: null,
        projectId: null,
        userUid: participant.userUid,
      },
    };
  }

  if (kind === "story-maker") {
    const projectId = cleanPart(body.projectId || body.storyProjectId, "project");
    const pageId =
      typeof body.pageId === "string" && body.pageId.trim() ? cleanPart(body.pageId, "page") : "";
    return {
      kind,
      roomName: pageId ? `story-journey-page-${pageId}` : `story-journey-${projectId}`,
      dispatchAgent: true,
      metadata: {
        mode: "story-narrator",
        storyId: null,
        beatId: null,
        pageId: pageId || null,
        projectId,
        userUid: participant.userUid,
      },
    };
  }

  const storyId = cleanPart(body.storyId, "story");
  const beatId =
    typeof body.beatId === "string" && body.beatId.trim() ? cleanPart(body.beatId, "beat") : "";

  return {
    kind,
    roomName: beatId
      ? `interactive-story-${storyId}-beat-${beatId}`
      : `interactive-story-${storyId}`,
    dispatchAgent: true,
    metadata: {
      mode: "story-narrator",
      storyId,
      beatId: beatId || null,
      pageId: null,
      projectId: null,
      userUid: participant.userUid,
    },
  };
}

function validateTokenShape(
  jwt: string,
  apiKey: string,
  participantIdentity: string,
  roomName: string,
  expectAgentDispatch: boolean,
): void {
  const payload = decodeJwtPayload(jwt);
  const video = payload?.video as Record<string, unknown> | undefined;
  const issues: string[] = [];

  if (!payload) issues.push("payload missing");
  if (payload?.iss !== apiKey) issues.push("iss mismatch");
  if (payload?.sub !== participantIdentity) issues.push("sub mismatch");
  if (video?.room !== roomName) issues.push("video.room mismatch");
  if (video?.roomJoin !== true) issues.push("video.roomJoin missing");
  if (video?.canPublish !== true) issues.push("video.canPublish missing");
  if (video?.canSubscribe !== true) issues.push("video.canSubscribe missing");
  if (video?.canPublishData !== true) issues.push("video.canPublishData missing");
  if (video?.roomAdmin) issues.push("video.roomAdmin must not be granted");
  if (video?.roomCreate) issues.push("video.roomCreate must not be granted");
  if (video?.roomList) issues.push("video.roomList must not be granted");
  if (video?.roomRecord) issues.push("video.roomRecord must not be granted");

  const roomConfig = payload?.roomConfig as Record<string, unknown> | undefined;
  const agents = roomConfig?.agents as Array<Record<string, unknown>> | undefined;
  if (expectAgentDispatch) {
    if (!agents?.some((agent) => agent.agentName === AGENT_NAME)) {
      issues.push("roomConfig agent dispatch missing");
    }
  } else if (roomConfig) {
    issues.push("roomConfig must not be present");
  }

  if (issues.length > 0) {
    console.error("[LiveKit] Token shape validation failed:", issues.join(", "));
    throw new Error("LiveKit token payload failed local shape validation.");
  }
}

function inspectTokenDispatch(jwt: string): TokenInspection {
  const payload = decodeJwtPayload(jwt);
  const roomConfig = payload?.roomConfig as Record<string, unknown> | undefined;
  const agents = Array.isArray(roomConfig?.agents)
    ? (roomConfig.agents as Array<Record<string, unknown>>)
    : [];
  const agentNames = agents
    .map((agent) => (typeof agent.agentName === "string" ? agent.agentName : ""))
    .filter(Boolean);
  const hayden = agents.find((agent) => agent.agentName === AGENT_NAME);
  let dispatchMetadataValid = false;
  let dispatchMetadataMode = "";

  if (typeof hayden?.metadata === "string") {
    try {
      const parsed = JSON.parse(hayden.metadata) as Record<string, unknown>;
      dispatchMetadataValid = true;
      dispatchMetadataMode = typeof parsed.mode === "string" ? parsed.mode : "";
    } catch {
      dispatchMetadataValid = false;
    }
  }

  return {
    hasRoomConfig: Boolean(roomConfig),
    agentCount: agents.length,
    agentNames,
    dispatchAgentPresent: Boolean(hayden),
    dispatchMetadataValid,
    dispatchMetadataMode,
  };
}

export async function handleLiveKitToken(request: Request, env: unknown): Promise<Response> {
  if (request.method === "OPTIONS") return json({});
  if (request.method !== "POST" && request.method !== "GET") {
    return json({ error: "Method not allowed." }, 405);
  }

  let config;
  try {
    config = loadLiveKitConfig(env);
  } catch (err) {
    const message = err instanceof Error ? err.message : "LiveKit token service is not configured.";
    return json({ error: message }, 503);
  }

  try {
    const body = await readPayload(request);
    const participant = await resolveParticipant(request);
    const room = resolveRoom(body, participant);

    // For watch-party rooms, mic permission depends on the host's mute flag
    // and kicked state. partyId is the cleanPart() result so it's safe to use
    // as a Supabase value (uuid-ish characters).
    let canPublish = true;
    if (room.kind === "watch-party") {
      try {
        const supabase = getTreyIServiceClient();
        const partyId = String(body.partyId || "").trim();
        const accessToken = bearerToken(request);
        if (accessToken && partyId) {
          const { data: authData } = await (supabase as any).auth.getUser(accessToken);
          const userId = authData?.user?.id;
          if (userId) {
            const { data: member } = await (supabase as any)
              .from("party_members")
              .select("muted_mic, kicked")
              .eq("party_id", partyId)
              .eq("user_id", userId)
              .maybeSingle();
            if (!member || member.kicked) {
              return json({ error: "Not a party member." }, 403);
            }
            canPublish = !member.muted_mic;
          }
        }
      } catch (err) {
        console.warn("[LiveKit] watch-party permission check failed:", err);
        // Fail open for now — host can still mute via UI if needed.
      }
    }

    if (room.kind === "tradio-show") {
      canPublish = false; // default to listener; only the host publishes
      try {
        const supabase = getTreyIServiceClient();
        const sessionId = String(body.sessionId || "").trim();
        if (sessionId) {
          const { data: session } = await (supabase as any)
            .from("tradio_live_sessions")
            .select("host_user_id, status")
            .eq("id", sessionId)
            .maybeSingle();
          const resolution = resolveTradioShowPublish({
            session: session ?? null,
            userId: participant.userUid,
          });
          if (!resolution.allowed) {
            return json({ error: "This live show isn't on air." }, 403);
          }
          canPublish = resolution.canPublish;
        }
      } catch (err) {
        console.warn("[LiveKit] tradio-show permission check failed:", err);
        canPublish = false; // fail safe: listener only
      }
    }

    const at = new AccessToken(config.apiKey, config.apiSecret, {
      identity: participant.identity,
      name: participant.name,
      metadata: JSON.stringify({
        role: "user",
        ...room.metadata,
      }),
      ttl: TOKEN_TTL,
    });

    at.addGrant({
      room: room.roomName,
      roomJoin: true,
      canPublish,
      canSubscribe: true,
      canPublishData: true,
    });

    if (room.dispatchAgent) {
      at.roomConfig = new RoomConfiguration({
        agents: [
          new RoomAgentDispatch({
            agentName: AGENT_NAME,
            metadata: JSON.stringify(room.metadata),
          }),
        ],
      });
    }

    const token = await at.toJwt();
    validateTokenShape(
      token,
      config.apiKey,
      participant.identity,
      room.roomName,
      room.dispatchAgent,
    );
    const tokenInspection = inspectTokenDispatch(token);

    return json({
      ok: true,
      livekitUrl: config.url,
      roomName: room.roomName,
      token,
      participant: {
        identity: participant.identity,
        name: participant.name,
      },
      agentName: room.dispatchAgent ? AGENT_NAME : undefined,
      diagnostics: {
        livekitHost: livekitHost(config.url),
        apiKeyFingerprint: apiKeyFingerprint(config.apiKey),
        roomName: room.roomName,
        roomKind: room.kind,
        dispatchEnabled: room.dispatchAgent,
        agentName: room.dispatchAgent ? AGENT_NAME : undefined,
        tokenHasRoomConfig: tokenInspection.hasRoomConfig,
        tokenAgentNames: tokenInspection.agentNames,
        tokenDispatchAgentPresent: tokenInspection.dispatchAgentPresent,
        tokenDispatchMetadataValid: tokenInspection.dispatchMetadataValid,
        tokenDispatchMetadataMode: tokenInspection.dispatchMetadataMode,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "LiveKit token generation failed.";
    if (message.includes("shape validation")) {
      return json({ error: message }, 500);
    }
    console.error("[LiveKit] Token generation error:", message);
    return json({ error: "LiveKit token creation failed." }, 500);
  }
}

function livekitHttpUrl(url: string): string {
  if (url.startsWith("wss://")) return `https://${url.slice("wss://".length)}`;
  if (url.startsWith("ws://")) return `http://${url.slice("ws://".length)}`;
  return url;
}

function safeParticipantInfo(participant: unknown) {
  const item = participant as Record<string, unknown>;
  return {
    identity: typeof item.identity === "string" ? item.identity : "",
    name: typeof item.name === "string" ? item.name : "",
    kind: typeof item.kind === "string" || typeof item.kind === "number" ? String(item.kind) : "",
    metadata: typeof item.metadata === "string" ? item.metadata.slice(0, 500) : "",
  };
}

export async function handleLiveKitDiagnostics(request: Request, env: unknown): Promise<Response> {
  const diag = getLiveKitConfigDiagnostics(env);
  let serverSdkAvailable = false;
  let roomDiagnostics: Record<string, unknown> = {};

  try {
    serverSdkAvailable = Boolean(AccessToken && RoomConfiguration && RoomAgentDispatch);
  } catch {
    serverSdkAvailable = false;
  }

  try {
    const config = loadLiveKitConfig(env);
    const url = new URL(request.url);
    const body = Object.fromEntries(url.searchParams.entries());
    const participant: ParticipantProfile = {
      identity: "diagnostics",
      name: "Diagnostics",
      userUid: "diagnostics",
    };
    const room = resolveRoom(body, participant);
    let participantCount: number | undefined;
    let participants: unknown[] | undefined;

    if (url.searchParams.get("includeParticipants") === "true" && room.roomName) {
      try {
        const service = new RoomServiceClient(
          livekitHttpUrl(config.url),
          config.apiKey,
          config.apiSecret,
        );
        const listed = await service.listParticipants(room.roomName);
        participantCount = listed.length;
        participants = listed.map(safeParticipantInfo);
      } catch {
        participantCount = undefined;
        participants = undefined;
      }
    }

    let serverApiAuthenticated: boolean | undefined;
    let serverApiAuthError: string | undefined;
    if (url.searchParams.get("includeAuthCheck") === "true") {
      try {
        const service = new RoomServiceClient(
          livekitHttpUrl(config.url),
          config.apiKey,
          config.apiSecret,
        );
        await service.listRooms([]);
        serverApiAuthenticated = true;
      } catch (error) {
        serverApiAuthenticated = false;
        const message =
          error instanceof Error ? error.message : String(error || "authentication failed");
        serverApiAuthError = /invalid token|invalid api key|unauthorized|forbidden/i.test(message)
          ? message
          : "LiveKit server API authentication failed.";
      }
    }

    roomDiagnostics = {
      livekitHost: livekitHost(config.url),
      apiKeyFingerprint: apiKeyFingerprint(config.apiKey),
      roomName: room.roomName,
      roomKind: room.kind,
      dispatchEnabled: room.dispatchAgent,
      serverApiAuthenticated,
      serverApiAuthError,
      participantCount,
      participants,
    };
  } catch {}

  return json({
    livekitUrlConfigured: diag.livekitUrlPresent,
    apiKeyConfigured: diag.apiKeyPresent,
    apiSecretConfigured: diag.apiSecretPresent,
    agentName: AGENT_NAME,
    serverSdkAvailable,
    livekitHost: diag.livekitUrlHost,
    apiKeyFingerprint: diag.apiKeyPrefix ? `${diag.apiKeyPrefix}...` : "",
    ...roomDiagnostics,
  });
}
