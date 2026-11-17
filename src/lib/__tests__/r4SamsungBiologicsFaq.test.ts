// /calc/samsung-biologics-bonus 접힌 FAQ — 2026년 1월 OPI 지급 완료, 2025 하반기 TAI 50% 수준, OPI 3년 연속 상한 (R4 SAMSUNG, N2-calc-13 calc-03-F04, 2026-11-18)
//
// 출처: 2023 실적분 OPI 연봉 50% — 뉴데일리 2024-01-31(전 임직원에 연봉의 50% OPI 지급) · 2025 하반기 TAI 50% 수준 —
// 쿠키뉴스 2026-06-11 · 2025 실적분 OPI 50% — 아시아경제 2025-12-27(2026년 1월 지급). 기본 접힘 details 의 답이라 첫 화면 높이 0.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(resolve(process.cwd(), "src/app/calc/samsung-biologics-bonus/page.tsx"), "utf8");
const faq = page.slice(page.indexOf("const FAQ_ITEMS = ["), page.indexOf("];", page.indexOf("const FAQ_ITEMS = [")));
const answerOf = (q: string) => {
  const i = faq.indexOf(`question: "${q}"`);
  return faq.slice(i, faq.indexOf("},", i));
};

describe("삼성바이오로직스 접힌 FAQ (N2-calc-13)", () => {
  it("최근 OPI: 3년 연속 상한, 2026년 1월 지급됐음", () => {
    const a = answerOf("최근 OPI는 얼마나 지급됐나요?");
    expect(a).toContain("3년 연속 상한(2023~2025 실적분, 2023년분은 뉴데일리 2024-01-31)");
    expect(a).toContain("2026년 1월 지급됐습니다");
    expect(a).not.toContain("지급 예상");
  });

  it("TAI: 2025 하반기 50% 수준 보도", () => {
    const a = answerOf("TAI는 얼마나 지급됐나요?");
    expect(a).toContain("2025년 하반기(12월 지급분)는 50% 수준에 그쳤다고 보도됐습니다(쿠키뉴스 2026-06-11)");
    expect(a).not.toContain("미확정");
  });

  it("신뢰 범위: 출처에 쿠키뉴스, 2025 하반기 TAI 를 미확정이라 하지 않음", () => {
    const a = answerOf("이 계산기 결과를 어디까지 신뢰할 수 있나요?");
    expect(a).toContain("쿠키뉴스(2026-06-11)");
    expect(a).toContain("향후 연도 지급률은 미확정입니다");
    expect(a).not.toContain("2025년 하반기 TAI와");
  });
});
