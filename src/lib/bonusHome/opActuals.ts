// src/lib/bonusHome/opActuals.ts
//
// /calc/bonus-home-plan(성과급 내 집 마련 계산기)의 영업이익 '확정 실적' — 실적만 둔다(전망·컨센서스 없음).
// 시나리오(scenarios.ts)는 여기 상반기 실적에 결정적 규칙을 곱한 가정일 뿐이다.
//
// 값은 전부 DART 정기보고서의 요약연결재무정보 '영업이익'(연결, 백만원)이다 — 2026-09-27 dart.fss.or.kr 공시뷰어에서 직접 대조:
//   삼성전자(고유번호 00126380)
//     · 2026 반기보고서 rcpNo 20260814003699 — 2026년 1월~6월 146,725,209 / 비교 2025년 1월~12월 43,601,051
//     · 2026 1분기보고서 rcpNo 20260515002181 — 2026년 1월~3월 57,232,797
//     → 2분기(4~6월) = 반기 − 1분기 = 89,492,412. 회사 실적발표(2026-01-29 43조6,011억 · 04-30 57.2조 · 07-30 89.5조)와 일치.
//   SK하이닉스(고유번호 00164779)
//     · 2026 반기보고서 rcpNo 20260814003509 — 2026년 1월~6월 98,152,891
//     · 2026 1분기보고서 rcpNo 20260515002287 — 2026년 1월~3월 37,610,283
//     → 2분기 = 60,542,608. 회사 뉴스룸 발표(1분기 37조6,103억 · 2분기 60조5,426억, guides/bonusKeeperFigures SK_2026_Q)와
//       억원 반올림으로 일치 — 대조는 테스트(bonusHomeScenarios.test.ts)에서만 import 한다(가이드 모듈을 클라이언트 번들에 싣지 않음).
//   SK하이닉스 2021~2025 연간은 psData.PS_HISTORY.opTril(DART 사업보고서 요약연결, 2026-09-26 대조)을 그대로 쓴다.
//
// ★ 갱신 체크포인트: 10월 말 3분기 실적(3분기보고서는 11월 중순) · 1~2월 연간 잠정실적 · 3월 사업보고서 ·
//   5월 1분기보고서 · 8월 반기보고서. 새 기간을 넣을 때 rcpNo 를 함께 적는다.

import { PS_HISTORY } from "@/app/calc/sk-hynix-bonus/psData";

export type DartSource = {
  /** 공시 서류명 */
  doc: string;
  /** DART 접수번호 */
  rcpNo: string;
  /** 접수일 YYYY-MM-DD */
  filedAt: string;
};

export const dartViewerUrl = (rcpNo: string): string => `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${rcpNo}`;

export type OpPeriod = {
  /** "2025년 연간" 같은 표시 라벨 */
  label: string;
  /** 연결 영업이익 (백만원) */
  millionWon: number;
  source: DartSource;
};

const SEC_H1_2026: DartSource = { doc: "삼성전자 반기보고서 (2026.06)", rcpNo: "20260814003699", filedAt: "2026-08-14" };
const SEC_Q1_2026: DartSource = { doc: "삼성전자 분기보고서 (2026.03)", rcpNo: "20260515002181", filedAt: "2026-05-15" };
const SK_H1_2026: DartSource = { doc: "SK하이닉스 반기보고서 (2026.06)", rcpNo: "20260814003509", filedAt: "2026-08-14" };
const SK_Q1_2026: DartSource = { doc: "SK하이닉스 분기보고서 (2026.03)", rcpNo: "20260515002287", filedAt: "2026-05-15" };

/** 삼성전자 연결 영업이익 — DART (백만원) */
export const SAMSUNG_OP = {
  fy2025: { label: "2025년 연간", millionWon: 43_601_051, source: SEC_H1_2026 } satisfies OpPeriod,
  q1_2026: { label: "2026년 1분기", millionWon: 57_232_797, source: SEC_Q1_2026 } satisfies OpPeriod,
  h1_2026: { label: "2026년 상반기", millionWon: 146_725_209, source: SEC_H1_2026 } satisfies OpPeriod,
} as const;

