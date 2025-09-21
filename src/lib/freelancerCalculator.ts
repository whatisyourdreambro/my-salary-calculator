// src/lib/freelancerCalculator.ts

/**
 * 3.3% 사업소득 또는 4대보험 적용 아르바이트 급여를 계산합니다.
 * @param income 월 소득 (세전)
 * @param taxType 세금 종류 ('freelancer' 또는 'part_time')
 * @returns 월 실수령액, 공제액 합계, 각 공제 항목
 */
export function calculatePartTimeSalary(
  income: number,
  taxType: "freelancer" | "part_time"
) {
  if (income <= 0) {
    return {
      netPay: 0,
      totalDeduction: 0,
      incomeTax: 0,
      localTax: 0,
      nationalPension: 0,
      healthInsurance: 0,
      employmentInsurance: 0,
    };
  }

  if (taxType === "freelancer") {
    const incomeTax = income * 0.03;
    const localTax = incomeTax * 0.1;
    const totalDeduction = incomeTax + localTax;
    const netPay = income - totalDeduction;
    return {
      netPay: Math.round(netPay),
      totalDeduction: Math.round(totalDeduction),
      incomeTax: Math.round(incomeTax),
      localTax: Math.round(localTax),
      nationalPension: 0,
      healthInsurance: 0,
      employmentInsurance: 0,
    };
  } else {
    // 4대보험 적용 (월 60시간 이상 근로자 기준)
    const nationalPension = income * 0.045;
    const healthInsurance = income * 0.03545;
    const employmentInsurance = income * 0.009;

    // 간이세액표에 따른 근로소득세 (1인 가구 기준, 단순 계산)
    const annualIncome = income * 12;
    const taxBase = annualIncome - annualIncome * 0.3 - 1500000; // 단순화된 소득공제
    let calculatedTax = 0;
    if (taxBase > 0) {
      if (taxBase <= 14000000) calculatedTax = taxBase * 0.06;
      else calculatedTax = 840000 + (taxBase - 14000000) * 0.15;
    }
    const incomeTax = calculatedTax / 12;
    const localTax = incomeTax * 0.1;

    const totalDeduction =
      nationalPension +
      healthInsurance +
      employmentInsurance +
      incomeTax +
      localTax;
    const netPay = income - totalDeduction;

    return {
      netPay: Math.round(netPay),
      totalDeduction: Math.round(totalDeduction),
      incomeTax: Math.round(incomeTax),
      localTax: Math.round(localTax),
      nationalPension: Math.round(nationalPension),
      healthInsurance: Math.round(healthInsurance),
      employmentInsurance: Math.round(employmentInsurance),
    };
  }
}
