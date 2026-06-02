// ─────────────────────────────────────────────────────────────────────────────
// Watch-party server functions (createServerFn endpoints).
// All RPCs validate the caller via accessToken → verifyTreyIUser, then use the
// service-role Supabase client to bypass RLS where we've gated access at the
// app layer (e.g., the moderation flow needs to insert into chat_messages
// regardless of the chat_messages INSERT RLS).
//
// See spec: docs/superpowers/specs/2026-05-24-watch-party-design.md §7, §11.
// ─────────────────────────────────────────────────────────────────────────────
import { createServerFn } from "@tanstack/react-start";
import { verifyTreyIUser } from "@/lib/trey-i/onboarding.server";
import { moderateChatMessage } from "@/lib/watch-party/moderation.server";

type RpcSuccess<T> = { ok: true } & T;
type RpcError = { ok: false; error: string; reason?: string; timeoutMinutes?: number };
type Rpc<T> = RpcSuccess<T> | RpcError;

const err = (error: string, extra?: Partial<RpcError>): RpcError => ({
  ok: false,
  error,
  ...extra,
});

// ── 1. create_watch_party ───────────────────────────────────────────────────
export const createWatchParty = createServerFn({ method: "POST" })
  .inputValidator((input: { accessToken: string; channelId: string; name?: string }) => ({
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
    channelId: typeof input?.channelId === "string" ? input.channelId.slice(0, 100) : "",
    name: typeof input?.name === "string" ? input.name.slice(0, 80) : undefined,
  }))
  .handler(async ({ data }): Promise<Rpc<{ partyId: string; inviteToken: string }>> => {
    if (!data.channelId) return err("missing_channel_id");

    const { supabase, user } = await verifyTreyIUser(data.accessToken);
    const { data: rpcData, error: rpcError } = await (supabase as any).rpc("create_watch_party", {
      p_channel_id: data.channelId,
      p_name: data.name ?? null,
    });
    if (rpcError) return err("create_failed", { reason: rpcError.message });

    const partyId = rpcData as string;
    const { data: party } = await (supabase as any)
      .from("watch_parties")
      .select("invite_token")
      .eq("id", partyId)
      .single();

    return { ok: true, partyId, inviteToken: party?.invite_token ?? "" };
  });

// ── 2. accept_party_invite ──────────────────────────────────────────────────
export const acceptPartyInvite = createServerFn({ method: "POST" })
  .inputValidator((input: { accessToken: string; inviteToken: string }) => ({
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
    inviteToken: typeof input?.inviteToken === "string" ? input.inviteToken.slice(0, 64) : "",
  }))
  .handler(async ({ data }): Promise<Rpc<{ partyId: string }>> => {
    if (!data.inviteToken) return err("missing_invite_token");
    const { supabase } = await verifyTreyIUser(data.accessToken);
    const { data: rpcData, error: rpcError } = await (supabase as any).rpc("accept_party_invite", {
      p_invite_token: data.inviteToken,
    });
    if (rpcError) return err("join_failed", { reason: rpcError.message });
    return { ok: true, partyId: rpcData as string };
  });

// ── 3. change_party_channel (host only) ─────────────────────────────────────
export const changePartyChannel = createServerFn({ method: "POST" })
  .inputValidator((input: { accessToken: string; partyId: string; channelId: string }) => ({
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
    partyId: typeof input?.partyId === "string" ? input.partyId.slice(0, 64) : "",
    channelId: typeof input?.channelId === "string" ? input.channelId.slice(0, 100) : "",
  }))
  .handler(async ({ data }): Promise<Rpc<{}>> => {
    if (!data.partyId || !data.channelId) return err("missing_args");
    const { supabase, user } = await verifyTreyIUser(data.accessToken);

    // Verify host before update so we return a clean error rather than 0 rows.
    const { data: party } = await (supabase as any)
      .from("watch_parties")
      .select("host_id")
      .eq("id", data.partyId)
      .maybeSingle();
    if (!party) return err("party_not_found");
    if (party.host_id !== user.id) return err("not_host");

    const { error: updErr } = await (supabase as any)
      .from("watch_parties")
      .update({ channel_id: data.channelId })
      .eq("id", data.partyId);
    if (updErr) return err("update_failed", { reason: updErr.message });
    return { ok: true };
  });

