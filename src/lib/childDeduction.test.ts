import { describe, expect, it } from "vitest";
import { calculateChildDeduction2026, type ChildDeductionInput } from "./childDeduction";

const empty: ChildDeductionInput = {
  eligibleUnder8: 0, eligible8Plus: 0,
  firstBirthOrAdoption: 0, secondBirthOrAdoption: 0, thirdPlusBirthOrAdoption: 0,
};

describe("2026 귀속 자녀 공제액", () => {
  it("기본공제 대상이 없으면 두 종류 공제 모두 0원이다", () => {
    expect(calculateChildDeduction2026(empty)).toEqual({
      valid: true, incomeDeduction: 0, childTaxCredit: 0, birthAdoptionTaxCredit: 0, taxCreditBeforeLimit: 0,
    });
  });
  it("만 7세를 포함한 8세 미만은 기본공제만 적용하며 100만원을 추가하지 않는다", () => {
    expect(calculateChildDeduction2026({ ...empty, eligibleUnder8: 1 })).toEqual({
      valid: true, incomeDeduction: 1_500_000, childTaxCredit: 0, birthAdoptionTaxCredit: 0, taxCreditBeforeLimit: 0,
    });
  });
  it.each([[1, 250_000], [2, 550_000], [3, 950_000], [4, 1_350_000], [5, 1_750_000]])(
    "만 8세 이상 대상 %i명의 국세청 공제액은 %i원이다", (children, credit) => {
      expect(calculateChildDeduction2026({ ...empty, eligible8Plus: children })).toEqual({
        valid: true, incomeDeduction: children * 1_500_000, childTaxCredit: credit,
        birthAdoptionTaxCredit: 0, taxCreditBeforeLimit: credit,
      });
    },
  );
  it("8세 미만과 이상이 섞여도 소득공제액과 세액공제액을 합치지 않는다", () => {
    expect(calculateChildDeduction2026({ ...empty, eligibleUnder8: 2, eligible8Plus: 2 })).toEqual({
      valid: true, incomeDeduction: 6_000_000, childTaxCredit: 550_000,
      birthAdoptionTaxCredit: 0, taxCreditBeforeLimit: 550_000,
    });
  });
  it.each([
    ["firstBirthOrAdoption", 300_000], ["secondBirthOrAdoption", 500_000], ["thirdPlusBirthOrAdoption", 700_000],
  ] as const)("해당 연도 %s 1명의 공제는 %i원이다", (field, credit) => {
    expect(calculateChildDeduction2026({ ...empty, eligibleUnder8: 1, [field]: 1 })).toEqual({
      valid: true, incomeDeduction: 1_500_000, childTaxCredit: 0,
      birthAdoptionTaxCredit: credit, taxCreditBeforeLimit: credit,
    });
  });
  it("첫째·둘째 쌍둥이의 출산 공제는 80만원이고 기본공제는 300만원이다", () => {
    expect(calculateChildDeduction2026({ ...empty, eligibleUnder8: 2, firstBirthOrAdoption: 1, secondBirthOrAdoption: 1 })).toEqual({
      valid: true, incomeDeduction: 3_000_000, childTaxCredit: 0,
      birthAdoptionTaxCredit: 800_000, taxCreditBeforeLimit: 800_000,
    });
  });
  it("올해 입양한 만 8세 이상 대상 자녀는 두 세액공제 항목을 구분해 산출한다", () => {
    expect(calculateChildDeduction2026({ ...empty, eligible8Plus: 1, firstBirthOrAdoption: 1 })).toEqual({
      valid: true, incomeDeduction: 1_500_000, childTaxCredit: 250_000,
      birthAdoptionTaxCredit: 300_000, taxCreditBeforeLimit: 550_000,
    });
  });
  it.each([-1, 0.5, Number.NaN, Infinity, 21])("잘못된 인원 %s에서 금액을 표시하지 않는다", (count) => {
    expect(calculateChildDeduction2026({ ...empty, eligible8Plus: count }).valid).toBe(false);
  });
  it("기본공제 대상보다 출산·입양 인원이 많거나 첫째가 중복되면 입력 확인을 요청한다", () => {
    expect(calculateChildDeduction2026({ ...empty, firstBirthOrAdoption: 1 }).valid).toBe(false);
    expect(calculateChildDeduction2026({ ...empty, eligibleUnder8: 2, firstBirthOrAdoption: 2 }).valid).toBe(false);
  });
});
