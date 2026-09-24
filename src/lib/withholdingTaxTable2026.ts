// src/lib/withholdingTaxTable2026.ts
//
// 근로소득 간이세액표 — 소득세법 시행령 [별표 2] <개정 2026. 2. 27.> (2026-03-01 지급분부터).
// 월 실수령 엔진(TaxLogic.calculateSalary2026·calculator.calculateNetSalaryWithRates)의
// 월 소득세는 이 모듈이 내는 '간이세액표 금액'이다 (2026-09-25 A17 CALC-01).
//
// 왜 표를 그대로 싣지 않고 산식인가: 표는 647행 × 가족 수 11열(7,117칸)이라 클라이언트
// 번들(홈 계산기·회사 페이지)에 싣기에 크다. 별표2 비고 1 은 표가 근로소득공제·기본공제·
// 특별소득공제 및 특별세액공제 중 일부·연금보험료공제·근로소득세액공제와 세율을 반영해
// 계산한 금액이라고 밝히고, '특별소득공제 등'의 산식을 싣는다. 이 모듈은 그 산식으로
// 각 구간의 중간값에서 세액을 다시 계산한다.
//
// ★ 검증: 별표2 원문 PDF(law.go.kr flSeq=164357181)의 7,117칸 전부와 대조했다.
//   7,110칸 일치, 7칸(월급여 116만·137.5만·139만·140.5만 구간의 1~2인)은 표가 10원 높다.
//   회귀 테스트: src/lib/__tests__/withholdingTaxTable2026.test.ts
//
// 표 산출 기준 중 현행 소득세법 수치와 다른 항목 — 표 금액을 재현하려면 이 값을 써야 한다
// (전 칸 역산으로 확정). 월 실수령 화면에 보이는 국민연금 공제액(4.75%, 월 659만 상한)과는
// 별개로, 표 '내부'의 연금보험료공제 가정일 뿐이다.
//   - 연금보험료공제: 월급여 × 4.5% (기준소득월액 상한 월 449만원, 10원 미만 절사) × 12
//   - 근로소득세액공제: 산출세액 50만원 이하 55%, 초과분 30%
//     한도 총급여 5,500만 이하 66만 / 7,000만 이하 66만 − (총급여 − 5,500만) × 1/2 (최저 63만) /
//     초과 63만 − (총급여 − 7,000만) × 1/2 (최저 50만)
//   - 월 세액 10원 미만 절사, 1,000원 미만은 표에 '-'(0원, 소득세법 §86 소액부징수)

import { earnedIncomeDeduction2026, TAX_BRACKETS_2026 } from "./taxConstants2026";
import { applySmeYouthReduction } from "./smbTaxBreak";

/** 표의 최저 월급여 — 이 금액 미만은 세액 0 (별표2 첫 행 770천원) */
export const WITHHOLDING_TABLE_MIN_MONTHLY_2026 = 770_000;

/** 별표2 비고 3 — 8세 이상 20세 이하 자녀 수별 공제액 (월, 원) */
export const WITHHOLDING_CHILD_DEDUCTION_2026 = {
  ONE: 20_830,
  TWO: 45_830,
  /** 2명 초과 자녀 1명당 */
  EACH_EXTRA: 33_330,
} as const;

/** 표 내부 산출 기준 (별표2 전 칸 역산 검증값 — 머리 주석 참조) */
const TABLE_BASIS = {
  PENSION_RATE: 0.045,
  PENSION_MONTHLY_CAP: 4_490_000,
  CREDIT_55_LIMIT: 500_000,
} as const;

/** 별표2 비고 1 — '특별소득공제 및 특별세액공제 중 일부' (총급여 1억2천만원 이하 구간) */
function specialDeduction(family: number, gross: number): number {
  if (family <= 1) {
    if (gross <= 30_000_000) return 3_100_000 + gross * 0.04;
    if (gross <= 45_000_000) return 3_100_000 + gross * 0.04 - (gross - 30_000_000) * 0.05;
    if (gross <= 70_000_000) return 3_100_000 + gross * 0.015;
    return 3_100_000 + gross * 0.005;
  }
  if (family === 2) {
    if (gross <= 30_000_000) return 3_600_000 + gross * 0.04;
    if (gross <= 45_000_000) return 3_600_000 + gross * 0.04 - (gross - 30_000_000) * 0.05;
    if (gross <= 70_000_000) return 3_600_000 + gross * 0.02;
    return 3_600_000 + gross * 0.01;
  }
  let base: number;
  if (gross <= 30_000_000) base = 5_000_000 + gross * 0.07;
  else if (gross <= 45_000_000) base = 5_000_000 + gross * 0.07 - (gross - 30_000_000) * 0.05;
  else if (gross <= 70_000_000) base = 5_000_000 + gross * 0.05;
  else base = 5_000_000 + gross * 0.03;
  // 3명 이상: + 연간 총급여액 중 4,000만원을 초과하는 금액의 4%
  return base + Math.max(0, gross - 40_000_000) * 0.04;
}

