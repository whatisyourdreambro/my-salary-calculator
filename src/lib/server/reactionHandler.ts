import { FIXED_FEEDBACK_CONFIG } from "@/lib/fixedFeedbackContract";
import { PARTICIPATION_TARGETS, REACTION_CONTRACT_VERSION, type OpinionError, type ReactionRequest } from "@/lib/participationContract";
import { feedbackClientIp, feedbackPayloadHash, feedbackRateKey, FEEDBACK_WINDOW_SECONDS, hasFeedbackStorage, type FeedbackDatabase } from "./feedbackStorage";
import { hasFreshParticipationCleanup, PARTICIPATION_HEALTH_MAX_AGE_SECONDS, type ParticipationBindings } from "./participationRuntime";
import { participationFailure as failure, participationResponse as response, readParticipationBody, validateParticipationTransport } from "./participationRequest";
import { REACTION_RECEIPT_LOOKUP, REACTION_SQL } from "./reactionSql";

export const REACTION_RETENTION_SECONDS = 90 * 86400;
export const REACTION_WINDOW_LIMIT = 5;
export const REACTION_DAILY_LIMIT = 1000;
const UUID = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;
const FIELDS = new Set(["submissionId", "contractVersion", "target", "vote", "reason", "publicAggregateConsent"]);

function validate(value: unknown): ReactionRequest | OpinionError {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "INVALID_REQUEST";
  const data = value as Record<string, unknown>;
  if (Object.keys(data).some(key => !FIELDS.has(key))) return "INVALID_REQUEST";
  if (data.publicAggregateConsent !== true) return "CONSENT_REQUIRED";
  if (typeof data.submissionId !== "string" || !UUID.test(data.submissionId) || data.contractVersion !== REACTION_CONTRACT_VERSION
    || typeof data.target !== "string" || !Object.hasOwn(PARTICIPATION_TARGETS, data.target)
    || (data.vote !== "helpful" && data.vote !== "confusing")) return "INVALID_REQUEST";
  const target = data.target as ReactionRequest["target"];
  if (data.vote === "helpful" ? data.reason !== null : !FIXED_FEEDBACK_CONFIG[target].reasons.some(reason => reason.value === data.reason)) return "INVALID_REQUEST";
  return { submissionId: data.submissionId.toLowerCase(), contractVersion: REACTION_CONTRACT_VERSION, target,
    vote: data.vote, reason: data.reason as ReactionRequest["reason"], publicAggregateConsent: true };
}
function hash(value: ReactionRequest, version: string): Promise<string> {
  return feedbackPayloadHash(JSON.stringify([value.target, value.vote, value.reason, true, version]));
}
async function replay(db: FeedbackDatabase, value: ReactionRequest): Promise<Response | null> {
  const result = await db.batch([db.prepare(REACTION_RECEIPT_LOOKUP).bind(value.submissionId)]);
  if (result.length !== 1 || !result[0].success) throw new Error("lookup");
  const row = result[0].results[0];
  if (!row) return null;
  if (row.contract_version !== REACTION_CONTRACT_VERSION || typeof row.payload_hash !== "string") throw new Error("contract");
  return row.payload_hash === await hash(value, row.contract_version)
    ? response({ ok: true, receiptId: value.submissionId, duplicate: true }, 200) : failure("RECEIPT_CONFLICT", 409);
}

/** Fixed enumerations only. No body, email, private-feedback migration or public raw data. */
export async function handleReactionPost(request: Request, bindings: ParticipationBindings, now = Date.now()): Promise<Response> {
  if (bindings.PARTICIPATION_REACTIONS_ENABLED !== "1" || !hasFeedbackStorage(bindings)) return failure("UNAVAILABLE", 503);
  const transport = validateParticipationTransport(request, bindings);
  if (transport) return transport;
  let input: unknown;
  try { input = await readParticipationBody(request, 1024); }
  catch (error) { const large = error instanceof Error && error.message === "size"; return failure(large ? "PAYLOAD_TOO_LARGE" : "INVALID_REQUEST", large ? 413 : 400); }
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
    if (!await hasFreshParticipationCleanup(db, createdAt)) return failure("UNAVAILABLE", 503);
    const payloadHash = await hash(value, value.contractVersion);
    const key = await feedbackRateKey(bindings.FEEDBACK_RATE_LIMIT_SECRET, ip, windowStart, "reaction");
    const result = await db.batch([
      db.prepare(REACTION_SQL.reserveRate).bind(key, windowEnd, value.submissionId, createdAt - PARTICIPATION_HEALTH_MAX_AGE_SECONDS, createdAt, dayStart, REACTION_DAILY_LIMIT, REACTION_WINDOW_LIMIT),
      db.prepare(REACTION_SQL.insertReaction).bind(value.submissionId, payloadHash, value.target, value.vote, value.reason, value.contractVersion, createdAt, createdAt + REACTION_RETENTION_SECONDS),
      db.prepare(REACTION_SQL.countAccepted).bind(dayStart),
      db.prepare(REACTION_SQL.receipt).bind(value.submissionId),
    ]);
    if (result.length !== 4 || result.some(item => !item.success)) return failure("UNAVAILABLE", 503);
    const row = result[3].results[0];
    if (!row) {
      if (result.slice(0, 3).some(item => item.meta.changes !== 0)) return failure("UNAVAILABLE", 503);
      return failure("RATE_LIMITED", 429, Math.max(1, windowEnd - createdAt));
    }
    if (row.payload_hash !== payloadHash || row.contract_version !== value.contractVersion) return await replay(db, value) ?? failure("UNAVAILABLE", 503);
    const inserted = result[1].meta.changes === 1;
    if (inserted && result[2].meta.changes !== 1) return failure("UNAVAILABLE", 503);
    return response({ ok: true, receiptId: value.submissionId, duplicate: !inserted }, inserted ? 201 : 200);
  } catch { return failure("UNAVAILABLE", 503); }
}
