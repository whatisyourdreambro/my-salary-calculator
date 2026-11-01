// src/lib/dividendTax.ts
//
// 배당·이자(금융소득) 과세 계산 — 순수 함수.
// YMYL 세법 로직이라 페이지 안에 두지 않고 분리해 단위 테스트 대상으로 삼는다
// (severanceCalculator·yearEndTaxCalculator 와 동일한 관례).
//
// 근거 조문:
//   소득세법 제14조 제3항 — 금융소득 종합과세 기준금액 2,000만원
//   소득세법 제55조       — 종합소득 누진세율 (TAX_BRACKETS_2026 단일 소스)
//   소득세법 제62조       — 이자·배당소득 종합과세 시 세액계산 특례(비교과세)
//
// 미반영(의도적 단순화 — UI 고지문·disclaimer 에 명시):
//   국내법인 배당의 배당가산(Gross-up 10%)과 배당세액공제, 해외 배당의 외국납부세액공제.

import { TAX_BRACKETS_2026 } from "./taxConstants2026";

/** 금융소득종합과세 기준금액 (소득세법 제14조 제3항) */
export const FINANCIAL_INCOME_THRESHOLD = 20_000_000;

/** 금융소득 원천징수세율 — 소득세 14% (지방소득세 1.4%는 소득세의 10%로 별도 산출) */
export const WITHHOLDING_RATE = 0.14;

/** 지방소득세율 — 소득세액의 10% */
export const LOCAL_TAX_RATE = 0.1;

export interface DividendTaxResult {
  /** 이자 + 배당 합계 (세전) */
  financial: number;
  /** 금융소득종합과세 대상 여부 */
  isComprehensive: boolean;
  /** 제62조 ① 종합과세 방식 산출세액 (분리과세로 종결되면 0) */
  methodA: number;
  /** 제62조 ② 분리과세 상당 산출세액 (분리과세로 종결되면 0) */
  methodB: number;
  /** 소득세 */
  incomeTax: number;
  /** 지방소득세 */
  localTax: number;
  /** 소득세 + 지방소득세 — 제62조 종합소득 산출세액 전체 (종합과세면 근로·사업 등 기타소득분 포함) */
  total: number;
  /** 기타 종합소득만 있을 때의 산출세액 (분리과세로 종결되면 0 — 금융소득과 무관) */
  otherIncomeTax: number;
  /** 금융소득 때문에 늘어나는 소득세 = incomeTax − otherIncomeTax (분리과세면 14% 원천징수액) */
  financialIncomeTax: number;
  /** financialIncomeTax 의 지방소득세 (10%) */
  financialLocalTax: number;
  /** 금융소득 관련 세금 합계 = financialIncomeTax + financialLocalTax */
  financialTotal: number;
  /** 금융소득 대비 실효세율(%) = financialTotal / 금융소득 */
  effectiveRate: number;
}

/** 종합소득 과세표준 → 산출세액 (소득세법 제55조 누진공제 방식) */
export function progressiveTax(base: number): number {
  if (base <= 0) return 0;
  const bracket =
    TAX_BRACKETS_2026.find((b) => base <= b.limit) ??
    TAX_BRACKETS_2026[TAX_BRACKETS_2026.length - 1];
  return Math.max(0, base * bracket.rate - bracket.deduction);
}

/**
 * 금융소득(이자+배당) 세액 계산.
 *
 * 금융소득이 2,000만원 이하면 15.4% 원천징수로 납세가 종결된다.
 * 초과하면 소득세법 제62조에 따라 아래 두 값 중 큰 금액이 산출세액이 된다.
 *   ① (금융소득 − 2,000만원 + 기타 종합소득과세표준) 누진세액 + 2,000만원 × 14%
 *   ② 금융소득 × 14% + 기타 종합소득과세표준 누진세액
 *
 * @param interest  연간 이자소득 (세전)
 * @param dividend  연간 배당소득 (세전)
 * @param otherBase 기타 종합소득 과세표준 (각종 공제를 마친 금액)
 */
export function calcDividendTax(
  interest: number,
  dividend: number,
  otherBase: number
): DividendTaxResult {
  const financial = Math.max(0, interest) + Math.max(0, dividend);
  const other = Math.max(0, otherBase);

  // 세액은 원 단위 정수로 반올림한다. 부동소수점 잔차(예: 3,080,000.0000000005)가
  // 그대로 노출되면 표시·검증 양쪽에서 문제가 된다 (stock-tax 등 기존 엔진과 동일 관례).
  //
  // 2026-10-05 감사 code20-02·code39-01 정정: 화면 머리 금액 '금융소득 관련 세금 합계' 와 '금융소득 대비 실효세율' 에
  // total(제62조 산출세액 전체 — 근로·사업소득분 포함)을 써서, 금융소득이 2,000만원을 1원만 넘어도 기타소득 세금이
  // 금융소득 세금처럼 더해졌다(기타 과세표준 5,000만원: 3,080,000원 → 9,944,000원, 실효세율 15.4% → 49.7%,
  // 기타 1억이면 100% 초과). 이제 금융소득 몫은 '제62조 산출세액 − 기타소득만의 산출세액' 으로 따로 낸다.
  // total 은 제62조 값 그대로 둔다(세액 계산 단계 표시용).
  const finish = (
    incomeTaxRaw: number,
    isComprehensive: boolean,
    methodARaw: number,
    methodBRaw: number,
    otherIncomeTaxRaw: number
  ): DividendTaxResult => {
    const incomeTax = Math.round(incomeTaxRaw);
    const localTax = Math.round(incomeTax * LOCAL_TAX_RATE);
    const total = incomeTax + localTax;
    const otherIncomeTax = Math.round(otherIncomeTaxRaw);
    const financialIncomeTax = Math.max(0, incomeTax - otherIncomeTax);
    const financialLocalTax = Math.round(financialIncomeTax * LOCAL_TAX_RATE);
    const financialTotal = financialIncomeTax + financialLocalTax;
    return {
      financial,
      isComprehensive,
      methodA: Math.round(methodARaw),
      methodB: Math.round(methodBRaw),
      incomeTax,
      localTax,
      total,
      otherIncomeTax,
      financialIncomeTax,
      financialLocalTax,
      financialTotal,
      effectiveRate: financial > 0 ? (financialTotal / financial) * 100 : 0,
    };
  };

  if (financial <= FINANCIAL_INCOME_THRESHOLD) {
    return finish(financial * WITHHOLDING_RATE, false, 0, 0, 0);
  }

  const excess = financial - FINANCIAL_INCOME_THRESHOLD;
  const methodA =
    progressiveTax(excess + other) + FINANCIAL_INCOME_THRESHOLD * WITHHOLDING_RATE;
  const methodB = financial * WITHHOLDING_RATE + progressiveTax(other);

  return finish(Math.max(methodA, methodB), true, methodA, methodB, progressiveTax(other));
}
