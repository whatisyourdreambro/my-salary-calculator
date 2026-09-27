"use client";

// /calc/bonus-home-plan — 성과급 내 집 마련 계산기 (2026-09-27 신설, 운영자 요청)
// 광고 순서는 /calc/pension-hike-2027 과 같다: 입력 → 결과 카드 → 결과 직하 광고(CalcResultAd) → 상세.
// ★ 광고 위(입력·결과 카드)는 모든 폭·모든 회사·시나리오에서 높이가 같아야 한다 — 글자 줄은 전부 고정 높이
//   (h-*) + truncate/line-clamp. 회사가 바뀌어도 칸 수(6칸)·세그먼트(4칸)·결과 줄 수는 그대로다.
//   회귀: src/lib/__tests__/bonusHomePlanPage.test.ts (3사 × 4시나리오 마크업 구조 동일).
// 계산은 순수 모듈(src/lib/bonusHome/*)과 커밋된 시세 스냅숏(src/data/marketSnapshot.json)만 쓴다 — 브라우저에서
// 한국부동산원·한국은행 API 를 부르지 않는다. 브라우저 저장소도 쓰지 않는다.

import { useMemo, useState } from "react";
import Link from "@/components/AppLink";
import { CalcResultAd } from "@/components/AdPlacement";
import NumberInput from "@/components/NumberInput";
import { useCalculatorMeasurement } from "@/hooks/useCalculatorMeasurement";
import { DIVISIONS } from "@/app/calc/samsung-bonus/model";
import { HOME_REGIONS } from "@/data/homePriceRegions";
import { LOAN_RULE_SOURCES, LOAN_RULES_AS_OF } from "@/lib/bonusHome/loanRules";
import { dartViewerUrl, SAMSUNG_OP, SAMSUNG_OP_HISTORY, SK_OP_2026, SK_OP_HISTORY } from "@/lib/bonusHome/opActuals";
import {
  buildPlan,
  DEFAULT_PLAN_STATE,
  effectivePi,
  effectiveTaiBase,
  effectiveWageGrowth,
  fmtEokShort,
  fmtManwon,
  fmtTril,
  MARKET_SNAPSHOT,
  usesOp,
  type PlanModel,
  type PlanState,
} from "@/lib/bonusHome/plan";
import { FISCAL_YEARS, h1Tril, SCENARIO_LABELS, SCENARIO_RULES, type ScenarioId } from "@/lib/bonusHome/scenarios";
import { SAMSUNG_OPI1_MAX_PCT, SAMSUNG_WAGE_2026, TAI_BASE_SHARE_OF_SALARY, type CompanyId, type DivisionId } from "@/lib/bonusHome/compEngines";

const COMPANY_OPTIONS: { id: CompanyId; label: string }[] = [
  { id: "samsung", label: "삼성전자 DS" },
  { id: "sk", label: "SK하이닉스" },
  { id: "custom", label: "직접 입력" },
];
const SCENARIO_ORDER: ScenarioId[] = ["conservative", "base", "optimistic", "custom"];

// 광고 위 고정 높이 클래스 — 바꾸면 bonusHomePlanPage.test.ts 와 전 폭 측정으로 다시 확인할 것
const LABEL = "block h-4 truncate text-[11px] font-bold leading-4 text-faint-blue";
const CONTROL =
  "mt-1 block h-11 w-full min-w-0 rounded-xl border border-canvas-200 bg-white px-2 font-bold text-navy focus:border-electric focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-canvas-700 dark:bg-canvas-800 dark:text-canvas-50";
// 320px 두 칸에서 '화성시 동탄구'·'80,000,000' 이 잘리지 않게 sm 미만은 좌우 여백을 줄이고 선택 칸은 14px
const SELECT = `${CONTROL} text-sm sm:px-3 sm:text-base`;
const INPUT = `${CONTROL} pr-5 text-base sm:px-3 sm:pr-8`;

/** 문자열 입력 → 숫자(빈 칸·비유한 = fallback) */
const num = (raw: string, fallback = 0): number => {
  if (raw.trim() === "") return fallback;
  const n = Number(raw.replace(/,/g, ""));
  return Number.isFinite(n) ? n : fallback;
};
const optNum = (raw: string): number | null => (raw.trim() === "" ? null : num(raw, 0));
const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

type Raw = {
  company: CompanyId;
  division: DivisionId;
  salary: string;
  regionId: string;
  startAssets: string;
  savingsRate: string;
  scenario: ScenarioId;
  customOps: string[];
  customBonusPct: string;
  wageGrowth: string;
  opi1: string;
  taiBase: string;
  pi: string;
  bonusSave: string;
  stockGrowth: string;
  priceGrowth: string;
  priceOverride: string;
  rate: string;
  term: string;
  stress: string;
  ltv: string;
  existingDebt: string;
  dsrIncludeBonus: boolean;
  includeLocked: boolean;
  isOver85: boolean;
  savingsInterest: string;
};

