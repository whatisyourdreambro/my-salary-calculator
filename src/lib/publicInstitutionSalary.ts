import { calculateSalary2026, type TaxResult } from "./TaxLogic";

export const PUBLIC_INSTITUTION_SALARY_PATH = "/public-institutions";
export const PUBLIC_INSTITUTION_SALARY_TITLE = "공기업·공공기관 연봉 계산기";

export interface PublicInstitutionSalaryInput {
  annualPay: number;
  additionalBonus: number;
  nonTaxableMonthly: number;
  dependents: number;
  children: number;
  pensionSystem: "national" | "other";
}

export type PublicInstitutionSalaryResult =
  | { ok: false; message: string }
  | {
      ok: true;
      grossAnnual: number;
      annualNetEstimate: number;
      annualBonusNetIncrease: number;
      monthlyBeforeBonus: TaxResult;
      monthlyIncludingBonus: TaxResult;
    };

/** Won inputs stay local. Empty, signed, malformed and unsafe values cannot reuse a result. */
export function parsePublicSalaryAmount(value: string): number | null {
  const trimmed = value.trim();
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(trimmed)) return null;
  const amount = Number(trimmed.replaceAll(",", ""));
  return Number.isSafeInteger(amount) && amount <= 1_000_000_000 ? amount : null;
}

/** Annualised comparison using the same ordinary-employee model as the home calculator. */
export function calculatePublicInstitutionSalary(input: PublicInstitutionSalaryInput): PublicInstitutionSalaryResult {
  if (input.pensionSystem !== "national") {
    return { ok: false, message: "공무원·사학연금 등 별도 연금 체계는 이 계산기에 적용하지 않습니다. 가입한 제도의 공제 기준을 확인하세요." };
  }
  const amounts = [input.annualPay, input.additionalBonus, input.nonTaxableMonthly];
  if (amounts.some((value) => !Number.isSafeInteger(value) || value < 0 || value > 1_000_000_000)) {
    return { ok: false, message: "금액은 0 이상의 정수로 입력해 주세요. 입력 단위는 원입니다." };
  }
  const grossAnnual = input.annualPay + input.additionalBonus;
  if (grossAnnual > 1_000_000_000) {
    return { ok: false, message: "합산 연보수는 10억 원 이하로 입력해 주세요." };
  }
  if (!Number.isInteger(input.dependents) || input.dependents < 1 || input.dependents > 20
    || !Number.isInteger(input.children) || input.children < 0 || input.children >= input.dependents) {
    return { ok: false, message: "부양가족은 본인 포함 1~20명이며, 공제 대상 자녀는 본인을 제외한 가족 수 이하여야 합니다." };
  }
  if (input.nonTaxableMonthly * 12 > input.annualPay) {
    return { ok: false, message: "월 비과세액의 12개월 합계가 입력 연보수를 넘습니다. 연보수에 비과세 수당을 포함했는지 확인하세요." };
  }

  const monthlyBeforeBonus = calculateSalary2026(input.annualPay, input.nonTaxableMonthly, input.dependents, input.children);
  const monthlyIncludingBonus = calculateSalary2026(grossAnnual, input.nonTaxableMonthly, input.dependents, input.children);
  if (monthlyBeforeBonus.netPay < 0 || monthlyIncludingBonus.netPay < 0) {
    return { ok: false, message: "입력 금액이 일반 직장가입자 보험료 추정 범위보다 작습니다. 금액 단위와 가입 조건을 확인하세요." };
  }
  return {
    ok: true,
    grossAnnual,
    annualNetEstimate: monthlyIncludingBonus.netPay * 12,
    annualBonusNetIncrease: (monthlyIncludingBonus.netPay - monthlyBeforeBonus.netPay) * 12,
    monthlyBeforeBonus,
    monthlyIncludingBonus,
  };
}

export const PUBLIC_INSTITUTION_FAQ = [
  {
    question: "공기업, 준정부기관, 기타공공기관은 같은 뜻인가요?",
    answer: "공공기관은 공기업·준정부기관·기타공공기관 등으로 구분됩니다. 지방공기업과 지방출자·출연기관은 클린아이에서 별도로 확인합니다. 공무원 봉급표를 공공기관 직원의 연봉표로 적용하지 않습니다.",
  },
  {
    question: "기관 평균 연봉을 넣으면 제 월급이 나오나요?",
    answer: "공시 평균보수는 공시 대상 직원의 평균이며 개인의 계약 연봉이 아닙니다. 이를 입력하면 해당 금액을 내 연봉으로 가정한 추정치가 나옵니다. 직급·근속·근무 형태·수당·성과급에 따라 실제 금액은 달라집니다.",
  },
  {
    question: "신입사원 초임과 직원 평균보수는 어떻게 비교하나요?",
    answer: "같은 공시 연도와 결산·예산 구분을 먼저 맞추고, 일반정규직·무기계약직 등 대상과 단위를 확인하세요. 신입사원 초임은 공시에서 정한 입사 조건을 기준으로 하므로 개인의 경력·군 경력·수당 조건과 다를 수 있습니다.",
  },
  {
    question: "공시 금액에 성과급을 더 입력해도 되나요?",
    answer: "이미 포함된 성과급은 다시 더하지 마세요. 공시의 성과상여금·경영평가 성과급 포함 여부와 주석을 확인한 뒤, 입력한 연보수에 빠진 추가 현금 보상만 입력합니다. 예산에 표시된 0원이 실제 미지급 확정을 뜻하는지도 주석으로 확인해야 합니다.",
  },
  {
    question: "공무원연금이나 사학연금 가입자도 사용할 수 있나요?",
    answer: "이 계산기는 국민연금·건강보험·고용보험을 적용하는 일반 근로자 모형입니다. 공무원·사학연금 등 별도 체계를 선택하면 금액을 계산하지 않습니다. 보험료 정산, 연말정산과 기관별 추가 공제는 실제 명세서에서 확인하세요.",
  },
];
