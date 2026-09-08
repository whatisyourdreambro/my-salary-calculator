# Private fixed feedback operations

The feedback pilot stores a fixed helpful/confusing opinion privately on exactly three pages. It has no public comments, feed, counters, text box, email, login, read endpoint or automatic replies. The receipt confirms database storage; it does not mean an operator has reviewed the opinion. Detailed private inquiries use the separate existing `/contact` form and contract.

## Runtime and migration

`POST /api/feedback` is a Next Edge route. It reuses `FEEDBACK_DB`, `FEEDBACK_RATE_LIMIT_SECRET` and the optional exact HTTPS `FEEDBACK_ALLOWED_ORIGIN` from [contact operations](contact-operations.md). No extra binding or package is required. The binding is read dynamically per request through the existing next-on-pages runtime. Plain `next dev/start` has no D1 binding and deliberately returns 503 for a valid request; it is not a local success simulator.

Apply `migrations/0002_fixed_feedback.sql` after `0001_private_contact.sql`, first to the isolated preview D1 and then to production after preview acceptance. It only creates `helpfulness_feedback` and three indexes. It does not alter existing contact or rate-limit tables/rows. Configure preview to use its own D1 and exact allowed origin. Do not expose a secret as `NEXT_PUBLIC_*`, write it to source, or copy it into logs.

## Fixed request and receipt

The shared UI/API types and labels live in `src/lib/fixedFeedbackContract.ts`. Only these five JSON fields are accepted, with a maximum actual body of 1 KiB:

```json
{
  "submissionId": "a UUID v4 generated once for the chosen payload",
  "target": "samsung_bonus",
  "vote": "helpful",
  "reason": null,
  "feedbackConsent": true
}
```

Use an actual UUID when sending. Helpful requires `reason: null`. Confusing requires one fixed reason allowed for the target. The server derives the page path; the client cannot submit a URL, query, fragment, calculation amount/result, division selection, email, free text or analytics ID. Unknown fields are rejected. Consent is recorded as `fixed-feedback-v1`.

| Target | Stored path | Allowed confusing reasons |
|---|---|---|
| `samsung_bonus` | `/calc/samsung-bonus` | `input_method`, `calculation_explanation`, `source_date`, `missing_information` |
| `civil_pay_2027` | `/civil-servant-pay-2027` | `forecast_status`, `pay_components`, `source_date`, `missing_information` |
| `samsung_company` | `/salary-db/samsung-electronics` | `salary_basis`, `estimate_vs_disclosure`, `source_date`, `missing_information` |

New confirmed storage returns 201 `{ok:true,receiptId,duplicate:false}`. The same normalized UUID and contents return 200 with `duplicate:true`, preserving the single row. The same UUID with different target/vote/reason returns 409 `RECEIPT_CONFLICT`; it never overwrites the prior opinion. Confirmation requires the UI to check 2xx, `ok === true`, the exact attempted receipt and boolean duplicate. Receipt IDs stay in the private response/UI; do not put them in URLs, GA or logs.

Errors use fixed codes only: 400 `INVALID_REQUEST`/`CONSENT_REQUIRED`, 403 `INVALID_ORIGIN`, 413 `PAYLOAD_TOO_LARGE`, 415 `UNSUPPORTED_MEDIA_TYPE`, 429 `RATE_LIMITED` with `Retry-After`, and 503 `UNAVAILABLE`. All responses are private/no-store, noindex/nofollow and nosniff. No database exception or submitted field is reflected. A network failure or 503 can happen after a committed write: keep the same UUID and exact payload for an explicit retry and do not claim it was definitely not received. There is no automatic resend or client-only queue.

## Private storage and abuse limiting

`helpfulness_feedback` stores UUID, payload hash, fixed target/path/vote/reason, consent version, private workflow status, creation/expiry time and optional resolution time. It has no raw IP, email, free text, salary or analytics identifiers. Target/path and vote/reason pairings are checked in both API and SQL.

New feedback is limited to five per fixed ten-minute Cloudflare-client-IP window across the three targets. The existing rate table is reused with an HMAC-SHA-256 key over the `feedback` scope, window and trusted `CF-Connecting-IP`. The raw IP is only an input to that short-window hash and is never saved or logged. Contact retains its original `contact` scope and five-per-window quota; exhausting either quota does not consume the other. There is no forwarded-IP fallback, fingerprint or per-user identity. Shared networks share a quota; fixed-window boundaries can allow ten submissions across two adjacent windows. Hashing is not a claim that a persistent person is uniquely identified.

