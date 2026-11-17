// src/lib/bonusHome/scenarios.ts
//
// 영업이익 시나리오(가정) — 증권사 컨센서스·전망이 아니다. 2026년 1~3분기 누적 실적(opActuals.ts, DART 3분기보고서 —
// 삼성전자는 DS부문, SK하이닉스는 연결)에 결정적 규칙을 곱한 값이며 0.1조 단위로 반올림한다. 계산기에서는 연도별로 직접 고칠 수 있다('직접' 모드).
//   보수: 2026 = 1~3분기 × 1(4분기 0 가정), 이후 매년 × 0.70
//   기본: 2026 = 1~3분기 × 4/3(누적 연환산), 이후 같은 값
//   낙관: 2026 = 1~3분기 × 4/3, 이후 매년 × 1.10
// 2026-11-18 N2-calc-21(운영자 승인 2026-11-17): 종전 상반기 기준(보수 × 1.5·기본 × 2)은 3분기 발표 뒤 보수 값(삼성 220.1조·SK 147.3조)이
// 이미 공시된 1~3분기 누적보다 작아(4분기 큰 적자를 뜻함) 기준을 옮겼다.
// 사이트의 기존 '컨센서스 250조'(psData PROFIT_SCENARIOS)·'350조 가정'(samsung annualOp) 값은 쓰지 않는다 —
// 가드 테스트(bonusHomeScenarios.test.ts)가 import 를 막는다.
//
// ★ 규칙 변경 체크포인트(2027년 1~3월 연간 잠정실적·사업보고서): 2026년 값을 실제 연간 실적으로 바꿀지 결정 — 규칙 변경이지 전망이 아니다.

import { Q1_Q3_2026_TENTHS } from "./opActuals";

export type OpCompany = keyof typeof Q1_Q3_2026_TENTHS; // "samsung" | "sk"
export type RuleScenarioId = "conservative" | "base" | "optimistic";
export type ScenarioId = RuleScenarioId | "custom";

/** 성과급 귀속(실적) 연도 — 지급은 이듬해(2027~2031) */
export const FISCAL_YEARS = [2026, 2027, 2028, 2029, 2030] as const;
/** 성과급을 받는 달력 연도 */
export const PAYOUT_YEARS = [2027, 2028, 2029, 2030, 2031] as const;

export type ScenarioRule = {
  id: RuleScenarioId;
  label: string;
  /** 2026년 = 1~3분기 누적 × firstYearMultiple */
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
    firstYearMultiple: 1,
    growth: 0.7,
    // 화면 문구는 종전보다 좁게만(광고 위 표·문장) — 종전 '2026년 = 상반기 실적 × 1.5, 이후 매년 × 0.70'
    ruleText: "2026년 = 1~3분기 × 1, 이후 매년 × 0.70",
  },
  base: {
    id: "base",
    label: "기본",
    firstYearMultiple: 4 / 3,
    growth: 1,
    // 종전 '2026년 = 상반기 실적 × 2(연환산), 이후 같은 값'
    ruleText: "2026년 = 1~3분기 × 4/3, 이후 같은 값",
  },
  optimistic: {
    id: "optimistic",
    label: "낙관",
    firstYearMultiple: 4 / 3,
    growth: 1.1,
    // 종전 '2026년 = 상반기 실적 × 2, 이후 매년 × 1.10'
    ruleText: "2026년 = 1~3분기 × 4/3, 이후 매년 × 1.10",
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
 * 0.1조 정수 단위로 계산해 부동소수 오차로 반올림 방향이 바뀌지 않게 한다(146.7 × 1.5 = 220.05 → 220.1, 1815 × 4/3 → 242.0).
 */
export function scenarioOps(baseTenths: number, rule: ScenarioRule): number[] {
  return FISCAL_YEARS.map((_, k) => {
    const tenths = baseTenths * rule.firstYearMultiple * Math.pow(rule.growth, k);
    return Math.round(tenths + 1e-6) / 10;
  });
}

/** 회사·규칙 시나리오 → 연도별 영업이익(조원) */
export function companyScenarioOps(company: OpCompany, id: RuleScenarioId): number[] {
  return scenarioOps(Q1_Q3_2026_TENTHS[company], SCENARIO_RULES[id]);
}

/** 1~3분기 누적 실적(조원, 0.1 단위, 삼성은 DS부문) — 시나리오 규칙의 기준값 표기용 */
export function q1q3Tril(company: OpCompany): number {
  return Q1_Q3_2026_TENTHS[company] / 10;
}
