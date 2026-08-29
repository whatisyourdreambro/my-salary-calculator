// src/lib/generateData2026.ts
//
// /table/2026/{annual,monthly} 표 + salaryStaticParams SSG 격자의 행 데이터.
//
// 2026-08 대규모 점검: 종전에는 "구간별 정률(1.5/3.5/6/10%)" 초간이 추정 엔진이
// 들어 있어 같은 /table/2026 시리즈의 weekly·hourly(정식 엔진)와 다른 숫자를
// 냈다. calculator.ts 의 요율 파라미터화 코어로 교체해 표 4종의 엔진을 통일.
//
// 2026-08-30 기준 통일: 표시 수치의 엔진을 TaxLogic.calculateSalary2026(비과세
// 식대 월 20만원·본인 1인)으로 교체 — 상세 페이지(/salary/[amount]·/monthly/[amount])와
// 같은 함수·같은 기준이라 표↔상세 금액이 정확히 일치한다. (종전 비과세 0원 기준은
// 상세 페이지와 전 구간 어긋났음.) changeValue(전년비)만 요율 파라미터 코어
// (calculator.ts)로 산출 — 2025 요율 대비 순수 요율 효과를 재기 위함.
//
// ★ 격자 불변 제약: preTax 루프(2,400만~2억, 100만 단위 177행)와 SalaryData
//   shape(health=건보+장기요양 합산, incomeTax=소득세+지방세 합산)·export 이름은
//   salaryStaticParams·/table 페이지가 그대로 소비하므로 바꾸지 말 것.
//   (바꾸면 /salary/[amount] SSG 집합·sitemap 정합이 연쇄로 깨진다.)

import type { AdvancedSettings } from "@/app/types";
import { calculateSalary2026 } from "./TaxLogic";
import {
 calculateNetSalaryWithRates,
 NET_SALARY_RATES_2026,
 type NetSalaryRates,
} from "./calculator";
import {
 INSURANCE_RATES_2025_LEGACY,
 PENSION_BASE_2025_LEGACY,
} from "./taxConstants2026";

export interface SalaryData {
 [key: string]: number;
 preTax: number;
 monthlyNet: number;
 totalDeduction: number;
 pension: number;
 health: number;
 employment: number;
 incomeTax: number;
 changeValue: number; // 2026 vs 2025 difference
}

// 표 4종·상세 페이지 공통 기준 — 비과세 식대 월 20만원 (TaxLogic 기본값과 동일)
const NON_TAXABLE_MONTHLY = 200_000;

// 2025 기준선 — "전년 대비 변화액(changeValue)" 산출 전용 (taxConstants2026 레거시 상수)
const RATES_2025: NetSalaryRates = {
 pension: INSURANCE_RATES_2025_LEGACY.NATIONAL_PENSION,
 pensionMonthlyCapBase: PENSION_BASE_2025_LEGACY.MAX_MONTHLY,
 pensionMonthlyFloorBase: PENSION_BASE_2025_LEGACY.MIN_MONTHLY,
 health: INSURANCE_RATES_2025_LEGACY.HEALTH_INSURANCE,
 ltcRatio: INSURANCE_RATES_2025_LEGACY.LONG_TERM_CARE_RATIO,
 employment: INSURANCE_RATES_2025_LEGACY.EMPLOYMENT_INSURANCE,
};

const defaultAdvancedSettings: AdvancedSettings = {
 isSmeYouth: false,
 disabledDependents: 0,
 seniorDependents: 0,
};

export function generateAnnualSalaryTableData2026(): SalaryData[] {
 const data: SalaryData[] = [];

 // Range from 24,000,000 to 200,000,000 Step 1,000,000 — 격자 불변 (177행)
 for (let salary = 24000000; salary <= 200000000; salary += 1000000) {
 // 표시 수치 — 상세 페이지(/salary/[amount])와 동일 함수·동일 기준
 const r2026 = calculateSalary2026(salary, NON_TAXABLE_MONTHLY, 1, 0);

 // changeValue 전용 — 같은 비과세 기준으로 2026 vs 2025 요율 효과만 비교
 const c2026 = calculateNetSalaryWithRates(
 salary, NON_TAXABLE_MONTHLY * 12, 1, 0, defaultAdvancedSettings, NET_SALARY_RATES_2026
 );
 const c2025 = calculateNetSalaryWithRates(
 salary, NON_TAXABLE_MONTHLY * 12, 1, 0, defaultAdvancedSettings, RATES_2025
 );

 data.push({
 preTax: salary,
 monthlyNet: r2026.netPay,
 totalDeduction: r2026.totalDeductions,
 pension: r2026.nationalPension,
 // 표시 관행 유지: health 컬럼 = 건강보험 + 장기요양 합산
 health: r2026.healthInsurance + r2026.longTermCare,
 employment: r2026.employmentInsurance,
 // 표시 관행 유지: incomeTax 컬럼 = 소득세 + 지방소득세 합산
 incomeTax: r2026.incomeTax + r2026.localIncomeTax,
 // 요율 인상(연금 4.5→4.75%·건보 3.545→3.595%·장기요양 12.95→13.14%)
 // 반영 전년 대비 변화 — 통상 음수
 changeValue: c2026.monthlyNet - c2025.monthlyNet,
 });
 }
 return data;
}
