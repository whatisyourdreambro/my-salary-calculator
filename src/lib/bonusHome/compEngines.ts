// src/lib/bonusHome/compEngines.ts
//
// 성과급 내 집 마련 계산기 — 연도별 보상 엔진(순수 함수). 회사 제도 숫자는 새로 적지 않고 기존 계산기 모듈을 그대로 쓴다:
//   삼성전자  samsung-bonus/model.ts(영업이익 10.5%·부문:사업부 4:6·임계값 200조/100조·사업부 인원·가중치·세후 엔진)
//             opiData.ts(2025년분 OPI 실지급률, 노조 공지 기반 보도) · taiData.ts(2026 상반기 TAI, 2026-07-06 발표 보도)
//   SK하이닉스 sk-hynix-bonus/psData.ts(AGREEMENT_2026: PS 재원 10%·지급 50/30/10/10·임금 6.3% — 2026-09-16 가결 보도,
//             EMPLOYEES 34,549명(2025 사업보고서)·REFERENCE_SALARY 1억·BASIC_RATIO 20·PS_HISTORY 2025 2,964%)
//   세후      bonusTaxCalc.calcBonusNet(2026 요율 명시) · samsung model.calcSamsungBonusNet(성과급 계산기 공통 엔진)
// 여기서 새로 정한 값은 '가정'이라고 적힌 기본값뿐이다(월기본급 비율·주가 변동·직접 입력 인상률 0% 등).
//
// 연도 축: 실적 연도 FY(2026~2030)의 성과급을 FY+1 년(2027~2031)에 받는다.
//   삼성 OPI1(초과이익성과금)·OPI2(특별경영성과급) = FY+1 년 1월. TAI = 그해 7월·12월(상·하반기).
//   SK PS = FY+1 년 2월 현금 50% · 4월 주식 30%(즉시 매도 가능) · FY+2 년 주식 10% · FY+3 년 주식 10%.
//      PI = 반기마다 기본급(연봉 ÷ 20) × PI% — FY 하반기분은 FY+1 년 1월, 상반기분은 그해 7월.
//   세금은 받는 해의 연봉에 더해 계산한다(연말정산 구조의 결정세액 차이 + 4대보험 — 2026 요율·세율 기준).

import {
  calcSamsungBonusNet,
  computeDivisionPool,
  defaultDivisionCounts,
  defaultDivisionRatios,
  getThreshold,
  REFERENCE_SALARY as SAMSUNG_REFERENCE_SALARY,
  type DivisionId,
} from "@/app/calc/samsung-bonus/model";
import { OPI_ACTUAL_2025, OPI1_MAX_RATE } from "@/app/calc/samsung-bonus/opiData";
import { TAI_RATES_2026_H1 } from "@/app/calc/samsung-bonus/taiData";
import {
  AGREEMENT_2026,
  BASIC_RATIO,
  EMPLOYEES,
  PI_2026,
  PS_HISTORY,
  REFERENCE_SALARY as SK_REFERENCE_SALARY,
} from "@/app/calc/sk-hynix-bonus/psData";
import { calcBonusNet } from "@/lib/bonusTaxCalc";
import { INSURANCE_RATES_2026 } from "@/lib/taxConstants2026";
import { FISCAL_YEARS, PAYOUT_YEARS, type RuleScenarioId, type ScenarioId } from "./scenarios";

export type CompanyId = "samsung" | "sk" | "custom";
export type { DivisionId };

/** 계산 기준 연도(입력 연봉 = 2026년 연봉) */
export const BASE_YEAR = 2026;

// ── 연봉 인상률 기본값 ───────────────────────────────────────────
/**
 * 삼성전자 2026 임금협약 — 기본인상률 4.1% + 성과인상률 평균 2.1% = 6.2%.
 * 2026-05-27 조합원 투표 가결(찬성 73.7%) — 복수 언론 보도 기준(삼성 성과급 계산기 FAQ 와 같은 출처).
 * 계산기는 2027년 이후에도 같은 인상률이 이어진다고 '가정'한다(사용자 수정 가능).
 */
export const SAMSUNG_WAGE_2026 = {
  basePct: 4.1,
  meritAvgPct: 2.1,
  totalPct: 6.2,
  ratifiedDate: "2026-05-27",
  note: "2026 임금협약 기본 4.1% + 성과 평균 2.1% — 조합원 투표 가결 2026-05-27, 보도 기준",
} as const;

