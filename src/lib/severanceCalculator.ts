// src/lib/severanceCalculator.ts

/**
 * 두 날짜 사이의 총 일수를 계산합니다.
 */
function getTotalDays(startDate: string, endDate: string): number {
 if (!startDate || !endDate) return 0;
 const start = new Date(startDate);
 const end = new Date(endDate);
 if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
 // 마지막 근무일 포함을 위해 +1
 return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;
}

/**
 * 퇴사일 이전 3개월간의 달력상 총일수를 정확하게 계산합니다.
 */
function getDaysInLast3Months(endDate: string): number {
 const end = new Date(endDate);
 let totalDays = 0;
 for (let i = 1; i <= 3; i++) {
 const targetDate = new Date(end.getFullYear(), end.getMonth() - i + 1, 0);
 totalDays += targetDate.getDate();
 }
 return totalDays;
}

/**
 * 근속연수를 계산합니다. (년, 월, 일)
 */
/**
 * 달력 기준 근속연수 (소득세법 §48① — 1년 미만 端數는 1년으로 절상).
 *
 * 종전에는 재직일수 ÷ 365 를 올림했다. 재직일수는 마지막 근무일을 포함(+1)하므로
 * 정확히 N년 근속이라도 기간 안에 윤일(2/29)이 있으면 365N + 윤일수 가 되어
 * ceil 이 N+1 을 돌려줬다. 2024년이 윤년이라 그 기간을 지나는 "정확히 N년"
 * 근속자가 전부 한 해씩 부풀려져 근속연수공제를 100만~300만원 더 받고
 * 퇴직소득세가 과소 산출됐다(2026-09-06 전수검사).
 * 예: 입사 2023-03-01 · 퇴사 2025-02-28 → 731일 → 종전 3년 / 정정 2년.
 */
export function serviceYearsFromDates(
  startDate: string,
  endDateInclusive: string
): number {
  const start = new Date(startDate);
  const lastDay = new Date(endDateInclusive);
  if (isNaN(start.getTime()) || isNaN(lastDay.getTime()) || lastDay < start) return 0;
  // 마지막 근무일 다음 날을 기간의 끝으로 잡아야 "정확히 N년"이 N년으로 떨어진다.
  const end = new Date(lastDay.getTime());
  end.setDate(end.getDate() + 1);

  let fullYears = end.getFullYear() - start.getFullYear();
  const anniversary = new Date(start.getTime());
  anniversary.setFullYear(start.getFullYear() + fullYears);
  if (anniversary.getTime() > end.getTime()) {
    fullYears -= 1;
    anniversary.setFullYear(start.getFullYear() + fullYears);
  }
  const hasRemainder = end.getTime() > anniversary.getTime();
  return Math.max(1, hasRemainder ? fullYears + 1 : fullYears);
}

function getYearsOfService(totalDays: number): {
 years: number;
 months: number;
 days: number;
} {
 if (totalDays <= 0) return { years: 0, months: 0, days: 0 };
 const years = Math.floor(totalDays / 365);
 const remainingDays = totalDays % 365;
 const months = Math.floor(remainingDays / 30);
 const days = remainingDays % 30;
 return { years, months, days };
}

/**
 * 퇴직소득세를 계산합니다. (2023년 개정안 적용)
 * @param severancePay 세전 퇴직금
 * @param totalDaysOfEmployment 총 재직일수
 * @returns 퇴직소득세, 지방소득세, 세후 예상 수령액
 */