// ── 4. set_member_flag (host action: kick / mute_chat / mute_mic) ───────────
export const setMemberFlag = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      accessToken: string;
      partyId: string;
      targetUserId: string;
      field: "kicked" | "muted_chat" | "muted_mic";
      value: boolean;
    }) => ({
      accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
      partyId: typeof input?.partyId === "string" ? input.partyId.slice(0, 64) : "",
      targetUserId: typeof input?.targetUserId === "string" ? input.targetUserId.slice(0, 64) : "",
      field:
        input?.field === "kicked" || input?.field === "muted_chat" || input?.field === "muted_mic"
          ? input.field
          : "muted_chat",
      value: Boolean(input?.value),
    }),
  )
  .handler(async ({ data }): Promise<Rpc<{}>> => {
    if (!data.partyId || !data.targetUserId) return err("missing_args");
    const { supabase, user } = await verifyTreyIUser(data.accessToken);

    // Authorization: caller must be host of this party.
    const { data: party } = await (supabase as any)
      .from("watch_parties")
      .select("host_id")
      .eq("id", data.partyId)
      .maybeSingle();
    if (!party) return err("party_not_found");
    if (party.host_id !== user.id) return err("not_host");

    // Host cannot kick/mute themselves through this RPC (use "end party" instead).
    if (data.targetUserId === user.id) return err("cannot_target_self");

    const { error: updErr } = await (supabase as any)
      .from("party_members")
      .update({ [data.field]: data.value })
      .eq("party_id", data.partyId)
      .eq("user_id", data.targetUserId);
    if (updErr) return err("update_failed", { reason: updErr.message });

    // Mic mute also propagates to LiveKit (see livekit.server.ts).
    // We do it lazily — the next token mint reflects the new permission and
    // the client renderer updates. For instant effect we'd call RoomService here.
    return { ok: true };
  });

// ── 5. host_add_member (follower-picker direct add) ─────────────────────────
export const hostAddMember = createServerFn({ method: "POST" })
  .inputValidator((input: { accessToken: string; partyId: string; targetUserId: string }) => ({
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
    partyId: typeof input?.partyId === "string" ? input.partyId.slice(0, 64) : "",
    targetUserId: typeof input?.targetUserId === "string" ? input.targetUserId.slice(0, 64) : "",
  }))
  .handler(async ({ data }): Promise<Rpc<{}>> => {
    if (!data.partyId || !data.targetUserId) return err("missing_args");
    const { supabase, user } = await verifyTreyIUser(data.accessToken);

    const { data: party } = await (supabase as any)
      .from("watch_parties")
      .select("host_id, ended_at")
      .eq("id", data.partyId)
      .maybeSingle();
    if (!party) return err("party_not_found");
    if (party.ended_at) return err("party_ended");
    if (party.host_id !== user.id) return err("not_host");

    const { error: insErr } = await (supabase as any)
      .from("party_members")
      .insert({ party_id: data.partyId, user_id: data.targetUserId, role: "member" });
    if (insErr) {
      // Trigger raises `party_full` with errcode P0001; surface that cleanly.
      if (insErr.message?.includes("party_full")) return err("party_full");
      return err("add_failed", { reason: insErr.message });
    }
    return { ok: true };
  });

// ── 6. end_watch_party (host) ───────────────────────────────────────────────
export const endWatchParty = createServerFn({ method: "POST" })
  .inputValidator((input: { accessToken: string; partyId: string }) => ({
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
    partyId: typeof input?.partyId === "string" ? input.partyId.slice(0, 64) : "",
  }))
  .handler(async ({ data }): Promise<Rpc<{}>> => {
    if (!data.partyId) return err("missing_party_id");
    const { supabase, user } = await verifyTreyIUser(data.accessToken);

    const { error: updErr } = await (supabase as any)
      .from("watch_parties")
      .update({ ended_at: new Date().toISOString() })
      .eq("id", data.partyId)
      .eq("host_id", user.id)
      .is("ended_at", null);
    if (updErr) return err("end_failed", { reason: updErr.message });
    return { ok: true };
  });

// ── 7. post_chat_message (party + public — runs AI moderation + rate limit) ──
type PostMessageInput = {
  accessToken: string;
  kind: "party" | "public";
  scopeId: string;
  body: string;
};

