// /calc/jeonse-loan (전세대출 한도·이자 계산기) 상품 조건과 계산.
//
// 2026-10-05 감사 code3-03 정정: 종전에는 네 상품 모두 한도 = min(보증금 x 80%, 연소득 x 4) 였고 상품별 한도·소득 요건이
// 없었다. 기본값(보증금 3억·연소득 6천만)에서 버팀목·청년 전세도 2.4억원이 나왔는데, 같은 페이지 본문은 최대 1.2억·
// 부부합산 5천만원 이하라 적어 스스로 모순이었다.
//
// 정책상품 조건 — 주택도시기금(nhuf.molit.go.kr) 상품 안내, 2026-10-05 확인:
// - 버팀목전세자금 (FP05020101): 부부합산 연소득 5천만원 이하, 연 2.5~3.5%, 일반가구 수도권 1.2억·수도권 외 0.8억,
//   신규 전세금의 70% 이내
// - 신혼부부전용 전세자금 (FP05020401): 혼인 7년 이내, 부부합산 7.5천만원 이하, 연 1.9~3.3%, 수도권 2.5억·수도권 외 1.6억,
//   임차보증금의 80% 이내
// - 청년전용 버팀목전세자금 (FP05020301): 만 19~34세 세대주, 부부합산 5천만원 이하, 연 2.2~3.3%, 1.5억 이내
//   (만 25세 미만 단독세대주 1.2억), 임차보증금의 80% 이내
// 이 계산기는 지역 입력이 없어 수도권 한도로, 금리는 범위의 최저값으로 계산한다(화면에 '~' 로 표시).
// 일반 전세대출(시중은행)은 법정 조건이 아니라 사이트 가정값(연 5.0%, 보증금 80%, 연소득 4배)을 그대로 쓴다.

export interface JeonseLoanProduct {
  name: string;
  /** 계산에 쓰는 연 금리(%) — 정책상품은 범위의 최저값 */
  rate: number;
  /** 정책상품이면 true — 화면에 '금리 연 x%~' 로 범위 하한임을 표시 */
  rateIsFloor: boolean;
  /** 보증금 대비 한도 비율 */
  depositRatio: number;
  /** 호당 한도 (수도권, 원) — 없으면 Infinity */
  cap: number;
  /** 연소득 배수 한도 — 없으면 Infinity */
  incomeMultiple: number;
  /** 부부합산 연소득 요건 (원) — 없으면 Infinity */
  incomeLimit: number;
}

export const JEONSE_LOAN_PRODUCTS: readonly JeonseLoanProduct[] = [
  { name: "일반 전세대출", rate: 5.0, rateIsFloor: false, depositRatio: 0.8, cap: Infinity, incomeMultiple: 4, incomeLimit: Infinity },
  { name: "버팀목 전세대출", rate: 2.5, rateIsFloor: true, depositRatio: 0.7, cap: 120_000_000, incomeMultiple: Infinity, incomeLimit: 50_000_000 },
  { name: "신혼부부 버팀목", rate: 1.9, rateIsFloor: true, depositRatio: 0.8, cap: 250_000_000, incomeMultiple: Infinity, incomeLimit: 75_000_000 },
  { name: "청년 전세 (만 19~34)", rate: 2.2, rateIsFloor: true, depositRatio: 0.8, cap: 150_000_000, incomeMultiple: Infinity, incomeLimit: 50_000_000 },
];

export interface JeonseLoanResult {
  name: string;
  rate: number;
  rateIsFloor: boolean;
  eligible: boolean;
  incomeLimit: number;
  limit: number;
  monthlyInterest: number;
  annualInterest: number;
}

export function calcJeonseLoans(deposit: number, income: number): JeonseLoanResult[] {
  const d = Number.isFinite(deposit) ? Math.max(0, deposit) : 0;
  const s = Number.isFinite(income) ? Math.max(0, income) : 0;
  return JEONSE_LOAN_PRODUCTS.map((p) => {
    const eligible = s <= p.incomeLimit;
    const limit = eligible ? Math.min(d * p.depositRatio, p.cap, s * p.incomeMultiple) : 0;
    const annualInterest = limit * (p.rate / 100);
    return {
      name: p.name,
      rate: p.rate,
      rateIsFloor: p.rateIsFloor,
      eligible,
      incomeLimit: p.incomeLimit,
      limit,
      monthlyInterest: annualInterest / 12,
      annualInterest,
    };
  });
}

/** 최저 비용 배지 대상 — 대상 상품 중 연 이자가 가장 적은 것 (한도 0 제외). 없으면 null */
export function cheapestEligible(results: readonly JeonseLoanResult[]): JeonseLoanResult | null {
  const pool = results.filter((r) => r.eligible && r.limit > 0);
  if (pool.length === 0) return null;
  return pool.reduce((min, r) => (r.annualInterest < min.annualInterest ? r : min), pool[0]);
}
