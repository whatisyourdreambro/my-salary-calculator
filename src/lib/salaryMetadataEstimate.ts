import { calculateSalary2026 } from "./TaxLogic";

// /salary/[amount]의 기본 계산 조건과 같다. 산업·지역별 참고 연봉을
// 세후 월급으로 설명할 때 고정 공제율 대신 같은 엔진과 가정을 사용한다.
export const SALARY_METADATA_ASSUMPTIONS = "본인 1명·자녀 0명·비과세 월 20만원 가정";

export function getMonthlyNetEstimateManwon(annualSalaryManwon: number): number {
  return Math.round(calculateSalary2026(annualSalaryManwon * 10_000, 200_000, 1, 0).netPay / 10_000);
}
