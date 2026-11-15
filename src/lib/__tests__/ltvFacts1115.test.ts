// /tools/real-estate/ltv 사실 고정 (감사 2026-11-15 N2-app-tools-fun-01 — app-tools-fun-b04-F01·F02·M01).
// 6·27 대책(2025-06-28 시행): 2주택 이상 보유자의 추가 주택구입 주담대는 수도권·규제지역에서 금지(LTV 0%),
// 그 밖(비규제 지방)은 LTV 60% · 수도권·규제지역 주택구입 주담대는 6개월 안에 전입 · 소유권 이전 조건부 전세대출 금지
// (금융위 fsc.go.kr/edu/news/84845). 10·15 대책: 수도권·규제지역 주담대 스트레스 금리 1.5% → 3.0%
// (정책브리핑 newsId 148950973). 금융위 2026-08-14(정책브리핑 newsId 148970085): 대출규제 유지.
// FAQ 답변은 접힌 <details> 와 FAQPage JSON-LD 에만 있다(닫힌 높이 불변).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { STRESS_ADD_PCT } from "@/lib/bonusHome/loanRules";
import { DSR_RATIO, dsrLimitOf } from "@/lib/widgets/dsrLimit";

const src = readFileSync(resolve(process.cwd(), "src/app/tools/real-estate/ltv/page.tsx"), "utf8");
const faqBlock = src.slice(src.indexOf("const FAQ_ITEMS = ["), src.indexOf("const HOW_TO_STEPS"));

/** FAQ_ITEMS 의 질문 → 답변 (소스 문자열 그대로) */
function faqAnswer(question: string): string {
  const at = faqBlock.indexOf(`question: "${question}"`);
  expect(at, question).toBeGreaterThan(-1);
  const m = faqBlock.slice(at).match(/answer:\s*"([^"]*)"/);
  expect(m, question).not.toBeNull();
  return m![1];
}

describe("LTV 계산기 — 다주택·스트레스 DSR·전세 낀 매수 (2026-11-15)", () => {
  it("FAQ 는 7개 그대로다", () => {
    expect([...faqBlock.matchAll(/question:\s*"/g)]).toHaveLength(7);
  });

  it("다주택자 FAQ: 수도권·규제지역 금지(LTV 0%), 그 밖 LTV 60% — 옛 '비규제도 50%' 없음", () => {
    const a = faqAnswer("다주택자 LTV는?");
    expect(a).toContain("6·27 대책(2025-06-28 시행)");
    expect(a).toContain("수도권·규제지역에서 금지(LTV 0%)");
    expect(a).toContain("그 밖의 지역은 LTV 60%");
    expect(src).not.toContain("비규제도 50%");
    expect(src).not.toContain("LTV 0~50%");
  });

  it("LTV·DSR FAQ: 스트레스 금리 3%p(수도권·규제지역 변동금리)를 밝힌다", () => {
    const a = faqAnswer("LTV와 DSR 중 어느 게 한도가 되나요?");
    expect(a).toContain("스트레스 금리");
    expect(a).toContain("3%p");
    expect(a).toContain("(30년·금리 4%) 4억 8천만원");
    expect(a).toContain("약 3억 5천만원");
    expect(STRESS_ADD_PCT.capitalOrRegulated).toBe(3);
  });

  it("4억 8천만원·3억 5천만원은 사이트 공용 DSR 산식(연봉 7천만원·DSR 40%·30년)과 맞는다", () => {
    expect(DSR_RATIO).toBe(0.4);
    const at4 = dsrLimitOf(70_000_000, 4, 30); // dsrLimitOf 가 DSR 40% 를 곱한다
    const at7 = dsrLimitOf(70_000_000, 4 + STRESS_ADD_PCT.capitalOrRegulated, 30);
    // 약 4억 8,874만 → '4억 8천만원 정도'
    expect(at4).toBeGreaterThanOrEqual(480_000_000);
    expect(at4).toBeLessThan(490_000_000);
    expect(at7).toBeGreaterThanOrEqual(345_000_000); // 약 3억 5,072만 → '약 3억 5천만원'
    expect(at7).toBeLessThan(355_000_000);
  });

  it("전세 끼고 매수 FAQ: 수도권·규제지역 6개월 안 전입 의무와 조건부 전세대출 금지", () => {
    const a = faqAnswer("전세 끼고 매수 시 LTV는?");
    expect(a).toContain("6개월 안에 전입");
    expect(a).toContain("소유권 이전 조건부 전세대출도 금지");
    expect(a).toContain("비규제 지방은 전세 만료까지 임차인 거주 보장 필수");
  });

  it("주거용 FAQ: 규제지역 무주택 40% 를 반영한 40~80%", () => {
    expect(faqAnswer("주거용 vs 비주거용 LTV 차이?")).toContain("주거용 주택은 LTV 40~80%");
    expect(src).not.toContain("LTV 50~80%");
  });
});
