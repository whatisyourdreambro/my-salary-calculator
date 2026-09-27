// src/lib/civilServantAllowances2026.ts
//
// 공무원 월급 실수령액 계산기(/calc/civil-servant-net-pay)의 2026 수당·기여금·비과세 정본 — 순수 데이터.
// React·런타임 import 없음 (타입만). 계산은 src/lib/civilServantNetPay.ts.
//
// 원문 확인일 2026-09-27 (법제처 law.go.kr DRF 현행 본문):
//   - 공무원수당 등에 관한 규정 — 대통령령 제36015호, 2026-01-02 일부개정·시행 (DRF MST 282475)
//   - 공무원연금법 — 법률 제21065호, 2025-10-01 (제67조 기여금, DRF MST 277137)
//   - 소득세법 — 법률 제21221호, 2025-12-23 (제12조제3호 비과세 근로소득)
//   - 공무원 전체의 기준소득월액 평균액 — 인사혁신처장 고시 2026-04-30
//     (공무원연금공단 geps.or.kr 공지 41683, 적용 2026-05-01~2027-04-30)
//
// ★ 갱신 체크포인트
//   - 1월: 공무원수당 등에 관한 규정 개정 여부(매년 1월 초 봉급·수당 개정령) — 금액·조문 전부 재대조.
//   - 4월 30일: 기준소득월액 평균액 새 고시 → CIVIL_PENSION_2026.avgBaseIncome·cap 갱신(5/1 적용).
//   - 12월 말: 2027 봉급표 확정 시 civilServantNetPay.ts 의 2027 미리보기를 확정 체제로 전환.

/** 원문 식별 정보 — 페이지 각주·산식 목록 공용 */
export const CIVIL_ALLOWANCE_SOURCE_2026 = {
  regulation: "공무원수당 등에 관한 규정",
  decree: "대통령령 제36015호",
  amendedOn: "2026-01-02",
  pensionAct: "공무원연금법 제67조",
  incomeTaxAct: "소득세법 제12조제3호",
  checkedOn: "2026-09-27",
} as const;

/** 정액급식비 월 16만원 — 제18조 ("월 16만원의 정액급식비"). 병은 제7조제1항 단서로 제외 */
export const CIVIL_MEAL_ALLOWANCE_2026 = 160_000;

/**
 * 직급보조비 월액 — 제18조의6·별표 15.
 * 일반직: [9급, 8급, 7급, 6급, 5급] = 8·9급(상당) 175,000 / 7급 180,000 / 6급 185,000 / 5급 250,000.
 * 경찰·소방: [순경·소방사, 경장·소방교, 경사·소방장, 경위·소방위, 경감·소방경]
 *   = 경장ㆍ순경 175,000 / 경사 180,000 / 경감ㆍ경위 185,000 (경찰ㆍ소방공무원 열).
 * 교사: 별표 15 교육공무원 열에 교사가 없어 0 (장학사·교감부터 지급).
 * 병: 제18조의6 단서(제7조제1항 단서 해당자) 로 0.
 */
export const CIVIL_POSITION_ALLOWANCE_2026 = {
  general: [175_000, 175_000, 180_000, 185_000, 250_000],
  policeFire: [175_000, 175_000, 180_000, 185_000, 185_000],
  teacher: 0,
  soldier: 0,
} as const;

/**
 * 가족수당 — 제10조·별표 5 (국가공무원). 부양가족은 4명 이내, 자녀는 4명을 넘어도 지급(제10조제1항 단서).
 * 병은 제10조제1항 단서(제7조제1항 단서 해당자)로 지급하지 않는다.
 */
export const CIVIL_FAMILY_ALLOWANCE_2026 = {
  spouse: 40_000,
  /** 배우자 및 자녀를 제외한 부양가족 1명당 */
  otherEach: 20_000,
  firstChild: 50_000,
  secondChild: 80_000,
  /** 셋째 이후 자녀 1명당 */
  thirdPlusChild: 120_000,
  /** 부양가족 수 상한 (자녀는 예외) */
  maxDependents: 4,
} as const;

/**
 * 정근수당 지급률 — 제7조·별표 2 제1호. 매년 1월·7월 보수지급일에 1월 1일·7월 1일 현재 월봉급액 × 지급률.
 * underYears: 근무연수가 이 값 미만이면 해당 pct (마지막 행은 10년 이상).
 * 병(제7조제1항 단서)은 지급하지 않는다.
 */
export const CIVIL_JEONGGEUN_RATE_2026: ReadonlyArray<{ underYears: number; pct: number }> = [
  { underYears: 2, pct: 10 },
  { underYears: 5, pct: 20 },
  { underYears: 6, pct: 25 },
  { underYears: 7, pct: 30 },
  { underYears: 8, pct: 35 },
  { underYears: 9, pct: 40 },
  { underYears: 10, pct: 45 },
  { underYears: Number.POSITIVE_INFINITY, pct: 50 },
];

