/** Keep this version in the key: an image design change must not reuse old renders. */
const IMAGE_VERSION = "20260919-1";
const MAX_TEXT_CHARACTERS = 120;
const MAX_FONT_BYTES = 262_144;
const FONT_CACHE_BYTES = 2_097_152;
const FONT_CACHE_ENTRIES = 32;

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
    if (Number.isFinite(value) && value <= 1_000_000_000_000) output.set(key, String(value));
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
      if (found?.status === 200 && found.headers.get("content-type") === "image/png") {
        const hit = new Response(found.body, found);
        hit.headers.set("X-OG-Cache", "HIT");
        return hit;
      }
    } catch { /* Cache failures must not become image failures. */ }
  }
  const response = await render(params);
  response.headers.set("X-OG-Cache", cache ? "MISS" : "UNAVAILABLE");
  if (cache && response.status === 200 && response.headers.get("content-type") === "image/png") {
    try {
      // The route has no portable execution context. Await the write so it is not
      // cancelled when the response completes; Cache API I/O is not rendering CPU.
      // PNG fallback keeps its existing 300s TTL; normal images keep their 1d TTL.
      await cache.put(key, response.clone());
    } catch { /* Quota/cache unavailability leaves a usable uncached response. */ }
  }
  return response;
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
