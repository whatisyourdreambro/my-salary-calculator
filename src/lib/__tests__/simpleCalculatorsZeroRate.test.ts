// src/lib/__tests__/simpleCalculatorsZeroRate.test.ts
//
// 이자율/수익률 0% 입력 회귀 가드 (2026-09-06 전수검사).
//
// 배경: 퀵 계산기 11종이 원리금균등·복리 공식을
//   P·i·(1+i)^n / ((1+i)^n − 1)  형태로 인라인 구현해 i=0 에서 NaN 이 됐다.
//   SimpleCalculatorView 의 formatNumber 가 "—" 로 가려 주지만, 0% 는 한국
//   사용자에게 정상 입력이다(무이자 할부·0% 프로모션·수익률 0 가정).
//   게다가 입력창을 비우면 handleChange 가 Number("")=0 을 넣으므로
//   "지우고 다시 입력" 조작에서 바로 "—" 가 떴다.
// 정본: src/lib/simpleCalculators/finance.ts (i→0 극한 처리)
import { describe, expect, it } from "vitest";

import { getCalculatorBySlug } from "@/lib/simpleCalculators";
import {
  annuityPayment,
  annuityPrincipal,
  futureValue,
  monthsToGoal,
} from "@/lib/simpleCalculators/finance";

/** 이율 필드를 0 으로 두어도 결과가 전부 유한해야 하는 계산기 */
const ZERO_RATE_OK: { slug: string; rateFields: string[] }[] = [
  { slug: "loan-monthly-payment", rateFields: ["rate"] },
  { slug: "loan-total-interest", rateFields: ["rate"] },
  { slug: "dsr-quick", rateFields: ["rate"] },
  { slug: "loan-affordability", rateFields: ["rate"] },
  { slug: "loan-refinance-savings", rateFields: ["oldRate", "newRate"] },
  { slug: "compound-interest-quick", rateFields: ["rate"] },
  { slug: "savings-goal-time", rateFields: ["rate"] },
  { slug: "dollar-cost-average", rateFields: ["rate"] },
  { slug: "etf-fee-impact", rateFields: ["rate"] },
  { slug: "mortgage-monthly-quick", rateFields: ["rate"] },
  { slug: "housing-affordability-quick", rateFields: ["rate"] },
];

function values(result: {
  primary: { value: number | string };
  secondary?: { value: number | string }[];
}) {
  return [result.primary.value, ...(result.secondary ?? []).map((s) => s.value)];
}

describe("퀵 계산기 — 이자율 0% 입력", () => {
  for (const { slug, rateFields } of ZERO_RATE_OK) {
    for (const field of rateFields) {
      it(`${slug} [${field}=0] 이 유한한 값을 낸다`, () => {
        const calc = getCalculatorBySlug(slug);
        expect(calc, `${slug} 계산기 없음`).toBeDefined();
        const inputs: Record<string, number> = {};
        for (const f of calc!.fields) inputs[f.name] = f.defaultValue;
        inputs[field] = 0;
        const nonFinite = values(calc!.compute(inputs) as never).filter(
          (v) => typeof v === "number" && !Number.isFinite(v)
        );
        expect(nonFinite).toEqual([]);
      });
    }
  }

  it("무이자(0%) 대출의 월 상환액 = 원금 / 개월수", () => {
    const calc = getCalculatorBySlug("loan-monthly-payment")!;
    // 1억 / 10년(120개월) = 833,333원
    const r = calc.compute({ amount: 100_000_000, rate: 0, years: 10 });
    expect(r.primary.value).toBe(Math.round(100_000_000 / 120));
  });

  it("수익률 0% 복리 = 원금 + 월납 × 개월수", () => {
    const calc = getCalculatorBySlug("compound-interest-quick")!;
    const r = calc.compute({ principal: 10_000_000, monthly: 500_000, rate: 0, years: 20 });
    expect(r.primary.value).toBe(10_000_000 + 500_000 * 240);
  });
});

describe("finance 헬퍼 — 0 극한과 일반해의 연속성", () => {
  it("annuityPayment 는 i→0 에서 원금/개월수로 수렴", () => {
    const exact = annuityPayment(120_000_000, 0, 120);
    const near = annuityPayment(120_000_000, 1e-9, 120);
    expect(exact).toBe(1_000_000);
    expect(Math.abs(near - exact)).toBeLessThan(1);
  });

  it("annuityPrincipal 은 annuityPayment 의 역함수", () => {
    const pay = annuityPayment(300_000_000, 0.04 / 12, 360);
    expect(annuityPrincipal(pay, 0.04 / 12, 360)).toBeCloseTo(300_000_000, 2);
    // i=0 경로도 동일하게 왕복
    const pay0 = annuityPayment(300_000_000, 0, 360);
    expect(annuityPrincipal(pay0, 0, 360)).toBeCloseTo(300_000_000, 6);
  });

  it("futureValue 는 i→0 에서 단순 합계로 수렴", () => {
    expect(futureValue(1_000_000, 100_000, 0, 12)).toBe(1_000_000 + 1_200_000);
    // 연 0.01%(월 8.3e-7) — 실사용 하한급 이자율에서 0 극한과 1원 이내로 일치.
    // (i 를 1e-10 까지 내리면 (1+i)^n − 1 의 자리수 소실로 일반해 자체가 흔들린다 —
    //  헬퍼의 문제가 아니라 부동소수점 한계라 실사용 범위에서 검증한다.)
    expect(
      Math.abs(futureValue(1_000_000, 100_000, 0.0001 / 12, 12) - 2_200_000)
    ).toBeLessThan(200);
  });

  it("monthsToGoal 은 월 납입 0 이면 도달 불가(Infinity)", () => {
    expect(monthsToGoal(100_000_000, 0, 0.004)).toBe(Infinity);
    expect(monthsToGoal(100_000_000, 1_000_000, 0)).toBe(100);
  });

  it("개월수 0 이하는 예외 없이 0 을 돌려준다", () => {
    expect(annuityPayment(1_000_000, 0.004, 0)).toBe(0);
    expect(annuityPrincipal(1_000_000, 0.004, -5)).toBe(0);
  });
});
