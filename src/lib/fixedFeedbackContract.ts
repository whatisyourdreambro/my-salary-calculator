/** Fixed private opinions only. Never include calculation values or analytics IDs. */
export const FIXED_FEEDBACK_TARGETS = ["samsung_bonus", "civil_pay_2027", "samsung_company"] as const;
export type FixedFeedbackTarget = (typeof FIXED_FEEDBACK_TARGETS)[number];
export type FixedFeedbackVote = "helpful" | "confusing";

const commonReasons = [
  { value: "source_date", label: "근거·기준일을 찾기 어려워요" },
  { value: "missing_information", label: "찾는 정보가 없어요" },
] as const;

export const FIXED_FEEDBACK_CONFIG = {
  samsung_bonus: {
    path: "/calc/samsung-bonus",
    reasons: [
      { value: "input_method", label: "입력 방법을 모르겠어요" },
      { value: "calculation_explanation", label: "공제·결과 설명이 어려워요" },
      ...commonReasons,
    ],
  },
  civil_pay_2027: {
    path: "/civil-servant-pay-2027",
    reasons: [
      { value: "forecast_status", label: "확정표인지 예상표인지 헷갈려요" },
      { value: "pay_components", label: "봉급과 수당 구분이 어려워요" },
      ...commonReasons,
    ],
  },
  samsung_company: {
    path: "/salary-db/samsung-electronics",
    reasons: [
      { value: "salary_basis", label: "어떤 연봉 기준인지 헷갈려요" },
      { value: "estimate_vs_disclosure", label: "추정치와 공시 구분이 어려워요" },
      ...commonReasons,
    ],
  },
} as const;

export type FixedFeedbackReason = (typeof FIXED_FEEDBACK_CONFIG)[FixedFeedbackTarget]["reasons"][number]["value"];

export interface FixedFeedbackRequest {
  submissionId: string;
  target: FixedFeedbackTarget;
  vote: FixedFeedbackVote;
  reason: FixedFeedbackReason | null;
  feedbackConsent: true;
}

export type FixedFeedbackErrorCode =
  | "INVALID_ORIGIN" | "UNSUPPORTED_MEDIA_TYPE" | "PAYLOAD_TOO_LARGE"
  | "INVALID_REQUEST" | "CONSENT_REQUIRED" | "RECEIPT_CONFLICT" | "RATE_LIMITED" | "UNAVAILABLE";

export type FixedFeedbackResponse =
  | { ok: true; receiptId: string; duplicate: boolean }
  | { ok: false; error: FixedFeedbackErrorCode };
