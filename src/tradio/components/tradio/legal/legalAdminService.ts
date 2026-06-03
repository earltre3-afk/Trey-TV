import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import { handleMissingTradioTables } from "../auth/tradioProfileBootstrap";
import type {
  LegalAcceptanceAuditRecord,
  LegalAdminDashboardStats,
  LegalAdminQueueFilter,
  LegalAdminRequest,
  LegalAdminRequestStatus,
  LegalRequestPriority,
  LegalDeletionRequest,
  LegalDmcaRequest,
  LegalModerationAppeal,
  LegalRequestCategory,
  LegalRequestEvent,
} from "./legalAdminTypes";

export type LegalAdminServiceSource = "mock" | "supabase_ready" | "supabase";

export interface LegalAdminServiceResult<T> {
  source: LegalAdminServiceSource;
  data: T;
  warning: string | null;
}

const source = (): LegalAdminServiceSource => (isSupabaseConfigured ? "supabase_ready" : "mock");
const serviceWarning = () =>
  isSupabaseConfigured
    ? "Legal admin RPC/table wiring is not applied in this frontend pass; showing mock records."
    : "Supabase is not configured; showing mock legal operations records.";
const supabaseWarning = () =>
  "Loaded from protected legal operations RPC. Deletion, DMCA, and takedown actions remain review-only.";
const rpcWarning = (error: unknown) =>
  `${handleMissingTradioTables(error).message} Showing mock legal operations records.`;

const maybeSupabase = () => (isSupabaseConfigured && supabase ? supabase : null);

const event = (
  requestId: string,
  action: LegalRequestEvent["action"],
  actor: string,
  note: string,
  createdAt: string,
): LegalRequestEvent => ({
  id: `${requestId}-${action}-${createdAt}`,
  request_id: requestId,
  action,
  actor,
  note,
  created_at: createdAt,
});

const baseEvents = (id: string, submittedAt: string, note: string): LegalRequestEvent[] => [
  event(id, "created", "system", note, submittedAt),
];

