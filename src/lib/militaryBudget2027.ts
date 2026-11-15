// src/lib/militaryBudget2027.ts
// 2027 군 초급간부 처우 — 정부 예산안 수치 (/military-pay-2026 #budget-2027 섹션 데이터, 2026-09-26 작성·RL-13 2026-11-15 재착지).
//
// 2026-11-15 재확인: 기획예산처 홍보자료 40쪽(정책브리핑 첨부 '27년 예산안 홍보자료.pdf' 다시 내려받아 본문 추출 —
//   36·3·5.9%, 1,000→1,200·532→1,152, 30·36·189, 300 그대로)과 국방부 정책뉴스(newsId=148971153, 같은 문장 두 개) 원문 그대로.
//   국회 상태: 정부안 9/3 제출 후 예결위 종합정책질의(11월 초)·상임위 예비심사 중, 2026-11-15 현재 본회의 의결 전
//   (국회예산정책처 2027년도 예산안 분석 자료·연합뉴스 등 11월 보도). 병 봉급 2027 액수는 여전히 두 원문에 없다.
//
// 원문 대조(2026-09-26):
//   - 기획예산처 보도자료 「"대체불가 대한민국으로 대도약" 2027년 예산안 및 2026~2030년 국가재정운용계획」
//     (정책브리핑 2026-09-01, newsId=156776382 — 페이지에 부처명 '기획예산처' 표기, "이 자료는 기획예산처의
//     보도자료를 전재하여 제공함"). 첨부 '2. 27년 예산안 홍보자료.pdf' 40쪽(PDF 42쪽) 【군구조 개편】 문단.
//     첨부 파일은 정책브리핑 다운로드본과 로컬 사본의 SHA-256 이 같음을 확인하고 본문을 추출했다.
//   - 국방부 정책뉴스 「내년 국방예산 역대 최대폭 ↑…전작권 확보·자주국방 35% 증가」(정책브리핑 2026-09-03,
//     newsId=148971153, 작성 부처 국방부) — 같은 수치 교차 확인 + 5.9% 적용 대상(중·소위 및 중·하사 기본급).
//   - 병 봉급 2027 액수는 위 두 원문 어디에도 없다 → 표에 넣지 않고 '보수규정 개정 전' 한 줄만 둔다.
//   - 국회 법정 처리기한 12/2: 대한민국헌법 제54조 제2항(회계연도 개시 30일 전까지 의결) — law.go.kr.
// 금지: 2027 호봉표·봉급 예상표(2026-09-25 결정), 공식 원문에 없는 수치, 추정치의 사실 표기.
//
// ★ 갱신 체크포인트: 국회 의결 다음 날 상태 줄을 의결 결과로 바꾸고(금액이 바뀌면 값 교체), 공무원보수규정 개정 공포 후 각 행 status 를 '확정'으로 바꾸고
//   (sourceUrl·sourceTitle·issuer·asOf 도 확정 원문으로 교체) 수치를 재대조한다. 국회에서 금액이 바뀌면 값 교체.
//   병 봉급 2027 이 공식 확정되면 ENLISTED_PAY_2027_LINE 을 확정 수치 행으로 바꾼다.

import { MILITARY_OFFICER_STARTING_2026 } from "@/lib/civilServantPay";

export type MilitaryBudgetStatus = "정부안" | "확정";

export type MilitaryBudget2027Key = "raise" | "target" | "incentive" | "savings";

export interface MilitaryBudget2027Row {
  key: MilitaryBudget2027Key;
  label: string;
  value: string;
  status: MilitaryBudgetStatus;
  sourceUrl: string;
  sourceTitle: string;
  issuer: string;
  /** 원문 공표일(YYYY-MM-DD) */
  asOf: string;
  /** 원문 문장 그대로(화면 비노출, 대조·테스트용) */
  sourceQuote: string;
}

const BUDGET_PRESS_URL = "https://www.korea.kr/briefing/pressReleaseView.do?newsId=156776382";
const BUDGET_PROMO_TITLE = "2027년 예산안 홍보자료 40쪽";
const BUDGET_ISSUER = "기획예산처";
const BUDGET_AS_OF = "2026-09-01";

