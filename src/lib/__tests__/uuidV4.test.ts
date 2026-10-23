// uuidV4 폴백 게이트 (2026-09-25 감사 B3 · CLIENT-06):
//  - randomUUID 가 없는 구형 브라우저에서도 실제 서버 접수 정규화를 통과해야 한다.
//    workClock 식 "work-<시각>-<난수>" 폴백은 서버가 INVALID_REQUEST 로 거절한다.
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { uuidV4 } from "@/lib/uuidV4";
import { normalizeReceiptRequest, RECEIPT_V1 } from "@/lib/server/receiptContracts";

// Exercise the real shared validator, regardless of where its regex is stored.
const serverResults = (submissionId: string) => [
  normalizeReceiptRequest("contact", { submissionId, type: "other", pagePath: "/", body: "Synthetic message", inquiryConsent: true }),
  normalizeReceiptRequest("feedback", { submissionId, target: "samsung_bonus", vote: "helpful", reason: null, feedbackConsent: true }),
  normalizeReceiptRequest("opinion", { submissionId, target: "samsung_bonus", body: "Synthetic opinion", inquiryConsent: true, contractVersion: RECEIPT_V1.opinion }),
  normalizeReceiptRequest("reaction", { submissionId, target: "samsung_bonus", vote: "helpful", reason: null, publicAggregateConsent: true, contractVersion: RECEIPT_V1.reaction }),
];
const expectServerAccepts = (id: string) => {
  for (const result of serverResults(id)) expect(result).toMatchObject({ submissionId: id });
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
    for (const result of serverResults(`work-${Date.now()}-abc123`)) expect(result).toBe("INVALID_REQUEST");
  });

  it("ContactForm and PrivateFeedback use uuidV4, not a bare crypto.randomUUID()", () => {
    for (const file of ["src/app/contact/ContactForm.tsx", "src/components/PrivateFeedback.tsx"]) {
      const src = readFileSync(path.resolve(process.cwd(), file), "utf8");
      expect(src, file).toMatch(/from "@\/lib\/uuidV4"/);
      expect(src, file).not.toMatch(/crypto\.randomUUID\(/);
    }
  });
});
