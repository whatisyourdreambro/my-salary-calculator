// Bounded precompressed PNG strip compositor: no font parser, JSX, CSS or WASM.
import { normalizeOgParams, OG_CLIENT_CACHE_CONTROL, type OgEdgeCache } from '../src/lib/ogImageCache';
import { CURRENT_RATES_YEAR } from '../src/config/currentRates';
import { renderStripPng, type OgStripData } from './pages-og-strips';

export interface PagesOgEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
  OG_STRIPS?: OgStripData;
}
export const OG_ROOT = '/_msy/og/v1';
export const OG_VERSION = 'pages-strips-20261017-1';
const HEADERS = { 'Content-Type': 'image/png', 'X-Robots-Tag': 'noindex, noimageindex, nofollow', 'Cache-Control': OG_CLIENT_CACHE_CONTROL };
type Kind = 'salary' | 'tool' | 'guide' | 'fun' | 'company' | 'report' | 'en' | 'default';
export interface OgContent { kind: Kind; title: string; net?: string; label?: string }

/** Same normalized branch priority/defaults as the existing Next OG handler. */
export function resolveOgContent(input: URLSearchParams): OgContent {
  const params = normalizeOgParams(input);
  const type = params.get('type');
  const title = params.get('title') || '연봉 실수령액 계산기';
  if (params.get('lang') === 'en') return { kind: 'en', title: params.get('title') || 'Korea Salary Calculator' };
  const salary = (amount: string) => {
    const net = params.get('net') || params.get('netPay');
    // Normalized nonnegative integers are <=100,000,000 manwon. Avoid loading ICU
    // on the first request just to insert the same Korean thousands separators.
    const format = (value: string) => {
      const digits = String(Math.round(Number(value) / 10000));
      const groups: string[] = [];
      for (let end = digits.length; end > 0; end -= 3) groups.unshift(digits.slice(Math.max(0, end - 3), end));
      return groups.join(',');
    };
    return { kind: 'salary' as const, title: `연봉 ${format(amount)}만원`,
      ...(net ? { net: `월 ${format(net)}만원` } : {}), label: `${CURRENT_RATES_YEAR} 연봉 리포트` };
  };
  if (type === 'salary') return salary(params.get('amount') || '50000000');
  if (type === 'tool' || type === 'company') return { kind: type, title: params.get('name') || title };
  if (type === 'guide' || type === 'fun' || type === 'report') return { kind: type, title };
  const amount = params.get('amount');
  if (amount) return salary(amount);
  const path = params.get('path') || '';
  const kind = path.startsWith('/fun') ? 'fun' : path.startsWith('/insights') ? 'report'
    : path.startsWith('/guides') ? 'guide' : path.startsWith('/salary-db') ? 'company' : 'default';
  return { kind, title };
}

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
/** Request rendering reads only already-initialized immutable ESM Data modules. */
export async function renderPagesOg(params: URLSearchParams, env: PagesOgEnv): Promise<Uint8Array<ArrayBuffer>> {
  if (!env.OG_STRIPS) throw new Error('OG strip Data modules are required');
  return renderStripPng(resolveOgContent(params), env.OG_STRIPS);
}

function edgeCache(): OgEdgeCache | undefined {
  try { return (globalThis as typeof globalThis & { caches?: { default?: OgEdgeCache } }).caches?.default; } catch { return undefined; }
}

/** Validate trusted build/cache bytes before advertising a long-lived image. */
export function isValidPagesPng(png: Uint8Array): boolean {
  const signature = [137,80,78,71,13,10,26,10];
  if (png.length < 100 || png.length > 2 * 1024 * 1024 || signature.some((v, i) => png[i] !== v)) return false;
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

export async function handlePagesOg(request: Request, env: PagesOgEnv): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' } });
  const url = new URL(request.url);
  const params = normalizeOgParams(url.searchParams);
  const key = await ogImageKey(params);
  const cache = edgeCache();
  const cacheKey = new Request(new URL(`${OG_ROOT}/images/${key}.png`, url.origin));
  try {
    const found = await cache?.match(cacheKey);
    if (found?.status === 200 && found.headers.get('Content-Type') === 'image/png') {
      const body = await boundedBody(found, 2 * 1024 * 1024);
      if (isValidPagesPng(body)) return new Response(request.method === 'HEAD' ? null : body, { headers: { ...HEADERS, 'X-OG-Cache': 'HIT' } });
    }
  } catch { /* Cache unavailability does not change the image. */ }
  try {
    const built = await env.ASSETS.fetch(new Request(cacheKey, { redirect: 'manual' }));
    let image: Uint8Array<ArrayBuffer>;
    if (built.status === 200 && built.headers.get('Content-Type')?.split(';')[0] === 'image/png') {
      image = await boundedBody(built, 2 * 1024 * 1024);
      if (!isValidPagesPng(image)) throw new Error('Corrupt OG build PNG');
    } else image = await renderPagesOg(params, env);
    if (image.length < 100 || image[0] !== 137 || image[1] !== 80) throw new Error('Invalid OG PNG');
    const response = new Response(image, { headers: { ...HEADERS, 'X-OG-Cache': cache ? 'MISS' : 'UNAVAILABLE' } });
    try { await cache?.put(cacheKey, new Response(image, { headers: { ...HEADERS, 'Cache-Control': 'public, max-age=2592000' } })); } catch { /* Best effort only. */ }
    return request.method === 'HEAD' ? new Response(null, response) : response;
  } catch {
    // A missing/corrupt build asset must not produce an empty long-lived 200 image.
    try {
      const fallback = await env.ASSETS.fetch(new Request(new URL(`${OG_ROOT}/fallback.png`, url.origin), { redirect: 'manual' }));
      if (fallback.status === 200 && fallback.headers.get('Content-Type')?.split(';')[0] === 'image/png') {
        const image = await boundedBody(fallback, 2 * 1024 * 1024);
        if (!isValidPagesPng(image)) throw new Error('Corrupt OG fallback PNG');
        return new Response(request.method === 'HEAD' ? null : image, { headers: { ...HEADERS,
          'Cache-Control': 'public, max-age=300, s-maxage=300', 'X-OG-Error': 'OG asset unavailable' } });
      }
    } catch { /* Fall through to a non-cacheable error. */ }
    return new Response(request.method === 'HEAD' ? null : 'Failed to generate the image', { status: 503,
      headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': HEADERS['X-Robots-Tag'] } });
  }
}
