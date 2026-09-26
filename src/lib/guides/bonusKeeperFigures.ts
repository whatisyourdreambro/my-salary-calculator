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
import { PS_HISTORY, type PsHistoryRow } from "@/app/calc/sk-hynix-bonus/psData";

export { OPI1_MAX_RATE, OPI_ACTUAL_2025 } from "@/app/calc/samsung-bonus/opiData";
export { TAI_ANNOUNCED_DATE, TAI_PAY_DATE, TAI_RATES_2026_H1 } from "@/app/calc/samsung-bonus/taiData";
export { AGREEMENT_2026, BASIC_RATIO, PI_2026, PI_TIERS, PS_HISTORY } from "@/app/calc/sk-hynix-bonus/psData";

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
/** SK하이닉스 PS 이력 한 해 */
export const psYear = (year: number): PsHistoryRow => must(PS_HISTORY.find((r) => r.year === year), `PS ${year}`);

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
