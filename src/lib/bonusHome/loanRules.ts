// src/lib/bonusHome/loanRules.ts
//
// 주택담보대출 한도 규칙(무주택자 주택구입 목적, 은행권) — 성과급 내 집 마련 계산기 전용. 규칙 기준일 LOAN_RULES_AS_OF.
// 2026-09-27 공식 원문 확인:
//   · 10·15 주택시장 안정화 대책(관계부처 합동 2025-10-15, 정책브리핑 newsId 148950973)
//       규제지역(조정대상지역·투기과열지구) = 서울 전역 + 경기 12곳(과천·광명·성남 분당·수정·중원·수원 영통·장안·팔달·
//       안양 동안·용인 수지·의왕·하남). 수도권·규제지역 주담대 한도: 시가 15억 이하 6억 · 15억 초과~25억 4억 · 25억 초과 2억.
//       수도권·규제지역 주담대 스트레스 금리(하한) 1.5% → 3.0%.
//   · 금융위 '주택시장 안정화를 위한 대출수요 관리 방안'(정책브리핑 newsId 148951581, 2025-10-17)
//       무주택자(처분조건부 1주택 포함) 규제지역 주담대 LTV 40%(기존 70%).
//   · 6·27 가계부채 관리 강화 방안(금융위 2025-06-27, 정책브리핑 newsId 148945077)
//       수도권·규제지역 주택구입 목적 주담대 최대 6억, 만기 30년 이내, 무주택자 비규제지역 LTV 70%.
//   · 국토부 2026-06-30(정책브리핑 newsId 148967354): 화성시 동탄구·용인시 기흥구·구리시 투기과열지구·조정대상지역 신규 지정,
//       2026-07-01 효력.
//   · 지방(서울·경기·인천 제외) 주담대 스트레스 금리 0.75% — 금융위 3단계 스트레스 DSR 시행방안(2025-05-20, fsc.go.kr
//       no010101/84617: 지방 주담대는 2단계 0.75%). 2026년 하반기에도 2단계 유지(7/1~12/31) — 은행연합회 발표(2026-06-30,
//       금융위 행정지도 변경에 따른 운영방안, 보도 기준). 혼합·주기형 금리는 적용 비율이 더 낮다.
//   · DSR 40% — 사이트 공용 산식 src/lib/widgets/dsrLimit.ts(DSR_RATIO·dsrLimitOf) 그대로.
// 생애최초·정책대출(디딤돌·보금자리 등)·다주택·전세 낀 매수는 모델링하지 않는다.
// ★ REVIEW_BY 가 지나면 테스트가 WARN 을 남긴다(실패 아님) — 지방 스트레스 금리 유예 종료(12/31)·규제지역 변경 재확인.

import { DSR_RATIO, dsrLimitOf } from "@/lib/widgets/dsrLimit";

export const LOAN_RULES_AS_OF = "2026-09-27";
export const REVIEW_BY = "2026-12-31";

export { DSR_RATIO };

export type RegionClass = {
  /** 수도권(서울·경기·인천) */
  capitalArea: boolean;
  /** 규제지역(조정대상지역·투기과열지구) */
  regulated: boolean;
};

/** 스트레스 금리 가산(%p, 변동금리 기준 — 혼합·주기형은 더 작다) */
export const STRESS_ADD_PCT = {
  capitalOrRegulated: 3.0,
  local: 0.75,
} as const;

/** 무주택자 주담대 LTV */
export const LTV_NO_HOME = {
  regulated: 0.4,
  nonRegulated: 0.7,
} as const;

/** 수도권·규제지역 주택구입 목적 주담대 한도 — 시가 구간별 */
export const MORTGAGE_CAP_TIERS = [
  { maxPrice: 1_500_000_000, cap: 600_000_000 },
  { maxPrice: 2_500_000_000, cap: 400_000_000 },
  { maxPrice: Number.POSITIVE_INFINITY, cap: 200_000_000 },
] as const;

/** 수도권·규제지역 주담대 만기 상한(년) */
export const CAPITAL_MAX_TERM_YEARS = 30;
export const DEFAULT_TERM_YEARS = 30;

