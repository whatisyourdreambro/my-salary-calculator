export interface FutureSalaryResult {
  year: number;
  salary: number;
  increaseAmount: number;
}

/**
 * 미래 연봉을 계산합니다.
 * @param currentSalary 현재 연봉
 * @param years 예상 기간 (년)
 * @param rates 상승률 배열 (평균 상승률일 경우 [0.05], 개별일 경우 [0.05, 0.06, ...])
 * @returns 연도별 예상 연봉 결과 배열
 */
export function calculateFutureSalary(
  currentSalary: number,
  years: number,
  rates: number[]
): FutureSalaryResult[] {
  if (currentSalary <= 0 || years <= 0) {
    return [];
  }

  const results: FutureSalaryResult[] = [];
  let previousSalary = currentSalary;
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < years; i++) {
    // 개별 상승률이 부족할 경우, 마지막 상승률을 계속 사용
    const rate = (rates[i] ?? rates[rates.length - 1]) / 100;
    const newSalary = previousSalary * (1 + rate);

    results.push({
      year: currentYear + i + 1,
      salary: Math.round(newSalary),
      increaseAmount: Math.round(newSalary - previousSalary),
    });

    previousSalary = newSalary;
  }

  return results;
}
