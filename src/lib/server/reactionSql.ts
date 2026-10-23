export const REACTION_RECEIPT_LOOKUP = "SELECT payload_hash, contract_version FROM participation_reactions WHERE submission_id = ?";
export const PARTICIPATION_SUMMARY_SQL = "SELECT contract_version, generated_at, window_days, total, helpful, confusing FROM participation_snapshots WHERE target = ?";

/** All four statements are one primary D1 transaction. Do not break changes(). */
export const REACTION_SQL = {
  reserveRate: `
    INSERT INTO feedback_rate_limits (bucket_key, expires_at, attempts)
    SELECT ?, ?, 1
    WHERE NOT EXISTS (SELECT 1 FROM participation_reactions WHERE submission_id = ?)
      AND EXISTS (SELECT 1 FROM participation_health WHERE id = 1 AND last_cleanup_at > ? AND last_cleanup_at <= ?)
      AND COALESCE((SELECT accepted FROM participation_daily_usage WHERE module = 'reaction' AND day_start = ?), 0) < ?
    ON CONFLICT(bucket_key) DO UPDATE SET attempts = attempts + 1 WHERE attempts < ?
  `,
  insertReaction: `
    INSERT INTO participation_reactions (submission_id, payload_hash, target, vote, reason_code, contract_version, created_at, expires_at)
    SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE changes() = 1
    ON CONFLICT(submission_id) DO NOTHING
  `,
  countAccepted: `
    INSERT INTO participation_daily_usage (module, day_start, accepted)
    SELECT 'reaction', ?, 1 WHERE changes() = 1
    ON CONFLICT(module, day_start) DO UPDATE SET accepted = accepted + 1
  `,
  receipt: `SELECT payload_hash, contract_version FROM participation_reactions WHERE submission_id = ?`,
} as const;