export const DEFAULT_WAGE_GROWTH_PCT: Record<CompanyId, number> = {
  samsung: SAMSUNG_WAGE_2026.totalPct,
  sk: AGREEMENT_2026.wageIncreasePct, // 6.3% — 2026-09-16 가결 보도(psData)
  custom: 0,
};

// ── 삼성전자 DS ──────────────────────────────────────────────────
/** OPI1 기본값 — 2025년분 DS부문 공통 실지급률(opiData 'ds-common' 47%, 노조 공지 기반 보도). 이후 연도에도 같다고 가정 */
export const SAMSUNG_OPI1_DEFAULT_PCT: number = (() => {
  const row = OPI_ACTUAL_2025.rates.find((r) => r.id === "ds-common");
  if (!row) throw new Error("[bonusHome] opiData 에 ds-common 행이 없다");
  return row.rate;
})();
export const SAMSUNG_OPI1_MAX_PCT = OPI1_MAX_RATE;

/** 계산기 사업부(model DIVISIONS) → 2026 상반기 TAI 행(taiData) */
const TAI_ROW_OF: Record<DivisionId, string> = {
  memory: "memory", // 메모리 100%
  common: "lab", // 반도체연구소·SAIT·DS공통 100%
  foundry: "foundry", // 파운드리 75% (시스템LSI 도 75%)
};
export function samsungTaiRatePct(division: DivisionId): number {
  const row = TAI_RATES_2026_H1.find((r) => r.id === TAI_ROW_OF[division]);
  if (!row) throw new Error(`[bonusHome] taiData 에 ${TAI_ROW_OF[division]} 행이 없다`);
  return row.rate;
}

/**
 * TAI 계산용 월 기본급 기본값 = 연봉 × 60% ÷ 12 (가정).
 * 삼성 TAI 계산기 안내문의 '기본급은 통상 연봉의 60~75% 수준' 중 하한 — 급여명세서 기본급으로 고칠 수 있다.
 */
export const TAI_BASE_SHARE_OF_SALARY = 0.6;
export const defaultTaiBaseMonthly = (salary: number): number =>
  Number.isFinite(salary) && salary > 0 ? Math.round((salary * TAI_BASE_SHARE_OF_SALARY) / 12) : 0;

/** OPI2(특별경영성과급) 세후 자사주 — 1/3 즉시 매도 가능, 1/3 은 1년·1/3 은 2년 잠금 (2026-05-27 타결 보도 기준) */
export const SAMSUNG_OPI2_TRANCHES = [
  { afterYears: 0, share: 1 / 3 },
  { afterYears: 1, share: 1 / 3 },
  { afterYears: 2, share: 1 / 3 },
] as const;

// ── SK하이닉스 ───────────────────────────────────────────────────
/** PI(반기당, 기본급 대비 %) 기본값 — 가정. 보도된 PI 구간표(psData PI_TIERS) 기준 최대 150%, 보수 시나리오는 100% 구간 */
export const SK_PI_DEFAULT_PCT: Record<ScenarioId, number> = {
  conservative: 100,
  base: 150,
  optimistic: 150,
  custom: 150,
};
/** PS 신 체계 지급 비율(%) — psData AGREEMENT_2026.newSplit (현금 50 · 주식 30 · 이연 주식 10 · 10) */
const SPLIT = AGREEMENT_2026.newSplit;
/** 2025년분 PS(2026-02 지급)는 구 체계 — 현금 80% 당해 + 이연 현금 10%p × 2년 (psData oldSplit) */
const OLD_SPLIT = AGREEMENT_2026.oldSplit;
const PS_2025_ROW = PS_HISTORY.find((r) => r.year === 2025);
/** 2025년분 PS 지급률(기본급 대비 %) — psData PS_HISTORY 2,964% (2026-02-05 지급 보도) */
export const SK_PS_2025_PCT = PS_2025_ROW?.psRatePct ?? 0;
/** 2025년 PI 연간 합계(%) — psData PS_HISTORY 300% = 반기 150% × 2 */
const SK_PI_2025_HALF_PCT = (PS_2025_ROW?.piTotalPct ?? 0) / 2;

