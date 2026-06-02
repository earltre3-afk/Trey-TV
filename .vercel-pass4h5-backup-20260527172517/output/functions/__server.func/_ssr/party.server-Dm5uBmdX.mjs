import { c as createServerRpc, a as createServerFn, v as verifyTreyIUser } from "./index.mjs";
import { G as GoogleGenAI } from "../_libs/google__genai.mjs";
import "../_libs/react.mjs";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/livekit__protocol.mjs";
import "../_libs/bufbuild__protobuf.mjs";
import "../_libs/livekit-server-sdk.mjs";
import "../_libs/jose.mjs";
import "node:buffer";
import "node:util";
import "node:fs";
import "node:path";
import "../_libs/p-retry.mjs";
import "../_libs/retry.mjs";
import "../_libs/google-auth-library.mjs";
import "child_process";
import "querystring";
import "fs";
import "../_libs/gaxios.mjs";
import "https";
import "../_libs/extend.mjs";
import "../_libs/gcp-metadata.mjs";
import "os";
import "../_libs/json-bigint.mjs";
import "../_libs/bignumber.js.mjs";
import "../_libs/google-logging-utils.mjs";
import "events";
import "process";
import "path";
import "../_libs/base64-js.mjs";
import "../_libs/ecdsa-sig-formatter.mjs";
import "../_libs/safe-buffer.mjs";
import "buffer";
import "../_libs/jws.mjs";
import "../_libs/jwa.mjs";
import "../_libs/buffer-equal-constant-time.mjs";
import "fs/promises";
import "node:stream/promises";
import "../_libs/ws.mjs";
import "zlib";
import "http";
import "net";
import "tls";
import "url";
const SYSTEM_PROMPT = `You are Trey-I, a real-time chat moderator for Trey TV. Evaluate the user's message for safety. Reply with ONLY a JSON object on a single line, no markdown fences, no commentary:
{ "verdict": "clean"|"nudge"|"block"|"timeout", "severity": "none"|"low"|"medium"|"high", "reason": "short reason or empty" }

Rules:
- clean: normal speech, banter, profanity directed at no one. Severity: none.
- nudge: rude, heated, or borderline. Publish anyway with a private warning. Severity: low.
- block: insults at a specific person, harassment, sexual content, spam links, doxxing,   self-harm encouragement, hate-speech. Severity: medium.
- timeout: slurs, threats, illegal content, sexualized minors. Severity: high.

Be conservative — when in doubt, prefer nudge over block. Trey TV embraces creator energy; do not censor harmless trash-talk.`;
const MODEL_VERTEX = "gemini-2.5-flash";
const MODEL_GEMINI = "gemini-2.0-flash";
const TIMEOUT_MS = 1500;
function buildClient() {
  const project = process.env.VERTEX_PROJECT?.trim() || process.env.GOOGLE_CLOUD_PROJECT?.trim();
  const location = process.env.VERTEX_LOCATION?.trim() || process.env.GOOGLE_CLOUD_LOCATION?.trim() || "us-central1";
  if (project) {
    return { genai: new GoogleGenAI({ vertexai: true, project, location }), model: MODEL_VERTEX };
  }
  const apiKey = process.env.GOOGLE_GENAI_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
  if (!apiKey) return null;
  return { genai: new GoogleGenAI({ apiKey }), model: MODEL_GEMINI };
}
function safeDefault(reason) {
  return { verdict: "clean", severity: "none", reason };
}
function parseVerdict(raw) {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    const obj = JSON.parse(cleaned);
    const verdict = obj.verdict;
    const severity = obj.severity;
    if (verdict !== "clean" && verdict !== "nudge" && verdict !== "block" && verdict !== "timeout") return null;
    if (severity !== "none" && severity !== "low" && severity !== "medium" && severity !== "high") return null;
    return {
      verdict,
      severity,
      reason: typeof obj.reason === "string" ? obj.reason.slice(0, 200) : ""
    };
  } catch {
    return null;
  }
}
async function moderateChatMessage(body) {
  if (!body || body.length > 600) return safeDefault("invalid_length");
  const client = buildClient();
  if (!client) {
    return safeDefault("no_ai_configured");
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const result = await client.genai.models.generateContent({
      model: client.model,
      contents: [{ role: "user", parts: [{ text: body }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0,
        maxOutputTokens: 100,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        abortSignal: controller.signal
      }
    });
    const text = result.text ?? result.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    const parsed = parseVerdict(text);
    if (!parsed) {
      console.warn("[moderate_chat] could not parse verdict from:", text.slice(0, 120));
      return safeDefault("unparseable_response");
    }
    return parsed;
  } catch (err2) {
    if (err2?.name === "AbortError") return safeDefault("timeout");
    console.warn("[moderate_chat] API error:", err2);
    return safeDefault("api_error");
  } finally {
    clearTimeout(timer);
  }
}
const err = (error, extra) => ({
  ok: false,
  error,
  ...extra
});
const createWatchParty_createServerFn_handler = createServerRpc({
  id: "03fa936e1fa0237d732fa54077b4b7792692f4db1803b1d147ebff32b07995ab",
  name: "createWatchParty",
  filename: "src/lib/watch-party/party.server.ts"
}, (opts) => createWatchParty.__executeServer(opts));
const createWatchParty = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  channelId: typeof input?.channelId === "string" ? input.channelId.slice(0, 100) : "",
  name: typeof input?.name === "string" ? input.name.slice(0, 80) : void 0
})).handler(createWatchParty_createServerFn_handler, async ({
  data
}) => {
  if (!data.channelId) return err("missing_channel_id");
  const {
    supabase,
    user
  } = await verifyTreyIUser(data.accessToken);
  const {
    data: rpcData,
    error: rpcError
  } = await supabase.rpc("create_watch_party", {
    p_channel_id: data.channelId,
    p_name: data.name ?? null
  });
  if (rpcError) return err("create_failed", {
    reason: rpcError.message
  });
  const partyId = rpcData;
  const {
    data: party
  } = await supabase.from("watch_parties").select("invite_token").eq("id", partyId).single();
  return {
    ok: true,
    partyId,
    inviteToken: party?.invite_token ?? ""
  };
});
const acceptPartyInvite_createServerFn_handler = createServerRpc({
  id: "ee8b3768d932f58400099b58152e01782f4d4a5673faed875138eec78b1986b3",
  name: "acceptPartyInvite",
  filename: "src/lib/watch-party/party.server.ts"
}, (opts) => acceptPartyInvite.__executeServer(opts));
const acceptPartyInvite = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  inviteToken: typeof input?.inviteToken === "string" ? input.inviteToken.slice(0, 64) : ""
})).handler(acceptPartyInvite_createServerFn_handler, async ({
  data
}) => {
  if (!data.inviteToken) return err("missing_invite_token");
  const {
    supabase
  } = await verifyTreyIUser(data.accessToken);
  const {
    data: rpcData,
    error: rpcError
  } = await supabase.rpc("accept_party_invite", {
    p_invite_token: data.inviteToken
  });
  if (rpcError) return err("join_failed", {
    reason: rpcError.message
  });
  return {
    ok: true,
    partyId: rpcData
  };
});
const changePartyChannel_createServerFn_handler = createServerRpc({
  id: "5e28f59458ac6712a2f5be2846fd68c5c14950d0bcea190f00ad578824d7d6db",
  name: "changePartyChannel",
  filename: "src/lib/watch-party/party.server.ts"
}, (opts) => changePartyChannel.__executeServer(opts));
const changePartyChannel = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  partyId: typeof input?.partyId === "string" ? input.partyId.slice(0, 64) : "",
  channelId: typeof input?.channelId === "string" ? input.channelId.slice(0, 100) : ""
})).handler(changePartyChannel_createServerFn_handler, async ({
  data
}) => {
  if (!data.partyId || !data.channelId) return err("missing_args");
  const {
    supabase,
    user
  } = await verifyTreyIUser(data.accessToken);
  const {
    data: party
  } = await supabase.from("watch_parties").select("host_id").eq("id", data.partyId).maybeSingle();
  if (!party) return err("party_not_found");
  if (party.host_id !== user.id) return err("not_host");
  const {
    error: updErr
  } = await supabase.from("watch_parties").update({
    channel_id: data.channelId
  }).eq("id", data.partyId);
  if (updErr) return err("update_failed", {
    reason: updErr.message
  });
  return {
    ok: true
  };
});
const setMemberFlag_createServerFn_handler = createServerRpc({
  id: "c85bf694fccd0a3e8a45a91529b7b3a160673fd31f95fb459cc095d4c2d5268d",
  name: "setMemberFlag",
  filename: "src/lib/watch-party/party.server.ts"
}, (opts) => setMemberFlag.__executeServer(opts));
const setMemberFlag = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  partyId: typeof input?.partyId === "string" ? input.partyId.slice(0, 64) : "",
  targetUserId: typeof input?.targetUserId === "string" ? input.targetUserId.slice(0, 64) : "",
  field: input?.field === "kicked" || input?.field === "muted_chat" || input?.field === "muted_mic" ? input.field : "muted_chat",
  value: Boolean(input?.value)
})).handler(setMemberFlag_createServerFn_handler, async ({
  data
}) => {
  if (!data.partyId || !data.targetUserId) return err("missing_args");
  const {
    supabase,
    user
  } = await verifyTreyIUser(data.accessToken);
  const {
    data: party
  } = await supabase.from("watch_parties").select("host_id").eq("id", data.partyId).maybeSingle();
  if (!party) return err("party_not_found");
  if (party.host_id !== user.id) return err("not_host");
  if (data.targetUserId === user.id) return err("cannot_target_self");
  const {
    error: updErr
  } = await supabase.from("party_members").update({
    [data.field]: data.value
  }).eq("party_id", data.partyId).eq("user_id", data.targetUserId);
  if (updErr) return err("update_failed", {
    reason: updErr.message
  });
  return {
    ok: true
  };
});
const hostAddMember_createServerFn_handler = createServerRpc({
  id: "a8614b6b3521a713ff26ecf2c8fb931e8fbc75cd86c5b61f202b696062b0f8cb",
  name: "hostAddMember",
  filename: "src/lib/watch-party/party.server.ts"
}, (opts) => hostAddMember.__executeServer(opts));
const hostAddMember = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  partyId: typeof input?.partyId === "string" ? input.partyId.slice(0, 64) : "",
  targetUserId: typeof input?.targetUserId === "string" ? input.targetUserId.slice(0, 64) : ""
})).handler(hostAddMember_createServerFn_handler, async ({
  data
}) => {
  if (!data.partyId || !data.targetUserId) return err("missing_args");
  const {
    supabase,
    user
  } = await verifyTreyIUser(data.accessToken);
  const {
    data: party
  } = await supabase.from("watch_parties").select("host_id, ended_at").eq("id", data.partyId).maybeSingle();
  if (!party) return err("party_not_found");
  if (party.ended_at) return err("party_ended");
  if (party.host_id !== user.id) return err("not_host");
  const {
    error: insErr
  } = await supabase.from("party_members").insert({
    party_id: data.partyId,
    user_id: data.targetUserId,
    role: "member"
  });
  if (insErr) {
    if (insErr.message?.includes("party_full")) return err("party_full");
    return err("add_failed", {
      reason: insErr.message
    });
  }
  return {
    ok: true
  };
});
const endWatchParty_createServerFn_handler = createServerRpc({
  id: "508930475d7de99c560021a0f87f1bee2f9ab4c0f14689329153505ea2576e35",
  name: "endWatchParty",
  filename: "src/lib/watch-party/party.server.ts"
}, (opts) => endWatchParty.__executeServer(opts));
const endWatchParty = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  partyId: typeof input?.partyId === "string" ? input.partyId.slice(0, 64) : ""
})).handler(endWatchParty_createServerFn_handler, async ({
  data
}) => {
  if (!data.partyId) return err("missing_party_id");
  const {
    supabase,
    user
  } = await verifyTreyIUser(data.accessToken);
  const {
    error: updErr
  } = await supabase.from("watch_parties").update({
    ended_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.partyId).eq("host_id", user.id).is("ended_at", null);
  if (updErr) return err("end_failed", {
    reason: updErr.message
  });
  return {
    ok: true
  };
});
const postChatMessage_createServerFn_handler = createServerRpc({
  id: "be466318f3125b2b277a7c76d42c8686888399849371b42c3fcd7c3a75497e14",
  name: "postChatMessage",
  filename: "src/lib/watch-party/party.server.ts"
}, (opts) => postChatMessage.__executeServer(opts));
const postChatMessage = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  kind: input?.kind === "party" || input?.kind === "public" ? input.kind : "public",
  scopeId: typeof input?.scopeId === "string" ? input.scopeId.slice(0, 128) : "",
  body: typeof input?.body === "string" ? input.body.slice(0, 500) : ""
})).handler(postChatMessage_createServerFn_handler, async ({
  data
}) => {
  const body = data.body.trim();
  if (!body) return err("empty_message");
  if (!data.scopeId) return err("missing_scope");
  const {
    supabase,
    user
  } = await verifyTreyIUser(data.accessToken);
  if (data.kind === "party") {
    const {
      data: member
    } = await supabase.from("party_members").select("kicked, muted_chat").eq("party_id", data.scopeId).eq("user_id", user.id).maybeSingle();
    if (!member) return err("not_a_member");
    if (member.kicked) return err("kicked");
    if (member.muted_chat) return err("muted");
  }
  const sinceIso = new Date(Date.now() - 1e4).toISOString();
  const {
    count: recentCount
  } = await supabase.from("chat_messages").select("id", {
    count: "exact",
    head: true
  }).eq("sender_id", user.id).gte("created_at", sinceIso);
  if ((recentCount ?? 0) >= 5) return err("rate_limited");
  const verdict = await moderateChatMessage(body);
  await supabase.from("chat_moderation_events").insert({
    sender_id: user.id,
    message_text: body,
    verdict: verdict.verdict,
    severity: verdict.severity,
    reason: verdict.reason,
    kind: data.kind,
    scope_id: data.scopeId
  });
  if (verdict.verdict === "block") {
    return err("blocked", {
      reason: verdict.reason
    });
  }
  if (verdict.verdict === "timeout") {
    if (data.kind === "party") {
      await supabase.from("party_members").update({
        muted_chat: true
      }).eq("party_id", data.scopeId).eq("user_id", user.id);
    }
    return err("blocked", {
      reason: verdict.reason || "high_severity",
      timeoutMinutes: 5
    });
  }
  if (verdict.verdict !== "clean") {
    const offenceSince = new Date(Date.now() - 10 * 6e4).toISOString();
    const {
      count: offenceCount
    } = await supabase.from("chat_moderation_events").select("id", {
      count: "exact",
      head: true
    }).eq("sender_id", user.id).in("verdict", ["block", "timeout"]).gte("created_at", offenceSince);
    if ((offenceCount ?? 0) >= 3) {
      if (data.kind === "party") {
        await supabase.from("party_members").update({
          muted_chat: true
        }).eq("party_id", data.scopeId).eq("user_id", user.id);
      }
      return err("blocked", {
        reason: "repeat_offender",
        timeoutMinutes: 5
      });
    }
  }
  const {
    data: row,
    error: insErr
  } = await supabase.from("chat_messages").insert({
    kind: data.kind,
    scope_id: data.scopeId,
    sender_id: user.id,
    body
  }).select("id").single();
  if (insErr || !row) return err("insert_failed", {
    reason: insErr?.message
  });
  return {
    ok: true,
    messageId: row.id,
    nudge: verdict.verdict === "nudge" ? verdict.reason || "keep it civil" : null
  };
});
export {
  acceptPartyInvite_createServerFn_handler,
  changePartyChannel_createServerFn_handler,
  createWatchParty_createServerFn_handler,
  endWatchParty_createServerFn_handler,
  hostAddMember_createServerFn_handler,
  postChatMessage_createServerFn_handler,
  setMemberFlag_createServerFn_handler
};
