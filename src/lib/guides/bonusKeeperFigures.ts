// src/lib/guides/bonusKeeperFigures.ts
//
// 2차 키퍼(회사 성과급 묶음 — 2026-09-26 G2B) 본문 수치 공급 모듈.
// 가이드 본문은 정적 HTML 문자열이지만 TS 템플릿이라, 숫자를 손으로 옮기지 않고 여기서 끼워 넣는다.
//  - 세후 금액: 성과급 엔진 calcBonusNet 에 2026 요율(INSURANCE_RATES_2026)을 명시해 계산한다.
//    기본값(현행 요율 포인터 CURRENT_INSURANCE_RATES)을 쓰면 1/1 포인터 전환 뒤 '2026' 표가 조용히 바뀐다.
//  - 회사 성과급 값: 계산기와 같은 데이터 모듈(opiData·taiData·psData·bonusData)을 그대로 다시 내보낸다.
//    최신 반기 포인터(TAI_LATEST·OPI_LATEST) 대신 날짜가 박힌 상수를 써서 본문 기준일과 수치가 어긋나지 않게 한다.
// 이 파일에는 가이드 객체를 두지 않는다 — guideSpec 의 원본 소스 탐색기가 src/lib/guides 의 slug 로 본문을 찾는다.

import { calcBonusNet, type BonusNetResult } from "@/lib/bonusTaxCalc";
import { INSURANCE_RATES_2026 } from "@/lib/taxConstants2026";
import { formatManwonKorean } from "@/lib/manwonFormat";
import { BONUS_PROFILES, type BonusPayout } from "@/data/bonusData";
import { OPI_ACTUAL_2025, type OpiActualRate } from "@/app/calc/samsung-bonus/opiData";
import { TAI_RATES_2026_H1 } from "@/app/calc/samsung-bonus/taiData";
import { PI_TIERS, PS_HISTORY, type PsHistoryRow } from "@/app/calc/sk-hynix-bonus/psData";

export { OPI1_MAX_RATE, OPI_ACTUAL_2025 } from "@/app/calc/samsung-bonus/opiData";
export { TAI_ANNOUNCED_DATE, TAI_PAY_DATE, TAI_RATES_2026_H1 } from "@/app/calc/samsung-bonus/taiData";
// PI_2026 은 다시 내보내지 않는다 — h1.paidDate(2026-07-28)는 2025년 상반기 보도 날짜로 보여 2026년 근거가 없다(원장 X-06).
export { AGREEMENT_2026, BASIC_RATIO, PI_TIERS, PS_HISTORY } from "@/app/calc/sk-hynix-bonus/psData";

const must = <T>(value: T | undefined, what: string): T => {
  if (value === undefined) throw new Error(`[bonusKeeperFigures] ${what} 없음 — 데이터 모듈이 바뀌었으면 회사 성과급 키퍼 본문을 함께 고칠 것`);
  return value;
};

/** 2025년 실적분 OPI(2026-01-30 지급) 한 사업부 — opiData 의 id 로 찾는다 */
export const opi2025 = (id: string): OpiActualRate => must(OPI_ACTUAL_2025.rates.find((r) => r.id === id), `OPI 2025 ${id}`);
/** 2025년 실적분 OPI — 지급률 높은 순 */
export const OPI_2025_DESC: readonly OpiActualRate[] = [...OPI_ACTUAL_2025.rates].sort((a, b) => b.rate - a.rate);
/** 2026년 상반기 TAI — 지급률 높은 순(같은 비율은 데이터 순서) */
export const TAI_2026_H1_DESC = [...TAI_RATES_2026_H1].sort((a, b) => b.rate - a.rate);

/**
 * 가이드 PS 이력 표는 계산기와 같은 psData PS_HISTORY 값을 그대로 쓴다(2026-09-26 통합 — 원장 G2B X-05 처리).
 * 연간 영업이익은 DART 사업보고서 요약연결재무정보(감사 후 확정치, 백만원)와 대조했다:
 *   2021 12,410,340(rcpNo 20220322000590) · 2022 6,809,417(20230321001209) · 2023 (7,730,313) · 2024 23,467,319(20250319000665)
 *   · 2025 47,206,319(20260317000635) → 12.4·6.8·−7.7·23.5·47.2조. psData 2024 23.4조를 23.5조로 고쳐 보정표를 없앴다.
 *   2022년 '7조 66억원(7.0조)'은 2023-02-01 잠정실적 공정공시(20230201800006) 값이고 감사 후 확정치는 6.8조라 psData 가 맞다.
 * PS 지급률은 DART 에 공시되지 않는다. 2022년 실적분은 psData 600%(출처 미상)와 회사 인용 보도 820%(이투데이 2023-02-01)가
 * 어긋나 공식 자료로 확인할 수 없으므로, 계산기 값은 그대로 두고 가이드는 그해 지급률 숫자를 싣지 않는다(계산기와 모순 방지).
 */