const s = (n: number) => String(n);
const RAW_DEFAULT: Raw = {
  company: DEFAULT_PLAN_STATE.company,
  division: DEFAULT_PLAN_STATE.division,
  salary: s(DEFAULT_PLAN_STATE.salary),
  regionId: DEFAULT_PLAN_STATE.regionId,
  startAssets: s(DEFAULT_PLAN_STATE.startAssets),
  savingsRate: s(DEFAULT_PLAN_STATE.savingsRatePct),
  scenario: DEFAULT_PLAN_STATE.scenario,
  customOps: DEFAULT_PLAN_STATE.customOps.map(s),
  customBonusPct: s(DEFAULT_PLAN_STATE.customBonusPct),
  wageGrowth: "",
  opi1: s(DEFAULT_PLAN_STATE.opi1Pct),
  taiBase: "",
  pi: "",
  bonusSave: s(DEFAULT_PLAN_STATE.bonusSavePct),
  stockGrowth: s(DEFAULT_PLAN_STATE.stockGrowthPct),
  priceGrowth: s(DEFAULT_PLAN_STATE.priceGrowthPct),
  priceOverride: "",
  rate: s(DEFAULT_PLAN_STATE.ratePct),
  term: s(DEFAULT_PLAN_STATE.termYears),
  stress: "",
  ltv: "",
  existingDebt: s(DEFAULT_PLAN_STATE.existingAnnualDebtService),
  dsrIncludeBonus: DEFAULT_PLAN_STATE.dsrIncludeBonus,
  includeLocked: DEFAULT_PLAN_STATE.includeLockedShares,
  isOver85: DEFAULT_PLAN_STATE.isOver85,
  savingsInterest: s(DEFAULT_PLAN_STATE.savingsInterestPct),
};

function toState(r: Raw): PlanState {
  return {
    company: r.company,
    division: r.division,
    salary: Math.max(0, num(r.salary)),
    regionId: r.regionId,
    startAssets: Math.max(0, num(r.startAssets)),
    savingsRatePct: clamp(num(r.savingsRate), 0, 100),
    scenario: r.scenario,
    customOps: r.customOps.map((v) => num(v)),
    customBonusPct: clamp(num(r.customBonusPct), 0, 1000),
    wageGrowthPct: optNum(r.wageGrowth),
    opi1Pct: clamp(num(r.opi1), 0, SAMSUNG_OPI1_MAX_PCT),
    taiBaseMonthly: optNum(r.taiBase),
    piPct: optNum(r.pi),
    bonusSavePct: clamp(num(r.bonusSave), 0, 100),
    stockGrowthPct: clamp(num(r.stockGrowth), -90, 100),
    priceGrowthPct: clamp(num(r.priceGrowth), -50, 50),
    priceOverride: optNum(r.priceOverride),
    ratePct: clamp(num(r.rate, DEFAULT_PLAN_STATE.ratePct), 0, 30),
    termYears: clamp(Math.round(num(r.term, DEFAULT_PLAN_STATE.termYears)), 1, 50),
    stressAddPct: optNum(r.stress),
    ltvPct: r.ltv.trim() === "" ? null : clamp(num(r.ltv), 0, 100),
    existingAnnualDebtService: Math.max(0, num(r.existingDebt)),
    dsrIncludeBonus: r.dsrIncludeBonus,
    includeLockedShares: r.includeLocked,
    isOver85: r.isOver85,
    savingsInterestPct: clamp(num(r.savingsInterest), 0, 20),
  };
}

const scenarioText = (company: CompanyId, scenario: ScenarioId) =>
  company === "custom" ? "직접 입력 성과급(가정)" : scenario === "custom" ? "직접 입력 시나리오(가정)" : `${SCENARIO_LABELS[scenario]} 시나리오(가정)`;
const buyText = (year: number | null) => (year ? `${year}년 말` : "2031년까지 불가");

