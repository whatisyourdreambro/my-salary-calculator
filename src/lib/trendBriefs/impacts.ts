// src/lib/trendBriefs/impacts.ts
//
// 브리프 영향 표 엔진 — 연도 고정(year-pinned) 계산 종류(kind)와 정본 상수 표기(constText).
// ★규칙
//   - 현행 요율 포인터(CURRENT_* · src/config/currentRates)를 import 하지 않는다. 요율은 연도 상수를 명시해 넘긴다
//     (포인터가 1/1 에 2027 로 바뀌어도 발행된 브리프의 표가 조용히 바뀌지 않게).
//   - verify:tax 감시 리터럴(요율·상한·최저임금 숫자)을 이 파일에 쓰지 않는다 — 전부 정본 상수에서 파생.
//   - 연도 요율을 인자로 받을 수 없는 엔진은 쓰지 않는다.
//   - React·'use client' 모듈을 import 하지 않는다(trendBriefImpacts.test.ts 가 정적 import 그래프로 확인).
//   - 표 값은 엔진 계산만 — 손으로 쓴 표 없음. 수치는 fixtures/trendBriefNumbers.json 에 고정된다.
// 브리프 본문(src/lib/guides/trend-briefs-YYYY-MM.ts)은 ${impactRows(...)}·${impactCell(...)}·${constText(...)} 로만 끼워 넣는다.
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { INSURANCE_RATES_2026, PENSION_BASE_2026, type InsuranceRates } from "@/lib/taxConstants2026";
import { INSURANCE_RATES_2027, INSURANCE_RATES_2027_STATUS } from "@/lib/taxConstants2027";
import {
  MINIMUM_WAGE_2025,
  MINIMUM_WAGE_2026,
  MINIMUM_WAGE_2027,
  MONTHLY_HOURS,
  type MinimumWageYear,
} from "@/config/minimumWage";
import { UNEMPLOYMENT_BENEFIT_2026, unemploymentDailyLowerBound } from "@/config/unemploymentBenefit";
import { GENERAL_PAY_ROWS_2026, forecast2027 } from "@/lib/civilServantPay";
import {
  calculateYearEndTax,
  deriveAnnualSocialInsurance2026,
  estimatePrepaidIncomeTax2026,
} from "@/lib/yearEndTaxCalculator";
import { calculateSeverancePay } from "@/lib/severanceCalculator";
import { calculateHomeLoanRepayment } from "@/lib/homeLoanRepayment";
import { calcBonusNet } from "@/lib/bonusTaxCalc";
import type { ClusterId } from "./types";

// ─────────────────────────────────────────────────────────────
// 표기 도구 (결정적 — 로캘 의존 없음)
// ─────────────────────────────────────────────────────────────
/** 천 단위 쉼표 (정수로 반올림) */
export function groupDigits(n: number): string {
  const r = Math.round(n);
  const sign = r < 0 ? "−" : "";
  return sign + String(Math.abs(r)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
export const won = (n: number) => `${groupDigits(n)}원`;
/** 만원 단위(1억 이상은 'N억 M만원') — 1만원으로 나누어떨어지지 않으면 원 단위로 */
export function manwon(n: number): string {
  const v = Math.round(n);
  if (v % 10000 !== 0 || v < 0) return won(v);
  const eok = Math.floor(v / 100_000_000);
  const man = (v % 100_000_000) / 10000;
  if (!eok) return `${groupDigits(man)}만원`;
  return man ? `${groupDigits(eok)}억 ${groupDigits(man)}만원` : `${groupDigits(eok)}억원`;
}
/** 부호 있는 원 (+/−) */
export const signedWon = (n: number) => (Math.round(n) > 0 ? `+${won(n)}` : Math.round(n) === 0 ? "0원" : won(n));
/** 비율(소수) → 퍼센트 표기 — 부동소수 오차 제거 후 뒤 0 제거 (예: 0.009 → "0.9%") */
export function pct(rate: number): string {
  return `${Number((rate * 100).toFixed(6))}%`;
}

/** 표·셀 HTML 이스케이프 */
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;"
  );
}

