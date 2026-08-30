// src/lib/smbTaxBreak.ts
//
// 중소기업 취업자 소득세 감면(조세특례제한법 제30조) 계산 — /calc/smb-income-tax-break 전용.
//
// ★산출세액 흐름은 제3 로직 신설 없이 정본 엔진을 그대로 재사용한다:
//   src/lib/calculator.ts 의 근로소득 산출세액 흐름과 동일하게, 단일 진실 소스
//   taxConstants2026 의 earnedIncomeDeduction2026(근로소득공제) → 과세표준 →
//   calcIncomeTax2026(산출세액) → earnedIncomeTaxCredit2026(근로소득세액공제)를
//   호출한다. 연금보험료공제도 동일 정본 상수(INSURANCE_RATES_2026·
//   PENSION_BASE_2026, 2026-07 상·하한)로 산출한다. 세율·요율 개정 시
//   taxConstants2026 한 파일만 고치면 이 계산기도 일괄 반영된다.
//
// 법적 근거 (전부 법령 확정값 — 추정 없음):
// - 조특법 §30①: 감면율·기간 — 청년(근로계약 체결일 현재 만 15~34세, 병역
//   이행기간 최대 6년 차감) 90%·5년 / 60세 이상·장애인·경력단절여성 70%·3년.
//   감면 한도: 과세기간당 200만원. 적용기한: 2026-12-31까지 취업(재취업 포함)분.
//   // 갱신 슬롯: 2026-12 세법개정 — 일몰 연장 여부(전례 3회 연장, 연장 시 막차 문구 즉시 교체)
// - 소득세법 §59③: 조특법 §30 감면을 받는 경우 근로소득세액공제액은
//   공제액 × (1 − 감면세액/산출세액) 으로 축소된다(연동 규정).
//   ★이 축소를 반영하지 않으면 홈택스·연말정산 결과와 불일치한다.
//
// 근사 단순화(결과 화면에 명시): 급여 전액이 감면대상 중소기업 근로 제공분이라고
// 가정하고, 소득·세액공제는 기본 인적공제와 국민연금 연금보험료공제만 반영한다
// (신용카드·월세·보험료·의료비·자녀세액공제 등 미반영). 감면기간 총액은 연봉이
// 기간 내 동일하다는 가정의 추정치다.

import {
  INSURANCE_RATES_2026,
  PENSION_BASE_2026,
  earnedIncomeDeduction2026,
  calcIncomeTax2026,
  earnedIncomeTaxCredit2026,
} from "./taxConstants2026";

/** 감면 대상 유형 — youth: 청년 / other: 60세 이상·장애인·경력단절여성 */
export type SmbBreakType = "youth" | "other";

/** 조특법 §30① 감면율·감면기간 (2026년 현행) */
export const SMB_BREAK_RULES: Record<
  SmbBreakType,
  { rate: number; years: number; label: string }
> = {
  youth: { rate: 0.9, years: 5, label: "청년 (만 15~34세)" },
  other: { rate: 0.7, years: 3, label: "60세 이상·장애인·경력단절여성" },
};

/** 감면 한도 — 과세기간(1년)당 200만원 (조특법 §30①) */
export const SMB_BREAK_CAP_PER_YEAR = 2_000_000;

/** 청년 연령 요건 (근로계약 체결일 현재, 병역 차감 후) */
export const YOUTH_MIN_AGE = 15;
export const YOUTH_MAX_AGE = 34;
/** 병역 이행기간 차감 한도 — 6년(72개월) */
export const YOUTH_MILITARY_DEDUCT_MAX_MONTHS = 72;

/**
 * 병역 이행기간(최대 6년) 차감 후 환산 연령 — 조특법 시행령 §27①.
 * 환산 연령이 YOUTH_MAX_AGE(34) 이하이면 청년 요건 충족.
 */
export function youthAdjustedAge(ageYears: number, militaryMonths: number): number {
  const deductYears =
    Math.min(Math.max(militaryMonths, 0), YOUTH_MILITARY_DEDUCT_MAX_MONTHS) / 12;
  return ageYears - deductYears;
}

export interface SmbTaxBreakInput {
  /** 연봉 — 총급여 기준 (비과세 급여 제외, 원) */
  annualSalary: number;
  /** 기본공제 인원 (본인 포함, 최소 1) */
  dependents: number;
  /** 감면 대상 유형 */
  breakType: SmbBreakType;
}

