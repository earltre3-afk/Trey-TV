export type CallerStatus = "pending" | "on_air" | "ended";
export type CallerAction = "take" | "disconnect" | "decline";

/** Pure state machine for a call-in request's lifecycle. Illegal transitions are no-ops. */
export function nextCallerStatus(current: CallerStatus, action: CallerAction): CallerStatus {
  if (current === "pending" && action === "take") return "on_air";
  if (current === "pending" && action === "decline") return "ended";
  if (current === "on_air" && action === "disconnect") return "ended";
  return current;
}

/** A caller may publish audio only while on air in a still-live session. */
export function resolveCallerPublish(input: {
  status: CallerStatus;
  sessionStatus: "live" | "ended";
}): boolean {
  return input.status === "on_air" && input.sessionStatus === "live";
}
