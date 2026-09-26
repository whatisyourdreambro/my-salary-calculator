// src/lib/guides/bonusNetFigures2026.ts
//
// 성과급 세금·4대보험 키퍼 가이드 5편(2026-09-30 재작성, W3-A 2차 G2A)의 숫자 정본.
//   bonus-1eok-net-payment-2026 · bonus-5000-net-payment-2026 · bonus-health-4-percent-2026 ·
//   four-insurance-ceiling-summary-2026 · income-tax-8-step-bracket-2026
//
// 모든 금액은 사이트 엔진(calcBonusNet · taxConstants2026)을 2026 요율로 '명시해' 불러 만든다.
// calcBonusNet 의 기본 요율은 현행 포인터(CURRENT_INSURANCE_RATES)라 2027-01-01 전환 때 바뀌지만,
// 이 글들은 '2026' 글이므로 INSURANCE_RATES_2026 을 넘겨 연도를 고정한다.
// 값이 엔진과 함께 조용히 바뀌지 않도록 src/lib/__tests__/guideBonusNetTables.test.ts 가 표 값을 고정한다 —
// 엔진이 바뀌어 그 테스트가 실패하면 가이드 문장(제목·설명 포함)을 함께 검토할 것.
//
// 가이드 본문 표에는 요율·상한 리터럴을 쓰지 않고 여기 값을 ${…} 로 끼운다 (guideSpec (5), verify:tax).
import { calcBonusNet, estimateAnnualIncomeTax2026, type BonusNetResult } from "@/lib/bonusTaxCalc";
import {
  INSURANCE_RATES_2026,
  PENSION_BASE_2026,
  PENSION_ACCOUNT_CREDIT_2026,
  TAX_BRACKETS_2026,
  calcIncomeTax2026,
  earnedIncomeDeduction2026,
  earnedIncomeTaxCredit2026,
  earnedIncomeTaxCreditLimit2026,
} from "@/lib/taxConstants2026";

const R = INSURANCE_RATES_2026;

/**
 * 직장가입자 보수월액보험료 상·하한 — 보건복지부고시 제2025-222호(2026-01-01 시행).
 * https://www.nhis.or.kr/lm/lmxsrv/law/lawFullContent.do?SEQ=39&SEQ_HISTORY=595294 (2026-09-26 확인)
 * 사이트 정본 상수가 없어(원장 E-05) 이 파일에만 둔다. 매년 1월 고시 갱신 때 확인.
 */
export const HEALTH_PREMIUM_LIMITS_2026 = {
  /** 월 보수월액보험료 상한(근로자+사용자 합계, 원) */
  MONTHLY_CAP_TOTAL: 9_183_480,
  /** 월 보수월액보험료 하한(합계, 원) */
  MONTHLY_FLOOR_TOTAL: 20_160,
} as const;

// ── 표기 도우미 ────────────────────────────────────────────────
/** 12,345,678 → "12,345,678" */
export const won = (n: number) => Math.round(n).toLocaleString("ko-KR");
/** 원 → 만원 반올림 표기 — 63,729,787 → "6,373만원", 113,945,961 → "1억1,395만원" */
export function manwon(n: number): string {
  const m = Math.round(n / 10_000);
  const eok = Math.floor(m / 10_000);
  const rest = m % 10_000;
  if (eok === 0) return `${rest.toLocaleString("ko-KR")}만원`;
  return `${eok}억${rest ? `${rest.toLocaleString("ko-KR")}만` : ""}원`;
}
/** 만원 표기에서 '원'을 뗀 짧은 형태 — 제목·범위 표기용 (4,067,383 → "407만", 410,000 → "41만") */
export const manOnly = (n: number) => manwon(n).replace(/원$/, "");
/** 요율 → 백분율 표기 — 0.009 → "0.9%", 0.132 → "13.2%" (끝자리 0 제거) */
export const pct = (rate: number, digits = 4) => `${Number((rate * 100).toFixed(digits))}%`;
/** 실수령률·실효세율 — 소수 첫째 자리 */
export const ratio = (part: number, whole: number) => `${((part / whole) * 100).toFixed(1)}%`;

