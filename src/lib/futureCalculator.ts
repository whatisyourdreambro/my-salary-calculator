// src/lib/futureCalculator.ts

// [수정] interface와 type을 모두 export 합니다.
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

export interface CareerPath {
  scenario: string;
  description: string;
  events: SalaryEvent[];
  avgIncreaseRate: number;
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

// 목표 연봉을 달성하기 위한 경로를 역산하는 함수
export function calculatePathToGoal(
  currentSalary: number,
  targetSalary: number,
  years: number
): CareerPath[] {
  if (currentSalary <= 0 || targetSalary <= currentSalary || years <= 0) {
    return [];
  }

  const paths: CareerPath[] = [];

  // --- 시나리오 1: 안정 성장형 (승진 1회 + 꾸준한 상승) ---
  const promotionYear = Math.floor(years / 2);
  const promotionJump = (targetSalary - currentSalary) * 0.4;

  let tempSalary = currentSalary;
  for (let i = 0; i < promotionYear; i++) {
    tempSalary *= 1.05;
  }
  const salaryBeforePromotion = tempSalary;
  const promotionRate =
    ((salaryBeforePromotion + promotionJump) / salaryBeforePromotion - 1) * 100;

  const finalSalary = salaryBeforePromotion * (1 + promotionRate / 100);
  const remainingYears = years - promotionYear;
  if (remainingYears > 0) {
    const requiredAvgRateStable =
      (Math.pow(targetSalary / finalSalary, 1 / remainingYears) - 1) * 100;

    if (requiredAvgRateStable > 0) {
      paths.push({
        scenario: "안정 성장형",
        description: `중간 연차에 성공적인 승진을 통해 연봉을 점프업하고, 이후 꾸준한 인상으로 목표를 달성하는 경로입니다.`,
        events: [
          {
            yearIndex: promotionYear,
            type: "promotion",
            value: Math.round(promotionRate),
          },
        ],
        avgIncreaseRate: parseFloat(requiredAvgRateStable.toFixed(2)),
      });
    }
  }

  // --- 시나리오 2: 퀀텀 점프형 (이직 1회) ---
  const jobChangeYear = Math.floor(years / 3);
  if (jobChangeYear > 0) {
    const jobChangeSalary =
      currentSalary + (targetSalary - currentSalary) * 0.6;
    const finalSalaryAfterChange = jobChangeSalary;
    const remainingYearsForChange = years - jobChangeYear;
    if (remainingYearsForChange > 0) {
      const requiredAvgRateLeap =
        (Math.pow(
          targetSalary / finalSalaryAfterChange,
          1 / remainingYearsForChange
        ) -
          1) *
        100;

      if (requiredAvgRateLeap > 0) {
        paths.push({
          scenario: "퀀텀 점프형",
          description: `초기 경력을 바탕으로 성공적인 이직을 통해 연봉을 크게 올리고, 새로운 회사에서 목표를 달성하는 가장 빠른 경로입니다.`,
          events: [
            {
              yearIndex: jobChangeYear,
              type: "job_change",
              value: Math.round(jobChangeSalary),
            },
          ],
          avgIncreaseRate: parseFloat(requiredAvgRateLeap.toFixed(2)),
        });
      }
    }
  }

  return paths;
}
