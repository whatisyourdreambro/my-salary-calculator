// 2026 세법 경계값·엔진 회귀 테스트 (2026-08 대규모 점검 도입)
//
// 목적: 2027 요율 개정 때 taxConstants2026 정본과 각 엔진이 함께 움직이는지,
// 경계값(세율 구간·연금 상한·공제 캡)이 회귀하지 않는지 잡는다.
// golden 값은 현행법 기준 — 법 개정으로 의도적으로 바뀌면 함께 갱신할 것.
import { describe, it, expect } from "vitest";

import {
  TAX_BRACKETS_2026,
  INSURANCE_RATES_2026,
  PENSION_BASE_2026,
  RENT_CREDIT_2026,
  earnedIncomeDeduction2026,
  calcIncomeTax2026,
  earnedIncomeTaxCredit2026,
  childTaxCredit2026,
} from "@/lib/taxConstants2026";
import {
  calculateNetSalary,
  calculateNetSalary2026,
} from "@/lib/calculator";
import { krSocialInsurance } from "@/lib/global/taxEngine";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { generateAnnualSalaryTableData2026 } from "@/lib/generateData2026";
import {
  generateWeeklyPayTableData2026,
  generateHourlyWageTableData2026,
} from "@/lib/generateData";
import { calculateYearEndTax, type TaxInputs } from "@/lib/yearEndTaxCalculator";
import { calculatePartTimeSalary } from "@/lib/freelancerCalculator";
import { calcBonusNet } from "@/lib/bonusTaxCalc";
import { isStaticSalaryAmount } from "@/lib/salaryStaticParams";

const adv = { isSmeYouth: false, disabledDependents: 0, seniorDependents: 0 };

describe("누진세율표 (소득세법 §55)", () => {
  it("구간 경계에서 산출세액이 연속이다 (누진공제 정합)", () => {
    // 각 구간 상한에서 rate×limit-deduction 이 다음 구간 식과 일치해야 함
    for (let i = 0; i < TAX_BRACKETS_2026.length - 1; i++) {
      const b = TAX_BRACKETS_2026[i];
      const next = TAX_BRACKETS_2026[i + 1];
      const atLimit = b.limit * b.rate - b.deduction;
      const atLimitNext = b.limit * next.rate - next.deduction;
      expect(Math.abs(atLimit - atLimitNext)).toBeLessThan(1);
    }
  });

  it("경계값 산출세액", () => {
    expect(calcIncomeTax2026(14_000_000)).toBe(840_000);
    expect(calcIncomeTax2026(50_000_000)).toBe(6_240_000);
    expect(calcIncomeTax2026(88_000_000)).toBe(15_360_000);
    expect(calcIncomeTax2026(150_000_000)).toBe(37_060_000);
    expect(calcIncomeTax2026(0)).toBe(0);
    expect(calcIncomeTax2026(-1)).toBe(0);
  });
});

describe("근로소득공제 (소득세법 §47)", () => {
  it("2,000만원 캡이 연봉 3.625억에서 정확히 도달한다", () => {
    expect(earnedIncomeDeduction2026(362_500_000)).toBe(20_000_000);
    expect(earnedIncomeDeduction2026(400_000_000)).toBe(20_000_000);
    expect(earnedIncomeDeduction2026(1_000_000_000)).toBe(20_000_000);
  });
  it("구간 경계", () => {
    expect(earnedIncomeDeduction2026(5_000_000)).toBe(3_500_000);
    expect(earnedIncomeDeduction2026(15_000_000)).toBe(7_500_000);
    expect(earnedIncomeDeduction2026(45_000_000)).toBe(12_000_000);
    expect(earnedIncomeDeduction2026(100_000_000)).toBe(14_750_000);
  });
});

