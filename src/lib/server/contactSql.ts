/** Keep these statements in one D1 batch (one transaction, on the primary). */
export const CONTACT_SQL = {
  reserveRate: `
    INSERT INTO feedback_rate_limits (bucket_key, expires_at, attempts)
    SELECT ?, ?, 1
    WHERE NOT EXISTS (SELECT 1 FROM contact_inquiries WHERE submission_id = ?)
    ON CONFLICT(bucket_key) DO UPDATE SET attempts = attempts + 1
    WHERE attempts < ?
  `,
  // changes() belongs to the immediately preceding rate reservation in this batch.
  // A replay or full bucket changes zero rows, so neither can insert a new inquiry.
  insertInquiry: `
    INSERT INTO contact_inquiries (
      submission_id, payload_hash, inquiry_type, page_path, body,
      reply_email, reply_consent, consent_version, created_at, expires_at
    )
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE changes() = 1
    ON CONFLICT(submission_id) DO NOTHING
  `,
  receipt: `SELECT payload_hash FROM contact_inquiries WHERE submission_id = ?`,
} as const;
