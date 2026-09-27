// src/lib/civilServantNetPay.ts
//
// 공무원 월급 실수령액 엔진 — /calc/civil-servant-net-pay 전용 순수 함수 (React 없음).
// 직종 v1: 일반직 9~5급 · 교원(교사) · 경찰 순경~경감 · 소방 소방사~소방경 · 병(이병~병장).
// 4급 이상·경정 이상·군 간부는 연봉제이거나 전체 표가 없어 v1 범위 밖 (페이지에서 봉급표 링크로 안내).
//
// 데이터 출처
//   - 봉급: 공무원보수규정 별표 3·10·11 전체표(payTablesFull2026.ts, 인사혁신처 2026 봉급표) · 병 봉급 별표 13
//     (civilServantPay.ts MILITARY_PAY_2026)
//   - 수당·기여금·비과세: civilServantAllowances2026.ts (조문·확인일은 그 파일 머리 주석)
//   - 건강보험·장기요양·지방소득세 요율: taxConstants2026.ts INSURANCE_RATES_2026 (정본 import — 리터럴 금지)
//   - 월 소득세: 근로소득 간이세액표(소득세법 시행령 별표 2) withholdingTaxTable2026.ts
//
// 산식 요약 (일반 달 — 설·추석·1월·7월 가산 지급분 제외)
//   세전 월 지급액 = 봉급 + 과세 수당(직급보조비·정근수당 가산금·가족수당·교직수당·위험근무수당·시간외근무수당·기타)
//                    + 정액급식비 + 기타 비과세
//   기준소득월액(추정) = (연간 세전 − 연간 비과세) ÷ 12 — 연간 세전 = 월 지급액×12 + 명절휴가비 2회 + 정근수당 2회.
//     실제 값은 공무원연금법 시행령 제5조(전년도 과세소득 ÷ 12 × (1 + 보수인상률), 신규자는 제6조)로 매년 5월 갱신.
//   기여금 = 기준소득월액(상한 9,520,000원) × 9% (납부 36년 초과 0) · 건강보험 = 기준소득월액 × 건보 요율 ·
//   장기요양 = 건강보험료 × 장기요양 비율 · 소득세 = 간이세액표(과세 월급여, 공제대상가족, 8~20세 자녀) × 원천징수 비율 ·
//   지방소득세 = 소득세 × 10%. 공제액은 원 단위 반올림 뒤 10원 미만 절사(홈 계산기 엔진 floorTo10 과 같은 규칙).
//   공무원은 고용보험 적용 제외(고용보험법 제10조).
//   병: 봉급 전액 비과세(소득세법 제12조제3호가목)·기여금 없음·건강보험 급여정지로 보험료 면제 → 실수령 = 봉급.
//
// ★ 갱신 체크포인트
//   - 12월 말: 2027 봉급표 확정 → 2027 표를 추가하고 previewCivilNetPay2027 을 '정부안'에서 '확정'으로 전환.
//   - 1월: 수당 규정 개정 확인(civilServantAllowances2026.ts).
//   - 4월 30일: 기준소득월액 평균액 새 고시 → CIVIL_PENSION_2026 평균액·상한 갱신.
//   - 10/14 r2-l2 병합: payTablesFull2026.ts blob 이 양쪽에서 같은지 확인(fbe678cc…).

import {
  GENERAL_PAY_FULL_2026,
  POLICE_FIRE_PAY_FULL_2026,
  TEACHER_PAY_FULL_2026,
  payAt,
} from "./payTablesFull2026";
import { MILITARY_PAY_2026, forecast2027 } from "./civilServantPay";
import {
  CIVIL_FAMILY_ALLOWANCE_2026,
  CIVIL_HAZARD_ALLOWANCE_2026,
  CIVIL_HOLIDAY_BONUS_RATE_2026,
  CIVIL_JEONGGEUN_ADDON_2026,
  CIVIL_JEONGGEUN_ADDON_EXTRA_2026,
  CIVIL_JEONGGEUN_RATE_2026,
  CIVIL_MEAL_ALLOWANCE_2026,
  CIVIL_MEAL_NONTAX_CAP_2026,
  CIVIL_OVERTIME_2026,
  CIVIL_PENSION_2026,
  CIVIL_POSITION_ALLOWANCE_2026,
  CIVIL_TEACHER_ALLOWANCE_2026,
} from "./civilServantAllowances2026";
import { INSURANCE_RATES_2026, type InsuranceRates } from "./taxConstants2026";
import { INSURANCE_RATES_2027 } from "./taxConstants2027";
import { withholdingIncomeTax2026 } from "./withholdingTaxTable2026";

