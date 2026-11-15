// 연말정산 계산기 — 만 70세 이상·장애인 인원이 부양가족보다 많으면 부양가족을 함께 올린다
// (N2-components-02, components-b06-F01, 2026-11-15)
//
// 경로우대(만 70세 이상)·장애인 추가공제(소득세법 §51①)는 기본공제대상자에게만 붙는다. 종전 화면은 두 칸이
// 부양가족(본인 포함)을 넘어도 그대로 넘겨, 엔진이 1명당 100만·200만원을 더해 환급을 부풀렸다
// (총급여 5,000만·부양가족 1 에서 만 70세 이상 2명 → 환급 약 10만원이 약 40만원으로).
// 본인도 70세 이상·장애인일 수 있어 하한은 두 인원 '각각' 이다(합계 아님). 엔진(src/lib/yearEndTaxCalculator.ts)과
// 그 고정 테스트(yearEndTax2026Engine.test.ts)는 N2-lib-08 소관이라 건드리지 않고, 화면 쪽 상태 갱신만 고친다.
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/year-end-tax" }));
vi.mock("@/components/AdPlacement", () => ({
  CalcResultAd: () => createElement("div", { "data-test-ad": "result" }),
}));

import {
  calculateYearEndTax,
  deriveAnnualSocialInsurance2026,
  estimatePrepaidIncomeTax2026,
  type TaxInputs,
} from "@/lib/yearEndTaxCalculator";
import { minDependents, withChildren, withDisabled, withSenior } from "@/components/YearEndTaxCalculator";

/** /year-end-tax 기본 입력 (총급여 5,000만, 신용 1,500만 + 체크 500만, 1인, 나머지 0) */
const base: TaxInputs = {
  grossSalary: 50_000_000,
  prepaidTax: 0,
  ...deriveAnnualSocialInsurance2026(50_000_000),
  dependents: 1,
  disabledDependents: 0,
  seniorDependents: 0,
  housingSubscription: 0,
  creditCard: 15_000_000,
  debitCardAndCash: 5_000_000,
  traditionalMarket: 0,
  publicTransport: 0,
  culture: 0,
  children: 0,
  childTaxCreditEligibleChildren: 0,
  birthsOrAdoptions: 0,
  birthOrders: [],
  pensionSavings: 0,
  irp: 0,
  lifeInsurance: 0,
  medicalExpenses: 0,
  medicalExpensesGeneral: 0,
  educationExpenses: 0,
  educationSelf: 0,
  educationChildSchool: 0,
  educationChildSchoolCount: 1,
  educationUniversity: 0,
  educationUniversityCount: 1,
  donation: 0,
  monthlyRent: 0,
};

/** 컴포넌트 derivedInputs 와 같은 파생 (4대보험·간이세액표 기납부 추정 — 월 원천징수 자녀 인원은 0) */
const runUi = (i: TaxInputs) =>
  calculateYearEndTax({
    ...i,
    ...deriveAnnualSocialInsurance2026(i.grossSalary),
    prepaidTax: estimatePrepaidIncomeTax2026(i.grossSalary, i.dependents, 0),
  });

