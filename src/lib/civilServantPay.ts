// src/lib/civilServantPay.ts
//
// 공무원 봉급표 데이터 단일 진실 소스 — /civil-servant-pay-2026(확정표)과
// /civil-servant-pay-2027(전망)이 공유한다.
// 출처: 인사혁신처 2026년 공무원 봉급표 공표 원문
// (mpm.go.kr/mpm/info/resultPay/bizSalary/2026/) 수치 그대로.
//
// ★ 갱신 체크포인트: 매년 12월 말 국무회의 의결 직후 이듬해 봉급표 발표 —
//   2027 확정표 발표 시 GENERAL_PAY_ROWS_2027 을 추가하고 2027 페이지를
//   확정표 체제로 전면 개편할 것.

/** [호봉, 9급, 8급, 7급, 6급, 5급] 월 봉급액(원) — 2026 확정 */
export const GENERAL_PAY_ROWS_2026: ReadonlyArray<
  readonly [number, number, number, number, number, number]
> = [
  [1, 2133000, 2162100, 2317100, 2389500, 2896400],
  [2, 2147600, 2195700, 2367900, 2500700, 3013400],
  [3, 2168000, 2233800, 2423800, 2615200, 3135000],
  [4, 2194000, 2276600, 2485200, 2732400, 3261300],
  [5, 2226100, 2331700, 2567100, 2853100, 3390900],
  [6, 2264600, 2412900, 2682600, 2977100, 3523000],
  [7, 2309900, 2519600, 2798700, 3101500, 3657300],
  [8, 2367500, 2622400, 2915800, 3226200, 3793200],
  [9, 2456700, 2720300, 3027100, 3351300, 3929600],
  [10, 2542700, 2813000, 3133300, 3468700, 4066800],
];

/** 경찰(순경)·소방(소방사) 1~5호봉 월 봉급액(원) — 2026 확정, 동일 출처 */
export const POLICE_FIRE_ROWS_2026: ReadonlyArray<readonly [number, number]> = [
  [1, 2133000],
  [2, 2155600],
  [3, 2187500],
  [4, 2229200],
  [5, 2281100],
];

/** 직급보조비 월액(원) — 법제처 공무원수당규정(2026 현행) */
export const POSITION_ALLOWANCE_2026: ReadonlyArray<{
  grade: string;
  amount: number;
}> = [
  { grade: "8·9급", amount: 175000 },
  { grade: "7급", amount: 180000 },
  { grade: "6급", amount: 185000 },
  { grade: "5급", amount: 250000 },
  { grade: "1급", amount: 750000 },
];

/**
 * 2027 보수 인상률 권고 범위 — 공무원보수위원회 2026-07-23 제2차 전체회의 의결
 * (정부·노동계 위원 전원 찬성 중재안, 언론 보도 기준 "사상 첫 합의").
 * ★최종 인상률은 정부 예산안(8월 말 발표·9월 초 국회 제출)~12월 말 국무회의
 *   의결로 확정 — 확정 수치 발표 시 이 상수와 2027 페이지를 갱신할 것.
 */
export const RAISE_2027_RECOMMENDED = { min: 0.034, max: 0.039 } as const;

/** 전망치 표기용 — 천원 단위 반올림 (거짓 정밀도 방지) */
export function forecastRange(base2026: number): { lo: number; hi: number } {
  const round1k = (v: number) => Math.round(v / 1000) * 1000;
  return {
    lo: round1k(base2026 * (1 + RAISE_2027_RECOMMENDED.min)),
    hi: round1k(base2026 * (1 + RAISE_2027_RECOMMENDED.max)),
  };
}
