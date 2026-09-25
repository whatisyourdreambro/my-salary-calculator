// src/config/currentRates.ts
//
// '지금 적용 중인' 4대보험 요율 포인터 (2026-09-25 N3 — 2027-01-01 전환 준비).
//
// 월 실수령 엔진(TaxLogic·calculator·bonusTaxCalc 등)의 기본 요율과, 연도 표기가 없는
// 상시 페이지의 요율 문구('국민연금 4.75%' 등)가 전부 이 파일에서 나온다. 그래서 1/1 연도
// 전환은 아래 CURRENT_RATES_YEAR 한 줄(2026 → 2027)만 바꾸면 된다 — 동결기(11/1~1/31)에
// 허용되는 '상수만' 변경이다. 절차·검증: docs/next-upgrade-plan-2026-09-11.md §5 런북.
//
// 포인터를 따르지 않는(연도 고정) 표면 — 전환해도 2026 요율 그대로여야 한다:
//   · /table/2026/* 표·/api/salary-table (generateData.ts·generateData2026.ts, calculateNetSalary2026)
//   · 2026 귀속 연말정산 (yearEndTaxCalculator.ts·YearEndTaxCalculator.tsx·widget/year-end-tax·
//     calc/dual-income-year-end) — 2027년 1~2월 연말정산도 2026 요율로 계산한다
//   · 연도 표기 페이지 (/social-insurance-rates-2026·/national-pension-estimate-2026·
//     /calc/pension-hike-2027·/table/2027 등) — 각 페이지가 연도별 상수를 직접 import
//
// ⚠️ 이 모듈은 클라이언트 번들에도 실린다 (DetailedAnalysis·PayStubGenerator 등) — 요율 상수만
//    두고 무거운 데이터 import 금지.

import { INSURANCE_RATES_2026, type InsuranceRates } from "@/lib/taxConstants2026";
import { INSURANCE_RATES_2027 } from "@/lib/taxConstants2027";

/** 포인터가 가리킬 수 있는 요율 연도 */
export type RateYear = 2026 | 2027;

/** 연도별 4대보험·지방세 요율 — 연도 정본 상수를 그대로 가리킨다 (값 복제 금지) */
export const INSURANCE_RATES_BY_YEAR: Readonly<Record<RateYear, InsuranceRates>> = {
  2026: INSURANCE_RATES_2026,
  2027: INSURANCE_RATES_2027,
};

/**
 * ★ 현행 요율 연도 — 2027-01-01 00:00 KST 이후 빌드에서만 2027 로 바꾼다 (그 전 변경 금지).
 *   바꾸기 전 src/lib/taxConstants2027.ts 의 INSURANCE_RATES_2027_STATUS 가 전부 confirmed
 *   여야 한다 (currentRates.test.ts · verify:tax 가 검사).
 */
export const CURRENT_RATES_YEAR: RateYear = 2026;

/** 현행 4대보험·지방세 요율 — 월 실수령 엔진의 기본값 */
export const CURRENT_INSURANCE_RATES: InsuranceRates = INSURANCE_RATES_BY_YEAR[CURRENT_RATES_YEAR];

/**
 * 요율 → 표시 문자열. 퍼센트 소수 넷째 자리에서 반올림하고 끝의 0 은 지우되 소수 한 자리는 남긴다.
 * 예: 연금 2026 → "4.75%" · 연금 2027 → "5.0%" · 고용 → "0.9%" · 건보 → "3.595%" · 장기요양 비율 → "13.14%"
 * (요율 리터럴은 연도 정본 파일에만 둔다 — verify:tax)
 */
export function pctLabel(rate: number): string {
  const fixed = (Math.round(rate * 1_000_000) / 10_000).toFixed(4);
  return `${fixed.replace(/0+$/, "").replace(/\.$/, ".0")}%`;
}

/** 요율 문구 묶음 — 페이지 문장에 끼워 쓰는 표시 문자열 */
export interface RateLabels {
  /** 국민연금 근로자 부담 — "4.75%" */
  pension: string;
  /** 국민연금 총 요율(근로자+회사) — "9.5%" */
  pensionTotal: string;
  /** 건강보험 근로자 부담 — "3.595%" */
  health: string;
  /** 건강보험 총 요율 — "7.19%" */
  healthTotal: string;
  /** 장기요양 — 건강보험료 대비 "13.14%" */
  ltcRatio: string;
  /** 장기요양 — 보수 대비 근로자 부담 "0.4724%" (소수 넷째 자리) */
  ltcOfIncome: string;
  /** 고용보험 근로자 부담 — "0.9%" */
  employment: string;
}

export function rateLabels(r: InsuranceRates): RateLabels {
  return {
    pension: pctLabel(r.NATIONAL_PENSION),
    pensionTotal: pctLabel(r.NATIONAL_PENSION * 2),
    health: pctLabel(r.HEALTH_INSURANCE),
    healthTotal: pctLabel(r.HEALTH_INSURANCE * 2),
    ltcRatio: pctLabel(r.LONG_TERM_CARE_RATIO),
    ltcOfIncome: pctLabel(r.HEALTH_INSURANCE * r.LONG_TERM_CARE_RATIO),
    employment: pctLabel(r.EMPLOYMENT_INSURANCE),
  };
}

/** 현행 요율 문구 — 연도 표기가 없는 상시 페이지 전용 */
export const CURRENT_RATE_LABELS: RateLabels = rateLabels(CURRENT_INSURANCE_RATES);