let mockRequests: LegalAdminRequest[] = [
  {
    id: "leg-data-export-001",
    category: "data_rights",
    request_type: "data_export",
    title: "Data export request",
    requester: {
      name: "Jordan Miles",
      email: "jordan@example.com",
      user_id: "user_fan_001",
      public_profile_uid: "treytv_fan_jordan_001",
    },
    status: "new",
    priority: "normal",
    submitted_at: "2026-05-29T09:15:00.000Z",
    summary: "User requested an export of Trey TV and Tradio account data.",
    details: {
      requestType: "Export my data",
      scope: "Trey TV profile, Tradio listening history, saved stations",
    },
    related_policy: "privacy",
    reviewer_note: "Verify identity before export packaging.",
    events: baseEvents(
      "leg-data-export-001",
      "2026-05-29T09:15:00.000Z",
      "Data export request submitted.",
    ),
  },
  {
    id: "leg-delete-002",
    category: "deletion",
    request_type: "account_deletion",
    title: "Account deletion request",
    requester: {
      name: "Mila Rain",
      email: "mila@example.com",
      user_id: "user_artist_002",
      public_profile_uid: "treytv_artist_mila_rain",
    },
    status: "pending_review",
    priority: "high",
    submitted_at: "2026-05-29T10:22:00.000Z",
    summary: "Artist requested account deletion and acknowledged data loss.",
    details: {
      confirmed: true,
      acknowledged: true,
      creatorContent: "artist station, releases, profile draft",
    },
    related_policy: "data-retention",
    reviewer_note: "No irreversible deletion action is wired. Needs identity and retention review.",
    events: baseEvents(
      "leg-delete-002",
      "2026-05-29T10:22:00.000Z",
      "Deletion request entered queue.",
    ),
    confirmation_status: {
      confirmed_delete: true,
      acknowledged_retention: true,
      identity_verified: false,
    },
    retained_records_note:
      "Retention exceptions may apply for audit, safety, copyright, and financial/legal records.",
  } as LegalDeletionRequest,
  {
    id: "leg-dmca-003",
    category: "dmca",
    request_type: "dmca_notice",
    title: "DMCA notice for uploaded track",
    requester: {
      name: "Rights Desk",
      email: "rights@example-label.com",
      user_id: "external-rights-contact",
    },
    status: "open",
    priority: "urgent",
    submitted_at: "2026-05-29T11:04:00.000Z",
    summary: "Claimant alleges a Tradio-native instant release uses an unauthorized master.",
    details: {
      claimant: "Example Label",
      claimedWork: "Midnight Demo Master",
      allegedlyInfringingUrl: "/tradio/release/falling-for-you",
    },
    related_policy: "dmca",
    related_content_id: "release_mock_falling_for_you",
    reviewer_note: "DMCA workflow placeholder only. Do not auto-takedown from this prototype.",
    events: baseEvents("leg-dmca-003", "2026-05-29T11:04:00.000Z", "DMCA notice received."),
    takedown_status: "review_needed",
    dispute_status: "none",
    repeat_infringer_flag: false,
  } as LegalDmcaRequest,
  {
    id: "leg-counter-004",
    category: "dmca",
    request_type: "dmca_counter_notice",
    title: "DMCA counter-notice",
    requester: {
      name: "Trey Trizzy",
      email: "trey@example.com",
      user_id: "user_artist_004",
      public_profile_uid: "treytv_artist_trey_trizzy",
    },
    status: "needs_more_info",
    priority: "high",
    submitted_at: "2026-05-28T18:33:00.000Z",
    summary: "Artist disputes a copyright takedown claim and requests reinstatement review.",
    details: {
      originalNoticeId: "leg-dmca-003",
      statement: "Artist claims ownership/control of the upload.",
    },
    related_policy: "dmca",
    related_content_id: "release_mock_midnight_velvet",
    reviewer_note: "Needs counsel review before any reinstatement action.",
    events: baseEvents("leg-counter-004", "2026-05-28T18:33:00.000Z", "Counter-notice received."),
    takedown_status: "disputed",
    dispute_status: "counter_notice_received",
  } as LegalDmcaRequest,
  {
    id: "leg-unauth-005",
    category: "unauthorized_upload",
    request_type: "report_unauthorized_music",
    title: "Unauthorized beat upload report",
    requester: {
      name: "Darius Cole",
      email: "darius@example.com",
      user_id: "user_producer_005",
      public_profile_uid: "treytv_producer_darius",
    },
    status: "open",
    priority: "high",
    submitted_at: "2026-05-28T16:02:00.000Z",
    summary: "Producer reports a beat pack was uploaded by another user without permission.",
    details: { beatPack: "Memphis Night Loops", allegedUploader: "unknown_producer_77" },
    related_policy: "producer-terms",
    related_content_id: "beat_pack_memphis_night_loops",
    events: baseEvents(
      "leg-unauth-005",
      "2026-05-28T16:02:00.000Z",
      "Unauthorized upload report submitted.",
    ),
  },
  {
    id: "leg-songwars-006",
    category: "moderation",
    request_type: "moderation_appeal",
    title: "Song Wars rules appeal",
    requester: {
      name: "Kiana Lane",
      email: "kiana@example.com",
      user_id: "user_artist_006",
      public_profile_uid: "treytv_artist_kiana_lane",
    },
    status: "escalated",
    priority: "normal",
    submitted_at: "2026-05-28T13:40:00.000Z",
    summary: "Artist appeals a Song Wars disqualification for alleged vote manipulation.",
    details: {
      battleId: "battle_late_night_trap_soul",
      round: 3,
      appealReason: "Fan activity was organic.",
    },
    related_policy: "song-wars-rules",
    related_content_id: "battle_late_night_trap_soul",
    reviewer_note: "Escalated to moderation lead for vote audit placeholder.",
    events: [
      ...baseEvents("leg-songwars-006", "2026-05-28T13:40:00.000Z", "Appeal submitted."),
      event(
        "leg-songwars-006",
        "escalated",
        "legal-admin-mock",
        "Escalated for vote audit placeholder.",
        "2026-05-28T14:05:00.000Z",
      ),
    ],
    appealed_action: "Song Wars disqualification",
    appeal_status: "escalated",
  } as LegalModerationAppeal,
  {
    id: "leg-role-007",
    category: "creator",
    request_type: "role_appeal",
    title: "Role access decision appeal",
    requester: {
      name: "Noel Beats",
      email: "noel@example.com",
      user_id: "user_producer_007",
      public_profile_uid: "treytv_producer_noel",
    },
    status: "new",
    priority: "normal",
    submitted_at: "2026-05-29T08:30:00.000Z",
    summary: "Producer appeals a rejected producer access request.",
    details: {
      requestedRole: "producer",
      previousDecision: "rejected",
      reason: "Submitted additional catalog links.",
    },
    related_policy: "creator-terms",
    events: baseEvents("leg-role-007", "2026-05-29T08:30:00.000Z", "Role appeal submitted."),
    appealed_action: "Producer role denial",
    appeal_status: "new",
  } as LegalModerationAppeal,
  {
    id: "leg-safety-008",
    category: "safety",
    request_type: "report_safety",
    title: "Safety report from station community",
    requester: {
      name: "Ari Fan",
      email: "ari@example.com",
      user_id: "user_fan_008",
      public_profile_uid: "treytv_fan_ari",
    },
    status: "open",
    priority: "urgent",
    submitted_at: "2026-05-29T12:12:00.000Z",
    summary: "Fan reports threatening chat messages during a live station room.",
    details: { stationId: "station_midnight_velvet", messageIds: ["msg_1001", "msg_1002"] },
    related_policy: "community-guidelines",
    related_content_id: "station_midnight_velvet",
    events: baseEvents("leg-safety-008", "2026-05-29T12:12:00.000Z", "Safety report submitted."),
  },
  {
    id: "leg-prescribe-009",
    category: "privacy",
    request_type: "privacy_question",
    title: "Prescribe Me privacy question",
    requester: {
      name: "Sam Listener",
      email: "sam@example.com",
      user_id: "user_fan_009",
      public_profile_uid: "treytv_fan_sam",
    },
    status: "new",
    priority: "low",
    submitted_at: "2026-05-29T07:05:00.000Z",
    summary: "User asks how Prescribe Me uses Tradio listening signals.",
    details: { question: "Can I turn off Tradio music signals in recommendations?" },
    related_policy: "prescribe-me",
    events: baseEvents(
      "leg-prescribe-009",
      "2026-05-29T07:05:00.000Z",
      "Privacy question submitted.",
    ),
  },
];

