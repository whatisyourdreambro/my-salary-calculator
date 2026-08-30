// src/lib/generateData2027.ts
//
// /table/2027/{annual,monthly,weekly,hourly} 표의 행 데이터 (2026-08-30 신설, 성장 제안 ④).
//
// 2027 요율 상태 (검증 2026-08-30):
// - 국민연금 근로자 5.0% — ★확정 (연금개혁법 법정 스케줄, 2027-01-01 시행)
// - 최저시급 10,700원 / 월 2,236,300원 — ★확정 (고용노동부 고시 제2026-60호)
// - 건강보험·장기요양·고용보험·간이세액표 — 미확정: 2026 값 준용 (페이지 고지 배너 필수)
//
// ★ 갱신 슬롯: ① 2026년 9월 — 2027 건보료율 건정심 발표 시 HEALTH_2027 갱신
//   ② 2026년 10~11월 — 장기요양료율 ③ 2027년 2월 — 간이세액표(소득세) 개정 여부
//   ④ 2027년 7월 — 연금 기준소득월액 상·하한 재조정.
//   전부 이 파일 상수만 고치면 4표에 일괄 반영된다.
//
// 표시 엔진: calculateNetSalaryWithRates(요율 파라미터 코어) — 2026 표(TaxLogic)와
// 달리 2027 전용 요율을 주입해야 하므로 코어 직접 사용. 비과세 식대 월 20만원·본인
// 1인 공제 기준은 2026 표와 동일. changeValue = 2027 vs 2026 (연금 +0.25%p 효과, 음수).

import type { AdvancedSettings } from "@/app/types";
import {
  calculateNetSalaryWithRates,
  NET_SALARY_RATES_2026,
  type NetSalaryRates,
} from "./calculator";
import { INSURANCE_RATES_2026, PENSION_BASE_2026 } from "./taxConstants2026";
import type { SalaryData as SalaryDataRow } from "./generateData";
import type { SalaryData as SalaryDataAnnual } from "./generateData2026";

/** 2027 최저시급 — 고용노동부 고시 제2026-60호 (확정) */
export const MIN_WAGE_2027 = 10_700;
/** 2027 최저임금 월 환산액 (209h) — 고시 원문 */
export const MIN_WAGE_2027_MONTHLY = 2_236_300;

export const NET_SALARY_RATES_2027: NetSalaryRates = {
  // ★확정 — 총 10.0%의 근로자 절반 (2027-01-01~)
  pension: 0.05,
  // 상·하한은 2027-06-30까지 2026-07 고시값 유지 (2027-07 재조정 예정)
  pensionMonthlyCapBase: PENSION_BASE_2026.MAX_MONTHLY,
  pensionMonthlyFloorBase: PENSION_BASE_2026.MIN_MONTHLY,
  // 미확정 — 2026 준용 (건정심 발표 시 갱신)
  health: INSURANCE_RATES_2026.HEALTH_INSURANCE,
  ltcRatio: INSURANCE_RATES_2026.LONG_TERM_CARE_RATIO,
  employment: INSURANCE_RATES_2026.EMPLOYMENT_INSURANCE,
};

// 표 4종 공통 기준 — 비과세 식대 월 20만원 (2026 표·상세 페이지와 동일)
const NON_TAXABLE_MONTHLY = 200_000;

const defaultAdvancedSettings: AdvancedSettings = {
  isSmeYouth: false,
  disabledDependents: 0,
  seniorDependents: 0,
};

/** 2027 요율 단일 계산 — InteractiveTable calculationFn 등에서 사용 */
export function calculateNetSalary2027(
  annualSalary: number,
  nonTaxableAmount: number,
  dependents: number,
  children: number,
  advancedSettings: AdvancedSettings
) {
  return calculateNetSalaryWithRates(
    annualSalary,
    nonTaxableAmount,
    dependents,
    children,
    advancedSettings,
    NET_SALARY_RATES_2027
  );
}

// 연봉 → weekly/hourly 표 행 (generateData.ts SalaryData shape)
function buildRow2027(annualSalary: number, preTax: number): SalaryDataRow {
  if (annualSalary <= 0) {
    return {
      preTax, monthlyNet: 0, health: 0, employment: 0, longTermCare: 0,
      pension: 0, incomeTax: 0, localTax: 0, totalDeduction: 0,
    };
  }
  const nonTaxable = Math.min(NON_TAXABLE_MONTHLY, Math.floor(annualSalary / 12));
  const r = calculateNetSalaryWithRates(
    annualSalary, nonTaxable * 12, 1, 0, defaultAdvancedSettings, NET_SALARY_RATES_2027
  );
  return {
    preTax,
    monthlyNet: r.monthlyNet,
    health: r.health,
    employment: r.employment,
    longTermCare: r.longTermCare,
    pension: r.pension,
    incomeTax: r.incomeTax,
    localTax: r.localTax,
    totalDeduction: r.totalDeduction,
  };
}

/** /table/2027/{annual,monthly} — 2,400만~2억 100만 단위 177행 (2026 격자와 동일) */
export function generateAnnualSalaryTableData2027(): SalaryDataAnnual[] {
  const data: SalaryDataAnnual[] = [];
  for (let salary = 24000000; salary <= 200000000; salary += 1000000) {
    const r2027 = calculateNetSalaryWithRates(
      salary, NON_TAXABLE_MONTHLY * 12, 1, 0, defaultAdvancedSettings, NET_SALARY_RATES_2027
    );
    const r2026 = calculateNetSalaryWithRates(
      salary, NON_TAXABLE_MONTHLY * 12, 1, 0, defaultAdvancedSettings, NET_SALARY_RATES_2026
    );
    data.push({
      preTax: salary,
      monthlyNet: r2027.monthlyNet,
      totalDeduction: r2027.totalDeduction,
      pension: r2027.pension,
      // 표시 관행 유지 (2026 표와 동일): health = 건보+장기요양, incomeTax = 소득세+지방세
      health: r2027.health + r2027.longTermCare,
      employment: r2027.employment,
      incomeTax: r2027.incomeTax + r2027.localTax,
      // 2027 vs 2026 — 연금 4.75→5.0% 인상 효과 (통상 음수)
      changeValue: r2027.monthlyNet - r2026.monthlyNet,
    });
  }
  return data;
}

/** /table/2027/weekly — 주급 20만~300만원 5만원 단위 (2026과 동일 격자) */
export function generateWeeklyPayTableData2027(): SalaryDataRow[] {
  const steps: number[] = [];
  for (let weekly = 200000; weekly <= 3000000; weekly += 50000) steps.push(weekly);
  return steps.map((weekly) => buildRow2027(weekly * 52, weekly));
}

/** /table/2027/hourly — 9,500~50,000원 + 2027 최저시급 10,700원 행 명시 */
export function generateHourlyWageTableData2027(): SalaryDataRow[] {
  const steps: number[] = [];
  for (let hourly = 9500; hourly <= 30000; hourly += 500) steps.push(hourly);
  steps.push(MIN_WAGE_2027); // 2027 최저시급 행
  for (let hourly = 31000; hourly <= 50000; hourly += 1000) steps.push(hourly);
  return [...new Set(steps)]
    .sort((a, b) => a - b)
    .map((hourly) => buildRow2027(hourly * 209 * 12, hourly));
}
