// src/lib/salaryNeighborTable.ts
//
// /salary/[amount] 하단 "다른 연봉 리포트" 비교표 행 (2026-09-28 S21 · GSC 후보 C).
// 인근 연봉(getSalaryNeighborAmounts — 사이트맵 격자 위 값)과 현재 연봉을 한 표에 오름차순으로 놓고,
// 페이지 본문과 같은 계산 — calculateSalary2026(연봉, 비과세 월 20만원, 본인 1명, 자녀 0명, 현행 요율) —
// 으로 예상 월 실수령과 현재 행 대비 차이를 만든다. 현재 행은 페이지가 이미 계산한 값을 그대로 받는다.

import { calculateSalary2026 } from "@/lib/TaxLogic";

/** page.tsx 의 calculateSalary2026(amount, 200000, 1, 0) 과 같은 기본 조건 */
const NON_TAXABLE_MONTHLY = 200_000;
const DEPENDENTS = 1;
const CHILDREN = 0;

export interface SalaryNeighborRow {
  /** 연봉(원) */
  amount: number;
  /** 예상 월 실수령(원) */
  monthlyNet: number;
  /** 표시용 예상 월 실수령(만원, 반올림) */
  monthlyNetManwon: number;
  /** 현재 연봉 행 대비 차이(만원) — 표에 보이는 반올림 값끼리의 차라 표 안에서 더하고 빼면 맞는다 */
  diffManwon: number;
  isCurrent: boolean;
}

const toManwon = (won: number) => Math.round(won / 10_000);

/**
 * @param amount 현재 페이지 연봉(원)
 * @param currentMonthlyNet 페이지가 이미 계산한 현재 연봉의 예상 월 실수령(tax.netPay)
 * @param neighbors 인근 연봉 목록(getSalaryNeighborAmounts 결과 — 현재 연봉 제외)
 */
export function buildSalaryNeighborRows(
  amount: number,
  currentMonthlyNet: number,
  neighbors: readonly number[]
): SalaryNeighborRow[] {
  const currentManwon = toManwon(currentMonthlyNet);
  const others = Array.from(new Set(neighbors)).filter((s) => s !== amount);
  const rows = others.map((s) => {
    const monthlyNet = calculateSalary2026(s, NON_TAXABLE_MONTHLY, DEPENDENTS, CHILDREN).netPay;
    const monthlyNetManwon = toManwon(monthlyNet);
    return { amount: s, monthlyNet, monthlyNetManwon, diffManwon: monthlyNetManwon - currentManwon, isCurrent: false };
  });
  rows.push({ amount, monthlyNet: currentMonthlyNet, monthlyNetManwon: currentManwon, diffManwon: 0, isCurrent: true });
  return rows.sort((a, b) => a.amount - b.amount);
}

/** 차이 칸 표기 — "+23만원" · "-18만원" · "0만원" */
export function formatManwonDiff(diffManwon: number): string {
  const sign = diffManwon > 0 ? "+" : diffManwon < 0 ? "-" : "";
  return `${sign}${Math.abs(diffManwon).toLocaleString("ko-KR")}만원`;
}