// ── 2026 요율 표기값 ───────────────────────────────────────────
export const RATE_LABEL = {
  pension: pct(R.NATIONAL_PENSION),
  pensionTotal: pct(R.NATIONAL_PENSION * 2),
  health: pct(R.HEALTH_INSURANCE),
  healthTotal: pct(R.HEALTH_INSURANCE * 2),
  ltcRatio: pct(R.LONG_TERM_CARE_RATIO),
  /** 소득 대비 장기요양보험료율(합계) — 7.19% × 13.14% ≈ 0.9448% */
  ltcOfIncome: pct(R.HEALTH_INSURANCE * 2 * R.LONG_TERM_CARE_RATIO),
  /** 근로자 건강+장기요양 합계 — 3.595% × 1.1314 ≈ 4.067% */
  healthPlusLtc: pct(R.HEALTH_INSURANCE * (1 + R.LONG_TERM_CARE_RATIO), 3),
  healthPlusLtc2: pct(R.HEALTH_INSURANCE * (1 + R.LONG_TERM_CARE_RATIO), 2),
  employment: pct(R.EMPLOYMENT_INSURANCE),
  local: pct(R.LOCAL_INCOME_TAX_RATIO),
} as const;

export const PENSION_LABEL = {
  max: manwon(PENSION_BASE_2026.MAX_MONTHLY),
  min: manwon(PENSION_BASE_2026.MIN_MONTHLY),
  /** 범위 표기 앞쪽 — "41만~659만원" */
  minShort: manOnly(PENSION_BASE_2026.MIN_MONTHLY),
  maxAnnual: manwon(PENSION_BASE_2026.MAX_ANNUAL),
  /** 상한 도달 시 근로자 월 연금보험료 (원) */
  maxPremium: won(PENSION_BASE_2026.MAX_MONTHLY * R.NATIONAL_PENSION),
  minPremium: won(PENSION_BASE_2026.MIN_MONTHLY * R.NATIONAL_PENSION),
} as const;

export const HEALTH_CAP_LABEL = {
  total: won(HEALTH_PREMIUM_LIMITS_2026.MONTHLY_CAP_TOTAL),
  employee: won(HEALTH_PREMIUM_LIMITS_2026.MONTHLY_CAP_TOTAL / 2),
  floorTotal: won(HEALTH_PREMIUM_LIMITS_2026.MONTHLY_FLOOR_TOTAL),
  /** 근로자 몫 상한에 닿는 월 보수 — 4,591,740 ÷ 3.595% */
  payAtCap: manwon(HEALTH_PREMIUM_LIMITS_2026.MONTHLY_CAP_TOTAL / 2 / R.HEALTH_INSURANCE),
  annualPayAtCap: manwon((HEALTH_PREMIUM_LIMITS_2026.MONTHLY_CAP_TOTAL / 2 / R.HEALTH_INSURANCE) * 12),
} as const;

// ── 엔진 호출 ──────────────────────────────────────────────────
/** 성과급 세후 — 2026 요율 고정, 추가 세액공제 가정 0 (엔진 기본) */
export const bonusNet2026 = (salary: number, bonus: number): BonusNetResult =>
  calcBonusNet(salary, bonus, 0, true, R);

export interface AnnualTax2026 {
  gross: number;
  earnedDeduction: number;
  pension: number;
  healthAndCare: number;
  employment: number;
  taxBase: number;
  calculatedTax: number;
  creditLimit: number;
  credit: number;
  decidedTax: number;
}

