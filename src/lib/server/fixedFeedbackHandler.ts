import { FIXED_FEEDBACK_CONTRACT_VERSION } from "@/lib/fixedFeedbackContract";
import { FEEDBACK_WINDOW_SECONDS, feedbackClientIp, feedbackRateKey, hasFeedbackStorage, type FeedbackBindings } from "./feedbackStorage";
import { FIXED_FEEDBACK_RECEIPT_LOOKUP, FIXED_FEEDBACK_SQL } from "./fixedFeedbackSql";
import { participationFailure as failure, participationResponse as response, readParticipationBody, validateParticipationTransport } from "./participationRequest";
import { lookupReceipt, normalizeReceiptRequest, receiptMatches, receiptPayloadHash, type NewReceiptPolicy } from "./receiptContracts";

export const FIXED_FEEDBACK_RETENTION_SECONDS = 90 * 86400;
export const FIXED_FEEDBACK_WINDOW_LIMIT = 5;

/** Preserve the private v1 receipt; never migrate it into public participation. */
export function createFixedFeedbackHandler(allowNew: NewReceiptPolicy = version => version === FIXED_FEEDBACK_CONTRACT_VERSION) {
  return async function handle(request: Request, bindings: FeedbackBindings, now = Date.now()): Promise<Response> {
    const transport = validateParticipationTransport(request, bindings);
    if (transport) return transport;
    let input: unknown;
    try { input = await readParticipationBody(request, 1024); }
    catch (error) { const large = error instanceof Error && error.message === "size"; return failure(large ? "PAYLOAD_TOO_LARGE" : "INVALID_REQUEST", large ? 413 : 400); }
    const opinion = normalizeReceiptRequest("feedback", input);
    if (typeof opinion === "string") return failure(opinion);
    if (!hasFeedbackStorage(bindings)) return failure("UNAVAILABLE", 503);
    const ip = feedbackClientIp(request);
    if (!ip) return failure("UNAVAILABLE", 503);
    const createdAt = Math.floor(now / 1000);
    const windowStart = Math.floor(createdAt / FEEDBACK_WINDOW_SECONDS) * FEEDBACK_WINDOW_SECONDS;
    const windowEnd = windowStart + FEEDBACK_WINDOW_SECONDS;
    try {
      const db = bindings.FEEDBACK_DB;
      const previous = await lookupReceipt(db, FIXED_FEEDBACK_RECEIPT_LOOKUP, opinion.submissionId);
      if (previous) return await receiptMatches("feedback", previous, opinion, createdAt)
        ? response({ ok: true, receiptId: opinion.submissionId, duplicate: true }, 200) : failure("RECEIPT_CONFLICT", 409);
      if (!allowNew(opinion.contractVersion)) return failure("CONTRACT_CHANGED");
      const payloadHash = await receiptPayloadHash("feedback", opinion, opinion.contractVersion);
      const rateKey = await feedbackRateKey(bindings.FEEDBACK_RATE_LIMIT_SECRET, ip, windowStart, "feedback");
      const results = await db.batch([
        db.prepare(FIXED_FEEDBACK_SQL.reserveRate).bind(rateKey, windowEnd, opinion.submissionId, FIXED_FEEDBACK_WINDOW_LIMIT),
        db.prepare(FIXED_FEEDBACK_SQL.insertFeedback).bind(opinion.submissionId, payloadHash, opinion.target, opinion.pagePath,
          opinion.vote, opinion.reason, opinion.contractVersion, createdAt, createdAt + FIXED_FEEDBACK_RETENTION_SECONDS),
        db.prepare(FIXED_FEEDBACK_SQL.receipt).bind(opinion.submissionId),
      ]);
      if (results.length !== 3 || results.some(result => !result.success) || results[2].results.length > 1) return failure("UNAVAILABLE", 503);
      const receipt = results[2].results[0];
      if (!receipt) {
        if (results[0].meta.changes !== 0 || results[1].meta.changes !== 0) return failure("UNAVAILABLE", 503);
        return failure("RATE_LIMITED", 429, Math.max(1, windowEnd - createdAt));
      }
      if (!await receiptMatches("feedback", receipt, opinion, createdAt)) return failure("RECEIPT_CONFLICT", 409);
      const inserted = results[1].meta.changes === 1;
      return response({ ok: true, receiptId: opinion.submissionId, duplicate: !inserted }, inserted ? 201 : 200);
    } catch { return failure("UNAVAILABLE", 503); }
  };
}

export const handleFixedFeedbackPost = createFixedFeedbackHandler();
