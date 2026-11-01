// Worker /api/og: serves build-time PNGs only (G2/PD-02). No renderer, font or strip data is loaded,
// so an image request never inflates data or draws text. Order: colo cache -> prebuilt asset -> fallback.
import { normalizeOgParams, OG_CLIENT_CACHE_CONTROL, type OgEdgeCache } from '../src/lib/ogImageCache';
import { CURRENT_RATES_YEAR } from '../src/config/currentRates';

export interface PagesOgEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
}
export const OG_ROOT = '/_msy/og/v1';
// 20261101-2: the Worker no longer renders (G2/PD-02). The new key also retires colo copies of earlier
// runtime renders (kept 30 days by the Cache API), so a key the build does not prebuild reaches the fallback.
export const OG_VERSION = 'pages-prebuilt-20261101-2';
/** Generic card for every key the build does not prebuild, and for a missing or corrupt asset. */
export const OG_FALLBACK_CACHE_CONTROL = 'public, max-age=300, s-maxage=300';
/** X-OG-Fallback values: an unknown parameter set is expected; an asset failure also sets X-OG-Error. */
export const OG_FALLBACK_NOT_PREBUILT = 'not-prebuilt';
export const OG_FALLBACK_ASSET_ERROR = 'asset-error';
const OG_STORED_CACHE_CONTROL = 'public, max-age=2592000';
const MAX_PNG_BYTES = 2 * 1024 * 1024;
const HEADERS = { 'Content-Type': 'image/png', 'X-Robots-Tag': 'noindex, noimageindex, nofollow', 'Cache-Control': OG_CLIENT_CACHE_CONTROL };

export async function ogImageKey(params: URLSearchParams): Promise<string> {
  const bytes = new TextEncoder().encode(`${OG_VERSION}|${CURRENT_RATES_YEAR}|${normalizeOgParams(params)}`);
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  return Array.from(hash, value => value.toString(16).padStart(2, '0')).join('');
}

async function boundedBody(response: Response, max: number): Promise<Uint8Array<ArrayBuffer>> {
  const declared = Number(response.headers.get('content-length'));
  if (declared > max || !response.body) throw new Error('OG asset exceeds its bound');
  const reader = response.body.getReader();
  const parts: Uint8Array[] = [];
  let bytes = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.length;
      if (bytes > max) throw new Error('OG asset exceeds its bound');
      if (value.length) parts.push(value);
    }
  } finally { reader.releaseLock(); }
  const data = new Uint8Array(bytes);
  let offset = 0;
  for (const part of parts) { data.set(part, offset); offset += part.length; }
  return data;
}

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; CRC_TABLE[n] = c; }

function edgeCache(): OgEdgeCache | undefined {
  try { return (globalThis as typeof globalThis & { caches?: { default?: OgEdgeCache } }).caches?.default; } catch { return undefined; }
}

/** Validate trusted build/cache bytes before advertising a long-lived image. */
export function isValidPagesPng(png: Uint8Array): boolean {
  const signature = [137,80,78,71,13,10,26,10];
  if (png.length < 100 || png.length > MAX_PNG_BYTES || signature.some((v, i) => png[i] !== v)) return false;
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  let ihdr = false, palette = false, idat = false;
  for (let at = 8, count = 0; at < png.length && count < 100; count++) {
    if (at + 12 > png.length) return false;
    const length = view.getUint32(at);
    if (at + length + 12 > png.length) return false;
    const type = String.fromCharCode(...png.subarray(at + 4, at + 8));
    let crc = 0xffffffff;
    for (let i = at + 4; i < at + 8 + length; i++) crc = CRC_TABLE[(crc ^ png[i]) & 255] ^ (crc >>> 8);
    if (((crc ^ 0xffffffff) >>> 0) !== view.getUint32(at + 8 + length)) return false;
    if (type === 'IHDR') {
      if (ihdr || at !== 8 || length !== 13 || view.getUint32(at + 8) !== 1200 || view.getUint32(at + 12) !== 630 ||
          png[at + 16] !== 8 || png[at + 17] !== 3 || png[at + 18] || png[at + 19] || png[at + 20]) return false;
      ihdr = true;
    } else if (type === 'PLTE') {
      if (!ihdr || palette || idat || length !== 768) return false;
      palette = true;
    } else if (type === 'IDAT') {
      if (!palette || !length) return false;
      idat = true;
    } else if (type === 'IEND') return ihdr && palette && idat && length === 0 && at + 12 === png.length;
    else return false; // Only the reviewed generator's four PNG chunk types.
    at += length + 12;
  }
  return false;
}

/** A 200 image/png response whose bounded body passes isValidPagesPng, or null for any other response. */
async function validPng(response: Response): Promise<Uint8Array<ArrayBuffer> | null> {
  if (response.status !== 200 || response.headers.get('Content-Type')?.split(';')[0] !== 'image/png') return null;
  const body = await boundedBody(response, MAX_PNG_BYTES);
  return isValidPagesPng(body) ? body : null;
}

export async function handlePagesOg(request: Request, env: PagesOgEnv): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' } });
  const head = request.method === 'HEAD';
  const url = new URL(request.url);
  const key = await ogImageKey(normalizeOgParams(url.searchParams));
  const cache = edgeCache();
  const cacheKey = new Request(new URL(`${OG_ROOT}/images/${key}.png`, url.origin));
  try {
    const found = await cache?.match(cacheKey);
    const image = found ? await validPng(found) : null;
    if (image) return new Response(head ? null : image, { headers: { ...HEADERS, 'X-OG-Cache': 'HIT' } });
  } catch { /* Cache unavailability does not change the image. */ }
  // Only a 404 means the build made no card for this key; any other answer is an asset failure.
  let failed = false;
  try {
    const built = await env.ASSETS.fetch(new Request(cacheKey, { redirect: 'manual' }));
    if (built.status === 404) await built.body?.cancel().catch(() => {});
    else {
      const image = await validPng(built);
      if (image) {
        try { await cache?.put(cacheKey, new Response(image, { headers: { ...HEADERS, 'Cache-Control': OG_STORED_CACHE_CONTROL } })); } catch { /* Best effort only. */ }
        return new Response(head ? null : image, { headers: { ...HEADERS, 'X-OG-Cache': cache ? 'MISS' : 'UNAVAILABLE' } });
      }
      failed = true;
      await built.body?.cancel().catch(() => {});
    }
  } catch { failed = true; }
  // Never stored in the colo cache: a later build that prebuilds this key must win within 300 s.
  try {
    const fallback = await validPng(await env.ASSETS.fetch(new Request(new URL(`${OG_ROOT}/fallback.png`, url.origin), { redirect: 'manual' })));
    if (fallback) return new Response(head ? null : fallback, { headers: { ...HEADERS, 'Cache-Control': OG_FALLBACK_CACHE_CONTROL,
      'X-OG-Fallback': failed ? OG_FALLBACK_ASSET_ERROR : OG_FALLBACK_NOT_PREBUILT, ...(failed ? { 'X-OG-Error': 'OG asset unavailable' } : {}) } });
  } catch { /* Fall through to a non-cacheable error. */ }
  // A missing/corrupt fallback must not produce an empty long-lived 200 image.
  return new Response(head ? null : 'OG image unavailable', { status: 503,
    headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': HEADERS['X-Robots-Tag'] } });
}
