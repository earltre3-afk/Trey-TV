import {
  adaptStoryCharactersForNarrator,
  getCurrentAIStoryMakerCharactersForNarrator,
  getCurrentAIStoryMakerNarrationContext,
  getCurrentDirectionForNarrator,
  getCurrentInteractiveStoryNarrationContext,
  getCurrentNarrationScriptForNarrator,
  getCurrentStoryPageForNarrator,
  type NarrationStatusValue,
} from "./interactiveStoryLiveKitAdapter";
import { createBrowserClient } from "./supabase-browser";

export const INTERACTIVE_STORY_RPC_METHODS = [
  "getCurrentStoryPage",
  "getCurrentCharacters",
  "getNarrationScript",
  "saveNarrationStatus",
  "submitStoryDirection",
  "prepareNextPageDirection",
] as const;

export type InteractiveStoryRpcMethod = typeof INTERACTIVE_STORY_RPC_METHODS[number];

export interface NarrationStatusUpdate {
  pageId?: string;
  status?: NarrationStatusValue;
  message?: string;
  timestamp?: string;
}

export interface StoryDirectionUpdate {
  transcript: string;
  matchedChoiceLabel?: string;
  matchedChoiceText?: string;
  receivedAt: string;
}

interface LiveKitTokenResponse {
  ok: true;
  token: string;
  livekitUrl: string;
  roomName: string;
  participant: {
    identity: string;
    name: string;
  };
  agentName?: string;
  diagnostics?: {
    livekitHost?: string;
    apiKeyFingerprint?: string;
    roomName?: string;
    roomKind?: string;
    dispatchEnabled?: boolean;
    tokenHasRoomConfig?: boolean;
    tokenAgentNames?: string[];
    tokenDispatchAgentPresent?: boolean;
    tokenDispatchMetadataValid?: boolean;
    tokenDispatchMetadataMode?: string;
  };
}

export interface InteractiveStoryLiveKitSession {
  room: any;
  token: LiveKitTokenResponse;
  agentName: string;
  unregister: () => void;
  disconnect: () => void;
  sendCue: (cue: "read-current-beat" | "read-choices" | "beat-changed") => Promise<void>;
  testCurrentPageRpc: () => {
    page: unknown;
    characters: unknown;
    narrationScript: unknown;
  };
}

export interface ConnectInteractiveStoryNarratorOptions {
  storyId: string;
  beatId?: string;
  roomKind?: "interactive-story" | "story-maker";
  storyProjectId?: string;
  projectId?: string;
  pageId?: string;
  agentName?: string;
  onNarrationStatus?: (status: NarrationStatusUpdate) => void;
  onSpokenDirection?: (direction: StoryDirectionUpdate) => void;
  onStatusMessage?: (message: string) => void;
  onDebugEvent?: (event: string, details: Record<string, unknown>) => void;
}

