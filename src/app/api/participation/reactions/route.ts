import { handleReactionPost } from "@/lib/server/reactionHandler";
export const dynamic = "force-dynamic";
export async function POST(request: Request): Promise<Response> {
  // Production Pages owns environment injection; plain Next stays closed.
  return handleReactionPost(request, {});
}