/**
 * 산출세액 — 누진세율표(taxConstants2026 정본 구간) 적용, 원 단위 반올림 없이.
 * calcIncomeTax2026 은 원 단위로 반올림하는데, 그 반올림을 넣으면 4칸(월 216만 1인 등)이
 * 표보다 10원 높아진다 — 표는 반올림 전 값으로 계산됐다.
 */
function progressiveTax(taxBase: number): number {
  if (taxBase <= 0) return 0;
  for (const b of TAX_BRACKETS_2026) {
    if (taxBase <= b.limit) return Math.max(0, taxBase * b.rate - b.deduction);
  }
  return 0;
}

/** 표 산출 기준의 근로소득세액공제 (머리 주석 참조) */
function tableEarnedIncomeCredit(calculatedTax: number, gross: number): number {
  const credit =
    calculatedTax <= TABLE_BASIS.CREDIT_55_LIMIT
      ? calculatedTax * 0.55
      : TABLE_BASIS.CREDIT_55_LIMIT * 0.55 + (calculatedTax - TABLE_BASIS.CREDIT_55_LIMIT) * 0.3;
  let limit: number;
  if (gross <= 55_000_000) limit = 660_000;
  else if (gross <= 70_000_000) limit = Math.max(630_000, 660_000 - (gross - 55_000_000) / 2);
  else limit = Math.max(500_000, 630_000 - (gross - 70_000_000) / 2);
  return Math.min(credit, limit);
}

/** 10원 미만 절사 — 부동소수점 오차(5,979.9999…)가 한 단계 내려가지 않게 0.001원 반올림 선행 */
const floorTo10 = (v: number) => Math.floor(Math.round(v * 1000) / 1000 / 10) * 10;

/** 월 세액 마무리 — 10원 미만 절사, 1,000원 미만은 0 (표의 '-', 소득세법 §86) */
const toMonthly = (annualTax: number) => {
  const tax = floorTo10(Math.max(0, annualTax) / 12);
  return tax < 1_000 ? 0 : tax;
};

export interface WithholdingOptions {
  /**
   * 표에 없는 추가 소득공제(장애인 추가공제 200만·경로우대 100만 등, 연 원).
   * 0(기본)이면 별표2 금액 그대로이고, 0 보다 크면 같은 산식에 공제를 더한 추정치다.
   */
  extraAnnualDeduction?: number;
  /**
   * 중소기업 취업자 소득세 감면(조특법 §30, 청년 90%·과세기간 200만 한도) 적용.
   * 표 산식의 산출세액에 감면을 적용하고 근로소득세액공제를 (1 − 감면/산출세액)으로 줄인다
   * (소득세법 §59③) — /calc/smb-income-tax-break 와 같은 헬퍼(applySmeYouthReduction).
   * 한도에 걸리지 않으면 결과는 간이세액 × 10% 와 같다(원천징수 시 감면율 적용).
   */
  smeYouth?: boolean;
}

/**
 * 표 한 칸의 산식 — 월급여 구간 중간값(또는 1,000만원) 기준, 자녀 공제 전의 연 세액.
 * 감면 미적용 시 결과를 12로 나눠 10원 미만 절사하면 별표2 금액이다.
 */
function cellAnnualTax(monthly: number, family: number, opts: Required<WithholdingOptions>): number {
  const gross = monthly * 12;
  const pension =
    Math.floor((Math.min(monthly, TABLE_BASIS.PENSION_MONTHLY_CAP) * TABLE_BASIS.PENSION_RATE) / 10) * 10 * 12;
  const taxBase = Math.max(
    0,
    gross -
      earnedIncomeDeduction2026(gross) -
      1_500_000 * family -
      specialDeduction(family, gross) -
      pension -
      opts.extraAnnualDeduction
  );
  const calculatedTax = progressiveTax(taxBase);
  const credit = tableEarnedIncomeCredit(calculatedTax, gross);
  if (!opts.smeYouth) return Math.max(0, calculatedTax - credit);
  const { reduction, creditAfter } = applySmeYouthReduction({ calculatedTax, earnedIncomeCredit: credit });
  return Math.max(0, calculatedTax - reduction - creditAfter);
}

/** 구간 중간값 — 77만~150만 5천원, 150만~300만 1만원, 300만~1,000만 2만원 단위 (별표2 구간) */
function bandMidpoint(monthly: number): number {
  const step = monthly < 1_500_000 ? 5_000 : monthly < 3_000_000 ? 10_000 : 20_000;
  return Math.floor(monthly / step) * step + step / 2;
}

