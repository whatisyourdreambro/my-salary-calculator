// 성과급 세후 — 실제 엔진 차이 회귀 테스트 (2026-09-25 A18 CALC-02).
//
// 소득세 증가분 = 연간 결정세액(연봉 + 성과급) − 연간 결정세액(연봉).
// 종전 기본값은 '산출세액 차이 × (1 − 세액공제 30%)' 였는데, 근로소득세액공제(소득세법 §59)는
// 총급여가 오를수록 한도가 줄어드는 정액성 공제라 성과급에 비례해 늘지 않는다 — 세후 과대.
import { describe, expect, it } from "vitest";

import {
  calcBonusNet,
  DEFAULT_BONUS_CREDIT_RATE,
  estimateAnnualIncomeTax2026,
} from "@/lib/bonusTaxCalc";
import { calcIncomeTax2026, earnedIncomeTaxCredit2026, earnedIncomeDeduction2026 } from "@/lib/taxConstants2026";

describe("estimateAnnualIncomeTax2026 — 연말정산 구조 결정세액", () => {
  it("연봉 8,000만: 손 검산값 7,424,750원", () => {
    // 근로소득공제 1,375만 · 기본공제 150만 · 연금 7,908만×4.75% = 3,756,300 ·
    // 건강+장기요양 8,000만×3.595%×1.1314 = 3,253,906.4 · 고용 72만 → 과세표준 57,019,793.6
    // 산출세액 7,924,750 − 근로소득세액공제 한도 50만(총급여 8,000만: 66만 − 1,000만×1/2, 최저 50만)
    expect(estimateAnnualIncomeTax2026(80_000_000)).toBe(7_424_750);
  });

  it("연봉 1억 1,000만: 손 검산값 13,979,099원", () => {
    // 근로소득공제 1,495만 · 연금 3,756,300 · 건강+장기요양 4,474,121.3 · 고용 99만 → 과표 84,329,578.7
    // 산출세액 14,479,099 − 50만
    expect(estimateAnnualIncomeTax2026(110_000_000)).toBe(13_979_099);
  });

  it("정본 함수 조합과 같다 (보험료 공제 포함)", () => {
    const g = 55_000_000;
    const pension = g * 0.0475;
    const health = g * 0.03595 * 1.1314;
    const employment = g * 0.009;
    const base = g - earnedIncomeDeduction2026(g) - 1_500_000 - pension - health - employment;
    const calculated = calcIncomeTax2026(base);
    expect(estimateAnnualIncomeTax2026(g)).toBe(calculated - earnedIncomeTaxCredit2026(calculated, g));
  });

  it("0 이하·비유한 입력은 0", () => {
    expect(estimateAnnualIncomeTax2026(0)).toBe(0);
    expect(estimateAnnualIncomeTax2026(-1)).toBe(0);
    expect(estimateAnnualIncomeTax2026(Number.NaN)).toBe(0);
  });
});

describe("calcBonusNet — 기본값은 실제 엔진 차이", () => {
  it("추가 세액공제 가정 디폴트는 0", () => {
    expect(DEFAULT_BONUS_CREDIT_RATE).toBe(0);
  });

  it.each([
    [80_000_000, 30_000_000],
    [100_000_000, 50_000_000],
    [42_000_000, 1_000_000],
    [30_000_000, 5_000_000],
  ])("연봉 %i · 성과급 %i: 소득세 증가분 = T(연봉+성과급) − T(연봉)", (salary, bonus) => {
    const r = calcBonusNet(salary, bonus);
    const expected = estimateAnnualIncomeTax2026(salary + bonus) - estimateAnnualIncomeTax2026(salary);
    expect(r.incomeTaxDelta).toBe(Math.round(expected));
    expect(r.localTaxDelta).toBe(Math.round(expected * 0.1));
  });

  it("8,000만 + 3,000만: 소득세 증가분 6,554,349원 · 세후 21,300,001원 (종전 30% 가정 22,717,460원)", () => {
    const r = calcBonusNet(80_000_000, 30_000_000);
    expect(r.incomeTaxDelta).toBe(13_979_099 - 7_424_750);
    expect(r.net).toBe(21_300_001);
  });

  it("1억 + 5,000만: 세후 30,847,345원 (종전 30% 가정 34,670,783원, 382만원 과대)", () => {
    expect(calcBonusNet(100_000_000, 50_000_000).net).toBe(30_847_345);
  });

  it("추가 세액공제 가정은 엔진 증가분에 비율로만 적용", () => {
    const base = calcBonusNet(80_000_000, 30_000_000);
    const extra = calcBonusNet(80_000_000, 30_000_000, 20);
    expect(extra.incomeTaxDelta).toBe(Math.round((13_979_099 - 7_424_750) * 0.8));
    expect(extra.net).toBeGreaterThan(base.net);
  });

  it("4대보험 미적용이면 성과급분 보험료 공제도 없다 (소득세 증가분이 더 크다)", () => {
    const on = calcBonusNet(80_000_000, 30_000_000, 0, true);
    const off = calcBonusNet(80_000_000, 30_000_000, 0, false);
    expect(off.healthDelta + off.empInsDelta + off.pensionDelta).toBe(0);
    expect(off.incomeTaxDelta).toBe(
      estimateAnnualIncomeTax2026(110_000_000, undefined, 80_000_000) - estimateAnnualIncomeTax2026(80_000_000)
    );
    expect(off.incomeTaxDelta).toBeGreaterThan(on.incomeTaxDelta);
  });

  it("성과급이 커질수록 소득세 증가분은 단조 증가", () => {
    let prev = 0;
    for (let bonus = 1_000_000; bonus <= 200_000_000; bonus += 7_000_000) {
      const tax = calcBonusNet(60_000_000, bonus).incomeTaxDelta;
      expect(tax).toBeGreaterThanOrEqual(prev);
      prev = tax;
    }
  });

  it("위젯(/widget/bonus) 텔레스코핑 G(s+b) − G(s) 가 직접 계산과 2원 이내", () => {
    const G = (x: number) => (x <= 0 ? 0 : Math.round(calcBonusNet(0, x).totalDeductions));
    for (let s = 0; s <= 300_000_000; s += 13_000_000) {
      for (const b of [1_000_000, 10_000_000, 50_000_000]) {
        expect(Math.abs(calcBonusNet(s, b).totalDeductions - (G(s + b) - G(s)))).toBeLessThanOrEqual(2);
      }
    }
  });
});
