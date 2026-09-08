import { handleContactPost } from "@/lib/server/contactHandler";
import { getFeedbackBindings } from "@/lib/server/feedbackStorage";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  return handleContactPost(request, getFeedbackBindings());
}
