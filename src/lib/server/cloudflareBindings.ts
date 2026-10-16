import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Request-scoped Workers bindings; never snapshot bindings or secrets at build time. */
export function cloudflareBindings(): Record<string, unknown> {
  try {
    return getCloudflareContext().env as unknown as Record<string, unknown>;
  } catch {
    // Plain next start/unit tests have no Workers request context. Callers must
    // keep unavailable services closed instead of treating process.env as a DB.
    return {};
  }
}
