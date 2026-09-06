// src/lib/simpleCalculators/finance.ts
//
// 연금(annuity)·복리 공식의 이자율 0 극한 처리 정본.
//
// 배경 (2026-09-06 전수검사): 퀵 계산기 11종이 원리금균등/복리 공식을
//   P·i·(1+i)^n / ((1+i)^n − 1)  형태로 인라인 구현하고 있었다.
//   i = 0 이면 분모가 0 이 되어 결과가 NaN 이고, SimpleCalculatorView 의
//   formatNumber 가드가 "—" 로 표시한다. 그런데 이자율 0% 는 한국 사용자에게
//   비정상 입력이 아니다 — 무이자 할부·0% 프로모션 대출·"수익률 0 가정"
//   시나리오가 모두 정상 입력이며, 수학적으로도 답이 정의된다
//   (i→0 극한: 월 상환액 = 원금/개월수, 적립 미래가치 = 월납×개월수).
//   또한 입력창을 비우면 handleChange 가 Number("")=0 으로 넣기 때문에
//   "지우고 다시 입력하는" 흔한 조작에서도 즉시 "—" 가 뜬다.
//
// 이 모듈의 함수는 i = 0 을 극한값으로 처리하고, 개월수 ≤ 0 같은 무의미한
// 입력만 0 을 돌려준다(호출부가 판단할 수 있도록 예외를 던지지 않는다).

/** 연이율(%) → 월이율(소수). 4 → 0.003333… */
export function monthlyRate(annualPercent: number): number {
  return annualPercent / 100 / 12;
}

/**
 * 원리금균등 월 상환액.
 * i = 0 이면 원금/개월수 (무이자 할부).
 */
export function annuityPayment(
  principal: number,
  monthlyRateDecimal: number,
  months: number
): number {
  if (months <= 0) return 0;
  if (monthlyRateDecimal === 0) return principal / months;
  const f = Math.pow(1 + monthlyRateDecimal, months);
  return (principal * monthlyRateDecimal * f) / (f - 1);
}

/**
 * 월 상환액으로 감당 가능한 원금 (annuityPayment 의 역함수).
 * i = 0 이면 월 상환액 × 개월수.
 */
export function annuityPrincipal(
  payment: number,
  monthlyRateDecimal: number,
  months: number
): number {
  if (months <= 0) return 0;
  if (monthlyRateDecimal === 0) return payment * months;
  const f = Math.pow(1 + monthlyRateDecimal, months);
  return (payment * (f - 1)) / (monthlyRateDecimal * f);
}

/**
 * 초기 원금 + 매월 적립의 미래가치(월 복리).
 * i = 0 이면 원금 + 월납 × 개월수.
 */
export function futureValue(
  principal: number,
  monthlyContribution: number,
  monthlyRateDecimal: number,
  months: number
): number {
  if (months <= 0) return principal;
  if (monthlyRateDecimal === 0) return principal + monthlyContribution * months;
  const f = Math.pow(1 + monthlyRateDecimal, months);
  return principal * f + monthlyContribution * ((f - 1) / monthlyRateDecimal);
}

/**
 * 목표 자산 도달까지 걸리는 개월 수.
 * i = 0 이면 목표/월납. 월납이 0 이하면 도달 불가 → Infinity
 * (호출부의 formatNumber 가 "—" 로 표시한다).
 */
export function monthsToGoal(
  goal: number,
  monthlyContribution: number,
  monthlyRateDecimal: number
): number {
  if (monthlyContribution <= 0) return Infinity;
  if (monthlyRateDecimal === 0) return goal / monthlyContribution;
  return (
    Math.log(1 + (goal * monthlyRateDecimal) / monthlyContribution) /
    Math.log(1 + monthlyRateDecimal)
  );
}
