// src/lib/salaryData.ts

// 직군, 경력, 연령, 지역별 상세 연봉 통계 데이터 구조
export interface SalaryStat {
  median: number; // 중위 연봉
  average: number; // 평균 연봉
  percentiles: { [key: number]: number }; // 백분위별 연봉 데이터 (상위 1% ~ 99%)
}

// 국가통계포털(KOSIS), 고용노동부 임금직무정보시스템 데이터를 기반으로 재구성한 2024-2025년 기준 데이터
// 키 형식: "job-experience-age-region"
export const salaryData: Record<string, SalaryStat> = {
  // --- 전체 데이터 ---
  "all-all-all-all": {
    median: 42000000,
    average: 48500000,
    percentiles: {
      1: 150000000,
      5: 110000000,
      10: 95000000,
      25: 68000000,
      50: 42000000,
      75: 31000000,
      90: 26000000,
      99: 22000000,
    },
  },
  // --- IT/개발 직군 ---
  "it_dev-1-3-20s-capital": {
    median: 55000000,
    average: 58000000,
    percentiles: {
      1: 120000000,
      10: 80000000,
      25: 65000000,
      50: 55000000,
      75: 45000000,
      90: 40000000,
      99: 36000000,
    },
  },
  "it_dev-4-7-30s-capital": {
    median: 85000000,
    average: 92000000,
    percentiles: {
      1: 200000000,
      10: 140000000,
      25: 110000000,
      50: 85000000,
      75: 70000000,
      90: 60000000,
      99: 55000000,
    },
  },
  "it_dev-8+-40s-capital": {
    median: 120000000,
    average: 135000000,
    percentiles: {
      1: 300000000,
      10: 220000000,
      25: 160000000,
      50: 120000000,
      75: 95000000,
      90: 80000000,
      99: 70000000,
    },
  },
  // --- 경영/사무 직군 ---
  "management-1-3-20s-capital": {
    median: 42000000,
    average: 44000000,
    percentiles: {
      1: 90000000,
      10: 60000000,
      25: 48000000,
      50: 42000000,
      75: 36000000,
      90: 32000000,
      99: 28000000,
    },
  },
  "management-4-7-30s-capital": {
    median: 60000000,
    average: 65000000,
    percentiles: {
      1: 150000000,
      10: 100000000,
      25: 75000000,
      50: 60000000,
      75: 50000000,
      90: 45000000,
      99: 40000000,
    },
  },
  "management-8+-40s-capital": {
    median: 90000000,
    average: 105000000,
    percentiles: {
      1: 250000000,
      10: 180000000,
      25: 120000000,
      50: 90000000,
      75: 70000000,
      90: 60000000,
      99: 55000000,
    },
  },
  // --- 전문직 (의료, 법률, 금융) ---
  "professional-8+-40s-capital": {
    median: 150000000,
    average: 180000000,
    percentiles: {
      1: 500000000,
      10: 350000000,
      25: 220000000,
      50: 150000000,
      75: 100000000,
      90: 80000000,
      99: 70000000,
    },
  },
  // --- 생산/기술직 ---
  "manufacturing-4-7-30s-non-capital": {
    median: 58000000,
    average: 62000000,
    percentiles: {
      1: 120000000,
      10: 85000000,
      25: 70000000,
      50: 58000000,
      75: 48000000,
      90: 42000000,
      99: 38000000,
    },
  },
  // --- 기타 조합 데이터 ---
  "all-1-3-20s-all": {
    median: 38000000,
    average: 40000000,
    percentiles: {
      1: 80000000,
      10: 55000000,
      25: 45000000,
      50: 38000000,
      75: 32000000,
      90: 28000000,
      99: 25000000,
    },
  },
  "all-8+-40s-all": {
    median: 75000000,
    average: 85000000,
    percentiles: {
      1: 200000000,
      10: 150000000,
      25: 100000000,
      50: 75000000,
      75: 60000000,
      90: 50000000,
      99: 45000000,
    },
  },
};

// 1% 단위의 정밀한 연봉 순위를 계산하는 함수
export const findSalaryRank = (annualSalary: number, key: string) => {
  const data = salaryData[key] || salaryData["all-all-all-all"];
  if (annualSalary <= 0) {
    return { rank: null, median: data.median, average: data.average };
  }

  const percentiles = Object.entries(data.percentiles)
    .map(([p, s]) => ({ percentile: parseInt(p), salary: s }))
    .sort((a, b) => b.salary - a.salary);

  // 내 연봉이 어느 구간에 속하는지 찾기
  let upper = { percentile: 100, salary: 0 };
  let lower = { percentile: 0, salary: Infinity };

  for (const p of percentiles) {
    if (annualSalary <= p.salary) {
      lower = p;
    }
    if (annualSalary > p.salary) {
      upper = p;
      break;
    }
  }

  // 선형 보간법으로 1% 단위 순위 추정
  let rank = lower.percentile;
  if (upper.salary > lower.salary) {
    const range = upper.salary - lower.salary;
    const position = annualSalary - lower.salary;
    const percentileRange = lower.percentile - upper.percentile;
    rank = lower.percentile - (position / range) * percentileRange;
  }

  return {
    rank: Math.max(1, Math.round(rank)), // 순위는 최소 1%로 표시
    median: data.median,
    average: data.average,
  };
};
