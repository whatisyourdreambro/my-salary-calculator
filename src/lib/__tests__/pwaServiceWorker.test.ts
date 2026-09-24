// src/lib/__tests__/pwaServiceWorker.test.ts
//
// public/sw.js 행동 회귀 가드 (2026-09-25 감사 B17 — PERF-09·CLIENT-12·PROD-15).
// 실제 sw.js 소스를 vm 에 올리고 가짜 caches·fetch·이벤트로 구동한다.
// 불변식: HTML·API·cross-origin(광고) 요청은 respondWith 하지 않는다.
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

const ORIGIN = "https://www.moneysalary.com";
const SOURCE = readFileSync("public/sw.js", "utf8");
const CACHE_NAME = /const CACHE_NAME = "([^"]+)"/.exec(SOURCE)?.[1] ?? "";

type Req = { method: string; url: string; mode?: string };
type Listener = (event: Record<string, unknown>) => void;

const keyOf = (req: Req | string) => (typeof req === "string" ? req : req.url);

class FakeCache {
  entries = new Map<string, Response>();
  failPut = false;
  async match(req: Req) {
    return this.entries.get(keyOf(req));
  }
  async put(req: Req, res: Response) {
    if (this.failPut) throw new Error("QuotaExceededError");
    const key = keyOf(req);
    this.entries.delete(key); // 같은 요청 재저장은 맨 뒤로 (Cache API 삽입 순서와 동일)
    this.entries.set(key, res);
  }
  async keys() {
    return [...this.entries.keys()].map((url) => ({ method: "GET", url }));
  }
  async delete(req: Req) {
    return this.entries.delete(keyOf(req));
  }
}

class FakeCacheStorage {
  stores = new Map<string, FakeCache>();
  failOpen = false;
  async open(name: string) {
    if (this.failOpen) throw new Error("SecurityError");
    if (!this.stores.has(name)) this.stores.set(name, new FakeCache());
    return this.stores.get(name)!;
  }
  async keys() {
    return [...this.stores.keys()];
  }
  async delete(name: string) {
    return this.stores.delete(name);
  }
}

function loadWorker() {
  const listeners: Record<string, Listener> = {};
  const caches = new FakeCacheStorage();
  const fetch = vi.fn(async (req: Req) =>
    req.url.includes("missing") ? new Response("", { status: 404 }) : new Response(`body:${req.url}`, { status: 200 })
  );
  const self = {
    location: { origin: ORIGIN },
    skipWaiting: vi.fn(),
    clients: { claim: vi.fn(async () => undefined) },
    addEventListener: (type: string, fn: Listener) => {
      listeners[type] = fn;
    },
  };
  runInNewContext(SOURCE, { self, caches, fetch, URL });
  return { listeners, caches, fetch, self };
}

// fire-and-forget 인 put→trim 체인이 끝날 때까지 이벤트 루프를 몇 바퀴 돌린다
const settle = async () => {
  for (let i = 0; i < 10; i += 1) await new Promise((resolve) => setTimeout(resolve, 0));
};

function fetchEvent(req: Req) {
  const responded: Promise<Response>[] = [];
  return {
    event: { request: req, respondWith: (p: Promise<Response>) => responded.push(p) },
    responded,
  };
}

const get = (path: string, extra: Partial<Req> = {}): Req => ({ method: "GET", url: `${ORIGIN}${path}`, ...extra });

describe("service worker install — navigation bypass via Static Routing", () => {
  it("registers navigate→network and keeps skipWaiting", async () => {
    const { listeners, self } = loadWorker();
    const addRoutes = vi.fn(async () => undefined);
    const waits: Promise<unknown>[] = [];
    listeners.install({ addRoutes, waitUntil: (p: Promise<unknown>) => waits.push(p) });
    expect(self.skipWaiting).toHaveBeenCalledTimes(1);
    expect(addRoutes).toHaveBeenCalledWith([{ condition: { requestMode: "navigate" }, source: "network" }]);
    expect(waits).toHaveLength(1);
    await expect(Promise.all(waits)).resolves.toBeDefined();
  });

  it("never fails install when addRoutes is missing, rejects or throws", async () => {
    const { listeners, self } = loadWorker();
    expect(() => listeners.install({ waitUntil: vi.fn() })).not.toThrow();

    const waits: Promise<unknown>[] = [];
    listeners.install({ addRoutes: () => Promise.reject(new TypeError("bad rule")), waitUntil: (p: Promise<unknown>) => waits.push(p) });
    await expect(Promise.all(waits)).resolves.toBeDefined();

    expect(() =>
      listeners.install({
        addRoutes: () => {
          throw new TypeError("sync");
        },
        waitUntil: vi.fn(),
      })
    ).not.toThrow();
    expect(self.skipWaiting).toHaveBeenCalledTimes(3);
  });

  it("does not turn on navigationPreload (the fetch handler never reads preloadResponse)", () => {
    expect(SOURCE).not.toMatch(/navigationPreload\s*\.\s*enable/);
  });
});