export type LoanRuleSource = { label: string; date: string; url: string };
export const LOAN_RULE_SOURCES: LoanRuleSource[] = [
  { label: "10·15 주택시장 안정화 대책(관계부처 합동) — 규제지역·주담대 한도·스트레스 금리 3.0%", date: "2025-10-15", url: "https://www.korea.kr/news/policyNewsView.do?newsId=148950973" },
  { label: "금융위 대출수요 관리 방안 — 무주택자 규제지역 LTV 40%", date: "2025-10-17", url: "https://www.korea.kr/news/policyNewsView.do?newsId=148951581" },
  { label: "6·27 가계부채 관리 강화 방안(금융위) — 수도권·규제지역 6억·만기 30년·비규제 LTV 70%", date: "2025-06-27", url: "https://www.korea.kr/news/policyNewsView.do?newsId=148945077" },
  { label: "국토부 동탄구·기흥구·구리시 규제지역 지정(2026-07-01 효력)", date: "2026-06-30", url: "https://www.korea.kr/news/policyNewsView.do?newsId=148967354" },
  { label: "금융위 3단계 스트레스 DSR 시행방안 — 지방 주담대 0.75%(2026 하반기 유지: 은행연합회 2026-06-30 발표, 보도 기준)", date: "2025-05-20", url: "https://www.fsc.go.kr/no010101/84617" },
];

export const isCapitalOrRegulated = (cls: RegionClass): boolean => cls.capitalArea || cls.regulated;

export function stressAddFor(cls: RegionClass): number {
  return isCapitalOrRegulated(cls) ? STRESS_ADD_PCT.capitalOrRegulated : STRESS_ADD_PCT.local;
}

export function ltvFor(cls: RegionClass): number {
  return cls.regulated ? LTV_NO_HOME.regulated : LTV_NO_HOME.nonRegulated;
}

/** 수도권·규제지역 주담대 한도(원). 지방 비규제는 금액 상한 없음(Infinity) */
export function mortgageCapFor(cls: RegionClass, price: number): number {
  if (!isCapitalOrRegulated(cls)) return Number.POSITIVE_INFINITY;
  const tier = MORTGAGE_CAP_TIERS.find((t) => price <= t.maxPrice) ?? MORTGAGE_CAP_TIERS[MORTGAGE_CAP_TIERS.length - 1];
  return tier.cap;
}

/** 만기 — 수도권·규제지역은 30년 이내로 자른다 */
export function effectiveTermYears(cls: RegionClass, years: number): number {
  const y = Number.isFinite(years) && years > 0 ? Math.round(years) : DEFAULT_TERM_YEARS;
  return isCapitalOrRegulated(cls) ? Math.min(y, CAPITAL_MAX_TERM_YEARS) : y;
}

/**
 * DSR 한도 원금 — 연 소득에서 기존 부채 원리금을 빼는 것과 대수적으로 같게, 연 소득을 (기존 원리금 ÷ 40%) 만큼 줄여
 * 사이트 공용 dsrLimitOf 에 넣는다. 금리는 대출금리 + 스트레스 가산.
 */
export function dsrLoanLimit(p: {
  dsrIncome: number;
  existingAnnualDebtService: number;
  ratePct: number;
  stressAddPct: number;
  years: number;
}): number {
  const income = Number.isFinite(p.dsrIncome) ? Math.max(0, p.dsrIncome) : 0;
  const existing = Number.isFinite(p.existingAnnualDebtService) ? Math.max(0, p.existingAnnualDebtService) : 0;
  const yearlyAdj = Math.max(0, income - existing / DSR_RATIO);
  const rate = (Number.isFinite(p.ratePct) ? Math.max(0, p.ratePct) : 0) + (Number.isFinite(p.stressAddPct) ? Math.max(0, p.stressAddPct) : 0);
  const years = Number.isFinite(p.years) && p.years > 0 ? p.years : DEFAULT_TERM_YEARS;
  return dsrLimitOf(yearlyAdj, rate, years);
}

export type LoanBinding = "DSR" | "LTV" | "주담대 한도";

export type LoanLimitResult = {
  loan: number;
  dsr: number;
  ltvAmount: number;
  cap: number;
  binding: LoanBinding;
};

/** 대출 가능액 = min(DSR 한도, LTV × 시가, 주담대 금액 한도) — 어느 제약이 묶였는지 함께 */
export function loanLimit(p: {
  price: number;
  cls: RegionClass;
  dsrIncome: number;
  existingAnnualDebtService: number;
  ratePct: number;
  stressAddPct: number;
  ltv: number;
  years: number;
}): LoanLimitResult {
  const price = Number.isFinite(p.price) ? Math.max(0, p.price) : 0;
  const dsr = dsrLoanLimit({ ...p, years: effectiveTermYears(p.cls, p.years) });
  const ltv = Number.isFinite(p.ltv) ? Math.min(Math.max(p.ltv, 0), 1) : ltvFor(p.cls);
  const ltvAmount = Math.round(price * ltv);
  const cap = mortgageCapFor(p.cls, price);
  const loan = Math.max(0, Math.min(dsr, ltvAmount, cap));
  const binding: LoanBinding = loan === dsr ? "DSR" : loan === ltvAmount ? "LTV" : "주담대 한도";
  return { loan, dsr, ltvAmount, cap, binding };
}