export type CivilKind = "general" | "teacher" | "police" | "fire" | "soldier";
export type CivilHazard = "none" | "gap" | "gapPlus";
export type WithholdingPct = 80 | 100 | 120;

export const CIVIL_KINDS: ReadonlyArray<{ kind: CivilKind; label: string }> = [
  { kind: "general", label: "일반직" },
  { kind: "teacher", label: "교원" },
  { kind: "police", label: "경찰" },
  { kind: "fire", label: "소방" },
  { kind: "soldier", label: "병사" },
];

/** 직종별 계급 라벨 — 배열 인덱스가 rank (봉급표 열 = rank + 1) */
export const CIVIL_RANKS: Readonly<Record<CivilKind, ReadonlyArray<string>>> = {
  general: ["9급", "8급", "7급", "6급", "5급"],
  teacher: ["교사"],
  police: ["순경", "경장", "경사", "경위", "경감"],
  fire: ["소방사", "소방교", "소방장", "소방위", "소방경"],
  soldier: ["이병", "일병", "상병", "병장"],
};

export interface CivilNetPayInput {
  kind: CivilKind;
  /** CIVIL_RANKS[kind] 인덱스 */
  rank: number;
  /** 호봉 (병은 무시) */
  hobong: number;
  /** 재직(근무) 연수 — 정근수당·가산금 구간과 기여금 36년 판정에 쓴다 */
  yearsOfService: number;
  spouse: boolean;
  /** 자녀 수 (가족수당·간이세액표 공제대상가족) */
  children: number;
  /** 그중 8세 이상 20세 이하 자녀 수 (간이세액표 비고 3 자녀 공제) */
  children8to20: number;
  /** 배우자·자녀 외 부양가족 수 */
  otherDependents: number;
  /** 시간외근무 시간(월) */
  overtimeHours: number;
  homeroom: boolean;
  headTeacher: boolean;
  hazard: CivilHazard;
  /** 기준소득월액 직접 입력 (없으면 추정) */
  baseIncomeOverride?: number | null;
  otherTaxableMonthly: number;
  otherNonTaxableMonthly: number;
  withholdingPct: WithholdingPct;
  /** 성과상여금 연액 — 연간 요약에만 더한다 */
  annualPerformanceBonus?: number;
}

export type CivilItemKey =
  | "pay"
  | "position"
  | "jeonggeunAddon"
  | "family"
  | "teaching"
  | "homeroom"
  | "headTeacher"
  | "hazard"
  | "overtime"
  | "otherTaxable"
  | "meal"
  | "otherNonTaxable";

export interface CivilPayItem {
  key: CivilItemKey;
  label: string;
  amount: number;
  /** 과세 여부 표기 */
  tax: "과세" | "비과세";
  basis: string;
}

export interface CivilNetPayResult {
  kind: CivilKind;
  rankLabel: string;
  pay: number;
  items: CivilPayItem[];
  /** 봉급 제외 월 수당 합계 (정액급식비·기타 비과세 포함) */
  allowanceTotal: number;
  /** 과세 수당 (봉급 제외) */
  taxableAllowance: number;
  /** 월 비과세 합계 */
  nonTaxable: number;
  /** 간이세액표에 넣는 과세 월급여 */
  monthlyTaxablePay: number;
  grossMonthly: number;
  overtimeHourly: number;
  overtimeBaseHobong: number | null;
  overtime: number;
  baseIncome: number;
  baseIncomeEstimated: boolean;
  contribution: number;
  health: number;
  longTermCare: number;
  incomeTax: number;
  localIncomeTax: number;
  deductions: number;
  net: number;
  jeonggeunPct: number;
  annual: {
    monthly12: number;
    holidayBonusEach: number;
    holidayBonusTotal: number;
    jeonggeunEach: number;
    jeonggeunTotal: number;
    performanceBonus: number;
    /** 월 지급액×12 + 명절휴가비 2회 + 정근수당 2회 (성과상여금 제외) */
    annualGross: number;
    /** annualGross + 성과상여금 */
    annualGrossWithBonus: number;
  };
}

