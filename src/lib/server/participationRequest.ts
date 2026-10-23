import type { OpinionError, OpinionResponse } from "@/lib/participationContract";
import type { ContactErrorCode, ContactResponse } from "@/lib/contactContract";
import type { FeedbackBindings } from "./feedbackStorage";

export function participationResponse(body: OpinionResponse | ContactResponse, status: number, retryAfter?: number): Response {
  return Response.json(body, { status, headers: {
    "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", "X-Content-Type-Options": "nosniff",
    ...(retryAfter ? { "Retry-After": String(retryAfter) } : {}),
  } });
}
export function participationFailure(error: OpinionError | ContactErrorCode, status = 400, retryAfter?: number): Response {
  return participationResponse({ ok: false, error }, status, retryAfter);
}
export function validateParticipationTransport(request: Request, bindings: FeedbackBindings): Response | null {
  const origin = bindings.FEEDBACK_ALLOWED_ORIGIN ?? "https://www.moneysalary.com";
  try { if (new URL(origin).protocol !== "https:" || new URL(origin).origin !== origin) return participationFailure("UNAVAILABLE", 503); }
  catch { return participationFailure("UNAVAILABLE", 503); }
  if (request.headers.get("origin") !== origin || new URL(request.url).origin !== origin
    || (request.headers.get("sec-fetch-site") && request.headers.get("sec-fetch-site") !== "same-origin")) return participationFailure("INVALID_ORIGIN", 403);
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get("content-type") ?? "")
    || ![null, "identity"].includes(request.headers.get("content-encoding"))) return participationFailure("UNSUPPORTED_MEDIA_TYPE", 415);
  return null;
}
export async function readParticipationBody(request: Request, maxBytes: number): Promise<unknown> {
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > maxBytes)) throw new Error("size");
  if (!request.body) throw new Error("json");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { void reader.cancel().catch(() => undefined); throw new Error("size"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}
