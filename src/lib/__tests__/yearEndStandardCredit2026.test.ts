// src/lib/__tests__/yearEndStandardCredit2026.test.ts
//
// 2026년 귀속 연말정산 엔진 — 표준세액공제 비교(소득세법 §59의4⑨1).
// 표준세액공제 방식: §52 특별소득공제(건강·장기요양·고용보험료)·§59의4①~④ 특별세액공제(보장성보험·의료비·
// 교육비·기부금)·조특법 §95의2 월세를 빼고 연 13만원. 국민연금·인적·카드·청약 소득공제와 근로소득·자녀·
// 출산입양·연금계좌·혼인·고향사랑 세액공제는 두 방식 모두에 남는다. 엔진은 결정세액이 낮은 쪽을 쓴다.
// 기대값은 /guides/standard-vs-special-deduction-2026 표(같은 엔진, 2026-09-26)와 같다.
// B24 (2026-11-01, 650a826ff/70cc5bf04 엔진 포팅): 주택청약 총급여 7천만원 요건(조특법 §87② — 조특법 소득공제라
// 두 방식 모두에 남는다)과 그 밖의 부양가족 의료비 700만원 한도(소득세법 §59의4②1 — 특별세액공제라 특별공제 방식만).
import { describe, expect, it } from "vitest";
import {
  calculateYearEndTax,
  deriveAnnualSocialInsurance2026,
  type TaxInputs,
} from "@/lib/yearEndTaxCalculator";
import {
  HOUSING_SUBSCRIPTION_DEDUCTION_2026,
  MEDICAL_CREDIT_2026,
  STANDARD_TAX_CREDIT_2026,
} from "@/lib/taxConstants2026";

const plain = (grossSalary: number): TaxInputs => ({
  grossSalary,
  prepaidTax: 0,
  ...deriveAnnualSocialInsurance2026(grossSalary),
  dependents: 1,
  disabledDependents: 0,
  seniorDependents: 0,
  housingSubscription: 0,
  creditCard: 0,
  debitCardAndCash: 0,
  traditionalMarket: 0,
  publicTransport: 0,
  children: 0,
  childTaxCreditEligibleChildren: 0,
  birthsOrAdoptions: 0,
  pensionSavings: 0,
  irp: 0,
  lifeInsurance: 0,
  medicalExpenses: 0,
  educationExpenses: 0,
  donation: 0,
  monthlyRent: 0,
});

describe("표준세액공제 13만원 비교 (소득세법 §59의4⑨1)", () => {
  it("상수는 연 13만원", () => {
    expect(STANDARD_TAX_CREDIT_2026.WAGE_EARNER).toBe(130_000);
  });

  // 총급여 → [결정세액, 표준세액공제 적용 여부] — 가이드 표와 같은 값 (1인, 다른 공제 없음)
  const CASES: [number, number, boolean][] = [
    [10_000_000, 0, true],
    [15_000_000, 12_763, true],
    [20_000_000, 121_100, true],
    [25_000_000, 229_438, true], // 가이드 표도 229,438원 (2026-11-01 PKG-23 이 엔진 값으로 맞춤 — 종전 229,437원은 13만원 공제 뒤 반올림 1원 차)
    [30_000_000, 482_125, true],
    [40_000_000, 1_560_457, false],
    [50_000_000, 2_788_696, false],
    [70_000_000, 5_347_175, false],
  ];
  it.each(CASES)("총급여 %i원 → 결정세액 %i원 (표준 %s)", (gross, determined, standard) => {
    const r = calculateYearEndTax(plain(gross));
    expect(r.determinedTax).toBe(determined);
    expect(r.standardTaxCreditApplied).toBe(standard);
    // 리포트 산식이 고른 방식 기준으로 원 단위로 맞는다
    expect(gross - r.earnedIncomeDeduction - r.incomeDeduction).toBe(r.taxBase);
    expect(r.calculatedTax - r.taxCredit).toBe(r.determinedTax);
  });

  it("보장성보험료·월세 세액공제가 있으면 특별공제 방식이 이긴다", () => {
    const insured = calculateYearEndTax({ ...plain(30_000_000), lifeInsurance: 500_000 });
    expect(insured.standardTaxCreditApplied).toBe(false);
    expect(insured.determinedTax).toBe(501_848 - 60_000);
    const rent = calculateYearEndTax({ ...plain(30_000_000), monthlyRent: 1_000_000 });
    expect(rent.standardTaxCreditApplied).toBe(false);
    expect(rent.determinedTax).toBe(501_848 - 170_000);
  });

  it("일반·특례 기부금은 표준세액공제와 함께 받지 못한다 — 10만원이면 표준이 여전히 낫다", () => {
    const r = calculateYearEndTax({ ...plain(30_000_000), donation: 100_000 });
    expect(r.standardTaxCreditApplied).toBe(true);
    expect(r.determinedTax).toBe(482_125);
  });

  it("카드·연금계좌·고향사랑은 두 방식 모두에 들어간다", () => {
    // /year-end-tax 기본 카드(신용 1,500만·체크 500만): 특별 249,970 vs 표준 153,500 (가이드 '96,470원 유리')
    const cards = calculateYearEndTax({ ...plain(25_000_000), creditCard: 15_000_000, debitCardAndCash: 5_000_000 });
    expect(cards.standardTaxCreditApplied).toBe(true);
    expect(cards.determinedTax).toBe(153_500);
    const irp = calculateYearEndTax({ ...plain(30_000_000), irp: 1_000_000 });
    expect(irp.standardTaxCreditApplied).toBe(true);
    expect(irp.determinedTax).toBe(482_125 - 150_000);
    const hometown = calculateYearEndTax({ ...plain(30_000_000), hometownDonation: 100_000 });
    expect(hometown.standardTaxCreditApplied).toBe(true);
    expect(hometown.determinedTax).toBe(Math.round(482_125 - 100_000 * (100 / 110)));
  });

  it("기납부세액이 같으면 환급은 결정세액이 줄어든 만큼 는다", () => {
    const prepaid = 427_200;
    const r = calculateYearEndTax({ ...plain(30_000_000), prepaidTax: prepaid });
    expect(r.finalRefund).toBe(prepaid - 482_125);
  });
});

