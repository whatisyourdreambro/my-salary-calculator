// src/lib/bonusHome/plan.ts
//
// /calc/bonus-home-plan 화면 모델 — 입력 상태 하나로 보상 엔진·구매 가능 연도·시나리오 3종·지역 비교를 한 번에 만든다.
// 클라이언트(Client.tsx)와 서버 본문(page.tsx 빌드 시 예시 숫자)이 같은 함수를 쓴다. 네트워크·저장소 접근 없음 —
// 시세는 커밋된 src/data/marketSnapshot.json 만 읽는다.

import { DEFAULT_REGION_ID, HOME_REGIONS, type HomeRegion } from "@/data/homePriceRegions";
import snapshotJson from "@/data/marketSnapshot.json";
import { formatManwonKorean } from "@/lib/manwonFormat";
import { solveAffordability, type AffordResult } from "./affordability";
import {
  computeComp,
  DEFAULT_WAGE_GROWTH_PCT,
  defaultTaiBaseMonthly,
  SAMSUNG_OPI1_DEFAULT_PCT,
  SK_PI_DEFAULT_PCT,
  type CompanyId,
  type CompResult,
  type DivisionId,
} from "./compEngines";
import { DEFAULT_TERM_YEARS, ltvFor, stressAddFor, type RegionClass } from "./loanRules";
import type { MarketSnapshot } from "./marketSnapshotRules";
import { companyScenarioOps, RULE_SCENARIO_IDS, type RuleScenarioId, type ScenarioId } from "./scenarios";

export const MARKET_SNAPSHOT = snapshotJson as MarketSnapshot;

export type PlanState = {
  company: CompanyId;
  division: DivisionId;
  /** 2026년 연봉(세전, 원) */
  salary: number;
  regionId: string;
  /** 현재 모은 돈(원) */
  startAssets: number;
  /** 월 저축률(%) */
  savingsRatePct: number;
  scenario: ScenarioId;
  /** '직접' 시나리오 연도별 영업이익(조) — 2026~2030 */
  customOps: number[];
  /** 직접 입력 회사 — 연 성과급(연봉 대비 %) */
  customBonusPct: number;
  /** null = 회사 기본 인상률 */
  wageGrowthPct: number | null;
  opi1Pct: number;
  /** null = 연봉 × 60% ÷ 12 */
  taiBaseMonthly: number | null;
  /** null = 시나리오 기본 PI */
  piPct: number | null;
  bonusSavePct: number;
  stockGrowthPct: number;
  priceGrowthPct: number;
  /** null = 한국부동산원 중위가격 */
  priceOverride: number | null;
  ratePct: number;
  termYears: number;
  /** null = 지역 기본 스트레스 가산 */
  stressAddPct: number | null;
  /** null = 지역 기본 LTV(%) */
  ltvPct: number | null;
  existingAnnualDebtService: number;
  dsrIncludeBonus: boolean;
  includeLockedShares: boolean;
  isOver85: boolean;
  savingsInterestPct: number;
};

/** SSR 기본값 = 클라이언트 첫 렌더 — 삼성 성과급 계산기 공유 기본값(메모리·연봉 8천만)과 같다 */
export const DEFAULT_PLAN_STATE: PlanState = {
  company: "samsung",
  division: "memory",
  salary: 80_000_000,
  regionId: DEFAULT_REGION_ID,
  startAssets: 0,
  savingsRatePct: 30,
  scenario: "base",
  customOps: companyScenarioOps("samsung", "base"),
  customBonusPct: 0,
  wageGrowthPct: null,
  opi1Pct: SAMSUNG_OPI1_DEFAULT_PCT,
  taiBaseMonthly: null,
  piPct: null,
  bonusSavePct: 100,
  stockGrowthPct: 0,
  priceGrowthPct: 0,
  priceOverride: null,
  ratePct: MARKET_SNAPSHOT.ecos.ratePct,
  termYears: DEFAULT_TERM_YEARS,
  stressAddPct: null,
  ltvPct: null,
  existingAnnualDebtService: 0,
  dsrIncludeBonus: true,
  includeLockedShares: false,
  isOver85: false,
  savingsInterestPct: 0,
};

export const regionById = (id: string): HomeRegion => HOME_REGIONS.find((r) => r.id === id) ?? HOME_REGIONS[0];
export const regionClass = (r: HomeRegion): RegionClass => ({ capitalArea: r.capitalArea, regulated: r.regulated });
export const medianPrice = (r: HomeRegion): number => MARKET_SNAPSHOT.rone.regions[r.id]?.median ?? 0;

/** 회사가 영업이익 시나리오를 쓰는가 */
export const usesOp = (company: CompanyId): company is "samsung" | "sk" => company !== "custom";

export function opsFor(state: PlanState, scenario: ScenarioId): number[] {
  if (!usesOp(state.company)) return [0, 0, 0, 0, 0];
  if (scenario === "custom") return state.customOps.map((v) => (Number.isFinite(v) ? v : 0));
  return companyScenarioOps(state.company, scenario);
}

