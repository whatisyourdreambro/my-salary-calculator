import { handleParticipationSummaryGet } from "@/lib/server/participationSummaryHandler";
export const dynamic = "force-dynamic";
export async function GET(request: Request): Promise<Response> {
  // Production Pages owns environment injection; plain Next stays closed.
  return handleParticipationSummaryGet(request, {});
}
