// src/app/calc/sk-hynix-bonus/psData.ts
//
// SK하이닉스 PS·PI 단일 데이터 소스 — 서버(page.tsx 표·FAQ)와 클라이언트
// (Client.tsx 계산기, StockScenarioSimulator)가 공유한다.
// 삼성 samsung-bonus/taiData.ts 와 동일한 "순수 데이터 모듈" 패턴.
// 향후 docs/serp-strategy-2026.md 의 bonusData.ts ETL(리포트 2호) 소스로 사용.
//
// ── 갱신 체크포인트 캘린더 ──────────────────────────────────────
// 2026-08 말   : 이천 노조 전 조합원 총투표 결과 → AGREEMENT_2026.status 를
//                "ratified"(가결) 또는 "rejected"(부결)로 변경.
//                page.tsx metadata modified_time + sitemap ROUTE_OVERRIDES 날짜 갱신.
// 2026-10 말   : Q3 실적 발표 → PROFIT_SCENARIOS hint·runrate 갱신.
// 2027-01      : 2026 하반기 PI 발표 → PI_2026.h2 확정값 반영.
// 2027-01~02   : 2026 연간 실적·PS % 확정 → PS_HISTORY 에 2026 행 추가,
//                신 체계 첫 적용이면 기준가 3시점 실제 종가 각주 반영.
// ────────────────────────────────────────────────────────────────

/** 잠정합의 진행 상태 — 총투표 결과에 따라 이 값 하나만 바꾸면
 *  시즌 배너·합의 섹션·FAQ 문구가 일괄 전환된다. */
export type AgreementStatus = "tentative" | "ratified" | "rejected";

export const AGREEMENT_2026 = {
  /** ★ 총투표 결과 확인 후 여기만 변경 */
  status: "tentative" as AgreementStatus,
  agreedDate: "2026-08-20",
  voteNote: "2026년 8월 말 이천 노동조합 전 조합원 총투표 예정",
  wageIncreasePct: 6.3, // 직무급+경력급 합산 기본급 인상률
  poolRate: 0.1, // PS 재원 = 연간 영업이익의 10% (기존 유지)
  capAbolished: true, // 기본급 1,000% 상한 폐지 (2025-09 합의 유지)
  /** 신 체계: 당해 현금 40% + 자사주 60%(당해 매도가능 40%p + 이연 10%p×2) */
  newSplit: { cashNowPct: 40, stockNowPct: 40, stockYear1Pct: 10, stockYear2Pct: 10 },
  /** 구 체계(2025년분까지): 당해 현금 80% + 이연 현금 10%p×2 */
  oldSplit: { cashNowPct: 80, cashYear1Pct: 10, cashYear2Pct: 10 },
  /** 본인 요청 시 주식 비중 100%까지 상향 가능 (이연 구조는 미보도 — 20%p 동일 가정) */
  stockElectionMaxPct: 100,
  basePriceRule:
    "①1월 경영성과 발표일 ②2월 PS 현금 지급일 ③4월 주식 지급일 — 세 시점 종가 중 최저가로 주식 수 산정",
  downsideProtection:
    "주식 실제 지급 첫날 종가 기준 가치 총액이 당초 성과급 금액에 못 미치면 부족분을 현금으로 추가 지급(지급 이후 하락분은 보전 없음)",
  appliesFrom: "2026년 성과급(2027년 초 지급분)부터",
} as const;

/** 연도별 PS·PI 실지급 이력 (실적 귀속 연도 기준, 공개 보도 수치) */
export type PsHistoryRow = {
  year: number;
  /** 기본급 대비 PS % (null = 미지급) */
  psRatePct: number | null;
  /** 연간 PI 합계 % (반기 합산, null = 공개 자료 미확인) */
  piTotalPct: number | null;
  /** 연간 영업이익 (조원) */
  opTril: number;
  note?: string;
};