export interface SmbTaxBreakResult {
  /** 근로소득공제 (소득세법 §47) */
  earnedIncomeDeduction: number;
  /** 과세표준 (총급여 − 근로소득공제 − 인적공제 − 연금보험료공제) */
  taxBase: number;
  /** 근로소득 산출세액 (소득세법 §55 누진세율) */
  calculatedTax: number;
  /** 감면세액 (조특법 §30 — 산출세액 × 감면율, 한도 200만) */
  reduction: number;
  /** 감면율 (0.9 | 0.7) */
  rate: number;
  /** 200만원 한도에 걸렸는지 여부 */
  reductionCapped: boolean;
  /** 근로소득세액공제 — 감면 미적용 시 (소득세법 §59①②) */
  creditBefore: number;
  /** 근로소득세액공제 — 연동 축소 후 (소득세법 §59③) */
  creditAfter: number;
  /** 결정세액(근사) — 감면 미적용 시 */
  finalTaxWithout: number;
  /** 결정세액(근사) — 감면 적용 시 */
  finalTaxWith: number;
  /** 연간 절감 소득세 */
  savedIncomeTax: number;
  /** 연간 절감 지방소득세 (소득세의 10%) */
  savedLocalTax: number;
  /** 연간 총 절감액 (소득세 + 지방소득세) */
  savedAnnualTotal: number;
  /** 감면기간 (년) */
  years: number;
  /** 감면기간 총 절감액 추정 (연봉 동일 가정) */
  savedPeriodTotal: number;
}

export function computeSmbTaxBreak(input: SmbTaxBreakInput): SmbTaxBreakResult {
  const annual = Math.max(0, input.annualSalary);
  const dependents = Math.max(1, Math.floor(input.dependents || 1));
  const rule = SMB_BREAK_RULES[input.breakType];

  // ── 이하 5단계는 calculator.ts(calculateNetSalaryWithRates)의 산출세액 흐름과
  //    동일 — 총급여 입력 전제(비과세 0)로 정본 함수를 그대로 호출한다.
  const earnedIncomeDeduction = earnedIncomeDeduction2026(annual);
  const personalDeduction = dependents * 1_500_000; // 기본공제 1인 150만 (소득세법 §50)
  const monthly = annual / 12;
  const pensionBase = Math.min(
    Math.max(monthly, PENSION_BASE_2026.MIN_MONTHLY),
    PENSION_BASE_2026.MAX_MONTHLY
  );
  const pensionDeduction =
    annual > 0 ? pensionBase * INSURANCE_RATES_2026.NATIONAL_PENSION * 12 : 0;
  const taxBase = Math.max(
    0,
    annual - earnedIncomeDeduction - personalDeduction - pensionDeduction
  );
  const calculatedTax = calcIncomeTax2026(taxBase);

  // ── 조특법 §30: 감면세액 = 산출세액 × 감면율 (급여 전액 감면대상 가정), 한도 200만
  const rawReduction = calculatedTax * rule.rate;
  const reduction = Math.min(Math.round(rawReduction), SMB_BREAK_CAP_PER_YEAR);
  const reductionCapped = rawReduction > SMB_BREAK_CAP_PER_YEAR;

  // ── 소득세법 §59③ 연동: 근로소득세액공제 × (1 − 감면세액/산출세액)
  const creditBefore = earnedIncomeTaxCredit2026(calculatedTax, annual);
  const creditAfter =
    calculatedTax > 0 ? creditBefore * (1 - reduction / calculatedTax) : 0;

  const finalTaxWithout = Math.max(0, calculatedTax - creditBefore);
  const finalTaxWith = Math.max(0, calculatedTax - reduction - creditAfter);

  const savedIncomeTax = Math.max(0, finalTaxWithout - finalTaxWith);
  const savedLocalTax = savedIncomeTax * INSURANCE_RATES_2026.LOCAL_INCOME_TAX_RATIO;
  const savedAnnualTotal = savedIncomeTax + savedLocalTax;

  return {
    earnedIncomeDeduction: Math.round(earnedIncomeDeduction),
    taxBase: Math.round(taxBase),
    calculatedTax: Math.round(calculatedTax),
    reduction,
    rate: rule.rate,
    reductionCapped,
    creditBefore: Math.round(creditBefore),
    creditAfter: Math.round(creditAfter),
    finalTaxWithout: Math.round(finalTaxWithout),
    finalTaxWith: Math.round(finalTaxWith),
    savedIncomeTax: Math.round(savedIncomeTax),
    savedLocalTax: Math.round(savedLocalTax),
    savedAnnualTotal: Math.round(savedAnnualTotal),
    years: rule.years,
    savedPeriodTotal: Math.round(savedAnnualTotal * rule.years),
  };
}
