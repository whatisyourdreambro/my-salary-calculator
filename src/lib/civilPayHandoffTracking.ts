import { trackEvent } from "./analytics";

export type CivilPayHandoffStage = "selected" | "accepted" | "rejected" | "confirmed";
export type CivilPayHandoffReason = "expired" | "invalid" | "storage_unavailable" | "missing";

/** Fixed journey states only. A selection/arrival is never a calculation success. */
export function trackCivilPayHandoff(
  stage: CivilPayHandoffStage,
  sourceGroup?: "fire" | "police",
  reason?: CivilPayHandoffReason,
): void {
  trackEvent("civil_pay_handoff", {
    flow_version: "1", stage,
    ...(sourceGroup ? { source_group: sourceGroup } : {}),
    ...(stage === "rejected" && reason ? { reason } : {}),
  });
}