type PostMessageOutput = Rpc<{ messageId: string; nudge?: string | null }>;

export const postChatMessage = createServerFn({ method: "POST" })
  .inputValidator((input: PostMessageInput) => ({
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
    kind: input?.kind === "party" || input?.kind === "public" ? input.kind : "public",
    scopeId: typeof input?.scopeId === "string" ? input.scopeId.slice(0, 128) : "",
    body: typeof input?.body === "string" ? input.body.slice(0, 500) : "",
  }))
  .handler(async ({ data }): Promise<PostMessageOutput> => {
    const body = data.body.trim();
    if (!body) return err("empty_message");
    if (!data.scopeId) return err("missing_scope");

    const { supabase, user } = await verifyTreyIUser(data.accessToken);

    // ── Membership / mute checks ─────────────────────────────────────────
    if (data.kind === "party") {
      const { data: member } = await (supabase as any)
        .from("party_members")
        .select("kicked, muted_chat")
        .eq("party_id", data.scopeId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!member) return err("not_a_member");
      if (member.kicked) return err("kicked");
      if (member.muted_chat) return err("muted");
    }

    // ── Rate limit: 5 messages per 10 seconds per user ───────────────────
    const sinceIso = new Date(Date.now() - 10_000).toISOString();
    const { count: recentCount } = await (supabase as any)
      .from("chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("sender_id", user.id)
      .gte("created_at", sinceIso);
    if ((recentCount ?? 0) >= 5) return err("rate_limited");

    // ── Trey-I moderation ────────────────────────────────────────────────
    const verdict = await moderateChatMessage(body);

    // Audit-log every verdict (clean too — useful for tuning).
    await (supabase as any).from("chat_moderation_events").insert({
      sender_id: user.id,
      message_text: body,
      verdict: verdict.verdict,
      severity: verdict.severity,
      reason: verdict.reason,
      kind: data.kind,
      scope_id: data.scopeId,
    });

    if (verdict.verdict === "block") {
      return err("blocked", { reason: verdict.reason });
    }

    if (verdict.verdict === "timeout") {
      // Auto-mute for 5 minutes in the party they were posting in.
      // For public chat we can't easily "timeout" globally without a new
      // table; for now we just block this message and let repeat-offender
      // logic catch chronic abusers via the audit table.
      if (data.kind === "party") {
        await (supabase as any)
          .from("party_members")
          .update({ muted_chat: true })
          .eq("party_id", data.scopeId)
          .eq("user_id", user.id);
        // Note: there's no automatic unmute timer in Phase 1; the host
        // un-mutes manually. A future cron can scan moderation_events for
        // 5-min-old auto-mutes and clear them.
      }
      return err("blocked", { reason: verdict.reason || "high_severity", timeoutMinutes: 5 });
    }

    // ── Repeat-offender: 3 non-clean verdicts in last 10 min → timeout ───
    if (verdict.verdict !== "clean") {
      const offenceSince = new Date(Date.now() - 10 * 60_000).toISOString();
      const { count: offenceCount } = await (supabase as any)
        .from("chat_moderation_events")
        .select("id", { count: "exact", head: true })
        .eq("sender_id", user.id)
        .in("verdict", ["block", "timeout"])
        .gte("created_at", offenceSince);
      if ((offenceCount ?? 0) >= 3) {
        if (data.kind === "party") {
          await (supabase as any)
            .from("party_members")
            .update({ muted_chat: true })
            .eq("party_id", data.scopeId)
            .eq("user_id", user.id);
        }
        return err("blocked", { reason: "repeat_offender", timeoutMinutes: 5 });
      }
    }

    // ── Insert message ───────────────────────────────────────────────────
    const { data: row, error: insErr } = await (supabase as any)
      .from("chat_messages")
      .insert({
        kind: data.kind,
        scope_id: data.scopeId,
        sender_id: user.id,
        body,
      })
      .select("id")
      .single();

    if (insErr || !row) return err("insert_failed", { reason: insErr?.message });

    return {
      ok: true,
      messageId: row.id as string,
      nudge: verdict.verdict === "nudge" ? verdict.reason || "keep it civil" : null,
    };
  });