// ─────────────────────────────────────────────────────────────
// 파라미터 스키마 (writer-input.json 에 그대로 실린다)
// ─────────────────────────────────────────────────────────────
export interface ImpactParamSpec {
  type: "number" | "number[]" | "enum" | "enum[]" | "rates";
  required: boolean;
  label: string;
  min?: number;
  max?: number;
  integer?: boolean;
  minItems?: number;
  maxItems?: number;
  values?: readonly string[];
  default?: unknown;
}
export interface ImpactBuild {
  /** 행마다 [시나리오 라벨, 값…] — 표시 문자열(이스케이프 전) */
  rows: string[][];
  /** 셀 표기와 위치 — 숫자 출처 대조용 (engine:<kind>:<r>:<c>) */
  numbers: { token: string; locator: string }[];
  /** 확정되지 않은 값의 이름 — 본문에 '확정' 금지 */
  provisional: string[];
}
export interface ImpactKind {
  id: string;
  label: string;
  clusters: readonly ClusterId[];
  /** thead 라벨(일반 표현) — [시나리오, 값1, 값2, …] */
  columns: readonly string[];
  paramsSchema: Readonly<Record<string, ImpactParamSpec>>;
  build(params: Record<string, unknown>): Omit<ImpactBuild, "numbers">;
}

type P = Record<string, unknown>;
const nums = (p: P, k: string) => (Array.isArray(p[k]) ? (p[k] as number[]) : []);
const num = (p: P, k: string, d: number) => (typeof p[k] === "number" ? (p[k] as number) : d);
const strs = (p: P, k: string) => (Array.isArray(p[k]) ? (p[k] as string[]) : []);
const str = (p: P, k: string, d: string) => (typeof p[k] === "string" ? (p[k] as string) : d);

const RATE_KEYS = ["NATIONAL_PENSION", "HEALTH_INSURANCE", "LONG_TERM_CARE_RATIO", "EMPLOYMENT_INSURANCE"] as const;
type RateKey = (typeof RATE_KEYS)[number];

const MIN_WAGE_BY_YEAR: Readonly<Record<string, MinimumWageYear>> = {
  "2025": MINIMUM_WAGE_2025,
  "2026": MINIMUM_WAGE_2026,
  "2027": MINIMUM_WAGE_2027,
};
const GRADE_COL: Readonly<Record<string, number>> = { "9급": 1, "8급": 2, "7급": 3, "6급": 4, "5급": 5 };

/** 4대보험 근로자 부담 월액(엔진) — 연금·건보+장기요양·고용 */
function insuranceMonthly(monthlyPay: number, rates: InsuranceRates) {
  const r = calculateSalary2026(monthlyPay * 12, 0, 1, 0, rates);
  return {
    pension: r.nationalPension,
    health: r.healthInsurance + r.longTermCare,
    employment: r.employmentInsurance,
    total: r.nationalPension + r.healthInsurance + r.longTermCare + r.employmentInsurance,
  };
}

/** YYYY-MM-DD 에서 정확히 N년 근속이 되는 입사일(마지막 근무일 기준) */
function startDateForYears(endDate: string, years: number): string {
  const [y, m, d] = endDate.split("-").map(Number);
  const start = new Date(Date.UTC(y - years, m - 1, d + 1));
  return start.toISOString().slice(0, 10);
}

