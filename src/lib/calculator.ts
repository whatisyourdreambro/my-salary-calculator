// ===================================================================
// 2025년 대한민국 4대 보험 및 소득세 정보 (V2: 상세 설정 기능 추가)
// ===================================================================

const PENSION_RATE = 0.045;
const PENSION_MONTHLY_CAP = 5900000 * PENSION_RATE;
const HEALTH_RATE = 0.03545;
const LONG_TERM_CARE_RATE = 0.1295;
const EMPLOYMENT_INSURANCE_RATE = 0.009;
const LOCAL_INCOME_TAX_RATE = 0.1;

// --- 상세 설정을 위한 인터페이스 정의 ---
export interface AdvancedSettings {
  isSmeYouth: boolean; // 중소기업 취업 청년 감면 여부
  disabledDependents: number; // 장애인 부양가족 수
  seniorDependents: number; // 70세 이상 경로우대 부양가족 수
}

function getEarnedIncomeDeduction(annualSalary: number): number {
  if (annualSalary <= 5000000) return annualSalary * 0.7;
  if (annualSalary <= 15000000) return 3500000 + (annualSalary - 5000000) * 0.4;
  if (annualSalary <= 45000000)
    return 7500000 + (annualSalary - 15000000) * 0.15;
  if (annualSalary <= 100000000)
    return 12000000 + (annualSalary - 45000000) * 0.05;
  return 14750000 + (annualSalary - 100000000) * 0.02;
}

function getCalculatedTax(taxBase: number): number {
  if (taxBase <= 14000000) return taxBase * 0.06;
  if (taxBase <= 50000000) return 840000 + (taxBase - 14000000) * 0.15;
  if (taxBase <= 88000000) return 6240000 + (taxBase - 50000000) * 0.24;
  if (taxBase <= 150000000) return 15360000 + (taxBase - 88000000) * 0.35;
  if (taxBase <= 300000000) return 37060000 + (taxBase - 150000000) * 0.38;
  if (taxBase <= 500000000) return 94060000 + (taxBase - 300000000) * 0.4;
  if (taxBase <= 1000000000) return 174060000 + (taxBase - 500000000) * 0.42;
  return 384060000 + (taxBase - 1000000000) * 0.45;
}

function getTaxCredit(calculatedTax: number, annualSalary: number): number {
  let credit = 0;
  if (calculatedTax <= 1300000) {
    credit = calculatedTax * 0.55;
  } else {
    credit = 715000 + (calculatedTax - 1300000) * 0.3;
  }
  if (annualSalary > 70000000) return Math.min(credit, 660000);
  if (annualSalary > 33000000) return Math.min(credit, 740000);
  return credit;
}

export function calculateNetSalary(
  annualSalary: number,
  nonTaxableAmount: number = 0,
  dependents: number = 1,
  children: number = 0,
  overtimePay: number = 0,
  advancedSettings: AdvancedSettings // 상세 설정 파라미터 추가
) {
  const totalAnnualSalary = annualSalary + overtimePay;

  if (totalAnnualSalary <= 0) {
    return {
      monthlyNet: 0,
      totalDeduction: 0,
      pension: 0,
      health: 0,
      longTermCare: 0,
      employment: 0,
      incomeTax: 0,
      localTax: 0,
    };
  }

  const actualNonTaxableAmount = Math.min(totalAnnualSalary, nonTaxableAmount);
  const taxableAnnualSalary = totalAnnualSalary - actualNonTaxableAmount;
  const monthlySalary = totalAnnualSalary / 12;
  const taxableMonthlyIncome = Math.max(
    0,
    monthlySalary - actualNonTaxableAmount / 12
  );

  const pension = Math.min(
    taxableMonthlyIncome * PENSION_RATE,
    PENSION_MONTHLY_CAP
  );
  const health = taxableMonthlyIncome * HEALTH_RATE;
  const longTermCare = health * LONG_TERM_CARE_RATE;
  const employment = taxableMonthlyIncome * EMPLOYMENT_INSURANCE_RATE;

  const earnedIncomeDeduction = getEarnedIncomeDeduction(taxableAnnualSalary);

  // --- 상세 설정 로직 반영: 추가 인적공제 ---
  const personalDeduction =
    dependents * 1500000 +
    advancedSettings.disabledDependents * 2000000 +
    advancedSettings.seniorDependents * 1000000;

  const pensionDeduction = pension * 12;

  const taxBase = Math.max(
    0,
    taxableAnnualSalary -
      earnedIncomeDeduction -
      personalDeduction -
      pensionDeduction
  );

  const calculatedTax = getCalculatedTax(taxBase);
  const taxCredit = getTaxCredit(calculatedTax, taxableAnnualSalary);
  const childTaxCredit = children * 150000;

  let finalAnnualTax = Math.max(0, calculatedTax - taxCredit - childTaxCredit);

  // --- 상세 설정 로직 반영: 중소기업 청년 소득세 감면 ---
  if (advancedSettings.isSmeYouth) {
    const taxReductionLimit = 2000000; // 연간 감면 한도 200만원
    const taxReductionAmount = finalAnnualTax * 0.9; // 90% 감면
    finalAnnualTax -= Math.min(taxReductionAmount, taxReductionLimit);
  }

  const incomeTax = finalAnnualTax / 12;
  const localTax = incomeTax * LOCAL_INCOME_TAX_RATE;

  const totalDeduction =
    pension + health + longTermCare + employment + incomeTax + localTax;
  const finalMonthlyNet = monthlySalary - totalDeduction;

  return {
    monthlyNet: Math.round(finalMonthlyNet),
    totalDeduction: Math.round(totalDeduction),
    pension: Math.round(pension),
    health: Math.round(health),
    longTermCare: Math.round(longTermCare),
    employment: Math.round(employment),
    incomeTax: Math.round(incomeTax),
    localTax: Math.round(localTax),
  };
}
