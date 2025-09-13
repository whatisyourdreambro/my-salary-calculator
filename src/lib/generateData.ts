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

// 데이터 생성 범위를 대폭 줄여 파일 크기를 확실하게 최적화합니다.
export function generateAnnualSalaryTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  // 3,000만원부터 8,000만원까지 200만원 단위로 생성
  for (let salary = 30000000; salary <= 80000000; salary += 2000000) {
    const results = calculateNetSalary(salary);
    data.push({ preTax: salary, ...results });
  }
  return data;
}

export function generateMonthlySalaryTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  // 250만원부터 600만원까지 50만원 단위로 생성
  for (let monthly = 2500000; monthly <= 6000000; monthly += 500000) {
    const results = calculateNetSalary(monthly * 12);
    data.push({ preTax: monthly, ...results });
  }
  return data;
}

export function generateWeeklyPayTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  // 60만원부터 150만원까지 20만원 단위로 생성
  for (let weekly = 600000; weekly <= 1500000; weekly += 200000) {
    const results = calculateNetSalary(weekly * 52);
    data.push({ preTax: weekly, ...results });
  }
  return data;
}

export function generateHourlyWageTableData(): SalaryData[] {
  const data: SalaryData[] = [];
  // 1만원부터 2만원까지 5,000원 단위로 생성
  for (let hourly = 10000; hourly <= 20000; hourly += 5000) {
    const results = calculateNetSalary(hourly * 40 * 52);
    data.push({ preTax: hourly, ...results });
  }
  return data;
}