describe("자녀세액공제 (소득세법 §59의2, 2025 개정)", () => {
  it("첫째 25만·둘째 30만·셋째 이상 각 40만", () => {
    expect(childTaxCredit2026(0)).toBe(0);
    expect(childTaxCredit2026(1)).toBe(250_000);
    expect(childTaxCredit2026(2)).toBe(550_000);
    expect(childTaxCredit2026(3)).toBe(950_000);
    expect(childTaxCredit2026(4)).toBe(1_350_000);
  });
});

describe("근로소득세액공제 (소득세법 §59)", () => {
  it("총급여 구간별 한도", () => {
    // 한도 없는 구간 (3,300만 이하)
    expect(earnedIncomeTaxCredit2026(1_300_000, 30_000_000)).toBe(715_000);
    // 74만 한도 (3,300만 초과 ~ 7,000만)
    expect(earnedIncomeTaxCredit2026(2_000_000, 50_000_000)).toBe(740_000);
    // 66만 한도 (7,000만 초과 ~ 1.2억)
    expect(earnedIncomeTaxCredit2026(2_000_000, 80_000_000)).toBe(660_000);
    // 50만 한도 (1.2억 초과)
    expect(earnedIncomeTaxCredit2026(2_000_000, 130_000_000)).toBe(500_000);
    // 55% 구간
    expect(earnedIncomeTaxCredit2026(1_000_000, 30_000_000)).toBe(550_000);
  });
});

describe("글로벌 엔진 4대보험 (global/taxEngine.ts)", () => {
  it("국민연금 하한 클램프 — 월 소득이 하한 미만이어도 하한 기준 부과", () => {
    const gross = 3_000_000; // 월 25만 < 하한 41만
    const expected =
      PENSION_BASE_2026.MIN_MONTHLY *
        12 *
        INSURANCE_RATES_2026.NATIONAL_PENSION +
      gross *
        INSURANCE_RATES_2026.HEALTH_INSURANCE *
        (1 + INSURANCE_RATES_2026.LONG_TERM_CARE_RATIO) +
      gross * INSURANCE_RATES_2026.EMPLOYMENT_INSURANCE;
    expect(krSocialInsurance(gross)).toBeCloseTo(expected, 6);
  });

  it("0 이하 소득은 4대보험 0 (하한이 음수·0 소득에 부과되지 않는다)", () => {
    expect(krSocialInsurance(0)).toBe(0);
    expect(krSocialInsurance(-1_000_000)).toBe(0);
  });
});

describe("실수령액 엔진 (calculator.ts 단일 코어)", () => {
  it("calculateNetSalary2026 은 calculateNetSalary 의 alias 다", () => {
    expect(calculateNetSalary2026).toBe(calculateNetSalary);
  });

  it("국민연금 기준소득월액 상한이 적용된다", () => {
    const r = calculateNetSalary(200_000_000, 0, 1, 0, adv);
    expect(r.pension).toBe(
      Math.round(
        PENSION_BASE_2026.MAX_MONTHLY * INSURANCE_RATES_2026.NATIONAL_PENSION
      )
    ); // 6,590,000 × 4.75% = 313,025
  });

  it("국민연금 기준소득월액 하한(월 41만)이 적용된다", () => {
    // 연 300만 = 월 25만 < 하한 41만 → 하한 기준으로 부과 (2026-08 P2 경계 수정)
    const r = calculateNetSalary(3_000_000, 0, 1, 0, adv);
    expect(r.pension).toBe(
      Math.round(
        PENSION_BASE_2026.MIN_MONTHLY * INSURANCE_RATES_2026.NATIONAL_PENSION
      )
    ); // 410,000 × 4.75% = 19,475
  });

  it("하한 경계(월 41만 정확히)에서는 실소득 기준과 하한 기준이 일치한다", () => {
    const annual = PENSION_BASE_2026.MIN_MONTHLY * 12; // 4,920,000
    const r = calculateNetSalary(annual, 0, 1, 0, adv);
    expect(r.pension).toBe(
      Math.round(
        PENSION_BASE_2026.MIN_MONTHLY * INSURANCE_RATES_2026.NATIONAL_PENSION
      )
    );
  });

  it("자녀 2명 = 자녀 0명 대비 연 55만원(월 반영분) 세액 감소", () => {
    const c0 = calculateNetSalary(60_000_000, 0, 1, 0, adv);
    const c2 = calculateNetSalary(60_000_000, 0, 1, 2, adv);
    const annualDelta =
      (c0.incomeTax - c2.incomeTax + (c0.localTax - c2.localTax)) * 12;
    // 소득세 55만 + 지방세 5.5만 = 60.5만 (월 라운딩 오차 ±24원 허용)
    expect(Math.abs(annualDelta - 605_000)).toBeLessThanOrEqual(24);
  });

  it("0 이하 입력은 0 결과", () => {
    expect(calculateNetSalary(0, 0, 1, 0, adv).monthlyNet).toBe(0);
    expect(calculateNetSalary(-1, 0, 1, 0, adv).monthlyNet).toBe(0);
  });
});

