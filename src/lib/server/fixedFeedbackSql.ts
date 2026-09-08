/** Keep reservation, insertion and receipt lookup in one D1 batch transaction. */
export const FIXED_FEEDBACK_SQL = {
  reserveRate: `
    INSERT INTO feedback_rate_limits (bucket_key, expires_at, attempts)
    SELECT ?, ?, 1
    WHERE NOT EXISTS (SELECT 1 FROM helpfulness_feedback WHERE submission_id = ?)
    ON CONFLICT(bucket_key) DO UPDATE SET attempts = attempts + 1
    WHERE attempts < ?
  `,
  // No statement may be inserted between this and the reservation it inspects.
  insertFeedback: `
    INSERT INTO helpfulness_feedback (
      submission_id, payload_hash, target, page_path, vote, reason_code,
      consent_version, created_at, expires_at
    )
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE changes() = 1
    ON CONFLICT(submission_id) DO NOTHING
  `,
  receipt: `SELECT payload_hash FROM helpfulness_feedback WHERE submission_id = ?`,
} as const;
