/**
 * LiveKit auth smoke test.
 *
 * Safe output only: never prints raw tokens, API secrets, or full API keys.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { RoomAgentDispatch, RoomConfiguration } from "@livekit/protocol";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

const AGENT_NAME = "Hayden-1f01";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvFile(filename, override = false) {
  const envPath = resolve(root, filename);
  let raw = "";
  try {
    raw = readFileSync(envPath, "utf-8");
  } catch {
    return;
  }

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (override || !process.env[key]) process.env[key] = value;
  }
}

function livekitHttpUrl(url) {
  if (url.startsWith("wss://")) return `https://${url.slice("wss://".length)}`;
  if (url.startsWith("ws://")) return `http://${url.slice("ws://".length)}`;
  return url;
}

function decodePayload(jwt) {
  const parts = jwt.split(".");
  if (parts.length !== 3) throw new Error("Minted JWT does not have 3 segments.");
  return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertMinimalGrant(payload, roomName) {
  assert(payload.video?.room === roomName, "video.room does not match.");
  assert(payload.video?.roomJoin === true, "roomJoin grant missing.");
  assert(payload.video?.canPublish === true, "canPublish grant missing.");
  assert(payload.video?.canSubscribe === true, "canSubscribe grant missing.");
  assert(payload.video?.canPublishData === true, "canPublishData grant missing.");
  assert(!payload.video?.roomAdmin, "roomAdmin must not be granted.");
  assert(!payload.video?.roomCreate, "roomCreate must not be granted.");
  assert(!payload.video?.roomList, "roomList must not be granted.");
  assert(!payload.video?.roomRecord, "roomRecord must not be granted.");
  assert(!payload.sip, "SIP permissions must not be granted.");
}

async function mintRouteLikeToken({ apiKey, apiSecret, roomName, identity, name, dispatchAgent, metadata }) {
  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    name,
    metadata: JSON.stringify({ role: "user", ...metadata }),
    ttl: "15m",
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  if (dispatchAgent) {
    at.roomConfig = new RoomConfiguration({
      agents: [
        new RoomAgentDispatch({
          agentName: AGENT_NAME,
          metadata: JSON.stringify(metadata),
        }),
      ],
    });
  }

  const token = await at.toJwt();
  return {
    ok: true,
    livekitUrl: process.env.LIVEKIT_URL || process.env.VITE_LIVEKIT_URL,
    roomName,
    token,
    participant: { identity, name },
    agentName: dispatchAgent ? AGENT_NAME : undefined,
  };
}

loadEnvFile(".env");
loadEnvFile(".env.local", true);

const livekitUrl = process.env.LIVEKIT_URL || process.env.VITE_LIVEKIT_URL || "";
const apiKey = process.env.LIVEKIT_API_KEY || "";
const apiSecret = process.env.LIVEKIT_API_SECRET || "";
const diagnostics = {
  livekitUrlConfigured: Boolean(livekitUrl),
  apiKeyConfigured: Boolean(apiKey),
  apiSecretConfigured: Boolean(apiSecret),
  agentName: AGENT_NAME,
  serverSdkAvailable: Boolean(AccessToken && RoomConfiguration && RoomAgentDispatch),
  serverApiAuthenticated: false,
};

console.log("\nLiveKit Hayden dispatch smoke test");
console.log("---------------------------------");
console.log(`LiveKit URL configured: ${diagnostics.livekitUrlConfigured ? "yes" : "no"}`);
console.log(`API key configured: ${diagnostics.apiKeyConfigured ? "yes" : "no"}`);
console.log(`API secret configured: ${diagnostics.apiSecretConfigured ? "yes" : "no"}`);
console.log(`Server SDK available: ${diagnostics.serverSdkAvailable ? "yes" : "no"}`);
console.log(`Agent name: ${diagnostics.agentName}`);

const issues = [];
if (!livekitUrl) issues.push("LIVEKIT_URL is missing.");
if (livekitUrl && !livekitUrl.startsWith("wss://") && !livekitUrl.startsWith("ws://")) {
  issues.push("LIVEKIT_URL must start with wss:// or ws://.");
}
if (!apiKey) issues.push("LIVEKIT_API_KEY is missing.");
if (!apiSecret) issues.push("LIVEKIT_API_SECRET is missing.");
if (!diagnostics.serverSdkAvailable) issues.push("LiveKit server SDK/protocol classes are unavailable.");

if (issues.length) {
  console.error("\nConfig issues:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

try {
  const service = new RoomServiceClient(livekitHttpUrl(livekitUrl), apiKey, apiSecret);
  await service.listRooms([]);
  diagnostics.serverApiAuthenticated = true;

  const storyMetadata = {
    mode: "story-narrator",
    storyId: "switch-kicks",
    beatId: "opening",
    pageId: null,
    projectId: null,
    userUid: "smoke-user",
  };
  const storyResponse = await mintRouteLikeToken({
    apiKey,
    apiSecret,
    roomName: "interactive-story-switch-kicks-beat-opening",
    identity: "smoke-user",
    name: "Storyteller",
    dispatchAgent: true,
    metadata: storyMetadata,
  });
  const storyPayload = decodePayload(storyResponse.token);
  assert(storyResponse.ok === true, "Story token route response shape missing ok=true.");
  assert(Boolean(storyResponse.livekitUrl), "Story token response missing livekitUrl.");
  assert(storyResponse.agentName === AGENT_NAME, "Story token response missing Hayden agent name.");
  assertMinimalGrant(storyPayload, storyResponse.roomName);
  const storyAgent = storyPayload.roomConfig?.agents?.[0];
  assert(storyAgent?.agentName === AGENT_NAME, "Story token missing Hayden RoomAgentDispatch.");
  const decodedMetadata = JSON.parse(storyAgent.metadata);
  assert(decodedMetadata.mode === "story-narrator", "Story dispatch metadata missing story-narrator mode.");
  assert(decodedMetadata.storyId === "switch-kicks", "Story dispatch metadata missing storyId.");

  const gameResponse = await mintRouteLikeToken({
    apiKey,
    apiSecret,
    roomName: "game:spades:match:smoke",
    identity: "smoke-user",
    name: "Storyteller",
    dispatchAgent: false,
    metadata: {
      mode: "voice-room",
      storyId: null,
      beatId: null,
      pageId: null,
      projectId: null,
      userUid: "smoke-user",
    },
  });
  const gamePayload = decodePayload(gameResponse.token);
  assertMinimalGrant(gamePayload, gameResponse.roomName);
  assert(!gamePayload.roomConfig, "Game token must not include roomConfig.");

  const inboxResponse = await mintRouteLikeToken({
    apiKey,
    apiSecret,
    roomName: "inbox-call:smoke-conversation",
    identity: "smoke-user",
    name: "Storyteller",
    dispatchAgent: false,
    metadata: {
      mode: "voice-room",
      storyId: null,
      beatId: null,
      pageId: null,
      projectId: null,
      userUid: "smoke-user",
    },
  });
  const inboxPayload = decodePayload(inboxResponse.token);
  assertMinimalGrant(inboxPayload, inboxResponse.roomName);
  assert(!inboxPayload.roomConfig, "Inbox token must not include roomConfig.");

  assert(diagnostics.livekitUrlConfigured, "Diagnostics did not report LiveKit URL configured.");
  assert(diagnostics.apiKeyConfigured, "Diagnostics did not report API key configured.");
  assert(diagnostics.apiSecretConfigured, "Diagnostics did not report API secret configured.");
  assert(diagnostics.agentName === AGENT_NAME, "Diagnostics agentName mismatch.");
  assert(diagnostics.serverSdkAvailable, "Diagnostics serverSdkAvailable mismatch.");
  assert(diagnostics.serverApiAuthenticated, "LiveKit server API auth failed for configured URL/key/secret.");

  console.log("\nPassed:");
  console.log("- LiveKit server API accepted the configured URL/key/secret.");
  console.log("- Story token has minimal grants and Hayden RoomAgentDispatch.");
  console.log("- Game token has minimal grants and no roomConfig.");
  console.log("- Inbox token has minimal grants and no roomConfig.");
  console.log("- Diagnostics shape reports only safe configured status.");
} catch (err) {
  console.error("\nSmoke test failed:", err instanceof Error ? err.message : String(err));
  process.exit(1);
}
