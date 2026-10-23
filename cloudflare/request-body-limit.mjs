// The OpenNext edge converter buffers non-GET/HEAD bodies before App Router
// validation. Bound that read here, before handing the Request to the adapter.
// New upload endpoints or Server Actions require an explicit policy review.
export const DEFAULT_BODY_LIMIT = 64 * 1024;
const PRIVATE_API_LIMITS = new Map([
  ['/api/contact', 4096],
  ['/api/feedback', 1024],
  ['/api/participation/opinions', 2048],
  ['/api/participation/reactions', 1024],
  ['/api/participation/summary', 1024],
]);

export function requestBodyLimit(request) {
  if (request.method === 'GET' || request.method === 'HEAD') return null;
  let pathname = new URL(request.url).pathname;
  // Next/edge routing may normalize encoded separators or trailing slashes.
  // Conservatively apply the smaller limit to aliases; never dispatch an alias.
  for (let pass = 0; pass < 4; pass += 1) {
    const normalized = pathname.replaceAll('\\', '/').replace(/\/+$/, '');
    const limit = PRIVATE_API_LIMITS.get(normalized);
    if (limit) return limit;
    try {
      const decoded = decodeURIComponent(pathname);
      if (decoded === pathname) break;
      pathname = decoded;
    } catch { break; }
  }
  return DEFAULT_BODY_LIMIT;
}

function failure(error, status) {
  return Response.json({ ok: false, error }, {
    status,
    headers: {
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  });
}

export async function limitRequestBody(request) {
  const limit = requestBodyLimit(request);
  if (limit === null) return request;
  const declared = request.headers.get('content-length');
  // Do not cancel the incoming transport before returning the error response.
  // Workerd can otherwise close its upstream connection before delivering 413.
  // Stop reading here; the runtime owns cleanup when the response completes.
  if (declared !== null && !/^\d+$/.test(declared)) {
    return failure('INVALID_REQUEST', 400);
  }
  if (declared !== null && Number(declared) > limit) {
    return failure('PAYLOAD_TOO_LARGE', 413);
  }
  if (!request.body) return request;

  let reader;
  // A fixed buffer also bounds storage when a producer emits empty chunks.
  const buffer = new Uint8Array(limit);
  let bytes = 0;
  try {
    reader = request.body.getReader();
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      if (!(next.value instanceof Uint8Array)) throw new TypeError('Expected byte stream');
      if (next.value.byteLength > limit - bytes) {
        return failure('PAYLOAD_TOO_LARGE', 413);
      }
      // Own the bytes: a producer must not mutate an earlier buffer on next pull.
      buffer.set(next.value, bytes);
      bytes += next.value.byteLength;
    }
    const body = buffer.slice(0, bytes);
    const headers = new Headers(request.headers);
    headers.set('content-length', String(bytes));
    headers.delete('transfer-encoding');
    return new Request(request, {
      body, headers,
      // Preserve Cloudflare metadata as well as standard Request properties.
      ...(request.cf === undefined ? {} : { cf: request.cf }),
    });
  } catch {
    return failure('INVALID_REQUEST', 400);
  } finally {
    reader?.releaseLock();
  }
}

export function withRequestBodyLimits(worker) {
  if (!worker || typeof worker.fetch !== 'function') throw new TypeError('Expected generated Worker fetch handler');
  const descriptors = Object.getOwnPropertyDescriptors(worker);
  const fetch = worker.fetch;
  descriptors.fetch = {
    ...descriptors.fetch,
    value: async function (request, env, ctx) {
      const bounded = await limitRequestBody(request);
      return bounded instanceof Response ? bounded : fetch.call(this, bounded, env, ctx);
    },
  };
  return Object.create(Object.getPrototypeOf(worker), descriptors);
}