export const PS_HISTORY: PsHistoryRow[] = [
  { year: 2021, psRatePct: 1000, piTotalPct: null, opTril: 12.4, note: "상한(1,000%) 도달" },
  { year: 2022, psRatePct: 600, piTotalPct: null, opTril: 6.8, note: "다운사이클" },
  { year: 2023, psRatePct: 0, piTotalPct: null, opTril: -7.7, note: "적자 — PS 미지급" },
  { year: 2024, psRatePct: 1500, piTotalPct: 300, opTril: 23.4, note: "HBM 호황" },
  {
    year: 2025,
    psRatePct: 2964,
    piTotalPct: 300,
    opTril: 47.2,
    note: "상한 폐지 첫 적용 — PS+PI 합계 3,264% (PS 2026-02-05 지급)",
  },
];

/** 영업이익 시나리오 (조원) — 2026-08-23 현행화 */
export const PROFIT_SCENARIOS = [
  { id: "actual2025", label: "2025 실적", trillion: 47.2, hint: "PS 2,964% 근거" },
  { id: "conservative", label: "보수", trillion: 150, hint: "하반기 급락 가정" },
  { id: "runrate", label: "상반기 연환산", trillion: 196.4, hint: "상반기 98.2조 × 2" },
  { id: "consensus", label: "컨센서스", trillion: 250, hint: "증권가 2026 전망" },
] as const;

/** 기본 선택 시나리오 — "1인 평균 세전 약 7억" 보도 재현 */
export const DEFAULT_PROFIT_TRILLION = 250;

/** 반기 영업이익률 → PI 지급률 (보도 기준) */
export const PI_TIERS = [
  { minMarginPct: 30, rate: 150 },
  { minMarginPct: 15, rate: 125 },
  { minMarginPct: 0, rate: 100 },
  { minMarginPct: -10, rate: 50 },
  { minMarginPct: -Infinity, rate: 0 },
] as const;

/** 2026년 PI 확정 현황 */
export const PI_2026 = {
  h1: { rate: 150, confirmed: true, paidDate: "2026-07-28" },
  h2: { rate: null as number | null, confirmed: false, expected: "2027-01 발표 예정" },
} as const;

/** PI 선택지 (반기당 %) */
export const PI_SCENARIOS = [
  { value: 0, label: "0% (영업적자)" },
  { value: 100, label: "100%" },
  { value: 125, label: "125%" },
  { value: 150, label: "150% (최대)" },
] as const;

/** 직원 수 — 2025 사업보고서 3만4,549명 (seedCompanies.ts 와 정합) */
export const EMPLOYEES = 34_549;
/** 평균 연봉 가정 — 개인 비례 보정 기준 (보도상 평균 연봉 1억) */
export const REFERENCE_SALARY = 100_000_000;
/** 기본급 = 연봉 ÷ 20 (통상 관례) */
export const BASIC_RATIO = 20;
/** 2026 상반기 실적 (조원) — Q1 37.6 + Q2 60.5 */
export const H1_2026_PROFIT_TRIL = 98.2;

/** 보도 출처 — 매체명·일자·사실 요지만 기재 (기사 본문 인용 없음) */
export const SOURCES = [
  { outlet: "한국경제", date: "2026-08-20", fact: "현금 40%·자사주 60% 지급 잠정합의" },
  { outlet: "헤럴드경제", date: "2026-08-20", fact: "주가 하락 시 현금 보전·기준가 3시점 최저가" },
  { outlet: "머니투데이·SBS·뉴시스", date: "2026-08-20", fact: "임금 6.3% 인상·이연 10%p×2년" },
  { outlet: "블로터", date: "2026-08-20", fact: "2025년 10년 합의(80/20 이연) 1년 만에 개편" },
  { outlet: "복수 언론", date: "2026-07", fact: "2026 상반기 PI 150% 확정(7/28 지급)" },
  { outlet: "SK하이닉스 사업보고서", date: "2026-03", fact: "직원 3만4,549명·2025년 영업이익 47.2조원" },
] as const;

export const LAST_UPDATED = "2026-08-23";