describe("엔진 한도 (B24 — 650a826ff 포팅): 주택청약 총급여 7천만원·그 밖의 부양가족 의료비 700만원", () => {
  const drop = (p: Partial<TaxInputs>, from: TaxInputs) =>
    calculateYearEndTax(from).determinedTax - calculateYearEndTax({ ...from, ...p }).determinedTax;

  it("주택청약: 연 300만원 한도 40% 소득공제, 총급여 7천만원 초과는 0 (조특법 §87②)", () => {
    expect(HOUSING_SUBSCRIPTION_DEDUCTION_2026).toEqual({ LIMIT: 3_000_000, RATE: 0.4, SALARY_CAP: 70_000_000 });
    expect(drop({ housingSubscription: 3_000_000 }, plain(50_000_000))).toBe(180_000);
    expect(drop({ housingSubscription: 5_000_000 }, plain(50_000_000))).toBe(180_000);
    expect(drop({ housingSubscription: 3_000_000 }, plain(70_000_000))).toBe(180_000);
    expect(drop({ housingSubscription: 3_000_000 }, plain(70_000_001))).toBe(0);
    expect(drop({ housingSubscription: 3_000_000 }, plain(100_000_000))).toBe(0);
  });

  it("주택청약 공제는 표준세액공제 방식에도 남는다 — 3,000만원 1인은 표준 방식 그대로 결정세액이 준다", () => {
    // 손계산: 표준 방식 과세표준 17,325,000 − 120만 = 16,125,000 → 산출 1,158,750 − 근로소득세액공제 55% 637,312.5
    // − 13만 = 391,437.5 → 391,438. 특별공제 방식(14,634,785 → 420,848)보다 낮아 표준 방식을 쓴다.
    const r = calculateYearEndTax({ ...plain(30_000_000), housingSubscription: 3_000_000 });
    expect(r.standardTaxCreditApplied).toBe(true);
    expect(r.determinedTax).toBe(391_438);
    expect(r.taxBase).toBe(16_125_000);
  });

  it("의료비: 본인 등은 3% 초과분 한도 없이, 그 밖의 부양가족은 3% 초과분 연 700만원까지 15% (소득세법 §59의4②)", () => {
    const base = plain(50_000_000); // 3% 문턱 150만원
    expect(MEDICAL_CREDIT_2026.DEPENDENT_CAP).toBe(7_000_000);
    expect(drop({ medicalExpenses: 20_000_000 }, base)).toBe(2_775_000);
    expect(drop({ medicalExpensesGeneral: 10_000_000 }, base)).toBe(1_050_000);
    expect(drop({ medicalExpensesGeneral: 1_000_000, medicalExpenses: 3_000_000 }, base)).toBe(375_000);
    expect(drop({ medicalExpensesGeneral: 20_000_000, medicalExpenses: 3_000_000 }, base)).toBe(1_500_000);
    expect(drop({ medicalExpenses: 4_000_000, medicalExpensesGeneral: 0 }, base)).toBe(drop({ medicalExpenses: 4_000_000 }, base));
  });

  it("그 밖의 부양가족 의료비는 특별세액공제라 표준 방식과 비교한 뒤에만 들어간다 (3,000만원 1인)", () => {
    // 문턱 90만원: 200만 → (200만 − 90만) × 15% = 165,000 → 특별 501,848 − 165,000 = 336,848 < 표준 482,125
    const some = calculateYearEndTax({ ...plain(30_000_000), medicalExpensesGeneral: 2_000_000 });
    expect(some.standardTaxCreditApplied).toBe(false);
    expect(some.determinedTax).toBe(336_848);
    expect(some.breakdown.medicalCredit).toBe(165_000);
    // 문턱 이하면 특별공제 방식에 보탤 것이 없어 표준 방식 그대로, 상세 행의 의료비도 0
    const below = calculateYearEndTax({ ...plain(30_000_000), medicalExpensesGeneral: 900_000 });
    expect(below.standardTaxCreditApplied).toBe(true);
    expect(below.determinedTax).toBe(482_125);
    expect(below.breakdown.medicalCredit).toBe(0);
  });
});
