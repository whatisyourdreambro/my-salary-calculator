/** Public form contract only. Never add an analytics payload to this module. */
export const CONTACT_TYPES = [
  "calculation_error", "explanation", "data_correction", "business", "privacy", "other",
] as const;

export type ContactType = (typeof CONTACT_TYPES)[number];

export interface ContactRequest {
  submissionId: string;
  type: ContactType;
  pagePath: string;
  body: string;
  inquiryConsent: true;
  replyEmail?: string;
  replyConsent?: boolean;
}

export type ContactErrorCode =
  | "INVALID_ORIGIN"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "PAYLOAD_TOO_LARGE"
  | "INVALID_REQUEST"
  | "CONSENT_REQUIRED"
  | "INVALID_REPLY_EMAIL"
  | "REPLY_CONSENT_REQUIRED"
  | "RECEIPT_CONFLICT"
  | "RATE_LIMITED"
  | "UNAVAILABLE";

export type ContactResponse =
  | { ok: true; receiptId: string; duplicate: boolean }
  | { ok: false; error: ContactErrorCode };
