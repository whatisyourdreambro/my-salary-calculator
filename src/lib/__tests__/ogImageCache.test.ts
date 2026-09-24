import { describe, expect, it, vi } from "vitest";
import { normalizeOgParams, OG_CLIENT_CACHE_CONTROL, OgFontCache, serveCachedOgImage, type OgEdgeCache } from "@/lib/ogImageCache";
import { OG_URL_VERSION, salaryOgImagePath } from "@/lib/ogUrlVersion";

const image = (ttl = 86400) => new Response(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), {
  headers: { "Content-Type": "image/png", "Cache-Control": `public, max-age=${ttl}, s-maxage=${ttl}`, "X-Robots-Tag": "noindex, noimageindex, nofollow" },
});
function memoryCache() {
  const entries = new Map<string, Response>();
  const cache: OgEdgeCache = {
    match: vi.fn(async (request) => entries.get(request.url)?.clone()),
    put: vi.fn(async (request, response) => { entries.set(request.url, response.clone()); }),
  };
  return { cache, entries };
}

describe("OG render cache", () => {
  it("serves an identical image without rendering again, irrespective of query order/tracking noise", async () => {
    const { cache, entries } = memoryCache();
    const render = vi.fn(async () => image());
    const first = await serveCachedOgImage("https://www.moneysalary.com/api/og?type=salary&amount=50000000&utm_source=naver", render, cache);
    const second = await serveCachedOgImage("https://www.moneysalary.com/api/og?amount=50000000&type=salary&random=123", render, cache);
    expect(render).toHaveBeenCalledTimes(1);
    expect(entries.size).toBe(1);
    expect(first.headers.get("X-OG-Cache")).toBe("MISS");
    expect(second.headers.get("X-OG-Cache")).toBe("HIT");
    expect(new Uint8Array(await first.arrayBuffer())).toEqual(new Uint8Array(await second.arrayBuffer()));
    expect(second.headers.get("X-Robots-Tag")).toContain("noindex");
  });

  it("isolates salary amounts, net income, language, titles and origin", async () => {
    const { cache, entries } = memoryCache();
    const render = vi.fn(async () => image());
    for (const suffix of ["amount=50000000", "amount=60000000", "amount=50000000&net=3000000", "lang=en", "title=첫제목", "title=다른제목"]) {
      await serveCachedOgImage(`https://www.moneysalary.com/api/og?${suffix}`, render, cache);
    }
    await serveCachedOgImage("https://preview.pages.dev/api/og?amount=50000000", render, cache);
    expect(render).toHaveBeenCalledTimes(7);
    expect(entries.size).toBe(7);
  });

  it("degrades to a usable image when cache reads or writes fail", async () => {
    const cache = { match: vi.fn(async () => { throw new Error("unavailable"); }), put: vi.fn(async () => { throw new Error("quota"); }) };
    const response = await serveCachedOgImage("https://www.moneysalary.com/api/og", async () => image(), cache);
    expect(response.status).toBe(200);
    expect((await response.arrayBuffer()).byteLength).toBe(8);
    expect(cache.put).toHaveBeenCalledOnce();
  });

  it("retains the short fallback TTL and never caches actual errors", async () => {
    const { cache, entries } = memoryCache();
    const fallback = await serveCachedOgImage("https://www.moneysalary.com/api/og?title=fallback", async () => image(300), cache);
    expect(fallback.headers.get("Cache-Control")).toContain("max-age=300");
    await serveCachedOgImage("https://www.moneysalary.com/api/og?title=error", async () => new Response("Failed", { status: 500, headers: { "Cache-Control": "no-store" } }), cache);
    expect(entries.size).toBe(1);
    expect(cache.put).toHaveBeenCalledOnce();
  });

  it("ignores a cached error or non-image response and regenerates", async () => {
    const cache = { match: vi.fn(async () => new Response("upstream html", { status: 200, headers: { "Content-Type": "text/html" } })), put: vi.fn(async () => {}) };
    const render = vi.fn(async () => image());
    expect((await serveCachedOgImage("https://www.moneysalary.com/api/og", render, cache)).headers.get("Content-Type")).toBe("image/png");
    expect(render).toHaveBeenCalledOnce();
  });

  it("works in local Next.js without the Cloudflare cache global", async () => {
    const result = await serveCachedOgImage("https://localhost/api/og?type=tool&name=계산기", async () => image());
    expect(result.status).toBe(200);
    expect(result.headers.get("X-OG-Cache")).toBe("UNAVAILABLE");
  });
});

// STAB-04 (2026-09-25): a verified card stays 30 days in the per-colo Cache API only.
const CLIENT_TTL = "public, max-age=86400, s-maxage=86400";
const STORED_TTL = "public, max-age=2592000";
/** A realistic card body (>5KB) with the route's normal or fallback headers. */
const card = (bytes: number, extra: Record<string, string> = {}, ttl = 86400) => new Response(new Uint8Array(bytes).fill(7), {
  headers: { "Content-Type": "image/png", "Cache-Control": `public, max-age=${ttl}, s-maxage=${ttl}`, "X-Robots-Tag": "noindex, noimageindex, nofollow", ...extra },
});

