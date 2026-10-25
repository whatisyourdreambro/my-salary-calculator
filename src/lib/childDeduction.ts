import { childTaxCredit2026 } from "./taxConstants2026";

export const CHILD_DEDUCTION_COUNT_LIMIT = 20;

export interface ChildDeductionInput {
  basicDeductionChildren: number;
  childTaxCreditEligibleChildren: number;
  firstBirthOrAdoption: number;
  secondBirthOrAdoption: number;
  thirdPlusBirthOrAdoption: number;
}

export type ChildDeductionResult =
  | { valid: false; error: string }
  | {
      valid: true;
      incomeDeduction: number;
      childTaxCredit: number;
      birthAdoptionTaxCredit: number;
      taxCreditBeforeLimit: number;
    };

export function calculateChildDeduction2026(input: ChildDeductionInput): ChildDeductionResult {
  const counts = [input.basicDeductionChildren, input.childTaxCreditEligibleChildren, input.firstBirthOrAdoption, input.secondBirthOrAdoption, input.thirdPlusBirthOrAdoption];
  if (counts.some((count) => !Number.isInteger(count) || count < 0 || count > CHILD_DEDUCTION_COUNT_LIMIT)) {
    return { valid: false, error: "인원은 0명부터 20명까지의 정수로 입력해 주세요." };
  }
  if (input.firstBirthOrAdoption > 1 || input.secondBirthOrAdoption > 1) {
    return { valid: false, error: "첫째와 둘째의 출산·입양 인원은 각각 1명까지 입력해 주세요." };
  }
  const children = input.basicDeductionChildren;
  if (input.childTaxCreditEligibleChildren > children) {
    return { valid: false, error: "자녀세액공제 대상 인원은 기본공제 대상 인원보다 많을 수 없습니다." };
  }
  const births = input.firstBirthOrAdoption + input.secondBirthOrAdoption + input.thirdPlusBirthOrAdoption;
  if (births > children) {
    return { valid: false, error: "출산·입양한 자녀도 위의 기본공제 대상 인원에 포함해 주세요." };
  }
  const childTaxCredit = childTaxCredit2026(input.childTaxCreditEligibleChildren);
  const birthAdoptionTaxCredit = input.firstBirthOrAdoption * 300_000
    + input.secondBirthOrAdoption * 500_000 + input.thirdPlusBirthOrAdoption * 700_000;
  return {
    valid: true,
    incomeDeduction: children * 1_500_000,
    childTaxCredit,
    birthAdoptionTaxCredit,
    taxCreditBeforeLimit: childTaxCredit + birthAdoptionTaxCredit,
  };
}