const today = "2026-05-29";

const mockAuditRecords: LegalAcceptanceAuditRecord[] = [
  {
    id: "audit-upload-rights-001",
    user_id: "user_artist_002",
    public_profile_uid: "treytv_artist_mila_rain",
    flow_id: "instant_release_submit",
    policy_id: "music-upload-terms",
    policy_version: "0.1.0",
    accepted_at: "2026-05-29T10:40:00.000Z",
    source_flow: "Instant Release",
    backend_status: "fallback",
    rights_confirmation_type: "music",
    related_reference_id: "mock-instant-release-falling-for-you",
    summary: "Music upload terms accepted and rights confirmation captured in fallback mode.",
  },
  {
    id: "audit-broadcast-002",
    user_id: "user_dj_003",
    public_profile_uid: "treytv_dj_midnight_spin",
    flow_id: "dj_broadcast_schedule",
    policy_id: "dj-broadcast-terms",
    policy_version: "0.1.0",
    accepted_at: "2026-05-29T11:50:00.000Z",
    source_flow: "DJ Studio",
    backend_status: "mock",
    rights_confirmation_type: "mix",
    related_reference_id: "mock-dj-live-midnight-spin",
    summary: "Broadcast terms and authorized-show-content acknowledgement captured.",
  },
  {
    id: "audit-role-003",
    user_id: "user_producer_007",
    public_profile_uid: "treytv_producer_noel",
    flow_id: "role_access_request",
    policy_id: "creator-terms",
    policy_version: "0.1.0",
    accepted_at: "2026-05-29T08:29:00.000Z",
    source_flow: "Role Request Flow",
    backend_status: "fallback",
    summary: "Role access request acknowledgement accepted before producer request submission.",
  },
  {
    id: "audit-songwars-004",
    user_id: "user_artist_006",
    public_profile_uid: "treytv_artist_kiana_lane",
    flow_id: "song_wars_create",
    policy_id: "song-wars-rules",
    policy_version: "0.1.0",
    accepted_at: "2026-05-28T21:00:00.000Z",
    source_flow: "Song Wars Setup",
    backend_status: "mock",
    rights_confirmation_type: "music",
    related_reference_id: "battle_late_night_trap_soul",
    summary: "Song Wars rules and battle track authorization acknowledged.",
  },
];

