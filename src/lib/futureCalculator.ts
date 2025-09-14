export interface SalaryEvent {
  yearIndex: number; // 0은 1년차, 1은 2년차...
  type: "promotion" | "job_change";
  value: number; // promotion: 추가 상승률(%), job_change: 새로운 연봉
}

export interface FutureSalaryResult {
  year: number;
  salary: number;
  increaseAmount: number;
}

export function calculateFutureSalary(
  currentSalary: number,
  years: number,
  baseRate: number,
  events: SalaryEvent[]
): FutureSalaryResult[] {
  if (currentSalary <= 0 || years <= 0) {
    return [];
  }

  const results: FutureSalaryResult[] = [];
  let previousSalary = currentSalary;
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < years; i++) {
    // 기본 상승률을 먼저 적용합니다.
    let newSalary = previousSalary * (1 + baseRate / 100);

    // 현재 연차에 이벤트가 있는지 확인합니다.
    const event = events.find((e) => e.yearIndex === i);

    if (event) {
      if (event.type === "promotion") {
        // 승진: 기본 상승된 연봉에 추가 상승률을 적용합니다.
        newSalary = newSalary * (1 + event.value / 100);
      } else if (event.type === "job_change") {
        // 이직: 연봉을 이벤트 값으로 완전히 대체합니다.
        newSalary = event.value;
      }
    }

    results.push({
      year: currentYear + i + 1,
      salary: Math.round(newSalary),
      increaseAmount: Math.round(newSalary - previousSalary),
    });

    previousSalary = newSalary;
  }

  return results;
}
