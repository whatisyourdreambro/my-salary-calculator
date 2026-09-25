// src/lib/__tests__/yearEndTaxReport.test.ts
//
// /year-end-tax (홈 연말정산 탭 포함) '상세 분석 리포트' 회귀 가드 (2026-09-25).
// 종전 리포트는 최종 결과에서 역산해 근로소득공제 = 총급여 − 과세표준 − 결정세액,
// 산출세액 = 결정세액, 세액공제 합계 = 0원으로 표시했다. 이제 엔진이 단계별 값을 돌려준다.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  calculateYearEndTax,
  deriveAnnualHealthPremium,
  type TaxInputs,
} from "@/lib/yearEndTaxCalculator";
import {
  calcIncomeTax2026,
  earnedIncomeDeduction2026,
  INSURANCE_RATES_2026,
} from "@/lib/taxConstants2026";

// YearEndTaxCalculator 기본 입력(총급여 5,000만)과 같은 값
const GROSS = 50_000_000;
const BASE: TaxInputs = {
  grossSalary: GROSS,
  prepaidTax: 2_500_000,
  nationalPension: Math.round(GROSS * INSURANCE_RATES_2026.NATIONAL_PENSION),
  healthInsurance: deriveAnnualHealthPremium(GROSS),
  employmentInsurance: Math.round(GROSS * INSURANCE_RATES_2026.EMPLOYMENT_INSURANCE),
  dependents: 1,
  disabledDependents: 0,
  seniorDependents: 0,
  housingSubscription: 0,
  mortgageInterest: 0,
  creditCard: 15_000_000,
  debitCardAndCash: 5_000_000,
  traditionalMarket: 0,
  publicTransport: 0,
  children: 0,
  birthsOrAdoptions: 0,
  pensionSavings: 0,
  irp: 0,
  lifeInsurance: 0,
  medicalExpenses: 0,
  educationExpenses: 0,
  donation: 0,
  monthlyRent: 0,
};

describe("연말정산 상세 분석 리포트 — 단계별 값", () => {
  it("기본 입력: 근로소득공제 1,225만·산출세액·세액공제가 실제 계산값이다", () => {
    const r = calculateYearEndTax(BASE);
    expect(r.earnedIncomeDeduction).toBe(12_250_000);
    expect(r.earnedIncomeDeduction).toBe(Math.round(earnedIncomeDeduction2026(GROSS)));
    expect(r.calculatedTax).toBe(calcIncomeTax2026(r.taxBase));
    // 근로소득세액공제 한도(총급여 5,000만 → 66만원)가 세액공제 합계에 들어간다 — 종전 표시는 0원
    expect(r.taxCredit).toBe(660_000);
    expect(r.calculatedTax).toBeGreaterThan(r.determinedTax);
    // 종전 역산식이 내던 값과 다르다
    expect(r.earnedIncomeDeduction).not.toBe(GROSS - r.taxBase - r.determinedTax);
  });

  it("리포트 산식이 원 단위로 닫힌다 (총급여 − 근로소득공제 − 소득공제 = 과세표준, 산출 − 공제 = 결정)", () => {
    const cases: Partial<TaxInputs>[] = [
      {},
      { grossSalary: 30_000_000, creditCard: 5_000_000, children: 2, monthlyRent: 6_000_000 },
      { grossSalary: 120_000_000, pensionSavings: 9_000_000, donation: 12_000_000 },
      // 공제가 근로소득금액·산출세액을 넘는 저소득 — 실제 반영분만 표시돼야 한다
      { grossSalary: 8_000_000, dependents: 4, pensionSavings: 9_000_000 },
    ];
    for (const c of cases) {
      const r = calculateYearEndTax({ ...BASE, ...c });
      expect(r.grossSalary - r.earnedIncomeDeduction - r.incomeDeduction).toBe(r.taxBase);
      expect(r.calculatedTax - r.taxCredit).toBe(r.determinedTax);
      expect(r.incomeDeduction).toBeGreaterThanOrEqual(0);
      expect(r.taxCredit).toBeGreaterThanOrEqual(0);
      expect(r.taxCredit).toBeLessThanOrEqual(r.calculatedTax);
      expect(r.finalRefund).toBe(Math.round((c.prepaidTax ?? BASE.prepaidTax) - r.determinedTax));
    }
  });

  it("컴포넌트는 결과에서 역산하지 않고 엔진 단계값을 표시한다", () => {
    const src = readFileSync(join(process.cwd(), "src/components/YearEndTaxCalculator.tsx"), "utf8");
    expect(src).not.toContain("inputs.grossSalary - result.taxBase - result.determinedTax");
    expect(src).not.toContain("inputs.prepaidTax - result.finalRefund - result.determinedTax");
    expect(src).toContain("result.earnedIncomeDeduction");
    expect(src).toContain("result.calculatedTax");
    expect(src).toContain("result.taxCredit");
  });
});
