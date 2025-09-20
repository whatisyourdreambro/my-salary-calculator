// src/lib/futureCalculator.ts

import type { SalaryStat } from "./salaryData";

export interface SalaryEvent {
  yearIndex: number;
  type: "promotion" | "job_change";
  value: number;
}

export interface FutureSalaryResult {
  year: number;
  salary: number; // 나의 예상 연봉
  marketAverage: number; // 시장 평균 연봉
  marketTop10: number; // 시장 상위 10% 연봉
  increaseAmount: number;
}

export interface CareerPath {
  scenario: string;
  description: string;
  events: SalaryEvent[];
  avgIncreaseRate: number;
}

// [수정] marketData 파라미터를 추가하여 시장 데이터와 함께 계산
export function calculateFutureSalary(
  currentSalary: number,
  years: number,
  baseRate: number,
  events: SalaryEvent[],
  marketData: SalaryStat | null
): FutureSalaryResult[] {
  if (currentSalary <= 0 || years <= 0) {
    return [];
  }

  const results: FutureSalaryResult[] = [];
  let previousSalary = currentSalary;
  const currentYear = new Date().getFullYear();

  // 시장 데이터가 있을 경우, 초기 시장 연봉 설정 (없으면 0)
  let previousMarketAverage = marketData?.average ?? 0;
  let previousMarketTop10 = marketData?.percentiles[10] ?? 0;

  for (let i = 0; i < years; i++) {
    // 1. 나의 예상 연봉 계산
    let newSalary = previousSalary * (1 + baseRate / 100);
    const event = events.find((e) => e.yearIndex === i);
    if (event) {
      if (event.type === "promotion") {
        newSalary = newSalary * (1 + event.value / 100);
      } else if (event.type === "job_change") {
        newSalary = event.value;
      }
    }

    // 2. 시장 연봉 예측 (매년 기본 상승률만큼 동일하게 상승한다고 가정)
    const newMarketAverage = previousMarketAverage * (1 + baseRate / 100);
    const newMarketTop10 = previousMarketTop10 * (1 + baseRate / 100);

    results.push({
      year: currentYear + i + 1,
      salary: Math.round(newSalary),
      marketAverage: Math.round(newMarketAverage),
      marketTop10: Math.round(newMarketTop10),
      increaseAmount: Math.round(newSalary - previousSalary),
    });

    previousSalary = newSalary;
    previousMarketAverage = newMarketAverage;
    previousMarketTop10 = newMarketTop10;
  }

  return results;
}

// 목표 연봉 달성 경로 계산 함수 (변경 없음)
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