/** SK하이닉스 2026년 연결 영업이익 — DART (백만원) */
export const SK_OP_2026 = {
  q1: { label: "2026년 1분기", millionWon: 37_610_283, source: SK_Q1_2026 } satisfies OpPeriod,
  h1: { label: "2026년 상반기", millionWon: 98_152_891, source: SK_H1_2026 } satisfies OpPeriod,
} as const;

/** 2분기(4~6월) = 반기 − 1분기 (백만원) */
export const SAMSUNG_Q2_2026_MILLION = SAMSUNG_OP.h1_2026.millionWon - SAMSUNG_OP.q1_2026.millionWon;
export const SK_Q2_2026_MILLION = SK_OP_2026.h1.millionWon - SK_OP_2026.q1.millionWon;

/** 백만원 → 0.1조 단위 정수(반올림). 146,725,209 → 1467 (= 146.7조) */
export const toTenthsTril = (millionWon: number): number => Math.round(millionWon / 100_000);
/** 백만원 → 조원(소수 첫째 자리) */
export const toTril1 = (millionWon: number): number => toTenthsTril(millionWon) / 10;

export type OpHistoryRow = { label: string; tril: number; note?: string; sourceUrl?: string };

/** '과거 실적(참고)' — 삼성전자는 2025 연간과 2026 상반기(분기 포함)만 */
export const SAMSUNG_OP_HISTORY: OpHistoryRow[] = [
  { label: SAMSUNG_OP.fy2025.label, tril: toTril1(SAMSUNG_OP.fy2025.millionWon), sourceUrl: dartViewerUrl(SAMSUNG_OP.fy2025.source.rcpNo) },
  { label: SAMSUNG_OP.q1_2026.label, tril: toTril1(SAMSUNG_OP.q1_2026.millionWon), sourceUrl: dartViewerUrl(SAMSUNG_OP.q1_2026.source.rcpNo) },
  { label: "2026년 2분기", tril: toTril1(SAMSUNG_Q2_2026_MILLION), note: "반기 − 1분기", sourceUrl: dartViewerUrl(SAMSUNG_OP.h1_2026.source.rcpNo) },
  { label: SAMSUNG_OP.h1_2026.label, tril: toTril1(SAMSUNG_OP.h1_2026.millionWon), sourceUrl: dartViewerUrl(SAMSUNG_OP.h1_2026.source.rcpNo) },
];

/** '과거 실적(참고)' — SK하이닉스 2021~2025 연간(psData, DART 사업보고서) + 2026 상반기(분기 포함) */
export const SK_OP_HISTORY: OpHistoryRow[] = [
  ...PS_HISTORY.map((r) => ({ label: `${r.year}년 연간`, tril: r.opTril, note: r.opTril < 0 ? "영업손실" : undefined })),
  { label: SK_OP_2026.q1.label, tril: toTril1(SK_OP_2026.q1.millionWon), sourceUrl: dartViewerUrl(SK_OP_2026.q1.source.rcpNo) },
  { label: "2026년 2분기", tril: toTril1(SK_Q2_2026_MILLION), note: "반기 − 1분기", sourceUrl: dartViewerUrl(SK_OP_2026.h1.source.rcpNo) },
  { label: SK_OP_2026.h1.label, tril: toTril1(SK_OP_2026.h1.millionWon), sourceUrl: dartViewerUrl(SK_OP_2026.h1.source.rcpNo) },
];

/** 시나리오 규칙의 기준 — 2026년 상반기 확정 영업이익(0.1조 정수) */
export const H1_2026_TENTHS = {
  samsung: toTenthsTril(SAMSUNG_OP.h1_2026.millionWon),
  sk: toTenthsTril(SK_OP_2026.h1.millionWon),
} as const;

/** 실적 기준일 표기 — 둘 다 2026-08-14 반기보고서 */
export const OP_ACTUALS_AS_OF = "2026년 상반기(DART 반기보고서 2026-08-14)";