// ── 공용 헬퍼 ─────────────────────────────────────────────────────────

/**
 * 원 단위로 반올림한 뒤 10원 미만 절사 — 월 실수령 엔진(TaxLogic.calculateSalary2026 의 floorTo10)과 같은 규칙.
 * 부동소수 오차도 함께 걷힌다 (예: 856799.9999999 → 856,800).
 */
export function floor10(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.floor(Math.round(value) / 10) * 10;
}

/** 부동소수 오차를 걷어낸 뒤 1원 미만 절사 */
function floor1(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.floor(Math.round(value * 100) / 100);
}

/** 입력 정리 — NaN·음수·무한대는 0, 정수화, 상한 */
function count(value: unknown, max: number): number {
  const n = typeof value === "number" && Number.isFinite(value) ? Math.floor(value) : 0;
  return Math.min(Math.max(0, n), max);
}

/** 월 금액 입력 상한 (1억원) — 거대 입력이 화면을 깨뜨리지 않게 */
export const CIVIL_AMOUNT_INPUT_MAX = 100_000_000;
export const CIVIL_OVERTIME_HOURS_MAX = 200;
export const CIVIL_DEPENDENT_MAX = 10;

function amount(value: unknown): number {
  return count(value, CIVIL_AMOUNT_INPUT_MAX);
}

// ── 봉급 조회 ─────────────────────────────────────────────────────────

type PayRows = ReadonlyArray<ReadonlyArray<number | null>>;

function tableOf(kind: CivilKind): PayRows | null {
  if (kind === "general") return GENERAL_PAY_FULL_2026;
  if (kind === "police" || kind === "fire") return POLICE_FIRE_PAY_FULL_2026;
  if (kind === "teacher") return TEACHER_PAY_FULL_2026;
  return null;
}

/** 직종·계급별 선택 가능한 호봉 (봉급표 칸이 비어 있지 않은 호봉만). 병은 빈 배열 */
export function civilHobongOptions(kind: CivilKind, rank: number): number[] {
  const rows = tableOf(kind);
  if (!rows) return [];
  const column = kind === "teacher" ? 1 : clampRank(kind, rank) + 1;
  return rows.filter((row) => typeof row[column] === "number").map((row) => row[0] as number);
}

export function clampRank(kind: CivilKind, rank: number): number {
  return count(rank, CIVIL_RANKS[kind].length - 1);
}

/** 선택 가능한 호봉으로 맞춤 — 범위 밖이면 가장 가까운 끝값 */
export function clampHobong(kind: CivilKind, rank: number, hobong: number): number {
  const options = civilHobongOptions(kind, rank);
  if (!options.length) return 1;
  const h = typeof hobong === "number" && Number.isFinite(hobong) ? Math.floor(hobong) : options[0];
  if (options.includes(h)) return h;
  return h < options[0] ? options[0] : options[options.length - 1];
}

/** 2026 봉급 (원). year 2027 이면 정부안 3.9% 단순 적용 예상치(천원 반올림) */
export function civilPayOf(kind: CivilKind, rank: number, hobong: number, year: 2026 | 2027 = 2026): number {
  let pay: number;
  if (kind === "soldier") {
    pay = MILITARY_PAY_2026[clampRank(kind, rank)].pay;
  } else {
    const rows = tableOf(kind) as PayRows;
    const r = clampRank(kind, rank);
    pay = payAt(rows, clampHobong(kind, r, hobong), kind === "teacher" ? 1 : r + 1);
  }
  return year === 2027 ? forecast2027(pay) : pay;
}

// ── 수당 ──────────────────────────────────────────────────────────────