export const IMPACT_KINDS: Readonly<Record<string, ImpactKind>> = {
  "net-pay": {
    id: "net-pay",
    label: "연봉별 월 실수령액 (요율 연도 고정: 2026)",
    clusters: ["minimum-wage", "social-insurance-rates", "tax-law-amendment"],
    columns: ["연봉(가정)", "월 공제 합계", "월 실수령액"],
    paramsSchema: {
      salaries: { type: "number[]", required: true, label: "연봉 시나리오(원)", min: 10_000_000, max: 300_000_000, minItems: 3, maxItems: 6 },
      nonTaxableMonthly: { type: "number", required: false, label: "월 비과세(원)", min: 0, max: 400_000, default: 200_000 },
      dependents: { type: "number", required: false, label: "부양가족 수(본인 포함)", min: 1, max: 6, integer: true, default: 1 },
    },
    build(p) {
      const nonTax = num(p, "nonTaxableMonthly", 200_000);
      const deps = num(p, "dependents", 1);
      const rows = nums(p, "salaries").map((s) => {
        const r = calculateSalary2026(s, nonTax, deps, 0, INSURANCE_RATES_2026);
        return [manwon(s), won(r.totalDeductions), won(r.netPay)];
      });
      return { rows, provisional: [] };
    },
  },
  "insurance-rate-change": {
    id: "insurance-rate-change",
    label: "4대보험 요율 변경 전후 근로자 월 부담 (현행 → 다음 해 요율 또는 출처 요율)",
    clusters: ["social-insurance-rates", "national-pension"],
    columns: ["월 보수(가정)", "국민연금(현행 → 변경 후)", "건강·장기요양(현행 → 변경 후)", "고용보험(현행 → 변경 후)", "월 부담 차이"],
    paramsSchema: {
      monthlyPays: { type: "number[]", required: true, label: "월 보수 시나리오(원)", min: 1_000_000, max: 10_000_000, minItems: 3, maxItems: 6 },
      base: {
        type: "enum",
        required: false,
        label:
          "변경 후 요율의 바탕 — 2026(기본): 현행 요율에 override 만 반영 · 2027: taxConstants2027 요율(결정 전 항목은 provisional — 렌더가 표 설명에 '아직 결정 전' 고지를 자동으로 붙인다). 2027 은 명시적으로 고를 때만",
        values: ["2026", "2027"],
        default: "2026",
      },
      override: {
        type: "rates",
        required: false,
        label: "출처에 적힌 변경 후 요율(비율, 예 0.01) — NATIONAL_PENSION·HEALTH_INSURANCE·LONG_TERM_CARE_RATIO·EMPLOYMENT_INSURANCE",
        min: 0,
        max: 0.2,
      },
    },
    build(p) {
      const override = (p.override && typeof p.override === "object" ? p.override : {}) as Partial<Record<RateKey, number>>;
      // 기본은 2026(현행) — 결정 전 값이 섞이는 2027 은 writer 가 명시적으로 고를 때만 (critic fix 2026-09-26)
      const base2026 = str(p, "base", "2026") === "2026";
      const after: InsuranceRates = { ...(base2026 ? INSURANCE_RATES_2026 : INSURANCE_RATES_2027), ...override };
      const provisional = base2026
        ? []
        : RATE_KEYS.filter((k) => override[k] === undefined && INSURANCE_RATES_2027_STATUS[k] !== "confirmed").map((k) => `INSURANCE_RATES_2027.${k}`);
      const arrow = (x: number, y: number) => `${won(x)} → ${won(y)}`;
      const rows = nums(p, "monthlyPays").map((m) => {
        const a = insuranceMonthly(m, INSURANCE_RATES_2026);
        const b = insuranceMonthly(m, after);
        return [manwon(m), arrow(a.pension, b.pension), arrow(a.health, b.health), arrow(a.employment, b.employment), signedWon(b.total - a.total)];
      });
      return { rows, provisional };
    },
  },
  "minimum-wage": {
    id: "minimum-wage",
    label: "최저임금 연도별 시급·월·연 환산 (주 40시간·월 209시간)",
    clusters: ["minimum-wage"],
    columns: ["구분", "이전 연도", "적용 연도", "차이"],
    paramsSchema: {
      from: { type: "enum", required: true, label: "이전 연도", values: ["2025", "2026"] },
      to: { type: "enum", required: true, label: "적용 연도(이전 연도 + 1)", values: ["2026", "2027"] },
    },
    build(p) {
      const a = MIN_WAGE_BY_YEAR[str(p, "from", "2026")];
      const b = MIN_WAGE_BY_YEAR[str(p, "to", "2027")];
      if (!a || !b) return { rows: [], provisional: [] };
      const rows = [
        ["시급", won(a.hourly), won(b.hourly), signedWon(b.hourly - a.hourly)],
        [`월 환산(${MONTHLY_HOURS}시간)`, won(a.monthly), won(b.monthly), signedWon(b.monthly - a.monthly)],
        ["연 환산(월 × 12)", won(a.yearly), won(b.yearly), signedWon(b.yearly - a.yearly)],
      ];
      return { rows, provisional: [] };
    },
  },
  "civil-servant-pay": {
    id: "civil-servant-pay",
    label: "공무원 일반직 봉급 현행 대비 정부안 단순 적용 예상",
    clusters: ["civil-servant-pay"],
    columns: ["직급·호봉", "현행 봉급(확정표)", "정부안 단순 적용 예상", "차이"],
    paramsSchema: {
      grades: { type: "enum[]", required: true, label: "직급", values: ["9급", "8급", "7급", "6급", "5급"], minItems: 1, maxItems: 3 },
      steps: { type: "number[]", required: true, label: "호봉(1~10)", min: 1, max: 10, integer: true, minItems: 1, maxItems: 3 },
    },
    build(p) {
      const rows: string[][] = [];
      for (const g of strs(p, "grades")) {
        const col = GRADE_COL[g];
        for (const step of nums(p, "steps")) {
          const row = GENERAL_PAY_ROWS_2026.find((r) => r[0] === step);
          if (!col || !row) continue;
          const base = row[col];
          const next = forecast2027(base);
          rows.push([`${g} ${step}호봉`, won(base), won(next), signedWon(next - base)]);
        }
      }
      return { rows, provisional: ["RAISE_2027_BUDGET"] };
    },
  },
  "year-end-tax": {
    id: "year-end-tax",
    label: "총급여별 2026년 귀속 연말정산 추정 (카드 사용 비율 가정)",
    clusters: ["year-end-tax", "tax-law-amendment"],
    columns: ["총급여(가정)", "결정세액", "기납부세액(추정)", "환급(+)·추가 납부(−)"],
    paramsSchema: {
      salaries: { type: "number[]", required: true, label: "총급여 시나리오(원)", min: 20_000_000, max: 200_000_000, minItems: 3, maxItems: 6 },
      cardSpendRatio: { type: "number", required: false, label: "신용카드 사용액 ÷ 총급여", min: 0, max: 0.6, default: 0.3 },
      dependents: { type: "number", required: false, label: "기본공제 대상자(본인 포함)", min: 1, max: 4, integer: true, default: 1 },
    },
    build(p) {
      const ratio = num(p, "cardSpendRatio", 0.3);
      const deps = num(p, "dependents", 1);
      const rows = nums(p, "salaries").map((s) => {
        const ins = deriveAnnualSocialInsurance2026(s);
        const prepaid = estimatePrepaidIncomeTax2026(s, deps, 0);
        const r = calculateYearEndTax({
          grossSalary: s,
          prepaidTax: prepaid,
          nationalPension: ins.nationalPension,
          healthInsurance: ins.healthInsurance,
          employmentInsurance: ins.employmentInsurance,
          dependents: deps,
          disabledDependents: 0,
          seniorDependents: 0,
          housingSubscription: 0,
          creditCard: Math.round(s * ratio),
          debitCardAndCash: 0,
          traditionalMarket: 0,
          publicTransport: 0,
          children: 0,
          birthsOrAdoptions: 0,
          pensionSavings: 0,
          irp: 0,
          lifeInsurance: 0,
          medicalExpenses: 0,
          educationExpenses: 0,
          donation: 0,
          monthlyRent: 0,
        });
        return [manwon(s), won(r.determinedTax), won(prepaid), signedWon(r.finalRefund)];
      });
      return { rows, provisional: [] };
    },
  },
  severance: {
    id: "severance",
    label: "월급·근속연수별 퇴직금과 퇴직소득세",
    clusters: ["retirement-pension"],
    columns: ["월급·근속(가정)", "퇴직금(세전)", "퇴직소득세·지방세", "세후 수령액"],
    paramsSchema: {
      monthlyPays: { type: "number[]", required: true, label: "월급 시나리오(원)", min: 1_000_000, max: 20_000_000, minItems: 1, maxItems: 3 },
      years: { type: "number[]", required: true, label: "근속연수(년)", min: 1, max: 40, integer: true, minItems: 1, maxItems: 3 },
      endDate: { type: "enum", required: false, label: "마지막 근무일", values: ["2026-12-31", "2027-06-30", "2027-12-31"], default: "2026-12-31" },
    },
    build(p) {
      const end = str(p, "endDate", "2026-12-31");
      const rows: string[][] = [];
      for (const m of nums(p, "monthlyPays")) {
        for (const y of nums(p, "years")) {
          const r = calculateSeverancePay(startDateForYears(end, y), end, [m, m, m]);
          rows.push([`월 ${manwon(m)} · ${y}년`, won(r.estimatedSeverancePay), won(r.incomeTax + r.localTax), won(r.netSeverancePay)]);
        }
      }
      return { rows, provisional: [] };
    },
  },
  "unemployment-benefit": {
    id: "unemployment-benefit",
    label: "소정근로시간별 구직급여 1일 하한 (2026 이직자 vs 2027 최저임금 적용)",
    clusters: ["unemployment-benefit", "minimum-wage"],
    columns: ["1일 소정근로시간(가정)", "2026년 이직자 하한", "2027년 최저임금 적용 시 하한"],
    paramsSchema: {
      hours: { type: "number[]", required: true, label: "1일 소정근로시간", min: 1, max: 8, integer: true, minItems: 3, maxItems: 5 },
    },
    build(p) {
      const rows = nums(p, "hours").map((h) => {
        const hh = Math.min(h, UNEMPLOYMENT_BENEFIT_2026.MAX_DAILY_HOURS);
        return [`${h}시간`, won(unemploymentDailyLowerBound(hh)), won(unemploymentDailyLowerBound(hh, MINIMUM_WAGE_2027))];
      });
      return { rows, provisional: ["UNEMPLOYMENT_BENEFIT_2027"] };
    },
  },
  "loan-repayment": {
    id: "loan-repayment",
    label: "대출 금리 가정별 월 상환액·총이자 (원리금균등·원금균등)",
    clusters: ["bok-base-rate", "household-loan-policy"],
    columns: ["금리(가정)", "월 상환액", "총 이자"],
    paramsSchema: {
      principal: { type: "number", required: true, label: "대출 원금(원)", min: 10_000_000, max: 1_000_000_000 },
      years: { type: "number", required: true, label: "상환 기간(년)", min: 1, max: 50, integer: true },
      rates: { type: "number[]", required: true, label: "연 금리 가정(%) — 은행 고시 금리 아님", min: 0, max: 20, minItems: 3, maxItems: 6 },
      type: { type: "enum", required: false, label: "상환 방식", values: ["equalPrincipalAndInterest", "equalPrincipal"], default: "equalPrincipalAndInterest" },
    },
    build(p) {
      const principal = num(p, "principal", 0);
      const years = num(p, "years", 0);
      const type = str(p, "type", "equalPrincipalAndInterest") === "equalPrincipal" ? "equalPrincipal" : "equalPrincipalAndInterest";
      const rows = nums(p, "rates").map((rate) => {
        const r = calculateHomeLoanRepayment(principal, rate, years, type);
        return [`연 ${Number(rate.toFixed(3))}%(가정)`, won(r.monthlyPayment), won(r.totalInterest)];
      });
      return { rows, provisional: [] };
    },
  },
  "bonus-net": {
    id: "bonus-net",
    label: "성과급 세후 수령액 (요율 연도 고정: 2026)",
    clusters: ["tax-law-amendment"],
    columns: ["성과급(가정)", "세금·보험료", "세후 수령액"],
    paramsSchema: {
      salary: { type: "number", required: true, label: "연봉(원)", min: 20_000_000, max: 300_000_000 },
      bonuses: { type: "number[]", required: true, label: "성과급 시나리오(원)", min: 1_000_000, max: 200_000_000, minItems: 3, maxItems: 6 },
    },
    build(p) {
      const salary = num(p, "salary", 0);
      const rows = nums(p, "bonuses").map((b) => {
        const r = calcBonusNet(salary, b, 0, true, INSURANCE_RATES_2026);
        return [manwon(b), won(r.totalDeductions), won(r.net)];
      });
      return { rows, provisional: [] };
    },
  },
};

