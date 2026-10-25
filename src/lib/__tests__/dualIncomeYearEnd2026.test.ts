import { describe, expect, it } from "vitest";
import { calculateDualIncomeYearEnd2026, childAssignments2026, type DualIncomeInput } from "../dualIncomeYearEnd2026";

const base: DualIncomeInput = {
  salaryMe: 80_000_000, salarySp: 60_000_000, children: 2, childTaxCreditEligibleChildren: 1,
  childMedical: 0, childEducation: 0, childDonation: 0, coupleMedical: 0,
};

describe("맞벌이 기본공제와 연간 자녀세액공제 배분", () => {
  it("기본공제 2명 중 1명이 적격이면 1명씩 나눌 때 두 적격 배분을 모두 비교한다", () => {
    expect(childAssignments2026(2, 1)).toEqual([
      { kidsToMe: 0, creditKidsToMe: 0 }, { kidsToMe: 1, creditKidsToMe: 0 },
      { kidsToMe: 1, creditKidsToMe: 1 }, { kidsToMe: 2, creditKidsToMe: 1 },
    ]);
    expect(childAssignments2026(3, 1).filter((x) => x.kidsToMe === 0)).toEqual([{ kidsToMe: 0, creditKidsToMe: 0 }]);
  });

  it("기본공제 2명은 유지하면서 적격 1명만 각 전부 귀속 시나리오에 반영한다", () => {
    const without = calculateDualIncomeYearEnd2026({ ...base, childTaxCreditEligibleChildren: 0 });
    const withCredit = calculateDualIncomeYearEnd2026(base);
    expect(without.allMe.taxMe - withCredit.allMe.taxMe).toBe(250_000);
    expect(without.allSp.taxSp - withCredit.allSp.taxSp).toBe(250_000);
    expect(without.allMe.taxSp).toBe(withCredit.allMe.taxSp);
    expect(without.allSp.taxMe).toBe(withCredit.allSp.taxMe);
    expect(withCredit.allMe.assign.creditKidsToMe).toBe(1);
    expect(withCredit.allSp.assign.creditKidsToMe).toBe(0);
  });

  it("기본공제를 1명씩 받을 때 적격 자녀 귀속에 따라 해당 부모 세액만 25만원 감소한다", () => {
    const rows = calculateDualIncomeYearEnd2026(base).scenarios;
    const toMe = rows.find((s) => s.assign.kidsToMe === 1 && s.assign.creditKidsToMe === 1)!;
    const toSp = rows.find((s) => s.assign.kidsToMe === 1 && s.assign.creditKidsToMe === 0)!;
    expect(toSp.taxMe - toMe.taxMe).toBe(250_000);
    expect(toMe.taxSp - toSp.taxSp).toBe(250_000);
  });

  it("모든 허용 인원에서 부모별 부분집합과 가구 합계를 보존한다", () => {
    for (let n = 0; n <= 5; n++) for (let c = 0; c <= n; c++) {
      const result = calculateDualIncomeYearEnd2026({ ...base, children: n, childTaxCreditEligibleChildren: c });
      for (const row of result.scenarios) {
        const { kidsToMe: k, creditKidsToMe: j } = row.assign;
        expect(j).toBeGreaterThanOrEqual(0);
        expect(j).toBeLessThanOrEqual(k);
        expect(c - j).toBeGreaterThanOrEqual(0);
        expect(c - j).toBeLessThanOrEqual(n - k);
        expect(Number.isFinite(row.total)).toBe(true);
      }
      expect(result.optimal.total).toBe(Math.min(...result.scenarios.map((r) => r.total)));
    }
  });

  it.each([-1, 0.5, Number.NaN, Infinity, 6])("잘못된 인원 %s을 거부한다", (n) => {
    expect(() => childAssignments2026(n, 0)).toThrow(RangeError);
    expect(() => childAssignments2026(5, n)).toThrow(RangeError);
  });

  it("적격 인원 누락 또는 기본공제 인원 초과를 기존 자녀 수로 대체하지 않는다", () => {
    expect(() => childAssignments2026(1, 2)).toThrow(RangeError);
    expect(() => childAssignments2026(1, undefined as unknown as number)).toThrow(RangeError);
  });

  it("산출세액이 없는 가구에 공제로 음수 세금이나 절감액을 만들지 않는다", () => {
    const r = calculateDualIncomeYearEnd2026({ ...base, salaryMe: 5_000_000, salarySp: 5_000_000 });
    expect(r.optimal.total).toBe(0);
    expect(r.saving).toBe(0);
  });

  // d4ea19856c47996acf917a3092879359ca6bb060의 기존 엔진/Client 배분식으로 산출한 금액.
  // 당시 children 전원이 연간 적격이라는 가정을 명시하면 보험·지출 배분 금액은 그대로여야 한다.
  it("전원이 적격인 기존 2자녀 사례의 모든 지출 배분 금액을 보존한다", () => {
    const result = calculateDualIncomeYearEnd2026({ ...base, childTaxCreditEligibleChildren: 2,
      childMedical: 5_000_000, childEducation: 4_000_000, childDonation: 500_000, coupleMedical: 2_000_000 });
    expect(result.scenarios.map((s) => [s.assign.kidsToMe, s.assign.childExpTo, s.assign.coupleMedTo, s.taxMe, s.taxSp])).toEqual([
      [0, "sp", "me", 7_424_751, 1_912_936], [0, "sp", "sp", 7_424_751, 1_612_936],
      [1, "me", "me", 5_449_751, 3_592_936], [1, "me", "sp", 5_749_751, 3_562_936],
      [1, "sp", "me", 6_814_751, 2_437_936], [1, "sp", "sp", 6_814_751, 2_137_936],
      [2, "me", "me", 4_789_751, 4_067_936], [2, "me", "sp", 5_089_751, 4_037_936],
    ]);
    expect(result.allMe.total).toBe(8_857_687);
    expect(result.allSp.total).toBe(9_037_687);
  });

  it("연금 상·하한에 걸리는 기존 부부의 배분 금액도 보존한다", () => {
    const result = calculateDualIncomeYearEnd2026({ ...base, salaryMe: 200_000_000, salarySp: 3_000_000,
      children: 3, childTaxCreditEligibleChildren: 3 });
    expect(result.scenarios.map((s) => [s.taxMe, s.taxSp])).toEqual([
      [43_722_395, 0], [42_902_395, 0], [42_902_395, 0],
      [42_032_395, 0], [42_032_395, 0], [41_062_395, 0],
    ]);
  });
});