describe("/table/2026 표 데이터 (generateData2026 — 정식 엔진 통일)", () => {
  const rows = generateAnnualSalaryTableData2026();

  it("격자 불변: 2,400만~2억 100만 단위 177행", () => {
    expect(rows.length).toBe(177);
    expect(rows[0].preTax).toBe(24_000_000);
    expect(rows[rows.length - 1].preTax).toBe(200_000_000);
  });

  it("golden 행 값 (상세 페이지와 동일 엔진·식대 20만 기준 — 2026-08-30 통일)", () => {
    const at = (p: number) => rows.find((r) => r.preTax === p)!;
    expect(at(30_000_000).monthlyNet).toBe(2_233_220);
    expect(at(50_000_000).monthlyNet).toBe(3_528_576);
    expect(at(100_000_000).monthlyNet).toBe(6_495_113);
  });

  it("표 행 = 상세 페이지(/salary/[amount]) 값과 정확히 일치 (같은 함수·같은 기준)", () => {
    const r = rows.find((x) => x.preTax === 50_000_000)!;
    const core = calculateSalary2026(50_000_000, 200_000, 1, 0);
    expect(r.health).toBe(core.healthInsurance + core.longTermCare);
    expect(r.incomeTax).toBe(core.incomeTax + core.localIncomeTax);
    expect(r.monthlyNet).toBe(core.netPay);
    expect(r.totalDeduction).toBe(core.totalDeductions);
  });

  it("changeValue(전년비)는 요율 인상으로 전 구간 음수", () => {
    expect(rows.every((r) => r.changeValue < 0)).toBe(true);
  });

  it("실수령액은 연봉에 대해 단조 증가", () => {
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].monthlyNet).toBeGreaterThan(rows[i - 1].monthlyNet);
    }
  });

  it("표 행 링크가 전부 /salary SSG 집합 안에 있다 (내부 404 방지)", () => {
    expect(rows.every((r) => isStaticSalaryAmount(r.preTax))).toBe(true);
    expect(
      generateWeeklyPayTableData2026().every((r) =>
        isStaticSalaryAmount(Math.round(r.preTax * 52))
      )
    ).toBe(true);
    expect(
      generateHourlyWageTableData2026().every((r) =>
        isStaticSalaryAmount(Math.round(r.preTax * 209 * 12))
      )
    ).toBe(true);
  });
});