export function calculateSeveranceTax(
 severancePay: number,
 totalDaysOfEmployment: number,
 /**
  * 달력 기준 근속연수. 입·퇴사일을 아는 호출부는 serviceYearsFromDates() 결과를
  * 넘긴다. 생략하면 재직일수 ÷ 365 올림으로 근사한다(연 단위 일수를 넘기는
  * 위젯·간이 계산기용 — 이 경로는 윤일 오차가 없다).
  */
 serviceYearsOverride?: number
) {
 const defaultReturn = {
 incomeTax: 0,
 localTax: 0,
 netSeverancePay: severancePay,
 details: {
 serviceYearDeduction: 0,
 retirementIncome: 0,
 convertedSalary: 0,
 convertedSalaryDeduction: 0,
 taxBase: 0,
 calculatedTax: 0,
 },
 };

 if (severancePay <= 0 || totalDaysOfEmployment < 365) {
 return defaultReturn;
 }

 const yearsOfService =
 serviceYearsOverride && serviceYearsOverride > 0
 ? Math.max(1, Math.round(serviceYearsOverride))
 : Math.max(1, Math.ceil(totalDaysOfEmployment / 365));

 // 1. 근속연수공제
 let serviceYearDeduction = 0;
 if (yearsOfService <= 5) {
 serviceYearDeduction = yearsOfService * 1000000;
 } else if (yearsOfService <= 10) {
 serviceYearDeduction = 5000000 + (yearsOfService - 5) * 2000000;
 } else if (yearsOfService <= 20) {
 serviceYearDeduction = 15000000 + (yearsOfService - 10) * 2500000;
 } else {
 serviceYearDeduction = 40000000 + (yearsOfService - 20) * 3000000;
 }

 const retirementIncome = severancePay - serviceYearDeduction;
 if (retirementIncome <= 0) {
 return defaultReturn;
 }

 // 2. 환산급여 계산
 const convertedSalary = (retirementIncome / yearsOfService) * 12;

 // 3. 환산급여공제 (현행 구간표)
 // 800만 이하 전액 / ~7,000만 800만+초과분 60% / ~1억 4,520만+초과분 55%
 // / ~3억 6,170만+초과분 45% / 3억 초과 1억5,170만+초과분 35%
 let convertedSalaryDeduction = 0;
 if (convertedSalary <= 8000000) {
 convertedSalaryDeduction = convertedSalary;
 } else if (convertedSalary <= 70000000) {
 convertedSalaryDeduction = 8000000 + (convertedSalary - 8000000) * 0.6;
 } else if (convertedSalary <= 100000000) {
 convertedSalaryDeduction = 45200000 + (convertedSalary - 70000000) * 0.55;
 } else if (convertedSalary <= 300000000) {
 convertedSalaryDeduction = 61700000 + (convertedSalary - 100000000) * 0.45;
 } else {
 convertedSalaryDeduction = 151700000 + (convertedSalary - 300000000) * 0.35;
 }

 // 4. 과세표준
 const taxBase = convertedSalary - convertedSalaryDeduction;
 if (taxBase <= 0) {
 return defaultReturn;
 }

 // 5. 환산산출세액
 let convertedCalculatedTax = 0;
 if (taxBase <= 14000000) convertedCalculatedTax = taxBase * 0.06;
 else if (taxBase <= 50000000)
 convertedCalculatedTax = 840000 + (taxBase - 14000000) * 0.15;
 else if (taxBase <= 88000000)
 convertedCalculatedTax = 6240000 + (taxBase - 50000000) * 0.24;
 else if (taxBase <= 150000000)
 convertedCalculatedTax = 15360000 + (taxBase - 88000000) * 0.35;
 else if (taxBase <= 300000000)
 convertedCalculatedTax = 37060000 + (taxBase - 150000000) * 0.38;
 else if (taxBase <= 500000000)
 convertedCalculatedTax = 94060000 + (taxBase - 300000000) * 0.4;
 else if (taxBase <= 1000000000)
 convertedCalculatedTax = 174060000 + (taxBase - 500000000) * 0.42;
 else convertedCalculatedTax = 384060000 + (taxBase - 1000000000) * 0.45;

 // 6. 최종 산출세액
 const incomeTax = (convertedCalculatedTax / 12) * yearsOfService;
 const localTax = incomeTax * 0.1;
 const totalTax = incomeTax + localTax;
 const netSeverancePay = severancePay - totalTax;

 return {
 incomeTax: Math.round(incomeTax),
 localTax: Math.round(localTax),
 netSeverancePay: Math.round(netSeverancePay),
 details: {
 serviceYearDeduction: Math.round(serviceYearDeduction),
 retirementIncome: Math.round(retirementIncome),
 convertedSalary: Math.round(convertedSalary),
 convertedSalaryDeduction: Math.round(convertedSalaryDeduction),
 taxBase: Math.round(taxBase),
 calculatedTax: Math.round(incomeTax),
 },
 };
}