// ── 입력·결과 타입 ──────────────────────────────────────────────
export type CompInputs = {
  company: CompanyId;
  /** 삼성 사업부 */
  division: DivisionId;
  /** 2026년 연봉(세전, 원) */
  salary0: number;
  /** 연봉 인상률(연 %) */
  wageGrowthPct: number;
  /** 실적 연도 2026~2030 영업이익(조원) — 삼성·SK */
  ops: number[];
  /** 삼성 OPI1 (연봉 대비 %) */
  opi1Pct: number;
  /** 삼성 2026년 월 기본급(원) — TAI 산정 */
  taiBaseMonthly0: number;
  /** SK PI (반기당, 기본급 대비 %) */
  piPct: number;
  /** 직접 입력 — 연 성과급(연봉 대비 %) */
  customBonusPct: number;
  /** 주가 변동 가정(연 %) — 잠금·이연 주식 가치에만 적용 */
  stockGrowthPct: number;
};

export type CompComponent = { label: string; gross: number };

export type YearComp = {
  year: number;
  salary: number;
  /** 성과급 구성 3칸(회사마다 라벨 고정, 없는 칸은 라벨 '—'·0) */
  components: [CompComponent, CompComponent, CompComponent];
  /** 그해 과세되는 성과급 세전 합계 */
  gross: number;
  /** 세후 */
  net: number;
  /** 성과급 실효 공제율(%) */
  effRate: number;
  /** 그해 현금화 가능한 세후 성과급 (삼성 OPI2 는 즉시분 1/3 만) */
  liquidNet: number;
  /** 그해 잠금 해제되는 삼성 자사주 가치(가정 주가 반영) */
  unlockedValue: number;
  /** 연말 기준 아직 잠긴 삼성 자사주 가치(가정 주가 반영) */
  lockedHeldValue: number;
};

export type CompResult = {
  years: YearComp[];
  /** 2026년(직전 연도) 총급여 = 연봉 + 그해 받은 성과급 — 2027년 구매 시 DSR 소득 */
  gross2026: { salary: number; bonus: number };
  /** 2031년 이후에 받는(풀리는) 몫 — 세후 기준 가치 */
  afterHorizon: { year: number; label: string; value: number }[];
  /** 5년(2027~2031) 누적 세후 성과급 */
  fiveYearNet: number;
  /** 5년 누적 총보상(연봉 + 성과급, 세전) */
  fiveYearGrossComp: number;
};

const EMPTY: CompComponent = { label: "—", gross: 0 };
const fin = (n: number, fallback = 0): number => (Number.isFinite(n) ? n : fallback);
const pos = (n: number): number => (Number.isFinite(n) && n > 0 ? n : 0);

export function salaryOf(inputs: Pick<CompInputs, "salary0" | "wageGrowthPct">, year: number): number {
  const s0 = pos(inputs.salary0);
  const g = fin(inputs.wageGrowthPct) / 100;
  return s0 * Math.pow(1 + g, year - BASE_YEAR);
}

const opOf = (inputs: CompInputs, fy: number): number => fin(inputs.ops[fy - FISCAL_YEARS[0]] ?? 0);
const growth = (inputs: CompInputs, years: number): number =>
  Math.pow(1 + fin(inputs.stockGrowthPct) / 100, years);

/** 삼성 OPI2(특별경영성과급) 1인 세전 — 풀 분배 모델(model.computeDivisionPool) × 본인 연봉 ÷ 기준 연봉 8천만 */
export function samsungOpi2(op: number, fy: number, division: DivisionId, salaryFy: number): number {
  if (fy < 2026) return 0; // 2027년 1월 첫 지급(2026년 실적분)부터
  const triggered = fin(op) >= getThreshold(fy);
  const pool = computeDivisionPool(fin(op), defaultDivisionCounts(), defaultDivisionRatios(), triggered);
  const row = pool.perDivision.find((d) => d.id === division);
  const perPersonManwon = row ? row.buPart + row.saPart : 0;
  return (perPersonManwon * pos(salaryFy) / SAMSUNG_REFERENCE_SALARY) * 10_000;
}

/** SK PS 1인 세전 — 영업이익 × 10% ÷ 직원 수 × 본인 연봉 ÷ 1억 (sk-hynix-bonus Client 와 같은 산식) */
export function skPs(op: number, salaryFy: number): number {
  return ((Math.max(0, fin(op)) * 1e12 * AGREEMENT_2026.poolRate) / EMPLOYEES) * (pos(salaryFy) / SK_REFERENCE_SALARY);
}