export const PS_RATE_UNDISCLOSED_YEARS: ReadonlySet<number> = new Set([2022]);
/** 가이드 표 메모만 덧붙이는 해 — 값(지급률·영업이익)은 psData 그대로. 2024 구성은 2025-01 복수 보도(헤럴드경제 등) */
export const PS_HISTORY_GUIDE_NOTES: Readonly<Record<number, string>> = {
  2024: "PS 1,000% + 특별성과급 500%, HBM 호황",
};
/** 가이드 본문용 PS 이력 — psData 값에 가이드 메모만 덧붙인 것 */
export const PS_HISTORY_GUIDE: readonly PsHistoryRow[] = PS_HISTORY.map((r) => ({ ...r, note: PS_HISTORY_GUIDE_NOTES[r.year] ?? r.note }));
/** 가이드 표의 PS 칸 — 공시로 확인할 수 없는 해는 숫자 대신 안내 문구 */
export const psRateCell = (r: PsHistoryRow): string =>
  PS_RATE_UNDISCLOSED_YEARS.has(r.year) ? "공개 자료 미확인" : r.psRatePct == null ? "—" : `${pct(r.psRatePct)}%`;
/** SK하이닉스 PS 이력 한 해(보정 반영) */
export const psYear = (year: number): PsHistoryRow => must(PS_HISTORY_GUIDE.find((r) => r.year === year), `PS ${year}`);
/** 영업이익(조원) 표기 — 소수 첫째 자리까지(7.0조원) */
export const opTrilKo = (tril: number): string => `${tril.toFixed(1)}조원`;

/**
 * SK하이닉스 2026년 분기 실적(억원) — 회사 뉴스룸 1분기(https://news.skhynix.co.kr/q1-2026-business-results/)·
 * 2분기(https://news.skhynix.co.kr/q2-2026-business-results/, 2026-07-29) 발표값. 상반기 PI 지급률은 공식 발표가 없어
 * 이 실적의 영업이익률을 보도된 PI 구간표(psData PI_TIERS)에 넣어 본문에서 '구간 기준상' 값으로만 쓴다.
 */
export const SK_2026_Q = {
  q1: { revenueEok: 525_763, opEok: 376_103, marginPct: 72 },
  q2: { revenueEok: 793_187, opEok: 605_426, marginPct: 76 },
} as const;
/** 2026년 상반기 영업이익률(%) — 두 분기 합산, 반올림 */
export const SK_2026_H1_MARGIN_PCT = Math.round(
  ((SK_2026_Q.q1.opEok + SK_2026_Q.q2.opEok) / (SK_2026_Q.q1.revenueEok + SK_2026_Q.q2.revenueEok)) * 100,
);
/** 반기 영업이익률 → 보도된 PI 구간표의 지급률 */
export const piRateForMargin = (marginPct: number): number => must(PI_TIERS.find((t) => marginPct >= t.minMarginPct), `PI 구간 ${marginPct}`).rate;

/** 성과급 세후 — 연봉에 성과급을 더한 연간 결정세액 차이 + 4대보험 (2026 요율 고정, 추가 세액공제 가정 0) */
export const bonusNet2026 = (salaryWon: number, bonusWon: number): BonusNetResult =>
  calcBonusNet(salaryWon, bonusWon, 0, true, INSURANCE_RATES_2026);

/** 원 → '2,907만원' · '1억 1,856만원' (만원 반올림, 1억 이상 억 표기) */
export const manKo = (won: number): string => formatManwonKorean(Math.round(won / 10_000));

/** 정수 % 표기 — 2964 → '2,964' */
export const pct = (n: number): string => n.toLocaleString("en-US");

/** 'YYYY-MM-DD' → '2026년 7월 28일' */
export const ymdKo = (ymd: string): string => {
  const [y, m, d] = ymd.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
};

/**
 * 회사 성과급 한 행 — 계산기와 같은 bonusData 에서 찾는다. 없으면 테스트·빌드에서 바로 실패시켜
 * 데이터 모듈을 고친 사람이 이 가이드 본문도 함께 보게 한다.
 */
export function bonusPayout(companyId: string, year: number, pick: (p: BonusPayout) => boolean): BonusPayout {
  const row = BONUS_PROFILES.find((p) => p.companyId === companyId)?.payouts.find((p) => p.year === year && pick(p));
  if (!row) throw new Error(`[bonusKeeperFigures] bonusData 에 ${companyId} ${year} 행이 없다 — 회사 성과급 키퍼 본문을 함께 고칠 것`);
  return row;
}

/** 정률 행(월 기본급 대비 %) */
export const basePct = (companyId: string, year: number): number =>
  bonusPayout(companyId, year, (p) => p.percentOfBase != null).percentOfBase as number;

/** 정액 행(만원) */
export const fixedManwon = (companyId: string, year: number): number =>
  bonusPayout(companyId, year, (p) => p.fixedAmountManwon != null).fixedAmountManwon as number;
