// 중소기업 청년 감면 엔진 일치 테스트 — 2026-09-25 CALC-09 (batch B10).
//
// calculator.ts 의 '중소기업 청년' 스위치(InteractiveTable·홈 고급 설정)와 전용 계산기
// /calc/smb-income-tax-break(smbTaxBreak.computeSmbTaxBreak)가 같은 조건에서 같은 절감액을
// 내야 한다. 종전 calculator.ts 는 세액공제 뒤 금액에 90%·200만 한도를 적용해, 한도가 걸리는
// 연봉에서 절감액을 과대 계산했다(5,000만 연 2,000,004원 vs 1,654,563원).
// 두 엔진 모두 조특법 §30(산출세액 × 90%, 연 200만 한도) + 소득세법 §59③(근로소득세액공제
// × (1 − 감면/산출)) 을 applySmeYouthReduction 한 곳에서 계산한다.
import { describe, expect, it } from "vitest";

import { calculateNetSalary } from "@/lib/calculator";
import { applySmeYouthReduction, computeSmbTaxBreak } from "@/lib/smbTaxBreak";

const OFF = { isSmeYouth: false, disabledDependents: 0, seniorDependents: 0 };
const ON = { ...OFF, isSmeYouth: true };

/** calculator.ts 연간 소득세 절감액 — 월 소득세(원 반올림) 차이 × 12 */
function calculatorSaving(salary: number) {
  // smbTaxBreak 은 총급여(비과세 0)·본인 1인·자녀 0 전제 — 같은 조건으로 맞춘다
  const off = calculateNetSalary(salary, 0, 1, 0, OFF);
  const on = calculateNetSalary(salary, 0, 1, 0, ON);
  return {
    incomeTax: (off.incomeTax - on.incomeTax) * 12,
    localTax: (off.localTax - on.localTax) * 12,
  };
}

describe("중소기업 청년 감면 — calculator.ts = smbTaxBreak", () => {
  it.each([30_000_000, 50_000_000, 80_000_000])("연봉 %i원: 연 절감 소득세·지방세 일치 (월 반올림 오차 ±12원)", (salary) => {
    const smb = computeSmbTaxBreak({ annualSalary: salary, dependents: 1, breakType: "youth" });
    const calc = calculatorSaving(salary);
    expect(Math.abs(calc.incomeTax - smb.savedIncomeTax)).toBeLessThanOrEqual(12);
    expect(Math.abs(calc.localTax - smb.savedLocalTax)).toBeLessThanOrEqual(12);
  });

  it("한도가 걸리는 5,000만: 절감액은 200만이 아니라 §59③ 반영 약 165만원", () => {
    const smb = computeSmbTaxBreak({ annualSalary: 50_000_000, dependents: 1, breakType: "youth" });
    expect(smb.reductionCapped).toBe(true);
    expect(smb.savedIncomeTax).toBe(1_654_563);
    expect(calculatorSaving(50_000_000).incomeTax).toBeLessThan(1_700_000);
  });
  // 감면 스위치 OFF(기본) 출력 불변은 taxRatesParam.test.ts 의 calculator.ts 동결값이 지킨다.
});

describe("applySmeYouthReduction — 순수 헬퍼", () => {
  it("한도 미달: 감면 = 산출세액 × 90%, 공제는 10% 로 축소", () => {
    const r = applySmeYouthReduction({ calculatedTax: 1_000_000, earnedIncomeCredit: 550_000 });
    expect(r.reduction).toBe(900_000);
    expect(r.creditAfter).toBeCloseTo(55_000, 6);
    expect(r.capped).toBe(false);
  });

  it("한도 초과: 감면 200만, 공제 × (1 − 200만/산출세액)", () => {
    const r = applySmeYouthReduction({ calculatedTax: 4_000_000, earnedIncomeCredit: 660_000 });
    expect(r.reduction).toBe(2_000_000);
    expect(r.creditAfter).toBeCloseTo(330_000, 6);
    expect(r.capped).toBe(true);
  });

  it("산출세액 0 이면 감면·공제 0", () => {
    expect(applySmeYouthReduction({ calculatedTax: 0, earnedIncomeCredit: 0 })).toEqual({
      reduction: 0,
      creditAfter: 0,
      capped: false,
    });
  });

  it("감면율·한도 인자 (60세 이상 등 70%)", () => {
    const r = applySmeYouthReduction({ calculatedTax: 1_000_000, earnedIncomeCredit: 550_000, rate: 0.7 });
    expect(r.reduction).toBe(700_000);
    expect(r.creditAfter).toBeCloseTo(165_000, 6);
  });
});
