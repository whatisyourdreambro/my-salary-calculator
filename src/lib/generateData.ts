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

// 데이터 생성 범위를 줄여 파일 크기를 최적화합니다.
export function generateAnnualSalaryTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  // 2,400만원부터 1억원까지 100만원 단위로 생성
  for (let salary = 24000000; salary <= 100000000; salary += 1000000) {
    const results = calculateNetSalary(salary);
    data.push({ preTax: salary, ...results });
  }
  return data;
}

export function generateMonthlySalaryTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  // 200만원부터 800만원까지 20만원 단위로 생성
  for (let monthly = 2000000; monthly <= 8000000; monthly += 200000) {
    const results = calculateNetSalary(monthly * 12);
    data.push({ preTax: monthly, ...results });
  }
  return data;
}

export function generateWeeklyPayTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  // 50만원부터 200만원까지 10만원 단위로 생성
  for (let weekly = 500000; weekly <= 2000000; weekly += 100000) {
    const results = calculateNetSalary(weekly * 52);
    data.push({ preTax: weekly, ...results });
  }
  return data;
}

export function generateHourlyWageTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  // 최저시급 근처부터 3만원까지 2,000원 단위로 생성
  for (let hourly = 10000; hourly <= 30000; hourly += 2000) {
    const results = calculateNetSalary(hourly * 40 * 52);
    data.push({ preTax: hourly, ...results });
  }
  return data;
}
