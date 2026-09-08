import {
  FIXED_FEEDBACK_CONFIG, FIXED_FEEDBACK_TARGETS,
  type FixedFeedbackErrorCode, type FixedFeedbackReason, type FixedFeedbackResponse,
  type FixedFeedbackTarget, type FixedFeedbackVote,
} from "@/lib/fixedFeedbackContract";
import {
  FEEDBACK_WINDOW_SECONDS, feedbackClientIp, feedbackPayloadHash, feedbackRateKey,
  hasFeedbackStorage, type FeedbackBindings,
} from "./feedbackStorage";
import { FIXED_FEEDBACK_SQL } from "./fixedFeedbackSql";

export const FIXED_FEEDBACK_RETENTION_SECONDS = 90 * 24 * 60 * 60;
export const FIXED_FEEDBACK_WINDOW_LIMIT = 5;
const MAX_REQUEST_BYTES = 1024;
const CONSENT_VERSION = "fixed-feedback-v1";
const MAIN_ORIGIN = "https://www.moneysalary.com";
const UUID_V4 = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;
const REQUEST_FIELDS = new Set(["submissionId", "target", "vote", "reason", "feedbackConsent"]);

function response(body: FixedFeedbackResponse, status: number, retryAfter?: number): Response {
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

function failure(error: FixedFeedbackErrorCode, status = 400, retryAfter?: number): Response {
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

interface NormalizedFeedback {
  submissionId: string;
  target: FixedFeedbackTarget;
  pagePath: string;
  vote: FixedFeedbackVote;
  reason: FixedFeedbackReason | null;
}

function validate(value: unknown): NormalizedFeedback | FixedFeedbackErrorCode {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "INVALID_REQUEST";
  const data = value as Record<string, unknown>;
  if (Object.keys(data).some(key => !REQUEST_FIELDS.has(key))) return "INVALID_REQUEST";
  if (data.feedbackConsent !== true) return "CONSENT_REQUIRED";
  if (typeof data.submissionId !== "string" || !UUID_V4.test(data.submissionId)) return "INVALID_REQUEST";
  if (!FIXED_FEEDBACK_TARGETS.includes(data.target as FixedFeedbackTarget)) return "INVALID_REQUEST";
  const target = data.target as FixedFeedbackTarget;
  const config = FIXED_FEEDBACK_CONFIG[target];
  if (data.vote !== "helpful" && data.vote !== "confusing") return "INVALID_REQUEST";
  if (data.vote === "helpful" ? data.reason !== null : !config.reasons.some(reason => reason.value === data.reason)) return "INVALID_REQUEST";
  return {
    submissionId: data.submissionId.toLowerCase(), target, pagePath: config.path,
    vote: data.vote, reason: data.reason as FixedFeedbackReason | null,
  };
}

/** No logs/analytics: only a fixed opinion enters D1; raw IP never leaves its HMAC. */
export async function handleFixedFeedbackPost(request: Request, bindings: FeedbackBindings, now = Date.now()): Promise<Response> {
  const origin = allowedOrigin(bindings);
  if (!origin) return failure("UNAVAILABLE", 503);
  if (request.headers.get("origin") !== origin || new URL(request.url).origin !== origin
    || (request.headers.get("sec-fetch-site") && request.headers.get("sec-fetch-site") !== "same-origin")) return failure("INVALID_ORIGIN", 403);
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get("content-type") ?? "")
    || ![null, "identity"].includes(request.headers.get("content-encoding"))) return failure("UNSUPPORTED_MEDIA_TYPE", 415);
  let input: unknown;
  try { input = await readBody(request); } catch (error) {
    const oversized = error instanceof Error && error.message === "size";
    return failure(oversized ? "PAYLOAD_TOO_LARGE" : "INVALID_REQUEST", oversized ? 413 : 400);
  }
  const opinion = validate(input);
  if (typeof opinion === "string") return failure(opinion);
  if (!hasFeedbackStorage(bindings)) return failure("UNAVAILABLE", 503);
  const ip = feedbackClientIp(request);
  if (!ip) return failure("UNAVAILABLE", 503);
  const createdAt = Math.floor(now / 1000);
  const windowStart = Math.floor(createdAt / FEEDBACK_WINDOW_SECONDS) * FEEDBACK_WINDOW_SECONDS;
  const windowEnd = windowStart + FEEDBACK_WINDOW_SECONDS;
  try {
    const payloadHash = await feedbackPayloadHash(JSON.stringify([
      opinion.target, opinion.pagePath, opinion.vote, opinion.reason, CONSENT_VERSION,
    ]));
    const rateKey = await feedbackRateKey(bindings.FEEDBACK_RATE_LIMIT_SECRET, ip, windowStart, "feedback");
    const db = bindings.FEEDBACK_DB;
    const results = await db.batch([
      db.prepare(FIXED_FEEDBACK_SQL.reserveRate).bind(rateKey, windowEnd, opinion.submissionId, FIXED_FEEDBACK_WINDOW_LIMIT),
      db.prepare(FIXED_FEEDBACK_SQL.insertFeedback).bind(
        opinion.submissionId, payloadHash, opinion.target, opinion.pagePath, opinion.vote, opinion.reason,
        CONSENT_VERSION, createdAt, createdAt + FIXED_FEEDBACK_RETENTION_SECONDS,
      ),
      db.prepare(FIXED_FEEDBACK_SQL.receipt).bind(opinion.submissionId),
    ]);
    if (results.length !== 3 || results.some(result => !result.success)) return failure("UNAVAILABLE", 503);
    const receipt = results[2].results[0];
    if (!receipt) {
      if (results[0].meta.changes !== 0 || results[1].meta.changes !== 0) return failure("UNAVAILABLE", 503);
      return failure("RATE_LIMITED", 429, Math.max(1, windowEnd - createdAt));
    }
    if (receipt.payload_hash !== payloadHash) return failure("RECEIPT_CONFLICT", 409);
    const inserted = results[1].meta.changes === 1;
    return response({ ok: true, receiptId: opinion.submissionId, duplicate: !inserted }, inserted ? 201 : 200);
  } catch {
    return failure("UNAVAILABLE", 503);
  }
}