describe("stored TTL vs outgoing TTL", () => {
  it("keeps a verified card 30 days in the Cache API but still tells browsers/CDN 1 day on MISS and HIT", async () => {
    const { cache, entries } = memoryCache();
    const render = vi.fn(async () => card(100_000));
    const miss = await serveCachedOgImage("https://www.moneysalary.com/api/og?type=guide&title=가이드", render, cache);
    expect(miss.headers.get("X-OG-Cache")).toBe("MISS");
    expect(miss.headers.get("Cache-Control")).toBe(CLIENT_TTL);
    expect(OG_CLIENT_CACHE_CONTROL).toBe(CLIENT_TTL);
    const stored = [...entries.values()][0];
    expect(stored.headers.get("Cache-Control")).toBe(STORED_TTL);
    expect(stored.headers.get("Content-Type")).toBe("image/png");
    expect(stored.headers.get("X-Robots-Tag")).toContain("noindex");
    expect((await stored.clone().arrayBuffer()).byteLength).toBe(100_000);
    const hit = await serveCachedOgImage("https://www.moneysalary.com/api/og?title=가이드&type=guide", render, cache);
    expect(render).toHaveBeenCalledOnce();
    expect(hit.headers.get("X-OG-Cache")).toBe("HIT");
    expect(hit.headers.get("Cache-Control")).toBe(CLIENT_TTL);
    expect((await hit.arrayBuffer()).byteLength).toBe(100_000);
    // The client response body is still readable after the stored copy was made.
    expect((await miss.arrayBuffer()).byteLength).toBe(100_000);
  });

  it("does not extend a blank/truncated render (<=5KB) beyond the normal 1 day", async () => {
    const { cache, entries } = memoryCache();
    for (const bytes of [0, 8, 5_000]) {
      await serveCachedOgImage(`https://www.moneysalary.com/api/og?title=small${bytes}`, async () => card(bytes), cache);
    }
    expect(entries.size).toBe(3);
    for (const stored of entries.values()) expect(stored.headers.get("Cache-Control")).toBe(CLIENT_TTL);
    await serveCachedOgImage("https://www.moneysalary.com/api/og?title=big", async () => card(5_001), cache);
    expect([...entries.values()].filter((r) => r.headers.get("Cache-Control") === STORED_TTL)).toHaveLength(1);
  });

  it("never extends the X-OG-Error fallback: stored, MISS and HIT all keep 300s", async () => {
    const { cache, entries } = memoryCache();
    const fallback = async () => card(20_000, { "X-OG-Error": "Error: font css fetch failed" }, 300);
    const miss = await serveCachedOgImage("https://www.moneysalary.com/api/og?type=salary&amount=50000000", fallback, cache);
    expect(miss.headers.get("Cache-Control")).toBe("public, max-age=300, s-maxage=300");
    const stored = [...entries.values()][0];
    expect(stored.headers.get("Cache-Control")).toBe("public, max-age=300, s-maxage=300");
    const hit = await serveCachedOgImage("https://www.moneysalary.com/api/og?type=salary&amount=50000000", async () => card(100_000), cache);
    expect(hit.headers.get("X-OG-Cache")).toBe("HIT");
    expect(hit.headers.get("Cache-Control")).toBe("public, max-age=300, s-maxage=300");
    expect(hit.headers.get("X-OG-Error")).toContain("font");
  });

  it("re-labels a stored 30-day entry to the client TTL on HIT without rewriting it", async () => {
    // The Workers Cache API adds Age on match; a 23-day-old copy must not go out as
    // max-age=86400 with Age 2000000 (stale on arrival downstream).
    const found = card(100_000, { "Cache-Control": STORED_TTL, Age: "2000000" });
    const cache = { match: vi.fn(async () => found), put: vi.fn(async () => {}) };
    const hit = await serveCachedOgImage("https://www.moneysalary.com/api/og?title=old", async () => card(1), cache);
    expect(hit.headers.get("X-OG-Cache")).toBe("HIT");
    expect(hit.headers.get("Cache-Control")).toBe(CLIENT_TTL);
    expect(hit.headers.get("Age")).toBeNull();
    expect(hit.headers.get("X-Robots-Tag")).toContain("noindex");
    expect((await hit.arrayBuffer()).byteLength).toBe(100_000);
    expect(cache.put).not.toHaveBeenCalled();
  });

  it("leaves legacy 1-day and 300s fallback HITs (and their Age) unchanged", async () => {
    for (const [ttl, age] of [[86400, "3600"], [300, "120"]] as const) {
      const found = card(100_000, { Age: age }, ttl);
      const cache = { match: vi.fn(async () => found), put: vi.fn(async () => {}) };
      const hit = await serveCachedOgImage("https://www.moneysalary.com/api/og?title=legacy", async () => card(1), cache);
      expect(hit.headers.get("X-OG-Cache")).toBe("HIT");
      expect(hit.headers.get("Cache-Control")).toBe(`public, max-age=${ttl}, s-maxage=${ttl}`);
      expect(hit.headers.get("Age")).toBe(age);
    }
  });
});