export function jeonggeunPct(years: number): number {
  const y = Math.max(0, Number.isFinite(years) ? years : 0);
  return (CIVIL_JEONGGEUN_RATE_2026.find((row) => y < row.underYears) ?? CIVIL_JEONGGEUN_RATE_2026[CIVIL_JEONGGEUN_RATE_2026.length - 1]).pct;
}

export function jeonggeunAddon(years: number): number {
  const y = Math.max(0, Number.isFinite(years) ? years : 0);
  const base = (CIVIL_JEONGGEUN_ADDON_2026.find((row) => y < row.underYears) ?? CIVIL_JEONGGEUN_ADDON_2026[CIVIL_JEONGGEUN_ADDON_2026.length - 1]).amount;
  const extra = y >= 25 ? CIVIL_JEONGGEUN_ADDON_EXTRA_2026.from25 : y >= 20 ? CIVIL_JEONGGEUN_ADDON_EXTRA_2026.from20 : 0;
  return base + extra;
}

/** 가족수당 — 부양가족 4명 이내(배우자 우선), 자녀는 4명을 넘어도 지급 */
export function familyAllowance(spouse: boolean, children: number, otherDependents: number): number {
  const kids = count(children, CIVIL_DEPENDENT_MAX);
  const others = count(otherDependents, CIVIL_DEPENDENT_MAX);
  const F = CIVIL_FAMILY_ALLOWANCE_2026;
  const nonChild = (spouse ? 1 : 0) + others;
  const paidNonChild = Math.min(nonChild, Math.max(0, F.maxDependents - kids));
  let total = 0;
  if (paidNonChild > 0) {
    total += spouse ? F.spouse + (paidNonChild - 1) * F.otherEach : paidNonChild * F.otherEach;
  }
  for (let i = 1; i <= kids; i++) {
    total += i === 1 ? F.firstChild : i === 2 ? F.secondChild : F.thirdPlusChild;
  }
  return total;
}

export function positionAllowance(kind: CivilKind, rank: number): number {
  if (kind === "general") return CIVIL_POSITION_ALLOWANCE_2026.general[clampRank(kind, rank)];
  if (kind === "police" || kind === "fire") return CIVIL_POSITION_ALLOWANCE_2026.policeFire[clampRank(kind, rank)];
  return kind === "teacher" ? CIVIL_POSITION_ALLOWANCE_2026.teacher : CIVIL_POSITION_ALLOWANCE_2026.soldier;
}

export function hazardAllowance(kind: CivilKind, hazard: CivilHazard): number {
  if (kind !== "police" && kind !== "fire") return 0;
  if (hazard === "gap") return CIVIL_HAZARD_ALLOWANCE_2026.gap;
  if (hazard === "gapPlus") return CIVIL_HAZARD_ALLOWANCE_2026.gap + CIVIL_HAZARD_ALLOWANCE_2026.surcharge;
  return 0;
}

/** 시간외근무수당 기준호봉 (별표 12). 병은 null */
export function overtimeBaseHobong(kind: CivilKind, rank: number, hobong: number): number | null {
  const O = CIVIL_OVERTIME_2026;
  if (kind === "general") return O.generalBaseHobong;
  if (kind === "police" || kind === "fire") return clampRank(kind, rank) === 0 ? O.policeFireEntryBaseHobong : O.policeFireBaseHobong;
  if (kind === "teacher") {
    const h = clampHobong(kind, 0, hobong);
    return (O.teacherBase.find((row) => h <= row.maxHobong) ?? O.teacherBase[O.teacherBase.length - 1]).base;
  }
  return null;
}

/** 시간외근무수당 1시간 단가 — floor(기준호봉 봉급 × 비율 ÷ 209 × 1.5) */
export function overtimeHourly(kind: CivilKind, rank: number, hobong: number, year: 2026 | 2027 = 2026): number {
  const baseHobong = overtimeBaseHobong(kind, rank, hobong);
  if (baseHobong === null) return 0;
  const O = CIVIL_OVERTIME_2026;
  const r = clampRank(kind, rank);
  // '8급 및 8급 상당 이하' — 일반직 9·8급, 순경·경장(소방사·소방교)
  const lowGrade = (kind === "general" || kind === "police" || kind === "fire") && r <= 1;
  const rate = lowGrade ? O.rateLow : O.rateBase;
  const basePay = civilPayOf(kind, r, baseHobong, year);
  return floor1((basePay * rate) / O.divisor * O.premium);
}