function computeSamsung(inputs: CompInputs): CompResult {
  const opi1 = Math.min(Math.max(0, fin(inputs.opi1Pct)), OPI1_MAX_RATE) / 100;
  const taiRate = samsungTaiRatePct(inputs.division) / 100;
  const g = fin(inputs.wageGrowthPct) / 100;
  const taiBase = (year: number) => pos(inputs.taiBaseMonthly0) * Math.pow(1 + g, year - BASE_YEAR);
  // 잠금 해제 스케줄: unlock[year] += 가치
  const unlock = new Map<number, number>();
  const lockedGrants: { grantYear: number; unlockYear: number; netValue: number }[] = [];
  const years: YearComp[] = [];
  for (const year of PAYOUT_YEARS) {
    const fy = year - 1;
    const salary = salaryOf(inputs, year);
    const salaryFy = salaryOf(inputs, fy);
    const opi1Won = salaryFy * opi1;
    const opi2Won = samsungOpi2(opOf(inputs, fy), fy, inputs.division, salaryFy);
    const taiWon = taiBase(year) * taiRate * 2;
    const gross = opi1Won + opi2Won + taiWon;
    const tax = calcSamsungBonusNet(salary, gross, 0, true);
    const net = gross > 0 ? tax.net : 0;
    const ratio = gross > 0 ? net / gross : 0;
    const opi2Net = opi2Won * ratio;
    for (const t of SAMSUNG_OPI2_TRANCHES) {
      if (t.afterYears === 0) continue;
      const value = opi2Net * t.share * growth(inputs, t.afterYears);
      unlock.set(year + t.afterYears, (unlock.get(year + t.afterYears) ?? 0) + value);
      lockedGrants.push({ grantYear: year, unlockYear: year + t.afterYears, netValue: opi2Net * t.share });
    }
    const liquidNet = (opi1Won + taiWon) * ratio + opi2Net * SAMSUNG_OPI2_TRANCHES[0].share;
    const lockedHeldValue = lockedGrants
      .filter((l) => l.grantYear <= year && l.unlockYear > year)
      .reduce((acc, l) => acc + l.netValue * growth(inputs, year - l.grantYear), 0);
    years.push({
      year,
      salary,
      components: [
        { label: "OPI(초과이익성과금)", gross: opi1Won },
        { label: "특별경영성과급", gross: opi2Won },
        { label: "TAI(목표달성장려금)", gross: taiWon },
      ],
      gross,
      net,
      effRate: gross > 0 ? tax.effRate : 0,
      liquidNet,
      unlockedValue: unlock.get(year) ?? 0,
      lockedHeldValue,
    });
  }
  const last = PAYOUT_YEARS[PAYOUT_YEARS.length - 1];
  const afterHorizon = [...unlock.entries()]
    .filter(([y]) => y > last)
    .sort((a, b) => a[0] - b[0])
    .map(([y, value]) => ({ year: y, label: "특별경영성과급 자사주 잠금 해제", value }));
  // 2026년에 받은 성과급(DSR 소득용) — 2025년분 OPI(2026-01 지급, DS부문 공통 실지급률) + 2026 TAI(상반기 실지급률, 하반기 같다고 가정)
  const salary2025 = salaryOf(inputs, 2025);
  const bonus2026 = salary2025 * (SAMSUNG_OPI1_DEFAULT_PCT / 100) + taiBase(2026) * taiRate * 2;
  return finish(inputs, years, afterHorizon, bonus2026);
}

