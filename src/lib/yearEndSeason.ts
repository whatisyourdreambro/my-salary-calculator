// src/lib/yearEndSeason.ts
//
// 연말정산 클러스터 연도 프레임 단일 소스 (M07, 2026-09-05).
//   attributionYear = 귀속연도(소득이 발생한 해) — "2026년 귀속"
//   filingYear      = 신고·정산연도(회사 제출·환급이 이뤄지는 해) — "2027년 1~2월 신고"
// 사용처: /year-end-tax · /year-end-tax-checklist · /year-end-tax-settlement-2026 ·
//         /year-end-tax-2027 의 title/description (year-end-tax-preview 는 연도 리터럴 없음),
//         정밀 계산기 4쪽(credit-card·medical·rent·donation)과 /calc 4쪽(january-bonus·dual-income-year-end·
//         dependent-check·child-deduction)의 title (아래 제목 라벨, 2026-09-26 SEASON-06).
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

// ── 제목 라벨 (SEASON-06, 운영자 승인 2026-09-26 10번 — 약 12쪽 제목을 '2027 연말정산(2026년 귀속)' 형식으로 1회 교체)
// 검색어는 신고연도로 부른다('2027 연말정산' = 2027년 1~2월에 하는 2026년 소득분 정산). 제목은 검색어를 앞에,
// 가능하면 40자 이내로. 주소(경로)는 그대로. 허브 /year-end-tax-2027(이미 두 연도 병기)과 미리보기 <title> 은
// 이 헬퍼를 쓰지 않는다. 전환(2027-03-11) 때 위 YEAR_END_SEASON 만 바꾸면 아래 제목이 함께 넘어간다.

/** "2027 연말정산" — 신고연도로 부르는 시즌 검색어 */
export const YEAR_END_FILING_QUERY = `${YEAR_END_SEASON.filingYear} 연말정산`;

/** "2026년 귀속·2027 연말정산" — 정밀 계산기·/calc 계산기 제목 꼬리 */
export const YEAR_END_TITLE_TAIL = `${YEAR_END_ATTRIBUTION_LABEL}·${YEAR_END_FILING_QUERY}`;

/** 정밀 계산기·/calc 계산기 제목 — "신용카드 소득공제 계산기 — 2026년 귀속·2027 연말정산" */
export function yearEndToolTitle(name: string): string {
  return `${name} — ${YEAR_END_TITLE_TAIL}`;
}

/** 시즌 대표 쪽 제목 — "2027 연말정산 환급금 계산기(2026년 귀속) — 즉시 계산" */
export function yearEndLeadTitle(subject: string, tail?: string): string {
  const head = `${YEAR_END_FILING_QUERY} ${subject}(${YEAR_END_ATTRIBUTION_LABEL})`;
  return tail ? `${head} — ${tail}` : head;
}