export type ImpactKindId = keyof typeof IMPACT_KINDS;

/** 파라미터 검증 — 위반 목록(빈 배열이면 통과) */
export function validateImpactParams(kindId: string, params: unknown): string[] {
  const kind = IMPACT_KINDS[kindId];
  if (!kind) return [`알 수 없는 영향 표 종류: ${kindId}`];
  if (!params || typeof params !== "object" || Array.isArray(params)) return ["params: 객체 필요"];
  const p = params as P;
  const errors: string[] = [];
  for (const k of Object.keys(p)) if (!(k in kind.paramsSchema)) errors.push(`params.${k}: 알 수 없는 파라미터`);
  const inRange = (v: number, s: ImpactParamSpec) =>
    Number.isFinite(v) && (s.min === undefined || v >= s.min) && (s.max === undefined || v <= s.max) && (!s.integer || Number.isInteger(v));
  for (const [k, s] of Object.entries(kind.paramsSchema)) {
    const v = p[k];
    if (v === undefined) {
      if (s.required) errors.push(`params.${k}: 필수`);
      continue;
    }
    if (s.type === "number" && !(typeof v === "number" && inRange(v, s))) errors.push(`params.${k}: 범위 ${s.min}~${s.max}`);
    if (s.type === "enum" && !(typeof v === "string" && (s.values ?? []).includes(v))) errors.push(`params.${k}: ${(s.values ?? []).join("|")}`);
    if (s.type === "number[]" || s.type === "enum[]") {
      if (!Array.isArray(v) || v.length < (s.minItems ?? 1) || v.length > (s.maxItems ?? 99)) {
        errors.push(`params.${k}: ${s.minItems ?? 1}~${s.maxItems ?? 99}개`);
        continue;
      }
      if (new Set(v).size !== v.length) errors.push(`params.${k}: 중복 값`);
      if (s.type === "number[]" && v.some((x) => typeof x !== "number" || !inRange(x, s))) errors.push(`params.${k}: 원소 범위 ${s.min}~${s.max}`);
      if (s.type === "enum[]" && v.some((x) => typeof x !== "string" || !(s.values ?? []).includes(x))) errors.push(`params.${k}: 원소는 ${(s.values ?? []).join("|")}`);
    }
    if (s.type === "rates") {
      if (!v || typeof v !== "object" || Array.isArray(v)) errors.push(`params.${k}: 객체 필요`);
      else
        for (const [rk, rv] of Object.entries(v as Record<string, unknown>)) {
          if (!(RATE_KEYS as readonly string[]).includes(rk)) errors.push(`params.${k}.${rk}: 알 수 없는 요율 키`);
          else if (typeof rv !== "number" || !inRange(rv, s)) errors.push(`params.${k}.${rk}: 비율 ${s.min}~${s.max}`);
        }
    }
  }
  if (kindId === "minimum-wage" && !errors.length && Number(p.to) !== Number(p.from) + 1) errors.push("params.to: from + 1 이어야 함");
  return errors;
}