const statusFromRow = (value: unknown): LegalAdminRequestStatus => {
  if (value === "submitted" || value === "in_review") return "new";
  if (value === "closed" || value === "cancelled") return "archived";
  return (value as LegalAdminRequestStatus) ?? "new";
};

const mapRequestRow = (row: Record<string, unknown>): LegalAdminRequest => {
  const details =
    (row.details as Record<string, unknown>) ?? (row.payload as Record<string, unknown>) ?? {};
  const requestType = String(
    row.request_type ?? "contact_support",
  ) as LegalAdminRequest["request_type"];
  const subject = (row.subject as string) || requestType.replace(/_/g, " ");
  return {
    id: String(row.id ?? ""),
    category: (row.category as LegalRequestCategory) ?? "general",
    request_type: requestType,
    title: subject,
    requester: {
      name:
        (row.requester_name as string) ||
        (row.requester_email as string) ||
        (row.contact_email as string) ||
        "Requester",
      email: (row.requester_email as string) ?? (row.contact_email as string) ?? undefined,
      user_id: (row.user_id as string) ?? undefined,
      public_profile_uid: (row.public_profile_uid as string) ?? undefined,
    },
    status: statusFromRow(row.status),
    priority: (row.priority as LegalRequestPriority) ?? "normal",
    submitted_at:
      (row.submitted_at as string) ?? (row.created_at as string) ?? new Date().toISOString(),
    summary: (row.summary as string) || subject,
    details,
    related_policy: (row.related_policy_id as string) ?? undefined,
    related_content_id: (row.related_content_id as string) ?? undefined,
    reviewer_note: (row.reviewer_note as string) ?? undefined,
    events: [],
  };
};

const mapEventRow = (row: Record<string, unknown>): LegalRequestEvent => ({
  id: String(row.id ?? ""),
  request_id: String(row.request_id ?? ""),
  action:
    row.event_type === "submitted"
      ? "created"
      : ((row.event_type as LegalRequestEvent["action"]) ?? "status_changed"),
  actor: (row.actor_user_id as string) ?? "system",
  note: (row.note as string) ?? "",
  created_at: (row.created_at as string) ?? new Date().toISOString(),
});