/**
 * 연간 결정세액의 단계별 내역 — bonusTaxCalc.estimateAnnualIncomeTax2026 과 같은 가정
 * (본인 기본공제 150만원 + 연금·건강·장기요양·고용보험료 공제, 그 밖의 공제 없음).
 * decidedTax 가 엔진 값과 같은지는 guideBonusNetTables.test.ts 가 확인한다.
 */
export function annualTax2026(gross: number): AnnualTax2026 {
  const pension =
    Math.min(Math.max(gross, PENSION_BASE_2026.MIN_MONTHLY * 12), PENSION_BASE_2026.MAX_ANNUAL) * R.NATIONAL_PENSION;
  const healthAndCare = gross * R.HEALTH_INSURANCE * (1 + R.LONG_TERM_CARE_RATIO);
  const employment = gross * R.EMPLOYMENT_INSURANCE;
  const earnedDeduction = earnedIncomeDeduction2026(gross);
  const taxBase = Math.max(0, gross - earnedDeduction - 1_500_000 - pension - healthAndCare - employment);
  const calculatedTax = calcIncomeTax2026(taxBase);
  const credit = earnedIncomeTaxCredit2026(calculatedTax, gross);
  return {
    gross,
    earnedDeduction,
    pension,
    healthAndCare,
    employment,
    taxBase,
    calculatedTax,
    creditLimit: earnedIncomeTaxCreditLimit2026(gross),
    credit,
    decidedTax: Math.max(0, calculatedTax - credit),
  };
}
/** 엔진과의 대조용 (테스트) */
export const engineDecidedTax2026 = (gross: number) => estimateAnnualIncomeTax2026(gross, R);

/** 과세표준이 target 에 닿는 총급여 (위 가정, 1,000원 단위 이분 탐색) */
export function grossAtTaxBase2026(target: number): number {
  let lo = 0;
  let hi = 2_000_000_000;
  while (hi - lo > 1_000) {
    const mid = (lo + hi) / 2;
    if (annualTax2026(mid).taxBase < target) lo = mid;
    else hi = mid;
  }
  return hi;
}

/** 과세표준 금액을 세율 구간 라벨로 — 140,149,149 → "35%" */
export function bracketRateOf(taxBase: number): string {
  const b = TAX_BRACKETS_2026.find((x) => taxBase <= x.limit) ?? TAX_BRACKETS_2026[TAX_BRACKETS_2026.length - 1];
  return pct(b.rate);
}

/** 연금계좌 세액공제 — 총급여 5,500만원 초과 12%(+지방소득세 = 13.2%)로 900만원 납입 시 */
export const IRP_FULL_CREDIT_HIGH = {
  rateWithLocal: pct(PENSION_ACCOUNT_CREDIT_2026.RATE_LOW * (1 + R.LOCAL_INCOME_TAX_RATIO)),
  rateWithLocalLow: pct(PENSION_ACCOUNT_CREDIT_2026.RATE_HIGH * (1 + R.LOCAL_INCOME_TAX_RATIO)),
  cap: manwon(PENSION_ACCOUNT_CREDIT_2026.TOTAL_CAP),
  amount: PENSION_ACCOUNT_CREDIT_2026.TOTAL_CAP * PENSION_ACCOUNT_CREDIT_2026.RATE_LOW * (1 + R.LOCAL_INCOME_TAX_RATIO),
} as const;

// ═════════════════════════════════════════════════════════════
// 편별 표 값
// ═════════════════════════════════════════════════════════════

/** bonus-1eok — 연봉 7,000만원 + 성과급 1억 (본문 기준 사례) */
export const EOK_MAIN = bonusNet2026(70_000_000, 100_000_000);
export const EOK_SALARY_ONLY = annualTax2026(70_000_000);
export const EOK_WITH_BONUS = annualTax2026(170_000_000);
/** 연봉별 성과급 1억 세후 */
export const EOK_BY_SALARY = [50_000_000, 70_000_000, 100_000_000, 150_000_000].map((salary) => ({
  salary,
  r: bonusNet2026(salary, 100_000_000),
}));