const tableCache = new Map<string, ImpactBuild>();
/** 영향 표 계산(캐시) — 파라미터가 틀리면 예외(렌더 전에 gate 가 막는다) */
export function impactTable(kindId: string, params: Record<string, unknown>): ImpactBuild {
  const key = `${kindId}\u0000${JSON.stringify(params)}`;
  const hit = tableCache.get(key);
  if (hit) return hit;
  const errors = validateImpactParams(kindId, params);
  if (errors.length) throw new Error(`[trendBriefs] 영향 표 파라미터 오류 (${kindId}): ${errors.join(" · ")}`);
  const built = IMPACT_KINDS[kindId].build(params);
  const numbers = built.rows.flatMap((row, r) => row.map((token, c) => ({ token, locator: `engine:${kindId}:${r}:${c}` })));
  const result: ImpactBuild = { ...built, numbers };
  tableCache.set(key, result);
  return result;
}

/** 표 본문 행 HTML — <tr><td>…</td></tr> (셀 이스케이프) */
export function impactRows(kindId: string, params: Record<string, unknown>): string {
  return impactTable(kindId, params)
    .rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("\n");
}

/** 표의 한 셀(이스케이프) — 본문 문장에 엔진 값을 끼울 때 */
export function impactCell(kindId: string, params: Record<string, unknown>, r: number, c: number): string {
  const cell = impactTable(kindId, params).rows[r]?.[c];
  if (cell === undefined) throw new Error(`[trendBriefs] 영향 표 셀 없음 (${kindId} r${r} c${c})`);
  return escapeHtml(cell);
}

