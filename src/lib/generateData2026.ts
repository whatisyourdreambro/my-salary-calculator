// src/lib/generateData2026.ts
//
// /table/2026/{annual,monthly} 표 + salaryStaticParams SSG 격자의 행 데이터.
//
// 2026-08 대규모 점검: 종전에는 "구간별 정률(1.5/3.5/6/10%)" 초간이 추정 엔진이
// 들어 있어 같은 /table/2026 시리즈의 weekly·hourly(정식 엔진)와 다른 숫자를
// 냈다. calculator.ts 의 요율 파라미터화 코어로 교체해 표 4종의 엔진을 통일.
//
// ★ 격자 불변 제약: preTax 루프(2,400만~2억, 100만 단위 177행)와 SalaryData
//   shape(health=건보+장기요양 합산, incomeTax=소득세+지방세 합산)·export 이름은
//   salaryStaticParams·/table 페이지가 그대로 소비하므로 바꾸지 말 것.
//   (바꾸면 /salary/[amount] SSG 집합·sitemap 정합이 연쇄로 깨진다.)

import type { AdvancedSettings } from "@/app/types";
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
 // 정식 엔진 — 표 4종(weekly·hourly 포함)·홈 계산기와 동일한 가정
 // (비과세 0, 부양가족 본인 1인, 자녀 0)
 const r2026 = calculateNetSalaryWithRates(
 salary, 0, 1, 0, defaultAdvancedSettings, NET_SALARY_RATES_2026
 );
 const r2025 = calculateNetSalaryWithRates(
 salary, 0, 1, 0, defaultAdvancedSettings, RATES_2025
 );

 data.push({
 preTax: salary,
 monthlyNet: r2026.monthlyNet,
 totalDeduction: r2026.totalDeduction,
 pension: r2026.pension,
 // 표시 관행 유지: health 컬럼 = 건강보험 + 장기요양 합산
 health: r2026.health + r2026.longTermCare,
 employment: r2026.employment,
 // 표시 관행 유지: incomeTax 컬럼 = 소득세 + 지방소득세 합산
 incomeTax: r2026.incomeTax + r2026.localTax,
 // 요율 인상(연금 4.5→4.75%·건보 3.545→3.595%·장기요양 12.95→13.14%)
 // 반영 전년 대비 변화 — 통상 음수
 changeValue: r2026.monthlyNet - r2025.monthlyNet,
 });
 }
 return data;
}
