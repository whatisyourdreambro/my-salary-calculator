import type { ContactErrorCode } from "@/lib/contactContract";
import { feedbackPayloadHash, normalizeFeedbackPathV1, type FeedbackDatabase } from "./feedbackStorage";

/** Actual released contracts only. Never derive history from the current UI. */
export const RECEIPT_V1 = Object.freeze({
  opinion: "private-opinion-v1", reaction: "public-reaction-v1",
  contact: "contact-v1", feedback: "fixed-feedback-v1",
} as const);
export type ReceiptModule = keyof typeof RECEIPT_V1;
export type NewReceiptPolicy = (version: string) => boolean;
type Version = (typeof RECEIPT_V1)[ReceiptModule];
type ErrorCode = ContactErrorCode;
const UUID = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;
// These paths and reason codes are part of v1 hashes/validation, not UI settings.
const TARGETS_V1 = Object.freeze({
  samsung_bonus: "/calc/samsung-bonus",
  civil_pay_2027: "/civil-servant-pay-2027",
  samsung_company: "/salary-db/samsung-electronics",
} as const);
const REASONS_V1 = Object.freeze({
  samsung_bonus: Object.freeze(["input_method", "calculation_explanation", "source_date", "missing_information"]),
  civil_pay_2027: Object.freeze(["forecast_status", "pay_components", "source_date", "missing_information"]),
  samsung_company: Object.freeze(["salary_basis", "estimate_vs_disclosure", "source_date", "missing_information"]),
});
type Target = keyof typeof TARGETS_V1;
interface Base { submissionId: string; contractVersion: Version }
interface Choice extends Base { target: Target; pagePath: string; vote: "helpful" | "confusing"; reason: string | null }
interface Contact extends Base { type: string; pagePath: string; body: string; replyEmail: string | null; replyConsent: boolean }
interface Opinion extends Base { target: Target; body: string }
type Requests = { opinion: Opinion; reaction: Choice; contact: Contact; feedback: Choice };
const FIELDS = {
  opinion: ["submissionId", "contractVersion", "target", "body", "inquiryConsent"],
  reaction: ["submissionId", "contractVersion", "target", "vote", "reason", "publicAggregateConsent"],
  contact: ["submissionId", "contractVersion", "type", "pagePath", "body", "inquiryConsent", "replyEmail", "replyConsent"],
  feedback: ["submissionId", "contractVersion", "target", "vote", "reason", "feedbackConsent"],
} as const;
const CONTACT_TYPES_V1 = ["calculation_error", "explanation", "data_correction", "business", "privacy", "other"];

/** The registry recognizes v1 independently of admission of new writes. */
export function knownReceiptVersion(module: ReceiptModule, version: unknown): version is Version {
  return version === RECEIPT_V1[module];
}