// ─────────────────────────────────────────────────────────────
// 결정 전(provisional) 값 고지 — writer 가 아니라 렌더가 표 설명 끝에 고정 문장으로 붙인다 (critic fix 2026-09-26).
// 운영자 승인은 '내용 검수 아님' 이므로, 결정 전 값을 '변경 후' 값처럼 보여 주지 않도록 코드가 직접 밝힌다.
// 문장에 '확정' 이라는 낱말을 쓰지 않는다(규칙 unannounced-facts 의 부정 문맥 목록 밖 표현이 되지 않게).
// ─────────────────────────────────────────────────────────────
/** 2027 요율 키 → 쉬운 이름 (INSURANCE_RATES_2027_STATUS 가 provisional = 2026 값 준용) */
export const PROVISIONAL_RATE_LABELS: Readonly<Record<string, string>> = {
  "INSURANCE_RATES_2027.NATIONAL_PENSION": "국민연금 요율",
  "INSURANCE_RATES_2027.HEALTH_INSURANCE": "건강보험 요율",
  "INSURANCE_RATES_2027.LONG_TERM_CARE_RATIO": "장기요양보험 비율",
  "INSURANCE_RATES_2027.EMPLOYMENT_INSURANCE": "고용보험 요율",
};
/** 그 밖의 provisional 표식 → 고지 문장 */
export const PROVISIONAL_SENTENCES: Readonly<Record<string, string>> = {
  RAISE_2027_BUDGET: "표의 정부안 단순 적용 예상은 정부 예산안의 보수 인상률을 현행 봉급에 일률 적용한 값이라, 직급·호봉별 최종 봉급표와 다를 수 있습니다.",
  UNEMPLOYMENT_BENEFIT_2027: "표의 2027년 값은 현행 산정 방식에 2027년 최저임금을 넣어 계산한 값이라, 제도 개편 등으로 산정 방식이 바뀌면 달라질 수 있습니다.",
};
const PROVISIONAL_FALLBACK = "표의 일부 값은 아직 결정 전인 값으로 계산했습니다.";

