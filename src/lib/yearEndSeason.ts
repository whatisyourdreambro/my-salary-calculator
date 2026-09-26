// src/lib/yearEndSeason.ts
//
// 연말정산 클러스터 연도 프레임 단일 소스 (M07, 2026-09-05).
//   attributionYear = 귀속연도(소득이 발생한 해) — "2026년 귀속"
//   filingYear      = 신고·정산연도(회사 제출·환급이 이뤄지는 해) — "2027년 1~2월 신고"
// 사용처: /year-end-tax · /year-end-tax-checklist · /year-end-tax-settlement-2026 ·
//         /year-end-tax-2027 의 title/description (year-end-tax-preview 는 연도 리터럴 없음).
// ★귀속연도는 2027-03-10 까지 2026 으로 고정한다 — 2027년 귀속 프레임 전환은 2027-03-11 부터만.
//   2026년 귀속 정산은 2027년 1~2월 회사 연말정산과 근로소득 지급명세서 제출 기한(다음 연도 3월 10일,
//   소득세법 §164①)까지 이어진다. 종전 M07 의 '12월 중순 값 교체 슬롯'은 폐기(2026-09-26 W1-A) — 12월에 바꾸면
//   2026년 소득을 정산하는 1~2월 내내 페이지가 '2027년 귀속'으로 표시된다.
//   가드: src/lib/__tests__/yearEndSeasonGuard.test.ts (2027-03-11 KST 전 빌드에서 2026/2027 이 아니면 실패).
//   여기만 바꾸면 위 페이지 메타가 함께 바뀐다 — 성과급 계산기·회사 페이지는 이 상수를 쓰지 않는다.
//   교체 시 라우트 슬러그(/year-end-tax-settlement-2026 등)는 그대로 — 경로 리터럴은 연도 프레임이 아니다.

export const YEAR_END_SEASON = {
  /** 귀속연도 */
  attributionYear: 2026,
  /** 신고(정산)연도 */
  filingYear: 2027,
} as const;

/** "2026년 귀속" */
export const YEAR_END_ATTRIBUTION_LABEL = `${YEAR_END_SEASON.attributionYear}년 귀속`;

/** "2027년 1~2월 신고" */
export const YEAR_END_FILING_LABEL = `${YEAR_END_SEASON.filingYear}년 1~2월 신고`;

/** "2027 (2026년 귀속)" — 플랜 M07 의 YEAR_END_SEASON_LABEL */
export const YEAR_END_SEASON_LABEL = `${YEAR_END_SEASON.filingYear} (${YEAR_END_ATTRIBUTION_LABEL})`;
