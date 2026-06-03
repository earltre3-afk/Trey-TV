import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import type { CallerStatus } from "@/lib/tradio/callerLogic";

export interface CallRequest {
  id: string;
  sessionId: string;
  userId: string;
  callerIdentity: string;
  callerName: string | null;
  lineNote: string | null;
  status: CallerStatus;
  createdAt: string;
}

const ok = isSupabaseConfigured && supabase;

function rowToCall(r: any): CallRequest {
  return {
    id: r.id,
    sessionId: r.session_id,
    userId: r.user_id,
    callerIdentity: r.caller_identity,
    callerName: r.caller_name,
    lineNote: r.line_note,
    status: r.status,
    createdAt: r.created_at,
  };
}

export async function listCallRequests(sessionId: string): Promise<CallRequest[]> {
  if (!ok) return [];
  const { data } = await supabase!
    .from("tradio_live_call_requests")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .limit(100);
  return (data ?? []).map(rowToCall);
}

export async function requestCall(input: {
  sessionId: string;
  callerIdentity: string;
  callerName?: string;
  lineNote?: string;
}): Promise<{ error: string | null }> {
  if (!ok) return { error: "Calling in needs Supabase." };
  const { data: u } = await supabase!.auth.getUser();
  const userId = u.user?.id;
  if (!userId) return { error: "Sign in to call in." };
  const { error } = await supabase!.from("tradio_live_call_requests").insert({
    session_id: input.sessionId,
    user_id: userId,
    caller_identity: input.callerIdentity,
    caller_name: input.callerName ?? null,
    line_note: input.lineNote ?? null,
    status: "pending",
  });
  return { error: error?.message ?? null };
}
