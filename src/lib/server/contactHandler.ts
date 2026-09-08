import { CONTACT_TYPES, type ContactErrorCode, type ContactResponse, type ContactType } from "@/lib/contactContract";
import {
  CONTACT_RETENTION_SECONDS, CONTACT_WINDOW_LIMIT, FEEDBACK_WINDOW_SECONDS,
  feedbackClientIp, feedbackPayloadHash, feedbackRateKey, hasFeedbackStorage, normalizeFeedbackPath,
  type FeedbackBindings,
} from "./feedbackStorage";
import { CONTACT_SQL } from "./contactSql";

const MAX_REQUEST_BYTES = 4096;
const CONSENT_VERSION = "contact-v1";
const MAIN_ORIGIN = "https://www.moneysalary.com";
const UUID_V4 = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;
const REQUEST_FIELDS = new Set(["submissionId", "type", "pagePath", "body", "inquiryConsent", "replyEmail", "replyConsent"]);

function response(body: ContactResponse, status: number, retryAfter?: number): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Content-Type-Options": "nosniff",
      ...(retryAfter ? { "Retry-After": String(retryAfter) } : {}),
    },
  });
}

function failure(error: ContactErrorCode, status = 400, retryAfter?: number): Response {
  return response({ ok: false, error }, status, retryAfter);
}

function allowedOrigin(bindings: FeedbackBindings): string | null {
  const value = bindings.FEEDBACK_ALLOWED_ORIGIN ?? MAIN_ORIGIN;
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.origin === value ? value : null;
  } catch { return null; }
}

async function readBody(request: Request): Promise<unknown> {
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > MAX_REQUEST_BYTES)) throw new Error("size");
  if (!request.body) throw new Error("json");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_REQUEST_BYTES) {
        void reader.cancel().catch(() => undefined);
        throw new Error("size");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}

interface NormalizedInquiry {
  submissionId: string;
  type: ContactType;
  pagePath: string;
  body: string;
  replyEmail: string | null;
  replyConsent: boolean;
}

function validate(value: unknown): NormalizedInquiry | ContactErrorCode {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "INVALID_REQUEST";
  const data = value as Record<string, unknown>;
  if (Object.keys(data).some(key => !REQUEST_FIELDS.has(key))) return "INVALID_REQUEST";
  if (data.inquiryConsent !== true) return "CONSENT_REQUIRED";
  if (typeof data.submissionId !== "string" || !UUID_V4.test(data.submissionId)) return "INVALID_REQUEST";
  if (!CONTACT_TYPES.includes(data.type as ContactType)) return "INVALID_REQUEST";
  const pagePath = normalizeFeedbackPath(data.pagePath);
  if (!pagePath || typeof data.body !== "string") return "INVALID_REQUEST";
  const body = data.body.replace(/\r\n?/g, "\n").trim();
  if (!body || body.length > 500 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]|<[^>]*>/.test(body)) return "INVALID_REQUEST";
  if (data.replyConsent !== undefined && typeof data.replyConsent !== "boolean") return "INVALID_REQUEST";
  if (data.replyEmail !== undefined && typeof data.replyEmail !== "string") return "INVALID_REPLY_EMAIL";
  const replyEmail = typeof data.replyEmail === "string" ? data.replyEmail.trim() : "";
  // Deliberately support common mailbox syntax, not quoted addresses or mail headers.
  if (replyEmail && (replyEmail.length > 254 || !/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+$/i.test(replyEmail)
    || replyEmail.split("@")[0].length > 64 || replyEmail.startsWith(".") || replyEmail.includes("..") || replyEmail.includes(".@"))) return "INVALID_REPLY_EMAIL";
  if (replyEmail && data.replyConsent !== true) return "REPLY_CONSENT_REQUIRED";
  return {
    submissionId: data.submissionId.toLowerCase(), type: data.type as ContactType, pagePath, body,
    replyEmail: replyEmail || null, replyConsent: Boolean(replyEmail),
  };
}

/** No logging or analytics: errors may contain SQL parameters and private content. */
export async function handleContactPost(request: Request, bindings: FeedbackBindings, now = Date.now()): Promise<Response> {
  const origin = allowedOrigin(bindings);
  if (!origin) return failure("UNAVAILABLE", 503);
  if (request.headers.get("origin") !== origin || new URL(request.url).origin !== origin
    || (request.headers.get("sec-fetch-site") && request.headers.get("sec-fetch-site") !== "same-origin")) return failure("INVALID_ORIGIN", 403);
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get("content-type") ?? "")
    || ![null, "identity"].includes(request.headers.get("content-encoding"))) return failure("UNSUPPORTED_MEDIA_TYPE", 415);
  let input: unknown;
  try { input = await readBody(request); } catch (error) {
    return failure(error instanceof Error && error.message === "size" ? "PAYLOAD_TOO_LARGE" : "INVALID_REQUEST", error instanceof Error && error.message === "size" ? 413 : 400);
  }
  const inquiry = validate(input);
  if (typeof inquiry === "string") return failure(inquiry);
  if (!hasFeedbackStorage(bindings)) return failure("UNAVAILABLE", 503);
  const ip = feedbackClientIp(request);
  if (!ip) return failure("UNAVAILABLE", 503);
  const createdAt = Math.floor(now / 1000);
  const windowStart = Math.floor(createdAt / FEEDBACK_WINDOW_SECONDS) * FEEDBACK_WINDOW_SECONDS;
  const windowEnd = windowStart + FEEDBACK_WINDOW_SECONDS;
  try {
    const payloadHash = await feedbackPayloadHash(JSON.stringify([
      inquiry.type, inquiry.pagePath, inquiry.body, inquiry.replyEmail, inquiry.replyConsent, CONSENT_VERSION,
    ]));
    const rateKey = await feedbackRateKey(bindings.FEEDBACK_RATE_LIMIT_SECRET, ip, windowStart);
    const db = bindings.FEEDBACK_DB;
    const results = await db.batch([
      db.prepare(CONTACT_SQL.reserveRate).bind(rateKey, windowEnd, inquiry.submissionId, CONTACT_WINDOW_LIMIT),
      db.prepare(CONTACT_SQL.insertInquiry).bind(
        inquiry.submissionId, payloadHash, inquiry.type, inquiry.pagePath, inquiry.body,
        inquiry.replyEmail, inquiry.replyConsent ? 1 : 0, CONSENT_VERSION,
        createdAt, createdAt + CONTACT_RETENTION_SECONDS,
      ),
      db.prepare(CONTACT_SQL.receipt).bind(inquiry.submissionId),
    ]);
    if (results.length !== 3 || results.some(result => !result.success)) return failure("UNAVAILABLE", 503);
    const receipt = results[2].results[0];
    if (!receipt) {
      if (results[0].meta.changes !== 0 || results[1].meta.changes !== 0) return failure("UNAVAILABLE", 503);
      return failure("RATE_LIMITED", 429, Math.max(1, windowEnd - createdAt));
    }
    if (receipt.payload_hash !== payloadHash) return failure("RECEIPT_CONFLICT", 409);
    const inserted = results[1].meta.changes === 1;
    return response({ ok: true, receiptId: inquiry.submissionId, duplicate: !inserted }, inserted ? 201 : 200);
  } catch {
    return failure("UNAVAILABLE", 503);
  }
}