// ── 엔진 ──────────────────────────────────────────────────────────────

export interface CivilEngineOptions {
  year?: 2026 | 2027;
  rates?: InsuranceRates;
}

export function computeCivilNetPay(input: CivilNetPayInput, options: CivilEngineOptions = {}): CivilNetPayResult {
  const year = options.year ?? 2026;
  const rates = options.rates ?? INSURANCE_RATES_2026;
  const kind: CivilKind = CIVIL_RANKS[input.kind] ? input.kind : "general";
  const rank = clampRank(kind, input.rank);
  const hobong = kind === "soldier" ? 0 : clampHobong(kind, rank, input.hobong);
  const years = count(input.yearsOfService, 60);
  const pay = civilPayOf(kind, rank, hobong, year);
  const rankLabel = CIVIL_RANKS[kind][rank];

  if (kind === "soldier") {
    return {
      kind,
      rankLabel,
      pay,
      items: [{ key: "pay", label: "봉급", amount: pay, tax: "비과세", basis: "공무원보수규정 별표 13 · 소득세법 제12조제3호가목" }],
      allowanceTotal: 0,
      taxableAllowance: 0,
      nonTaxable: pay,
      monthlyTaxablePay: 0,
      grossMonthly: pay,
      overtimeHourly: 0,
      overtimeBaseHobong: null,
      overtime: 0,
      baseIncome: 0,
      baseIncomeEstimated: true,
      contribution: 0,
      health: 0,
      longTermCare: 0,
      incomeTax: 0,
      localIncomeTax: 0,
      deductions: 0,
      net: pay,
      jeonggeunPct: 0,
      annual: {
        monthly12: pay * 12,
        holidayBonusEach: 0,
        holidayBonusTotal: 0,
        jeonggeunEach: 0,
        jeonggeunTotal: 0,
        performanceBonus: 0,
        annualGross: pay * 12,
        annualGrossWithBonus: pay * 12,
      },
    };
  }

  const children = count(input.children, CIVIL_DEPENDENT_MAX);
  const children8to20 = Math.min(count(input.children8to20, CIVIL_DEPENDENT_MAX), children);
  const otherDependents = count(input.otherDependents, CIVIL_DEPENDENT_MAX);
  const spouse = input.spouse === true;

  const position = positionAllowance(kind, rank);
  const addon = jeonggeunAddon(years);
  const family = familyAllowance(spouse, children, otherDependents);
  const T = CIVIL_TEACHER_ALLOWANCE_2026;
  const teaching = kind === "teacher" ? T.teaching : 0;
  const homeroom = kind === "teacher" && input.homeroom ? T.homeroom : 0;
  const headTeacher = kind === "teacher" && input.headTeacher ? T.headTeacher : 0;
  const hazard = hazardAllowance(kind, input.hazard);
  const hours = count(input.overtimeHours, CIVIL_OVERTIME_HOURS_MAX);
  const hourly = overtimeHourly(kind, rank, hobong, year);
  const overtime = hourly * hours;
  const otherTaxable = amount(input.otherTaxableMonthly);
  const otherNonTaxable = amount(input.otherNonTaxableMonthly);

  const meal = CIVIL_MEAL_ALLOWANCE_2026;
  const mealNonTax = Math.min(meal, CIVIL_MEAL_NONTAX_CAP_2026);
  const mealTaxableExcess = meal - mealNonTax;

  const taxableAllowance =
    position + addon + family + teaching + homeroom + headTeacher + hazard + overtime + otherTaxable + mealTaxableExcess;
  const nonTaxable = mealNonTax + otherNonTaxable;
  const grossMonthly = pay + position + addon + family + teaching + homeroom + headTeacher + hazard + overtime + otherTaxable + meal + otherNonTaxable;
  const allowanceTotal = grossMonthly - pay;
  const monthlyTaxablePay = pay + taxableAllowance;

  const pct = jeonggeunPct(years);
  const holidayBonusEach = floor1(pay * CIVIL_HOLIDAY_BONUS_RATE_2026);
  const jeonggeunEach = floor1((pay * pct) / 100);
  const monthly12 = grossMonthly * 12;
  const annualGross = monthly12 + holidayBonusEach * 2 + jeonggeunEach * 2;
  const performanceBonus = amount(input.annualPerformanceBonus);

  const override = input.baseIncomeOverride;
  const hasOverride = typeof override === "number" && Number.isFinite(override) && override > 0;
  const baseIncome = hasOverride ? amount(override) : Math.floor((annualGross - nonTaxable * 12) / 12);

  const P = CIVIL_PENSION_2026;
  const contribution = years > P.maxYears ? 0 : floor10(Math.min(baseIncome, P.cap) * P.rate);
  const health = floor10(baseIncome * rates.HEALTH_INSURANCE);
  const longTermCare = floor10(health * rates.LONG_TERM_CARE_RATIO);
  const taxFamily = 1 + (spouse ? 1 : 0) + children + otherDependents;
  const withholdingPct = input.withholdingPct === 80 || input.withholdingPct === 120 ? input.withholdingPct : 100;
  const incomeTax = floor10((withholdingIncomeTax2026(monthlyTaxablePay, taxFamily, children8to20) * withholdingPct) / 100);
  const localIncomeTax = floor10(incomeTax * rates.LOCAL_INCOME_TAX_RATIO);
  const deductions = contribution + health + longTermCare + incomeTax + localIncomeTax;

  const basisPay =
    kind === "general" ? "공무원보수규정 별표 3" : kind === "teacher" ? "공무원보수규정 별표 11" : "공무원보수규정 별표 10";
  const all: CivilPayItem[] = [
    { key: "pay", label: "봉급", amount: pay, tax: "과세", basis: basisPay },
    { key: "position", label: "직급보조비", amount: position, tax: "과세", basis: "수당규정 제18조의6·별표 15" },
    { key: "jeonggeunAddon", label: "정근수당 가산금", amount: addon, tax: "과세", basis: "수당규정 별표 2 제2호" },
    { key: "family", label: "가족수당", amount: family, tax: "과세", basis: "수당규정 제10조·별표 5" },
    { key: "teaching", label: "교직수당", amount: teaching, tax: "과세", basis: "수당규정 별표 11 다목" },
    { key: "homeroom", label: "담임 가산금", amount: homeroom, tax: "과세", basis: "별표 11 다목 가산금 4)" },
    { key: "headTeacher", label: "보직교사 가산금", amount: headTeacher, tax: "과세", basis: "별표 11 다목 가산금 2)" },
    { key: "hazard", label: "위험근무수당", amount: hazard, tax: "과세", basis: "수당규정 제13조·별표 8·9" },
    { key: "overtime", label: "시간외근무수당", amount: overtime, tax: "과세", basis: "수당규정 제15조·별표 12" },
    { key: "otherTaxable", label: "기타 과세 수당", amount: otherTaxable, tax: "과세", basis: "직접 입력" },
    { key: "meal", label: "정액급식비", amount: meal, tax: "비과세", basis: "수당규정 제18조 · 소득세법 제12조제3호러목" },
    { key: "otherNonTaxable", label: "기타 비과세", amount: otherNonTaxable, tax: "비과세", basis: "직접 입력" },
  ];
  const items = all.filter((item) => {
    if (item.key === "teaching" || item.key === "homeroom" || item.key === "headTeacher") return kind === "teacher";
    if (item.key === "hazard") return kind === "police" || kind === "fire";
    if (item.key === "otherTaxable" || item.key === "otherNonTaxable") return item.amount > 0;
    return true;
  });

  return {
    kind,
    rankLabel,
    pay,
    items,
    allowanceTotal,
    taxableAllowance,
    nonTaxable,
    monthlyTaxablePay,
    grossMonthly,
    overtimeHourly: hourly,
    overtimeBaseHobong: overtimeBaseHobong(kind, rank, hobong),
    overtime,
    baseIncome,
    baseIncomeEstimated: !hasOverride,
    contribution,
    health,
    longTermCare,
    incomeTax,
    localIncomeTax,
    deductions,
    net: grossMonthly - deductions,
    jeonggeunPct: pct,
    annual: {
      monthly12,
      holidayBonusEach,
      holidayBonusTotal: holidayBonusEach * 2,
      jeonggeunEach,
      jeonggeunTotal: jeonggeunEach * 2,
      performanceBonus,
      annualGross,
      annualGrossWithBonus: annualGross + performanceBonus,
    },
  };
}

