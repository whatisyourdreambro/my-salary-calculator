// R4 CONTENT2 (2026-11-18) N2-data-02 / data-b01-M01 — /glossary/종합과세 계산 예시.
// 금융소득 2,000만원 초과분 500만원은 지급 때 이미 15.4%(소득세 14% + 지방소득세 1.4%)가 원천징수됐고,
// 종합과세(소득세법 제62조, 일반 계산과 비교 계산 중 큰 금액)에서 과세표준이 15% 구간이면 추가 부담은
// 16.5% - 15.4% = 1.1%, 약 5만 5천원이다. 옛 문장의 '약 82만 5천원 추가'는 500만원에 대한 세금 전체(16.5%)였다.
// 35% 구간이면 (38.5% - 15.4%) x 500만원 = 115.5만원이라 '부담이 커진다'는 둘째 절도 맞다.
// example300 은 GuideMidAd 아래, InArticleAd 위에 그려지고 FAQPage JSON-LD 답변이므로 길어지면 안 된다.
import { describe, expect, it } from "vitest";
import { glossaryData } from "@/data/glossaryData";

const OLD_EXAMPLE300_LENGTH = 195; // 2026-11-18 이전 example300 의 글자 수

describe("N2-data-02 /glossary/종합과세 — 초과 금융소득 500만원의 추가 세금", () => {
  const item = glossaryData.find((g) => g.title === "종합과세");

  it("item exists", () => {
    expect(item).toBeDefined();
  });

  it("no longer states 82만 5천원 as the addition and states about 5만 5천원", () => {
    expect(item!.example300).not.toContain("82만 5천원");
    expect(item!.example300).toContain("5만 5천원");
  });

  it("the arithmetic of the example holds", () => {
    const excess = 5_000_000;
    const extraAt15 = Math.round(excess * (0.15 * 1.1 - 0.154));
    expect(extraAt15).toBe(55_000);
    const extraAt35 = Math.round(excess * (0.35 * 1.1 - 0.154));
    expect(extraAt35).toBe(1_155_000);
  });

  it("keeps the first sentence and is not longer than before (above InArticleAd)", () => {
    expect(item!.example300.startsWith(
      "월급 300만원 직장인이 금융소득 2,500만원을 올렸다면 2,000만원까지는 15.4% 분리과세로 끝나지만, 초과 500만원은 연봉 3,600만원과 합산돼 누진세율로 다시 계산됩니다. ",
    )).toBe(true);
    expect(item!.example300.length).toBeLessThanOrEqual(OLD_EXAMPLE300_LENGTH);
  });
});
