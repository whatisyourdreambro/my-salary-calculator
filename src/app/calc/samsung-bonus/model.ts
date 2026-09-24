// samsung-bonus 순수 계산 모듈 — React·Next 의존 없음 (vitest 회귀 테스트가 직접 import).
// shared.tsx 가 그대로 재수출하므로 Client·시뮬레이터의 "./shared" import 는 바뀌지 않는다.
// 2026-09-21 S2-0 배치: 계산 로직·사업부 데이터를 shared.tsx(use client)에서 분리.

import { INSURANCE_RATES_2026, PENSION_BASE_2026 } from "@/lib/taxConstants2026";
import { estimateAnnualIncomeTax2026 } from "@/lib/bonusTaxCalc";
import { OPI1_DEFAULT_RATE } from "./opiData";

// ────────────────────────────────────────────────────────────
// 고정 정책 변수 (공개 노사 합의 보도 기반)
// ────────────────────────────────────────────────────────────
export const FIXED_RERATE = 10.5; // 영업이익의 10.5% — OPI2(특별경영성과금) 재원
export const FIXED_BU_RATIO = 4; // 부문 : 사업부 = 4 : 6
export const FIXED_SA_RATIO = 6;
/** OPI1(기본 성과인센티브) 계산기 기본값 — 정본은 opiData.ts (연봉 대비 %, 상한 50) */
export const FIXED_OPI1_RATE = OPI1_DEFAULT_RATE;
export const REFERENCE_SALARY = 80_000_000; // 본인 연봉 비례 기준 (평균 8천만원)

// 회의록 임계값:
// • 2026~2028: 영업이익 200조 이상 → 성과급 풀 활성화
// • 2029~2035 (향후 7년): 영업이익 100조 이상 → 성과급 풀 활성화
export function getThreshold(year: number): number {
  if (year >= 2026 && year <= 2028) return 200;
  if (year >= 2029 && year <= 2035) return 100;
  return 0; // 합의 범위 외 — 임계값 정보 없음
}
export function getThresholdPeriod(year: number): string {
  if (year >= 2026 && year <= 2028) return "26~28년 (200조 이상)";
  if (year >= 2029 && year <= 2035) return "29~35년 (100조 이상)";
  return "합의 범위 외";
}

// ────────────────────────────────────────────────────────────
// 세금 로직 — 소득세 증가분은 성과급 계산기 23종 공통 엔진(bonusTaxCalc.estimateAnnualIncomeTax2026)
// 의 연간 결정세액 차이, 요율은 taxConstants2026.ts 단일 진실 소스. (2026-09-25 A18: 종전
// '산출세액 차이 × (1 − 세액공제 30%)' 가정 대체 — 근로소득세액공제는 한도가 있어 비례하지 않는다.)
// (반환 shape는 UI가 4대보험 4개 행을 분리 렌더링하므로 유지)
// ────────────────────────────────────────────────────────────

// 세금/4대보험 계산. credit = 추가 세액공제 가정(0~50%, 기본 0), applyInsurance = 4대보험 추가 부과 적용 여부
export function calcSamsungBonusNet(
  salary: number,
  bonusWon: number,
  credit: number,
  applyInsurance: boolean
) {
  if (bonusWon <= 0)
    return { net: 0, deduct: 0, effRate: 0, breakdown: emptyBreakdown() };

  const total = salary + bonusWon;
  const grossIncomeTaxOnBonus = Math.max(
    0,
    estimateAnnualIncomeTax2026(total, INSURANCE_RATES_2026, applyInsurance ? total : salary) -
      estimateAnnualIncomeTax2026(salary)
  );
  const incomeTaxOnBonus = grossIncomeTaxOnBonus * (1 - credit / 100);
  const localTax = incomeTaxOnBonus * INSURANCE_RATES_2026.LOCAL_INCOME_TAX_RATIO;

  let nationalPension = 0;
  let healthIns = 0;
  let longTermCare = 0;
  let employment = 0;
  if (applyInsurance) {
    // 국민연금: 기준소득월액 연 상한(2026-07~2027-06: 월 659만 = 연 7,908만원)
    // — 본봉이 상한 미달일 때만 추가 부과
    const pensionBase = Math.max(0, PENSION_BASE_2026.MAX_ANNUAL - salary);
    nationalPension =
      Math.min(bonusWon, pensionBase) * INSURANCE_RATES_2026.NATIONAL_PENSION;
    // 건강·고용은 상한 없음. 다만 보수정산 시점에 일시 부과되며 회사가 일부 분담.
    healthIns = bonusWon * INSURANCE_RATES_2026.HEALTH_INSURANCE;
    longTermCare = healthIns * INSURANCE_RATES_2026.LONG_TERM_CARE_RATIO;
    employment = bonusWon * INSURANCE_RATES_2026.EMPLOYMENT_INSURANCE;
  }
  const insurance = nationalPension + healthIns + longTermCare + employment;

  const deduct = incomeTaxOnBonus + localTax + insurance;
  return {
    net: bonusWon - deduct,
    deduct,
    effRate: (deduct / bonusWon) * 100,
    breakdown: {
      incomeTax: incomeTaxOnBonus,
      localTax,
      nationalPension,
      healthIns,
      longTermCare,
      employment,
    },
  };
}

