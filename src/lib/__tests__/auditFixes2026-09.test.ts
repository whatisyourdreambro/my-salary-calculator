// src/lib/__tests__/auditFixes2026-09.test.ts
//
// 2026-09-06 전수검사에서 고친 계산 결함들의 회귀 가드.
import { describe, expect, it } from "vitest";

import { calculateSalary2026 } from "@/lib/TaxLogic";
import { calculateNetSalary } from "@/lib/calculator";
import {
  calculateSeverancePay,
  calculateDCseverance,
  serviceYearsFromDates,
} from "@/lib/severanceCalculator";
import { calculatePartTimeSalary } from "@/lib/freelancerCalculator";
import {
  calculateYearEndTax,
  deriveAnnualHealthPremium,
  type TaxInputs,
} from "@/lib/yearEndTaxCalculator";
import { INSURANCE_RATES_2026, PENSION_BASE_2026 } from "@/lib/taxConstants2026";
import { generateAnnualSalaryTableData2026 } from "@/lib/generateData2026";
import { generateAnnualSalaryTableData2027 } from "@/lib/generateData2027";

const NO_ADVANCED = { disabledDependents: 0, seniorDependents: 0, isSmeYouth: false };

describe("엔진 정합 — TaxLogic ↔ calculator", () => {
  // 종전에는 TaxLogic 이 근로소득세액공제 한도 판정에 비과세 포함 연봉을 넘겨,
  // 한도 임계값(3,300만·7,000만·1.2억) 바로 위 비과세 폭(240만) 구간에서
  // 두 엔진이 월 최대 14,655원까지 갈렸다.
  it("전 구간에서 두 엔진의 월 실수령 차이가 100원 미만(반올림 오차)", () => {
    let worst = 0;
    let worstAt = 0;
    for (let s = 20_000_000; s <= 200_000_000; s += 100_000) {
      const a = calculateSalary2026(s, 200_000, 1, 0).netPay;
      const b = calculateNetSalary(s, 2_400_000, 1, 0, NO_ADVANCED).monthlyNet;
      const d = Math.abs(a - b);
      if (d > worst) {
        worst = d;
        worstAt = s;
      }
    }
    // worstAt 은 실패 시 어느 연봉에서 갈렸는지 즉시 보이도록 메시지에 싣는다
    expect(worst, `최대 차이 지점: 연봉 ${worstAt.toLocaleString()}`).toBeLessThan(100);
  });

  it("2027 표의 실수령이 2026 표를 넘지 않는다 (요율은 2027이 더 높다)", () => {
    const t26 = generateAnnualSalaryTableData2026();
    const by27 = new Map(
      generateAnnualSalaryTableData2027().map((r) => [r.preTax, r.monthlyNet])
    );
    const inverted = t26
      .filter((r) => {
        const n27 = by27.get(r.preTax);
        return n27 !== undefined && n27 > r.monthlyNet;
      })
      .map((r) => r.preTax);
    expect(inverted).toEqual([]);
  });
});

describe("퇴직소득세 — 달력 기준 근속연수", () => {
  it("윤일을 지나는 정확히 N년 근속이 N+1년으로 부풀지 않는다", () => {
    // 2024-02-29 를 포함하는 정확히 2년
    expect(serviceYearsFromDates("2023-03-01", "2025-02-28")).toBe(2);
    // 윤일이 없는 정확히 2년 — 종전에도 맞았던 케이스
    expect(serviceYearsFromDates("2021-03-01", "2023-02-28")).toBe(2);
    // 1년 미만 端數는 1년으로 절상 (소득세법 §48①)
    expect(serviceYearsFromDates("2023-03-01", "2025-02-27")).toBe(2);
    expect(serviceYearsFromDates("2020-01-01", "2029-12-31")).toBe(10);
  });

  it("윤년 포함 여부로 근속연수공제가 갈리지 않는다", () => {
    const wage = [5_000_000, 5_000_000, 5_000_000];
    const leap = calculateSeverancePay("2023-03-01", "2025-02-28", wage);
    const nonLeap = calculateSeverancePay("2021-03-01", "2023-02-28", wage);
    expect(leap.details.serviceYearDeduction).toBe(2_000_000);
    expect(nonLeap.details.serviceYearDeduction).toBe(2_000_000);
    // 재직일수가 1일 다를 뿐이므로 세액 차이도 미미해야 한다(종전엔 35% 차이)
    expect(Math.abs(leap.incomeTax - nonLeap.incomeTax)).toBeLessThan(5_000);
  });
});

