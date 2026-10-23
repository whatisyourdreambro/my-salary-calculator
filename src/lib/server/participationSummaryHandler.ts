import { PARTICIPATION_TARGETS, REACTION_CONTRACT_VERSION, type ParticipationSummary } from "@/lib/participationContract";
import { hasFreshParticipationCleanup, PARTICIPATION_HEALTH_MAX_AGE_SECONDS, type ParticipationBindings } from "./participationRuntime";
import { PARTICIPATION_SUMMARY_SQL } from "./reactionSql";

function response(body: ParticipationSummary, status = 200): Response {
  return Response.json(body, { status, headers: {
    // No CDN stale response after a kill switch or a cleanup failure. The UI may
    // refresh every 300s; requests themselves always check current runtime state.
    "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "X-Content-Type-Options": "nosniff",
  } });
}
const unavailable = () => response({ ok: false, error: "UNAVAILABLE" }, 503);

export async function handleParticipationSummaryGet(request: Request, bindings: ParticipationBindings, now = Date.now()): Promise<Response> {
  if (bindings.PARTICIPATION_SUMMARY_ENABLED !== "1" || !bindings.FEEDBACK_DB) return unavailable();
  const params = new URL(request.url).searchParams;
  const target = params.get("target");
  if ([...params.keys()].some(key => key !== "target") || params.getAll("target").length !== 1 || !target || !Object.hasOwn(PARTICIPATION_TARGETS, target)) return response({ ok: false, error: "INVALID_REQUEST" }, 400);
  const seconds = Math.floor(now / 1000);
  try {
    const db = bindings.FEEDBACK_DB;
    if (!await hasFreshParticipationCleanup(db, seconds)) return unavailable();
    const result = await db.batch([db.prepare(PARTICIPATION_SUMMARY_SQL).bind(target)]);
    if (result.length !== 1 || !result[0].success || result[0].results.length > 1) return unavailable();
    const row = result[0].results[0];
    if (!row) return response({ ok: true, visible: false });
    const { generated_at: generatedAt, total, helpful, confusing } = row;
    if (row.contract_version !== REACTION_CONTRACT_VERSION || row.window_days !== 28
      || typeof generatedAt !== "number" || !Number.isSafeInteger(generatedAt) || generatedAt <= 0 || generatedAt > seconds
      || typeof total !== "number" || !Number.isSafeInteger(total) || total < 0
      || typeof helpful !== "number" || !Number.isSafeInteger(helpful) || helpful < 0
      || typeof confusing !== "number" || !Number.isSafeInteger(confusing) || confusing < 0
      || total !== helpful + confusing) return unavailable();
    if (seconds - generatedAt >= PARTICIPATION_HEALTH_MAX_AGE_SECONDS || total < 10) return response({ ok: true, visible: false });
    return response({ ok: true, visible: true, total, helpful, confusing, windowDays: 28, generatedAt });
  } catch { return unavailable(); }
}
