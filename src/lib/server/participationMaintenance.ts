import { PARTICIPATION_TARGETS } from "../participationContract";
import type { FeedbackDatabase } from "./feedbackStorage";
import { PARTICIPATION_MAINTENANCE_SQL as SQL } from "./participationMaintenanceSql";

export interface ParticipationMaintenanceBindings {
  FEEDBACK_DB?: FeedbackDatabase;
  PARTICIPATION_MAINTENANCE_ENABLED?: string;
}

/** No private content is selected, returned or logged. Does not require an IP key. */
export async function runParticipationMaintenance(bindings: ParticipationMaintenanceBindings, now = Date.now()): Promise<{ ok: boolean }> {
  const db = bindings.FEEDBACK_DB;
  if (bindings.PARTICIPATION_MAINTENANCE_ENABLED !== "1" || typeof db?.batch !== "function" || typeof db.prepare !== "function") return { ok: false };
  const seconds = Math.floor(now / 1000);
  if (!Number.isSafeInteger(seconds) || seconds <= 0) return { ok: false };
  try {
    const statements = [
      db.prepare(SQL.deleteContact).bind(seconds),
      db.prepare(SQL.deletePrivateFeedback).bind(seconds),
      db.prepare(SQL.deleteOpinions).bind(seconds),
      db.prepare(SQL.deleteReactions).bind(seconds),
      db.prepare(SQL.deleteRate).bind(seconds),
      db.prepare(SQL.deleteDailyUsage).bind(Math.floor(seconds / 86400) * 86400 - 90 * 86400),
      ...Object.keys(PARTICIPATION_TARGETS).map(target => db.prepare(SQL.snapshot).bind(target, seconds, target, seconds - 28 * 86400, seconds, seconds)),
      db.prepare(SQL.health).bind(seconds),
    ];
    const results = await db.batch(statements);
    return { ok: results.length === statements.length && results.every(result => result.success) };
  } catch { return { ok: false }; }
}
