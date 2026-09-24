// 중소기업 청년 감면 엔진 정합 테스트 — 2026-09-25 CALC-09 (batch B10) · A17 (CALC-01).
//
// calculator.ts 의 '중소기업 청년' 스위치(InteractiveTable·홈 고급 설정)와 전용 계산기
// /calc/smb-income-tax-break(smbTaxBreak.computeSmbTaxBreak)는 같은 헬퍼 applySmeYouthReduction
// 으로 조특법 §30(산출세액 × 90%, 과세기간 200만 한도)과 소득세법 §59③(근로소득세액공제
// × (1 − 감면/산출세액))을 계산한다. 종전 calculator.ts 는 세액공제 뒤 금액에 90%·200만 한도를
// 적용해 한도가 걸리는 연봉에서 절감액을 과대 계산했다(5,000만 연 2,000,004원).
//
// A17 이후 두 표면의 '기준 세액'은 다르다 — 월 실수령 엔진은 근로소득 간이세액표(별표2)의 산식,
// 전용 계산기는 인적·연금 공제만 넣은 연간 결정세액 근사. 그래서 금액 일치가 아니라 같은 헬퍼·
// 같은 법 구조(감면은 산출세액에, 공제는 비율 축소)를 쓰는지를 검증한다.
import { describe, expect, it } from "vitest";

import { calculateNetSalary } from "@/lib/calculator";
import { applySmeYouthReduction, computeSmbTaxBreak } from "@/lib/smbTaxBreak";
import { withholdingIncomeTax2026 } from "@/lib/withholdingTaxTable2026";

const OFF = { isSmeYouth: false, disabledDependents: 0, seniorDependents: 0 };
const ON = { ...OFF, isSmeYouth: true };

describe("중소기업 청년 감면 — calculator.ts (간이세액표 기준)", () => {
  it.each([30_000_000, 50_000_000, 80_000_000])("연봉 %i원: 스위치 ON 월 소득세 = 간이세액표 감면 산식", (salary) => {
    const on = calculateNetSalary(salary, 0, 1, 0, ON);
    expect(on.incomeTax).toBe(withholdingIncomeTax2026(salary / 12, 1, 0, { smeYouth: true }));
    expect(on.localTax).toBe(Math.round(on.incomeTax * 0.1));
  });

  it("한도 미달(3,000만): 감면 후 소득세 = 간이세액표 금액의 10%", () => {
    const off = calculateNetSalary(30_000_000, 0, 1, 0, OFF);
    const on = calculateNetSalary(30_000_000, 0, 1, 0, ON);
    // 월급여액 250만 · 1인 → 표 2,500~2,510천원 칸 35,600원. (산출 − 공제) × 10% 와 같다
    expect(off.incomeTax).toBe(35_600);
    expect(on.incomeTax).toBe(3_560);
  });

  it("한도 초과(5,000만): 감면 200만 + §59③ 공제 축소 — 월 84,310원 (절감 연 1,596,120원 < 200만)", () => {
    // 표 4,160~4,180천원 칸(중간값 417만) 산식: 총급여 5,004만, 산출세액 3,267,840원,
    // 근로소득세액공제 66만(표 한도) → 감면 전 월 217,320원(별표2 금액).
    // 감면 = min(3,267,840 × 90%, 200만) = 200만, 공제 = 66만 × (1 − 200만/3,267,840) = 256,065.6원
    // → 연 1,011,774.4원 ÷ 12 → 10원 미만 절사 84,310원.
    const off = calculateNetSalary(50_000_000, 0, 1, 0, OFF);
    const on = calculateNetSalary(50_000_000, 0, 1, 0, ON);
    expect(off.incomeTax).toBe(217_320);
    expect(on.incomeTax).toBe(84_310);
    const annualSaving = (off.incomeTax - on.incomeTax) * 12;
    expect(annualSaving).toBe(1_596_120);
    expect(annualSaving).toBeLessThan(2_000_000);
  });
});

describe("중소기업 청년 감면 — 전용 계산기(smbTaxBreak)와 같은 헬퍼", () => {
  it.each([30_000_000, 50_000_000, 80_000_000])("연봉 %i원: computeSmbTaxBreak 의 감면·축소 공제 = applySmeYouthReduction", (salary) => {
    const smb = computeSmbTaxBreak({ annualSalary: salary, dependents: 1, breakType: "youth" });
    const helper = applySmeYouthReduction({ calculatedTax: smb.calculatedTax, earnedIncomeCredit: smb.creditBefore });
    expect(smb.reduction).toBe(helper.reduction);
    expect(Math.abs(smb.creditAfter - helper.creditAfter)).toBeLessThanOrEqual(1);
    expect(smb.reductionCapped).toBe(helper.capped);
  });

  it("한도가 걸리는 5,000만: 전용 계산기 절감액은 200만이 아니라 §59③ 반영 1,654,563원", () => {
    const smb = computeSmbTaxBreak({ annualSalary: 50_000_000, dependents: 1, breakType: "youth" });
    expect(smb.reductionCapped).toBe(true);
    expect(smb.savedIncomeTax).toBe(1_654_563);
  });
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
