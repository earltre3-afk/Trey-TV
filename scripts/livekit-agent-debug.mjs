/**
 * LiveKit Agent Debug Script
 * 
 * Checks:
 * 1. Server API connectivity (listRooms)
 * 2. Active rooms and participants
 * 3. Creates a test room with agent dispatch to see if agent joins
 * 4. Lists SIP dispatch rules (if accessible)
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { RoomAgentDispatch, RoomConfiguration } from "@livekit/protocol";
import { AccessToken, RoomServiceClient, AgentDispatchClient } from "livekit-server-sdk";

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
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
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

loadEnvFile(".env");
loadEnvFile(".env.local", true);

const livekitUrl = process.env.LIVEKIT_URL || process.env.VITE_LIVEKIT_URL || "";
const apiKey = process.env.LIVEKIT_API_KEY || "";
const apiSecret = process.env.LIVEKIT_API_SECRET || "";

console.log("\n=== LiveKit Agent Debug ===\n");
console.log(`LiveKit URL: ${livekitUrl}`);
console.log(`API Key: ${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`);
console.log(`HTTP URL: ${livekitHttpUrl(livekitUrl)}`);
console.log(`Agent Name: ${AGENT_NAME}`);

if (!livekitUrl || !apiKey || !apiSecret) {
  console.error("\nMissing credentials. Set LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET.");
  process.exit(1);
}

const service = new RoomServiceClient(livekitHttpUrl(livekitUrl), apiKey, apiSecret);

// Step 1: List all active rooms
console.log("\n--- Step 1: List Active Rooms ---");
try {
  const rooms = await service.listRooms([]);
  console.log(`Active rooms: ${rooms.length}`);
  for (const room of rooms) {
    console.log(`  Room: ${room.name} | Participants: ${room.numParticipants} | Created: ${new Date(Number(room.creationTime) * 1000).toISOString()}`);
    
    // List participants in each room
    try {
      const participants = await service.listParticipants(room.name);
      for (const p of participants) {
        console.log(`    Participant: ${p.identity} (${p.name}) | Kind: ${p.kind} | State: ${p.state} | Metadata: ${(p.metadata || "").slice(0, 200)}`);
      }
    } catch (e) {
      console.log(`    Could not list participants: ${e.message}`);
    }
  }
  if (rooms.length === 0) {
    console.log("  (No active rooms found)");
  }
} catch (e) {
  console.error(`Failed to list rooms: ${e.message}`);
  process.exit(1);
}

// Step 2: Try AgentDispatchClient
console.log("\n--- Step 2: Agent Dispatch Status ---");
try {
  if (AgentDispatchClient) {
    const agentClient = new AgentDispatchClient(livekitHttpUrl(livekitUrl), apiKey, apiSecret);
    // Try listing dispatches for a test room
    const testRoom = "interactive-story-story";
    try {
      const dispatches = await agentClient.listDispatches(testRoom);
      console.log(`Active dispatches for '${testRoom}': ${dispatches.length}`);
      for (const d of dispatches) {
        console.log(`  Dispatch ID: ${d.dispatchId} | Agent: ${d.agentName} | State: ${JSON.stringify(d)}`);
      }
    } catch (e) {
      console.log(`Could not list dispatches for '${testRoom}': ${e.message}`);
    }
  } else {
    console.log("AgentDispatchClient not available in this SDK version.");
  }
} catch (e) {
  console.log(`Agent dispatch check failed: ${e.message}`);
}

// Step 3: Create a test room with agent dispatch and check if agent joins
console.log("\n--- Step 3: Test Agent Dispatch ---");
const testRoomName = `agent-debug-test-${Date.now().toString(36)}`;
try {
  // Mint a token with agent dispatch
  const at = new AccessToken(apiKey, apiSecret, {
    identity: "debug-tester",
    name: "DebugTester",
    metadata: JSON.stringify({ role: "user", mode: "story-narrator", storyId: "debug-test" }),
    ttl: "2m",
  });

  at.addGrant({
    room: testRoomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  at.roomConfig = new RoomConfiguration({
    agents: [
      new RoomAgentDispatch({
        agentName: AGENT_NAME,
        metadata: JSON.stringify({ mode: "story-narrator", storyId: "debug-test" }),
      }),
    ],
  });

  const token = await at.toJwt();
  console.log(`Created dispatch token for room: ${testRoomName}`);
  console.log(`Token dispatches agent: ${AGENT_NAME}`);
  
  // Decode and show the token payload
  const parts = token.split(".");
  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
  console.log(`Token roomConfig agents: ${JSON.stringify(payload.roomConfig?.agents || [])}`);
  
  // Now create the room explicitly
  try {
    const room = await service.createRoom({
      name: testRoomName,
      emptyTimeout: 30,
      maxParticipants: 5,
    });
    console.log(`Room created: ${room.name} (sid: ${room.sid})`);
  } catch (e) {
    console.log(`Room creation: ${e.message}`);
  }

  // Try to dispatch the agent to the room directly
  if (AgentDispatchClient) {
    try {
      const agentClient = new AgentDispatchClient(livekitHttpUrl(livekitUrl), apiKey, apiSecret);
      const dispatch = await agentClient.createDispatch(testRoomName, AGENT_NAME, JSON.stringify({ mode: "story-narrator", storyId: "debug-test" }));
      console.log(`Direct dispatch created: ${JSON.stringify(dispatch)}`);
    } catch (e) {
      console.log(`Direct dispatch failed: ${e.message}`);
    }
  }
  
  // Wait 5s then check if agent joined
  console.log("\nWaiting 5 seconds for agent to join...");
  await new Promise(r => setTimeout(r, 5000));
  
  try {
    const participants = await service.listParticipants(testRoomName);
    console.log(`Participants in test room after 5s: ${participants.length}`);
    for (const p of participants) {
      console.log(`  ${p.identity} (${p.name}) | Kind: ${p.kind}`);
    }
    if (participants.length === 0) {
      console.log("  ⚠️ NO PARTICIPANTS - Agent did not join the room!");
      console.log("  This means either:");
      console.log("    1. No agent worker is running/connected to this LiveKit Cloud project");
      console.log("    2. The agent name doesn't match any registered worker");
      console.log("    3. The sandbox/cloud agent deployment is stopped or misconfigured");
    }
  } catch (e) {
    console.log(`Room may not exist yet: ${e.message}`);
  }

  // Also try dispatching with AgentDispatchClient and listing dispatches
  if (AgentDispatchClient) {
    try {
      const agentClient = new AgentDispatchClient(livekitHttpUrl(livekitUrl), apiKey, apiSecret);
      const dispatches = await agentClient.listDispatches(testRoomName);
      console.log(`\nDispatches for test room: ${dispatches.length}`);
      for (const d of dispatches) {
        console.log(`  Dispatch: ${JSON.stringify(d)}`);
      }
    } catch (e) {
      console.log(`Could not list test dispatches: ${e.message}`);
    }
  }

  // Cleanup - delete test room
  try {
    await service.deleteRoom(testRoomName);
    console.log(`\nCleaned up test room: ${testRoomName}`);
  } catch {
    console.log(`Note: test room ${testRoomName} will auto-expire.`);
  }

} catch (e) {
  console.error(`Test dispatch failed: ${e.message}`);
  console.error(e.stack);
}

console.log("\n=== Debug Complete ===\n");
