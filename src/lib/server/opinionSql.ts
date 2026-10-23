export const OPINION_RECEIPT_LOOKUP = "SELECT payload_hash, contract_version FROM private_opinions WHERE submission_id = ?";

/** Keep this order in one primary D1 transaction; changes() chains the writes. */
export const OPINION_SQL = {
  reserveRate: `
    INSERT INTO feedback_rate_limits (bucket_key, expires_at, attempts)
    SELECT ?, ?, 1
    WHERE NOT EXISTS (SELECT 1 FROM private_opinions WHERE submission_id = ?)
      AND EXISTS (SELECT 1 FROM participation_health WHERE id = 1 AND last_cleanup_at > ? AND last_cleanup_at <= ?)
      AND COALESCE((SELECT accepted FROM participation_daily_usage WHERE module = 'opinion' AND day_start = ?), 0) < ?
    ON CONFLICT(bucket_key) DO UPDATE SET attempts = attempts + 1 WHERE attempts < ?
  `,
  insertOpinion: `
    INSERT INTO private_opinions (submission_id, payload_hash, target, body, contract_version, policy_version, created_at, expires_at)
    SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE changes() = 1
    ON CONFLICT(submission_id) DO NOTHING
  `,
  countAccepted: `
    INSERT INTO participation_daily_usage (module, day_start, accepted)
    SELECT 'opinion', ?, 1 WHERE changes() = 1
    ON CONFLICT(module, day_start) DO UPDATE SET accepted = accepted + 1
  `,
  receipt: `SELECT payload_hash, contract_version FROM private_opinions WHERE submission_id = ?`,
} as const;