/** Frozen v1 syntax/canonicalization. Mutable content policy runs only on new writes. */
export function normalizeReceiptRequest<M extends ReceiptModule>(module: M, input: unknown): Requests[M] | ErrorCode {
  if (!input || typeof input !== "object" || Array.isArray(input)) return "INVALID_REQUEST";
  const data = input as Record<string, unknown>;
  if (Object.keys(data).some(key => !(FIELDS[module] as readonly string[]).includes(key))) return "INVALID_REQUEST";
  const consent = module === "reaction" ? "publicAggregateConsent" : module === "feedback" ? "feedbackConsent" : "inquiryConsent";
  if (data[consent] !== true) return "CONSENT_REQUIRED";
  // Absence means the actual legacy v1, never whatever version becomes current.
  const version = data.contractVersion === undefined && (module === "contact" || module === "feedback")
    ? RECEIPT_V1[module] : data.contractVersion;
  if (!knownReceiptVersion(module, version) || typeof data.submissionId !== "string" || !UUID.test(data.submissionId)) return "INVALID_REQUEST";
  const base = { submissionId: data.submissionId.toLowerCase(), contractVersion: version };
  if (module === "contact") {
    if (typeof data.type !== "string" || !CONTACT_TYPES_V1.includes(data.type)) return "INVALID_REQUEST";
    const pagePath = normalizeFeedbackPathV1(data.pagePath);
    if (!pagePath || typeof data.body !== "string") return "INVALID_REQUEST";
    const body = data.body.replace(/\r\n?/g, "\n").trim();
    if (!body || body.length > 500 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]|<[^>]*>/.test(body)) return "INVALID_REQUEST";
    if (data.replyConsent !== undefined && typeof data.replyConsent !== "boolean") return "INVALID_REQUEST";
    if (data.replyEmail !== undefined && typeof data.replyEmail !== "string") return "INVALID_REPLY_EMAIL";
    const replyEmail = typeof data.replyEmail === "string" ? data.replyEmail.trim() : "";
    if (replyEmail && (replyEmail.length > 254 || !/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+$/i.test(replyEmail)
      || replyEmail.split("@")[0].length > 64 || replyEmail.startsWith(".") || replyEmail.includes("..") || replyEmail.includes(".@"))) return "INVALID_REPLY_EMAIL";
    if (replyEmail && data.replyConsent !== true) return "REPLY_CONSENT_REQUIRED";
    return { ...base, type: data.type, pagePath, body, replyEmail: replyEmail || null, replyConsent: Boolean(replyEmail) } as Requests[M];
  }
  if (typeof data.target !== "string" || !Object.hasOwn(TARGETS_V1, data.target)) return "INVALID_REQUEST";
  const target = data.target as Target;
  if (module === "opinion") {
    if (typeof data.body !== "string") return "INVALID_REQUEST";
    const body = data.body.replace(/\r\n?/g, "\n").trim();
    if (!body || body.length > 200) return "INVALID_REQUEST";
    return { ...base, target, body } as Requests[M];
  }
  if (data.vote !== "helpful" && data.vote !== "confusing") return "INVALID_REQUEST";
  if (data.vote === "helpful" ? data.reason !== null : typeof data.reason !== "string" || !REASONS_V1[target].includes(data.reason)) return "INVALID_REQUEST";
  return { ...base, target, pagePath: TARGETS_V1[target], vote: data.vote, reason: data.reason as string | null } as Requests[M];
}

export function receiptPayloadHash<M extends ReceiptModule>(module: M, value: Requests[M], version: string): Promise<string> {
  if (!knownReceiptVersion(module, version)) throw new Error("contract");
  let fields: unknown[];
  if (module === "contact") {
    const item = value as Contact;
    fields = [item.type, item.pagePath, item.body, item.replyEmail, item.replyConsent, version];
  } else if (module === "opinion") {
    const item = value as Opinion;
    fields = [item.target, item.body, true, version];
  } else {
    const item = value as Choice;
    fields = module === "reaction" ? [item.target, item.vote, item.reason, true, version]
      : [item.target, item.pagePath, item.vote, item.reason, version];
  }
  return feedbackPayloadHash(JSON.stringify(fields));
}

/** Only opaque hash/version/expiry metadata is read; never private body or email. */
export async function lookupReceipt(db: FeedbackDatabase, sql: string, submissionId: string) {
  const results = await db.batch([db.prepare(sql).bind(submissionId)]);
  if (results.length !== 1 || !results[0].success || results[0].results.length > 1) throw new Error("lookup");
  return results[0].results[0];
}

/** Same validation for the initial read and the final atomic write receipt. */
export async function receiptMatches<M extends ReceiptModule>(module: M, row: Record<string, unknown>, value: Requests[M], now: number): Promise<boolean> {
  const version = module === "contact" || module === "feedback" ? row.consent_version : row.contract_version;
  if (!knownReceiptVersion(module, version) || typeof row.payload_hash !== "string" || !/^[a-f0-9]{64}$/.test(row.payload_hash)
    || !Number.isSafeInteger(row.expires_at) || (row.expires_at as number) <= 0) throw new Error("receipt");
  if ((row.expires_at as number) <= now || value.contractVersion !== version) return false;
  return row.payload_hash === await receiptPayloadHash(module, value, version);
}
