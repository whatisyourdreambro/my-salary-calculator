// uuidV4 폴백 게이트 (2026-09-25 감사 B3 · CLIENT-06):
//  - randomUUID 가 없는 구형 브라우저에서도 서버 UUID_V4 정규식(contactHandler·fixedFeedbackHandler)을 통과해야 한다.
//    workClock 식 "work-<시각>-<난수>" 폴백은 서버가 INVALID_REQUEST 로 거절한다.
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { uuidV4 } from "@/lib/uuidV4";

/** 서버 핸들러의 실제 UUID_V4 리터럴을 읽어 온다 — 정규식이 바뀌면 이 테스트도 따라간다. */
const serverRegex = (file: string) => {
  const src = readFileSync(path.resolve(process.cwd(), file), "utf8");
  const m = src.match(/const UUID_V4 = \/(.+)\/([a-z]*);/);
  if (!m) throw new Error(`UUID_V4 literal not found in ${file}`);
  return new RegExp(m[1], m[2]);
};
const SERVER_PATTERNS = [
  serverRegex("src/lib/server/contactHandler.ts"),
  serverRegex("src/lib/server/fixedFeedbackHandler.ts"),
];
const expectServerAccepts = (id: string) => {
  for (const re of SERVER_PATTERNS) expect(id, `${id} vs ${re}`).toMatch(re);
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("uuidV4", () => {
  it("uses crypto.randomUUID when available", () => {
    const fixed = "123e4567-e89b-42d3-a456-426614174000";
    vi.stubGlobal("crypto", { randomUUID: () => fixed, getRandomValues: vi.fn() });
    expect(uuidV4()).toBe(fixed);
  });

  it("falls back to getRandomValues with v4 version/variant bits when randomUUID is missing", () => {
    // 최악의 바이트(전부 0xff / 전부 0x00)에서도 버전·변형 비트가 강제되는지 본다.
    for (const fill of [0xff, 0x00, 0x5a]) {
      const getRandomValues = vi.fn(<T extends ArrayBufferView | null>(arr: T) => {
        (arr as unknown as Uint8Array).fill(fill);
        return arr;
      });
      vi.stubGlobal("crypto", { getRandomValues });
      const id = uuidV4();
      expect(getRandomValues).toHaveBeenCalledTimes(1);
      expect(id).toHaveLength(36);
      expect(id[14]).toBe("4");
      expect("89ab").toContain(id[19]);
      expectServerAccepts(id);
    }
  });

  it("falls back to getRandomValues when randomUUID throws (insecure context)", () => {
    vi.stubGlobal("crypto", {
      randomUUID: () => { throw new TypeError("not allowed"); },
      getRandomValues: <T extends ArrayBufferView | null>(arr: T) => arr,
    });
    expectServerAccepts(uuidV4());
  });

  it("falls back to Math.random when crypto is absent and still passes the server regex", () => {
    vi.stubGlobal("crypto", undefined);
    const ids = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const id = uuidV4();
      expectServerAccepts(id);
      ids.add(id);
    }
    expect(ids.size).toBe(200);
  });

  it("falls back to Math.random when getRandomValues throws", () => {
    vi.stubGlobal("crypto", { getRandomValues: () => { throw new Error("QuotaExceeded"); } });
    const random = vi.spyOn(Math, "random").mockReturnValue(0.999999);
    const id = uuidV4();
    expect(random).toHaveBeenCalled();
    expectServerAccepts(id);
  });

  it("the old workClock-style id is rejected by the server regex (why it is not reused)", () => {
    for (const re of SERVER_PATTERNS) expect(`work-${Date.now()}-abc123`).not.toMatch(re);
  });

  it("ContactForm and PrivateFeedback use uuidV4, not a bare crypto.randomUUID()", () => {
    for (const file of ["src/app/contact/ContactForm.tsx", "src/components/PrivateFeedback.tsx"]) {
      const src = readFileSync(path.resolve(process.cwd(), file), "utf8");
      expect(src, file).toMatch(/from "@\/lib\/uuidV4"/);
      expect(src, file).not.toMatch(/crypto\.randomUUID\(/);
    }
  });
});