export default function BonusHomePlanClient({ initial }: { initial?: Partial<Raw> } = {}) {
  const [raw, setRaw] = useState<Raw>(() => ({ ...RAW_DEFAULT, ...initial }));
  const set = <K extends keyof Raw>(key: K, value: Raw[K]) => setRaw((prev) => ({ ...prev, [key]: value }));

  const state = useMemo(() => toState(raw), [raw]);
  const plan: PlanModel = useMemo(() => buildPlan(state), [state]);
  const { afford, comp } = plan;
  const decisive = afford.decisive;
  const opCompany = usesOp(raw.company);

  const inputsValid =
    num(raw.salary) > 0 &&
    raw.salary.trim() !== "" &&
    raw.savingsRate.trim() !== "" &&
    raw.startAssets.trim() !== "";
  const measurement = useCalculatorMeasurement({
    calcType: "bonus_home_plan",
    valid: inputsValid && [comp.fiveYearNet, comp.fiveYearGrossComp, decisive.need, decisive.loan.loan, afford.shortfall].every(Number.isFinite),
    resultKey: plan,
  });

  const switchToCustomScenario = () =>
    setRaw((prev) => ({
      ...prev,
      scenario: "custom",
      customOps: prev.scenario === "custom" ? prev.customOps : plan.ops.map((v) => String(v)),
    }));
  const pickScenario = (id: ScenarioId) => {
    if (id === "custom") switchToCustomScenario();
    else set("scenario", id);
  };

  const headlineBuy = afford.buyYear
    ? `필요 현금 ${fmtEokShort(decisive.need)} · 모은 돈 ${fmtEokShort(decisive.assetsForPurchase)}`
    : `2031년 말 부족 ${fmtManwon(afford.shortfall)}`;
  const priceLine = plan.priceIsOverride
    ? `직접 입력 가격 ${fmtEokShort(plan.price0)} (${plan.region.label} · 한국부동산원 ${MARKET_SNAPSHOT.rone.monthLabel} 중위가격 대신)`
    : `${plan.region.label} 아파트 중위가격 ${fmtEokShort(plan.price0)} (${MARKET_SNAPSHOT.rone.monthLabel}, 한국부동산원)`;

  return (
    <div className="space-y-5 mb-10">
      {/* 1) 입력 — 6칸 고정 + 시나리오 4칸 고정 */}
      <section {...measurement.inputProps} aria-label="내 조건" className="rounded-2xl border border-canvas-200 bg-white p-3 dark:border-canvas-800 dark:bg-canvas-900 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="min-w-0">
            <label htmlFor="bhp-company" className={LABEL}>회사</label>
            <select
              id="bhp-company"
              className={SELECT}
              value={raw.company}
              onChange={(e) => setRaw((prev) => ({ ...prev, company: e.target.value as CompanyId, wageGrowth: "", pi: "", taiBase: "" }))}
            >
              {COMPANY_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            {raw.company === "samsung" ? (
              <>
                <label htmlFor="bhp-division" className={LABEL}>사업부</label>
                <select id="bhp-division" className={SELECT} value={raw.division} onChange={(e) => set("division", e.target.value as DivisionId)}>
                  {DIVISIONS.map((d) => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </>
            ) : raw.company === "sk" ? (
              <>
                <label htmlFor="bhp-division" className={LABEL}>사업부</label>
                <select id="bhp-division" className={SELECT} value="none" disabled onChange={() => undefined}>
                  <option value="none">해당 없음</option>
                </select>
              </>
            ) : (
              <>
                <label htmlFor="bhp-custom-bonus" className={LABEL}>연 성과급 (연봉 대비 %)</label>
                <div className="relative">
                  <NumberInput id="bhp-custom-bonus" inputMode="decimal" maxLength={6} value={raw.customBonusPct} onValueChange={(v) => set("customBonusPct", v)} className={INPUT} />
                  <span className="pointer-events-none absolute right-1.5 top-1/2 translate-y-[-40%] sm:right-3 text-xs font-bold text-electric">%</span>
                </div>
              </>
            )}
          </div>
          <div className="min-w-0">
            <label htmlFor="bhp-salary" className={LABEL}>연봉 (세전, 2026년)</label>
            <div className="relative">
              <NumberInput id="bhp-salary" inputMode="numeric" maxLength={11} value={raw.salary} onValueChange={(v) => set("salary", v)} className={INPUT} />
              <span className="pointer-events-none absolute right-1.5 top-1/2 translate-y-[-40%] sm:right-3 text-xs font-bold text-electric">원</span>
            </div>
          </div>
          <div className="min-w-0">
            <label htmlFor="bhp-region" className={LABEL}>목표 지역</label>
            <select id="bhp-region" className={SELECT} value={raw.regionId} onChange={(e) => set("regionId", e.target.value)}>
              {HOME_REGIONS.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            <label htmlFor="bhp-assets" className={LABEL}>현재 모은 돈</label>
            <div className="relative">
              <NumberInput id="bhp-assets" inputMode="numeric" maxLength={12} value={raw.startAssets} onValueChange={(v) => set("startAssets", v)} className={INPUT} />
              <span className="pointer-events-none absolute right-1.5 top-1/2 translate-y-[-40%] sm:right-3 text-xs font-bold text-electric">원</span>
            </div>
          </div>
          <div className="min-w-0">
            <label htmlFor="bhp-savings" className={LABEL}>월 저축률 (실수령 대비)</label>
            <div className="relative">
              <NumberInput id="bhp-savings" inputMode="decimal" maxLength={5} value={raw.savingsRate} onValueChange={(v) => set("savingsRate", v)} className={INPUT} />
              <span className="pointer-events-none absolute right-1.5 top-1/2 translate-y-[-40%] sm:right-3 text-xs font-bold text-electric">%</span>
            </div>
          </div>
        </div>
        <div role="group" aria-label="영업이익 시나리오(가정)" className="mt-4 grid h-11 grid-cols-4 gap-1 rounded-xl bg-canvas-100 p-1 dark:bg-canvas-800">
          {SCENARIO_ORDER.map((id) => {
            const active = opCompany && raw.scenario === id;
            return (
              <button
                key={id}
                type="button"
                disabled={!opCompany}
                aria-pressed={active}
                onClick={() => pickScenario(id)}
                className={`h-9 min-w-0 truncate rounded-lg px-1 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  active ? "bg-electric text-white" : "text-muted-blue hover:bg-white dark:text-canvas-300 dark:hover:bg-canvas-700"
                }`}
              >
                {SCENARIO_LABELS[id]}
              </button>
            );
          })}
        </div>
        <p className="mt-2 h-4 truncate text-[11px] leading-4 text-faint-blue">
          시나리오(가정) — 증권사 컨센서스·전망이 아닙니다 · 대출 규제 기준일 {LOAN_RULES_AS_OF}
        </p>
      </section>

      {/* 2) 결과 카드 — 고정 줄 */}
      <section ref={measurement.resultRef} aria-live="polite" aria-label="구매 가능 연도" className="overflow-hidden rounded-2xl" style={{ boxShadow: "0 8px 40px #0145F225" }}>
        <div className="px-4 pb-4 pt-5 sm:px-6" style={{ background: "linear-gradient(135deg, #0145F2 0%, #0D5BFF 100%)" }}>
          <p className="h-10 break-keep text-sm font-bold leading-5 text-white/80 line-clamp-2 sm:h-5 sm:line-clamp-1">{priceLine}</p>
          <p className="mt-3 h-5 truncate text-xs font-bold leading-5 text-white/70">{scenarioText(raw.company, plan.scenario)} 기준 구매 가능 시점</p>
          <p className="h-8 truncate text-xl font-black leading-8 tracking-tight text-white sm:text-3xl sm:leading-8">{buyText(afford.buyYear)}</p>
          <p className="h-5 truncate text-xs font-bold leading-5 text-white/80">{headlineBuy}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 bg-white p-3 dark:bg-canvas-900">
          <Kpi label="5년 누적 세후 성과급" value={fmtEokShort(comp.fiveYearNet)} sub="2027~2031 · 가정" />
          <Kpi label="5년 누적 총보상(세전)" value={fmtEokShort(comp.fiveYearGrossComp)} sub="연봉 + 성과급" />
          <Kpi label="그해 대출 한도(제약)" value={fmtEokShort(decisive.loan.loan)} sub={`${decisive.loan.binding} · ${decisive.year}년`} />
        </div>
      </section>

      {/* 결과 직하 광고 */}
      <CalcResultAd />

      {/* 3) 연도별 영업이익 — 시나리오(가정) */}
      <section {...measurement.inputProps} aria-labelledby="bhp-op-title" className="rounded-2xl border border-canvas-200 bg-white p-5 dark:border-canvas-800 dark:bg-canvas-900 sm:p-6">
        <h2 id="bhp-op-title" className="text-lg font-black text-navy dark:text-canvas-50">연도별 영업이익 — 시나리오(가정)</h2>
        {opCompany ? (
          <>
            <p className="mt-2 text-sm leading-relaxed text-muted-blue dark:text-canvas-300">
              {raw.scenario === "custom"
                ? "직접 입력 시나리오(가정)입니다. 연도별 영업이익을 바꾸면 성과급이 다시 계산됩니다."
                : `${SCENARIO_LABELS[raw.scenario]} 시나리오(가정): ${SCENARIO_RULES[raw.scenario as Exclude<ScenarioId, "custom">].ruleText}. 기준은 2026년 상반기 확정 영업이익 ${fmtTril(h1Tril(raw.company === "samsung" ? "samsung" : "sk"))}(DART 반기보고서)입니다.`}
            </p>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-5">
              {FISCAL_YEARS.map((fy, i) => (
                <div key={fy} className="rounded-xl bg-canvas-50 p-3 dark:bg-canvas-800">
                  <label htmlFor={`bhp-op-${fy}`} className="block text-xs font-bold text-faint-blue">
                    {fy}년 실적 <span className="font-normal">({fy + 1}년 지급)</span>
                  </label>
                  <div className="relative mt-1">
                    <NumberInput
                      id={`bhp-op-${fy}`}
                      inputMode="decimal"
                      allowNegative
                      maxLength={7}
                      readOnly={raw.scenario !== "custom"}
                      value={raw.scenario === "custom" ? raw.customOps[i] : String(plan.ops[i])}
                      onValueChange={(v) => setRaw((prev) => ({ ...prev, customOps: prev.customOps.map((o, j) => (j === i ? v : o)) }))}
                      className="block h-10 w-full rounded-lg border border-canvas-200 bg-white px-2 pr-7 text-base font-bold tabular-nums text-navy read-only:bg-canvas-100 read-only:text-muted-blue dark:border-canvas-700 dark:bg-canvas-900 dark:text-canvas-50"
                    />
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-electric">조</span>
                  </div>
                </div>
              ))}
            </div>
            {raw.scenario !== "custom" && (
              <button type="button" onClick={switchToCustomScenario} className="mt-3 rounded-lg border border-electric px-3 py-2 text-sm font-bold text-electric hover:bg-electric-5">
                수정 — 직접 시나리오로 바꾸기
              </button>
            )}
            <details className="mt-4 rounded-xl border border-canvas-200 p-3 dark:border-canvas-800">
              <summary className="cursor-pointer text-sm font-bold text-navy dark:text-canvas-50">과거 실적(참고, DART 연결 영업이익)</summary>
              <table className="mt-2 w-full text-sm">
                <tbody>
                  {(raw.company === "samsung" ? SAMSUNG_OP_HISTORY : SK_OP_HISTORY).map((h) => (
                    <tr key={h.label} className="border-b border-canvas-100 dark:border-canvas-800">
                      <td className="py-1 text-muted-blue dark:text-canvas-300">{h.label}{h.note ? ` (${h.note})` : ""}</td>
                      <td className="py-1 text-right font-bold tabular-nums">{fmtTril(h.tril)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-faint-blue">
                {raw.company === "samsung" ? (
                  <>출처: DART 삼성전자 <a className="underline" href={dartViewerUrl(SAMSUNG_OP.h1_2026.source.rcpNo)} target="_blank" rel="noopener noreferrer">반기보고서(2026-08-14)</a>·<a className="underline" href={dartViewerUrl(SAMSUNG_OP.q1_2026.source.rcpNo)} target="_blank" rel="noopener noreferrer">1분기보고서(2026-05-15)</a> 요약연결재무정보.</>
                ) : (
                  <>출처: DART SK하이닉스 사업보고서(2021~2025)·<a className="underline" href={dartViewerUrl(SK_OP_2026.h1.source.rcpNo)} target="_blank" rel="noopener noreferrer">반기보고서(2026-08-14)</a>·<a className="underline" href={dartViewerUrl(SK_OP_2026.q1.source.rcpNo)} target="_blank" rel="noopener noreferrer">1분기보고서(2026-05-15)</a> 요약연결재무정보.</>
                )}
              </p>
            </details>
          </>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-muted-blue dark:text-canvas-300">
            직접 입력은 영업이익을 쓰지 않습니다 — 매년 1월에 전년 연봉 × 입력한 %가 현금 성과급으로 나온다고 가정합니다.
          </p>
        )}
      </section>

      {/* 4) 연도별 표 */}
      <section aria-labelledby="bhp-year-title" className="rounded-2xl border border-canvas-200 bg-white p-5 dark:border-canvas-800 dark:bg-canvas-900 sm:p-6">
        <h2 id="bhp-year-title" className="text-lg font-black text-navy dark:text-canvas-50">연도별 계산 (2027~2031년) — {scenarioText(raw.company, plan.scenario)}</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[860px] whitespace-nowrap text-right text-xs tabular-nums sm:text-sm">
            <thead>
              <tr className="border-b border-canvas-200 text-faint-blue dark:border-canvas-700">
                <th className="py-2 text-left">연도</th>
                <th className="py-2">연봉</th>
                {comp.years[0].components.map((c, i) => (
                  <th key={i} className="py-2">{c.label}</th>
                ))}
                <th className="py-2">성과급 세전</th>
                <th className="py-2">세후</th>
                <th className="py-2">현금화 가능</th>
                <th className="py-2">누적 자산</th>
                <th className="py-2">대출 한도</th>
                <th className="py-2">필요 현금</th>
              </tr>
            </thead>
            <tbody>
              {comp.years.map((y, i) => {
                const a = afford.years[i];
                return (
                  <tr key={y.year} className={`border-b border-canvas-100 dark:border-canvas-800 ${a.affordable ? "bg-electric-5" : ""}`}>
                    <td className="py-2 text-left font-bold">{y.year}</td>
                    <td className="py-2">{fmtEokShort(y.salary)}</td>
                    {y.components.map((c, j) => (
                      <td key={j} className="py-2">{c.label === "—" ? "—" : fmtEokShort(c.gross)}</td>
                    ))}
                    <td className="py-2 font-bold">{fmtEokShort(y.gross)}</td>
                    <td className="py-2 font-bold text-electric">{fmtEokShort(y.net)}</td>
                    <td className="py-2">{fmtEokShort(y.liquidNet + y.unlockedValue)}</td>
                    <td className="py-2 font-bold">{fmtEokShort(a.assetsForPurchase)}</td>
                    <td className="py-2">{fmtEokShort(a.loan.loan)} <span className="text-faint-blue">({a.loan.binding})</span></td>
                    <td className="py-2">{fmtEokShort(a.need)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <ul className="mt-3 space-y-1 text-xs leading-relaxed text-faint-blue">
          <li>현금화 가능 = 그해 세후 성과급 중 바로 쓸 수 있는 몫{raw.company === "samsung" ? "(특별경영성과급 자사주는 1/3만) + 그해 잠금이 풀린 자사주" : ""}. 누적 자산은 {raw.includeLocked ? "잠금 주식을 포함한" : "잠금 주식을 뺀"} 연말 금액입니다.</li>
          <li>대출 한도는 직전 연도 총급여({raw.dsrIncludeBonus ? "연봉 + 그해 받은 성과급" : "연봉만"})로 DSR 을 계산합니다. 은행은 통상 전년도 원천징수영수증 총급여 기준 — 은행별 상이.</li>
          <li>세후는 연봉에 성과급을 더한 연간 결정세액 차이와 4대보험(2026년 요율·세율 기준)입니다. 2027년 이후 세법·요율 변화는 반영하지 않습니다.</li>
          {comp.afterHorizon.length > 0 && (
            <li>이후 수령분: {comp.afterHorizon.map((a) => `${a.year}년 ${a.label} ${fmtEokShort(a.value)}`).join(" · ")} — 2031년 판정에는 넣지 않았습니다.</li>
          )}
        </ul>
      </section>

      {/* 5) 시나리오 3종 비교 */}
      <section aria-labelledby="bhp-scn-title" className="rounded-2xl border border-canvas-200 bg-white p-5 dark:border-canvas-800 dark:bg-canvas-900 sm:p-6">
        <h2 id="bhp-scn-title" className="text-lg font-black text-navy dark:text-canvas-50">시나리오(가정) 3종 비교 — {plan.region.label}</h2>
        {plan.scenarioRows.length > 0 ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] whitespace-nowrap text-right text-sm tabular-nums">
              <thead>
                <tr className="border-b border-canvas-200 text-xs text-faint-blue dark:border-canvas-700">
                  <th className="py-2 text-left">시나리오(가정)</th>
                  <th className="py-2">영업이익 2026~2030</th>
                  <th className="py-2">5년 세후 성과급</th>
                  <th className="py-2">구매 가능</th>
                  <th className="py-2">2031년 부족액</th>
                </tr>
              </thead>
              <tbody>
                {plan.scenarioRows.map((row) => (
                  <tr key={row.scenario} className={`border-b border-canvas-100 dark:border-canvas-800 ${row.scenario === raw.scenario ? "bg-electric-5" : ""}`}>
                    <td className="py-2 text-left font-bold">{SCENARIO_LABELS[row.scenario]}(가정)</td>
                    <td className="py-2 text-xs">{row.ops.map((o) => fmtTril(o)).join(" · ")}</td>
                    <td className="py-2 font-bold text-electric">{fmtEokShort(row.comp.fiveYearNet)}</td>
                    <td className="py-2 font-bold">{buyText(row.afford.buyYear)}</td>
                    <td className="py-2">{row.afford.buyYear ? "—" : fmtEokShort(row.afford.shortfall)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-blue dark:text-canvas-300">직접 입력 회사는 영업이익 시나리오가 없습니다. 위 표가 입력한 성과급(가정) 기준 결과입니다.</p>
        )}
      </section>

      {/* 6) 지역 비교 */}
      <section aria-labelledby="bhp-region-title" className="rounded-2xl border border-canvas-200 bg-white p-5 dark:border-canvas-800 dark:bg-canvas-900 sm:p-6">
        <h2 id="bhp-region-title" className="text-lg font-black text-navy dark:text-canvas-50">지역 비교 — 아파트 중위가격 {MARKET_SNAPSHOT.rone.monthLabel} (한국부동산원)</h2>
        <p className="mt-1 text-xs text-faint-blue">{scenarioText(raw.company, plan.scenario)} · 지역별 기본 LTV·스트레스 금리·주담대 한도 적용 · 집값 변동 가정 {state.priceGrowthPct}%</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[760px] whitespace-nowrap text-right text-sm tabular-nums">
            <thead>
              <tr className="border-b border-canvas-200 text-xs text-faint-blue dark:border-canvas-700">
                <th className="py-2 text-left">지역</th>
                <th className="py-2">중위가</th>
                <th className="py-2">필요 현금</th>
                <th className="py-2">대출 한도(제약)</th>
                <th className="py-2">구매 가능</th>
                <th className="py-2">월 상환액 · 실수령 대비</th>
              </tr>
            </thead>
            <tbody>
              {plan.regionRows.map((row) => {
                const d = row.afford.decisive;
                return (
                  <tr key={row.region.id} className={`border-b border-canvas-100 dark:border-canvas-800 ${row.region.id === raw.regionId ? "bg-electric-5" : ""}`}>
                    <td className="py-2 text-left">
                      <span className="font-bold">{row.region.label}</span>
                      <span className="block whitespace-normal text-[11px] text-faint-blue">{row.region.workplace} · {row.region.regulated ? "규제지역" : row.region.capitalArea ? "수도권 비규제" : "지방"}</span>
                    </td>
                    <td className="py-2">{fmtEokShort(row.price)}</td>
                    <td className="py-2">{fmtEokShort(d.need)}</td>
                    <td className="py-2">{fmtEokShort(d.loan.loan)} <span className="text-faint-blue">({d.loan.binding})</span></td>
                    <td className="py-2 font-bold">{buyText(row.afford.buyYear)}</td>
                    <td className="py-2">{fmtManwon(row.afford.repayment.monthlyPayment)} · {row.afford.repayment.shareOfNetPct.toFixed(0)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-faint-blue">
          월 상환액은 구매 가능 연도(불가면 2031년)의 대출을 연 {state.ratePct}%·원리금균등·{plan.afford.repayment.termYears}년으로 갚을 때이며, 스트레스 금리는 한도 계산에만 씁니다. 실수령 대비는 그해 연봉의 월 실수령(성과급 제외) 기준입니다.
        </p>
      </section>

      {/* 7) 가정 바꾸기 */}
      <details {...measurement.inputProps} className="rounded-2xl border border-canvas-200 bg-white p-5 dark:border-canvas-800 dark:bg-canvas-900 sm:p-6">
        <summary className="cursor-pointer text-lg font-black text-navy dark:text-canvas-50">가정 바꾸기 (인상률·성과급·대출 조건)</summary>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdvancedNumber id="bhp-wage" label="연봉 인상률 (연 %)" value={raw.wageGrowth} placeholder={String(effectiveWageGrowth(state))} onChange={(v) => set("wageGrowth", v)} allowNegative
            note={raw.company === "samsung" ? `기본 ${SAMSUNG_WAGE_2026.totalPct}% — ${SAMSUNG_WAGE_2026.note}. 이후에도 같다고 가정` : raw.company === "sk" ? "기본 6.3% — 2026 임금 인상률(2026-09-16 가결 보도). 이후에도 같다고 가정" : "기본 0%(가정)"} />
          {raw.company === "samsung" && (
            <>
              <AdvancedNumber id="bhp-opi1" label={`OPI 지급률 (연봉 대비 %, 0~${SAMSUNG_OPI1_MAX_PCT})`} value={raw.opi1} onChange={(v) => set("opi1", v)} note="기본 47% — 2025년분 DS부문 공통 실지급률(노조 공지 기반 보도). 매년 같다고 가정" />
              <AdvancedNumber id="bhp-tai" label="TAI 계산용 월 기본급 (원, 2026년)" value={raw.taiBase} placeholder={String(effectiveTaiBase(state))} onChange={(v) => set("taiBase", v)}
                note={`기본 = 연봉 × ${TAI_BASE_SHARE_OF_SALARY * 100}% ÷ 12 (가정 — 삼성 TAI 계산기 안내: 기본급은 통상 연봉의 60~75%). 급여명세서 기본급으로 바꾸세요`} />
            </>
          )}
          {raw.company === "sk" && (
            <AdvancedNumber id="bhp-pi" label="PI 지급률 (반기당, 기본급 대비 %)" value={raw.pi} placeholder={String(effectivePi(state, plan.scenario))} onChange={(v) => set("pi", v)}
              note="기본 150%(보수 시나리오 100%) — 보도된 PI 구간표 기준 가정. 기본급 = 연봉 ÷ 20" />
          )}
          <AdvancedNumber id="bhp-bonus-save" label="성과급 저축 비율 (%)" value={raw.bonusSave} onChange={(v) => set("bonusSave", v)} note="현금화 가능한 세후 성과급 중 저축하는 비율(가정)" />
          <AdvancedNumber id="bhp-stock" label="주가 변동 가정 (연 %)" value={raw.stockGrowth} onChange={(v) => set("stockGrowth", v)} allowNegative note="잠금·이연 자사주 가치에만 적용. 기본 0%(가정)" />
          <AdvancedNumber id="bhp-price-growth" label="집값 변동 가정 (연 %)" value={raw.priceGrowth} onChange={(v) => set("priceGrowth", v)} allowNegative note="기본 0%(가정) — 전망 아님" />
          <AdvancedNumber id="bhp-price" label="직접 입력 가격 (원)" value={raw.priceOverride} placeholder={String(Math.round(plan.regionRows.find((r) => r.region.id === raw.regionId)?.price ?? 0))} onChange={(v) => set("priceOverride", v)}
            note="비우면 한국부동산원 중위가격. 관심 단지 가격을 넣어 보세요" />
          <AdvancedNumber id="bhp-rate" label="대출 금리 (연 %)" value={raw.rate} onChange={(v) => set("rate", v)}
            note={`기본 ${MARKET_SNAPSHOT.ecos.ratePct}% — 한국은행 ECOS 예금은행 주택담보대출 신규취급액 금리(${MARKET_SNAPSHOT.ecos.monthLabel})`} />
          <AdvancedNumber id="bhp-term" label="대출 기간 (년)" value={raw.term} onChange={(v) => set("term", v)} note="수도권·규제지역은 30년 이내(6·27 대책)" />
          <AdvancedNumber id="bhp-stress" label="스트레스 금리 가산 (%p)" value={raw.stress} placeholder={String(plan.stressAddPct)} onChange={(v) => set("stress", v)}
            note="변동금리 기준 — 수도권·규제지역 3.0%p, 지방 0.75%p. 혼합·주기형은 더 작게 적용되니 은행에 확인하세요" />
          <AdvancedNumber id="bhp-ltv" label="LTV (%)" value={raw.ltv} placeholder={String(plan.ltvPct)} onChange={(v) => set("ltv", v)}
            note="무주택 기준 — 규제지역 40%, 그 외 70%. 생애최초·정책대출은 반영하지 않습니다" />
          <AdvancedNumber id="bhp-debt" label="기존 부채 연간 원리금 (원)" value={raw.existingDebt} onChange={(v) => set("existingDebt", v)} note="신용대출·자동차 할부 등 1년 상환액" />
          <AdvancedNumber id="bhp-interest" label="저축 이자 (연 %)" value={raw.savingsInterest} onChange={(v) => set("savingsInterest", v)} note="기본 0%(가정)" />
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <Toggle id="bhp-dsr-bonus" checked={raw.dsrIncludeBonus} onChange={(v) => set("dsrIncludeBonus", v)} label="DSR 소득에 성과급 포함 — 은행은 통상 전년도 원천징수영수증 총급여 기준(은행별 상이)" />
          <Toggle id="bhp-locked" checked={raw.includeLocked} onChange={(v) => set("includeLocked", v)} label="잠금 주식도 자산에 포함 (삼성 특별경영성과급 자사주 1·2년 잠금분)" />
          <Toggle id="bhp-85" checked={raw.isOver85} onChange={(v) => set("isOver85", v)} label="전용 85㎡ 초과 (농어촌특별세 0.2% 추가)" />
        </div>
      </details>

      {/* 8) 출처·면책 */}
      <section aria-labelledby="bhp-src-title" className="rounded-2xl border border-canvas-200 bg-white p-5 text-sm dark:border-canvas-800 dark:bg-canvas-900 sm:p-6">
        <h2 id="bhp-src-title" className="text-lg font-black text-navy dark:text-canvas-50">출처 (기준일)</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-relaxed text-muted-blue dark:text-canvas-300">
          <li>출처: 한국부동산원 전국주택가격동향조사, {MARKET_SNAPSHOT.rone.monthLabel} — (월) 중위매매가격_아파트, 시·군·구 (<a className="underline" href={MARKET_SNAPSHOT.rone.sourceUrl} target="_blank" rel="noopener noreferrer">R-ONE</a>, {MARKET_SNAPSHOT.fetchedAt} 수집)</li>
          <li>출처: 한국은행 경제통계시스템(ECOS) — 예금은행 주택담보대출 금리(신규취급액), {MARKET_SNAPSHOT.ecos.monthLabel}</li>
          <li>영업이익: DART 삼성전자·SK하이닉스 정기보고서 요약연결재무정보(2026 반기보고서 2026-08-14 등)</li>
          <li>성과급 제도: 삼성전자 2026 임금협약(2026-05-27 가결)·2025년분 OPI·2026 상반기 TAI, SK하이닉스 2026 임단협(2026-09-16 가결) — 모두 보도 기준</li>
          {LOAN_RULE_SOURCES.map((src) => (
            <li key={src.url}>
              대출 규제: <a className="underline" href={src.url} target="_blank" rel="noopener noreferrer">{src.label}</a> ({src.date})
            </li>
          ))}
          <li>세금: 성과급 계산기 공통 세후 엔진(연간 결정세액 차이 + 4대보험) · 취득세 1주택 표준세율 · 대출 규제 기준일 {LOAN_RULES_AS_OF}</li>
        </ul>
        <p className="mt-4 rounded-xl bg-electric-5 p-3 text-xs font-bold leading-relaxed text-navy dark:text-canvas-100">
          투자·부동산·대출 자문이 아닌 가정 기반 계산입니다. 영업이익은 시나리오(가정)이고, 성과급·대출 한도는 회사 공지와 은행 심사에 따라 달라집니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
          <Link href="/calc/samsung-bonus" className="rounded-lg bg-canvas-50 px-3 py-2 text-electric hover:underline dark:bg-canvas-800">삼성전자 성과급 계산기</Link>
          <Link href="/calc/sk-hynix-bonus" className="rounded-lg bg-canvas-50 px-3 py-2 text-electric hover:underline dark:bg-canvas-800">SK하이닉스 성과급 계산기</Link>
          <Link href="/home-loan" className="rounded-lg bg-canvas-50 px-3 py-2 text-electric hover:underline dark:bg-canvas-800">주택담보대출 계산</Link>
          <Link href="/tools/real-estate/dsr" className="rounded-lg bg-canvas-50 px-3 py-2 text-electric hover:underline dark:bg-canvas-800">DSR 계산기</Link>
          <Link href="/tools/real-estate/acquisition-tax" className="rounded-lg bg-canvas-50 px-3 py-2 text-electric hover:underline dark:bg-canvas-800">취득세 계산기</Link>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-canvas-50 p-2 dark:bg-canvas-800">
      <div className="h-8 break-keep text-[11px] leading-4 text-faint-blue line-clamp-2 sm:h-4 sm:line-clamp-1">{label}</div>
      <div className="h-6 truncate text-sm font-black leading-6 tabular-nums text-navy dark:text-canvas-50 sm:text-lg sm:leading-6">{value}</div>
      <div className="h-4 truncate text-[10px] leading-4 text-faint-blue">{sub}</div>
    </div>
  );
}

function AdvancedNumber({ id, label, value, onChange, note, placeholder, allowNegative }: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  note: string;
  placeholder?: string;
  allowNegative?: boolean;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-xs font-bold text-faint-blue">{label}</label>
      <NumberInput id={id} inputMode="decimal" allowNegative={allowNegative} maxLength={13} value={value} placeholder={placeholder} onValueChange={onChange}
        className="mt-1 block h-10 w-full rounded-lg border border-canvas-200 bg-white px-3 text-base font-bold tabular-nums text-navy placeholder:text-faint-blue focus:border-electric focus:outline-none dark:border-canvas-700 dark:bg-canvas-800 dark:text-canvas-50" />
      <p className="mt-1 text-[11px] leading-snug text-faint-blue">{note}</p>
    </div>
  );
}

function Toggle({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-2 text-muted-blue dark:text-canvas-300">
      <input id={id} type="checkbox" className="mt-1 h-4 w-4 accent-electric" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