/**
 * 퇴직금을 계산합니다.
 * @param startDate 입사일 (YYYY-MM-DD)
 * @param endDate 퇴사일 (YYYY-MM-DD)
 * @param last3MonthsSalaries 퇴사 전 3개월간 월급 배열
 * @param annualBonus 연간 상여금 총액
 * @param annualLeavePay 연차수당
 * @returns 퇴직금 관련 모든 계산 결과
 */
export function calculateSeverancePay(
 startDate: string,
 endDate: string,
 last3MonthsSalaries: number[],
 annualBonus: number = 0,
 annualLeavePay: number = 0
) {
 const totalDaysOfEmployment = getTotalDays(startDate, endDate);
 const { years, months } = getYearsOfService(totalDaysOfEmployment);

 if (
 totalDaysOfEmployment < 365 ||
 last3MonthsSalaries.reduce((a, b) => a + b, 0) <= 0
 ) {
 const defaultTaxDetails = {
 serviceYearDeduction: 0,
 retirementIncome: 0,
 convertedSalary: 0,
 convertedSalaryDeduction: 0,
 taxBase: 0,
 calculatedTax: 0,
 };

 return {
 totalDaysOfEmployment,
 yearsOfService: { years, months },
 averageDailyWage: 0,
 estimatedSeverancePay: 0,
 incomeTax: 0,
 localTax: 0,
 netSeverancePay: 0,
 details: defaultTaxDetails,
 };
 }

 const daysInLast3Months = getDaysInLast3Months(endDate);
 const totalWagesInLast3Months =
 last3MonthsSalaries.reduce((a, b) => a + b, 0) +
 (annualBonus * 3) / 12 +
 (annualLeavePay * 3) / 12;

 const averageDailyWage = totalWagesInLast3Months / daysInLast3Months;
 const estimatedSeverancePay =
 averageDailyWage * 30 * (totalDaysOfEmployment / 365);

 const taxResult = calculateSeveranceTax(
 estimatedSeverancePay,
 totalDaysOfEmployment,
 serviceYearsFromDates(startDate, endDate)
 );

 return {
 totalDaysOfEmployment,
 yearsOfService: { years, months },
 averageDailyWage: Math.round(averageDailyWage),
 estimatedSeverancePay: Math.round(estimatedSeverancePay),
 ...taxResult,
 };
}

/**
 * DC형 퇴직연금 예상 적립금을 시뮬레이션합니다.
 * @param annualSalary 연간 총 급여
 * @param totalDaysOfEmployment 총 재직일수
 * @param returnRate 연평균 투자수익률 (%)
 * @returns 예상 적립금
 */
export function calculateDCseverance(
 annualSalary: number,
 totalDaysOfEmployment: number,
 returnRate: number
) {
 if (annualSalary <= 0 || totalDaysOfEmployment < 365) {
 return { estimatedDCseverance: 0 };
 }

 const yearsOfService = totalDaysOfEmployment / 365;
 const annualContribution = annualSalary / 12;
 const rate = 1 + returnRate / 100;

 let totalAccumulation = 0;

 // 매년 말에 적립금이 납입되고, 연 복리로 수익이 발생한다고 가정하는 시뮬레이션.
 // 종전에는 루프 조건이 소수 근속연수와의 비교라 납입 횟수가 항상 ceil(근속연수)가
 // 됐다 — 재직 5일 차이로 적립금이 855만원 점프하고, 1.1년 근속이 2회 납입으로
 // 잡혀 실제의 약 2배가 표시됐다(2026-09-06 전수검사). 정수 연차는 그대로 굴리고
 // 잔여 기간은 비례 납입 + 비례 수익으로 처리한다.
 const fullYears = Math.floor(yearsOfService);
 for (let i = 0; i < fullYears; i++) {
 totalAccumulation = (totalAccumulation + annualContribution) * rate;
 }
 const fraction = yearsOfService - fullYears;
 if (fraction > 0) {
 totalAccumulation =
 (totalAccumulation + annualContribution * fraction) *
 (1 + (returnRate / 100) * fraction);
 }

 return {
 estimatedDCseverance: Math.round(totalAccumulation),
 };
}