const mapAuditRow = (row: Record<string, unknown>): LegalAcceptanceAuditRecord => ({
  id: String(row.id ?? ""),
  user_id: String(row.user_id ?? ""),
  public_profile_uid: (row.public_profile_uid as string) ?? undefined,
  flow_id: String(row.flow_id ?? ""),
  policy_id: String(row.policy_id ?? "upload-rights"),
  policy_version: String(row.policy_version ?? "0.1.0"),
  accepted_at: String(row.accepted_at ?? new Date().toISOString()),
  source_flow: String(row.source_flow ?? row.flow_id ?? "Legal"),
  backend_status: "supabase",
  rights_confirmation_type:
    (row.rights_confirmation_type as LegalAcceptanceAuditRecord["rights_confirmation_type"]) ??
    undefined,
  related_reference_id: (row.related_reference_id as string) ?? undefined,
  summary:
    row.record_kind === "upload_rights"
      ? "Upload rights confirmation recorded."
      : "Legal policy acceptance recorded.",
});

const fetchSupabaseRequests = async (filters: LegalAdminQueueFilter = {}) => {
  const client = maybeSupabase();
  if (!client) return null;
  const { data, error } = await client.rpc("tradio_get_legal_admin_queue", {
    p_status: filters.status && filters.status !== "all" ? filters.status : null,
    p_category: filters.category && filters.category !== "all" ? filters.category : null,
    p_priority: filters.priority && filters.priority !== "all" ? filters.priority : null,
    p_query: filters.query || null,
    p_limit: 100,
  });
  if (error) throw error;
  return (Array.isArray(data) ? data : []).map((row) =>
    mapRequestRow(row as Record<string, unknown>),
  );
};

const applyFilters = (records: LegalAdminRequest[], filters: LegalAdminQueueFilter = {}) =>
  records.filter((record) => {
    if (filters.status && filters.status !== "all" && record.status !== filters.status)
      return false;
    if (filters.priority && filters.priority !== "all" && record.priority !== filters.priority)
      return false;
    if (filters.category && filters.category !== "all" && record.category !== filters.category)
      return false;
    if (filters.requestType && !String(record.request_type).includes(filters.requestType))
      return false;
    if (filters.query) {
      const haystack =
        `${record.id} ${record.title} ${record.summary} ${record.requester.name} ${record.requester.user_id ?? ""} ${record.requester.public_profile_uid ?? ""}`.toLowerCase();
      if (!haystack.includes(filters.query.toLowerCase())) return false;
    }
    if (filters.tab && filters.tab !== "all") {
      const tabCategories: Partial<
        Record<NonNullable<LegalAdminQueueFilter["tab"]>, LegalRequestCategory[]>
      > = {
        privacy: ["privacy", "data_rights"],
        deletion: ["deletion"],
        copyright: ["copyright", "dmca", "unauthorized_upload"],
        moderation: ["moderation", "creator"],
        safety: ["safety", "impersonation"],
        intake: ["general", "account", "privacy", "safety", "impersonation", "unauthorized_upload"],
      };
      const allowed = tabCategories[filters.tab];
      if (allowed && !allowed.includes(record.category)) return false;
    }
    return true;
  });

const result = <T>(data: T): LegalAdminServiceResult<T> => ({
  source: source(),
  data,
  warning: serviceWarning(),
});
const supabaseResult = <T>(data: T): LegalAdminServiceResult<T> => ({
  source: "supabase",
  data,
  warning: supabaseWarning(),
});
const mockResult = <T>(
  data: T,
  warning: string | null = serviceWarning(),
): LegalAdminServiceResult<T> => ({ source: source(), data, warning });

export const getLegalAdminDashboardStats = async (): Promise<
  LegalAdminServiceResult<LegalAdminDashboardStats>