function emptyBreakdown() {
  return {
    incomeTax: 0,
    localTax: 0,
    nationalPension: 0,
    healthIns: 0,
    longTermCare: 0,
    employment: 0,
  };
}

// ────────────────────────────────────────────────────────────
// 사업부 데이터 — 색맹 보강용 패턴/아이콘 동반
// ────────────────────────────────────────────────────────────

/** 사업부 id 유니온 — 시뮬레이터의 Record<DivisionId, …> 인덱싱이 string 으로 넓어지지 않게 고정 */
export type DivisionId = "memory" | "common" | "foundry";

export type Division = {
  id: DivisionId;
  label: string;
  shortLabel: string;
  color: string;
  bgTint: string;
  defaultCount: number;
  defaultRatio: number;
};

// 보도값 매칭 보정 — 영업이익 350조 기준 메모리 791%·공통 553%·파운드리 252%
// 보도 결과에 가장 근접한 가중치 역산. 회의록 원본은 1.0/0.7/0.0이지만 보도값과
// 정합 불가(공통 16% 과대평가)하므로 보도값 매칭 우선. 사용자가 회의록 원본 값으로
// UI에서 직접 조정 가능.
export const DIVISIONS: Division[] = [
  {
    id: "memory",
    label: "메모리",
    shortLabel: "M",
    color: "#0145F2",
    bgTint: "#0145F20D",
    defaultCount: 27400,
    defaultRatio: 1.0,
  },
  {
    id: "common",
    label: "공통",
    shortLabel: "C",
    color: "#F59E0B",
    bgTint: "#F59E0B0D",
    defaultCount: 29000,
    defaultRatio: 0.55, // 보도값 553% 매칭 (회의록 원본 0.7)
  },
  {
    id: "foundry",
    label: "파운드리·시스템LSI",
    shortLabel: "F",
    color: "#EF4444",
    bgTint: "#EF44440D",
    defaultCount: 20900,
    defaultRatio: 0.05, // 보도값 252% 매칭 + 2026 적자 사업부 (회의록 원본 0.0)
  },
];

/** 사업부별 기본 인원(콤마 표기) — Client 초기 state·리셋·해시 복원 공용 */
export function defaultDivisionCounts(): Record<string, string> {
  return Object.fromEntries(
    DIVISIONS.map((d) => [d.id, d.defaultCount.toLocaleString("ko-KR")])
  );
}
/** 사업부별 기본 가중치(문자열) — Client 초기 state·리셋 공용 */
export function defaultDivisionRatios(): Record<string, string> {
  return Object.fromEntries(DIVISIONS.map((d) => [d.id, String(d.defaultRatio)]));
}

export function parseNumberInput(s: string): number {
  return Number(s.replace(/[^0-9]/g, "")) || 0;
}

// ────────────────────────────────────────────────────────────
// OPI2(특별경영성과금) 풀 분배 — Client 의 result useMemo 본체 (순수 함수)
// 영업이익(조) × 10.5% → 부문 40%(균등) + 사업부 60%(인원×가중치)
// ────────────────────────────────────────────────────────────

export type DivisionPoolRow = Division & {
  buPart: number;
  saPart: number;
  total: number;
};

export function computeDivisionPool(
  profitTrillion: number,
  counts: Record<string, string | number>,
  ratios: Record<string, string | number>,
  triggered = true
) {
  // 임계값 미달이면 성과급 풀 = 0
  const effectiveProfit = triggered ? Math.max(0, profitTrillion) : 0;
  const totalFundManwon = effectiveProfit * 1e8 * (FIXED_RERATE / 100);
  const buFund = totalFundManwon * (FIXED_BU_RATIO / 10);
  const saFund = totalFundManwon * (FIXED_SA_RATIO / 10);

  const countNums = Object.fromEntries(
    Object.entries(counts).map(([k, v]) => [
      k,
      typeof v === "number" ? v : parseNumberInput(v),
    ])
  );
  const ratioNums = Object.fromEntries(
    Object.entries(ratios).map(([k, v]) => [k, Number(v) || 0])
  );

  const totalCount = DIVISIONS.reduce(
    (acc, d) => acc + (countNums[d.id] || 0),
    0
  );
  const buPer = totalCount > 0 ? buFund / totalCount : 0;

  const wTotal = DIVISIONS.reduce(
    (acc, d) => acc + (countNums[d.id] || 0) * (ratioNums[d.id] || 0),
    0
  );
  const saUnit = wTotal > 0 ? saFund / wTotal : 0;
  const ratioSum = DIVISIONS.reduce(
    (acc, d) => acc + (ratioNums[d.id] || 0),
    0
  );

  const perDivision: DivisionPoolRow[] = DIVISIONS.map((d) => {
    const r = ratioNums[d.id] || 0;
    const saPart = saUnit * r;
    const total = buPer + saPart;
    return { ...d, buPart: buPer, saPart, total };
  });

  const max = Math.max(...perDivision.map((r) => r.total), 1);

  return { totalFundManwon, perDivision, max, ratioSum };
}