describe("DC형 퇴직연금 — 소수 근속연수", () => {
  it("재직 5일 차이로 적립금이 계단식으로 점프하지 않는다", () => {
    const a = calculateDCseverance(60_000_000, 3650, 5).estimatedDCseverance; // 정확히 10년
    const b = calculateDCseverance(60_000_000, 3655, 5).estimatedDCseverance; // 10년 5일
    expect(b).toBeGreaterThan(a); // 더 오래 다녔으니 더 많아야 하고
    expect(b - a).toBeLessThan(a * 0.02); // 점프가 아니라 비례 증가여야 한다
  });

  it("1.1년 근속이 2회 납입으로 계상되지 않는다", () => {
    const annual = 60_000_000 / 12; // 연 부담금
    const v = calculateDCseverance(60_000_000, 402, 5).estimatedDCseverance;
    expect(v).toBeLessThan(annual * 2); // 종전 값은 2회 납입(약 1,076만)이었다
    expect(v).toBeGreaterThan(annual); // 1년치보다는 많다
  });
});

describe("알바(4대보험) 탭 — 직장인과 같은 정본 세금 경로", () => {
  it("같은 월 소득에서 직장인 탭과 실수령이 사실상 일치", () => {
    for (const monthly of [2_000_000, 2_500_000, 3_000_000, 4_000_000, 5_000_000]) {
      const partTime = calculatePartTimeSalary(monthly, "part_time").netPay;
      const employee = calculateSalary2026(monthly * 12, 0, 1, 0).netPay;
      expect(Math.abs(partTime - employee)).toBeLessThan(100);
    }
  });

  it("프리랜서(3.3%) 탭은 그대로", () => {
    const r = calculatePartTimeSalary(3_000_000, "freelancer");
    expect(r.incomeTax).toBe(90_000);
    expect(r.localTax).toBe(9_000);
    expect(r.netPay).toBe(2_901_000);
  });
});

describe("연말정산 — 장기요양보험료 소득공제", () => {
  const inputs = (gross: number, health: number): TaxInputs => ({
    grossSalary: gross,
    prepaidTax: 0,
    nationalPension: Math.round(
      Math.min(
        Math.max(gross / 12, PENSION_BASE_2026.MIN_MONTHLY),
        PENSION_BASE_2026.MAX_MONTHLY
      ) *
        INSURANCE_RATES_2026.NATIONAL_PENSION *
        12
    ),
    healthInsurance: health,
    employmentInsurance: Math.round(gross * INSURANCE_RATES_2026.EMPLOYMENT_INSURANCE),
    dependents: 1,
    disabledDependents: 0,
    seniorDependents: 0,
    housingSubscription: 0,
    mortgageInterest: 0,
    creditCard: 0,
    debitCardAndCash: 0,
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
  });

  it("deriveAnnualHealthPremium 이 건보료 + 장기요양(13.14%)", () => {
    const gross = 50_000_000;
    const health = gross * INSURANCE_RATES_2026.HEALTH_INSURANCE;
    expect(deriveAnnualHealthPremium(gross)).toBe(
      Math.round(health + health * INSURANCE_RATES_2026.LONG_TERM_CARE_RATIO)
    );
  });

  it("장기요양보험료를 포함하면 결정세액이 낮아진다(환급 증가)", () => {
    for (const gross of [30_000_000, 50_000_000, 80_000_000, 120_000_000]) {
      const withoutLtc = calculateYearEndTax(
        inputs(gross, Math.round(gross * INSURANCE_RATES_2026.HEALTH_INSURANCE))
      ).determinedTax;
      const withLtc = calculateYearEndTax(
        inputs(gross, deriveAnnualHealthPremium(gross))
      ).determinedTax;
      expect(withLtc).toBeLessThan(withoutLtc);
    }
  });
});