> => {
  try {
    const supabaseRequests = await fetchSupabaseRequests();
    if (supabaseRequests) {
      const audit = await getLegalAcceptanceAuditRecords();
      const stats: LegalAdminDashboardStats = {
        new_requests: supabaseRequests.filter((item) => item.status === "new").length,
        urgent_requests: supabaseRequests.filter((item) => item.priority === "urgent").length,
        deletion_requests: supabaseRequests.filter((item) => item.category === "deletion").length,
        copyright_dmca_reports: supabaseRequests.filter((item) =>
          ["copyright", "dmca", "unauthorized_upload"].includes(item.category),
        ).length,
        unresolved_appeals: supabaseRequests.filter(
          (item) =>
            ["moderation_appeal", "role_appeal", "creator_profile_appeal"].includes(
              item.request_type,
            ) && !["resolved", "rejected", "archived"].includes(item.status),
        ).length,
        acceptance_records_today: audit.data.filter((item) => item.accepted_at.startsWith(today))
          .length,
      };
      return supabaseResult(stats);
    }
  } catch {
    // Fall through to safe mock stats when protected RPCs are unavailable.
  }
  const stats: LegalAdminDashboardStats = {
    new_requests: mockRequests.filter((item) => item.status === "new").length,
    urgent_requests: mockRequests.filter((item) => item.priority === "urgent").length,
    deletion_requests: mockRequests.filter((item) => item.category === "deletion").length,
    copyright_dmca_reports: mockRequests.filter((item) =>
      ["copyright", "dmca", "unauthorized_upload"].includes(item.category),
    ).length,
    unresolved_appeals: mockRequests.filter(
      (item) =>
        ["moderation_appeal", "role_appeal", "creator_profile_appeal"].includes(
          item.request_type,
        ) && !["resolved", "rejected", "archived"].includes(item.status),
    ).length,
    acceptance_records_today: mockAuditRecords.filter((item) => item.accepted_at.startsWith(today))
      .length,
  };
  return result(stats);
};

export const getLegalAdminRequests = async (filters: LegalAdminQueueFilter = {}) => {
  try {
    const records = await fetchSupabaseRequests(filters);
    if (records) return supabaseResult(applyFilters(records, filters));
  } catch (error) {
    return mockResult(applyFilters(mockRequests, filters), rpcWarning(error));
  }
  return result(applyFilters(mockRequests, filters));
};

export const getLegalRequestById = async (id: string) => {
  const client = maybeSupabase();
  if (client) {
    try {
      const { data, error } = await client.rpc("tradio_get_legal_admin_queue", {
        p_status: null,
        p_category: null,
        p_priority: null,
        p_query: id,
        p_limit: 10,
      });
      if (error) throw error;
      const row = (Array.isArray(data) ? data : []).find(
        (item) => String((item as Record<string, unknown>).id) === id,
      );
      if (row) {
        const request = mapRequestRow(row as Record<string, unknown>);
        const events = await getLegalRequestEvents(id);
        return supabaseResult({ ...request, events: events.data });
      }
    } catch {
      // Fall through to mock lookup.
    }
  }
  return result(mockRequests.find((item) => item.id === id) ?? null);
};

export const getLegalRequestEvents = async (id: string) => {
  const client = maybeSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from("tradio_legal_request_events")
        .select("*")
        .eq("request_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return supabaseResult((data ?? []).map((row) => mapEventRow(row as Record<string, unknown>)));
    } catch {
      // Fall through to mock events.
    }
  }
  return result(mockRequests.find((item) => item.id === id)?.events ?? []);
};

export const updateLegalRequestStatus = async (
  id: string,
  status: LegalAdminRequestStatus,
  note: string,
) => {
  const client = maybeSupabase();
  if (client) {
    try {
      const { data, error } = await client.rpc("tradio_update_legal_request_status", {
        p_request_id: id,
        p_status: status,
        p_note: note || null,
      });
      if (error) throw error;
      const request = mapRequestRow(
        (Array.isArray(data) ? data[0] : data) as Record<string, unknown>,
      );
      const events = await getLegalRequestEvents(id);
      return supabaseResult({ ...request, events: events.data });
    } catch {
      // Fall through to non-destructive mock update.
    }
  }
  mockRequests = mockRequests.map((item) => {
    if (item.id !== id) return item;
    const nextEvent = event(
      id,
      "status_changed",
      "legal-admin-mock",
      note || `Status changed to ${status}.`,
      new Date().toISOString(),
    );
    return {
      ...item,
      status,
      reviewer_note: note || item.reviewer_note,
      events: [nextEvent, ...item.events],
    };
  });
  return getLegalRequestById(id);
};

