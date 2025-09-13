/**
 * 두 날짜 사이의 총 일수를 계산합니다.
 */
function getTotalDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  // 마지막 근무일 포함을 위해 +1
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;
}

/**
 * [수정] 퇴사일 이전 3개월간의 달력상 총일수를 정확하게 계산합니다.
 * 예: 5월 15일 퇴사 시 -> 2, 3, 4월의 총 일수 (28/29 + 31 + 30)
 */
function getDaysInLast3Months(endDate: string): number {
  const end = new Date(endDate);
  let totalDays = 0;

  // 퇴사일 기준 이전 3개월의 각 달의 마지막 날짜를 구해 총일수를 더합니다.
  for (let i = 1; i <= 3; i++) {
    const targetDate = new Date(end.getFullYear(), end.getMonth() - i + 1, 0);
    totalDays += targetDate.getDate();
  }

  return totalDays;
}

/**
 * 퇴직금을 계산합니다.
 * @param startDate 입사일 (YYYY-MM-DD)
 * @param endDate 퇴사일 (YYYY-MM-DD)
 * @param last3MonthsSalary 퇴사 전 3개월간 월급 (동일하다고 가정)
 * @param annualBonus 연간 상여금 총액
 * @param annualLeavePay 연차수당
 * @returns 1일 평균임금과 예상 퇴직금
 */
export function calculateSeverancePay(
  startDate: string,
  endDate: string,
  last3MonthsSalary: number,
  annualBonus: number = 0,
  annualLeavePay: number = 0
) {
  if (!startDate || !endDate || last3MonthsSalary <= 0) {
    return { averageDailyWage: 0, estimatedSeverancePay: 0 };
  }

  const totalDaysOfEmployment = getTotalDays(startDate, endDate);
  // 1년 미만 근무 시 퇴직금 0원
  if (totalDaysOfEmployment < 365) {
    return { averageDailyWage: 0, estimatedSeverancePay: 0 };
  }

  const daysInLast3Months = getDaysInLast3Months(endDate);

  // 3개월간 총 임금 = (월급*3) + (연간상여금*3/12) + (연차수당*3/12)
  const totalWagesInLast3Months =
    last3MonthsSalary * 3 + (annualBonus * 3) / 12 + (annualLeavePay * 3) / 12;

  const averageDailyWage = totalWagesInLast3Months / daysInLast3Months;

  // 퇴직금 = 1일 평균임금 * 30일 * (재직일수 / 365)
  const estimatedSeverancePay =
    averageDailyWage * 30 * (totalDaysOfEmployment / 365);

  return {
    averageDailyWage: Math.round(averageDailyWage),
    estimatedSeverancePay: Math.round(estimatedSeverancePay),
  };
}