/**
 * 2027 정부안 미리보기 — 봉급(과 시간외 기준호봉 봉급)에 예산안 3.9%를 단순 적용(천원 반올림, forecast2027),
 * 요율은 INSURANCE_RATES_2027, 수당·간이세액표·기여금 상한은 2026 그대로. 기준소득월액은 2027 금액으로 다시 추정.
 * 정부안 · 7~9급 저연차 추가 인상 미반영 · 12월 말 국무회의 확정 전. 병은 대상 아님(null).
 */
export function previewCivilNetPay2027(input: CivilNetPayInput): CivilNetPayResult | null {
  if (input.kind === "soldier") return null;
  return computeCivilNetPay({ ...input, baseIncomeOverride: null }, { year: 2027, rates: INSURANCE_RATES_2027 });
}

/** 계산기 기본값 (페이지 SSR·#general) — 9급 1호봉, 재직 2년 미만, 본인만, 시간외 정액분 10시간 */
export const CIVIL_DEFAULT_INPUT: CivilNetPayInput = {
  kind: "general",
  rank: 0,
  hobong: 1,
  yearsOfService: 0,
  spouse: false,
  children: 0,
  children8to20: 0,
  otherDependents: 0,
  overtimeHours: CIVIL_OVERTIME_2026.flatHours,
  homeroom: false,
  headTeacher: false,
  hazard: "none",
  baseIncomeOverride: null,
  otherTaxableMonthly: 0,
  otherNonTaxableMonthly: 0,
  withholdingPct: 100,
  annualPerformanceBonus: 0,
};

