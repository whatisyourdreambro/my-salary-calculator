import type { FeedbackBindings, FeedbackDatabase } from "./feedbackStorage";

export const PARTICIPATION_HEALTH_MAX_AGE_SECONDS = 26 * 60 * 60;
export const PARTICIPATION_HEALTH_SQL = "SELECT last_cleanup_at FROM participation_health WHERE id = 1";
export interface ParticipationBindings extends FeedbackBindings {
  /** Exact opt-in. Missing runtime, migrations or cleanup keeps the feature off. */
  PARTICIPATION_OPINIONS_ENABLED?: string;
  PARTICIPATION_REACTIONS_ENABLED?: string;
  PARTICIPATION_SUMMARY_ENABLED?: string;
}

/** Internal only. Public responses must not expose operational timestamps. */
export async function hasFreshParticipationCleanup(db: FeedbackDatabase, nowSeconds: number): Promise<boolean> {
  if (!Number.isSafeInteger(nowSeconds) || nowSeconds <= 0) return false;
  const result = await db.batch([db.prepare(PARTICIPATION_HEALTH_SQL)]);
  if (result.length !== 1 || !result[0].success) return false;
  const cleanedAt = result[0].results[0]?.last_cleanup_at;
  return typeof cleanedAt === "number" && Number.isSafeInteger(cleanedAt) && cleanedAt > 0
    && cleanedAt <= nowSeconds && nowSeconds - cleanedAt <= PARTICIPATION_HEALTH_MAX_AGE_SECONDS;
}
