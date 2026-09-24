// 청크 오류 1회 새로고침 게이트 (2026-09-25 감사 B3 · CLIENT-01):
//  - ChunkLoadError·CSS 청크·dynamic import 실패만 새로고침 대상, 일반 오류·fetch 실패는 제외.
//  - sessionStorage 'msy_chunk_reload' 타임스탬프로 60초에 1회. 저장소가 막히면 새로고침하지 않는다(루프 방지).
//  - error.tsx 가 이 헬퍼와 refresh+reset 재시도를 쓰는지 소스로 확인.
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  CHUNK_RELOAD_KEY,
  CHUNK_RELOAD_WINDOW_MS,
  isChunkLoadError,
  reloadOnceForChunkError,
} from "@/lib/chunkReload";

const memoryStore = (initial: Record<string, string> = {}) => {
  const data = new Map(Object.entries(initial));
  return {
    getItem: vi.fn((k: string) => data.get(k) ?? null),
    setItem: vi.fn((k: string, v: string) => { data.set(k, v); }),
    data,
  };
};

const chunkError = () => Object.assign(new Error("Loading chunk 3662 failed.\n(missing: https://www.moneysalary.com/_next/static/chunks/3662-x.js)"), { name: "ChunkLoadError" });

describe("isChunkLoadError", () => {
  it("matches webpack JS/CSS chunk failures and browser dynamic import failures", () => {
    expect(isChunkLoadError(chunkError())).toBe(true);
    expect(isChunkLoadError({ name: "ChunkLoadError", message: "" })).toBe(true);
    expect(isChunkLoadError(new Error("Loading chunk 5858 failed."))).toBe(true);
    expect(isChunkLoadError(new Error("Loading CSS chunk 1234 failed.\n(/_next/static/css/abc.css)"))).toBe(true);
    expect(isChunkLoadError(new TypeError("Failed to fetch dynamically imported module: https://x/_next/a.js"))).toBe(true);
    expect(isChunkLoadError(new TypeError("error loading dynamically imported module"))).toBe(true);
  });

  it("ignores ordinary errors, plain fetch failures and non-errors", () => {
    expect(isChunkLoadError(new Error("Cannot read properties of undefined"))).toBe(false);
    expect(isChunkLoadError(new TypeError("Failed to fetch"))).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
    expect(isChunkLoadError("Loading chunk 1 failed")).toBe(false);
    expect(isChunkLoadError({ message: 42 })).toBe(false);
  });
});

describe("reloadOnceForChunkError", () => {
  it("reloads a chunk error once and stamps the time", () => {
    const storage = memoryStore();
    const reload = vi.fn();
    expect(reloadOnceForChunkError(chunkError(), { storage, reload, now: 1_000_000 })).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(storage.data.get(CHUNK_RELOAD_KEY)).toBe("1000000");
  });

  it("does not reload again within 60 seconds, but does after the window", () => {
    const storage = memoryStore({ [CHUNK_RELOAD_KEY]: "1000000" });
    const reload = vi.fn();
    expect(reloadOnceForChunkError(chunkError(), { storage, reload, now: 1_000_000 + CHUNK_RELOAD_WINDOW_MS - 1 })).toBe(false);
    expect(reload).not.toHaveBeenCalled();
    expect(reloadOnceForChunkError(chunkError(), { storage, reload, now: 1_000_000 + CHUNK_RELOAD_WINDOW_MS })).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("never reloads for a non-chunk error", () => {
    const storage = memoryStore();
    const reload = vi.fn();
    expect(reloadOnceForChunkError(new Error("render failed"), { storage, reload, now: 1 })).toBe(false);
    expect(reload).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("does not reload when sessionStorage is unavailable (no guard, no loop)", () => {
    const reload = vi.fn();
    const blocked = {
      getItem: () => { throw new DOMException("The operation is insecure.", "SecurityError"); },
      setItem: () => { throw new DOMException("The operation is insecure.", "SecurityError"); },
    };
    expect(reloadOnceForChunkError(chunkError(), { storage: blocked, reload, now: 1 })).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it("treats a garbage stamp as no previous reload", () => {
    const storage = memoryStore({ [CHUNK_RELOAD_KEY]: "not-a-number" });
    const reload = vi.fn();
    expect(reloadOnceForChunkError(chunkError(), { storage, reload, now: 5 })).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
  });
});

describe("src/app/error.tsx wiring", () => {
  const src = readFileSync(path.resolve(process.cwd(), "src/app/error.tsx"), "utf8");

  it("reloads once for chunk errors via the guarded helper", () => {
    expect(src).toContain("reloadOnceForChunkError(error)");
  });

  it("retries server errors with router.refresh() + reset() in one transition", () => {
    expect(src).toMatch(/startTransition\(\(\) => \{\s*router\.refresh\(\);\s*reset\(\);\s*\}\)/);
    expect(src).not.toMatch(/onClick=\{reset\}/);
  });
});