/** 직종 전환·해시 프리셋(#general·#teacher·#police·#fire·#soldier) 시 바뀌는 값 */
export const CIVIL_KIND_PRESETS: Readonly<Record<CivilKind, Pick<CivilNetPayInput, "kind" | "rank" | "hobong" | "overtimeHours" | "homeroom" | "headTeacher" | "hazard">>> = {
  general: { kind: "general", rank: 0, hobong: 1, overtimeHours: CIVIL_OVERTIME_2026.flatHours, homeroom: false, headTeacher: false, hazard: "none" },
  // 신규 교사 통상 9호봉(civilServantPay.TEACHER_START_HOBONG) + 담임
  teacher: { kind: "teacher", rank: 0, hobong: 9, overtimeHours: 0, homeroom: true, headTeacher: false, hazard: "none" },
  // 경찰·소방 현장·외근 기준 — 위험근무수당 갑종 + 가산금 8만원
  police: { kind: "police", rank: 0, hobong: 1, overtimeHours: 0, homeroom: false, headTeacher: false, hazard: "gapPlus" },
  fire: { kind: "fire", rank: 0, hobong: 1, overtimeHours: 0, homeroom: false, headTeacher: false, hazard: "gapPlus" },
  soldier: { kind: "soldier", rank: 3, hobong: 0, overtimeHours: 0, homeroom: false, headTeacher: false, hazard: "none" },
};

/** 재직 연수 선택지 — 값은 구간 하한(년). 정근수당 지급률·가산금 구간과 기여금 36년 경계에 맞춘다 */
export const CIVIL_YEARS_OPTIONS: ReadonlyArray<{ value: number; label: string }> = [
  { value: 0, label: "2년 미만" },
  { value: 2, label: "2~5년" },
  { value: 5, label: "5~6년" },
  { value: 6, label: "6~7년" },
  { value: 7, label: "7~8년" },
  { value: 8, label: "8~9년" },
  { value: 9, label: "9~10년" },
  { value: 10, label: "10~15년" },
  { value: 15, label: "15~20년" },
  { value: 20, label: "20~25년" },
  { value: 25, label: "25~36년" },
  { value: 37, label: "36년 초과" },
];
