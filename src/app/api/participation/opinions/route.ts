import { handleOpinionPost } from "@/lib/server/opinionHandler";

export const dynamic = "force-dynamic";
export async function POST(request: Request): Promise<Response> {
  // Production Pages injects env in cloudflare/pages-dynamic.ts. Plain Next has
  // no trusted database context and must not infer a binding from process.env.
  return handleOpinionPost(request, {});
}