export const effectiveWageGrowth = (state: PlanState): number => state.wageGrowthPct ?? DEFAULT_WAGE_GROWTH_PCT[state.company];
export const effectiveTaiBase = (state: PlanState): number => state.taiBaseMonthly ?? defaultTaiBaseMonthly(state.salary);
export const effectivePi = (state: PlanState, scenario: ScenarioId): number => state.piPct ?? SK_PI_DEFAULT_PCT[scenario];

export function compFor(state: PlanState, scenario: ScenarioId): CompResult {
  return computeComp({
    company: state.company,
    division: state.division,
    salary0: state.salary,
    wageGrowthPct: effectiveWageGrowth(state),
    ops: opsFor(state, scenario),
    opi1Pct: state.opi1Pct,
    taiBaseMonthly0: effectiveTaiBase(state),
    piPct: effectivePi(state, scenario),
    customBonusPct: state.customBonusPct,
    stockGrowthPct: state.stockGrowthPct,
  });
}

/** 선택 지역이면 사용자 조정값(가격·스트레스·LTV)을, 비교 지역이면 지역 기본값을 쓴다 */
export function affordFor(state: PlanState, comp: CompResult, region: HomeRegion, selected: boolean): AffordResult {
  const cls = regionClass(region);
  return solveAffordability({
    comp,
    startAssets: state.startAssets,
    savingsRatePct: state.savingsRatePct,
    bonusSavePct: state.bonusSavePct,
    savingsInterestPct: state.savingsInterestPct,
    includeLockedShares: state.includeLockedShares,
    dsrIncludeBonus: state.dsrIncludeBonus,
    price0: selected && state.priceOverride != null ? state.priceOverride : medianPrice(region),
    priceGrowthPct: state.priceGrowthPct,
    isOver85: state.isOver85,
    cls,
    ratePct: state.ratePct,
    stressAddPct: selected && state.stressAddPct != null ? state.stressAddPct : stressAddFor(cls),
    ltv: selected && state.ltvPct != null ? state.ltvPct / 100 : ltvFor(cls),
    termYears: state.termYears,
    existingAnnualDebtService: state.existingAnnualDebtService,
  });
}

export type ScenarioRow = { scenario: RuleScenarioId; ops: number[]; comp: CompResult; afford: AffordResult };
export type RegionRow = { region: HomeRegion; price: number; afford: AffordResult };

export type PlanModel = {
  region: HomeRegion;
  price0: number;
  priceIsOverride: boolean;
  /** 계산에 쓴 시나리오(직접 입력 회사는 영업이익과 무관) */
  scenario: ScenarioId;
  ops: number[];
  comp: CompResult;
  afford: AffordResult;
  stressAddPct: number;
  ltvPct: number;
  scenarioRows: ScenarioRow[];
  regionRows: RegionRow[];
};

export function buildPlan(state: PlanState): PlanModel {
  const region = regionById(state.regionId);
  const comp = compFor(state, state.scenario);
  const afford = affordFor(state, comp, region, true);
  const cls = regionClass(region);
  const scenarioRows: ScenarioRow[] = usesOp(state.company)
    ? RULE_SCENARIO_IDS.map((id) => {
        const c = id === state.scenario ? comp : compFor(state, id);
        return { scenario: id, ops: opsFor(state, id), comp: c, afford: id === state.scenario ? afford : affordFor(state, c, region, true) };
      })
    : [];
  const regionRows: RegionRow[] = HOME_REGIONS.map((r) => ({ region: r, price: medianPrice(r), afford: affordFor(state, comp, r, false) }));
  return {
    region,
    price0: state.priceOverride ?? medianPrice(region),
    priceIsOverride: state.priceOverride != null,
    scenario: state.scenario,
    ops: opsFor(state, state.scenario),
    comp,
    afford,
    stressAddPct: state.stressAddPct ?? stressAddFor(cls),
    ltvPct: state.ltvPct ?? ltvFor(cls) * 100,
    scenarioRows,
    regionRows,
  };
}

// ── 표기 ─────────────────────────────────────────────────────────
/** 억 단위 간결 표기 — 1억 이상 '5.76억', 미만 '3,410만', 비유한 '—' */
export function fmtEokShort(won: number): string {
  if (!Number.isFinite(won)) return "—";
  const sign = won < 0 ? "−" : "";
  const a = Math.abs(won);
  if (a >= 100_000_000) return `${sign}${(a / 100_000_000).toFixed(2)}억`;
  const man = Math.round(a / 10_000);
  if (man === 0) return "0원";
  return `${sign}${man.toLocaleString("ko-KR")}만`;
}
/** 만원 단위 한글 — '3,410만원' · '1억 8,973만원' (사이트 공용 formatManwonKorean) */
export function fmtManwon(won: number): string {
  if (!Number.isFinite(won)) return "—";
  return formatManwonKorean(Math.round(won / 10_000));
}
/** 원 단위 — '1,723,747원' */
export function fmtWon(won: number): string {
  if (!Number.isFinite(won)) return "—";
  return `${Math.round(won).toLocaleString("ko-KR")}원`;
}
/** 조원 — '293.4조' */
export function fmtTril(tril: number): string {
  if (!Number.isFinite(tril)) return "—";
  return `${tril.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}조`;
}