/** provisional 목록 → 표 설명 끝에 붙일 고정 문장(없으면 빈 문자열). 평문 — HTML 에 넣을 때 escapeHtml. */
export function provisionalDisclosure(provisional: readonly string[]): string {
  if (!provisional.length) return "";
  const parts: string[] = [];
  const rates = provisional.filter((k) => k in PROVISIONAL_RATE_LABELS).map((k) => PROVISIONAL_RATE_LABELS[k]);
  if (rates.length) parts.push(`표의 ${rates.join("·")} 2027년 값은 아직 결정 전이라 2026년 값을 그대로 넣었습니다.`);
  for (const k of provisional) if (PROVISIONAL_SENTENCES[k]) parts.push(PROVISIONAL_SENTENCES[k]);
  if (provisional.some((k) => !(k in PROVISIONAL_RATE_LABELS) && !(k in PROVISIONAL_SENTENCES))) parts.push(PROVISIONAL_FALLBACK);
  return parts.join(" ");
}

/** 영향 표의 결정 전 값 고지 문장 (파라미터 오류면 예외 — impactTable 과 같다) */
export function impactDisclosure(kindId: string, params: Record<string, unknown>): string {
  return provisionalDisclosure(impactTable(kindId, params).provisional);
}

// ─────────────────────────────────────────────────────────────
// 정본 상수 표기 — 공식 문서가 쓰는 모양 그대로 (최저시급·연금 요율·구직급여 상한 같은 원·% 표기)
// autoReplace: 본문에 같은 표기가 있으면 render.ts 가 ${constText(NAME)} 로 자동 치환한다(구별되는 표기만 —
// '5%'·'0.9%' 처럼 흔한 표기는 다른 뜻의 숫자까지 바꿀 수 있어 writer 가 {{const:NAME}} 로 직접 쓴다).
// confirmed: 확정 여부 — false 인 값을 '확정'이라 쓰면 규칙 unannounced-facts 가 막는다.
// ─────────────────────────────────────────────────────────────
export interface CanonicalConst {
  text: string;
  confirmed: boolean;
  autoReplace: boolean;
  source: string;
}
const groupNum = (n: number) => groupDigits(n);
const rateConst = (rate: number, confirmed: boolean, autoReplace: boolean, source: string): CanonicalConst => ({
  text: pct(rate),
  confirmed,
  autoReplace,
  source,
});
const status2027 = (k: RateKey) => INSURANCE_RATES_2027_STATUS[k] === "confirmed";

