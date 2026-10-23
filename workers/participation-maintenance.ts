import { runParticipationMaintenance, type ParticipationMaintenanceBindings } from "../src/lib/server/participationMaintenance";

/** Separate scheduled worker; it exposes no public maintenance or data endpoint. */
const participationMaintenanceWorker = {
  fetch(): Response { return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } }); },
  async scheduled(_controller: unknown, env: ParticipationMaintenanceBindings): Promise<void> {
    if (env.PARTICIPATION_MAINTENANCE_ENABLED !== "1") return;
    const result = await runParticipationMaintenance(env);
    // Sanitized fixed error makes failure observable without SQL parameters/data.
    if (!result.ok) throw new Error("Participation maintenance unavailable");
  },
};
export default participationMaintenanceWorker;
