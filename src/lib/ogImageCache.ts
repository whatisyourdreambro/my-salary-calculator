/** Keep this version in the key: an image design change must not reuse old renders. */
// 20260925: guide card signature no longer overlaps the subtitle (OG-08). Also the purge
// switch for the 30-day stored copies below; bump it (or purge) when an image changes.
const IMAGE_VERSION = "20260925";
const MAX_TEXT_CHARACTERS = 120;
const MAX_FONT_BYTES = 262_144;
const FONT_CACHE_BYTES = 2_097_152;
const FONT_CACHE_ENTRIES = 32;

/**
 * What browsers and the CDN see for a normal card: 1 day. The console Cache Rule C
 * respects the origin TTL, so this value is the CDN TTL as well. Keep it short: the
 * 2026-06-11 incident pinned a broken 30-day s-maxage response for a month.
 */
export const OG_CLIENT_CACHE_CONTROL = "public, max-age=86400, s-maxage=86400";
/**
 * What only the per-colo Cache API copy keeps (STAB-04). A card is a pure function of
 * IMAGE_VERSION and the normalized parameters, so a verified render may stay 30 days
 * instead of costing a 250~450ms Satori render per key per colo every day.
 */
const OG_STORED_CACHE_CONTROL = "public, max-age=2592000";
/** A real 1200x630 card is ~100KB. Blank, truncated or 0-byte bodies stay under this. */
const MIN_LONG_TTL_BYTES = 5_000;
/** Cards show 10,000-won units only, so won-level differences must not split the key (OG-09). */
const WON_UNIT = 10_000;

export type OgEdgeCache = {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
};

/** Only inputs that affect the rendered image participate in the cache key. */
export function normalizeOgParams(input: URLSearchParams): URLSearchParams {
  const output = new URLSearchParams();
  for (const key of ["title", "name", "path"] as const) {
    const raw = input.get(key)?.slice(0, 512).replace(/[\u0000-\u001f\u007f]/g, " ").trim();
    if (!raw) continue;
    const chars = Array.from(raw);
    output.set(key, chars.length > MAX_TEXT_CHARACTERS ? `${chars.slice(0, MAX_TEXT_CHARACTERS).join("")}…` : raw);
  }
  if (input.get("lang") === "en") output.set("lang", "en");
  const type = input.get("type");
  if (type && ["salary", "tool", "guide", "fun", "company", "report"].includes(type)) output.set("type", type);
  for (const key of ["amount", "net", "netPay"] as const) {
    const raw = input.get(key);
    if (!raw || raw.length > 20 || !/^\d+(?:\.\d+)?$/.test(raw)) continue;
    const value = Number(raw);
    // Rounded to 10,000 won: the card renders round(x/1e4) either way, so already
    // shared won-level URLs collapse onto one key without changing a single pixel.
    if (Number.isFinite(value) && value <= 1_000_000_000_000) output.set(key, String(Math.round(value / WON_UNIT) * WON_UNIT));
  }
  output.sort();
  return output;
}

function runtimeCache(): OgEdgeCache | undefined {
  // Cloudflare provides caches.default for deployed Pages Functions. Local Next.js
  // has no such cache; rendering must keep working there and during cache outages.
  // https://developers.cloudflare.com/workers/runtime-apis/cache/
  try { return (globalThis as typeof globalThis & { caches?: { default?: OgEdgeCache } }).caches?.default; }
  catch { return undefined; }
}

/** Cache the finished PNG before invoking fonts/Satori on repeated crawler requests. */
export async function serveCachedOgImage(
  requestUrl: string,
  render: (params: URLSearchParams) => Promise<Response>,
  cache: OgEdgeCache | undefined = runtimeCache(),
): Promise<Response> {
  const input = new URL(requestUrl);
  const params = normalizeOgParams(input.searchParams);
  const cacheUrl = new URL("/api/og", input.origin);
  cacheUrl.search = params.toString();
  cacheUrl.searchParams.set("_image_version", IMAGE_VERSION);
  // Never forward user cookies, authorization, Range or conditional headers into
  // this public image cache. Different salary/net parameters retain distinct keys.
  const key = new Request(cacheUrl.toString(), { method: "GET" });
  if (cache) {
    try {
      const found = await cache.match(key);
      if (found && isPng(found)) {
        const hit = new Response(found.body, found);
        hit.headers.set("X-OG-Cache", "HIT");
        // The stored copy may live 30 days; the outgoing card still says 1 day. The Cache API
        // adds an Age header on match (seen in the production probe), so that goes too: from
        // day 2 an Age above 86400 would make the relabelled 1-day card stale on arrival for
        // browsers and for any CDN that honours origin Age. The card is immutable per key and
        // IMAGE_VERSION, so a fresh 1-day downstream TTL is correct.
        // Anything else (a 300s fallback, an older 1d entry) passes through unchanged.
        if (hit.headers.get("Cache-Control") === OG_STORED_CACHE_CONTROL) {
          hit.headers.set("Cache-Control", OG_CLIENT_CACHE_CONTROL);
          hit.headers.delete("Age");
        }
        return hit;
      }
    } catch { /* Cache failures must not become image failures. */ }
  }
  const response = await render(params);
  response.headers.set("X-OG-Cache", cache ? "MISS" : "UNAVAILABLE");
  if (cache && isPng(response)) {
    try {
      // The route has no portable execution context. Await the write so it is not
      // cancelled when the response completes; Cache API I/O is not rendering CPU.
      // The route buffers the body, so reading a clone here costs no extra render.
      const body = await response.clone().arrayBuffer();
      const stored = new Response(body, response);
      // Only a verified card is kept 30 days: 200, image/png, the route's normal 1d
      // headers, no X-OG-Error and a body larger than a blank/truncated render. The
      // PNG fallback keeps its 300s TTL, so a font or Satori failure retries in minutes.
      const verified = !response.headers.has("X-OG-Error") &&
        response.headers.get("Cache-Control") === OG_CLIENT_CACHE_CONTROL &&
        body.byteLength > MIN_LONG_TTL_BYTES;
      if (verified) stored.headers.set("Cache-Control", OG_STORED_CACHE_CONTROL);
      await cache.put(key, stored);
    } catch { /* Quota/cache unavailability leaves a usable uncached response. */ }
  }
  // The outgoing MISS keeps the route's own header: 1 day for a card, 300s for the fallback.
  return response;
}

function isPng(response: Response): boolean {
  return response.status === 200 && response.headers.get("content-type") === "image/png";
}

/** Bounded isolate memory; query-driven titles are not a finite set of font keys. */
export class OgFontCache {
  private entries = new Map<string, ArrayBuffer>();
  private bytes = 0;

  get(key: string): ArrayBuffer | undefined {
    const value = this.entries.get(key);
    if (value) { this.entries.delete(key); this.entries.set(key, value); }
    return value;
  }

  set(key: string, value: ArrayBuffer): void {
    if (value.byteLength > MAX_FONT_BYTES) return;
    const previous = this.entries.get(key);
    if (previous) { this.bytes -= previous.byteLength; this.entries.delete(key); }
    while (this.entries.size >= FONT_CACHE_ENTRIES || this.bytes + value.byteLength > FONT_CACHE_BYTES) {
      const oldest = this.entries.keys().next().value;
      if (oldest === undefined) break;
      this.bytes -= this.entries.get(oldest)!.byteLength;
      this.entries.delete(oldest);
    }
    this.entries.set(key, value);
    this.bytes += value.byteLength;
  }
}