export const CANONICAL_CONSTS: Readonly<Record<string, CanonicalConst>> = {
  MINIMUM_WAGE_2026_HOURLY: { text: won(MINIMUM_WAGE_2026.hourly), confirmed: true, autoReplace: true, source: "config/minimumWage.ts" },
  MINIMUM_WAGE_2026_HOURLY_NUM: { text: groupNum(MINIMUM_WAGE_2026.hourly), confirmed: true, autoReplace: true, source: "config/minimumWage.ts" },
  MINIMUM_WAGE_2026_MONTHLY: { text: won(MINIMUM_WAGE_2026.monthly), confirmed: true, autoReplace: true, source: "config/minimumWage.ts" },
  MINIMUM_WAGE_2026_MONTHLY_NUM: { text: groupNum(MINIMUM_WAGE_2026.monthly), confirmed: true, autoReplace: true, source: "config/minimumWage.ts" },
  MINIMUM_WAGE_2027_HOURLY: { text: won(MINIMUM_WAGE_2027.hourly), confirmed: true, autoReplace: true, source: "config/minimumWage.ts" },
  MINIMUM_WAGE_2027_HOURLY_NUM: { text: groupNum(MINIMUM_WAGE_2027.hourly), confirmed: true, autoReplace: true, source: "config/minimumWage.ts" },
  MINIMUM_WAGE_2027_MONTHLY: { text: won(MINIMUM_WAGE_2027.monthly), confirmed: true, autoReplace: true, source: "config/minimumWage.ts" },
  MINIMUM_WAGE_2027_MONTHLY_NUM: { text: groupNum(MINIMUM_WAGE_2027.monthly), confirmed: true, autoReplace: true, source: "config/minimumWage.ts" },
  PENSION_RATE_2026: rateConst(INSURANCE_RATES_2026.NATIONAL_PENSION, true, true, "lib/taxConstants2026.ts"),
  HEALTH_RATE_2026: rateConst(INSURANCE_RATES_2026.HEALTH_INSURANCE, true, true, "lib/taxConstants2026.ts"),
  LTC_RATIO_2026: rateConst(INSURANCE_RATES_2026.LONG_TERM_CARE_RATIO, true, true, "lib/taxConstants2026.ts"),
  EMPLOYMENT_RATE_2026: rateConst(INSURANCE_RATES_2026.EMPLOYMENT_INSURANCE, true, false, "lib/taxConstants2026.ts"),
  PENSION_RATE_2027: rateConst(INSURANCE_RATES_2027.NATIONAL_PENSION, status2027("NATIONAL_PENSION"), false, "lib/taxConstants2027.ts"),
  HEALTH_RATE_2027: rateConst(INSURANCE_RATES_2027.HEALTH_INSURANCE, status2027("HEALTH_INSURANCE"), false, "lib/taxConstants2027.ts"),
  LTC_RATIO_2027: rateConst(INSURANCE_RATES_2027.LONG_TERM_CARE_RATIO, status2027("LONG_TERM_CARE_RATIO"), false, "lib/taxConstants2027.ts"),
  EMPLOYMENT_RATE_2027: rateConst(INSURANCE_RATES_2027.EMPLOYMENT_INSURANCE, status2027("EMPLOYMENT_INSURANCE"), false, "lib/taxConstants2027.ts"),
  PENSION_BASE_2026_MAX: { text: won(PENSION_BASE_2026.MAX_MONTHLY), confirmed: true, autoReplace: true, source: "lib/taxConstants2026.ts" },
  PENSION_BASE_2026_MAX_NUM: { text: groupNum(PENSION_BASE_2026.MAX_MONTHLY), confirmed: true, autoReplace: true, source: "lib/taxConstants2026.ts" },
  PENSION_BASE_2026_MAX_MANWON: { text: manwon(PENSION_BASE_2026.MAX_MONTHLY), confirmed: true, autoReplace: true, source: "lib/taxConstants2026.ts" },
  PENSION_BASE_2026_MAX_ANNUAL: { text: won(PENSION_BASE_2026.MAX_ANNUAL), confirmed: true, autoReplace: true, source: "lib/taxConstants2026.ts" },
  PENSION_BASE_2026_MAX_ANNUAL_MANWON: { text: manwon(PENSION_BASE_2026.MAX_ANNUAL), confirmed: true, autoReplace: true, source: "lib/taxConstants2026.ts" },
  PENSION_BASE_2026_MIN: { text: won(PENSION_BASE_2026.MIN_MONTHLY), confirmed: true, autoReplace: true, source: "lib/taxConstants2026.ts" },
  PENSION_BASE_2026_MIN_MANWON: { text: manwon(PENSION_BASE_2026.MIN_MONTHLY), confirmed: true, autoReplace: false, source: "lib/taxConstants2026.ts" },
  UNEMPLOYMENT_UPPER_2026: { text: won(UNEMPLOYMENT_BENEFIT_2026.DAILY_UPPER), confirmed: true, autoReplace: true, source: "config/unemploymentBenefit.ts" },
  UNEMPLOYMENT_UPPER_2026_NUM: { text: groupNum(UNEMPLOYMENT_BENEFIT_2026.DAILY_UPPER), confirmed: true, autoReplace: true, source: "config/unemploymentBenefit.ts" },
  UNEMPLOYMENT_LOWER_2026: { text: won(unemploymentDailyLowerBound()), confirmed: true, autoReplace: true, source: "config/unemploymentBenefit.ts" },
  UNEMPLOYMENT_LOWER_2026_NUM: { text: groupNum(unemploymentDailyLowerBound()), confirmed: true, autoReplace: true, source: "config/unemploymentBenefit.ts" },
};

/** 정본 상수의 공식 표기 */
export function constText(name: string): string {
  const c = CANONICAL_CONSTS[name];
  if (!c) throw new Error(`[trendBriefs] 알 수 없는 정본 상수: ${name}`);
  return escapeHtml(c.text);
}
