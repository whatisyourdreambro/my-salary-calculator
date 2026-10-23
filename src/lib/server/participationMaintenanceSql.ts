/** One atomic primary D1 batch: health is refreshed only after all work succeeds. */
export const PARTICIPATION_MAINTENANCE_SQL = {
  deleteContact: `DELETE FROM contact_inquiries WHERE expires_at <= ?`,
  deletePrivateFeedback: `DELETE FROM helpfulness_feedback WHERE expires_at <= ?`,
  deleteOpinions: `DELETE FROM private_opinions WHERE expires_at <= ?`,
  deleteReactions: `DELETE FROM participation_reactions WHERE expires_at <= ?`,
  deleteRate: `DELETE FROM feedback_rate_limits WHERE expires_at <= ?`,
  deleteDailyUsage: `DELETE FROM participation_daily_usage WHERE day_start < ?`,
  snapshot: `
    INSERT INTO participation_snapshots (target, contract_version, generated_at, window_days, total, helpful, confusing)
    SELECT ?, 'public-reaction-v1', ?, 28, COUNT(*),
      COALESCE(SUM(CASE WHEN vote = 'helpful' THEN 1 ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN vote = 'confusing' THEN 1 ELSE 0 END), 0)
    FROM participation_reactions
    WHERE target = ? AND contract_version = 'public-reaction-v1'
      AND created_at > ? AND created_at <= ? AND expires_at > ?
    ON CONFLICT(target) DO UPDATE SET
      contract_version = excluded.contract_version, generated_at = excluded.generated_at,
      window_days = excluded.window_days, total = excluded.total,
      helpful = excluded.helpful, confusing = excluded.confusing
  `,
  health: `
    INSERT INTO participation_health (id, last_cleanup_at) VALUES (1, ?)
    ON CONFLICT(id) DO UPDATE SET last_cleanup_at = excluded.last_cleanup_at
  `,
} as const;