/** bonus-5000 — 연봉 6,000만원 + 성과급 5,000만원 */
export const FIVE_MAIN = bonusNet2026(60_000_000, 50_000_000);
export const FIVE_SALARY_ONLY = annualTax2026(60_000_000);
export const FIVE_WITH_BONUS = annualTax2026(110_000_000);
export const FIVE_BY_SALARY = [40_000_000, 60_000_000, 80_000_000, 100_000_000].map((salary) => ({
  salary,
  r: bonusNet2026(salary, 50_000_000),
}));
/** 연봉 6,000만원 고정, 성과급 크기별 */
export const FIVE_BY_BONUS = [10_000_000, 30_000_000, 50_000_000, 100_000_000].map((bonus) => ({
  bonus,
  r: bonusNet2026(60_000_000, bonus),
}));

/** bonus-health — 성과급 금액별 건강보험·장기요양 (근로자 몫 = 사용자 몫) */
export const HEALTH_BY_BONUS = [10_000_000, 30_000_000, 50_000_000, 100_000_000, 200_000_000].map((bonus) => {
  const health = bonus * R.HEALTH_INSURANCE;
  const care = health * R.LONG_TERM_CARE_RATIO;
  return { bonus, health: Math.round(health), care: Math.round(care), total: Math.round(health + care) };
});

/** four-insurance — 월 보수별 국민연금 근로자 보험료 (기준소득월액 상·하한 적용) */
export const PENSION_BY_PAY = [300_000, 3_000_000, 5_000_000, PENSION_BASE_2026.MAX_MONTHLY, 10_000_000].map((pay) => ({
  pay,
  base: Math.min(Math.max(pay, PENSION_BASE_2026.MIN_MONTHLY), PENSION_BASE_2026.MAX_MONTHLY),
  premium: Math.min(Math.max(pay, PENSION_BASE_2026.MIN_MONTHLY), PENSION_BASE_2026.MAX_MONTHLY) * R.NATIONAL_PENSION,
}));
/** 연봉별 성과급 1억의 4대보험 근로자 추가분 */
export const INSURANCE_BY_SALARY = [50_000_000, 70_000_000, PENSION_BASE_2026.MAX_ANNUAL, 120_000_000].map((salary) => {
  const r = bonusNet2026(salary, 100_000_000);
  return { salary, pension: r.pensionDelta, health: r.healthDelta, employment: r.empInsDelta, sum: r.pensionDelta + r.healthDelta + r.empInsDelta };
});

/** income-tax-8-step — 기본세율표 (구간 하단·상단, 세율, 누진공제, 구간 상단까지 산출세액) */
export const BRACKET_ROWS = TAX_BRACKETS_2026.map((b, i) => ({
  lower: i === 0 ? 0 : TAX_BRACKETS_2026[i - 1].limit,
  limit: b.limit,
  rate: b.rate,
  deduction: b.deduction,
  taxAtLimit: Number.isFinite(b.limit) ? calcIncomeTax2026(b.limit) : null,
}));
/** 과세표준별 산출세액·지방소득세·실효세율 */
export const TAX_EXAMPLES = [30_000_000, 50_000_000, 88_000_000, 89_000_000, 100_000_000, 150_000_000, 200_000_000].map((base) => {
  const tax = calcIncomeTax2026(base);
  return { base, tax, local: Math.round(tax * R.LOCAL_INCOME_TAX_RATIO), effective: ratio(tax, base) };
});
/** 과세표준 구간 경계에 닿는 총급여 (본인 1명·기본 공제만) */
export const GROSS_AT_BRACKET = [14_000_000, 50_000_000, 88_000_000, 150_000_000, 300_000_000].map((base) => ({
  base,
  gross: grossAtTaxBase2026(base),
}));
/** 총급여 7,000만원 계산 흐름 */
export const FLOW_7000 = annualTax2026(70_000_000);