/**
 * 정근수당 가산금 월액 — 별표 2 제2호 '전 공무원(군인 제외)' 열. 5년 이상 10년 미만은 한 칸(50,000원).
 * 추가 가산금(비고 칸): 20년 이상 25년 미만 월 10,000원, 25년 이상 월 30,000원.
 */
export const CIVIL_JEONGGEUN_ADDON_2026: ReadonlyArray<{ underYears: number; amount: number }> = [
  { underYears: 5, amount: 30_000 },
  { underYears: 10, amount: 50_000 },
  { underYears: 15, amount: 60_000 },
  { underYears: 20, amount: 80_000 },
  { underYears: Number.POSITIVE_INFINITY, amount: 100_000 },
];
export const CIVIL_JEONGGEUN_ADDON_EXTRA_2026 = {
  /** 20년 이상 25년 미만 */
  from20: 10_000,
  /** 25년 이상 */
  from25: 30_000,
} as const;

/** 명절휴가비 — 제18조의3: 설날·추석날 현재 월봉급액의 60퍼센트를 각각 지급 */
export const CIVIL_HOLIDAY_BONUS_RATE_2026 = 0.6;

/**
 * 교원 수당 — 별표 11 특수업무수당 다목 교직수당.
 * 교직수당 월 250,000원 / 가산금 4) 학급담당교원(담임) 월 200,000원 / 가산금 2) 보직교사 월 150,000원.
 * (가산금 1) 원로교사 월 50,000원 등 나머지 가산금은 v1 범위 밖)
 */
export const CIVIL_TEACHER_ALLOWANCE_2026 = {
  teaching: 250_000,
  homeroom: 200_000,
  headTeacher: 150_000,
} as const;

/**
 * 위험근무수당 — 제13조·별표 8 (갑종 60,000 / 을종 50,000 / 병종 40,000원).
 * 별표 9 비고: 제1호 갑종 나목·제5호 갑종(소방)·제6호 갑종 가·나·라목(경찰 외근 등)은 월 20,000원 가산금
 * (2026-01-02 개정에서 10,000원 → 20,000원). 갑종 + 가산금 = 80,000원.
 */
export const CIVIL_HAZARD_ALLOWANCE_2026 = {
  gap: 60_000,
  eul: 50_000,
  byeong: 40_000,
  surcharge: 20_000,
} as const;

/**
 * 시간외근무수당 — 제15조제2항·별표 12.
 * 1시간 = 기준호봉 봉급액 × 비율 ÷ 209 × 150%. 비율은 55%, 별표 3·10 등의 '8급 및 8급 상당 이하'는 60%.
 * 기준호봉(별표 12): 일반직 해당 계급 10호봉 / 경장·소방교 이상 10호봉·순경·소방사 9호봉 /
 *   교원 19호봉 이하 18호봉·20~29호봉 21호봉·30호봉 이상 23호봉.
 * 정액분: 월 출근 15일 이상이면 명령 없이 월 10시간분(제15조제6항, 인사혁신처 「공무원보수 등의 업무지침」 —
 *   서울고법 2021. 12. 23. 선고 2020누68822 판결이 지침 내용을 그대로 인용, law.go.kr 판례 확인 2026-09-27).
 */
export const CIVIL_OVERTIME_2026 = {
  rateLow: 0.6,
  rateBase: 0.55,
  divisor: 209,
  premium: 1.5,
  generalBaseHobong: 10,
  policeFireEntryBaseHobong: 9,
  policeFireBaseHobong: 10,
  teacherBase: [
    { maxHobong: 19, base: 18 },
    { maxHobong: 29, base: 21 },
    { maxHobong: Number.POSITIVE_INFINITY, base: 23 },
  ],
  /** 정액분 월 10시간 (일반직 기본값) */
  flatHours: 10,
} as const;

/**
 * 공무원연금 기여금 — 공무원연금법 제67조.
 * ① 납부기간 36년 초과 시 기여금 없음 ② 기준소득월액의 9퍼센트, 기준소득월액은 공무원 전체 기준소득월액
 * 평균액의 160퍼센트를 넘을 수 없다. 평균액 5,950,000원(인사혁신처장 고시 2026-04-30,
 * 적용 2026-05-01~2027-04-30) → 상한 9,520,000원.
 */
export const CIVIL_PENSION_2026 = {
  rate: 0.09,
  avgBaseIncome: 5_950_000,
  capMultiplier: 1.6,
  cap: 9_520_000,
  maxYears: 36,
  avgNoticeDate: "2026-04-30",
} as const;

/** 식사대 비과세 한도 월 20만원 — 소득세법 제12조제3호러목. 정액급식비 16만원은 전액 비과세 */
export const CIVIL_MEAL_NONTAX_CAP_2026 = 200_000;
