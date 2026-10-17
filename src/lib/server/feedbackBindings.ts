import { cloudflareBindings } from "./cloudflareBindings";
import type { FeedbackBindings, FeedbackDatabase } from "./feedbackStorage";

/**
 * OpenNext exposes request-scoped Cloudflare bindings through getCloudflareContext.
 * Read dynamically inside the request; do not snapshot at module/build time.
 * A missing binding in plain next dev/start deliberately leaves the API closed.
 */
export function getFeedbackBindings(): FeedbackBindings {
  try {
    const environment = cloudflareBindings();
    return {
      FEEDBACK_DB: environment["FEEDBACK_DB"] as FeedbackDatabase | undefined,
      FEEDBACK_RATE_LIMIT_SECRET: environment["FEEDBACK_RATE_LIMIT_SECRET"] as string | undefined,
      FEEDBACK_ALLOWED_ORIGIN: environment["FEEDBACK_ALLOWED_ORIGIN"] as string | undefined,
    };
  } catch {
    return {};
  }
}