describe("연말정산 엔진 (yearEndTaxCalculator)", () => {
  const base: TaxInputs = {
    grossSalary: 60_000_000,
    prepaidTax: 3_000_000,
    nationalPension: 2_400_000,
    healthInsurance: 2_000_000,
    employmentInsurance: 500_000,
    dependents: 1,
    disabledDependents: 0,
    seniorDependents: 0,
    housingSubscription: 0,
    mortgageInterest: 0,
    creditCard: 12_000_000,
    debitCardAndCash: 3_000_000,
    traditionalMarket: 0,
    publicTransport: 500_000,
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

  it("자녀세액공제가 결정세액에 정확히 반영된다 (25/55/95만)", () => {
    const t0 = calculateYearEndTax(base).determinedTax;
    expect(t0 - calculateYearEndTax({ ...base, children: 1 }).determinedTax).toBe(250_000);
    expect(t0 - calculateYearEndTax({ ...base, children: 2 }).determinedTax).toBe(550_000);
    expect(t0 - calculateYearEndTax({ ...base, children: 3 }).determinedTax).toBe(950_000);
  });

  it("월세 세액공제 — 한도 1,000만·총급여 구간별 17%/15%/0%", () => {
    const rent = (grossSalary: number) => {
      const without = calculateYearEndTax({ ...base, grossSalary }).determinedTax;
      const withRent = calculateYearEndTax({
        ...base,
        grossSalary,
        monthlyRent: 12_000_000, // 한도 초과 입력 → 1,000만까지만 공제
      }).determinedTax;
      return without - withRent;
    };
    expect(rent(55_000_000)).toBeCloseTo(
      RENT_CREDIT_2026.CAP * RENT_CREDIT_2026.RATE_HIGH, 0 // 170만
    );
    expect(rent(60_000_000)).toBeCloseTo(
      RENT_CREDIT_2026.CAP * RENT_CREDIT_2026.RATE_LOW, 0 // 150만
    );
    expect(rent(90_000_000)).toBe(0); // 총급여 8,000만 초과 — 대상 아님
  });
});

describe("프리랜서/알바 계산기 (freelancerCalculator)", () => {
  it("3.3% 분기 — 소득세 3% + 지방세 0.3%", () => {
    const r = calculatePartTimeSalary(1_000_000, "freelancer");
    expect(r.incomeTax).toBe(30_000);
    expect(r.localTax).toBe(3_000);
    expect(r.netPay).toBe(967_000);
    expect(r.longTermCare).toBe(0);
  });

  it("4대보험 분기 — 장기요양보험 포함 (2026-08 누락 보완 회귀 방지)", () => {
    const income = 2_500_000;
    const r = calculatePartTimeSalary(income, "part_time");
    const expectedLtc = Math.round(
      income *
        INSURANCE_RATES_2026.HEALTH_INSURANCE *
        INSURANCE_RATES_2026.LONG_TERM_CARE_RATIO
    );
    expect(r.longTermCare).toBe(expectedLtc);
    expect(r.longTermCare).toBeGreaterThan(0);
  });
});

describe("성과급 세후 계산 (bonusTaxCalc)", () => {
  it("본인 연봉이 국민연금 연 상한(7,908만) 이상이면 성과급 연금 추가 부과 0", () => {
    const r = calcBonusNet(100_000_000, 20_000_000);
    expect(r.pensionDelta).toBe(0);
  });
  it("상한 미달이면 남은 여지만큼만 부과된다", () => {
    const salary = 70_000_000;
    const bonus = 20_000_000;
    const room = PENSION_BASE_2026.MAX_ANNUAL - salary; // 9,080,000
    const r = calcBonusNet(salary, bonus);
    expect(r.pensionDelta).toBe(
      Math.round(room * INSURANCE_RATES_2026.NATIONAL_PENSION)
    );
  });
});

describe("엔진 간 합치성", () => {
  it("TaxLogic(월급 기준)과 calculator(연봉 기준)의 4대보험이 같은 가정에서 일치한다", () => {
    // 비과세 0 가정으로 통일하면 두 엔진의 보험료 산식이 동일해야 함
    const salary = 60_000_000;
    const a = calculateSalary2026(salary, 0, 1, 0);
    const b = calculateNetSalary(salary, 0, 1, 0, adv);
    // TaxLogic 은 10원 절사, calculator 는 반올림 — 10원 이내 일치 허용
    expect(Math.abs(a.nationalPension - b.pension)).toBeLessThanOrEqual(10);
    expect(Math.abs(a.healthInsurance - b.health)).toBeLessThanOrEqual(10);
    expect(Math.abs(a.employmentInsurance - b.employment)).toBeLessThanOrEqual(10);
  });
});