export const addLegalReviewNote = async (id: string, note: string) => {
  const client = maybeSupabase();
  if (client) {
    try {
      const { data, error } = await client.rpc("tradio_add_legal_review_note", {
        p_request_id: id,
        p_note: note,
      });
      if (error) throw error;
      const request = mapRequestRow(
        (Array.isArray(data) ? data[0] : data) as Record<string, unknown>,
      );
      const events = await getLegalRequestEvents(id);
      return supabaseResult({ ...request, events: events.data });
    } catch {
      // Fall through to non-destructive mock note.
    }
  }
  mockRequests = mockRequests.map((item) => {
    if (item.id !== id) return item;
    const nextEvent = event(id, "note_added", "legal-admin-mock", note, new Date().toISOString());
    return { ...item, reviewer_note: note, events: [nextEvent, ...item.events] };
  });
  return getLegalRequestById(id);
};

export const escalateLegalRequest = async (id: string, reason: string) =>
  updateLegalRequestStatus(id, "escalated", reason || "Escalated for legal operations review.");
export const archiveLegalRequest = async (id: string) => {
  const client = maybeSupabase();
  if (client) {
    try {
      const { data, error } = await client.rpc("tradio_archive_legal_request", {
        p_request_id: id,
        p_note: "Archived from legal operations dashboard.",
      });
      if (error) throw error;
      const request = mapRequestRow(
        (Array.isArray(data) ? data[0] : data) as Record<string, unknown>,
      );
      const events = await getLegalRequestEvents(id);
      return supabaseResult({ ...request, events: events.data });
    } catch {
      // Fall through to mock archive.
    }
  }
  return updateLegalRequestStatus(id, "archived", "Archived in mock legal operations queue.");
};

export const getLegalAcceptanceAuditRecords = async (filters: LegalAdminQueueFilter = {}) => {
  const client = maybeSupabase();
  if (client) {
    try {
      const { data, error } = await client.rpc("tradio_get_legal_acceptance_audit", {
        p_query: filters.query || null,
        p_flow_id: filters.requestType || null,
        p_limit: 100,
      });
      if (error) throw error;
      return supabaseResult(
        (Array.isArray(data) ? data : []).map((row) => mapAuditRow(row as Record<string, unknown>)),
      );
    } catch (error) {
      return mockResult(mockAuditRecords, rpcWarning(error));
    }
  }
  const filtered = mockAuditRecords.filter((record) => {
    if (filters.query) {
      const haystack =
        `${record.user_id} ${record.public_profile_uid ?? ""} ${record.flow_id} ${record.policy_id} ${record.related_reference_id ?? ""}`.toLowerCase();
      if (!haystack.includes(filters.query.toLowerCase())) return false;
    }
    if (filters.requestType && record.flow_id !== filters.requestType) return false;
    return true;
  });
  return result(filtered);
};

export const getDeletionRequests = async (filters: LegalAdminQueueFilter = {}) =>
  result(
    applyFilters(mockRequests, { ...filters, category: "deletion" }) as LegalDeletionRequest[],
  );
export const getDmcaRequests = async (filters: LegalAdminQueueFilter = {}) =>
  result(
    applyFilters(mockRequests, filters).filter((item) =>
      ["dmca", "copyright", "unauthorized_upload"].includes(item.category),
    ) as LegalDmcaRequest[],
  );
export const getModerationAppeals = async (filters: LegalAdminQueueFilter = {}) =>
  result(
    applyFilters(mockRequests, filters).filter((item) =>
      ["moderation", "creator"].includes(item.category),
    ) as LegalModerationAppeal[],
  );
