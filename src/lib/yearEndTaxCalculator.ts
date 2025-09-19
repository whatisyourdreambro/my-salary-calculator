// 연말정산 항목별 입력을 위한 인터페이스 정의
export interface TaxInputs {
  grossSalary: number; // 총급여액
  prepaidTax: number; // 기납부세액

  // 소득공제 항목
  nationalPension: number; // 국민연금
  healthInsurance: number; // 건강보험료
  employmentInsurance: number; // 고용보험료

  dependents: number; // 기본공제 대상자 수 (본인포함)
  disabledDependents: number; // 장애인 수
  seniorDependents: number; // 70세 이상 경로자 수

  housingSubscription: number; // 주택청약저축 납입액
  mortgageInterest: number; // 장기주택저당차입금 이자상환액

  creditCard: number; // 신용카드 사용액
  debitCardAndCash: number; // 체크카드 및 현금영수증 사용액
  traditionalMarket: number; // 전통시장 사용액
  publicTransport: number; // 대중교통 사용액

  // 세액공제 항목
  children: number; // 자녀 수
  birthsOrAdoptions: number; // 해당년도 출산/입양 자녀 수

  pensionSavings: number; // 연금저축 납입액
  irp: number; // IRP 납입액

  lifeInsurance: number; // 보장성 보험료
  medicalExpenses: number; // 의료비
  educationExpenses: number; // 교육비
  donation: number; // 기부금
  monthlyRent: number; // 월세액
}

// 계산 결과를 위한 인터페이스 정의
export interface TaxResult {
  finalRefund: number; // 최종 환급(또는 추가납부)액
  determinedTax: number; // 결정세액
  taxBase: number; // 과세표준
  grossSalary: number; // 총급여
  totalDeductions: number; // 총 공제액 (소득공제 + 세액공제)
}

// 2025년 귀속 연말정산 계산 함수
export function calculateYearEndTax(inputs: TaxInputs): TaxResult {
  const { grossSalary } = inputs;

  // 1. 근로소득공제
  let earnedIncomeDeduction = 0;
  if (grossSalary <= 5000000) {
    earnedIncomeDeduction = grossSalary * 0.7;
  } else if (grossSalary <= 15000000) {
    earnedIncomeDeduction = 3500000 + (grossSalary - 5000000) * 0.4;
  } else if (grossSalary <= 45000000) {
    earnedIncomeDeduction = 7500000 + (grossSalary - 15000000) * 0.15;
  } else if (grossSalary <= 100000000) {
    earnedIncomeDeduction = 12000000 + (grossSalary - 45000000) * 0.05;
  } else {
    earnedIncomeDeduction = 14750000 + (grossSalary - 100000000) * 0.02;
  }
  const earnedIncomeAmount = grossSalary - earnedIncomeDeduction;

  // 2. 소득공제
  const personalDeduction =
    inputs.dependents * 1500000 +
    inputs.seniorDependents * 1000000 +
    inputs.disabledDependents * 2000000;

  const insuranceDeduction =
    inputs.nationalPension +
    inputs.healthInsurance +
    inputs.employmentInsurance;

  const housingSubscriptionDeduction =
    Math.min(inputs.housingSubscription, 3000000) * 0.4;

  const totalCardUsage =
    inputs.creditCard +
    inputs.debitCardAndCash +
    inputs.traditionalMarket +
    inputs.publicTransport;
  const cardUsageThreshold = grossSalary * 0.25;
  let cardDeduction = 0;
  if (totalCardUsage > cardUsageThreshold) {
    const overAmount = totalCardUsage - cardUsageThreshold;
    // 실제로는 사용처별로 계산해야 하지만 간소화
    cardDeduction = Math.min(overAmount * 0.15, 3000000);
  }

  const totalIncomeDeduction =
    personalDeduction +
    insuranceDeduction +
    housingSubscriptionDeduction +
    cardDeduction;

  // 3. 과세표준
  const taxBase = Math.max(0, earnedIncomeAmount - totalIncomeDeduction);

  // 4. 산출세액
  let calculatedTax = 0;
  if (taxBase <= 14000000) calculatedTax = taxBase * 0.06;
  else if (taxBase <= 50000000)
    calculatedTax = 840000 + (taxBase - 14000000) * 0.15;
  else if (taxBase <= 88000000)
    calculatedTax = 6240000 + (taxBase - 50000000) * 0.24;
  else if (taxBase <= 150000000)
    calculatedTax = 15360000 + (taxBase - 88000000) * 0.35;
  else if (taxBase <= 300000000)
    calculatedTax = 37060000 + (taxBase - 150000000) * 0.38;
  else if (taxBase <= 500000000)
    calculatedTax = 94060000 + (taxBase - 300000000) * 0.4;
  else if (taxBase <= 1000000000)
    calculatedTax = 174060000 + (taxBase - 500000000) * 0.42;
  else calculatedTax = 384060000 + (taxBase - 1000000000) * 0.45;

  // 5. 세액공제
  let earnedIncomeTaxCredit = 0;
  if (calculatedTax <= 1300000) {
    earnedIncomeTaxCredit = calculatedTax * 0.55;
  } else {
    earnedIncomeTaxCredit = 715000 + (calculatedTax - 1300000) * 0.3;
  }
  if (grossSalary > 33000000)
    earnedIncomeTaxCredit = Math.min(earnedIncomeTaxCredit, 740000);
  if (grossSalary > 70000000)
    earnedIncomeTaxCredit = Math.min(earnedIncomeTaxCredit, 660000);

  let childTaxCredit = 0;
  if (inputs.children === 1) childTaxCredit = 150000;
  else if (inputs.children >= 2)
    childTaxCredit = 350000 + (inputs.children - 2) * 300000;

  const pensionAccountCredit =
    Math.min(inputs.pensionSavings + inputs.irp, 9000000) *
    (grossSalary <= 55000000 ? 0.15 : 0.12);
  const insuranceCredit = inputs.lifeInsurance * 0.12;
  const medicalCredit =
    Math.max(0, inputs.medicalExpenses - grossSalary * 0.03) * 0.15;
  const educationCredit = inputs.educationExpenses * 0.15;
  const rentCredit =
    Math.min(inputs.monthlyRent, 10000000) *
    (grossSalary <= 55000000 ? 0.17 : 0.15);

  const totalTaxCredit =
    earnedIncomeTaxCredit +
    childTaxCredit +
    pensionAccountCredit +
    insuranceCredit +
    medicalCredit +
    educationCredit +
    rentCredit;

  // 6. 최종 결정세액 및 환급액
  const determinedTax = Math.max(0, calculatedTax - totalTaxCredit);
  const finalRefund = inputs.prepaidTax - determinedTax;

  return {
    finalRefund: Math.round(finalRefund),
    determinedTax: Math.round(determinedTax),
    taxBase: Math.round(taxBase),
    grossSalary,
    totalDeductions: Math.round(grossSalary - taxBase),
  };
}
