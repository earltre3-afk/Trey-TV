import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  canSubmitRoleRequest,
  getCurrentUserAccessStateMock,
  getRoleAccessRequestsMock,
  reviewRoleAccessRequestMock,
} from "./accessRequests";
import {
  cancelMyAccessRequest,
  grantRoleFromRequestAdmin,
  reviewAccessRequestAdmin,
  submitAccessRequest,
  updateMyAccessRequestDraft,
  type AccessServiceSource,
} from "./accessRequestService";
import { RoleRequestFlow } from "./RoleRequestFlow";
import { can } from "./roleUtils";
import { useTradioIdentity } from "./useTradioIdentity";
import type {
  AccessRequestEvent,
  CreatorSetupState,
  RoleAccessRequest,
  RoleApplicationAnswer,
  RoleRequestStatus,
  RoleRequestType,
} from "./types";

/** Statuses an admin review (not an approval) may set. Approval has its own path. */
export type AdminReviewStatus = Extract<
  RoleRequestStatus,
  "pending" | "rejected" | "restricted" | "needs_more_info" | "cancelled"
>;

interface AccessRequestsContextValue {
  requests: RoleAccessRequest[];
  accessState: CreatorSetupState;
  activeFlow: RoleRequestType | null;
  /** Where the request data is coming from: live Supabase or local mock fallback. */
  dataSource: AccessServiceSource;
  isLoading: boolean;
  /** True when the current identity may act on the admin review queue. */
  isAdmin: boolean;
  openFlow: (type: RoleRequestType) => void;
  closeFlow: () => void;
  getRequestFor: (type: RoleRequestType) => RoleAccessRequest | undefined;
  canRequest: (type: RoleRequestType) => boolean;
  getEvents: (requestId: string) => AccessRequestEvent[];
  updateDraft: (
    requestId: string,
    answers: RoleApplicationAnswer[],
    resubmit?: boolean,
  ) => Promise<void>;
  cancelRequest: (requestId: string) => Promise<void>;
  // Admin / reviewer (gated by isAdmin in the UI; backend RPC re-checks on the server).
  reviewRequest: (requestId: string, status: AdminReviewStatus, note?: string) => Promise<void>;
  approveRequest: (requestId: string, note?: string) => Promise<void>;
}

const AccessRequestsContext = createContext<AccessRequestsContextValue | null>(null);

