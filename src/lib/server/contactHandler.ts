import { CONTACT_CONTRACT_VERSION } from "@/lib/contactContract";
import { contentIssue } from "@/lib/contentModeration";
import { CONTACT_RETENTION_SECONDS, CONTACT_WINDOW_LIMIT, FEEDBACK_WINDOW_SECONDS,
  feedbackClientIp, feedbackRateKey, hasFeedbackStorage, type FeedbackBindings } from "./feedbackStorage";
import { CONTACT_RECEIPT_LOOKUP, CONTACT_SQL } from "./contactSql";
import { participationFailure as failure, participationResponse as response, readParticipationBody, validateParticipationTransport } from "./participationRequest";
import { lookupReceipt, normalizeReceiptRequest, receiptMatches, receiptPayloadHash, type NewReceiptPolicy } from "./receiptContracts";

/** A missing request version is frozen legacy contact-v1, not the current version. */
export function createContactHandler(allowNew: NewReceiptPolicy = version => version === CONTACT_CONTRACT_VERSION) {
  return async function handle(request: Request, bindings: FeedbackBindings, now = Date.now()): Promise<Response> {
    const transport = validateParticipationTransport(request, bindings);
    if (transport) return transport;
    let input: unknown;
    try { input = await readParticipationBody(request, 4096); }
    catch (error) { const large = error instanceof Error && error.message === "size"; return failure(large ? "PAYLOAD_TOO_LARGE" : "INVALID_REQUEST", large ? 413 : 400); }
    const inquiry = normalizeReceiptRequest("contact", input);
    if (typeof inquiry === "string") return failure(inquiry);
    if (!hasFeedbackStorage(bindings)) return failure("UNAVAILABLE", 503);
    const ip = feedbackClientIp(request);
    if (!ip) return failure("UNAVAILABLE", 503);
    const createdAt = Math.floor(now / 1000);
    const windowStart = Math.floor(createdAt / FEEDBACK_WINDOW_SECONDS) * FEEDBACK_WINDOW_SECONDS;
    const windowEnd = windowStart + FEEDBACK_WINDOW_SECONDS;
    try {
      const db = bindings.FEEDBACK_DB;
      const previous = await lookupReceipt(db, CONTACT_RECEIPT_LOOKUP, inquiry.submissionId);
      if (previous) return await receiptMatches("contact", previous, inquiry, createdAt)
        ? response({ ok: true, receiptId: inquiry.submissionId, duplicate: true }, 200) : failure("RECEIPT_CONFLICT", 409);
      if (!allowNew(inquiry.contractVersion)) return failure("CONTRACT_CHANGED");
      const issue = contentIssue(inquiry.body);
      if (issue) return failure(issue === "CONTENT_NOT_ALLOWED" ? issue : "INVALID_REQUEST");
      const payloadHash = await receiptPayloadHash("contact", inquiry, inquiry.contractVersion);
      const rateKey = await feedbackRateKey(bindings.FEEDBACK_RATE_LIMIT_SECRET, ip, windowStart);
      const results = await db.batch([
        db.prepare(CONTACT_SQL.reserveRate).bind(rateKey, windowEnd, inquiry.submissionId, CONTACT_WINDOW_LIMIT),
        db.prepare(CONTACT_SQL.insertInquiry).bind(inquiry.submissionId, payloadHash, inquiry.type, inquiry.pagePath, inquiry.body,
          inquiry.replyEmail, inquiry.replyConsent ? 1 : 0, inquiry.contractVersion, createdAt, createdAt + CONTACT_RETENTION_SECONDS),
        db.prepare(CONTACT_SQL.receipt).bind(inquiry.submissionId),
      ]);
      if (results.length !== 3 || results.some(result => !result.success) || results[2].results.length > 1) return failure("UNAVAILABLE", 503);
      const receipt = results[2].results[0];
      if (!receipt) {
        if (results[0].meta.changes !== 0 || results[1].meta.changes !== 0) return failure("UNAVAILABLE", 503);
        return failure("RATE_LIMITED", 429, Math.max(1, windowEnd - createdAt));
      }
      if (!await receiptMatches("contact", receipt, inquiry, createdAt)) return failure("RECEIPT_CONFLICT", 409);
      const inserted = results[1].meta.changes === 1;
      return response({ ok: true, receiptId: inquiry.submissionId, duplicate: !inserted }, inserted ? 201 : 200);
    } catch { return failure("UNAVAILABLE", 503); }
  };
}

export const handleContactPost = createContactHandler();