function computeSk(inputs: CompInputs): CompResult {
  const pi = Math.max(0, fin(inputs.piPct)) / 100;
  const psByFy = new Map<number, number>();
  for (const fy of FISCAL_YEARS) psByFy.set(fy, skPs(opOf(inputs, fy), salaryOf(inputs, fy)));
  const salary2025 = salaryOf(inputs, 2025);
  const ps2025 = (SK_PS_2025_PCT / 100) * (salary2025 / BASIC_RATIO);
  const ps = (fy: number) => psByFy.get(fy) ?? 0;
  const deliveredIn = (year: number) => {
    // 신 체계(2026년분부터): FY+1 현금 50%·주식 30%, FY+2·FY+3 주식 10%씩
    const cash = ps(year - 1) * (SPLIT.cashNowPct / 100);
    const stock =
      ps(year - 1) * (SPLIT.stockNowPct / 100) +
      ps(year - 2) * (SPLIT.stockYear1Pct / 100) * growth(inputs, 1) +
      ps(year - 3) * (SPLIT.stockYear2Pct / 100) * growth(inputs, 2);
    // 구 체계 2025년분 이연 현금 10%p — 2027·2028년
    const oldDeferred =
      year === 2027 ? ps2025 * (OLD_SPLIT.cashYear1Pct / 100) : year === 2028 ? ps2025 * (OLD_SPLIT.cashYear2Pct / 100) : 0;
    return { cash: cash + oldDeferred, stock };
  };
  const years: YearComp[] = [];
  for (const year of PAYOUT_YEARS) {
    const salary = salaryOf(inputs, year);
    const { cash, stock } = deliveredIn(year);
    // PI: 전년 하반기분(1월, 전년 기본급) + 그해 상반기분(7월, 그해 기본급)
    const piWon = (salaryOf(inputs, year - 1) / BASIC_RATIO) * pi + (salary / BASIC_RATIO) * pi;
    const gross = cash + stock + piWon;
    const tax = calcBonusNet(salary, gross, 0, true, INSURANCE_RATES_2026);
    const net = gross > 0 ? tax.net : 0;
    years.push({
      year,
      salary,
      components: [
        { label: "PS 현금", gross: cash },
        { label: "PS 자사주", gross: stock },
        { label: "PI", gross: piWon },
      ],
      gross,
      net,
      effRate: gross > 0 ? tax.effectiveRate : 0,
      liquidNet: net, // 주식분도 받는 즉시 매도 가능(가결안 보도)
      unlockedValue: 0,
      lockedHeldValue: 0,
    });
  }
  const last = PAYOUT_YEARS[PAYOUT_YEARS.length - 1];
  const afterHorizon: CompResult["afterHorizon"] = [];
  for (let year = last + 1; year <= last + 2; year++) {
    const { stock } = deliveredIn(year);
    // 세전 가치 — 받는 해 세율을 알 수 없어 세전으로 적는다
    if (stock > 0) afterHorizon.push({ year, label: "PS 이연 자사주(세전)", value: stock });
  }
  // 2026년에 받은 성과급(DSR 소득용) — 2025년분 PS 당해 80%(2026-02) + 2025 하반기 PI(1월) + 2026 상반기 PI(7월, 150% 보도)
  const bonus2026 =
    ps2025 * (OLD_SPLIT.cashNowPct / 100) +
    (salary2025 / BASIC_RATIO) * (SK_PI_2025_HALF_PCT / 100) +
    (salaryOf(inputs, 2026) / BASIC_RATIO) * (PI_2026.h1.rate / 100);
  return finish(inputs, years, afterHorizon, bonus2026);
}

function computeCustom(inputs: CompInputs): CompResult {
  const pct = Math.max(0, fin(inputs.customBonusPct)) / 100;
  const years: YearComp[] = [];
  for (const year of PAYOUT_YEARS) {
    const salary = salaryOf(inputs, year);
    const gross = salaryOf(inputs, year - 1) * pct; // 전년 실적분을 1월에 현금으로
    const tax = calcBonusNet(salary, gross, 0, true, INSURANCE_RATES_2026);
    const net = gross > 0 ? tax.net : 0;
    years.push({
      year,
      salary,
      components: [{ label: "성과급(직접 입력)", gross }, EMPTY, EMPTY],
      gross,
      net,
      effRate: gross > 0 ? tax.effectiveRate : 0,
      liquidNet: net,
      unlockedValue: 0,
      lockedHeldValue: 0,
    });
  }
  return finish(inputs, years, [], salaryOf(inputs, 2025) * pct);
}

function finish(inputs: CompInputs, years: YearComp[], afterHorizon: CompResult["afterHorizon"], bonus2026: number): CompResult {
  return {
    years,
    gross2026: { salary: salaryOf(inputs, 2026), bonus: pos(bonus2026) },
    afterHorizon,
    fiveYearNet: years.reduce((a, y) => a + y.net, 0),
    fiveYearGrossComp: years.reduce((a, y) => a + y.salary + y.gross, 0),
  };
}

export function computeComp(inputs: CompInputs): CompResult {
  if (inputs.company === "samsung") return computeSamsung(inputs);
  if (inputs.company === "sk") return computeSk(inputs);
  return computeCustom(inputs);
}

/** 규칙 시나리오의 SK PI 기본값 */
export const skPiDefaultFor = (scenario: ScenarioId | RuleScenarioId): number => SK_PI_DEFAULT_PCT[scenario];
