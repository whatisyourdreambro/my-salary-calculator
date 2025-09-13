import { calculateNetSalary } from "./calculator";

export type SalaryData = {
  preTax: number;
  monthlyNet: number;
  health: number;
  employment: number;
  longTermCare: number;
  pension: number;
  incomeTax: number;
  localTax: number;
  totalDeduction: number;
};

// 연봉 실수령액 데이터 생성
export function generateAnnualSalaryTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  // 0원부터 1억원까지 10만원 단위로 생성
  for (let salary = 0; salary <= 100000000; salary += 50000) {
    const results = calculateNetSalary(salary);
    data.push({ preTax: salary, ...results });
  }
  // 1억 100만원부터 5억원까지 100만원 단위로 생성
  for (let salary = 101000000; salary <= 500000000; salary += 1000000) {
    const results = calculateNetSalary(salary);
    data.push({ preTax: salary, ...results });
  }
  return data;
}

// 월급 실수령액 데이터 생성
export function generateMonthlySalaryTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  // 0원부터 1억원까지 5만원 단위로 생성
  for (let monthly = 0; monthly <= 100000000; monthly += 50000) {
    const results = calculateNetSalary(monthly * 12);
    data.push({ preTax: monthly, ...results });
  }
  return data;
}

// 주급 실수령액 데이터 생성
export function generateWeeklyPayTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  // 0원부터 2000만원까지 5만원 단위로 생성
  for (let weekly = 0; weekly <= 10000000; weekly += 50000) {
    const results = calculateNetSalary(weekly * 52);
    data.push({ preTax: weekly, ...results });
  }
  return data;
}

// 시급 실수령액 데이터 생성 (주 40시간, 52주 근무 기준)
export function generateHourlyWageTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  // 0원부터 2000만원까지 5천원 단위로 생성
  for (let hourly = 0; hourly <= 10000000; hourly += 5000) {
    const results = calculateNetSalary(hourly * 40 * 52);
    data.push({ preTax: hourly, ...results });
  }
  return data;
}