describe("salary card URLs (OG-03/OG-09)", () => {
  it("rounds amount/net/netPay to 10,000 won so won-level URLs share one key", async () => {
    const params = normalizeOgParams(new URLSearchParams("type=salary&amount=75500000&net=5069686&netPay=3524999.6"));
    expect(params.get("amount")).toBe("75500000");
    expect(params.get("net")).toBe("5070000");
    expect(params.get("netPay")).toBe("3520000");
    const { cache, entries } = memoryCache();
    const render = vi.fn<(params: URLSearchParams) => Promise<Response>>(async () => card(100_000));
    await serveCachedOgImage("https://www.moneysalary.com/api/og?type=salary&amount=50000000&net=3521236", render, cache);
    await serveCachedOgImage("https://www.moneysalary.com/api/og?type=salary&amount=50004000&net=3524000", render, cache);
    expect(render).toHaveBeenCalledOnce();
    expect(entries.size).toBe(1);
    // The render still receives the rounded values, and the card shows the same 만원 figures.
    expect(render.mock.calls[0][0].get("net")).toBe("3520000");
  });

  it("rounding never changes the displayed 만원 figure", () => {
    for (const raw of [0, 4_999, 5_000, 35_005_000, 3_521_236, 3_525_000, 5_069_686, 123_456_789, 999_999_999_999]) {
      const rounded = Number(normalizeOgParams(new URLSearchParams({ net: String(raw) })).get("net"));
      expect(Math.round(rounded / 10000), String(raw)).toBe(Math.round(raw / 10000));
    }
  });

  it("drops the public &v= version so it never splits or changes a render", async () => {
    const params = normalizeOgParams(new URLSearchParams(`type=salary&amount=50000000&net=3520000&v=${OG_URL_VERSION}`));
    expect(params.has("v")).toBe(false);
    expect(params.toString()).toBe(normalizeOgParams(new URLSearchParams("type=salary&amount=50000000&net=3520000")).toString());
    const { cache, entries } = memoryCache();
    const render = vi.fn(async () => card(100_000));
    await serveCachedOgImage(`https://www.moneysalary.com${salaryOgImagePath(50_000_000, 3_521_236)}`, render, cache);
    await serveCachedOgImage("https://www.moneysalary.com/api/og?type=salary&amount=50000000&net=3521236", render, cache);
    expect(render).toHaveBeenCalledOnce();
    expect(entries.size).toBe(1);
  });

  it("builds versioned salary card paths in 10,000-won units", () => {
    expect(OG_URL_VERSION).toMatch(/^\d{8}$/);
    expect(salaryOgImagePath(50_000_000, 3_521_236)).toBe(`/api/og?type=salary&amount=50000000&net=3520000&v=${OG_URL_VERSION}`);
    expect(salaryOgImagePath(75_500_000, 5_069_686)).toBe(`/api/og?type=salary&amount=75500000&net=5070000&v=${OG_URL_VERSION}`);
    // Part-time payloads can give a fractional annual amount (monthly x 12).
    expect(salaryOgImagePath(24_000_000.5)).toBe(`/api/og?type=salary&amount=24000000&v=${OG_URL_VERSION}`);
    expect(salaryOgImagePath(50_000_000, 0)).not.toContain("net=");
  });
});

describe("bounded query text and font memory", () => {
  it("preserves existing legitimate titles and numeric salary parameters", () => {
    const params = normalizeOgParams(new URLSearchParams("type=salary&amount=050000000&netPay=3000000&title=2026+연봉+계산기&unknown=ignored"));
    expect(params.get("title")).toBe("2026 연봉 계산기");
    expect(params.get("amount")).toBe("50000000");
    expect(params.get("netPay")).toBe("3000000");
    expect(params.has("unknown")).toBe(false);
  });

  it("caps Unicode text without splitting emoji and rejects expensive/nonfinite numeric payloads", () => {
    const input = new URLSearchParams({ title: "😀".repeat(2000), name: "a\n\0b", amount: "9".repeat(5000), net: "Infinity", netPay: "-10", lang: "zz", type: "unknown" });
    const params = normalizeOgParams(input);
    expect(Array.from(params.get("title")!)).toHaveLength(121);
    expect(params.get("title")).toBe("😀".repeat(120) + "…");
    expect(params.get("name")).toBe("a  b");
    for (const key of ["amount", "net", "netPay", "lang", "type"]) expect(params.has(key)).toBe(false);
  });

  it("evicts least-used font subsets and bounds bytes for arbitrary title requests", () => {
    const cache = new OgFontCache();
    for (let i = 0; i < 32; i += 1) cache.set(String(i), new ArrayBuffer(10));
    cache.get("0");
    cache.set("32", new ArrayBuffer(10));
    expect(cache.get("0")).toBeDefined();
    expect(cache.get("1")).toBeUndefined();
    for (let i = 0; i < 9; i += 1) cache.set(`large-${i}`, new ArrayBuffer(262_144));
    expect(cache.get("large-0")).toBeUndefined();
    expect(cache.get("large-8")).toBeDefined();
    cache.set("too-big", new ArrayBuffer(262_145));
    expect(cache.get("too-big")).toBeUndefined();
  });
});