describe("만 70세 이상·장애인 인원 → 부양가족 하한", () => {
  it("패키지 고정값: 각 인원 이상, 합계가 아니다", () => {
    expect(withSenior(base, 2).dependents).toBe(2);
    expect(withDisabled({ ...base, dependents: 3 }, 2).dependents).toBe(3);
    expect(minDependents({ childTaxCreditEligibleChildren: 1, seniorDependents: 3 })).toBe(3);
    expect(minDependents({ childTaxCreditEligibleChildren: 1, birthOrders: [1], seniorDependents: 1 })).toBe(3);
  });

  it("기존 자녀·출산 하한은 그대로다", () => {
    expect(minDependents({ childTaxCreditEligibleChildren: 2, birthOrders: [1] })).toBe(4);
    expect(minDependents({ childTaxCreditEligibleChildren: 0 })).toBe(1);
    // 본인이 70세 이상·장애인일 수 있으므로 1명씩은 부양가족 1명(본인)으로 충분하다
    expect(minDependents({ childTaxCreditEligibleChildren: 0, seniorDependents: 1, disabledDependents: 1 })).toBe(1);
    expect(withSenior(base, 1)).toMatchObject({ seniorDependents: 1, dependents: 1 });
  });

  it("인원을 줄여도 부양가족은 내리지 않는다 (사용자가 직접 줄인다)", () => {
    const up = withSenior(base, 3);
    expect(up.dependents).toBe(3);
    expect(withSenior(up, 0)).toMatchObject({ seniorDependents: 0, dependents: 3 });
    expect(withDisabled(withDisabled(base, 2), 1)).toMatchObject({ disabledDependents: 1, dependents: 2 });
  });

  it("어떤 순서로 바꿔도 부양가족 ≥ 각 인원 · 자녀 하한", () => {
    let state = base;
    const steps: Array<[string, number]> = [
      ["senior", 2], ["disabled", 3], ["children", 1], ["senior", 4], ["disabled", 0], ["children", 3], ["senior", 1],
    ];
    for (const [field, n] of steps) {
      state = field === "senior" ? withSenior(state, n) : field === "disabled" ? withDisabled(state, n) : withChildren(state, n);
      expect(state.dependents).toBeGreaterThanOrEqual(state.seniorDependents);
      expect(state.dependents).toBeGreaterThanOrEqual(state.disabledDependents);
      expect(state.dependents).toBeGreaterThanOrEqual(minDependents(state));
      // 엔진이 거부하지 않는 상태여야 한다 (자녀세액공제 인원 ≤ 부양가족 - 1)
      expect(() => runUi(state)).not.toThrow();
    }
  });

  it("화면 결과 = 바로잡힌 입력(부양가족을 함께 올린 상태)의 엔진 결과, 부풀린 종전 환급보다 작다", () => {
    for (const grossSalary of [50_000_000, 80_000_000]) {
      const start = { ...base, grossSalary, ...deriveAnnualSocialInsurance2026(grossSalary) };
      for (const [senior, disabled] of [[2, 0], [0, 2], [3, 3]] as const) {
        const ui = withDisabled(withSenior(start, senior), disabled);
        const corrected = { ...start, seniorDependents: senior, disabledDependents: disabled, dependents: Math.max(senior, disabled) };
        expect(ui).toEqual(corrected);
        const engine = calculateYearEndTax({
          ...corrected,
          prepaidTax: estimatePrepaidIncomeTax2026(grossSalary, corrected.dependents, 0),
        });
        expect(runUi(ui)).toEqual(engine);
        // 종전 화면은 부양가족 1 그대로 넘겼다 — 그 상태의 환급이 더 컸다
        const inflated = runUi({ ...start, seniorDependents: senior, disabledDependents: disabled });
        expect(inflated.finalRefund).toBeGreaterThan(engine.finalRefund);
      }
    }
  });

  it("두 스테퍼가 새 갱신 함수로 이어지고 부양가족 스테퍼 최솟값 문구는 그대로다", () => {
    const src = readFileSync("src/components/YearEndTaxCalculator.tsx", "utf8");
    expect(src).toContain("const handleSeniorChange = (v: number) => setInputs((prev) => withSenior(prev, v));");
    expect(src).toContain("const handleDisabledChange = (v: number) => setInputs((prev) => withDisabled(prev, v));");
    expect(src).toContain('<NumberStepper label="만 70세 이상" value={inputs.seniorDependents} onValueChange={handleSeniorChange} unit="명" />');
    expect(src).toContain('<NumberStepper label="장애인" value={inputs.disabledDependents} onValueChange={handleDisabledChange} unit="명" />');
    expect(src).toContain("min={minDependents(inputs)}");
    expect(src).not.toContain('handleNumberChange("seniorDependents"');
    expect(src).not.toContain('handleNumberChange("disabledDependents"');
  });
});