export const MILITARY_BUDGET_2027_ROWS: ReadonlyArray<MilitaryBudget2027Row> = [
  {
    key: "raise",
    label: "초급간부 처우개선율",
    value: "5.9% 인상",
    status: "정부안",
    sourceUrl: BUDGET_PRESS_URL,
    sourceTitle: BUDGET_PROMO_TITLE,
    issuer: BUDGET_ISSUER,
    asOf: BUDGET_AS_OF,
    sourceQuote: "초급간부 연봉(하사 1호봉) 36백만원(월3백만원) 달성을 위해 처우개선율 5.9% 인상",
  },
  {
    key: "target",
    label: "초급간부 연봉 목표 (하사 1호봉)",
    value: "연 3,600만원(월 300만원) 수준",
    status: "정부안",
    sourceUrl: BUDGET_PRESS_URL,
    sourceTitle: BUDGET_PROMO_TITLE,
    issuer: BUDGET_ISSUER,
    asOf: BUDGET_AS_OF,
    sourceQuote:
      "기술집약형 부사관 모집 확대를 위해 초급 간부 총보수를 월300만원 수준으로 인상하고, 적금 신설과 함께 단기복무 장려금도 대폭 인상 / 초급간부 연봉(하사 1호봉) 36백만원(월3백만원) 달성을 위해 처우개선율 5.9% 인상",
  },
  {
    key: "incentive",
    label: "단기복무부사관 장려금",
    value: "1,000만원 → 1,200만원",
    status: "정부안",
    sourceUrl: BUDGET_PRESS_URL,
    sourceTitle: BUDGET_PROMO_TITLE,
    issuer: BUDGET_ISSUER,
    asOf: BUDGET_AS_OF,
    sourceQuote: "단기복무부사관 임관자 대상 장려금 단가 인상(1,000→1,200만원, 532→1,152억원)",
  },
  {
    key: "savings",
    label: "단기복무부사관 적금 지원 (신설)",
    value: "최대 월 30만원 × 36개월",
    status: "정부안",
    sourceUrl: BUDGET_PRESS_URL,
    sourceTitle: BUDGET_PROMO_TITLE,
    issuer: BUDGET_ISSUER,
    asOf: BUDGET_AS_OF,
    // PDF 원문은 '신규' 표지 뒤에 문장이 붙어 있다(표지 = 신규 사업 표시).
    sourceQuote: "신규단기복무부사관 임관자 대상 적금 지원(최대 월30만원, 36개월) 신설(189억원)",
  },
];

/** key 로 행을 찾는다 — 없으면 빌드에서 바로 실패(빈 값 렌더 방지). */
export function militaryBudget2027Row(key: MilitaryBudget2027Key): MilitaryBudget2027Row {
  const row = MILITARY_BUDGET_2027_ROWS.find((r) => r.key === key);
  if (!row) throw new Error(`militaryBudget2027: '${key}' 행이 없습니다`);
  return row;
}

/** 국방부 교차 확인 원문 — 5.9% 적용 대상(중·소위 및 중·하사 기본급)과 '기준 보수' 표현 */
export const MILITARY_BUDGET_2027_MND_SOURCE = {
  title: "내년 국방예산 역대 최대폭 ↑…전작권 확보·자주국방 35% 증가",
  url: "https://www.korea.kr/news/policyNewsView.do?newsId=148971153",
  issuer: "국방부",
  asOf: "2026-09-03",
  quotes: [
    "중·소위 및 중·하사 기본급 처우개선율을 5.9% 반영해 하사 1호봉 기준 보수를 월 300만 원 수준으로 인상한다.",
    "부사관 단기복무장려금을 1000만 원에서 1200만 원으로 인상하고, 부사관 임관자를 대상으로 월 최대 30만 원을 3년 동안 지원하는 단기복무부사관 적금 매칭 지원금을 신설한다.",
  ],
} as const;

/** 기획예산처 원문(행 공통 출처) — 섹션 출처 줄에 쓴다 */
export const MILITARY_BUDGET_2027_SOURCE = {
  title: BUDGET_PROMO_TITLE,
  url: BUDGET_PRESS_URL,
  issuer: BUDGET_ISSUER,
  asOf: BUDGET_AS_OF,
} as const;

/**
 * 상태 줄 — 날짜를 박아 둔다(언제 기준의 상태인지 화면에서 보이게). 국회 의결 다음 날(RL-22 등과 같은 슬롯) 이 줄과
 * 각 행 status 를 의결 결과로 바꾸고, 1월 공무원보수규정 개정 공포 뒤 '확정'으로 바꾼다.
 */
export const MILITARY_BUDGET_2027_STATUS_LINE =
  "정부 예산안(2026-09-01 국무회의 의결) — 2026-11-15 현재 국회 심의 중(법정 처리기한 12월 2일), 국회 의결 전 · 확정은 국회 의결과 공무원보수규정 개정 뒤";

// 병 봉급은 공무원보수규정 별표 13 개정으로 정해진다(2026년분: 2025-12-30 국무회의 의결, 2026-01-02 공포). 의결 날짜를 미리
// 단정하지 않도록 '12월 확정 전'(10월안) 대신 개정 전이라는 사실만 쓴다.
export const ENLISTED_PAY_2027_LINE = "병 봉급 2027 — 보수규정 개정 전(아직 확정 전)";

/** 2026 하사 1호봉 월 봉급 — civilServantPay(별표 13)에서 가져온다(리터럴 금지). */
function findSergeantStartingPay2026(): number {
  const row = MILITARY_OFFICER_STARTING_2026.find((r) => r.rank === "하사 1호봉");
  if (!row || !(row.pay > 0)) {
    throw new Error("militaryBudget2027: civilServantPay 에 '하사 1호봉' 2026 봉급이 없습니다");
  }
  return row.pay;
}

export const SERGEANT_STARTING_PAY_2026 = findSergeantStartingPay2026();
