// src/lib/bonusHome/scenarios.ts
//
// 영업이익 시나리오(가정) — 증권사 컨센서스·전망이 아니다. 2026년 상반기 확정 실적(opActuals.ts, DART)에
// 결정적 규칙을 곱한 값이며 0.1조 단위로 반올림한다. 계산기에서는 연도별로 직접 고칠 수 있다('직접' 모드).
//   보수: 2026 = 상반기 × 1.5, 이후 매년 × 0.70
//   기본: 2026 = 상반기 × 2(상반기 확정 실적 연환산), 이후 같은 값
//   낙관: 2026 = 상반기 × 2, 이후 매년 × 1.10
// 사이트의 기존 '컨센서스 250조'(psData PROFIT_SCENARIOS)·'350조 가정'(samsung annualOp) 값은 쓰지 않는다 —
// 가드 테스트(bonusHomeScenarios.test.ts)가 import 를 막는다.
//
// ★ 규칙 변경 체크포인트(10월 말 3분기 실적): 기본 규칙을 '3분기 누적 × 4/3' 로 바꿀지 결정 — 규칙 변경이지 전망이 아니다.

import { H1_2026_TENTHS } from "./opActuals";

export type OpCompany = keyof typeof H1_2026_TENTHS; // "samsung" | "sk"
export type RuleScenarioId = "conservative" | "base" | "optimistic";
export type ScenarioId = RuleScenarioId | "custom";

/** 성과급 귀속(실적) 연도 — 지급은 이듬해(2027~2031) */
export const FISCAL_YEARS = [2026, 2027, 2028, 2029, 2030] as const;
/** 성과급을 받는 달력 연도 */
export const PAYOUT_YEARS = [2027, 2028, 2029, 2030, 2031] as const;

export type ScenarioRule = {
  id: RuleScenarioId;
  label: string;
  /** 2026년 = 상반기 × firstYearMultiple */
  firstYearMultiple: number;
  /** 2027년부터 매년 × growth */
  growth: number;
  /** 규칙 한 줄 설명 (본문·표 캡션) */
  ruleText: string;
};

export const SCENARIO_RULES: Record<RuleScenarioId, ScenarioRule> = {
  conservative: {
    id: "conservative",
    label: "보수",
    firstYearMultiple: 1.5,
    growth: 0.7,
    ruleText: "2026년 = 상반기 실적 × 1.5, 이후 매년 × 0.70",
  },
  base: {
    id: "base",
    label: "기본",
    firstYearMultiple: 2,
    growth: 1,
    ruleText: "2026년 = 상반기 실적 × 2(연환산), 이후 같은 값",
  },
  optimistic: {
    id: "optimistic",
    label: "낙관",
    firstYearMultiple: 2,
    growth: 1.1,
    ruleText: "2026년 = 상반기 실적 × 2, 이후 매년 × 1.10",
  },
};

export const RULE_SCENARIO_IDS: RuleScenarioId[] = ["conservative", "base", "optimistic"];

export const SCENARIO_LABELS: Record<ScenarioId, string> = {
  conservative: "보수",
  base: "기본",
  optimistic: "낙관",
  custom: "직접",
};

/**
 * 규칙 시나리오의 연도별 영업이익(조원, 0.1 단위) — FISCAL_YEARS 순서.
 * 0.1조 정수 단위로 계산해 부동소수 오차로 반올림 방향이 바뀌지 않게 한다(146.7 × 1.5 = 220.05 → 220.1).
 */
export function scenarioOps(h1Tenths: number, rule: ScenarioRule): number[] {
  return FISCAL_YEARS.map((_, k) => {
    const tenths = h1Tenths * rule.firstYearMultiple * Math.pow(rule.growth, k);
    return Math.round(tenths + 1e-6) / 10;
  });
}

/** 회사·규칙 시나리오 → 연도별 영업이익(조원) */
export function companyScenarioOps(company: OpCompany, id: RuleScenarioId): number[] {
  return scenarioOps(H1_2026_TENTHS[company], SCENARIO_RULES[id]);
}

/** 상반기 실적(조원, 0.1 단위) — 시나리오 규칙의 기준값 표기용 */
export function h1Tril(company: OpCompany): number {
  return H1_2026_TENTHS[company] / 10;
}
