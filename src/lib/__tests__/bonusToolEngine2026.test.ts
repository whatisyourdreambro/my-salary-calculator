// src/lib/__tests__/bonusToolEngine2026.test.ts
//
// /tools/finance/bonus 가 회사별 성과급 계산기(calcBonusNet)와 같은 정본 산식을 쓰는지 (2026-11 CALC-03).
// 종전 페이지는 4대보험료 공제 없이 과세표준을 잡아 성과급 소득세를 과다 추정했다
// (연봉 1억 + 성과급 5,000만 기준 소득세+지방세 18,680,750원 vs 정본 16,668,963원, 성과급이 클수록 차이가 커진다).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  calcBonusNet,
  estimateAnnualIncomeTax2026,
  estimateAnnualIncomeTaxBreakdown2026,
} from "@/lib/bonusTaxCalc";
import { CURRENT_INSURANCE_RATES } from "@/config/currentRates";
import { INSURANCE_RATES_2026 } from "@/lib/taxConstants2026";

/** page.tsx calculate() 의 성과급 소득세+지방세 부분과 같은 식 */
function toolBonusTax(salary: number, bonus: number, personal = 1_500_000) {
  const before = estimateAnnualIncomeTaxBreakdown2026(salary, CURRENT_INSURANCE_RATES, salary, personal);
  const after = estimateAnnualIncomeTaxBreakdown2026(salary + bonus, CURRENT_INSURANCE_RATES, salary + bonus, personal);
  const delta = Math.max(0, after.determinedTax - before.determinedTax);
  return Math.round(delta) + Math.round(delta * CURRENT_INSURANCE_RATES.LOCAL_INCOME_TAX_RATIO);
}

describe("estimateAnnualIncomeTaxBreakdown2026", () => {
  it("결정세액은 기존 estimateAnnualIncomeTax2026 과 원 단위까지 같다 (기존 호출부 무변경)", () => {
    for (const g of [0, 12_000_000, 30_000_000, 50_000_000, 79_080_000, 100_000_000, 150_000_000, 300_000_000]) {
      expect(estimateAnnualIncomeTaxBreakdown2026(g).determinedTax).toBe(estimateAnnualIncomeTax2026(g));
      expect(estimateAnnualIncomeTaxBreakdown2026(g, INSURANCE_RATES_2026, g * 0.8).determinedTax)
        .toBe(estimateAnnualIncomeTax2026(g, INSURANCE_RATES_2026, g * 0.8));
    }
  });

  it("단계별 값이 산식대로 이어진다", () => {
    const b = estimateAnnualIncomeTaxBreakdown2026(60_000_000, INSURANCE_RATES_2026, 60_000_000, 3_000_000);
    expect(b.taxBase).toBeCloseTo(60_000_000 - b.earnedIncomeDeduction - 3_000_000 - b.insuranceDeduction, 6);
    expect(b.determinedTax).toBe(Math.max(0, b.calculatedTax - b.earnedIncomeTaxCredit));
    expect(b.personalDeduction).toBe(3_000_000);
  });
});

describe("/tools/finance/bonus = 회사별 성과급 계산기 (1인)", () => {
  const PAIRS: [number, number][] = [
    [40_000_000, 3_000_000],
    [40_000_000, 5_000_000],
    [60_000_000, 10_000_000],
    [80_000_000, 20_000_000],
    [100_000_000, 50_000_000],
    [150_000_000, 30_000_000],
  ];
  it.each(PAIRS)("연봉 %i + 성과급 %i → 소득세+지방세가 calcBonusNet 과 같다", (salary, bonus) => {
    const c = calcBonusNet(salary, bonus);
    expect(toolBonusTax(salary, bonus)).toBe(c.incomeTaxDelta + c.localTaxDelta);
  });

  it("고정값: 연봉 6,000만 + 성과급 1,000만 → 1,407,163원 (종전 2,087,250원)", () => {
    expect(toolBonusTax(60_000_000, 10_000_000)).toBe(1_407_163);
  });

  it("부양가족이 늘면 성과급 세금이 같거나 줄어든다", () => {
    expect(toolBonusTax(60_000_000, 10_000_000, 4_500_000)).toBeLessThanOrEqual(toolBonusTax(60_000_000, 10_000_000));
  });

  it("페이지는 자체 세율표·근로소득공제 재구현 없이 정본을 부른다 (소스 검사)", () => {
    const src = readFileSync(resolve(process.cwd(), "src/app/tools/finance/bonus/page.tsx"), "utf8");
    expect(src).toContain("estimateAnnualIncomeTaxBreakdown2026(annualSalary, CURRENT_INSURANCE_RATES, annualSalary, basicDeduct)");
    expect(src).not.toMatch(/function calcEmpDeduction|function calcProgressiveTax|const calcTaxCredit/);
    expect(src).not.toContain("보험료의 소득공제, 추가 소득·세액공제");
  });

  it("접힌 상세 패널은 펼쳐도 문구가 늘지 않는다 — ③ 라벨만 교체·보조 문구 유지, 면책 한 구절만 교체", () => {
    const src = readFileSync(resolve(process.cwd(), "src/app/tools/finance/bonus/page.tsx"), "utf8");
    // ③ 행: 값은 인적공제 + 4대보험료 공제 합계, 보조 문구(본인+배우자+부양가족 n명)는 종전 그대로
    expect(src).toContain('label: "인적·보험료 공제"');
    expect(src).toContain('value: "-" + fmt(r.basicDeduct + r.insuranceDeductNew) + "원"');
    expect(src).toContain('부양가족 ${dependents}명` }');
    expect(src).not.toContain("명·4대보험");
    expect(src).not.toContain("기본 인적공제");
    // 패널 면책 첫 문장: 기본 인적공제 → 인적·보험료공제 (한글 1자 증가, 기호·공백 수 동일)
    const before = "근로소득공제·기본 인적공제·근로소득세액공제를 적용한 연간 세액의 전후 차이입니다.";
    const after = "근로소득공제·인적·보험료공제·근로소득세액공제를 적용한 연간 세액의 전후 차이입니다.";
    expect(src).toContain(after);
    const hangul = (s: string) => [...s].filter((ch) => /[가-힣]/.test(ch)).length;
    expect(hangul(after) - hangul(before)).toBe(1);
    expect([...after].length - hangul(after)).toBe([...before].length - hangul(before));
  });
});
