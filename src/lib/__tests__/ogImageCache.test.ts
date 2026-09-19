import { describe, expect, it, vi } from "vitest";
import { normalizeOgParams, OgFontCache, serveCachedOgImage, type OgEdgeCache } from "@/lib/ogImageCache";

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
