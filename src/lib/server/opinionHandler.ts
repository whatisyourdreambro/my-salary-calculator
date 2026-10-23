import { contentIssue, CONTENT_POLICY_VERSION } from "@/lib/contentModeration";
import { OPINION_CONTRACT_VERSION, PARTICIPATION_TARGETS, type OpinionError, type OpinionRequest } from "@/lib/participationContract";
import { feedbackClientIp, feedbackPayloadHash, feedbackRateKey, FEEDBACK_WINDOW_SECONDS, hasFeedbackStorage, type FeedbackDatabase } from "./feedbackStorage";
import { OPINION_RECEIPT_LOOKUP, OPINION_SQL } from "./opinionSql";
import { hasFreshParticipationCleanup, PARTICIPATION_HEALTH_MAX_AGE_SECONDS, type ParticipationBindings } from "./participationRuntime";
import { participationFailure as failure, participationResponse as response, readParticipationBody, validateParticipationTransport } from "./participationRequest";

export const OPINION_RETENTION_SECONDS = 90 * 86400;
export const OPINION_WINDOW_LIMIT = 3;
export const OPINION_DAILY_LIMIT = 100;
const MAX_BYTES = 2048;
const UUID = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;
const FIELDS = new Set(["submissionId", "contractVersion", "target", "body", "inquiryConsent"]);

function validate(value: unknown): OpinionRequest | OpinionError {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "INVALID_REQUEST";
  const data = value as Record<string, unknown>;
  if (Object.keys(data).some(key => !FIELDS.has(key))) return "INVALID_REQUEST";
  if (data.inquiryConsent !== true) return "CONSENT_REQUIRED";
  if (typeof data.submissionId !== "string" || !UUID.test(data.submissionId) || data.contractVersion !== OPINION_CONTRACT_VERSION
    || typeof data.target !== "string" || !Object.hasOwn(PARTICIPATION_TARGETS, data.target) || typeof data.body !== "string") return "INVALID_REQUEST";
  const body = data.body.replace(/\r\n?/g, "\n").trim();
  if (!body || body.length > 200) return "INVALID_REQUEST";
  return { submissionId: data.submissionId.toLowerCase(), contractVersion: OPINION_CONTRACT_VERSION,
    target: data.target as OpinionRequest["target"], body, inquiryConsent: true };
}

function payloadHash(value: OpinionRequest, version: string): Promise<string> {
  // Stable accepted-request contract; never include the mutable filter version.
  return feedbackPayloadHash(JSON.stringify([value.target, value.body, true, version]));
}
async function replay(db: FeedbackDatabase, value: OpinionRequest): Promise<Response | null> {
  const result = await db.batch([db.prepare(OPINION_RECEIPT_LOOKUP).bind(value.submissionId)]);
  if (result.length !== 1 || !result[0].success) throw new Error("lookup");
  const row = result[0].results[0];
  if (!row) return null;
  if (row.contract_version !== OPINION_CONTRACT_VERSION || typeof row.payload_hash !== "string") throw new Error("contract");
  return row.payload_hash === await payloadHash(value, row.contract_version)
    ? response({ ok: true, receiptId: value.submissionId, duplicate: true }, 200) : failure("RECEIPT_CONFLICT", 409);
}

/** No logging, analytics, outbound calls, public reads, or rejected-body writes. */
export async function handleOpinionPost(request: Request, bindings: ParticipationBindings, now = Date.now()): Promise<Response> {
  if (bindings.PARTICIPATION_OPINIONS_ENABLED !== "1" || !hasFeedbackStorage(bindings)) return failure("UNAVAILABLE", 503);
  const transport = validateParticipationTransport(request, bindings);
  if (transport) return transport;
  let input: unknown;
  try { input = await readParticipationBody(request, MAX_BYTES); }
  catch (error) { return failure(error instanceof Error && error.message === "size" ? "PAYLOAD_TOO_LARGE" : "INVALID_REQUEST", error instanceof Error && error.message === "size" ? 413 : 400); }
  const value = validate(input);
  if (typeof value === "string") return failure(value);
  const ip = feedbackClientIp(request);
  if (!ip) return failure("UNAVAILABLE", 503);
  const createdAt = Math.floor(now / 1000);
  const windowStart = Math.floor(createdAt / FEEDBACK_WINDOW_SECONDS) * FEEDBACK_WINDOW_SECONDS;
  const windowEnd = windowStart + FEEDBACK_WINDOW_SECONDS;
  const dayStart = Math.floor(createdAt / 86400) * 86400;
  try {
    const db = bindings.FEEDBACK_DB;
    const existing = await replay(db, value);
    if (existing) return existing;
    const issue = contentIssue(value.body, "opinion");
    if (issue) return failure(issue === "INVALID_TEXT" ? "INVALID_REQUEST" : issue);
    if (!await hasFreshParticipationCleanup(db, createdAt)) return failure("UNAVAILABLE", 503);
    const hash = await payloadHash(value, value.contractVersion);
    const key = await feedbackRateKey(bindings.FEEDBACK_RATE_LIMIT_SECRET, ip, windowStart, "opinion");
    const result = await db.batch([
      db.prepare(OPINION_SQL.reserveRate).bind(key, windowEnd, value.submissionId, createdAt - PARTICIPATION_HEALTH_MAX_AGE_SECONDS, createdAt, dayStart, OPINION_DAILY_LIMIT, OPINION_WINDOW_LIMIT),
      db.prepare(OPINION_SQL.insertOpinion).bind(value.submissionId, hash, value.target, value.body, value.contractVersion, CONTENT_POLICY_VERSION, createdAt, createdAt + OPINION_RETENTION_SECONDS),
      db.prepare(OPINION_SQL.countAccepted).bind(dayStart),
      db.prepare(OPINION_SQL.receipt).bind(value.submissionId),
    ]);
    if (result.length !== 4 || result.some(item => !item.success)) return failure("UNAVAILABLE", 503);
    const row = result[3].results[0];
    if (!row) {
      if (result.slice(0, 3).some(item => item.meta.changes !== 0)) return failure("UNAVAILABLE", 503);
      return failure("RATE_LIMITED", 429, Math.max(1, windowEnd - createdAt));
    }
    if (row.payload_hash !== hash || row.contract_version !== value.contractVersion) return await replay(db, value) ?? failure("UNAVAILABLE", 503);
    const inserted = result[1].meta.changes === 1;
    if (inserted && result[2].meta.changes !== 1) return failure("UNAVAILABLE", 503);
    return response({ ok: true, receiptId: value.submissionId, duplicate: !inserted }, inserted ? 201 : 200);
  } catch { return failure("UNAVAILABLE", 503); }
}
