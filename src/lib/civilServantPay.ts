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

// ── 봉급표 버티컬 확장 (2026-08-30, 성장 제안 ⑤) ──────────────────────
// 수치는 전부 공무원보수규정 [별표] 2026-01-02 개정 원문(인사혁신처
// mpm.go.kr/mpm/info/resultPay/bizSalary/2026/ + 법제처 별표 10·11·13) 기준.
// 3중 교차검증 완료(2026-08-30). ★갱신 시 앵커값 대조 필수 — 자동 추출 시
// 계급 행 밀림 오독 사례 있음: 순경 1호봉 2,133,000 · 경사 1호봉 2,472,100 ·
// 경감 1호봉 2,698,600 이 세 값이 어긋나면 표 전체를 재검증할 것.

/** 병 봉급 2026 (월, 원) — 2025년과 동일(동결). 별표 13 */
export const MILITARY_PAY_2026: ReadonlyArray<{ rank: string; pay: number }> = [
  { rank: "이병", pay: 750000 },
  { rank: "일병", pay: 900000 },
  { rank: "상병", pay: 1200000 },
  { rank: "병장", pay: 1500000 },
];

/** 초임 간부 봉급 2026 (월, 원) — 하사·소위 1호봉. 별표 13 */
export const MILITARY_OFFICER_STARTING_2026: ReadonlyArray<{ rank: string; pay: number }> = [
  { rank: "하사 1호봉", pay: 2133000 },
  { rank: "소위 1호봉", pay: 2150400 },
];

/**
 * 장병내일준비적금 2026 — 국방부 예산사업 (법령 아님, 연중 변경 가능).
 * 월 납입 한도 55만원(은행별 30만원 → 2개 은행 분산), 정부 매칭 = 납입 원금의
 * 100%(2024년 이후 납입분, 전역 시 일괄 지급). 비과세는 2026-12-31 가입분까지.
 * 기준일 2026-08-30 (출처: KB국민은행 공식 상품 안내 + 국방부 공표 구조).
 */
export const MILITARY_SAVINGS_2026 = {
  monthlyCap: 550000,
  matchRate: 1.0,
  note: "매칭 지원금은 월급이 아니라 전역 시 일괄 수령",
} as const;

/** 교육공무원(유·초·중등 교원) 봉급표 2026 발췌 — [호봉, 월 봉급액]. 별표 11 */
export const TEACHER_PAY_ROWS_2026: ReadonlyArray<readonly [number, number]> = [
  [9, 2495600],
  [11, 2538300],
  [13, 2657500],
  [15, 2889700],
  [18, 3241500],
  [21, 3600700],
  [25, 4129400],
  [30, 4826800],
  [40, 6205700],
];

/** 교원 주요 수당 (월, 원) — 공무원수당규정 (2024 인상 후 2026 유지, 보도 교차확인) */
export const TEACHER_ALLOWANCE_2026 = {
  homeroom: 200000, // 담임수당
  headTeacher: 150000, // 보직교사수당
} as const;

/**
 * 경찰·소방 공무원 봉급표 2026 — [호봉, 순경(소방사), 경장(소방교), 경사(소방장),
 * 경위(소방위), 경감(소방경)]. 별표 10은 경찰·소방 단일 통합표(계급 1:1 대응).
 * 순경 열은 POLICE_FIRE_ROWS_2026 과 동일값 (교차검증 앵커).
 */
export const POLICE_RANK_ROWS_2026: ReadonlyArray<
  readonly [number, number, number, number, number, number]
> = [
  [1, 2133000, 2215300, 2472100, 2507700, 2698600],
  [2, 2155600, 2245500, 2493100, 2567700, 2814700],
  [3, 2187500, 2290400, 2539000, 2640000, 2933000],
  [4, 2229200, 2350700, 2610800, 2758200, 3054900],
  [5, 2281100, 2427500, 2710600, 2879500, 3178700],
];

/** 경찰↔소방 계급 대응 라벨 */
export const POLICE_FIRE_RANK_LABELS: ReadonlyArray<{ police: string; fire: string }> = [
  { police: "순경", fire: "소방사" },
  { police: "경장", fire: "소방교" },
  { police: "경사", fire: "소방장" },
  { police: "경위", fire: "소방위" },
  { police: "경감", fire: "소방경" },
];

/** 위험근무수당 2026 (월, 원) — 경찰·소방, 2026 개정에서 7만→8만 인상 (korea.kr) */
export const HAZARD_ALLOWANCE_2026 = 80000;

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
