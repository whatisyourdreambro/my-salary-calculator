import { contentIssue, CONTENT_POLICY_VERSION } from "@/lib/contentModeration";
import { OPINION_CONTRACT_VERSION } from "@/lib/participationContract";
import { feedbackClientIp, feedbackRateKey, FEEDBACK_WINDOW_SECONDS, hasFeedbackStorage } from "./feedbackStorage";
import { OPINION_RECEIPT_LOOKUP, OPINION_SQL } from "./opinionSql";
import { hasFreshParticipationCleanup, PARTICIPATION_HEALTH_MAX_AGE_SECONDS, type ParticipationBindings } from "./participationRuntime";
import { participationFailure as failure, participationResponse as response, readParticipationBody, validateParticipationTransport } from "./participationRequest";
import { lookupReceipt, normalizeReceiptRequest, receiptMatches, receiptPayloadHash, type NewReceiptPolicy } from "./receiptContracts";

export const OPINION_RETENTION_SECONDS = 90 * 86400;
export const OPINION_WINDOW_LIMIT = 3;
export const OPINION_DAILY_LIMIT = 100;

/** Server composition only; no request/binding/UI can override new-contract admission. */
export function createOpinionHandler(allowNew: NewReceiptPolicy = version => version === OPINION_CONTRACT_VERSION) {
  return async function handle(request: Request, bindings: ParticipationBindings, now = Date.now()): Promise<Response> {
    if (bindings.PARTICIPATION_OPINIONS_ENABLED !== "1" || !hasFeedbackStorage(bindings)) return failure("UNAVAILABLE", 503);
    const transport = validateParticipationTransport(request, bindings);
    if (transport) return transport;
    let input: unknown;
    try { input = await readParticipationBody(request, 2048); }
    catch (error) { const large = error instanceof Error && error.message === "size"; return failure(large ? "PAYLOAD_TOO_LARGE" : "INVALID_REQUEST", large ? 413 : 400); }
    const value = normalizeReceiptRequest("opinion", input);
    if (typeof value === "string") return failure(value);
    const ip = feedbackClientIp(request);
    if (!ip) return failure("UNAVAILABLE", 503);
    const createdAt = Math.floor(now / 1000);
    const windowStart = Math.floor(createdAt / FEEDBACK_WINDOW_SECONDS) * FEEDBACK_WINDOW_SECONDS;
    const windowEnd = windowStart + FEEDBACK_WINDOW_SECONDS;
    const dayStart = Math.floor(createdAt / 86400) * 86400;
    try {
      const db = bindings.FEEDBACK_DB;
      const previous = await lookupReceipt(db, OPINION_RECEIPT_LOOKUP, value.submissionId);
      if (previous) return await receiptMatches("opinion", previous, value, createdAt)
        ? response({ ok: true, receiptId: value.submissionId, duplicate: true }, 200) : failure("RECEIPT_CONFLICT", 409);
      if (!allowNew(value.contractVersion)) return failure("CONTRACT_CHANGED");
      const issue = contentIssue(value.body, "opinion");
      if (issue) return failure(issue === "INVALID_TEXT" ? "INVALID_REQUEST" : issue);
      if (!await hasFreshParticipationCleanup(db, createdAt)) return failure("UNAVAILABLE", 503);
      const hash = await receiptPayloadHash("opinion", value, value.contractVersion);
      const key = await feedbackRateKey(bindings.FEEDBACK_RATE_LIMIT_SECRET, ip, windowStart, "opinion");
      const result = await db.batch([
        db.prepare(OPINION_SQL.reserveRate).bind(key, windowEnd, value.submissionId, createdAt - PARTICIPATION_HEALTH_MAX_AGE_SECONDS, createdAt, dayStart, OPINION_DAILY_LIMIT, OPINION_WINDOW_LIMIT),
        db.prepare(OPINION_SQL.insertOpinion).bind(value.submissionId, hash, value.target, value.body, value.contractVersion, CONTENT_POLICY_VERSION, createdAt, createdAt + OPINION_RETENTION_SECONDS),
        db.prepare(OPINION_SQL.countAccepted).bind(dayStart),
        db.prepare(OPINION_SQL.receipt).bind(value.submissionId),
      ]);
      if (result.length !== 4 || result.some(item => !item.success) || result[3].results.length > 1) return failure("UNAVAILABLE", 503);
      const row = result[3].results[0];
      if (!row) {
        if (result.slice(0, 3).some(item => item.meta.changes !== 0)) return failure("UNAVAILABLE", 503);
        return failure("RATE_LIMITED", 429, Math.max(1, windowEnd - createdAt));
      }
      if (!await receiptMatches("opinion", row, value, createdAt)) return failure("RECEIPT_CONFLICT", 409);
      const inserted = result[1].meta.changes === 1;
      if (inserted && result[2].meta.changes !== 1) return failure("UNAVAILABLE", 503);
      return response({ ok: true, receiptId: value.submissionId, duplicate: !inserted }, inserted ? 201 : 200);
    } catch { return failure("UNAVAILABLE", 503); }
  };
}

/** No logging, analytics, outbound calls or rejected-body writes. */
export const handleOpinionPost = createOpinionHandler();