Reservation, insertion and receipt lookup run as three ordered prepared statements in one D1 batch transaction. The INSERT checks SQLite `changes()` from the immediately preceding reservation. Do not split the batch or insert another statement between reservation and insertion. Replays/conflicts consume no new reservation; a failed batch rolls the reservation back. Missing DB/secret/trusted IP remains 503. Local tests are evidence for logic, not proof of a remote binding. [D1 batch transactions](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch)

Do not log requests, IDs, headers, SQL parameters or exceptions. No custom GA event is emitted by this feature. A count of stored rows represents self-selected responses; it is not unique users, all-visitor satisfaction, measured revenue impact or a conversion rate with a verified exposure denominator.

## Daily private review and retention

Use only the owner's authenticated Cloudflare D1 console. The operator reviews the private queue and runs cleanup daily, recording completion privately. The operational retention target is 90 days from receipt. `expires_at` filters expired rows out of routine review but does not delete them automatically. This implementation has no scheduler: expired rows remain until operator cleanup. Rate buckets expire at the ten-minute window end and are physically removed during the same daily cleanup. Provider backups/Time Travel have separate retention. Never export private queue results into git or public audit reports.

```sql
-- Daily cleanup for both existing inquiry and fixed-feedback scopes.
DELETE FROM feedback_rate_limits WHERE expires_at <= unixepoch();
DELETE FROM contact_inquiries WHERE expires_at <= unixepoch();
DELETE FROM helpfulness_feedback WHERE expires_at <= unixepoch();

-- Private queue only.
SELECT submission_id, target, page_path, vote, reason_code,
       consent_version, status, created_at, expires_at
FROM helpfulness_feedback
WHERE expires_at > unixepoch() AND status IN ('new', 'reviewed')
ORDER BY created_at ASC LIMIT 100;

-- Replace the placeholder with one exact receipt from the private queue.
UPDATE helpfulness_feedback SET status = 'reviewed', resolved_at = NULL
WHERE submission_id = '<receipt-id>' AND expires_at > unixepoch();
UPDATE helpfulness_feedback SET status = 'resolved', resolved_at = unixepoch()
WHERE submission_id = '<receipt-id>' AND expires_at > unixepoch();
UPDATE helpfulness_feedback SET status = 'spam', resolved_at = unixepoch()
WHERE submission_id = '<receipt-id>' AND expires_at > unixepoch();

-- Internal improvement signal only, excluding expired and spam responses.
SELECT target, vote, reason_code, COUNT(*) AS responses
FROM helpfulness_feedback
WHERE expires_at > unixepoch() AND status <> 'spam'
GROUP BY target, vote, reason_code;
```

For a deletion/correction request, the owner verifies its receipt/context privately and inspects only that row in the console. There is no unauthenticated read/delete API, and possessing a receipt does not grant public access. Fixed opinion changes should be handled by removing the confirmed old row after review; do not rewrite a vote while retaining an outdated payload hash. Delete only exact identified receipts:

```sql
SELECT submission_id, target, created_at, status
FROM helpfulness_feedback WHERE submission_id = '<receipt-id>';
DELETE FROM helpfulness_feedback WHERE submission_id = '<receipt-id>';
SELECT COUNT(*) AS remaining FROM helpfulness_feedback WHERE submission_id = '<receipt-id>';
```

Removal also removes the deduplication evidence. A later retry of a deleted/expired receipt can become a new submission; there is no long-lived tombstone table.

## Acceptance and recovery

Run the contact and feedback HTTP regressions together:

```text
npx vitest run src/lib/__tests__/contactHandler.test.ts src/lib/__tests__/fixedFeedbackHandler.test.ts
python scripts/verify-contact-storage.py
python scripts/verify-fixed-feedback-storage.py
```

The SQL checks execute the actual migration/statements in isolated SQLite. They cover unchanged contact schema/data, replay/conflict preservation, target/reason constraints, independent scopes, transaction rollback, manual cleanup and twenty concurrent new submissions with exactly five accepted.

In the configured preview, submit a synthetic fixed opinion, verify its exact receipt in D1, replay unchanged, and reuse the same ID with another valid vote/reason to check 409. Use a fresh feedback rate window for six distinct synthetic UUIDs: five should store and the sixth return 429. Confirm contact remains independently usable. Inspect the three intended pages and non-pilot controls, SPA stale responses, input edits, timeout/malformed success, mobile/keyboard layout and the absence of salary/free-text/receipt data from analytics requests. Record only synthetic evidence; resolve and remove only its exact synthetic receipts. Production migration/deployment follows preview acceptance.

On outage, keep drafts/choices locally for the page visit and describe unconfirmed receipt accurately. Do not substitute a fake success or public tracker. Rollback can remove the UI/API while retaining already received private rows for review and cleanup; do not DROP the table as a rollback shortcut.
