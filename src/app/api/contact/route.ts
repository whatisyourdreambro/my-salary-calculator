import { handleContactPost } from "@/lib/server/contactHandler";
import { getFeedbackBindings } from "@/lib/server/feedbackBindings";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  return handleContactPost(request, getFeedbackBindings());
}
