// src/lib/storedFinancialData.ts
//
// /dashboard 가 localStorage("moneysalary-financial-data")에서 읽은 값의 최소 형태 검사
// (2026-09-25 감사 B3 · CLIENT-11). 다른 탭·구버전·수동 편집으로 깨진 값이 MyDashboard 의
// 구조 분해·calculateHealthScore 로 그대로 들어가지 않게 한다. (parseSavedHomeInputs 와 같은 방식)

import type { SalaryInputOrigin, StoredFinancialData } from "@/app/types";
import { isStoredReportData } from "@/lib/reportStoredData";
import { CURRENT_RATES_AS_OF, CURRENT_RATES_YEAR } from "@/config/currentRates";

export const FINANCIAL_DATA_KEY = "moneysalary-financial-data";

// The pointer and its source revision change this basis without rewriting saved results.
// Bump home-v1 when the home calculation model changes independently of those sources.
export const CURRENT_SALARY_BASIS_VERSION = `home-v1:${CURRENT_RATES_YEAR}:${CURRENT_RATES_AS_OF}`;

const INPUT_ORIGINS: readonly SalaryInputOrigin[] = ["default", "user", "saved_input", "saved_salary"];

/** Read-only metadata inspection. Legacy records are never assigned a guessed date/year. */
export function savedSalaryMetadata(value: unknown) {
  const salary = isPlainObject(value) ? value : {};
  const version = typeof salary.calculationBasisVersion === "string"
    && /^home-v\d+:\d{4}:\d{4}-\d{2}$/.test(salary.calculationBasisVersion)
    ? salary.calculationBasisVersion : null;
  return {
    basis: version === null ? "unknown" as const : version === CURRENT_SALARY_BASIS_VERSION ? "current" as const : "changed" as const,
    savedAt: typeof salary.savedAt === "string" && Number.isFinite(Date.parse(salary.savedAt)) ? salary.savedAt : null,
    incomeType: typeof salary.incomeType === "string" && ["regular", "freelancer", "part_time"].includes(salary.incomeType) ? salary.incomeType as "regular" | "freelancer" | "part_time" : null,
    inputOrigin: INPUT_ORIGINS.includes(salary.inputOrigin as SalaryInputOrigin) ? salary.inputOrigin as SalaryInputOrigin : null,
  };
}

const SECTION_KEYS = ["salary", "severance", "rank", "futureSalary"] as const;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** 배열이 아닌 객체이고 salary·severance·rank·futureSalary 가 각각 undefined 또는 객체일 때만 true. */
export function isStoredFinancialData(value: unknown): value is StoredFinancialData {
  if (!isPlainObject(value)) return false;
  return SECTION_KEYS.every((key) => value[key] === undefined || isPlainObject(value[key]));
}

/** Dashboard rendering needs valid report fields and its optional saved rank. */
export function isStoredDashboardData(value: unknown): value is StoredFinancialData {
  if (!isStoredReportData(value)) return false;
  return value.rank === undefined || (isPlainObject(value.rank)
    && typeof value.rank.rank === "number" && Number.isFinite(value.rank.rank)
    && value.rank.rank >= 0 && value.rank.rank <= 100);
}
