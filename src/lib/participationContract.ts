import type { FixedFeedbackReason, FixedFeedbackVote } from "./fixedFeedbackContract";
/** Private opinions have their own consent and never become public comments. */
export const OPINION_CONTRACT_VERSION = "private-opinion-v1";
export const PARTICIPATION_TARGETS = {
  samsung_bonus: "/calc/samsung-bonus",
  civil_pay_2027: "/civil-servant-pay-2027",
  samsung_company: "/salary-db/samsung-electronics",
} as const;
export type ParticipationTarget = keyof typeof PARTICIPATION_TARGETS;
export interface OpinionRequest {
  submissionId: string;
  contractVersion: typeof OPINION_CONTRACT_VERSION;
  target: ParticipationTarget;
  body: string;
  inquiryConsent: true;
}
export type OpinionError = "INVALID_ORIGIN" | "UNSUPPORTED_MEDIA_TYPE" | "PAYLOAD_TOO_LARGE"
  | "INVALID_REQUEST" | "CONSENT_REQUIRED" | "CONTENT_NOT_ALLOWED" | "PERSONAL_DATA_NOT_ALLOWED"
  | "RECEIPT_CONFLICT" | "RATE_LIMITED" | "UNAVAILABLE";
export type OpinionResponse = { ok: true; receiptId: string; duplicate: boolean } | { ok: false; error: OpinionError };

export const REACTION_CONTRACT_VERSION = "public-reaction-v1";
export interface ReactionRequest {
  submissionId: string;
  contractVersion: typeof REACTION_CONTRACT_VERSION;
  target: ParticipationTarget;
  vote: FixedFeedbackVote;
  reason: FixedFeedbackReason | null;
  publicAggregateConsent: true;
}
export type ParticipationSummary = { ok: true; visible: false }
  | { ok: true; visible: true; total: number; helpful: number; confusing: number; windowDays: 28 }
  | { ok: false; error: "INVALID_REQUEST" | "UNAVAILABLE" };