export const AccessRequestsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { identity, applyMockGrant } = useTradioIdentity();
  const [requests, setRequests] = useState<RoleAccessRequest[]>(() => getRoleAccessRequestsMock());
  const [activeFlow, setActiveFlow] = useState<RoleRequestType | null>(null);
  const [dataSource, setDataSource] = useState<AccessServiceSource>("mock");
  const [isLoading, setIsLoading] = useState(false);

  // Load requests through the service (Supabase when configured + tables exist,
  // otherwise the mock seed). Never throws; silently keeps the mock fallback.
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    import("./accessRequestService")
      .then(({ getMyAccessRequests }) => getMyAccessRequests())
      .then((result) => {
        if (!active) return;
        setDataSource(result.source);
        // Only replace the seed when Supabase actually returned rows.
        if (result.source === "supabase" && result.data) setRequests(result.data);
      })
      .catch(() => {
        /* keep mock fallback */
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const openFlow = useCallback((type: RoleRequestType) => setActiveFlow(type), []);
  const closeFlow = useCallback(() => setActiveFlow(null), []);

  const handleSubmit = useCallback((type: RoleRequestType, answers: RoleApplicationAnswer[]) => {
    // Optimistically reflect the request, then reconcile with the service result.
    submitAccessRequest(type, answers).then((result) => {
      if (result.source)
        setDataSource((current) => (result.source === "supabase" ? "supabase" : current));
      const request = result.data;
      if (!request) return;
      setRequests((current) => [
        request,
        ...current.filter(
          (existing) => existing.request_type !== type || existing.status === "approved",
        ),
      ]);
    });
  }, []);

  const updateDraft = useCallback(
    async (requestId: string, answers: RoleApplicationAnswer[], resubmit = false) => {
      const result = await updateMyAccessRequestDraft(requestId, answers, resubmit);
      setRequests((current) =>
        current.map((request) => {
          if (request.id !== requestId) return request;
          if (result.source === "supabase" && result.data) return result.data;
          return resubmit
            ? reviewRoleAccessRequestMock({ ...request, answers }, "pending", undefined, "user")
            : { ...request, answers };
        }),
      );
    },
    [],
  );

  const cancelRequest = useCallback(async (requestId: string) => {
    const result = await cancelMyAccessRequest(requestId);
    setRequests((current) =>
      current.map((request) => {
        if (request.id !== requestId) return request;
        if (result.source === "supabase" && result.data) return result.data;
        return reviewRoleAccessRequestMock(request, "cancelled", undefined, "user");
      }),
    );
  }, []);

  const reviewRequest = useCallback(
    async (requestId: string, status: AdminReviewStatus, note?: string) => {
      if (status !== "cancelled")
        await reviewAccessRequestAdmin(
          requestId,
          status as Exclude<AdminReviewStatus, "cancelled">,
          note,
        );
      setRequests((current) =>
        current.map((request) =>
          request.id === requestId ? reviewRoleAccessRequestMock(request, status, note) : request,
        ),
      );
    },
    [],
  );

  const approveRequest = useCallback(
    async (requestId: string, note?: string) => {
      await grantRoleFromRequestAdmin(requestId, note);
      const target = requests.find((request) => request.id === requestId);
      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? reviewRoleAccessRequestMock(request, "approved", note)
            : request,
        ),
      );
      // Simulate the grant locally so the UI reflects unlocked tools (mock review).
      if (target) {
        if (target.request_type === "verification") applyMockGrant({ verification: "verified" });
        else if (target.request_type === "broadcast") applyMockGrant({ broadcast: "cleared" });
        else if (target.requested_role) applyMockGrant({ role: target.requested_role });
      }
    },
    [requests, applyMockGrant],
  );

  const getRequestFor = useCallback(
    (type: RoleRequestType) => requests.find((request) => request.request_type === type),
    [requests],
  );

  const canRequest = useCallback(
    (type: RoleRequestType) => canSubmitRoleRequest(identity, type, requests),
    [identity, requests],
  );

  const getEvents = useCallback(
    (requestId: string) => requests.find((request) => request.id === requestId)?.events ?? [],
    [requests],
  );

  const isAdmin = can(identity, "admin-platform");

  const accessState = useMemo(
    () => getCurrentUserAccessStateMock(identity, requests),
    [identity, requests],
  );

  const value = useMemo<AccessRequestsContextValue>(
    () => ({
      requests,
      accessState,
      activeFlow,
      dataSource,
      isLoading,
      isAdmin,
      openFlow,
      closeFlow,
      getRequestFor,
      canRequest,
      getEvents,
      updateDraft,
      cancelRequest,
      reviewRequest,
      approveRequest,
    }),
    [
      requests,
      accessState,
      activeFlow,
      dataSource,
      isLoading,
      isAdmin,
      openFlow,
      closeFlow,
      getRequestFor,
      canRequest,
      getEvents,
      updateDraft,
      cancelRequest,
      reviewRequest,
      approveRequest,
    ],
  );

  return (
    <AccessRequestsContext.Provider value={value}>
      {children}
      {activeFlow && (
        <RoleRequestFlow flowType={activeFlow} onClose={closeFlow} onSubmit={handleSubmit} />
      )}
    </AccessRequestsContext.Provider>
  );
};

/** Safe accessor — returns null if used outside the provider so gates never crash. */
export const useAccessRequests = (): AccessRequestsContextValue | null =>
  useContext(AccessRequestsContext);