function parseRpcPayload(payload: string): Record<string, unknown> {
  if (!payload) return {};
  try {
    const parsed = JSON.parse(payload);
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function jsonRpcResponse(data: unknown) {
  return JSON.stringify(data);
}

function closestChoiceForTranscript(transcript: string) {
  const context = getCurrentInteractiveStoryNarrationContext();
  const choices = context?.branch.pendingStopPoint?.choices || [];
  const normalized = transcript.trim().toLowerCase();
  if (!normalized || !choices.length) return undefined;

  return choices.find((choice) => {
    const label = choice.label.toLowerCase();
    const text = choice.text.toLowerCase();
    return normalized === label || normalized.includes(text) || text.includes(normalized);
  }) || choices.find((choice) => normalized.includes(choice.label.toLowerCase()));
}

function safeJson(value: string | undefined): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function participantSnapshot(participant: Record<string, unknown>) {
  return {
    identity: typeof participant.identity === "string" ? participant.identity : "",
    name: typeof participant.name === "string" ? participant.name : "",
    kind: typeof participant.kind === "string" || typeof participant.kind === "number" ? String(participant.kind) : "",
    metadata: typeof participant.metadata === "string" ? participant.metadata.slice(0, 500) : "",
  };
}

function participantLooksLikeAgent(participant: Record<string, unknown>, expectedAgentName: string) {
  const snapshot = participantSnapshot(participant);
  const metadata = safeJson(snapshot.metadata);
  const expected = expectedAgentName.toLowerCase();
  const identity = snapshot.identity.toLowerCase();
  const name = snapshot.name.toLowerCase();
  const kind = snapshot.kind.toLowerCase();
  const metadataAgentName = String(
    metadata.agentName ||
      metadata.agent_name ||
      metadata.agent ||
      metadata.livekitAgentName ||
      "",
  ).toLowerCase();

  return (
    identity.includes(expected) ||
    name.includes(expected) ||
    metadataAgentName === expected ||
    metadataAgentName.includes(expected) ||
    kind.includes("agent")
  );
}

function runLocalNarratorToolCheck() {
  return {
    page: getCurrentStoryPageForNarrator(),
    characters: getCurrentAIStoryMakerNarrationContext()
      ? getCurrentAIStoryMakerCharactersForNarrator()
      : adaptStoryCharactersForNarrator(getCurrentInteractiveStoryNarrationContext()),
    narrationScript: getCurrentNarrationScriptForNarrator(),
  };
}

export function registerInteractiveStoryRpcTools(
  room: any,
  options: Pick<ConnectInteractiveStoryNarratorOptions, "onNarrationStatus" | "onSpokenDirection" | "onStatusMessage"> = {},
) {
  const registered: string[] = [];

  const register = (method: InteractiveStoryRpcMethod, handler: (payload: Record<string, unknown>) => unknown) => {
    try {
      room.unregisterRpcMethod?.(method);
    } catch {}

    room.registerRpcMethod(method, async (data: { payload: string }) => {
      try {
        options.onStatusMessage?.(`RPC received: ${method}`);
        console.info("[LiveKit] RPC received", { method });
        const result = handler(parseRpcPayload(data.payload));
        console.info("[LiveKit] RPC response returned", { method });
        return jsonRpcResponse(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : "RPC tool not registered.";
        return jsonRpcResponse({ available: false, message });
      }
    });
    registered.push(method);
  };

  register("getCurrentStoryPage", () => getCurrentStoryPageForNarrator());
  register("getCurrentCharacters", () => {
    if (getCurrentAIStoryMakerNarrationContext()) return getCurrentAIStoryMakerCharactersForNarrator();
    return adaptStoryCharactersForNarrator(getCurrentInteractiveStoryNarrationContext());
  });
  register("getNarrationScript", () => getCurrentNarrationScriptForNarrator());
  register("saveNarrationStatus", (payload) => {
    const update: NarrationStatusUpdate = {
      pageId: typeof payload.pageId === "string" ? payload.pageId : undefined,
      status: typeof payload.status === "string" ? payload.status as NarrationStatusValue : undefined,
      message: typeof payload.message === "string" ? payload.message : "",
      timestamp: typeof payload.timestamp === "string" ? payload.timestamp : new Date().toISOString(),
    };
    options.onNarrationStatus?.(update);
    return { ok: true, status: update.status || "started", pageId: update.pageId || "" };
  });
  register("submitStoryDirection", (payload) => {
    const transcript = String(payload.transcript || payload.text || payload.direction || "").trim();
    if (!transcript) {
      return { ok: false, message: "Spoken input empty." };
    }

    const match = closestChoiceForTranscript(transcript);
    options.onSpokenDirection?.({
      transcript,
      matchedChoiceLabel: match?.label,
      matchedChoiceText: match?.text,
      receivedAt: new Date().toISOString(),
    });

    return {
      ok: true,
      autoAdvanced: false,
      message: match
        ? "Spoken direction matched a choice. User confirmation is still required."
        : "Spoken direction saved for user confirmation.",
      matchedChoice: match ? { label: match.label, text: match.text } : null,
    };
  });
  register("prepareNextPageDirection", () => getCurrentDirectionForNarrator());

  options.onStatusMessage?.("RPC tools registered.");

  return () => {
    for (const method of registered) {
      try {
        room.unregisterRpcMethod?.(method);
      } catch {}
    }
  };
}

async function requestLiveKitToken(options: ConnectInteractiveStoryNarratorOptions): Promise<LiveKitTokenResponse> {
  options.onStatusMessage?.("LiveKit token ready");

  let accessToken = "";
  try {
    const supabase = createBrowserClient();
    const { data } = await supabase.auth.getSession();
    accessToken = data.session?.access_token || "";
  } catch {}

  const response = await fetch("/api/livekit/token", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({
      roomKind: options.roomKind || "interactive-story",
      storyId: options.storyId,
      beatId: options.beatId,
      storyProjectId: options.storyProjectId,
      projectId: options.projectId,
      pageId: options.pageId,
    }),
  });

  const payload = await response.json().catch(() => null) as Partial<LiveKitTokenResponse> & { error?: string } | null;
  if (!response.ok || !payload?.ok || !payload.token || !payload.livekitUrl) {
    throw new Error(payload?.error || "LiveKit token route unavailable.");
  }

  options.onDebugEvent?.("token-diagnostics", {
    roomName: payload.roomName || "",
    livekitHost: payload.diagnostics?.livekitHost || "",
    apiKeyFingerprint: payload.diagnostics?.apiKeyFingerprint || "",
    dispatchEnabled: Boolean(payload.diagnostics?.dispatchEnabled),
    tokenHasRoomConfig: Boolean(payload.diagnostics?.tokenHasRoomConfig),
    tokenDispatchAgentPresent: Boolean(payload.diagnostics?.tokenDispatchAgentPresent),
    tokenDispatchMetadataValid: Boolean(payload.diagnostics?.tokenDispatchMetadataValid),
    tokenDispatchMetadataMode: payload.diagnostics?.tokenDispatchMetadataMode || "",
  });
  console.info("[LiveKit] token diagnostics", {
    roomName: payload.roomName,
    livekitHost: payload.diagnostics?.livekitHost,
    apiKeyFingerprint: payload.diagnostics?.apiKeyFingerprint,
    dispatchEnabled: payload.diagnostics?.dispatchEnabled,
    tokenHasRoomConfig: payload.diagnostics?.tokenHasRoomConfig,
    tokenDispatchAgentPresent: payload.diagnostics?.tokenDispatchAgentPresent,
    tokenDispatchMetadataValid: payload.diagnostics?.tokenDispatchMetadataValid,
    tokenDispatchMetadataMode: payload.diagnostics?.tokenDispatchMetadataMode,
  });

  return payload as LiveKitTokenResponse;
}

export function getLiveKitNarratorConfig() {
  return {
    displayUrl: import.meta.env.VITE_LIVEKIT_URL || "",
    agentName: import.meta.env.VITE_LIVEKIT_AGENT_NAME || "Hayden-1f01",
    configured: true,
  };
}

export async function connectInteractiveStoryNarrator(
  options: ConnectInteractiveStoryNarratorOptions,
): Promise<InteractiveStoryLiveKitSession> {
  const config = getLiveKitNarratorConfig();
  const token = await requestLiveKitToken(options);
  const { Room, RoomEvent, Track } = await import("livekit-client");
  const room = new Room({ adaptiveStream: true, dynacast: true });
  const expectedAgentName = token.agentName || options.agentName || config.agentName;
  let unregister = () => {};
  let agentDetected = false;
  let agentAudioSubscribed = false;
  let agentJoinTimer: ReturnType<typeof setTimeout> | undefined;

  const markAgentDetected = (participant: Record<string, unknown>, reason: string) => {
    if (agentDetected) return;
    agentDetected = true;
    if (agentJoinTimer) clearTimeout(agentJoinTimer);
    const snapshot = participantSnapshot(participant);
    console.info("[LiveKit] agent participant detected", { reason, ...snapshot });
    options.onDebugEvent?.("agent-detected", { reason, ...snapshot });
    options.onStatusMessage?.("Hayden-1f01 detected");
  };

  const observeParticipant = (participant: unknown, reason: string) => {
    const record = participant as Record<string, unknown>;
    const snapshot = participantSnapshot(record);
    console.info("[LiveKit] participant observed", { reason, ...snapshot });
    options.onDebugEvent?.("participant-observed", { reason, ...snapshot });
    if (participantLooksLikeAgent(record, expectedAgentName)) {
      markAgentDetected(record, reason);
    }
  };

  room.on(RoomEvent.ConnectionStateChanged, (state: unknown) => {
    console.info("[LiveKit] connection state", { state: String(state) });
  });
  room.on(RoomEvent.Disconnected, () => {
    if (agentJoinTimer) clearTimeout(agentJoinTimer);
    options.onStatusMessage?.(agentDetected ? "Agent disconnected" : "disconnected");
  });
  room.on(RoomEvent.ParticipantConnected, (participant: unknown) => {
    observeParticipant(participant, "participant-connected");
  });
  room.on(RoomEvent.ParticipantDisconnected, (participant: unknown) => {
    const snapshot = participantSnapshot(participant as Record<string, unknown>);
    console.info("[LiveKit] participant disconnected", snapshot);
    if (participantLooksLikeAgent(participant as Record<string, unknown>, expectedAgentName)) {
      options.onStatusMessage?.("Agent disconnected");
    }
  });
  room.on(RoomEvent.TrackSubscribed, (track: any, _publication: unknown, participant: unknown) => {
    const record = participant as Record<string, unknown>;
    const source = String(track?.source || "");
    const kind = String(track?.kind || "");
    console.info("[LiveKit] track subscribed", {
      participant: participantSnapshot(record),
      source,
      kind,
    });
    if (participantLooksLikeAgent(record, expectedAgentName) && (kind === "audio" || source === Track.Source.Microphone)) {
      agentAudioSubscribed = true;
      markAgentDetected(record, "audio-track-subscribed");
      options.onStatusMessage?.("audio track subscribed");
    }
  });
  room.on(RoomEvent.TrackSubscriptionFailed, (trackSid: string, participant: unknown, reason: unknown) => {
    console.warn("[LiveKit] track subscription failed", {
      trackSid,
      participant: participantSnapshot(participant as Record<string, unknown>),
      reason: String(reason || ""),
    });
  });

  try {
    options.onStatusMessage?.("Room connecting");
    await room.connect(token.livekitUrl, token.token);
  } catch (connectError) {
    const urlHost = (() => { try { return new URL(token.livekitUrl).hostname; } catch { return "unknown"; } })();
    console.error("[LiveKit] room.connect failed", {
      urlHost,
      roomName: token.roomName,
      participantIdentity: token.participant.identity,
      message: connectError instanceof Error ? connectError.message : String(connectError),
    });
    throw connectError;
  }

  options.onStatusMessage?.("Room connected");
  unregister = registerInteractiveStoryRpcTools(room, options);
  options.onStatusMessage?.("RPC tools registered");
  console.info("[LiveKit] room ready", {
    roomName: token.roomName,
    participantIdentity: token.participant.identity,
    dispatchEnabled: token.diagnostics?.dispatchEnabled,
    tokenHasRoomConfig: token.diagnostics?.tokenHasRoomConfig,
    tokenDispatchAgentPresent: token.diagnostics?.tokenDispatchAgentPresent,
  });

  for (const participant of room.remoteParticipants?.values?.() || []) {
    observeParticipant(participant, "existing-remote-participant");
  }

  if (expectedAgentName === "Hayden-1f01" && !agentDetected) {
    options.onStatusMessage?.("Waiting for Hayden-1f01");
    agentJoinTimer = setTimeout(() => {
      if (!agentDetected) {
        options.onStatusMessage?.("Room connected, but Hayden-1f01 did not join. Check the agent deployment, project, or dispatch config.");
      }
    }, 20000);
  }

  return {
    room,
    token,
    agentName: expectedAgentName,
    unregister,
    disconnect: () => {
      if (agentJoinTimer) clearTimeout(agentJoinTimer);
      unregister();
      room.disconnect();
    },
    testCurrentPageRpc: runLocalNarratorToolCheck,
    sendCue: async (cue) => {
      const context = getCurrentInteractiveStoryNarrationContext();
      const payload = new TextEncoder().encode(JSON.stringify({
        type: "interactive-story-narrator-cue",
        cue,
        agentName: expectedAgentName,
        page: getCurrentStoryPageForNarrator(),
        choices: getCurrentDirectionForNarrator(),
        storyId: context?.branch.storyId || options.storyId,
        beatId: options.beatId,
        pageId: options.pageId,
        projectId: options.projectId || options.storyProjectId,
        agentDetected,
        agentAudioSubscribed,
        timestamp: new Date().toISOString(),
      }));
      await room.localParticipant?.publishData?.(payload, { reliable: true, topic: "interactive-story-narrator" });
      if (cue === "read-current-beat") options.onStatusMessage?.("reading current beat/page");
      if (cue === "read-choices") options.onStatusMessage?.("reading choices");
    },
  };
}