/** 가족 수 1~11명 — 1,000만원 이하 구간 금액 */
function tableTaxUpTo10M(monthly: number, family: number, opts: Required<WithholdingOptions>): number {
  if (monthly < WITHHOLDING_TABLE_MIN_MONTHLY_2026) return 0;
  // 1,000만원 행은 구간이 아니라 1,000만원 그 자체
  const point = monthly >= 10_000_000 ? 10_000_000 : bandMidpoint(monthly);
  return toMonthly(cellAnnualTax(point, family, opts));
}

/** 별표2 '10,000천원 초과' 행 — (1,000만원 세액) + 가산액. 감면 미적용 월 세액 */
function tableTaxAbove10M(monthly: number, family: number, extra: number): number {
  const base = tableTaxUpTo10M(10_000_000, family, { extraAnnualDeduction: extra, smeYouth: false });
  let add: number;
  if (monthly <= 14_000_000) add = (monthly - 10_000_000) * 0.98 * 0.35 + 25_000;
  else if (monthly <= 28_000_000) add = 1_397_000 + (monthly - 14_000_000) * 0.98 * 0.38;
  else if (monthly <= 30_000_000) add = 6_610_600 + (monthly - 28_000_000) * 0.98 * 0.4;
  else if (monthly <= 45_000_000) add = 7_394_600 + (monthly - 30_000_000) * 0.4;
  else if (monthly <= 87_000_000) add = 13_394_600 + (monthly - 45_000_000) * 0.42;
  else add = 31_034_600 + (monthly - 87_000_000) * 0.45;
  return floorTo10(base + add);
}

/** 1,000만원 초과 구간의 표 산식 근로소득세액공제 — 총급여 1.2억 초과라 한도 최저치 50만원 */
const ABOVE_10M_TABLE_CREDIT = 500_000;

function tableTaxForFamily(monthly: number, family: number, opts: Required<WithholdingOptions>): number {
  if (monthly <= 10_000_000) return tableTaxUpTo10M(monthly, family, opts);
  const tax = tableTaxAbove10M(monthly, family, opts.extraAnnualDeduction);
  if (!opts.smeYouth) return tax;
  // 감면: 표 금액(연) = 산출세액 − 공제(50만) 이므로 산출세액을 되살려 같은 헬퍼를 적용
  const calculatedTax = tax * 12 + ABOVE_10M_TABLE_CREDIT;
  const { reduction, creditAfter } = applySmeYouthReduction({
    calculatedTax,
    earnedIncomeCredit: ABOVE_10M_TABLE_CREDIT,
  });
  return toMonthly(calculatedTax - reduction - creditAfter);
}

/** 별표2 비고 3 — 8세 이상 20세 이하 자녀 수별 공제액 */
export function withholdingChildDeduction2026(children: number): number {
  const n = Number.isFinite(children) ? Math.floor(children) : 0;
  if (n <= 0) return 0;
  if (n === 1) return WITHHOLDING_CHILD_DEDUCTION_2026.ONE;
  return WITHHOLDING_CHILD_DEDUCTION_2026.TWO + (n - 2) * WITHHOLDING_CHILD_DEDUCTION_2026.EACH_EXTRA;
}

/**
 * 근로소득 간이세액표 월 소득세 (원천징수 비율 100% — 근로자가 80%·120% 를 고를 수도 있다).
 *
 * @param monthlyTaxablePay 월급여액 — 비과세 및 학자금 제외 (원)
 * @param family 공제대상가족 수 — 본인·배우자 포함 (최소 1). 11명 초과는 비고 4 산식.
 * @param children 공제대상가족 중 8세 이상 20세 이하 자녀 수 (비고 3 공제)
 * @param options 추가공제·중소기업 청년 감면 (기본: 없음 = 별표2 금액 그대로)
 */
export function withholdingIncomeTax2026(
  monthlyTaxablePay: number,
  family: number = 1,
  children: number = 0,
  options: WithholdingOptions = {}
): number {
  if (!Number.isFinite(monthlyTaxablePay) || monthlyTaxablePay <= 0) return 0;
  const fam = Number.isFinite(family) ? Math.max(1, Math.floor(family)) : 1;
  const extra = options.extraAnnualDeduction;
  const opts: Required<WithholdingOptions> = {
    extraAnnualDeduction: extra !== undefined && Number.isFinite(extra) ? Math.max(0, extra) : 0,
    smeYouth: options.smeYouth === true,
  };

  let tax: number;
  if (fam <= 11) {
    tax = tableTaxForFamily(monthlyTaxablePay, fam, opts);
  } else {
    // 비고 4: (11명 세액) − (10명 세액 − 11명 세액) × 11명을 초과하는 가족 수
    const t11 = tableTaxForFamily(monthlyTaxablePay, 11, opts);
    const t10 = tableTaxForFamily(monthlyTaxablePay, 10, opts);
    tax = Math.max(0, t11 - (t10 - t11) * (fam - 11));
  }
  // 비고 3: 자녀 공제 후 음수면 0원
  return Math.max(0, tax - withholdingChildDeduction2026(children));
}
