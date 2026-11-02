// SE-07(1) (2026-10-22) — /calc/holiday-bonus 닫힌 FAQ 사실 정정 회귀.
// 근거: 소득세법 제47조 제2항(일용 1일 15만원 공제)·제59조 제3항(산출세액 55% 공제)·제86조(1천원 미만 소액부징수)·
// 제12조(비과세 열거)·제20조(상여 = 근로소득), 국세청 일용근로소득 안내(mi=6584, cntntsId=7863).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(resolve(process.cwd(), "src/app/calc/holiday-bonus/page.tsx"), "utf8");

/** 일용근로소득 원천징수 소득세(원) — (일당 − 15만원) × 6% × (1 − 55%), 1천원 미만 부징수 */
const dailyWithholding = (wage: number) => {
  const tax = Math.max(0, wage - 150_000) * 0.06 * 0.45;
  return tax < 1_000 ? 0 : Math.floor(tax);
};

describe("명절 상여 FAQ 정정 (SE-07(1))", () => {
  it("없는 법률명 '근로소득법'과 근거 없는 현물 선물 비과세 문장이 없다", () => {
    expect(page).not.toContain("근로소득법");
    expect(page).not.toContain("일정 부분 비과세");
    // 2026-11-02 RL-05 재확인: 조세특례제한법에도 비과세 특례가 있어 '제12조에 열거된 급여뿐' 단정 대신 '제12조 등 법에 열거된 항목뿐'
    expect(page).toContain("비과세 근로소득은 소득세법 제12조 등 법에 열거된 항목뿐이고 명절 상여는 그 목록에 없어");
    expect(page).not.toContain("제12조에 열거된 급여뿐");
  });
  it("소액부징수는 지급 건 기준 — 여러 날 일당을 한 번에 받으면 합친 세액으로 판단 (국세청 안내, 2026-11-02 재확인)", () => {
    expect(page).toContain("일당 약 18만7천원 이하는 실제 원천징수가 없습니다(여러 날 일당을 한꺼번에 받으면 합친 세액으로 판단)");
    // 일당 18만원: 하루치 810원(부징수), 5일치를 한 번에 받으면 4,050원(징수)
    const batch = (wage: number, days: number) => {
      const tax = Math.max(0, wage - 150_000) * 0.06 * 0.45 * days;
      return tax < 1_000 ? 0 : Math.round(tax);
    };
    expect(batch(180_000, 1)).toBe(0);
    expect(batch(180_000, 5)).toBe(4_050);
  });
  it("일용직 답: 15만원 공제·6%·55%·2.7%·1천원 부징수·약 18만7천원", () => {
    expect(page).not.toContain("일당 18만원까지 비과세");
    expect(page).not.toContain("0.6%(지방세)");
    for (const part of ["일당 15만원까지는 근로소득공제(소득세법 제47조 제2항)", "55%를 세액공제(제59조 제3항)", "실제 2.7%(지방소득세 0.27% 별도)", "1천원 미만이면 떼지 않아(제86조)", "일당 약 18만7천원 이하"]) {
      expect(page, part).toContain(part);
    }
  });
  it("약 18만7천원 경계는 계산과 맞다", () => {
    expect(dailyWithholding(187_037)).toBe(0);
    expect(dailyWithholding(187_038)).toBe(1_000);
    expect((0.06 * 0.45 * 100).toFixed(1)).toBe("2.7");
  });
  it("질문 문구(요약줄)는 바뀌지 않았다 — 닫힌 details 높이 불변", () => {
    expect(page).toContain('question: "명절 상여금이 비과세 처리되는 경우가 있나요?"');
    expect(page).toContain('question: "비정규직·아르바이트도 명절 상여금에 세금이 붙나요?"');
  });
});