describe("service worker fetch — static-only cache-first", () => {
  it.each([
    ["page navigation", get("/salary-db/samsung", { mode: "navigate" })],
    ["API route", get("/api/og?path=%2F")],
    ["POST", get("/_next/static/chunks/a.js", { method: "POST" })],
    ["AdSense (cross-origin)", { method: "GET", url: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" }],
    ["GA (cross-origin)", { method: "GET", url: "https://www.googletagmanager.com/gtag/js?id=G-X" }],
  ])("leaves %s to the browser", (_label, req) => {
    const { listeners } = loadWorker();
    const { event, responded } = fetchEvent(req as Req);
    listeners.fetch(event);
    expect(responded).toHaveLength(0);
  });

  it("serves /_next/static cache-first and caches only ok responses", async () => {
    const { listeners, caches, fetch } = loadWorker();
    const first = fetchEvent(get("/_next/static/chunks/app-1.js"));
    listeners.fetch(first.event);
    expect((await first.responded[0]).status).toBe(200);
    await settle();
    const second = fetchEvent(get("/_next/static/chunks/app-1.js"));
    listeners.fetch(second.event);
    expect(await (await second.responded[0]).text()).toBe(`body:${ORIGIN}/_next/static/chunks/app-1.js`);
    expect(fetch).toHaveBeenCalledTimes(1);

    const missing = fetchEvent(get("/_next/static/chunks/missing-abc.js"));
    listeners.fetch(missing.event);
    expect((await missing.responded[0]).status).toBe(404);
    await settle();
    expect([...caches.stores.get(CACHE_NAME)!.entries.keys()]).toEqual([`${ORIGIN}/_next/static/chunks/app-1.js`]);
  });

  it("swallows cache.put failures and still returns the network response", async () => {
    const unhandled = vi.fn();
    process.on("unhandledRejection", unhandled);
    try {
      const { listeners, caches } = loadWorker();
      (await caches.open(CACHE_NAME)).failPut = true;
      const { event, responded } = fetchEvent(get("/_next/static/css/app.css"));
      listeners.fetch(event);
      expect((await responded[0]).status).toBe(200);
      await settle();
      expect(unhandled).not.toHaveBeenCalled();
    } finally {
      process.off("unhandledRejection", unhandled);
    }
  });

  it("falls back to the network when the cache store cannot be opened", async () => {
    const { listeners, caches, fetch } = loadWorker();
    caches.failOpen = true;
    const { event, responded } = fetchEvent(get("/favicon.ico"));
    listeners.fetch(event);
    expect((await responded[0]).status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("trims the static cache to the newest 300 entries after a put", async () => {
    const { listeners, caches } = loadWorker();
    const cache = await caches.open(CACHE_NAME);
    for (let i = 0; i < 305; i += 1) await cache.put(get(`/_next/static/chunks/old-${i}.js`), new Response("x"));
    const { event, responded } = fetchEvent(get("/_next/static/chunks/new.js"));
    listeners.fetch(event);
    await responded[0];
    await settle();
    const keys = [...cache.entries.keys()];
    expect(keys).toHaveLength(300);
    expect(keys[0]).toBe(`${ORIGIN}/_next/static/chunks/old-6.js`);
    expect(keys.at(-1)).toBe(`${ORIGIN}/_next/static/chunks/new.js`);
  });
});

describe("service worker activate", () => {
  it("bumps the cache version, drops old caches, trims the current one and claims clients", async () => {
    expect(CACHE_NAME).toBe("msy-static-v3");
    const { listeners, caches, self } = loadWorker();
    const old = await caches.open("msy-static-v2");
    await old.put(get("/_next/static/chunks/stale.js"), new Response("x"));
    const current = await caches.open(CACHE_NAME);
    for (let i = 0; i < 320; i += 1) await current.put(get(`/_next/static/chunks/c-${i}.js`), new Response("x"));
    const waits: Promise<unknown>[] = [];
    listeners.activate({ waitUntil: (p: Promise<unknown>) => waits.push(p) });
    await Promise.all(waits);
    expect(await caches.keys()).toEqual([CACHE_NAME]);
    expect(current.entries.size).toBe(300);
    expect([...current.entries.keys()][0]).toBe(`${ORIGIN}/_next/static/chunks/c-20.js`);
    expect(self.clients.claim).toHaveBeenCalledTimes(1);
  });
});

describe("PWA manifests", () => {
  const ko = JSON.parse(readFileSync("public/manifest.webmanifest", "utf8"));
  const en = JSON.parse(readFileSync("public/manifest.en.webmanifest", "utf8"));

  it("keeps the PWA identity and scope", () => {
    expect(ko.id).toBe("/");
    expect(ko.start_url).toBe("/?utm_source=pwa&utm_medium=homescreen");
    expect(en.id).toBe("/en");
  });

  it("makes no tool-count or 'latest law' claims that drift from the live catalogue", () => {
    const text = JSON.stringify([ko.name, ko.description, ko.shortcuts, en.name, en.description, en.shortcuts]);
    expect(text).not.toMatch(/최신 세법|\d+\s*(?:가지|개|종)|\d+\+?\s*(?:tools|calculators)/i);
    const calc = ko.shortcuts.find((s: { url: string }) => s.url === "/calc");
    expect(calc).toMatchObject({ name: "계산기 모음", description: "대출·보험·세금·투자 계산기" });
  });
});
