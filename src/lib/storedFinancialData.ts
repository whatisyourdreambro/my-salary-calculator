// src/lib/storedFinancialData.ts
//
// /dashboard 가 localStorage("moneysalary-financial-data")에서 읽은 값의 최소 형태 검사
// (2026-09-25 감사 B3 · CLIENT-11). 다른 탭·구버전·수동 편집으로 깨진 값이 MyDashboard 의
// 구조 분해·calculateHealthScore 로 그대로 들어가지 않게 한다. (parseSavedHomeInputs 와 같은 방식)

import type { StoredFinancialData } from "@/app/types";

export const FINANCIAL_DATA_KEY = "moneysalary-financial-data";

const SECTION_KEYS = ["salary", "severance", "rank", "futureSalary"] as const;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** 배열이 아닌 객체이고 salary·severance·rank·futureSalary 가 각각 undefined 또는 객체일 때만 true. */
export function isStoredFinancialData(value: unknown): value is StoredFinancialData {
  if (!isPlainObject(value)) return false;
  return SECTION_KEYS.every((key) => value[key] === undefined || isPlainObject(value[key]));
}
